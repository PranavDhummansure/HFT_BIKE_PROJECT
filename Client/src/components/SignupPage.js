import { useState } from "react";

const API_URL = "http://localhost:5000";

function SignupPage({ goToHome, goToLogin }) {
  const [formData, setFormData] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors]         = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading]       = useState(false);
  const [serverError, setServerError] = useState("");

  const validateEmail = (email) =>
      /^[a-zA-Z0-9._%+-]+@hft-stuttgart\.de$/.test(email);

  const validatePassword = (password) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_\-+=])[A-Za-z\d@$!%*?&.#^()_\-+=]{8,}$/.test(password);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
    setSuccessMessage("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentId.trim()) {
      newErrors.studentId = "Student ID is required.";
    } else if (!/^[A-Za-z0-9]{2,10}$/.test(formData.studentId.trim())) {
      newErrors.studentId = "Student ID must be 2–10 alphanumeric characters (e.g. S004).";
    }

    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters.";
    }

    if (!formData.lastName.trim() || formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters.";
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = "Only HFT Stuttgart email addresses are allowed (@hft-stuttgart.de).";
    }

    if (!validatePassword(formData.password)) {
      newErrors.password =
          "Password must be 8+ characters with uppercase, lowercase, number, and special character.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: formData.studentId.trim().toUpperCase(),
          firstName: formData.firstName.trim(),
          lastName:  formData.lastName.trim(),
          email:     formData.email.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Registration failed. Please try again.");
        return;
      }

      setSuccessMessage("Account created successfully! Redirecting to login...");
      setFormData({ studentId: "", firstName: "", lastName: "", email: "", password: "" });

      setTimeout(() => goToLogin(), 2000);

    } catch {
      setServerError("Cannot connect to server. Make sure the backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white px-8 py-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🚲</span>
              <div>
                <h1 className="text-3xl font-bold">Create Account</h1>
                <p className="text-blue-100 mt-1">Join the HFT Stuttgart bike sharing community</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Navigation */}
            <div className="flex gap-6 mb-6 text-sm">
              <button onClick={goToHome} className="text-blue-700 font-medium hover:underline">
                ← Back to Home
              </button>
              <button onClick={goToLogin} className="text-blue-700 font-medium hover:underline">
                Already have an account? Login
              </button>
            </div>

            {/* Server error */}
            {serverError && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-xl mb-4">
                  <p className="font-semibold">Error</p>
                  <p className="text-sm">{serverError}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Student ID */}
              <div>
                <label className="block mb-2 font-semibold text-slate-700">Student ID *</label>
                <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="e.g. S004"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                {errors.studentId && (
                    <p className="text-red-600 text-sm mt-1">⚠️ {errors.studentId}</p>
                )}
                <p className="text-slate-500 text-sm mt-1">This will be your login ID (e.g. S004, S005)</p>
              </div>

              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2 font-semibold text-slate-700">First Name *</label>
                  <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                  {errors.firstName && (
                      <p className="text-red-600 text-sm mt-1">⚠️ {errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-slate-700">Last Name *</label>
                  <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                  {errors.lastName && (
                      <p className="text-red-600 text-sm mt-1">⚠️ {errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 font-semibold text-slate-700">HFT Stuttgart Email *</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="yourname@hft-stuttgart.de"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                {errors.email && (
                    <p className="text-red-600 text-sm mt-1">⚠️ {errors.email}</p>
                )}
                <p className="text-slate-500 text-sm mt-1">📧 Only @hft-stuttgart.de addresses are accepted</p>
              </div>

              {/* Password */}
              <div>
                <label className="block mb-2 font-semibold text-slate-700">Password *</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                {errors.password && (
                    <p className="text-red-600 text-sm mt-1">⚠️ {errors.password}</p>
                )}

                {/* Live password requirements */}
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="font-semibold text-slate-700 mb-2 text-sm">🔒 Password Requirements:</p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    {[
                      [formData.password.length >= 8, "At least 8 characters"],
                      [/[A-Z]/.test(formData.password), "One uppercase letter"],
                      [/[a-z]/.test(formData.password), "One lowercase letter"],
                      [/\d/.test(formData.password), "One number"],
                      [/[@$!%*?&.#^()_\-+=]/.test(formData.password), "One special character"],
                    ].map(([met, label]) => (
                        <li key={label} className="flex items-center gap-2">
                          <span className={met ? "text-green-600" : "text-slate-400"}>{met ? "✅" : "⭕"}</span>
                          {label}
                        </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Submit */}
              <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-800 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                    <span>Creating account...</span>
                ) : (
                    <><span>🚲</span><span>Create My Account</span></>
                )}
              </button>

              {/* Success */}
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

            <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
              <p>🔒 Your data is stored securely in the HFT bike sharing database</p>
            </div>
          </div>
        </div>
      </div>
  );
}

export default SignupPage;