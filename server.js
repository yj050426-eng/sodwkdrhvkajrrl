require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


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
여러 개의 레시피를 추천해라.

규칙:

1. 사용자가 가진 재료와 겹치는 재료가 많은 레시피를 우선 추천
2. 최소 3개의 레시피 추천
3. matchScore는 재료 일치율 퍼센트
4. ownedIngredients에는 사용자가 가진 재료
5. missingIngredients에는 부족한 재료
6. steps는 요리 순서
7. 반드시 JSON 형식만 출력
8. 설명 문장 금지
9. 김치가 있으면:
김치볶음밥,
김치찌개,
김치전
등 다양하게 추천

사용자 재료:
${ingredients.join(", ")}

JSON 형식:

{
  "recipes": [
    {
      "name": "레시피 이름",
      "description": "레시피 설명",
      "matchScore": 90,
      "ownedIngredients": [],
      "missingIngredients": [],
      "steps": []
    }
  ]
}

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

          model:
            "mistralai/mistral-7b-instruct",

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

    const text =
      data.choices[0].message.content;

    res.send(text);

  } catch(error) {

    console.log(error);

    res.status(500).send("서버 오류");

  }

});


// ===============================
// Render 배포용
// ===============================

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`✅ 서버 실행중 ${PORT}`);

});