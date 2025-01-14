import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { CheckIcon } from '@heroicons/react/24/solid'

const Pricing = () => {
  const session = useSession()
  const supabase = useSupabaseClient()

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/convert-text`,
      },
    })
  }

  const plans = [
    {
      name: "Free",
      price: "0",
      description: "Perfect for trying out Quick Focus",
      gradient: "from-blue-400 to-cyan-400",
      features: [
        "1,000 characters per text",
        "10MB file size limit",
        "Basic file conversion",
        "Standard support",
      ],
      popular: false
    },
    {
      name: "Pro",
      price: "9",
      description: "Unlock the full power of Quick Focus",
      gradient: "from-purple-500 to-pink-500",
      features: [
        "50,000 characters per text",
        "50MB file size limit",
        "Priority file conversion",
        "Premium support",
        "Advanced formatting options"
      ],
      popular: true
    },
    {
      name: "Ultimate",
      price: "19",
      description: "For power users and teams",
      gradient: "from-orange-400 to-pink-500",
      features: [
        "Unlimited characters",
        "100MB file size limit",
        "Instant file conversion",
        "24/7 priority support",
        "Advanced cloud storage",
        "Custom formatting templates",
        "Team collaboration",
        "Custom API integration",
        "White-label options"
      ],
      popular: false
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Choose Your Perfect Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Unlock the full potential of Quick Focus with our flexible pricing options.
          Start free, upgrade anytime.
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
              plan.popular ? 'ring-2 ring-[#4475F2]' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-[#4475F2] text-white text-sm font-medium px-4 py-1 rounded-full">
                  Most Popular
                </div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="text-gray-600">{plan.description}</p>
            </div>

            <div className="space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center flex-shrink-0`}>
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-600">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={session ? undefined : handleLogin}
              className={`w-full py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                plan.popular
                  ? 'bg-[#4475F2] text-white hover:bg-[#2954c8]'
                  : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
              }`}
            >
              {session ? 'Upgrade Now' : 'Sign Up with Google'}
            </button>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Quick Focus Pro?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 p-4 transform group-hover:scale-110 transition-transform">
              <img src="/icons/translate.png" alt="Speed" className="w-full h-full invert" />
            </div>
            <h3 className="text-xl font-bold mb-4">Lightning Fast</h3>
            <p className="text-gray-600">Convert files and text instantly with our optimized processing engine.</p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-4 transform group-hover:scale-110 transition-transform">
              <img src="/icons/document.png" alt="Accuracy" className="w-full h-full invert" />
            </div>
            <h3 className="text-xl font-bold mb-4">Perfect Accuracy</h3>
            <p className="text-gray-600">Maintain formatting and style with our advanced conversion algorithms.</p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 p-4 transform group-hover:scale-110 transition-transform">
              <img src="/icons/cloud-uploading.png" alt="Security" className="w-full h-full" />
            </div>
            <h3 className="text-xl font-bold mb-4">Secure & Private</h3>
            <p className="text-gray-600">Your files are encrypted and automatically deleted after conversion.</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold mb-4">Can I change plans anytime?</h3>
            <p className="text-gray-600">Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold mb-4">Is there a free trial?</h3>
            <p className="text-gray-600">Yes! Start with our free plan to explore Quick Focus. Upgrade when you're ready for more power.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold mb-4">What payment methods do you accept?</h3>
            <p className="text-gray-600">We accept all major credit cards, PayPal, and offer special enterprise billing options.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold mb-4">Do you offer refunds?</h3>
            <p className="text-gray-600">Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
        <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-xl mb-8 opacity-90">Join thousands of satisfied users who trust Quick Focus for their document needs.</p>
        <button
          onClick={session ? undefined : handleLogin}
          className="bg-white text-blue-600 px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          {session ? 'Upgrade to Pro' : 'Try Quick Focus Free'}
        </button>
      </div>
    </div>
  )
}

export default Pricing 