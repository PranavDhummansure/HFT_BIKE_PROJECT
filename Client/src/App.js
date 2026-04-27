import { useState, useEffect } from "react";
import BikeCard   from "./components/BikeCard";
import Timer      from "./components/Timer";
import HomePage   from "./components/HomePage";
import SignupPage from "./components/SignupPage";

const API_URL = "http://localhost:5000";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [student, setStudent]         = useState(null);   // { student_id, first_name, last_name, email }
  const [studentIdInput, setStudentIdInput] = useState("");
  const [loginError, setLoginError]   = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [bikes, setBikes]             = useState([]);
  const [bikesLoading, setBikesLoading] = useState(false);
  const [activeRide, setActiveRide]   = useState(null);   // { rideId, bikeId, startTime }
  const [summary, setSummary]         = useState(null);
  const [rideHistory, setRideHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification]   = useState(null);
  const [activeTab, setActiveTab]         = useState("bikes"); // "bikes" | "history"

  // ── Toast notification ─────────────────────────────────────────────
  const notify = (msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // ── Fetch real bikes from backend ──────────────────────────────────
  const fetchBikes = async (showMessage = false) => {
    setBikesLoading(true);
    try {
      const res  = await fetch(`${API_URL}/bikes`);
      const data = await res.json();
      setBikes(data);
      if (showMessage) notify("Bike list refreshed", "success");
    } catch {
      notify("Could not reach server. Make sure the backend is running.", "error");
    } finally {
      setBikesLoading(false);
    }
  };

  // ── Fetch ride history for logged-in student ───────────────────────
  const fetchHistory = async () => {
    if (!student) return;
    setHistoryLoading(true);
    try {
      const res  = await fetch(`${API_URL}/rides/${student.student_id}`);
      const data = await res.json();
      setRideHistory(data);
    } catch {
      notify("Could not load ride history.", "error");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (currentPage === "dashboard") {
      fetchBikes();
    }
  }, [currentPage]);

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
  }, [activeTab]);

  // ── Login — verifies student ID against database ───────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!studentIdInput.trim()) return;

    setLoginLoading(true);
    try {
      const res  = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentIdInput.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || "Login failed.");
        return;
      }

      setStudent(data.student);
      setCurrentPage("dashboard");
      notify(`Welcome back, ${data.student.first_name}! 👋`, "success");

    } catch {
      setLoginError("Cannot connect to server. Make sure the backend is running on port 5000.");
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Unlock bike ────────────────────────────────────────────────────
  const unlockBike = async (bikeId) => {
    if (activeRide) { notify("You already have an active ride!", "error"); return; }
    setActionLoading(true);
    try {
      const res  = await fetch(`${API_URL}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.student_id, bikeId }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveRide({ rideId: data.rideId, bikeId, startTime: Date.now() });
        fetchBikes();
        notify(`Bike #${bikeId} unlocked! Enjoy your ride 🚲`, "success");
      } else {
        notify(data.error || "Could not unlock bike.", "error");
      }
    } catch {
      notify("Server error. Please try again.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Return bike ────────────────────────────────────────────────────
  const returnBike = async () => {
    setActionLoading(true);
    try {
      const res  = await fetch(`${API_URL}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rideId: activeRide.rideId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSummary({ duration: data.duration, cost: data.cost, bikeId: activeRide.bikeId });
        setActiveRide(null);
        fetchBikes();
        notify("Bike returned successfully!", "success");
      } else {
        notify(data.error || "Could not return bike.", "error");
      }
    } catch {
      notify("Server error. Please try again.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── QR scan simulation — picks a random available bike ────────────
  const simulateQR = () => {
    if (activeRide) { notify("You already have an active ride!", "error"); return; }
    const available = bikes.filter(b => b.status === "Available");
    if (!available.length) { notify("No available bikes nearby.", "error"); return; }
    const bike = available[Math.floor(Math.random() * available.length)];
    notify(`📷 QR Scanned — Bike #${bike.bikeId} detected!`, "info");
    setTimeout(() => unlockBike(bike.bikeId), 1000);
  };

  // ── Logout ─────────────────────────────────────────────────────────
  const handleLogout = () => {
    setStudent(null);
    setStudentIdInput("");
    setActiveRide(null);
    setSummary(null);
    setRideHistory([]);
    setBikes([]);
    setActiveTab("bikes");
    setCurrentPage("home");
  };

  // ══════════════════════════════════════════════════════════════════
  // PAGE: Home
  // ══════════════════════════════════════════════════════════════════
  if (currentPage === "home") {
    return <HomePage goToSignup={() => setCurrentPage("signup")} goToLogin={() => setCurrentPage("login")} />;
  }

  // ══════════════════════════════════════════════════════════════════
  // PAGE: Signup
  // ══════════════════════════════════════════════════════════════════
  if (currentPage === "signup") {
    return (
        <SignupPage
            goToHome={() => setCurrentPage("home")}
            goToLogin={() => setCurrentPage("login")}
        />
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // PAGE: Login
  // ══════════════════════════════════════════════════════════════════
  if (currentPage === "login") {
    return (
        <div className="login-page">
          <div className="login-bg">
            <div className="bg-circle bg-circle-1"></div>
            <div className="bg-circle bg-circle-2"></div>
            <div className="bg-circle bg-circle-3"></div>
          </div>

          <div className="login-card">
            <div className="login-header">
              <div className="logo-icon">🚲</div>
              <h1 className="login-title">HFT Bike Sharing</h1>
              <p className="login-subtitle">Hochschule für Technik Stuttgart</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <label className="input-label">Student ID</label>
              <input
                  className="login-input"
                  placeholder="e.g. S001"
                  value={studentIdInput}
                  onChange={e => { setStudentIdInput(e.target.value); setLoginError(""); }}
                  required
              />

              {loginError && (
                  <div style={{
                    background: "#fef2f2", border: "1px solid #fca5a5",
                    borderRadius: "8px", padding: "10px 14px",
                    color: "#dc2626", fontSize: "0.875rem", marginTop: "4px"
                  }}>
                    ⚠️ {loginError}
                  </div>
              )}

              <button type="submit" className="login-btn" disabled={loginLoading}>
                <span>{loginLoading ? "Logging in..." : "Login to Dashboard"}</span>
                {!loginLoading && <span className="btn-arrow">→</span>}
              </button>

              <p className="login-switch-text">
                New user?{" "}
                <button type="button" className="login-switch-btn" onClick={() => setCurrentPage("signup")}>
                  Create an account
                </button>
              </p>
            </form>

            <p className="login-note">🔒 Secure access for HFT Stuttgart students only</p>
          </div>
        </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // PAGE: Dashboard
  // ══════════════════════════════════════════════════════════════════
  const availableCount   = bikes.filter(b => b.status === "Available").length;
  const inUseCount       = bikes.filter(b => b.status === "In-Use").length;
  const maintenanceCount = bikes.filter(b => b.status === "Maintenance").length;

  return (
      <div className="dashboard">

        {/* Toast */}
        {notification && (
            <div className={`toast toast-${notification.type}`}>{notification.msg}</div>
        )}

        {/* Header */}
        <header className="header">
          <div className="header-left">
            <span className="header-logo">🚲</span>
            <div>
              <h1 className="header-title">HFT Bike Sharing</h1>
              <p className="header-sub">Hochschule für Technik Stuttgart</p>
            </div>
          </div>
          <div className="header-right">
            <div className="student-badge">
              <span className="student-icon">👤</span>
              <span className="student-id">
              {student ? `${student.first_name} ${student.last_name}` : ""}
            </span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <main className="main-content">

          {/* Stats Row */}
          <div className="stats-row">
            <div className="stat-card stat-available">
              <span className="stat-num">{availableCount}</span>
              <span className="stat-label">Available</span>
            </div>
            <div className="stat-card stat-inuse">
              <span className="stat-num">{inUseCount}</span>
              <span className="stat-label">In Use</span>
            </div>
            <div className="stat-card stat-maintenance">
              <span className="stat-num">{maintenanceCount}</span>
              <span className="stat-label">Maintenance</span>
            </div>
            <button className="qr-btn" onClick={simulateQR} disabled={!!activeRide || actionLoading}>
              <span className="qr-icon">📷</span>
              <span>Scan QR Code</span>
            </button>
          </div>

          {/* Active Ride Banner */}
          {activeRide && (
              <div className="active-ride-banner">
                <div className="ride-info">
                  <div className="ride-icon">🚴</div>
                  <div>
                    <p className="ride-title">Active Ride — Bike #{activeRide.bikeId}</p>
                    <Timer startTime={activeRide.startTime} />
                  </div>
                </div>
                <button className="return-btn" onClick={returnBike} disabled={actionLoading}>
                  {actionLoading ? "Returning..." : "Return Bike"}
                </button>
              </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
            <button
                onClick={() => setActiveTab("bikes")}
                style={{
                  padding: "8px 20px", borderRadius: "10px", fontWeight: "600",
                  border: "none", cursor: "pointer",
                  background: activeTab === "bikes" ? "#1e3a8a" : "#e2e8f0",
                  color: activeTab === "bikes" ? "#fff" : "#475569",
                }}
            >
              🚲 Bikes
            </button>
            <button
                onClick={() => setActiveTab("history")}
                style={{
                  padding: "8px 20px", borderRadius: "10px", fontWeight: "600",
                  border: "none", cursor: "pointer",
                  background: activeTab === "history" ? "#1e3a8a" : "#e2e8f0",
                  color: activeTab === "history" ? "#fff" : "#475569",
                }}
            >
              📋 My Rides
            </button>
          </div>

          {/* Bikes Tab */}
          {activeTab === "bikes" && (
              <>
                <div className="section-header">
                  <h2 className="section-title">Campus Bikes</h2>
                  <button className="refresh-btn" onClick={() => fetchBikes(true)}>
                    {bikesLoading ? "Loading..." : "↻ Refresh"}
                  </button>
                </div>

                {bikesLoading ? (
                    <div className="empty-state"><p>Loading bikes...</p></div>
                ) : bikes.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">🔍</div>
                      <p>No bikes found. Make sure your backend is running on port 5000.</p>
                    </div>
                ) : (
                    <div className="bikes-grid">
                      {bikes.map(bike => (
                          <BikeCard
                              key={bike.bikeId}
                              bike={bike}
                              unlockBike={unlockBike}
                              hasActiveRide={!!activeRide}
                              loading={actionLoading}
                          />
                      ))}
                    </div>
                )}
              </>
          )}

          {/* Ride History Tab */}
          {activeTab === "history" && (
              <>
                <div className="section-header">
                  <h2 className="section-title">My Ride History</h2>
                  <button className="refresh-btn" onClick={fetchHistory}>
                    {historyLoading ? "Loading..." : "↻ Refresh"}
                  </button>
                </div>

                {historyLoading ? (
                    <div className="empty-state"><p>Loading history...</p></div>
                ) : rideHistory.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📋</div>
                      <p>No rides yet. Unlock a bike to get started!</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{
                        width: "100%", borderCollapse: "collapse",
                        background: "#fff", borderRadius: "12px", overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                      }}>
                        <thead>
                        <tr style={{ background: "#1e3a8a", color: "#fff" }}>
                          {["Ride ID", "Bike", "From", "To", "Start", "End", "Cost (€)"].map(h => (
                              <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: "600", fontSize: "0.875rem" }}>
                                {h}
                              </th>
                          ))}
                        </tr>
                        </thead>
                        <tbody>
                        {rideHistory.map((r, i) => (
                            <tr key={r.ride_id} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                              <td style={{ padding: "12px 16px", fontSize: "0.875rem" }}>#{r.ride_id}</td>
                              <td style={{ padding: "12px 16px", fontSize: "0.875rem" }}>{r.bike_type} #{r.bike_id}</td>
                              <td style={{ padding: "12px 16px", fontSize: "0.875rem" }}>{r.start_station}</td>
                              <td style={{ padding: "12px 16px", fontSize: "0.875rem" }}>{r.end_station || "—"}</td>
                              <td style={{ padding: "12px 16px", fontSize: "0.875rem" }}>
                                {new Date(r.start_time).toLocaleString("de-DE")}
                              </td>
                              <td style={{ padding: "12px 16px", fontSize: "0.875rem" }}>
                                {r.end_time ? new Date(r.end_time).toLocaleString("de-DE") : (
                                    <span style={{ color: "#16a34a", fontWeight: "600" }}>Active</span>
                                )}
                              </td>
                              <td style={{ padding: "12px 16px", fontSize: "0.875rem", fontWeight: "600", color: "#1e3a8a" }}>
                                {r.end_time ? `€${Number(r.amount).toFixed(2)}` : "—"}
                              </td>
                            </tr>
                        ))}
                        </tbody>
                        <tfoot>
                        <tr style={{ background: "#f1f5f9", borderTop: "2px solid #e2e8f0" }}>
                          <td colSpan={6} style={{ padding: "12px 16px", fontWeight: "700", textAlign: "right" }}>
                            Total Spent:
                          </td>
                          <td style={{ padding: "12px 16px", fontWeight: "700", color: "#1e3a8a" }}>
                            €{rideHistory.reduce((sum, r) => sum + Number(r.amount), 0).toFixed(2)}
                          </td>
                        </tr>
                        </tfoot>
                      </table>
                    </div>
                )}
              </>
          )}
        </main>

        {/* Ride Summary Modal */}
        {summary && (
            <div className="modal-overlay" onClick={() => setSummary(null)}>
              <div className="modal-card" onClick={e => e.stopPropagation()}>
                <div className="modal-icon">🎉</div>
                <h2 className="modal-title">Ride Complete!</h2>
                <p className="modal-sub">Bike #{summary.bikeId} returned successfully</p>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Duration</span>
                    <span className="summary-value">{summary.duration} min</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Total Cost</span>
                    <span className="summary-value summary-cost">€{Number(summary.cost).toFixed(2)}</span>
                  </div>
                </div>
                <p className="summary-note">Rate: €0.10 per minute</p>
                <button className="modal-close-btn" onClick={() => { setSummary(null); setActiveTab("history"); fetchHistory(); }}>
                  View Ride History
                </button>
              </div>
            </div>
        )}
      </div>
  );
}

export default App;