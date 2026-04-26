import { useState, useEffect } from "react";
import BikeCard from "./components/BikeCard";
import Timer from "./components/Timer";
import HomePage from "./components/HomePage";
import SignupPage from "./components/SignupPage";


// ─── Mock bikes shown when backend is offline ───────────────────────────────
const MOCK_BIKES = [
  { bikeId: 1, status: "Available", batteryLevel: 92, location: "Building A" },
  { bikeId: 2, status: "Available", batteryLevel: 75, location: "Main Gate" },
  { bikeId: 3, status: "In-Use",    batteryLevel: 60, location: "Library" },
  { bikeId: 4, status: "Available", batteryLevel: 88, location: "Cafeteria" },
  { bikeId: 5, status: "Maintenance", batteryLevel: 20, location: "Workshop" },
  { bikeId: 6, status: "Available", batteryLevel: 95, location: "Parking B" },
];

const API_URL = "http://localhost:5000";

function App() {
  const [studentId, setStudentId]   = useState("");
  const [loggedIn, setLoggedIn]     = useState(false);
  const [bikes, setBikes]           = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [backendOff, setBackendOff] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");


  // ─── Show toast notification ────────────────────────────────────────────
  const notify = (msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // ─── Fetch bikes from backend; fall back to mock data ───────────────────
  const fetchBikes = async () => {
    try {
      const res  = await fetch(`${API_URL}/bikes`);
      const data = await res.json();
      setBikes(data);
      setBackendOff(false);
    } catch {
      // Backend offline → use mock data so UI is always demonstrable
      setBikes(MOCK_BIKES);
      setBackendOff(true);
    }
  };

  useEffect(() => { fetchBikes(); }, []);

  // ─── Login ──────────────────────────────────────────────────────────────
  const handleLogin = (e) => {
    e.preventDefault();
    if (!studentId.trim()) return;
    setLoggedIn(true);
    setCurrentPage("dashboard");

  };

  // ─── Unlock bike ─────────────────────────────────────────────────────────
  const unlockBike = async (bikeId) => {
    if (activeRide) { notify("You already have an active ride!", "error"); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, bikeId }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveRide({ rideId: data.rideId, bikeId, startTime: Date.now() });
        fetchBikes();
        notify(`Bike #${bikeId} unlocked! Enjoy your ride 🚲`, "success");
      } else {
        notify(data.error || "Could not unlock bike", "error");
      }
    } catch {
      // Demo mode when backend is offline
      setActiveRide({ rideId: "DEMO-" + bikeId, bikeId, startTime: Date.now() });
      setBikes(prev => prev.map(b => b.bikeId === bikeId ? { ...b, status: "In-Use" } : b));
      notify(`[Demo] Bike #${bikeId} unlocked! 🚲`, "success");
    }
    setLoading(false);
  };

  // ─── Return bike ─────────────────────────────────────────────────────────
  const returnBike = async () => {
    setLoading(true);
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
      }
    } catch {
      // Demo mode calculation
      const durationSec = Math.floor((Date.now() - activeRide.startTime) / 1000);
      const durationMin = Math.max(1, Math.ceil(durationSec / 60));
      setSummary({ duration: durationMin, cost: +(durationMin * 0.1).toFixed(2), bikeId: activeRide.bikeId });
      setBikes(prev => prev.map(b => b.bikeId === activeRide.bikeId ? { ...b, status: "Available" } : b));
      setActiveRide(null);
    }
    setLoading(false);
  };

  // ─── Simulate QR scan ────────────────────────────────────────────────────
  const simulateQR = () => {
    const available = bikes.filter(b => b.status === "Available");
    if (!available.length) { notify("No available bikes nearby", "error"); return; }
    const bike = available[Math.floor(Math.random() * available.length)];
    notify(`📷 QR Scanned — Bike #${bike.bikeId} detected!`, "info");
    setTimeout(() => unlockBike(bike.bikeId), 1000);
  };

  // ════════════════════════════════════════════════════════════════════════
  // Current page
  // ════════════════════════════════════════════════════════════════════════
  if (currentPage === "home") {
  return <HomePage goToSignup={() => setCurrentPage("signup")} />;
  }

  if (currentPage === "signup") {
  return (
    <SignupPage
      goToHome={() => setCurrentPage("home")}
      goToLogin={() => setCurrentPage("login")}
    />
  );
  }

  // ════════════════════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ════════════════════════════════════════════════════════════════════════
  if (currentPage === "login" && !loggedIn) {

    return (
      <div className="login-page">
        {/* Background decoration */}
        <div className="login-bg">
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
          <div className="bg-circle bg-circle-3"></div>
        </div>

        <div className="login-card">
          {/* Logo / Header */}
          <div className="login-header">
            <div className="logo-icon">🚲</div>
            <h1 className="login-title">HFT Bike Sharing</h1>
            <p className="login-subtitle">Hochschule für Technik Stuttgart</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="login-form">
            <label className="input-label">Student ID</label>
            <input
              className="login-input"
              placeholder="e.g. 12345678"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              required
            />
            <button type="submit" className="login-btn">
              <span>Login to Dashboard</span>
              <span className="btn-arrow">→</span>
            </button>
            <p className="login-switch-text">
                 New user?{" "}
               <button
                 type="button"
                   className="login-switch-btn"
                    onClick={() => setCurrentPage("signup")}
                      >
                     Create an account
           </button>
                </p>

          </form>

          <p className="login-note">
            🔒 Secure access for HFT Stuttgart students only
          </p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // DASHBOARD
  // ════════════════════════════════════════════════════════════════════════
  const availableCount  = bikes.filter(b => b.status === "Available").length;
  const inUseCount      = bikes.filter(b => b.status === "In-Use").length;
  const maintenanceCount = bikes.filter(b => b.status === "Maintenance").length;

  return (
    <div className="dashboard">

      {/* ── Toast Notification ─────────────────────────────────────── */}
      {notification && (
        <div className={`toast toast-${notification.type}`}>
          {notification.msg}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────── */}
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
            <span className="student-id">{studentId}</span>
          </div>
          {backendOff && (
            <div className="demo-badge">⚠ Demo Mode</div>
          )}
          <button className="logout-btn"onClick={() => {
  setLoggedIn(false);
  setActiveRide(null);
  setCurrentPage("login");
}}
>
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">

        {/* ── Stats Row ──────────────────────────────────────────────── */}
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
          <button className="qr-btn" onClick={simulateQR} disabled={!!activeRide}>
            <span className="qr-icon">📷</span>
            <span>Scan QR Code</span>
          </button>
        </div>

        {/* ── Active Ride Banner ─────────────────────────────────────── */}
        {activeRide && (
          <div className="active-ride-banner">
            <div className="ride-info">
              <div className="ride-icon">🚴</div>
              <div>
                <p className="ride-title">Active Ride — Bike #{activeRide.bikeId}</p>
                <Timer startTime={activeRide.startTime} />
              </div>
            </div>
            <button
              className="return-btn"
              onClick={returnBike}
              disabled={loading}
            >
              {loading ? "Returning..." : "Return Bike"}
            </button>
          </div>
        )}

        {/* ── Bikes Grid ─────────────────────────────────────────────── */}
        <div className="section-header">
          <h2 className="section-title">Campus Bikes</h2>
          <button className="refresh-btn" onClick={fetchBikes}>↻ Refresh</button>
        </div>

        {bikes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>No bikes found. Make sure your backend is running.</p>
          </div>
        ) : (
          <div className="bikes-grid">
            {bikes.map(bike => (
              <BikeCard
                key={bike.bikeId}
                bike={bike}
                unlockBike={unlockBike}
                hasActiveRide={!!activeRide}
                loading={loading}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Ride Summary Modal ─────────────────────────────────────────── */}
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
            <button className="modal-close-btn" onClick={() => setSummary(null)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
