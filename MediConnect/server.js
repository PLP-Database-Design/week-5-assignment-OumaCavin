require('dotenv').config(); // To load .env file
const mysql = require('mysql2');
const express = require('express');
const path = require('path'); // Module to work with file paths
const app = express();

// MySQL database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// To parse incoming requests with JSON payloads
app.use(express.json());

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Root route ("/") - Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Retrieve all patients
app.get('/patients', (req, res) => {
  const query = 'SELECT patient_id, first_name, last_name, date_of_birth FROM Patients';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Retrieve all providers
app.get('/providers', (req, res) => {
  const query = 'SELECT first_name, last_name, provider_speciality FROM Providers';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Retrieve patients by first name
app.get('/patients/filter', (req, res) => {
  const firstName = req.query.first_name;
  const query = 'SELECT patient_id, first_name, last_name, date_of_birth FROM Patients WHERE first_name = ?';
  db.query(query, [firstName], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Retrieve providers by specialty
app.get('/providers/filter', (req, res) => {
  const specialty = req.query.provider_speciality;
  const query = 'SELECT first_name, last_name, provider_speciality FROM Providers WHERE provider_speciality = ?';
  db.query(query, [specialty], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Retrieve distinct patient first names
app.get('/patients/distinct-first-names', (req, res) => {
    const query = 'SELECT DISTINCT first_name FROM Patients';
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    });
  });
  
  // Retrieve distinct provider specialties
  app.get('/providers/distinct-specialities', (req, res) => {
    const query = 'SELECT DISTINCT provider_speciality FROM Providers';
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    });
  });
  

// Start the server
const PORT = process.env.PORT || 3000; // Use the PORT from .env or default to 3000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
