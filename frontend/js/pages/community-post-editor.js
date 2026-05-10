let selectedImage = null;

function focusFileInput() {
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
        fileInput.click();
    }
}

function closeEditorAndReturn() {
    location.href = "community-feed.html";
}

document.getElementById("fileInput").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
        selectedImage = loadEvent.target.result;
        updateMediaPreview();
    };
    reader.readAsDataURL(file);
});

function updateMediaPreview() {
    const container = document.getElementById("mediaContainer");
    container.innerHTML = `
        <div class="preview-container">
            <img src="${selectedImage}" class="preview-image" alt="Preview">
            <button class="remove-btn" type="button" data-action="remove-image">&times;</button>
        </div>
    `;

    const removeBtn = container.querySelector('[data-action="remove-image"]');
    if (removeBtn) {
        removeBtn.addEventListener("click", removeImage);
    }
}

function removeImage() {
    selectedImage = null;
    document.getElementById("fileInput").value = "";
    document.getElementById("mediaContainer").innerHTML = `
        <button class="add-tile" type="button" aria-label="Add media" data-action="add-media">
            <img src="images/tile-0122-2@2x.png" alt="" id="addIcon">
        </button>
    `;

    const addTile = document.querySelector('[data-action="add-media"]');
    if (addTile) {
        addTile.addEventListener("click", focusFileInput);
    }
}

function submitPost() {
    const title = document.getElementById("postTitle").value.trim();
    const content = document.getElementById("postContent").value.trim();

    if (!title || !content) {
        alert("Please add both title and content!");
        return;
    }

    document.getElementById("loadingOverlay").style.display = "flex";

    const post = {
        id: Date.now(),
        title,
        content,
        text: content,
        image: selectedImage,
        timestamp: new Date().toISOString()
    };

    Storage.addUserPost(post);

    setTimeout(() => {
        document.getElementById("loadingOverlay").style.display = "none";
        document.getElementById("successOverlay").style.display = "flex";
    }, 1500);
}

function bindEditorActions() {
    const backButton = document.querySelector(".back-button");
    if (backButton && backButton.dataset.bound !== "true") {
        backButton.dataset.bound = "true";
        backButton.addEventListener("click", closeEditorAndReturn);
    }

    const addTile = document.querySelector('[data-action="add-media"]');
    if (addTile && addTile.dataset.bound !== "true") {
        addTile.dataset.bound = "true";
        addTile.addEventListener("click", focusFileInput);
    }

    const backButtonOverlay = document.querySelector(".success-overlay .post-button");
    if (backButtonOverlay && backButtonOverlay.dataset.bound !== "true") {
        backButtonOverlay.dataset.bound = "true";
        backButtonOverlay.addEventListener("click", closeEditorAndReturn);
    }

    const postButton = document.querySelector(".post-wrap .post-button");
    if (postButton && postButton.dataset.bound !== "true") {
        postButton.dataset.bound = "true";
        postButton.addEventListener("click", submitPost);
    }
}

document.addEventListener("DOMContentLoaded", bindEditorActions);
