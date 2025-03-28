import { IOrder } from '@/app/models/Order'; // Import the IOrder interface from the Order model
import { saveAs } from 'file-saver'; // Import saveAs from file-saver for saving files

// Export orders to a CSV file
const exportOrdersToCSV = async (orders: IOrder[] = []): Promise<void> => {
    try {
        // Check if orders are available
        if (!Array.isArray(orders) || orders.length === 0) {
            console.error("No orders available to export."); // Log an error if no orders are available
            alert("No orders available to export."); // Show an alert to the user
            return;
        }

        // Create HTML content for Excel export
        const htmlContent = generateHTMLContent(orders); // Generate HTML content for the orders

        // Create blob and save file
        const blob = new Blob([htmlContent], { 
            type: 'application/vnd.ms-excel;charset=utf-8' // Set the blob type to Excel
        });
        saveAs(blob, `orders_report_${new Date().toISOString().slice(0,10)}.xls`); // Save the blob as an Excel file

        console.log('Export completed'); // Log that the export is completed
        alert('Export completed'); // Show an alert to the user
    } catch (error) {
        console.error("Error exporting orders:", error); // Log any errors during export
        alert('Failed to export orders'); // Show an alert to the user
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
    htmlContent += orders.map(order => createOrderRow(order)).join(''); // Add rows for each order

    htmlContent += `
            </table>
        </body>
        </html>
    `;

    return htmlContent; // Return the generated HTML content
};

// Generates a row of HTML for a single order
const createOrderRow = (order: IOrder): string => {
    const customerName = order.customer 
        ? `${order.customer.first_name} ${order.customer.last_name}`.trim() // Get customer name
        : '';
    const customerEmail = order.customer?.email || ''; // Get customer email

    // Get product details with quantities
    const products = order.products || [];
    const productDetails = products.reduce((acc, curr) => {
        if (!acc[curr.product.name]) {
            acc[curr.product.name] = 0; // Initialize product quantity if not already present
        }
        acc[curr.product.name] += curr.quantity; // Add product quantity
        return acc;
    }, {} as Record<string, number>);

    const productNames = Object.keys(productDetails).join(', '); // Get product names as a comma-separated string
    const productQuantities = Object.values(productDetails).join(', '); // Get product quantities as a comma-separated string

    return `
        <tr>
            <td class="bold-text">${order._id.toString()}</td> <!-- Order ID -->
            <td class="bold-text">${customerName}</td> <!-- Customer Name -->
            <td class="bold-text">${customerEmail}</td> <!-- Customer Email -->
            <td class="bold-text">${new Date(order.order_date).toLocaleDateString('en-US')}</td> <!-- Order Date -->
            <td class="bold-text">$${order.total_amount?.toFixed(2) ?? ''}</td> <!-- Total Amount -->
            <td class="bold-text">${order.shipping_method}</td> <!-- Shipping Method -->
            <td class="bold-text">${order.payment_method}</td> <!-- Payment Method -->
            <td class="bold-text">${order.order_status}</td> <!-- Order Status -->
            <td class="bold-text">${order.shipping_address}</td> <!-- Shipping Address -->
            <td class="bold-text">${order.billing_address}</td> <!-- Billing Address -->
            <td class="bold-text">${productNames}</td> <!-- Product Names -->
            <td class="bold-text">${productQuantities}</td> <!-- Product Quantities -->
        </tr>
    `;
};

export default exportOrdersToCSV; // Export the exportOrdersToCSV function
