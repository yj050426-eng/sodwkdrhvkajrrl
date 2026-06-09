require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 현재 폴더의 정적 파일 제공
app.use(express.static(__dirname));

// ===============================
// 레시피 추천 API 라우터
// ===============================
app.post("/recipe", async (req, res) => {
  try {
    const ingredients = req.body.ingredients || [];
    
    const prompt = `
사용자 제공 재료: ${ingredients.join(", ")}

위 재료를 기반으로 맛있는 냉장고 파먹기 요리 레시피 3개를 추천해줘.
반드시 아래의 JSON 구조 형식을 완벽히 지켜서 오직 JSON 데이터만 응답해줘. 설명이나 앞뒤 인사말은 절대 포함하지 마.

{
  "recipes": [
    {
      "name": "요리 이름",
      "description": "요리에 대한 짧은 설명",
      "ingredients": ["밥", "양파", "계란", "식용유", "소금", "후추"],
      "steps": "1. 첫 번째 순서\\n2. 두 번째 순서\\n3. 세 번째 순서\\n4. 네 번째 순서\\n5. 다섯 번째 순서"
    }
  ]
}

⚠️ 조건 (반드시 준수):
1. "ingredients" 배열에는 해당 요리를 완성하기 위해 필요한 메인 주재료, 부재료뿐만 아니라 식용유, 소금, 후추, 간장 같은 모든 양념/조미료류까지 묶어서 단어 형태로 리스트에 빠짐없이 채워줘.
2. 요리 과정("steps")은 누구나 쉽게 따라 할 수 있도록 최소 5단계 이상의 과정으로 상세하게 작성해줘.
3. "steps" 안에서 각 단계(1., 2., 3...)가 끝날 때마다 반드시 줄바꿈 문자(\\n)를 삽입하여 단계별로 완전히 분리해줘.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that only replies in strict JSON format." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "OpenRouter AI 응답을 받지 못했습니다." });
    }

    let text = data.choices[0].message.content.trim();

    if (text.includes("```")) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) text = match[0];
    }

    try {
      const recipes = JSON.parse(text);
      res.json(recipes);
    } catch (parseError) {
      console.error("❌ AI 응답 JSON 파싱 실패:", text);
      res.status(500).json({ error: "AI가 준 응답을 JSON 데이터로 변환하지 못했습니다." });
    }

  } catch (error) {
    console.error("❌ 서버 내부 에러:", error);
    res.status(500).json({ error: "서버 내부 오류가 발생했습니다." });
  }
});

// ===============================
// 서버 실행
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ 안정적인 타합 버전 서버 오픈! http://localhost:${PORT}`);
});