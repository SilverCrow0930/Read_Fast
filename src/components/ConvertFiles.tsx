import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Session } from '@supabase/supabase-js'

// Types
type SubscriptionTier = 'free' | 'pro' | 'ultimate'

interface SubscriptionPlan {
  tier: SubscriptionTier
}

interface UserSubscription {
  subscription_plans: SubscriptionPlan
}

// Database response type
interface DbUserSubscription {
  subscription_plans: {
    tier: SubscriptionTier
  }
}

// Constants
const MAX_FREE_SIZE = 10 * 1024 * 1024 // 10MB for free users
const MAX_PRO_SIZE = 50 * 1024 * 1024 // 50MB for pro users
const MAX_ULTIMATE_SIZE = 100 * 1024 * 1024 // 100MB for ultimate users

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf']
}

const ConvertFiles = () => {
  const [isUltimate, setIsUltimate] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [conversionProgress, setConversionProgress] = useState(0)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const [processingMessage, setProcessingMessage] = useState('')
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // Get initial session and subscription status
    const checkSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      
      if (session?.user) {
        // Check user's subscription from user_subscriptions table
        const { data: userSub, error: subError } = await supabase
          .from('user_subscriptions')
          .select(`
            subscription_plans!inner (
              tier
            )
          `)
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .single() as { data: DbUserSubscription | null, error: any }
        
        if (subError) {
          console.error('Error fetching subscription:', subError)
          // If error or no subscription found, default to free tier
          setIsUltimate(false)
          setIsPro(false)
          return
        }

        // Set subscription status based on the plan tier
        if (userSub?.subscription_plans?.tier) {
          setIsUltimate(userSub.subscription_plans.tier === 'ultimate')
          setIsPro(userSub.subscription_plans.tier === 'pro')
        } else {
          // Default to free tier if no subscription found
          setIsUltimate(false)
          setIsPro(false)
        }
      }
    }
    
    checkSubscription()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        // Check user's subscription from user_subscriptions table
        const { data: userSub, error: subError } = await supabase
          .from('user_subscriptions')
          .select(`
            subscription_plans!inner (
              tier
            )
          `)
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .single() as { data: DbUserSubscription | null, error: any }

        if (subError) {
          console.error('Error fetching subscription:', subError)
          // If error or no subscription found, default to free tier
          setIsUltimate(false)
          setIsPro(false)
          return
        }

        // Set subscription status based on the plan tier
        if (userSub?.subscription_plans?.tier) {
          setIsUltimate(userSub.subscription_plans.tier === 'ultimate')
          setIsPro(userSub.subscription_plans.tier === 'pro')
        } else {
          // Default to free tier if no subscription found
          setIsUltimate(false)
          setIsPro(false)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Add progress animation effect with human-like messages
  useEffect(() => {
    if (isConverting) {
      const messages = [
        "Analyzing document structure...",
        "Extracting text content...",
        "Applying fast reading patterns...",
        "Optimizing for readability...",
        "Preserving document formatting...",
        "Almost there...",
      ]
      
      let messageIndex = 0
      const messageInterval = setInterval(() => {
        setProcessingMessage(messages[messageIndex % messages.length])
        messageIndex++
      }, 3000)

      // Animate progress with natural acceleration and deceleration
      let progress = 0
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => {
          if (prev < 15) return prev + 0.8 // Fast initial progress
          if (prev < 30) return prev + 0.5 // Slow down a bit
          if (prev < 60) return prev + 0.3 // Even slower
          if (prev < 85) return prev + 0.1 // Very slow near the end
          return prev // Stop at 85% until completion
        })
      }, 100)

      return () => {
        clearInterval(messageInterval)
        clearInterval(progressInterval)
      }
    } else {
      setProcessingMessage('')
      setConversionProgress(0)
    }
  }, [isConverting])

  const getMaxSize = () => {
    if (!session) return MAX_FREE_SIZE
    if (isUltimate) return MAX_ULTIMATE_SIZE
    if (isPro) return MAX_PRO_SIZE
    return MAX_FREE_SIZE
  }

  const getTierLimits = () => {
    if (!session) return { maxFiles: 1, maxSize: MAX_FREE_SIZE }
    if (isUltimate) return { maxFiles: Infinity, maxSize: MAX_ULTIMATE_SIZE }
    if (isPro) return { maxFiles: Infinity, maxSize: MAX_PRO_SIZE }
    return { maxFiles: 1, maxSize: MAX_FREE_SIZE }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Show upgrade modal for free users trying to upload multiple files
    if (!isPro && !isUltimate && acceptedFiles.length > 1) {
      toast((t) => (
        <div className="flex items-stretch overflow-hidden bg-white rounded-2xl shadow-2xl">
          {/* Left color band */}
          <div className="w-2 bg-gradient-to-b from-orange-400 to-red-500"></div>
          
          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex items-center gap-6">
              {/* Icon */}
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 p-0.5">
                <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                  <svg 
                    className="w-7 h-7 text-orange-500" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1">
                <h3 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Speed Up Your Workflow
                </h3>
                <p className="text-gray-600 mt-1">
                  Process multiple files instantly with Pro
                </p>
              </div>

              {/* Button */}
              <Link 
                to="/pricing"
                className="group relative flex-shrink-0 px-5 py-2.5 bg-gradient-to-r from-orange-400 to-red-500 text-white font-medium rounded-xl hover:from-orange-500 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 transform"
                onClick={() => toast.dismiss(t.id)}
              >
                <span>View Plans</span>
                <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full group-hover:scale-110 transition-transform">
                  50% OFF
                </span>
              </Link>
            </div>
          </div>
        </div>
      ), {
        duration: 8000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: '0',
          maxWidth: '600px',
          width: '100%'
        },
      })
      return
    }

    const { maxFiles, maxSize } = getTierLimits()
    
    // Check number of files for pro/ultimate users
    if (acceptedFiles.length > maxFiles) {
      toast.error(`You can only convert ${maxFiles} file at a time`)
      return
    }

    // Check total size
    const totalSize = acceptedFiles.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > maxSize) {
      toast.error(`Total file size exceeds the limit (${maxSize / 1024 / 1024}MB)`)
      return
    }

    // Validate file types
    if (acceptedFiles.some(file => !file.type.includes('pdf'))) {
      toast.error('Please upload PDF files only')
      return
    }

    setIsConverting(true)
    setTotalFiles(acceptedFiles.length)
    setCurrentFileIndex(0)
    setConversionProgress(0)

    try {
      // Get current session token
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (!currentSession?.access_token) {
        throw new Error('Please sign in to convert files')
      }

      // Process files sequentially
      const processedFiles = []
      for (let i = 0; i < acceptedFiles.length; i++) {
        setCurrentFileIndex(i)
        const file = acceptedFiles[i]
        
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/convert', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${currentSession.access_token}`,
            'Accept': 'application/pdf',
          },
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.detail || `Failed to convert ${file.name}`)
        }

        const blob = await response.blob()
        processedFiles.push({
          blob,
          filename: `Fast_Read_${file.name.replace('.pdf', '')}.pdf`
        })
      }

      // Set progress to 100% before downloading
      setConversionProgress(100)
      
      // Download all processed files
      for (const { blob, filename } of processedFiles) {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }

      toast.success(
        processedFiles.length > 1 
          ? `Successfully converted ${processedFiles.length} files!`
          : 'Conversion completed!'
      )
    } catch (error: any) {
      console.error('Conversion error:', error)
      toast.error(error.message || 'Conversion failed')
    } finally {
      // Small delay before resetting
      setTimeout(() => {
        setIsConverting(false)
        setConversionProgress(0)
        setCurrentFileIndex(0)
        setTotalFiles(0)
      }, 1000)
    }
  }, [session, isPro, isUltimate])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: undefined, // Allow multiple files selection for everyone
    multiple: true, // Allow multiple files selection for everyone
    disabled: isConverting || !session
  })

  return (
    <div className="max-w-6xl mx-auto px-4 animate-[slideIn_0.3s_ease-out]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link 
            to="/convert-text" 
            className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-[1px]"
          >
            <img src="/icons/translate.png" alt="Translate" className="w-5 h-5" />
            <div>
              <span className="block">Convert text</span>
              <span className="text-xs text-gray-400">22 languages</span>
            </div>
          </Link>
          <Link 
            to="/convert-files" 
            className="flex items-center gap-3 px-6 py-3 bg-[#EEF1FF] rounded-xl font-medium text-[#4475F2] shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-[1px]"
          >
            <img src="/icons/document.png" alt="Document" className="w-5 h-5" />
            <div>
              <span className="block">Convert files</span>
              <span className="text-xs text-[#4475F2]/60">Up to {getMaxSize() / 1024 / 1024}MB</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-12 shadow-sm hover:shadow-lg transition-shadow duration-300 relative">
        <div className="flex flex-col items-center justify-center">
          {/* Show for both signed-in free users and unsigned users */}
          {(!session || (session && !isPro && !isUltimate)) && (
            <div className="absolute -top-3 -right-3">
              <span className="relative inline-flex group">
                <span className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-200"></span>
                <span className="relative inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-sm text-white font-bold px-4 py-1.5 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="currentColor"/>
                  </svg>
                  Enjoy 50MB of uploads with Pro
                </span>
              </span>
            </div>
          )}
          <div className="flex gap-8 mb-10">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img src="/icons/pdf.png" alt="PDF" className="w-20 h-20 transform group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img src="/icons/word.png" alt="Word" className="w-20 h-20 transform group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img src="/icons/epub.png" alt="EPUB" className="w-20 h-20 transform group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          
          <div
            {...getRootProps()}
            className={`
              w-full max-w-2xl border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
              transition-all duration-300 transform
              ${isDragActive ? 'border-[#4475F2] bg-[#EEF1FF] scale-105' : 'border-gray-200 hover:border-[#4475F2] hover:bg-[#EEF1FF]/10'}
              ${isConverting ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            {isConverting ? (
              <div className="flex flex-col items-center gap-6">
                {/* Beautiful loading animation */}
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 rounded-full border-4 border-[#4475F2]/20"></div>
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-[#4475F2] border-t-transparent animate-spin"
                    style={{ 
                      animationDuration: '1.5s',
                      animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' 
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[#4475F2] font-medium text-xl">
                      {Math.round(conversionProgress)}%
                    </span>
                  </div>
                </div>
                
                {/* Processing message with fade effect */}
                <div className="text-center space-y-2">
                  <div className="text-[#4475F2] font-medium text-lg animate-fade-in">
                    {processingMessage}
                  </div>
                  {totalFiles > 1 && (
                    <div className="text-gray-500">
                      Processing file {currentFileIndex + 1} of {totalFiles}
                    </div>
                  )}
                </div>
                
                {/* Progress bar with gradient */}
                <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#4475F2] to-[#6D92FF] rounded-full transition-all duration-300 ease-out"
                    style={{ 
                      width: `${conversionProgress}%`,
                      boxShadow: '0 0 10px rgba(68, 117, 242, 0.5)' 
                    }}
                  ></div>
                </div>
              </div>
            ) : isDragActive ? (
              <div className="text-[#4475F2] font-medium text-lg">Drop your files here</div>
            ) : (
              <div className="text-gray-600">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="p-4 bg-[#EEF1FF] rounded-xl">
                    <img src="/icons/cloud-uploading.png" alt="Upload" className="w-8 h-8" />
                  </div>
                  <span className="text-[#4475F2] font-medium text-lg">Upload from computer</span>
                </div>
                <p className="text-gray-400 mb-6">or drag and drop your files here</p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    Supported format: PDF
                  </p>
                  <p className="text-sm text-gray-500">
                    Maximum file size: {(getMaxSize() / 1024 / 1024).toFixed(0)}MB
                  </p>
                </div>
              </div>
            )}
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
          Powerful Features for File Conversion
        </h2>
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl mb-8 p-4 transform group-hover:scale-110 transition-transform duration-300">
              <img src="/icons/document.png" alt="Batch Processing" className="w-full h-full invert" />
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Batch Processing
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Convert multiple PDF files simultaneously. Save time with our efficient batch processing system designed for large-scale conversions.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-8 p-4 transform group-hover:scale-110 transition-transform duration-300">
              <img src="/icons/translate.png" alt="Smart Formatting" className="w-full h-full invert" />
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Smart Formatting
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Preserve layouts, fonts, and images perfectly during conversion. Our AI ensures your PDF documents maintain their original quality.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl mb-8 p-4 transform group-hover:scale-110 transition-transform duration-300">
              <img src="/icons/cloud-uploading.png" alt="Cloud Storage" className="w-full h-full" />
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              Cloud Storage
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

export default ConvertFiles 