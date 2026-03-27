/**
 * RunBuddy - Pet Module
 * 虚拟伙伴模块，管理伙伴的状态、动画和装扮
 */

const Pet = (function() {
    let petElement = null;
    let accessoriesElement = null;
    let speechElement = null;
    let isRunning = false;
    let currentDistance = 0;

    const SPEECH_MESSAGES = {
        idle: [
            '今天也要加油跑步哦！',
            '快带我出去跑跑步吧！',
            '期待今天的跑步！',
            '动起来更健康！'
        ],
        running: [
            '好开心在跑步！',
            '冲鸭！',
            '跑步真有趣！',
            '加油加油！'
        ],
        finish: [
            '太棒了！跑完了！',
            '今天的运动量达标了！',
            '真是个运动健将！',
            '下次还要跑步哦！'
        ],
        celebrate: [
            '太厉害了吧！',
            '你是最棒的！',
            '继续保持！',
            '这就是努力的结果！'
        ]
    };

    /**
     * 初始化虚拟伙伴
     */
    function init() {
        petElement = document.getElementById('pet');
        accessoriesElement = document.getElementById('pet-accessories');
        speechElement = document.getElementById('pet-speech');

        if (petElement && speechElement) {
            setRandomIdleSpeech();
            updateAccessories();
        }
    }

    /**
     * 获取随机消息
     * @param {string} type - 消息类型
     * @returns {string}
     */
    function getRandomMessage(type) {
        const messages = SPEECH_MESSAGES[type] || SPEECH_MESSAGES.idle;
        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * 设置伙伴对话气泡内容
     * @param {string} message - 消息内容
     */
    function setSpeech(message) {
        if (speechElement) {
            speechElement.textContent = message;
        }
    }

    /**
     * 设置随机待机消息
     */
    function setRandomIdleSpeech() {
        setSpeech(getRandomMessage('idle'));
    }

    /**
     * 开始跑步动画
     */
    function startRunning() {
        if (!petElement) return;
        
        isRunning = true;
        petElement.classList.add('running');
        setSpeech(getRandomMessage('running'));
    }

    /**
     * 停止跑步动画
     */
    function stopRunning() {
        if (!petElement) return;
        
        isRunning = false;
        petElement.classList.remove('running');
        setSpeech(getRandomMessage('finish'));
    }

    /**
     * 播放庆祝动画
     */
    function celebrate() {
        if (!petElement) return;
        
        petElement.classList.add('celebrate');
        setSpeech(getRandomMessage('celebrate'));
        
        setTimeout(() => {
            petElement.classList.remove('celebrate');
            setRandomIdleSpeech();
        }, 1500);
    }

    /**
     * 更新跑步距离显示
     * @param {number} distance - 当前跑步距离
     */
    function updateRunningDistance(distance) {
        currentDistance = distance;
        
        if (isRunning && speechElement) {
            if (distance >= 1 && distance < 2) {
                setSpeech('已经跑了1公里啦！');
            } else if (distance >= 2 && distance < 3) {
                setSpeech('2公里了，继续保持！');
            } else if (distance >= 3 && distance < 5) {
                setSpeech('太厉害了，快到5公里了！');
            } else if (distance >= 5) {
                setSpeech('5公里达成！你太棒了！');
            } else {
                setSpeech(getRandomMessage('running'));
            }
        }
    }

    /**
     * 更新装扮显示
     */
    function updateAccessories() {
        if (!accessoriesElement) return;

        const ownedItems = User.getOwnedItems();
        const itemEmojis = {
            hat: '🧢',
            sunglasses: '🕶️',
            tshirt: '👕',
            shoes: '👟'
        };

        let accessoriesHTML = '';
        ownedItems.forEach(itemId => {
            if (itemEmojis[itemId]) {
                accessoriesHTML += itemEmojis[itemId];
            }
        });

        accessoriesElement.innerHTML = accessoriesHTML;
    }

    /**
     * 获取当前状态
     * @returns {boolean}
     */
    function getIsRunning() {
        return isRunning;
    }

    /**
     * 获取当前跑步距离
     * @returns {number}
     */
    function getCurrentDistance() {
        return currentDistance;
    }

    /**
     * 重置当前跑步距离
     */
    function resetDistance() {
        currentDistance = 0;
    }

    return {
        init,
        startRunning,
        stopRunning,
        celebrate,
        updateRunningDistance,
        updateAccessories,
        setSpeech,
        setRandomIdleSpeech,
        getIsRunning,
        getCurrentDistance,
        resetDistance
    };
})();
