/**
 * RunBuddy - Map Module
 * 地图模块（占位），用于管理跑步路线和打卡点
 */

const Map = (function() {
    const CHECKPOINTS = [
        {
            id: 'hanshan',
            name: '寒山寺',
            description: '姑苏城外寒山寺，夜半钟声到客船',
            icon: '🏯',
            requiredDistance: 5,
            unlocked: false
        },
        {
            id: 'fengqiao',
            name: '枫桥',
            description: '月落乌啼霜满天，江枫渔火对愁眠',
            icon: '🌉',
            requiredDistance: 10,
            unlocked: false
        },
        {
            id: 'shantang',
            name: '山塘街',
            description: '江南水乡的风情画卷',
            icon: '🏮',
            requiredDistance: 15,
            unlocked: false
        }
    ];

    /**
     * 初始化地图模块
     */
    function init() {
        updateCheckpointStatus();
        updateProgress();
    }

    /**
     * 获取所有打卡点
     * @returns {Array}
     */
    function getCheckpoints() {
        return CHECKPOINTS;
    }

    /**
     * 获取已解锁的路线数量
     * @returns {number}
     */
    function getUnlockedCount() {
        return User.getUnlockedRoutes().length;
    }

    /**
     * 更新打卡点状态显示
     */
    function updateCheckpointStatus() {
        const unlockedRoutes = User.getUnlockedRoutes();
        
        CHECKPOINTS.forEach(checkpoint => {
            const element = document.querySelector(`[data-checkpoint-id="${checkpoint.id}"]`);
            if (element) {
                const statusElement = element.querySelector('.checkpoint-status');
                if (statusElement) {
                    if (unlockedRoutes.includes(checkpoint.id)) {
                        statusElement.textContent = '✅';
                        element.classList.remove('locked');
                        element.classList.add('unlocked');
                    } else {
                        statusElement.textContent = '🔒';
                        element.classList.add('locked');
                        element.classList.remove('unlocked');
                    }
                }
            }
        });
    }

    /**
     * 更新路线解锁进度
     */
    function updateProgress() {
        const unlockedCount = getUnlockedCount();
        const totalCount = CHECKPOINTS.length;
        const percentage = (unlockedCount / totalCount) * 100;

        const progressFill = document.getElementById('route-progress');
        const unlockedRoutesEl = document.getElementById('unlocked-routes');

        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }
        if (unlockedRoutesEl) {
            unlockedRoutesEl.textContent = unlockedCount;
        }
    }

    /**
     * 检查并解锁符合条件的路线
     */
    function checkAndUnlockRoutes() {
        const totalDistance = User.getTotalDistance();
        let newUnlocks = [];

        CHECKPOINTS.forEach(checkpoint => {
            if (!User.getUnlockedRoutes().includes(checkpoint.id) && 
                totalDistance >= checkpoint.requiredDistance) {
                User.unlockRoute(checkpoint.id);
                newUnlocks.push(checkpoint);
            }
        });

        if (newUnlocks.length > 0) {
            updateCheckpointStatus();
            updateProgress();
        }

        return newUnlocks;
    }

    /**
     * 获取地图上的打卡点详情
     * @param {string} checkpointId - 打卡点ID
     * @returns {Object|null}
     */
    function getCheckpointById(checkpointId) {
        return CHECKPOINTS.find(cp => cp.id === checkpointId) || null;
    }

    /**
     * 计算到下一个打卡点还需要跑多少公里
     * @returns {number|null} 还需要跑的距离，如果没有未解锁的返回null
     */
    function getDistanceToNextCheckpoint() {
        const unlockedRoutes = User.getUnlockedRoutes();
        const nextCheckpoint = CHECKPOINTS.find(cp => !unlockedRoutes.includes(cp.id));
        
        if (!nextCheckpoint) return null;
        
        const totalDistance = User.getTotalDistance();
        return Math.max(0, nextCheckpoint.requiredDistance - totalDistance);
    }

    /**
     * 获取下一个打卡点信息
     * @returns {Object|null}
     */
    function getNextCheckpoint() {
        const unlockedRoutes = User.getUnlockedRoutes();
        return CHECKPOINTS.find(cp => !unlockedRoutes.includes(cp.id)) || null;
    }

    return {
        init,
        getCheckpoints,
        getUnlockedCount,
        updateCheckpointStatus,
        updateProgress,
        checkAndUnlockRoutes,
        getCheckpointById,
        getDistanceToNextCheckpoint,
        getNextCheckpoint
    };
})();
