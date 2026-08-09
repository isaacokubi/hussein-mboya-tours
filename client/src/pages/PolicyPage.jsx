const content = {
  privacy: {
    title: "Privacy Policy",
    paragraphs: [
      "We use information you provide to process bookings, payments, support requests and account activity.",
      "We do not sell customer information. Access to operational data is limited to authorized staff and service providers who need it to deliver your booking.",
      "You can contact the company to request correction or clarification about information associated with your account."
    ]
  },
  terms: {
    title: "Terms and Conditions",
    paragraphs: [
      "Bookings are subject to availability and confirmation. Prices and itineraries may change when suppliers or operating conditions require an adjustment.",
      "Customers are responsible for providing accurate passenger information and complying with applicable travel requirements.",
      "By using this website, you agree to these terms and to reasonable operational changes required to deliver a safe tour."
    ]
  },
  refund: {
    title: "Refund Policy",
    paragraphs: [
      "Refund eligibility depends on the booking status, supplier terms and the cancellation conditions communicated at booking time.",
      "Approved refunds are processed through the original payment method where possible.",
      "For a booking-specific refund request, contact support with your booking reference so the team can review the applicable terms."
    ]
  }
};

export default function PolicyPage({ type = "privacy" }) {
  const page = content[type] || content.privacy;
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
      <div className="space-y-5 text-gray-700 leading-7">
        {page.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
    </div>
  );
}
