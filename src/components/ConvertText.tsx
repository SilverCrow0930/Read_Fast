import React, { useState, useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

// Constants
const MAX_FREE_CHARS = 5000
const MAX_AUTH_CHARS = 50000
const MAX_ULTIMATE_CHARS = Infinity

const ConvertText = () => {
  // State
  const session = useSession()
  const [text, setText] = useState('')
  const [convertedText, setConvertedText] = useState('')
  const [isUltimate, setIsUltimate] = useState(false)

  const supabase = useSupabaseClient()

  // Check user subscription on mount and session change
  useEffect(() => {
    const checkSubscription = async () => {
      if (!session?.user?.id) return
      // TODO: Check if user has Ultimate subscription
      setIsUltimate(false)
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
        if (word.length <= 1) return word
        // For words with 3 characters or less, only bold the first letter
        const boldLength = word.length <= 3 ? 1 : Math.ceil(word.length * 0.4)
        return `<strong>${word.slice(0, boldLength)}</strong>${word.slice(boldLength)}`
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

  return (
    <div className="mx-[150px]">
      {/* Navigation Tabs */}
      <div className="animate-[slideIn_0.3s_ease-out]">
        <div className="flex items-center mb-8 gap-4">
          <Link
            to="/convert-text"
            className="flex items-center gap-3 px-6 py-3 bg-[#EEF1FF] rounded-xl font-medium text-[#4475F2] shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-[1px]"
          >
            <img src="/icons/translate.png" alt="Translate" className="w-5 h-5" />
            <div>
              <span className="block">Convert text</span>
              <span className="text-xs text-[#4475F2]/60">35 languages</span>
            </div>
          </Link>
          <Link
            to={session ? "/convert-files" : "/convert-files-signin"}
            className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-[1px]"
          >
            <img src="/icons/document.png" alt="Document" className="w-5 h-5" />
            <div>
              <span className="block">Convert files</span>
              <span className="text-xs text-gray-400">Up to 50MB</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
        <div className="grid grid-cols-2 gap-0 relative">
          {/* Input Section */}
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
              className="w-full h-[500px] px-8 py-6 border-r border-gray-200 focus:outline-none focus:ring-0 resize-none font-['Poppins']"
              placeholder="Make your text easier to read"
            />
          </div>

          {/* Arrow Indicator */}
          <div className="absolute left-1/2 top-[22px] -translate-x-1/2">
            <img src="/icons/next.png" alt="Arrow" className="w-4 h-4 opacity-40" />
          </div>

          {/* Output Section */}
          <div>
            <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200">
              <h2 className="text-sm font-medium text-black font-['Poppins']">Quick focus</h2>
            </div>
            <div
              className="w-full h-[500px] px-8 py-6 border-r border-gray-200 overflow-auto font-['Poppins'] whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: convertedText }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConvertText 