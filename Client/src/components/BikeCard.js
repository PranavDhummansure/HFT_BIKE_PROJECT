// BikeCard.js — Individual bike card with status, battery, and unlock button

function BikeCard({ bike, unlockBike, hasActiveRide, loading }) {

  // ─── Battery color based on level ──────────────────────────────────────
  const batteryColor =
  bike.batteryLevel >= 60 ? "#22c55e" :
  bike.batteryLevel >= 30 ? "#f59e0b" : "#ef4444";

const batteryText =
  bike.batteryLevel >= 60 ? "Good Battery" :
  bike.batteryLevel >= 30 ? "Low Battery" : "Very Low Battery";


  // ─── Status styling ─────────────────────────────────────────────────────
  const statusClass =
    bike.status === "Available"   ? "status-available" :
    bike.status === "In-Use"      ? "status-inuse"     : "status-maintenance";

  const statusIcon =
    bike.status === "Available"   ? "✅" :
    bike.status === "In-Use"      ? "🔒" : "🔧";

  const canUnlock =
  bike.status === "Available" &&
  bike.batteryLevel > 20 &&
  !hasActiveRide &&
  !loading;


  return (
    <div className={`bike-card ${bike.status === "Available" ? "bike-card-available" : ""}`}>

      {/* ── Card Top ─────────────────────────────────────────────────── */}
      <div className="bike-card-top">
        <div className="bike-icon-wrap">
          <span className="bike-icon">🚲</span>
        </div>
        <div className="bike-id-wrap">
          <span className="bike-id">Bike #{bike.bikeId}</span>
          <span className={`status-badge ${statusClass}`}>
            {statusIcon} {bike.status}
          </span>
        </div>
      </div>

      {/* ── Location ─────────────────────────────────────────────────── */}
      {bike.location && (
        <div className="bike-location">
          📍 {bike.location}
        </div>
      )}

      {/* ── Battery Bar ──────────────────────────────────────────────── */}
      <div className="battery-section">
        <div className="battery-label-row">
          <span className="battery-label">Battery</span>
          <span className="battery-pct" style={{ color: batteryColor }}>
            {bike.batteryLevel}%
          </span>
        </div>
        <div className="battery-track">
          <div
            className="battery-fill"
            style={{
              width: `${bike.batteryLevel}%`,
              background: batteryColor,
            }}
          />
        </div>
      </div>
      <div className="battery-label-row">
  <span className="battery-label">Battery</span>
  <span className="battery-pct" style={{ color: batteryColor }}>
    {bike.batteryLevel}%
  </span>
</div>

<p style={{ color: batteryColor, fontSize: "0.85rem", fontWeight: "600", marginTop: "4px" }}>
  {batteryText}
</p>


      {/* ── Unlock Button ────────────────────────────────────────────── */}
      {canUnlock ? (
        <button
          className="unlock-btn"
          onClick={() => unlockBike(bike.bikeId)}
        >
          🔓 Unlock Bike
        </button>
      ) : bike.status === "Available" && hasActiveRide ? (
        <button className="unlock-btn-disabled" disabled>
          Already Riding
        </button>
      ) : bike.status === "In-Use" ? (
        <button className="unlock-btn-disabled" disabled>
          🔒 Currently In Use
        </button>
        ) : bike.status === "Available" && bike.batteryLevel <= 20 ? (
  <button className="unlock-btn-disabled" disabled>
    Battery Too Low
  </button>

      ) : (
        <button className="unlock-btn-disabled" disabled>
          🔧 Under Maintenance
        </button>
      )}
    </div>
  );
}

export default BikeCard;

