// ==================== State ====================
let processedIcons = [];
let processedPromo = [];
let processedScreenshots = [];

const mockupState = {
    bgType: 'solid',
    bgSolidColor: '#023047',
    bgGradient: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
    bgImage: null,
    bgImageMode: 'cover',
    bgBlur: 0,
    bgDim: 0,
    screenshot: null,
    screenshotPosition: 'center',
    taglineEnabled: false,
    taglineText: '',
    taglinePosition: 'top',
    taglineFontSize: 40,
    taglineColor: '#ffffff',
    taglineAlign: 'center',
    taglineWeight: '700'
};

// ==================== Constants ====================
const ICON_SIZES = [
    { name: 'Icon 16x16', width: 16, height: 16 },
    { name: 'Icon 32x32', width: 32, height: 32 },
    { name: 'Icon 48x48', width: 48, height: 48 },
    { name: 'Icon 128x128', width: 128, height: 128 }
];

const PROMO_SIZES = [
    { name: 'Small Tile', width: 440, height: 280 },
    { name: 'Marquee', width: 1400, height: 560 },
    { name: 'Screenshot', width: 1280, height: 800 }
];

const EXPORT_PRESETS = [
    { width: 440, height: 280, name: 'Chrome Web Store Thumbnail' },
    { width: 1280, height: 800, name: 'Chrome Web Store Screenshot' },
    { width: 1400, height: 560, name: 'Featured Promo' },
    { width: 1080, height: 1080, name: 'Social Media' }
];

// ==================== Utility Functions ====================
function setupUploadZone(zoneId, inputId, handler, multiple = false) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);

    zone.addEventListener('click', () => input.click());

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('dragover');
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        const files = multiple ? e.dataTransfer.files : e.dataTransfer.files[0];
        if (files) handler(files);
    });

    input.addEventListener('change', (e) => {
        const files = multiple ? e.target.files : e.target.files[0];
        if (files) handler(files);
    });
}

function displayPreviews(containerId, images) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    container.style.display = 'grid';

    images.forEach((img, index) => {
        const card = document.createElement('div');
        card.className = 'preview-card';
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <div class="preview-header">
                <div class="preview-title">${img.name}</div>
                <div class="preview-size">${img.size}</div>
            </div>
            <div class="preview-image-container">
                <img src="${img.dataUrl}" alt="${img.name}" class="preview-image">
            </div>
            <button class="download-btn" onclick="downloadImage('${img.dataUrl}', '${img.filename}')">
                Download ${img.name}
            </button>
        `;

        container.appendChild(card);
    });
}

function downloadImage(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
}

async function downloadZip(images, zipFilename) {
    const zip = new JSZip();

    images.forEach(img => {
        const base64Data = img.dataUrl.split(',')[1];
        zip.file(img.filename, base64Data, { base64: true });
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipFilename;
    a.click();
    URL.revokeObjectURL(url);
}

// ==================== Image Math Helpers ====================
function calculateContain(containerW, containerH, imgW, imgH, padding = 0) {
    const padPx = (Math.min(containerW, containerH) * padding) / 100;
    const targetW = containerW - padPx * 2;
    const targetH = containerH - padPx * 2;
    const scale = Math.min(targetW / imgW, targetH / imgH);
    return {
        dx: padPx + (targetW - imgW * scale) / 2,
        dy: padPx + (targetH - imgH * scale) / 2,
        dWidth: imgW * scale,
        dHeight: imgH * scale
    };
}

function calculateCover(containerW, containerH, imgW, imgH) {
    const scale = Math.max(containerW / imgW, containerH / imgH);
    return {
        dx: (containerW - imgW * scale) / 2,
        dy: (containerH - imgH * scale) / 2,
        dWidth: imgW * scale,
        dHeight: imgH * scale
    };
}

// ==================== Mockup Rendering Helpers ====================
function parseGradient(ctx, width, height) {
    const match = mockupState.bgGradient.match(/linear-gradient\(135deg,\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\))[^,]*,\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\))/);
    if (match) {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, match[1].trim());
        gradient.addColorStop(1, match[2].trim());
        return gradient;
    }
    return null;
}

function renderBackground(ctx, width, height) {
    if (mockupState.bgType === 'solid') {
        ctx.fillStyle = mockupState.bgSolidColor;
        ctx.fillRect(0, 0, width, height);
    } else if (mockupState.bgType === 'gradient') {
        const gradient = parseGradient(ctx, width, height);
        if (gradient) {
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }
    } else if (mockupState.bgType === 'image' && mockupState.bgImage) {
        if (mockupState.bgBlur > 0) {
            ctx.filter = `blur(${mockupState.bgBlur}px)`;
        }

        if (mockupState.bgImageMode === 'cover') {
            const { dx, dy, dWidth, dHeight } = calculateCover(width, height, mockupState.bgImage.width, mockupState.bgImage.height);
            ctx.drawImage(mockupState.bgImage, dx, dy, dWidth, dHeight);
        } else {
            const { dx, dy, dWidth, dHeight } = calculateContain(width, height, mockupState.bgImage.width, mockupState.bgImage.height);
            ctx.drawImage(mockupState.bgImage, dx, dy, dWidth, dHeight);
        }

        ctx.filter = 'none';

        if (mockupState.bgDim > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${mockupState.bgDim / 100})`;
            ctx.fillRect(0, 0, width, height);
        }
    }
}

function renderScreenshot(ctx, width, height, scaleFactor = 1) {
    if (!mockupState.screenshot) return;

    const taglineHeight = mockupState.taglineEnabled && mockupState.taglineText
        ? mockupState.taglineFontSize * scaleFactor * 2
        : 0;
    const availableHeight = height - taglineHeight;
    const maxWidth = width * 0.7;
    const maxHeight = availableHeight * 0.7;
    const { dWidth, dHeight } = calculateContain(maxWidth, maxHeight, mockupState.screenshot.width, mockupState.screenshot.height);

    let x, y;

    if (mockupState.screenshotPosition === 'left') {
        x = width * 0.1;
    } else if (mockupState.screenshotPosition === 'right') {
        x = width - dWidth - (width * 0.1);
    } else {
        x = (width - dWidth) / 2;
    }

    if (mockupState.taglineEnabled && mockupState.taglinePosition === 'top') {
        y = taglineHeight + (availableHeight - dHeight) / 2;
    } else if (mockupState.taglineEnabled && mockupState.taglinePosition === 'bottom') {
        y = (availableHeight - dHeight) / 2;
    } else {
        y = (height - dHeight) / 2;
    }

    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 20 * scaleFactor;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10 * scaleFactor;

    ctx.drawImage(mockupState.screenshot, x, y, dWidth, dHeight);

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function renderTagline(ctx, width, height, scaleFactor = 1) {
    if (!mockupState.taglineEnabled || !mockupState.taglineText) return;

    const fontSize = mockupState.taglineFontSize * scaleFactor;

    ctx.font = `${mockupState.taglineWeight} ${fontSize}px 'Space Mono', monospace`;
    ctx.fillStyle = mockupState.taglineColor;
    ctx.textAlign = mockupState.taglineAlign;

    let textX;
    if (mockupState.taglineAlign === 'left') {
        textX = width * 0.1;
    } else if (mockupState.taglineAlign === 'right') {
        textX = width * 0.9;
    } else {
        textX = width / 2;
    }

    let textY;
    if (mockupState.taglinePosition === 'top') {
        textY = fontSize + 40 * scaleFactor;
    } else {
        textY = height - 60 * scaleFactor;
    }

    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10 * scaleFactor;
    ctx.shadowOffsetX = 2 * scaleFactor;
    ctx.shadowOffsetY = 2 * scaleFactor;

    ctx.fillText(mockupState.taglineText, textX, textY);

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

// ==================== Icons Tab ====================
setupUploadZone('icon-upload-zone', 'icon-input', handleIconUpload);

function handleIconUpload(file) {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
        img.onload = () => {
            processedIcons = [];
            const mode = document.getElementById('icon-resize-mode').value;
            const bgColor = document.getElementById('icon-bg-color').value;
            const padding = parseInt(document.getElementById('icon-padding').value);

            ICON_SIZES.forEach(size => {
                const canvas = document.createElement('canvas');
                canvas.width = size.width;
                canvas.height = size.height;
                const ctx = canvas.getContext('2d');

                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                let dx, dy, dWidth, dHeight;

                if (mode === 'contain') {
                    const result = calculateContain(size.width, size.height, img.width, img.height, padding);
                    dx = result.dx; dy = result.dy; dWidth = result.dWidth; dHeight = result.dHeight;
                } else if (mode === 'cover') {
                    const result = calculateCover(size.width, size.height, img.width, img.height);
                    dx = result.dx; dy = result.dy; dWidth = result.dWidth; dHeight = result.dHeight;
                } else {
                    const padPx = (Math.min(size.width, size.height) * padding) / 100;
                    dx = padPx; dy = padPx;
                    dWidth = size.width - padPx * 2;
                    dHeight = size.height - padPx * 2;
                }

                ctx.drawImage(img, dx, dy, dWidth, dHeight);

                processedIcons.push({
                    name: size.name,
                    size: `${size.width}x${size.height}`,
                    dataUrl: canvas.toDataURL('image/png'),
                    filename: `icon-${size.width}x${size.height}.png`
                });
            });

            displayPreviews('icon-preview', processedIcons);
            document.getElementById('icon-download-all').style.display = 'block';
        };
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

async function downloadAllIcons() {
    await downloadZip(processedIcons, 'chrome-extension-icons.zip');
}

// ==================== Promotional Tab ====================
setupUploadZone('promo-upload-zone', 'promo-input', handlePromoUpload);

function handlePromoUpload(file) {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
        img.onload = () => {
            processedPromo = [];
            const cropPosition = document.getElementById('promo-crop-position').value;

            PROMO_SIZES.forEach(size => {
                const canvas = document.createElement('canvas');
                canvas.width = size.width;
                canvas.height = size.height;
                const ctx = canvas.getContext('2d');

                const { dx: _, dy: _dy, dWidth, dHeight } = calculateCover(size.width, size.height, img.width, img.height);

                let dy;
                if (cropPosition === 'top') {
                    dy = 0;
                } else if (cropPosition === 'bottom') {
                    dy = size.height - dHeight;
                } else {
                    dy = (size.height - dHeight) / 2;
                }

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, _, dy, dWidth, dHeight);

                processedPromo.push({
                    name: size.name,
                    size: `${size.width}x${size.height}`,
                    dataUrl: canvas.toDataURL('image/png'),
                    filename: `${size.name.toLowerCase().replace(' ', '-')}-${size.width}x${size.height}.png`
                });
            });

            displayPreviews('promo-preview', processedPromo);
            document.getElementById('promo-download-all').style.display = 'block';
        };
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

async function downloadAllPromo() {
    await downloadZip(processedPromo, 'chrome-extension-promotional.zip');
}

// ==================== Screenshots Tab ====================
setupUploadZone('screenshot-upload-zone', 'screenshot-input', handleScreenshotUpload, true);

function handleScreenshotUpload(files) {
    if (files.length > 5) {
        alert('Maximum 5 screenshots!');
        return;
    }

    processedScreenshots = [];
    const [width, height] = document.getElementById('screenshot-size').value.split('x').map(Number);
    const mode = document.getElementById('screenshot-mode').value;

    let processed = 0;

    Array.from(files).forEach((file, index) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                if (mode === 'contain') {
                    const { dx, dy, dWidth, dHeight } = calculateContain(width, height, img.width, img.height);
                    ctx.drawImage(img, dx, dy, dWidth, dHeight);
                } else {
                    const { dx, dy, dWidth, dHeight } = calculateCover(width, height, img.width, img.height);
                    ctx.drawImage(img, dx, dy, dWidth, dHeight);
                }

                processedScreenshots.push({
                    name: `Screenshot ${index + 1}`,
                    size: `${width}x${height}`,
                    dataUrl: canvas.toDataURL('image/png'),
                    filename: `screenshot-${index + 1}-${width}x${height}.png`
                });

                processed++;
                if (processed === files.length) {
                    displayPreviews('screenshot-preview', processedScreenshots);
                    document.getElementById('screenshot-download-all').style.display = 'block';
                }
            };
            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    });
}

async function downloadAllScreenshots() {
    await downloadZip(processedScreenshots, 'chrome-extension-screenshots.zip');
}

// ==================== Mockup Generator ====================
const canvas = document.getElementById('mainCanvas');
const mockupCtx = canvas.getContext('2d');

// Background type switching
document.querySelectorAll('.bg-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.bg-type-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.bg-option').forEach(o => o.classList.remove('active'));

        btn.classList.add('active');
        mockupState.bgType = btn.dataset.type;
        document.getElementById(`bg-${btn.dataset.type}`).classList.add('active');

        renderMockup();
    });
});

// Solid color
document.getElementById('bg-solid-color').addEventListener('input', (e) => {
    mockupState.bgSolidColor = e.target.value;
    renderMockup();
});

// Gradient presets
document.querySelectorAll('.gradient-preset').forEach(preset => {
    preset.addEventListener('click', () => {
        document.querySelectorAll('.gradient-preset').forEach(p => p.classList.remove('active'));
        preset.classList.add('active');
        mockupState.bgGradient = preset.dataset.gradient;
        renderMockup();
    });
});

// Custom gradient
document.getElementById('gradient-color1').addEventListener('input', updateCustomGradient);
document.getElementById('gradient-color2').addEventListener('input', updateCustomGradient);

function updateCustomGradient() {
    const color1 = document.getElementById('gradient-color1').value;
    const color2 = document.getElementById('gradient-color2').value;
    mockupState.bgGradient = `linear-gradient(135deg, ${color1}, ${color2})`;
    document.querySelectorAll('.gradient-preset').forEach(p => p.classList.remove('active'));
    renderMockup();
}

// Background image
document.getElementById('bg-image-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                mockupState.bgImage = img;
                renderMockup();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('bg-image-mode').addEventListener('change', (e) => {
    mockupState.bgImageMode = e.target.value;
    renderMockup();
});

document.getElementById('bg-blur').addEventListener('input', (e) => {
    mockupState.bgBlur = parseInt(e.target.value);
    renderMockup();
});

document.getElementById('bg-dim').addEventListener('input', (e) => {
    mockupState.bgDim = parseInt(e.target.value);
    renderMockup();
});

// Screenshot upload
document.getElementById('mockup-screenshot-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                mockupState.screenshot = img;
                renderMockup();
                document.getElementById('export-selected').disabled = false;
                document.getElementById('export-all').disabled = false;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Screenshot position
document.getElementById('screenshot-position').addEventListener('change', (e) => {
    mockupState.screenshotPosition = e.target.value;
    renderMockup();
});

// Tagline controls
document.getElementById('tagline-enabled').addEventListener('change', (e) => {
    mockupState.taglineEnabled = e.target.checked;
    document.getElementById('tagline-options').style.display = e.target.checked ? 'block' : 'none';
    renderMockup();
});

document.getElementById('tagline-text').addEventListener('input', (e) => {
    mockupState.taglineText = e.target.value;
    renderMockup();
});

document.getElementById('tagline-position').addEventListener('change', (e) => {
    mockupState.taglinePosition = e.target.value;
    renderMockup();
});

document.getElementById('tagline-font-size').addEventListener('input', (e) => {
    mockupState.taglineFontSize = parseInt(e.target.value);
    document.getElementById('tagline-font-size-value').textContent = `${e.target.value}px`;
    renderMockup();
});

document.getElementById('tagline-color').addEventListener('input', (e) => {
    mockupState.taglineColor = e.target.value;
    renderMockup();
});

document.getElementById('tagline-align').addEventListener('change', (e) => {
    mockupState.taglineAlign = e.target.value;
    renderMockup();
});

document.getElementById('tagline-weight').addEventListener('change', (e) => {
    mockupState.taglineWeight = e.target.value;
    renderMockup();
});

function renderMockup() {
    mockupCtx.clearRect(0, 0, canvas.width, canvas.height);
    renderBackground(mockupCtx, canvas.width, canvas.height);
    renderScreenshot(mockupCtx, canvas.width, canvas.height);
    renderTagline(mockupCtx, canvas.width, canvas.height);
}

function generateMockup(width, height) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    const scaleFactor = width / canvas.width;

    renderBackground(tempCtx, width, height);
    renderScreenshot(tempCtx, width, height, scaleFactor);
    renderTagline(tempCtx, width, height, scaleFactor);

    return tempCanvas.toDataURL('image/png');
}

function exportMockup(width, height, name) {
    const dataUrl = generateMockup(width, height);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${name.toLowerCase().replace(/\s+/g, '-')}-${width}x${height}.png`;
    a.click();
}

// Export buttons
document.getElementById('export-selected').addEventListener('click', () => {
    const selectedPresets = document.querySelectorAll('.export-preset input[type="checkbox"]:checked');
    selectedPresets.forEach(preset => {
        const [width, height] = preset.dataset.size.split('x').map(Number);
        exportMockup(width, height, preset.dataset.name);
    });
});

document.getElementById('export-all').addEventListener('click', async () => {
    const zip = new JSZip();

    for (const preset of EXPORT_PRESETS) {
        const dataUrl = generateMockup(preset.width, preset.height);
        const base64Data = dataUrl.split(',')[1];
        const filename = `${preset.name.toLowerCase().replace(/\s+/g, '-')}-${preset.width}x${preset.height}.png`;
        zip.file(filename, base64Data, { base64: true });
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mockup-exports.zip';
    a.click();
    URL.revokeObjectURL(url);
});

// ==================== Tab Switching ====================
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(tab.dataset.tab + '-tab').classList.add('active');
    });
});

// ==================== Theme Toggle ====================
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
});

// ==================== Init ====================
renderMockup();
