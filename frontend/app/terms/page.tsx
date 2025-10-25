"use client";

import React from "react";

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl overflow-hidden">
        {/* Header */}
        <header className="px-6 py-8 sm:px-10 sm:py-10 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
          <h1 className="text-2xl sm:text-3xl font-semibold">Terms of Service</h1>
          <p className="mt-2 text-sm sm:text-base opacity-90">
            Last updated: October 25, 2025
          </p>
        </header>

        {/* Body */}
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <p className="text-sm sm:text-base leading-relaxed">
            Welcome to <strong>Lernova</strong>! These Terms of Service ("Terms") govern your use of our
            online learning platform, accessible via our website and mobile applications (the "Service").
            By using Lernova, you agree to these Terms. If you do not agree, please do not use our Service.
          </p>

          {/* 1. Eligibility */}
          <section id="eligibility" className="mt-8">
            <h3 className="text-xl font-semibold">1. Eligibility</h3>
            <p className="mt-2 text-sm sm:text-base leading-relaxed">
              You must be at least 13 years old (or the minimum legal age in your country) to create an
              account or use Lernova. If you are under 18, you may only use the platform under the
              supervision of a parent or guardian.
            </p>
          </section>

          {/* 2. Account */}
          <section id="account" className="mt-8">
            <h3 className="text-xl font-semibold">2. Account registration</h3>
            <p className="mt-2 text-sm sm:text-base leading-relaxed">
              To access certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-sm sm:text-base">
              <li>Provide accurate, current, and complete information during registration.</li>
              <li>Maintain the security of your password and account credentials.</li>
              <li>Notify us immediately of any unauthorized access or breach of your account.</li>
            </ul>
          </section>

          {/* 3. Use of Service */}
          <section id="use-of-service" className="mt-8">
            <h3 className="text-xl font-semibold">3. Use of the Service</h3>
            <p className="mt-2 text-sm sm:text-base leading-relaxed">
              Lernova provides video-based educational content. You agree to use the Service only for
              lawful purposes and in compliance with these Terms. You may not:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-sm sm:text-base">
              <li>Copy, distribute, or resell content without permission.</li>
              <li>Use automated systems (bots, scrapers) to access Lernova.</li>
              <li>Post or share harmful, defamatory, or illegal content.</li>
              <li>Interfere with the functionality or security of the platform.</li>
            </ul>
          </section>

          {/* 4. Subscriptions */}
          <section id="subscription" className="mt-8">
            <h3 className="text-xl font-semibold">4. Subscriptions and payments</h3>
            <p className="mt-2 text-sm sm:text-base leading-relaxed">
              Lernova offers both free and paid content. Paid subscriptions grant you access to premium
              courses and features as long as your payment remains current. Payments are processed through
              secure third-party providers.
            </p>
            <p className="mt-2 text-sm sm:text-base leading-relaxed">
              You authorize us to charge your payment method for recurring fees until you cancel. Refunds
              may be provided at our discretion or as required by law.
            </p>
          </section>

          {/* 5. User Content */}
          <section id="content" className="mt-8">
            <h3 className="text-xl font-semibold">5. User content</h3>
            <p className="mt-2 text-sm sm:text-base leading-relaxed">
              You may upload or submit comments, reviews, or other content. By submitting content to
              Lernova, you grant us a worldwide, royalty-free, non-exclusive license to display,
              reproduce, and distribute your content for platform operation and marketing.
            </p>
            <p className="mt-2 text-sm sm:text-base leading-relaxed">
              You retain ownership of your content but are responsible for ensuring it complies with
              applicable laws and does not infringe on others’ rights.
            </p>
          </section>

          {/* 6. IP */}
          <section id="intellectual-property" className="mt-8">
            <h3 className="text-xl font-semibold">6. Intellectual property</h3>
            <p className="mt-2 text-sm sm:text-base leading-relaxed">
              All content on Lernova, including videos, graphics, logos, and software, is owned by
              Lernova or its licensors and protected by copyright and trademark laws. Unauthorized use of
              our content is prohibited.
            </p>
          </section>

          {/* 7. Termination */}
          <section id="termination" className="mt-8">
            <h3 className="text-xl font-semibold">7. Termination</h3>
            <p className="mt-2 text-sm sm:text-base leading-relaxed">
              We may suspend or terminate your access to Lernova at any time, with or without notice, if
              you violate these Terms or engage in fraudulent or abusive activities.
            </p>
          </section>

          {/* 8. Disclaimer */}
          <section id="disclaimer" className="mt-8">
            <h3 className="text-xl font-semibold">8. Disclaimer of warranties</h3>
            <p className="mt-2 text-sm sm:text-base leading-relaxed">
              Lernova and its content are provided “as is” without warranties of any kind, whether express
              or implied, including but not limited to accuracy, reliability, or fitness for a particular
              purpose.
            </p>
          </section>

          {/* 9. Liability */}
          <section id="liability" className="mt-8">
            <h3 className="text-xl font-semibold">9. Limitation of liability</h3>
            <p className="mt-2 text-sm sm:text-base leading-relaxed">
              Lernova shall not be liable for any indirect, incidental, or consequential damages arising
              from your use or inability to use the Service, even if advised of such damages.
            </p>
          </section>

          {/* 10. Changes */}
          <section id="changes" className="mt-8">
            <h3 className="text-xl font-semibold">10. Changes to these Terms</h3>
            <p className="mt-2 text-sm sm:text-base leading-relaxed">
              We may update these Terms from time to time. Material changes will be communicated via email
              or through the platform. Continued use of Lernova after updates constitutes acceptance of
              the new Terms.
            </p>
          </section>

          {/* 11. Law */}
          <section id="governing-law" className="mt-8">
            <h3 className="text-xl font-semibold">11. Governing law</h3>
            <p className="mt-2 text-sm sm:text-base leading-relaxed">
              These Terms are governed by and construed in accordance with the laws of your country of
              residence, without regard to conflict of law principles.
            </p>
          </section>

          {/* 12. Contact */}
          <section id="contact" className="mt-8 pb-8">
            <h3 className="text-xl font-semibold">12. Contact us</h3>
            <p className="mt-2 text-sm sm:text-base leading-relaxed">
              If you have questions about these Terms, please contact us at:
            </p>
            <address className="not-italic mt-3 text-sm sm:text-base"> 
              <div>
                <strong>Email:</strong> support@lernova.example
              </div>
              <div>
                <strong>Phone:</strong> 0941670553
              </div>
              <div className="mt-1">
                <strong>Address:</strong> Addis Ababa, Ethiopia
              </div>
            </address>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="/"
                className="inline-block rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-indigo-700"
              >
                Back to Home
              </a>
       
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
