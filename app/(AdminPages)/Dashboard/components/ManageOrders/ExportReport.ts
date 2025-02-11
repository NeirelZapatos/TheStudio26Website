import { IOrder } from '@/app/models/Order';
import { saveAs } from 'file-saver';

// Refactored the export function to match the existing structure.
const exportOrdersToCSV = async (orders: IOrder[] = []): Promise<void> => {
    try {
        // Check if orders are available
        if (!Array.isArray(orders) || orders.length === 0) {
            console.error("No orders available to export.");
            alert("No orders available to export.");
            return;
        }

        // Create HTML content for Excel export
        const htmlContent = generateHTMLContent(orders);

        // Create blob and save file
        const blob = new Blob([htmlContent], { 
            type: 'application/vnd.ms-excel;charset=utf-8'
        });
        saveAs(blob, `orders_report_${new Date().toISOString().slice(0,10)}.xls`);

        console.log('Export completed');
        alert('Export completed');
    } catch (error) {
        console.error("Error exporting orders:", error);
        alert('Failed to export orders');
    }
};

// Generates the HTML content for exporting orders to Excel
const generateHTMLContent = (orders: IOrder[]): string => {
    let htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" 
              xmlns:x="urn:schemas-microsoft-com:office:excel" 
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <style>
                td, th {
                    mso-number-format:"\\@";  /* Force text format */
                    white-space: normal;
                    padding: 8px;
                    border: .5pt solid windowtext;
                }
                th {
                    font-weight: bold;
                    background: #f2f2f2;
                }
                .bold-text {
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <table border="1">
                <tr>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Customer Email</th>
                    <th>Order Date</th>
                    <th>Total Amount</th>
                    <th>Shipping Method</th>
                    <th>Payment Method</th>
                    <th>Order Status</th>
                    <th>Shipping Address</th>
                    <th>Billing Address</th>
                    <th>Product Names</th>
                    <th>Product Quantities</th>
                </tr>
    `;

    // Loop through each order and generate table rows
    htmlContent += orders.map(order => createOrderRow(order)).join('');

    htmlContent += `
            </table>
        </body>
        </html>
    `;

    return htmlContent;
};

// Generates a row of HTML for a single order
const createOrderRow = (order: IOrder): string => {
    const customerName = order.customer 
        ? `${order.customer.first_name} ${order.customer.last_name}`.trim()
        : '';
    const customerEmail = order.customer?.email || '';

    // Get product details with quantities
    const products = order.products || [];
    const productDetails = products.reduce((acc, curr) => {
        if (!acc[curr.product.name]) {
            acc[curr.product.name] = 0;
        }
        acc[curr.product.name] += curr.quantity;
        return acc;
    }, {} as Record<string, number>);

    const productNames = Object.keys(productDetails).join(', ');
    const productQuantities = Object.values(productDetails).join(', ');

    return `
        <tr>
            <td class="bold-text">${order._id.toString()}</td>
            <td class="bold-text">${customerName}</td>
            <td class="bold-text">${customerEmail}</td>
            <td class="bold-text">${new Date(order.order_date).toLocaleDateString('en-US')}</td>
            <td class="bold-text">$${order.total_amount.toFixed(2)}</td>
            <td class="bold-text">${order.shipping_method}</td>
            <td class="bold-text">${order.payment_method}</td>
            <td class="bold-text">${order.order_status}</td>
            <td class="bold-text">${order.shipping_address}</td>
            <td class="bold-text">${order.billing_address}</td>
            <td class="bold-text">${productNames}</td>
            <td class="bold-text">${productQuantities}</td>
        </tr>
    `;
};

export default exportOrdersToCSV;