const slides = ["slide13", "slide15", "slide16"];
let currentSlide = 0;

function showSlide(index) {
    slides.forEach((slide, i) => {
        document.getElementById(slide).classList.toggle("active", i === index);
    });
}

function goToHome() {
    window.location.href = "frontend/home.html";
}

const goToHomeArea = document.getElementById("goToHomeArea");
if (goToHomeArea) {
    goToHomeArea.addEventListener("click", goToHome);
}

// Auto-advance to slide 15 then slide 16.
setTimeout(() => {
    currentSlide = 1;
    showSlide(currentSlide);
}, 500);

setTimeout(() => {
    currentSlide = 2;
    showSlide(currentSlide);
}, 1000);
