const express = require("express");
const mysql   = require("mysql2/promise");
const cors    = require("cors");
require("dotenv").config();

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── Database connection pool ───────────────────────────────────────────
const pool = mysql.createPool({
    host:     process.env.DB_HOST     || "localhost",
    user:     process.env.DB_USER     || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME     || "bikesharing",
    waitForConnections: true,
    connectionLimit: 10,
});

// Test connection on startup
(async () => {
    try {
        const conn = await pool.getConnection();
        console.log("✅ MySQL connected successfully!");
        conn.release();
    } catch (err) {
        console.error("❌ MySQL connection failed:", err.message);
    }
})();

// ── POST /signup ───────────────────────────────────────────────────────
// Creates a new student in the database
app.post("/signup", async (req, res) => {
    const { firstName, lastName, email, studentId } = req.body;

    if (!firstName || !lastName || !email || !studentId) {
        return res.status(400).json({ error: "All fields are required." });
    }

    // Only allow HFT Stuttgart emails
    if (!email.endsWith("@hft-stuttgart.de")) {
        return res.status(400).json({ error: "Only HFT Stuttgart email addresses are allowed." });
    }

    try {
        // Check if student ID already exists
        const [existing] = await pool.query(
            "SELECT student_id FROM Student WHERE student_id = ?",
            [studentId]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: "Student ID already registered." });
        }

        // Check if email already exists
        const [existingEmail] = await pool.query(
            "SELECT email FROM Student WHERE email = ?",
            [email]
        );
        if (existingEmail.length > 0) {
            return res.status(409).json({ error: "Email address already registered." });
        }

        // Insert new student
        await pool.query(
            "INSERT INTO Student (student_id, first_name, last_name, email, registered_on, is_active) VALUES (?, ?, ?, ?, CURDATE(), TRUE)",
            [studentId, firstName.trim(), lastName.trim(), email.trim()]
        );

        console.log(`👤 New student registered: ${studentId} (${firstName} ${lastName})`);
        res.json({ success: true, message: "Account created successfully!" });

    } catch (err) {
        console.error("POST /signup error:", err.message);
        res.status(500).json({ error: "Registration failed. Please try again." });
    }
});

// ── POST /login ────────────────────────────────────────────────────────
// Verifies student ID against database and returns student info
app.post("/login", async (req, res) => {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ error: "Student ID is required." });

    try {
        const [rows] = await pool.query(
            "SELECT student_id, first_name, last_name, email FROM Student WHERE student_id = ? AND is_active = TRUE",
            [studentId.trim()]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Student ID not found. Please register first." });
        }

        console.log(`🔑 Student logged in: ${rows[0].student_id} (${rows[0].first_name} ${rows[0].last_name})`);
        res.json({ success: true, student: rows[0] });

    } catch (err) {
        console.error("POST /login error:", err.message);
        res.status(500).json({ error: "Login failed. Please try again." });
    }
});

// ── GET /bikes ─────────────────────────────────────────────────────────
// Returns all bikes with their current status and station
app.get("/bikes", async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT
        b.bike_id      AS bikeId,
        b.bike_type    AS bikeType,
        b.status,
        b.last_serviced,
        s.station_name AS location
      FROM Bike b
      LEFT JOIN Station s ON b.station_id = s.station_id
      ORDER BY b.bike_id
    `);

        const bikes = rows.map(b => ({
            bikeId:    b.bikeId,
            bikeType:  b.bikeType,
            status:    b.status === "available"   ? "Available"   :
                b.status === "rented"       ? "In-Use"      :
                    b.status === "maintenance"  ? "Maintenance" : b.status,
            location:  b.location || "HFT Campus",
        }));

        res.json(bikes);
    } catch (err) {
        console.error("GET /bikes error:", err.message);
        res.status(500).json({ error: "Failed to fetch bikes." });
    }
});

// ── POST /unlock ───────────────────────────────────────────────────────
// Starts a ride — inserts into Ride table, marks bike as rented
app.post("/unlock", async (req, res) => {
    const { bikeId, studentId } = req.body;

    if (!studentId || !bikeId) {
        return res.status(400).json({ error: "studentId and bikeId are required." });
    }

    try {
        // Check bike exists and is available
        const [bikes] = await pool.query(
            "SELECT bike_id, status, station_id FROM Bike WHERE bike_id = ?",
            [bikeId]
        );
        if (bikes.length === 0) return res.status(404).json({ error: "Bike not found." });
        if (bikes[0].status !== "available") {
            return res.status(400).json({ error: `Bike #${bikeId} is not available.` });
        }

        // Check student has no active ride already
        const [active] = await pool.query(
            "SELECT ride_id FROM Ride WHERE student_id = ? AND end_time IS NULL",
            [studentId]
        );
        if (active.length > 0) {
            return res.status(400).json({ error: "You already have an active ride. Please return the current bike first." });
        }

        const stationId = bikes[0].station_id || 1;

        // Insert new ride record
        const [result] = await pool.query(
            "INSERT INTO Ride (student_id, bike_id, start_station_id, start_time) VALUES (?, ?, ?, NOW())",
            [studentId, bikeId, stationId]
        );

        // Mark bike as rented
        await pool.query(
            "UPDATE Bike SET status = 'rented', station_id = NULL WHERE bike_id = ?",
            [bikeId]
        );

        console.log(`🚲 Ride started: RideID=${result.insertId}, Bike=${bikeId}, Student=${studentId}`);
        res.json({ rideId: result.insertId });

    } catch (err) {
        console.error("POST /unlock error:", err.message);
        res.status(500).json({ error: "Failed to unlock bike." });
    }
});

// ── POST /return ───────────────────────────────────────────────────────
// Ends a ride — updates Ride table, marks bike available, creates Payment
app.post("/return", async (req, res) => {
    const { rideId } = req.body;
    if (!rideId) return res.status(400).json({ error: "rideId is required." });

    try {
        // Find the active ride
        const [rides] = await pool.query(
            "SELECT ride_id, bike_id, student_id, start_time, end_time FROM Ride WHERE ride_id = ?",
            [rideId]
        );
        if (rides.length === 0) return res.status(404).json({ error: "Ride not found." });
        if (rides[0].end_time !== null) {
            return res.status(400).json({ error: "This ride has already been returned." });
        }

        const { bike_id, start_time } = rides[0];

        // Calculate duration and cost (€0.10 per minute, minimum 1 minute)
        const durationMs  = Date.now() - new Date(start_time).getTime();
        const durationMin = Math.max(1, Math.ceil(durationMs / 1000 / 60));
        const cost        = parseFloat((durationMin * 0.10).toFixed(2));

        // End the ride
        await pool.query(
            "UPDATE Ride SET end_time = NOW(), end_station_id = 1 WHERE ride_id = ?",
            [rideId]
        );

        // Mark bike available at station 1
        await pool.query(
            "UPDATE Bike SET status = 'available', station_id = 1 WHERE bike_id = ?",
            [bike_id]
        );

        // Record the payment
        await pool.query(
            "INSERT INTO Payment (ride_id, amount, payment_date, method, status) VALUES (?, ?, NOW(), 'app', 'paid')",
            [rideId, cost]
        );

        console.log(`✅ Ride returned: RideID=${rideId}, Duration=${durationMin}min, Cost=€${cost}`);
        res.json({ duration: durationMin, cost });

    } catch (err) {
        console.error("POST /return error:", err.message);
        res.status(500).json({ error: "Failed to return bike." });
    }
});

// ── GET /rides/:studentId ──────────────────────────────────────────────
// Returns full ride history for a student
app.get("/rides/:studentId", async (req, res) => {
    const { studentId } = req.params;
    try {
        const [rows] = await pool.query(`
      SELECT
        r.ride_id,
        b.bike_type,
        b.bike_id,
        st1.station_name  AS start_station,
        st2.station_name  AS end_station,
        r.start_time,
        r.end_time,
        COALESCE(p.amount, 0) AS amount,
        p.status              AS payment_status
      FROM Ride r
      JOIN Bike       b   ON r.bike_id          = b.bike_id
      JOIN Station    st1 ON r.start_station_id = st1.station_id
      LEFT JOIN Station   st2 ON r.end_station_id   = st2.station_id
      LEFT JOIN Payment   p   ON r.ride_id          = p.ride_id
      WHERE r.student_id = ?
      ORDER BY r.start_time DESC
    `, [studentId]);

        res.json(rows);
    } catch (err) {
        console.error("GET /rides error:", err.message);
        res.status(500).json({ error: "Failed to fetch ride history." });
    }
});

// ── Health check ───────────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({ message: "HFT Bike Sharing API is running on port 5000" });
});

app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}\n`);
});