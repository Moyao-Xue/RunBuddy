const recordsBtn = document.getElementById('recordsBtn');
const activityBtn = document.getElementById('activityBtn');
const historyBtn = document.getElementById('historyBtn');
const runBtn = document.getElementById('runBtn');
const customizeBtn = document.getElementById('customizeBtn');
const settingBtn = document.getElementById('settingBtn');

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
const musicSelect = document.getElementById('musicSelect');
const speedInput = document.getElementById('speedInput');
const maxHrInput = document.getElementById('maxHrInput');
const bgMusic = document.getElementById('bgMusic');

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

let mediaRecorder = null;
let recordingChunks = [];
let recordingTimerInterval = null;
let recordingStopTimeout = null;
let recordingStartAt = 0;
let pendingRecordedAudio = null;
let isRecording = false;
let isRecordConfirmOpen = false;

function navigateTo(url) {
  window.location.href = url;
}

function updateStatsDisplay() {
  const stats = Storage.getStats();
  document.getElementById('totalCoins').textContent = stats.totalCoins || 0;
  document.getElementById('totalRuns').textContent = stats.totalRuns || 0;
  document.getElementById('totalDistance').textContent = `${((stats.totalDistance || 0) / 1000).toFixed(1)}km`;
  document.getElementById('totalCalories').textContent = stats.totalCalories || 0;
}

function switchSettingsPanel(panelKey = 'basic') {
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
  settingsModal.style.display = 'none';
  recordConfirmModal.style.display = 'block';
  if (recordNameInput) {
    recordNameInput.value = '';
    recordNameInput.focus();
  }
  if (recordConfirmError) recordConfirmError.textContent = '';
}

function closeRecordConfirmModal(restoreSettings = true) {
  isRecordConfirmOpen = false;
  recordConfirmModal.style.display = 'none';
  if (recordConfirmError) recordConfirmError.textContent = '';
  if (recordNameInput) recordNameInput.value = '';
  pendingRecordedAudio = null;

  if (restoreSettings) {
    modalOverlay.style.display = 'block';
    settingsModal.style.display = 'block';
  } else {
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
    if (recordConfirmError) recordConfirmError.textContent = 'Save failed. Local storage may be full.';
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
  if (isRecording) stopRecording('Recording finished.');
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

function loadSettingsIntoModal() {
  const savedSettings = Storage.getSettings();
  if (speedInput) speedInput.value = savedSettings.minSpeed || '';
  if (maxHrInput) maxHrInput.value = savedSettings.maxHeartRate || '';
  if (musicSelect) {
    musicSelect.value = MUSIC_LABEL_TO_VALUE[savedSettings.musicSelection] || savedSettings.musicSelection || 'audio/faded.mp3';
  }
  populateEncourageAudioSelect(savedSettings.encourageAudioSelection || DEFAULT_ENCOURAGE_AUDIO_KEY);
}

function updateBackgroundMusicSelection(musicSelection) {
  if (!bgMusic) return;

  const musicPath = MUSIC_LABEL_TO_VALUE[musicSelection] || musicSelection || MUSIC_LABEL_TO_VALUE['Music 1'];
  if (!bgMusic.src.includes(musicPath)) {
    bgMusic.src = musicPath;
    bgMusic.load();
  }
}

function openSettingModal() {
  switchSettingsPanel('basic');
  loadSettingsIntoModal();
  modalOverlay.style.display = 'block';
  settingsModal.style.display = 'block';
}

function closeSettingModal() {
  if (isRecordConfirmOpen) {
    closeRecordConfirmModal(false);
  }

  const settings = Storage.getSettings();
  const inputVal = parseFloat(speedInput.value);
  const hrInputVal = parseFloat(maxHrInput.value);

  settings.minSpeed = !Number.isNaN(inputVal) && inputVal > 0 ? inputVal : null;
  settings.maxHeartRate = !Number.isNaN(hrInputVal) && hrInputVal > 0 ? hrInputVal : null;

  if (musicSelect) {
    const label = MUSIC_VALUE_TO_LABEL[musicSelect.value] || musicSelect.value;
    settings.musicSelection = label;
    updateBackgroundMusicSelection(label);
  }

  if (encourageAudioSelect) {
    settings.encourageAudioSelection = encourageAudioSelect.value || DEFAULT_ENCOURAGE_AUDIO_KEY;
  }

  Storage.saveSettings(settings);
  modalOverlay.style.display = 'none';
  settingsModal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  updateStatsDisplay();
  bindSettingsTabs();
  setupRecordHoldEvents();
  updateRecordingStatus('Ready to record.');
  updateRecordingTimer(0);
  loadSettingsIntoModal();
});

if (recordsBtn) recordsBtn.addEventListener('click', () => navigateTo('iphone17-8.html'));
if (activityBtn) activityBtn.addEventListener('click', () => navigateTo('iphone17-36.html'));
if (historyBtn) historyBtn.addEventListener('click', () => navigateTo('iphone17-62.html'));
if (runBtn) runBtn.addEventListener('click', () => navigateTo('running.html'));
if (customizeBtn) customizeBtn.addEventListener('click', () => navigateTo('customize.html'));
if (settingBtn) settingBtn.addEventListener('click', openSettingModal);
if (modalClose) modalClose.addEventListener('click', closeSettingModal);
if (recordConfirmBtn) recordConfirmBtn.addEventListener('click', savePendingRecordedAudio);
if (recordRejectBtn) recordRejectBtn.addEventListener('click', discardPendingRecordedAudio);

if (musicSelect) {
  musicSelect.addEventListener('change', (event) => {
    const label = MUSIC_VALUE_TO_LABEL[event.target.value] || event.target.value;
    const settings = Storage.getSettings();
    settings.musicSelection = label;
    Storage.saveSettings(settings);
    updateBackgroundMusicSelection(label);
  });
}

if (encourageAudioSelect) {
  encourageAudioSelect.addEventListener('change', (event) => {
    const settings = Storage.getSettings();
    settings.encourageAudioSelection = event.target.value || DEFAULT_ENCOURAGE_AUDIO_KEY;
    Storage.saveSettings(settings);
  });
}
