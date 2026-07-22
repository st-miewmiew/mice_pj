function daysUntil(dateStr){
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const b = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((b - a) / 86400000);
}

function renderHero(data){
  document.getElementById("breadcrumb").textContent = data.hero.breadcrumb;
  document.getElementById("org-tag").textContent = data.org;
  document.getElementById("title").textContent = data.title;
  document.getElementById("subtitle").textContent = data.subtitle || "";
  if (data.docsUrl) document.getElementById("docs-link").href = data.docsUrl;

  document.getElementById("badges").innerHTML = data.hero.badges.map(b =>
    `<span class="badge">${b.label}</span>`).join("");

  document.getElementById("meta-row").innerHTML = data.hero.metaRow.map(m =>
    `<div>${m}</div>`).join("");
}

function renderLive(data){
  const d = daysUntil(data.live.nextDeadline);
  let countdownLabel, countdownClass;
  if (d < 0){ countdownLabel = `期限超過 ${Math.abs(d)}日`; countdownClass = "today"; }
  else if (d === 0){ countdownLabel = "本日締切"; countdownClass = "today"; }
  else { countdownLabel = `あと ${d} 日`; countdownClass = ""; }

  const pct = Math.round(data.live.progress * 100);

  document.getElementById("live-card").innerHTML = `
    <div class="live-top">
      <div>
        <div class="live-label">現在のフェーズ</div>
        <div class="live-phase">${data.live.phase}</div>
      </div>
      <span class="countdown ${countdownClass}">${countdownLabel}</span>
    </div>
    <div class="progress-row">
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="progress-pct tabular">${pct}%</div>
    </div>
    <div class="next-milestone">次のマイルストーン：${data.live.nextMilestone}</div>
  `;
}

function renderAlert(data){
  const el = document.getElementById("alert");
  if (!data.alert){ el.style.display = "none"; return; }
  el.innerHTML = data.alert;
}

function renderStats(items){
  return `<div class="stats-grid">${items.map(it => `
    <div class="stat-tile">
      <div><span class="stat-number tabular" style="${it.numberStyle||''}">${it.number}</span><span class="stat-unit">${it.unit}</span></div>
      <div class="stat-label">${it.label}</div>
    </div>`).join("")}</div>`;
}

function renderTable(sec){
  return `
    ${sec.heading ? `<p class="block-heading">${sec.heading}</p>` : ""}
    <div class="table-scroll"><table>
      <thead><tr>${sec.head.map(h => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${sec.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>`;
}

function renderGantt(sec){
  const cols = sec.months.length;
  const monthHeaders = sec.months.map(m => `<span>${m}</span>`).join("");
  const rows = sec.rows.map(r => `
    <div class="gantt-label">${r.label}</div>
    <div class="gantt-bar-wrap" style="grid-column:2 / span ${cols}; display:grid; grid-template-columns:repeat(${cols},1fr);">
      <div class="gantt-bar ${r.status}" style="grid-column:${r.start+1} / span ${r.span};" title="${r.text}">${r.text}</div>
    </div>`).join("");
  return `
    ${sec.heading ? `<p class="block-heading">${sec.heading}</p>` : ""}
    <div class="gantt"><div class="gantt-scroll">
      <div class="gantt-grid" style="grid-template-columns:200px repeat(${cols},1fr);">
        <div></div>
        <div class="gantt-months" style="grid-column:2 / span ${cols}; display:grid; grid-template-columns:repeat(${cols},1fr);">${monthHeaders}</div>
        ${rows}
      </div>
    </div></div>`;
}

function renderTimeline(sec){
  return `
    ${sec.heading ? `<p class="block-heading">${sec.heading}</p>` : ""}
    <div class="timeline">${sec.items.map(it => `
      <div class="timeline-item ${it.done ? "done" : "pending"}">
        <div class="timeline-dot"></div>
        <div class="timeline-time tabular">${it.time}</div>
        <div class="timeline-ms">${it.milestone}</div>
        <div class="timeline-desc">${it.desc}</div>
      </div>`).join("")}</div>`;
}

function renderLinks(sec){
  return `<div class="links-grid">${sec.items.map(it => `
    <a class="link-card" href="${it.url}" target="_blank" rel="noopener">
      <span class="link-icon">${it.icon}</span>
      <span>
        <div class="link-title">${it.title}</div>
        <div class="link-desc">${it.desc}</div>
      </span>
    </a>`).join("")}</div>`;
}

function renderText(sec){
  return `
    ${sec.heading ? `<p class="block-heading">${sec.heading}</p>` : ""}
    <div class="text-card">${sec.html}</div>`;
}

function renderHighlight(sec){
  return `<div class="highlight-card">${sec.html}</div>`;
}

function renderSection(sec){
  let inner;
  switch(sec.type){
    case "highlight": inner = renderHighlight(sec); break;
    case "stats": inner = renderStats(sec.items); break;
    case "table": inner = renderTable(sec); break;
    case "gantt": inner = renderGantt(sec); break;
    case "timeline": inner = renderTimeline(sec); break;
    case "links": inner = renderLinks(sec); break;
    case "text": inner = renderText(sec); break;
    default: inner = "";
  }
  const head = sec.title ? `<div class="block-head"><span class="block-icon">${sec.icon||""}</span><span class="block-title">${sec.title}</span></div>` : "";
  return `<section class="block">${head}${inner}</section>`;
}

function renderTabsAndPanels(data){
  const tabsEl = document.getElementById("tabs");
  const panelsEl = document.getElementById("panels");

  tabsEl.innerHTML = data.tabs.map((t, i) =>
    `<button class="tab-btn${i===0 ? " active" : ""}" data-key="${t.key}">${t.label}</button>`).join("");

  panelsEl.innerHTML = data.tabs.map((t, i) => {
    const secs = data.sections.filter(s => s.tab === t.key).map(renderSection).join("");
    return `<div class="panel${i===0 ? " active" : ""}" data-key="${t.key}">
      <h2 class="panel-print-title print-only">${t.label}</h2>${secs}</div>`;
  }).join("");

  tabsEl.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key;
      tabsEl.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b === btn));
      panelsEl.querySelectorAll(".panel").forEach(p => p.classList.toggle("active", p.dataset.key === key));
    });
  });
}

function renderProject(data){
  document.title = data.title;
  renderHero(data);
  renderLive(data);
  renderAlert(data);
  renderTabsAndPanels(data);
  document.getElementById("app").style.display = "";
  document.getElementById("state-message").style.display = "none";
}

function showMessage(text){
  document.getElementById("state-message").textContent = text;
  document.getElementById("state-message").style.display = "";
  document.getElementById("app").style.display = "none";
}

function init(){
  const id = new URLSearchParams(location.search).get("id");
  if (!id){
    showMessage("プロジェクトが指定されていません（?id=<project-id> を指定してください）。");
    return;
  }
  fetch(`./${id}.json`)
    .then(res => {
      if (!res.ok) throw new Error(`not found: ${id}`);
      return res.json();
    })
    .then(renderProject)
    .catch(() => showMessage(`プロジェクト「${id}」のデータが見つかりませんでした。`));
}

init();
