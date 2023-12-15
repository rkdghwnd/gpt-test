const express = require('express');
const axios = require('axios')
const router = express.Router();
const dotenv = require('dotenv')
dotenv.config()

// public
router.get('/', async (req, res, next) => {
  // GET /public
  try {
 
    const response = await axios.post(`https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${process.env.PUBLIC_API_KEY}`,{
      b_no: [
        "1198691245"
      ]
    })

    console.log(response.data)
    res.status(201).json(response.data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});


module.exports = router;
