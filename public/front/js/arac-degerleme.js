document.addEventListener("DOMContentLoaded", function () {
  let currentStep = 0;
  const steps = document.querySelectorAll(".formStep");
  const navItems = document.querySelectorAll(".formStepMenu li");
  const nextButtons = document.querySelectorAll(".nextButton");
  const prevButtons = document.querySelectorAll(".prevButton");
  const summaryArea = document.querySelector(".resultCarValue");

  const uyelikInputs = document.querySelectorAll("input[name='uyelikSecimi']");
  const uyelikEvetForm = document.querySelector(".uyelikEvetForm");
  const uyelikHayirForm = document.querySelector(".uyelikHayirForm");

  const stepUyeOlmadanDevam = document.querySelector(".uyelikHayirForm");
  const stepUyeGiris = document.querySelector(".uyelikEvetForm");

  // Step geçmişi yığını (geri gelmek için)
  const stepHistory = [];

  // Üyelik seçimi yapıldığında formu göster/gizle
  uyelikInputs.forEach((input) => {
    input.addEventListener("change", () => {
      stepWelcome.style.display = "block"; // sadece görünür tut
    });
  });

  devamEtBtn.addEventListener("click", () => {
    console.log("devam et")
    const selected = document.querySelector(
      "input[name='uyelikSecimi']:checked"
    );
    if (!selected) {
      alert("Lütfen bir seçim yapınız.");
      return;
    }

    let nextStep;
    if (selected.value === "evet") {
      nextStep = stepUyeGiris;
    } else {
      nextStep = stepUyeOlmadanDevam;
    }

    stepHistory.push(stepWelcome);
    stepWelcome.style.display = "none";
    nextStep.style.display = "block";
  });
  document.querySelectorAll(".backButton").forEach((button) => {
    button.addEventListener("click", function(){
        stepWelcome.style.display = "block";
         stepUyeGiris.style.display = "none";
         stepUyeOlmadanDevam.style.display = "none";
    })
  });
  document.querySelectorAll(".stepBack").forEach((button) => {
    button.addEventListener("click", () => {
      const current = button.closest(".formStep");
      
      if (stepHistory.length > 0) {
        const previous = stepHistory.pop();
        current.style.display = "none";
        previous.style.display = "block";
      }
    });
  });

    function showStep(stepIndex) {
    steps.forEach((step, i) =>
        step.classList.toggle("active", i === stepIndex)
    );
    navItems.forEach((nav, i) => {
        nav.classList.toggle("active", i === stepIndex);
        nav.classList.toggle("disabled", i > stepIndex);
        if (i < stepIndex) nav.classList.remove("disabled");
    });

    currentStep = stepIndex;

    // Adımların display'lerini güncelle
    steps.forEach((step, i) => {
        step.style.display = i === stepIndex ? "block" : "none";
    });

    // Özel durum: ilk adıma dönülüyorsa diğer formları da gizle
    if (stepIndex === 0) {
        uyelikEvetForm.style.display = "none";
        uyelikHayirForm.style.display = "none";
    }
    }

  function updateSummary() {
    summaryArea.innerHTML = "";

    steps.forEach((step, index) => {
      if (index >= currentStep) return;

      const label = step.querySelector(".formLabel");
      const inputs = step.querySelectorAll("input:checked, input[type='text'], input[list], select");
      const answers = Array.from(inputs).filter(el => el.value).map(el => el.value).join(" / ");

      if (step.classList.contains("hasarStep")) {
        const carParts = step.querySelectorAll(".carPartItem");
        let tableHTML = `<table class="summaryTable"><thead><tr><th>Parça</th><th>Durum</th></tr></thead><tbody>`;

        carParts.forEach((part) => {
          const title = part.querySelector(".title")?.textContent.trim();
          const selectedOptions = Array.from(
            part.querySelectorAll("input:checked")
          )
            .map((input) => input.value)
            .join(" / ");

          if (title && selectedOptions) {
            tableHTML += `<tr><td>${title}</td><td>${selectedOptions}</td></tr>`;
          }
        });

        tableHTML += `</tbody></table>`;

        if (label && tableHTML.includes("<td>")) {
          const summaryItem = document.createElement("div");
          summaryItem.classList.add("summaryItem");
          summaryItem.setAttribute("data-goto", index);
          summaryItem.innerHTML = `<strong>${label.textContent}</strong>:<br>${tableHTML} <button class="editBtn">Düzenle</button>`;
          summaryArea.appendChild(summaryItem);
        }

        return;
      }


      if (label && answers) {
        const summaryItem = document.createElement("div");
        summaryItem.classList.add("summaryItem");
        summaryItem.setAttribute("data-goto", index);
        summaryItem.innerHTML = `<strong>${label.textContent}</strong>: ${answers} <button class="editBtn">Düzenle</button>`;
        summaryArea.appendChild(summaryItem);
      }
    });
  }

  nextButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentStep < steps.length - 1) {
        stepHistory.push(currentStep);
        showStep(currentStep + 1);
        updateSummary();
      }
    });
  });

  prevButtons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (stepHistory.length > 0) {
        const previousStep = stepHistory.pop();
        showStep(previousStep);
        updateSummary();
      }
    });
  });

  summaryArea.addEventListener("click", (e) => {
    if (e.target.classList.contains("editBtn")) {
      const parent = e.target.closest(".summaryItem");
      const stepIndex = parseInt(parent.getAttribute("data-goto"), 10);
      showStep(stepIndex);
    }
  });

  navItems.forEach((item, i) => {
    item.addEventListener("click", () => {
      if (!item.classList.contains("disabled")) {
        showStep(i);
      }
    });
  });

  // Sayfa yüklendiğinde ilk adımı göster
  showStep(0);
});
