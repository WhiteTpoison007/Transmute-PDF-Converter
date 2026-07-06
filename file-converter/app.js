/* ============================================
   TRANSMUTE — App Logic
   ============================================ */

// ── PDF.js setup ──────────────────────────────
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ── Navigation ───────────────────────────────
const sections = document.querySelectorAll('.section');
const navLinks  = document.querySelectorAll('.nav-link');

function showSection(id) {
  sections.forEach(s => s.classList.remove('active'));
  navLinks.forEach(l => l.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  const link = document.querySelector(`.nav-link[data-section="${id}"]`);
  if (link) link.classList.add('active');
  // Sync mobile links
  document.querySelectorAll('.mobile-link').forEach(l => {
    l.classList.toggle('active', l.dataset.section === id);
  });
  // Close mobile menu
  const mob = document.getElementById('mobileMenu');
  const ham = document.getElementById('navHamburger');
  if (mob) mob.classList.add('hidden');
  if (ham) ham.classList.remove('open');
  window.scrollTo(0, 0);
}

// Desktop nav
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    showSection(link.dataset.section);
  });
});

// data-target buttons (hero cards, back buttons)
document.querySelectorAll('[data-target]').forEach(btn => {
  btn.addEventListener('click', () => showSection(btn.dataset.target));
});

// Mobile hamburger
const hamburger  = document.getElementById('navHamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const isOpen = !mobileMenu.classList.contains('hidden');
  mobileMenu.classList.toggle('hidden', isOpen);
  hamburger.classList.toggle('open', !isOpen);
});

// Mobile nav links
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    showSection(link.dataset.section);
  });
});

// ── Toast ─────────────────────────────────────
const toast = document.getElementById('toast');
let toastTimer;
function showToast(msg, type = '') {
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = 'toast hidden'; }, 3000);
}

// ── Utilities ─────────────────────────────────
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function setProgress(fillEl, labelEl, pct, label) {
  fillEl.style.width = pct + '%';
  labelEl.textContent = label;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ============================================================
//  PDF CONVERTER
// ============================================================
const pdfDropZone      = document.getElementById('pdfDropZone');
const pdfFileInput     = document.getElementById('pdfFileInput');
const pdfFileInfo      = document.getElementById('pdfFileInfo');
const pdfFileName      = document.getElementById('pdfFileName');
const pdfFileMeta      = document.getElementById('pdfFileMeta');
const pdfRemove        = document.getElementById('pdfRemove');
const pdfConvertBtn    = document.getElementById('pdfConvertBtn');
const pdfProgress      = document.getElementById('pdfProgress');
const pdfProgressFill  = document.getElementById('pdfProgressFill');
const pdfProgressLabel = document.getElementById('pdfProgressLabel');
const pdfResults       = document.getElementById('pdfResults');
const pdfResultsGrid   = document.getElementById('pdfResultsGrid');
const pdfDownloadAll   = document.getElementById('pdfDownloadAll');

let pdfFile    = null;
let pdfOutputs = [];

pdfDropZone.addEventListener('click', () => pdfFileInput.click());
pdfDropZone.addEventListener('dragover',  e => { e.preventDefault(); pdfDropZone.classList.add('drag-over'); });
pdfDropZone.addEventListener('dragleave', () => pdfDropZone.classList.remove('drag-over'));
pdfDropZone.addEventListener('drop', e => {
  e.preventDefault();
  pdfDropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type === 'application/pdf') setPdfFile(file);
  else showToast('Please drop a PDF file', 'error');
});
pdfFileInput.addEventListener('change', e => {
  if (e.target.files[0]) setPdfFile(e.target.files[0]);
});

function setPdfFile(file) {
  pdfFile = file;
  pdfFileName.textContent = file.name;
  pdfFileMeta.textContent = formatBytes(file.size);
  pdfFileInfo.classList.remove('hidden');
  pdfDropZone.classList.add('hidden');
  pdfConvertBtn.classList.remove('hidden');
  pdfResults.classList.add('hidden');
  pdfProgress.classList.add('hidden');
  pdfOutputs = [];
  pdfResultsGrid.innerHTML = '';
}

pdfRemove.addEventListener('click', () => {
  pdfFile = null;
  pdfFileInput.value = '';
  pdfFileInfo.classList.add('hidden');
  pdfDropZone.classList.remove('hidden');
  pdfConvertBtn.classList.add('hidden');
  pdfResults.classList.add('hidden');
});

pdfConvertBtn.addEventListener('click', async () => {
  if (!pdfFile) return;
  const format = document.querySelector('input[name="pdfFormat"]:checked').value;

  pdfConvertBtn.disabled = true;
  pdfConvertBtn.querySelector('.btn-text').textContent = 'Converting...';
  pdfProgress.classList.remove('hidden');
  pdfResults.classList.add('hidden');
  pdfResultsGrid.innerHTML = '';
  pdfOutputs = [];

  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;

    if (format === 'images' || format === 'jpeg') {
      await convertPdfToImages(pdf, numPages, format);
    } else if (format === 'text') {
      await convertPdfToText(pdf, numPages);
    } else if (format === 'html') {
      await convertPdfToHtml(pdf, numPages);
    }

    pdfResults.classList.remove('hidden');
    showToast('Conversion complete!', 'success');
  } catch (err) {
    console.error(err);
    showToast('Error: ' + err.message, 'error');
  }

  pdfConvertBtn.disabled = false;
  pdfConvertBtn.querySelector('.btn-text').textContent = 'Convert Now';
  pdfProgress.classList.add('hidden');
});

async function convertPdfToImages(pdf, numPages, format) {
  const isJpeg   = format === 'jpeg';
  const mimeType = isJpeg ? 'image/jpeg' : 'image/png';
  const ext      = isJpeg ? 'jpg' : 'png';

  for (let i = 1; i <= numPages; i++) {
    setProgress(pdfProgressFill, pdfProgressLabel,
      Math.round((i / numPages) * 100), `Rendering page ${i} of ${numPages}...`);

    const page     = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas   = document.createElement('canvas');
    canvas.width   = viewport.width;
    canvas.height  = viewport.height;
    const ctx = canvas.getContext('2d');
    if (isJpeg) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob     = await new Promise(res => canvas.toBlob(res, mimeType, isJpeg ? 0.92 : undefined));
    const filename = `page-${String(i).padStart(3, '0')}.${ext}`;
    pdfOutputs.push({ blob, filename });

    const item   = document.createElement('div');
    item.className = 'result-item';
    item.style.animationDelay = `${(i - 1) * 0.05}s`;
    const thumb  = document.createElement('img');
    thumb.className = 'result-thumb';
    thumb.src    = URL.createObjectURL(blob);
    const footer = document.createElement('div');
    footer.className = 'result-footer';
    footer.innerHTML = `<span class="result-name">${filename}</span>`;
    const dlLink = document.createElement('a');
    dlLink.className = 'result-dl';
    dlLink.textContent = '↓';
    dlLink.href     = URL.createObjectURL(blob);
    dlLink.download = filename;
    footer.appendChild(dlLink);
    item.appendChild(thumb);
    item.appendChild(footer);
    pdfResultsGrid.appendChild(item);
  }
}

async function convertPdfToText(pdf, numPages) {
  let fullText = '';
  for (let i = 1; i <= numPages; i++) {
    setProgress(pdfProgressFill, pdfProgressLabel,
      Math.round((i / numPages) * 100), `Extracting text from page ${i} of ${numPages}...`);
    const page    = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += `\n\n--- Page ${i} ---\n\n${content.items.map(x => x.str).join(' ')}`;
  }

  const blob     = new Blob([fullText], { type: 'text/plain' });
  const baseName = pdfFile.name.replace(/\.pdf$/i, '');
  const filename = `${baseName}.txt`;
  pdfOutputs.push({ blob, filename });

  const container = document.createElement('div');
  container.style.gridColumn = '1 / -1';
  const pre = document.createElement('pre');
  pre.className   = 'result-text-block';
  pre.textContent = fullText.trim();
  container.appendChild(pre);

  const dlWrap = document.createElement('div');
  dlWrap.style.cssText = 'margin-top:0.75rem;text-align:right;';
  const dlBtn = document.createElement('a');
  dlBtn.textContent    = '↓ Download .txt';
  dlBtn.href           = URL.createObjectURL(blob);
  dlBtn.download       = filename;
  dlBtn.className      = 'download-all-btn';
  dlBtn.style.textDecoration = 'none';
  dlWrap.appendChild(dlBtn);
  container.appendChild(dlWrap);
  pdfResultsGrid.appendChild(container);
}

async function convertPdfToHtml(pdf, numPages) {
  let htmlBody = '';
  for (let i = 1; i <= numPages; i++) {
    setProgress(pdfProgressFill, pdfProgressLabel,
      Math.round((i / numPages) * 100), `Converting page ${i} of ${numPages}...`);
    const page     = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas   = document.createElement('canvas');
    canvas.width   = viewport.width;
    canvas.height  = viewport.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    htmlBody += `<div class="pdf-page" style="width:${viewport.width}px;">
      <div class="page-num">Page ${i}</div>
      <img src="${dataUrl}" alt="Page ${i}" style="width:100%;display:block;border-radius:4px;"/>
    </div>`;
  }

  const baseName   = pdfFile.name.replace(/\.pdf$/i, '');
  const htmlContent = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${baseName}</title>
<style>body{margin:0;padding:2rem;background:#1a1a1a;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;gap:2rem;}
.pdf-page{position:relative;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.4);max-width:100%;}
.page-num{position:absolute;top:10px;right:14px;background:rgba(0,0,0,.5);color:#fff;font-size:12px;padding:3px 10px;border-radius:100px;z-index:1;}
</style></head><body>${htmlBody}</body></html>`;

  const blob     = new Blob([htmlContent], { type: 'text/html' });
  const filename = `${baseName}.html`;
  pdfOutputs.push({ blob, filename });

  const container = document.createElement('div');
  container.style.gridColumn = '1 / -1';
  container.innerHTML = `<div class="pdf-preview-wrap">
    <div class="pdf-success-icon">🌐</div>
    <div class="pdf-success-msg">HTML ready — ${numPages} page${numPages > 1 ? 's' : ''} embedded</div>
  </div>`;
  const dlWrap = document.createElement('div');
  dlWrap.style.cssText = 'margin-top:1rem;text-align:right;';
  const dlBtn = document.createElement('a');
  dlBtn.textContent    = '↓ Download .html';
  dlBtn.href           = URL.createObjectURL(blob);
  dlBtn.download       = filename;
  dlBtn.className      = 'download-all-btn';
  dlBtn.style.textDecoration = 'none';
  dlWrap.appendChild(dlBtn);
  container.appendChild(dlWrap);
  pdfResultsGrid.appendChild(container);
}

pdfDownloadAll.addEventListener('click', async () => {
  if (!pdfOutputs.length) return;
  if (pdfOutputs.length === 1) {
    downloadBlob(pdfOutputs[0].blob, pdfOutputs[0].filename);
    return;
  }
  pdfDownloadAll.textContent = 'Zipping...';
  pdfDownloadAll.disabled    = true;
  try {
    const zip = new JSZip();
    for (const { blob, filename } of pdfOutputs) zip.file(filename, blob);
    const zipBlob  = await zip.generateAsync({ type: 'blob' });
    const baseName = pdfFile.name.replace(/\.pdf$/i, '');
    downloadBlob(zipBlob, `${baseName}-converted.zip`);
    showToast('ZIP downloaded!', 'success');
  } catch (err) {
    showToast('ZIP error: ' + err.message, 'error');
  }
  pdfDownloadAll.textContent = 'Download All';
  pdfDownloadAll.disabled    = false;
});


// ============================================================
//  IMAGE TO PDF CONVERTER
// ============================================================
const imgDropZone      = document.getElementById('imgDropZone');
const imgFileInput     = document.getElementById('imgFileInput');
const imgQueue         = document.getElementById('imgQueue');
const imgQueueList     = document.getElementById('imgQueueList');
const imgCount         = document.getElementById('imgCount');
const imgAddMore       = document.getElementById('imgAddMore');
const imgClearAll      = document.getElementById('imgClearAll');
const imgConvertBtn    = document.getElementById('imgConvertBtn');
const imgProgress      = document.getElementById('imgProgress');
const imgProgressFill  = document.getElementById('imgProgressFill');
const imgProgressLabel = document.getElementById('imgProgressLabel');
const imgResult        = document.getElementById('imgResult');
const imgDownloadBtn   = document.getElementById('imgDownloadBtn');
const imgPdfPreview    = document.getElementById('imgPdfPreview');
const pdfOptions       = document.getElementById('pdfOptions');

let imgFiles  = [];
let idCounter = 0;

imgDropZone.addEventListener('click', () => imgFileInput.click());
imgDropZone.addEventListener('dragover',  e => { e.preventDefault(); imgDropZone.classList.add('drag-over'); });
imgDropZone.addEventListener('dragleave', () => imgDropZone.classList.remove('drag-over'));
imgDropZone.addEventListener('drop', e => {
  e.preventDefault();
  imgDropZone.classList.remove('drag-over');
  addImages(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')));
});
imgFileInput.addEventListener('change', e => {
  addImages(Array.from(e.target.files));
  imgFileInput.value = '';
});
imgAddMore.addEventListener('click',  () => imgFileInput.click());
imgClearAll.addEventListener('click', () => { imgFiles = []; renderQueue(); });

function addImages(files) {
  files.forEach(file => {
    if (!file.type.startsWith('image/')) return;
    imgFiles.push({ file, id: ++idCounter, thumbUrl: URL.createObjectURL(file) });
  });
  renderQueue();
}

function renderQueue() {
  if (!imgFiles.length) {
    imgQueue.classList.add('hidden');
    imgDropZone.classList.remove('hidden');
    imgConvertBtn.classList.add('hidden');
    pdfOptions.classList.add('hidden');
    imgResult.classList.add('hidden');
    return;
  }
  imgDropZone.classList.add('hidden');
  imgQueue.classList.remove('hidden');
  imgConvertBtn.classList.remove('hidden');
  pdfOptions.classList.remove('hidden');
  imgCount.textContent = imgFiles.length;
  imgQueueList.innerHTML = '';

  imgFiles.forEach(item => {
    const el = document.createElement('div');
    el.className  = 'queue-item';
    el.dataset.id = item.id;
    el.draggable  = true;
    el.innerHTML  = `
      <span class="queue-drag-handle">&#8285;</span>
      <img class="queue-item-thumb" src="${item.thumbUrl}" alt=""/>
      <span class="queue-item-name">${item.file.name}</span>
      <span class="queue-item-size">${formatBytes(item.file.size)}</span>
      <button class="queue-item-remove" data-id="${item.id}">&#10005;</button>`;
    imgQueueList.appendChild(el);
  });

  imgQueueList.querySelectorAll('.queue-item-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      imgFiles = imgFiles.filter(f => f.id !== parseInt(btn.dataset.id));
      renderQueue();
    });
  });
  setupDragSort();
}

let dragSrc = null;
function setupDragSort() {
  imgQueueList.querySelectorAll('.queue-item').forEach(item => {
    item.addEventListener('dragstart', () => { dragSrc = item; item.classList.add('dragging'); });
    item.addEventListener('dragend',   () => { item.classList.remove('dragging'); dragSrc = null; });
    item.addEventListener('dragover',  e => {
      e.preventDefault();
      if (!dragSrc || dragSrc === item) return;
      const mid = item.getBoundingClientRect().top + item.getBoundingClientRect().height / 2;
      imgQueueList.insertBefore(dragSrc, e.clientY < mid ? item : item.nextSibling);
      const newOrder = Array.from(imgQueueList.querySelectorAll('.queue-item')).map(el => parseInt(el.dataset.id));
      imgFiles = newOrder.map(id => imgFiles.find(f => f.id === id)).filter(Boolean);
      imgCount.textContent = imgFiles.length;
    });
  });
}

let resultPdfBlob = null;

imgConvertBtn.addEventListener('click', async () => {
  if (!imgFiles.length) return;
  imgConvertBtn.disabled = true;
  imgConvertBtn.querySelector('.btn-text').textContent = 'Building...';
  imgProgress.classList.remove('hidden');
  imgResult.classList.add('hidden');

  const pageSize    = document.getElementById('pageSize').value;
  const orientation = document.getElementById('pageOrientation').value;
  const margin      = parseInt(document.getElementById('pageMargin').value) || 0;

  try {
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.create();

    for (let i = 0; i < imgFiles.length; i++) {
      setProgress(imgProgressFill, imgProgressLabel,
        Math.round(((i + 1) / imgFiles.length) * 100),
        `Adding image ${i + 1} of ${imgFiles.length}...`);

      const { file } = imgFiles[i];
      const uint8    = new Uint8Array(await file.arrayBuffer());
      let imgEmbed;

      if (file.type === 'image/jpeg') {
        imgEmbed = await pdfDoc.embedJpg(uint8);
      } else {
        const bitmap = await createImageBitmap(new Blob([uint8], { type: file.type }));
        const canvas = document.createElement('canvas');
        canvas.width  = bitmap.width;
        canvas.height = bitmap.height;
        canvas.getContext('2d').drawImage(bitmap, 0, 0);
        const pngBuf = await (await new Promise(res => canvas.toBlob(res, 'image/png'))).arrayBuffer();
        imgEmbed = await pdfDoc.embedPng(new Uint8Array(pngBuf));
      }

      const [imgW, imgH] = [imgEmbed.width, imgEmbed.height];
      const sizes = { a4: [595.28, 841.89], letter: [612, 792] };
      let [pageW, pageH] = pageSize === 'fit'
        ? [imgW + margin * 2, imgH + margin * 2]
        : (sizes[pageSize] || sizes.a4);

      if (orientation === 'landscape') [pageW, pageH] = [pageH, pageW];

      const page  = pdfDoc.addPage([pageW, pageH]);
      const scale = Math.min((pageW - margin * 2) / imgW, (pageH - margin * 2) / imgH, 1);
      const drawW = imgW * scale;
      const drawH = imgH * scale;

      page.drawImage(imgEmbed, {
        x: margin + ((pageW - margin * 2) - drawW) / 2,
        y: margin + ((pageH - margin * 2) - drawH) / 2,
        width: drawW, height: drawH
      });
    }

    const pdfBytes = await pdfDoc.save();
    resultPdfBlob  = new Blob([pdfBytes], { type: 'application/pdf' });
    imgPdfPreview.innerHTML = `
      <div class="pdf-success-icon">📄</div>
      <div class="pdf-success-msg">PDF built with ${imgFiles.length} page${imgFiles.length > 1 ? 's' : ''} (${formatBytes(resultPdfBlob.size)})</div>`;
    imgResult.classList.remove('hidden');
    showToast('PDF created!', 'success');
  } catch (err) {
    console.error(err);
    showToast('Error: ' + err.message, 'error');
  }

  imgConvertBtn.disabled = false;
  imgConvertBtn.querySelector('.btn-text').textContent = 'Build PDF';
  imgProgress.classList.add('hidden');
});

imgDownloadBtn.addEventListener('click', () => {
  if (resultPdfBlob) downloadBlob(resultPdfBlob, 'converted-images.pdf');
});
