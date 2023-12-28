const express = require('express');
const axios = require('axios');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();
const OpenAI = require('openai');
const openai = new OpenAI({ apikey: process.env.OPENAI_API_KEY });

const weatherFunctionSpec = {
  name: 'weather',
  description: 'get the current weather for a city',
  parameters: {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: 'The city',
      },
    },
    required: ['city'],
  },
};

async function getWeather(city) {
  const apiKey = process.env.WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (err) {
    return err.data;
  }
}

// chatcompletion.js
router.get('/create', async (req, res, next) => {
  // GET /chatcompletion/create
  try {
    // const additionalMessage = req.query.message;

    let messages = [
      {
        role: 'system',
        content: 'you give very short answers on calling function',
        // content: 'chat with me not using function, hi',
      },
      { role: 'user', content: "What's the wind in paris?" },
    ];

    console.log('----------------- FIRST REQUEST -------------');
    console.log(messages);
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      functions: [weatherFunctionSpec],
      function_call: 'auto',
    });

    let responseMessage = response.choices[0].message;
    messages.push(responseMessage);

    if (responseMessage.function_call?.name === 'weather') {
      const args = JSON.parse(responseMessage.function_call.arguments);
      const city = args.city;
      console.log('GPT asked me to call getWeather for city: ', city);
      const weather = await getWeather(city);
      console.log('result', weather);

      // return res.status(201).json(weather);
    }
    return res.status(201).json(responseMessage);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/test', async (req, res, next) => {
  // GET /chatcompletion/teset
  try {
    const result = await getWeather('London');
    console.log(result);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
