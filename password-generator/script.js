const lengthEl = document.getElementById("length");
const lengthValueEl = document.getElementById("lengthValue");
const wordsEl = document.getElementById("words");
const wordsValueEl = document.getElementById("wordsValue");
const passwordDisplay = document.getElementById("passwordDisplay");
const displayBox = document.getElementById("displayBox");

const generateBtn = document.getElementById("generateBtn");
const regenBtn = document.getElementById("regenBtn");
const copyBtn = document.getElementById("copyBtn");
const copyMainBtn = document.getElementById("copyMainBtn");

const strengthLabel = document.getElementById("strengthLabel");
const entropyText = document.getElementById("entropyText");
const strengthBars = document.querySelectorAll(".strength .bar");

const statLength = document.getElementById("statLength");
const statEntropy = document.getElementById("statEntropy");
const statStrength = document.getElementById("statStrength");

const passwordOptions = document.getElementById("passwordOptions");
const passphraseOptions = document.getElementById("passphraseOptions");
const tabs = document.querySelectorAll(".tab");

const bulkBtn = document.getElementById("bulkBtn");
const bulkList = document.getElementById("bulkList");
const countBtns = document.querySelectorAll(".count-btn");

const historyToggle = document.getElementById("historyToggle");
const historyList = document.getElementById("historyList");
const historyCount = document.getElementById("historyCount");
const historyChevron = document.getElementById("historyChevron");

const separatorGrid = document.getElementById("separatorGrid");

const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  similar: "il1Lo0O",
  ambiguous: "{}[]()/\\'\"`~,;:.<>",
};

const wordList = ["amber","bridge","castle","dragon","ember","flame","golden","harbor","island","jungle","knight","lemon","marble","noble","ocean","palace","quartz","river","silver","temple","ultra","velvet","winter","xenon","yellow","zenith","anchor","brave","crystal","dawn","eagle","forest","grace","hollow","iris","jewel","karma","lunar","mystic","night","orbit","prime","quest","realm","storm","titan","unique","vivid","whisper","exact"];

let mode = "password";
let opts = { uppercase: true, lowercase: true, numbers: true, symbols: false, excludeSimilar: false, excludeAmbiguous: false };
let separator = "-";
let history = [];
let bulkCount = 5;

function getCryptoRandomInt(max) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function pickRandomChar(str) {
  return str[getCryptoRandomInt(str.length)];
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = getCryptoRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generatePassword({ length, uppercase, lowercase, numbers, symbols, excludeSimilar, excludeAmbiguous }) {
  let pool = "";
  if (uppercase) pool += CHAR_SETS.uppercase;
  if (lowercase) pool += CHAR_SETS.lowercase;
  if (numbers) pool += CHAR_SETS.numbers;
  if (symbols) pool += CHAR_SETS.symbols;

  if (excludeSimilar) CHAR_SETS.similar.split("").forEach(c => { pool = pool.split(c).join(""); });
  if (excludeAmbiguous) CHAR_SETS.ambiguous.split("").forEach(c => { pool = pool.split(c).join(""); });

  if (!pool) return "";

  const pools = [];
  if (uppercase) pools.push(CHAR_SETS.uppercase);
  if (lowercase) pools.push(CHAR_SETS.lowercase);
  if (numbers) pools.push(CHAR_SETS.numbers);
  if (symbols) pools.push(CHAR_SETS.symbols);

  const guaranteed = pools.map(p => pickRandomChar(p));
  const remaining = Math.max(length - guaranteed.length, 0);
  const rest = Array.from({ length: remaining }, () => pickRandomChar(pool));

  return shuffleArray([...guaranteed, ...rest]).join("");
}

function generatePassphrase(words, sep) {
  const idxArr = new Uint32Array(words);
  crypto.getRandomValues(idxArr);
  const selected = [];
  for (let i = 0; i < words; i++) selected.push(wordList[idxArr[i] % wordList.length]);
  return selected.join(sep);
}

function getStrength(password) {
  if (!password) return { score: 0, label: "None", color: "#444" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { score: 1, label: "Weak", color: "#E24B4A" };
  if (score <= 4) return { score: 2, label: "Fair", color: "#EF9F27" };
  if (score <= 5) return { score: 3, label: "Good", color: "#1D9E75" };
  return { score: 4, label: "Strong", color: "#0F6E56" };
}

function calcEntropy(password) {
  if (!password) return 0;
  const set = new Set(password.split("")).size;
  return Math.round(password.length * Math.log2(Math.max(set, 2)));
}

function setStrengthUI(pw) {
  const strength = getStrength(pw);
  const entropy = calcEntropy(pw);

  strengthLabel.textContent = strength.label;
  strengthLabel.style.color = strength.color;
  entropyText.textContent = `${entropy} bits`;

  strengthBars.forEach((b, i) => {
    b.style.background = strength.score >= (i + 1) ? strength.color : "rgba(255,255,255,0.1)";
  });

  statLength.textContent = pw.length || "—";
  statEntropy.textContent = entropy ? `${entropy}b` : "—";
  statStrength.textContent = strength.label;
  statStrength.style.color = strength.color;
}

function renderPassword(pw) {
  passwordDisplay.innerHTML = "";
  if (!pw) {
    passwordDisplay.innerHTML = `<span style="color: rgba(255,255,255,0.2)">No password yet</span>`;
    setStrengthUI("");
    return;
  }
  const frag = document.createDocumentFragment();
  [...pw].forEach((c) => {
    const span = document.createElement("span");
    let col = "rgba(255,255,255,0.92)";
    if (/[A-Z]/.test(c)) col = "#C4B5FD";
    else if (/[0-9]/.test(c)) col = "#6EE7B7";
    else if (/[^A-Za-z0-9]/.test(c)) col = "#FCD34D";
    span.style.color = col;
    span.textContent = c;
    frag.appendChild(span);
  });
  passwordDisplay.appendChild(frag);
  setStrengthUI(pw);
}

function updateHistory(pw) {
  if (!pw) return;
  history = [pw, ...history].slice(0, 10);
  historyCount.textContent = history.length;
  historyList.innerHTML = history.map(p => {
    const s = getStrength(p);
    return `
      <div class="hist-item">
        <div class="dot" style="background:${s.color}"></div>
        <span class="hist-pw">${p}</span>
        <button class="hist-copy" data-copy="${p}"><i class="ti ti-copy"></i></button>
      </div>
    `;
  }).join("");
}

function animateShake() {
  displayBox.classList.add("shake");
  setTimeout(() => displayBox.classList.remove("shake"), 350);
}

function generate() {
  let pw = "";
  if (mode === "passphrase") {
    pw = generatePassphrase(+wordsEl.value, separator);
  } else {
    pw = generatePassword({ ...opts, length: +lengthEl.value });
  }
  renderPassword(pw);
  updateHistory(pw);
  animateShake();
  bulkList.classList.add("hidden");
}

async function copyToClipboard(text) {
  if (!text) return;
  await navigator.clipboard.writeText(text);
  copyBtn.innerHTML = `<i class="ti ti-check"></i>`;
  copyMainBtn.innerHTML = `<i class="ti ti-check"></i> Copied!`;
  setTimeout(() => {
    copyBtn.innerHTML = `<i class="ti ti-copy"></i>`;
    copyMainBtn.innerHTML = `<i class="ti ti-clipboard"></i> Copy`;
  }, 1800);
}

function syncLengthValue() { lengthValueEl.textContent = lengthEl.value; }
function syncWordsValue() { wordsValueEl.textContent = wordsEl.value; }

document.querySelectorAll(".chip").forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.opt;
    opts[key] = !opts[key];
    btn.classList.toggle("active", opts[key]);
  });
});

separatorGrid.querySelectorAll(".sep-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    separator = btn.dataset.sep;
    separatorGrid.querySelectorAll(".sep-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    mode = tab.dataset.mode;
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    if (mode === "password") {
      passwordOptions.classList.remove("hidden");
      passphraseOptions.classList.add("hidden");
    } else {
      passwordOptions.classList.add("hidden");
      passphraseOptions.classList.remove("hidden");
    }
    generate();
  });
});

generateBtn.addEventListener("click", generate);
regenBtn.addEventListener("click", generate);
copyBtn.addEventListener("click", () => copyToClipboard(passwordDisplay.textContent));
copyMainBtn.addEventListener("click", () => copyToClipboard(passwordDisplay.textContent));

lengthEl.addEventListener("input", () => { syncLengthValue(); });
wordsEl.addEventListener("input", () => { syncWordsValue(); });

countBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    bulkCount = +btn.dataset.count;
    countBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

bulkBtn.addEventListener("click", () => {
  const results = [];
  for (let i = 0; i < bulkCount; i++) {
    results.push(mode === "passphrase" ? generatePassphrase(+wordsEl.value, separator) : generatePassword({ ...opts, length: +lengthEl.value }));
  }
  bulkList.innerHTML = results.map((pw, i) => `
    <div class="bulk-item">
      <span class="bulk-idx">${i + 1}</span>
      <span class="bulk-pw">${pw}</span>
      <button class="bulk-copy" data-copy="${pw}"><i class="ti ti-copy"></i></button>
    </div>
  `).join("");
  bulkList.classList.remove("hidden");
});

bulkList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-copy]");
  if (btn) copyToClipboard(btn.dataset.copy);
});

historyToggle.addEventListener("click", () => {
  const isHidden = historyList.classList.toggle("hidden");
  historyChevron.className = `ti ${isHidden ? "ti-chevron-down" : "ti-chevron-up"}`;
});

historyList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-copy]");
  if (btn) copyToClipboard(btn.dataset.copy);
});

syncLengthValue();
syncWordsValue();
generate();

// Extra styles for items
const extraStyles = document.createElement("style");
extraStyles.textContent = `
  .hist-item, .bulk-item {
    display:flex; align-items:center; gap:10px; padding:9px 14px;
    border-radius:10px; background:rgba(255,255,255,0.04);
    margin-bottom:6px; border:1px solid rgba(255,255,255,0.07);
  }
  .hist-pw, .bulk-pw {
    flex:1; font-family:'JetBrains Mono', monospace; font-size:13px; color:rgba(255,255,255,0.7);
    overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  }
  .bulk-idx { color: rgba(255,255,255,0.25); font-size:11px; font-family:'JetBrains Mono', monospace; min-width:20px; }
  .dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .hist-copy, .bulk-copy { background:none; border:none; color:rgba(255,255,255,0.35); cursor:pointer; font-size:15px; }
`;
document.head.appendChild(extraStyles);