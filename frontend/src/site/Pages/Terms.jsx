import React, { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import SiteLayout from '../components/SiteLayout'
import { COLORS } from '../constants/theme'

export default function Terms() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const lastUpdated = 'February 23, 2026'

  return (
    <>
      <Head title="Terms of Service - ImaraDesk" />
      
      <SiteLayout scrollY={scrollY}>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-white via-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: `${COLORS.primary}15` }}>
              <svg className="w-5 h-5" style={{ color: COLORS.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium" style={{ color: COLORS.primary }}>Legal Agreement</span>
            </div> */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Terms of Service
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
              
              <TermsSection title="1. Acceptance of Terms">
                <p>
                  Welcome to ImaraDesk. These Terms of Service ("Terms") govern your access to and use of ImaraDesk's 
                  ticketing and customer support platform, including our website, applications, and related services 
                  (collectively, the "Service").
                </p>
                <p>
                  By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any 
                  part of the terms, you may not access the Service. These Terms apply to all visitors, users, and 
                  others who access or use the Service.
                </p>
              </TermsSection>

              <TermsSection title="2. Description of Service">
                <p>
                  ImaraDesk provides a cloud-based ticketing and customer support management platform that enables 
                  businesses to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Manage customer support tickets and inquiries</li>
                  <li>Track and organize customer communications</li>
                  <li>Collaborate with team members on support issues</li>
                  <li>Automate workflows and processes</li>
                  <li>Monitor service level agreements (SLAs)</li>
                  <li>Generate reports and analytics</li>
                  <li>Manage assets and knowledge bases</li>
                </ul>
              </TermsSection>

              <TermsSection title="3. Account Registration">
                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Account Creation</h4>
                <p>
                  To use certain features of our Service, you must register for an account. When you register, you 
                  agree to provide accurate, current, and complete information and to update such information to 
                  keep it accurate, current, and complete.
                </p>

                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Account Security</h4>
                <p>
                  You are responsible for safeguarding your account credentials and for all activities that occur 
                  under your account. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Maintain the security of your password</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Not share your account with third parties</li>
                  <li>Log out from your account at the end of each session</li>
                </ul>
              </TermsSection>

              <TermsSection title="4. Subscription and Payment">
                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Pricing and Plans</h4>
                <p>
                  ImaraDesk offers various subscription plans with different features and pricing. Current pricing 
                  is available on our <Link href="/pricing" className="hover:underline" style={{ color: COLORS.primary }}>Pricing page</Link>. 
                  We reserve the right to change our prices with reasonable notice.
                </p>

                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Billing</h4>
                <p>
                  For paid plans, you agree to pay all applicable fees. Subscription fees are billed in advance on 
                  a monthly or annual basis. All payments are non-refundable except as required by law or as 
                  expressly set forth in these Terms.
                </p>

                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Free Trial</h4>
                <p>
                  We may offer a free trial period. At the end of the trial, your account will be automatically 
                  converted to a paid subscription unless you cancel before the trial ends.
                </p>
              </TermsSection>

              <TermsSection title="5. Acceptable Use">
                <p>You agree not to use the Service to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon the rights of others</li>
                  <li>Transmit harmful, offensive, or illegal content</li>
                  <li>Distribute spam, malware, or viruses</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Collect user information without consent</li>
                  <li>Impersonate any person or entity</li>
                  <li>Use the Service for competitive analysis</li>
                  <li>Resell or redistribute the Service without authorization</li>
                </ul>
              </TermsSection>

              <TermsSection title="6. Intellectual Property">
                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Our Intellectual Property</h4>
                <p>
                  The Service and its original content, features, and functionality are owned by ImaraDesk and are 
                  protected by international copyright, trademark, patent, trade secret, and other intellectual 
                  property laws.
                </p>

                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Your Content</h4>
                <p>
                  You retain ownership of any content you submit to the Service. By submitting content, you grant 
                  us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such 
                  content solely for the purpose of operating and providing the Service.
                </p>
              </TermsSection>

              <TermsSection title="7. Data and Privacy">
                <p>
                  Your use of the Service is also governed by our <Link href="/privacy" className="hover:underline" style={{ color: COLORS.primary }}>Privacy Policy</Link>, 
                  which explains how we collect, use, and protect your data. By using the Service, you consent to 
                  our data practices as described in the Privacy Policy.
                </p>
                <p className="mt-4">
                  You are responsible for ensuring that your use of the Service complies with all applicable data 
                  protection laws, including obtaining necessary consents from your end users.
                </p>
              </TermsSection>

              <TermsSection title="8. Service Availability">
                <p>
                  We strive to provide reliable service but cannot guarantee that the Service will be available at 
                  all times. We may experience downtime for:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Scheduled maintenance (with advance notice when possible)</li>
                  <li>Emergency repairs</li>
                  <li>System upgrades and improvements</li>
                  <li>Circumstances beyond our reasonable control</li>
                </ul>
              </TermsSection>

              <TermsSection title="9. Limitation of Liability">
                <p>
                  To the maximum extent permitted by law, ImaraDesk shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Loss of profits, revenue, or data</li>
                  <li>Business interruption</li>
                  <li>Cost of substitute services</li>
                  <li>Any damages arising from your use or inability to use the Service</li>
                </ul>
                <p className="mt-4">
                  Our total liability shall not exceed the amount you paid to us in the twelve (12) months preceding 
                  the claim.
                </p>
              </TermsSection>

              <TermsSection title="10. Disclaimer of Warranties">
                <p>
                  THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, 
                  EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Merchantability and fitness for a particular purpose</li>
                  <li>Non-infringement</li>
                  <li>Accuracy or completeness of content</li>
                  <li>Uninterrupted or error-free operation</li>
                </ul>
              </TermsSection>

              <TermsSection title="11. Indemnification">
                <p>
                  You agree to indemnify, defend, and hold harmless ImaraDesk and its officers, directors, employees, 
                  and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) 
                  arising from:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Your use of the Service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party rights</li>
                  <li>Content you submit to the Service</li>
                </ul>
              </TermsSection>

              <TermsSection title="12. Termination">
                <p>
                  We may terminate or suspend your account and access to the Service immediately, without prior 
                  notice or liability, for any reason, including without limitation if you breach these Terms.
                </p>
                <p className="mt-4">
                  Upon termination, your right to use the Service will cease immediately. All provisions of these 
                  Terms which by their nature should survive termination shall survive, including ownership 
                  provisions, warranty disclaimers, and limitations of liability.
                </p>
              </TermsSection>

              <TermsSection title="13. Modifications to Terms">
                <p>
                  We reserve the right to modify these Terms at any time. We will provide notice of material changes 
                  by posting the updated Terms on our website and updating the "Last updated" date. Your continued 
                  use of the Service after such modifications constitutes your acceptance of the revised Terms.
                </p>
              </TermsSection>

              <TermsSection title="14. Governing Law">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
                  in which ImaraDesk operates, without regard to its conflict of law provisions. Any disputes 
                  arising under these Terms shall be subject to the exclusive jurisdiction of the courts in 
                  that jurisdiction.
                </p>
              </TermsSection>

              <TermsSection title="15. Severability">
                <p>
                  If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions 
                  shall continue in full force and effect. The invalid or unenforceable provision shall be modified 
                  to the minimum extent necessary to make it valid and enforceable.
                </p>
              </TermsSection>

              <TermsSection title="16. Entire Agreement">
                <p>
                  These Terms, together with our Privacy Policy and any other agreements expressly referenced herein, 
                  constitute the entire agreement between you and ImaraDesk regarding your use of the Service and 
                  supersede all prior agreements and understandings.
                </p>
              </TermsSection>

              <TermsSection title="17. Contact Information">
                <p>
                  If you have any questions about these Terms of Service, please contact us:
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
              </TermsSection>

            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16" style={{ backgroundColor: `${COLORS.primary}08` }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-8">
              Join thousands of teams already using ImaraDesk to deliver exceptional customer support.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all hover:shadow-lg"
                style={{ backgroundColor: COLORS.primary }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Free Trial
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 font-medium transition-all hover:bg-gray-50"
                style={{ borderColor: COLORS.primary, color: COLORS.primary }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </SiteLayout>
    </>
  )
}

function TermsSection({ title, children }) {
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
