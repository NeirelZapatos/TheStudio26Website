import React from "react";

const ReturnsAndTax: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Returns and Tax</h1>
      
      {/* Returns Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">How to Process Returns on Stripe</h2>
        
        <div className="mb-8">
          <h3 className="text-xl font-medium mb-5 text-gray-700">From the Dashboard</h3>
          
          <div className="space-y-6 mb-6">
            {/* Step 1 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 mr-4 shadow-sm">
                <span className="font-medium">1</span>
              </div>
              <p className="text-gray-700 pt-1">
                Find the charge to be refunded in the <a href="https://dashboard.stripe.com/payments" className="text-blue-600 hover:underline font-medium">Payments overview</a> page.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 mr-4 shadow-sm">
                <span className="font-medium">2</span>
              </div>
              <p className="text-gray-700 pt-1">
                Click the <span className="font-medium">•••</span> icon to the right of the charge and select <span className="font-medium">Refund charge</span>.
              </p>
            </div>
          </div>
          
          <div className="mt-4 mb-8 rounded-md overflow-hidden shadow-md border border-gray-200">
            <img 
              src="https://tests26bucket.s3.us-east-2.amazonaws.com/dashboard-assets/stripe-return-step1.png"
              alt="Finding the charge to refund in Stripe dashboard"
              className="w-full" 
            />
          </div>
        </div>
        
        <div className="mb-8">
          <div className="inline-block px-4 py-2 bg-gray-100 rounded-md font-medium text-gray-700 mb-5">OR</div>
          
          <p className="text-gray-700 mb-6">
            Click on the charge and click the <span className="font-medium">Refund button</span> on the top right corner of the payment page.
          </p>
          
          <div className="mb-8 rounded-md overflow-hidden shadow-md border border-gray-200">
            <img 
              src="https://tests26bucket.s3.us-east-2.amazonaws.com/dashboard-assets/stripe-return-step2.png" 
              alt="Clicking the Refund button"
              className="w-full"
            />
          </div>
        </div>
        
        <div className="space-y-8">
          {/* Step 3 */}
          <div>
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 mr-4 shadow-sm">
                <span className="font-medium">3</span>
              </div>
              <p className="text-gray-700 pt-1">
                Enter the amount to be refunded. The default is a full refund. For a partial refund, enter a different amount to be refunded.
              </p>
            </div>
            
            <div className="ml-12 rounded-md overflow-hidden shadow-md border border-gray-200">
              <img 
                src="https://tests26bucket.s3.us-east-2.amazonaws.com/dashboard-assets/stripe-return-step3.png" 
                alt="Entering refund amount"
                className="w-full"
              />
            </div>
          </div>
          
          {/* Step 4 */}
          <div>
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 mr-4 shadow-sm">
                <span className="font-medium">4</span>
              </div>
              <p className="text-gray-700 pt-1">
                Select a reason for the refund. If you select Other, you must provide an explanatory note that is attached to the refund.
              </p>
            </div>
            
            <div className="ml-12 rounded-md overflow-hidden shadow-md border border-gray-200">
              <img 
                src="https://tests26bucket.s3.us-east-2.amazonaws.com/dashboard-assets/stripe-return-step4.png" 
                alt="Selecting refund reason"
                className="w-full"
              />
            </div>
          </div>
          
          {/* Step 5 */}
          <div className="flex items-start">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 mr-4 shadow-sm">
              <span className="font-medium">5</span>
            </div>
            <p className="text-gray-700 pt-1 font-medium">
              Click <span className="text-blue-600">Refund</span>
            </p>
          </div>
        </div>
      </section>
      
      {/* Tax Information Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">How to Access Tax Information</h2>
        
        <div className="mb-8">
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 mr-4 shadow-sm">
                <span className="font-medium">1</span>
              </div>
              <p className="text-gray-700 pt-1">
                Log in to your{" "}
                <a
                  href="https://dashboard.stripe.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Stripe Dashboard
                </a>.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 mr-4 shadow-sm">
                <span className="font-medium">2</span>
              </div>
              <p className="text-gray-700 pt-1">
                Go to the <span className="font-medium">Tax</span> section in the sidebar.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 mr-4 shadow-sm">
                <span className="font-medium">3</span>
              </div>
              <p className="text-gray-700 pt-1">
                Review your tax settings, reports, and collected tax amounts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReturnsAndTax;