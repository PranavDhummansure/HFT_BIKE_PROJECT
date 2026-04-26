import { useState } from "react";

function SignupPage({ goToHome, goToLogin }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const validateEmail = (email) => {
    // Only HFT Stuttgart email addresses allowed
    return /^[a-zA-Z0-9._%+-]+@hft-stuttgart\.de$/.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 chars, uppercase, lowercase, number, special char
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_\-+=])[A-Za-z\d@$!%*?&.#^()_\-+=]{8,}$/.test(
      password
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setSuccessMessage("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters.";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Only HFT Stuttgart email addresses are allowed (@hft-stuttgart.de).";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setSuccessMessage("✅ Account created successfully! You can now log in to start using the bike sharing system.");
      console.log("Signup Data:", formData);

      // Clear form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });

      // Auto-redirect to login after 2 seconds
      setTimeout(() => {
        goToLogin();
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-width-2xl max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🚲</span>
            <div>
              <h1 className="text-3xl font-bold">Create Account</h1>
              <p className="text-blue-100 mt-1">
                Join the HFT Stuttgart bike sharing community
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Navigation */}
          <div className="flex gap-6 mb-6 text-sm">
            <button
              onClick={goToHome}
              className="text-blue-700 font-medium hover:underline flex items-center gap-1"
            >
              ← Back to Home
            </button>
            <button
              onClick={goToLogin}
              className="text-blue-700 font-medium hover:underline"
            >
              Already have an account? Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 font-semibold text-slate-700">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {errors.firstName && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <span>⚠️</span> {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 font-semibold text-slate-700">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {errors.lastName && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <span>⚠️</span> {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 font-semibold text-slate-700">
                HFT Stuttgart Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="yourname@hft-stuttgart.de"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span> {errors.email}
                </p>
              )}
              <p className="text-slate-500 text-sm mt-2">
                📧 Only HFT Stuttgart email addresses are accepted for security
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 font-semibold text-slate-700">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {errors.password && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span> {errors.password}
                </p>
              )}

              {/* Password Requirements */}
              <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="font-semibold text-slate-700 mb-2 text-sm">
                  🔒 Password Requirements:
                </p>
                <ul className="list-none text-sm text-slate-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className={formData.password.length >= 8 ? "text-green-600" : "text-slate-400"}>
                      {formData.password.length >= 8 ? "✅" : "⭕"}
                    </span>
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={/[A-Z]/.test(formData.password) ? "text-green-600" : "text-slate-400"}>
                      {/[A-Z]/.test(formData.password) ? "✅" : "⭕"}
                    </span>
                    One uppercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={/[a-z]/.test(formData.password) ? "text-green-600" : "text-slate-400"}>
                      {/[a-z]/.test(formData.password) ? "✅" : "⭕"}
                    </span>
                    One lowercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={/\d/.test(formData.password) ? "text-green-600" : "text-slate-400"}>
                      {/\d/.test(formData.password) ? "✅" : "⭕"}
                    </span>
                    One number
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={/[@$!%*?&.#^()_\-+=]/.test(formData.password) ? "text-green-600" : "text-slate-400"}>
                      {/[@$!%*?&.#^()_\-+=]/.test(formData.password) ? "✅" : "⭕"}
                    </span>
                    One special character
                  </li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-800 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>🚲</span>
              Create My Account
            </button>

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-r-xl">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎉</span>
                  <div>
                    <p className="font-semibold">Success!</p>
                    <p className="text-sm">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
            <p>🔒 Your data is secure and will only be used for the bike sharing service</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
