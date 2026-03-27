/**
 * RunBuddy - Store Module
 * localStorage 封装模块，提供数据持久化功能
 */

const Store = (function() {
    const PREFIX = 'runbuddy_';

    /**
     * 保存数据到 localStorage
     * @param {string} key - 键名（会自动添加前缀）
     * @param {any} value - 要保存的值（会自动 JSON 序列化）
     */
    function set(key, value) {
        try {
            const fullKey = PREFIX + key;
            const serialized = JSON.stringify(value);
            localStorage.setItem(fullKey, serialized);
            return true;
        } catch (error) {
            console.error('Store.set error:', error);
            return false;
        }
    }

    /**
     * 从 localStorage 获取数据
     * @param {string} key - 键名（会自动添加前缀）
     * @param {any} defaultValue - 默认值，当数据不存在时返回
     * @returns {any} - 解析后的数据或默认值
     */
    function get(key, defaultValue = null) {
        try {
            const fullKey = PREFIX + key;
            const item = localStorage.getItem(fullKey);
            if (item === null) {
                return defaultValue;
            }
            return JSON.parse(item);
        } catch (error) {
            console.error('Store.get error:', error);
            return defaultValue;
        }
    }

    /**
     * 删除指定键的数据
     * @param {string} key - 键名（会自动添加前缀）
     */
    function remove(key) {
        try {
            const fullKey = PREFIX + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('Store.remove error:', error);
            return false;
        }
    }

    /**
     * 清空所有 RunBuddy 相关数据
     */
    function clear() {
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(PREFIX)) {
                    keys.push(key);
                }
            }
            keys.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Store.clear error:', error);
            return false;
        }
    }

    /**
     * 检查某个键是否存在
     * @param {string} key - 键名（会自动添加前缀）
     * @returns {boolean}
     */
    function has(key) {
        const fullKey = PREFIX + key;
        return localStorage.getItem(fullKey) !== null;
    }

    /**
     * 获取所有 RunBuddy 数据的键名列表
     * @returns {string[]} - 不带前缀的键名数组
     */
    function keys() {
        const result = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(PREFIX)) {
                result.push(key.substring(PREFIX.length));
            }
        }
        return result;
    }

    return {
        set,
        get,
        remove,
        clear,
        has,
        keys
    };
})();
