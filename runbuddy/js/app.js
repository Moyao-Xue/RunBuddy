/**
 * RunBuddy - Main Application
 * 主应用逻辑模块，协调所有功能模块
 */

const app = (function() {
    let isRunning = false;
    let runningInterval = null;
    let currentDistance = 0;
    let startTime = null;

    const COINS_PER_KM = 10;
    const UPDATE_INTERVAL = 100;

    /**
     * 初始化应用
     */
    function init() {
        User.init();
        Pet.init();
        Map.init();

        bindEvents();
        updateAllUI();

        console.log('RunBuddy 已初始化');
    }

    /**
     * 绑定事件监听
     */
    function bindEvents() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                switchPage(page);
            });
        });

        const startBtn = document.getElementById('btn-start');
        const endBtn = document.getElementById('btn-end');

        if (startBtn) {
            startBtn.addEventListener('click', startRunning);
        }
        if (endBtn) {
            endBtn.addEventListener('click', endRunning);
        }
    }

    /**
     * 切换页面
     * @param {string} pageName - 页面名称
     */
    function switchPage(pageName) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const targetPage = document.getElementById('page-' + pageName);
        const targetNav = document.querySelector(`.nav-item[data-page="${pageName}"]`);

        if (targetPage) {
            targetPage.classList.add('active');
        }
        if (targetNav) {
            targetNav.classList.add('active');
        }

        if (pageName === 'dress') {
            updateShopUI();
        } else if (pageName === 'profile') {
            updateProfileUI();
        }
    }

    /**
     * 开始跑步
     */
    function startRunning() {
        if (isRunning) return;

        isRunning = true;
        currentDistance = 0;
        startTime = Date.now();

        Pet.startRunning();

        const startBtn = document.getElementById('btn-start');
        const endBtn = document.getElementById('btn-end');
        const runningStatus = document.getElementById('running-status');

        if (startBtn) startBtn.classList.add('hidden');
        if (endBtn) endBtn.classList.remove('hidden');
        if (runningStatus) runningStatus.classList.remove('hidden');

        runningInterval = setInterval(() => {
            updateRunningDistance();
        }, UPDATE_INTERVAL);

        showToast('跑步开始！加油！', 'success');
    }

    /**
     * 更新跑步距离
     */
    function updateRunningDistance() {
        if (!isRunning) return;

        const elapsed = (Date.now() - startTime) / 1000;
        
        const speedKmH = 6 + Math.random() * 4;
        currentDistance = (elapsed / 3600) * speedKmH;

        const distanceEl = document.getElementById('current-distance-value');
        const earnedCoinsEl = document.getElementById('earned-coins');

        if (distanceEl) {
            distanceEl.textContent = currentDistance.toFixed(2);
        }
        if (earnedCoinsEl) {
            earnedCoinsEl.textContent = Math.floor(currentDistance * COINS_PER_KM);
        }

        Pet.updateRunningDistance(currentDistance);
    }

    /**
     * 结束跑步
     */
    function endRunning() {
        if (!isRunning) return;

        isRunning = false;

        if (runningInterval) {
            clearInterval(runningInterval);
            runningInterval = null;
        }

        Pet.stopRunning();

        const startBtn = document.getElementById('btn-start');
        const endBtn = document.getElementById('btn-end');
        const runningStatus = document.getElementById('running-status');

        if (startBtn) startBtn.classList.remove('hidden');
        if (endBtn) endBtn.classList.add('hidden');
        if (runningStatus) runningStatus.classList.add('hidden');

        if (currentDistance > 0.01) {
            const result = User.finishRun(currentDistance);
            const newRoutes = Map.checkAndUnlockRoutes();

            Pet.celebrate();

            showToast(`太棒了！获得 ${result.coins} 金币！`, 'success');

            if (newRoutes.length > 0) {
                setTimeout(() => {
                    newRoutes.forEach(route => {
                        showToast(`🎉 新路线解锁：${route.name}！`, 'success');
                    });
                }, 1000);
            }

            updateAllUI();
            Pet.updateAccessories();
        } else {
            showToast('跑步距离太短，没有获得金币', 'error');
        }

        currentDistance = 0;
        Pet.resetDistance();
    }

    /**
     * 购买装扮
     * @param {string} itemId - 装扮ID
     * @param {number} price - 价格
     * @param {string} emoji - 表情图标
     */
    function purchaseItem(itemId, price, emoji) {
        if (User.hasItem(itemId)) {
            showToast('你已经拥有这个装扮了！', 'error');
            return;
        }

        if (!User.spendCoins(price)) {
            showToast('金币不足，无法购买！', 'error');
            shakeShopItem(itemId);
            return;
        }

        User.addItem(itemId);
        Pet.updateAccessories();
        updateShopUI();
        updateAllUI();

        showToast(`购买成功！获得 ${emoji}！`, 'success');
    }

    /**
     * 让商店物品晃动（金币不足提示）
     * @param {string} itemId - 物品ID
     */
    function shakeShopItem(itemId) {
        const item = document.querySelector(`[data-item-id="${itemId}"]`);
        if (item) {
            item.classList.add('shake');
            setTimeout(() => {
                item.classList.remove('shake');
            }, 500);
        }
    }

    /**
     * 更新所有UI
     */
    function updateAllUI() {
        updateHomeUI();
        updateShopUI();
        updateProfileUI();
    }

    /**
     * 更新首页UI
     */
    function updateHomeUI() {
        const todayDistanceEl = document.getElementById('today-distance');
        const coinsEl = document.getElementById('user-coins');
        const totalDistanceEl = document.getElementById('total-distance');

        if (todayDistanceEl) {
            todayDistanceEl.innerHTML = `${User.getTodayDistance().toFixed(2)} <span class="unit">公里</span>`;
        }
        if (coinsEl) {
            coinsEl.innerHTML = `${User.getCoins()} <span class="unit">枚</span>`;
        }
        if (totalDistanceEl) {
            totalDistanceEl.innerHTML = `${User.getTotalDistance().toFixed(2)} <span class="unit">公里</span>`;
        }
    }

    /**
     * 更新商店UI
     */
    function updateShopUI() {
        const shopCoinsEl = document.getElementById('shop-coins');
        const equippedItemsEl = document.getElementById('equipped-items');

        if (shopCoinsEl) {
            shopCoinsEl.textContent = User.getCoins();
        }

        document.querySelectorAll('.shop-item').forEach(item => {
            const itemId = item.dataset.itemId;
            const price = parseInt(item.dataset.price);
            const btn = item.querySelector('.btn-shop');
            const owned = item.querySelector('.item-owned');

            if (User.hasItem(itemId)) {
                if (btn) btn.classList.add('hidden');
                if (owned) owned.classList.remove('hidden');
            } else {
                if (btn) {
                    btn.classList.remove('hidden');
                    btn.disabled = User.getCoins() < price;
                }
                if (owned) owned.classList.add('hidden');
            }
        });

        if (equippedItemsEl) {
            const ownedItems = User.getOwnedItems();
            const itemEmojis = {
                hat: '🧢',
                sunglasses: '🕶️',
                tshirt: '👕',
                shoes: '👟'
            };
            const itemNames = {
                hat: '帽子',
                sunglasses: '墨镜',
                tshirt: 'T恤',
                shoes: '跑鞋'
            };

            if (ownedItems.length === 0) {
                equippedItemsEl.innerHTML = '<div class="no-equipment">暂无装备</div>';
            } else {
                equippedItemsEl.innerHTML = ownedItems.map(itemId => `
                    <div class="equipped-item">
                        <span>${itemEmojis[itemId] || ''}</span>
                        <span>${itemNames[itemId] || itemId}</span>
                    </div>
                `).join('');
            }
        }
    }

    /**
     * 更新个人资料UI
     */
    function updateProfileUI() {
        const profileTotalDistanceEl = document.getElementById('profile-total-distance');
        const profileTotalCoinsEl = document.getElementById('profile-total-coins');
        const profileUnlockedItemsEl = document.getElementById('profile-unlocked-items');
        const profileUnlockedRoutesEl = document.getElementById('profile-unlocked-routes');

        if (profileTotalDistanceEl) {
            profileTotalDistanceEl.textContent = User.getTotalDistance().toFixed(2);
        }
        if (profileTotalCoinsEl) {
            profileTotalCoinsEl.textContent = User.getCoins();
        }
        if (profileUnlockedItemsEl) {
            profileUnlockedItemsEl.textContent = User.getOwnedItems().length;
        }
        if (profileUnlockedRoutesEl) {
            profileUnlockedRoutesEl.textContent = User.getUnlockedRoutes().length;
        }

        updateAchievements();
    }

    /**
     * 更新成就显示
     */
    function updateAchievements() {
        const achievements = User.getAchievements();

        const achievementMap = {
            firstRun: 'ach-first-run',
            fiveKm: 'ach-5km',
            coinRich: 'ach-rich'
        };

        Object.entries(achievements).forEach(([key, unlocked]) => {
            const elementId = achievementMap[key];
            const element = document.getElementById(elementId);
            if (element) {
                if (unlocked) {
                    element.classList.add('unlocked');
                    element.querySelector('.achievement-status').textContent = '🏆';
                } else {
                    element.classList.remove('unlocked');
                    element.querySelector('.achievement-status').textContent = '🔒';
                }
            }
        });
    }

    /**
     * 显示Toast通知
     * @param {string} message - 消息内容
     * @param {string} type - 类型 (success/error)
     */
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = 'toast ' + type;

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        init,
        switchPage,
        startRunning,
        endRunning,
        purchaseItem,
        updateAllUI,
        updateHomeUI,
        updateShopUI,
        updateProfileUI,
        showToast
    };
})();
