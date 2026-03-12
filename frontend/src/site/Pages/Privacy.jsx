import React, { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import SiteLayout from '../components/SiteLayout'
import { COLORS } from '../constants/theme'

export default function Privacy() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const lastUpdated = 'February 23, 2026'

  return (
    <>
      <Head title="Privacy Policy - ImaraDesk" />
      
      <SiteLayout scrollY={scrollY}>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-white via-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: `${COLORS.primary}15` }}>
              <svg className="w-5 h-5" style={{ color: COLORS.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm font-medium" style={{ color: COLORS.primary }}>Your Privacy Matters</span>
            </div> */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: {lastUpdated}
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              
              <PolicySection title="1. Introduction">
                <p>
                  Welcome to ImaraDesk ("we," "our," or "us"). We are committed to protecting your personal information 
                  and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard 
                  your information when you use our ticketing and customer support platform.
                </p>
                <p>
                  By using ImaraDesk, you agree to the collection and use of information in accordance with this policy. 
                  If you do not agree with the terms of this privacy policy, please do not access or use our services.
                </p>
              </PolicySection>

              <PolicySection title="2. Information We Collect">
                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Personal Information</h4>
                <p>We may collect the following types of personal information:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Account credentials (username, password)</li>
                  <li>Billing information (payment card details, billing address)</li>
                  <li>Organization details (company name, job title)</li>
                  <li>Profile information (avatar, preferences)</li>
                </ul>

                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Usage Data</h4>
                <p>We automatically collect certain information when you use our services:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Device information (browser type, operating system)</li>
                  <li>IP address and location data</li>
                  <li>Pages visited and features used</li>
                  <li>Time and date of access</li>
                  <li>Referring URLs</li>
                </ul>

                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Ticket and Support Data</h4>
                <p>As a ticketing platform, we process:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Support tickets and their contents</li>
                  <li>Customer communications</li>
                  <li>Attachments and files uploaded</li>
                  <li>Internal notes and comments</li>
                </ul>
              </PolicySection>

              <PolicySection title="3. How We Use Your Information">
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Provide, operate, and maintain our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send administrative information and updates</li>
                  <li>Respond to inquiries and provide customer support</li>
                  <li>Improve and personalize your experience</li>
                  <li>Develop new features and services</li>
                  <li>Monitor and analyze usage patterns and trends</li>
                  <li>Detect, prevent, and address technical issues or fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </PolicySection>

              <PolicySection title="4. Data Sharing and Disclosure">
                <p>We may share your information in the following situations:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li><strong>Service Providers:</strong> With third-party vendors who assist us in operating our platform</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>With Your Consent:</strong> When you have given us explicit permission</li>
                </ul>
                <p className="mt-4">
                  We do not sell your personal information to third parties.
                </p>
              </PolicySection>

              <PolicySection title="5. Data Security">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and audits</li>
                  <li>Access controls and authentication measures</li>
                  <li>Employee training on data protection</li>
                  <li>Incident response procedures</li>
                </ul>
                <p className="mt-4">
                  However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
                </p>
              </PolicySection>

              <PolicySection title="6. Data Retention">
                <p>
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this 
                  privacy policy, unless a longer retention period is required by law. When your data is no longer needed, 
                  we will securely delete or anonymize it.
                </p>
              </PolicySection>

              <PolicySection title="7. Your Rights">
                <p>Depending on your location, you may have the following rights:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
                  <li><strong>Erasure:</strong> Request deletion of your data</li>
                  <li><strong>Portability:</strong> Request transfer of your data</li>
                  <li><strong>Objection:</strong> Object to certain processing activities</li>
                  <li><strong>Restriction:</strong> Request limitation of processing</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us using the information provided below.
                </p>
              </PolicySection>

              <PolicySection title="8. Cookies and Tracking">
                <p>
                  We use cookies and similar tracking technologies to track activity on our service and hold certain 
                  information. You can instruct your browser to refuse all cookies or to indicate when a cookie is 
                  being sent. However, some parts of our service may not function properly without cookies.
                </p>
              </PolicySection>

              <PolicySection title="9. Third-Party Links">
                <p>
                  Our service may contain links to third-party websites or services that are not operated by us. 
                  We have no control over and assume no responsibility for the content, privacy policies, or 
                  practices of any third-party sites or services.
                </p>
              </PolicySection>

              <PolicySection title="10. Children's Privacy">
                <p>
                  Our services are not intended for individuals under the age of 16. We do not knowingly collect 
                  personal information from children under 16. If you become aware that a child has provided us 
                  with personal data, please contact us.
                </p>
              </PolicySection>

              <PolicySection title="11. Changes to This Policy">
                <p>
                  We may update this privacy policy from time to time. We will notify you of any changes by posting 
                  the new privacy policy on this page and updating the "Last updated" date. You are advised to review 
                  this privacy policy periodically for any changes.
                </p>
              </PolicySection>

              <PolicySection title="12. Contact Us">
                <p>
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <ul className="list-none pl-0 space-y-2 text-gray-600 mt-4">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5" style={{ color: COLORS.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>support@imaradesk.com</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5" style={{ color: COLORS.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <Link href="/contact" className="hover:underline" style={{ color: COLORS.primary }}>Contact Form</Link>
                  </li>
                </ul>
              </PolicySection>

            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16" style={{ backgroundColor: `${COLORS.primary}08` }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Have Questions About Your Data?
            </h2>
            <p className="text-gray-600 mb-8">
              We're here to help. Reach out to us anytime with your privacy concerns.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all hover:shadow-lg"
              style={{ backgroundColor: COLORS.primary }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Contact Us
            </Link>
          </div>
        </section>
      </SiteLayout>
    </>
  )
}

function PolicySection({ title, children }) {
  return (
    <div className="mb-10 pb-8 border-b border-gray-100 last:border-b-0">
      <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ color: COLORS.primary }}>
        {title}
      </h3>
      <div className="text-gray-600 leading-relaxed space-y-4">
        {children}
      </div>
    </div>
  )
}
