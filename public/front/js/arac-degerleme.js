window.addEventListener("load", () => {
  //sayfa scroll pozısyonda bırakılmıs ise ilk acıldıgında sayfayı en tepeden baslat
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);
});
document.querySelectorAll('.uyelikEvetForm input').forEach(input => {
  input.setAttribute('autocomplete', 'off');
});

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

  //hosgeldınız ekranındakı devam et butonu ayrı olarak calıstırılmıstır burada ana formstepler degıl step gecıslerı saglandıgından farklı class ıle ıslem yapıldı
  uyelikInputs.forEach((input) => {
    input.addEventListener("change", () => {
      document.querySelector(".goStep").removeAttribute("disabled");
      document.querySelector(".goStep").classList.remove("disabled");
      stepWelcome.style.display = "block";
    });
  });

  //Devam et butonu -- modern javascriptde getElementbyId yerıne direk Id kullanılıyor o yzuden herhangı bıryerde degısken olarak tanımlanmadı.
  devamEtBtn.addEventListener("click", () => {
    const selected = document.querySelector(
      "input[name='uyelikSecimi']:checked"
    );
    if (!selected) {
      //buraya sweetalert eklenebılır ya da dıalog
      alert("Lütfen bir seçim yapınız.");
      return;
    }

    //hosgeldınız ekranında logın veya logınsız gırıs ıcın ekran gostermeler buradan yapılıyor
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

    setTimeout(() => {
      //form gecıslerınde bır sonrakı formu scroll ederek yukarıdan baslatır
      const offset = 140; // Eğer sabit bir header varsa bu kadar piksel aşağıdan başlat
      const formTop =
        steps[stepIndex].getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top: formTop - 80,
        behavior: "smooth",
      });
    }, 100);

    currentStep = stepIndex;

    const activeNav = navItems[stepIndex];
    if (activeNav) {
      // parent scroll container (örneğin .formStepMenu)
      const container = activeNav.parentElement;

      // scrollIntoView kullanabiliriz, block: 'nearest' ile aşırı kaymayı önler
      activeNav.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }

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

  //Summary guncelleme
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

      // uyelikHayirForm içindeyse ad-soyad ozel durum
      if (step.querySelector(".uyelikHayirForm")) {
        const ad = step.querySelector("input[name='ad']")?.value.trim();
        const soyad = step.querySelector("input[name='soyad']")?.value.trim();
        if (ad || soyad) {
          summaryContainer.innerHTML += `
          <div class="summaryItem" data-goto="${index}">
            <div class="question">Adınızı girerek başlayabiliriz.</div>
            <div class="answer">${ad} ${soyad}</div>
            <button class="editBtn"></button>
          </div>
        `;
        }
      }

      //label form label kontrol
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

        // Hasar Step formunda Hasar tablosu özeti
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

        // Hasar Step formunda Tramer ınput kontrol
        if (
          step.classList.contains("hasarStep") &&
          labelText.includes("Tramer")
        ) {
          const tramerInput = step.querySelector("#tramerCount");
          const tramerValue = tramerInput?.value.trim();
          const tramerChecked = step.querySelector(
            "input[name='tramer']"
          )?.checked;
          const tramerDurum = tramerChecked ? "Var" : "Yok";

          summaryContainer.innerHTML += `
            <div class="summaryItem" data-goto="${index}">
              <div class="question">${labelText}</div>
              <div class="answer">
              ${!tramerChecked ? `<p><b>Tramer:</b> ${tramerDurum}</p>` : ""}
                
                ${
                  tramerValue && tramerChecked
                    ? `<p><b>Tramer Tutarı:</b> ${tramerValue} TL</p>`
                    : ""
                }
              </div>
              <button class="editBtn"></button>
            </div>
          `;
          return;
        }

        // Standart secım alanları
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

        // arac gorsellerı kaydedılen ozet kısmı start
        let imagesHtml = "";
        if (hasFileInput && selectedCarImages.length > 0) {
          imagesHtml = '<div class="summaryCarImages thumbnails">';
          selectedCarImages.forEach((imgData) => {
            imagesHtml += `
                  <a href="${imgData.src}" data-fancybox="gallery" data-caption="${imgData.name}" class="thumbItem">
                    <img src="${imgData.src}" alt="${imgData.name}">
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
        // arac gorsellerı kaydedılen ozet kısmı end
      });
    });
    updateNextButtonText();
  }

  function updateNextButtonText() {
    // Eğer aktif adım, daha önce tamamlanmış ve düzenleme modundaysa 'Kaydet' yazsın, değilse 'Devam Et'
    const nextBtn = steps[currentStep].querySelector(".nextButton");
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

        document.querySelectorAll(".formStep").forEach((step) => {
          step.classList.remove("disabled");
        });
        return;
      }

      if (currentStep < steps.length - 1) {
        stepHistory.push(currentStep);
        showStep(currentStep + 1);
        updateSummary();
        updateNextButtonText();
        if (steps[currentStep].classList.contains("hasarStep")) {
          console.log("hasarStep'deyim");

          const currentNextButton =
            steps[currentStep].querySelector(".nextButton");
          if (currentNextButton) {
            currentNextButton.classList.remove("disabled");
            currentNextButton.removeAttribute("disabled"); // Eğer HTML'de "disabled" attribute varsa bunu da kaldır
          }
        }

        if (currentStep > maxCompletedStep) {
          maxCompletedStep = currentStep;
        }
      } else {
        // alert("Form tamamlandı!");
        //buraya sweet alert eklenecek
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

  const tramerCheckbox = document.querySelector("input[name='tramer']");
  const hasarStepNextButton = document.querySelector(
    ".formStep.hasarStep .nextButton"
  );

  // Sayfa yüklendiğinde checkbox'a göre input'u başlat
  if (!tramerCheckbox.checked) {
    tramerCount.setAttribute("disabled", "disabled");
    tramerCount.classList.add("disabled");
    tramerCount.removeAttribute("required");
  } else {
    tramerCount.removeAttribute("disabled");
    tramerCount.classList.remove("disabled");
    tramerCount.setAttribute("required", "required");
  }

  // Tramer checkbox değişimi
  tramerCheckbox.addEventListener("change", () => {
    if (tramerCheckbox.checked) {
      console.log("tramercount tramer chekcbox checked");
      tramerCount.removeAttribute("disabled");
      tramerCount.classList.remove("disabled");
      tramerCount.setAttribute("required", "required");

      if (hasarStepNextButton) {
        hasarStepNextButton.classList.add("disabled");
        hasarStepNextButton.setAttribute("disabled", "disabled");
      }
    } else {
      console.log("tramercount tramer chekcbox checked degıl");
      tramerCount.setAttribute("disabled", "disabled");
      tramerCount.classList.add("disabled");
      tramerCount.removeAttribute("required");
      tramerCount.value = "";

      // Hata mesajlarını ve validasyon class'larını temizle
      tramerCount.classList.remove("invalid", "valid");
      tramerCount.parentElement.classList.remove("invalid", "valid");

      const oldError =
        tramerCount.parentElement.querySelector(".error-message");
      if (oldError) oldError.remove();

      const currentForm = tramerCount.closest(".form");
      if (currentForm) validateStepForm(currentForm);
    }
  });

  // Tramer inputuna sadece rakam ve binlik format kontrolu
  tramerCount.addEventListener("input", (e) => {
    let value = tramerCount.value.replace(/[^0-9]/g, "");
    if (value === "") {
      console.log("value bos validleri ekle");
      tramerCount.value = "";
      return;
    }
    const numberValue = parseInt(value, 10);
    tramerCount.value = numberValue.toLocaleString("tr-TR");

    // Formu validate et
    const currentForm = tramerCount.closest(".form");
    if (currentForm) {
      validateStepForm(currentForm);
    }
  });

  //kilometre ınputunda rakam kontrolu / validate
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

  // edit butonları click işlemlerı
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("editBtn")) {
      const parent = e.target.closest(".summaryItem");
      const stepIndex = parseInt(parent.getAttribute("data-goto"), 10);
      if (!isNaN(stepIndex)) {
        showStep(stepIndex, true);
        isEditing = true;
        updateNextButtonText();

        // Tüm form adımlarını alır
        const steps = document.querySelectorAll(".formStep");

        // İlgili adımdaki formStep hariç diğerlerine .disabled classını ekler
        steps.forEach((step, index) => {
          if (index !== stepIndex) {
            step.classList.add("disabled");
          } else {
            step.classList.remove("disabled");
          }
        });
      }
    }
  });

  showStep(0);
  updateSummary();

  //plaka input format
  function formatTurkishPlate(value) {
    let v = value.toUpperCase().replace(/[^0-9A-Z]/g, "");
    const cityCode = v.slice(0, 2).replace(/\D/g, "");
    let rest = v.slice(2);

    const lettersMatch = rest.match(/^[A-Z]{1,3}/);
    const letters = lettersMatch ? lettersMatch[0] : "";
    rest = rest.slice(letters.length);

    const numbers = rest.replace(/\D/g, "").slice(0, 4);
    let formatted = cityCode;

    if (cityCode.length === 2) formatted += " ";
    if (letters.length > 0) {
      formatted += letters + " ";
      formatted += numbers;
    } else {
      return cityCode;
    }
    return formatted.trim();
  }

  // Türkiye plakası validasyon fonksiyonu
  function validatePlate(value) {
    const plate = value.trim().toUpperCase();
    // 34 A 1234
    const pattern1 = /^[0-9]{2} [A-Z]{1,3} [0-9]{1,4}$/;
    // 06 AB 123
    const pattern2 = /^[0-9]{2} [A-Z]{1,2} [0-9]{1,3}$/;
    // 01 ABC 12
    const pattern3 = /^[0-9]{2} [A-Z]{1,3} [0-9]{1,2}$/;
    const isValid =
      pattern1.test(plate) || pattern2.test(plate) || pattern3.test(plate);

    return isValid;
  }

  //genel validate fonksıyonu
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
          error.textContent = "0 - 250.000 km";
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
        const tramerCheckbox = document.querySelector("input[name='tramer']");
        const tramerSelected = tramerCheckbox ? tramerCheckbox.checked : false;

        if (tramerSelected) {
          if (value === "" || value === null) {
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
          input.classList.remove("invalid", "valid");
          input.parentElement.classList.remove("invalid", "valid");
          return;
        }
      }

      // Önce boş kontrolü
      if (input.name === "numberPlate") {
        if (!value) {
          input.classList.add("invalid");
          input.classList.remove("valid");
          allValid = false;

          const oldError = parent.querySelector(".error-message");
          if (!oldError) {
            const error = document.createElement("div");
            error.className = "error-message";
            error.textContent = "Plaka alanı boş bırakılamaz.";
            parent.appendChild(error);
          }
          return; // diğer validasyonlara girmesin
        }

        // Boş değilse devam et (format ve validate)
        const formattedValue = formatTurkishPlate(value);
        input.value = formattedValue;
        const isValidPlate = validatePlate(formattedValue);

        console.log("Step validation for plate:", formattedValue, isValidPlate);

        if (!isValidPlate) {
          input.classList.add("invalid");
          input.classList.remove("valid");
          allValid = false;

          const oldError = parent.querySelector(".error-message");
          if (!oldError) {
            const error = document.createElement("div");
            error.className = "error-message";
            error.textContent = "Geçerli bir plaka giriniz.";
            parent.appendChild(error);
          }
        } else {
          input.classList.remove("invalid");
          input.classList.add("valid");
        }

        return; // bu input için diğer validasyonlara geçme
      }

      // Telefon numarası özel kontrol
      if (input.name === "phoneInput") {
        const phoneRegex = /^[1-9][0-9]{2} [0-9]{3} [0-9]{2} [0-9]{2}$/;
        const isValidPhone = phoneRegex.test(value);

        if (!isValidPhone) {
          input.parentElement.classList.add("invalid");
          input.classList.add("invalid");
          input.parentElement.classList.remove("valid");
          input.classList.remove("valid");
          allValid = false;

          const oldError = parent.querySelector(".error-message");
          if (!oldError) {
            const error = document.createElement("div");
            error.className = "error-message";
            error.textContent = "Telefon nuamranızı başında 0 olmadan yazınız.";
            parent.appendChild(error);
          }
        } else {
          input.parentElement.classList.remove("invalid");
          input.parentElement.classList.add("valid");
          input.classList.remove("invalid");
          input.classList.add("valid");
        }
        return; // diğer kontrolleri atla
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

    //valid işlemlerınde devam et butonunu disabled eder veya ekler
    if (allValid) {
      nextButton.classList.add("active");
      nextButton.classList.remove("disabled");
      nextButton.removeAttribute("disabled");
      nextButton.disabled = false;
    } else {
      nextButton.classList.remove("active");
      nextButton.classList.add("disabled");
      nextButton.setAttribute("disabled", "disabled");
      nextButton.disabled = true;
    }
  }

  //plaka numarası input alanı kontrol
  const numberPlateInput = document.querySelector("#numberPlate");
  numberPlateInput.addEventListener("input", () => {
    const rawValue = numberPlateInput.value;
    const formatted = formatTurkishPlate(rawValue);
    numberPlateInput.value = formatted;

    const isValid = validatePlate(formatted);

    if (isValid) {
      numberPlateInput.classList.add("valid");
      numberPlateInput.classList.remove("invalid");
    } else {
      numberPlateInput.classList.add("invalid");
      numberPlateInput.classList.remove("valid");
    }
  });

  // Tüm form adımları için input dinleyicisi
  document.querySelectorAll(".formStep .form").forEach((formStep) => {
    formStep.addEventListener("input", () => {
      validateStepForm(formStep);
    });
  });

  //custom selectler ıcın validate kontrolu
  $(".customSelect").on("change", function () {
    const formStep = this.closest(".formStep .form");
    if (formStep) {
      validateStepForm(formStep);
    }
  });

  //arac gorsellerı ıcın baslangıc
  let selectedCarImages = [];
  const fileNameSpan = document.querySelector(".file-name");
  const thumbnailsDiv = document.querySelector(".thumbnails");

  carImageInput.addEventListener("change", (event) => {
    const files = Array.from(event.target.files);
    const remainingSlots = 10 - selectedCarImages.length;

    if (remainingSlots <= 0) {
      alert("En fazla 10 dosya seçebilirsiniz.");
      carImageInput.value = "";
      return;
    }

    if (files.length === 0) {
      // fileNameSpan.textContent = "Henüz dosya seçilmedi";
      updateSummary();
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots); // sadece kalan kadarını al

    filesToAdd.forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        selectedCarImages.push({ src: base64, name: file.name });

        // Thumbnail
        const wrapperDiv = document.createElement("div");
        wrapperDiv.classList.add("thumbItem");

        const link = document.createElement("a");
        link.href = base64;
        link.setAttribute("data-fancybox", "gallery");
        link.setAttribute("data-caption", file.name);

        const img = document.createElement("img");
        img.src = base64;

        img.alt = file.name;

        link.appendChild(img);
        wrapperDiv.appendChild(link);
        thumbnailsDiv.appendChild(wrapperDiv);

        updateSummary();

        if (fileNameSpan) {
          fileNameSpan.remove();
        }
        // fileNameSpan.textContent = `${selectedCarImages.length} dosya seçildi`;
      };
      reader.readAsDataURL(file);
    });

    if (files.length > remainingSlots) {
      //sweetalert eklenebılır
      alert(
        `En fazla 10 dosya yükleyebilirsiniz. Sadece ilk ${remainingSlots} dosya yüklendi.`
      );
    }
    if (fileNameSpan) {
      fileNameSpan.remove();
    }
    // fileNameSpan.textContent = `${selectedCarImages.length} dosya seçildi`;
    carImageInput.value = ""; // input'u sıfırla
  });
  //arac gorsellerı ıcın bitiş

  const phoneInput = document.getElementById("phoneInput");
  let lastDigits = "";

  phoneInput.addEventListener("input", function (e) {
    const input = e.target;
    const rawValue = input.value;
    let cursorPos = input.selectionStart;

    // Sadece rakamları al
    let digits = rawValue.replace(/\D/g, "");

    // Önceki rakamları tut
    const oldDigits = lastDigits;

    // En fazla 10 rakam al (YXX XXX XX XX toplam 10 rakam)
    digits = digits.substring(0, 10);

    // Parantez ve baştaki 0 yok artık, ama Y ilk rakam 0 olamaz:
    if (digits.length > 0 && digits[0] === "0") {
      // İlk rakam 0 ise onu sil
      digits = digits.slice(1);
      if (cursorPos > 0) cursorPos--;
    }

    // Cursor öncesindeki rakam sayısını say (eski değer üzerinden)
    let digitCountBeforeCursor = 0;
    for (let i = 0; i < cursorPos; i++) {
      if (/\d/.test(rawValue[i])) digitCountBeforeCursor++;
    }

    // Formatlama: YXX XXX XX XX
    let formatted = "";
    if (digits.length > 0) formatted += digits.substring(0, 1); // Y
    if (digits.length > 1)
      formatted += digits.substring(1, Math.min(3, digits.length)); // XX
    if (digits.length > 3)
      formatted += " " + digits.substring(3, Math.min(6, digits.length)); // XXX
    if (digits.length > 6)
      formatted += " " + digits.substring(6, Math.min(8, digits.length)); // XX
    if (digits.length > 8)
      formatted += " " + digits.substring(8, Math.min(10, digits.length)); // XX

    // Yeni cursor pozisyonunu rakam sayısına göre bul
    let newCursorPos = 0;
    let digitsSeen = 0;
    while (
      digitsSeen < digitCountBeforeCursor &&
      newCursorPos < formatted.length
    ) {
      if (/\d/.test(formatted[newCursorPos])) digitsSeen++;
      newCursorPos++;
    }

    input.value = formatted;

    // İmleci doğru pozisyona ayarla
    input.setSelectionRange(newCursorPos, newCursorPos);

    lastDigits = digits;
  });

  // Blur olduğunda doğrulama yapalım
  phoneInput.addEventListener("blur", function () {
    const regex = /^[1-9][0-9]{2} [0-9]{3} [0-9]{2} [0-9]{2}$/;
    if (!regex.test(phoneInput.value)) {
      alert("Geçerli bir telefon numarası giriniz. İlk rakam 0 olamaz.");
      phoneInput.focus();
    }
  });

  //son step form tamamlandgıında
  const finalStep = steps[steps.length - 1];
  const finalNextBtn = finalStep.querySelector(".nextButton");

  if (finalNextBtn) {
    finalNextBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // Son adım formunu validate et
      const currentForm = finalStep.querySelector(".form");
      if (!currentForm) return;

      validateStepForm(currentForm);

      const isValid = currentForm.querySelectorAll(".invalid").length === 0;

      if (isValid) {
        // GÖNDER işlemi
        const wrapper = document.querySelector(".formStepWrapper");
        if (wrapper) {
          wrapper.classList.add("disabled");
        }

        // Teşekkürler mesajı ekle
        const resultDiv = document.createElement("div");
        resultDiv.className = "result";
        resultDiv.innerHTML = `
        <div class="thankYouMessage">
          <h2 class="title">Teşekkürler!</h2>
          <p>Formunuz başarıyla gönderildi.</p>
        </div>
      `;

        wrapper.parentElement.appendChild(resultDiv);

        //sayfayı mesajın üstüne kaydırır:
        window.scrollTo(0, 0);
      }
    });
  }
});
