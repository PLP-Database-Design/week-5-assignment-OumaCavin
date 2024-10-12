require('dotenv').config(); // Load environment variables from .env
const mysql = require('mysql2');
const express = require('express');
const path = require('path'); // Module to work with file paths
const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

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
app.use(express.urlencoded({ extended: true }));

// Serve static files (e.g., CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Root route ("/") - Serve the index.ejs file with filter dropdowns populated
app.get('/', (req, res) => {
  // Retrieve distinct first names and provider specialties for the dropdown filters
  const getDistinctFirstNames = new Promise((resolve, reject) => {
    const query = 'SELECT DISTINCT first_name FROM Patients';
    db.query(query, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  const getDistinctSpecialties = new Promise((resolve, reject) => {
    const query = 'SELECT DISTINCT provider_speciality FROM Providers';
    db.query(query, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  // Wait for both queries to complete
  Promise.all([getDistinctFirstNames, getDistinctSpecialties])
    .then(([firstNames, specialties]) => {
      res.render('index', { firstNames, specialties });
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});

// Retrieve all patients
app.get('/patients', (req, res) => {
  const query = 'SELECT patient_id, first_name, last_name, date_of_birth FROM Patients';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.render('patients', { patients: results });
  });
});

// Retrieve all providers
app.get('/providers', (req, res) => {
  const query = 'SELECT first_name, last_name, provider_speciality FROM Providers';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.render('providers', { providers: results });
  });
});

// Retrieve filtered patients by first name
app.get('/patients/filter', (req, res) => {
  const firstName = req.query.first_name;
  const query = 'SELECT patient_id, first_name, last_name, date_of_birth FROM Patients WHERE first_name = ?';
  db.query(query, [firstName], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.render('patients', { patients: results });
  });
});

// Retrieve filtered providers by specialty
app.get('/providers/filter', (req, res) => {
  const specialty = req.query.provider_speciality;
  const query = 'SELECT first_name, last_name, provider_speciality FROM Providers WHERE provider_speciality = ?';
  db.query(query, [specialty], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.render('providers', { providers: results });
  });
});

// Retrieve distinct patient first names (API endpoint for dropdowns)
app.get('/patients/distinct-first-names', (req, res) => {
  const query = 'SELECT DISTINCT first_name FROM Patients';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Retrieve distinct provider specialties (API endpoint for dropdowns)
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
