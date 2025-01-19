import React, { useState, useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

// Constants
const MAX_FREE_CHARS = 5000
const MAX_AUTH_CHARS = 50000
const MAX_ULTIMATE_CHARS = Infinity

// Types
type SubscriptionTier = 'free' | 'pro' | 'ultimate'

interface DbUserSubscription {
  subscription_plans: {
    tier: SubscriptionTier
  }
}

const ConvertText = () => {
  // State
  const session = useSession()
  const [text, setText] = useState('')
  const [convertedText, setConvertedText] = useState('')
  const [isUltimate, setIsUltimate] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const supabase = useSupabaseClient()

  // Check user subscription on mount and session change
  useEffect(() => {
    const checkSubscription = async () => {
      if (!session?.user?.id) {
        setIsUltimate(false)
        setIsPro(false)
        return
      }
      
      try {
        // Check user's subscription from user_subscriptions table
        const { data: userSub, error: subError } = await supabase
          .from('user_subscriptions')
          .select(`
            subscription_plan_id,
            subscription_plans (
              tier
            )
          `)
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .single() as { data: DbUserSubscription | null, error: any }

        if (subError) {
          console.error('Error fetching subscription:', subError)
          setIsUltimate(false)
          setIsPro(false)
          return
        }

        // Set subscription status based on the plan tier
        if (userSub?.subscription_plans?.tier) {
          setIsUltimate(userSub.subscription_plans.tier === 'ultimate')
          setIsPro(userSub.subscription_plans.tier === 'pro')
        } else {
          setIsUltimate(false)
          setIsPro(false)
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
        setIsUltimate(false)
        setIsPro(false)
      }
    }

    checkSubscription()
  }, [session])

  // Utility functions
  const getCharLimit = () => {
    if (isUltimate) return MAX_ULTIMATE_CHARS
    if (session) return MAX_AUTH_CHARS
    return MAX_FREE_CHARS
  }

  const convertToBionic = (text: string) => {
    return text.split('\n').map(line => 
      line.split(' ').map(word => {
        if (word.length === 1) return `<span class="font-semibold">${word}</span>`
        // For words with 3 characters or less, only bold the first letter
        const boldLength = word.length <= 3 ? 1 : Math.ceil(word.length * 0.4)
        return `<span class="font-semibold">${word.slice(0, boldLength)}</span>${word.slice(boldLength)}`
      }).join(' ')
    ).join('\n')
  }

  // Event handlers
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    const charLimit = getCharLimit()

    if (newText.length > charLimit) {
      toast.error(`Character limit (${charLimit.toLocaleString()}) exceeded`)
      return
    }

    setText(newText)
    setConvertedText(convertToBionic(newText))
  }

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
      console.error('Sign in error:', error)
      toast.error('Error signing in with Google')
    }
  }

  const getMaxFileSize = () => {
    if (isUltimate) return '100MB'
    if (isPro) return '50MB'
    return '10MB'  // Free users (whether signed in or not)
  }

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  return (
    <div className="mx-[150px]">
      {/* Navigation Tabs - Always visible */}
      <div className="animate-[slideIn_0.3s_ease-out]">
        <div className="flex items-center mb-8 gap-4">
          <Link
            to="/convert-text"
            className="flex items-center gap-3 px-6 py-3 bg-[#EEF1FF] rounded-xl font-medium text-[#4475F2] shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-[1px]"
          >
            <img src="/icons/translate.png" alt="Translate" className="w-5 h-5" />
            <div>
              <span className="block">Convert text</span>
              <span className="text-xs text-[#4475F2]/60">22 languages</span>
            </div>
          </Link>
          <Link
            to={session ? "/convert-files" : "/convert-files-signin"}
            className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-[1px]"
          >
            <img src="/icons/document.png" alt="Document" className="w-5 h-5" />
            <div>
              <span className="block">Convert files</span>
              <span className="text-xs text-gray-400">Up to {getMaxFileSize()}</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
        <div className={`grid ${isFullScreen ? 'grid-cols-1' : 'grid-cols-2'} gap-0 relative`}>
          {/* Input Section - Hidden in full-screen */}
          {!isFullScreen && (
            <div>
              <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200">
                <h2 className="text-sm font-medium text-black font-['Poppins']">Original text</h2>
                <span className="text-xs text-gray-500">
                  {text.length.toLocaleString()} / {getCharLimit().toLocaleString()} characters
                  {!session && (
                    <button 
                      onClick={handleLogin}
                      className="ml-2 text-[#4475F2] hover:underline"
                    >
                      Sign in for more
                    </button>
                  )}
                </span>
              </div>
              <textarea
                value={text}
                onChange={handleTextChange}
                className="w-full h-[500px] px-8 py-6 border-r border-gray-200 focus:outline-none focus:ring-0 resize-none font-['Poppins'] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
                placeholder="Make your text easier to read"
              />
            </div>
          )}

          {/* Arrow Indicator - Hidden in full-screen */}
          {!isFullScreen && (
            <div className="absolute left-1/2 top-[22px] -translate-x-1/2">
              <img src="/icons/next.png" alt="Arrow" className="w-4 h-4 opacity-40" />
            </div>
          )}

          {/* Output Section */}
          <div className="relative">
            <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200">
              <h2 className="text-sm font-medium text-black font-['Poppins']">Fast Read</h2>
            </div>
            <div
              className={`w-full overflow-auto font-['Poppins'] break-words whitespace-normal scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 bg-white ${
                isFullScreen ? 'h-[calc(100vh-180px)] px-8 py-6' : 'h-[500px] px-8 py-6 border-r border-gray-200'
              }`}
              dangerouslySetInnerHTML={{ __html: convertedText }}
            />
            {/* Full-screen toggle button */}
            <button
              onClick={toggleFullScreen}
              className="absolute bottom-6 right-6 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 z-10"
              title={isFullScreen ? "Exit reader mode" : "Enter reader mode"}
            >
              <img 
                src={isFullScreen ? "/icons/minimize.png" : "/icons/expand.png"} 
                alt={isFullScreen ? "Exit full screen" : "Enter full screen"} 
                className="w-5 h-5 opacity-60"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mt-12 mb-12">
        <div className="grid grid-cols-3 gap-0 bg-[#F8FAFF] rounded-2xl overflow-hidden py-8">
          {/* Users */}
          <div className="p-8 text-center">
            <h3 className="text-5xl font-bold text-[#4475F2] mb-4">
              300K+
            </h3>
            <p className="text-gray-600">Active Users</p>
          </div>

          {/* Languages */}
          <div className="p-8 text-center">
            <h3 className="text-5xl font-bold text-[#B344F2] mb-4">
              22
            </h3>
            <p className="text-gray-600">Languages Supported</p>
          </div>

          {/* Accuracy */}
          <div className="p-8 text-center">
            <h3 className="text-5xl font-bold text-[#F24444] mb-4">
              99.9%
            </h3>
            <p className="text-gray-600">Conversion Accuracy</p>
          </div>
        </div>
      </div>

      {/* Features Section with Enhanced Design */}
      <div className="mb-20">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[#4475F2] via-[#B344F2] to-[#F24444] bg-clip-text text-transparent">
          Powerful Features for Faster Reading
        </h2>
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl mb-8 p-4 transform group-hover:scale-110 transition-transform duration-300">
              <img src="/icons/translate.png" alt="Fast Reading" className="w-full h-full invert" />
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Fast Reading
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Transform any text into a more readable format using our advanced bionic reading algorithm. Improve comprehension and reading speed by up to 50%.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-8 p-4 transform group-hover:scale-110 transition-transform duration-300">
              <img src="/icons/document.png" alt="File Conversion" className="w-full h-full invert" />
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Smart Conversion
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Convert PDF files while preserving perfect formatting. Ideal for professionals and students who need reliable document processing.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl mb-8 p-4 transform group-hover:scale-110 transition-transform duration-300">
              <img src="/icons/cloud-uploading.png" alt="Cloud Storage" className="w-full h-full" />
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              Cloud Sync
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Access your converted files from anywhere with secure cloud storage. Automatic synchronization keeps your documents up-to-date across all devices.
            </p>
          </div>
        </div>
      </div>

      {/* What Our Users Say */}
      <div className="mb-20">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[#4475F2] via-[#B344F2] to-[#F24444] bg-clip-text text-transparent">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl opacity-50">
              "
            </div>
            <p className="text-gray-600 text-lg mb-4 leading-relaxed">
              Read Fast transformed how I digest technical documentation. The fast read feature helps me scan through API docs and research papers 40% faster while maintaining better comprehension.
            </p>
            <div>
              <h4 className="font-bold text-lg">Sarah Chen</h4>
              <p className="text-gray-500">Software Engineer</p>
            </div>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl opacity-50">
              "
            </div>
            <p className="text-gray-600 text-lg mb-4 leading-relaxed">
              As someone who regularly reviews academic papers and technical specs, Read Fast is invaluable. The combination of bionic reading and seamless format conversion helps me process complex information more efficiently.
            </p>
            <div>
              <h4 className="font-bold text-lg">Michael Rodriguez</h4>
              <p className="text-gray-500">Technical Content Creator</p>
            </div>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl opacity-50">
              "
            </div>
            <p className="text-gray-600 text-lg mb-4 leading-relaxed">
              The batch processing feature is a lifesaver. I can convert entire folders of research papers in minutes, and the bionic reading format makes them so much easier to digest.
            </p>
            <div>
              <h4 className="font-bold text-lg">David Park</h4>
              <p className="text-gray-500">Research Scientist</p>
            </div>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-green-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-4xl opacity-50">
              "
            </div>
            <p className="text-gray-600 text-lg mb-4 leading-relaxed">
              The file conversion quality is outstanding. Read Fast is the only tool that consistently maintains formatting and structure across different file types. A must-have for content creators.
            </p>
            <div>
              <h4 className="font-bold text-lg">Emma Thompson</h4>
              <p className="text-gray-500">Digital Content Manager</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConvertText 