/* ============================================================
   深流 · 核心逻辑
   任务只录入一次；周期(daily/weekly/monthly/once)自动展开到周视图；
   象限与深浅作为属性编码在卡片上；完成状态按「出现日期」记录。
   ============================================================ */

const STORE_KEY = "whitespace.tasks.v1";
const IDEAS_KEY = "whitespace.ideas.v1";
const SETTINGS_KEY = "whitespace.settings.v1";
const TIMER_KEY = "whitespace.timer.v1";
const LANG_KEY = "whitespace.lang";
const DEFAULT_DEEP_GOAL = 240; // 每日深度时长目标默认 4 小时

/* 旧键一次性迁移：早期项目名 deepweek.* → whitespace.*，老数据无感搬家 */
(function migrateLegacyKeys() {
  [
    ["deepweek.tasks.v1", STORE_KEY],
    ["deepweek.ideas.v1", IDEAS_KEY],
    ["deepweek.settings.v1", SETTINGS_KEY],
    ["deepweek.timer.v1", TIMER_KEY],
    ["deepweek.lang", LANG_KEY],
  ].forEach(([oldKey, newKey]) => {
    if (localStorage.getItem(newKey) === null && localStorage.getItem(oldKey) !== null) {
      localStorage.setItem(newKey, localStorage.getItem(oldKey));
    }
  });
})();

/* ---------- 国际化 ---------- */
const I18N = {
  zh: {
    brandName: "留白",
    tagline: "为深度思考留白",
    backToday: "回到本周",
    deepLabel: "本周深度", deepStatTitle: "本周已完成的深度时长 / 计划深度时长",
    aiLabel: "等待 AI", aiStatTitle: "等待 AI 的任务 · 点击筛选",
    fAll: "全部", q1: "重要 · 紧急", q2: "重要 · 不紧急", q3: "紧急 · 不重要", q4: "不重要 · 不紧急",
    depthAll: "全部深浅", depthDeep: "只看深度", depthShallow: "只看碎片",
    showDone: "显示已完成", hideDone: "隐藏已完成",
    newTask: "＋ 新任务",
    days: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    cycles: { daily: "每日", weekly: "每周", monthly: "每月" },
    weekRange: (a, b) => `${a.getMonth() + 1}月${a.getDate()}日 – ${b.getMonth() + 1}月${b.getDate()}日`,
    meterTitle: goal => `今日深度时长（目标 ${goal}）`,
    empty: "守护这片留白",
    tagDeep: "深度", tagAI: "⧖ 等待 AI", tagAITitle: "已委托 AI，等待产出 · 在编辑弹窗中修改状态",
    markDone: "标记完成", unmarkDone: "取消完成",
    modalNew: "新任务", modalEdit: "编辑任务",
    placeholder: "写下要做的事…",
    fTask: "任务", fDepthLabel: "深浅", depthHint: "深度任务计入每日深度时长",
    btnDeep: "🜁 深度", btnShallow: "碎片",
    fCycleLabel: "周期", cOnce: "一次", cDaily: "每日", cWeekly: "每周", cMonthly: "每月",
    fDate: "日期", fWeekday: "每周几",
    wd0: "一", wd1: "二", wd2: "三", wd3: "四", wd4: "五", wd5: "六", wd6: "日",
    fMonthDay: "每月几号", fQuadrantLabel: "象限",
    fDuration: "预计时长",
    d15: "15 分钟", d30: "30 分钟", d45: "45 分钟", d60: "1 小时",
    d90: "1.5 小时", d120: "2 小时", d180: "3 小时", d240: "4 小时",
    fAI: "AI 状态", aiCheck: "⧖ 已委托 AI，等待产出",
    btnDelete: "删除", btnCancel: "取消", btnSave: "保存",
    footnote: "时间只是我垂钓的溪流。",
    langBtn: "EN",
    inboxLabel: "收集箱", inboxTitle: "想法收集箱",
    inboxHint: "长期、不紧急的念头先放这里，不随周切换消失。",
    ideaPh: "记下一闪而过的念头…", ideaAdd: "添加",
    ideaEmpty: "空空如也 —— 想法都各归其位了", ideaToTask: "转为任务",
    overdue: "逾期",
    scopeAll: "每天", scopeWork: "工作日", scopeWeekend: "周末",
    settingsBtn: "⚙ 设置",
    fNote: "备注", notePh: "补充说明（可选）",
    goalLabel: "每日深度目标", exportBtn: "导出数据", importBtn: "导入数据",
    importBad: "文件格式不对，导入失败",
    reviewTitle: "本周复盘", reviewTotal: "深度总计", reviewHit: "达标天数", reviewBest: "最深一天",
    dNone: "无",
    timerStart: "开始专注计时", timerStop: "结束计时", trackedTitle: "实际专注时长",
    timerPause: "暂停", timerResume: "继续",
    backupLabel: "文件自动备份", backupChoose: "选择备份文件…", backupStop: "关闭自动备份",
    backupResume: "恢复自动备份（需授权）", backupOn: "每次改动自动写入",
    backupSaved: "已写入", backupUnsupported: "当前浏览器不支持（请用 Chrome / Edge）",
    copiedToast: "已复制", pastedToast: "已粘贴", cutToast: "已剪切",
    d300: "5 小时", d360: "6 小时", d480: "8 小时",
  },
  en: {
    brandName: "Whitespace",
    tagline: "Room for deep thinking",
    backToday: "Back to this week",
    deepLabel: "Deep this week", deepStatTitle: "Deep hours done / planned this week",
    aiLabel: "Waiting on AI", aiStatTitle: "Tasks waiting on AI · click to filter",
    fAll: "All", q1: "Important · Urgent", q2: "Important · Not urgent", q3: "Urgent · Not important", q4: "Neither",
    depthAll: "All depths", depthDeep: "Deep only", depthShallow: "Shallow only",
    showDone: "Show done", hideDone: "Hide done",
    newTask: "＋ New task",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    cycles: { daily: "Daily", weekly: "Weekly", monthly: "Monthly" },
    weekRange: (a, b) => {
      const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${M[a.getMonth()]} ${a.getDate()} – ${M[b.getMonth()]} ${b.getDate()}`;
    },
    meterTitle: goal => `Deep hours today (goal ${goal})`,
    empty: "Protect this space.",
    tagDeep: "DEEP", tagAI: "⧖ Waiting AI", tagAITitle: "Delegated to AI · change status in the edit dialog",
    markDone: "Mark done", unmarkDone: "Undo done",
    modalNew: "New task", modalEdit: "Edit task",
    placeholder: "What needs doing…",
    fTask: "Task", fDepthLabel: "Depth", depthHint: "Deep tasks count toward daily deep hours",
    btnDeep: "🜁 Deep", btnShallow: "Shallow",
    fCycleLabel: "Cycle", cOnce: "Once", cDaily: "Daily", cWeekly: "Weekly", cMonthly: "Monthly",
    fDate: "Date", fWeekday: "Day of week",
    wd0: "Mo", wd1: "Tu", wd2: "We", wd3: "Th", wd4: "Fr", wd5: "Sa", wd6: "Su",
    fMonthDay: "Day of month", fQuadrantLabel: "Quadrant",
    fDuration: "Duration",
    d15: "15 min", d30: "30 min", d45: "45 min", d60: "1 hour",
    d90: "1.5 hours", d120: "2 hours", d180: "3 hours", d240: "4 hours",
    fAI: "AI status", aiCheck: "⧖ Delegated to AI, awaiting output",
    btnDelete: "Delete", btnCancel: "Cancel", btnSave: "Save",
    footnote: "Time is but the stream I go a-fishing in.",
    langBtn: "中",
    inboxLabel: "Inbox", inboxTitle: "Idea Inbox",
    inboxHint: "Long-term, non-urgent thoughts live here — they never vanish when weeks change.",
    ideaPh: "Catch a fleeting thought…", ideaAdd: "Add",
    ideaEmpty: "Empty — every thought has found its place", ideaToTask: "To task",
    overdue: "Overdue",
    scopeAll: "Every day", scopeWork: "Workdays", scopeWeekend: "Weekends",
    settingsBtn: "⚙ Settings",
    fNote: "Note", notePh: "Optional details…",
    goalLabel: "Daily deep goal", exportBtn: "Export data", importBtn: "Import data",
    importBad: "Invalid file, import failed",
    reviewTitle: "Week in review", reviewTotal: "Total deep", reviewHit: "Days at goal", reviewBest: "Deepest day",
    dNone: "None",
    timerStart: "Start focus timer", timerStop: "Stop timer", trackedTitle: "Actual focused time",
    timerPause: "Pause", timerResume: "Resume",
    backupLabel: "Auto-backup to file", backupChoose: "Choose backup file…", backupStop: "Turn off auto-backup",
    backupResume: "Resume auto-backup (grant access)", backupOn: "Writes on every change",
    backupSaved: "Saved", backupUnsupported: "Not supported in this browser (use Chrome / Edge)",
    copiedToast: "Copied", pastedToast: "Pasted", cutToast: "Cut",
    d300: "5 hours", d360: "6 hours", d480: "8 hours",
  },
};

let lang = localStorage.getItem(LANG_KEY) === "en" ? "en" : "zh";
const t = key => I18N[lang][key];

/* ---------- 状态 ---------- */
let tasks = load();
let ideas = loadJSON(IDEAS_KEY, null) ?? seedIdeas();
let settings = Object.assign({ deepGoal: DEFAULT_DEEP_GOAL }, loadJSON(SETTINGS_KEY, {}));
let weekOffset = 0; // 0 = 本周
let filters = { quadrant: 0, depth: "all", showCompleted: true, aiOnly: false };
let editingId = null;
let convertingIdeaId = null; // 正在从想法转任务
let draggingId = null;
let draggingFrom = null; // 拖拽起点日期（周期任务需要知道拖的是哪一天）
let clipboardTask = null; // ⌘C/⌘V 的任务剪贴板
let timer = loadJSON(TIMER_KEY, null); // { taskId, dateStr, startTs }
let timerTick = null;

/* ---------- 存取 ---------- */
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* 损坏则重置 */ }
  return fallback;
}
function load() {
  const arr = loadJSON(STORE_KEY, null) ?? seedTasks();
  // 旧版「每日」任务迁移为每周多选（每日 = 周一至周日全选）
  arr.forEach(tk => {
    if (tk.cycle === "daily") {
      tk.cycle = "weekly";
      tk.weekdays = tk.days === "workdays" ? [0, 1, 2, 3, 4]
        : tk.days === "weekends" ? [5, 6] : [0, 1, 2, 3, 4, 5, 6];
      delete tk.days;
    }
  });
  return arr;
}
function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(tasks));
  scheduleBackup();
}
function saveIdeas() {
  localStorage.setItem(IDEAS_KEY, JSON.stringify(ideas));
  scheduleBackup();
}
function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  scheduleBackup();
}

/* 首次打开的示例数据，帮助理解各属性如何归位 */
function seedTasks() {
  const today = fmtDate(new Date());
  return [
    { id: uid(), title: "论文核心章节写作（不受打扰）", depth: "deep", cycle: "weekly", weekdays: [0, 1, 2, 3, 4, 5, 6], quadrant: 2, duration: 120, waitingAI: false, completions: {} },
    { id: uid(), title: "每周复盘：本周深度时长与被打断次数", depth: "deep", cycle: "weekly", weekdays: [6], quadrant: 2, duration: 60, waitingAI: false, completions: {} },
    { id: uid(), title: "回复消息与邮件（集中批处理）", depth: "shallow", cycle: "weekly", weekdays: [0, 1, 2, 3, 4], quadrant: 3, duration: 30, waitingAI: false, completions: {} },
    { id: uid(), title: "让 AI 跑实验数据清洗", depth: "shallow", cycle: "once", date: today, quadrant: 1, duration: 15, waitingAI: true, completions: {} },
    { id: uid(), title: "每月整理知识库与归档", depth: "deep", cycle: "monthly", monthDay: 1, quadrant: 2, duration: 90, waitingAI: false, completions: {} },
  ];
}
function seedIdeas() {
  return [{ id: uid(), text: "写一篇关于 AI 与注意力的博客", createdAt: Date.now() }];
}

/* ---------- 日期工具 ---------- */
function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function mondayOf(offset) {
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // 周一=0
  const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + offset * 7);
  return mon;
}
function weekDates(offset) {
  const mon = mondayOf(offset);
  return Array.from({ length: 7 }, (_, i) =>
    new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i));
}
function minToLabel(min) {
  if (min < 60) return `${min}m`;
  const h = min / 60;
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
}

/* ---------- 周期展开：任务在某天是否出现 ---------- */
function occursOn(task, date) {
  const ds = fmtDate(date);
  const wd = (date.getDay() + 6) % 7; // 周一=0
  switch (task.cycle) {
    case "once":    return task.date === ds;
    case "daily": {
      const scope = task.days || "all";
      if (scope === "workdays") return wd < 5;
      if (scope === "weekends") return wd >= 5;
      return true;
    }
    case "weekly": {
      // 兼容旧数据：单数字 weekday → 数组 weekdays
      const wds = Array.isArray(task.weekdays) && task.weekdays.length
        ? task.weekdays : [Number(task.weekday) || 0];
      return wds.includes(wd);
    }
    case "monthly": {
      const dim = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      // 当月不足该日期时顺延到月末（如 31 号 → 2 月末）
      return date.getDate() === Math.min(Number(task.monthDay), dim);
    }
    default: return false;
  }
}
function isDone(task, dateStr) { return !!task.completions[dateStr]; }

/* 某任务当天的实际贡献：有实际计时用实际计时，否则用「完成 × 预估」兜底 */
function actualContribution(task, ds) {
  const tracked = (task.tracked && task.tracked[ds]) || 0;
  if (tracked > 0) return tracked;
  return isDone(task, ds) ? (task.duration || 0) : 0;
}

/* 周期标签：全选 7 天显示「每日」，工作日/周末显示对应快捷语义 */
function cycleLabel(task) {
  if (task.cycle === "monthly") return t("cycles").monthly;
  if (task.cycle === "weekly" || task.cycle === "daily") {
    const wds = Array.isArray(task.weekdays) && task.weekdays.length
      ? task.weekdays : [Number(task.weekday) || 0];
    if (wds.length === 7) return t("cycles").daily;
    const s = [...wds].sort().join(",");
    if (s === "0,1,2,3,4") return t("scopeWork");
    if (s === "5,6") return t("scopeWeekend");
    return t("cycles").weekly;
  }
  return "";
}

/* 某天的全部条目（含今天回卷的逾期任务） */
function dayEntries(date, ds, todayStr) {
  const occ = tasks.filter(t => occursOn(t, date)).map(t => ({ t, overdue: false }));
  if (ds === todayStr) {
    tasks.forEach(tk => {
      if (tk.cycle === "once" && tk.date < todayStr && !tk.completions[tk.date]) {
        occ.push({ t: tk, overdue: true });
      }
    });
  }
  return occ;
}

/* ---------- 渲染 ---------- */
const board = document.getElementById("board");

function render() {
  const dates = weekDates(weekOffset);
  const todayStr = fmtDate(new Date());

  // 顶栏周区间
  const [a, b] = [dates[0], dates[6]];
  document.getElementById("weekRange").textContent = t("weekRange")(a, b);
  document.getElementById("backToday").hidden = weekOffset === 0;

  board.innerHTML = "";
  dates.forEach((date, idx) => {
    const ds = fmtDate(date);
    const col = document.createElement("div");
    col.className = "day-col";
    col.dataset.date = ds;
    if (idx >= 5) col.classList.add("weekend");
    if (ds === todayStr) col.classList.add("today");

    const occ = dayEntries(date, ds, todayStr);

    // 排序：逾期 → 深度 → 象限（紧急重要 → 紧急不重要 → 重要不紧急 → 不紧急不重要）
    const Q_ORDER = { 1: 0, 3: 1, 2: 2, 4: 3 };
    const visible = occ
      .filter(({ t }) => filters.quadrant === 0 || t.quadrant === filters.quadrant)
      .filter(({ t }) => filters.depth === "all" || t.depth === filters.depth)
      .filter(({ t }) => filters.showCompleted || !isDone(t, ds))
      .filter(({ t }) => !filters.aiOnly || t.waitingAI)
      .sort((x, y) =>
        x.overdue !== y.overdue ? (x.overdue ? -1 : 1)
        : x.t.depth !== y.t.depth ? (x.t.depth === "deep" ? -1 : 1)
        : Q_ORDER[x.t.quadrant] - Q_ORDER[y.t.quadrant]);

    col.innerHTML = `
      <div class="day-head">
        <div class="day-name"><b>${t("days")[idx]}</b><span>${date.getMonth() + 1}/${date.getDate()}</span></div>
        <div class="deep-meter">
          <div class="bar"><i style="width:0"></i></div>
          <span class="num"></span>
        </div>
      </div>
      <div class="day-body"></div>`;

    const body = col.querySelector(".day-body");
    if (!visible.length) {
      body.innerHTML = `<div class="day-empty">${t("empty")}</div>`;
    } else {
      visible.forEach((entry, i) => body.appendChild(renderCard(entry.t, ds, i, entry.overdue)));
    }

    // 空白处双击快速新建：日期预填为该列
    col.addEventListener("dblclick", e => {
      if (e.target.closest(".card")) return;
      openModal(null, { date: ds });
    });

    // 拖拽落点：仅接受「一次性」任务
    col.addEventListener("dragover", e => {
      if (!draggingId) return;
      e.preventDefault();
      col.classList.add("drop-target");
    });
    col.addEventListener("dragleave", () => col.classList.remove("drop-target"));
    col.addEventListener("drop", e => {
      e.preventDefault();
      col.classList.remove("drop-target");
      const tk = tasks.find(x => x.id === draggingId);
      const from = draggingFrom;
      draggingId = null;
      draggingFrom = null;
      if (!tk || from === ds) return;
      if (tk.cycle === "once") {
        if (tk.completions[tk.date]) { // 完成记录跟随日期迁移
          tk.completions[ds] = tk.completions[tk.date];
          delete tk.completions[tk.date];
        }
        tk.date = ds;
      } else if (tk.cycle === "weekly") {
        // 把「被拖的那个周几」挪到目标周几，其它周几不变
        const srcWd = (new Date(`${from}T00:00:00`).getDay() + 6) % 7;
        const tgtWd = (date.getDay() + 6) % 7;
        const wds = Array.isArray(tk.weekdays) && tk.weekdays.length
          ? tk.weekdays : [Number(tk.weekday) || 0];
        const next = wds.filter(w => w !== srcWd);
        if (!next.includes(tgtWd)) next.push(tgtWd);
        tk.weekdays = next.sort((a, b) => a - b);
      } else if (tk.cycle === "monthly") {
        tk.monthDay = date.getDate();
      }
      save(); render();
    });

    board.appendChild(col);
  });

  updateStats();
}

/* 只刷统计（日进度条 / 顶栏深度 / 节奏刻度 / AI 徽标），不重建卡片 */
function updateStats() {
  const dates = weekDates(weekOffset);
  const todayStr = fmtDate(new Date());
  const goal = settings.deepGoal || DEFAULT_DEEP_GOAL;
  let deepDone = 0, deepPlanned = 0;
  const perDay = [];

  dates.forEach((date, idx) => {
    const ds = fmtDate(date);
    let done = 0, plan = 0;
    dayEntries(date, ds, todayStr).forEach(({ t }) => {
      if (t.depth === "deep") {
        plan += t.duration || 0;
        done += actualContribution(t, ds);
      }
    });
    deepDone += done;
    deepPlanned += plan;
    perDay.push(done);

    const col = board.children[idx];
    if (!col) return;
    const pct = Math.min(100, (done / goal) * 100);
    col.querySelector(".deep-meter").title = t("meterTitle")(minToLabel(goal));
    col.querySelector(".deep-meter .bar i").style.width = `${pct}%`;
    col.querySelector(".deep-meter .num").innerHTML = `<b>${minToLabel(done)}</b>/${minToLabel(goal)}`;
  });

  document.getElementById("deepDone").textContent = (deepDone / 60).toFixed(1).replace(/\.0$/, "");
  document.getElementById("deepPlanned").textContent = (deepPlanned / 60).toFixed(1).replace(/\.0$/, "");

  // 深度节奏：7 个小刻度，哪天真的有深度时间一目了然
  const rhythm = document.getElementById("deepRhythm");
  rhythm.innerHTML = perDay.map((done, i) => {
    const ratio = Math.min(1, done / goal);
    const h = 4 + Math.round(ratio * 10);
    const now = fmtDate(dates[i]) === todayStr ? " now" : "";
    const lit = ratio > 0 ? " lit" : "";
    const op = ratio > 0 ? (0.4 + ratio * 0.6).toFixed(2) : 1;
    return `<i class="tick${lit}${now}" style="height:${h}px;opacity:${op}" title="${t("days")[i]} ${minToLabel(done)}"></i>`;
  }).join("");

  const aiCount = tasks.filter(t => t.waitingAI).length;
  document.getElementById("aiCount").textContent = aiCount;
  const aiBadge = document.getElementById("aiBadge");
  aiBadge.classList.toggle("zero", aiCount === 0);
  aiBadge.classList.toggle("active", filters.aiOnly);
}

function renderCard(task, dateStr, index, overdue = false) {
  const done = isDone(task, dateStr);
  const el = document.createElement("article");
  el.className = `card ${task.depth === "deep" ? "deep" : ""} ${done ? "done" : ""} ${task.waitingAI ? "waiting-ai" : ""} ${overdue ? "overdue" : ""}`;
  el.style.setProperty("--qc", `var(--q${task.quadrant})`);
  el.style.animationDelay = `${Math.min(index * 40, 240)}ms`;
  el.dataset.tid = task.id;
  el.dataset.date = dateStr;

  const tags = [];
  if (overdue) tags.push(`<span class="tag overdue-mark">${t("overdue")}</span>`);
  if (task.depth === "deep") tags.push(`<span class="tag deep-mark">${t("tagDeep")}</span>`);
  if (task.cycle !== "once") tags.push(`<span class="tag cycle">${cycleLabel(task)}</span>`);
  if (task.waitingAI) tags.push(`<span class="tag ai-mark" title="${t("tagAITitle")}">${t("tagAI")}</span>`);
  if (task.note) tags.push(`<span class="tag note-mark" title="${escapeHtml(task.note)}">✎</span>`);
  if (task.duration) tags.push(`<span class="tag dur">${minToLabel(task.duration)}</span>`);
  const trackedMin = (task.tracked && task.tracked[dateStr]) || 0;
  if (trackedMin) tags.push(`<span class="tag tracked" title="${t("trackedTitle")}">⏱ ${minToLabel(trackedMin)}</span>`);
  const running = timer && timer.taskId === task.id && timer.dateStr === dateStr;
  tags.push(`<button type="button" class="tag timer-btn${running ? " running" : ""}" data-timer title="${running ? t("timerStop") : t("timerStart")}">${running ? "■" : "▶"}</button>`);

  el.innerHTML = `
    <div class="card-top">
      <button class="card-check" aria-label="完成" title="${done ? t("unmarkDone") : t("markDone")}">
        <svg viewBox="0 0 10 10" fill="none"><path d="M1.5 5.5 4 8 8.5 2" stroke="var(--paper)" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
      <div class="card-title">${escapeHtml(task.title)}</div>
    </div>
    <div class="card-meta">${tags.join("")}</div>`;

  el.querySelector(".card-check").addEventListener("click", e => {
    e.stopPropagation();
    if (overdue) {
      // 逾期任务今天完成 = 日期迁到今天并记入今日深度（位置变化，需重建）
      task.date = dateStr;
      task.completions[dateStr] = true;
      save(); render();
      return;
    }
    const nowDone = !isDone(task, dateStr);
    if (nowDone) task.completions[dateStr] = true;
    else delete task.completions[dateStr];
    // 正在计时的任务被手动勾完成 → 自动结算计时（不重复标记完成）
    if (nowDone && timer && timer.taskId === task.id && timer.dateStr === dateStr) {
      stopTimer({ silent: true, complete: false });
      const trackedMin = (task.tracked && task.tracked[dateStr]) || 0;
      let tag = el.querySelector(".tag.tracked");
      const tbtn0 = el.querySelector(".timer-btn");
      if (!tag && tbtn0 && trackedMin) {
        tag = document.createElement("span");
        tag.className = "tag tracked";
        tag.title = t("trackedTitle");
        tbtn0.before(tag);
      }
      if (tag && trackedMin) tag.textContent = `⏱ ${minToLabel(trackedMin)}`;
    }
    save();
    if (!filters.showCompleted && nowDone) { render(); return; } // 隐藏已完成时需移除卡片
    // 局部更新：只变这一张卡片 + 统计，不重建看板
    el.classList.toggle("done", nowDone);
    e.currentTarget.title = nowDone ? t("unmarkDone") : t("markDone");
    // 取消完成时：若该卡未在计时，计时按钮复位回 ▶
    const tbtn = el.querySelector(".timer-btn");
    if (tbtn && !(timer && timer.taskId === task.id && timer.dateStr === dateStr)) {
      tbtn.classList.remove("running");
      tbtn.textContent = "▶";
      tbtn.title = t("timerStart");
    }
    updateStats();
  });
  const timerBtn = el.querySelector("[data-timer]");
  if (timerBtn) timerBtn.addEventListener("click", e => {
    e.stopPropagation();
    if (timer && timer.taskId === task.id && timer.dateStr === dateStr) stopTimer();
    else startTimer(task.id, dateStr);
  });
  el.addEventListener("click", () => openModal(task.id));

  // 所有周期都可拖：一次改日期；每周把该周几挪到目标周几；每月改到目标几号
  el.draggable = true;
  el.addEventListener("dragstart", () => {
    draggingId = task.id;
    draggingFrom = dateStr;
    el.classList.add("dragging");
  });
  el.addEventListener("dragend", () => {
    draggingId = null;
    draggingFrom = null;
    el.classList.remove("dragging");
    document.querySelectorAll(".drop-target").forEach(c => c.classList.remove("drop-target"));
  });
  return el;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- 弹窗 ---------- */
const backdrop = document.getElementById("modalBackdrop");
const form = document.getElementById("taskForm");

function segValue(id) { return document.querySelector(`#${id} button.active`)?.dataset.v; }
function setSeg(id, value) {
  document.querySelectorAll(`#${id} button`).forEach(b =>
    b.classList.toggle("active", b.dataset.v === String(value)));
}
// 分段控件通用点击（单选）
["fDepth", "fCycle", "fQuadrant"].forEach(id => {
  document.getElementById(id).addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    setSeg(id, btn.dataset.v);
    if (id === "fCycle") syncCycleDetail();
  });
});

// 每周几：多选，至少保留一个
document.getElementById("fWeekday").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const actives = document.querySelectorAll("#fWeekday button.active");
  if (btn.classList.contains("active") && actives.length === 1) return;
  btn.classList.toggle("active");
});

// 快捷选天：每天 / 工作日 / 周末，本质是星期几的快捷键
document.getElementById("quickDays").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const map = { all: [0, 1, 2, 3, 4, 5, 6], workdays: [0, 1, 2, 3, 4], weekends: [5, 6] };
  setWeekdays(map[btn.dataset.q]);
});

function getWeekdays() {
  return [...document.querySelectorAll("#fWeekday button.active")].map(b => Number(b.dataset.v));
}
function setWeekdays(wds) {
  document.querySelectorAll("#fWeekday button").forEach(b =>
    b.classList.toggle("active", wds.includes(Number(b.dataset.v))));
}

function syncCycleDetail() {
  const c = segValue("fCycle");
  document.getElementById("detailOnce").hidden = c !== "once";
  document.getElementById("detailWeekly").hidden = c !== "weekly";
  document.getElementById("detailMonthly").hidden = c !== "monthly";
}

let modalClosingTimer = null;

function openModal(id = null, preset = null) {
  // 若正在播关闭动画，立即中断，避免新弹窗被延时隐藏
  clearTimeout(modalClosingTimer);
  backdrop.classList.remove("closing");
  editingId = id;
  const t0 = tasks.find(x => x.id === id);
  document.getElementById("modalTitle").textContent = t0 ? t("modalEdit") : t("modalNew");
  document.getElementById("deleteTask").hidden = !t0;

  document.getElementById("fTitle").value = t0?.title ?? preset?.title ?? "";
  setSeg("fDepth", t0?.depth ?? "deep");
  setSeg("fCycle", t0?.cycle === "daily" ? "weekly" : (t0?.cycle ?? "once"));
  setWeekdays(Array.isArray(t0?.weekdays) && t0.weekdays.length
    ? t0.weekdays : [Number(t0?.weekday) || 0]);
  setSeg("fQuadrant", t0?.quadrant ?? 2);
  document.getElementById("fDate").value = t0?.date ?? preset?.date ?? fmtDate(new Date());
  document.getElementById("fMonthDay").value = t0?.monthDay ?? 1;
  document.getElementById("fDuration").value = t0?.duration ?? 60;
  document.getElementById("fWaitingAI").checked = t0?.waitingAI ?? false;
  document.getElementById("fNote").value = t0?.note ?? "";
  syncCycleDetail();

  backdrop.hidden = false;
  document.getElementById("fTitle").focus();
}
function closeModal() {
  if (backdrop.hidden) return;
  editingId = null;
  convertingIdeaId = null;
  backdrop.classList.add("closing"); // 淡出动画结束后再真正隐藏
  clearTimeout(modalClosingTimer);
  modalClosingTimer = setTimeout(() => {
    backdrop.hidden = true;
    backdrop.classList.remove("closing");
  }, 180);
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const title = document.getElementById("fTitle").value.trim();
  if (!title) return;

  const data = {
    title,
    depth: segValue("fDepth"),
    cycle: segValue("fCycle"),
    quadrant: Number(segValue("fQuadrant")),
    duration: Number(document.getElementById("fDuration").value),
    waitingAI: document.getElementById("fWaitingAI").checked,
    note: document.getElementById("fNote").value.trim(),
    date: document.getElementById("fDate").value || fmtDate(new Date()),
    weekdays: getWeekdays(),
    monthDay: Math.min(31, Math.max(1, Number(document.getElementById("fMonthDay").value) || 1)),
  };

  if (editingId) {
    Object.assign(tasks.find(x => x.id === editingId), data);
  } else {
    tasks.push({ id: uid(), completions: {}, ...data });
    if (convertingIdeaId) { // 想法成功落地为任务，从收集箱移除
      ideas = ideas.filter(i => i.id !== convertingIdeaId);
      saveIdeas(); renderIdeas();
    }
  }
  save(); closeModal(); render();
});

document.getElementById("deleteTask").addEventListener("click", () => {
  if (!editingId) return;
  tasks = tasks.filter(t => t.id !== editingId);
  save(); closeModal(); render();
});
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("cancelTask").addEventListener("click", closeModal);
backdrop.addEventListener("click", e => { if (e.target === backdrop) closeModal(); });
document.addEventListener("keydown", e => {
  // 弹窗打开时的表单快捷键
  if (!backdrop.hidden) {
    const tag = document.activeElement.tagName;
    if (e.key === "Escape") { closeModal(); return; }
    if (e.key === "Enter" && tag !== "TEXTAREA" && tag !== "BUTTON") {
      e.preventDefault();
      form.requestSubmit(); // 回车即保存（备注框内回车仍是换行）
      return;
    }
    if ((e.key === "Backspace" || e.key === "Delete") && !/INPUT|TEXTAREA|SELECT/.test(tag)) {
      if (editingId) { e.preventDefault(); document.getElementById("deleteTask").click(); }
      return;
    }
    return;
  }
  if (e.key === "Escape") {
    if (drawerOpen) closeDrawer();
    else if (!settingsPop.hidden) settingsPop.hidden = true;
    else if (!reviewPop.hidden) reviewPop.hidden = true;
    return;
  }
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
  if (!typing) {
    // ⌘/Ctrl+C：复制鼠标悬停的卡片（有选中文本时不拦截系统复制）
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c" && !window.getSelection().toString()) {
      const cardEl = document.querySelector(".card:hover");
      const tk = cardEl && tasks.find(x => x.id === cardEl.dataset.tid);
      if (tk) {
        clipboardTask = JSON.parse(JSON.stringify(tk));
        showToast(`${t("copiedToast")}「${tk.title}」`);
        e.preventDefault();
      }
      return;
    }
    // ⌘/Ctrl+X：剪切悬停的卡片（每周任务只剪走这一天，其它周几保留）
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "x" && !window.getSelection().toString()) {
      const cardEl = document.querySelector(".card:hover");
      const tk = cardEl && tasks.find(x => x.id === cardEl.dataset.tid);
      if (tk) {
        clipboardTask = JSON.parse(JSON.stringify(tk));
        if (timer && timer.taskId === tk.id) stopTimer({ silent: true, complete: false }); // 被剪任务若在计时，先结算
        if (tk.cycle === "weekly") {
          const wd = (new Date(`${cardEl.dataset.date}T00:00:00`).getDay() + 6) % 7;
          const wds = (Array.isArray(tk.weekdays) && tk.weekdays.length
            ? tk.weekdays : [Number(tk.weekday) || 0]).filter(w => w !== wd);
          if (wds.length) tk.weekdays = wds;
          else tasks = tasks.filter(x => x.id !== tk.id); // 剪到一天不剩 → 整任务移除
        } else {
          tasks = tasks.filter(x => x.id !== tk.id);
        }
        save(); render();
        showToast(`${t("cutToast")}「${clipboardTask.title}」`);
        e.preventDefault();
      }
      return;
    }
    // ⌘/Ctrl+V：粘贴为一次性副本，落在悬停的列（无悬停则今天）
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v" && clipboardTask) {
      const colEl = document.querySelector(".day-col:hover");
      const ds = colEl?.dataset.date ?? fmtDate(new Date());
      tasks.push({
        ...clipboardTask,
        id: uid(),
        cycle: "once",
        date: ds,
        completions: {},
        tracked: {},
      });
      save(); render();
      showToast(`${t("pastedToast")}「${clipboardTask.title}」`);
      e.preventDefault();
      return;
    }
    if (e.key === "n") openModal();
    if (e.key === "i") { e.preventDefault(); drawerOpen ? closeDrawer() : openDrawer(); }
    if (e.key === "ArrowLeft") { weekOffset--; render(); }
    if (e.key === "ArrowRight") { weekOffset++; render(); }
  }
});

/* 轻提示：底部一闪而过的小药丸 */
let toastTimer = null;
function showToast(msg) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.remove("show");
  void el.offsetWidth; // 重启过渡
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 1600);
}

/* ---------- 想法收集箱 ---------- */
const drawer = document.getElementById("inboxDrawer");
const scrim = document.getElementById("drawerScrim");
let drawerOpen = false;

function openDrawer() {
  drawerOpen = true;
  // 飞行起点：顶栏收集箱按钮中心（mac 最小化/展开的锚点）
  const r = document.getElementById("inboxBtn").getBoundingClientRect();
  drawer.style.setProperty("--fly-x", `${r.left + r.width / 2 - window.innerWidth / 2}px`);
  drawer.style.setProperty("--fly-y", `${r.top + r.height / 2 - window.innerHeight / 2}px`);
  drawer.classList.add("open");
  scrim.classList.add("show");
  setTimeout(() => document.getElementById("ideaInput").focus(), 250);
}
function closeDrawer() {
  drawerOpen = false;
  drawer.classList.remove("open");
  scrim.classList.remove("show");
}

function renderIdeas() {
  document.getElementById("ideaCount").textContent = ideas.length;
  const list = document.getElementById("ideaList");
  if (!ideas.length) {
    list.innerHTML = `<li class="idea-empty">${t("ideaEmpty")}</li>`;
    return;
  }
  list.innerHTML = ideas.map(i => {
    const d = new Date(i.createdAt);
    return `
    <li class="idea-item" data-id="${i.id}">
      <p>${escapeHtml(i.text)}</p>
      <div class="idea-meta">
        <span class="idea-date">${d.getMonth() + 1}/${d.getDate()}</span>
        <button type="button" class="idea-act convert" data-act="convert">${t("ideaToTask")}</button>
        <button type="button" class="idea-act" data-act="del" aria-label="删除">×</button>
      </div>
    </li>`;
  }).join("");
}

document.getElementById("inboxBtn").addEventListener("click", () => drawerOpen ? closeDrawer() : openDrawer());
document.getElementById("inboxClose").addEventListener("click", closeDrawer);
scrim.addEventListener("click", closeDrawer);

document.getElementById("ideaForm").addEventListener("submit", e => {
  e.preventDefault();
  const input = document.getElementById("ideaInput");
  const text = input.value.trim();
  if (!text) return;
  ideas.unshift({ id: uid(), text, createdAt: Date.now() });
  input.value = "";
  saveIdeas(); renderIdeas();
});

document.getElementById("ideaList").addEventListener("click", e => {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const id = e.target.closest(".idea-item").dataset.id;
  if (btn.dataset.act === "del") {
    ideas = ideas.filter(x => x.id !== id);
    saveIdeas(); renderIdeas();
  } else {
    const idea = ideas.find(x => x.id === id);
    convertingIdeaId = id;
    closeDrawer();
    openModal(null, { title: idea.text });
  }
});

/* ---------- 设置：深度目标 / 导出导入 ---------- */
const settingsPop = document.getElementById("settingsPop");
document.getElementById("settingsBtn").addEventListener("click", e => {
  e.stopPropagation();
  if (settingsPop.hidden) { // 锚定在设置按钮下方
    const r = e.currentTarget.getBoundingClientRect();
    settingsPop.style.top = `${r.bottom + 10}px`;
    settingsPop.style.right = `${Math.max(16, window.innerWidth - r.right)}px`;
  }
  settingsPop.hidden = !settingsPop.hidden;
});
document.addEventListener("click", e => {
  if (!settingsPop.hidden && !settingsPop.contains(e.target) && !e.target.closest("#settingsBtn")) {
    settingsPop.hidden = true;
  }
});

document.getElementById("goalSelect").addEventListener("change", e => {
  settings.deepGoal = Number(e.target.value) || DEFAULT_DEEP_GOAL;
  saveSettings(); render();
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob(
    [JSON.stringify({ tasks, ideas, settings, exportedAt: new Date().toISOString() }, null, 2)],
    { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `whitespace-backup-${fmtDate(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById("importBtn").addEventListener("click", () =>
  document.getElementById("importFile").click());
document.getElementById("importFile").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const d = JSON.parse(reader.result);
      if (!Array.isArray(d.tasks)) throw new Error("bad");
      tasks = d.tasks;
      if (Array.isArray(d.ideas)) ideas = d.ideas;
      if (d.settings && typeof d.settings === "object") Object.assign(settings, d.settings);
      save(); saveIdeas(); saveSettings();
      settingsPop.hidden = true;
      applyI18n();
    } catch (_) {
      alert(t("importBad"));
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

/* ---------- 顶栏与筛选 ---------- */
document.getElementById("addTaskBtn").addEventListener("click", () => openModal());
document.getElementById("prevWeek").addEventListener("click", () => { weekOffset--; render(); });
document.getElementById("nextWeek").addEventListener("click", () => { weekOffset++; render(); });
document.getElementById("backToday").addEventListener("click", () => { weekOffset = 0; render(); });

document.getElementById("quadrantFilters").addEventListener("click", e => {
  const btn = e.target.closest(".q-chip");
  if (!btn) return;
  filters.quadrant = Number(btn.dataset.q);
  document.querySelectorAll(".q-chip").forEach(b => b.classList.toggle("active", b === btn));
  render();
});

const depthBtn = document.getElementById("depthFilter");
depthBtn.addEventListener("click", () => {
  const next = { all: "deep", deep: "shallow", shallow: "all" }[filters.depth];
  filters.depth = next;
  depthBtn.textContent = t({ all: "depthAll", deep: "depthDeep", shallow: "depthShallow" }[next]);
  depthBtn.classList.toggle("active", next !== "all");
  render();
});

const completedBtn = document.getElementById("completedToggle");
completedBtn.addEventListener("click", () => {
  filters.showCompleted = !filters.showCompleted;
  completedBtn.textContent = t(filters.showCompleted ? "showDone" : "hideDone");
  completedBtn.classList.toggle("active", filters.showCompleted);
  render();
});

document.getElementById("aiBadge").addEventListener("click", () => {
  filters.aiOnly = !filters.aiOnly;
  render();
});

/* ---------- 本周复盘：点「本周深度」弹柱状图 ---------- */
const reviewPop = document.getElementById("reviewPop");
const deepStatEl = document.getElementById("deepStat");

function renderReview() {
  const dates = weekDates(weekOffset);
  const todayStr = fmtDate(new Date());
  const goal = settings.deepGoal || DEFAULT_DEEP_GOAL;
  const perDay = dates.map(date => {
    const ds = fmtDate(date);
    let deep = 0, shallow = 0;
    dayEntries(date, ds, todayStr).forEach(({ t }) => {
      const v = actualContribution(t, ds);
      if (t.depth === "deep") deep += v;
      else shallow += v;
    });
    return { deep, shallow };
  });

  const totalDeep = perDay.reduce((s, d) => s + d.deep, 0);
  const hit = perDay.filter(d => d.deep >= goal).length;
  const maxDeep = Math.max(...perDay.map(d => d.deep));
  const bestIdx = perDay.findIndex(d => d.deep === maxDeep);
  const maxV = Math.max(goal, ...perDay.map(d => d.deep + d.shallow));
  const H = 96; // 绘图区高度 px，目标线与柱子共用同一坐标系
  const px = v => (v ? Math.max(2, Math.round((v / maxV) * H)) : 0);
  const goalY = Math.round((goal / maxV) * H);

  const cols = perDay.map((d, i) => {
    const today = fmtDate(dates[i]) === todayStr;
    const tip = `${t("tagDeep")} ${minToLabel(d.deep)} · ${t("btnShallow")} ${minToLabel(d.shallow)}`;
    return `
    <div class="rv-col${today ? " today" : ""}" title="${tip}">
      <span class="rv-val">${d.deep ? minToLabel(d.deep) : ""}</span>
      <div class="rv-stack">
        ${d.shallow ? `<i class="rv-seg shallow" style="height:${px(d.shallow)}px"></i>` : ""}
        ${d.deep ? `<i class="rv-seg deep" style="height:${px(d.deep)}px"></i>` : ""}
        ${!d.deep && !d.shallow ? `<i class="rv-seg zero"></i>` : ""}
      </div>
    </div>`;
  }).join("");

  const days = dates.map((date, i) =>
    `<span class="rv-day${fmtDate(date) === todayStr ? " today" : ""}">${t("days")[i]}</span>`).join("");

  reviewPop.innerHTML = `
    <h3>${t("reviewTitle")}</h3>
    <div class="rv-plot">
      ${cols}
      <div class="rv-goal" style="bottom:${goalY}px"><em>${minToLabel(goal)}</em></div>
    </div>
    <div class="rv-days">${days}</div>
    <div class="rv-legend">
      <span><i class="dot deep"></i>${t("tagDeep")}</span>
      <span><i class="dot shallow"></i>${t("btnShallow")}</span>
    </div>
    <div class="rv-summary">
      <div><span>${t("reviewTotal")}</span><b>${minToLabel(totalDeep)}</b></div>
      <div><span>${t("reviewHit")}</span><b>${hit}/7</b></div>
      <div><span>${t("reviewBest")}</span><b>${maxDeep > 0 ? t("days")[bestIdx] : "—"}</b></div>
    </div>`;
}

deepStatEl.addEventListener("click", e => {
  e.stopPropagation();
  if (reviewPop.hidden) {
    renderReview();
    const r = deepStatEl.getBoundingClientRect();
    reviewPop.style.top = `${r.bottom + 10}px`;
    reviewPop.style.right = `${Math.max(16, window.innerWidth - r.right)}px`;
  }
  reviewPop.hidden = !reviewPop.hidden;
});
document.addEventListener("click", e => {
  if (!reviewPop.hidden && !reviewPop.contains(e.target) && !e.target.closest("#deepStat")) {
    reviewPop.hidden = true;
  }
});

/* ---------- 专注计时器：同时只专注一件事，支持暂停，全程局部更新 ---------- */
function fmtElapsed(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
    : `${m}:${String(ss).padStart(2, "0")}`;
}

function timerElapsedMs() {
  if (!timer) return 0;
  return (timer.accumMs || 0) + (timer.paused ? 0 : Date.now() - timer.startTs);
}
function persistTimer() { localStorage.setItem(TIMER_KEY, JSON.stringify(timer)); }

function findCardEl(taskId, dateStr) {
  return board.querySelector(`.card[data-tid="${taskId}"][data-date="${dateStr}"]`);
}

/* 只同步卡片上的计时按钮状态，不重建看板 */
function syncTimerButtons() {
  document.querySelectorAll(".timer-btn.running").forEach(b => {
    b.classList.remove("running");
    b.textContent = "▶";
    b.title = t("timerStart");
  });
  if (timer) {
    const btn = findCardEl(timer.taskId, timer.dateStr)?.querySelector(".timer-btn");
    if (btn) { btn.classList.add("running"); btn.title = t("timerStop"); btn.textContent = "■"; }
  }
}

function updatePillState() {
  const pill = document.getElementById("timerPill");
  const pauseBtn = document.getElementById("tpPause");
  pill.classList.toggle("paused", !!timer?.paused);
  pauseBtn.textContent = timer?.paused ? "▶" : "⏸";
  pauseBtn.title = timer?.paused ? t("timerResume") : t("timerPause");
}

function startTimer(taskId, dateStr) {
  if (timer) stopTimer({ silent: true, complete: false }); // 切换任务：结算旧计时但不自动完成
  timer = { taskId, dateStr, startTs: Date.now(), accumMs: 0, paused: false };
  persistTimer();
  beginTick();
  syncTimerButtons();
}

function pauseResumeTimer() {
  if (!timer) return;
  if (timer.paused) {
    timer.startTs = Date.now();
    timer.paused = false;
  } else {
    timer.accumMs = (timer.accumMs || 0) + (Date.now() - timer.startTs);
    timer.paused = true;
  }
  persistTimer();
  updatePillState();
}

/* 终止：结算实际时长上卡（不消失），并自动标记完成；全程不重刷看板 */
function stopTimer({ silent = false, complete = true } = {}) {
  if (!timer) return;
  const { taskId, dateStr } = timer;
  const ms = timerElapsedMs();
  const tk = tasks.find(x => x.id === taskId);

  if (tk && ms > 0) {
    const min = Math.max(1, Math.round(ms / 60000)); // 至少记 1 分钟，保证实际时间可见
    tk.tracked = tk.tracked || {};
    tk.tracked[dateStr] = (tk.tracked[dateStr] || 0) + min;
  }
  if (complete && tk && !isDone(tk, dateStr)) tk.completions[dateStr] = true;
  if (tk) save();

  timer = null;
  localStorage.removeItem(TIMER_KEY);
  clearInterval(timerTick);
  timerTick = null;
  document.getElementById("timerPill").hidden = true;

  if (silent) return;
  if (!filters.showCompleted && complete) { render(); return; } // 隐藏已完成时卡片需移除
  updateCardAfterStop(taskId, dateStr, tk);
  updateStats();
}

/* 终止后的局部更新：⊙ 变完成态 + 显示 ⏱ 实际时长 + 计时按钮复位 */
function updateCardAfterStop(taskId, dateStr, tk) {
  const el = findCardEl(taskId, dateStr);
  if (!el || !tk) { render(); return; } // 卡片不在当前视图，退回全量渲染
  const btn = el.querySelector(".timer-btn");
  if (btn) { btn.classList.remove("running"); btn.textContent = "▶"; btn.title = t("timerStart"); }
  const trackedMin = (tk.tracked && tk.tracked[dateStr]) || 0;
  let tag = el.querySelector(".tag.tracked");
  if (!tag && btn) {
    tag = document.createElement("span");
    tag.className = "tag tracked";
    tag.title = t("trackedTitle");
    btn.before(tag);
  }
  if (tag) tag.textContent = `⏱ ${minToLabel(trackedMin)}`;
  el.classList.add("done"); // 自动完成；点错可再点 ⊙ 恢复，计时按钮随之回来
  const check = el.querySelector(".card-check");
  if (check) check.title = t("unmarkDone");
}

function beginTick() {
  const tk = tasks.find(x => x.id === timer?.taskId);
  if (!tk) { // 任务已被删除，丢弃残留计时
    timer = null;
    localStorage.removeItem(TIMER_KEY);
    return;
  }
  document.getElementById("tpTitle").textContent = tk.title;
  document.getElementById("timerPill").hidden = false;
  updatePillState();
  const update = () => {
    if (!timer) return;
    const label = fmtElapsed(timerElapsedMs());
    document.getElementById("tpTime").textContent = label;
    const btn = document.querySelector(".timer-btn.running");
    if (btn) btn.textContent = `■ ${label}`;
  };
  update();
  clearInterval(timerTick);
  timerTick = setInterval(update, 1000);
}

document.getElementById("tpStop").addEventListener("click", () => stopTimer());
document.getElementById("tpPause").addEventListener("click", pauseResumeTimer);

/* ---------- 文件自动备份：每次改动静默写入选定的 JSON（File System Access API） ---------- */
const BACKUP_HANDLE_KEY = "backupHandle";
let backupHandle = null;
let backupState = window.showSaveFilePicker ? "off" : "unsupported"; // off | on | need-permission | unsupported
let backupTimer = null;
let backupLastAt = null;

function idbOpen() {
  return new Promise((res, rej) => {
    const req = indexedDB.open("deepweek-db", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("kv");
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}
async function idbGet(key) {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const rq = db.transaction("kv").objectStore("kv").get(key);
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  });
}
async function idbSet(key, val) {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const tx = db.transaction("kv", "readwrite");
    tx.objectStore("kv").put(val, key);
    tx.oncomplete = res;
    tx.onerror = () => rej(tx.error);
  });
}
async function idbDel(key) {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const tx = db.transaction("kv", "readwrite");
    tx.objectStore("kv").delete(key);
    tx.oncomplete = res;
    tx.onerror = () => rej(tx.error);
  });
}

function backupPayload() {
  return JSON.stringify({ tasks, ideas, settings, exportedAt: new Date().toISOString() }, null, 2);
}

async function writeBackup() {
  if (backupState !== "on" || !backupHandle) return;
  try {
    const w = await backupHandle.createWritable();
    await w.write(backupPayload());
    await w.close();
    backupLastAt = new Date();
  } catch (_) {
    backupState = "need-permission"; // 权限失效，等待用户重新授权
  }
  updateBackupUI();
}

function scheduleBackup() {
  if (backupState !== "on") return;
  clearTimeout(backupTimer);
  backupTimer = setTimeout(writeBackup, 800); // 防抖，避免连续操作频繁写盘
}

function updateBackupUI() {
  const btn = document.getElementById("backupBtn");
  const status = document.getElementById("backupStatus");
  if (backupState === "unsupported") {
    btn.hidden = true;
    status.textContent = t("backupUnsupported");
    return;
  }
  btn.hidden = false;
  if (backupState === "off") {
    btn.textContent = t("backupChoose");
    status.textContent = "";
  } else if (backupState === "need-permission") {
    btn.textContent = t("backupResume");
    status.textContent = backupHandle?.name ?? "";
  } else {
    btn.textContent = t("backupStop");
    const at = backupLastAt
      ? ` · ${t("backupSaved")} ${backupLastAt.toTimeString().slice(0, 8)}` : "";
    status.textContent = `${backupHandle.name} · ${t("backupOn")}${at}`;
  }
}

document.getElementById("backupBtn").addEventListener("click", async () => {
  try {
    if (backupState === "off") {
      backupHandle = await window.showSaveFilePicker({
        suggestedName: "whitespace-data.json",
        types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
      });
      await idbSet(BACKUP_HANDLE_KEY, backupHandle);
      backupState = "on";
      await writeBackup();
    } else if (backupState === "need-permission") {
      const p = await backupHandle.requestPermission({ mode: "readwrite" });
      if (p === "granted") { backupState = "on"; await writeBackup(); }
    } else if (backupState === "on") {
      await idbDel(BACKUP_HANDLE_KEY);
      backupHandle = null;
      backupState = "off";
    }
  } catch (_) { /* 用户取消选择器 */ }
  updateBackupUI();
});

async function initBackup() {
  if (backupState === "unsupported") { updateBackupUI(); return; }
  try {
    backupHandle = await idbGet(BACKUP_HANDLE_KEY);
    if (backupHandle) {
      const p = await backupHandle.queryPermission({ mode: "readwrite" });
      backupState = p === "granted" ? "on" : "need-permission";
      if (backupState === "on") writeBackup(); // 启动时同步一次
    }
  } catch (_) { backupHandle = null; backupState = "off"; }
  updateBackupUI();
}

/* ---------- 语言切换 ---------- */
function applyI18n() {
  document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
  document.body.classList.toggle("en", lang === "en");
  document.title = lang === "en" ? "Whitespace · room for deep thinking" : "留白 · 为深度思考留白";

  // 所有挂了 data-i18n 的静态文案
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  // 非 textContent 类文案
  document.getElementById("fTitle").placeholder = t("placeholder");
  document.getElementById("ideaInput").placeholder = t("ideaPh");
  document.getElementById("fNote").placeholder = t("notePh");
  document.getElementById("deepStat").title = t("deepStatTitle");
  document.getElementById("aiBadge").title = t("aiStatTitle");
  document.getElementById("langToggle").textContent = t("langBtn");
  document.getElementById("goalSelect").value = settings.deepGoal;

  // 带状态的切换钮
  depthBtn.textContent = t({ all: "depthAll", deep: "depthDeep", shallow: "depthShallow" }[filters.depth]);
  completedBtn.textContent = t(filters.showCompleted ? "showDone" : "hideDone");

  updateBackupUI();
  renderIdeas();
  render();
}

document.getElementById("langToggle").addEventListener("click", () => {
  lang = lang === "zh" ? "en" : "zh";
  localStorage.setItem(LANG_KEY, lang);
  applyI18n();
});

if (timer) beginTick(); // 刷新后恢复未结束的计时
applyI18n();
initBackup();
