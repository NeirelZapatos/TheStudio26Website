import { Download } from "lucide-react";
import React from "react";

/**
 * ExportButton Component:
 * Provides a button to export customer orders to a CSV file.
 * Will probably be reusing ExportButton in the utilities here, but for now this works 
 * 
 * Props:
 * - customers: An array of customer objects.
 * - orders: An object where keys are customer IDs and values are arrays of orders for each customer.
 */
interface ExportButtonProps {
  customers: any[]; // Array of customer objects
  orders: { [key: string]: any[] }; // Object containing orders for each customer
}

/**
 * ExportButton Functional Component:
 * Renders a button that, when clicked, exports customer orders to a CSV file. 
 */
const ExportButton: React.FC<ExportButtonProps> = ({ customers, orders }) => {
  /**
   * Formats a phone number into a standard (XXX) XXX-XXXX format.
   * @param phoneNumber - The phone number to format.
   * @returns The formatted phone number or "N/A" if the input is invalid.
   */
  const formatPhoneNumber = (phoneNumber: string | number | undefined): string => {
    if (!phoneNumber) return "N/A";

    // Remove non-numeric characters
    const cleaned = String(phoneNumber).replace(/\D/g, "");

    // Format as (XXX) XXX-XXXX if the length is 10
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    // Return the original number if it doesn't match the expected format
    return cleaned;
  };

  /**
   * Formats a date string into a MM/DD/YYYY format.
   * @param dateString - The date string to format.
   * @returns The formatted date string.
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  /**
   * Exports customer orders to a CSV file and triggers a download.
   */
  const exportOrdersToCSV = () => {
    // Generate a timestamp for the filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").replace("Z", "");
    const filename = `customer_orders_${timestamp}.csv`;

    // Define CSV headers
    let csvContent = "Order ID,Customer,Email,Phone #,Date,Total,Status,Items\n";

    // Loop through customers and their orders to populate the CSV content
    customers.forEach((customer) => {
      (orders[customer._id] || []).forEach((order) => {
        const customerName = `${customer.first_name} ${customer.last_name}`;
        const email = customer.email || "N/A";
        const phoneNumber = formatPhoneNumber(customer.phone_number);
        const orderDate = formatDate(order.order_date);
        const totalAmount = `$${order.total_amount?.toFixed(2)}`;
        const status = order.order_status || "N/A";
        const items = order.products
          ?.map((p: any) => `${p.product.name} (x${p.quantity})`)
          .join(" | ") || "N/A";

        // Add a row for each order
        csvContent += `"${order._id}","${customerName}","${email}","${phoneNumber}","${orderDate}","${totalAmount}","${status}","${items}"\n`;
      });
    });

    // Create a downloadable CSV file
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csvContent], { type: "text/csv" }));
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
    onClick={exportOrdersToCSV}
    className={`flex items-center bg-green-500 text-white py-2 px-4 rounded-xl hover:bg-green-600 transition-colors min-w-[130px]`}
  >
    <Download size={18} />
    Export Orders
  </button>
  );
};

export default ExportButton;