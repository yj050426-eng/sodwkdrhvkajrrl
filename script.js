window.onload = function () {
  console.log("✅ 안전장치 및 컬러 배지 버전 script 연결 성공");

  // =========================
  // 요소 가져오기 및 HTML ID 매칭 체크
  // =========================
  const startBtn = document.getElementById("start-btn");
  const startScreen = document.getElementById("start-screen");
  const mainScreen = document.getElementById("main-screen");
  const ingredientInput = document.getElementById("ingredient-input");
  const addBtn = document.getElementById("add-btn");
  const recommendBtn = document.getElementById("recommend-btn");
  const ingredientsList = document.getElementById("ingredients-list");
  const result = document.getElementById("result");
  const bgm = document.getElementById("bgm");

  if (!startBtn || !startScreen || !mainScreen || !ingredientInput || !addBtn || !recommendBtn || !ingredientsList || !result) {
    console.warn("⚠️ HTML ID 중 일부가 매칭되지 않아 자바스크립트 가동이 일시 중지되었습니다.");
    return;
  }

  mainScreen.style.display = "none";
  let ingredients = [];

  startBtn.onclick = async function () {
    try { if (bgm) await bgm.play(); } catch (e) { console.log("오디오 차단됨:", e); }
    startScreen.style.display = "none";
    mainScreen.style.display = "block";
  };

  function addIngredient() {
    const ingredient = ingredientInput.value.trim();
    if (!ingredient) return;
    ingredients.push(ingredient);
    ingredientInput.value = "";
    renderIngredients();
  }

  addBtn.onclick = addIngredient;
  ingredientInput.onkeypress = function (e) { if (e.key === "Enter") addIngredient(); };

  function renderIngredients() {
    ingredientsList.innerHTML = "";
    ingredients.forEach(function (ingredient, index) {
      const tag = document.createElement("div");
      tag.className = "ingredient-tag";
      tag.innerHTML = `<span>${ingredient}</span><button class="delete-btn">✖</button>`;
      tag.querySelector(".delete-btn").onclick = function () {
        ingredients.splice(index, 1);
        renderIngredients();
      };
      ingredientsList.appendChild(tag);
    });
  }

  // 레시피 추천 요청
  recommendBtn.onclick = async function () {
    if (ingredients.length === 0) {
      alert("재료를 최소 하나 이상 입력해주세요!");
      return;
    }

    result.innerHTML = "<div class='loading'>🍳 AI가 열심히 레시피를 생성하는 중입니다...</div>";

    try {
      const response = await fetch("/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: ingredients })
      });

      if (!response.ok) throw new Error(`서버 응답 에러 (${response.status})`);

      const data = await response.json();
      result.innerHTML = "";

      if (!data.recipes || data.recipes.length === 0) {
        result.innerHTML = "<div class='error-msg'>❌ 레시피가 없습니다.</div>";
        return;
      }

      const userIngredientsCleaned = ingredients.map(i => i.replace(/\s+/g, "").toLowerCase());

      data.recipes.forEach(recipe => {
        let rawList = recipe.ingredients || recipe.allIngredients || recipe.allingredients || [];
        if (typeof rawList === "string") {
          rawList = rawList.split(/[,,、\s\+]+/).filter(Boolean);
        }
        let finalRecipeIngredients = Array.isArray(rawList) ? [...rawList] : [];

        // 텍스트 마이닝 기본 방어벽
        const combinedTextForSearch = ((recipe.name || "") + " " + (recipe.description || "") + " " + (recipe.steps || "")).toLowerCase();
        const dictionary = ["양파", "계란", "달걀", "밥", "식용유", "간장", "소금", "후추", "김치", "햄", "마늘", "파"];
        
        dictionary.forEach(word => {
          if (combinedTextForSearch.includes(word.toLowerCase())) {
            const alreadyHas = finalRecipeIngredients.some(existing => existing.replace(/\s+/g, "").includes(word));
            if (!alreadyHas) finalRecipeIngredients.push(word);
          }
        });

        recipe.cleanIngredients = finalRecipeIngredients;

        // 일치율 연산
        let matchCount = 0;
        recipe.cleanIngredients.forEach(item => {
          const itemCleaned = item.replace(/\s+/g, "").toLowerCase();
          const isMatched = userIngredientsCleaned.some(userItem => itemCleaned.includes(userItem) || userItem.includes(itemCleaned));
          if (isMatched) matchCount++;
        });

        const total = recipe.cleanIngredients.length || 1;
        recipe.calculatedMatch = Math.floor((matchCount / total) * 100);
      });

      // 일치율 정렬
      const sortedRecipes = data.recipes.sort((a, b) => b.calculatedMatch - a.calculatedMatch);

      // 카드 출력
      sortedRecipes.forEach(function (recipe, index) {
        const card = document.createElement("div");
        card.className = "recipe-card";
        
        // 💡 [추가 조건문] 일치율 숫자에 따라 다른 CSS 색상 클래스 배정
        let matchColorClass = "match-red"; // 기본값 (0~40%)
        const matchScore = recipe.calculatedMatch;
        
        if (matchScore >= 41 && matchScore <= 70) {
          matchColorClass = "match-yellow";
        } else if (matchScore >= 71 && matchScore <= 100) {
          matchColorClass = "match-green";
        }

        const missingIngredients = recipe.cleanIngredients.filter(item => {
          const itemCleaned = item.replace(/\s+/g, "").toLowerCase();
          return !userIngredientsCleaned.some(userItem => itemCleaned.includes(userItem) || userItem.includes(itemCleaned));
        });

        let missingBadgeHTML = "";
        if (missingIngredients.length > 0) {
          missingBadgeHTML = missingIngredients
            .map(item => `<span class="missing-item-badge">${item}</span>`)
            .join(" ");
        } else {
          missingBadgeHTML = "<span class='all-cleared-badge'>👍 부족한 재료 없음!</span>";
        }

        let stepsText = recipe.steps || "";
        let formattedSteps = stepsText.replace(/(?:\s*)(\d+\.)/g, function(match, p1) {
          return p1 === "1." ? match : "<br><br>" + p1;
        });

        card.innerHTML = `
          <h2 class="recipe-title">🥘 ${index + 1}. ${recipe.name}</h2>
          <p class="recipe-desc"><strong>💡 설명:</strong> ${recipe.description}</p>
          
          <div class="recipe-info-block">
            <div class="recipe-match">📌 <strong>재료 일치율:</strong> <span class="match-badge ${matchColorClass}">${matchScore}%</span></div>
            <div class="recipe-missing">⚠️ <strong>부족한 재료 (전체):</strong> <div class="missing-list">${missingBadgeHTML}</div></div>
          </div>
          
          <hr class="card-divider">
          <div class="recipe-steps">
            <p style="margin-top: 0; font-weight: bold; color: #2c3e50;">👨‍🍳 만드는 방법</p>
            <div class="steps-content">${formattedSteps}</div>
          </div>
        `;
        result.appendChild(card);
      });

    } catch (error) {
      console.error(error);
      result.innerHTML = `<div class='error-msg'>❌ 오류 발생: ${error.message}</div>`;
    }
  };
};