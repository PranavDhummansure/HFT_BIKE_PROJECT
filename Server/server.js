const express = require("express");
const mysql   = require("mysql2/promise");
const cors    = require("cors");
require("dotenv").config();

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MySQL connection pool
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || "localhost",
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "VIRATKohli18!!",
  database: process.env.DB_NAME     || "bikesharing",
  waitForConnections: true,
  connectionLimit: 10,
});

// Test connection on startup
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ MySQL connected!");
    conn.release();
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
  }
})();

// ── GET /bikes ─────────────────────────────────────────────────────────
app.get("/bikes", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        b.bike_id      AS bikeId,
        b.bike_type    AS bikeType,
        b.status,
        s.station_name AS location
      FROM Bike b
      LEFT JOIN Station s ON b.station_id = s.station_id
      ORDER BY b.bike_id
    `);

    const bikes = rows.map(b => ({
      bikeId:       b.bikeId,
      bikeType:     b.bikeType,
      status:       b.status === "available"   ? "Available"   :
                    b.status === "rented"       ? "In-Use"      :
                    b.status === "maintenance"  ? "Maintenance" : b.status,
      batteryLevel: 85,
      location:     b.location || "HFT Campus",
    }));

    res.json(bikes);
  } catch (err) {
    console.error("GET /bikes error:", err.message);
    res.status(500).json({ error: "Failed to fetch bikes" });
  }
});

// ── POST /login ────────────────────────────────────────────────────────
app.post("/login", async (req, res) => {
  const { studentId } = req.body;
  if (!studentId) return res.status(400).json({ error: "Student ID required" });

  try {
    const [rows] = await pool.query(
      "SELECT student_id, first_name, last_name FROM Student WHERE student_id = ? AND is_active = TRUE",
      [studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Student ID not found. Try S001, S002 or S003" });
    }

    res.json({ success: true, student: rows[0] });
  } catch (err) {
    console.error("POST /login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// ── POST /unlock ───────────────────────────────────────────────────────
app.post("/unlock", async (req, res) => {
 const { bikeId } = req.body;
const studentId = 1;
  if (!studentId || !bikeId) {
    return res.status(400).json({ error: "studentId and bikeId are required" });
  }

  try {
    // Check bike exists and is available
    const [bikes] = await pool.query(
      "SELECT bike_id, status, station_id FROM Bike WHERE bike_id = ?",
      [bikeId]
    );

    if (bikes.length === 0) return res.status(404).json({ error: "Bike not found" });
    if (bikes[0].status !== "available") {
      return res.status(400).json({ error: `Bike #${bikeId} is not available` });
    }

    // Check student has no active ride
    const [active] = await pool.query(
      "SELECT ride_id FROM Ride WHERE student_id = ? AND end_time IS NULL",
      [studentId]
    );
    if (active.length > 0) {
      return res.status(400).json({ error: "You already have an active ride" });
    }

    // Create ride — trigger auto-sets bike to 'rented'
    const stationId = bikes[0].station_id || 1;
    const [result] = await pool.query(
      "INSERT INTO Ride (student_id, bike_id, start_station_id, start_time) VALUES (?, ?, ?, NOW())",
      [studentId, bikeId, stationId]
    );

    console.log(`🚲 Ride started: ID=${result.insertId}, Bike=${bikeId}, Student=${studentId}`);
    res.json({ rideId: result.insertId });
  } catch (err) {
    console.error("POST /unlock error:", err.message);
    res.status(500).json({ error: "Failed to unlock bike" });
  }
});

// ── POST /return ───────────────────────────────────────────────────────
app.post("/return", async (req, res) => {
  const { rideId } = req.body;
  if (!rideId) return res.status(400).json({ error: "rideId is required" });

  try {
    // Find the ride
    const [rides] = await pool.query(
      "SELECT ride_id, bike_id, student_id, start_time, end_time FROM Ride WHERE ride_id = ?",
      [rideId]
    );

    if (rides.length === 0) return res.status(404).json({ error: "Ride not found" });
    if (rides[0].end_time !== null) {
      return res.status(400).json({ error: "Ride already returned" });
    }

    const { bike_id, start_time } = rides[0];

    // Calculate duration and cost
    const durationMs  = Date.now() - new Date(start_time).getTime();
    const durationMin = Math.max(1, Math.ceil(durationMs / 1000 / 60));
    const cost        = parseFloat((durationMin * 0.10).toFixed(2));

    // End the ride
    await pool.query(
      "UPDATE Ride SET end_time = NOW() WHERE ride_id = ?",
      [rideId]
    );

    // Set bike back to available
    await pool.query(
      "UPDATE Bike SET status = 'available' WHERE bike_id = ?",
      [bike_id]
    );

    // Record payment
    await pool.query(
      "INSERT INTO Payment (ride_id, amount, payment_date, method, status) VALUES (?, ?, NOW(), 'app', 'paid')",
      [rideId, cost]
    );

    console.log(`✅ Ride returned: ID=${rideId}, Duration=${durationMin}min, Cost=€${cost}`);
    res.json({ duration: durationMin, cost });
  } catch (err) {
    console.error("POST /return error:", err.message);
    res.status(500).json({ error: "Failed to return bike" });
  }
});

// ── Health check ───────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "HFT Bike Sharing API running on port 5000" });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}\n`);
});