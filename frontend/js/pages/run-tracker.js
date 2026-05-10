const startBtn = document.getElementById('startBtn');
const endBtn = document.getElementById('endBtn');
const backBtn = document.getElementById('backBtn');
const settingBtn = document.getElementById('settingBtn');

const statTimeEl = document.getElementById('statTime');
const statSpeedEl = document.getElementById('statSpeed');
const statDistanceEl = document.getElementById('statDistance');
const statHeartRateEl = document.getElementById('statHeartRate');
const statCaloriesEl = document.getElementById('statCalories');
const mapStatusEl = document.getElementById('mapStatus');

const modalOverlay = document.getElementById('modalOverlay');
const settingsModal = document.getElementById('settingsModal');
const modalClose = document.getElementById('modalClose');
const recordConfirmModal = document.getElementById('recordConfirmModal');
const recordConfirmBtn = document.getElementById('recordConfirmBtn');
const recordRejectBtn = document.getElementById('recordRejectBtn');
const recordNameInput = document.getElementById('recordNameInput');
const recordConfirmError = document.getElementById('recordConfirmError');
const recordHoldBtn = document.getElementById('recordHoldBtn');
const recordingStatus = document.getElementById('recordingStatus');
const recordingTimer = document.getElementById('recordingTimer');
const encourageAudioSelect = document.getElementById('encourageAudioSelect');
const settingsTabs = Array.from(document.querySelectorAll('[data-settings-tab]'));
const settingsPanels = Array.from(document.querySelectorAll('[data-settings-panel]'));

const warningModal = document.getElementById('warningModal');
const warningClose = document.getElementById('warningClose');

const infoModal = document.getElementById('infoModal');
const infoClose = document.getElementById('infoClose');

const warningSpeaker = document.getElementById('warningSpeaker');
const isWatchLayout = document.querySelector('.watch-frame') !== null;

const NEXT_PAGE_URL = 'run-summary.html';
const STOP_ANIM_DURATION = 1200;
const DEFAULT_WEIGHT_KG = 60;
const DEFAULT_MAP_CENTER = [31.2304, 121.4737];
const WATCH_RUNNER_ANCHOR_Y_RATIO = 0.40;
const SIMULATION_STEP_INTERVAL_MS = 2000;
const SIMULATION_MIN_STEP_METERS = 4;
const SIMULATION_MAX_STEP_METERS = 7;
const SIMULATION_MAX_RADIUS_METERS = 350;

const encourageSounds = [
  'audio/ttsMP3.com_VoiceText_2026-4-22_12-4-47.mp3',
  'audio/ttsMP3.com_VoiceText_2026-4-22_12-7-27.mp3',
  'audio/ttsMP3.com_VoiceText_2026-4-22_12-3-35.mp3',
  'audio/ttsMP3.com_VoiceText_2026-4-22_12-3-54.mp3',
  'audio/ttsMP3.com_VoiceText_2026-4-22_12-5-9.mp3'
];
const DEFAULT_ENCOURAGE_AUDIO_KEY = 'default';
const RECORD_MAX_DURATION_MS = 10000;

const MUSIC_LABEL_TO_VALUE = {
  'Music 1': 'audio/faded.mp3',
  'Music 2': 'audio/baby.mp3',
  'Music 3': 'audio/cruelSummer.mp3'
};

const MUSIC_VALUE_TO_LABEL = {
  'audio/faded.mp3': 'Music 1',
  'audio/baby.mp3': 'Music 2',
  'audio/cruelSummer.mp3': 'Music 3'
};

let minSpeedLimit = null;
let maxHeartRateLimit = null;

let isRunning = false;
let isPaused = false;
let isModalOpen = false;
let isWarningOpen = false;
let isWarningForSpeed = false;
let isInfoOpen = false;
let isRecordConfirmOpen = false;

let startTime = 0;
let pausedElapsed = 0;
let timerInterval = null;
let statsInterval = null;
let encourageInterval = null;
let coinsInterval = null;
let simulationInterval = null;
let recordingTimerInterval = null;
let recordingStopTimeout = null;

let map = null;
let routeLine = null;
let watchId = null;
let hasCenteredOnUser = false;
let baseTileLayer = null;
let mapResizeObserver = null;
let tileErrorCount = 0;
let tileSourceIndex = 0;
let totalTileErrors = 0;
let recenterTimer = null;
let isMapBeingDragged = false;
let mapStatusFadeTimer = null;
let mapStatusObserver = null;

const TILE_SOURCES = [
  {
    name: 'Gaode CN',
    url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    subdomains: '1234'
  },
  {
    name: 'Geoq CN',
    url: 'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'
  },
  {
    name: 'OSM Global',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc'
  }
];

let routePoints = [];
let totalDistanceMeters = 0;
let latestSpeedKmh = 0;
let latestHeartRate = 0;
let avgSpeedSamples = [];
let distanceMilestone = 0;
let currentPosition = null;
let isUsingSimulatedRoute = false;
let simulatedPosition = null;
let simulatedHeadingDeg = 0;
let mediaRecorder = null;
let recordingChunks = [];
let recordingStartAt = 0;
let pendingRecordedAudio = null;
let isRecording = false;
let currentSettingsPanel = 'basic';

// ==========================
// Init
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  initCustomEncourageAudio();
  initMap();
  initMapStatusBehavior();
  startLocationWatch();
  updateStatsDisplay(Storage.getStats());
  updateDisplayedMetrics();
});

function loadSettings() {
  const savedSettings = Storage.getSettings();
  minSpeedLimit = savedSettings.minSpeed;
  maxHeartRateLimit = savedSettings.maxHeartRate;

  const speedInput = document.getElementById('speedInput');
  const maxHrInput = document.getElementById('maxHrInput');
  const musicSelect = document.getElementById('musicSelect');

  if (speedInput && savedSettings.minSpeed) speedInput.value = savedSettings.minSpeed;
  if (maxHrInput && savedSettings.maxHeartRate) maxHrInput.value = savedSettings.maxHeartRate;
  if (musicSelect && savedSettings.musicSelection) {
    musicSelect.value = MUSIC_LABEL_TO_VALUE[savedSettings.musicSelection] || savedSettings.musicSelection;
    updateBackgroundMusic(savedSettings.musicSelection);
  }

  populateEncourageAudioSelect(savedSettings.encourageAudioSelection || DEFAULT_ENCOURAGE_AUDIO_KEY);

  const bgMusic = document.getElementById('bgMusic');
  if (bgMusic && savedSettings.musicVolume !== undefined) {
    bgMusic.volume = savedSettings.musicVolume;
  }
}

function initCustomEncourageAudio() {
  populateEncourageAudioSelect(Storage.getSettings().encourageAudioSelection || DEFAULT_ENCOURAGE_AUDIO_KEY);
  updateRecordingStatus('Ready to record.');
  updateRecordingTimer(0);
  setupRecordHoldEvents();
  bindSettingsTabs();
}

function initMap() {
  if (typeof L === 'undefined') {
    mapStatusEl.textContent = 'Map library failed to load. Please check network and reload.';
    return;
  }

  map = L.map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView(DEFAULT_MAP_CENTER, 15);

  setupBaseTiles();
  setupMapResizeHandling();

  routeLine = L.polyline([], {
    color: '#2577d9',
    weight: 4,
    opacity: 0.95,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(map);

  mapStatusEl.textContent = 'Map ready. Requesting location...';
}

function buildTileLayer(source) {
  const layer = L.tileLayer(source.url, {
    maxZoom: 19,
    detectRetina: true,
    updateWhenIdle: true,
    keepBuffer: 3,
    crossOrigin: true,
    subdomains: source.subdomains || undefined
  });

  layer.on('loading', () => {
    if (tileErrorCount === 0) {
      mapStatusEl.textContent = 'Loading map...';
    }
  });

  layer.on('load', () => {
    tileErrorCount = 0;
    if (!isRunning && isUsingSimulatedRoute) {
      mapStatusEl.textContent = 'Map loaded. Simulated route ready from default map.';
    } else if (!isRunning && !currentPosition) {
      mapStatusEl.textContent = 'Map loaded. Waiting for location permission...';
    }
  });

  layer.on('tileerror', () => {
    tileErrorCount += 1;
    totalTileErrors += 1;
    if (tileErrorCount >= 4 || totalTileErrors >= 10) {
      switchToNextTileSource();
      return;
    }
  });

  return layer;
}

function setupBaseTiles() {
  baseTileLayer = buildTileLayer(TILE_SOURCES[tileSourceIndex]);
  baseTileLayer.addTo(map);

  // Leaflet in fixed containers can render partial tiles until resize is invalidated.
  requestAnimationFrame(() => map.invalidateSize(true));
  setTimeout(() => map.invalidateSize(true), 180);
  setTimeout(() => map.invalidateSize(true), 520);
}

function switchToNextTileSource() {
  if (tileSourceIndex >= TILE_SOURCES.length - 1) {
    mapStatusEl.textContent = 'Map tiles unstable. Check network connection.';
    return;
  }

  tileSourceIndex += 1;
  tileErrorCount = 0;
  totalTileErrors = 0;
  if (baseTileLayer) {
    map.removeLayer(baseTileLayer);
  }
  baseTileLayer = buildTileLayer(TILE_SOURCES[tileSourceIndex]);
  baseTileLayer.addTo(map);
  map.invalidateSize(true);
  mapStatusEl.textContent = `Switched map source: ${TILE_SOURCES[tileSourceIndex].name}`;
}

function setupMapResizeHandling() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  if (typeof ResizeObserver !== 'undefined') {
    mapResizeObserver = new ResizeObserver(() => {
      if (map) map.invalidateSize(false);
    });
    mapResizeObserver.observe(mapEl);
  }

  window.addEventListener('resize', () => {
    if (map) map.invalidateSize(false);
  });

  window.addEventListener('orientationchange', () => {
    if (map) {
      setTimeout(() => map.invalidateSize(true), 120);
    }
  });

  window.addEventListener('online', () => {
    if (!map) return;
    if (baseTileLayer) baseTileLayer.redraw();
    map.invalidateSize(true);
    updateRunnerScreenPosition();
  });

  map.on('movestart', () => {
    if (isFollowingCurrentPosition()) {
      clearRecenterTimer();
    }
  });

  map.on('move', () => {
    updateRunnerScreenPosition();
  });

  map.on('moveend', () => {
    updateRunnerScreenPosition();
    scheduleRecenterIfNeeded();
  });

  map.on('dragstart', () => {
    isMapBeingDragged = true;
    clearRecenterTimer();
  });

  map.on('dragend', () => {
    isMapBeingDragged = false;
    updateRunnerScreenPosition();
    scheduleRecenterIfNeeded();
  });
}

function initMapStatusBehavior() {
  if (!mapStatusEl) return;

  mapStatusEl.classList.add('is-visible');
  scheduleMapStatusFade();

  if (mapStatusObserver) {
    mapStatusObserver.disconnect();
  }

  let lastStatusText = mapStatusEl.textContent;
  mapStatusObserver = new MutationObserver(() => {
    const nextStatusText = mapStatusEl.textContent;
    if (nextStatusText === lastStatusText) return;
    lastStatusText = nextStatusText;
    mapStatusEl.classList.remove('is-faded');
    mapStatusEl.classList.add('is-visible');
    scheduleMapStatusFade();
  });

  mapStatusObserver.observe(mapStatusEl, {
    childList: true,
    characterData: true,
    subtree: true
  });
}

function scheduleMapStatusFade() {
  if (!mapStatusEl) return;

  if (mapStatusFadeTimer) {
    clearTimeout(mapStatusFadeTimer);
  }

  mapStatusFadeTimer = setTimeout(() => {
    mapStatusEl.classList.add('is-faded');
  }, 850);
}

// ==========================
// Audio
// ==========================
function updateBackgroundMusic(musicSelection) {
  const bgMusic = document.getElementById('bgMusic');
  if (!bgMusic) return;

  const musicPath = MUSIC_LABEL_TO_VALUE[musicSelection] || musicSelection || MUSIC_LABEL_TO_VALUE['Music 1'];
  const wasPlaying = !bgMusic.paused && !bgMusic.ended;

  if (!bgMusic.src.includes(musicPath)) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
    bgMusic.src = musicPath;
    bgMusic.load();
  }

  if (wasPlaying) {
    const savedSettings = Storage.getSettings();
    bgMusic.volume = savedSettings.musicVolume !== undefined ? savedSettings.musicVolume : 0.3;
    bgMusic.play().catch(() => {});
  }
}

function playBackgroundMusic() {
  const bgMusic = document.getElementById('bgMusic');
  if (!bgMusic) return;
  const savedSettings = Storage.getSettings();
  bgMusic.volume = savedSettings.musicVolume !== undefined ? savedSettings.musicVolume : 0.3;
  bgMusic.play().catch(() => {});
}

function stopBackgroundMusic() {
  const bgMusic = document.getElementById('bgMusic');
  if (!bgMusic) return;
  bgMusic.pause();
  bgMusic.currentTime = 0;
}

function getSelectedEncourageAudioSource() {
  const settings = Storage.getSettings();
  const selectedId = settings.encourageAudioSelection || DEFAULT_ENCOURAGE_AUDIO_KEY;

  if (selectedId === DEFAULT_ENCOURAGE_AUDIO_KEY) {
    const randomIndex = Math.floor(Math.random() * encourageSounds.length);
    return encourageSounds[randomIndex];
  }

  const customAudio = Storage.getCustomEncourageAudioList().find((item) => item.id === selectedId);
  return customAudio ? customAudio.dataUrl : encourageSounds[Math.floor(Math.random() * encourageSounds.length)];
}

function playEncourageSound() {
  const encourageAudio = document.getElementById('encourageAudio');
  if (!encourageAudio) return;
  encourageAudio.src = getSelectedEncourageAudioSource();
  encourageAudio.volume = 1.0;
  encourageAudio.play().catch(() => {});
}

function playCoinsSound() {
  const coinsAudio = document.getElementById('coinsAudio');
  if (!coinsAudio) return;
  coinsAudio.currentTime = 0;
  coinsAudio.play().catch(() => {});
}

function startEncourageInterval() {
  encourageInterval = setInterval(() => {
    if (isRunning && !isPaused && !isModalOpen && !isWarningOpen && !isInfoOpen) {
      playEncourageSound();
    }
  }, 30000);
}

function startCoinsInterval() {
  coinsInterval = setInterval(() => {
    if (isRunning && !isPaused && !isModalOpen && !isWarningOpen && !isInfoOpen) {
      playCoinsSound();
    }
  }, 60000);
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

function populateEncourageAudioSelect(selectedId = DEFAULT_ENCOURAGE_AUDIO_KEY) {
  if (!encourageAudioSelect) return;

  const customAudioList = Storage.getCustomEncourageAudioList();
  encourageAudioSelect.innerHTML = '';

  const defaultOption = document.createElement('option');
  defaultOption.value = DEFAULT_ENCOURAGE_AUDIO_KEY;
  defaultOption.textContent = 'Default Encourage Audio';
  encourageAudioSelect.appendChild(defaultOption);

  customAudioList.forEach((audioItem) => {
    const option = document.createElement('option');
    option.value = audioItem.id;
    option.textContent = audioItem.name;
    encourageAudioSelect.appendChild(option);
  });

  const availableIds = [DEFAULT_ENCOURAGE_AUDIO_KEY, ...customAudioList.map((item) => item.id)];
  encourageAudioSelect.value = availableIds.includes(selectedId) ? selectedId : DEFAULT_ENCOURAGE_AUDIO_KEY;
}

function switchSettingsPanel(panelKey = 'basic') {
  currentSettingsPanel = panelKey;

  settingsTabs.forEach((tab) => {
    const isActive = tab.dataset.settingsTab === panelKey;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  settingsPanels.forEach((panel) => {
    const isActive = panel.dataset.settingsPanel === panelKey;
    panel.classList.toggle('is-active', isActive);
    panel.hidden = !isActive;
  });
}

function bindSettingsTabs() {
  settingsTabs.forEach((tab) => {
    if (tab.dataset.bound === 'true') return;
    tab.addEventListener('click', () => {
      switchSettingsPanel(tab.dataset.settingsTab || 'basic');
    });
    tab.dataset.bound = 'true';
  });
}

function updateRecordingStatus(text) {
  if (recordingStatus) recordingStatus.textContent = text;
}

function updateRecordingTimer(elapsedMs) {
  if (!recordingTimer) return;
  const seconds = Math.min(RECORD_MAX_DURATION_MS, elapsedMs) / 1000;
  recordingTimer.textContent = `${seconds.toFixed(1)}s / 10.0s`;
}

function cleanupRecordingTimers() {
  if (recordingTimerInterval) {
    clearInterval(recordingTimerInterval);
    recordingTimerInterval = null;
  }
  if (recordingStopTimeout) {
    clearTimeout(recordingStopTimeout);
    recordingStopTimeout = null;
  }
}

function resetRecordingUi() {
  if (recordHoldBtn) {
    recordHoldBtn.classList.remove('is-recording');
    recordHoldBtn.disabled = false;
  }
  updateRecordingTimer(0);
}

function stopMediaStreamTracks() {
  if (mediaRecorder && mediaRecorder.stream) {
    mediaRecorder.stream.getTracks().forEach((track) => track.stop());
  }
}

function getSupportedAudioMimeType() {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return '';
  }

  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function openRecordConfirmModal() {
  isRecordConfirmOpen = true;
  modalOverlay.style.display = 'block';
  if (settingsModal) settingsModal.style.display = 'none';
  if (recordConfirmModal) recordConfirmModal.style.display = 'block';
  if (recordNameInput) {
    recordNameInput.value = '';
    recordNameInput.focus();
  }
  if (recordConfirmError) recordConfirmError.textContent = '';
}

function closeRecordConfirmModal(restoreSettings = true) {
  isRecordConfirmOpen = false;
  if (recordConfirmModal) recordConfirmModal.style.display = 'none';
  if (recordConfirmError) recordConfirmError.textContent = '';
  if (recordNameInput) recordNameInput.value = '';
  pendingRecordedAudio = null;

  if (restoreSettings) {
    modalOverlay.style.display = 'block';
    if (settingsModal) settingsModal.style.display = 'block';
  } else if (!isModalOpen) {
    modalOverlay.style.display = 'none';
  }
}

async function handleRecordedAudioReady() {
  if (!recordingChunks.length) {
    updateRecordingStatus('No audio captured. Please try again.');
    return;
  }

  try {
    const blob = new Blob(recordingChunks, {
      type: mediaRecorder && mediaRecorder.mimeType ? mediaRecorder.mimeType : 'audio/webm'
    });
    const dataUrl = await blobToDataUrl(blob);
    pendingRecordedAudio = {
      dataUrl,
      mimeType: blob.type || 'audio/webm'
    };
    updateRecordingStatus('Recording finished. Please confirm whether to save it.');
    openRecordConfirmModal();
  } catch (error) {
    console.error('Failed to prepare recorded audio:', error);
    updateRecordingStatus('Audio processing failed. Please try again.');
  }
}

function stopRecording(finalStatusText = 'Recording finished.') {
  if (!isRecording || !mediaRecorder) return;

  isRecording = false;
  cleanupRecordingTimers();
  if (recordHoldBtn) recordHoldBtn.classList.remove('is-recording');
  updateRecordingStatus(finalStatusText);

  if (mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
}

async function startRecording() {
  if (isRecording || !recordHoldBtn) return;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
    updateRecordingStatus('Recording is not supported on this device.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = getSupportedAudioMimeType();
    mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    recordingChunks = [];
    recordingStartAt = Date.now();
    isRecording = true;

    mediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data && event.data.size > 0) {
        recordingChunks.push(event.data);
      }
    });

    mediaRecorder.addEventListener('stop', async () => {
      stopMediaStreamTracks();
      resetRecordingUi();
      await handleRecordedAudioReady();
    }, { once: true });

    mediaRecorder.addEventListener('error', (event) => {
      console.error('MediaRecorder error:', event.error);
      stopMediaStreamTracks();
      cleanupRecordingTimers();
      resetRecordingUi();
      updateRecordingStatus('Recording failed. Please try again.');
      isRecording = false;
    }, { once: true });

    mediaRecorder.start();
    recordHoldBtn.classList.add('is-recording');
    updateRecordingStatus('Recording... release to stop.');
    updateRecordingTimer(0);

    recordingTimerInterval = setInterval(() => {
      updateRecordingTimer(Date.now() - recordingStartAt);
    }, 100);

    recordingStopTimeout = setTimeout(() => {
      stopRecording('Recording finished automatically after 10 seconds.');
    }, RECORD_MAX_DURATION_MS);
  } catch (error) {
    console.error('Unable to start recording:', error);
    updateRecordingStatus('Microphone permission denied or unavailable.');
    resetRecordingUi();
  }
}

function savePendingRecordedAudio() {
  if (!pendingRecordedAudio) return;

  const audioName = recordNameInput ? recordNameInput.value.trim() : '';
  if (!audioName) {
    if (recordConfirmError) recordConfirmError.textContent = 'Please enter a name for this audio.';
    return;
  }

  const savedAudio = Storage.addCustomEncourageAudio({
    name: audioName,
    mimeType: pendingRecordedAudio.mimeType,
    dataUrl: pendingRecordedAudio.dataUrl
  });

  if (!savedAudio) {
    if (recordConfirmError) {
      recordConfirmError.textContent = 'Save failed. Local storage may be full.';
    }
    return;
  }

  const settings = Storage.getSettings();
  settings.encourageAudioSelection = savedAudio.id;
  Storage.saveSettings(settings);

  populateEncourageAudioSelect(savedAudio.id);
  closeRecordConfirmModal(true);
  updateRecordingStatus(`Saved "${savedAudio.name}" and set as current encourage audio.`);
}

function discardPendingRecordedAudio() {
  closeRecordConfirmModal(true);
  updateRecordingStatus('Recording discarded.');
}

function handleRecordHoldStart(event) {
  if (event) event.preventDefault();
  startRecording();
}

function handleRecordHoldEnd(event) {
  if (event) event.preventDefault();
  if (isRecording) {
    stopRecording('Recording finished.');
  }
}

function setupRecordHoldEvents() {
  if (!recordHoldBtn || recordHoldBtn.dataset.bound === 'true') return;

  const hasPointerEvents = 'PointerEvent' in window;
  const startEvents = hasPointerEvents ? ['pointerdown'] : ['mousedown', 'touchstart'];
  const endEvents = hasPointerEvents
    ? ['pointerup', 'pointercancel', 'pointerleave']
    : ['mouseup', 'mouseleave', 'touchend', 'touchcancel'];

  startEvents.forEach((eventName) => {
    recordHoldBtn.addEventListener(eventName, handleRecordHoldStart);
  });

  endEvents.forEach((eventName) => {
    recordHoldBtn.addEventListener(eventName, handleRecordHoldEnd);
  });

  recordHoldBtn.dataset.bound = 'true';
}

// ==========================
// Controls
// ==========================
backBtn.addEventListener('click', () => {
  finalizeRun(false);
  setTimeout(() => {
    window.location.href = 'home.html';
  }, STOP_ANIM_DURATION);
});

startBtn.addEventListener('click', () => {
  if (!isRunning) {
    startGame();
  } else if (!isPaused) {
    pauseGame();
  } else {
    resumeGame();
  }
});

endBtn.addEventListener('click', () => finalizeRun(true));

// ==========================
// Location Tracking
// ==========================
function startLocationWatch() {
  if (!navigator.geolocation) {
    enableSimulatedRouteMode('Geolocation is not supported. Using simulated route from the default map.');
    return;
  }

  if (watchId !== null) return;

  watchId = navigator.geolocation.watchPosition(
    onPositionUpdate,
    onPositionError,
    {
      enableHighAccuracy: true,
      maximumAge: 1500,
      timeout: 10000
    }
  );

  mapStatusEl.textContent = 'Locating...';
}

function stopLocationWatch() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}

function onPositionUpdate(position) {
  if (isUsingSimulatedRoute) {
    stopSimulatedRouteTracking();
    isUsingSimulatedRoute = false;
  }

  const { latitude, longitude, accuracy, speed } = position.coords;
  const point = [latitude, longitude];
  currentPosition = { lat: latitude, lng: longitude, timestamp: position.timestamp };
  syncMapToPoint(point, 17);

  if (isRunning && !isPaused && !isModalOpen && !isWarningOpen && !isInfoOpen) {
    appendRoutePoint(point, position.timestamp);
  }

  if (typeof speed === 'number' && speed >= 0) {
    latestSpeedKmh = speed * 3.6;
  }

  updateRunnerScreenPosition();
    mapStatusEl.textContent = `GPS ready (accuracy ~${Math.round(accuracy)}m)`;
}

function onPositionError(err) {
  if (err && err.code === 1) {
    enableSimulatedRouteMode('Location permission denied. Using simulated route from the default map.');
    return;
  }

  mapStatusEl.textContent = `Location error: ${err.message}`;
}

function appendRoutePoint(point, timestamp) {
  const newPoint = { lat: point[0], lng: point[1], timestamp };

  if (routePoints.length > 0) {
    const prev = routePoints[routePoints.length - 1];
    const segment = haversineMeters(prev.lat, prev.lng, newPoint.lat, newPoint.lng);

    // Filter noise / jumps
    if (segment > 0.8 && segment < 120) {
      totalDistanceMeters += segment;
      routePoints.push(newPoint);
      if (routeLine) routeLine.addLatLng(point);
      avgSpeedSamples.push(estimateSegmentSpeed(segment, newPoint.timestamp - prev.timestamp));
    }
  } else {
    routePoints.push(newPoint);
    if (routeLine) routeLine.addLatLng(point);
  }

  latestHeartRate = Math.floor(Math.random() * (152 - 114 + 1)) + 114;
  checkMilestonesAndWarnings();
  updateDisplayedMetrics();
}

function estimateSegmentSpeed(distanceMeters, elapsedMs) {
  if (!elapsedMs || elapsedMs <= 0) return 0;
  return (distanceMeters / elapsedMs) * 3600;
}

function haversineMeters(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function enableSimulatedRouteMode(statusMessage) {
  isUsingSimulatedRoute = true;
  stopLocationWatch();
  stopSimulatedRouteTracking();
  resetSimulatedPosition();

  currentPosition = { ...simulatedPosition };
  syncMapToPoint([simulatedPosition.lat, simulatedPosition.lng], map && typeof map.getZoom === 'function' ? map.getZoom() : 15);
  updateRunnerScreenPosition();

  mapStatusEl.textContent = statusMessage || 'Using simulated route from the default map.';

  if (isRunning && !isPaused) {
    startSimulatedRouteTracking();
  }
}

function resetSimulatedPosition() {
  simulatedPosition = {
    lat: DEFAULT_MAP_CENTER[0],
    lng: DEFAULT_MAP_CENTER[1],
    timestamp: Date.now()
  };
  simulatedHeadingDeg = Math.random() * 360;
}

function startSimulatedRouteTracking() {
  if (!isUsingSimulatedRoute) return;

  if (!simulatedPosition) {
    resetSimulatedPosition();
  }

  if (routePoints.length === 0) {
    appendRoutePoint([simulatedPosition.lat, simulatedPosition.lng], Date.now());
  }

  if (simulationInterval !== null) return;

  mapStatusEl.textContent = 'Location unavailable. Simulating movement from the default map.';
  simulationInterval = setInterval(() => {
    if (!isRunning || isPaused || isModalOpen || isWarningOpen || isInfoOpen) return;
    advanceSimulatedRoute();
  }, SIMULATION_STEP_INTERVAL_MS);
}

function stopSimulatedRouteTracking() {
  if (simulationInterval !== null) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
}

function advanceSimulatedRoute() {
  if (!simulatedPosition) {
    resetSimulatedPosition();
  }

  const nextPoint = getNextSimulatedPosition();
  const previousPoint = simulatedPosition;
  const segmentDistance = haversineMeters(previousPoint.lat, previousPoint.lng, nextPoint.lat, nextPoint.lng);
  const elapsedMs = Math.max(1, nextPoint.timestamp - previousPoint.timestamp);

  simulatedPosition = nextPoint;
  currentPosition = { ...nextPoint };
  latestSpeedKmh = estimateSegmentSpeed(segmentDistance, elapsedMs);
  syncMapToPoint([nextPoint.lat, nextPoint.lng], map && typeof map.getZoom === 'function' ? map.getZoom() : 15);
  updateRunnerScreenPosition();

  appendRoutePoint([nextPoint.lat, nextPoint.lng], nextPoint.timestamp);
  mapStatusEl.textContent = 'Location unavailable. Simulating movement from the default map.';
}

function getNextSimulatedPosition() {
  const distanceFromCenter = haversineMeters(
    simulatedPosition.lat,
    simulatedPosition.lng,
    DEFAULT_MAP_CENTER[0],
    DEFAULT_MAP_CENTER[1]
  );

  if (distanceFromCenter > SIMULATION_MAX_RADIUS_METERS * 0.7) {
    const centerBearing = getBearingDegrees(
      simulatedPosition.lat,
      simulatedPosition.lng,
      DEFAULT_MAP_CENTER[0],
      DEFAULT_MAP_CENTER[1]
    );
    simulatedHeadingDeg = blendBearing(simulatedHeadingDeg, centerBearing, 0.7);
  }

  simulatedHeadingDeg = normalizeBearing(simulatedHeadingDeg + randomBetween(-28, 28));

  const stepMeters = randomBetween(SIMULATION_MIN_STEP_METERS, SIMULATION_MAX_STEP_METERS);
  const nextCoords = projectPoint(simulatedPosition.lat, simulatedPosition.lng, simulatedHeadingDeg, stepMeters);

  return {
    ...nextCoords,
    timestamp: Date.now()
  };
}

function projectPoint(lat, lng, bearingDeg, distanceMeters) {
  const radius = 6371000;
  const bearing = (bearingDeg * Math.PI) / 180;
  const angularDistance = distanceMeters / radius;
  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
    Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
  );
  const lng2 = lng1 + Math.atan2(
    Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
    Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
  );

  return {
    lat: (lat2 * 180) / Math.PI,
    lng: (lng2 * 180) / Math.PI
  };
}

function getBearingDegrees(lat1, lng1, lat2, lng2) {
  const startLat = (lat1 * Math.PI) / 180;
  const startLng = (lng1 * Math.PI) / 180;
  const endLat = (lat2 * Math.PI) / 180;
  const endLng = (lng2 * Math.PI) / 180;
  const y = Math.sin(endLng - startLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);

  return normalizeBearing((Math.atan2(y, x) * 180) / Math.PI);
}

function normalizeBearing(bearing) {
  return (bearing % 360 + 360) % 360;
}

function blendBearing(from, to, weight) {
  const delta = ((to - from + 540) % 360) - 180;
  return normalizeBearing(from + delta * weight);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// ==========================
// Run Lifecycle
// ==========================
function startGame() {
  totalDistanceMeters = 0;
  latestSpeedKmh = 0;
  latestHeartRate = 0;
  avgSpeedSamples = [];
  distanceMilestone = 0;
  pausedElapsed = 0;
  routePoints = [];
  if (routeLine) routeLine.setLatLngs([]);

  if (isUsingSimulatedRoute) {
    stopSimulatedRouteTracking();
    resetSimulatedPosition();
    currentPosition = { ...simulatedPosition };
    syncMapToPoint([simulatedPosition.lat, simulatedPosition.lng], map && typeof map.getZoom === 'function' ? map.getZoom() : 15);
    updateRunnerScreenPosition();
  }

  isRunning = true;
  isPaused = false;
  startBtn.textContent = 'Pause';
  setRunnerAnimation(true);

  startTime = Date.now() - pausedElapsed;

  if (!timerInterval) {
    timerInterval = setInterval(updateTimer, 100);
  }
  if (!statsInterval) {
    statsInterval = setInterval(updateStats, 5000);
  }

  playBackgroundMusic();
  startEncourageInterval();
  startCoinsInterval();

  seedInitialRoutePoint();

  if (isUsingSimulatedRoute) {
    startSimulatedRouteTracking();
  }
}

function seedInitialRoutePoint() {
  if (routePoints.length > 0 || !currentPosition) return;

  appendRoutePoint(
    [currentPosition.lat, currentPosition.lng],
    currentPosition.timestamp || Date.now()
  );
}

function pauseGame() {
  isPaused = true;
  pausedElapsed = Date.now() - startTime;
  startBtn.textContent = 'Resume';
  setRunnerAnimation(false);

  clearIntervals();
  stopEncourageInterval();

  const bgMusic = document.getElementById('bgMusic');
  if (bgMusic) bgMusic.pause();
}

function resumeGame() {
  isPaused = false;
  startBtn.textContent = 'Pause';
  setRunnerAnimation(true);
  startTime = Date.now() - pausedElapsed;

  timerInterval = setInterval(updateTimer, 100);
  statsInterval = setInterval(updateStats, 5000);

  playBackgroundMusic();
  startEncourageInterval();
  startCoinsInterval();
}

function finalizeRun(goToSettling = true) {
  if (!isRunning && routePoints.length === 0) {
    if (goToSettling) window.location.href = NEXT_PAGE_URL;
    return;
  }

  const wasPaused = isPaused;
  isRunning = false;
  isPaused = true;
  startBtn.textContent = 'Start';
  setRunnerAnimation(false);

  clearIntervals();
  stopLocationWatch();
  stopSimulatedRouteTracking();
  stopBackgroundMusic();
  stopEncourageInterval();

  if (isWarningOpen) closeWarningModal();
  if (isInfoOpen) closeInfoModal();

  const elapsed = wasPaused ? pausedElapsed : Math.max(0, Date.now() - startTime);
  const distanceMeters = totalDistanceMeters;
  const caloriesBurned = calculateCalories(distanceMeters, elapsed);

  const baseCoins = 1;
  const distanceCoins = Math.floor(distanceMeters / 100);
  const caloriesCoins = Math.floor(caloriesBurned / 10);
  const coinsEarned = baseCoins + distanceCoins + caloriesCoins;

  const avgSpeedKmh = getAverageSpeedKmh();

  Storage.recordRun(distanceMeters, elapsed, avgSpeedKmh);
  Storage.addCoins(coinsEarned);
  Storage.addDistance(distanceMeters);
  Storage.addCalories(caloriesBurned);

  const historyRecord = Storage.addRunToHistory({
    distance: distanceMeters,
    time: elapsed,
    speedKmh: avgSpeedKmh,
    pace: avgSpeedKmh,
    coinsEarned,
    avgHeartRate: latestHeartRate,
    calories: caloriesBurned,
    routePoints: routePoints.map((point) => ({
      lat: point.lat,
      lng: point.lng,
      timestamp: point.timestamp
    }))
  });

  Storage.updateLastSession({
    historyRecordId: historyRecord.id,
    distance: distanceMeters,
    time: elapsed,
    speedKmh: avgSpeedKmh,
    pace: avgSpeedKmh,
    coinsEarned,
    calories: caloriesBurned,
    routePoints: routePoints.map((point) => ({
      lat: point.lat,
      lng: point.lng,
      timestamp: point.timestamp
    }))
  });

  if (goToSettling) {
    setTimeout(() => {
      window.location.href = NEXT_PAGE_URL;
    }, STOP_ANIM_DURATION);
  }
}

function setRunnerAnimation(isRun) {
  const runnerEl = document.getElementById('runner');
  if (!runnerEl) return;
  runnerEl.classList.toggle('is-running', isRun);
  runnerEl.src = isRun ? 'images/running.gif' : 'images/runner_stand.png';
}

function syncMapToPoint(point, zoom = 17) {
  if (!map) return;

  if (!hasCenteredOnUser) {
    const initialCenter = getCenterForPoint(point, zoom);
    map.setView(initialCenter, zoom, {
      animate: false
    });
    hasCenteredOnUser = true;
    updateRunnerScreenPosition();
    return;
  }

  if (!isMapBeingDragged) {
    const nextCenter = getCenterForPoint(point);
    map.panTo(nextCenter, {
      animate: true,
      duration: 0.8
    });
  }

  if (typeof map.getZoom === 'function' && map.getZoom() !== zoom) {
    map.setZoom(zoom, { animate: true });
  }

  updateRunnerScreenPosition();
}

function getFollowTargetContainerPoint() {
  if (!map || !isWatchLayout) return null;

  const mapContainer = map.getContainer ? map.getContainer() : null;
  if (!mapContainer) return null;

  return L.point(
    mapContainer.clientWidth / 2,
    mapContainer.clientHeight * WATCH_RUNNER_ANCHOR_Y_RATIO
  );
}

function getCenterForPoint(point, zoomOverride = null) {
  if (!map || typeof map.project !== 'function' || typeof map.unproject !== 'function') {
    return point;
  }

  const targetPoint = getFollowTargetContainerPoint();
  if (!targetPoint) return point;

  const zoom = zoomOverride ?? (typeof map.getZoom === 'function' ? map.getZoom() : 17);
  const pointAsLatLng = L.latLng(point[0], point[1]);
  const projectedPoint = map.project(pointAsLatLng, zoom);
  const mapContainer = map.getContainer();
  const centerOffset = L.point(
    targetPoint.x - mapContainer.clientWidth / 2,
    targetPoint.y - mapContainer.clientHeight / 2
  );
  const nextCenterPoint = projectedPoint.subtract(centerOffset);
  const nextCenterLatLng = map.unproject(nextCenterPoint, zoom);

  return [nextCenterLatLng.lat, nextCenterLatLng.lng];
}

function updateRunnerScreenPosition() {
  const runnerEl = document.getElementById('runner');
  if (!runnerEl || !map || !currentPosition || typeof map.latLngToContainerPoint !== 'function') return;

  const point = map.latLngToContainerPoint([currentPosition.lat, currentPosition.lng]);
  const mapContainer = map.getContainer ? map.getContainer() : null;
  if (!mapContainer) return;

  const runnerWidth = runnerEl.offsetWidth || 38;
  const runnerHeight = runnerEl.offsetHeight || 38;
  const minX = runnerWidth / 2;
  const minY = runnerHeight / 2;
  const maxX = mapContainer.clientWidth - runnerWidth / 2;
  const maxY = mapContainer.clientHeight - runnerHeight / 2;
  const clampedX = Math.min(Math.max(point.x, minX), maxX);
  const clampedY = Math.min(Math.max(point.y, minY), maxY);

  runnerEl.style.left = `${clampedX}px`;
  runnerEl.style.top = `${clampedY}px`;
}

function isFollowingCurrentPosition() {
  if (!map || !currentPosition || typeof map.getCenter !== 'function') return false;

  const center = map.getCenter();
  return haversineMeters(center.lat, center.lng, currentPosition.lat, currentPosition.lng) < 10;
}

function scheduleRecenterIfNeeded() {
  if (!currentPosition || !map || isMapBeingDragged) return;
  if (isFollowingCurrentPosition()) return;

  clearRecenterTimer();
  recenterTimer = setTimeout(() => {
    if (!currentPosition || !map || isMapBeingDragged) return;
    syncMapToPoint([currentPosition.lat, currentPosition.lng], map.getZoom ? map.getZoom() : 17);
  }, 1400);
}

function clearRecenterTimer() {
  if (recenterTimer) {
    clearTimeout(recenterTimer);
    recenterTimer = null;
  }
}

function clearIntervals() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  if (statsInterval) {
    clearInterval(statsInterval);
    statsInterval = null;
  }
}

// ==========================
// Metrics / Stats
// ==========================
function updateTimer() {
  const elapsed = Math.max(0, Date.now() - startTime);
  const ms = Math.floor((elapsed % 1000) / 10);
  const sec = Math.floor((elapsed / 1000) % 60);
  const min = Math.floor((elapsed / 60000) % 60);
  statTimeEl.textContent = `Time: ${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
}

function getAverageSpeedKmh() {
  if (avgSpeedSamples.length > 0) {
    const sum = avgSpeedSamples.reduce((a, b) => a + b, 0);
    return sum / avgSpeedSamples.length;
  }

  if (latestSpeedKmh > 0) return latestSpeedKmh;

  const elapsedHours = Math.max(1, Date.now() - startTime) / 3600000;
  return totalDistanceMeters / 1000 / elapsedHours;
}

function getCurrentElapsedMs() {
  if (isRunning) {
    return isPaused ? pausedElapsed : Math.max(0, Date.now() - startTime);
  }

  return pausedElapsed;
}

function calculateCalories(distanceMeters, elapsedMs) {
  if (elapsedMs <= 0) return 0;

  const speedKmh = getAverageSpeedKmh();
  let met;

  if (speedKmh < 6) met = 6;
  else if (speedKmh < 8) met = 7;
  else if (speedKmh < 10) met = 8.5;
  else if (speedKmh < 12) met = 10;
  else met = 12;

  const hours = elapsedMs / 3600000;
  return Math.round(met * DEFAULT_WEIGHT_KG * hours);
}

function updateDisplayedMetrics() {
  const speedKmh = getAverageSpeedKmh();
  const calories = calculateCalories(totalDistanceMeters, getCurrentElapsedMs());
  const distanceKm = totalDistanceMeters / 1000;

  statSpeedEl.textContent = `Speed: ${speedKmh.toFixed(1)} km/h`;
  statDistanceEl.textContent = `Distance: ${distanceKm.toFixed(2)} km`;
  statHeartRateEl.textContent = `Heart rate: ${latestHeartRate || 0} bpm`;
  statCaloriesEl.textContent = calories;
}

function updateStats() {
  if (!isRunning || isPaused) return;

  latestHeartRate = Math.floor(Math.random() * (152 - 114 + 1)) + 114;
  updateDisplayedMetrics();
  checkMilestonesAndWarnings();
}

function checkMilestonesAndWarnings() {
  const speedKmh = getAverageSpeedKmh();
  const currentMilestone = Math.floor(totalDistanceMeters / 1000);

  if (currentMilestone > distanceMilestone && !isInfoOpen && !isWarningOpen) {
    distanceMilestone = currentMilestone;
    showInfoModal();
  }

  if (minSpeedLimit !== null && !isWarningOpen && !isInfoOpen) {
    if (speedKmh < minSpeedLimit) {
      showWarningModal(true);
    }
  }

  if (maxHeartRateLimit !== null && !isWarningOpen && !isInfoOpen) {
    if (latestHeartRate > maxHeartRateLimit) {
      showWarningModal(false);
    }
  }

  if (isWarningOpen && !isInfoOpen) {
    if (isWarningForSpeed && minSpeedLimit !== null && speedKmh >= minSpeedLimit) {
      closeWarningModal();
    } else if (!isWarningForSpeed && maxHeartRateLimit !== null && latestHeartRate <= maxHeartRateLimit) {
      closeWarningModal();
    }
  }
}

function updateStatsDisplay(stats) {
  const totalCoinsEl = document.getElementById('totalCoins');
  const totalDistanceEl = document.getElementById('totalDistance');
  const totalRunsEl = document.getElementById('totalRuns');

  if (totalCoinsEl && stats.totalCoins !== undefined) {
    totalCoinsEl.textContent = stats.totalCoins;
  }
  if (totalDistanceEl && stats.totalDistance !== undefined) {
    totalDistanceEl.textContent = `${(stats.totalDistance / 1000).toFixed(2)} km`;
  }
  if (totalRunsEl && stats.totalRuns !== undefined) {
    totalRunsEl.textContent = stats.totalRuns;
  }
}

// ==========================
// Modals
// ==========================
function pauseForModal() {
  clearIntervals();
}

function resumeFromModal() {
  if (isRunning && !isPaused) {
    timerInterval = setInterval(updateTimer, 100);
    statsInterval = setInterval(updateStats, 5000);
  }
}

function openSettingModal() {
  isModalOpen = true;
  modalOverlay.style.display = 'block';
  settingsModal.style.display = 'block';
  pauseForModal();
  switchSettingsPanel('basic');

  const savedSettings = Storage.getSettings();
  const speedInput = document.getElementById('speedInput');
  const maxHrInput = document.getElementById('maxHrInput');
  const musicSelect = document.getElementById('musicSelect');

  if (speedInput) speedInput.value = savedSettings.minSpeed || '';
  if (maxHrInput) maxHrInput.value = savedSettings.maxHeartRate || '';
  if (musicSelect) {
    musicSelect.value = MUSIC_LABEL_TO_VALUE[savedSettings.musicSelection] || savedSettings.musicSelection || 'audio/faded.mp3';
  }
  populateEncourageAudioSelect(savedSettings.encourageAudioSelection || DEFAULT_ENCOURAGE_AUDIO_KEY);
}

function closeSettingModal() {
  if (isRecordConfirmOpen) {
    closeRecordConfirmModal(false);
  }

  isModalOpen = false;
  modalOverlay.style.display = 'none';
  settingsModal.style.display = 'none';

  const speedInput = document.getElementById('speedInput');
  const maxHrInput = document.getElementById('maxHrInput');
  const musicSelect = document.getElementById('musicSelect');

  const inputVal = parseFloat(speedInput.value);
  minSpeedLimit = !Number.isNaN(inputVal) && inputVal > 0 ? inputVal : null;

  const hrInputVal = parseFloat(maxHrInput.value);
  maxHeartRateLimit = !Number.isNaN(hrInputVal) && hrInputVal > 0 ? hrInputVal : null;

  const settings = Storage.getSettings();
  settings.minSpeed = minSpeedLimit;
  settings.maxHeartRate = maxHeartRateLimit;

  if (musicSelect) {
    const label = MUSIC_VALUE_TO_LABEL[musicSelect.value] || musicSelect.value;
    settings.musicSelection = label;
    updateBackgroundMusic(label);
  }

  if (encourageAudioSelect) {
    settings.encourageAudioSelection = encourageAudioSelect.value || DEFAULT_ENCOURAGE_AUDIO_KEY;
  }

  Storage.saveSettings(settings);
  resumeFromModal();
}

function showWarningModal(forSpeed = true) {
  if (isPaused || !isRunning || isWarningOpen) return;

  isWarningOpen = true;
  isWarningForSpeed = forSpeed;

  modalOverlay.style.display = 'block';
  warningModal.style.display = 'block';
  warningSpeaker.style.display = 'block';

  const warningTitle = document.getElementById('warningTitle');
  const warningText = document.getElementById('warningText');

  if (forSpeed) {
    warningTitle.textContent = 'Warning';
    warningText.innerHTML = 'your speed is too low!<br>Pay attention to your exercise intensity.';
  } else {
    warningTitle.textContent = 'Heart Rate Alert';
    warningText.innerHTML = 'your heart rate is too high!<br>Please slow down to stay safe.';
  }

  pauseForModal();
}

function closeWarningModal() {
  if (!isWarningOpen) return;

  isWarningOpen = false;
  isWarningForSpeed = false;

  modalOverlay.style.display = 'none';
  warningModal.style.display = 'none';
  warningSpeaker.style.display = 'none';

  resumeFromModal();
}

function showInfoModal() {
  if (isPaused || !isRunning || isInfoOpen) return;

  isInfoOpen = true;
  modalOverlay.style.display = 'block';
  infoModal.style.display = 'block';

  pauseForModal();

  setTimeout(() => {
    closeInfoModal();
  }, 5000);
}

function closeInfoModal() {
  if (!isInfoOpen) return;

  isInfoOpen = false;
  modalOverlay.style.display = 'none';
  infoModal.style.display = 'none';

  resumeFromModal();
}

settingBtn.addEventListener('click', openSettingModal);
modalClose.addEventListener('click', closeSettingModal);
warningClose.addEventListener('click', closeWarningModal);
infoClose.addEventListener('click', closeInfoModal);

if (recordConfirmBtn) {
  recordConfirmBtn.addEventListener('click', savePendingRecordedAudio);
}

if (recordRejectBtn) {
  recordRejectBtn.addEventListener('click', discardPendingRecordedAudio);
}

const musicSelect = document.getElementById('musicSelect');
if (musicSelect) {
  musicSelect.addEventListener('change', (event) => {
    const label = MUSIC_VALUE_TO_LABEL[event.target.value] || event.target.value;
    const settings = Storage.getSettings();
    settings.musicSelection = label;
    Storage.saveSettings(settings);
    updateBackgroundMusic(label);
  });
}

if (encourageAudioSelect) {
  encourageAudioSelect.addEventListener('change', (event) => {
    const settings = Storage.getSettings();
    settings.encourageAudioSelection = event.target.value || DEFAULT_ENCOURAGE_AUDIO_KEY;
    Storage.saveSettings(settings);
  });
}
