// ===============================
// 재료 배열
// ===============================

let ingredientsArray = [];


// ===============================
// HTML 요소 가져오기
// ===============================

const ingredientInput =
  document.getElementById("ingredient-input");

const addBtn =
  document.getElementById("add-btn");

const ingredientsList =
  document.getElementById("ingredients-list");

const recommendBtn =
  document.getElementById("recommend-btn");

const resultBox =
  document.getElementById("result");

const startBtn =
  document.getElementById("start-btn");

const startScreen =
  document.getElementById("start-screen");

const mainScreen =
  document.getElementById("main-screen");

const bgm =
  document.getElementById("bgm");


// ===============================
// 처음에는 메인 숨기기
// ===============================

mainScreen.style.display = "none";


// ===============================
// 시작 버튼
// ===============================

startBtn.addEventListener("click", async () => {

  // 시작 화면 숨기기
  startScreen.style.display = "none";

  // 메인 화면 보이기
  mainScreen.style.display = "block";

  // 음악 재생
  try {

    bgm.volume = 1.0;

    bgm.currentTime = 0;

    await bgm.play();

    console.log("🎵 음악 재생 성공");

  } catch(error) {

    console.log("❌ 음악 재생 실패");

    console.log(error);

  }

});


// ===============================
// 재료 추가
// ===============================

function addIngredient() {

  const ingredient =
    ingredientInput.value.trim();

  if (ingredient === "") {

    return;

  }

  if (ingredientsArray.includes(ingredient)) {

    alert("이미 추가된 재료입니다.");

    return;

  }

  ingredientsArray.push(ingredient);

  renderIngredients();

  ingredientInput.value = "";

}


// ===============================
// 재료 출력
// ===============================

function renderIngredients() {

  ingredientsList.innerHTML = "";

  ingredientsArray.forEach((ingredient, index) => {

    const tag =
      document.createElement("div");

    tag.className = "ingredient-tag";

    tag.innerHTML = `
      ${ingredient}
      <button onclick="removeIngredient(${index})">
        X
      </button>
    `;

    ingredientsList.appendChild(tag);

  });

}


// ===============================
// 재료 삭제
// ===============================

function removeIngredient(index) {

  ingredientsArray.splice(index, 1);

  renderIngredients();

}


// ===============================
// 버튼 클릭 추가
// ===============================

addBtn.addEventListener(
  "click",
  addIngredient
);


// ===============================
// 엔터 추가
// ===============================

ingredientInput.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Enter") {

      addIngredient();

    }

  }
);


// ===============================
// 레시피 추천
// ===============================

recommendBtn.addEventListener(
  "click",
  async () => {

    if (ingredientsArray.length === 0) {

      alert("재료를 입력해주세요.");

      return;

    }

    resultBox.innerHTML =
      "<h2>🤖 AI가 레시피 생성중...</h2>";

    try {

      const response = await fetch(
        "http://localhost:3000/recipe",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            ingredients:
              ingredientsArray
          })

        }
      );

      const text =
        await response.text();

      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const data =
        JSON.parse(cleaned);

      const recipes =
        data.recipes || [];

      resultBox.innerHTML = "";

      recipes.forEach((recipe) => {

        let ownedHTML = "";

        (recipe.ownedIngredients || [])
        .forEach((item) => {

          ownedHTML += `
            <p style="color:green;">
              ✅ ${item}
            </p>
          `;

        });


        let missingHTML = "";

        (recipe.missingIngredients || [])
        .forEach((item) => {

          missingHTML += `
            <p style="color:red;">
              ❌ ${item}
            </p>
          `;

        });


        let stepsHTML = "";

        (recipe.steps || [])
        .forEach((step) => {

          stepsHTML += `
            <li>${step}</li>
          `;

        });


        resultBox.innerHTML += `

          <div style="
            background:white;
            padding:25px;
            border-radius:25px;
            margin-top:25px;
          ">

            <h2>
              🍳 ${recipe.name}
            </h2>

<p>
  ${recipe.description || ""}
</p>

            <h3>
              재료 일치율
            </h3>

            <p>
              ${recipe.matchScore}%
            </p>

            <h3>
              가지고 있는 재료
            </h3>

            ${ownedHTML}

            <h3>
              부족한 재료
            </h3>

            ${missingHTML}

            <h3>
              만드는 방법
            </h3>

            <ol>
              ${stepsHTML}
            </ol>

          </div>

        `;

      });

    } catch(error) {

      console.log(error);

      resultBox.innerHTML = `
        <h2>⚠️ 오류 발생</h2>
      `;

    }

  }
);