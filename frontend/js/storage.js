/**
 * LocalStorage Utility Module for RunBuddy
 * Handles persistent data storage for user settings, game stats, and preferences
 */

const Storage = {
  // Storage keys
  KEYS: {
    SETTINGS: 'runbuddy_settings',
    STATS: 'runbuddy_stats',
    USER_DATA: 'runbuddy_user',
    RUN_HISTORY: 'runbuddy_run_history',
    TOTAL_COINS: 'runbuddy_total_coins',
    TOTAL_DISTANCE: 'runbuddy_total_distance',
    TOTAL_RUNS: 'runbuddy_total_runs',
    LAST_SESSION: 'runbuddy_last_session',
    TOTAL_CALORIES: 'runbuddy_total_calories',
    REPORT_PREVIEW: 'runbuddy_report_preview',
    CUSTOM_ENCOURAGE_AUDIO: 'runbuddy_custom_encourage_audio',
    OWNED_ITEMS: 'runbuddy_owned_items',
    USER_POSTS: 'runbuddy_posts',
    LOGIN_USER: 'runbuddyUser',
    LOGIN_AUTH_MODE: 'runbuddyAuthMode',
    LOGIN_LOGGED_IN_AT: 'runbuddyLoggedInAt'
  },

  // Default values
  DEFAULTS: {
    settings: {
      minSpeed: null,
      maxHeartRate: null,
      musicSelection: 'Music 1',
      encourageAudioSelection: 'default',
      soundEnabled: true,
      musicVolume: 0.3
    },
    stats: {
      totalCoins: 0,
      totalDistance: 0,
      totalRuns: 0,
      totalTime: 0,
      totalCalories: 0,
      bestPace: 0, // Legacy field name; stores the best average speed in km/h.
      bestDistance: 0
    },
    user: {
      username: 'Runner',
      level: 1,
      experience: 0
    },
    runHistory: []
  },

  // Get parsed JSON from localStorage
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.warn(`Storage.get error for key ${key}:`, e);
      return null;
    }
  },

  // Set JSON value to localStorage
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`Storage.set error for key ${key}:`, e);
      return false;
    }
  },

  // Get raw text from localStorage
  getText(key) {
    try {
      const item = localStorage.getItem(key);
      return item === null ? null : item;
    } catch (e) {
      console.warn(`Storage.getText error for key ${key}:`, e);
      return null;
    }
  },

  // Set raw text to localStorage
  setText(key, value) {
    try {
      if (value === undefined || value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, String(value));
      }
      return true;
    } catch (e) {
      console.warn(`Storage.setText error for key ${key}:`, e);
      return false;
    }
  },

  // Remove a key from localStorage
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn(`Storage.remove error for key ${key}:`, e);
      return false;
    }
  },

  // Get settings with defaults
  getSettings() {
    const settings = this.get(this.KEYS.SETTINGS);
    return { ...this.DEFAULTS.settings, ...settings };
  },

  // Save settings
  saveSettings(settings) {
    return this.set(this.KEYS.SETTINGS, settings);
  },

  // Get stats with defaults
  getStats() {
    const stats = this.get(this.KEYS.STATS);
    return { ...this.DEFAULTS.stats, ...stats };
  },

  // Save stats
  saveStats(stats) {
    return this.set(this.KEYS.STATS, stats);
  },

  // Normalize a run record to its speed value in km/h.
  getRunSpeedKmh(runData) {
    const speedKmh = Number(runData?.speedKmh ?? runData?.pace ?? 0);
    return Number.isFinite(speedKmh) && speedKmh > 0 ? speedKmh : 0;
  },

  // Get user data with defaults
  getUser() {
    const user = this.get(this.KEYS.USER_DATA);
    return { ...this.DEFAULTS.user, ...user };
  },

  // Save user data
  saveUser(user) {
    return this.set(this.KEYS.USER_DATA, user);
  },

  // Get owned item ids
  getOwnedItems() {
    const ownedItems = this.get(this.KEYS.OWNED_ITEMS);
    return Array.isArray(ownedItems) ? ownedItems : [];
  },

  // Save owned item ids
  saveOwnedItems(items) {
    return this.set(this.KEYS.OWNED_ITEMS, Array.isArray(items) ? items : []);
  },

  // Check whether an item id is owned
  isOwnedItem(itemId) {
    const normalizedItemId = String(itemId || '').trim();
    if (!normalizedItemId) {
      return false;
    }

    return this.getOwnedItems().some(item => String(item) === normalizedItemId);
  },

  // Add an item id to the owned list
  addOwnedItem(itemId) {
    const normalizedItemId = String(itemId || '').trim();
    if (!normalizedItemId) {
      return this.getOwnedItems();
    }

    const ownedItems = this.getOwnedItems();
    if (!ownedItems.some(item => String(item) === normalizedItemId)) {
      ownedItems.push(normalizedItemId);
      this.saveOwnedItems(ownedItems);
    }

    return ownedItems;
  },

  // Get community user posts
  getUserPosts() {
    const posts = this.get(this.KEYS.USER_POSTS);
    return Array.isArray(posts) ? posts : [];
  },

  // Save community user posts
  saveUserPosts(posts) {
    return this.set(this.KEYS.USER_POSTS, Array.isArray(posts) ? posts : []);
  },

  // Add a user post to the beginning of the list
  addUserPost(post) {
    const posts = this.getUserPosts();
    posts.unshift(post);
    return this.saveUserPosts(posts) ? post : null;
  },

  // Save login session fields
  saveLoginSession(username, mode) {
    const session = {
      username: String(username || '').trim(),
      mode: String(mode || 'demo').trim() || 'demo',
      loggedInAt: new Date().toISOString()
    };

    this.setText(this.KEYS.LOGIN_USER, session.username);
    this.setText(this.KEYS.LOGIN_AUTH_MODE, session.mode);
    this.setText(this.KEYS.LOGIN_LOGGED_IN_AT, session.loggedInAt);

    return session;
  },

  // Get login session fields
  getLoginSession() {
    const username = this.getText(this.KEYS.LOGIN_USER);
    const mode = this.getText(this.KEYS.LOGIN_AUTH_MODE);
    const loggedInAt = this.getText(this.KEYS.LOGIN_LOGGED_IN_AT);

    if (username === null && mode === null && loggedInAt === null) {
      return null;
    }

    return {
      username: username || '',
      mode: mode || '',
      loggedInAt: loggedInAt || ''
    };
  },

  // Clear login session fields
  clearLoginSession() {
    this.remove(this.KEYS.LOGIN_USER);
    this.remove(this.KEYS.LOGIN_AUTH_MODE);
    this.remove(this.KEYS.LOGIN_LOGGED_IN_AT);
    return true;
  },

  // Add coins
  addCoins(amount) {
    const stats = this.getStats();
    stats.totalCoins += amount;
    this.saveStats(stats);
    return stats.totalCoins;
  },

  // Add distance (in meters)
  addDistance(meters) {
    const stats = this.getStats();
    stats.totalDistance += meters;
    if (meters > stats.bestDistance) {
      stats.bestDistance = meters;
    }
    this.saveStats(stats);
    return stats.totalDistance;
  },

  // Add calories
  addCalories(amount) {
    const stats = this.getStats();
    stats.totalCalories += amount;
    this.saveStats(stats);
    return stats.totalCalories;
  },

  // Record a completed run
  recordRun(distance, time, speedKmh) {
    const stats = this.getStats();
    const normalizedSpeedKmh = Number(speedKmh) || 0;
    stats.totalRuns += 1;
    stats.totalTime += time;
    if (normalizedSpeedKmh > stats.bestPace) {
      stats.bestPace = normalizedSpeedKmh;
    }
    this.saveStats(stats);
    return stats;
  },

  // Update last session info
  updateLastSession(data) {
    const session = {
      ...data,
      timestamp: Date.now()
    };
    return this.set(this.KEYS.LAST_SESSION, session);
  },

  // Get last session
  getLastSession() {
    return this.get(this.KEYS.LAST_SESSION);
  },

  // Save report preview payload
  saveReportPreview(data) {
    return this.set(this.KEYS.REPORT_PREVIEW, data);
  },

  // Get report preview payload
  getReportPreview() {
    return this.get(this.KEYS.REPORT_PREVIEW);
  },

  // Clear report preview payload
  clearReportPreview() {
    this.remove(this.KEYS.REPORT_PREVIEW);
  },

  // ==========================
  // Encourage Audio Management
  // ==========================

  getCustomEncourageAudioList() {
    const list = this.get(this.KEYS.CUSTOM_ENCOURAGE_AUDIO);
    return Array.isArray(list) ? list : [];
  },

  saveCustomEncourageAudioList(list) {
    return this.set(this.KEYS.CUSTOM_ENCOURAGE_AUDIO, Array.isArray(list) ? list : []);
  },

  addCustomEncourageAudio(audioData) {
    const list = this.getCustomEncourageAudioList();
    const newAudio = {
      id: `encourage_${Date.now()}`,
      name: audioData.name || `Encourage ${list.length + 1}`,
      mimeType: audioData.mimeType || 'audio/webm',
      dataUrl: audioData.dataUrl || '',
      createdAt: Date.now()
    };

    list.unshift(newAudio);
    const isSaved = this.saveCustomEncourageAudioList(list);
    return isSaved ? newAudio : null;
  },

  // ==========================
  // Run History Management
  // ==========================

  // Get run history
  getRunHistory() {
    const history = this.get(this.KEYS.RUN_HISTORY);
    return Array.isArray(history) ? history : [];
  },

  // Add a new run record to history
  addRunToHistory(runData) {
    const history = this.getRunHistory();
    const speedKmh = this.getRunSpeedKmh(runData);
    
    const newRecord = {
      id: Date.now(),
      timestamp: Date.now(),
      distance: runData.distance || 0,
      time: runData.time || 0,
      speedKmh,
      pace: speedKmh,
      coinsEarned: runData.coinsEarned || 0,
      avgHeartRate: runData.avgHeartRate || 0,
      calories: runData.calories || 0,
      routePoints: Array.isArray(runData.routePoints)
        ? runData.routePoints.map(point => ({
            lat: point.lat,
            lng: point.lng,
            timestamp: point.timestamp || Date.now()
          }))
        : []
    };
    
    // Add to beginning of array (newest first)
    history.unshift(newRecord);
    
    // Keep only last 100 records
    if (history.length > 100) {
      history.pop();
    }
    
    this.set(this.KEYS.RUN_HISTORY, history);
    return newRecord;
  },

  // Delete a run record from history
  deleteRunFromHistory(recordId) {
    const history = this.getRunHistory();
    const filtered = history.filter(record => record.id !== recordId);
    this.set(this.KEYS.RUN_HISTORY, filtered);
    return filtered;
  },

  // Delete a run record and roll back aggregate stats/last session
  deleteRunCompletely(recordId) {
    const history = this.getRunHistory();
    const record = history.find(item => item.id === recordId);
    if (!record) {
      return false;
    }
    const recordSpeedKmh = this.getRunSpeedKmh(record);

    const filtered = history.filter(item => item.id !== recordId);
    this.set(this.KEYS.RUN_HISTORY, filtered);

    const stats = this.getStats();
    stats.totalRuns = Math.max(0, (stats.totalRuns || 0) - 1);
    stats.totalDistance = Math.max(0, (stats.totalDistance || 0) - (record.distance || 0));
    stats.totalCalories = Math.max(0, (stats.totalCalories || 0) - (record.calories || 0));
    stats.totalCoins = Math.max(0, (stats.totalCoins || 0) - (record.coinsEarned || 0));

    if ((stats.bestDistance || 0) <= (record.distance || 0)) {
      stats.bestDistance = filtered.reduce((max, item) => Math.max(max, item.distance || 0), 0);
    }

    if ((stats.bestPace || 0) <= recordSpeedKmh) {
      stats.bestPace = filtered.reduce((max, item) => Math.max(max, this.getRunSpeedKmh(item)), 0);
    }

    if (stats.totalTime !== undefined) {
      stats.totalTime = Math.max(0, (stats.totalTime || 0) - (record.time || 0));
    }

    this.saveStats(stats);

    const lastSession = this.getLastSession();
    if (lastSession && lastSession.historyRecordId === recordId) {
      this.remove(this.KEYS.LAST_SESSION);
    }

    return true;
  },

  // Clear all history
  clearHistory() {
    return this.set(this.KEYS.RUN_HISTORY, []);
  },

  // Get history by date range
  getHistoryByDateRange(startDate, endDate) {
    const history = this.getRunHistory();
    return history.filter(record => {
      const timestamp = record.timestamp;
      return timestamp >= startDate && timestamp <= endDate;
    });
  },

  // Get history statistics for a specific period
  getHistoryStats(period = 'all') {
    const history = this.getRunHistory();
    let filtered = history;

    const now = Date.now();
    if (period === 'week') {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      filtered = history.filter(r => r.timestamp >= weekAgo);
    } else if (period === 'month') {
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      filtered = history.filter(r => r.timestamp >= monthAgo);
    }

    return {
      count: filtered.length,
      totalDistance: filtered.reduce((sum, r) => sum + r.distance, 0),
      totalTime: filtered.reduce((sum, r) => sum + r.time, 0),
      totalCoins: filtered.reduce((sum, r) => sum + r.coinsEarned, 0)
    };
  },

  // Clear all data (for testing/reset)
  clearAll() {
    Object.values(this.KEYS).forEach(key => {
      this.remove(key);
    });
  }
};

// Make Storage globally available
window.Storage = Storage;

function initShopItemPage(config) {
  const itemId = String(config?.itemId || '').trim();
  const itemPrice = Number(config?.itemPrice) || 0;
  const buyButtonId = config?.buyButtonId || 'buyBtn';
  const coinCountId = config?.coinCountId || 'coinCount';
  const notificationId = config?.notificationId || 'notification';

  if (!itemId || itemPrice <= 0) {
    console.warn('initShopItemPage requires a valid itemId and itemPrice.');
    return;
  }

  function getElement(id) {
    return document.getElementById(id);
  }

  function updateCoinDisplay() {
    const stats = Storage.getStats();
    const coinCountEl = getElement(coinCountId);
    if (coinCountEl) {
      coinCountEl.textContent = stats.totalCoins;
    }
  }

  function isItemOwned() {
    return Storage.isOwnedItem(itemId);
  }

  function showNotification(message) {
    const notif = getElement(notificationId);
    if (!notif) {
      return;
    }

    notif.textContent = message;
    notif.classList.add('show');
    setTimeout(() => {
      notif.classList.remove('show');
    }, 2000);
  }

  function updateBuyButton() {
    const btn = getElement(buyButtonId);
    if (!btn) {
      return;
    }

    if (isItemOwned()) {
      btn.textContent = 'Owned';
      btn.classList.add('owned');
      btn.disabled = true;
      return;
    }

    const stats = Storage.getStats();
    if (stats.totalCoins < itemPrice) {
      btn.textContent = 'Not enough coins';
      btn.disabled = true;
      return;
    }

    btn.textContent = `Buy - ${itemPrice} Coins`;
    btn.disabled = false;
  }

  function purchaseItem() {
    const stats = Storage.getStats();

    if (stats.totalCoins < itemPrice) {
      showNotification('Not enough coins!');
      return false;
    }

    if (isItemOwned()) {
      showNotification('You already own this item!');
      return false;
    }

    stats.totalCoins -= itemPrice;
    Storage.saveStats(stats);
    Storage.addOwnedItem(itemId);

    updateCoinDisplay();
    updateBuyButton();
    showNotification('Purchase successful!');
    return true;
  }

  function bindPage() {
    const buyBtn = getElement(buyButtonId);
    if (!buyBtn || buyBtn.dataset.shopItemBound === 'true') {
      updateCoinDisplay();
      updateBuyButton();
      return;
    }

    buyBtn.dataset.shopItemBound = 'true';
    buyBtn.addEventListener('click', purchaseItem);
    updateCoinDisplay();
    updateBuyButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindPage);
  } else {
    bindPage();
  }
}

window.initShopItemPage = initShopItemPage;
