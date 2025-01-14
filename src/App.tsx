import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import ConvertText from './components/ConvertText'
import ConvertFiles from './components/ConvertFiles'
import ConvertFilesSignIn from './components/ConvertFilesSignIn'
import Pricing from './components/Pricing'
import Solutions from './components/Solutions'
import Logo from './components/Logo'
import InviteFriendsModal from './components/InviteFriendsModal'
import toast from 'react-hot-toast'

function App() {
  const session = useSession()
  const location = useLocation()
  const supabase = useSupabaseClient()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
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

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/convert-text`,
        },
      })
      
      if (error) throw error
      toast.success('Signing in with Google...')
    } catch (error) {
      toast.error('Error signing in with Google')
      console.error(error)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Logged out successfully')
      setShowProfileMenu(false)
    } catch (error) {
      toast.error('Error logging out')
      console.error(error)
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
                  to="/home" 
                  className={`px-4 py-2 rounded-full font-medium ${
                    location.pathname === '/home' || 
                    location.pathname === '/' ||
                    location.pathname === '/convert-text' ||
                    location.pathname === '/convert-files'
                      ? 'bg-[#e3f3ff] text-[#164fff]' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Quick Focus
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
                  to="/solutions" 
                  className={`px-4 py-2 rounded-full font-medium ${
                    location.pathname === '/solutions' 
                      ? 'bg-[#e3f3ff] text-[#164fff]' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Solutions
                </Link>
                <Link 
                  to="/discord" 
                  className={`px-4 py-2 rounded-full font-medium ${
                    location.pathname === '/discord' 
                      ? 'bg-[#e3f3ff] text-[#164fff]' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Discord
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {session ? (
                <>
                  <button 
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-5 py-2 bg-[#4475F2] text-white font-medium rounded-full hover:bg-[#2954c8] transition-colors"
                  >
                    <img src="/icons/target.png" alt="Target" className="w-5 h-5" />
                    Get 2 Months Pro Free!
                  </button>
                  <div className="relative flex items-center">
                    <button 
                      onClick={() => setShowProfileMenu(!showProfileMenu)} 
                      className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-offset-2 ring-transparent hover:ring-[#4475F2] transition-all duration-200"
                    >
                      <img src={session.user?.user_metadata?.avatar_url} alt="Profile" className="w-full h-full object-cover" />
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
                              src={session.user?.user_metadata?.avatar_url} 
                              alt="Profile" 
                              className="w-16 h-16 rounded-full ring-2 ring-white shadow-sm"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {session.user?.user_metadata?.full_name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {session.user?.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gray-100" />

                        {/* Sign Out Button */}
                        <div className="p-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
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
          <Route path="/home" element={<Navigate to="/convert-text" replace />} />
          <Route path="/convert-text" element={<ConvertText />} />
          <Route path="/convert-files" element={<ConvertFiles />} />
          <Route path="/convert-files-signin" element={<ConvertFilesSignIn />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/solutions" element={<Solutions />} />
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