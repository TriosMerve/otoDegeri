document.addEventListener("DOMContentLoaded", () => {
  let currentStep = 0;
  let maxCompletedStep = 0;
  const steps = document.querySelectorAll(".formStep");
  const navItems = document.querySelectorAll(".formStepMenu li");
  const nextButtons = document.querySelectorAll(".nextButton");
  const prevButtons = document.querySelectorAll(".prevButton");

  const uyelikInputs = document.querySelectorAll("input[name='uyelikSecimi']");
  const uyelikEvetForm = document.querySelector(".uyelikEvetForm");
  const uyelikHayirForm = document.querySelector(".uyelikHayirForm");
  const stepWelcome = document.querySelector("#stepWelcome");

  let selectedUyelik = null;
  const stepHistory = [];

  uyelikInputs.forEach((input) => {
    input.addEventListener("change", () => {
      document.querySelector(".goStep").removeAttribute("disabled");
      document.querySelector(".goStep").classList.remove("disabled");
      stepWelcome.style.display = "block";
    });
  });

  document.getElementById("devamEtBtn").addEventListener("click", () => {
    const selected = document.querySelector(
      "input[name='uyelikSecimi']:checked"
    );
    if (!selected) {
      alert("Lütfen bir seçim yapınız.");
      return;
    }

    selectedUyelik = selected.value;
    stepHistory.push(stepWelcome);
    stepWelcome.style.display = "none";

    if (selectedUyelik === "evet") {
      uyelikEvetForm.style.display = "block";
    } else {
      uyelikHayirForm.style.display = "block";
    }
  });

  document.querySelectorAll(".backButton").forEach((button) => {
    button.addEventListener("click", () => {
      stepWelcome.style.display = "block";
      uyelikEvetForm.style.display = "none";
      uyelikHayirForm.style.display = "none";
    });
  });

  function showStep(stepIndex, isEditMode = false) {
    steps.forEach((step, i) => {
      const formContent = step.querySelector(".formContent");
      const summary = step.querySelector(".stepSummary");

      const isCurrent = i === stepIndex;
      const isBefore = i < stepIndex;
      const isAfter = i > stepIndex;

      if (isCurrent) {
        step.classList.add("active");
        step.classList.remove("completed");
        if (formContent) formContent.classList.add("show");
        // if (formContent) formContent.style.display = "block";
        if (summary) summary.classList.remove("show");
        // if (summary) summary.style.display = "none";
      } else if (isBefore) {
        step.classList.remove("active");
        step.classList.add("completed");
        if (formContent) formContent.classList.remove("show");
        // if (formContent) formContent.style.display = "none";
        if (summary) summary.classList.add("show");
        // if (summary) summary.style.display = "block";
      } else if (isAfter) {
        step.classList.remove("active");

        // 🔥 YENİ: SADECE düzenleme modunda DEĞİLSE ileri adımları temizle
        if (!isEditMode && !isEditing) {
          step.classList.remove("completed");
          if (summary) summary.classList.remove("show");
          // if (summary) summary.style.display = "none";
        }

        if (formContent) formContent.classList.remove("show");
        // if (formContent) formContent.style.display = "none";

        // Düzenleme modundaysak ileri adımların özeti görünmeye devam etmeli
        if ((isEditMode || isEditing) && step.classList.contains("completed")) {
          if (summary) summary.classList.add("show");
          // if (summary) summary.style.display = "block";
        }
      }
    });

    // Nav güncelle
    navItems.forEach((nav, i) => {
      nav.classList.toggle("active", i === stepIndex);
      nav.classList.toggle("disabled", i > stepIndex);
      if (i < stepIndex) nav.classList.remove("disabled");
    });

    currentStep = stepIndex;

    // Uyelik formlarını kontrol et
    if (stepIndex === 0) {
      if (selectedUyelik === "evet") {
        uyelikEvetForm.style.display = "block";
        uyelikHayirForm.style.display = "none";
      } else if (selectedUyelik === "hayir") {
        uyelikHayirForm.style.display = "block";
        uyelikEvetForm.style.display = "none";
      }
    } else {
      uyelikEvetForm.style.display = "none";
      uyelikHayirForm.style.display = "none";
    }
  }

  function updateSummary() {
    steps.forEach((step, index) => {
      const summaryContainer = step.querySelector(".stepSummary");
      if (!summaryContainer) return;

      if (!step.classList.contains("completed")) {
        summaryContainer.classList.remove("show");
        return;
      }

      summaryContainer.innerHTML = "";
      summaryContainer.classList.add("show");

      const form = step.querySelector(".form, .step.form");
      const labels = form?.querySelectorAll(".formLabel");

      if (!labels || labels.length === 0) return;

      labels.forEach((labelEl) => {
        const labelText = labelEl.querySelector("label")?.textContent.trim();
        const groupInputs = [];

        groupInputs.push(
          ...labelEl.querySelectorAll("input, select, textarea")
        );
        // DOM'da bir sonraki .formLabel'a kadar olan input/select vs. öğelerini al
        let el = labelEl.nextElementSibling;

        while (el && !el.classList.contains("formLabel")) {
          groupInputs.push(...el.querySelectorAll("input, select, textarea"));
          el = el.nextElementSibling;
        }
        // Bu özel hasar tablosuysa (örneğin .hasarStep gibi)
        if (
          step.classList.contains("hasarStep") &&
          labelText.includes("Hasarlı")
        ) {
          let tableHTML = `<table class="summaryTable"><thead><tr><th>Parça</th><th>Durum</th></tr></thead><tbody>`;

          const carParts = step.querySelectorAll(".carPartItem");
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

          if (tableHTML.includes("<td>")) {
            summaryContainer.innerHTML += `
            <div class="summaryItem" data-goto="${index}">
              <div class="question">${labelText}</div>
              ${tableHTML}
              <button class="editBtn"></button>
            </div>
          `;
          }

          return;
        }

        // Tramer için özel alan
        if (
          step.classList.contains("hasarStep") &&
          labelText.includes("Tramer")
        ) {
          const tramerInput = step.querySelector("#Tramer");
          const tramerValue = tramerInput?.value.trim();
          const tramerDurum = tramerValue ? "Var" : "Yok";

          summaryContainer.innerHTML += `
          <div class="summaryItem" data-goto="${index}">
            <div class="question">${labelText}</div>
            <p><b>Tramer:</b> ${tramerDurum}</p>
            ${tramerValue ? `<p><b>Tramer Tutarı:</b> ${tramerValue}</p>` : ""}
            <button class="editBtn"></button>
          </div>
        `;
          return;
        }

        // Diğer standart alanlar
        const inputs = labelEl.parentElement.querySelectorAll(
          "input:checked, input[type='text'], input[list], select"
        );

        const relevantInputs = Array.from(inputs).filter((input) => {
          // Sadece bu label'a ait alanlar ve uyelikSecimi hariç
          return (
            (input.closest(".formLabel") === labelEl ||
              input.compareDocumentPosition(labelEl) &
                Node.DOCUMENT_POSITION_PRECEDING) &&
            input.name !== "uyelikSecimi" &&
            input.value.trim()
          );
        });
        const answers = Array.from(groupInputs)
          .filter((input) => {
            return (
              input.name !== "uyelikSecimi" &&
              (input.type === "checkbox" || input.type === "radio"
                ? input.checked
                : input.value.trim())
            );
          })
          .map((input) => input.value.trim())
          .join(" / ");

        if (labelText && answers) {
          summaryContainer.innerHTML += `
            <div class="summaryItem" data-goto="${index}">
              <div class="question">${labelText}</div>
              <div class="answer">${answers}</div>
              <button class="editBtn"></button>
            </div>
          `;
        }
      });
    });

    updateNextButtonText();
  }

  function updateNextButtonText() {
    // Eğer aktif adım, daha önce tamamlanmış ve düzenleme modundaysa 'Kaydet' yazsın, değilse 'Devam Et'
    const nextBtn = steps[currentStep].querySelector(".nextButton");
    console.log("ttt");
    if (!nextBtn) return;

    if (isEditing) {
      nextBtn.textContent = "Kaydet";
    } else {
      nextBtn.textContent = "Devam Et";
    }
  }

  // Düzenleme modu flag'i
  let isEditing = false;

  nextButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("click");

      if (isEditing) {
        isEditing = false;

        // GÜNCEL: Aktif input blur yaparak DOM’a yazılsın
        if (
          document.activeElement &&
          document.activeElement.tagName === "INPUT"
        ) {
          document.activeElement.blur();
        }

        // GÜNCEL: aktif step'i completed yap
        steps[currentStep].classList.add("completed");

        // GÜNCEL: summary güncelle
        setTimeout(() => {
          updateSummary();
          showStep(maxCompletedStep);
        }, 50);

        return;
      }

      if (currentStep < steps.length - 1) {
        stepHistory.push(currentStep);
        showStep(currentStep + 1);
        updateSummary();
        updateNextButtonText();

        if (currentStep > maxCompletedStep) {
          maxCompletedStep = currentStep;
        }
      } else {
        alert("Form tamamlandı!");
      }
    });
  });

  prevButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (stepHistory.length > 0) {
        const previousStep = stepHistory.pop();
        showStep(previousStep);
        updateSummary();
        isEditing = false;
        updateNextButtonText();
      }
    });
  });

  navItems.forEach((item, i) => {
    item.addEventListener("click", () => {
      if (!item.classList.contains("disabled")) {
        showStep(i);
        updateSummary();
        isEditing = false;
        updateNextButtonText();
      }
    });
  });

  // Delegasyon ile edit butonları yakalanıyor
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("editBtn")) {
      const parent = e.target.closest(".summaryItem");
      const stepIndex = parseInt(parent.getAttribute("data-goto"), 10);
      if (!isNaN(stepIndex)) {
        showStep(stepIndex, true); // <-- buraya true ekledik
        isEditing = true;
        updateNextButtonText();
      }
    }
  });

  showStep(0);
  updateSummary();

  function validateStepForm(stepElement) {
    const requiredInputs = stepElement.querySelectorAll("input[required]");
    const nextButton = stepElement.querySelector(".nextButton");

    if (!nextButton) return;

    const allFilled = Array.from(requiredInputs).every(
      (input) => input.value.trim() !== ""
    );

    if (allFilled) {
      nextButton.removeAttribute("disabled");
      nextButton.classList.remove("disabled");
    } else {
      nextButton.setAttribute("disabled", "true");
      nextButton.classList.add("disabled");
    }
  }

  // Tüm form adımları için input dinleyicisi
  document.querySelectorAll(".formStep .form").forEach((formStep) => {
    formStep.addEventListener("input", () => {
      validateStepForm(formStep);
    });
  });
  $(".customSelect").on("change", function () {
    const formStep = this.closest(".formStep .form");
    if (formStep) {
      validateStepForm(formStep);
    }
  });
  carImageInput.addEventListener("change", function () {
    const fileName =
      this.files.length > 0 ? this.files[0].name : "Henüz dosya seçilmedi";
    document.querySelector(".file-name").textContent = fileName;
  });
});
