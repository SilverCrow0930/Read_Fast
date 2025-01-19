import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import ConvertText from './components/ConvertText'
import ConvertFiles from './components/ConvertFiles'
import ConvertFilesSignIn from './components/ConvertFilesSignIn'
import Pricing from './components/Pricing'
import Logo from './components/Logo'
import InviteFriendsModal from './components/InviteFriendsModal'
import toast from 'react-hot-toast'
import Community from './components/Community'

// Types
type SubscriptionTier = 'free' | 'pro' | 'ultimate'

// Database response type
interface DbUserSubscription {
  subscription_plans: {
    tier: SubscriptionTier
  }
}

function App() {
  const session = useSession()
  const location = useLocation()
  const supabase = useSupabaseClient()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionTier>('free')
  const profileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle session persistence
  useEffect(() => {
    // Check for initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email)
      if (session?.user) {
        fetchSubscription(session.user.id)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email)

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          await fetchSubscription(session.user.id)
          // Don't redirect here, let the OAuth callback handle it
        }
      } else if (event === 'SIGNED_OUT') {
        setSubscription('free')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Separate function to fetch subscription
  const fetchSubscription = async (userId: string) => {
    try {
      const { data: userSub, error: subError } = await supabase
        .from('user_subscriptions')
        .select(`
          subscription_plans!inner (
            tier
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single() as { data: DbUserSubscription | null, error: any }

      if (!subError && userSub?.subscription_plans?.tier) {
        setSubscription(userSub.subscription_plans.tier)
      } else {
        // If no subscription found, create a free one
        const { data: freePlan } = await supabase
          .from('subscription_plans')
          .select('id')
          .eq('tier', 'free')
          .single()

        if (freePlan?.id) {
          await supabase.from('user_subscriptions').insert({
            user_id: userId,
            subscription_plan_id: freePlan.id,
            status: 'active'
          })
          setSubscription('free')
        }
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
      setSubscription('free')
    }
  }

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${import.meta.env.VITE_APP_URL}/convert-text`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) {
        console.error('Google sign in error:', error)
        throw error
      }

      toast.success('Redirecting to Google sign in...')
    } catch (error: any) {
      console.error('Sign in error:', error)
      toast.error(error?.message || 'Error signing in with Google. Please try again.')
    }
  }

  const handleLogout = async () => {
    try {
      // Clear local state first
      setShowProfileMenu(false)
      setSubscription('free')
      
      // Clear any cached state
      localStorage.clear() // Clear all localStorage items
      sessionStorage.clear() // Clear all sessionStorage items
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'local' })
      
      // Force a clean reload
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Error signing out. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-sm">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="w-[40px] h-[40px] mr-8">
                  <Logo />
                </div>
              </Link>
              <div className="flex items-center gap-4">
                <Link 
                  to="/convert-text" 
                  className={`px-4 py-2 rounded-full font-medium ${
                    location.pathname === '/convert-text' || 
                    location.pathname === '/' ||
                    location.pathname === '/convert-files'
                      ? 'bg-[#e3f3ff] text-[#164fff]' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/pricing" 
                  className={`px-4 py-2 rounded-full font-medium ${
                    location.pathname === '/pricing' 
                      ? 'bg-[#e3f3ff] text-[#164fff]' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Pricing
                </Link>
                <Link 
                  to="/community" 
                  className={`px-4 py-2 rounded-full font-medium ${
                    location.pathname === '/community' 
                      ? 'bg-[#e3f3ff] text-[#164fff]' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Community
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {session ? (
                <>
                  <button 
                    onClick={() => setShowInviteModal(true)}
                    className="relative px-6 py-2.5 font-semibold text-white rounded-full overflow-hidden bg-gradient-to-r from-[#4475F2] via-[#4466F2] to-[#7747F2] hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(68,117,242,0.45)] active:scale-[0.98] transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:via-white/5 before:to-transparent before:rounded-full group"
                  >
                    <span className="relative inline-flex items-center">
                      Get 2 Months Pro Free!
                    </span>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
                  </button>
                  <div className="relative flex items-center">
                    <button 
                      onClick={() => setShowProfileMenu(!showProfileMenu)} 
                      className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-offset-2 ring-transparent hover:ring-[#4475F2] transition-all duration-200"
                    >
                      <img 
                        src={session.user?.user_metadata?.avatar_url}
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = '/icons/user-default.png';
                        }}
                      />
                    </button>
                    
                    {/* Profile Modal */}
                    {showProfileMenu && (
                      <div 
                        ref={profileMenuRef}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-200 ease-out z-50"
                        style={{ 
                          top: '100%',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                      >
                        {/* Profile Header */}
                        <div className="p-6">
                          <div className="flex items-center gap-4">
                            <img 
                              src={session.user.user_metadata.avatar_url}
                              alt="Profile" 
                              className="w-16 h-16 rounded-full ring-2 ring-white shadow-sm"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.src = '/icons/user-default.png';
                              }}
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {session.user?.user_metadata?.full_name || session.user?.user_metadata?.name || 'User'}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {session.user?.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Subscription Section */}
                        <div className="px-6 pb-4">
                          <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                            <div>
                              <div className="text-sm text-gray-500">Current Plan</div>
                              <div className="font-semibold text-gray-900 capitalize">{subscription}</div>
                            </div>
                            {subscription !== 'free' && (
                              <button
                                onClick={() => {
                                  // TODO: Handle unsubscribe logic
                                  toast.error('Please contact support to cancel your subscription')
                                }}
                                className="text-sm text-red-500 hover:text-red-600 font-medium"
                              >
                                Unsubscribe
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gray-100" />

                        {/* Sign Out Button */}
                        <div className="p-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleLogin}
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Log in
                  </button>
                  <button 
                    onClick={handleLogin}
                    className="flex items-center gap-2 px-4 py-2 bg-[#4475F2] text-white font-medium rounded-full hover:bg-[#2954c8] transition-all duration-300 shadow-[0_2px_8px_rgba(68,117,242,0.25)] hover:shadow-[0_4px_12px_rgba(68,117,242,0.35)] transform hover:translate-y-[-1px]"
                  >
                    <img src="/icons/google.png" alt="Google" className="w-4 h-4" />
                    Sign up with Google
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/convert-text" replace />} />
          <Route path="/convert-text" element={<ConvertText />} />
          <Route path="/convert-files" element={<ConvertFiles />} />
          <Route path="/convert-files-signin" element={<ConvertFilesSignIn />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/community" element={<Community />} />
        </Routes>
      </main>

      {/* Invite Friends Modal */}
      <InviteFriendsModal 
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  )
}

export default App 