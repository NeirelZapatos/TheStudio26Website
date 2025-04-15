import { IOrder } from '@/app/models/Order';
import jsPDF from 'jspdf';

const generateReceiptPDF = (order: IOrder) => {
  const doc = new jsPDF();
  
  // Set up fonts and styling
  doc.setFont('helvetica', 'normal');
  
  // Add receipt title
  doc.setFontSize(22);
  doc.text('RECEIPT', 105, 30, { align: 'center' });
  
  // Add store info
  doc.setFontSize(12);
  doc.text('The Studio 26', 105, 40, { align: 'center' });
  doc.setFontSize(10);
  doc.text('www.TheStudio26LLC.com', 105, 45, { align: 'center' });
  
  // Add separator line
  doc.setLineWidth(0.5);
  doc.line(20, 50, 190, 50);
  
  // Customer and order info section
  doc.setFontSize(10);
  const orderDate = new Date(order.order_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Left column
  doc.setFont('helvetica', 'bold');
  doc.text('Customer:', 20, 60);
  doc.text('Order ID:', 20, 70);
  doc.text('Date:', 20, 80);
  
  // Right column
  doc.setFont('helvetica', 'normal');
  doc.text(`${order.customer?.first_name} ${order.customer?.last_name}`, 70, 60);
  doc.text(order._id.toString(), 70, 70);
  doc.text(orderDate, 70, 80);
  
  // Add separator line
  doc.line(20, 90, 190, 90);
  
  // Items header
  doc.setFont('helvetica', 'bold');
  doc.text('Item', 20, 100);
  doc.text('Qty', 120, 100);
  doc.text('Price', 155, 100);
  doc.line(20, 105, 190, 105);
  
  // Items listing
  let yPosition = 115;
  doc.setFont('helvetica', 'normal');
  
  order.products?.forEach((item) => {
    doc.text(item.product.name, 20, yPosition);
    doc.text(item.quantity.toString(), 120, yPosition);
    doc.text(`$${Number(item.product.price).toFixed(2)}`, 155, yPosition);
    yPosition += 10;
  });
  
  // Add separator line
  doc.line(20, yPosition + 5, 190, yPosition + 5);
  yPosition += 15;
  
  // Payment and total
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Method:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(order.payment_method || 'N/A', 80, yPosition);
  
  yPosition += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount:', 120, yPosition);
  doc.setFontSize(12);
  doc.text(`$${order.total_amount?.toFixed(2) || '0.00'}`, 170, yPosition);
  
  // Add a thank you note
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your purchase!', 105, yPosition + 20, { align: 'center' });
  
  // Save the PDF
  doc.save(`receipt_${order._id.toString()}.pdf`);
};

export default generateReceiptPDF;