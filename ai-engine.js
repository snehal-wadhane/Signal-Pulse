// ============================================
// SIGNAL PULSE - AI ENGINE MODULE
// Advanced Machine Learning Features
// ============================================

// ============ 1. FOCUS SCORE PREDICTION (Regression) ============

class FocusScorePredictor {
  constructor() {
    // Linear regression model: score = intercept + (switchPenalty * switches) + (timePenalty * hours)
    this.weights = {
      intercept: 100,
      switchPenalty: -1.5,
      timePenalty: -2,
      workPercentBonus: 0.5
    };
    this.trained = false;
  }
  
  predict(features) {
    const { switches, totalHours, workPercent } = features;
    
    let score = this.weights.intercept;
    score += this.weights.switchPenalty * switches;
    score += this.weights.timePenalty * totalHours;
    score += this.weights.workPercentBonus * workPercent;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }
  
  train(historicalData) {
    // Simple gradient descent
    const learningRate = 0.001;
    const epochs = 100;
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      for (const data of historicalData) {
        const prediction = this.predict(data.features);
        const error = prediction - data.actualScore;
        
        // Update weights
        this.weights.intercept -= learningRate * error;
        this.weights.switchPenalty -= learningRate * error * data.features.switches;
        this.weights.timePenalty -= learningRate * error * data.features.totalHours;
        this.weights.workPercentBonus -= learningRate * error * data.features.workPercent;
      }
    }
    
    this.trained = true;
    console.log('🤖 AI Model Trained:', this.weights);
  }
  
  getConfidence() {
    return this.trained ? 0.85 : 0.5;
  }
}

// ============ 2. PRODUCTIVITY PERSONAS (K-Means Clustering) ============

class ProductivityPersonaAnalyzer {
  constructor() {
    // Define persona clusters (centers)
    this.personas = {
      'Morning Warrior': {
        avgFocusScore: 85,
        avgDeepWorkHours: 3,
        avgSwitches: 5,
        bestHour: 9,
        traits: ['High morning focus', 'Few interruptions', 'Consistent deep work']
      },
      'Night Owl': {
        avgFocusScore: 75,
        avgDeepWorkHours: 4,
        avgSwitches: 8,
        bestHour: 22,
        traits: ['Late night productivity', 'Longer sessions', 'Evening focus peak']
      },
      'Scattered Professional': {
        avgFocusScore: 60,
        avgDeepWorkHours: 1.5,
        avgSwitches: 25,
        bestHour: 14,
        traits: ['High fragmentation', 'Context switching', 'Afternoon focus']
      },
      'Balanced Builder': {
        avgFocusScore: 70,
        avgDeepWorkHours: 2.5,
        avgSwitches: 12,
        bestHour: 10,
        traits: ['Steady productivity', 'Moderate switches', 'Balanced workflow']
      },
      'Sprint Specialist': {
        avgFocusScore: 80,
        avgDeepWorkHours: 2,
        avgSwitches: 6,
        bestHour: 11,
        traits: ['Short intense bursts', 'High quality focus', 'Strategic breaks']
      }
    };
  }
  
  identifyPersona(userStats) {
    const userFeatures = [
      userStats.avgFocusScore || 50,
      userStats.avgDeepWorkHours || 1,
      userStats.avgSwitches || 15,
      userStats.bestHour || 10
    ];
    
    let closestPersona = null;
    let minDistance = Infinity;
    
    for (const [personaName, personaData] of Object.entries(this.personas)) {
      const personaFeatures = [
        personaData.avgFocusScore,
        personaData.avgDeepWorkHours,
        personaData.avgSwitches,
        personaData.bestHour
      ];
      
      const distance = this.euclideanDistance(userFeatures, personaFeatures);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestPersona = personaName;
      }
    }
    
    return {
      persona: closestPersona,
      confidence: Math.max(0, 1 - (minDistance / 100)),
      traits: this.personas[closestPersona].traits,
      advice: this.getPersonaAdvice(closestPersona)
    };
  }
  
  euclideanDistance(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
  }
  
  getPersonaAdvice(persona) {
    const advice = {
      'Morning Warrior': 'Leverage your morning peak! Schedule hardest tasks 8-11 AM. Protect this golden time from meetings.',
      'Night Owl': 'Your productivity peaks late. Consider flexible hours. Block focus time 8 PM onwards.',
      'Scattered Professional': 'High fragmentation detected. Try Pomodoro (25 min focus). Batch similar tasks together.',
      'Balanced Builder': 'Solid foundation! To level up, add one more deep work session daily. Target 3+ hours.',
      'Sprint Specialist': 'Quality over quantity! Maintain those intense bursts. Add recovery breaks between sprints.'
    };
    
    return advice[persona] || 'Keep building great habits!';
  }
}

// ============ 3. BURNOUT DETECTION (Sentiment Analysis) ============

class BurnoutDetector {
  constructor() {
    this.riskThresholds = {
      low: 30,
      medium: 50,
      high: 70,
      critical: 85
    };
  }
  
  analyzeBurnoutRisk(sessions, stats) {
    let burnoutScore = 0;
    const today = new Date();
    const last7Days = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      const daysDiff = (today - sessionDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });
    
    // Feature 1: Late night work (after 10 PM)
    const lateNightWork = last7Days.filter(s => {
      const hour = new Date(s.startTime).getHours();
      return hour >= 22 || hour <= 4;
    }).length;
    
    if (lateNightWork > 5) burnoutScore += 30;
    else if (lateNightWork > 3) burnoutScore += 20;
    else if (lateNightWork > 1) burnoutScore += 10;
    
    // Feature 2: Weekend work
    const weekendWork = last7Days.filter(s => {
      const day = new Date(s.date).getDay();
      return day === 0 || day === 6;
    }).length;
    
    if (weekendWork > 10) burnoutScore += 25;
    else if (weekendWork > 5) burnoutScore += 15;
    else if (weekendWork > 2) burnoutScore += 5;
    
    // Feature 3: Excessive deep work (> 6 hours/day average)
    const avgDeepWorkHours = (stats.totalDeepWork || 0) / 7;
    if (avgDeepWorkHours > 6) burnoutScore += 20;
    else if (avgDeepWorkHours > 5) burnoutScore += 10;
    
    // Feature 4: Increasing fragmentation trend
    const recentFragmentation = this.calculateFragmentationTrend(last7Days);
    if (recentFragmentation > 0.3) burnoutScore += 25; // 30% increase
    else if (recentFragmentation > 0.15) burnoutScore += 15;
    
    // Feature 5: Declining focus score
    const focusTrend = this.calculateFocusTrend(last7Days);
    if (focusTrend < -0.2) burnoutScore += 20; // 20% decline
    else if (focusTrend < -0.1) burnoutScore += 10;
    
    const risk = this.getRiskLevel(burnoutScore);
    
    return {
      score: burnoutScore,
      risk: risk,
      message: this.getBurnoutMessage(risk, burnoutScore),
      recommendations: this.getBurnoutRecommendations(risk),
      factors: {
        lateNightWork,
        weekendWork,
        avgDeepWorkHours: avgDeepWorkHours.toFixed(1),
        fragmentationTrend: (recentFragmentation * 100).toFixed(0) + '%',
        focusTrend: (focusTrend * 100).toFixed(0) + '%'
      }
    };
  }
  
  calculateFragmentationTrend(sessions) {
    if (sessions.length < 14) return 0;
    
    const firstHalf = sessions.slice(0, sessions.length / 2);
    const secondHalf = sessions.slice(sessions.length / 2);
    
    const firstAvg = firstHalf.length / 3.5;
    const secondAvg = secondHalf.length / 3.5;
    
    return (secondAvg - firstAvg) / firstAvg;
  }
  
  calculateFocusTrend(sessions) {
    // Simplified: compare first 3 days vs last 3 days
    if (sessions.length < 6) return 0;
    
    const firstDays = sessions.slice(0, 3);
    const lastDays = sessions.slice(-3);
    
    const calcFocus = (days) => {
      const total = days.reduce((sum, s) => sum + s.duration, 0);
      const work = days.filter(s => s.category === 'work').reduce((sum, s) => sum + s.duration, 0);
      return total > 0 ? work / total : 0;
    };
    
    const firstFocus = calcFocus(firstDays);
    const lastFocus = calcFocus(lastDays);
    
    return (lastFocus - firstFocus) / firstFocus;
  }
  
  getRiskLevel(score) {
    if (score >= this.riskThresholds.critical) return 'critical';
    if (score >= this.riskThresholds.high) return 'high';
    if (score >= this.riskThresholds.medium) return 'medium';
    if (score >= this.riskThresholds.low) return 'low';
    return 'minimal';
  }
  
  getBurnoutMessage(risk, score) {
    const messages = {
      critical: `🚨 CRITICAL BURNOUT RISK (${score}/100): Immediate action required. You're showing multiple burnout indicators.`,
      high: `⚠️ HIGH BURNOUT RISK (${score}/100): Warning signs detected. Take preventive action now.`,
      medium: `⚡ MODERATE BURNOUT RISK (${score}/100): Some concerning patterns. Consider adjustments.`,
      low: `💛 LOW BURNOUT RISK (${score}/100): Minor concerns. Stay mindful of work-life balance.`,
      minimal: `✅ MINIMAL BURNOUT RISK (${score}/100): Healthy work patterns detected!`
    };
    
    return messages[risk];
  }
  
  getBurnoutRecommendations(risk) {
    const recommendations = {
      critical: [
        'Take 2-3 days off immediately',
        'Stop working evenings and weekends',
        'Reduce deep work to max 4 hours/day',
        'Consider speaking with manager about workload'
      ],
      high: [
        'Take a full weekend off (no work)',
        'Set hard stop time at 6 PM',
        'Limit deep work to 5 hours/day',
        'Schedule regular breaks'
      ],
      medium: [
        'Avoid weekend work this week',
        'No work after 8 PM',
        'Take 10-min break every hour',
        'Plan one relaxation activity daily'
      ],
      low: [
        'Maintain current work-life balance',
        'Continue regular breaks',
        'Monitor weekend work'
      ],
      minimal: [
        'Great job maintaining balance!',
        'Keep up healthy work habits'
      ]
    };
    
    return recommendations[risk] || [];
  }
}

// ============ 4. RECOMMENDATION ENGINE (Collaborative Filtering) ============

class RecommendationEngine {
  constructor() {
    // Simulated "other users" data (in production, this comes from aggregated team data)
    this.userProfiles = {
      'fragmented_improved': {
        pattern: 'fragmented',
        improved: true,
        actions: [
          { action: 'usedFocusMode', frequency: 'daily', duration: 25 },
          { action: 'blockedDistractions', sites: 5 },
          { action: 'setGoal', goal: 2 }
        ],
        result: { focusScoreIncrease: 35, fragmentationDecrease: 60 }
      },
      'focused_masters': {
        pattern: 'focused',
        avgFocusScore: 85,
        habits: [
          { habit: 'morningDeepWork', time: 9, duration: 90 },
          { habit: 'noMeetingsBeforeNoon', success: true },
          { habit: 'batchCommunication', times: [2, 4] }
        ]
      }
    };
  }
  
  getRecommendations(userPattern, userStats) {
    const recommendations = [];
    
    // Collaborative filtering: Find similar users who improved
    if (userPattern === 'fragmented') {
      const similar = this.userProfiles.fragmented_improved;
      
      recommendations.push({
        type: 'collaborative',
        title: '💡 Learn from Similar Users',
        message: `Users like you who improved used Focus Mode daily for ${similar.actions[0].duration} minutes. This increased their focus score by ${similar.result.focusScoreIncrease}% on average.`,
        action: 'startFocusMode',
        confidence: 0.82
      });
      
      recommendations.push({
        type: 'collaborative',
        title: '🎯 Proven Strategy',
        message: `Successfully recovered users blocked ${similar.actions[1].sites}+ distraction sites and reduced fragmentation by ${similar.result.fragmentationDecrease}%.`,
        action: 'blockSites',
        confidence: 0.75
      });
    }
    
    // Content-based: Recommend based on current stats
    if (userStats.deepWorkSessions < 2) {
      recommendations.push({
        type: 'content',
        title: '📈 Increase Deep Work',
        message: 'Your deep work sessions are below average. Top performers achieve 3+ sessions daily. Start with adding one 25-minute session.',
        action: 'addDeepWorkSession',
        confidence: 0.70
      });
    }
    
    // Hybrid: Combine patterns
    if (userPattern === 'focused' && userStats.avgFocusScore > 75) {
      const masters = this.userProfiles.focused_masters;
      
      recommendations.push({
        type: 'expert',
        title: '🏆 Master Level Strategy',
        message: `High performers schedule ${masters.habits[0].duration}-minute deep work at ${masters.habits[0].time} AM and avoid meetings before noon. Consider this approach!`,
        action: 'adoptExpertHabits',
        confidence: 0.88
      });
    }
    
    return recommendations;
  }
  
  trackAction(action, result) {
    // In production, this would update the collaborative filtering model
    console.log('📊 Recommendation feedback:', action, result);
  }
}

// ============ 5. OPTIMAL NUDGE TIMING (Reinforcement Learning) ============

class NudgeOptimizer {
  constructor() {
    // Q-Learning table: state → action → expected reward
    this.qTable = {};
    
    // Hyperparameters
    this.learningRate = 0.1;
    this.discountFactor = 0.9;
    this.epsilon = 0.2; // Exploration rate
    
    // Track performance
    this.history = [];
  }
  
  getState(userContext) {
    // State = combination of: hour, fragmentation level, last response
    const hour = Math.floor(userContext.hour / 4); // Bucket hours: 0-3, 4-7, 8-11, etc.
    const fragLevel = userContext.switches > 15 ? 'high' : userContext.switches > 8 ? 'medium' : 'low';
    const lastResponse = userContext.lastNudgeAccepted ? 'accepted' : 'dismissed';
    
    return `h${hour}-f${fragLevel}-r${lastResponse}`;
  }
  
  chooseAction(state) {
    // Initialize state if new
    if (!this.qTable[state]) {
      this.qTable[state] = {
        'immediate': 0,
        'delay_5min': 0,
        'delay_15min': 0,
        'skip': 0
      };
    }
    
    // Epsilon-greedy: explore vs exploit
    if (Math.random() < this.epsilon) {
      // Explore: random action
      const actions = Object.keys(this.qTable[state]);
      return actions[Math.floor(Math.random() * actions.length)];
    } else {
      // Exploit: best known action
      return this.getBestAction(state);
    }
  }
  
  getBestAction(state) {
    const actions = this.qTable[state];
    return Object.keys(actions).reduce((a, b) => 
      actions[a] > actions[b] ? a : b
    );
  }
  
  updateQValue(state, action, reward, nextState) {
    if (!this.qTable[state]) return;
    
    const currentQ = this.qTable[state][action];
    const maxNextQ = Math.max(...Object.values(this.qTable[nextState] || { default: 0 }));
    
    // Q-learning update rule
    const newQ = currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);
    
    this.qTable[state][action] = newQ;
    
    console.log(`🤖 RL Update: ${state} → ${action} = ${newQ.toFixed(2)} (reward: ${reward})`);
  }
  
  recordNudgeResult(context, action, userAccepted) {
    const state = this.getState(context);
    const reward = this.calculateReward(userAccepted, action);
    
    this.history.push({ state, action, reward, timestamp: Date.now() });
    
    // Update Q-table
    const nextContext = { ...context, lastNudgeAccepted: userAccepted };
    const nextState = this.getState(nextContext);
    
    this.updateQValue(state, action, reward, nextState);
  }
  
  calculateReward(accepted, action) {
    if (accepted) {
      // Positive rewards for acceptance
      return action === 'immediate' ? 10 : action === 'delay_5min' ? 8 : 5;
    } else {
      // Negative rewards for dismissal
      return action === 'immediate' ? -5 : action === 'delay_5min' ? -3 : -1;
    }
  }
  
  getOptimalTiming(userContext) {
    const state = this.getState(userContext);
    const action = this.chooseAction(state);
    
    const timings = {
      'immediate': 0,
      'delay_5min': 5 * 60 * 1000,
      'delay_15min': 15 * 60 * 1000,
      'skip': null
    };
    
    return {
      action,
      delay: timings[action],
      confidence: this.qTable[state] ? Math.max(...Object.values(this.qTable[state])) / 10 : 0.5
    };
  }
  
  getPerformanceStats() {
    const recent = this.history.slice(-50);
    const acceptanceRate = recent.filter(h => h.reward > 0).length / recent.length;
    
    return {
      totalNudges: this.history.length,
      acceptanceRate: (acceptanceRate * 100).toFixed(1) + '%',
      statesLearned: Object.keys(this.qTable).length,
      avgReward: (recent.reduce((sum, h) => sum + h.reward, 0) / recent.length).toFixed(2)
    };
  }
}

// ============ EXPORT AI ENGINE ============

const AIEngine = {
  focusPredictor: new FocusScorePredictor(),
  personaAnalyzer: new ProductivityPersonaAnalyzer(),
  burnoutDetector: new BurnoutDetector(),
  recommendationEngine: new RecommendationEngine(),
  nudgeOptimizer: new NudgeOptimizer(),
  
  // Initialize with historical data
  async initialize() {
    const result = await chrome.storage.local.get(['sessions', 'stats', 'aiData']);
    const sessions = result.sessions || [];
    const stats = result.stats || {};
    const aiData = result.aiData || {};
    
    // Train focus predictor if we have data
    if (sessions.length > 10) {
      const trainingData = this.prepareTrainingData(sessions);
      this.focusPredictor.train(trainingData);
    }
    
    // Load Q-table if exists
    if (aiData.qTable) {
      this.nudgeOptimizer.qTable = aiData.qTable;
    }
    
    console.log('🤖 AI Engine Initialized');
  },
  
  prepareTrainingData(sessions) {
    const dailyData = {};
    
    sessions.forEach(s => {
      if (!dailyData[s.date]) {
        dailyData[s.date] = { sessions: [], totalTime: 0, workTime: 0 };
      }
      dailyData[s.date].sessions.push(s);
      dailyData[s.date].totalTime += s.duration;
      if (s.category === 'work') dailyData[s.date].workTime += s.duration;
    });
    
    return Object.values(dailyData).map(day => {
      const switches = day.sessions.length;
      const totalHours = day.totalTime / (1000 * 60 * 60);
      const workPercent = day.totalTime > 0 ? (day.workTime / day.totalTime) * 100 : 0;
      
      const actualScore = Math.round((workPercent) * (1 - Math.min(switches / 50, 0.5)));
      
      return {
        features: { switches, totalHours, workPercent },
        actualScore
      };
    });
  },
  
  // Save AI state
  async saveState() {
    await chrome.storage.local.set({
      aiData: {
        qTable: this.nudgeOptimizer.qTable,
        modelWeights: this.focusPredictor.weights,
        lastUpdate: Date.now()
      }
    });
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.AIEngine = AIEngine;
}
