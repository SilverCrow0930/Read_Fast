import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

// Constants
const MAX_FREE_SIZE = 0 // 0MB for unauthorized users
const MAX_AUTH_SIZE = 50 * 1024 * 1024 // 50MB for signed users
const MAX_ULTIMATE_SIZE = 100 * 1024 * 1024 // 100MB for ultimate users
const STORAGE_BUCKET = 'conversions'

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/epub+zip': ['.epub'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt']
}

const ConvertFiles = () => {
  const session = useSession()
  const supabase = useSupabaseClient()
  const [isUltimate] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  const getMaxSize = () => {
    if (!session) return MAX_FREE_SIZE
    return isUltimate ? MAX_ULTIMATE_SIZE : MAX_AUTH_SIZE
  }

  const handleFileUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    return fileName
  }

  const handleFileDownload = async (fileName: string, originalName: string) => {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(fileName)

    if (error) {
      console.error('Download error:', error)
      throw error
    }

    if (!data) {
      throw new Error('No data received')
    }

    const blob = new Blob([data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `converted-${originalName}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleFileCleanup = async (fileName: string) => {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([fileName])

    if (error) {
      console.error('Cleanup error:', error)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const maxSize = getMaxSize()
    if (file.size > maxSize) {
      toast.error(`File size exceeds the limit (${maxSize / 1024 / 1024}MB)`)
      return
    }

    setIsConverting(true)
    let uploadedFileName: string | null = null

    try {
      // Upload file
      uploadedFileName = await handleFileUpload(file)

      // Simulate conversion (replace with actual conversion later)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Download converted file
      await handleFileDownload(uploadedFileName, file.name)
      toast.success('File converted successfully!')

    } catch (error: any) {
      console.error('Conversion error:', error)
      if (error.message?.includes('bucket') || (error as any).statusCode === 404) {
        toast.error('Storage system not configured properly')
      } else if ((error as any).statusCode === 403) {
        toast.error('Permission denied. Please sign in again.')
      } else {
        toast.error('Error processing file')
      }
    } finally {
      // Cleanup
      if (uploadedFileName) {
        await handleFileCleanup(uploadedFileName)
      }
      setIsConverting(false)
    }
  }, [session, isUltimate, supabase])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
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
              <span className="text-xs text-gray-400">35 languages</span>
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

      <div className="bg-white rounded-2xl p-12 shadow-sm hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-col items-center justify-center">
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
              ${!session ? 'opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            {isConverting ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#4475F2] border-t-transparent rounded-full animate-spin"></div>
                <div className="text-[#4475F2] font-medium">Converting your file...</div>
              </div>
            ) : isDragActive ? (
              <div className="text-[#4475F2] font-medium text-lg">Drop your file here</div>
            ) : (
              <div className="text-gray-600">
                {session ? (
                  <>
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <div className="p-4 bg-[#EEF1FF] rounded-xl">
                        <img src="/icons/cloud-uploading.png" alt="Upload" className="w-8 h-8" />
                      </div>
                      <span className="text-[#4475F2] font-medium text-lg">Upload from computer</span>
                    </div>
                    <p className="text-gray-400 mb-6">or drag and drop your file here</p>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">
                        Supported formats: PDF, EPUB, DOCX, TXT
                      </p>
                      <p className="text-sm text-gray-500">
                        Maximum file size: {(getMaxSize() / 1024 / 1024).toFixed(0)}MB
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-lg mb-4">Please sign in to convert files</p>
                    <Link 
                      to="/login"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#4475F2] text-white font-medium rounded-xl hover:bg-[#3461d6] transition-colors duration-300"
                    >
                      <img src="/icons/google.png" alt="Google" className="w-6 h-6" />
                      Sign in with Google
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConvertFiles 