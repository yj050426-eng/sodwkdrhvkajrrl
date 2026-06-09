require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


// 정적 파일 연결
app.use(express.static(__dirname));


// ===============================
// 레시피 API
// ===============================

app.post("/recipe", async (req, res) => {

  try {

    const ingredients =
      req.body.ingredients || [];

    const prompt = `

너는 요리 추천 AI다.

사용자가 가진 재료를 기반으로
레시피 3개를 추천해라.

반드시 JSON 형식만 출력해라.

형식:

{
  "recipes": [
    {
      "name": "레시피 이름",
      "description": "설명",
      "matchScore": 90,
      "ownedIngredients": [],
      "missingIngredients": [],
      "steps": []
    }
  ]
}

사용자 재료:
${ingredients.join(", ")}

`;

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

    const data =
      await response.json();

    console.log(data);

    if (!data.choices) {

      return res
        .status(500)
        .send("AI 응답 오류");

    }

    const text =
      data.choices[0].message.content;

    res.send(text);

  } catch(error) {

    console.log(error);

    res.status(500).send("서버 오류");

  }

});


// ===============================
// 서버 실행
// ===============================

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`✅ 서버 실행중 ${PORT}`);

});