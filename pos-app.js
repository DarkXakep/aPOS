const POS = {
    products: [],
    filterData: { categories: [], brands: [], tags: [] }, // New Filter Data
    activeFilters: { category: null, brand: null, tag: null }, // Active filters
    sortBy: { field: 'name', dir: 'asc' }, // Sorting state
    rates: {}, // For Currency Converter
    carts: [
        { id: 1, items: [], customer: null, title: 'Cart 1' }
    ],
    activeCartId: 1,
    paymentMethod: 'pos_cash',
    lang: 'RU',
    isProcessing: false, // Guard flag
    tagsExpanded: false, // Tags inline toggle

    // Updated Dictionary - RU/ES only, no English
    formatPrice: (price) => {
        const val = parseFloat(price);
        if (isNaN(val)) return '$0';

        // Remove decimals if .00
        const hasDecimals = val % 1 !== 0;

        // Format with space as thousand separator
        const parts = val.toFixed(hasDecimals ? 2 : 0).split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");

        return '$ ' + parts.join(".");
    },

    initLang: () => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('lang') === 'ES') {
            POS.lang = 'ARG';
        } else {
            POS.lang = 'RU';
        }
    },

    i18n: {
        RU: {
            nav_register: "Касса",
            cart_empty: "Пусто",
            label_total: "ИТОГО:",
            btn_pay: "ОПЛАТА",
            label_tendered: "Получено:",
            search_placeholder: "🔍 SKU, Имя, Штрих...",
            modal_custom_title: "Свободный товар",
            order_summary: "Сводка заказа",
            pm_cash: "💵 НАЛИЧНЫЕ",
            pm_card: "💳 КАРТА",
            pm_usdt: "💲 USDT",
            pm_alias: "🏦 ALIAS",
            label_change: "Сдача:",
            btn_confirm: "✅ ПОДТВЕРДИТЬ",
            btn_cancel: "Отмена (Esc)",
            processing: "Обработка...",
            network_error: "Ошибка сети",
            cart_title: "Корзина",
            custom_product: "Свободный товар",
            custom_price: "Цена ($)",
            custom_name: "Название (опционально)",
            add_to_cart: "ДОБАВИТЬ В КОРЗИНУ",
            close: "Закрыть",
            subtotal: "Подытог",
            discount: "Скидка",
            surcharge: "Наценка",
            img: "Фото",
            name: "Название",
            stock: "Склад",
            price: "Цена",
            qty: "Кол",
            total: "Сумма",
            del: "Уд",
            nav_history: "История",
            select_customer: "Выбор клиента",
            edit_total: "Изменить итог",
            stat_today: "СЕГОДНЯ",
            stat_orders: "ЗАКАЗЫ",
            guest: "Гость",
            receipt_title: "Чек",
            receipt_order: "Заказ #",
            receipt_method: "Метод",
            receipt_thanks: "Спасибо за покупку!",
            receipt_date: "Дата",
            receipt_date: "Дата",
            btn_print: "🖨 Печать",
            order_created: "Заказ создан",
            clear_cart: "Очистить",
            status_online: "Online",
            status_offline: "Offline",
            report_title: "Отчёт за сегодня",
            report_sales_summary: "СВОДКА ПРОДАЖ",
            report_orders_count: "Заказов:",
            report_sales_total: "Сумма продаж:",
            report_payment_methods: "СПОСОБЫ ОПЛАТЫ",
            report_order: "ЗАКАЗ",
            report_date: "ДАТА",
            report_total: "ИТОГО",
            report_week_chart: "Продажи за неделю",
            dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
            // Product Editor
            edit_product_title: "✏️ Редактор товаров",
            edit_search_placeholder: "Поиск по имени, SKU, EAN...",
            edit_search_hint: "Введите имя, SKU или EAN для поиска товара",
            edit_name: "Название",
            edit_category: "Категория",
            edit_brand: "Бренд",
            edit_regular_price: "Базовая цена",
            edit_sale_price: "Акционная цена",
            edit_cost: "Себестоимость",
            edit_stock: "Запасы",
            edit_visibility: "Видимость",
            edit_save: "Сохранить",
            edit_saved: "✅ Сохранено!",
            edit_saving: "Сохранение...",
            edit_no_category: "— Без категории —",
            edit_no_brand: "— Без бренда —",
            edit_vis_visible: "Видимо",
            edit_vis_catalog: "Только каталог",
            edit_vis_search: "Только поиск",
            edit_vis_hidden: "Скрыто",
            edit_tag: "Тег",
            edit_no_tag: "— Без тега —",
            // History
            history_refresh: "🔄 Обновить",
            history_loading: "Загрузка данных...",
            history_empty: "Нет закрытых заказов за сегодня",
            history_items: "шт",
            history_reprint: "Перепечатать",
            guest_label: "Гость",
            // Customers & Staff
            customers_staff_title: "👥 Клиенты & Сотрудники",
            tab_staff: "👔 Сотрудники",
            tab_customers: "🛒 Покупатели",
            loading_staff: "Загрузка персонала...",
            staff_empty: "Сотрудники не найдены.",
            staff_failed: "Не удалось загрузить персонал",
            role_administrator: "Администраторы",
            role_shop_manager: "Менеджеры",
            role_staff: "Сотрудники",
            // Reports
            report_send_daily: "📧 Отправить за день",
            report_send_weekly: "📅 За неделю",
            report_send_hourly: "🕒 По часам",
            report_hourly_chart: "Продажи по часам",
            report_confirm_daily: "Отправить отчет за сегодня?",
            report_confirm_weekly: "Отправить отчет за неделю?",
            // Search placeholder
            search_customers_placeholder: "Поиск по имени, email, телефону..."
        },
        ARG: {
            nav_register: "Caja",
            cart_empty: "Vacío",
            label_total: "TOTAL:",
            btn_pay: "PAGAR",
            label_tendered: "Recibido:",
            search_placeholder: "🔍 SKU, Nombre, Código...",
            modal_custom_title: "Producto Libre",
            order_summary: "Resumen del Pedido",
            pm_cash: "💵 EFECTIVO",
            pm_card: "💳 TARJETA",
            pm_usdt: "💲 USDT",
            pm_alias: "🏦 ALIAS",
            label_change: "Cambio:",
            btn_confirm: "✅ CONFIRMAR",
            btn_cancel: "Cancelar (Esc)",
            processing: "Procesando...",
            network_error: "Error de Red",
            cart_title: "Carrito",
            custom_product: "Producto Libre",
            custom_price: "Precio ($)",
            custom_name: "Nombre (opcional)",
            add_to_cart: "AGREGAR AL CARRITO",
            close: "Cerrar",
            subtotal: "Subtotal",
            discount: "Descuento",
            surcharge: "Recargo",
            img: "Img",
            name: "Nombre",
            stock: "Stock",
            price: "Precio",
            qty: "Cant",
            total: "Total",
            del: "Elim",
            nav_history: "Historial",
            select_customer: "Seleccionar Cliente",
            edit_total: "Editar Total",
            stat_today: "HOY",
            stat_orders: "PEDIDOS",
            guest: "Invitado",
            receipt_title: "Recibo",
            receipt_order: "Pedido #",
            receipt_method: "Método",
            receipt_thanks: "¡Gracias por su compra!",
            receipt_date: "Fecha",
            receipt_date: "Fecha",
            btn_print: "🖨 Imprimir",
            order_created: "Pedido Creado",
            clear_cart: "Limpiar",
            status_online: "Online",
            status_offline: "Offline",
            report_title: "Informe de hoy",
            report_sales_summary: "RESUMEN DE VENTAS",
            report_orders_count: "Pedidos:",
            report_sales_total: "Total ventas:",
            report_payment_methods: "MÉTODOS DE PAGO",
            report_order: "PEDIDO",
            report_date: "FECHA",
            report_total: "TOTAL",
            report_week_chart: "Ventas de la semana",
            dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
            // Product Editor
            edit_product_title: "✏️ Editor de productos",
            edit_search_placeholder: "Buscar por nombre, SKU, EAN...",
            edit_search_hint: "Ingrese nombre, SKU o EAN para buscar un producto",
            edit_name: "Nombre",
            edit_category: "Categoría",
            edit_brand: "Marca",
            edit_regular_price: "Precio base",
            edit_sale_price: "Precio de oferta",
            edit_cost: "Costo",
            edit_stock: "Stock",
            edit_visibility: "Visibilidad",
            edit_save: "Guardar",
            edit_saved: "✅ ¡Guardado!",
            edit_saving: "Guardando...",
            edit_no_category: "— Sin categoría —",
            edit_no_brand: "— Sin marca —",
            edit_vis_visible: "Visible",
            edit_vis_catalog: "Solo catálogo",
            edit_vis_search: "Solo búsqueda",
            edit_vis_hidden: "Oculto",
            edit_tag: "Etiqueta",
            edit_no_tag: "— Sin etiqueta —",
            // History
            history_refresh: "🔄 Actualizar",
            history_loading: "Cargando datos...",
            history_empty: "No se encontraron pedidos cerrados hoy",
            history_items: "uds",
            history_reprint: "Reimprimir",
            guest_label: "Invitado",
            // Customers & Staff
            customers_staff_title: "👥 Clientes & Personal",
            tab_staff: "👔 Personal",
            tab_customers: "🛒 Clientes",
            loading_staff: "Cargando personal...",
            staff_empty: "No se encontró personal.",
            staff_failed: "Error al cargar personal",
            role_administrator: "Administradores",
            role_shop_manager: "Gerentes",
            role_staff: "Empleados",
            // Reports
            report_send_daily: "📧 Enviar del día",
            report_send_weekly: "📅 De la semana",
            report_send_hourly: "🕒 Por hora",
            report_hourly_chart: "Ventas por hora",
            report_confirm_daily: "¿Enviar informe del día?",
            report_confirm_weekly: "¿Enviar informe de la semana?",
            // Search placeholder
            search_customers_placeholder: "Buscar por nombre, email, teléfono..."
        }
    },

    init: async () => {
        const root = document.getElementById('avoska-pos-root');
        if (root && document.body !== root.parentNode) {
            document.body.appendChild(root);
            document.body.classList.add('avoska-pos-active');
        }

        if (typeof POS_HIDE_F1 !== 'undefined' && POS_HIDE_F1) {
            document.querySelectorAll('.f-label').forEach(el => el.style.display = 'none');
        }

        POS.initLang();
        POS.initResizer();
        POS.initShortcuts();

        // Timer
        setInterval(() => {
            POS.updateDateTime();
        }, 1000);

        POS.fetchWeather();
        setInterval(() => POS.fetchWeather(), 3600000); // 1h

        // Restore State (Cart)
        POS.loadState();

        await POS.fetchRates(); // Fetch rates on init
        await POS.loadProducts(); // Load products (Local or Net)

        POS.renderGrid();
        POS.renderFilters(); // New
        POS.renderTabs();
        POS.updateCartUI();
        POS.loadHistory();

        // Set version from PHP
        const versionEl = document.getElementById('status-version');
        if (versionEl && typeof POS_VERSION !== 'undefined') {
            versionEl.textContent = 'v' + POS_VERSION;
        }

        // Reports View logic integration
        if (typeof window.renderReports === 'undefined') {
            window.renderReports = () => {
                // To be implemented if needed more deeply, currently handled by POS.loadHistory calls
            };
        }

        // Initialize Sync Time
        POS.updateSyncTime(true); // true = load from storage initially

        // Online/Offline checker
        POS.checkOnlineStatus();
        window.addEventListener('online', () => POS.checkOnlineStatus());
        window.addEventListener('offline', () => POS.checkOnlineStatus());
        setInterval(() => POS.checkOnlineStatus(), 30000); // every 30s

        // DIRECT button binding for payment
        const payBtn = document.getElementById('btn-payment');
        if (payBtn) {
            console.log('[POS] Payment button found, binding click event');
            payBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[POS] Payment button CLICKED!');
                POS.openCheckout();
            });
        } else {
            console.error('[POS] Payment button NOT FOUND!');
        }

        // Sync Button Binding (create if not exists or bind existing)
        // Assuming there is a sync button in HTML, or we can add one dynamically if needed.
        // For now, let's look for a generic sync button or just ensure `POS.sync` is available globally.

        // Init Cashier Avatar
        POS.initCashierAvatar();
    },

    // --- PERSISTENCE ---
    saveState: () => {
        const state = {
            carts: POS.carts,
            activeCartId: POS.activeCartId,
            timestamp: Date.now()
        };
        localStorage.setItem('avoska_pos_state', JSON.stringify(state));
    },

    loadState: () => {
        const raw = localStorage.getItem('avoska_pos_state');
        if (raw) {
            try {
                const state = JSON.parse(raw);
                // Simple validation
                if (state.carts && Array.isArray(state.carts) && state.carts.length > 0) {
                    POS.carts = state.carts;
                    POS.activeCartId = state.activeCartId || state.carts[0].id;
                    console.log('[POS] State restored from LocalStorage');
                }
            } catch (e) {
                console.error('[POS] Failed to load state:', e);
            }
        }
    },

    // --- ONLINE STATUS ---
    checkOnlineStatus: async () => {
        const el = document.getElementById('status-msg');
        if (!el) return;
        try {
            const res = await fetch(POS_API_URL + '?action=heartbeat', { method: 'HEAD', cache: 'no-store' });
            el.textContent = POS.t('status_online');
            el.style.color = '#2ecc71';
        } catch (e) {
            el.textContent = POS.t('status_offline');
            el.style.color = '#e74c3c';
        }
    },


    // --- STATE HELPERS ---
    getActiveCart: () => {
        return POS.carts.find(c => c.id === POS.activeCartId);
    },

    t: (key) => {
        return POS.i18n[POS.lang][key] || key;
    },

    showStatusMessage: (msg, color = '#f1c40f') => {
        const statusMsg = document.getElementById('status-msg');
        if (statusMsg) {
            const original = statusMsg.getAttribute('data-original') || statusMsg.textContent;
            if (!statusMsg.getAttribute('data-original')) statusMsg.setAttribute('data-original', original);

            statusMsg.textContent = msg;
            statusMsg.style.color = color;
            setTimeout(() => {
                statusMsg.textContent = original;
                statusMsg.style.color = '#f1c40f'; // Default color
            }, 3000);
        }
    },

    // --- PRODUCT LIST ---
    // --- PRODUCT LIST ---
    loadProducts: async (force = false) => {
        // Try Local Storage First
        if (!force) {
            const cached = localStorage.getItem('avoska_pos_products');
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    // Check if empty or new structure (has .products and .filters?)
                    // Legacy check: if array, it's just products.
                    if (parsed) {
                        if (Array.isArray(parsed)) {
                            POS.products = parsed;
                        } else if (parsed.products) {
                            POS.products = parsed.products;
                            POS.filterData = parsed.filters || { categories: [], brands: [], tags: [] };
                        }
                        console.log('[POS] Products loaded from LocalStorage:', POS.products.length);
                        return; // Done
                    }
                } catch (e) {
                    console.warn('[POS] Cache parse error, fetching fresh');
                }
            }
        }

        try {
            const res = await fetch(POS_API_URL + '?action=avoska_pos_api_handler&_wpnonce=' + POS_NONCE + '&avoska_pos_action=get_products');
            const data = await res.json();
            if (data.success) {
                POS.products = data.data.products;
                POS.filterData = data.data.filters || { categories: [], brands: [], tags: [] };

                // Save to Local
                const toSave = { products: POS.products, filters: POS.filterData };
                localStorage.setItem('avoska_pos_products', JSON.stringify(toSave));
                console.log('[POS] Products fetched and cached');
            }
        } catch (e) { console.error(e); }
    },

    renderFilters: () => {
        const container = document.getElementById('pos-filters-bar');
        if (!container) return;

        let html = '';

        // Helper to get active name
        const getActiveName = (list, id, defaultText) => {
            if (!id) return defaultText;
            const item = list.find(i => i.id == id);
            return item ? item.name : defaultText;
        };

        // KITCHEN (Categories)
        const activeCatName = getActiveName(POS.filterData.categories, POS.activeFilters.category, '📂 Категория'); // Category
        const isCatActive = !!POS.activeFilters.category;

        html += `
        <div class="pos-filter-dd" id="dd-category">
            <div class="pos-filter-btn ${isCatActive ? 'active' : ''}" 
                 id="btn-category"
                 onclick="POS.toggleFilterDropdown('category')" 
                 title="${activeCatName}: ${isCatActive ? activeCatName : 'Все'}">
                📂
            </div>
            <div class="pos-filter-menu" id="menu-category">
                <div class="pos-filter-search-container">
                    <input type="text" class="pos-filter-search" placeholder="Поиск категорий..." 
                        onkeyup="POS.filterDropdownSearch(this, 'category')" onclick="event.stopPropagation()">
                </div>
                <div class="pos-filter-list" id="list-category">
                    <div class="pos-filter-item" onclick="POS.setFilter('category', '')">Все категории</div>
                    ${POS.filterData.categories.map(c => `
                        <div class="pos-filter-item ${POS.activeFilters.category == c.id ? 'selected' : ''}" 
                             data-name="${c.name.toLowerCase()}" onclick="POS.setFilter('category', ${c.id})">
                             ${c.name}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        `;

        // BRAND
        const activeBrandName = getActiveName(POS.filterData.brands, POS.activeFilters.brand, '🏷️ Бренд'); // Brand
        const isBrandActive = !!POS.activeFilters.brand;

        html += `
        <div class="pos-filter-dd" id="dd-brand">
            <div class="pos-filter-btn ${isBrandActive ? 'active' : ''}" 
                 id="btn-brand"
                 onclick="POS.toggleFilterDropdown('brand')" 
                 title="${activeBrandName}: ${isBrandActive ? activeBrandName : 'Все'}">
                🏷️
            </div>
            <div class="pos-filter-menu" id="menu-brand">
                <div class="pos-filter-search-container">
                    <input type="text" class="pos-filter-search" placeholder="Поиск брендов..." 
                        onkeyup="POS.filterDropdownSearch(this, 'brand')" onclick="event.stopPropagation()">
                </div>
                <div class="pos-filter-list" id="list-brand">
                    <div class="pos-filter-item" onclick="POS.setFilter('brand', '')">Все бренды</div>
                    ${POS.filterData.brands.map(b => `
                        <div class="pos-filter-item ${POS.activeFilters.brand == b.id ? 'selected' : ''}" 
                             data-name="${b.name.toLowerCase()}" onclick="POS.setFilter('brand', ${b.id})">
                             ${b.name}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        `;

        // TAG — collapsible inline buttons
        const tags = POS.filterData.tags || [];
        if (tags.length > 0) {
            const expanded = !!POS.tagsExpanded;
            const isTagActive = !!POS.activeFilters.tag;

            // Toggle button (🔖)
            html += `
            <div class="pos-filter-btn ${isTagActive ? 'active' : ''}" 
                 onclick="POS.tagsExpanded = !POS.tagsExpanded; POS.renderFilters();"
                 title="Теги"
                 style="font-size:16px;">
                🔖
            </div>`;

            if (expanded) {
                // Separator + inline tag buttons
                html += `<div style="width:1px; background:#ddd; margin:0 2px;"></div>`;
                const tagIcons = ['🅰️', '🍺', '🏠', '🧁', '⭐', '🔥', '💎', '🎯'];
                tags.forEach((t, i) => {
                    const isActive = POS.activeFilters.tag == t.id;
                    html += `
                    <div class="pos-filter-btn ${isActive ? 'active' : ''}" 
                         onclick="POS.setFilter('tag', ${isActive ? "''" : t.id})"
                         title="${t.name}"
                         style="font-size:16px; ${isActive ? 'box-shadow:0 0 0 2px var(--accent);' : ''}">
                        ${tagIcons[i] || '🔖'}
                    </div>`;
                });
            }
        }

        container.innerHTML = html;

        // Add global click listener once to close dropdowns
        if (!window.hasPosDropdownListener) {
            document.addEventListener('click', (e) => {
                // If click is NOT on a filter button and NOT inside a menu
                if (!e.target.closest('.pos-filter-btn') && !e.target.closest('.pos-filter-menu')) {
                    document.querySelectorAll('.pos-filter-menu.open').forEach(el => {
                        el.classList.remove('open');
                        el.style.display = 'none';
                    });
                }
            });
            window.hasPosDropdownListener = true;
        }
    },

    toggleFilterDropdown: (type) => {
        const menu = document.getElementById(`menu-${type}`);
        const btn = document.getElementById(`btn-${type}`);

        // If we are opening, we need to calculate position.
        // If we are closing, just hide.

        let wasOpen = false;
        if (menu) wasOpen = menu.classList.contains('open');

        // Close all others first
        document.querySelectorAll('.pos-filter-menu.open').forEach(el => {
            el.classList.remove('open');
            el.style.display = 'none';
        });

        if (!menu) return;

        if (!wasOpen) {
            // Open it
            if (btn) {
                const rect = btn.getBoundingClientRect();
                menu.style.position = 'fixed';
                menu.style.top = (rect.bottom + 5) + 'px';
                menu.style.left = rect.left + 'px';
                menu.style.zIndex = '999999';
                menu.style.display = 'block';
                // Use timeout to allow display:block to apply
                setTimeout(() => menu.classList.add('open'), 0);

                const input = menu.querySelector('input');
                if (input) setTimeout(() => input.focus(), 50);
            } else {
                // Fallback
                menu.style.display = 'block';
                menu.classList.add('open');
            }
        }
        // If wasOpen, we already closed it via the "Close all others" loop (or it was the same one)
    },

    filterDropdownSearch: (input, type) => {
        const val = input.value.toLowerCase();
        const list = document.getElementById(`list-${type}`);
        const items = list.querySelectorAll('.pos-filter-item[data-name]');

        items.forEach(item => {
            const name = item.getAttribute('data-name');
            if (name.includes(val)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    },

    setFilter: (type, val) => {
        POS.activeFilters[type] = val ? parseInt(val) : null;
        POS.renderFilters(); // Re-render to update btn text and close menu
        POS.renderGrid(document.getElementById('pos-search').value);
    },

    clearFilters: () => {
        POS.activeFilters = { category: null, brand: null, tag: null };
        POS.renderFilters(); // Reset selects
        POS.renderGrid(document.getElementById('pos-search').value);
    },

    toggleSort: (field) => {
        if (POS.sortBy.field === field) {
            POS.sortBy.dir = POS.sortBy.dir === 'asc' ? 'desc' : 'asc';
        } else {
            POS.sortBy.field = field;
            POS.sortBy.dir = 'asc';
        }
        POS.renderGrid(document.getElementById('pos-search').value);
        // Update UI arrows...
    },

    renderGrid: (filter = '') => {
        const container = document.getElementById('product-list-container');
        container.innerHTML = '';
        const term = filter.toLowerCase();

        // 1. Filter
        let filtered = POS.products.filter(p => {
            // Text Search
            const nameMatch = p.name.toLowerCase().includes(term);
            const skuMatch = String(p.sku).toLowerCase().includes(term);
            const eanMatch = p.ean && String(p.ean).toLowerCase().includes(term);
            if (!nameMatch && !skuMatch && !eanMatch) return false;

            // Taxonomy Filters
            if (POS.activeFilters.category && !p.cat_ids?.includes(POS.activeFilters.category)) return false;
            if (POS.activeFilters.brand && !p.brand_ids?.includes(POS.activeFilters.brand)) return false;
            if (POS.activeFilters.tag && !p.tag_ids?.includes(POS.activeFilters.tag)) return false;
            // Tag logic if added...

            return true;
        });

        // 2. Sort
        filtered.sort((a, b) => {
            let valA = a[POS.sortBy.field];
            let valB = b[POS.sortBy.field];

            // Handle parsing
            if (POS.sortBy.field === 'price' || POS.sortBy.field === 'stock') {
                valA = parseFloat(valA) || 0;
                valB = parseFloat(valB) || 0;
            } else {
                valA = String(valA).toLowerCase();
                valB = String(valB).toLowerCase();
            }

            if (valA < valB) return POS.sortBy.dir === 'asc' ? -1 : 1;
            if (valA > valB) return POS.sortBy.dir === 'asc' ? 1 : -1;
            return 0;
        });

        // 3. Render
        if (filtered.length === 0) {
            container.innerHTML = '<div style="padding:20px; text-align:center; color:#bdc3c7;">No items found</div>';
            return;
        }

        const frag = document.createDocumentFragment();
        filtered.forEach(p => {
            const row = document.createElement('div');
            row.className = 'product-row';
            row.onclick = () => POS.addToCart(p);

            // Stock Color
            let stockClass = '';
            if (p.stock <= 0) stockClass = 'out';
            else if (p.stock < 5) stockClass = 'low';

            const imgSrc = p.image || 'https://via.placeholder.com/40';
            row.innerHTML = `
                 <div class="p-img"><img src="${imgSrc}" loading="lazy" style="background:#eee"></div>
                 <div class="row-info">
                     <div class="p-name">${p.name}</div>
                     <div class="p-sku">${p.sku || ''}</div>
                 </div>
                 <div class="p-stock ${stockClass}">${p.stock === null ? '∞' : p.stock}</div>
                 <div class="p-price">$${p.price}</div>
                 <button class="btn-add-row">+</button>
             `;
            frag.appendChild(row);
        });
        container.appendChild(frag);
    },

    search: (val) => POS.renderGrid(val),

    clearSearch: () => {
        const s = document.getElementById('pos-search');
        if (s) { s.value = ''; s.focus(); }
        POS.renderGrid('');
        POS.toggleClearBtn();
    },

    toggleClearBtn: () => {
        const s = document.getElementById('pos-search');
        const btn = document.getElementById('pos-search-clear');
        if (s && btn) btn.style.display = s.value.length > 0 ? 'block' : 'none';
    },

    sync: async () => {
        const msg = (txt) => POS.showStatusMessage(txt, '#3498db');
        const done = (txt) => POS.showStatusMessage(txt, '#2ecc71');

        // Progress Logic
        try {
            msg('Sync: 0% Starting...');
            await new Promise(r => setTimeout(r, 100)); // UI render gap

            msg('Sync: 25% Loading Products...');
            await POS.loadProducts(true); // Force reload

            msg('Sync: 50% Fetching Rates...');
            await POS.fetchRates();

            msg('Sync: 75% Rendering...');
            POS.renderGrid();

            msg('Sync: 90% Loading History...');
            await POS.loadHistory();

            POS.updateSyncTime(); // Update time on success
            done('Sync: 100% Complete!');
        } catch (e) {
            POS.showStatusMessage('Sync Failed', '#e74c3c');
            console.error('Sync error:', e);
        }
    },

    updateSyncTime: (loadOnly = false) => {
        const el = document.getElementById('status-sync');
        if (!el) return;

        if (loadOnly) {
            const saved = localStorage.getItem('avoska_pos_last_sync');
            if (saved) el.textContent = '\u{1F504} ' + saved;
            else el.textContent = '\u{1F504} --';
            return;
        }

        const now = new Date();
        const d = now.getDate().toString();
        const m = (now.getMonth() + 1).toString();
        const y = now.getFullYear().toString().substr(-2);
        const h = now.getHours().toString().padStart(2, '0');
        const min = now.getMinutes().toString().padStart(2, '0');

        const str = `${d}/${m}/${y} ${h}:${min}`;
        el.textContent = '\u{1F504} ' + str;
        localStorage.setItem('avoska_pos_last_sync', str);
    },

    // --- RATES (FROM CONVERTER) ---
    fetchRates: async () => {
        // Helper functions
        const fetchDolarApiAmbito = async () => {
            const res = await fetch('https://dolarapi.com/v1/ambito/dolares');
            if (!res.ok) throw new Error('DolarApi Ambit Error');
            const data = await res.json();
            const blue = data.find(d => d.casa === 'blue');
            const cripto = data.find(d => d.casa === 'cripto');
            if (!blue || !cripto) throw new Error('Blue/Cripto not found');
            return { blue: { compra: blue.compra, venta: blue.venta }, cripto: { compra: cripto.compra, venta: cripto.venta } };
        };
        const fetchBluelytics = async () => {
            const res = await fetch('https://api.bluelytics.com.ar/v2/latest');
            if (!res.ok) throw new Error('Bluelytics error');
            const data = await res.json();
            return {
                blue: { compra: data.blue.value_avg, venta: data.blue.value_sell },
                cripto: { compra: data.blue.value_avg * 1.02, venta: data.blue.value_sell * 1.02 }
            };
        };
        const fetchArgentinaDatos = async () => {
            const res = await fetch('https://api.argentinadatos.com/v1/cotizaciones/dolares');
            if (!res.ok) throw new Error('ArgentinaDatos error');
            const data = await res.json();
            const blue = data.find(d => d.casa === 'blue');
            const cripto = data.find(d => d.casa === 'cripto');
            if (!blue) throw new Error('Blue not found');
            return {
                blue: { compra: blue.compra, venta: blue.venta },
                cripto: cripto ? { compra: cripto.compra, venta: cripto.venta } : { compra: blue.compra * 1.02, venta: blue.venta * 1.02 }
            };
        };
        const fetchDolarSi = async () => { // Fallback
            const res = await fetch('https://www.dolarsi.com/api/api.php?type=valoresprincipales');
            if (!res.ok) throw new Error('DolarSi error');
            const data = await res.json();
            const blue = data.find(d => d.casa && d.casa.nombre === 'Dolar Blue');
            if (!blue) throw new Error('Blue not found');
            const c = parseFloat(blue.casa.compra.replace(',', '.'));
            const v = parseFloat(blue.casa.venta.replace(',', '.'));
            return {
                blue: { compra: c, venta: v },
                cripto: { compra: c * 1.02, venta: v * 1.02 }
            };
        };

        const apis = [fetchDolarApiAmbito, fetchBluelytics, fetchArgentinaDatos, fetchDolarSi];
        for (const api of apis) {
            try {
                const data = await api();
                POS.rates = data;
                console.log('[POS] Rates updated:', POS.rates);
                // Update specific UI if open
                if (document.getElementById('usdt-rate-display')) {
                    document.getElementById('usdt-rate-display').textContent = `$${POS.rates.cripto.compra.toFixed(2)}`;
                }
                return;
            } catch (e) {
                console.warn('[POS] Rate API failed:', e);
            }
        }
        console.error('[POS] All Rate APIs failed');
    },

    // --- CART LOGIC ---
    addCart: () => {
        const newId = Date.now();
        POS.carts.push({ id: newId, items: [], customer: null, note: '', title: `Cart ${POS.carts.length + 1}` });
        POS.activeCartId = newId;
        POS.saveState();
        POS.renderTabs();
        POS.updateCartUI();
    },

    switchCart: (id) => {
        POS.activeCartId = id;
        POS.saveState();
        POS.renderTabs();
        POS.updateCartUI();
    },

    closeCart: (e, id) => {
        if (e) e.stopPropagation();
        if (POS.carts.length === 1) return alert('Cannot close last cart');

        const idx = POS.carts.findIndex(c => c.id === id);
        POS.carts = POS.carts.filter(c => c.id !== id);

        if (POS.activeCartId === id) {
            const newIdx = Math.max(0, idx - 1);
            POS.activeCartId = POS.carts[newIdx].id;
        }

        POS.saveState();
        POS.renderTabs();
        POS.updateCartUI();
    },

    renderTabs: () => {
        const bar = document.getElementById('cart-tabs-bar');
        const addBtn = bar.querySelector('.btn-new-tab');
        bar.innerHTML = '';

        POS.carts.forEach((c, i) => {
            const cartTotal = c.items.reduce((s, item) => s + (item.price * item.qty), 0);
            const tab = document.createElement('div');
            tab.className = `cart-tab ${c.id === POS.activeCartId ? 'active' : ''}`;
            tab.onclick = () => POS.switchCart(c.id);
            tab.innerHTML = `
                <span>${POS.t('cart_title')} ${POS.formatPrice(cartTotal)}</span>
                <span class="cart-tab-close" onclick="POS.closeCart(event, ${c.id})">×</span>
            `;
            bar.appendChild(tab);
        });
        bar.appendChild(addBtn);
    },

    addToCart: (product, isCustom = false) => {
        const cart = POS.getActiveCart();
        if (!cart) return;

        if (isCustom) {
            cart.items.push({
                id: 'custom_' + Date.now(),
                is_custom: true,
                name: product.name,
                price: parseFloat(product.price),
                qty: 1,
                image: ''
            });
        } else {
            const idx = cart.items.findIndex(i => i.id === product.id && !i.is_custom);
            if (idx > -1) {
                cart.items[idx].qty++;
            } else {
                cart.items.push({
                    id: product.id,
                    name: product.name,
                    price: parseFloat(product.price),
                    original_price: parseFloat(product.price), // Track original for discount/surcharge logic
                    qty: 1,
                    image: product.image,
                    sku: product.sku || '',
                    ean: product.ean || ''
                });
            }
        }
        POS.saveState();
        POS.updateCartUI();
        POS.playBeep();

        // Автоскролл корзины к последнему добавленному товару
        const cartContainer = document.getElementById('pos-cart-items');
        if (cartContainer) setTimeout(() => cartContainer.scrollTop = cartContainer.scrollHeight, 50);
    },

    removeFromCart: (index) => {
        const cart = POS.getActiveCart();
        cart.items.splice(index, 1);
        POS.saveState();
        POS.updateCartUI();
    },

    changeQty: (index, newQty) => {
        const cart = POS.getActiveCart();
        const qty = parseFloat(newQty);
        if (qty <= 0) {
            if (confirm('Delete?')) POS.removeFromCart(index);
            else POS.updateCartUI();
        } else {
            cart.items[index].qty = qty;
            POS.saveState();
            POS.updateCartUI();
        }
    },

    changeTotal: (index, newTotal) => {
        const cart = POS.getActiveCart();
        const total = parseFloat(newTotal);
        if (total >= 0 && cart.items[index].qty > 0) {
            // Price = Total / Qty
            cart.items[index].price = total / cart.items[index].qty;
            POS.saveState();
            POS.updateCartUI();
        }
    },

    clearCart: () => {
        const cart = POS.getActiveCart();
        if (cart.items.length === 0) return;
        if (confirm('Clear current cart?')) {
            cart.items = [];
            POS.saveState();
            POS.updateCartUI();
        }
    },

    updateCartUI: () => {
        const cart = POS.getActiveCart();
        const list = document.getElementById('pos-cart-items');

        let total = 0;
        let originalTotal = 0;

        if (cart.items.length === 0) {
            if (list) list.innerHTML = `<div style="text-align:center;color:#bdc3c7;padding:40px; font-size:14px;">${POS.t('cart_empty')}</div>`;
        } else {
            if (list) {
                list.innerHTML = cart.items.map((item, index) => {
                    total += item.price * item.qty;
                    originalTotal += (item.original_price || item.price) * item.qty;
                    const totalItem = (item.price * item.qty).toFixed(0);

                    // Check if price changed manually
                    let priceStyle = '';
                    if (item.original_price && item.price !== item.original_price) {
                        priceStyle = 'color:orange; font-weight:bold;';
                    }

                    return `
                    <div class="cart-item-card">
                        <div class="ci-img">${item.image ? `<img src="${item.image}">` : '<div style="width:35px;height:35px;background:#ecf0f1;border-radius:4px;display:flex;align-items:center;justify-content:center;">📦</div>'}</div>
                        
                        <div class="ci-qty" style="display:flex; flex-direction:row; align-items:center; justify-content:center; gap:3px;">
                            <span class="qty-control" onclick="POS.changeQty(${index}, ${item.qty - 1})" style="width:20px; height:24px; background:#eee; color:#555; border-radius:3px; display:flex; justify-content:center; align-items:center; cursor:pointer; font-weight:bold; font-size:14px;">-</span>
                             <input type="number" class="qty-input" value="${item.qty}" onchange="POS.changeQty(${index}, this.value)" style="width:30px; text-align:center; border:none; background:transparent; font-weight:bold; font-size:13px; padding:0;">
                            <span class="qty-control" onclick="POS.changeQty(${index}, ${item.qty + 1})" style="width:20px; height:24px; background:#eee; color:#555; border-radius:3px; display:flex; justify-content:center; align-items:center; cursor:pointer; font-weight:bold; font-size:14px;">+</span>
                        </div>

                        <div class="ci-info" style="display:flex; flex-direction:column; justify-content:center; padding-left:5px;">
                             <div class="ci-name" style="font-size:13px; font-weight:600; line-height:1.2;">
                                 ${item.name}
                                 ${item.original_price && item.price !== item.original_price ? `<span style="font-size:11px; color:orange; margin-left:4px;">(Mod)</span>` : ''}
                             </div>
                             <div style="font-size:11px; color:#95a5a6; margin-top:2px;">
                            ${item.sku ? 'SKU:' + item.sku : ''} ${item.ean ? 'EAN:' + item.ean : ''}
                         </div>
                        </div>

                        <div class="ci-price" style="font-size:13px; font-weight:bold; text-align:right; display:flex; flex-direction:column; align-items:flex-end; justify-content:center; gap:2px; white-space:nowrap;">
                            ${item.original_price && item.price !== item.original_price ? `<span style="text-decoration:line-through; color:#95a5a6; font-size:11px; font-weight:normal;">${POS.formatPrice(item.original_price)}</span>` : ''}
                            <span>${POS.formatPrice(item.price)}</span>
                        </div>

                        <div class="ci-total" onclick="POS.editItemTotal(${index})" style="font-weight:bold; text-align:right; font-size:14px; cursor:pointer; color:#2c3e50; background:#f8f9fa; padding:4px; border-radius:4px; border:1px dashed #bdc3c7; white-space:nowrap;">
                            ${POS.formatPrice(totalItem)}
                        </div>
                        <div class="ci-remove" onclick="POS.removeFromCart(${index})" style="color:#e74c3c; cursor:pointer; text-align:center; font-weight:bold; font-size:18px;">×</div>
                    </div>
                `;
                }).join('');
            } else {
                // If list element missing, just calc total
                cart.items.forEach(item => total += item.price * item.qty);
            }
        }

        // Totals
        const formattedTotal = POS.formatPrice(total);
        const totalEl = document.getElementById('cart-total');
        if (totalEl) totalEl.textContent = formattedTotal;

        // Discount Display Update
        const discountTotalEl = document.getElementById('cart-discount-display');
        if (discountTotalEl) {
            // Round to avoid floating point issues
            const origFixed = Math.round(originalTotal * 100) / 100;
            const totFixed = Math.round(total * 100) / 100;
            if (origFixed > totFixed && totFixed > 0) {
                const discountVal = origFixed - totFixed;
                discountTotalEl.textContent = `${POS.t('discount')}: ${POS.formatPrice(discountVal)}`;
            } else {
                discountTotalEl.textContent = '';
            }
        }

        // Tab Title Update
        const summaryTotal = document.getElementById('cart-summary-total');
        if (summaryTotal) summaryTotal.textContent = formattedTotal;

        // Update customer display (pill badge)
        const custNameEl = document.getElementById('cart-customer-name');
        const custBadge = document.getElementById('cart-customer-badge');
        const custClear = document.getElementById('cart-customer-clear');
        if (custNameEl) {
            const isGuest = !cart.customer;
            custNameEl.textContent = isGuest ? POS.t('guest') : cart.customer.name;
            if (custBadge) {
                custBadge.classList.toggle('guest', isGuest);
                custBadge.classList.toggle('has-customer', !isGuest);
            }
            if (custClear) {
                custClear.style.display = isGuest ? 'none' : 'inline-flex';
            }
        }

        // Update checkout total if open
        const checkoutDisplay = document.getElementById('checkout-total-display');
        if (checkoutDisplay) checkoutDisplay.textContent = formattedTotal;

        POS.renderTabs(); // Refresh totals in tabs
    },

    editItemTotal: (index) => {
        const cart = POS.getActiveCart();
        const item = cart.items[index];
        if (!item) return;

        const currentTotal = (item.price * item.qty).toFixed(2);
        const newTotalStr = prompt(POS.t('enter_new_total') || 'Total Item Price:', currentTotal); // Simple prompt as requested for speed
        if (newTotalStr === null) return;

        const newTotal = parseFloat(newTotalStr);
        if (isNaN(newTotal) || newTotal < 0) return;

        // Calculate new unit price
        item.price = newTotal / item.qty;

        POS.updateCartUI();
        POS.saveState();
    },

    editLastItem: () => {
        const cart = POS.getActiveCart();
        if (!cart || cart.items.length === 0) return;
        const lastItem = cart.items[cart.items.length - 1];
        console.log('[POS] editLastItem called, lastItem:', lastItem);
        if (lastItem.is_custom) {
            POS.editItemTotal(cart.items.length - 1);
            return;
        }
        // Switch to Product Editor and search for the last item
        const searchTerm = lastItem.sku || lastItem.name || '';
        console.log('[POS] searchTerm:', searchTerm);
        switchView('products-edit');
        setTimeout(() => {
            const input = document.getElementById('pe-search-input');
            console.log('[POS] pe-search-input found:', !!input, 'searchTerm:', searchTerm);
            if (input) {
                input.value = searchTerm;
                input.dispatchEvent(new Event('input'));
                POS.searchProductForEdit(searchTerm);
            }
        }, 300);
    },

    // --- CASHIER MENU ---
    initCashierAvatar: () => {
        if (typeof POS_USER === 'undefined') return;
        const av1 = document.getElementById('pos-cashier-avatar');
        const av2 = document.getElementById('pos-menu-avatar');
        const nameEl = document.getElementById('pos-menu-username');
        const emailEl = document.getElementById('pos-menu-email');
        if (av1) av1.src = POS_USER.avatar;
        if (av2) av2.src = POS_USER.avatar;
        if (nameEl) nameEl.textContent = POS_USER.name;
        if (emailEl) emailEl.textContent = POS_USER.email;

        // Close menu on click outside
        document.addEventListener('click', (e) => {
            const menu = document.getElementById('pos-user-menu');
            const logo = document.querySelector('.pos-logo');
            if (menu && !menu.classList.contains('hidden') && !logo.contains(e.target)) {
                menu.classList.add('hidden');
            }
        });
    },

    toggleUserMenu: () => {
        const menu = document.getElementById('pos-user-menu');
        if (menu) menu.classList.toggle('hidden');
    },

    openPosSettings: () => {
        if (typeof POS_USER !== 'undefined' && POS_USER.settings_url) {
            window.open(POS_USER.settings_url, '_blank');
        }
        document.getElementById('pos-user-menu')?.classList.add('hidden');
    },

    changeCashier: () => {
        if (!confirm('Сменить кассира? Текущая сессия будет завершена.')) return;
        document.getElementById('pos-user-menu')?.classList.add('hidden');
        // Instant logout via AJAX + redirect to /apos/
        window.location.href = POS_API_URL + '?action=avoska_pos_change_cashier';
    },

    logout: () => {
        if (!confirm('Выход из POS?')) return;
        document.getElementById('pos-user-menu')?.classList.add('hidden');
        // Instant logout via AJAX + redirect to homepage
        window.location.href = POS_API_URL + '?action=avoska_pos_logout';
    },

    openEditTotal: () => {
        const cart = POS.getActiveCart();
        if (!cart || cart.items.length === 0) return;

        const currentTotal = cart.items.reduce((s, i) => s + (i.price * i.qty), 0);
        document.getElementById('edit-total-current-val').textContent = '$' + currentTotal.toFixed(2);
        document.getElementById('edit-total-input').value = currentTotal.toFixed(2);
        document.getElementById('modal-edit-total').classList.remove('hidden');
        setTimeout(() => document.getElementById('edit-total-input').focus(), 100);
    },

    applyNewTotal: () => {
        const newTotal = parseFloat(document.getElementById('edit-total-input').value);
        if (isNaN(newTotal) || newTotal < 0) return;

        const cart = POS.getActiveCart();
        const currentTotal = cart.items.reduce((s, i) => s + (itemTotal = i.price * i.qty, itemTotal), 0);

        if (currentTotal > 0) {
            const factor = newTotal / currentTotal;
            cart.items.forEach(item => {
                item.price = item.price * factor;
            });
        } else if (cart.items.length > 0) {
            // If total was 0 but we have items (e.g. 0 price items), just set first item to that total?
            // Better: distribute it. But for 0 total, we just set prices.
            cart.items[0].price = newTotal / cart.items[0].qty;
        }

        POS.updateCartUI();
        POS.closeModal('modal-edit-total');
    },

    // --- CUSTOMERS ---
    selectCustomer: () => {
        document.getElementById('modal-customer').classList.remove('hidden');
        document.getElementById('customer-search-input').focus();
    },

    searchCustomers: async (term, inView = false, role = '') => {
        if (!role && term.length > 0 && term.length < 2) return;
        try {
            const body = new URLSearchParams();
            body.append('term', term);
            if (role) body.append('role', role);

            const res = await fetch(POS_API_URL + '?action=avoska_pos_api_handler&_wpnonce=' + POS_NONCE + '&avoska_pos_action=get_customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body
            });
            const data = await res.json();
            if (data.success) {
                const results = data.data.customers;
                if (inView) {
                    const list = document.getElementById('view-customers-list');
                    list.innerHTML = results.map(c => `
                        <div class="customer-card" style="padding:15px; background:#fff; border:1px solid #eee; border-radius:10px; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.06); transition:all 0.2s;" 
                             onclick="POS.setCustomer(${JSON.stringify(c).replace(/"/g, '&quot;')}); switchView('register')"
                             onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.12)'" 
                             onmouseout="this.style.transform=''; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <div style="width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg, #3498db, #2980b9); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:16px; flex-shrink:0;">${c.name.charAt(0).toUpperCase()}</div>
                                <div>
                                    <div style="font-weight:600; color:#2c3e50;">${c.name}</div>
                                    <div style="font-size:12px; color:#95a5a6;">${c.email}</div>
                                </div>
                            </div>
                        </div>
                    `).join('');
                } else {
                    const list = document.getElementById('customer-results-list');
                    list.innerHTML = results.map(c => `
                        <div class="customer-row-item" onclick="POS.setCustomer(${JSON.stringify(c).replace(/"/g, '&quot;')})">
                            <strong>${c.name}</strong><br>
                            <small>${c.email}</small>
                        </div>
                    `).join('');
                }
            }
        } catch (e) { console.error(e); }
    },

    showCustomerList: (type) => {
        document.getElementById('view-customers-list').classList.remove('hidden');
        document.getElementById('view-staff-list').classList.add('hidden');
        document.getElementById('customer-search-bar').classList.remove('hidden');

        // Tab styling
        const btnStaff = document.getElementById('btn-show-staff');
        const btnCust = document.getElementById('btn-show-customers');
        btnCust.style.background = 'var(--accent)';
        btnCust.style.color = '#fff';
        btnStaff.style.background = 'transparent';
        btnStaff.style.color = 'var(--accent)';

        // Focus search
        setTimeout(() => document.getElementById('customer-search-input-full')?.focus(), 100);
    },

    showStaffList: () => {
        document.getElementById('view-customers-list').classList.add('hidden');
        document.getElementById('view-staff-list').classList.remove('hidden');
        document.getElementById('customer-search-bar').classList.add('hidden');

        // Tab styling
        const btnStaff = document.getElementById('btn-show-staff');
        const btnCust = document.getElementById('btn-show-customers');
        btnStaff.style.background = 'var(--accent)';
        btnStaff.style.color = '#fff';
        btnCust.style.background = 'transparent';
        btnCust.style.color = 'var(--accent)';

        POS.loadStaff();
    },

    loadStaff: async () => {
        const container = document.getElementById('view-staff-list');
        container.innerHTML = `<div style="padding:20px; text-align:center;">${POS.t('loading_staff')}</div>`;

        try {
            const res = await fetch(POS_API_URL + '?action=avoska_pos_api_handler&_wpnonce=' + POS_NONCE + '&avoska_pos_action=get_staff');
            const data = await res.json();

            if (data.success && data.data.staff) {
                POS.renderStaffList(data.data.staff);
            } else {
                container.innerHTML = `<div style="padding:20px; text-align:center; color:red;">${POS.t('staff_failed')}</div>`;
            }
        } catch (e) {
            console.error(e);
            container.innerHTML = `<div style="padding:20px; text-align:center; color:red;">${POS.t('network_error')}</div>`;
        }
    },

    renderStaffList: (staffData) => {
        const container = document.getElementById('view-staff-list');
        let html = '';

        const roleTitles = {
            'administrator': POS.t('role_administrator'),
            'shop_manager': POS.t('role_shop_manager'),
            'staff': POS.t('role_staff')
        };

        const roleColors = {
            'administrator': '#c0392b',
            'shop_manager': '#d35400',
            'staff': '#27ae60'
        };

        ['administrator', 'shop_manager', 'staff'].forEach(role => {
            const users = staffData[role];
            if (users && users.length > 0) {
                html += `<h3 style="margin-top:20px; border-bottom:2px solid ${roleColors[role]}; padding-bottom:5px; color:${roleColors[role]};">${roleTitles[role] || role}</h3>`;
                html += `<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap:15px; margin-top:10px;">`;

                users.forEach(u => {
                    html += `
                        <div class="staff-card" onclick="POS.setCustomer(${JSON.stringify(u).replace(/"/g, '&quot;')}); switchView('register')" 
                             style="padding:15px; background:#fff; border:1px solid #eee; border-left:4px solid ${roleColors[role]}; border-radius:8px; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,0.1); transition:transform 0.2s;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <img src="${u.avatar_url || ''}" alt="${u.name}" 
                                     style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid ${roleColors[role]};"
                                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <div style="width:40px; height:40px; border-radius:50%; background:${roleColors[role]}; color:#fff; display:none; align-items:center; justify-content:center; font-weight:bold; font-size:16px; flex-shrink:0;">${u.name.charAt(0).toUpperCase()}</div>
                                <div>
                                    <div style="font-weight:bold; color:#2c3e50;">${u.name}</div>
                                    <div style="font-size:11px; color:#7f8c8d;">${u.email}</div>
                                </div>
                            </div>
                        </div>
                    `;
                });

                html += `</div>`;
            }
        });

        if (html === '') {
            html = `<div style="padding:20px; text-align:center; color:#7f8c8d;">${POS.t('staff_empty')}</div>`;
        }

        container.innerHTML = html;
    },


    setCustomer: (customer) => {
        const cart = POS.getActiveCart();
        cart.customer = customer;
        POS.saveState();
        POS.updateCartUI();
        POS.closeModal('modal-customer');
    },

    // --- HISTORY & REPORTS ---
    loadHistory: async () => {
        const tbody = document.querySelector('#history-table tbody');
        const loader = document.getElementById('reports-loader');
        try {
            if (loader) loader.classList.remove('hidden');
            if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;">${POS.t('history_loading')}</td></tr>`;

            // Load today's orders and weekly data in parallel
            const [ordersRes, weeklyRes] = await Promise.all([
                fetch(POS_API_URL + '?action=avoska_pos_api_handler&_wpnonce=' + POS_NONCE + '&avoska_pos_action=get_orders'),
                fetch(POS_API_URL + '?action=avoska_pos_api_handler&_wpnonce=' + POS_NONCE + '&avoska_pos_action=get_weekly_orders')
            ]);
            const ordersData = await ordersRes.json();
            const weeklyData = await weeklyRes.json();

            if (ordersData.success) {
                POS.renderHistory(ordersData.data.orders);
                POS.updateSidebarStats(ordersData.data.orders);
            } else {
                if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red; padding:20px;">Error: ${ordersData.data && ordersData.data.message ? ordersData.data.message : 'Unknown error'}</td></tr>`;
            }

            // Render weekly chart
            if (weeklyData.success && weeklyData.data.weekly) {
                POS.weeklyCache = weeklyData.data.weekly;
                POS.renderChart(weeklyData.data.weekly);
                POS.renderHourlyChart(weeklyData.data.weekly);
            }
        } catch (e) {
            console.error(e);
            if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red; padding:20px;">Network Error: ${e.message}</td></tr>`;
        } finally {
            if (loader) loader.classList.add('hidden');
        }
    },

    renderHistory: (orders) => {
        const tbody = document.querySelector('#history-table tbody');
        if (!tbody) return;

        // Sort by ID descending
        let displayOrders = orders.slice().sort((a, b) => b.id - a.id);

        if (!displayOrders || displayOrders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="padding:20px; text-align:center; color:#bdc3c7;">${POS.t('history_empty')}</td></tr>`;
            return;
        }

        // Wrap table in scroll container if not already
        if (!tbody.closest('.history-table-container')) {
            const table = document.getElementById('history-table');
            const wrapper = document.createElement('div');
            wrapper.className = 'history-table-container';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }

        // Add custom styles for highlighting and toast
        if (!document.getElementById('pos-history-styles')) {
            const style = document.createElement('style');
            style.id = 'pos-history-styles';
            style.innerHTML = `
                .order-highlight-delivery { background-color: #e8f6fd !important; }
                .order-highlight-delivery:hover { background-color: #d6eaf8 !important; }
                .copy-item { cursor: pointer; border-bottom: 1px dashed #999; }
                .copy-item:hover { color: #3498db; border-bottom-color: #3498db; }
                .copy-toast {
                    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
                    background: rgba(0,0,0,0.8); color: white; padding: 10px 20px; border-radius: 20px;
                    font-size: 14px; z-index: 9999; opacity: 0; transition: opacity 0.3s; pointer-events: none;
                }
                .copy-toast.show { opacity: 1; }
            `;
            document.head.appendChild(style);
        }

        tbody.innerHTML = displayOrders.map(o => {
            // Check if POS (has cashier info)
            // The API returns 'cashier' as name or '-' if empty. 
            // Better check: if cashier is '-' or empty, assume Delivery/Uber/Online
            const isDelivery = (o.cashier === '-' || !o.cashier);
            const rowClass = isDelivery ? 'order-highlight-delivery' : '';

            // Item Summary for Address Column & Spoiler
            let itemSummary = 'No items';
            let itemCount = 0;
            let itemsArr = [];

            if (o.items && Array.isArray(o.items)) {
                itemsArr = o.items;
            } else if (o.items && typeof o.items === 'object') {
                itemsArr = Object.values(o.items);
            }

            if (itemsArr.length > 0) {
                // Copy functionality added to item names
                itemSummary = itemsArr.map(i =>
                    `<span class="copy-item" onclick="POS.copyToClipboard(this, '${i.name.replace(/'/g, "\\'")}')" title="Click to copy">${i.qty} x ${i.name}</span>`
                ).join('<br>');
                itemCount = itemsArr.reduce((s, i) => s + parseFloat(i.qty), 0);
            }

            const statusStr = o.status ? o.status.replace('wc-', '') : 'unknown';
            const spoilerId = 'hist_sp_' + o.id;

            return `
            <tr class="${rowClass}">
                <td><a href="/wp-admin/admin.php?page=wc-orders&action=edit&id=${o.id}" target="_blank" style="color:var(--accent); text-decoration:none; font-weight:bold;">#${o.id}</a></td>
                <td>${o.customer || POS.t('guest_label')}</td>
                <td><span class="status-badge ${statusStr}">${statusStr}</span></td>
                <td>
                    <button class="history-spoiler-btn" onclick="document.getElementById('${spoilerId}').classList.toggle('visible')">
                        ${itemCount} ${POS.t('history_items')} ▼
                    </button>
                    <div id="${spoilerId}" class="history-spoiler-content">
                        ${itemSummary}
                    </div>
                </td>
                <td>${o.date}</td>
                <td>${o.cashier || '-'}</td>
                <td style="font-weight:bold;">${o.payment_method} / $${parseFloat(o.total).toFixed(0)}</td>
                <td>
                    <button class="btn-print-mini" onclick="POS.reprintOrder(${JSON.stringify(o).replace(/"/g, '&quot;')})" style="cursor:pointer; border:none; background:none; font-size:16px;" title="${POS.t('history_reprint')}">🖨️</button>
                </td>
            </tr>
            `;
        }).join('');
    },

    copyToClipboard: (el, text) => {
        if (!navigator.clipboard) {
            // Fallback
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("Copy");
            textArea.remove();
        } else {
            navigator.clipboard.writeText(text);
        }

        // Visual Feedback
        const originalColor = el.style.color;
        el.style.color = '#27ae60'; // Green
        setTimeout(() => el.style.color = originalColor, 500);

        // Toast
        let toast = document.getElementById('pos-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'pos-toast';
            toast.className = 'copy-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = 'Скопировано: ' + text;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);

        // Prevent spoiler/row clicks if any
        if (window.event) window.event.stopPropagation();
    },

    calculateChartData: (orders) => {
        // Legacy — kept for compatibility, but weekly data now comes from PHP API
        const stats = {};
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0');
            stats[key] = 0;
        }
        orders.forEach(o => {
            const dateKey = o.full_date.split(' ')[0];
            if (stats.hasOwnProperty(dateKey)) {
                stats[dateKey] += o.total;
            }
        });
        return stats;
    },

    renderChart: (weeklyData) => {
        const placeholder = document.querySelector('.report-chart-placeholder');
        if (!placeholder) return;

        const dayNames = POS.i18n[POS.lang].dayNamesShort;
        const keys = Object.keys(weeklyData);
        const values = keys.map(k => typeof weeklyData[k] === 'object' ? weeklyData[k].total : weeklyData[k]);
        const max = Math.max(...values, 100);

        const todayStr = new Date().toISOString().split('T')[0];

        let html = '';
        keys.forEach((k, i) => {
            const val = values[i];
            const h = (val / max) * 100;
            const date = new Date(k + 'T12:00:00');
            const dayName = dayNames[date.getDay()];
            const dayNum = k.split('-')[2];
            const isToday = k === todayStr;
            const barColor = isToday
                ? 'linear-gradient(to top, #e67e22, #f1c40f)'
                : 'linear-gradient(to top, #3498db, #2ecc71)';
            const labelStyle = isToday ? 'font-weight:bold; color:#e67e22;' : 'color:#7f8c8d;';

            html += `
                <div style="flex:1; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; gap:4px;">
                    <div style="font-size:10px; font-weight:bold;">$${val > 999 ? (val / 1000).toFixed(1) + 'k' : val.toFixed(0)}</div>
                    <div style="width:70%; background:${barColor}; border-radius:4px 4px 0 0; height:${Math.max(h, 2)}%; transition:height 0.5s ease;"></div>
                    <div style="font-size:9px; ${labelStyle}">${dayName}</div>
                    <div style="font-size:8px; color:#bdc3c7;">${dayNum}</div>
                </div>
            `;
        });
        placeholder.innerHTML = html;
        placeholder.style.alignItems = 'stretch';
    },

    renderHourlyChart: (weeklyData) => {
        const ctx = document.getElementById('hourlySalesChart');
        if (!ctx) return;

        // Ensure chart.js is available
        if (typeof Chart === 'undefined') {
            console.warn("Chart.js is not loaded.");
            return;
        }

        if (POS.hourlyChartInstance) {
            POS.hourlyChartInstance.destroy();
        }

        const dayNames = POS.i18n[POS.lang].dayNamesShort;
        const keys = Object.keys(weeklyData).sort();
        const todayKey = keys.length > 0 ? keys[keys.length - 1] : null;

        const datasets = [];
        // Rainbow colors: Кр Ор Жёл Зел Гол Син Фио
        const colors = [
            '#e74c3c', // Sun — красный
            '#e67e22', // Mon — оранжевый
            '#f1c40f', // Tue — жёлтый
            '#2ecc71', // Wed — зелёный
            '#3498db', // Thu — голубой
            '#2c3e8c', // Fri — синий
            '#9b59b6'  // Sat — фиолетовый
        ];

        // Calculate current 30-min bucket index for today
        const now = new Date();
        const currentBucket = now.getHours() * 2 + (now.getMinutes() >= 30 ? 1 : 0);
        // Chart shows buckets 18..42 (09:00..21:00), so index in sliced array = currentBucket - 18
        const currentSliceIdx = currentBucket - 18;

        let todayDataset = null;

        keys.forEach((k) => {
            const date = new Date(k + 'T12:00:00');
            const dayIndex = date.getDay();
            const label = dayNames[dayIndex] + ' ' + k.split('-')[2];
            const hourlyArr = weeklyData[k].hourly || new Array(48).fill(0);

            // Slice to 09:00–21:00 (buckets 18..42 inclusive = 25 points)
            const slicedData = hourlyArr.slice(18, 43);

            const isToday = (k === todayKey);

            // For today: trim data after the current time so the line doesn't drop to 0
            if (isToday && currentSliceIdx >= 0 && currentSliceIdx < slicedData.length) {
                for (let i = currentSliceIdx + 1; i < slicedData.length; i++) {
                    slicedData[i] = null; // null = Chart.js will not draw this point
                }
            }

            const totalForDay = slicedData.reduce((a, b) => (a || 0) + (b || 0), 0);

            if (totalForDay > 0 || isToday) {
                const baseColor = colors[dayIndex];
                const displayColor = isToday ? baseColor : baseColor + '55'; // 33% opacity for past days
                const ds = {
                    label: isToday ? label + (POS.lang === 'RU' ? ' (Сегодня)' : ' (Hoy)') : label,
                    data: slicedData,
                    borderColor: isToday ? baseColor : displayColor,
                    backgroundColor: isToday ? baseColor : displayColor,
                    borderWidth: isToday ? 4 : 2,
                    pointRadius: isToday ? 3 : 1,
                    fill: false,
                    tension: 0.3,
                    spanGaps: isToday ? false : true, // Past days: draw through zeros; Today: stop at null
                    order: isToday ? 0 : 1 // Draw today on top
                };
                if (isToday) {
                    todayDataset = ds; // Save for later, push last
                } else {
                    datasets.push(ds);
                }
            }
        });

        // Push today last so it appears at the end of the legend
        if (todayDataset) datasets.push(todayDataset);

        // Generate labels: 09:00, 09:30, 10:00 ... 21:00
        const labels = [];
        for (let i = 18; i <= 42; i++) {
            const h = Math.floor(i / 2);
            const m = (i % 2 === 0) ? '00' : '30';
            labels.push(`${h}:${m}`);
        }

        POS.hourlyChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { boxWidth: 12, padding: 8, font: { size: 11 } }
                    }
                },
                scales: {
                    x: {
                        ticks: { font: { size: 10 }, maxTicksLimit: 13 }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { font: { size: 10 }, callback: function (val) { return '$' + (val > 999 ? (val / 1000).toFixed(1) + 'k' : val); } }
                    }
                }
            }
        });
    },

    sendReport: async (type) => {
        if (type === 'hourly') {
            const el = document.querySelector('.report-chart-placeholder');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // Placeholder for future email sending logic since the PHP endpoint isn't fully set up yet
        alert('Функция отправки email находится в разработке.');
    },

    updateSidebarStats: (orders) => {
        const now = new Date();
        const today = now.getFullYear() + '-' + (now.getMonth() + 1).toString().padStart(2, '0') + '-' + now.getDate().toString().padStart(2, '0');
        const todaysOrders = orders.filter(o => o.full_date && o.full_date.startsWith(today));

        const totalValue = todaysOrders.reduce((sum, o) => sum + o.total, 0);
        const count = todaysOrders.length;

        const totalEl = document.getElementById('sb-today-total');
        if (totalEl) totalEl.textContent = '$' + totalValue.toFixed(0);

        const countEl = document.getElementById('sb-today-count');
        if (countEl) countEl.textContent = count;

        // Detailed Report View Population (i18n)
        const repCount = document.getElementById('rep-count');
        if (repCount) repCount.textContent = count;

        const repTotal = document.getElementById('rep-total');
        if (repTotal) repTotal.textContent = '$' + totalValue.toFixed(0);

        const methodCounts = todaysOrders.reduce((acc, o) => {
            let m = o.payment_method || 'Other';
            if (m.toLowerCase().includes('usdt')) {
                m = 'Оплата USDT:';
            }
            acc[m] = (acc[m] || 0) + o.total;
            return acc;
        }, {});

        // Calculate total shipping
        const totalShipping = todaysOrders.reduce((sum, o) => sum + (parseFloat(o.shipping) || 0), 0);

        const repMethods = document.getElementById('rep-methods');
        if (repMethods) {
            let methodsHtml = Object.entries(methodCounts).map(([m, val]) => `
                <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:13px;">
                    <span>${m}</span> <b>${POS.formatPrice(val)}</b>
                </div>
            `).join('');

            if (totalShipping > 0) {
                methodsHtml += `
                    <div style="display:flex; justify-content:space-between; margin-top:10px; padding-top:5px; border-top:1px dashed #eee; font-size:13px; color:#7f8c8d;">
                        <span>Доставка (Водители):</span> <b>${POS.formatPrice(totalShipping)}</b>
                    </div>
                `;
            }
            repMethods.innerHTML = methodsHtml;
        }

        const repTable = document.querySelector('#report-orders-table tbody');
        if (repTable) {
            repTable.innerHTML = todaysOrders.map(o => `
                <tr>
                    <td><a href="/wp-admin/admin.php?page=wc-orders&action=edit&id=${o.id}" target="_blank" style="color:var(--accent); text-decoration:none; font-weight:bold;">#${o.id}</a></td>
                    <td>${o.date}</td>
                    <td style="font-weight:bold;">$${o.total.toFixed(0)}</td>
                </tr>
            `).join('');
        }
    },

    updateDateTime: () => {
        const now = new Date();
        const daysRU = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        const daysARG = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const dayName = POS.lang === 'RU' ? daysRU[now.getDay()] : daysARG[now.getDay()];

        const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        // Shift logic: 9:00 to 21:00
        const endHour = 21;
        let diffStr = '';
        if (now.getHours() < endHour && now.getHours() >= 9) {
            const diffMs = (new Date().setHours(endHour, 0, 0, 0)) - now.getTime();
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const tpl = POS.lang === 'RU' ? '(до конца смены %h:%m)' : '(cierra en %h:%m)';
            diffStr = tpl.replace('%h', diffHrs).replace('%m', diffMins.toString().padStart(2, '0'));
        } else {
            diffStr = POS.lang === 'RU' ? '(смена окончена)' : '(cerrado)';
        }

        const sched = POS.lang === 'RU' ? '(график 9:00 - 21:00)' : '(horario 9:00 - 21:00)';

        const display = document.getElementById('shift-time-display');
        if (display) {
            display.textContent = `${dayName} ${timeStr} ${diffStr} ${sched} `;
        }
    },

    fetchWeather: async () => {
        const weatherIcon = document.getElementById('weather-icon');
        const weatherTemp = document.getElementById('weather-temp');
        if (weatherIcon) weatherIcon.textContent = '⏳';

        try {
            // Fetch real weather for Buenos Aires (or default lat/lon) using Open-Meteo
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-34.6131&longitude=-58.3772&current_weather=true');
            if (!res.ok) throw new Error('Weather fetch failed');
            const data = await res.json();

            if (data && data.current_weather) {
                const temp = Math.round(data.current_weather.temperature);
                const code = data.current_weather.weathercode;
                let icon = '☀️'; // 0

                if (code > 0 && code <= 3) icon = '⛅';
                if (code >= 45 && code <= 48) icon = '🌫️';
                if (code >= 51 && code <= 67) icon = '🌧️';
                if (code >= 71 && code <= 77) icon = '❄️';
                if (code >= 80 && code <= 82) icon = '🌦️';
                if (code >= 95) icon = '⛈️';

                if (weatherIcon) weatherIcon.textContent = icon;
                if (weatherTemp) weatherTemp.textContent = temp + '°C';
            }
        } catch (e) {
            console.warn('[POS] Weather API Error:', e.message);
            if (weatherIcon) weatherIcon.textContent = '☁️';
            // Maintain old temp if failed to update
        }
    },

    reprintOrder: (order) => {
        if (!order || !order.id) return;

        // Map historical items to structure expected by openReceiptModal
        if (order.items) {
            order.items.forEach(i => {
                if (i.qty > 0) {
                    // price = actual paid price per unit (from total)
                    i.price = i.total / i.qty;
                    // original_price = pre-discount price per unit (from subtotal)
                    if (i.subtotal !== undefined && i.subtotal !== i.total) {
                        i.original_price = i.subtotal / i.qty;
                    }
                }
            });
        }

        // Open modal
        POS.openReceiptModal(order.id, order);
    },

    // --- SOUNDS ---
    playBeep: () => {
        // High 1000Hz beep for success (Fallback)
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1000, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) { console.error(e); }
    },

    playSuccess: () => {
        try {
            const audio = new Audio(POS_PLUGIN_URL + 'mpok.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => {
                console.warn('Audio play failed (interaction?):', e);
                POS.playBeep(); // Fallback
            });
        } catch (e) {
            console.error('Audio init failed:', e);
            POS.playBeep();
        }
    },

    playError: () => {
        // Low Sawtooth 'Buzz' for error
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    },

    scanProduct: (code) => {
        const term = code.toLowerCase();
        const exact = POS.products.find(p =>
            String(p.sku).toLowerCase() === term ||
            (p.ean && String(p.ean).toLowerCase() === term)
        );

        if (exact) {
            POS.addToCart(exact);
            return true;
        } else {
            POS.playError();
            return false;
        }
    },

    // --- PAY & CHECKOUT ---
    openCheckout: () => {
        console.log('[POS] openCheckout called');
        try {
            const cart = POS.getActiveCart();
            // console.log('[POS] cart:', cart);
            if (!cart || cart.items.length === 0) {
                console.log('[POS] Cart is empty, showing message');
                POS.showStatusMessage(POS.lang === 'RU' ? 'Корзина пуста!' : 'Cart Empty!', '#e74c3c');
                return;
            }

            const total = cart.items.reduce((s, i) => s + (i.price * i.qty), 0);

            // Format Total
            const totalFormatted = POS.formatPrice(total);

            // Populate Modal
            const list = document.getElementById('checkout-items-list');
            list.innerHTML = '';
            cart.items.forEach(item => {
                const row = document.createElement('div');
                row.style.display = 'flex';
                row.style.justifyContent = 'space-between';
                row.style.marginBottom = '5px';
                row.style.fontSize = '14px';
                row.innerHTML = `
                    <span>${item.qty} x ${item.name}</span>
                    <span>${POS.formatPrice(item.price * item.qty)}</span>
                `;
                list.appendChild(row);
            });

            // Total
            const checkoutDisplay = document.getElementById('checkout-total-display');
            if (checkoutDisplay) {
                checkoutDisplay.textContent = totalFormatted;
            }

            POS.setPaymentMethod('pos_cash');

            const tenderedInput = document.getElementById('pm-tendered');
            if (tenderedInput) tenderedInput.value = '';

            const changeVal = document.getElementById('pm-change-val');
            if (changeVal) changeVal.textContent = '0.00';

            const modal = document.getElementById('modal-checkout');
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex'; // FORCE DISPLAY
            }
        } catch (e) {
            console.error('[POS] Error opening checkout:', e);
            alert('Error opening checkout: ' + e.message);
        }
    },

    setPaymentMethod: (method) => {
        POS.paymentMethod = method;
        document.querySelectorAll('.pm-btn').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`.pm-btn[data-pm="${method}"]`);
        if (btn) btn.classList.add('active');

        const cashDetails = document.getElementById('pm-cash-details');
        if (cashDetails) {
            if (method === 'pos_cash') {
                cashDetails.classList.remove('hidden');
                setTimeout(() => {
                    const tendered = document.getElementById('pm-tendered');
                    if (tendered) tendered.focus();
                }, 100);
            } else {
                cashDetails.classList.add('hidden');
            }

            const usdtDetails = document.getElementById('pm-usdt-details');
            if (usdtDetails) {
                if (method === 'usdt') {
                    usdtDetails.classList.remove('hidden');
                    // Setup initial values
                    POS.calcUsdtChange(true);
                } else {
                    usdtDetails.classList.add('hidden');
                }
            }
        }
    },

    calcUsdtChange: (init = false) => {
        const cart = POS.getActiveCart();
        const totalArs = cart.items.reduce((s, i) => s + (i.price * i.qty), 0);

        // Rate Logic: ARS -> USDT
        // Formula: (TotalARS / BuyRate) * (1 + Margin/100)
        // Default margin 3% (hardcoded as user requested 'like in plugin')
        // Plugin default margin is 3%.

        if (!POS.rates || !POS.rates.cripto) {
            document.getElementById('usdt-rate-display').textContent = 'Error: No Rate';
            return;
        }

        const rate = POS.rates.cripto.compra; // Using compra as per logic (Buy USD/USDT from client? No, client pays with USDT... usually means SELLING goods for USDT. Wait. Client gives me USDT, I give him goods valued in ARS. So I am BUYING USDT. So 'compra' rate is correct.)
        const margin = 3; // 3%
        const marginFactor = 1 + (margin / 100);

        // Convert ARS total to USDT needed
        // AmountUSDT = (AmountARS / Rate) * 1.03 ???
        // Wait, if Rate is 1000 ARS/USDT.
        // Item costs 1000 ARS.
        // I need 1 USDT + margin?
        // Let's check converter logic:
        // ARS -> USD: resBlue = (amount / rates.blue.compra) * marginFactor
        // Yes. So if I have 1000 ARS item, I ask for (1000/1000)*1.03 = 1.03 USDT.

        const totalUsdtRaw = (totalArs / rate) * marginFactor;
        const totalUsdt = Math.ceil(totalUsdtRaw * 2) / 2; // Round up to 0.50

        document.getElementById('usdt-rate-display').textContent = `$${rate.toFixed(2)} `;
        document.getElementById('usdt-total-display').textContent = `$${totalUsdt.toFixed(2)} `;

        // Change Calc
        const tenderedInput = document.getElementById('pm-usdt-tendered');
        let tendered = parseFloat(tenderedInput.value) || 0;

        if (init && tendered === 0) {
            // Suggest nearest 100
            tendered = Math.ceil(totalUsdt / 100) * 100;
            if (tendered === 0) tendered = 100;
            tenderedInput.value = tendered;
        }

        const changeUsd = tendered - totalUsdt;
        document.getElementById('usdt-change-usd').textContent = changeUsd.toFixed(2);

        // Change in ARS
        // changeArsWithMargin = changeUsd * rates.blue.compra * (1 - (margin / 100))
        // POS uses Crypto rate. So changeUsd * rate * (1 - margin/100) ??
        // Converter uses blue rate for change back to ARS usually?
        // "Change back to ARS: changeUsd * rates.blue.compra * (1 - (margin / 100))"
        // Since we are in USDT mode, maybe usdt rate?
        // Let's use the same rate (cripto.compra) for consistency if blue not available, but converter used Blue for change.
        // Let's use cripto rate since we are in crypto mode.

        const changeArs = changeUsd * rate * (1 - (margin / 100)); // Reverse margin logic? Deducting margin when buying back implies paying LESS.
        const formattedChangeArs = Math.max(0, changeArs).toLocaleString('es-AR', { maximumFractionDigits: 0 });

        document.getElementById('usdt-change-ars').textContent = `$${formattedChangeArs} `;
    },

    calcChange: () => {
        const cart = POS.getActiveCart();
        const total = cart.items.reduce((s, i) => s + (i.price * i.qty), 0);
        const tendered = parseFloat(document.getElementById('pm-tendered').value) || 0;

        const change = tendered - total;
        const changeEl = document.getElementById('pm-change-val');
        if (change >= 0) {
            changeEl.textContent = change.toFixed(0);
            changeEl.parentElement.style.color = 'var(--accent)';
        } else {
            changeEl.textContent = "0";
            changeEl.parentElement.style.color = '#ccc';
        }
    },

    submitOrder: async () => {
        if (POS.isProcessing) return; // Prevent double click

        const cart = POS.getActiveCart();
        if (cart.items.length === 0) {
            POS.showStatusMessage(POS.lang === 'RU' ? 'Корзина пуста!' : 'Cart Empty!', '#e74c3c');
            return;
        }

        POS.isProcessing = true; // Lock

        const btn = document.getElementById('btn-confirm-pay');
        const originalText = btn ? btn.innerHTML : '';

        if (btn) {
            btn.classList.add('processing');
            btn.disabled = true;
            // Wrap text in span if not already, for z-index
            if (!btn.querySelector('span')) {
                btn.innerHTML = `<span>${POS.t('processing')}</span>`;
            } else {
                btn.querySelector('span').textContent = POS.t('processing');
            }
        }

        let tendered = 0;
        let change = 0;

        if (POS.paymentMethod === 'usdt') {
            tendered = parseFloat(document.getElementById('pm-usdt-tendered').value) || 0;
            change = parseFloat(document.getElementById('usdt-change-usd').textContent) || 0;
        } else {
            tendered = parseFloat(document.getElementById('pm-tendered').value) || 0;
            change = parseFloat(document.getElementById('pm-change-val').textContent) || 0;
        }

        const orderData = {
            items: cart.items,
            customer_id: cart.customer ? cart.customer.id : 0,
            note: cart.note || '',
            payment_method: POS.paymentMethod,
            tendered: tendered,
            change: change,
            total: cart.items.reduce((s, i) => s + (i.price * i.qty), 0) // Explicitly add total
        };

        try {
            // Use WordPress AJAX URL
            const apiUrl = POS_API_URL + '?action=avoska_pos_create_order';
            console.log('[POS] Submitting order to:', apiUrl);

            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const text = await res.text();
            let ws;
            try {
                ws = JSON.parse(text);
            } catch (err) {
                console.error('[POS] JSON Parse Error. Response body:', text);
                throw new Error('Invalid Server Response');
            }

            if (ws.success) {
                // Show Receipt Modal (don't auto print)
                // We pass the order ID to the modal so the Print button knows what to print
                POS.openReceiptModal(ws.data.order_id, orderData);

                POS.showStatusMessage(POS.t('order_created'), '#2ecc71');

                // Play Success Sound
                POS.playSuccess();

                // Remove cart if there are multiple, else clear it
                if (POS.carts.length > 1) {
                    const idx = POS.carts.findIndex(c => c.id === POS.activeCartId);
                    POS.carts = POS.carts.filter(c => c.id !== POS.activeCartId);
                    const newIdx = Math.max(0, idx - 1);
                    POS.activeCartId = POS.carts[newIdx].id;
                } else {
                    cart.items = [];
                    cart.customer = null;
                }

                POS.saveState();
                POS.renderTabs();
                POS.updateCartUI();
                POS.closeModal('modal-checkout');
            } else {
                alert('Error: ' + ws.data.message);
            }
        } catch (e) {
            console.error('[POS] Network error:', e);
            alert(POS.t('network_error'));
        } finally {
            POS.isProcessing = false; // Unlock
            if (btn) {
                btn.classList.remove('processing');
                btn.disabled = false;
                // Restore original text/icon if needed, or re-render
                if (!btn.querySelector('span')) {
                    btn.innerHTML = POS.t('btn_confirm');
                } else {
                    btn.querySelector('span').textContent = POS.t('btn_confirm');
                }
            }
        }
    },

    // Auto-close timer ID (to cancel if user closes manually)
    _receiptTimerId: null,
    _receiptAnimFrameId: null,

    closeReceiptModal: () => {
        // Clear timers
        if (POS._receiptTimerId) { clearTimeout(POS._receiptTimerId); POS._receiptTimerId = null; }
        if (POS._receiptAnimFrameId) { cancelAnimationFrame(POS._receiptAnimFrameId); POS._receiptAnimFrameId = null; }
        POS.closeModal('modal-receipt');
    },

    openReceiptModal: (orderId, orderData) => {
        const modal = document.getElementById('modal-receipt');
        if (!modal) return;

        // Clear any previous timer
        if (POS._receiptTimerId) { clearTimeout(POS._receiptTimerId); POS._receiptTimerId = null; }
        if (POS._receiptAnimFrameId) { cancelAnimationFrame(POS._receiptAnimFrameId); POS._receiptAnimFrameId = null; }

        // Store Order ID on the print button
        const printBtn = modal.querySelector('.btn-print');
        if (printBtn) {
            printBtn.onclick = () => POS.printReceiptPopup(orderId);
        }

        // Re-bind close buttons to use our closeReceiptModal (which clears timers)
        const closeX = modal.querySelector('.close-modal');
        if (closeX) closeX.onclick = () => POS.closeReceiptModal();
        const closeBtn = modal.querySelector('.btn-close');
        if (closeBtn) closeBtn.onclick = () => POS.closeReceiptModal();

        // Generate Preview with Items List
        const preview = document.getElementById('receipt-preview-area');
        if (preview) {
            // Build items table
            let itemsHtml = '';
            if (orderData.items && orderData.items.length > 0) {
                itemsHtml += '<table style="width:100%; border-collapse:collapse; margin-top:12px;">';
                orderData.items.forEach(item => {
                    itemsHtml += `
                        <tr style="border-bottom:1px solid #f0f0f0;">
                            <td style="padding:6px 0; font-size:14px; color:#2c3e50; white-space:nowrap; vertical-align:top;">${item.qty} × ${item.name}</td>
                            <td style="padding:6px 0; font-size:14px; color:#2c3e50; text-align:right; white-space:nowrap; font-variant-numeric:tabular-nums; vertical-align:top; padding-left:15px;">${POS.formatPrice(item.price * item.qty)}</td>
                        </tr>
                    `;
                });
                itemsHtml += '</table>';
            }

            // Calculate Discount/Surcharge
            let regularTotal = 0;
            orderData.items.forEach(i => {
                let orig = i.original_price !== undefined ? i.original_price : i.price;
                regularTotal += orig * i.qty;
            });

            let total = orderData.total || 0;
            let diff = total - regularTotal;

            let breakdownHtml = '';

            if (Math.abs(diff) > 0.01) {
                breakdownHtml += `<div style="display:flex; justify-content:space-between; font-size:14px; margin-top:5px; color:#7f8c8d;">
                    <span>${POS.t('subtotal')}:</span>
                    <span style="font-variant-numeric:tabular-nums;">${POS.formatPrice(regularTotal)}</span>
                 </div>`;

                if (diff < 0) {
                    breakdownHtml += `<div style="display:flex; justify-content:space-between; font-size:14px; color:#27ae60;">
                        <span>${POS.t('discount')}:</span>
                        <span style="font-variant-numeric:tabular-nums;">${POS.formatPrice(diff)}</span>
                     </div>`;
                } else {
                    breakdownHtml += `<div style="display:flex; justify-content:space-between; font-size:14px; color:#e67e22;">
                        <span>${POS.t('surcharge')}:</span>
                        <span style="font-variant-numeric:tabular-nums;">+${POS.formatPrice(diff)}</span>
                     </div>`;
                }

                breakdownHtml += `<div style="border-top: 1px dashed #ccc; margin:5px 0;"></div>`;
            }

            preview.innerHTML = `
                <div style="padding: 15px 10px;">
                    <div style="display:flex; align-items:center; justify-content:center; gap:12px; margin-bottom:12px;">
                        <span style="font-size:28px; line-height:1;">✅</span>
                        <h3 style="margin:0; font-size:20px; color:#2c3e50;">${POS.t('order_created')} #${orderId}</h3>
                    </div>

                    <div style="border-top:1px solid #eee; padding-top:10px;">
                        ${itemsHtml}
                    </div>

                    <div style="margin-top:12px; text-align:left;">
                        ${breakdownHtml}
                        <div style="display:flex; justify-content:space-between; font-size:22px; font-weight:bold; color:var(--accent); padding-top:8px; border-top:2px solid #eee; margin-top:8px;">
                            <span>${POS.t('total')}:</span>
                            <span style="font-variant-numeric:tabular-nums;">${POS.formatPrice(total)}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        modal.classList.remove('hidden');

        // --- Auto-close timer (10 seconds) with progress bar ---
        const AUTOCLOSE_MS = 10000;
        const progressBar = modal.querySelector('.receipt-autoclose-bar');
        if (progressBar) {
            progressBar.style.width = '100%';
            const startTime = performance.now();

            const animate = (now) => {
                const elapsed = now - startTime;
                const remaining = Math.max(0, 1 - elapsed / AUTOCLOSE_MS);
                progressBar.style.width = (remaining * 100) + '%';
                if (remaining > 0) {
                    POS._receiptAnimFrameId = requestAnimationFrame(animate);
                }
            };
            POS._receiptAnimFrameId = requestAnimationFrame(animate);
        }

        POS._receiptTimerId = setTimeout(() => {
            POS.closeReceiptModal();
        }, AUTOCLOSE_MS);
    },

    printReceiptPopup: (orderId) => {
        // Open the server-side receipt template in a new small window/popup
        const url = POS_API_URL + '?action=avoska_pos_print_receipt&order_id=' + orderId;
        const opts = 'width=400,height=600,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes';

        // Open popup
        const printWin = window.open(url, 'PrintReceipt', opts);

        if (printWin) {
            printWin.focus();
        } else {
            alert(POS.t('receipt_error', 'Allow popups to print receipt'));
        }
    },
    // --- SHORTCUTS ---
    initShortcuts: () => {
        let barcodeBuffer = '';
        let barcodeTimeout = null;

        document.addEventListener('keydown', (e) => {
            // Function Keys Mapping
            if (e.key === 'F1') { e.preventDefault(); POS.openCustomProductModal(); return; }
            if (e.key === 'F2') { e.preventDefault(); switchView('register'); return; }
            if (e.key === 'F3') { e.preventDefault(); switchView('history'); return; }
            if (e.key === 'F4') { e.preventDefault(); POS.clearCart(); return; }
            if (e.key === 'F10') { e.preventDefault(); POS.openCheckout(); return; }

            // Global Barcode Scanner Interceptor
            // Ignore if user is already typing in an input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // Character Accumulation
            if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                barcodeBuffer += e.key;
                clearTimeout(barcodeTimeout);
                // Barcode scanners type very fast. Reset buffer after 100ms of inactivity.
                barcodeTimeout = setTimeout(() => { barcodeBuffer = ''; }, 100);
            }
            // Enter triggers the scan if buffer looks like a barcode (length > 3)
            else if (e.key === 'Enter' && barcodeBuffer.length >= 3) {
                e.preventDefault();
                const code = barcodeBuffer;
                barcodeBuffer = '';

                // Ensure we are in register view
                if (document.getElementById('view-register').classList.contains('hidden')) {
                    switchView('register');
                }

                const searchInput = document.getElementById('pos-search');
                if (searchInput) {
                    searchInput.value = code;

                    // Attempt direct scan, otherwise trigger normal search with results
                    if (POS.scanProduct(code)) {
                        searchInput.value = '';
                        POS.renderGrid('');
                        POS.toggleClearBtn();
                    } else {
                        POS.search(code);
                        POS.toggleClearBtn();
                    }
                }
            }
        });

        const input = document.getElementById('pos-search');
        if (input) {
            input.addEventListener('input', (e) => {
                POS.search(e.target.value);
                POS.toggleClearBtn();
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && input.value.trim()) {
                    if (POS.scanProduct(input.value.trim())) {
                        input.value = '';
                        POS.renderGrid('');
                        POS.toggleClearBtn();
                    }
                }
            });
            // Barcode scanner: clear on focus if there's old text
            input.addEventListener('focus', () => {
                if (input.value.length > 0) {
                    input.select();
                }
            });
        }
    },

    // --- UTILS ---
    switchMobileTab: (tabName) => {
        const root = document.getElementById('avoska-pos-root');
        document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
        document.getElementById('tab-' + tabName).classList.add('active');

        if (tabName === 'cart') {
            root.classList.add('mobile-cart-active');
        } else {
            root.classList.remove('mobile-cart-active');
        }
    },
    openCustomProductModal: () => {
        document.getElementById('modal-custom-product').classList.remove('hidden');
        setTimeout(() => document.getElementById('custom-price').focus(), 100);
    },
    addCustomProduct: (e) => {
        e.preventDefault();
        const p = document.getElementById('custom-price').value;
        const n = document.getElementById('custom-name').value;
        if (p) POS.addToCart({ name: n || 'Custom', price: p }, true);
        POS.closeModal('modal-custom-product');
    },
    closeModal: (id) => document.getElementById(id).classList.add('hidden'),

    // --- PRODUCT EDITOR ---
    editingProductId: null,

    searchProductForEdit: (term) => {
        const resultsEl = document.getElementById('pe-results');
        if (!resultsEl) return;

        const t = (term || '').trim().toLowerCase();
        if (t.length < 1) {
            resultsEl.innerHTML = `<div style="color:#aaa; text-align:center; padding:40px;" data-i18n="edit_search_hint">${POS.t('edit_search_hint')}</div>`;
            return;
        }

        const matches = POS.products.filter(p => {
            const name = (p.name || '').toLowerCase();
            const sku = (p.sku || '').toLowerCase();
            const ean = (p.ean || '').toLowerCase();
            return name.includes(t) || sku.includes(t) || ean.includes(t);
        }).slice(0, 30);

        if (matches.length === 0) {
            resultsEl.innerHTML = `<div style="color:#aaa; text-align:center; padding:40px;">🔍 —</div>`;
            return;
        }

        resultsEl.innerHTML = matches.map(p => `
            <div class="pe-result-card ${POS.editingProductId === p.id ? 'active' : ''}" onclick="POS.selectProductForEdit(${p.id})">
                <img src="${p.image || ''}" onerror="this.style.display='none'">
                <div>
                    <div class="pe-result-name">${p.name}</div>
                    <div class="pe-result-meta">SKU: ${p.sku || '—'} | EAN: ${p.ean || '—'} | $${(p.price || 0).toFixed(0)} | Stock: ${p.stock ?? '—'}</div>
                </div>
            </div>
        `).join('');
    },

    selectProductForEdit: (productId) => {
        const pid = parseInt(productId);
        const p = POS.products.find(x => parseInt(x.id) === pid);
        if (!p) return;

        POS.editingProductId = productId;
        const dict = POS.i18n[POS.lang];

        // Show form
        const form = document.getElementById('pe-form-container');
        if (form) form.style.display = 'block';

        // Header
        document.getElementById('pe-product-image').src = p.image || '';
        document.getElementById('pe-product-id').textContent = `ID: ${p.id}`;
        document.getElementById('pe-product-sku').textContent = `SKU: ${p.sku || '—'}`;

        // Fields
        document.getElementById('pe-name').value = p.name || '';
        document.getElementById('pe-regular-price').value = p.regular_price || p.price || 0;
        document.getElementById('pe-sale-price').value = p.sale_price != null ? p.sale_price : '';
        document.getElementById('pe-cost').value = p.cost || 0;
        document.getElementById('pe-stock').value = p.stock != null ? p.stock : '';
        document.getElementById('pe-ean').value = p.ean || '';

        // Category dropdown
        const catSel = document.getElementById('pe-category');
        catSel.innerHTML = `<option value="">${dict.edit_no_category}</option>`;
        POS.filterData.categories.forEach(c => {
            const selected = (p.cat_ids && p.cat_ids.includes(c.id)) ? 'selected' : '';
            catSel.innerHTML += `<option value="${c.id}" ${selected}>${c.name}</option>`;
        });

        // Brand dropdown
        const bSel = document.getElementById('pe-brand');
        bSel.innerHTML = `<option value="">${dict.edit_no_brand}</option>`;
        POS.filterData.brands.forEach(b => {
            const selected = (p.brand_ids && p.brand_ids.includes(b.id)) ? 'selected' : '';
            bSel.innerHTML += `<option value="${b.id}" ${selected}>${b.name}</option>`;
        });

        // Tag dropdown
        const tSel = document.getElementById('pe-tag');
        tSel.innerHTML = `<option value="">${dict.edit_no_tag}</option>`;
        POS.filterData.tags.forEach(t => {
            const selected = (p.tag_ids && p.tag_ids.includes(t.id)) ? 'selected' : '';
            tSel.innerHTML += `<option value="${t.id}" ${selected}>${t.name}</option>`;
        });

        // Visibility dropdown
        const visSel = document.getElementById('pe-visibility');
        visSel.innerHTML = `
            <option value="visible" ${p.catalog_visibility === 'visible' ? 'selected' : ''}>${dict.edit_vis_visible}</option>
            <option value="catalog" ${p.catalog_visibility === 'catalog' ? 'selected' : ''}>${dict.edit_vis_catalog}</option>
            <option value="search" ${p.catalog_visibility === 'search' ? 'selected' : ''}>${dict.edit_vis_search}</option>
            <option value="hidden" ${p.catalog_visibility === 'hidden' ? 'selected' : ''}>${dict.edit_vis_hidden}</option>
        `;

        // Reset save status
        const status = document.getElementById('pe-save-status');
        if (status) status.textContent = '';

        // Highlight in results
        document.querySelectorAll('.pe-result-card').forEach(c => c.classList.remove('active'));
        const cards = document.querySelectorAll('.pe-result-card');
        cards.forEach(c => {
            if (c.getAttribute('onclick') === `POS.selectProductForEdit(${productId})`) {
                c.classList.add('active');
            }
        });
    },

    saveProductEdit: async () => {
        if (!POS.editingProductId) return;
        const dict = POS.i18n[POS.lang];
        const statusEl = document.getElementById('pe-save-status');
        const saveBtn = document.getElementById('pe-save-btn');

        if (statusEl) { statusEl.textContent = dict.edit_saving; statusEl.style.color = '#f39c12'; }
        if (saveBtn) saveBtn.disabled = true;

        const saleVal = document.getElementById('pe-sale-price').value;
        const catVal = document.getElementById('pe-category').value;
        const brandVal = document.getElementById('pe-brand').value;
        const tagVal = document.getElementById('pe-tag').value;

        const payload = {
            id: POS.editingProductId,
            name: document.getElementById('pe-name').value,
            regular_price: parseFloat(document.getElementById('pe-regular-price').value) || 0,
            sale_price: saleVal !== '' ? parseFloat(saleVal) : null,
            cost: parseFloat(document.getElementById('pe-cost').value) || 0,
            stock: parseInt(document.getElementById('pe-stock').value) || 0,
            cat_ids: catVal ? [parseInt(catVal)] : [],
            brand_id: brandVal ? parseInt(brandVal) : 0,
            tag_ids: tagVal ? [parseInt(tagVal)] : [],
            catalog_visibility: document.getElementById('pe-visibility').value,
            ean: document.getElementById('pe-ean').value
        };

        try {
            const res = await fetch(POS_API_URL + '?action=avoska_pos_api_handler&_wpnonce=' + POS_NONCE + '&avoska_pos_action=update_product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success && data.data.product) {
                // Update local cache
                const updated = data.data.product;
                const idx = POS.products.findIndex(p => p.id === updated.id);
                if (idx !== -1) {
                    POS.products[idx] = updated;
                }
                // Update localStorage
                const toSave = { products: POS.products, filters: POS.filterData };
                localStorage.setItem('avoska_pos_products', JSON.stringify(toSave));

                if (statusEl) { statusEl.textContent = dict.edit_saved; statusEl.style.color = '#27ae60'; }

                // Refresh grid if on register view
                POS.renderGrid();

                // Re-search to update results
                const searchVal = document.getElementById('pe-search-input').value;
                if (searchVal) POS.searchProductForEdit(searchVal);
            } else {
                const msg = data.data && data.data.message ? data.data.message : 'Error';
                if (statusEl) { statusEl.textContent = '❌ ' + msg; statusEl.style.color = '#e74c3c'; }
            }
        } catch (e) {
            if (statusEl) { statusEl.textContent = '❌ ' + e.message; statusEl.style.color = '#e74c3c'; }
        }

        if (saveBtn) saveBtn.disabled = false;
    },

    cancelProductEdit: () => {
        POS.editingProductId = null;
        const form = document.getElementById('pe-form-container');
        if (form) form.style.display = 'none';
        const status = document.getElementById('pe-save-status');
        if (status) status.textContent = '';
    },

    // --- ORDER NOTES ---
    openNoteModal: () => {
        const cart = POS.getActiveCart();
        if (!cart) return;
        const inp = document.getElementById('order-note-input');
        if (inp) inp.value = cart.note || '';
        document.getElementById('modal-order-note').classList.remove('hidden');
    },

    saveOrderNote: () => {
        const cart = POS.getActiveCart();
        if (!cart) return;
        const inp = document.getElementById('order-note-input');
        if (inp) cart.note = inp.value.trim();
        POS.saveState();
        POS.closeModal('modal-order-note');
        POS.showStatusMessage('Заметка сохранена', '#8e44ad');
    },

    // --- DISCOUNT ---
    openDiscountModal: () => {
        const cart = POS.getActiveCart();
        if (!cart || cart.items.length === 0) {
            alert('Корзина пуста');
            return;
        }
        const inp = document.getElementById('discount-custom-val');
        if (inp) inp.value = '';
        document.getElementById('modal-discount').classList.remove('hidden');
    },

    applyDiscount: (percent) => {
        if (!percent || isNaN(percent) || percent <= 0 || percent >= 100) {
            alert('Укажите скидку от 1 до 99%');
            return;
        }
        const cart = POS.getActiveCart();
        if (!cart) return;
        const multiplier = 1 - (percent / 100);
        cart.items.forEach(item => {
            const base = item.original_price || item.price;
            item.price = Math.round(base * multiplier * 100) / 100;
        });
        POS.saveState();
        POS.updateCartUI();
        POS.closeModal('modal-discount');
        POS.showStatusMessage(`Скидка ${percent}% применена`, '#27ae60');
    },

    applyDiscountCost: () => {
        const cart = POS.getActiveCart();
        if (!cart) return;
        let changed = 0;
        cart.items.forEach(item => {
            if (item.is_custom) return;
            const prod = POS.products.find(p => p.id === item.id);
            if (prod && prod.cost && prod.cost > 0) {
                item.price = parseFloat(prod.cost);
                changed++;
            }
            // If no cost, keep current price
        });
        POS.saveState();
        POS.updateCartUI();
        POS.closeModal('modal-discount');
        POS.showStatusMessage(`Себестоимость: ${changed} товаров`, '#8e44ad');
    },

    resetDiscount: () => {
        const cart = POS.getActiveCart();
        if (!cart) return;
        cart.items.forEach(item => {
            if (item.original_price) {
                item.price = item.original_price;
            }
        });
        POS.saveState();
        POS.updateCartUI();
        POS.closeModal('modal-discount');
        POS.showStatusMessage('Скидки сброшены', '#e67e22');
    },

    toggleLang: (e) => {
        POS.lang = POS.lang === 'RU' ? 'ARG' : 'RU';
        // Update button text if passed
        if (document.querySelector('.nav-btn[onclick="POS.toggleLang()"]')) {
            document.querySelector('.nav-btn[onclick="POS.toggleLang()"]').textContent = POS.lang;
        }
        POS.applyLang();
    },
    applyLang: () => {
        const dict = POS.i18n[POS.lang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const k = el.getAttribute('data-i18n');
            if (dict[k]) el.textContent = dict[k];
        });
        // Placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const k = el.getAttribute('data-i18n-placeholder');
            if (dict[k]) el.placeholder = dict[k];
        });
        const s = document.getElementById('pos-search');
        if (s) s.placeholder = dict.search_placeholder;

        const langBtn = document.querySelector('.lang-switch-btn');
        if (langBtn) langBtn.textContent = POS.lang;

        // Re-render chart with new day names
        if (POS.weeklyCache) POS.renderChart(POS.weeklyCache);

        // Re-render visibility options if editor is open
        if (POS.editingProductId) {
            const visSel = document.getElementById('pe-visibility');
            if (visSel) {
                const currentVal = visSel.value;
                visSel.innerHTML = `
                    <option value="visible" ${currentVal === 'visible' ? 'selected' : ''}>${dict.edit_vis_visible}</option>
                    <option value="catalog" ${currentVal === 'catalog' ? 'selected' : ''}>${dict.edit_vis_catalog}</option>
                    <option value="search" ${currentVal === 'search' ? 'selected' : ''}>${dict.edit_vis_search}</option>
                    <option value="hidden" ${currentVal === 'hidden' ? 'selected' : ''}>${dict.edit_vis_hidden}</option>
                `;
            }
        }
    },
    sendReport: async (type) => {
        if (!confirm(type === 'weekly' ? POS.t('report_confirm_weekly') : POS.t('report_confirm_daily'))) return;

        try {
            const formData = new FormData();
            formData.append('action', 'avoska_pos_api_handler');
            formData.append('avoska_pos_action', 'send_report'); // We need to map this in PHP handler or add direct hook
            formData.append('type', type);

            // NOTE: The PHP side used wp_ajax_avoska_pos_send_report directly, 
            // so we should call that action directly if possible, OR map it in avoska_pos_api_handler.
            // Let's call the direct ajax action for simplicity as implemented in PHP.

            const res = await fetch(POS_API_URL + '?action=avoska_pos_send_report', {
                method: 'POST',
                body: new URLSearchParams({
                    action: 'avoska_pos_send_report',
                    type: type
                })
            });
            const data = await res.json();

            if (data.success) {
                alert('✅ ' + data.data.message);
            } else {
                alert('❌ Ошибка: ' + (data.data.message || 'Unknown error'));
            }
        } catch (e) {
            alert('❌ Network Error: ' + e.message);
        }
    },
    initLang: () => { POS.applyLang(); },
    initResizer: () => {
        const resizer = document.getElementById('pos-resizer');
        const cartCol = document.getElementById('col-cart');

        // Init Schedule Widget if exists
        const statusBar = document.querySelector('.pos-status-bar');
        if (statusBar && typeof POS_SCHEDULE !== 'undefined') {
            let schedWidget = document.getElementById('pos-schedule-widget');
            if (!schedWidget) {
                schedWidget = document.createElement('div');
                schedWidget.id = 'pos-schedule-widget';
                schedWidget.style.marginRight = '15px';
                schedWidget.style.fontSize = '12px';
                schedWidget.innerHTML = `🕒 ${POS_SCHEDULE.start} - ${POS_SCHEDULE.end}`;
                // Insert before user info or clock
                statusBar.insertBefore(schedWidget, statusBar.firstChild);
            }
        }

        // Load saved width with validation
        const savedWidth = localStorage.getItem('pos_cart_width');

        if (savedWidth) {
            const w = parseFloat(savedWidth);
            const maxW = document.body.clientWidth * 0.8;
            if (!isNaN(w) && w > 300 && w < maxW) {
                cartCol.style.width = w + 'px';
            } else {
                localStorage.removeItem('pos_cart_width');
                cartCol.style.width = '50%';
            }
        } else {
            cartCol.style.width = '50%';
        }

        resizer.addEventListener('mousedown', (e) => {
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
        });

        function resize(e) {
            const w = document.body.clientWidth - e.clientX;
            const minW = 300;
            const maxW = document.body.clientWidth * 0.7; // Max 70% of screen

            if (w > minW && w < maxW) {
                cartCol.style.width = w + 'px';
            }
        }

        function stopResize() {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', resize);

            // Save width
            localStorage.setItem('pos_cart_width', cartCol.offsetWidth);
        }
    }
};

function switchView(viewName) {
    console.log('Switch to', viewName);
    document.querySelectorAll('.pos-view').forEach(v => v.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const target = document.getElementById('view-' + viewName);
    if (target) {
        target.classList.remove('hidden');
        // Find corresponding button
        const btn = document.querySelector(`.nav-btn[onclick*="${viewName}"]`);
        if (btn) btn.classList.add('active');

        if (viewName === 'history' || viewName === 'reports') POS.loadHistory();
        if (viewName === 'customers') POS.showStaffList(); // Default to staff tab
    }
}
document.addEventListener('DOMContentLoaded', POS.init);

