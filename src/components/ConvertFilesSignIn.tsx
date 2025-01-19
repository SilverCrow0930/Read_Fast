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
              <span className="text-xs text-[#4475F2]/60">Up to 10MB</span>
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
          Premium Features for File Conversion
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
              Convert multiple PDF files at once. Process entire folders efficiently with our advanced batch conversion system.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-8 p-4 transform group-hover:scale-110 transition-transform duration-300">
              <img src="/icons/translate.png" alt="Priority Processing" className="w-full h-full invert" />
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Priority Processing
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Get faster conversions with our priority queue. Premium users enjoy higher processing speeds and larger file size limits.
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
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
            <p className="text-gray-600 mb-6 italic">
              "The Pro features are worth every penny. Being able to process multiple files at once and handle larger documents has transformed my workflow. The quality of conversion is unmatched."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <div>
                <h4 className="font-semibold">Alex Rivera</h4>
                <p className="text-sm text-gray-500">Academic Researcher</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
            <p className="text-gray-600 mb-6 italic">
              "The secure cloud storage is a game-changer. I can start working on my desktop and continue on my tablet seamlessly. The fast read feature makes it perfect for reviewing on the go."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              <div>
                <h4 className="font-semibold">Lisa Chang</h4>
                <p className="text-sm text-gray-500">Digital Nomad & Writer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConvertFilesSignIn 