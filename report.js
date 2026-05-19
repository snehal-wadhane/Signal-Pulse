document.addEventListener('DOMContentLoaded', loadReport);

async function loadReport() {
  const result = await chrome.storage.local.get('sessions');
  const sessions = result.sessions || [];
  
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekSessions = sessions.filter(s => new Date(s.startTime) >= sevenDaysAgo);
  
  const dailyStats = calculateDailyStats(weekSessions);
  updateSummary(dailyStats);
  drawChart(dailyStats);
  generateInsights(dailyStats);
}

function calculateDailyStats(sessions) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    const daySessions = sessions.filter(s => s.date === dateStr);
    const workSessions = daySessions.filter(s => s.category === 'work');
    
    let deepWorkTime = 0;
    let currentBlock = null;
    for (const session of workSessions.sort((a,b) => a.startTime - b.startTime)) {
      if (!currentBlock) {
        currentBlock = { start: session.startTime, end: session.endTime };
      } else if (session.startTime - currentBlock.end < 60000) {
        currentBlock.end = session.endTime;
      } else {
        if (currentBlock.end - currentBlock.start > 25 * 60 * 1000) {
          deepWorkTime += currentBlock.end - currentBlock.start;
        }
        currentBlock = { start: session.startTime, end: session.endTime };
      }
    }
    if (currentBlock && currentBlock.end - currentBlock.start > 25 * 60 * 1000) {
      deepWorkTime += currentBlock.end - currentBlock.start;
    }
    
    days.push({ date: dateStr, dayName, deepWorkTime, switches: daySessions.length });
  }
  return days;
}

function updateSummary(dailyStats) {
  const totalDeepWork = dailyStats.reduce((sum, d) => sum + d.deepWorkTime, 0) / (1000 * 60 * 60);
  document.getElementById('totalDeepWork').textContent = totalDeepWork.toFixed(1);
  
  const avgSwitches = dailyStats.reduce((sum, d) => sum + d.switches, 0) / 7;
  document.getElementById('totalSwitches').textContent = Math.round(avgSwitches * 7);
  
  const avgScore = Math.round(Math.max(0, 100 - avgSwitches * 2));
  document.getElementById('avgFocusScore').textContent = avgScore;
  
  const bestDay = dailyStats.reduce((best, d) => d.deepWorkTime > best.deepWorkTime ? d : best, dailyStats[0]);
  document.getElementById('bestDay').textContent = bestDay.dayName;
}

function drawChart(dailyStats) {
  const canvas = document.getElementById('trendChart');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;
  
  ctx.clearRect(0, 0, width, height);
  
  const data = dailyStats.map(d => d.deepWorkTime / (1000 * 60 * 60));
  const maxValue = Math.max(...data, 4);
  const barWidth = (width - padding * 2) / data.length * 0.7;
  const gap = (width - padding * 2) / data.length;
  
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, width, height);
  
  ctx.strokeStyle = '#e9ecef';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding + (height - padding * 2) / 4 * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }
  
  data.forEach((value, i) => {
    const x = padding + gap * i + (gap - barWidth) / 2;
    const barHeight = (value / maxValue) * (height - padding * 2);
    const y = height - padding - barHeight;
    
    const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);
    
    ctx.fillStyle = '#212529';
    ctx.font = '12px -apple-system';
    ctx.textAlign = 'center';
    ctx.fillText(dailyStats[i].dayName, x + barWidth / 2, height - 15);
  });
  
  ctx.fillStyle = '#6c757d';
  ctx.font = '11px -apple-system';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const value = (maxValue / 4 * (4 - i)).toFixed(1);
    const y = padding + (height - padding * 2) / 4 * i;
    ctx.fillText(value + 'h', padding - 10, y + 4);
  }
}

function generateInsights(dailyStats) {
  const insights = [];
  const avgDeepWork = dailyStats.reduce((sum, d) => sum + d.deepWorkTime, 0) / 7 / (1000 * 60 * 60);
  
  if (avgDeepWork >= 3) {
    insights.push('🎉 Excellent! You averaged ' + avgDeepWork.toFixed(1) + ' hours of deep work per day.');
  } else {
    insights.push('📈 You averaged ' + avgDeepWork.toFixed(1) + ' hours of deep work. Aim for 2-4 hours daily.');
  }
  
  const trend = dailyStats[6].deepWorkTime > dailyStats[0].deepWorkTime ? 'improving' : 'declining';
  insights.push(trend === 'improving' ? 
    '📈 Your deep work time is increasing - keep up the momentum!' :
    '📊 Consider protecting more time for focused work.');
  
  document.getElementById('insightsList').innerHTML = insights.map(i => 
    `<div class="insight-card">${i}</div>`
  ).join('');
}
