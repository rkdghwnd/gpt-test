const express = require('express');
const axios = require('axios');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

// replit.js
router.get('/create', async (req, res, next) => {
  // GET /replit
  try {
    res.status(201).json();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
