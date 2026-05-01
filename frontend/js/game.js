const startBtn = document.getElementById('startBtn');
const startImg = document.querySelector('.button-start-up-2');
const runner = document.getElementById('runner');
const bg1 = document.getElementById('bg1');
const bg2 = document.getElementById('bg2');
const people = document.getElementById('people');
const endBtn = document.getElementById('endBtn');

const statTimeEl = document.getElementById('statTime');
const statPaceEl = document.getElementById('statPace');
const statHeartRateEl = document.getElementById('statHeartRate');
const statCaloriesEl = document.getElementById('statCalories');

// 弹窗相关
const settingBtn = document.querySelector('.setting-down-default');
const modalOverlay = document.getElementById('modalOverlay');
const settingsModal = document.getElementById('settingsModal');
const modalClose = document.getElementById('modalClose');

// 警告弹窗
const warningModal = document.getElementById('warningModal');
const warningClose = document.getElementById('warningClose');

// 新弹窗：1000米提示
const infoModal = document.getElementById('infoModal');
const infoClose = document.getElementById('infoClose');

let minSpeedLimit = null;
let isWarningOpen = false;
let isInfoOpen = false;

let distanceMilestone = 0; // 已达成的 1000 米段数

let isModalOpen = false;
let statsInterval = null;
let statsStarted = false;

let isRunning = false;
let isPaused = false;
let startTime = 0;
let timerInterval;
let animationFrame;

const BG1_WIDTH = 3686.4;
const BG2_WIDTH = 2752;
let speed = 0;
let pausedElapsed = 0;
let x1 = 0;
let x2 = BG1_WIDTH;

const ACCELERATION_TIME = 800;
const MAX_SPEED = 3;
const START_ANIM_DURATION = 1000;
const RUNNER_MOVE_DURATION = 1200;
const STOP_ANIM_DURATION = 5000;
const RUNNER_BACK_DURATION = 500;

// 卡路里计算常量
const CALORIES_PER_METER_PER_KG = 0.05; // 每公斤每米消耗约0.05kcal (粗略估算)
const DEFAULT_WEIGHT_KG = 60; // 默认体重60kg

const RUNNER_CENTER_X = (402 - 126) / 2;
const RUNNER_START_X = -8;
const NEXT_PAGE_URL = "settling.html";

// ==========================
// LocalStorage - 初始化并加载设置
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  // 加载保存的设置
  const savedSettings = Storage.getSettings();
  
  // 恢复设置值
  minSpeedLimit = savedSettings.minSpeed;
  
  // 更新设置弹窗中的输入框
  const speedInput = document.getElementById('speedInput');
  if (speedInput && savedSettings.minSpeed) {
    speedInput.value = savedSettings.minSpeed;
  }
  
  // 加载音乐设置
  const musicSelect = document.getElementById('musicSelect');
  if (musicSelect && savedSettings.musicSelection) {
    musicSelect.value = savedSettings.musicSelection;
    // 根据选择更换背景音乐
    updateBackgroundMusic(savedSettings.musicSelection);
  }
  
  // 加载音量设置
  const bgMusic = document.getElementById('bgMusic');
  if (bgMusic && savedSettings.musicVolume !== undefined) {
    bgMusic.volume = savedSettings.musicVolume;
  }
  
  // 显示加载的统计数据
  const stats = Storage.getStats();
  updateStatsDisplay(stats);
  
  console.log('Settings loaded from localStorage:', savedSettings);
  console.log('Stats loaded from localStorage:', stats);
});

// 根据音乐选择更新背景音乐
function updateBackgroundMusic(musicSelection) {
  const bgMusic = document.getElementById('bgMusic');
  if (!bgMusic) return;
  
  const musicMap = {
    'Music 1': 'audio/faded.mp3',
    'Music 2': 'audio/faded.mp3',
    'Music 3': 'audio/faded.mp3'
  };
  
  const musicPath = musicMap[musicSelection] || musicMap['Music 1'];
  if (bgMusic.src.indexOf(musicPath) === -1) {
    bgMusic.src = musicPath;
  }
}

// ==========================
// 音频相关
// ==========================
const encourageSounds = [
  'audio/ttsMP3.com_VoiceText_2026-4-22_12-4-47.mp3',
  'audio/ttsMP3.com_VoiceText_2026-4-22_12-7-27.mp3',
  'audio/ttsMP3.com_VoiceText_2026-4-22_12-3-35.mp3',
  'audio/ttsMP3.com_VoiceText_2026-4-22_12-3-54.mp3',
  'audio/ttsMP3.com_VoiceText_2026-4-22_12-5-9.mp3'
];

let encourageInterval = null;
let coinsInterval = null;

function playBackgroundMusic() {
  const bgMusic = document.getElementById('bgMusic');
  if (!bgMusic) return;
  bgMusic.volume = 0.3;
  bgMusic.play().catch(e => console.log('Audio autoplay blocked:', e));
}

function stopBackgroundMusic() {
  const bgMusic = document.getElementById('bgMusic');
  if (!bgMusic) return;
  bgMusic.pause();
  bgMusic.currentTime = 0;
}

function playEncourageSound() {
  const encourageAudio = document.getElementById('encourageAudio');
  if (!encourageAudio) return;
  const randomIndex = Math.floor(Math.random() * encourageSounds.length);
  const soundPath = encourageSounds[randomIndex];
  encourageAudio.src = soundPath;
  encourageAudio.volume = 1.0;
  encourageAudio.play().catch(e => console.log('Encourage audio error:', e));
}

function playCoinsSound() {
  const coinsAudio = document.getElementById('coinsAudio');
  if (!coinsAudio) return;
  coinsAudio.currentTime = 0;
  coinsAudio.play().catch(e => console.log('Coins audio error:', e));
}

function startEncourageInterval() {
  encourageInterval = setInterval(() => {
    if (isRunning && !isPaused && !isModalOpen && !isWarningOpen && !isInfoOpen) {
      playEncourageSound();
    }
  }, 30000);
}

function stopEncourageInterval() {
  if (encourageInterval) {
    clearInterval(encourageInterval);
    encourageInterval = null;
  }
  if (coinsInterval) {
    clearInterval(coinsInterval);
    coinsInterval = null;
  }
  const encourageAudio = document.getElementById('encourageAudio');
  if (encourageAudio) {
    encourageAudio.pause();
    encourageAudio.currentTime = 0;
  }
}

function startCoinsInterval() {
  coinsInterval = setInterval(() => {
    if (isRunning && !isPaused && !isModalOpen && !isWarningOpen && !isInfoOpen) {
      playCoinsSound();
    }
  }, 60000); // 每分钟播放一次
}

// ==========================
// 返回菜单按钮：重置游戏并跳转
// ==========================
const backBtn = document.getElementById('backBtn');
backBtn.addEventListener('click', () => {
  // 先重置游戏
  resetGame();
  
  // 等待重置动画完成后跳转（和你结束动画时间一致 5秒）
  setTimeout(() => {
    window.location.href = "shouye.html"; // 这里改成你真正的菜单页面
  }, STOP_ANIM_DURATION);
});

startBtn.addEventListener('click', () => {
  if (!isRunning) {
    startGame();
  } else if (!isPaused) {
    pauseGameWithAnimation();
  } else {
    startGame();
  }
});

endBtn.addEventListener('click', resetGame);

// ==========================
// 1000米提示弹窗
// ==========================
function showInfoModal() {
  if (isPaused || !isRunning || isInfoOpen) return;

  isInfoOpen = true;
  modalOverlay.style.display = 'block';
  infoModal.style.display = 'block';

  cancelAnimationFrame(animationFrame);
  clearInterval(timerInterval);
  clearInterval(statsInterval);

  // 5秒自动关闭
  setTimeout(() => {
    closeInfoModal();
  }, 5000);
}

function closeInfoModal() {
  if (!isInfoOpen) return;

  isInfoOpen = false;
  modalOverlay.style.display = 'none';
  infoModal.style.display = 'none';

  if (isRunning && !isPaused) {
    timerInterval = setInterval(updateTimer, 10);
    scrollBackgrounds();
    if (statsStarted) statsInterval = setInterval(updateStats, 10000);
  }
}

infoClose.addEventListener('click', closeInfoModal);

// ==========================
// 警告弹窗
// ==========================
function showWarningModal() {
  if (isPaused || !isRunning || isWarningOpen) return;

  isWarningOpen = true;
  modalOverlay.style.display = 'block';
  warningModal.style.display = 'block';
  document.getElementById('warningSpeaker').style.display = 'block';

  cancelAnimationFrame(animationFrame);
  clearInterval(timerInterval);
  clearInterval(statsInterval);
}

function closeWarningModal() {
  if (!isWarningOpen) return;

  isWarningOpen = false;
  modalOverlay.style.display = 'none';
  warningModal.style.display = 'none';
  document.getElementById('warningSpeaker').style.display = 'none';

  if (isRunning && !isPaused) {
    timerInterval = setInterval(updateTimer, 10);
    scrollBackgrounds();
    if (statsStarted) statsInterval = setInterval(updateStats, 10000);
  }
}

warningClose.addEventListener('click', closeWarningModal);

// ==========================
// 开始游戏
// ==========================
function startGame() {
  cancelAnimationFrame(animationFrame);
  clearInterval(timerInterval);
  clearTimeout(window.runnerTimeout);
  clearTimeout(window.stopAnimTimeout);

  isRunning = true;
  isPaused = false;
  startImg.src = 'images/stop_up.png';

  runner.src = 'images/start.gif';
  runner.style.transform = `translateX(${RUNNER_START_X}px)`;

  startTime = Date.now() - pausedElapsed;
  timerInterval = setInterval(updateTimer, 10);

  window.runnerTimeout = setTimeout(() => {
    if (!isRunning || isPaused) return;
    runner.src = 'images/running.gif';
    moveRunnerToCenter();
  }, START_ANIM_DURATION);

  startStatsUpdate();
  
  // 播放背景音乐和启动鼓励音频
  playBackgroundMusic();
  startEncourageInterval();
  startCoinsInterval();
}

// ==========================
// 设置弹窗
// ==========================
function openSettingModal() {
  isModalOpen = true;
  modalOverlay.style.display = 'block';
  settingsModal.style.display = 'block';

  cancelAnimationFrame(animationFrame);
  clearInterval(timerInterval);
  clearInterval(statsInterval);
  
  // 从 localStorage 加载当前设置
  const savedSettings = Storage.getSettings();
  const speedInput = document.getElementById('speedInput');
  const musicSelect = document.getElementById('musicSelect');
  
  if (speedInput && savedSettings.minSpeed) {
    speedInput.value = savedSettings.minSpeed;
  }
  if (musicSelect) {
    musicSelect.value = savedSettings.musicSelection || 'Music 1';
  }
}

function closeSettingModal() {
  isModalOpen = false;
  modalOverlay.style.display = 'none';
  settingsModal.style.display = 'none';

  const speedInput = document.getElementById('speedInput');
  const musicSelect = document.getElementById('musicSelect');
  const inputVal = parseFloat(speedInput.value);
  minSpeedLimit = (!isNaN(inputVal) && inputVal > 0) ? inputVal : null;

  // 保存设置到 localStorage
  const settings = Storage.getSettings();
  settings.minSpeed = minSpeedLimit;
  settings.maxHeartRate = null; // 可扩展
  if (musicSelect) {
    settings.musicSelection = musicSelect.value;
    updateBackgroundMusic(musicSelect.value);
  }
  Storage.saveSettings(settings);
  console.log('Settings saved:', settings);

  if (isRunning && !isPaused) {
    timerInterval = setInterval(updateTimer, 10);
    scrollBackgrounds();
    if (statsStarted) statsInterval = setInterval(updateStats, 10000);
  }
}

settingBtn.addEventListener('click', openSettingModal);
modalClose.addEventListener('click', closeSettingModal);

// ==========================
// 人物移动
// ==========================
function moveRunnerToCenter() {
  const start = Date.now();
  let scrollStarted = false;

  function animate() {
    if (!isRunning || isPaused) return;
    const t = Math.min(1, (Date.now() - start) / RUNNER_MOVE_DURATION);
    const pos = RUNNER_START_X + (RUNNER_CENTER_X - RUNNER_START_X) * t;
    runner.style.transform = `translateX(${pos}px)`;

    if (!scrollStarted && t >= 0.85) {
      scrollStarted = true;
      startBackgroundScroll();
    }

    if (t < 1) animationFrame = requestAnimationFrame(animate);
    else {
      runner.style.transform = `translateX(${RUNNER_CENTER_X}px)`;
      if (!scrollStarted) startBackgroundScroll();
    }
  }
  animate();
}

// ==========================
// 背景加速
// ==========================
function startBackgroundScroll() {
  speed = 0;
  const startAcc = Date.now();

  function accelerate() {
    if (!isRunning || isPaused) return;
    const elapsed = Date.now() - startAcc;
    speed = Math.min(MAX_SPEED, (elapsed / ACCELERATION_TIME) * MAX_SPEED);
    requestAnimationFrame(accelerate);
  }
  accelerate();
  scrollBackgrounds();
}

function scrollBackgrounds() {
  if (!isRunning || isPaused || isModalOpen || isWarningOpen || isInfoOpen) return;

  x1 -= speed;
  x2 -= speed;

  if (x1 <= 0-BG1_WIDTH) x1 = BG2_WIDTH;
  if (x2 <= 0-BG2_WIDTH) x2 = BG1_WIDTH;

  bg1.style.left = x1 + 'px';
  bg2.style.left = x2 + 'px';
  people.style.left = (x2 - 75) + 'px';

  animationFrame = requestAnimationFrame(scrollBackgrounds);
}

// ==========================
// 暂停游戏
// ==========================
function pauseGameWithAnimation() {
  if (isWarningOpen) closeWarningModal();
  if (isInfoOpen) closeInfoModal();

  pausedElapsed = Date.now() - startTime;
  isPaused = true;
  startImg.src = 'images/button_start_up.png';

  cancelAnimationFrame(animationFrame);
  clearInterval(timerInterval);
  clearTimeout(window.runnerTimeout);
  clearInterval(statsInterval);
  statsStarted = false;

  runner.src = 'images/stop.gif';

  const startMove = Date.now();
  function moveBack() {
    const t = Math.min(1, (Date.now() - startMove) / RUNNER_BACK_DURATION);
    const pos = RUNNER_START_X + (RUNNER_CENTER_X - RUNNER_START_X) * (1 - t);
    runner.style.transform = `translateX(${pos}px)`;

    if (t < 1) animationFrame = requestAnimationFrame(moveBack);
    else runner.style.transform = `translateX(${RUNNER_START_X}px)`;
  }
  moveBack();

  window.stopAnimTimeout = setTimeout(() => {
    runner.src = 'images/stand.png';
  }, STOP_ANIM_DURATION);

  // 暂停背景音乐
  bgMusic.pause();
  stopEncourageInterval();
}

// ==========================
// 重置游戏
// ==========================
function resetGame() {
  if (isWarningOpen) closeWarningModal();
  if (isInfoOpen) closeInfoModal();

  pauseGameWithAnimation();

  // 保存本次跑步统计数据
  const elapsed = Date.now() - startTime;
  const distanceMeters = calculateDistance();
  const caloriesBurned = calculateCalories(distanceMeters, elapsed);
  
  // 金币公式：基础金币 + 距离奖励 + 卡路里奖励
  // 每100米获得1金币，每消耗10卡路里获得1金币
  const baseCoins = 1;
  const distanceCoins = Math.floor(distanceMeters / 100);
  const caloriesCoins = Math.floor(caloriesBurned / 10);
  const coinsEarned = baseCoins + distanceCoins + caloriesCoins;
  
  // 更新总统计数据
  Storage.recordRun(distanceMeters, elapsed, speed);
  Storage.addCoins(coinsEarned);
  Storage.addDistance(distanceMeters);
  Storage.addCalories(caloriesBurned);
  
  // 保存到跑步历史记录
  Storage.addRunToHistory({
    distance: distanceMeters,
    time: elapsed,
    pace: speed,
    coinsEarned: coinsEarned,
    calories: caloriesBurned
  });
  
  // 保存最后会话信息
  Storage.updateLastSession({
    distance: distanceMeters,
    time: elapsed,
    pace: speed,
    coinsEarned: coinsEarned,
    calories: caloriesBurned
  });
  
  console.log('Run completed - Distance:', distanceMeters, 'm, Coins earned:', coinsEarned);
  console.log('Total stats:', Storage.getStats());
  console.log('History:', Storage.getRunHistory());

  distanceMilestone = 0;

  // 停止所有音频
  stopBackgroundMusic();
  stopEncourageInterval();

  setTimeout(() => {
    x1 = 0;
    x2 = 4163;
    bg1.style.left = x1 + 'px';
    bg2.style.left = x2 + 'px';
    people.style.left = (x2 - 81) + 'px';
    window.location.href = NEXT_PAGE_URL;
  }, STOP_ANIM_DURATION);
}

// 计算当前跑步距离
function calculateDistance() {
  const elapsedMs = Date.now() - startTime;
  const hours = elapsedMs / 3600000;
  const currentPace = parseFloat(document.getElementById('statPace')?.textContent?.split(': ')[1]?.split(' ')[0] || '7');
  return hours * currentPace * 1000;
}

// 计算卡路里消耗
// 使用更准确的跑步卡路里公式：
// 卡路里 = MET值 × 体重(kg) × 时间(小时)
// 慢跑(6-8 km/h)的MET值约为7-8
function calculateCalories(distanceMeters, elapsedMs) {
  const currentPace = parseFloat(document.getElementById('statPace')?.textContent?.split(': ')[1]?.split(' ')[0] || '7');
  
  // 根据速度确定MET值
  let met;
  if (currentPace < 6) {
    met = 6; // 快走
  } else if (currentPace < 8) {
    met = 7; // 慢跑
  } else if (currentPace < 10) {
    met = 8.5; // 跑步
  } else if (currentPace < 12) {
    met = 10; // 快跑
  } else {
    met = 12; // 冲刺
  }
  
  // 卡路里 = MET × 体重 × 时间(小时)
  const hours = elapsedMs / 3600000;
  const calories = met * DEFAULT_WEIGHT_KG * hours;
  
  return Math.round(calories);
}

// 实时更新卡路里显示
function updateCaloriesDisplay() {
  if (isPaused || !isRunning) return;
  
  const distanceMeters = calculateDistance();
  const elapsedMs = Date.now() - startTime;
  const calories = calculateCalories(distanceMeters, elapsedMs);
  
  if (statCaloriesEl) {
    statCaloriesEl.textContent = calories;
  }
}

// ==========================
// 计时器
// ==========================
function updateTimer() {
  const elapsed = Date.now() - startTime;
  const ms = Math.floor(elapsed % 1000 / 10);
  const sec = Math.floor((elapsed / 1000) % 60);
  const min = Math.floor((elapsed / 60000) % 60);
  const hour = Math.floor((elapsed / 3600000));
  statTimeEl.textContent = `Time: ${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
}

// ==========================
// 统计更新（含距离计算）
// ==========================
function startStatsUpdate() {
  if (statsStarted) return;
  statsStarted = true;

  setTimeout(() => {
    updateStats();
    statsInterval = setInterval(updateStats, 10000);
  }, 5000);
}

// 更新统计显示（可选：显示累计数据）
function updateStatsDisplay(stats) {
  // 可以在这里更新页面上的累计数据显示
  // 例如：总金币、总距离等
  const totalCoinsEl = document.getElementById('totalCoins');
  const totalDistanceEl = document.getElementById('totalDistance');
  const totalRunsEl = document.getElementById('totalRuns');
  
  if (totalCoinsEl && stats.totalCoins !== undefined) {
    totalCoinsEl.textContent = stats.totalCoins;
  }
  if (totalDistanceEl && stats.totalDistance !== undefined) {
    totalDistanceEl.textContent = (stats.totalDistance / 1000).toFixed(2) + ' km';
  }
  if (totalRunsEl && stats.totalRuns !== undefined) {
    totalRunsEl.textContent = stats.totalRuns;
  }
}

function updateStats() {
  if (isPaused || !isRunning) return;

  const heartRate = Math.floor(Math.random() * (152 - 114 + 1)) + 114;
  const pace = (Math.random() * (8 - 6) + 6).toFixed(1);
  statHeartRateEl.textContent = `Heart rate: ${heartRate} bpm`;
  statPaceEl.textContent = `Pace: ${pace} km/h`;

  const currentPace = parseFloat(pace);
  const elapsedMs = Date.now() - startTime;
  const hours = elapsedMs / 3600000;
  const distanceMeters = hours * currentPace * 1000;

  // 更新卡路里显示
  updateCaloriesDisplay();

  // ==========================
  // 每 1000 米弹窗一次
  // ==========================
  const currentMilestone = Math.floor(distanceMeters / 1000);
  if (currentMilestone > distanceMilestone && !isInfoOpen && !isWarningOpen) {
    distanceMilestone = currentMilestone;
    showInfoModal();
  }

  // 速度过低警告
  if (minSpeedLimit !== null && !isWarningOpen && !isInfoOpen) {
    if (currentPace < minSpeedLimit) {
      showWarningModal();
    }
  }

  // 警告自动关闭
  if (minSpeedLimit !== null && isWarningOpen && currentPace >= minSpeedLimit) {
    closeWarningModal();
  }
}