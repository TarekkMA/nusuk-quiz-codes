// State management
const STORAGE_KEY = 'usedCodes';
const PRIORITY_CODES = ['NG-Ydn0hQlj'];
let allCodes = [];
let usedCodes = [];
let currentCode = null;

// DOM elements
const codeDisplay = document.getElementById('codeDisplay');
const progressDisplay = document.getElementById('progress');
const copyBtn = document.getElementById('copyBtn');
const linkBtn = document.getElementById('linkBtn');
const nextBtn = document.getElementById('nextBtn');
const toast = document.getElementById('toast');

// Initialize the app
function init() {
    // Load codes from external codes.js file
    allCodes = ALL_CODES;

    // Load used codes from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    usedCodes = stored ? JSON.parse(stored) : [];

    // Show first unused code
    showNextUnusedCode();
}

// Get random unused code
function getNextUnusedCode() {
    const priorityUnused = PRIORITY_CODES.filter(code => !usedCodes.includes(code));
    if (priorityUnused.length > 0) {
        return priorityUnused[Math.floor(Math.random() * priorityUnused.length)];
    }
    const unusedCodes = allCodes.filter(code => !usedCodes.includes(code));

    if (unusedCodes.length === 0) {
        return null; // All codes have been used
    }

    const randomIndex = Math.floor(Math.random() * unusedCodes.length);
    return unusedCodes[randomIndex];
}

// Show next unused code
function showNextUnusedCode() {
    const nextCode = getNextUnusedCode();

    if (nextCode === null) {
        // All codes have been used
        codeDisplay.innerHTML = '<span class="placeholder">تم استخدام جميع الأكواد! 🎉</span>';
        progressDisplay.textContent = `${usedCodes.length} / ${allCodes.length} كود مستخدم`;
        copyBtn.disabled = true;
        linkBtn.disabled = true;
        nextBtn.disabled = true;
        currentCode = null;
        return;
    }

    currentCode = nextCode;
    codeDisplay.innerHTML = `<span class="code">${escapeHtml(currentCode)}</span>`;
    updateProgress();
    copyBtn.disabled = false;
    linkBtn.disabled = false;
    nextBtn.disabled = false;
}

// Update progress display
function updateProgress() {
    const remaining = allCodes.length - usedCodes.length;
    progressDisplay.textContent = `${usedCodes.length} used • ${remaining} remaining`;
}

// Save current code to localStorage
function saveCurrentCode() {
    if (currentCode && !usedCodes.includes(currentCode)) {
        usedCodes.push(currentCode);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(usedCodes));
    }
}

// Copy code to clipboard
async function copyCode() {
    if (!currentCode) return;

    try {
        await navigator.clipboard.writeText(currentCode);
        showToast();
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = currentCode;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast();
    }
}

// Open code link in new tab
function openCodeLink() {
    if (!currentCode) return;
    const url = `https://services.nusuk.sa/app?p=27&id=${currentCode}`;
    window.open(url, '_blank', 'noopener,noreferrer');
}

// Show toast notification
function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners
copyBtn.addEventListener('click', copyCode);

linkBtn.addEventListener('click', openCodeLink);

nextBtn.addEventListener('click', () => {
    saveCurrentCode();
    showNextUnusedCode();
});

// Make code display clickable to copy
codeDisplay.addEventListener('click', copyCode);
codeDisplay.style.cursor = 'pointer';

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'c' || e.key === 'C') {
        copyCode();
    } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        saveCurrentCode();
        showNextUnusedCode();
    }
});

// Initialize on load
init();
