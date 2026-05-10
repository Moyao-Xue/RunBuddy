function formatDate(timestamp) {
    const date = new Date(timestamp);
    const options = { month: "short", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
}

function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatDistance(meters) {
    return (meters / 1000).toFixed(2);
}

function formatSpeedKmh(speedKmh) {
    if (!speedKmh || speedKmh <= 0) return "--";

    return `${speedKmh.toFixed(1)} km/h`;
}

function renderEmptyState(container) {
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">RUN</div>
            <div class="empty-title">No Runs Yet</div>
            <div class="empty-text">Start your first run to see your history here!</div>
        </div>
    `;
}

function renderRecordCard(record) {
    const speedKmh = record.speedKmh ?? record.pace ?? 0;

    return `
        <div class="record-card">
            <div class="record-header">
                <span class="record-date">${formatDate(record.timestamp)}</span>
                <span class="record-coins">+${record.coinsEarned} Coins</span>
            </div>
            <div class="record-stats">
                <div class="record-stat">
                    <div class="record-icon">KM</div>
                    <div class="record-stat-info">
                        <span class="record-stat-value">${formatDistance(record.distance)} km</span>
                        <span class="record-stat-label">Distance</span>
                    </div>
                </div>
                <div class="record-stat">
                    <div class="record-icon">T</div>
                    <div class="record-stat-info">
                        <span class="record-stat-value">${formatDuration(record.time)}</span>
                        <span class="record-stat-label">Duration</span>
                    </div>
                </div>
                <div class="record-stat">
                    <div class="record-icon">SPD</div>
                    <div class="record-stat-info">
                        <span class="record-stat-value">${formatSpeedKmh(speedKmh)}</span>
                        <span class="record-stat-label">Speed</span>
                    </div>
                </div>
                <div class="record-stat">
                    <div class="record-icon">CAL</div>
                    <div class="record-stat-info">
                        <span class="record-stat-value">${record.calories || 0}</span>
                        <span class="record-stat-label">Calories</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function groupRecordsByDate(records) {
    const groups = {};

    records.forEach((record) => {
        const dateKey = formatDate(record.timestamp);
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(record);
    });

    return groups;
}

function renderHistoryList() {
    const container = document.getElementById("historyList");
    const history = Storage.getRunHistory();
    const stats = Storage.getStats();

    document.getElementById("totalRuns").textContent = stats.totalRuns || 0;
    document.getElementById("totalDistance").textContent = ((stats.totalDistance || 0) / 1000).toFixed(1);
    document.getElementById("totalCoins").textContent = stats.totalCoins || 0;
    document.getElementById("totalCalories").textContent = stats.totalCalories || 0;

    if (history.length === 0) {
        renderEmptyState(container);
        return;
    }

    const grouped = groupRecordsByDate(history);
    let html = '<div class="section-title">Recent Activities</div>';

    Object.entries(grouped).forEach(([date, records]) => {
        html += `
            <div class="date-divider">
                <div class="date-divider-line"></div>
                <span class="date-divider-text">${date}</span>
                <div class="date-divider-line"></div>
            </div>
        `;

        records.forEach((record) => {
            html += renderRecordCard(record);
        });
    });

    container.innerHTML = html;
}

function bindRunHistoryActions() {
    const backButton = document.querySelector(".btn-back");
    if (backButton && backButton.dataset.bound !== "true") {
        backButton.dataset.bound = "true";
        backButton.addEventListener("click", () => {
            location.href = "home.html";
        });
    }

    const checkInButton = document.querySelector(".bottom-button");
    if (checkInButton && checkInButton.dataset.bound !== "true") {
        checkInButton.dataset.bound = "true";
        checkInButton.addEventListener("click", () => {
            location.href = "monthly-checkin.html";
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderHistoryList();
    bindRunHistoryActions();
});
