const express = require('express');
const axios = require('axios');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: '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',
});

const assistant_id = 'asst_QVzBqCM2w8yJTSQ945cmYcOr';

async function kakaoRestaurant() {
  const response = await axios.get(
    `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${'FD6'}&x=${'126.8990936'}&y=${'37.4820691'}&radius=${'10000'}`,
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
        'you serve infomation about restaurant infomation from kakao api.',
      tools: [
        { type: 'retrieval' },
        {
          type: 'function',
          function: {
            name: 'kakaoRestaurant',
            description: 'kakao api',
            parameters: {
              type: 'object',
              properties: {
                category_group_code: {
                  type: 'string',
                  description: 'category code!',
                },
                x: {
                  type: 'string',
                  description: '경도',
                },
                x: {
                  type: 'string',
                  description: '위도',
                },
                radius: {
                  type: 'string',
                  description: '반경',
                },
              },
              required: ['category_group_code', 'x', 'y', 'radius'],
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

router.get('/thread', async (req, res, next) => {
  // GET /public
  try {
    const thread = await openai.beta.threads.create();
    const message = await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content:
        'call functions kakaoRestaurant, category code is FD6, x is 126.8990496,y is 37.4820557, radius is 10000',
    });
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant_id,
      instructions:
        'you introduce restaurant using kakaoRestaurant functions from based on location,categorycode,radius',
    });

    while (true) {
      if (run.status === 'completed') {
        break;
      }

      const retrieve = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );

      console.log(`run status: ${run.status}`);

      if (retrieve.status === 'requires_action') {
        console.log('Requires action');
        const required_actions =
          await openai.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
            tool_outputs: [
              {
                tool_call_id: run.requiredAction,
                output: '',
              },
            ],
          });
      }
    }
    const list = await openai.beta.threads.messages.list(thread.id);

    res.status(201).json(list);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/submitoutput', async (req, res, next) => {
  // GET /public
  try {
    const threadId = 'thread_A0n1dOOn3zFsgYgiSGVyrfuK';
    const runId = 'run_UYpff8rPc4TaljwdujwjxKLm';
    const run = await openai.beta.threads.runs.submitToolOutputs(
      threadId,
      runId,
      {
        tool_outputs: [
          {
            tool_call_id: 'call_OtQPOG8B3lcOe1LchUY9h5d5',
            output: 'infomation',
          },
        ],
      }
    );
    res.status(201).json(messages);
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
