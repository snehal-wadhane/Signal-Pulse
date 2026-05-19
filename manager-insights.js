// Manager Insights - Smart Scheduling Recommendations

document.addEventListener('DOMContentLoaded', loadManagerInsights);

async function loadManagerInsights() {
  const result = await chrome.storage.local.get('stats');
  const stats = result.stats || {};
  
  console.log('📊 [Manager Insights] Loading data...', stats);
  
  // Use REAL data from stats with proper dataPoints
  const weekdayData = stats.teamWeekdayFocus || {
    monday: { deepWorkHours: 0, sessions: 0, avgFocusScore: 0, dataPoints: 0 },
    tuesday: { deepWorkHours: 0, sessions: 0, avgFocusScore: 0, dataPoints: 0 },
    wednesday: { deepWorkHours: 0, sessions: 0, avgFocusScore: 0, dataPoints: 0 },
    thursday: { deepWorkHours: 0, sessions: 0, avgFocusScore: 0, dataPoints: 0 },
    friday: { deepWorkHours: 0, sessions: 0, avgFocusScore: 0, dataPoints: 0 },
  };
  
  console.log('📊 [Manager Insights] Weekday patterns:', weekdayData);
  console.log('📊 [Manager Insights] Best day:', stats.bestFocusDay);
  console.log('📊 [Manager Insights] Worst day:', stats.worstFocusDay);
  
  renderWeekdayGrid(weekdayData, stats);
  generateRecommendations(weekdayData, stats);
  renderTeamMetrics(weekdayData);
}

function renderWeekdayGrid(weekdayData, stats) {
  const grid = document.getElementById('weekdayGrid');
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  const bestDay = stats.bestFocusDay;
  const worstDay = stats.worstFocusDay;
  
  grid.innerHTML = days.map((day, index) => {
    const data = weekdayData[day];
    const score = Math.round(data.avgFocusScore || 0);
    const deepWork = (data.deepWorkHours || 0).toFixed(1);
    const sessions = Math.round(data.sessions || 0);
    
    let cardClass = 'day-card';
    let badge = '';
    
    if (day === bestDay) {
      cardClass += ' best';
      badge = '<div class="day-badge badge-best">BEST FOR FOCUS</div>';
    } else if (day === worstDay) {
      cardClass += ' worst';
      badge = '<div class="day-badge badge-worst">AVOID MEETINGS</div>';
    }
    
    return `
      <div class="${cardClass}">
        <div class="day-name">${dayLabels[index]}</div>
        <div class="day-score">${score}</div>
        <div class="day-label">Focus Score</div>
        <div style="margin-top: 10px; font-size: 12px; color: #6b7280;">
          ${deepWork}h deep work<br>
          ${sessions} sessions
        </div>
        ${badge}
      </div>
    `;
  }).join('');
}

function generateRecommendations(weekdayData, stats) {
  const container = document.getElementById('recommendations');
  const recommendations = [];
  
  const bestDay = stats.bestFocusDay || 'monday';
  const worstDay = stats.worstFocusDay || 'friday';
  
  const bestScore = weekdayData[bestDay]?.avgFocusScore || 0;
  const worstScore = weekdayData[worstDay]?.avgFocusScore || 0;
  
  // Recommendation 1: No meetings on best day
  if (bestScore > 70) {
    recommendations.push({
      title: `🎯 Protect ${capitalize(bestDay)}s for Deep Work`,
      text: `Your team shows highest focus on ${capitalize(bestDay)}s (${Math.round(bestScore)}/100 focus score). Recommendation: <strong>Block all non-critical meetings on ${capitalize(bestDay)}s</strong>. Schedule focus time from 9 AM - 12 PM for individual work. Reserve this day for tasks requiring deep thinking: coding, writing, design, analysis.`,
      priority: 'high'
    });
  }
  
  // Recommendation 2: Schedule meetings on worst day
  if (worstScore < 60 && worstScore > 0) {
    recommendations.push({
      title: `📅 Schedule Meetings on ${capitalize(worstDay)}s`,
      text: `Team focus is lower on ${capitalize(worstDay)}s (${Math.round(worstScore)}/100 score). Recommendation: <strong>Batch all team meetings, 1-on-1s, and collaborative sessions on ${capitalize(worstDay)}s</strong>. Since deep work is already disrupted, use this day for: standups, planning, reviews, brainstorming, social events.`,
      priority: 'medium'
    });
  }
  
  // Recommendation 3: Wednesday balance
  const wedScore = weekdayData.wednesday?.avgFocusScore || 0;
  if (wedScore > 50) {
    recommendations.push({
      title: `⚖️ Wednesday "No Meeting Wednesday"`,
      text: `Mid-week focus is strong (${Math.round(wedScore)}/100). Recommendation: <strong>Implement "No Meeting Wednesdays"</strong> company-wide. This gives team a guaranteed focus day in the middle of the week, preventing meeting fatigue and maintaining momentum.`,
      priority: 'medium'
    });
  }
  
  // Recommendation 4: Monday productivity
  const monScore = weekdayData.monday?.avgFocusScore || 0;
  if (monScore > 65) {
    recommendations.push({
      title: `🚀 Leverage Monday Momentum`,
      text: `Mondays show strong focus (${Math.round(monScore)}/100). People start the week energized. Recommendation: <strong>No meetings before 2 PM on Mondays</strong>. Let team members tackle their hardest problems when energy is highest. Schedule only async updates and standups.`,
      priority: 'high'
    });
  }
  
  // Recommendation 5: Friday flexibility
  const friScore = weekdayData.friday?.avgFocusScore || 0;
  if (friScore < 55) {
    recommendations.push({
      title: `🎉 Friday Flex Time`,
      text: `Friday focus naturally drops (${Math.round(friScore)}/100) as people wind down. Recommendation: <strong>Make Fridays flexible</strong>. Schedule: team socials, learning sessions, demo days, retrospectives, and code reviews. Avoid starting new complex work. Consider half-day Fridays in summer.`,
      priority: 'low'
    });
  }
  
  // If no data yet
  if (recommendations.length === 0) {
    recommendations.push({
      title: `📊 Gathering Data...`,
      text: `Track your productivity for a few more days to generate personalized scheduling recommendations. The system needs at least one occurrence of each weekday to identify patterns. Keep using Signal Pulse and check back soon!`,
      priority: 'info'
    });
  }
  
  container.innerHTML = recommendations.map(rec => `
    <div class="recommendation">
      <div class="recommendation-title">${rec.title}</div>
      <div class="recommendation-text">${rec.text}</div>
    </div>
  `).join('');
}

function renderTeamMetrics(weekdayData) {
  const container = document.getElementById('teamMetrics');
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const totalDeepWork = days.reduce((sum, day) => sum + (weekdayData[day]?.deepWorkHours || 0), 0);
  const avgDeepWork = totalDeepWork / 5;
  
  const scores = days.map(day => weekdayData[day]?.avgFocusScore || 0);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.filter(s => s > 0).length || 0;
  
  const bestDayData = days.reduce((best, day) => {
    const score = weekdayData[day]?.avgFocusScore || 0;
    return score > best.score ? { day, score } : best;
  }, { day: 'monday', score: 0 });
  
  const worstDayData = days.reduce((worst, day) => {
    const score = weekdayData[day]?.avgFocusScore || 0;
    return (score < worst.score && score > 0) ? { day, score } : worst;
  }, { day: 'friday', score: 100 });
  
  container.innerHTML = `
    <div class="stat-row">
      <span class="stat-label">Average Weekly Deep Work</span>
      <span class="stat-value">${avgDeepWork.toFixed(1)} hours/day</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Average Focus Score</span>
      <span class="stat-value">${Math.round(avgScore)}/100</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Best Focus Day</span>
      <span class="stat-value">${capitalize(bestDayData.day)} (${Math.round(bestDayData.score)}/100)</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Most Fragmented Day</span>
      <span class="stat-value">${capitalize(worstDayData.day)} (${Math.round(worstDayData.score)}/100)</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Recommendation</span>
      <span class="stat-value" style="color: #10b981;">Schedule meetings on ${capitalize(worstDayData.day)}s</span>
    </div>
  `;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
