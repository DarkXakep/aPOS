<?php
/**
 * Sales Receipt Template.
 *
 * This template can be overridden by copying it to yourtheme/woocommerce-pos/receipt.php.
 * HOWEVER, this is not recommended , don't be surprised if your POS breaks
 */

if (!\defined('ABSPATH')) {
	exit; // Exit if accessed directly
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
	<meta charset="<?php bloginfo('charset'); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style>
		@page {
			margin: 0;
		}

		html,
		body {
			font-family: "Courier New", Courier, monospace;
			font-size: 11px;
			margin: 0;
			padding: 0;
			width: 58mm;
			color: #000;
		}

		.sales-receipt {
			padding: 2mm;
			width: 54mm;
			margin: 0 auto;
		}

		.header,
		.footer {
			text-align: center;
			margin-bottom: 5px;
		}

		.header h1 {
			font-size: 16px;
			text-transform: uppercase;
			margin: 0;
		}

		.store-info {
			font-size: 10px;
			line-height: 1.2;
			text-align: left;
			margin-bottom: 10px;
		}

		.doc-type {
			text-align: center;
			font-weight: bold;
			margin: 5px 0;
		}

		.order-meta {
			display: flex;
			justify-content: space-between;
			margin-bottom: 5px;
		}

		.separator {
			border-top: 1px dashed #000;
			margin: 5px 0;
		}

		.customer-details {
			margin-bottom: 10px;
			font-size: 10px;
		}

		table {
			width: 100%;
			border-collapse: collapse;
			font-size: 10px;
		}

		table th {
			text-align: left;
			border-bottom: none;
			padding: 2px 0;
		}

		table td {
			padding: 2px 0;
			vertical-align: top;
		}

		.item-row .qty-price {
			display: block;
			font-size: 9px;
		}

		.item-row .name-total {
			display: flex;
			justify-content: space-between;
		}

		.item-row .name {
			max-width: 70%;
			word-wrap: break-word;
		}

		.totals {
			margin-top: 10px;
		}

		.totals-row {
			display: flex;
			justify-content: space-between;
			font-weight: bold;
			font-size: 12px;
			margin-bottom: 2px;
		}

		.totals-row.recibi {
			margin-top: 5px;
			font-size: 10px;
		}

		.totals-row.payment-method,
		.totals-row.change {
			font-size: 11px;
		}

		.qr-code {
			text-align: center;
			margin: 10px 0;
		}

		.qr-code img {
			max-width: 40mm;
		}

		.footer-info {
			font-size: 9px;
			display: flex;
			justify-content: space-between;
		}
	</style>
	<?php
	/**
	 * IMPORTANT!
	 * This hook adds the javascript to print the receipt.
	 */
	do_action('woocommerce_pos_receipt_head');
	
    // Helper function for formatting
    function avoska_pos_fmt($amount, $decimals = 2) {
        $formatted = number_format((float) $amount, $decimals, '.', '');
        // Remove trailing zeros and decimal point if integer
        // echo $formatted . " -> " . (float)$formatted; 
        // But casting to float might lose precision for crypto? No, receipt is currency.
        // Better string manipulation:
        if (strpos($formatted, '.') !== false) {
            $formatted = rtrim(rtrim($formatted, '0'), '.');
        }
        return $formatted;
    }
	?>
    <script>
        window.onload = function() {
            window.print();
            // Optional: Close after print (commented out for safety)
            // setTimeout(function(){ window.close(); }, 500);
        }
    </script>
</head>

<body <?php body_class(); ?>>
	<div class="sales-receipt">
		<div class="header">
			<div class="store-info">
			<?php
			$r_store  = get_option('avoska_pos_receipt_store_name', 'AVOSKA');
			$r_owner  = get_option('avoska_pos_receipt_owner', 'DZUTSEV DAVID');
			$r_phone  = get_option('avoska_pos_receipt_phone', '116210-7411');
			$r_cuit   = get_option('avoska_pos_receipt_cuit', '27631600994');
			$r_addr   = get_option('avoska_pos_receipt_address', 'HIPOLITO YRIGOYEN 2000');
			$r_city   = get_option('avoska_pos_receipt_city', 'CABA. CP1089');
			$r_start  = get_option('avoska_pos_receipt_start_date', '01/11/2025');
			$r_tax    = get_option('avoska_pos_receipt_tax_type', 'Responsable Monotributo');
			?>
			<?= esc_html($r_store) ?><br>
			TEL: <?= esc_html($r_phone) ?><br>
			<?= esc_html($r_owner) ?><br>
			C.U.I.T. Nro.: <?= esc_html($r_cuit) ?><br>
			Ing. Brutos: <?= esc_html($r_cuit) ?><br>
			<?= esc_html($r_addr) ?><br>
			<?= esc_html($r_city) ?><br>
			147 TELEFONO GRATUITO CABA AREA<br>
			DE DEFENSA Y PROTECCION AL CONSUMIDOR<br>
			Inicio de Actividades: <?= esc_html($r_start) ?><br>
			<?= esc_html($r_tax) ?>
			</div>

			<div class="separator"></div>

			<div class="doc-type">
				Cod. 111 - TIQUE FACTURA "C"
			</div>

			<div class="order-meta">
				<div class="order-num">№ <?php echo esc_html($order->get_order_number()); ?></div>
			</div>

			<div class="order-meta">
				<div class="date">Fecha:
					<?php echo esc_html(wc_format_datetime($order->get_date_created(), 'd/m/Y')); ?>
				</div>
				<div class="time">Hora: <?php echo esc_html(wc_format_datetime($order->get_date_created(), 'H:i:s')); ?>
				</div>
			</div>
		</div>

		<div class="separator"></div>

		<div class="customer-details">
			<?php if ($order->get_billing_first_name()): ?>
				<?php echo esc_html(strtoupper($order->get_billing_first_name() . ' ' . $order->get_billing_last_name())); ?><br>
			<?php else: ?>
				CONSUMIDOR FINAL<br>
			<?php endif; ?>

			<?php
			$dni = $order->get_meta('_billing_dni') ?: $order->get_meta('dni');
			if ($dni): ?>
				D.N.I.: <?php echo esc_html($dni); ?><br>
			<?php else: ?>
				D.N.I.: 99999999<br>
			<?php endif; ?>

			A Consumidor Final<br>
			Domicilio
		</div>

		<div class="separator"></div>

		<div class="items-table">
			<table>
				<thead>
					<tr>
						<th colspan="2">Cantidad/Precio Unit.</th>
					</tr>
					<tr>
						<th>Descripción</th>
						<th style="text-align: right;">Importe</th>
					</tr>
				</thead>
				<tbody>
					<?php
					foreach ($order->get_items() as $item_id => $item) {
						$product = $item->get_product();
                        // Qty: 3 decimals max, trim zeros
						$qty = avoska_pos_fmt($item->get_quantity(), 3);
                        // Unit Price: 2 decimals, trim zeros
						$price = \is_object($product) && method_exists($product, 'get_price') ? avoska_pos_fmt($product->get_price(), 2) : '0';
						?>
						<tr class="item-row">
							<td colspan="2">
								<span class="qty-price"><?php echo esc_html($qty . '/' . $price); ?></span>
								<div class="name-total">
									<span class="name"><?php echo esc_html(strtoupper($item->get_name())); ?></span>
									<span
										class="total"><?php echo avoska_pos_fmt($item->get_total(), 2); ?></span>
								</div>
								<?php wc_display_item_meta($item); ?>
							</td>
						</tr>
					<?php } ?>
				</tbody>
			</table>
		</div>

		<div class="separator"></div>

		<div class="totals">
			<?php
			$regular_total = 0;
			$order_total = (float) $order->get_total();
			
			foreach ($order->get_items() as $item) {
				$product = $item->get_product();
				$qty = (float) $item->get_quantity();
				if ($product) {
					$reg_price = (float) $product->get_price();
					$regular_total += $reg_price * $qty;
				} else {
					$regular_total += (float) $item->get_total(); // Fallback
				}
			}

			$diff = $order_total - $regular_total;
			$has_diff = abs($diff) > 0.01;

			if ($has_diff) {
				?>
				<div class="totals-row">
					<span>SUBTOTAL</span>
					<span><?php echo avoska_pos_fmt($regular_total); ?></span>
				</div>
				<?php
				if ($diff < 0) {
					?>
					<div class="totals-row">
						<span>DESCUENTO</span>
						<span><?php echo avoska_pos_fmt($diff); ?></span>
					</div>
					<?php
				} else {
					?>
					<div class="totals-row">
						<span>RECARGO</span>
						<span>+<?php echo avoska_pos_fmt($diff); ?></span>
					</div>
					<?php
				}
			}
			?>

			<div class="totals-row">
				<span>TOTAL</span>
				<span><?php echo avoska_pos_fmt($order_total); ?></span>
			</div>

			<div class="totals-row recibi">
				<span>RECIBI(MOS)</span>
				<span></span>
			</div>

			<?php
			$amount_tendered = $order->get_meta('_pos_tendered'); // Fixed Key: _pos_tendered
			$change_given = $order->get_meta('_pos_change'); // Fixed Key: _pos_change
			$payment_title = $order->get_payment_method_title();
			// Force Spanish Payment Titles
			// Force Spanish Payment Titles
			if (empty($payment_title) || stripos($payment_title, 'наличные') !== false || stripos($payment_title, 'cash') !== false) {
				$payment_title = 'EFECTIVO';
			} elseif (stripos($payment_title, 'карта') !== false || stripos($payment_title, 'card') !== false || stripos($payment_title, 'перевод') !== false || stripos($payment_title, 'transfer') !== false) {
				$payment_title = 'TARJETA'; // Or "TARJETA/TRANSFERENCIA"
			} elseif (stripos($payment_title, 'usdt') !== false) {
				$payment_title = 'USDT';
			} elseif (stripos($payment_title, 'alias') !== false || stripos($payment_title, 'cbu') !== false || stripos($payment_title, 'cvu') !== false) {
				$payment_title = 'ALIAS';
			} else {
				$payment_title = strtoupper($payment_title);
			}
            
            // Ensure title is consistent
            if ($payment_title === 'НАЛИЧНЫЕ') $payment_title = 'EFECTIVO'; // Double check unicode
			?>

			<div class="totals-row payment-method">
				<span><?php echo esc_html($payment_title); ?></span>
				<span><?php echo $amount_tendered ? avoska_pos_fmt($amount_tendered) : avoska_pos_fmt($order->get_total()); ?></span>
			</div>

			<div class="totals-row change">
				<span>CAMBIO</span>
				<span><?php echo $change_given ? avoska_pos_fmt($change_given) : '0'; ?></span>
			</div>
		</div>

		<div class="qr-code">
			<?php
			// Static QR code for AFIP as a Base64 data URI for maximum reliability
			$qr_base64 = 'iVBORw0KGgoAAAANSUhEUgAAAMgAAADIAQMAAACXljzdAAAABlBMVEX///8AAABVwtN+AAAACXBIWXMAAA7EAAAOxAGVKw4bAAABoUlEQVRYhc2XMRLDIAwERcUz+Cngn/oZrkx0d3jiFKklJkOAdaGRdEKY/R1j+TitnuNqvvDtrDi6E5Du9tWzV4d+dpYLWz/rGUhdt5aY2wGr3fYzDxnwpZvc5rPNQ9yRBbuGOOchjLan4Q13ntq+8iCSSCW9vn9v/UQSjeIJCEvbuux3RJKB8K7lHqVKnLt3D0/JDATTDvhiMh4ohPB1OHF9KMiF+sDaHYzPExAp4yfs8m486YQec6/Hi9598jEFkQsXih+ycjIl7wQEOUj5FhQ/22GnXMIJbgyo1iTfwpvWGO1wwjhDvnLkVKUx1Z1w4sdyZ1Nnx4u33QkIr1Y1UF6MUWz04UxAxm5M1HjC3qWAJyBc+j9qDPWxvTsTEJVkNemdopmvaEeTxi7Adg7S9qU8CCd1sR+BgtUCqHO3JASWshFgDzVgtV5gwUQD9uqYZ+PbGkQS2EiTn2jzlbP70WDCyiePom86KGLevQnI81Q1VDvrP3mQhDyO3IVZKslBrn2nFT76j11dool9X9WTajaqxBIQqYQzms3jKTMzAfk7PsNQeKD1dK6DAAAAAElFTkSuQmCC';
			?>
			<img src="data:image/png;base64,<?php echo $qr_base64; ?>" alt="QR AFIP"
				style="width: 35mm; height: 35mm; display: block; margin: 0 auto;">

			<?php
			do_action('woocommerce_pos_receipt_footer_qr', $order);
			?>
		</div>

		<div class="footer-info">
			<span><?php echo esc_html($order->get_order_key()); ?></span>
			<span>V: 02.00</span>
		</div>
	</div>

</body>

</html>
