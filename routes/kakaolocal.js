const express = require('express');
const axios = require('axios');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

// kakaolocals
router.get('/', async (req, res, next) => {
  // GET /books
  try {
    //
    res.status(201).json(response.data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
