//Window Load
window.onload = () => {
  document.querySelector(".preloader").remove();
};

//windowScroll

function handleScroll() {
  let lastScrollY = window.scrollY;
  const carWrapper = document.querySelector(".carValueWrapper");

  if (carWrapper) {
    lastScrollY > 0
      ? carWrapper.classList.add("fixed")
      : carWrapper.classList.remove("fixed");
  }

  const header = document.querySelector("header");
  const headerH = header.offsetHeight;
  console.log(headerH);
  lastScrollY > headerH ? header.classList.add("fixed") : header.classList.remove("fixed");
}
window.addEventListener("scroll", handleScroll);

const authMenuButtonDd = document.querySelector(".menuDropdownWrapper.auth");
if (authMenuButtonDd) {
  const authMenuButton = authMenuButtonDd.querySelector(
    ".menuDropdownWrapper.auth .dropdownButton"
  );
  function handleClickAuth() {
    this.classList.toggle("active");
    this.parentElement.classList.toggle("show");
  }

  authMenuButton.addEventListener("click", handleClickAuth);
}

if (typeof Fancybox !== "undefined") {
  Fancybox.bind("[data-fancybox]", {
    compact: !1,
    Carousel: {},
    Thumbs: !1,
    Toolbar: {
      display: {
        left: [],
        middle: [],
        right: ["close"],
      },
    },
  });
  Fancybox.bind(".galleryItem", {
    compact: !1,
    Carousel: {},
    Toolbar: {
      display: {
        left: [],
        middle: [],
        right: ["close"],
      },
    },
  });
}
