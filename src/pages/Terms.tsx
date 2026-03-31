import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: March 31, 2026
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using ANCAR Motors Inc. website and services, you accept and agree to be bound by the
                terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Use License</h2>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily access the materials on ANCAR Motors Inc. website for personal,
                non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and
                under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to decompile or reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Vehicle Orders</h2>
              <p className="text-gray-700 mb-4">
                All custom vehicle orders are subject to availability and approval. Prices and specifications are
                subject to change without notice. We reserve the right to refuse or cancel any order for any reason,
                including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Product or service availability</li>
                <li>Errors in product information or pricing</li>
                <li>Payment issues</li>
                <li>Fraudulent activity</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pricing and Payment</h2>
              <p className="text-gray-700 mb-4">
                All prices are subject to change without notice. Payment terms are net 30 days from invoice date
                unless otherwise specified. Late payments may incur interest charges.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Warranties</h2>
              <p className="text-gray-700 mb-4">
                All vehicles come with manufacturer warranties as applicable. ANCAR Motors Inc. provides limited
                warranties on workmanship for custom orders. Warranty claims must be submitted within the specified
                timeframes and may require return of the vehicle to our facility.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                In no event shall ANCAR Motors Inc. or its suppliers be liable for any damages (including, without
                limitation, damages for loss of data or profit, or due to business interruption) arising out of the
                use or inability to use the materials on our website, even if ANCAR Motors Inc. or an authorized
                representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction
                in which ANCAR Motors Inc. operates, and you irrevocably submit to the exclusive jurisdiction of the
                courts in that state or location.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms & Conditions, please contact us at legal@ancarmotors.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}