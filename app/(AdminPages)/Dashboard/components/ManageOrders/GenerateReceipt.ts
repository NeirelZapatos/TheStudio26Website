import { IOrder } from '@/app/models/Order';
import jsPDF from 'jspdf';

const generateReceiptPDF = (order: IOrder) => {
  // Create a new jsPDF instance
  const doc = new jsPDF();

  // Set the font size and type
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  // Add a title
  doc.setFontSize(18);
  doc.text('Order Receipt', 10, 20);

  // Add order details
  doc.setFontSize(12);

  const addBoldText = (label: string, value: string, y: number) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 50, y);
  };

  addBoldText('Order ID', order._id.toString(), 30);
  addBoldText('Order Date', new Date(order.order_date).toLocaleDateString(), 40);
  addBoldText('Customer', `${order.customer?.first_name} ${order.customer?.last_name}`, 50);
  addBoldText('Email', order.customer?.email ?? '', 60);
  addBoldText('Shipping Address', order.shipping_address, 70);
  addBoldText('Billing Address', order.billing_address, 80);
  addBoldText('Shipping Method', order.shipping_method, 90);
  addBoldText('Payment Method', order.payment_method, 100);
  addBoldText('Order Status', order.order_status, 110);
  addBoldText('Total Amount', `$${order.total_amount.toFixed(2)}`, 120);

  // Add a table for product items
  doc.setFontSize(14);
  doc.text('Product Items:', 10, 130);

  let yPosition = 140; // Starting Y position for the table
  doc.setFontSize(12);

  // Table headers in bold
  doc.setFont('helvetica', 'bold');
  doc.text('Product', 10, yPosition);
  doc.text('Quantity', 70, yPosition);
  doc.text('Price', 130, yPosition);
  yPosition += 10;
  doc.setFont('helvetica', 'normal');

  // Table rows
  order.products?.forEach((item) => {
    doc.text(item.product.name, 10, yPosition);
    doc.text(item.quantity.toString(), 70, yPosition);
    doc.text(`$${Number(item.product.price).toFixed(2)}`, 130, yPosition);
    yPosition += 10;
  });

  // Save the PDF
  doc.save(`order_receipt_${order._id.toString()}.pdf`);
};

export default generateReceiptPDF;