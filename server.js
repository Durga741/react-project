const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.DB_USER || 'visys_dev',  // Load sensitive info from environment variables
  host: process.env.DB_HOST || '52.66.196.233',
  database: process.env.DB_NAME || 'devdb',
  password: process.env.DB_PASSWORD || 'dev@123',
  port: process.env.DB_PORT || 5432
});

// Route to handle form submission
app.post('/submit', async (req, res) => {
  const { batchId, countryLocation, tutorId, phone, startDate } = req.body;

  if (!batchId || !countryLocation || !tutorId || !phone || !startDate) {
    return res.status(400).json({ error: 'All form fields are required' });
  }

  try {
    await pool.query(
      'INSERT INTO tutor_form (batchId, countryLocation, tutorId, phone, startDate) VALUES ($1, $2, $3, $4, $5)',
      [batchId, countryLocation, tutorId, phone, startDate]
    );
    res.status(201).json({ message: 'Form data submitted successfully' });
  } catch (err) {
    console.error('Error saving form data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// // Route to retrieve form data
// app.get('/retrieve', async (req, res) => {
//   const { field, value } = req.query;

//   if (!field || !value) {
//     return res.status(400).json({ error: 'Both field and value query parameters are required' });
//   }

//   try {
//     const query = `SELECT * FROM tutor_form WHERE ${field} = $1`;
//     const result = await pool.query(query, [value]);

//     if (result.rows.length > 0) {
//       res.status(200).json(result.rows);
//     } else {
//       res.status(404).json({ message: 'No data found for the selected criteria' });
//     }
//   } catch (err) {
//     console.error('Error retrieving form data:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Start the server
// Route to retrieve form data
app.get('/retrieve', async (req, res) => {
  const { field, value } = req.query;

  if (!field || !value) {
    return res.status(400).json({ error: 'Both field and value query parameters are required' });
  }

  try {
    // Format the startDate to return only the date part
    const query = `SELECT batchId, countryLocation, tutorId, phone, to_char(startDate, 'YYYY-MM-DD') as startDate FROM tutor_form WHERE ${field} = $1`;
    const result = await pool.query(query, [value]);

    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).json({ message: 'No data found for the selected criteria' });
    }
  } catch (err) {
    console.error('Error retrieving form data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});