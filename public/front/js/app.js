//Window Load
window.onload = () => {
    document.querySelector(".preloader").remove();
}

//windowScroll


function handleScroll(){
    let lastScrollY = window.scrollY;
    const carWrapper = document.querySelector(".carValueWrapper");

    if (carWrapper){
        lastScrollY > 0 ? carWrapper.classList.add("fixed") : carWrapper.classList.remove("fixed");
    }

}
window.addEventListener("scroll", handleScroll);

const authMenuButtonDd = document.querySelector(".menuDropdownWrapper.auth");
const authMenuButton = authMenuButtonDd.querySelector(".menuDropdownWrapper.auth .dropdownButton");
function handleClickAuth(){
    this.classList.toggle("active");
    this.parentElement.classList.toggle("show");
}
authMenuButton.addEventListener("click", handleClickAuth);