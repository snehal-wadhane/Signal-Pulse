// AI Dashboard - Display all AI features

document.addEventListener('DOMContentLoaded', loadAIDashboard);

async function loadAIDashboard() {
  try {
    const aiStats = await chrome.runtime.sendMessage({ action: 'getAIStats' });
    
    if (aiStats && aiStats.ai) {
      renderFocusPrediction(aiStats.ai.focusPrediction);
      renderPersona(aiStats.ai.persona);
      renderBurnoutAnalysis(aiStats.ai.burnout);
      renderRecommendations(aiStats.ai.recommendations);
    }
    
    const rlStats = await chrome.runtime.sendMessage({ action: 'getRLStats' });
    if (rlStats && rlStats.rlStats) {
      renderRLStats(rlStats.rlStats);
    }
    
  } catch (error) {
    console.error('Error loading AI dashboard:', error);
  }
}

function renderFocusPrediction(prediction) {
  const score = prediction.score || 0;
  const confidence = prediction.confidence || 0;
  
  document.getElementById('predictedScore').textContent = score;
  document.getElementById('scoreFill').style.width = score + '%';
  document.getElementById('confidence').textContent = (confidence * 100).toFixed(0) + '%';
}

function renderPersona(persona) {
  if (!persona) return;
  
  document.getElementById('personaName').textContent = persona.persona;
  
  const traitsHtml = persona.traits.map(trait => 
    `<span class="trait">${trait}</span>`
  ).join('');
  document.getElementById('personaTraits').innerHTML = traitsHtml;
  
  document.getElementById('personaAdvice').textContent = persona.advice;
  document.getElementById('personaConfidence').textContent = (persona.confidence * 100).toFixed(0) + '%';
}

function renderBurnoutAnalysis(burnout) {
  if (!burnout) return;
  
  const score = burnout.score || 0;
  const risk = burnout.risk || 'minimal';
  
  // Update risk circle
  const riskCircle = document.getElementById('riskCircle');
  riskCircle.textContent = score;
  riskCircle.className = 'risk-circle risk-' + risk;
  
  document.getElementById('riskMessage').textContent = burnout.message;
  document.getElementById('riskLevel').textContent = 'Risk Level: ' + risk.toUpperCase();
  
  // Show factors
  if (burnout.factors) {
    const factorsHtml = `
      <div class="metric">
        <span class="metric-label">Late Night Work</span>
        <span class="metric-value">${burnout.factors.lateNightWork} sessions</span>
      </div>
      <div class="metric">
        <span class="metric-label">Weekend Work</span>
        <span class="metric-value">${burnout.factors.weekendWork} sessions</span>
      </div>
      <div class="metric">
        <span class="metric-label">Avg Deep Work/Day</span>
        <span class="metric-value">${burnout.factors.avgDeepWorkHours}h</span>
      </div>
      <div class="metric">
        <span class="metric-label">Fragmentation Trend</span>
        <span class="metric-value">${burnout.factors.fragmentationTrend}</span>
      </div>
    `;
    document.getElementById('riskFactors').innerHTML = factorsHtml;
  }
  
  // Show recommendations
  if (burnout.recommendations && burnout.recommendations.length > 0) {
    const recsHtml = '<h3 style="margin-top: 20px; margin-bottom: 10px; color: #667eea;">Recommendations:</h3>' +
      burnout.recommendations.map(rec => 
        `<div style="padding: 8px 0; color: #cbd5e1;">• ${rec}</div>`
      ).join('');
    document.getElementById('burnoutRecommendations').innerHTML = recsHtml;
  }
}

function renderRecommendations(recommendations) {
  if (!recommendations || recommendations.length === 0) {
    document.getElementById('recommendations').innerHTML = 
      '<p style="color: #94a3b8;">No recommendations available yet. Keep using Signal Pulse to generate AI insights!</p>';
    return;
  }
  
  const recsHtml = recommendations.map(rec => `
    <div class="recommendation">
      <div class="recommendation-title">
        ${rec.title}
        <span class="confidence">${(rec.confidence * 100).toFixed(0)}% confidence</span>
      </div>
      <div style="color: #cbd5e1; font-size: 14px;">${rec.message}</div>
      <div style="margin-top: 8px; font-size: 12px; color: #94a3b8;">
        Type: ${rec.type} | Action: ${rec.action}
      </div>
    </div>
  `).join('');
  
  document.getElementById('recommendations').innerHTML = recsHtml;
}

function renderRLStats(stats) {
  document.getElementById('totalNudges').textContent = stats.totalNudges || 0;
  document.getElementById('acceptanceRate').textContent = stats.acceptanceRate || '0%';
  document.getElementById('statesLearned').textContent = stats.statesLearned || 0;
  document.getElementById('avgReward').textContent = stats.avgReward || '0.00';
}

// Auto-refresh every 30 seconds
setInterval(loadAIDashboard, 30000);
