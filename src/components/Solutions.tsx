
const Solutions = () => {
  const features = [
    {
      title: "Bionic Reading",
      description: "Transform any text into a more readable format using our advanced bionic reading algorithm. Improve comprehension and reading speed.",
      icon: "translate",
      color: "from-blue-500 to-cyan-400"
    },
    {
      title: "File Conversion",
      description: "Convert between EPUB, PDF, and Word formats while preserving formatting. Perfect for professionals and students alike.",
      icon: "document",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Cloud Storage",
      description: "Access your converted files from anywhere. Secure cloud storage with automatic synchronization across devices.",
      icon: "cloud-uploading",
      color: "from-orange-400 to-pink-500"
    }
  ]

  const testimonials = [
    {
      quote: "Quick Focus has revolutionized how I read technical documentation. The bionic reading feature is a game-changer.",
      author: "Sarah Chen",
      role: "Software Engineer"
    },
    {
      quote: "Converting files between formats used to be a hassle. Now it's just a matter of seconds with Quick Focus.",
      author: "Michael Rodriguez",
      role: "Content Creator"
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Solutions that Empower Your Work
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience the perfect blend of innovation and simplicity. Our tools are designed to enhance your productivity and make document handling effortless.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-20">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="mb-6">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} p-4 flex items-center justify-center`}>
                <img 
                  src={`/icons/${feature.icon}.png`} 
                  alt={feature.title}
                  className={`w-8 h-8 ${feature.icon === 'cloud-uploading' ? '' : 'invert'}`}
                />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12 mb-20">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="group">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
              50MB
            </div>
            <div className="text-gray-600">File Size Support</div>
          </div>
          <div className="group">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
              35+
            </div>
            <div className="text-gray-600">Languages Supported</div>
          </div>
          <div className="group">
            <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
              99.9%
            </div>
            <div className="text-gray-600">Conversion Accuracy</div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="mb-6">
                <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-6 italic">{testimonial.quote}</p>
              <div>
                <div className="font-bold">{testimonial.author}</div>
                <div className="text-gray-500 text-sm">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
        <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Workflow?</h2>
        <p className="text-xl mb-8 opacity-90">Join thousands of professionals who trust Quick Focus for their document needs.</p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors transform hover:scale-105">
          Get Started Free
        </button>
      </div>
    </div>
  )
}

export default Solutions 