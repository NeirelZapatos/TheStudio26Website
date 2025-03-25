import React from "react";

const FinancesSection: React.FC = () => {
  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h1 className="text-3xl font-bold mb-4">Stripe Financial Information</h1>
      <p className="mb-4">
        Access your financial details and manage your Stripe account easily using the instructions below.
      </p>
      <h2 className="text-xl font-semibold mb-2">How to Access Your Stripe Dashboard</h2>
      <ol className="list-decimal list-inside mb-4">
        <li>
          <strong>Log In:</strong> Navigate to the{" "}
          <a
            href="https://dashboard.stripe.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Stripe Dashboard
          </a>{" "}
          and sign in with your account credentials.
        </li>
        <li>
          <strong>Payments:</strong> Click on the <em>Payments</em> section to view your recent transactions and payment history.
        </li>
        <li>
          <strong>Payouts:</strong> Select the <em>Payouts</em> tab to see details on transfers to your bank account.
        </li>
        <li>
          <strong>Reports:</strong> For more detailed financial insights, go to the <em>Reports</em> section and generate custom reports.
        </li>
      </ol>
      <h2 className="text-xl font-semibold mb-2">Additional Information</h2>
      <p className="mb-2">
        <strong>Account Setup:</strong> Make sure that your Stripe account is fully set up and verified to receive payouts.
      </p>
      <p className="mb-2">
        <strong>Support:</strong> If you encounter any issues or need further assistance, please refer to Stripe’s support documentation or contact our support team.
      </p>
      <p>
        This page provides all the essential steps to ensure you can efficiently access and manage your Stripe financial details.
      </p>
    </div>
  );
};

export default FinancesSection;
