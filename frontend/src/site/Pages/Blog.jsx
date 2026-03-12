import React, { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import SiteLayout from '../components/SiteLayout'
import { COLORS } from '../constants/theme'

const DARK_THEME = {
  darkBg: '#0a1628',
  darkBgSecondary: '#0d2847',
  cardBg: 'rgba(13, 40, 71, 0.6)',
  border: 'rgba(255, 255, 255, 0.1)',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
}

const blogPosts = [
  {
    id: 1,
    title: '10 Best Practices for Exceptional Customer Support in 2024',
    excerpt: 'Discover the proven strategies that top support teams use to delight customers and build lasting relationships.',
    category: 'best-practices',
    author: 'Sarah Johnson',
    authorRole: 'Head of Customer Success',
    date: 'March 15, 2024',
    readTime: '8 min read',
    image: '📊',
    gradient: 'from-purple-500 to-pink-500',
    tags: ['Customer Success', 'Support Strategy', 'Best Practices'],
    featured: true,
  },
  {
    id: 2,
    title: 'How to Reduce Response Times by 70% with Smart Automation',
    excerpt: 'Learn how automation and AI-powered routing can dramatically improve your team efficiency without sacrificing quality.',
    category: 'automation',
    author: 'Michael Chen',
    authorRole: 'Engineering Lead',
    date: 'March 10, 2024',
    readTime: '6 min read',
    image: '⚡',
    gradient: 'from-blue-500 to-cyan-500',
    tags: ['Automation', 'Efficiency', 'AI'],
    featured: true,
  },
  {
    id: 3,
    title: 'Building a Knowledge Base That Actually Gets Used',
    excerpt: 'Your knowledge base should reduce tickets, not add to the confusion. Here is how to create one that customers love.',
    category: 'knowledge-base',
    author: 'Emily Rodriguez',
    authorRole: 'Content Strategist',
    date: 'March 5, 2024',
    readTime: '7 min read',
    image: '📚',
    gradient: 'from-amber-500 to-orange-500',
    tags: ['Knowledge Base', 'Self-Service', 'Documentation'],
  },
  {
    id: 4,
    title: 'SLA Management: Setting Realistic Expectations',
    excerpt: 'Master the art of creating SLAs that keep customers happy while maintaining team sanity.',
    category: 'sla',
    author: 'David Park',
    authorRole: 'Operations Director',
    date: 'February 28, 2024',
    readTime: '5 min read',
    image: '⏱️',
    gradient: 'from-green-500 to-emerald-500',
    tags: ['SLA', 'Expectations', 'Management'],
  },
  {
    id: 5,
    title: 'Case Study: How TechCorp Scaled Support from 10 to 100 Agents',
    excerpt: 'A detailed look at how one company grew their support operation without compromising quality or culture.',
    category: 'case-study',
    author: 'Sarah Johnson',
    authorRole: 'Head of Customer Success',
    date: 'February 22, 2024',
    readTime: '10 min read',
    image: '📈',
    gradient: 'from-rose-500 to-red-500',
    tags: ['Case Study', 'Scaling', 'Team Growth'],
  },
  {
    id: 6,
    title: 'The Remote Support Team Playbook: Tools, Tips, and Tactics',
    excerpt: 'Everything you need to build and manage a world-class distributed support team.',
    category: 'remote',
    author: 'Alex Kumar',
    authorRole: 'Remote Team Lead',
    date: 'February 15, 2024',
    readTime: '9 min read',
    image: '🌍',
    gradient: 'from-indigo-500 to-violet-500',
    tags: ['Remote Work', 'Team Management', 'Collaboration'],
  },
]

const categories = [
  { id: 'all', name: 'All Posts', icon: '📰' },
  { id: 'best-practices', name: 'Best Practices', icon: '⭐' },
  { id: 'automation', name: 'Automation', icon: '🤖' },
  { id: 'case-study', name: 'Case Studies', icon: '📋' },
  { id: 'knowledge-base', name: 'Knowledge Base', icon: '📚' },
  { id: 'sla', name: 'SLA', icon: '⏱️' },
  { id: 'remote', name: 'Remote Work', icon: '🌐' },
]

export default function Blog() {
  const [scrollY, setScrollY] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const filteredPosts = selectedCategory === 'all'
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory)

  const featuredPosts = blogPosts.filter(p => p.featured)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 5000)
    }
  }

  return (
    <>
      <Head title="Blog - ImaraDesk" />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(130, 80, 132, 0.4); }
          50% { box-shadow: 0 0 40px rgba(130, 80, 132, 0.7); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-slideInLeft { animation: slideInLeft 0.6s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        
        .gradient-text {
          background: linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.primaryActive} 50%, #ffffff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glass-card {
          background: rgba(13, 40, 71, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .glass-card-hover:hover {
          background: rgba(13, 40, 71, 0.8);
          border-color: rgba(130, 80, 132, 0.5);
          transform: translateY(-8px);
        }
        
        .card-shimmer {
          position: relative;
          overflow: hidden;
        }
        .card-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
          pointer-events: none;
        }
      `}</style>

      <SiteLayout scrollY={scrollY} darkMode={true}>
        {/* Hero Section */}
        <section className="relative py-32 overflow-hidden" style={{ background: `linear-gradient(135deg, ${DARK_THEME.darkBg} 0%, ${DARK_THEME.darkBgSecondary} 50%, ${DARK_THEME.darkBg} 100%)` }}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-20 blur-3xl animate-float" 
                 style={{ background: `radial-gradient(circle, ${COLORS.primaryLight}, transparent)` }} />
            <div className="absolute bottom-20 left-20 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl" 
                 style={{ background: `radial-gradient(circle, ${COLORS.primaryActive}, transparent)`, animationDelay: '2s' }} />
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                The ImaraDesk
                <span className="gradient-text"> Blog</span>
              </h1>
              <p className="text-xl mb-12 animate-fadeInUp" style={{ color: DARK_THEME.textSecondary, animationDelay: '0.2s' }}>
                Expert insights, strategies, and best practices to help you deliver exceptional customer support and build products customers love.
              </p>

              {/* Subscribe Form */}
              <form onSubmit={handleSubscribe} className="max-w-xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <div className="glass-card rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-all"
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 rounded-xl font-semibold transition-all transform hover:scale-105"
                    style={{ backgroundColor: COLORS.primaryLight, color: 'white' }}
                  >
                    {subscribed ? '✓ Subscribed!' : 'Subscribe'}
                  </button>
                </div>
                <p className="text-sm mt-3" style={{ color: DARK_THEME.textMuted }}>
                  Join 10,000+ support professionals. No spam, unsubscribe anytime.
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        <section className="py-20" style={{ background: DARK_THEME.darkBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Featured Articles</h2>
                <p style={{ color: DARK_THEME.textMuted }}>Hand-picked for you</p>
              </div>
              <Link href="#all-posts" className="flex items-center gap-2 font-semibold transition-all hover:gap-4" style={{ color: COLORS.primaryLight }}>
                View all posts
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post, idx) => (
                <FeaturedCard key={post.id} post={post} delay={idx * 150} />
              ))}
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-4 sticky top-16 z-20" style={{ background: DARK_THEME.darkBgSecondary, borderBottom: `1px solid ${DARK_THEME.border}` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${selectedCategory === category.id ? 'text-white scale-105' : ''}`}
                  style={selectedCategory === category.id 
                    ? { backgroundColor: COLORS.primary } 
                    : { color: DARK_THEME.textSecondary, backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <span>{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* All Posts Grid */}
        <section id="all-posts" className="py-20" style={{ background: `linear-gradient(180deg, ${DARK_THEME.darkBgSecondary} 0%, ${DARK_THEME.darkBg} 100%)` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Latest <span className="gradient-text">Articles</span>
              </h2>
              <p style={{ color: DARK_THEME.textSecondary }}>
                {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} in {selectedCategory === 'all' ? 'all categories' : categories.find(c => c.id === selectedCategory)?.name}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, idx) => (
                <BlogCard key={post.id} post={post} delay={idx * 100} />
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-2xl font-bold text-white mb-2">No articles found</h3>
                <p style={{ color: DARK_THEME.textMuted }}>Try selecting a different category</p>
              </div>
            )}
          </div>
        </section>

        {/* Resources Section */}
        <section className="py-20" style={{ background: DARK_THEME.darkBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                More <span className="gradient-text">Resources</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ResourceCard icon="📖" title="Support Metrics Guide" description="Complete guide to tracking and improving the metrics that matter most." gradient="from-purple-600 to-pink-600" />
              <ResourceCard icon="🎓" title="Customer Success Academy" description="Free courses on support excellence, team management, and customer experience." gradient="from-blue-600 to-cyan-600" />
              <ResourceCard icon="🎙️" title="Support Leaders Podcast" description="Weekly interviews with support leaders from top companies around the world." gradient="from-amber-600 to-orange-600" />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${DARK_THEME.darkBgSecondary} 0%, ${DARK_THEME.darkBg} 100%)` }}>
          <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse at center, ${COLORS.primary}40 0%, transparent 70%)` }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Never Miss an Update</h2>
            <p className="text-xl mb-10" style={{ color: DARK_THEME.textSecondary }}>
              Get the latest insights delivered straight to your inbox every week.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="#" className="px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 animate-pulse-glow" style={{ backgroundColor: COLORS.primaryLight, color: 'white' }}>
                Subscribe to Newsletter →
              </Link>
              <Link href="/docs" className="px-8 py-4 rounded-full text-lg font-semibold transition-all hover:bg-white/10" style={{ border: `2px solid ${COLORS.primaryLight}`, color: COLORS.primaryLight }}>
                Browse Documentation
              </Link>
            </div>
          </div>
        </section>
      </SiteLayout>
    </>
  )
}

function FeaturedCard({ post, delay }) {
  return (
    <Link href={`/blog/${post.id}`} className="group block glass-card rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] card-shimmer animate-fadeInUp" style={{ animationDelay: `${delay}ms` }}>
      <div className={`h-48 bg-gradient-to-br ${post.gradient} flex items-center justify-center relative overflow-hidden`}>
        <span className="text-8xl group-hover:scale-125 transition-transform duration-500">{post.image}</span>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/30 text-white backdrop-blur-sm">FEATURED</span>
        </div>
      </div>
      <div className="p-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${COLORS.primary}30`, color: COLORS.primaryLight }}>
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-white/90 transition-colors line-clamp-2">{post.title}</h3>
        <p className="mb-6 line-clamp-2" style={{ color: DARK_THEME.textSecondary }}>{post.excerpt}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: `${COLORS.primary}30` }}>
              {post.author.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-medium text-white">{post.author}</div>
              <div className="text-xs" style={{ color: DARK_THEME.textMuted }}>{post.authorRole}</div>
            </div>
          </div>
          <div className="text-sm" style={{ color: DARK_THEME.textMuted }}>{post.readTime}</div>
        </div>
      </div>
    </Link>
  )
}

function BlogCard({ post, delay }) {
  return (
    <Link href={`/blog/${post.id}`} className="group block glass-card glass-card-hover rounded-2xl overflow-hidden transition-all duration-500 animate-fadeInUp" style={{ animationDelay: `${delay}ms` }}>
      <div className={`h-40 bg-gradient-to-br ${post.gradient} flex items-center justify-center relative overflow-hidden`}>
        <span className="text-6xl group-hover:scale-125 transition-transform duration-500">{post.image}</span>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${COLORS.primary}30`, color: COLORS.primaryLight }}>
            {categories.find(c => c.id === post.category)?.name || post.category}
          </span>
          <span className="text-xs" style={{ color: DARK_THEME.textMuted }}>{post.readTime}</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white/90 transition-colors line-clamp-2">{post.title}</h3>
        <p className="text-sm mb-4 line-clamp-2" style={{ color: DARK_THEME.textSecondary }}>{post.excerpt}</p>
        <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${DARK_THEME.border}` }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: `${COLORS.primary}30` }}>
              {post.author.charAt(0)}
            </div>
            <span className="text-sm text-white">{post.author}</span>
          </div>
          <span className="text-xs" style={{ color: DARK_THEME.textMuted }}>{post.date}</span>
        </div>
      </div>
    </Link>
  )
}

function ResourceCard({ icon, title, description, gradient }) {
  return (
    <div className="group glass-card glass-card-hover rounded-2xl overflow-hidden transition-all duration-500">
      <div className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <span className="text-5xl group-hover:scale-125 transition-transform duration-500">{icon}</span>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm mb-4" style={{ color: DARK_THEME.textSecondary }}>{description}</p>
        <button className="flex items-center gap-2 font-semibold transition-all group-hover:gap-4" style={{ color: COLORS.primaryLight }}>
          Explore
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  )
}
