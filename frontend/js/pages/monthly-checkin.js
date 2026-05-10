function bindMonthlyCheckinActions() {
    const backButton = document.querySelector(".back-button");
    if (backButton && backButton.dataset.bound !== "true") {
        backButton.dataset.bound = "true";
        backButton.addEventListener("click", () => {
            location.href = "run-history.html";
        });
    }
}

document.addEventListener("DOMContentLoaded", bindMonthlyCheckinActions);
