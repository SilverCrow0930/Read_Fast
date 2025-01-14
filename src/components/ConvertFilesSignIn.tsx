import React from 'react'
import { Link } from 'react-router-dom'

const ConvertFilesSignIn = () => {
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
              <span className="text-xs text-[#4475F2]/60">Up to 50MB</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-12 shadow-sm hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-col items-center justify-center text-center">
          <img src="/icons/document.png" alt="Document" className="w-24 h-24 mb-8 opacity-60" />
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#4475F2] to-[#2954c8] bg-clip-text text-transparent">
            Unlock File Conversion Power
          </h1>
          <p className="text-gray-600 mb-8 max-w-md">
            Sign in to convert your files to any format. Enjoy up to 50MB file size limit and priority conversion.
          </p>
          <Link 
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4475F2] text-white font-medium rounded-xl hover:bg-[#3461d6] transition-colors duration-300"
          >
            <img src="/icons/google.png" alt="Google" className="w-6 h-6" />
            Sign in with Google
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ConvertFilesSignIn 