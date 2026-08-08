/**
 * Agriculture Website Dashboard Analytics JS (Expanded)
 * Manages full client-side calculations, terminal streams, and node maps.
 */

document.addEventListener('DOMContentLoaded', () => {
  initDashboardCharts();
  initValves();
  initAnalyticsSimulation();
  initSoilExplorer();
  
  // New Interactive Modules
  initNPKCalculator();
  initSectorMap();
  initThresholdPlanner();
  initFirmwareBroadcaster();
  initThreatAlerts();
  initServerNodeMap();
  initResourceGauges();
});

/* ==========================================
   SVG Charts Rendering
   ========================================== */
function initDashboardCharts() {
  const yieldChart = document.getElementById('yield-chart');
  const moistureChart = document.getElementById('moisture-chart');
  
  if (yieldChart) {
    renderLineChart(yieldChart, {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      datasets: [
        {
          name: 'Crop Yield (Tons)',
          data: [12, 19, 15, 25, 22, 30, 28],
          color: 'var(--color-primary)',
          gradientId: 'chart-gradient'
        },
        {
          name: 'Forecast Yield',
          data: [14, 17, 18, 22, 26, 28, 35],
          color: 'var(--color-accent)',
          gradientId: 'chart-gradient-secondary'
        }
      ]
    });
  }

  if (moistureChart) {
    renderLineChart(moistureChart, {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          name: 'Soil Moisture (%)',
          data: [65, 62, 58, 70, 72, 68, 64],
          color: 'var(--color-secondary)',
          gradientId: 'chart-gradient'
        }
      ]
    });
  }
}

function renderLineChart(svgElement, chartData) {
  const defs = svgElement.querySelector('defs');
  svgElement.innerHTML = '';
  if (defs) svgElement.appendChild(defs);

  const width = svgElement.clientWidth || 600;
  const height = svgElement.clientHeight || 250;
  
  // Set viewBox and responsive scaling attributes
  svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svgElement.setAttribute('width', '100%');
  svgElement.setAttribute('height', '100%');

  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  const labels = chartData.labels;
  const datasets = chartData.datasets;
  
  let allVals = [];
  datasets.forEach(d => allVals.push(...d.data));
  const maxVal = Math.max(...allVals) * 1.15;
  const minVal = 0;
  const range = maxVal - minVal;

  const gridLinesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  gridLinesGroup.setAttribute('class', 'chart-grid-lines');
  
  const yTicks = 4;
  for (let i = 0; i <= yTicks; i++) {
    const yVal = minVal + (range / yTicks) * i;
    const yPos = height - paddingBottom - (chartHeight / yTicks) * i;
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', paddingLeft);
    line.setAttribute('y1', yPos);
    line.setAttribute('x2', width - paddingRight);
    line.setAttribute('y2', yPos);
    line.setAttribute('class', 'chart-grid-line');
    gridLinesGroup.appendChild(line);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', paddingLeft - 10);
    text.setAttribute('y', yPos + 4);
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('font-size', '10px');
    text.setAttribute('fill', 'var(--text-muted)');
    text.textContent = Math.round(yVal);
    gridLinesGroup.appendChild(text);
  }
  
  const xTicks = labels.length;
  labels.forEach((label, index) => {
    const xPos = paddingLeft + (chartWidth / (xTicks - 1)) * index;
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', xPos);
    text.setAttribute('y', height - 15);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '10px');
    text.setAttribute('fill', 'var(--text-muted)');
    text.textContent = label;
    gridLinesGroup.appendChild(text);
  });
  
  svgElement.appendChild(gridLinesGroup);

  let tooltip = document.querySelector('.chart-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    document.body.appendChild(tooltip);
  }

  datasets.forEach((dataset, setIndex) => {
    const points = dataset.data.map((val, index) => {
      const x = paddingLeft + (chartWidth / (xTicks - 1)) * index;
      const y = height - paddingBottom - (chartHeight * (val - minVal)) / range;
      return { x, y, val, label: labels[index] };
    });
    
    // Prevent runtime crashes if points array is empty
    if (points.length === 0) return;
    
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cpX1 = points[i-1].x + (points[i].x - points[i-1].x) / 2;
      const cpY1 = points[i-1].y;
      const cpX2 = points[i-1].x + (points[i].x - points[i-1].x) / 2;
      const cpY2 = points[i].y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
    }
    
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
    
    const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    areaPath.setAttribute('d', areaD);
    areaPath.setAttribute('class', setIndex === 0 ? 'chart-area' : 'chart-area-secondary');
    svgElement.appendChild(areaPath);
    
    const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    linePath.setAttribute('d', pathD);
    linePath.setAttribute('class', setIndex === 0 ? 'chart-line' : 'chart-line-secondary');
    svgElement.appendChild(linePath);
    
    points.forEach(pt => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pt.x);
      circle.setAttribute('cy', pt.y);
      circle.setAttribute('r', '5');
      circle.setAttribute('class', 'chart-dot');
      circle.style.stroke = dataset.color;
      
      circle.addEventListener('mouseenter', (e) => {
        tooltip.innerHTML = `<strong>${dataset.name}</strong><br>${pt.label}: ${pt.val}`;
        tooltip.style.opacity = '1';
        
        const rect = e.target.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX - 40}px`;
        tooltip.style.top = `${rect.top + window.scrollY - 60}px`;
        e.target.setAttribute('r', '8');
      });
      
      circle.addEventListener('mouseleave', (e) => {
        tooltip.style.opacity = '0';
        e.target.setAttribute('r', '5');
      });
      
      svgElement.appendChild(circle);
    });
  });
}

/* ==========================================
   Irrigation Valve Controls & Log Feed
   ========================================== */
function initValves() {
  const switches = document.querySelectorAll('.valve-switch');
  
  switches.forEach(sw => {
    sw.addEventListener('change', (e) => {
      const zoneName = e.target.getAttribute('data-zone') || 'Zone';
      const status = e.target.checked ? 'OPENED' : 'CLOSED';
      
      updateValveIndicator(zoneName, e.target.checked);
      logActivity(`<strong>${zoneName}</strong> valve was ${status} dynamically.`);
      
      updateSectorsFromValves(zoneName, e.target.checked);
    });
  });
}

function updateValveIndicator(zoneName, isActive) {
  const indicator = document.getElementById(`status-${zoneName.toLowerCase().replace(' ', '-')}`);
  if (indicator) {
    indicator.className = isActive ? 'status-badge status-active' : 'status-badge status-danger';
    indicator.innerHTML = isActive ? 
      '<span class="dot">●</span> Active' : '<span class="dot">●</span> Inactive';
  }
}

function logActivity(text) {
  const logContainer = document.getElementById('valve-activity-log');
  if (!logContainer) return;
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const entry = document.createElement('div');
  entry.style.paddingBlock = '0.5rem';
  entry.style.borderBottom = '1px solid var(--border-color)';
  entry.style.fontSize = '0.85rem';
  entry.style.animation = 'fadeIn 0.3s ease-out';
  entry.innerHTML = `<span style="color:var(--text-muted)">[${time}]</span> ${text}`;
  
  logContainer.insertBefore(entry, logContainer.firstChild);
  if (logContainer.children.length > 5) {
    logContainer.removeChild(logContainer.lastChild);
  }
}

/* ==========================================
   Interactive Farm Sector Map
   ========================================== */
function updateSectorAriaLabel(sec) {
  const name = sec.getAttribute('data-sector') || '';
  const typeEl = sec.querySelector('span:not(.sector-status)');
  const type = typeEl ? typeEl.textContent : '';
  const statusEl = sec.querySelector('.sector-status');
  const status = statusEl ? statusEl.textContent : '';
  sec.setAttribute('aria-label', `${name} - ${type}. Status: ${status}. Click to toggle watering.`);
}

function initSectorMap() {
  const sectors = document.querySelectorAll('.sector-card');
  sectors.forEach(sec => {
    updateSectorAriaLabel(sec);
    
    sec.addEventListener('click', () => {
      const isWet = sec.classList.contains('wet');
      const name = sec.getAttribute('data-sector') || 'Sector';
      
      if (isWet) {
        sec.classList.remove('wet');
        sec.classList.add('dry');
        sec.querySelector('.sector-status').textContent = 'Dry (42%)';
        logActivity(`Manual override: Irrigation cut for <strong>${name}</strong>.`);
      } else {
        sec.classList.remove('dry');
        sec.classList.add('wet');
        sec.querySelector('.sector-status').textContent = 'Optimal (72%)';
        logActivity(`Manual override: Watered <strong>${name}</strong>.`);
      }
      updateSectorAriaLabel(sec);
    });

    sec.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        sec.click();
      }
    });
  });
}

function updateSectorsFromValves(zoneName, isActive) {
  const sectors = document.querySelectorAll('.sector-card');
  sectors.forEach(sec => {
    const secZone = sec.getAttribute('data-zone-group');
    if (secZone === zoneName) {
      if (isActive) {
        sec.classList.remove('dry');
        sec.classList.add('wet');
        sec.querySelector('.sector-status').textContent = 'Optimal (76%)';
      } else {
        sec.classList.remove('wet');
        sec.classList.add('dry');
        sec.querySelector('.sector-status').textContent = 'Dry (45%)';
      }
      updateSectorAriaLabel(sec);
    }
  });
}

/* ==========================================
   Soil Moisture Threshold Planner
   ========================================== */
function initThresholdPlanner() {
  const slider = document.getElementById('moisture-threshold-slider');
  const valueDisplay = document.getElementById('moisture-threshold-value');
  
  if (!slider || !valueDisplay) return;
  
  slider.addEventListener('input', (e) => {
    valueDisplay.textContent = e.target.value + '%';
  });
  
  slider.addEventListener('change', (e) => {
    logActivity(`Automated trigger limit adjusted to: <strong>${e.target.value}%</strong> moisture.`);
  });
}

/* ==========================================
   NPK Fertilizer Calculator
   ========================================== */
function initNPKCalculator() {
  const calcForm = document.getElementById('npk-calculator-form');
  const resultsDiv = document.getElementById('npk-results');
  
  if (!calcForm || !resultsDiv) return;
  
  calcForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const n = parseInt(document.getElementById('npk-n').value) || 0;
    const p = parseInt(document.getElementById('npk-p').value) || 0;
    const k = parseInt(document.getElementById('npk-k').value) || 0;
    
    let recipe = '';
    let recommendation = '';
    
    if (n < 20) {
      recipe += '<li><strong>Blood Meal (12-0-0)</strong>: Apply 5 lbs per 100 sqft to restore Nitrogen levels.</li>';
    }
    if (p < 20) {
      recipe += '<li><strong>Bone Meal (3-15-0)</strong>: Apply 4 lbs per 100 sqft to restore Phosphorus levels.</li>';
    }
    if (k < 20) {
      recipe += '<li><strong>Wood Ash (0-1-7)</strong>: Apply 3 lbs per 100 sqft to restore Potassium levels.</li>';
    }
    
    if (!recipe) {
      recommendation = '<strong style="color:var(--color-success)">Soil N-P-K balance is optimal.</strong> No organic corrections required for this crop cycle.';
    } else {
      recommendation = `
        <strong style="color:var(--color-accent-hover)">Deficiencies detected. Recommended correction recipes:</strong>
        <ul style="margin-top:0.5rem; padding-inline-start:1.2rem; font-size:0.9rem; display:flex; flex-direction:column; gap:0.5rem; text-align:start;">
          ${recipe}
        </ul>
      `;
    }
    
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = recommendation;
  });
}

/* ==========================================
   Admin Broadcaster & Simulated Terminal
   ========================================== */
function initFirmwareBroadcaster() {
  const btn = document.getElementById('btn-broadcast-firmware');
  const consoleLog = document.getElementById('terminal-log-output');
  
  if (!btn || !consoleLog) return;
  
  let isRunning = false;
  
  btn.addEventListener('click', () => {
    if (isRunning) return;
    isRunning = true;
    btn.disabled = true;
    consoleLog.innerHTML = '<div class="terminal-line info">> Initiating node broadcast command...</div>';
    
    const logs = [
      { text: '> Connecting to local gateway nodes...', type: 'info', delay: 800 },
      { text: '> Mesh authorization handshake: SECURE (TLS 1.3)', type: 'info', delay: 1600 },
      { text: '> Patch file validation: v4.8.2 (MD5 Verified)', type: 'info', delay: 2400 },
      { text: '> WARNING: Sector C3 node battery latency high (180ms)', type: 'warn', delay: 3200 },
      { text: '> Uploading patch bytes... [██████████████] 100%', type: 'info', delay: 4000 },
      { text: '> Broadcast successful. Rebooting 14,892 nodes...', type: 'info', delay: 4800 },
      { text: '> Nodes online. System calibration audit completed.', type: 'info', delay: 5600 }
    ];
    
    logs.forEach(log => {
      setTimeout(() => {
        const line = document.createElement('div');
        line.className = `terminal-line ${log.type}`;
        line.textContent = log.text;
        consoleLog.appendChild(line);
        consoleLog.scrollTop = consoleLog.scrollHeight;
        
        if (log.delay === 5600) {
          isRunning = false;
          btn.disabled = false;
        }
      }, log.delay);
    });
  });
}

/* ==========================================
   Admin Threat Warning Controls
   ========================================== */
function initThreatAlerts() {
  const buttons = document.querySelectorAll('.btn-mute-threat');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.threat-card');
      if (card) {
        card.classList.toggle('muted');
        const textSpan = e.target.querySelector('span') || e.target;
        if (card.classList.contains('muted')) {
          textSpan.textContent = 'Unmute';
        } else {
          textSpan.textContent = 'Mute Alert';
        }
      }
    });
  });
}

/* ==========================================
   Interactive Server Node Map
   ========================================== */
function initServerNodeMap() {
  const points = document.querySelectorAll('.node-point');
  const detailsPanel = document.getElementById('node-stats-details');
  
  if (!points.length || !detailsPanel) return;
  
  const nodeStats = {
    'node-pt-1': { name: 'North America Hub (HQ)', lat: '30.267° N', lon: '97.743° W', ping: '12ms', drop: '0.01%', status: 'Online' },
    'node-pt-2': { name: 'South America AgriGrid', lat: '15.780° S', lon: '47.929° W', ping: '42ms', drop: '0.04%', status: 'Online' },
    'node-pt-3': { name: 'Europe Biosphere Server', lat: '50.110° N', lon: '8.682° E', ping: '22ms', drop: '0.01%', status: 'Online' },
    'node-pt-4': { name: 'Asia Seed Grid Hub', lat: '35.676° N', lon: '139.650° E', ping: '84ms', drop: '0.12%', status: 'Online' }
  };
  
  points.forEach(pt => {
    pt.addEventListener('click', () => {
      points.forEach(p => p.classList.remove('active'));
      pt.classList.add('active');
      
      const id = pt.getAttribute('id');
      const stat = nodeStats[id];
      if (stat) {
        detailsPanel.style.display = 'block';
        detailsPanel.innerHTML = `
          <h5 style="color:var(--color-primary); margin-bottom:0.5rem; text-align:start;">${stat.name}</h5>
          <div style="font-size:0.8rem; display:flex; flex-direction:column; gap:0.25rem; color:var(--text-secondary); text-align:start;">
            <div><strong>Location:</strong> ${stat.lat}, ${stat.lon}</div>
            <div><strong>Network Ping:</strong> ${stat.ping}</div>
            <div><strong>Packet Drops:</strong> ${stat.drop}</div>
            <div><strong>Access State:</strong> <span style="color:var(--color-success)">${stat.status}</span></div>
          </div>
        `;
      }
    });

    pt.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        pt.click();
      }
    });
  });
}

/* ==========================================
   System Resource Gauges
   ========================================== */
function initResourceGauges() {
  const gauges = document.querySelectorAll('.gauge-bar-inner');
  gauges.forEach(gauge => {
    const val = gauge.getAttribute('data-value') || '0';
    setTimeout(() => {
      gauge.style.width = val + '%';
    }, 500);
  });
}

/* ==========================================
   Real-Time Data Simulators (Humidity/Moisture)
   ========================================== */
function initAnalyticsSimulation() {
  const tempVal = document.getElementById('sim-temp');
  const moistureVal = document.getElementById('sim-moisture');
  const humidityVal = document.getElementById('sim-humidity');
  
  if (!tempVal && !moistureVal && !humidityVal) return;
  
  setInterval(() => {
    if (tempVal && Math.random() > 0.6) {
      const current = parseFloat(tempVal.textContent);
      const delta = (Math.random() - 0.5) * 0.4;
      tempVal.textContent = (current + delta).toFixed(1) + '°C';
    }
    
    if (moistureVal && Math.random() > 0.7) {
      const current = parseInt(moistureVal.textContent);
      const delta = Math.random() > 0.5 ? 1 : -1;
      const next = Math.max(30, Math.min(95, current + delta));
      moistureVal.textContent = next + '%';
      
      const sectorCard = document.querySelector('.sector-card[data-sector="Sector A1"]');
      if (sectorCard) {
        if (sectorCard.classList.contains('dry')) {
          const dryNext = Math.max(30, Math.min(48, next - 25));
          sectorCard.querySelector('.sector-status').textContent = `Dry (${dryNext}%)`;
        } else {
          sectorCard.querySelector('.sector-status').textContent = `Optimal (${next}%)`;
        }
        updateSectorAriaLabel(sectorCard);
      }
    }
  }, 4000);
}

/* ==========================================
   Soil Layer Detail Explorer (Organic Farming)
   ========================================== */
function initSoilExplorer() {
  const soilLayers = document.querySelectorAll('.soil-layer');
  const detailsPanel = document.getElementById('soil-details-content');
  
  if (!soilLayers.length || !detailsPanel) return;

  const soilData = {
    'layer-1': {
      title: 'O-Horizon & Topsoil (Humus)',
      desc: 'Highly organic, loose material containing decomposed leaves, organic waste, and critical living microorganisms. Packed with rich nutrients that feed agriculture plants.',
      ph: '6.2 - 6.8 (Optimal for crops)',
      depth: '0 - 10 inches'
    },
    'layer-2': {
      title: 'A & B-Horizon (Subsoil)',
      desc: 'Dense accumulation of clay, iron oxide, and minerals washed down from the topsoil. Provides physical stability to root systems, retaining moisture for dry seasons.',
      ph: '5.8 - 6.5',
      depth: '10 - 30 inches'
    },
    'layer-3': {
      title: 'C-Horizon (Substratum)',
      desc: 'Weathered parent rock material. Mostly void of organic matter. Contains loose geological particles and cracked stone debris undergoing long-term decomposition.',
      ph: '7.0 - 7.5 (Alkaline rock deposits)',
      depth: '30 - 72 inches'
    },
    'layer-4': {
      title: 'R-Horizon (Bedrock)',
      desc: 'Continuous solid igneous, metamorphic, or sedimentary rock base. Forms the absolute physical foundation of the farm topography, preventing aquifer loss.',
      ph: 'N/A',
      depth: '72+ inches'
    }
  };

  soilLayers.forEach(layer => {
    layer.addEventListener('click', () => {
      const layerId = layer.getAttribute('data-layer');
      const data = soilData[layerId];
      
      if (data) {
        detailsPanel.style.display = 'block';
        detailsPanel.innerHTML = `
          <h4 style="margin-bottom:0.75rem; color:var(--color-primary)">${data.title}</h4>
          <p style="margin-bottom:0.75rem; font-size:0.95rem; color:var(--text-secondary)">${data.desc}</p>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; font-size:0.85rem; padding-top:0.5rem; border-top:1px solid var(--border-color)">
            <div><strong>Depth Span:</strong> ${data.depth}</div>
            <div><strong>pH Value:</strong> ${data.ph}</div>
          </div>
        `;
        if (window.innerWidth < 768) {
          detailsPanel.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}
