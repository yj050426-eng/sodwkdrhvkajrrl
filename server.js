const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


// 테스트
app.get("/", (req, res) => {

  res.send("서버 정상");

});


// 레시피 추천 API
app.post("/recipe", async (req, res) => {

  try {

    const { ingredients } = req.body;

    const prompt = `
너는 AI 요리 추천 시스템이다.

사용자가 가진 재료를 분석해서
가장 어울리는 요리 3개를 추천해줘.

사용자 재료:
${ingredients.join(", ")}

반드시 JSON 형식으로만 답변해.

{
  "recipes":[
    {
      "name":"요리 이름",

      "description":"요리 설명",

      "matchScore":95,

      "ownedIngredients":[
        "재료1",
        "재료2"
      ],

      "missingIngredients":[
        "재료1",
        "재료2"
      ],

      "steps":[
        "1단계",
        "2단계",
        "3단계"
      ]
    }
  ]
}
`;

    // OpenRouter API 요청
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {

        method: "POST",

        headers: {

          "Authorization":
            `Bearer ${process.env.OPENROUTER_API_KEY}`,

          "Content-Type":
            "application/json"

        },

        body: JSON.stringify({

          model: "openai/gpt-3.5-turbo",

          messages: [
            {
              role: "user",
              content: prompt
            }
          ]

        })

      }
    );

    const data = await response.json();

    console.log(data);

    const text =
      data.choices[0]
      .message.content;

    res.send(text);

  } catch(error) {

    console.log(error);

    res.status(500).send(`
    {
      "recipes":[
        {
          "name":"오류",
          "description":"AI 오류",
          "matchScore":0,
          "ownedIngredients":[],
          "missingIngredients":[],
          "steps":[
            "잠시 후 다시 시도해주세요"
          ]
        }
      ]
    }
    `);

  }

});


// 서버 실행
app.listen(3000, () => {

  console.log("✅ 서버 실행중");

});