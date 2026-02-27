<?php
/**
 * Plugin Name: Avoska POS
 * Description: Custom Web Point of Sale for WooCommerce. Shortcode: [avoska_pos]
 * Version: 2.5.10
 * Author: DarkXakep y Antigravity
 */

if (!defined('ABSPATH'))
    exit;

add_action('init', 'avoska_pos_api_handler');
add_shortcode('avoska_pos', 'avoska_render_pos');

// Register for WP Consent API
add_action('wp_consent_api_registered', function($type) {
    if (function_exists('wp_consents_can_register_service') && wp_consents_can_register_service('functional')) {
        wp_consents_register_service('avoska-pos', 'Avoska POS', 'functional');
    }
});

// AJAX handlers for logged in users
add_action('wp_ajax_avoska_pos_create_order', 'avoska_pos_create_order');
add_action('wp_ajax_avoska_pos_get_products', 'avoska_pos_get_products');
add_action('wp_ajax_avoska_pos_get_customers', 'avoska_pos_get_customers');
add_action('wp_ajax_avoska_pos_get_staff', 'avoska_pos_get_staff');
add_action('wp_ajax_avoska_pos_get_orders', 'avoska_pos_get_orders');
add_action('wp_ajax_avoska_pos_get_weekly_orders', 'avoska_pos_get_weekly_orders');
add_action('wp_ajax_avoska_pos_update_product', 'avoska_pos_update_product');
add_action('woocommerce_admin_order_data_after_order_details', 'avoska_pos_display_cashier_field');

// Admin Settings deleted, moved below

// PRINT RECEIPT HANDLER
add_action('wp_ajax_avoska_pos_print_receipt', 'avoska_pos_print_receipt');
add_action('wp_ajax_nopriv_avoska_pos_print_receipt', 'avoska_pos_print_receipt');

// CHANGE CASHIER (instant logout + redirect to /apos/)
add_action('wp_ajax_avoska_pos_change_cashier', 'avoska_pos_change_cashier');

// --- AUTO REPORT CRON ---
add_action('avoska_pos_auto_report_event', 'avoska_pos_cron_send_daily_report');
add_action('admin_init', 'avoska_pos_schedule_auto_report');
register_deactivation_hook(__FILE__, 'avoska_pos_unschedule_auto_report');

function avoska_pos_schedule_auto_report() {
    $enabled = get_option('avoska_pos_auto_report_enabled', 'no');
    $time_str = get_option('avoska_pos_auto_report_time', '20:58');
    
    if ($enabled !== 'yes') {
        // Disabled — remove cron if exists
        $timestamp = wp_next_scheduled('avoska_pos_auto_report_event');
        if ($timestamp) {
            wp_unschedule_event($timestamp, 'avoska_pos_auto_report_event');
        }
        return;
    }
    
    // Calculate next run in Buenos Aires timezone
    $tz = new DateTimeZone('America/Argentina/Buenos_Aires');
    $now = new DateTime('now', $tz);
    
    $parts = explode(':', $time_str);
    $hour = isset($parts[0]) ? intval($parts[0]) : 20;
    $minute = isset($parts[1]) ? intval($parts[1]) : 58;
    
    $target = clone $now;
    $target->setTime($hour, $minute, 0);
    
    // If target time already passed today, schedule for tomorrow
    if ($target <= $now) {
        $target->modify('+1 day');
    }
    
    $target_utc = $target->getTimestamp();
    
    // Check if already scheduled
    $existing = wp_next_scheduled('avoska_pos_auto_report_event');
    if ($existing) {
        // If the scheduled time differs by more than 2 minutes, reschedule
        if (abs($existing - $target_utc) > 120) {
            wp_unschedule_event($existing, 'avoska_pos_auto_report_event');
            wp_schedule_single_event($target_utc, 'avoska_pos_auto_report_event');
        }
    } else {
        wp_schedule_single_event($target_utc, 'avoska_pos_auto_report_event');
    }
}

function avoska_pos_unschedule_auto_report() {
    $timestamp = wp_next_scheduled('avoska_pos_auto_report_event');
    if ($timestamp) {
        wp_unschedule_event($timestamp, 'avoska_pos_auto_report_event');
    }
}

function avoska_pos_cron_send_daily_report() {
    $tz = new DateTimeZone('America/Argentina/Buenos_Aires');
    $now = new DateTime('now', $tz);
    $today_dow = (int) $now->format('w'); // 0=Sun, 1=Mon ... 6=Sat
    
    // Check if today is a working day
    $skip_days = get_option('avoska_pos_auto_report_skip_days', [0]); // Default: skip Sunday
    if (!is_array($skip_days)) $skip_days = [];
    
    if (!in_array($today_dow, $skip_days)) {
        // It's a working day — send the report
        avoska_pos_generate_and_send_report('daily');
    }
    
    // Re-schedule for next working day
    avoska_pos_schedule_next_auto_report();
}

/**
 * Schedule the next auto-report, skipping excluded days.
 */
function avoska_pos_schedule_next_auto_report() {
    $enabled = get_option('avoska_pos_auto_report_enabled', 'no');
    if ($enabled !== 'yes') return;
    
    $time_str = get_option('avoska_pos_auto_report_time', '20:58');
    $skip_days = get_option('avoska_pos_auto_report_skip_days', [0]);
    if (!is_array($skip_days)) $skip_days = [];
    
    $tz = new DateTimeZone('America/Argentina/Buenos_Aires');
    $now = new DateTime('now', $tz);
    
    $parts = explode(':', $time_str);
    $hour = isset($parts[0]) ? intval($parts[0]) : 20;
    $minute = isset($parts[1]) ? intval($parts[1]) : 58;
    
    // Start from tomorrow and find next working day
    $candidate = clone $now;
    $candidate->modify('+1 day');
    $candidate->setTime($hour, $minute, 0);
    
    // Skip excluded days (max 7 iterations to avoid infinite loop)
    for ($i = 0; $i < 7; $i++) {
        $dow = (int) $candidate->format('w');
        if (!in_array($dow, $skip_days)) {
            break;
        }
        $candidate->modify('+1 day');
    }
    
    wp_schedule_single_event($candidate->getTimestamp(), 'avoska_pos_auto_report_event');
}
function avoska_pos_change_cashier() {
    wp_logout();
    wp_redirect(home_url('/apos/'));
    exit;
}

function avoska_pos_print_receipt() {
    if (!isset($_GET['order_id'])) {
        wp_die('No Order ID');
    }
    
    $order_id = intval($_GET['order_id']);
    $order = wc_get_order($order_id);
    
    if (!$order) {
        wp_die('Invalid Order');
    }
    
    // Load the template
    include plugin_dir_path(__FILE__) . 'receipt.php';
    exit;
}

function avoska_render_pos()
{
    if (!is_user_logged_in() || (!current_user_can('manage_woocommerce') && !current_user_can('staff') && !current_user_can('administrator'))) {
        if (!is_user_logged_in()) {
            ob_start();
            ?>
            <style>
                .avoska-pos-login-wrapper { display: flex; align-items: center; justify-content: center; height: 100vh; background: #1a1b1c; font-family: sans-serif; }
                .avoska-pos-login-box { background: #232527; padding: 40px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); width: 100%; max-width: 400px; color: #fff; border: 1px solid #333; }
                .avoska-pos-login-box h2 { text-align: center; margin-top: 0; margin-bottom: 30px; color: #3498db; font-size: 24px; font-weight: 600; }
                .avoska-pos-login-box label { display: block; margin-bottom: 8px; color: #aaa; font-size: 14px; }
                .avoska-pos-login-box input[type="text"], .avoska-pos-login-box input[type="password"] { width: 100%; padding: 12px; margin-bottom: 20px; background: #1a1b1c; border: 1px solid #444; color: #fff; border-radius: 6px; box-sizing: border-box; font-size: 16px; transition: border-color 0.2s; }
                .avoska-pos-login-box input[type="text"]:focus, .avoska-pos-login-box input[type="password"]:focus { border-color: #3498db; outline: none; }
                .avoska-pos-login-box input[type="submit"] { width: 100%; padding: 14px; background: #3498db; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 500; transition: background 0.2s; }
                .avoska-pos-login-box input[type="submit"]:hover { background: #2980b9; }
                .avoska-pos-login-box .login-remember { margin-bottom: 20px; font-size: 14px; color: #ccc; }
                .avoska-pos-login-box .login-remember label { display: inline; margin-left:8px; cursor:pointer; }
            </style>
            <div class="avoska-pos-login-wrapper">
                <div class="avoska-pos-login-box">
                    <h2>Avoska POS</h2>
                    <?php
                    wp_login_form(array(
                        'redirect' => (is_ssl() ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'],
                        'label_username' => 'Логин или E-mail',
                        'label_password' => 'Пароль',
                        'label_remember' => 'Запомнить меня',
                        'label_log_in' => 'Войти в терминал',
                        'remember' => true
                    ));
                    ?>
                </div>
            </div>
            <?php
            return ob_get_clean();
        } else {
            return '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#1a1b1c;color:#fff;font-family:sans-serif;"><h2>Доступ запрещен</h2><p style="color:#aaa;">У вас нет прав для работы с кассой.</p><a href="' . wp_logout_url(get_permalink()) . '" style="margin-top:20px;padding:10px 20px;background:#e74c3c;color:#fff;text-decoration:none;border-radius:6px;">Сменить аккаунт</a></div>';
        }
    }

    // Подключаем файлы (inlining for portability in shortcode)
    $path = plugin_dir_path(__FILE__);
    $html = file_get_contents($path . 'index.html');

    // Inject CSS/JS paths if needed, but since we will likely inline or use absolute paths, 
    // let's just make sure resources are loaded.
    // For simplicity in this dev environment, we will read files and inject them to avoid cache/url issues

    $css = file_exists($path . 'pos-style.css') ? file_get_contents($path . 'pos-style.css') : '';
    $js = file_exists($path . 'pos-app.js') ? file_get_contents($path . 'pos-app.js') : '';

    ob_start();
    ?>
    <!-- Avoska POS Container -->
    <style>
        /* Avoska POS Version 2.4.5 */
        /* Reset & Base */
        <?php echo $css; ?>
    </style>

    <?php echo $html; ?>

    <script>
        const POS_API_URL = '<?php echo admin_url('admin-ajax.php'); ?>';
        const POS_NONCE = '<?php echo wp_create_nonce("avoska_pos_api_nonce"); ?>';
        const POS_PLUGIN_URL = '<?php echo plugin_dir_url(__FILE__); ?>';
        const POS_VERSION = '<?php
            $plugin_data = get_file_data(__FILE__, ["Version" => "Version"]);
            echo esc_js($plugin_data["Version"]);
        ?>';
        const POS_SCHEDULE = {
            start: '<?= esc_js(get_option('avoska_pos_schedule_start', '09:00')) ?>',
            end: '<?= esc_js(get_option('avoska_pos_schedule_end', '21:00')) ?>'
        };
        const POS_HIDE_F1 = <?= get_option('avoska_pos_hide_f1', 'no') === 'yes' ? 'true' : 'false' ?>;
        <?php
            $current_user = wp_get_current_user();
            $avatar_url = get_avatar_url($current_user->ID, ['size' => 64]);
        ?>
        const POS_USER = {
            id: <?= $current_user->ID ?>,
            name: '<?= esc_js($current_user->display_name) ?>',
            login: '<?= esc_js($current_user->user_login) ?>',
            email: '<?= esc_js($current_user->user_email) ?>',
            avatar: '<?= esc_js($avatar_url) ?>',
            settings_url: '<?= esc_js(admin_url('admin.php?page=avoska-pos-settings')) ?>',
            logout_url: '<?= esc_js(wp_logout_url(home_url())) ?>',
            change_cashier_url: '<?= esc_js(wp_logout_url(home_url('/apos/'))) ?>'
        };
        const POS_REPORT_EMAIL = '<?= esc_js(get_option('avoska_pos_report_email', get_option('admin_email'))) ?>';
        const POS_REPORT_EMAIL_2 = '<?= esc_js(get_option('avoska_pos_report_email_2', '')) ?>';
        <?php echo $js; ?>
    </script>
    <?php
    return ob_get_clean();
}

function avoska_pos_api_handler()
{
    if (isset($_GET['avoska_pos_action'])) {
        $action = $_GET['avoska_pos_action'];

        // Basic Security
        if (!is_user_logged_in()) {
            wp_send_json_error(['message' => 'Not logged in']);
        }

        if (!current_user_can('manage_woocommerce') && !current_user_can('staff') && !current_user_can('administrator')) {
            wp_send_json_error(['message' => 'No permission']);
        }

        $nonce = isset($_REQUEST['_wpnonce']) ? sanitize_text_field($_REQUEST['_wpnonce']) : '';
        if (!wp_verify_nonce($nonce, 'avoska_pos_api_nonce')) {
            wp_send_json_error(['message' => 'Security token expired or invalid. Please reload page.']);
        }

        switch ($action) {
            case 'get_products':
                avoska_pos_get_products();
                break;
            case 'create_order':
                avoska_pos_create_order();
                break;
            case 'get_customers':
                avoska_pos_get_customers();
                break;
            case 'get_orders':
                avoska_pos_get_orders();
                break;
            case 'get_staff':
                avoska_pos_get_staff();
                break;
            case 'get_weekly_orders':
                avoska_pos_get_weekly_orders();
                break;
            case 'update_product':
                avoska_pos_update_product();
                break;
        }
        exit;
    }
}

function avoska_pos_get_products()
{
    $args = [
        'status' => 'publish',
        'limit' => -1,
    ];
    $products = wc_get_products($args);
    $data = [];

    // Collect Filter Data
    $all_cats = [];
    $all_tags = [];
    $all_brands = [];

    // Detect Brand Taxonomy
    $brand_tax = false;
    if (taxonomy_exists('pwb-brand')) $brand_tax = 'pwb-brand';
    elseif (taxonomy_exists('product_brand')) $brand_tax = 'product_brand';
    elseif (taxonomy_exists('yith_product_brand')) $brand_tax = 'yith_product_brand';

    foreach ($products as $p) {
        $img_id = $p->get_image_id();
        $img_url = $img_id ? wp_get_attachment_image_url($img_id, 'thumbnail') : '';

        // Stock logic from kitchen app style
        $stock = $p->get_stock_quantity();
        $kitchen_stock = (int) $p->get_meta('_kitchen_stock');

        // EAN/GTIN from WooCommerce built-in field (GTIN, UPC, EAN or ISBN)
        $ean = '';
        if (method_exists($p, 'get_global_unique_id')) {
            $ean = $p->get_global_unique_id();
        }
        if (empty($ean)) {
            $ean = get_post_meta($p->get_id(), '_global_unique_id', true);
        }

        // Taxonomies
        $cat_ids = $p->get_category_ids();
        $tag_ids = $p->get_tag_ids();
        $brand_ids = [];

        if ($brand_tax) {
            $terms = get_the_terms($p->get_id(), $brand_tax);
            if ($terms && !is_wp_error($terms)) {
                foreach ($terms as $t) {
                    $brand_ids[] = $t->term_id;
                    $all_brands[$t->term_id] = $t->name;
                }
            }
        }

        // Populate global filters
        foreach ($cat_ids as $cid) {
            $term = get_term($cid, 'product_cat');
            if ($term && !is_wp_error($term)) $all_cats[$cid] = $term->name;
        }
        foreach ($tag_ids as $tid) {
            $term = get_term($tid, 'product_tag');
            if ($term && !is_wp_error($term)) $all_tags[$tid] = $term->name;
        }

        $data[] = [
            'id' => $p->get_id(),
            'name' => $p->get_name(),
            'price' => (float) $p->get_price(),
            'regular_price' => (float) $p->get_regular_price(),
            'sale_price' => $p->get_sale_price() !== '' ? (float) $p->get_sale_price() : null,
            'cost' => (float) get_post_meta($p->get_id(), '_cogs_total_value', true),
            'catalog_visibility' => $p->get_catalog_visibility(),
            'image' => $img_url,
            'sku' => $p->get_sku(),
            'ean' => $ean,
            'cat_ids' => $cat_ids,
            'tag_ids' => $tag_ids,
            'brand_ids' => $brand_ids,
            'stock' => $stock,
            'kitchen_stock' => $kitchen_stock
        ];
    }

    // Format filters for frontend
    $filters = [
        'categories' => [],
        'brands' => [],
        'tags' => []
    ];
    foreach ($all_cats as $id => $name) $filters['categories'][] = ['id' => $id, 'name' => $name];
    foreach ($all_brands as $id => $name) $filters['brands'][] = ['id' => $id, 'name' => $name];
    foreach ($all_tags as $id => $name) $filters['tags'][] = ['id' => $id, 'name' => $name];

    // Sort filters by name
    usort($filters['categories'], function ($a, $b) { return strcmp($a['name'], $b['name']); });
    usort($filters['brands'], function ($a, $b) { return strcmp($a['name'], $b['name']); });
    usort($filters['tags'], function ($a, $b) { return strcmp($a['name'], $b['name']); });

    wp_send_json_success(['products' => $data, 'filters' => $filters]);
}

function avoska_pos_get_customers()
{
    // Simple customer search or list
    $term = isset($_POST['term']) ? sanitize_text_field($_POST['term']) : '';
    $role = isset($_POST['role']) ? sanitize_text_field($_POST['role']) : '';

    $args = [
        'number' => 20,
    ];

    if (!empty($role)) {
        $args['role'] = $role;
    }

    if (empty($term)) {
        // Return top 10 customers by money spent
        $args['meta_key'] = '_money_spent';
        $args['orderby'] = 'meta_value_num';
        $args['order'] = 'DESC';
        $args['number'] = 10;
    } else {
        $args['search'] = "*{$term}*";
        $args['search_columns'] = ['user_login', 'user_nicename', 'user_email', 'display_name'];
    }

    $query = new WP_User_Query($args);

    $users = $query->get_results();
    $data = [];
    foreach ($users as $u) {
        $data[] = [
            'id' => $u->ID,
            'name' => $u->display_name . ' (' . $u->user_email . ')',
            'email' => $u->user_email,
            'roles' => $u->roles
        ];
    }
    wp_send_json_success(['customers' => $data]);
}

function avoska_pos_get_staff()
{
    $roles_to_fetch = ['administrator', 'shop_manager', 'staff']; // Add 'staff' if it exists, or whatever custom role
    $data_by_role = [
        'administrator' => [],
        'shop_manager' => [],
        'staff' => []
    ];

    foreach ($roles_to_fetch as $role) {
        $args = [
            'role' => $role,
            'orderby' => 'display_name',
            'order' => 'ASC'
        ];
        $query = new WP_User_Query($args);
        $users = $query->get_results();
        
        foreach ($users as $u) {
            $data_by_role[$role][] = [
                'id' => $u->ID,
                'name' => $u->display_name,
                'email' => $u->user_email,
                'role' => $role,
                'avatar_url' => get_avatar_url($u->ID, ['size' => 64])
            ];
        }
    }

    wp_send_json_success(['staff' => $data_by_role]);
}

function avoska_pos_create_order()
{
    $input = json_decode(file_get_contents('php://input'), true);

    try {
        $order = wc_create_order();

        // Customer
        // Customer
        if (!empty($input['customer_id'])) {
            $order->set_customer_id((int) $input['customer_id']);
            $customer = new WC_Customer((int) $input['customer_id']);
            $order->set_billing_first_name($customer->get_billing_first_name() ? $customer->get_billing_first_name() : $customer->get_first_name());
            $order->set_billing_last_name($customer->get_billing_last_name() ? $customer->get_billing_last_name() : $customer->get_last_name());
            $order->set_billing_email($customer->get_billing_email() ? $customer->get_billing_email() : $customer->get_email());
            $order->set_billing_phone($customer->get_billing_phone());
        } else {
            $order->set_billing_first_name('Гость');
            $order->set_billing_last_name('POS');
        }

        // Items
        $order_total = 0;
        foreach ($input['items'] as $item) {
            $qty = (int) $item['qty'];
            $price = (float) $item['price']; // Actual paid price per unit
            $original_price = isset($item['original_price']) ? (float) $item['original_price'] : $price;
            
            if (isset($item['is_custom']) && $item['is_custom']) {
                // Custom item
                $item_id = $order->add_item(new WC_Order_Item_Product());
                if ($item_id) {
                    $new_item = $order->get_item($item_id);
                    $new_item->set_name($item['name']);
                    $new_item->set_quantity($qty);
                    $new_item->set_subtotal($price * $qty);
                    $new_item->set_total($price * $qty);
                    $new_item->save();
                }
            } else {
                // Standard product
                $product = wc_get_product($item['id']);
                if ($product) {
                    $item_id = $order->add_product($product, $qty);
                    if ($item_id) {
                        $line_item = $order->get_item($item_id);
                        if ($line_item) {
                            // subtotal = original price (before discount) for WC display
                            // total = actual paid price (after discount)
                            $line_item->set_subtotal($original_price * $qty);
                            $line_item->set_total($price * $qty);
                            $line_item->save();
                        }
                    }
                }
            }
            $order_total += $price * $qty;
        }

        // Set order total manually (don't use calculate_totals — it overrides our prices)
        $order->set_total($order_total);

        // Payment
        $payment_method = $input['payment_method'] ?? 'pos_cash';
        
        $payment_titles = [
            'pos_cash' => 'Наличные',
            'pos_card' => 'Карта/перевод',
            'alias_transfer' => 'Перевод на алиас',
            'usdt' => 'USDT'
        ];

        $payment_title = $payment_titles[$payment_method] ?? ('POS - ' . ucfirst($payment_method));
        
        $order->set_payment_method($payment_method);
        $order->set_payment_method_title($payment_title);

        // Save Cashier Info
        $current_user = wp_get_current_user();
        if ($current_user && $current_user->ID) {
            $order->update_meta_data('_pos_cashier_id', $current_user->ID);
            $cashier_name = $current_user->display_name;
            $order->update_meta_data('_pos_cashier_name', $cashier_name);
            $order->update_meta_data('_pos_cashier_email', $current_user->user_email);
        }

        // DETAILS: Tendered / Change
        if (isset($input['tendered'])) {
            $order->update_meta_data('_pos_tendered', $input['tendered']);
        }
        if (isset($input['change'])) {
            $order->update_meta_data('_pos_change', $input['change']);
        }

        // NOTE
        if (!empty($input['note'])) {
            $order->set_customer_note(sanitize_textarea_field($input['note']));
        }

        // OPTIMIZATION: Email & Invoice Handling
        $customer_id = isset($input['customer_id']) ? intval($input['customer_id']) : 0;

        // Save the order FIRST so all billing data is in DB
        $order->save();

        // Disable ALL automatic emails during status change
        add_filter('woocommerce_email_enabled_new_order', '__return_false');
        add_filter('woocommerce_email_enabled_cancelled_order', '__return_false');
        add_filter('woocommerce_email_enabled_failed_order', '__return_false');
        add_filter('woocommerce_email_enabled_customer_completed_order', '__return_false');
        add_filter('woocommerce_email_enabled_customer_processing_order', '__return_false');
        add_filter('woocommerce_email_enabled_customer_invoice', '__return_false');
        add_filter('woocommerce_email_attachments', '__return_empty_array', 999);

        // Status — no emails will fire here (all disabled above)
        $order->update_status('completed', 'Order created via Avoska POS');

        // Списать товары со склада (только для товаров с включённым управлением запасами)
        wc_reduce_stock_levels($order->get_id());

        // Send "Customer Invoice" for registered customers only
        if ($customer_id > 0) {
            try {
                $mailer = WC()->mailer();
                $mails = $mailer->get_emails();
                if (!empty($mails['WC_Email_Customer_Invoice'])) {
                    $mails['WC_Email_Customer_Invoice']->enabled = 'yes';
                    $mails['WC_Email_Customer_Invoice']->trigger($order->get_id(), $order);
                } else {
                    $billing_email = $order->get_billing_email();
                    $subject = get_bloginfo('name') . ' - Заказ #' . $order->get_id();
                    $body = 'Ваш заказ #' . $order->get_id() . ' на сумму ' . $order->get_formatted_order_total() . ' выполнен. Спасибо!';
                    wp_mail($billing_email, $subject, $body, ['Content-Type: text/html; charset=UTF-8']);
                }
            } catch (Exception $emailEx) {}
        }

        // Clean buffer to ensure valid JSON
        while (ob_get_level()) {
            ob_end_clean();
        }

        wp_send_json_success(['order_id' => $order->get_id()]);

    } catch (Exception $e) {
        while (ob_get_level()) {
            ob_end_clean();
        }
        wp_send_json_error(['message' => $e->getMessage()]);
    }
}

function avoska_pos_get_orders()
{
    // Explicitly set Buenos Aires Timezone
    $tz = new DateTimeZone('America/Argentina/Buenos_Aires');
    $now = new DateTime('now', $tz);

    $today_start = clone $now;
    $start_of_day = $today_start->setTime(0, 0, 0)->getTimestamp();

    $today_end = clone $now;
    $end_of_day = $today_end->setTime(23, 59, 59)->getTimestamp();

    $args = [
        'limit' => 200,
        'orderby' => 'date',
        'order' => 'DESC',
        'status' => ['wc-completed'], // Only completed orders
        'date_completed' => $start_of_day . '...' . $end_of_day, // Completion date query
    ];
    $orders = wc_get_orders($args);
    $data = [];

    foreach ($orders as $o) {
        $shipping = (float) $o->get_shipping_total();
        $total = (float) $o->get_total() - $shipping;
        
        $data[] = [
            'id' => $o->get_id(),
            'number' => $o->get_order_number(),
            'date' => $o->get_date_completed()->setTimezone(new DateTimeZone(wp_timezone_string()))->format('H:i'),
            'full_date' => $o->get_date_completed()->setTimezone(new DateTimeZone(wp_timezone_string()))->format('Y-m-d H:i:s'),
            'status' => $o->get_status(),
            'total' => $total,
            'shipping' => $shipping,
            'customer' => $o->get_billing_first_name() . ' ' . $o->get_billing_last_name(),
            'address' => $o->get_billing_address_1(),
            'cashier' => ($author_id = get_post_field('post_author', $o->get_id())) ? (get_userdata($author_id) ? get_userdata($author_id)->display_name : '-') : '-',
            'payment_method' => $o->get_payment_method_title(),
            'items' => array_values(array_map(function ($item) {
                return [
                    'name' => $item->get_name(),
                    'qty' => $item->get_quantity(),
                    'total' => (float) $item->get_total(),
                    'subtotal' => (float) $item->get_subtotal()
                ];
            }, $o->get_items()))
        ];
    }

    wp_send_json_success(['orders' => $data]);
}

function avoska_pos_get_weekly_orders()
{
    $tz = new DateTimeZone('America/Argentina/Buenos_Aires');
    $now = new DateTime('now', $tz);

    // 7 days ago at 00:00:00
    $week_start = clone $now;
    $week_start->modify('-6 days')->setTime(0, 0, 0);

    $today_end = clone $now;
    $today_end->setTime(23, 59, 59);

    $args = [
        'limit' => -1,
        'orderby' => 'date',
        'order' => 'ASC',
        'status' => ['wc-completed'],
        'date_completed' => $week_start->getTimestamp() . '...' . $today_end->getTimestamp(),
    ];
    $orders = wc_get_orders($args);

    // Group by day
    $daily = [];
    for ($i = 6; $i >= 0; $i--) {
        $d = clone $now;
        $d->modify("-{$i} days");
        $key = $d->format('Y-m-d');
        $daily[$key] = ['total' => 0, 'count' => 0, 'methods' => []];
    }

    foreach ($orders as $o) {
        $date_completed = $o->get_date_completed();
        if (!$date_completed) continue;
        $date_completed->setTimezone($tz);
        $key = $date_completed->format('Y-m-d');

        if (isset($daily[$key])) {
            $shipping = (float) $o->get_shipping_total();
            $total = (float) $o->get_total() - $shipping;
            $daily[$key]['total'] += $total;
            $daily[$key]['count']++;

            $method = $o->get_payment_method_title() ?: 'Other';
            if (!isset($daily[$key]['methods'][$method])) {
                $daily[$key]['methods'][$method] = 0;
            }
            $daily[$key]['methods'][$method] += $total;
        }
    }

    wp_send_json_success(['weekly' => $daily]);
}

function avoska_pos_update_product()
{
    if (!current_user_can('edit_products')) {
        wp_send_json_error(['message' => 'No permission']);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || empty($input['id'])) {
        wp_send_json_error(['message' => 'Missing product ID']);
    }

    $product = wc_get_product((int) $input['id']);
    if (!$product) {
        wp_send_json_error(['message' => 'Product not found']);
    }

    // Name
    if (isset($input['name']) && $input['name'] !== '') {
        $product->set_name(sanitize_text_field($input['name']));
    }

    // Regular Price
    if (isset($input['regular_price'])) {
        $product->set_regular_price((string) $input['regular_price']);
    }

    // Sale Price
    if (array_key_exists('sale_price', $input)) {
        if ($input['sale_price'] === null || $input['sale_price'] === '') {
            $product->set_sale_price('');
        } else {
            $product->set_sale_price((string) $input['sale_price']);
        }
    }

    // Stock
    if (isset($input['stock'])) {
        $product->set_manage_stock(true);
        $product->set_stock_quantity((int) $input['stock']);
    }

    // Category IDs
    if (isset($input['cat_ids']) && is_array($input['cat_ids'])) {
        $product->set_category_ids(array_map('intval', $input['cat_ids']));
    }

    // Tag IDs
    if (isset($input['tag_ids']) && is_array($input['tag_ids'])) {
        $product->set_tag_ids(array_map('intval', $input['tag_ids']));
    }

    // Brand (taxonomy)
    if (isset($input['brand_id'])) {
        $brand_tax = false;
        if (taxonomy_exists('pwb-brand')) $brand_tax = 'pwb-brand';
        elseif (taxonomy_exists('product_brand')) $brand_tax = 'product_brand';

        if ($brand_tax) {
            $brand_val = (int) $input['brand_id'];
            wp_set_object_terms($product->get_id(), $brand_val > 0 ? [$brand_val] : [], $brand_tax);
        }
    }

    // Catalog Visibility
    if (isset($input['catalog_visibility'])) {
        $allowed = ['visible', 'catalog', 'search', 'hidden'];
        if (in_array($input['catalog_visibility'], $allowed)) {
            $product->set_catalog_visibility($input['catalog_visibility']);
        }
    }

    // EAN / GTIN
    if (isset($input['ean'])) {
        $ean_val = sanitize_text_field($input['ean']);
        if (method_exists($product, 'set_global_unique_id')) {
            $product->set_global_unique_id($ean_val);
        } else {
            update_post_meta($product->get_id(), '_global_unique_id', $ean_val);
        }
    }

    // Save WooCommerce product object FIRST
    $product->save();

    // Cost (COGS) — saved AFTER $product->save() to prevent WC from overwriting
    // direct post_meta changes with its internal meta cache
    if (isset($input['cost'])) {
        update_post_meta($product->get_id(), '_cogs_total_value', (string) $input['cost']);
    }

    // Return updated product data for cache refresh
    $img_id = $product->get_image_id();
    $img_url = $img_id ? wp_get_attachment_image_url($img_id, 'thumbnail') : '';

    $cat_ids = $product->get_category_ids();
    $brand_ids = [];
    $brand_tax = false;
    if (taxonomy_exists('pwb-brand')) $brand_tax = 'pwb-brand';
    elseif (taxonomy_exists('product_brand')) $brand_tax = 'product_brand';
    if ($brand_tax) {
        $terms = get_the_terms($product->get_id(), $brand_tax);
        if ($terms && !is_wp_error($terms)) {
            foreach ($terms as $t) $brand_ids[] = $t->term_id;
        }
    }

    $ean = '';
    if (method_exists($product, 'get_global_unique_id')) {
        $ean = $product->get_global_unique_id();
    }
    if (empty($ean)) {
        $ean = get_post_meta($product->get_id(), '_global_unique_id', true);
    }

    wp_send_json_success(['product' => [
        'id' => $product->get_id(),
        'name' => $product->get_name(),
        'price' => (float) $product->get_price(),
        'regular_price' => (float) $product->get_regular_price(),
        'sale_price' => $product->get_sale_price() !== '' ? (float) $product->get_sale_price() : null,
        'cost' => (float) get_post_meta($product->get_id(), '_cogs_total_value', true),
        'catalog_visibility' => $product->get_catalog_visibility(),
        'image' => $img_url,
        'sku' => $product->get_sku(),
        'ean' => $ean,
        'cat_ids' => $cat_ids,
        'tag_ids' => $product->get_tag_ids(),
        'brand_ids' => $brand_ids,
        'stock' => $product->get_stock_quantity(),
        'kitchen_stock' => (int) $product->get_meta('_kitchen_stock'),
    ]]);
}

function avoska_pos_display_cashier_field($order)
{
    $cashier_name = $order->get_meta('_pos_cashier_name');
    $cashier_id = $order->get_meta('_pos_cashier_id');
    $cashier_email = $order->get_meta('_pos_cashier_email');

    if ($cashier_name) {
        echo '<p class="form-field form-field-wide"><label>' . __('Кассир POS:', 'avoska-pos') . '</label>';
        echo '<span>' . esc_html($cashier_name);
        if ($cashier_id) {
            echo ' (#' . esc_html($cashier_id) . ($cashier_email ? ' - ' . esc_html($cashier_email) : '') . ')';
        }
        echo '</span></p>';
    }

    // Tendered/Change display removed by user request
}

// --- ADMIN SETTINGS ---
add_action('admin_menu', 'avoska_pos_add_admin_menu', 99);
function avoska_pos_add_admin_menu() {
    global $menu;
    $has_avoska = false;
    foreach ($menu as $m) {
        if ($m[2] === 'avoska-profit-manager') { $has_avoska = true; break; }
    }
    
    if ($has_avoska) {
        add_submenu_page('avoska-profit-manager', 'Настройки POS', 'Avoska POS', 'manage_woocommerce', 'avoska-pos-settings', 'avoska_pos_render_settings_page');
    } else {
        add_menu_page('Avoska POS', 'Avoska POS', 'manage_woocommerce', 'avoska-pos-settings', 'avoska_pos_render_settings_page', 'dashicons-store', 56);
    }
}

function avoska_pos_render_settings_page() {
    if (!current_user_can('manage_woocommerce')) return;
    
    // Save
    if (isset($_POST['avoska_pos_save']) && check_admin_referer('avoska_pos_settings_nonce')) {
        update_option('avoska_pos_report_email', sanitize_email($_POST['report_email']));
        update_option('avoska_pos_schedule_start', sanitize_text_field($_POST['schedule_start']));
        update_option('avoska_pos_schedule_end', sanitize_text_field($_POST['schedule_end']));
        update_option('avoska_pos_report_email_2', sanitize_email($_POST['report_email_2'] ?? ''));
        update_option('avoska_pos_hide_f1', isset($_POST['hide_f1']) ? 'yes' : 'no');
        
        // Auto Report settings
        update_option('avoska_pos_auto_report_enabled', isset($_POST['auto_report_enabled']) ? 'yes' : 'no');
        update_option('avoska_pos_auto_report_time', sanitize_text_field($_POST['auto_report_time'] ?? '20:58'));
        
        // Skip days (checkboxes for days of week)
        $skip = isset($_POST['auto_report_skip_days']) && is_array($_POST['auto_report_skip_days'])
            ? array_map('intval', $_POST['auto_report_skip_days'])
            : [];
        update_option('avoska_pos_auto_report_skip_days', $skip);
        
        // Force reschedule after settings change
        $ts = wp_next_scheduled('avoska_pos_auto_report_event');
        if ($ts) wp_unschedule_event($ts, 'avoska_pos_auto_report_event');
        avoska_pos_schedule_auto_report();
        
        // Receipt fields
        update_option('avoska_pos_receipt_store_name', sanitize_text_field($_POST['receipt_store_name'] ?? ''));
        update_option('avoska_pos_receipt_owner', sanitize_text_field($_POST['receipt_owner'] ?? ''));
        update_option('avoska_pos_receipt_phone', sanitize_text_field($_POST['receipt_phone'] ?? ''));
        update_option('avoska_pos_receipt_cuit', sanitize_text_field($_POST['receipt_cuit'] ?? ''));
        update_option('avoska_pos_receipt_address', sanitize_text_field($_POST['receipt_address'] ?? ''));
        update_option('avoska_pos_receipt_city', sanitize_text_field($_POST['receipt_city'] ?? ''));
        update_option('avoska_pos_receipt_start_date', sanitize_text_field($_POST['receipt_start_date'] ?? ''));
        update_option('avoska_pos_receipt_tax_type', sanitize_text_field($_POST['receipt_tax_type'] ?? ''));
        
        echo '<div class="notice notice-success"><p>Настройки сохранены.</p></div>';
    }

    $email = get_option('avoska_pos_report_email', get_option('admin_email'));
    $start = get_option('avoska_pos_schedule_start', '09:00');
    $end = get_option('avoska_pos_schedule_end', '21:00');
    $hide_f1 = get_option('avoska_pos_hide_f1', 'no');
    
    // Receipt defaults
    $r_store  = get_option('avoska_pos_receipt_store_name', 'AVOSKA');
    $r_owner  = get_option('avoska_pos_receipt_owner', 'DZUTSEV DAVID');
    $r_phone  = get_option('avoska_pos_receipt_phone', '116210-7411');
    $r_cuit   = get_option('avoska_pos_receipt_cuit', '27631600994');
    $r_addr   = get_option('avoska_pos_receipt_address', 'HIPOLITO YRIGOYEN 2000');
    $r_city   = get_option('avoska_pos_receipt_city', 'CABA. CP1089');
    $r_start  = get_option('avoska_pos_receipt_start_date', '01/11/2025');
    $r_tax    = get_option('avoska_pos_receipt_tax_type', 'Responsable Monotributo');
    
    $users = get_users(['role__in' => ['administrator', 'shop_manager']]);
    ?>
    <div class="wrap">
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h1>🛠 Настройки Avoska POS</h1>
            <a href="/apos/" target="_blank" class="button button-primary button-hero" style="background:#27ae60; border-color:#219150; text-shadow:none;">▶ Открыть POS</a>
        </div>
        <form method="post" style="background:#fff; padding:20px; border:1px solid #ccc; max-width:700px; margin-top:20px;">
            <?php wp_nonce_field('avoska_pos_settings_nonce'); ?>
            
            <h2 style="margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px;">⚙️ Основные</h2>
            <table class="form-table">
                <tr>
                    <th scope="row">Почта для отчетов</th>
                    <td>
                        <input type="email" name="report_email" id="report_email" value="<?= esc_attr($email) ?>" class="regular-text">
                        <p class="description">Куда отправлять ежедневные/недельные отчеты (Z-отчет).</p>
                        
                        <div style="margin-top:5px;">
                            <select onchange="document.getElementById('report_email').value = this.value; this.value='';">
                                <option value="">-- Выбрать из сотрудников --</option>
                                <?php foreach($users as $u): ?>
                                    <option value="<?= esc_attr($u->user_email) ?>"><?= esc_html($u->display_name) ?> (<?= $u->user_email ?>) - <?= implode(', ', $u->roles) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Почта зам. директора</th>
                    <td>
                        <?php $email2 = get_option('avoska_pos_report_email_2', ''); ?>
                        <input type="email" name="report_email_2" id="report_email_2" value="<?= esc_attr($email2) ?>" class="regular-text">
                        <p class="description">Второй получатель отчётов (зам. директора). Оставьте пустым, если не нужно.</p>
                        
                        <div style="margin-top:5px;">
                            <select onchange="document.getElementById('report_email_2').value = this.value; this.value='';">
                                <option value="">-- Выбрать из сотрудников --</option>
                                <?php foreach($users as $u): ?>
                                    <option value="<?= esc_attr($u->user_email) ?>"><?= esc_html($u->display_name) ?> (<?= $u->user_email ?>) - <?= implode(', ', $u->roles) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </td>
                </tr>
                <tr>
                    <th scope="row">График работы</th>
                    <td>
                        <fieldset>
                            <label>Начало: <input type="time" name="schedule_start" value="<?= esc_attr($start) ?>"></label>
                            <span style="margin:0 10px;">—</span>
                            <label>Конец: <input type="time" name="schedule_end" value="<?= esc_attr($end) ?>"></label>
                        </fieldset>
                        <p class="description">Отображается в статус-баре POS.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Скрыть названия всех F-клавиш</th>
                    <td>
                        <input type="checkbox" name="hide_f1" value="yes" <?php checked($hide_f1, 'yes'); ?> />
                        <label>Скрывает текст в статус-баре. Останутся только кнопки "F..." с подсказками.</label>
                    </td>
                </tr>
            </table>
            
            <h2 style="border-bottom:1px solid #eee; padding-bottom:10px; margin-top:30px;">📧 Автоотправка отчёта</h2>
            <p class="description" style="margin-bottom:15px;">Автоматическая отправка ежедневного отчёта на указанные email в заданное время.</p>
            <table class="form-table">
                <tr>
                    <th scope="row">Включить автоотправку</th>
                    <td>
                        <?php $auto_enabled = get_option('avoska_pos_auto_report_enabled', 'no'); ?>
                        <input type="checkbox" name="auto_report_enabled" value="yes" <?php checked($auto_enabled, 'yes'); ?> />
                        <label>Ежедневный отчёт (за день) будет отправляться автоматически.</label>
                        <?php
                        $next_run = wp_next_scheduled('avoska_pos_auto_report_event');
                        if ($next_run && $auto_enabled === 'yes') {
                            $tz_display = new DateTimeZone('America/Argentina/Buenos_Aires');
                            $next_dt = new DateTime('@' . $next_run);
                            $next_dt->setTimezone($tz_display);
                            echo '<p class="description" style="color:#27ae60;">✅ Следующая отправка: <strong>' . $next_dt->format('d.m.Y H:i') . '</strong> (Buenos Aires)</p>';
                        } elseif ($auto_enabled === 'yes') {
                            echo '<p class="description" style="color:#e67e22;">⏳ Cron ещё не запланирован. Сохраните настройки.</p>';
                        }
                        ?>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Время отправки</th>
                    <td>
                        <?php $auto_time = get_option('avoska_pos_auto_report_time', '20:58'); ?>
                        <input type="time" name="auto_report_time" value="<?= esc_attr($auto_time) ?>">
                        <p class="description">Время по Буэнос-Айресу (America/Argentina/Buenos_Aires). Отчёт отправляется на адреса, указанные выше.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Выходные (не отправлять)</th>
                    <td>
                        <?php
                        $skip_days = get_option('avoska_pos_auto_report_skip_days', [0]);
                        if (!is_array($skip_days)) $skip_days = [];
                        $day_names = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
                        ?>
                        <fieldset style="display:flex; gap:15px; flex-wrap:wrap;">
                            <?php for ($d = 0; $d < 7; $d++): ?>
                            <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
                                <input type="checkbox" name="auto_report_skip_days[]" value="<?= $d ?>" <?php checked(in_array($d, $skip_days)); ?> />
                                <?= $day_names[$d] ?>
                            </label>
                            <?php endfor; ?>
                        </fieldset>
                        <p class="description">Отмеченные дни — выходные, отчёт НЕ будет отправляться. По умолчанию: Вс.</p>
                    </td>
                </tr>
            </table>
            
            <h2 style="border-bottom:1px solid #eee; padding-bottom:10px; margin-top:30px;">🧾 Данные чека (Receipt)</h2>
            <p class="description" style="margin-bottom:15px;">Эти данные печатаются в шапке каждого чека.</p>
            <table class="form-table">
                <tr>
                    <th scope="row">Название магазина</th>
                    <td><input type="text" name="receipt_store_name" value="<?= esc_attr($r_store) ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th scope="row">Владелец / Имя</th>
                    <td><input type="text" name="receipt_owner" value="<?= esc_attr($r_owner) ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th scope="row">Телефон</th>
                    <td><input type="text" name="receipt_phone" value="<?= esc_attr($r_phone) ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th scope="row">C.U.I.T.</th>
                    <td><input type="text" name="receipt_cuit" value="<?= esc_attr($r_cuit) ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th scope="row">Адрес</th>
                    <td><input type="text" name="receipt_address" value="<?= esc_attr($r_addr) ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th scope="row">Город / Индекс</th>
                    <td><input type="text" name="receipt_city" value="<?= esc_attr($r_city) ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th scope="row">Дата начала деятельности</th>
                    <td><input type="text" name="receipt_start_date" value="<?= esc_attr($r_start) ?>" class="regular-text" placeholder="01/11/2025"></td>
                </tr>
                <tr>
                    <th scope="row">Тип налогоплательщика</th>
                    <td>
                        <select name="receipt_tax_type">
                            <option value="Responsable Monotributo" <?php selected($r_tax, 'Responsable Monotributo'); ?>>Responsable Monotributo</option>
                            <option value="Responsable Inscripto" <?php selected($r_tax, 'Responsable Inscripto'); ?>>Responsable Inscripto</option>
                            <option value="Consumidor Final" <?php selected($r_tax, 'Consumidor Final'); ?>>Consumidor Final</option>
                            <option value="Exento" <?php selected($r_tax, 'Exento'); ?>>Exento</option>
                        </select>
                    </td>
                </tr>
            </table>
            
            <p class="submit">
                <input type="submit" name="avoska_pos_save" class="button button-primary" value="Сохранить изменения">
            </p>
        </form>
    </div>
    <?php
}

// --- SEND REPORT AJAX ---
add_action('wp_ajax_avoska_pos_send_report', 'avoska_pos_send_report');
function avoska_pos_send_report() {
    if (!current_user_can('manage_woocommerce') && !current_user_can('staff')) {
        wp_send_json_error(['message' => 'No permission']);
    }

    $type = isset($_POST['type']) ? sanitize_text_field($_POST['type']) : 'daily';
    $result = avoska_pos_generate_and_send_report($type);
    
    if ($result['success']) {
        wp_send_json_success(['message' => $result['message']]);
    } else {
        wp_send_json_error(['message' => $result['message']]);
    }
}

/**
 * Core report generation and sending logic.
 * Used by both AJAX handler and WP Cron.
 */
function avoska_pos_generate_and_send_report($type = 'daily') {
    $tz = new DateTimeZone('America/Argentina/Buenos_Aires');
    $now = new DateTime('now', $tz);
    
    // Dates
    if ($type === 'weekly') {
        $start_date = clone $now;
        $start_date->modify('-6 days')->setTime(0,0,0);
        $title = "Отчет за неделю (" . $start_date->format('d.m') . " - " . $now->format('d.m') . ")";
    } else {
        $start_date = clone $now;
        $start_date->setTime(0,0,0);
        $title = "Отчет за день (" . $now->format('d.m.Y') . ")";
    }
    
    $end_date = clone $now;
    $end_date->setTime(23,59,59);

    // Get Orders (Query optimized to fetch all at once, then filter in PHP)
    $args = [
        'limit' => -1,
        'status' => ['wc-completed'],
        'date_completed' => $start_date->getTimestamp() . '...' . $end_date->getTimestamp(),
        'type' => 'shop_order'
    ];
    $orders = wc_get_orders($args);

    // Initial Stats
    $stats = [
        'pos' => ['count' => 0, 'total' => 0, 'shipping' => 0, 'methods' => []],
        'delivery' => ['count' => 0, 'total' => 0, 'shipping' => 0, 'methods' => []]
    ];
    
    $map_methods = [
        'pos_cash' => 'Наличные',
        'pos_card' => 'Карта/перевод', 
        'alias_transfer' => 'Перевод на алиас',
        'usdt' => 'USDT'
    ];

    foreach ($orders as $order) {
        $shipping = (float) $order->get_shipping_total();
        $total = (float) $order->get_total() - $shipping;
        
        $method_slug = $order->get_payment_method();
        $method_title = isset($map_methods[$method_slug]) ? $map_methods[$method_slug] : ($order->get_payment_method_title() ?: 'Другое/Онлайн');
        
        // Merge USDT
        if (strpos(strtolower($method_title), 'usdt') !== false) {
            $method_title = 'Оплата USDT:';
        }

        // Determine type: POS (has cashier meta) vs Delivery
        $cashier = $order->get_meta('_pos_cashier_id');
        $group = $cashier ? 'pos' : 'delivery';
        
        $stats[$group]['count']++;
        $stats[$group]['total'] += $total;
        $stats[$group]['shipping'] += $shipping;
        
        if (!isset($stats[$group]['methods'][$method_title])) {
            $stats[$group]['methods'][$method_title] = 0;
        }
        $stats[$group]['methods'][$method_title] += $total;
    }

    // Helper for formatting
    $format_val = function($val) {
        // Return "$ 5 000" style
        return '$ ' . number_format($val, 0, '.', ' ');
    };
    
    // Build Email
    ob_start();
    ?>
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="border-bottom: 2px solid #3498db; padding-bottom: 10px;"><?= $title ?></h2>
        <p style="color: #7f8c8d; font-size: 12px;">Дата формирования: <?= $now->format('d.m.Y H:i') ?></p>
        
        <!-- POS SECTION -->
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #eee;">
            <h3 style="margin-top: 0; color: #2c3e50; border-bottom: 1px dashed #ccc; padding-bottom: 5px;">🏪 Касса (POS)</h3>
            <p><strong>Заказов:</strong> <?= $stats['pos']['count'] ?></p>
            <table style="width: 100%; border-collapse: collapse;">
                <?php foreach ($stats['pos']['methods'] as $name => $amount): ?>
                <tr>
                    <td style="padding: 5px 0; border-bottom: 1px solid #eee;"><?= esc_html($name) ?></td>
                    <td style="padding: 5px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;"><?= $format_val($amount) ?></td>
                </tr>
                <?php endforeach; ?>
                <?php if ($stats['pos']['shipping'] > 0): ?>
                <tr>
                    <td style="padding: 5px 0; color: #7f8c8d;">Доставка (Водители):</td>
                    <td style="padding: 5px 0; text-align: right; color: #7f8c8d;"><?= $format_val($stats['pos']['shipping']) ?></td>
                </tr>
                <?php endif; ?>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; font-weight: bold;">ИТОГО ПО КАССЕ:</td>
                    <td style="padding: 10px 0; font-size: 16px; font-weight: bold; text-align: right; color: #27ae60;"><?= $format_val($stats['pos']['total']) ?></td>
                </tr>
            </table>
        </div>
        
        <!-- DELIVERY SECTION -->
        <div style="background: #f0f3f6; padding: 15px; border-radius: 5px; border: 1px solid #e1e8ed;">
            <h3 style="margin-top: 0; color: #2980b9; border-bottom: 1px dashed #bdc3c7; padding-bottom: 5px;">🚚 Доставка / Онлайн</h3>
            <p><strong>Заказов:</strong> <?= $stats['delivery']['count'] ?></p>
            <table style="width: 100%; border-collapse: collapse;">
                <?php foreach ($stats['delivery']['methods'] as $name => $amount): ?>
                <tr>
                    <td style="padding: 5px 0; border-bottom: 1px solid #dce4ec;"><?= esc_html($name) ?></td>
                    <td style="padding: 5px 0; border-bottom: 1px solid #dce4ec; text-align: right; font-weight: bold;"><?= $format_val($amount) ?></td>
                </tr>
                <?php endforeach; ?>
                <?php if ($stats['delivery']['shipping'] > 0): ?>
                <tr>
                    <td style="padding: 5px 0; color: #7f8c8d;">Доставка (Водители):</td>
                    <td style="padding: 5px 0; text-align: right; color: #7f8c8d;"><?= $format_val($stats['delivery']['shipping']) ?></td>
                </tr>
                <?php endif; ?>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; font-weight: bold;">ИТОГО ДОСТАВКА:</td>
                    <td style="padding: 10px 0; font-size: 16px; font-weight: bold; text-align: right; color: #2980b9;"><?= $format_val($stats['delivery']['total']) ?></td>
                </tr>
            </table>
        </div>
        
        <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 10px;">
            Отчет сгенерирован системой Avoska POS
        </div>
    </div>
    <?php
    $message = ob_get_clean();
    
    $to = get_option('avoska_pos_report_email', get_option('admin_email'));
    // If empty option, use fallback
    if (empty($to)) $to = get_option('admin_email');

    $headers = ['Content-Type: text/html; charset=UTF-8'];
    
    $sent = wp_mail($to, 'Avoska POS: ' . $title, $message, $headers);
    
    // Send to second recipient (deputy director) if configured
    $to2 = get_option('avoska_pos_report_email_2', '');
    if (!empty($to2) && is_email($to2)) {
        wp_mail($to2, 'Avoska POS: ' . $title, $message, $headers);
    }
    
    if ($sent) {
        $recipients = $to;
        if (!empty($to2) && is_email($to2)) {
            $recipients .= ', ' . $to2;
        }
        return ['success' => true, 'message' => 'Отчет успешно отправлен на ' . $recipients];
    } else {
        return ['success' => false, 'message' => 'Ошибка отправки почты. Проверьте настройки сервера.'];
    }
}
