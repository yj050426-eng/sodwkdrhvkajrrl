window.addEventListener("DOMContentLoaded", () => {

  const startBtn =
    document.getElementById("startBtn");

  const introScreen =
    document.getElementById("introScreen");

  const mainScreen =
    document.getElementById("mainScreen");

  const ingredientInput =
    document.getElementById("ingredientInput");

  const addBtn =
    document.getElementById("addBtn");

  const ingredientList =
    document.getElementById("ingredientList");

  const recommendBtn =
    document.getElementById("recommendBtn");

  const resultBox =
    document.getElementById("resultBox");

  const bgm =
    document.getElementById("bgm");


  let ingredients = [];


  // 시작 버튼
  startBtn.addEventListener("click", async () => {

    try {

      await bgm.play();

    } catch(error) {

      console.log(error);

    }

    introScreen.style.display = "none";

    mainScreen.style.display = "flex";

  });


  // 재료 추가
  addBtn.addEventListener("click", () => {

    const ingredient =
      ingredientInput.value.trim();

    if (!ingredient) return;

    ingredients.push(ingredient);

    renderIngredients();

    ingredientInput.value = "";

  });


  // 엔터 입력
  ingredientInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

      addBtn.click();

    }

  });


  // 재료 렌더링
  function renderIngredients() {

    ingredientList.innerHTML = "";

    ingredients.forEach((ingredient, index) => {

      const item =
        document.createElement("div");

      item.className =
        "ingredient-item";

      item.innerHTML = `
        ${ingredient}
        <button onclick="removeIngredient(${index})">
          ❌
        </button>
      `;

      ingredientList.appendChild(item);

    });

  }


  // 삭제
  window.removeIngredient = (index) => {

    ingredients.splice(index, 1);

    renderIngredients();

  };


  // 레시피 추천
  recommendBtn.addEventListener("click", async () => {

    if (ingredients.length === 0) {

      alert("재료를 입력해주세요!");

      return;

    }

    resultBox.innerHTML =
      "<p>🍳 레시피 생성중...</p>";

    try {

      const response = await fetch("/recipe", {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          ingredients
        })

      });

      const text =
        await response.text();

      console.log(text);

      const data =
        JSON.parse(text);

      resultBox.innerHTML = "";

      if (!data.recipes) {

        resultBox.innerHTML =
          "<p>❌ 레시피 생성 실패</p>";

        return;

      }

      data.recipes.forEach((recipe) => {

        const card =
          document.createElement("div");

        card.className =
          "recipe-card";

        card.innerHTML = `

          <h2>
            🍽 ${recipe.name || ""}
          </h2>

          <p>
            ${recipe.description || ""}
          </p>

          <p>
            💖 재료 일치율:
            ${recipe.matchScore || 0}%
          </p>

          <h3>
            ✅ 가지고 있는 재료
          </h3>

          <ul>
            ${(recipe.ownedIngredients || [])
              .map(item =>
                `<li>${item}</li>`
              )
              .join("")}
          </ul>

          <h3>
            🛒 부족한 재료
          </h3>

          <ul>
            ${(recipe.missingIngredients || [])
              .map(item =>
                `<li>${item}</li>`
              )
              .join("")}
          </ul>

          <h3>
            👩‍🍳 요리 순서
          </h3>

          <ol>
            ${(recipe.steps || [])
              .map(step =>
                `<li>${step}</li>`
              )
              .join("")}
          </ol>

        `;

        resultBox.appendChild(card);

      });

    } catch(error) {

      console.log(error);

      resultBox.innerHTML =
        "<p>❌ 서버 오류 발생</p>";

    }

  });

});