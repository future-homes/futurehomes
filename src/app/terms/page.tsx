export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using Future Homes, you accept and agree to be bound by the terms
                and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Responsibilities</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate and truthful information</li>
                <li>Maintain the security of your account</li>
                <li>Comply with all applicable laws</li>
                <li>Respect other users and property owners</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Property Listings</h2>
              <p className="text-gray-700">
                All property listings must be accurate and verified. False or misleading information
                may result in account suspension.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Limitation of Liability</h2>
              <p className="text-gray-700">
                Future Homes is not responsible for disputes between property owners and tenants.
                We are a platform that connects users.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
