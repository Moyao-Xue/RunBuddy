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
    LAST_SESSION: 'runbuddy_last_session'
  },

  // Default values
  DEFAULTS: {
    settings: {
      minSpeed: null,
      maxHeartRate: null,
      musicSelection: 'Music 1',
      soundEnabled: true,
      musicVolume: 0.3
    },
    stats: {
      totalCoins: 0,
      totalDistance: 0,
      totalRuns: 0,
      totalTime: 0,
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
      calories: Math.round((runData.distance || 0) * 0.05)
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
