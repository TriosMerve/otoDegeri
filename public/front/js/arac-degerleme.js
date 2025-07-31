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
    const offset = 100; // Eğer sabit bir header varsa bu kadar piksel aşağıdan başlat
    const formTop =
      steps[stepIndex].getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top: formTop,
      behavior: "smooth",
    });
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

      // 🔹 AD & SOYAD özel durumu — uyelikHayirForm içindeyse
      if (step.querySelector(".uyelikHayirForm")) {
        const ad = step.querySelector("input[name='ad']")?.value.trim();
        const soyad = step.querySelector("input[name='soyad']")?.value.trim();
        if (ad || soyad) {
          summaryContainer.innerHTML += `
          <div class="summaryItem" data-goto="${index}">
            <div class="question">Adınız ve Soyadınız</div>
            <div class="answer">${ad} ${soyad}</div>
            <button class="editBtn"></button>
          </div>
        `;
        }
      }

      if (!labels || labels.length === 0) return;

      labels.forEach((labelEl) => {
        const labelText = labelEl.querySelector("label")?.textContent.trim();
        const groupInputs = [];

        groupInputs.push(
          ...labelEl.querySelectorAll("input, select, textarea")
        );

        let el = labelEl.nextElementSibling;
        while (el && !el.classList.contains("formLabel")) {
          groupInputs.push(...el.querySelectorAll("input, select, textarea"));
          el = el.nextElementSibling;
        }

        const hasFileInput = groupInputs.some((input) => input.type === "file");

        // HASAR tablosu özeti
        if (
          step.classList.contains("hasarStep") &&
          labelText.includes("Hasarlı")
        ) {
          let tableHTML = `<div class="summaryTableWrapper"><table class="summaryTable"><thead><tr><th>Parça</th><th>Durum</th></tr></thead><tbody>`;
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

          tableHTML += `</tbody></table></div>`;

          if (tableHTML.includes("<td>")) {
            summaryContainer.innerHTML += `
            <div class="summaryItem" data-goto="${index}">
              <div class="question">${labelText}</div>
              <div class="answer">
                ${tableHTML}
              </div>
              <button class="editBtn"></button>
            </div>
          `;
          }

          return;
        }

        // 🔸 TRAMER özeti
        if (
          step.classList.contains("hasarStep") &&
          labelText.includes("Tramer")
        ) {
          const tramerInput = step.querySelector("#tramerCount");
          const tramerValue = tramerInput?.value.trim();
          const tramerDurum = tramerValue ? "Var" : "Yok";

          summaryContainer.innerHTML += `
          <div class="summaryItem" data-goto="${index}">
            <div class="question">${labelText}</div>
            <div class="answer">
              <p><b>Tramer:</b> ${tramerDurum}</p>
              ${
                tramerValue
                  ? `<p><b>Tramer Tutarı:</b> ${tramerValue} TL</p>`
                  : ""
              }
            </div>
            <button class="editBtn"></button>
          </div>
        `;
          return;
        }

        // 🔸 Standart alanlar
        const answers = Array.from(groupInputs)
          .filter(
            (input) =>
              input.name !== "uyelikSecimi" &&
              input.type !== "file" &&
              (input.type === "checkbox" || input.type === "radio"
                ? input.checked
                : input.value.trim() !== "")
          )
          .map((input) => input.value.trim())
          .join(" / ");

        let imagesHtml = "";
        if (hasFileInput && selectedCarImages.length > 0) {
          imagesHtml =
            '<div class="summaryCarImages" style="margin-top:10px;">';
          selectedCarImages.forEach((imgData) => {
            imagesHtml += `
        <a href="${imgData.src}" data-fancybox="gallery" data-caption="${imgData.name}" style="display:inline-block; margin:5px;">
          <img src="${imgData.src}" alt="${imgData.name}" style="width:60px; height:60px; object-fit:cover; border-radius:4px; border:1px solid #ccc;">
        </a>
      `;
          });
          imagesHtml += "</div>";
        }

        if (labelText && (answers || imagesHtml)) {
          summaryContainer.innerHTML += `
            <div class="summaryItem" data-goto="${index}">
              <div class="question">${labelText}</div>
              <div class="answer">
                ${answers}
                ${imagesHtml}
              </div>
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

  const tramerRadios = document.querySelectorAll("input[name='tramer']");
  // const tramerInputContainer = document.getElementById("tramerTutarAlani");

  tramerCount.addEventListener("input", (e) => {
    // Sadece rakamları alalım (nokta, virgül veya boşluk silinsin)
    let value = tramerCount.value.replace(/[^0-9]/g, "");

    if (value === "") {
      tramerCount.value = "";
      return;
    }

    // Sayı olarak parse et
    const numberValue = parseInt(value, 10);

    // Binlik ayraçlı string haline getir
    const formatted = numberValue.toLocaleString("tr-TR");

    // Inputa tekrar formatlanmış değeri koy
    tramerCount.value = formatted;
  });
  // Başlangıçta Tramer inputu gizle (eğer yoksa)
  // Eğer zaten gizli değilse bu satırı kaldırabilirsin.
  if (
    !document.querySelector("input[name='tramer']:checked") ||
    document.querySelector("input[name='tramer']:checked").value === "yok"
  ) {
    tramerCount.setAttribute("disabled", "disabled");
    tramerCount.classList.add("disabled");
    tramerCount.removeAttribute("required");
  } else {
    tramerCount.removeAttribute("disabled");
    tramerCount.classList.remove("disabled");
    tramerCount.setAttribute("required", "required");
  }

  // Tramer radio butonlar için event listener ekle
  tramerRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.value === "var" && radio.checked) {
        tramerCount.classList.remove("disabled");
        tramerCount.removeAttribute("disabled");
        tramerCount.setAttribute("required", "required");
      } else if (radio.value === "yok" && radio.checked) {
        tramerCount.classList.add("disabled");
        tramerCount.setAttribute("disabled", "disabled");
        tramerCount.value = ""; // Inputu temizle
        tramerCount.removeAttribute("required");

        // Hata mesajlarını ve invalid classlarını temizle
        tramerCount.classList.remove("invalid", "valid");
        tramerCount.parentElement.classList.remove("invalid", "valid");
        const oldError =
          tramerCount.parentElement.querySelector(".error-message");
        if (oldError) oldError.remove();

        // Validasyon tekrar çalıştırılabilir (isteğe bağlı)
        const currentForm = tramerCount.closest(".form");
        if (currentForm) validateStepForm(currentForm);
      }
    });
  });

  const kilometreInput = document.querySelector("input[name='kilometre']");
  if (kilometreInput) {
    kilometreInput.addEventListener("input", () => {
      let value = kilometreInput.value.replace(/[^0-9]/g, "");
      if (value === "") {
        kilometreInput.value = "";
        return;
      }
      const numberValue = parseInt(value, 10);
      if (isNaN(numberValue)) {
        kilometreInput.value = "";
        return;
      }
      kilometreInput.value = numberValue.toLocaleString("tr-TR");
    });
  }
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

  function formatTurkishPlate(value) {
    // Sadece rakam ve harfleri büyük harf olarak al
    value = value.toUpperCase().replace(/[^0-9A-ZÇĞİÖŞÜ]/g, "");

    // İlk 2 karakter => il kodu (rakam olmalı)
    let part1 = value.slice(0, 2);
    if (!/^\d{0,2}$/.test(part1)) {
      part1 = part1.replace(/\D/g, ""); // rakam olmayanları temizle
    }

    let rest = value.slice(2);

    // İkinci kısım: 1-3 harf
    const lettersMatch = rest.match(/^[A-ZÇĞİÖŞÜ]{0,3}/);
    let part2 = lettersMatch ? lettersMatch[0] : "";

    // Üçüncü kısım: geri kalan rakamlar
    let part3 = rest.slice(part2.length).replace(/\D/g, "");

    // Şimdi 2. kısma göre 3. kısmın uzunluğu sınırla:
    if (part2.length === 1) {
      part3 = part3.slice(0, 4);
    } else if (part2.length === 2) {
      part3 = part3.slice(0, 4); // 3 veya 4 rakam olabilir, biz 4'e izin verelim
    } else if (part2.length === 3) {
      part3 = part3.slice(0, 2);
    } else {
      // 2. kısım 0 ise zaten buraya gelmez, 3. kısmı temizle
      part3 = "";
    }

    // Birleştir, araya boşluk koy
    let formatted = part1;
    if (part1.length === 2) {
      formatted += " ";
    }
    formatted += part2;
    if (part2.length > 0) {
      formatted += " ";
    }
    formatted += part3;

    return formatted.trim();
  }
  const foreignPlatePatterns = [
    /^[A-ZÄÖÜ]{1,3}\s?[A-Z]{1,2}\s?[0-9]{1,4}$/, // Almanya
    /^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$/, // İngiltere
    /^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/, // Fransa
    /^[A-Z]{2}\s?[0-9]{3}\s?[A-Z]{2}$/, // İtalya
    /^[0-9][A-Z]{3}[0-9]{3}$/, // ABD
  ];
  function validatePlate(value) {
    const val = value.toUpperCase().replace(/\s+/g, " ").trim();

    // Türk plaka regexleri
    const pattern1 = /^(0[1-9]|[1-7][0-9]|8[0-1])\s[A-ZÇĞİÖŞÜ]{1}\s[0-9]{4}$/;
    const pattern2 = /^(0[1-9]|[1-7][0-9]|8[0-1])\s[A-ZÇĞİÖŞÜ]{2}\s[0-9]{3,4}$/;
    const pattern3 = /^(0[1-9]|[1-7][0-9]|8[0-1])\s[A-ZÇĞİÖŞÜ]{3}\s[0-9]{2}$/;

    if (pattern1.test(val) || pattern2.test(val) || pattern3.test(val)) {
      return true; // Türk plakası geçerli
    }

    // Yabancı plakalar için kontrol
    for (const pattern of foreignPlatePatterns) {
      if (pattern.test(val)) {
        return true; // Yabancı plaka geçerli
      }
    }

    return false; // Hiçbiri eşleşmedi => geçersiz plaka
  }
  function formatPlateOnInput(value) {
    const plainVal = value.toUpperCase().replace(/[^0-9A-ZÇĞİÖŞÜ\s-]/g, "");

    // İlk iki karakter rakam mı diye kontrol et, varsa Türk plakası formatla
    if (/^\d{1,2}/.test(plainVal)) {
      return formatTurkishPlate(plainVal);
    }

    // Yabancı plakalar için:
    // Büyük harfe çevir ve çoklu boşlukları tek boşluğa indir
    return plainVal.replace(/\s+/g, " ").trim();
  }
  function validateStepForm(stepElement) {
    const inputs = stepElement.querySelectorAll("input, select, textarea");
    const nextButton = stepElement.querySelector(".nextButton");

    if (!nextButton) return;

    let allValid = true;

    inputs.forEach((input) => {
      const isRequired = input.hasAttribute("required");
      const value = input.value.trim();

      const parent = input.closest(".formLabel") || input.parentElement;

      // Önceki hata mesajını kaldır
      const oldError = parent.querySelector(".error-message");
      if (oldError) oldError.remove();

      // Kilometre özel kontrolü
      if (input.name === "kilometre") {
        const rawValue = value.replace(/\./g, ""); // 🔥 NOKTAYI TEMİZLE
        const onlyDigits = /^[0-9]+$/.test(rawValue);
        const kmValue = parseInt(rawValue, 10);

        if (!onlyDigits || isNaN(kmValue) || kmValue <= 0 || kmValue > 250000) {
          input.classList.remove("valid");
          input.classList.add("invalid");
          input.parentElement.classList.remove("valid");
          input.parentElement.classList.add("invalid");
          allValid = false;

          const error = document.createElement("div");
          error.className = "error-message";
          error.textContent =
            "Lütfen 0 ile 250.000 arasında geçerli bir kilometre giriniz.";
          parent.appendChild(error);

          return;
        } else {
          input.classList.remove("invalid");
          input.classList.add("valid");
          input.parentElement.classList.remove("invalid");
          input.parentElement.classList.add("valid");
          return;
        }
      }

      // Özel kontrol: Tramer inputu, ancak sadece tramer 'var' seçiliyse zorunlu
      if (input.id === "tramerCount") {
        const tramerSelected =
          document.querySelector("input[name='tramer']:checked")?.value ===
          "var";

        if (tramerSelected) {
          if (value === "") {
            input.classList.remove("valid");
            input.classList.add("invalid");
            input.parentElement.classList.remove("valid");
            input.parentElement.classList.add("invalid");
            allValid = false;

            const error = document.createElement("div");
            error.className = "error-message";
            error.textContent = "Lütfen Tramer tutarını giriniz.";
            parent.appendChild(error);

            return;
          } else {
            input.classList.remove("invalid");
            input.classList.add("valid");
            input.parentElement.classList.remove("invalid");
            input.parentElement.classList.add("valid");
            return;
          }
        } else {
          // Eğer tramer yok ise valid say
          input.classList.remove("invalid", "valid");
          input.parentElement.classList.remove("invalid", "valid");
          return;
        }
      }

      if (input.name === "numberPlate") {
        if (!validatePlate(input.value)) {
          input.classList.remove("valid");
          input.classList.add("invalid");
          input.parentElement.classList.remove("valid");
          input.parentElement.classList.add("invalid");
        } else {
          input.classList.remove("invalid");
          input.classList.add("valid");
          input.parentElement.classList.remove("invalid");
          input.parentElement.classList.add("valid");
        }
      }
      const hasValue =
        input.type === "checkbox" || input.type === "radio"
          ? input.checked
          : value !== "";

      if (isRequired && !hasValue) {
        input.classList.remove("valid");
        input.classList.add("invalid");
        input.parentElement.classList.remove("valid");
        input.parentElement.classList.add("invalid");
        allValid = false;

        const error = document.createElement("div");
        error.className = "error-message";
        error.textContent = "Bu alan zorunludur.";
        parent.appendChild(error);
      } else {
        input.classList.remove("invalid");
        input.classList.add("valid");
        input.parentElement.classList.remove("invalid");
        input.parentElement.classList.add("valid");
      }
    });

    if (allValid) {
      nextButton.classList.add("active");
      nextButton.classList.remove("disabled");
      nextButton.disabled = false;
    } else {
      nextButton.classList.remove("active");
      nextButton.classList.add("disabled");
      nextButton.disabled = true;
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

  let selectedCarImages = [];
  const fileNameSpan = document.querySelector(".file-name");
  const thumbnailsDiv = document.querySelector(".thumbnails");

  carImageInput.addEventListener("change", (event) => {
    const files = event.target.files;
    thumbnailsDiv.innerHTML = ""; // önceki küçük resimleri temizle
    selectedCarImages = []; // önceki kayıtları temizle

    if (files.length === 0) {
      fileNameSpan.textContent = "Henüz dosya seçilmedi";
      updateSummary();
      return;
    }

    if (files.length > 10) {
      alert("En fazla 10 dosya seçebilirsiniz.");
      carImageInput.value = ""; // seçimi sıfırla
      fileNameSpan.textContent = "Henüz dosya seçilmedi";
      updateSummary();
      return;
    }

    fileNameSpan.textContent = `${files.length} dosya seçildi`;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        selectedCarImages.push({ src: base64, name: file.name });

        // Thumbnail
        const wrapperDiv = document.createElement("div");
        wrapperDiv.style.display = "inline-block";
        wrapperDiv.style.margin = "5px";

        const link = document.createElement("a");
        link.href = base64;
        link.setAttribute("data-fancybox", "gallery");
        link.setAttribute("data-caption", file.name);

        const img = document.createElement("img");
        img.src = base64;
        img.style.width = "80px";
        img.style.height = "80px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "4px";
        img.style.border = "1px solid #ccc";
        img.alt = file.name;

        link.appendChild(img);
        wrapperDiv.appendChild(link);
        thumbnailsDiv.appendChild(wrapperDiv);

        // Summary güncelle
        updateSummary();
      };
      reader.readAsDataURL(file);
    });
  });

  const numberPlateInput = document.getElementById("numberPlate");

  numberPlateInput.addEventListener("input", (e) => {
    const formatted = formatPlateOnInput(e.target.value);
    e.target.value = formatted;

    if (validatePlate(formatted)) {
      numberPlateInput.classList.remove("invalid");
      numberPlateInput.classList.add("valid");
    } else {
      numberPlateInput.classList.remove("valid");
      numberPlateInput.classList.add("invalid");
    }
  });
});
