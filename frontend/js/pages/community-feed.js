function attachFavoriteHandlers(root = document) {
    root.querySelectorAll(".favorite-button").forEach((button) => {
        if (button.dataset.favoriteBound === "true") {
            return;
        }

        button.dataset.favoriteBound = "true";
        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            button.classList.toggle("is-active");
        });
    });
}

function getStoredUserPosts() {
    return Storage.getUserPosts();
}

function saveStoredUserPosts(posts) {
    Storage.saveUserPosts(posts);
}

function attachDeleteHandlers(root = document) {
    root.querySelectorAll(".delete-button").forEach((button) => {
        if (button.dataset.deleteBound === "true") {
            return;
        }

        button.dataset.deleteBound = "true";
        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            const postElement = button.closest(".component");
            const postId = postElement ? postElement.dataset.userPostId : "";
            if (!postId) {
                return;
            }

            if (!window.confirm("Delete this post?")) {
                return;
            }

            const posts = getStoredUserPosts();
            const updatedPosts = posts.filter((item) => String(item.id) !== String(postId));
            saveStoredUserPosts(updatedPosts);

            if (postElement) {
                postElement.remove();
            }

            const searchInput = document.getElementById("site-search") || document.querySelector(".search-input");
            filterPosts(searchInput ? searchInput.value : "");
        });
    });
}

function getPostSearchText(postElement) {
    const titleElement = postElement.querySelector(".post-title");
    const bodyElement = postElement.querySelector(".post-body");
    const authorElement = postElement.querySelector(".text-wrapper");

    const title = titleElement ? titleElement.textContent : "";
    const body = bodyElement ? bodyElement.textContent : "";
    const author = authorElement ? authorElement.textContent : "";
    return `${title} ${body} ${author}`.toLowerCase();
}

function filterPosts(keyword) {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const posts = document.querySelectorAll(".frame .component");
    let visibleCount = 0;

    posts.forEach((postElement) => {
        const matches = !normalizedKeyword || getPostSearchText(postElement).includes(normalizedKeyword);
        postElement.style.display = matches ? "" : "none";

        if (matches) {
            visibleCount += 1;
        }
    });

    const emptyState = document.getElementById("search-empty-state");
    if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? "block" : "none";
    }
}

function setupPostSearch() {
    const searchInput = document.getElementById("site-search") || document.querySelector(".search-input");
    const searchForm = document.getElementById("post-search-form") || document.querySelector(".frame-4");
    const frame = document.querySelector(".frame");

    if (!searchInput || !frame) {
        return;
    }

    if (!document.getElementById("search-empty-state")) {
        const emptyState = document.createElement("p");
        emptyState.id = "search-empty-state";
        emptyState.textContent = "No posts found.";
        emptyState.style.margin = "20px 0";
        emptyState.style.textAlign = "center";
        emptyState.style.fontSize = "14px";
        emptyState.style.display = "none";
        frame.appendChild(emptyState);
    }

    const applyFilter = () => filterPosts(searchInput.value);

    searchInput.addEventListener("input", applyFilter);
    searchInput.addEventListener("keyup", applyFilter);
    searchInput.addEventListener("change", applyFilter);
    if (searchForm) {
        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            applyFilter();
        });
    }

    applyFilter();
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function bindCommunityFeedStaticHandlers() {
    const backButton = document.querySelector(".pointer-left-button");
    if (backButton && backButton.dataset.bound !== "true") {
        backButton.dataset.bound = "true";
        backButton.addEventListener("click", () => {
            location.href = "home.html";
        });
    }

    const startButton = document.querySelector(".button-start-up");
    if (startButton && startButton.dataset.bound !== "true") {
        startButton.dataset.bound = "true";
        startButton.addEventListener("click", () => {
            location.href = "community-post-editor.html";
        });
    }
}

function bindStaticCardHandlers() {
    document.querySelectorAll(".frame .component").forEach((postElement) => {
        if (postElement.dataset.staticBound === "true") {
            return;
        }

        postElement.dataset.staticBound = "true";

        const favoriteButton = postElement.querySelector(".favorite-button");
        if (favoriteButton && favoriteButton.dataset.favoriteBound !== "true") {
            favoriteButton.dataset.favoriteBound = "true";
            favoriteButton.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                favoriteButton.classList.toggle("is-active");
            });
        }

        const bubbleButton = postElement.querySelector(".bubble");
        if (bubbleButton && bubbleButton.dataset.bubbleBound !== "true") {
            bubbleButton.dataset.bubbleBound = "true";
            bubbleButton.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                const postKey = postElement.dataset.postKey;
                if (postKey) {
                    location.href = `community-post-detail.html?post=${postKey}#comments`;
                }
            });
        }

        postElement.addEventListener("click", () => {
            const postKey = postElement.dataset.postKey;
            if (postKey) {
                location.href = `community-post-detail.html?post=${postKey}`;
            }
        });
    });
}

function loadUserPosts() {
    const posts = getStoredUserPosts();

    const frame = document.querySelector(".frame");
    if (!frame) {
        return;
    }

    posts.forEach((post, index) => {
        const postElement = document.createElement("article");
        postElement.className = "component";
        postElement.dataset.userPostId = String(post.id);
        postElement.dataset.postKey = `user_${post.id}`;

        const title = (post.title || `My Post #${index + 1}`).trim();
        const content = (post.content || post.text || "No content").trim();

        postElement.innerHTML = `
            <div class="card-visual"></div>
            <h2 class="post-title">${escapeHtml(title)}</h2>
            <p class="post-body">${escapeHtml(content)}</p>
            <div class="frame-wrapper">
                <div class="div">
                    <div class="ellipse" style="background: linear-gradient(135deg, #ff9a9e, #fecfef);">Y</div>
                    <p class="text-wrapper">You</p>
                </div>
                <div class="action-row">
                    <button type="button" class="favorite-button" aria-label="Add to favorites">
                        <svg class="favorite-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 2.6l2.9 5.88 6.49.94-4.69 4.57 1.11 6.46L12 17.4l-5.81 3.05 1.11-6.46L2.61 9.42l6.49-.94L12 2.6z" fill="none" stroke="#000" stroke-width="1.8" stroke-linejoin="round"/>
                        </svg>
                        <svg class="favorite-icon-filled" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 2.6l2.9 5.88 6.49.94-4.69 4.57 1.11 6.46L12 17.4l-5.81 3.05 1.11-6.46L2.61 9.42l6.49-.94L12 2.6z" fill="#ffd34d" stroke="#000" stroke-width="1.2" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button type="button" class="delete-button" aria-label="Delete this post">
                        <svg class="delete-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M4 7h16M9 7V5h6v2m-7 0l1 12h6l1-12" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button type="button" class="bubble" aria-label="Open comments">
                        <img class="bubble-icon" src="images/bubble.svg" alt="">
                    </button>
                </div>
            </div>
        `;

        frame.insertBefore(postElement, frame.firstChild);
    });

    attachFavoriteHandlers(frame);
    attachDeleteHandlers(frame);
    bindStaticCardHandlers();
}

document.addEventListener("DOMContentLoaded", () => {
    setupPostSearch();
    attachFavoriteHandlers();
    attachDeleteHandlers();
    loadUserPosts();
    bindCommunityFeedStaticHandlers();
    bindStaticCardHandlers();

    const searchInput = document.getElementById("site-search") || document.querySelector(".search-input");
    filterPosts(searchInput ? searchInput.value : "");
});
