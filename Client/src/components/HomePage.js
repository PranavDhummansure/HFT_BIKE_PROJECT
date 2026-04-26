function HomePage({ goToSignup }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-slate-200 px-6">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-10 items-center">
        
        {/* Left Content */}
        <div className="text-white">
          <p className="uppercase tracking-[0.2em] text-sm font-semibold text-blue-100 mb-4">
            HFT Stuttgart
          </p>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Campus Bike Sharing System
          </h1>

          <p className="text-lg text-blue-50 leading-8 mb-8">
            Smart, secure, and simple bike sharing designed exclusively for HFT Stuttgart students.
            Register with your university email and start exploring campus on two wheels.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={goToSignup}
              className="bg-white text-blue-800 font-semibold px-8 py-3 rounded-xl shadow-lg hover:bg-blue-50 transition-all duration-200 hover:transform hover:scale-105"
            >
              Get Started
            </button>

            <button className="border-2 border-white text-white px-8 py-3 rounded-xl hover:bg-white hover:text-blue-800 transition-all duration-200">
              Learn More
            </button>
          </div>
        </div>

        {/* Right Card */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 border border-white/40">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-3">
              Why Choose HFT Bike Sharing?
            </h2>
            <p className="text-slate-600">
              Built specifically for students with security, convenience, and campus mobility in mind.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎓</span>
                <h3 className="font-semibold text-slate-800">Student-Only Access</h3>
              </div>
              <p className="text-sm text-slate-600 ml-11">
                Secure registration using your HFT email address ensures controlled campus access.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">⚡</span>
                <h3 className="font-semibold text-slate-800">Quick Unlock System</h3>
              </div>
              <p className="text-sm text-slate-600 ml-11">
                QR code scanning and instant bike unlock with live ride tracking and timer.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🔒</span>
                <h3 className="font-semibold text-slate-800">Secure & Reliable</h3>
              </div>
              <p className="text-sm text-slate-600 ml-11">
                Strong password validation, secure authentication, and reliable bike management.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💰</span>
                <h3 className="font-semibold text-slate-800">Affordable Rates</h3>
              </div>
              <p className="text-sm text-slate-600 ml-11">
                Fair pricing at just €0.10 per minute with transparent cost calculation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
