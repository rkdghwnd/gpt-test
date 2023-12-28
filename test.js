// 1. Importing axios for making HTTP requests and dotenv for managing environment variables.
const axios = require('axios');
require('dotenv').config();
// 2. Function to simulate getting kakao restaurant

async function kakao_restaurant(latitude, longitude) {
  try {
    const response = await axios.get(
      `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=FD6&x=${longitude}&y=${latitude}&radius=10000`,
      {
        headers: {
          Authorization: 'KakaoAK d5c945403f5d79d390bd3dda96d1e74e',
        },
      }
    );

    return JSON.stringify(response.data);
  } catch (error) {
    return error.data;
  }
}

// 9. Main function to handle the conversation with the API.
async function run_conversation() {
  // 10. The base URL for OpenAI API.
  const baseURL = 'https://api.openai.com/v1/chat/completions';
  // 11. Headers for the OpenAI API request.
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
  };
  // 12. Data to send to the API.
  let data = {
    messages: [
      {
        role: 'user',
        content: '구로의 음식점을 찾아줘',
        // content: 'please find some computer product',
        // "What's the weather like in Boston in fahrenheit and based on the temperature what should I wear?",
      },
    ],
    model: 'gpt-3.5-turbo-0613',
    functions: [
      {
        name: 'kakao_restaurant',
        description: 'Get the restaurant list based on location',
        parameters: {
          type: 'object',
          properties: {
            latitude: {
              type: 'string',
              description: 'latitude',
            },
            longitude: {
              type: 'string',
              description: 'longitude',
            },
          },
          required: ['latitude', 'longitude'],
        },
      },
    ],
    function_call: 'auto',
  };
  // 13. Try block to handle potential errors.
  try {
    // 14. Initial API request.
    console.log(`Sending initial request to OpenAI API...`);
    let response = await axios.post(baseURL, data, { headers });
    response = response.data;
    // 15. Track Executed Functions to Prevent Unnecessary Invocations
    let executedFunctions = {};
    // 16. Loop to process the conversation until it finishes.
    while (
      response.choices[0].message.function_call &&
      response.choices[0].finish_reason !== 'stop'
    ) {
      let message = response.choices[0].message;
      const function_name = message.function_call.name;
      // 17. Breaks the loop if function has already been executed.
      if (executedFunctions[function_name]) {
        break;
      }
      // 18. Calls the appropriate function based on the name.
      let function_response = '';
      switch (function_name) {
        case 'kakao_restaurant':
          let recommendationArgs = JSON.parse(message.function_call.arguments);
          function_response = await kakao_restaurant(
            recommendationArgs.latitude,
            recommendationArgs.longitude
          );
          break;
        default:
          throw new Error(`Unsupported function: ${function_name}`);
      }
      // 19. Adds the function to the executed functions list.
      executedFunctions[function_name] = true;
      // 20. Appends the function response to the messages list.
      data.messages.push({
        role: 'user',
        name: function_name,
        content:
          'You must introduce to the results of function calls in korean language.',
      });
      data.messages.push({
        role: 'function',
        name: function_name,
        content: function_response,
      });
      // 21. Makes another API request with the updated messages list.
      console.log(
        `Sending request to OpenAI with ${function_name} response...`
      );

      response = await axios.post(baseURL, data, { headers });
      response = response.data;
    }
    // 22. Makes the final API request after the conversation is finished.
    response = await axios.post(baseURL, data, { headers });
    response = response.data;
    // 23. Returns the final response data.
    return response;
  } catch (error) {
    // 24. Logs any error encountered during execution.
    console.error('Error:', error);
  }
}
// 25. Running the conversation and processing the response.
run_conversation()
  .then((response) => {
    // 26. Logging the final message content.
    console.log(response.choices[0].message.content);
  })
  .catch((error) => {
    // 27. Logging any error encountered during execution.
    console.error('Error:', error);
  });
