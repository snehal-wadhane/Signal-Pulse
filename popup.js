// ========================================
// SIGNAL PULSE - POPUP LOGIC
// Intelligent insights and beautiful UX
// ========================================

let focusModeInterval = null;
let settings = {};

// ============ INITIALIZATION ============

document.addEventListener('DOMContentLoaded', async () => {
  await loadStats();
  await loadSettings();
  setupEventListeners();
  
  // Auto-refresh every 10 seconds
  setInterval(loadStats, 10000);
});

// ============ LOAD DATA ============

async function loadStats() {
  try {
    const stats = await chrome.runtime.sendMessage({ action: 'getStats' });
    
    updateFocusScore(stats);
    updateDeepWork(stats);
    updatePattern(stats);
    updateStreak(stats);
    updateTimeBreakdown(stats);
    updateRecentActivity(stats);
    generateInsights(stats);
    
    // Update focus mode banner
    if (stats.focusModeActive) {
      showFocusBanner(stats.focusModeEnd);
    } else {
      hideFocusBanner();
    }
    
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    settings = response.settings || {};
    
    // Update settings UI
    if (document.getElementById('focusDuration')) {
      document.getElementById('focusDuration').value = settings.focusDuration || 5;
      document.getElementById('focusDurationValue').textContent = `${settings.focusDuration || 5} min`;
    }
    
    if (document.getElementById('dailyGoal')) {
      const goalValue = settings.dailyGoal || 0.03;
      document.getElementById('dailyGoal').value = goalValue;
      // Display in minutes if < 1 hour
      if (goalValue < 1) {
        const minutes = Math.round(goalValue * 60);
        document.getElementById('dailyGoalValue').textContent = `${minutes} min`;
      } else {
        document.getElementById('dailyGoalValue').textContent = `${goalValue} hrs`;
      }
    }
    
    if (document.getElementById('nudgesEnabled')) {
      document.getElementById('nudgesEnabled').checked = settings.nudgesEnabled !== false;
    }
    
    if (document.getElementById('soundEnabled')) {
      document.getElementById('soundEnabled').checked = settings.soundEnabled !== false;
    }
    
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// ============ UPDATE UI ============

function updateFocusScore(stats) {
  const scoreEl = document.getElementById('focusScore');
  const progressEl = document.getElementById('focusScoreProgress');
  const messageEl = document.getElementById('scoreMessage');
  
  const score = stats.focusScore || 0;
  scoreEl.textContent = score;
  progressEl.style.width = `${score}%`;
  
  // Determine message
  let message = '';
  if (score >= 80) {
    message = '🎉 Excellent focus!';
  } else if (score >= 60) {
    message = '👍 Good work pattern';
  } else if (score >= 40) {
    message = '📊 Room for improvement';
  } else {
    message = '⚠️ High fragmentation';
  }
  
  messageEl.textContent = message;
}

function updateDeepWork(stats) {
  const timeEl = document.getElementById('deepWorkTime');
  const sessionsEl = document.getElementById('deepWorkSessions');
  const goalEl = document.getElementById('goalProgress');
  
  const hours = (stats.deepWorkTime / (1000 * 60 * 60)).toFixed(1);
  timeEl.textContent = hours;
  
  const sessions = stats.deepWorkSessions || 0;
  sessionsEl.textContent = `${sessions} session${sessions !== 1 ? 's' : ''}`;
  
  // Goal progress
  const goal = settings.dailyGoal || 0.03; // hours
  const progress = Math.min(100, (hours / goal) * 100);
  
  // Show in minutes if goal < 1 hour, otherwise hours
  if (goal < 1) {
    const goalMinutes = Math.round(goal * 60);
    goalEl.textContent = `Goal: ${goalMinutes}min`;
  } else {
    goalEl.textContent = `Goal: ${goal}h`;
  }
  
  if (hours >= goal) {
    goalEl.textContent = `✅ Goal reached!`;
    goalEl.style.color = 'var(--success-start)';
  }
}

function updatePattern(stats) {
  const patternEl = document.getElementById('pattern');
  const switchesEl = document.getElementById('switches');
  
  const pattern = stats.pattern || 'balanced';
  const switches = stats.switches || 0;
  
  let icon = '🔄';
  let text = 'Balanced';
  let className = 'pattern-balanced';
  
  if (pattern === 'fragmented') {
    icon = '⚠️';
    text = 'Fragmented';
    className = 'pattern-fragmented';
  } else if (pattern === 'focused') {
    icon = '🎯';
    text = 'Focused';
    className = 'pattern-focused';
  }
  
  patternEl.innerHTML = `
    <div class="pattern-icon">${icon}</div>
    <div class="pattern-text ${className}">${text}</div>
  `;
  
  switchesEl.textContent = `${switches} switch${switches !== 1 ? 'es' : ''} today`;
}

function updateStreak(stats) {
  const streakEl = document.getElementById('streakDays');
  const days = stats.streakDays || 0;
  
  streakEl.textContent = days;
}

function updateTimeBreakdown(stats) {
  const totalEl = document.getElementById('totalTime');
  const workEl = document.getElementById('workTime');
  const commEl = document.getElementById('commTime');
  const distractEl = document.getElementById('distractTime');
  
  const workBarEl = document.getElementById('workBar');
  const commBarEl = document.getElementById('commBar');
  const distractBarEl = document.getElementById('distractBar');
  
  const total = stats.totalTime || 0;
  const work = stats.workTime || 0;
  const comm = stats.communicationTime || 0;
  const distract = stats.distractionTime || 0;
  
  totalEl.textContent = formatDuration(total);
  workEl.textContent = formatDuration(work);
  commEl.textContent = formatDuration(comm);
  distractEl.textContent = formatDuration(distract);
  
  // Update bars
  if (total > 0) {
    workBarEl.style.width = `${(work / total) * 100}%`;
    commBarEl.style.width = `${(comm / total) * 100}%`;
    distractBarEl.style.width = `${(distract / total) * 100}%`;
  } else {
    workBarEl.style.width = '0%';
    commBarEl.style.width = '0%';
    distractBarEl.style.width = '0%';
  }
}

function updateRecentActivity(stats) {
  const activityEl = document.getElementById('recentActivity');
  const sessions = stats.todaySessions || [];
  
  if (sessions.length === 0) {
    activityEl.innerHTML = `
      <div class="activity-item">
        <div class="activity-icon">💤</div>
        <div class="activity-details">
          <div class="activity-domain">No activity yet</div>
          <div class="activity-time">Start browsing to see stats</div>
        </div>
      </div>
    `;
    return;
  }
  
  // 🔒 PRIVACY-FIRST: Show categories, not domains!
  const recentSessions = sessions.slice(-5).reverse();
  
  activityEl.innerHTML = recentSessions.map(session => {
    const emoji = getCategoryEmoji(session.category);
    const timeAgo = getTimeAgo(session.startTime);
    const duration = formatDuration(session.duration);
    
    // 🔒 PRIVACY: Show category name instead of actual domain
    const categoryName = getCategoryName(session.category);
    
    return `
      <div class="activity-item">
        <div class="activity-icon">${emoji}</div>
        <div class="activity-details">
          <div class="activity-domain">${categoryName}</div>
          <div class="activity-time">${duration} • ${timeAgo}</div>
        </div>
      </div>
    `;
  }).join('');
}

// 🔒 PRIVACY-FIRST: Map categories to friendly names
function getCategoryName(category) {
  const names = {
    work: 'Work Activity',
    communication: 'Communication',
    distraction: 'Entertainment',
    other: 'Other Activity'
  };
  return names[category] || 'Activity';
}

function generateInsights(stats) {
  const insightsSection = document.getElementById('insightsSection');
  const insightsList = document.getElementById('insightsList');
  
  const insights = [];
  
  // Deep work insight - lowered thresholds for demo
  const deepWorkHours = (stats.deepWorkTime / (1000 * 60 * 60));
  const deepWorkMinutes = (stats.deepWorkTime / (1000 * 60));
  
  if (deepWorkMinutes >= 2) {
    insights.push(`🎉 Amazing! You've achieved <span class="insight-highlight">${deepWorkMinutes.toFixed(1)} minutes</span> of deep work today. You're in the top 10% of knowledge workers!`);
  } else if (deepWorkMinutes >= 1) {
    insights.push(`✨ Great progress with <span class="insight-highlight">${deepWorkMinutes.toFixed(1)} minutes</span> of deep work. Research shows 2-4 hours daily is optimal.`);
  } else if (deepWorkMinutes >= 0.25) {
    insights.push(`📈 You have <span class="insight-highlight">${deepWorkMinutes.toFixed(1)} minutes</span> of deep work. Keep building those focus sessions!`);
  }
  
  // Pattern insight - updated for new thresholds
  if (stats.pattern === 'fragmented') {
    insights.push(`⚠️ High fragmentation detected with <span class="insight-highlight">${stats.switches} context switches</span>. Consider using Focus Mode to reduce interruptions.`);
  } else if (stats.pattern === 'focused') {
    insights.push(`🎯 Excellent focus discipline! Your sustained concentration shows professional-grade work habits.`);
  }
  
  // Streak insight - lowered thresholds
  if (stats.streakDays >= 3) {
    insights.push(`🔥 <span class="insight-highlight">${stats.streakDays}-day streak!</span> Consistency is the key to mastery. Keep this momentum going!`);
  } else if (stats.streakDays >= 1) {
    insights.push(`💪 <span class="insight-highlight">${stats.streakDays} day${stats.streakDays > 1 ? 's' : ''}</span> of productive work. You're building great habits!`);
  }
  
  // 🎯 UNIQUE: AI-style productivity coach insights
  const hour = new Date().getHours();
  if (hour >= 9 && hour < 12 && stats.focusScore > 70) {
    insights.push(`🧠 <span class="insight-highlight">AI Insight:</span> Your morning focus is exceptional! Schedule your hardest tasks before noon.`);
  } else if (hour >= 14 && hour < 16 && stats.switches > 10) {
    insights.push(`🧠 <span class="insight-highlight">AI Insight:</span> Post-lunch slump detected. Try a 5-minute walk or coffee break to reset.`);
  } else if (stats.deepWorkSessions >= 2) {
    insights.push(`🧠 <span class="insight-highlight">AI Insight:</span> You're ${stats.deepWorkSessions}x above average! This level of focus compounds into mastery.`);
  }
  
  // Time-based insights
  const workPercent = stats.totalTime > 0 ? (stats.workTime / stats.totalTime) * 100 : 0;
  if (workPercent >= 60) {
    insights.push(`💼 <span class="insight-highlight">${workPercent.toFixed(0)}%</span> of your time is productive work. Excellent balance!`);
  }
  
  const distractPercent = stats.totalTime > 0 ? (stats.distractionTime / stats.totalTime) * 100 : 0;
  if (distractPercent > 20) {
    insights.push(`📱 Distractions account for <span class="insight-highlight">${distractPercent.toFixed(0)}%</span> of your time. Focus Mode can help reduce this.`);
  }
  
  // 🏆 Achievement hints
  if (stats.deepWorkSessions === 2) {
    insights.push(`🏆 <span class="insight-highlight">Almost there!</span> One more deep work session unlocks "Speed Demon" achievement!`);
  }
  
  // Show insights
  if (insights.length > 0) {
    insightsSection.classList.remove('hidden');
    insightsList.innerHTML = insights.map(insight => `
      <div class="insight-card">
        <div class="insight-text">${insight}</div>
      </div>
    `).join('');
  } else {
    insightsSection.classList.add('hidden');
  }
}

// ============ FOCUS MODE ============

function showFocusBanner(endTime) {
  const banner = document.getElementById('focusBanner');
  banner.classList.remove('hidden');
  
  if (focusModeInterval) {
    clearInterval(focusModeInterval);
  }
  
  updateFocusTimer(endTime);
  focusModeInterval = setInterval(() => updateFocusTimer(endTime), 1000);
  
  // Disable start button
  const focusBtn = document.getElementById('focusModeBtn');
  focusBtn.disabled = true;
  focusBtn.innerHTML = '<span>Focus Mode Active</span>';
  focusBtn.style.opacity = '0.6';
}

function hideFocusBanner() {
  const banner = document.getElementById('focusBanner');
  banner.classList.add('hidden');
  
  if (focusModeInterval) {
    clearInterval(focusModeInterval);
    focusModeInterval = null;
  }
  
  // Enable start button
  const focusBtn = document.getElementById('focusModeBtn');
  focusBtn.disabled = false;
  focusBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
    <span>Start Focus Mode</span>
  `;
  focusBtn.style.opacity = '1';
}

function updateFocusTimer(endTime) {
  const now = Date.now();
  const remaining = Math.max(0, endTime - now);
  
  const minutes = Math.floor(remaining / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  
  const timerEl = document.getElementById('focusTimer');
  timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  if (remaining === 0 && focusModeInterval) {
    clearInterval(focusModeInterval);
    focusModeInterval = null;
    hideFocusBanner();
    loadStats();
  }
}

// ============ EVENT LISTENERS ============

function setupEventListeners() {
  // Focus Mode
  document.getElementById('focusModeBtn').addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ action: 'startFocusMode' });
    setTimeout(loadStats, 500);
  });
  
  document.getElementById('endFocusBtn').addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ action: 'endFocusMode' });
    setTimeout(loadStats, 500);
  });
  
  // Settings
  document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.remove('hidden');
  });
  
  document.getElementById('closeSettings').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.add('hidden');
  });
  
  document.querySelector('.modal-overlay').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.add('hidden');
  });
  
  // Tasks
  document.getElementById('tasksBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('tasks.html') });
  });
  
  // AI Dashboard
  document.getElementById('aiDashboardBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('ai-dashboard.html') });
  });
  
  // Weekly Report
  document.getElementById('viewReportBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('report.html') });
  });
  
  // Manager Insights
  document.getElementById('managerInsightsBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('manager-insights.html') });
  });
  
  // Export Data
  document.getElementById('exportBtn').addEventListener('click', async () => {
    const sessions = await chrome.runtime.sendMessage({ action: 'getSessions' });
    const stats = await chrome.runtime.sendMessage({ action: 'getStats' });
    
    const exportData = {
      exportDate: new Date().toISOString(),
      sessions: sessions.sessions,
      stats: stats,
      settings: settings
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `signal-pulse-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  });
  
  // Settings Sliders
  document.getElementById('focusDuration').addEventListener('input', (e) => {
    document.getElementById('focusDurationValue').textContent = `${e.target.value} min`;
  });
  
  document.getElementById('dailyGoal').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    // Show in minutes if < 1 hour
    if (value < 1) {
      const minutes = Math.round(value * 60);
      document.getElementById('dailyGoalValue').textContent = `${minutes} min`;
    } else {
      document.getElementById('dailyGoalValue').textContent = `${value} hrs`;
    }
  });
  
  // Save Settings
  ['focusDuration', 'dailyGoal', 'nudgesEnabled', 'soundEnabled'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', saveSettings);
    }
  });
  
  // Clear Data
  document.getElementById('clearDataBtn').addEventListener('click', async () => {
    if (confirm('⚠️ This will delete all your tracking data. Are you sure?')) {
      await chrome.storage.local.clear();
      await chrome.runtime.sendMessage({ action: 'getStats' }); // Reinitialize
      alert('✅ All data cleared!');
      loadStats();
    }
  });
}

async function saveSettings() {
  settings.focusDuration = parseInt(document.getElementById('focusDuration').value);
  settings.dailyGoal = parseFloat(document.getElementById('dailyGoal').value);
  settings.nudgesEnabled = document.getElementById('nudgesEnabled').checked;
  settings.soundEnabled = document.getElementById('soundEnabled').checked;
  
  await chrome.runtime.sendMessage({ 
    action: 'updateSettings', 
    settings: settings 
  });
}

// ============ UTILITIES ============

function formatDuration(ms) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return '<1m';
  }
}

function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return 'just now';
  }
}

function getCategoryEmoji(category) {
  const emojis = {
    work: '💼',
    communication: '💬',
    distraction: '🎮',
    other: '🌐'
  };
  return emojis[category] || '🌐';
}
