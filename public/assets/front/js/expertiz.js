let paths = document.querySelectorAll("#ekspertizSablon path");
const pathToolTip = document.querySelector(".toolTip");

const dialog = document.getElementById("expertizDialog");
const dialogButtons = dialog.querySelectorAll("button[data-val]");

dialog.addEventListener("click", function (e) {
  if (e.target === dialog) {
    dialog.close();
  }
});

let elmId = null;

function setDialogSelectedState() {
  const path = document.getElementById(elmId);
  if (!path) return;

  const partName = path.getAttribute("data-title");
  if (!partName) return;

  const item = document.querySelector(`.carPartItem[data-value="${partName}"]`);
  if (!item) return;

  const selectedCheckbox = item.querySelector('input[type="checkbox"]:checked');
  const selectedVal = selectedCheckbox?.value || "original"; 

  dialogButtons.forEach((btn) => {
    if (btn.getAttribute("data-val") === selectedVal) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}
function handleClickPath() {
  console.log(this.id);
  elmId = this.id;
  setDialogSelectedState(); 
  // expertizDialog.showModal();
  dialog.showModal();
}

dialog.addEventListener("click", function (e) {
  const button = e.target.closest("button[data-val]");
  if (!button) return;
  e.preventDefault();

  const selectedVal = button.getAttribute("data-val");
  const path = document.getElementById(elmId);
  if (!path) return;

  const partName = path.getAttribute("data-title");
  const item = document.querySelector(`.carPartItem[data-value="${partName}"]`);
  if (!item) return;

  const statusColors = {
    original: "path-original",
    cizik: "path-cizik",
    boyali: "path-boyali",
    degismis: "path-degismis",
  };

  const checkboxes = item.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((cb) => {
    cb.checked = cb.value === selectedVal;
  });

  Object.values(statusColors).forEach((cls) => path.classList.remove(cls));
  const classKey = selectedVal === "degisen" ? "degismis" : selectedVal;
  path.classList.add(statusColors[classKey]);

  dialogButtons.forEach((btn) => {
    if (btn === button) btn.classList.add("active");
    else btn.classList.remove("active");
  });

  dialog.close(); 
});

document.addEventListener("DOMContentLoaded", function () {
  const allDialogCloseButtons = document.querySelectorAll(".dialogHead button");

  allDialogCloseButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const parentDialog = this.closest("dialog");
      if (parentDialog) parentDialog.close();
    });
  });
});
function handleHoverPath() {}

paths.forEach((element) => {
  element.addEventListener("click", handleClickPath);

  element.addEventListener("mouseenter", (e) => {
    const title = element.getAttribute("data-title");
    if(title){
        pathToolTip.textContent = title;
        pathToolTip.style.display = "block";
    }
  });

  element.addEventListener("mousemove", (e) => {
    pathToolTip.style.left = `${e.clientX + 10}px`;
    pathToolTip.style.top = `${e.clientY + 10}px`;
  });

  element.addEventListener("mouseleave", (e) => {
    pathToolTip.style.display = "none";
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const carParts = document.querySelectorAll(".carPartItem");

  const statusColors = {
    original: "path-original",
    cizik: "path-cizik",
    boyali: "path-boyali",
    degismis: "path-degismis"
  };

  carParts.forEach((item) => {
    const checkboxes = item.querySelectorAll('input[type="checkbox"]');
    const originalCheckbox = item.querySelector('input[value="original"]');
    const partName = item.getAttribute("data-value");
    const path = document.querySelector(
      `#ekspertizSablon path[data-title="${partName}"]`
    );

    if (originalCheckbox) {
      originalCheckbox.checked = true;
      if (path) {
        path.classList.add(statusColors.original);
      }
    }

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        if (!checkbox.checked) return;

        checkboxes.forEach((cb) => {
          if (cb !== checkbox) cb.checked = false;
        });

        const selectedVal = checkbox.value;

        if (path) {
          Object.values(statusColors).forEach((cls) => path.classList.remove(cls));
          path.classList.add(statusColors[selectedVal]);
        }

        if (partName === "Tavan" && (selectedVal === "boyali" || selectedVal === "degismis")) {
          const uyariDialog = document.getElementById("uyariDialog");
          if (uyariDialog && typeof uyariDialog.showModal === "function") {
            uyariDialog.showModal();
          }
        }
      });
    });

    item.addEventListener("mouseenter", () => {
      const path = document.querySelector(
        `#ekspertizSablon path[data-title="${partName}"]`
      );
      if (path) path.classList.add("path-hover");
    });

    item.addEventListener("mouseleave", () => {
      const path = document.querySelector(
        `#ekspertizSablon path[data-title="${partName}"]`
      );
      if (path) path.classList.remove("path-hover");
    });
  });
});


// document.addEventListener("DOMContentLoaded", function () {
//   const tramerRadios = document.querySelectorAll('input[name="tramer"]');
// //   const tramerTutarAlani = document.getElementById("tramerTutarAlani");

//   function toggleTramerInput() {
//     const selectedText = this.parentElement.querySelector(".checkText").textContent.trim().toLowerCase();
//     if (selectedText === "var") {
//       tramerTutarAlani.style.display = "block";
//     } else {
//       tramerTutarAlani.style.display = "none";
//     }
//   }

//   tramerRadios.forEach((radio) => {
//     radio.addEventListener("change", toggleTramerInput);
//   });

//   // Sayfa yüklendiğinde ilk durumu kontrol et
//   const checkedRadio = document.querySelector('input[name="tramer"]:checked');
//   if (checkedRadio) {
//     const selectedText = checkedRadio.parentElement.querySelector(".checkText").textContent.trim().toLowerCase();
//     tramerTutarAlani.style.display = selectedText === "var" ? "block" : "none";
//   } else {
//     tramerTutarAlani.style.display = "none"; // varsayılan kapalı
//   }
// });

// if (this.value === "var") {
//   tramerTutarAlani.style.display = "block";
// } else {
//   tramerTutarAlani.style.display = "none";
// }
