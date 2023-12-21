const express = require('express');
const axios = require('axios');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistant_id = 'asst_Xeh1cc9k9oUbUqBy9vjAk5R2';

async function kakaoRestaurant(x, y) {
  const response = await axios.get(
    `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=FD6&x=${x}&y=${y}&radius=10000`,
    {
      headers: {
        Authorization: 'KakaoAK d5c945403f5d79d390bd3dda96d1e74e',
      },
    }
  );
  return response.data;
}

router.get('/', async (req, res, next) => {
  // GET /public
  try {
    const assistant = await openai.beta.assistants.create({
      model: 'gpt-4-1106-preview',
      name: '오늘뭐먹지?',
      instructions:
        'you serve response about restaurant infomation from kakao kakaoRestaurant api.',
      tools: [
        { type: 'retrieval' },
        {
          type: 'function',
          function: {
            name: 'kakaoRestaurant',
            description: 'kakao restaurant api',
            parameters: {
              type: 'object',
              properties: {
                category_group_code: {
                  type: 'string',
                  description: 'category code',
                },
                x: {
                  type: 'string',
                  description: 'longitude',
                },
                y: {
                  type: 'string',
                  description: 'latitude',
                },
                radius: {
                  type: 'string',
                  description: '반경',
                },
              },
              required: ['x', 'y'],
            },
          },
        },
      ],
    });

    console.log(assistant);

    res.status(201).json(assistant);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/start', async (req, res, next) => {
  // GET /public/start
  try {
    console.log('Starting a new conversation...');
    const thread = await openai.beta.threads.create();

    console.log(`New thread created with ID: ${thread.id}`);

    return res.status(201).json({ threadId: thread.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/chat', async (req, res, next) => {
  // GET /public/start
  try {
    const threadId = req.query.thread_id;
    const userInput = req.query.message;

    if (!threadId) {
      console.log('Error: Missing threadId');
      return res.status(400).json({ error: 'Missing threadId' });
    }

    console.log(`Received message: ${userInput} for thread ID: ${threadId}`);

    // Add the user's message to the thread
    const message = await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: userInput,
    });

    // Run the Assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistant_id,
      instructions: 'you recommend restaurant nearby specific location',
    });

    while (true) {
      const runStatus = await openai.beta.threads.runs.retrieve(
        threadId,
        run.id
      );

      if (runStatus.status === 'completed') {
        break;
      } else if (runStatus.status === 'requires_action') {
        // Handle the function call
        for (let toolCall of runStatus.required_action.submit_tool_outputs
          .tool_calls) {
          if (toolCall.function_name === 'kakaoRestaurant') {
            // Process solar panel calculations
            const arguments = JSON.parse(toolCall.function_arguments);
            const output = functions.kakaoRestaurant(
              arguments['x'],
              arguments['y']
            );

            await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
              toolOutputs: [
                {
                  tool_call_id: toolCall.id,
                  output: JSON.stringify(output),
                },
              ],
            });
          }
        }
      }
    }
    const messages = await openai.beta.threads.messages.list(threadId);
    const response = messages.data[0].content[0].text.value;
    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;

// 오늘뭐먹지
// assistant_id:  asst_w5c7p6uB4btFaxb6VePo4vm4

// 스레드 id : thread_7uUbeOlcx18E4MZP0B3sVTvZ

// 메시지 json
// {"id":"msg_ZiXjv6Z0TFZEcn5CFf4z2uRc","object":"thread.message","created_at":1703059482,"thread_id":"thread_7uUbeOlcx18E4MZP0B3sVTvZ","role":"user","content":[{"type":"text","text":{"value":"call functions","annotations":[]}}],"file_ids":[],"assistant_id":null,"run_id":null,"metadata":{}}

// run json
// {"id":"run_E8sxxGOMJh9HI6iMiK87F8G6","object":"thread.run","created_at":1703059707,"assistant_id":"asst_w5c7p6uB4btFaxb6VePo4vm4","thread_id":"thread_7uUbeOlcx18E4MZP0B3sVTvZ","status":"queued","started_at":null,"expires_at":1703060307,"cancelled_at":null,"failed_at":null,"completed_at":null,"last_error":null,"model":"gpt-4","instructions":"you serve restaurant infomation form kakaoRestaurant function calling","tools":[{"type":"code_interpreter"},{"type":"function","function":{"name":"kakaoRestaurant","description":"kakao api","parameters":{"type":"object","properties":{"category_group_code":{"type":"string","description":"category code!"},"x":{"type":"string","description":"위도"},"radius":{"type":"string","description":"반경"}},"required":["category_group_code","x","y","radius"]}}}],"file_ids":[],"metadata":{}}

// retrieve json
// {"id":"run_tzNC0oa5loTh0u3GK2aMyuIo","object":"thread.run","created_at":1703059760,"assistant_id":"asst_w5c7p6uB4btFaxb6VePo4vm4","thread_id":"thread_7uUbeOlcx18E4MZP0B3sVTvZ","status":"queued","started_at":null,"expires_at":1703060360,"cancelled_at":null,"failed_at":null,"completed_at":null,"last_error":null,"model":"gpt-4","instructions":"you serve restaurant infomation form kakaoRestaurant function calling","tools":[{"type":"code_interpreter"},{"type":"function","function":{"name":"kakaoRestaurant","description":"kakao api","parameters":{"type":"object","properties":{"category_group_code":{"type":"string","description":"category code!"},"x":{"type":"string","description":"위도"},"radius":{"type":"string","description":"반경"}},"required":["category_group_code","x","y","radius"]}}}],"file_ids":[],"metadata":{}}

// navigator.geolocation.getCurrentPosition(function(pos) {
//     console.log(pos);
//     var latitude = pos.coords.latitude;
//     var longitude = pos.coords.longitude;
//     alert("현재 위치는 : " + latitude + ", "+ longitude);
// });
