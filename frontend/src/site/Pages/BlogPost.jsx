import React, { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import SiteLayout from '../components/SiteLayout'
import { COLORS } from '../constants/theme'

export default function BlogPost({ post }) {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Default post data if not provided or merge with provided data
  const defaultPost = {
    id: 1,
    title: '10 Best Practices for Exceptional Customer Support in 2024',
    content: `
      <p>Customer support is evolving rapidly, and staying ahead means adapting to new technologies while maintaining the human touch that customers value. Here are the top 10 best practices that will help your support team excel in 2024.</p>

      <h2>1. Embrace Omnichannel Support</h2>
      <p>Today's customers expect to reach you through multiple channels - email, chat, social media, and phone. The key is not just being present on these channels, but providing a seamless experience across all of them. When a customer starts a conversation on Twitter and follows up via email, your team should have complete context without making them repeat themselves.</p>

      <h2>2. Invest in Self-Service Options</h2>
      <p>A comprehensive knowledge base isn't just about reducing ticket volume - it's about empowering customers to find answers instantly. Our data shows that 67% of customers prefer to solve issues themselves before contacting support. Create detailed articles, video tutorials, and interactive guides that address common questions and problems.</p>

      <h2>3. Use AI to Augment, Not Replace</h2>
      <p>Artificial intelligence and automation are powerful tools, but they work best when they enhance your human agents rather than replace them. Use AI for initial triage, sentiment analysis, and suggesting responses, but always keep humans in the loop for complex or emotional situations.</p>

      <h2>4. Measure What Matters</h2>
      <p>Beyond traditional metrics like first response time and resolution rate, focus on customer satisfaction (CSAT), Net Promoter Score (NPS), and Customer Effort Score (CES). These metrics tell you not just how fast you're responding, but how well you're actually solving problems.</p>

      <h2>5. Personalize Every Interaction</h2>
      <p>Use customer data to provide context-aware support. When an agent knows a customer's purchase history, previous tickets, and preferences, they can provide faster, more relevant assistance. But remember - personalization should feel helpful, not creepy.</p>

      <h2>6. Proactive Communication</h2>
      <p>Don't wait for customers to report issues. If you know about a service disruption, email outage, or product defect, reach out first. Proactive communication builds trust and often prevents tickets before they're created.</p>

      <h2>7. Continuous Training and Development</h2>
      <p>Your product evolves, customer expectations change, and new tools emerge. Regular training sessions, peer learning, and access to updated documentation ensure your team stays sharp and confident.</p>

      <h2>8. Foster Internal Collaboration</h2>
      <p>Support teams should have direct lines to product, engineering, and sales teams. When support insights flow back to product development, you create a virtuous cycle of improvement. Regular cross-functional meetings can surface patterns and drive meaningful changes.</p>

      <h2>9. Set Realistic SLAs</h2>
      <p>Service Level Agreements should be challenging but achievable. Setting overly aggressive SLAs leads to rushed, poor-quality responses. Instead, set targets that allow for thorough, thoughtful support while still being responsive.</p>

      <h2>10. Celebrate Wins and Learn from Losses</h2>
      <p>Recognize exceptional service publicly. Share customer compliments with the team. But also create a blameless culture where mistakes become learning opportunities. Regular retrospectives help teams improve continuously.</p>

      <h2>Conclusion</h2>
      <p>Exceptional customer support isn't about having the most advanced tools or the fastest response times - it's about genuinely caring about your customers' success and continuously improving how you help them. These practices provide a framework, but the real magic comes from your team's commitment to excellence.</p>

      <p>What practices have worked best for your support team? Share your experiences in the comments below!</p>
    `,
    excerpt: 'Discover the proven strategies that top support teams use to delight customers and build lasting relationships.',
    category: 'best-practices',
    author: 'Sarah Johnson',
    date: 'March 15, 2024',
    readTime: '8 min read',
    image: '📊',
    tags: ['Customer Success', 'Support Strategy', 'Best Practices']
  }

  const blogPost = { ...defaultPost, ...post }

  return (
    <>
      <Head title={`${blogPost.title} - Support Desk Blog`} />
      
      <SiteLayout scrollY={scrollY}>
        {/* Hero Section - Modern Gradient Background */}
        <section className="relative py-16 overflow-hidden">
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-60"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Back to Blog */}
            <Link href="/blog" className="inline-flex items-center gap-2 font-medium mb-8 transition-all hover:gap-3 group" style={{ color: COLORS.primary }}>
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {blogPost.tags.map((tag, idx) => (
                <span 
                  key={idx}
                  className="px-4 py-2 text-xs font-bold rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer backdrop-blur-sm"
                  style={{ 
                    backgroundColor: `${COLORS.primary}15`, 
                    color: COLORS.primary,
                    border: `1px solid ${COLORS.primary}30`
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title with Modern Typography */}
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
              {blogPost.title}
            </h1>

            {/* Meta Info - Enhanced Design */}
            <div className="flex flex-wrap items-center gap-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg" 
                       style={{ backgroundColor: COLORS.primary }}>
                    {blogPost.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">{blogPost.author}</div>
                  <div className="text-sm text-gray-600">{blogPost.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">{blogPost.readTime}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Image - Modern Card Design */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-16 relative z-20">
          <div className="rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 flex items-center justify-center relative group" style={{ height: '500px' }}>
            <span className="text-9xl transform group-hover:scale-110 transition-transform duration-500">{blogPost.image}</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>

        {/* Article Content - Enhanced Readability */}
        <article className="pb-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Reading Progress Bar */}
            <div className="sticky top-16 h-1 bg-gray-100 mb-12 rounded-full overflow-hidden z-30">
              <div className="h-full transition-all duration-300" style={{ 
                width: `${Math.min((scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100, 100)}%`,
                backgroundColor: COLORS.primary 
              }}></div>
            </div>

            <div className="prose prose-lg max-w-none">
              <div 
                className="article-content"
                dangerouslySetInnerHTML={{ __html: blogPost.content }}
              />
            </div>

            {/* Article Footer - Modern Card */}
            <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg" 
                       style={{ backgroundColor: COLORS.primary }}>
                    {blogPost.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Written by</div>
                    <div className="font-bold text-gray-900 text-xl">{blogPost.author}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-3 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group" title="Share on Facebook">
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                  <button className="p-3 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group" title="Share on Twitter">
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </button>
                  <button className="p-3 rounded-xl border-2 border-gray-200 hover:border-blue-700 hover:bg-blue-50 transition-all group" title="Share on LinkedIn">
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-700 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </button>
                  <button className="p-3 rounded-xl border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all group" title="Copy link">
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts - Enhanced Design */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Continue Reading</h2>
              <p className="text-lg text-gray-600">More insights to help you succeed</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <RelatedPostCard
                title="How to Reduce Response Times by 70% with Smart Automation"
                excerpt="Learn how automation and AI-powered routing can dramatically improve your team's efficiency."
                author="Michael Chen"
                date="March 10, 2024"
                readTime="6 min read"
                icon="⚡"
                slug="reduce-response-times"
              />
              <RelatedPostCard
                title="Building a Knowledge Base That Actually Gets Used"
                excerpt="Your knowledge base should reduce tickets, not add to the confusion."
                author="Emily Rodriguez"
                date="March 5, 2024"
                readTime="7 min read"
                icon="📚"
                slug="knowledge-base-guide"
              />
              <RelatedPostCard
                title="SLA Management: Setting Realistic Expectations"
                excerpt="Master the art of creating SLAs that keep customers happy while maintaining team sanity."
                author="David Park"
                date="February 28, 2024"
                readTime="5 min read"
                icon="⏱️"
                slug="sla-management"
              />
            </div>
          </div>
        </section>

        {/* Newsletter CTA - Enhanced Design */}
        <section className="relative py-24 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)` }}></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl"></div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              NEWSLETTER
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              Don't Miss the Next Article
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join 10,000+ support professionals getting weekly insights delivered straight to their inbox
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 rounded-2xl border-0 focus:outline-none focus:ring-4 focus:ring-white/30 text-lg shadow-xl"
                />
                <button className="px-8 py-4 rounded-2xl text-lg font-bold bg-white hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
                        style={{ color: COLORS.primary }}>
                  Subscribe →
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4 text-white/80">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">No spam. Unsubscribe anytime.</span>
              </div>
            </div>
          </div>
        </section>
      </SiteLayout>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .article-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        
        .article-content h2 {
          font-size: 2rem;
          font-weight: 800;
          color: #111827;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 3px solid ${COLORS.primary}20;
          line-height: 1.3;
        }
        
        .article-content h2:first-child {
          margin-top: 0;
        }
        
        .article-content p {
          margin-bottom: 1.75rem;
          font-size: 1.125rem;
          line-height: 1.9;
          color: #374151;
        }
        
        .article-content a {
          color: ${COLORS.primary};
          text-decoration: none;
          font-weight: 600;
          border-bottom: 2px solid ${COLORS.primary}40;
          transition: all 0.2s;
        }
        
        .article-content a:hover {
          border-bottom-color: ${COLORS.primary};
        }
        
        .article-content ul, .article-content ol {
          margin-bottom: 2rem;
          padding-left: 2rem;
        }
        
        .article-content li {
          margin-bottom: 0.75rem;
          font-size: 1.125rem;
          line-height: 1.8;
          color: #374151;
        }
        
        .article-content strong {
          color: #111827;
          font-weight: 700;
        }
        
        .article-content blockquote {
          border-left: 4px solid ${COLORS.primary};
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .article-content code {
          background: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.875em;
          color: ${COLORS.primary};
          font-family: 'Monaco', 'Courier New', monospace;
        }
      `}</style>
    </>
  )
}

// Related Post Card Component - Enhanced Design
function RelatedPostCard({ title, excerpt, author, date, readTime, icon, slug }) {
  return (
    <Link 
      href={`/blog/${slug}`} 
      className="group relative bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-3"
    >
      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Icon Section */}
      <div className="relative h-48 flex items-center justify-center text-8xl bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-purple-50 group-hover:to-blue-50 transition-all duration-300">
        <div className="transform group-hover:scale-125 group-hover:rotate-6 transition-transform duration-300">
          {icon}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="relative p-8">
        {/* Reading Time Badge */}
        <div className="absolute -top-4 right-8 flex items-center gap-1 px-3 py-1 bg-white rounded-full shadow-md text-xs font-semibold text-gray-600">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {readTime}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 transition-all">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6 leading-relaxed line-clamp-2">
          {excerpt}
        </p>
        
        {/* Author Info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-700">{author}</span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all" style={{ color: COLORS.primary }}>
            Read more
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
