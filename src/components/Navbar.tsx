import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import toast from 'react-hot-toast'
import InviteFriendsModal from './InviteFriendsModal'

// Navigation items configuration
const NAV_ITEMS = [
  { path: '/convert-text', label: 'Quick Focus', isMain: true },
  { path: '/pricing', label: 'Pricing', isMain: false },
  { path: '/solutions', label: 'Solutions', isMain: false },
  { path: '/discord', label: 'Discord', isMain: false }
]

const Navbar = () => {
  // Hooks
  const session = useSession()
  const supabase = useSupabaseClient()
  const navigate = useNavigate()
  const location = useLocation()
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Get referral code from URL if present
  const searchParams = new URLSearchParams(location.search)
  const referralCode = searchParams.get('ref')

  // Event handlers
  const handleSignOut = async () => {
    try {
      if (!session) {
        navigate('/convert-text')
        return
      }

      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      navigate('/convert-text')
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Error signing out')
    }
  }

  const handleLogin = async () => {
    try {
      const redirectUrl = `${window.location.origin}/convert-text${referralCode ? `?ref=${referralCode}` : ''}`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      })
      
      if (error) {
        console.error('Detailed sign in error:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        throw error;
      }

      if (!data) {
        toast.error('Unable to initialize Google sign in');
        return;
      }

      toast.success('Redirecting to Google sign in...');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error?.message || 'Error signing in with Google. Please try again.');
    }
  }

  // Handle referral after successful signup
  useEffect(() => {
    const handleReferral = async () => {
      if (session?.user && referralCode && referralCode !== session.user.id) {
        try {
          // Check if this referral already exists
          const { data: existingReferral } = await supabase
            .from('referrals')
            .select('*')
            .eq('referrer_id', referralCode)
            .eq('referred_id', session.user.id)
            .single();

          if (!existingReferral) {
            // Create new referral record
            const { error: insertError } = await supabase
              .from('referrals')
              .insert({
                referrer_id: referralCode,
                referred_id: session.user.id,
              });

            if (insertError) throw insertError;

            // Call the database function to handle referral
            const { error: handleError } = await supabase
              .rpc('handle_referral', {
                p_referrer_id: referralCode,
                p_new_user_id: session.user.id
              });

            if (handleError) throw handleError;

            toast.success('Referral bonus applied!');
          }
        } catch (error) {
          console.error('Error processing referral:', error);
        }
      }
    };

    handleReferral();
  }, [session, referralCode, supabase]);

  const isMainPath = ['/convert-text', '/convert-files', '/convert-files-signin', '/'].includes(location.pathname)

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-[40px] h-[40px] mr-8 relative group">
                {/* Animated Orange Logo */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full transform group-hover:scale-110 transition-transform duration-300">
                  <div className="absolute inset-[2px] bg-white rounded-full">
                    <div className="absolute inset-[2px] bg-gradient-to-br from-orange-400 to-orange-500 rounded-full animate-pulse">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full animate-ping" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              {NAV_ITEMS.map(item => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`px-4 py-2 rounded-full font-medium ${
                    (item.isMain && isMainPath) || (!item.isMain && location.pathname === item.path)
                      ? 'bg-[#e3f3ff] text-[#164fff]' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 px-5 py-2 bg-[#4475F2] text-white font-medium rounded-full hover:bg-[#2954c8] transition-colors"
                >
                  Get 2 Months Pro Free!
                </button>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Sign Out
                </button>
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
                  className="flex items-center gap-2 px-4 py-2 bg-[#4475F2] text-white font-medium rounded-full hover:bg-[#2954c8] transition-all duration-300 shadow-[0_2px_8px_rgba(68,117,242,0.25)] hover:shadow-[0_4px_12px_rgba(68,117,242,0.35)] hover:-translate-y-[1px]"
                >
                  <img src="/icons/google.png" alt="Google" className="w-3 h-3" />
                  Sign up with Google
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Invite Friends Modal */}
      <InviteFriendsModal 
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </nav>
  )
}

export default Navbar 