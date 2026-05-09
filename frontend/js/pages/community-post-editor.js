let selectedImage = null;

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
            <button class="remove-btn" onclick="removeImage()">&times;</button>
        </div>
    `;
}

function removeImage() {
    selectedImage = null;
    document.getElementById("fileInput").value = "";
    document.getElementById("mediaContainer").innerHTML = `
        <button class="add-tile" type="button" aria-label="Add media" onclick="document.getElementById('fileInput').click()">
            <img src="images/tile-0122-2@2x.png" alt="" id="addIcon">
        </button>
    `;
}

function submitPost() {
    const text = document.getElementById("postText").value.trim();

    if (!text && !selectedImage) {
        alert("Please add some text or an image!");
        return;
    }

    document.getElementById("loadingOverlay").style.display = "flex";

    const post = {
        id: Date.now(),
        text,
        image: selectedImage,
        timestamp: new Date().toISOString()
    };

    const posts = JSON.parse(localStorage.getItem("runbuddy_posts") || "[]");
    posts.unshift(post);
    localStorage.setItem("runbuddy_posts", JSON.stringify(posts));

    setTimeout(() => {
        document.getElementById("loadingOverlay").style.display = "none";
        document.getElementById("successOverlay").style.display = "flex";
    }, 1500);
}