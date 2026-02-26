const STORAGE_KEY = 'usedCodes';
// const PRIORITY_CODES = [
//     'NG-Ydn0hQlj', // T
//     'NG-RoFVDevO', // M
//     'NG-shW1s48K', // B
//     'NG-GI9Ne6yS' // N
// ];
const PRIORITY_CODES = [];
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

    applyLanguage(detectLanguage(), false);
    showNextUnusedCode();
}

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
        placeholder.textContent = t('allUsed');
        codeDisplay.appendChild(placeholder);
        codeDisplay.setAttribute('aria-label', t('allUsedAria'));
        progressDisplay.textContent = t('progressAll', { used: usedCodesSet.size, total: allCodes.length });
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
    codeDisplay.setAttribute('aria-label', t('currentCodeAria', { code: currentCode }));
    updateProgress();
    copyBtn.disabled = false;
    linkBtn.disabled = false;
    nextBtn.disabled = false;
}

function updateProgress() {
    const remaining = allCodes.length - usedCodesSet.size;
    progressDisplay.textContent = t('progressRemaining', { used: usedCodesSet.size, remaining: remaining });
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
    toast.textContent = t('copied');
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
        toastTimer = null;
    }, 2000);
}

// Share
const SHARE_URL = 'https://tarekkma.github.io/nusuk-quiz-codes/';
const shareBtn = document.getElementById('shareBtn');
const shareOverlay = document.getElementById('shareOverlay');
const shareClose = document.getElementById('shareClose');
const shareWhatsApp = document.getElementById('shareWhatsApp');
const shareFacebook = document.getElementById('shareFacebook');
const shareTwitter = document.getElementById('shareTwitter');
const shareCopyLink = document.getElementById('shareCopyLink');

function openShareModal() {
    const shareText = t('shareText');

    if (navigator.share) {
        navigator.share({ title: t('shareNativeTitle'), text: shareText, url: SHARE_URL }).catch(() => {});
        return;
    }

    shareWhatsApp.href = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + SHARE_URL)}`;
    shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`;
    shareTwitter.href = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(SHARE_URL)}`;

    shareOverlay.classList.add('active');
    shareOverlay.setAttribute('aria-hidden', 'false');
}

function closeShareModal() {
    shareOverlay.classList.remove('active');
    shareOverlay.setAttribute('aria-hidden', 'true');
}

shareBtn.addEventListener('click', openShareModal);
shareClose.addEventListener('click', closeShareModal);
shareOverlay.addEventListener('click', (e) => {
    if (e.target === shareOverlay) closeShareModal();
});

shareCopyLink.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(SHARE_URL);
    } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = SHARE_URL;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
    }
    closeShareModal();
    showToast();
});

// Language toggle
document.getElementById('langToggle').addEventListener('click', toggleLanguage);

function onLanguageChanged() {
    if (currentCode) {
        codeDisplay.setAttribute('aria-label', t('currentCodeAria', { code: currentCode }));
    }
    updateProgress();
    toast.textContent = t('copied');
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
    if (e.key === 'Escape') { closeShareModal(); return; }

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

// PWA install banner
let deferredPrompt = null;
const installBanner = document.getElementById('installBanner');
const installAccept = document.getElementById('installAccept');
const installDismiss = document.getElementById('installDismiss');
const installBtnInline = document.getElementById('installBtnInline');
const INSTALL_DISMISSED_KEY = 'installDismissed';

function triggerInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
        deferredPrompt = null;
        installBanner.classList.remove('show');
        installBtnInline.hidden = true;
    });
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtnInline.hidden = false;

    const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY);
    if (!dismissed) {
        setTimeout(() => { installBanner.classList.add('show'); }, 1500);
    }
});

installAccept.addEventListener('click', triggerInstall);
installBtnInline.addEventListener('click', triggerInstall);

installDismiss.addEventListener('click', () => {
    installBanner.classList.remove('show');
    if (document.getElementById('installNoShow').checked) {
        localStorage.setItem(INSTALL_DISMISSED_KEY, '1');
    }
});

window.addEventListener('appinstalled', () => {
    installBanner.classList.remove('show');
    installBtnInline.hidden = true;
    deferredPrompt = null;
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

init();
