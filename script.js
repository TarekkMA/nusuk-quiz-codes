const STORAGE_KEY = 'usedCodes';
const PRIORITY_CODES = [
    'NG-Ydn0hQlj', // T
    'NG-RoFVDevO', // M
    'NG-shW1s48K', // B
    'NG-GI9Ne6yS' // N
];
let allCodes = [];
let usedCodesSet = new Set();
let currentCode = null;
let toastTimer = null;

const codeDisplay = document.getElementById('codeDisplay');
const progressDisplay = document.getElementById('progress');
const copyBtn = document.getElementById('copyBtn');
const linkBtn = document.getElementById('linkBtn');
const nextBtn = document.getElementById('nextBtn');
const toast = document.getElementById('toast');

function init() {
    allCodes = ALL_CODES;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            usedCodesSet = new Set(JSON.parse(stored));
        } catch (e) {
            usedCodesSet = new Set();
        }
    }

    showNextUnusedCode();
}

// Set.has() is O(1) vs Array.includes() which is O(n)
function getNextUnusedCode() {
    const priorityUnused = PRIORITY_CODES.filter(code => !usedCodesSet.has(code));
    if (priorityUnused.length > 0) {
        return priorityUnused[Math.floor(Math.random() * priorityUnused.length)];
    }

    const unusedCodes = allCodes.filter(code => !usedCodesSet.has(code));
    if (unusedCodes.length === 0) return null;

    return unusedCodes[Math.floor(Math.random() * unusedCodes.length)];
}

function showNextUnusedCode() {
    const nextCode = getNextUnusedCode();

    if (nextCode === null) {
        codeDisplay.textContent = '';
        const placeholder = document.createElement('span');
        placeholder.className = 'placeholder';
        placeholder.textContent = 'تم استخدام جميع الأكواد! 🎉';
        codeDisplay.appendChild(placeholder);
        codeDisplay.setAttribute('aria-label', 'تم استخدام جميع الأكواد');
        progressDisplay.textContent = `${usedCodesSet.size} / ${allCodes.length} كود مستخدم`;
        copyBtn.disabled = true;
        linkBtn.disabled = true;
        nextBtn.disabled = true;
        currentCode = null;
        return;
    }

    currentCode = nextCode;
    codeDisplay.textContent = '';
    const codeSpan = document.createElement('span');
    codeSpan.className = 'code';
    codeSpan.textContent = currentCode;
    codeDisplay.appendChild(codeSpan);
    codeDisplay.setAttribute('aria-label', `الرمز الحالي: ${currentCode}`);
    updateProgress();
    copyBtn.disabled = false;
    linkBtn.disabled = false;
    nextBtn.disabled = false;
}

function updateProgress() {
    const remaining = allCodes.length - usedCodesSet.size;
    progressDisplay.textContent = `${usedCodesSet.size} مستخدم • ${remaining} متبقي`;
}

function saveCurrentCode() {
    if (currentCode && !usedCodesSet.has(currentCode)) {
        usedCodesSet.add(currentCode);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...usedCodesSet]));
    }
}

async function copyCode() {
    if (!currentCode) return;

    try {
        await navigator.clipboard.writeText(currentCode);
    } catch (e) {
        const textArea = document.createElement('textarea');
        textArea.value = currentCode;
        textArea.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
    showToast();
}

function openCodeLink() {
    if (!currentCode) return;
    window.open(`https://services.nusuk.sa/app?p=27&id=${currentCode}`, '_blank', 'noopener,noreferrer');
}

function showToast() {
    if (toastTimer) clearTimeout(toastTimer);
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
        toastTimer = null;
    }, 2000);
}

copyBtn.addEventListener('click', copyCode);
linkBtn.addEventListener('click', openCodeLink);

nextBtn.addEventListener('click', () => {
    saveCurrentCode();
    showNextUnusedCode();
});

codeDisplay.addEventListener('click', copyCode);
codeDisplay.style.cursor = 'pointer';

document.addEventListener('keydown', (e) => {
    const tag = e.target.tagName;
    if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'A' || tag === 'SELECT') return;

    if (e.key === 'c' || e.key === 'C') {
        copyCode();
    } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        saveCurrentCode();
        showNextUnusedCode();
    }
});

init();
