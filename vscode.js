const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


// ===============================
// 테스트용
// ===============================

app.get("/", (req, res) => {

  res.send("서버 정상");

});


// ===============================
// 레시피 추천 API
// ===============================

app.post("/recipe", async (req, res) => {

  try {

    // 사용자가 입력한 재료
    const { ingredients } = req.body;

    // AI에게 보낼 프롬프트
    const prompt = `
사용자 재료:
${ingredients.join(", ")}

위 재료를 활용한 요리를 추천해줘.

반드시 아래 JSON 형식으로만 답변해.

{
  "name":"요리 이름",
  "description":"요리 설명",
  "ingredients":["재료1","재료2"],
  "steps":[
    "1단계",
    "2단계",
    "3단계"
  ]
}
`;

    // ===============================
    // OpenRouter API 요청
    // ===============================

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

          // 사용 가능한 모델
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

    // 응답 JSON 변환
    const data = await response.json();

    console.log(data);

    // AI 답변 꺼내기
    const text =
      data.choices[0]
      .message.content;

    // 브라우저로 전송
    res.send(text);

  } catch(error) {

    console.log(error);

    // 오류 발생 시
    res.status(500).send(`
    {
      "name":"오류 발생",
      "description":"AI 서버 오류",
      "ingredients":[],
      "steps":[
        "잠시 후 다시 시도해주세요"
      ]
    }
    `);

  }

});


// ===============================
// 서버 실행
// ===============================

app.listen(3000, () => {

  console.log("✅ 서버 실행중");

});