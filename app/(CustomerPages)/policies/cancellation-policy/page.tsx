export default function CancellationPolicy() {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-black font-special-gothic mb-4">
            Cancellation Policy
          </h1>
          <div className="w-24 h-1 bg-amber-600 mx-auto mb-6"></div>
        </div>
  
        {/* Policy Items */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <ul className="divide-y divide-gray-100">
            {[
              {
                title: "Payment Requirements",
                content: "Payment in full for class fees is due at the time of registration to reserve your jewelry bench spot. We accept Visa, MasterCard, American Express, Discover, and PayPal."
              },
              {
                title: "School Cancellations",
                content: "If the class is canceled by our school for any reason, we will give you full credit for the same class in the future and you will be given an open lab credit for the inconvenience. You can also transfer to another class, or you can keep a credit on account with us for future classes for up to 90 days (no exceptions)."
              },
              {
                title: "Student Cancellations",
                content: "Students can cancel, and receive a credit, or transfer to another class up to 10 days before a jewelry class. No cancellations are accepted after the 10 days deadline; however, we will do what we can to try and sell your reserved spot to a qualified student."
              },
              {
                title: "Spot Resale Policy",
                content: "If we can sell your reserved spot, you can receive a credit for another class less a $50 cancellation fee. We will keep your credit on an account with us, or apply your fees towards a transfer to another class within 90 days."
              },
              {
                title: "Substitute Participants",
                content: "If you cannot make it to class, you may send a participant who has the necessary prerequisites in your place. Please call or email us immediately with any changes with the student participant information."
              },
              {
                title: "Age Requirements",
                content: "Students must be at least 15 years old to attend a class, and students under 18 must have a legal guardian sign our liability waiver form. We have had younger students attend classes, on a case-by-case basis. If you are interested in enrolling your child, please email us."
              },
              {
                title: "Prerequisite Policy",
                content: "If you sign up for a class and fail to have the required prerequisites as listed in the class description, you are still subject to the 10-day cancellation policy, listed above."
              },
              {
                title: "No-Show Policy",
                content: "If you do not come to class, there are no refunds, credits, or transfers (No exceptions)"
              },
              {
                title: "Rescheduling",
                content: "We understand that things come up. If you are not able to make a scheduled class, please call us as soon as possible at 916-350-0546 to reschedule your class."
              },
              {
                title: "Refund Policy",
                content: "No refunds allowed."
              }
            ].map((item, index) => (
              <li key={index} className="p-6 hover:bg-amber-50 transition-colors duration-150">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center mt-1 mr-4">
                    <span className="text-amber-700 font-medium">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-amber-800 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.content}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
  
          {/* Contact CTA */}
          <div className="bg-amber-50 px-6 py-8 text-center">
            <h3 className="text-xl font-medium text-amber-800 mb-4">Need clarification?</h3>
            <p className="text-gray-700 mb-6">We're happy to answer any questions about our policies.</p>
            <a 
              href="tel:916-350-0546" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-amber-700 hover:bg-amber-600 transition-colors duration-200"
            >
              Call Us: 916-350-0546
            </a>
          </div>
        </div>
      </div>
    );
  }