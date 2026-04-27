import { useState } from "react";

function HomePage({ goToSignup }) {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showLearnMore, setShowLearnMore] = useState(false);

  const featureDetails = {
    student: {
      title: "Student-Only Access",
      icon: "🎓",
      description:
        "This platform is designed exclusively for HFT Stuttgart students. Only users with a valid @hft-stuttgart.de email address can register, which keeps the system secure and student-focused.",
    },
    unlock: {
      title: "Quick Unlock System",
      icon: "⚡",
      description:
        "Students can unlock bikes quickly through a simple digital process. In the full system, QR code scanning connects the user directly to the selected bike and starts the ride instantly.",
    },
    secure: {
      title: "Secure & Reliable",
      icon: "🔒",
      description:
        "The system uses strong password rules, controlled student registration, and clean ride tracking logic. This helps keep accounts protected and bike usage reliable across campus.",
    },
    rates: {
      title: "Affordable Rates",
      icon: "💰",
      description:
        "The pricing model is simple and transparent: €0.10 per minute. Students can clearly see ride duration and cost before completing a return, making the platform fair and predictable.",
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-slate-200 px-6 py-10">
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

          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={goToSignup}
              className="bg-white text-blue-800 font-semibold px-8 py-3 rounded-xl shadow-lg hover:bg-blue-50 transition-all duration-200 hover:scale-105"
            >
              Get Started
            </button>

            <button
              onClick={() => setShowLearnMore(!showLearnMore)}
              className="border-2 border-white text-white px-8 py-3 rounded-xl hover:bg-white hover:text-blue-800 transition-all duration-200"
            >
              Learn More
            </button>
          </div>

          {showLearnMore && (
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-blue-50 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-3">How It Works</h3>
              <div className="space-y-3 text-base leading-7">
                <p><strong>1.</strong> Sign up with your HFT Stuttgart email.</p>
                <p><strong>2.</strong> Log in using your student credentials.</p>
                <p><strong>3.</strong> View available bikes on campus in real time.</p>
                <p><strong>4.</strong> Unlock a bike or simulate QR scanning.</p>
                <p><strong>5.</strong> Ride with a live timer and return the bike when done.</p>
                <p><strong>6.</strong> Review your ride duration and final cost instantly.</p>
              </div>
            </div>
          )}
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
            <button
              onClick={() => setSelectedFeature(featureDetails.student)}
              className="w-full text-left p-4 rounded-xl bg-slate-100 border border-slate-200 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎓</span>
                <h3 className="font-semibold text-slate-800">Student-Only Access</h3>
              </div>
              <p className="text-sm text-slate-600 ml-11">
                Secure registration using your HFT email address ensures controlled campus access.
              </p>
            </button>

            <button
              onClick={() => setSelectedFeature(featureDetails.unlock)}
              className="w-full text-left p-4 rounded-xl bg-slate-100 border border-slate-200 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">⚡</span>
                <h3 className="font-semibold text-slate-800">Quick Unlock System</h3>
              </div>
              <p className="text-sm text-slate-600 ml-11">
                QR code scanning and instant bike unlock with live ride tracking and timer.
              </p>
            </button>

            <button
              onClick={() => setSelectedFeature(featureDetails.secure)}
              className="w-full text-left p-4 rounded-xl bg-slate-100 border border-slate-200 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🔒</span>
                <h3 className="font-semibold text-slate-800">Secure & Reliable</h3>
              </div>
              <p className="text-sm text-slate-600 ml-11">
                Strong password validation, secure authentication, and reliable bike management.
              </p>
            </button>

            <button
              onClick={() => setSelectedFeature(featureDetails.rates)}
              className="w-full text-left p-4 rounded-xl bg-slate-100 border border-slate-200 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💰</span>
                <h3 className="font-semibold text-slate-800">Affordable Rates</h3>
              </div>
              <p className="text-sm text-slate-600 ml-11">
                Fair pricing at just €0.10 per minute with transparent cost calculation.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Modal */}
      {selectedFeature && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50"
          onClick={() => setSelectedFeature(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-3">{selectedFeature.icon}</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
              {selectedFeature.title}
            </h3>
            <p className="text-slate-700 leading-7 mb-6">
              {selectedFeature.description}
            </p>
            <button
              onClick={() => setSelectedFeature(null)}
              className="bg-blue-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-900 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
