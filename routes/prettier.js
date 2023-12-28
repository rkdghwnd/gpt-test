const express = require('express');
const axios = require('axios');
const router = express.Router();
const prettier = require('prettier');
const eslint = require('eslint');
const dotenv = require('dotenv');
dotenv.config();

// const weatherFunctionSpec = {
//   name: 'weather',
//   description: 'get the current weather for a city',
//   parameters: {
//     type: 'object',
//     properties: {
//       city: {
//         type: 'string',
//         description: 'The city',
//       },
//     },
//     required: ['city'],
//   },
// };

const cal = (x, y) => {
  return x + y;
};

// prettier.js
router.get('/create', async (req, res, next) => {
  // GET /prettier
  try {
    const formatElement = cal.toString();

    const result = await prettier.format('var calculate = ' + formatElement, {
      semi: false,
      parser: 'babel',
    });

    const linter = new eslint.Linter();

    const messages = linter.verify(result, {
      rules: {},
    });

    console.log(messages);
    eval(result);
    console.log(result);

    return res.status(201).json(calculate(1, 2));
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
