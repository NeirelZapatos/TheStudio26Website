import { IOrder } from '@/app/models/Order'; // Import the IOrder interface from the Order model
import jsPDF from 'jspdf'; // Import jsPDF for generating PDFs

// Generate a PDF receipt for an order
const generateReceiptPDF = (order: IOrder) => {
  const doc = new jsPDF(); // Create a new jsPDF instance

  // Set the font size and type
  doc.setFontSize(12); // Set font size to 12
  doc.setFont('helvetica', 'normal'); // Set font to Helvetica

  // Add a title
  doc.setFontSize(18); // Set font size to 18 for the title
  doc.text('Order Receipt', 10, 20); // Add the title at position (10, 20)

  // Add order details
  doc.setFontSize(12); // Set font size back to 12 for details

  // Helper function to add bold text
  const addBoldText = (label: string, value: string, y: number) => {
    doc.setFont('helvetica', 'bold'); // Set font to bold
    doc.text(`${label}:`, 10, y); // Add the label at position (10, y)
    doc.setFont('helvetica', 'normal'); // Set font back to normal
    doc.text(value, 50, y); // Add the value at position (50, y)
  };

  addBoldText('Order ID', order._id.toString(), 30); // Add Order ID
  addBoldText('Order Date', new Date(order.order_date).toLocaleDateString(), 40); // Add Order Date
  addBoldText('Customer', `${order.customer?.first_name} ${order.customer?.last_name}`, 50); // Add Customer Name
  addBoldText('Email', order.customer?.email ?? '', 60); // Add Customer Email
  addBoldText('Shipping Address', order.shipping_address ?? '', 70); // Add Shipping Address
  addBoldText('Billing Address', order.billing_address ?? '', 80); // Add Billing Address
  addBoldText('Shipping Method', order.shipping_method ?? '', 90); // Add Shipping Method
  addBoldText('Payment Method', order.payment_method ?? '', 100); // Add Payment Method
  addBoldText('Order Status', order.order_status ?? '', 110); // Add Order Status
  addBoldText('Total Amount', `$${order.total_amount?.toFixed(2) ?? ''}`, 120); // Add Total Amount

  // Add a table for product items
  doc.setFontSize(14); // Set font size to 14 for the table title
  doc.text('Product Items:', 10, 130); // Add the table title at position (10, 130)

  let yPosition = 140; // Starting Y position for the table
  doc.setFontSize(12); // Set font size to 12 for the table content

  // Table headers in bold
  doc.setFont('helvetica', 'bold'); // Set font to bold for headers
  doc.text('Product', 10, yPosition); // Add Product header at position (10, yPosition)
  doc.text('Quantity', 70, yPosition); // Add Quantity header at position (70, yPosition)
  doc.text('Price', 130, yPosition); // Add Price header at position (130, yPosition)
  yPosition += 10; // Move Y position down for the table rows
  doc.setFont('helvetica', 'normal'); // Set font back to normal for table rows

  // Table rows
  order.products?.forEach((item) => {
    doc.text(item.product.name, 10, yPosition); // Add product name at position (10, yPosition)
    doc.text(item.quantity.toString(), 70, yPosition); // Add product quantity at position (70, yPosition)
    doc.text(`$${Number(item.product.price).toFixed(2)}`, 130, yPosition); // Add product price at position (130, yPosition)
    yPosition += 10; // Move Y position down for the next row
  });

  // Save the PDF
  doc.save(`order_receipt_${order._id.toString()}.pdf`); // Save the PDF with the order ID as the filename
};

export default generateReceiptPDF; // Export the generateReceiptPDF function