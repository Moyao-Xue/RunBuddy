/**
 * RunBuddy - User Module
 * 用户数据管理模块
 */

const User = (function() {
    const STORAGE_KEY = 'userData';

    const DEFAULT_DATA = {
        coins: 500,
        todayDistance: 0,
        totalDistance: 0,
        totalCoinsEarned: 500,
        ownedItems: [],
        unlockedRoutes: [],
        lastRunDate: null,
        achievements: {
            firstRun: false,
            fiveKm: false,
            coinRich: false
        }
    };

    /**
     * 初始化用户数据
     * 如果不存在则创建默认数据
     */
    function init() {
        let userData = Store.get(STORAGE_KEY);
        
        if (!userData) {
            userData = { ...DEFAULT_DATA };
            save(userData);
        }
        
        checkAndResetDaily();
        return userData;
    }

    /**
     * 检查并重置每日数据
     */
    function checkAndResetDaily() {
        const userData = Store.get(STORAGE_KEY);
        if (!userData) return;

        const today = new Date().toDateString();
        
        if (userData.lastRunDate !== today) {
            userData.todayDistance = 0;
            userData.lastRunDate = today;
            save(userData);
        }
    }

    /**
     * 保存用户数据
     * @param {Object} data - 用户数据对象
     */
    function save(data) {
        Store.set(STORAGE_KEY, data);
    }

    /**
     * 获取当前用户数据
     * @returns {Object} 用户数据
     */
    function getData() {
        return Store.get(STORAGE_KEY, DEFAULT_DATA);
    }

    /**
     * 获取金币数量
     * @returns {number}
     */
    function getCoins() {
        return getData().coins;
    }

    /**
     * 添加金币
     * @param {number} amount - 要添加的金币数量
     */
    function addCoins(amount) {
        const data = getData();
        data.coins += amount;
        data.totalCoinsEarned += amount;
        
        if (data.coins >= 1000 && !data.achievements.coinRich) {
            data.achievements.coinRich = true;
        }
        
        save(data);
        return data.coins;
    }

    /**
     * 消费金币
     * @param {number} amount - 要消费的金币数量
     * @returns {boolean} 是否成功
     */
    function spendCoins(amount) {
        const data = getData();
        if (data.coins < amount) {
            return false;
        }
        data.coins -= amount;
        save(data);
        return true;
    }

    /**
     * 获取今日跑步距离
     * @returns {number}
     */
    function getTodayDistance() {
        return getData().todayDistance;
    }

    /**
     * 更新今日跑步距离
     * @param {number} distance - 新增的距离
     */
    function addTodayDistance(distance) {
        const data = getData();
        data.todayDistance += distance;
        
        if (data.todayDistance >= 1 && !data.achievements.firstRun) {
            data.achievements.firstRun = true;
        }
        if (data.todayDistance >= 5 && !data.achievements.fiveKm) {
            data.achievements.fiveKm = true;
        }
        
        save(data);
        return data.todayDistance;
    }

    /**
     * 获取累计总里程
     * @returns {number}
     */
    function getTotalDistance() {
        return getData().totalDistance;
    }

    /**
     * 添加总里程
     * @param {number} distance - 新增的距离
     */
    function addTotalDistance(distance) {
        const data = getData();
        data.totalDistance += distance;
        save(data);
        return data.totalDistance;
    }

    /**
     * 获取已拥有的装扮
     * @returns {Array}
     */
    function getOwnedItems() {
        return getData().ownedItems;
    }

    /**
     * 检查是否拥有某个装扮
     * @param {string} itemId - 装扮ID
     * @returns {boolean}
     */
    function hasItem(itemId) {
        return getOwnedItems().includes(itemId);
    }

    /**
     * 添加装扮
     * @param {string} itemId - 装扮ID
     */
    function addItem(itemId) {
        const data = getData();
        if (!data.ownedItems.includes(itemId)) {
            data.ownedItems.push(itemId);
            save(data);
        }
    }

    /**
     * 获取已解锁的路线
     * @returns {Array}
     */
    function getUnlockedRoutes() {
        return getData().unlockedRoutes;
    }

    /**
     * 解锁路线
     * @param {string} routeId - 路线ID
     */
    function unlockRoute(routeId) {
        const data = getData();
        if (!data.unlockedRoutes.includes(routeId)) {
            data.unlockedRoutes.push(routeId);
            save(data);
        }
    }

    /**
     * 获取成就状态
     * @returns {Object}
     */
    function getAchievements() {
        return getData().achievements;
    }

    /**
     * 获取成就解锁数量
     * @returns {number}
     */
    function getUnlockedAchievementsCount() {
        const achievements = getAchievements();
        return Object.values(achievements).filter(v => v).length;
    }

    /**
     * 计算跑步金币收益
     * @param {number} distance - 跑步距离（公里）
     * @returns {number} 金币数量
     */
    function calculateCoins(distance) {
        return Math.floor(distance * 10);
    }

    /**
     * 完成跑步并结算
     * @param {number} distance - 跑步距离
     * @returns {Object} 结算结果
     */
    function finishRun(distance) {
        const earnedCoins = calculateCoins(distance);
        addTodayDistance(distance);
        addTotalDistance(distance);
        addCoins(earnedCoins);
        
        return {
            distance: distance,
            coins: earnedCoins,
            totalCoins: getCoins(),
            totalDistance: getTotalDistance()
        };
    }

    /**
     * 重置所有数据
     */
    function reset() {
        Store.remove(STORAGE_KEY);
        init();
    }

    return {
        init,
        getData,
        getCoins,
        addCoins,
        spendCoins,
        getTodayDistance,
        addTodayDistance,
        getTotalDistance,
        addTotalDistance,
        getOwnedItems,
        hasItem,
        addItem,
        getUnlockedRoutes,
        unlockRoute,
        getAchievements,
        getUnlockedAchievementsCount,
        calculateCoins,
        finishRun,
        reset
    };
})();
