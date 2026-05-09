document.querySelectorAll(".favorite-button").forEach((button) => {
    button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        button.classList.toggle("is-active");
    });
});

function loadUserPosts() {
    const posts = JSON.parse(localStorage.getItem("runbuddy_posts") || "[]");
    const frame = document.querySelector(".frame");

    posts.forEach((post, index) => {
        const postElement = document.createElement("article");
        postElement.className = "component";
        postElement.onclick = () => {
            location.href = `community-post-detail.html?post=user_${post.id}`;
        };

        const imageHtml = post.image
            ? `<div style="width: 100%; height: 100px; background: url(${post.image}) center/cover no-repeat; border-radius: 8px;"></div>`
            : "";

        postElement.innerHTML = `
            <div class="card-visual" style="background: #e8e8e8;"></div>
            <h2 class="post-title">My Post #${index + 1}</h2>
            <p class="post-body">${post.text || "No text"}</p>
            ${imageHtml}
            <div class="frame-wrapper">
                <div class="div">
                    <div class="ellipse" style="background: linear-gradient(135deg, #ff9a9e, #fecfef);">Y</div>
                    <p class="text-wrapper">You</p>
                </div>
                <div class="action-row">
                    <button type="button" class="favorite-button" aria-label="Add to favorites" onclick="event.preventDefault(); event.stopPropagation(); this.closest('button').classList.toggle('is-active');">
                        <svg class="favorite-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 2.6l2.9 5.88 6.49.94-4.69 4.57 1.11 6.46L12 17.4l-5.81 3.05 1.11-6.46L2.61 9.42l6.49-.94L12 2.6z" fill="none" stroke="#000" stroke-width="1.8" stroke-linejoin="round"/>
                        </svg>
                        <svg class="favorite-icon-filled" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 2.6l2.9 5.88 6.49.94-4.69 4.57 1.11 6.46L12 17.4l-5.81 3.05 1.11-6.46L2.61 9.42l6.49-.94L12 2.6z" fill="#ffd34d" stroke="#000" stroke-width="1.2" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button type="button" class="bubble" aria-label="Open comments" onclick="event.preventDefault(); event.stopPropagation(); location.href='community-post-detail.html?post=user_${post.id}#comments';">
                        <img class="bubble-icon" src="images/bubble.svg" alt="">
                    </button>
                </div>
            </div>
        `;

        frame.insertBefore(postElement, frame.firstChild);
    });
}

document.addEventListener("DOMContentLoaded", loadUserPosts);