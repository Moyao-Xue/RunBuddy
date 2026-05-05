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
    CUSTOM_ENCOURAGE_AUDIO: 'runbuddy_custom_encourage_audio'
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
      bestPace: 0,
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

  // Get user data with defaults
  getUser() {
    const user = this.get(this.KEYS.USER_DATA);
    return { ...this.DEFAULTS.user, ...user };
  },

  // Save user data
  saveUser(user) {
    return this.set(this.KEYS.USER_DATA, user);
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
  recordRun(distance, time, pace) {
    const stats = this.getStats();
    stats.totalRuns += 1;
    stats.totalTime += time;
    if (pace > stats.bestPace) {
      stats.bestPace = pace;
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
    localStorage.removeItem(this.KEYS.REPORT_PREVIEW);
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
    return history || [];
  },

  // Add a new run record to history
  addRunToHistory(runData) {
    const history = this.getRunHistory();
    
    const newRecord = {
      id: Date.now(),
      timestamp: Date.now(),
      distance: runData.distance || 0,
      time: runData.time || 0,
      pace: runData.pace || 0,
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

    if ((stats.bestPace || 0) <= (record.pace || 0)) {
      stats.bestPace = filtered.reduce((max, item) => Math.max(max, item.pace || 0), 0);
    }

    if (stats.totalTime !== undefined) {
      stats.totalTime = Math.max(0, (stats.totalTime || 0) - (record.time || 0));
    }

    this.saveStats(stats);

    const lastSession = this.getLastSession();
    if (lastSession && lastSession.historyRecordId === recordId) {
      localStorage.removeItem(this.KEYS.LAST_SESSION);
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
      localStorage.removeItem(key);
    });
  }
};

// Make Storage globally available
window.Storage = Storage;
