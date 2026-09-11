#include "PhoneCameraServer.h"
#include "Config.h"
#include "StorageManager.h"
#include <WiFi.h>
#include <ArduinoJson.h>
#include <lwip/netif.h>

PhoneCameraServer CameraServer;

static const char INDEX_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>SIA · Cámara de Estación</title>
<script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0f172a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex; flex-direction: column; align-items: center; min-height: 100vh; padding: 14px;
  }
  header { width: 100%; max-width: 480px; text-align: center; margin-bottom: 10px; }
  header h1 { font-size: 1.2rem; font-weight: 700; color: #f8fafc; letter-spacing: -0.02em; }
  header p { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; }
  .badge { display: inline-flex; align-items: center; gap: 6px; font-size: 0.72rem; font-weight: 500; padding: 3px 10px; border-radius: 999px; background: #05966922; color: #34d399; margin-top: 5px; border: 1px solid #05966944; }
  .badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #34d399; box-shadow: 0 0 8px #34d399; }

  .viewfinder-card {
    width: 100%; max-width: 480px; background: #020617; border-radius: 20px; overflow: hidden;
    box-shadow: 0 12px 32px rgba(0,0,0,0.5); border: 1px solid #1e293b; position: relative;
    aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center;
  }
  #video { width: 100%; height: 100%; object-fit: cover; display: block; }
  .overlay-guide {
    position: absolute; width: 220px; height: 220px; border: 2px dashed #38bdf8; border-radius: 20px;
    pointer-events: none; opacity: 0.8; box-shadow: 0 0 15px rgba(56,189,248,0.25);
  }
  .laser-line {
    position: absolute; left: calc(50% - 110px); width: 220px; height: 2px;
    background: linear-gradient(90deg, transparent, #38bdf8, #0ea5e9, transparent);
    box-shadow: 0 0 12px #38bdf8, 0 0 4px #fff; display: none;
    animation: scanAnim 2s infinite ease-in-out alternate; pointer-events: none;
  }
  @keyframes scanAnim {
    0% { top: calc(50% - 105px); opacity: 0.4; }
    50% { opacity: 1; }
    100% { top: calc(50% + 105px); opacity: 0.4; }
  }

  /* Loading Overlay para evitar doble envío */
  .loading-overlay {
    position: absolute; inset: 0; background: rgba(2, 6, 23, 0.88); backdrop-filter: blur(5px);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    z-index: 25; border-radius: 20px; padding: 20px; text-align: center; gap: 12px;
    transition: opacity 0.2s ease;
  }
  .spinner {
    width: 48px; height: 48px; border: 4px solid #334155; border-top-color: #38bdf8;
    border-radius: 50%; animation: spin 0.85s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
  }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  .loading-title { font-size: 1.05rem; font-weight: 700; color: #f8fafc; }
  .loading-desc { font-size: 0.8rem; color: #94a3b8; max-width: 260px; line-height: 1.35; }
  .loading-badge {
    font-size: 0.72rem; padding: 3px 10px; border-radius: 999px; background: #0284c722;
    color: #38bdf8; border: 1px solid #0284c744; font-weight: 600;
  }

  .controls { width: 100%; max-width: 480px; margin-top: 12px; display: flex; flex-direction: column; gap: 10px; }
  
  .mode-switch-card {
    display: flex; align-items: center; justify-content: space-between;
    background: #1e293b; padding: 10px 14px; border-radius: 12px; border: 1px solid #334155;
  }
  .mode-label { font-size: 0.85rem; font-weight: 600; color: #f1f5f9; display: flex; align-items: center; gap: 8px; }
  .toggle { position: relative; display: inline-block; width: 46px; height: 26px; }
  .toggle input { opacity: 0; width: 0; height: 0; }
  .slider {
    position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
    background-color: #475569; transition: .3s; border-radius: 26px;
  }
  .slider:before {
    position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px;
    background-color: white; transition: .3s; border-radius: 50%;
  }
  input:checked + .slider { background-color: #0284c7; }
  input:checked + .slider:before { transform: translateX(20px); }

  .input-group { display: flex; flex-direction: column; gap: 4px; }
  .input-group label { font-size: 0.75rem; color: #94a3b8; font-weight: 500; }
  .input-group input {
    background: #1e293b; border: 1px solid #334155; color: #fff; padding: 10px 12px;
    border-radius: 10px; font-size: 0.95rem; outline: none; transition: border-color 0.2s;
  }
  .input-group input:focus { border-color: #38bdf8; }

  .btn-row { display: flex; gap: 10px; }
  button {
    flex: 1; padding: 12px; border-radius: 10px; border: none; font-size: 0.92rem; font-weight: 600;
    cursor: pointer; transition: all 0.15s ease;
  }
  .btn-primary { background: #0284c7; color: #fff; }
  .btn-primary:active { background: #0369a1; transform: scale(0.98); }
  .btn-primary:disabled { background: #1e293b; color: #64748b; cursor: not-allowed; transform: none; }
  .btn-secondary { background: #334155; color: #e2e8f0; }
  .btn-secondary:active { background: #475569; }

  .chrome-guide-card {
    width: 100%; max-width: 480px; margin-top: 14px; padding: 14px 16px;
    background: #1e293b; border-radius: 14px; border: 1px solid #38bdf844;
    font-size: 0.82rem; line-height: 1.45; color: #cbd5e1;
  }
  .chrome-guide-card h3 { font-size: 0.95rem; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
  .chrome-guide-card ol { padding-left: 18px; margin-top: 6px; }
  .chrome-guide-card li { margin-bottom: 6px; }
  .code-chip { background: #0f172a; color: #f59e0b; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.85rem; word-break: break-all; }

  .fallback-box {
    width: 100%; max-width: 480px; margin-top: 14px; padding: 12px; background: #1e293b88;
    border-radius: 12px; border: 1px dashed #475569; text-align: center; font-size: 0.8rem; color: #94a3b8;
  }
  .fallback-box input { display: none; }
  .fallback-box label { color: #38bdf8; cursor: pointer; text-decoration: underline; font-weight: 600; }
</style>
</head>
<body>

<header>
  <h1>SIA · Estación de Identificación</h1>
  <p>Cámara de Reconocimiento y Escáner QR</p>
  <div class="badge"><span class="badge-dot"></span> Pantalla CYD Conectada</div>
</header>

<div class="viewfinder-card">
  <video id="video" autoplay playsinline muted></video>
  <div class="overlay-guide"></div>
  <div class="laser-line" id="laser"></div>
  
  <!-- Loading overlay para bloquear reenvíos duplicados -->
  <div class="loading-overlay" id="loading-overlay" style="display:none;">
    <div class="spinner"></div>
    <div class="loading-title" id="loading-title">Enviando código...</div>
    <div class="loading-desc" id="loading-desc">La estación validará el acceso</div>
    <span class="loading-badge" id="loading-badge">Revisa el resultado en la pantalla</span>
  </div>
</div>

<div class="controls">
  <div class="mode-switch-card">
    <span class="mode-label">⚡ Validación Automática al Escanear QR</span>
    <label class="toggle">
      <input type="checkbox" id="toggle-auto" checked>
      <span class="slider"></span>
    </label>
  </div>

  <div class="input-group">
    <label for="code-input">Código QR / Carnet Manual (o presiona Enter):</label>
    <input type="text" id="code-input" placeholder="Apunta la cámara al QR o escribe carnet">
  </div>

  <div class="btn-row">
    <button class="btn-secondary" id="btn-switch" type="button">Girar Cámara</button>
    <button class="btn-primary" id="btn-capture" type="button">Validar Ahora</button>
  </div>
</div>

<div class="chrome-guide-card" id="chrome-guide" style="display:none;">
  <h3>📷 Permiso de Cámara en Android (Chrome)</h3>
  <p>Por seguridad en redes locales (HTTP), Chrome bloquea la cámara continua hasta habilitar este permiso una única vez:</p>
  <ol>
    <li>Abre una nueva pestaña y ve a: <br><span class="code-chip">chrome://flags</span></li>
    <li>En la barra de búsqueda escribe: <span class="code-chip">unsafely-treat-insecure-origin-as-secure</span></li>
    <li>Cámbialo a <b>Enabled</b> y en el cuadro de texto escribe: <br><span class="code-chip">http://192.168.4.1</span></li>
    <li>Presiona el botón azul <b>Relaunch</b> al final de la pantalla y regresa aquí.</li>
  </ol>
</div>

<div class="fallback-box">
  ¿No puedes activar la cámara en vivo?<br>
  <label for="fallback-file">Toca aquí para tomar una foto y validar</label>
  <input type="file" id="fallback-file" accept="image/*" capture="user">
</div>

<canvas id="canvas" style="display:none;"></canvas>

<script>
  let currentStream = null;
  let facingMode = "user";
  let isProcessing = false;
  let lastScannedCode = "";
  let lastScanTime = 0;
  const COOLDOWN_SAME_CODE_MS = 3500; // Evita re-enviar la misma persona si el QR sigue frente a la lente

  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const laser = document.getElementById('laser');
  const btnCapture = document.getElementById('btn-capture');
  const btnSwitch = document.getElementById('btn-switch');
  const toggleAuto = document.getElementById('toggle-auto');
  const codeInput = document.getElementById('code-input');
  const chromeGuide = document.getElementById('chrome-guide');
  const fallbackFile = document.getElementById('fallback-file');
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingTitle = document.getElementById('loading-title');
  const loadingDesc = document.getElementById('loading-desc');

  function showLoading(show, title = "", desc = "") {
    if (show) {
      loadingTitle.textContent = title || "Enviando código...";
      loadingDesc.textContent = desc || "La estación validará el acceso";
      loadingOverlay.style.display = 'flex';
      laser.style.display = 'none';
      btnCapture.disabled = true;
      btnCapture.textContent = 'Enviando...';
    } else {
      loadingOverlay.style.display = 'none';
      btnCapture.disabled = false;
      btnCapture.textContent = 'Validar Ahora';
      updateLaser();
    }
  }

  async function startCamera() {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }
    try {
      currentStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
      video.srcObject = currentStream;
      video.style.display = 'block';
      chromeGuide.style.display = 'none';
      updateLaser();
      startQrScanner();
    } catch (err) {
      console.warn("getUserMedia fallo:", err);
      video.style.display = 'none';
      chromeGuide.style.display = 'block';
    }
  }

  let qrDetector = null;
  if ('BarcodeDetector' in window) {
    try {
      qrDetector = new BarcodeDetector({ formats: ['qr_code', 'code_128', 'code_39', 'data_matrix'] });
    } catch(e) {
      console.warn("BarcodeDetector:", e);
    }
  }

  function extractStudentCode(raw) {
    if (!raw) return "";
    let code = raw.trim();
    if (code.includes('?')) code = code.split('?')[0].trim();
    if (code.includes('#')) code = code.split('#')[0].trim();
    if (code.includes('/')) {
      const parts = code.split('/').filter(p => p.length > 0);
      if (parts.length > 0) code = parts[parts.length - 1].trim();
    }
    return code;
  }

  let qrScanInterval = null;
  function startQrScanner() {
    if (qrScanInterval) clearInterval(qrScanInterval);

    qrScanInterval = setInterval(async () => {
      // Si ya se está procesando una validación o la cámara no está lista, ignorar
      if (isProcessing || !video.videoWidth || video.style.display === 'none') return;
      
      let rawVal = "";

      // 1. Intentar con BarcodeDetector nativo (rápido por hardware)
      if (qrDetector) {
        try {
          const barcodes = await qrDetector.detect(video);
          if (barcodes && barcodes.length > 0) {
            rawVal = barcodes[0].rawValue || "";
          }
        } catch (err) {}
      }

      // 2. Si no hay BarcodeDetector o no detectó nada, usar jsQR (universal para cualquier navegador/iPhone/Android)
      if (!rawVal && window.jsQR) {
        try {
          const w = Math.min(video.videoWidth, 360);
          const h = Math.round((video.videoHeight * w) / video.videoWidth);
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(video, 0, 0, w, h);
          const imgData = ctx.getImageData(0, 0, w, h);
          const result = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: "dontInvert" });
          if (result && result.data) {
            rawVal = result.data;
          }
        } catch (err) {}
      }

      // 3. Procesar código si se encontró
      if (rawVal) {
        const clean = extractStudentCode(rawVal);
        const now = Date.now();

        if (clean.length > 0) {
          if (clean === lastScannedCode && (now - lastScanTime) < COOLDOWN_SAME_CODE_MS) {
            return;
          }

          console.log("QR Detectado automáticamente:", clean);
          codeInput.value = clean;
          lastScannedCode = clean;
          lastScanTime = now;

          if (navigator.vibrate) navigator.vibrate(60);

          if (toggleAuto.checked && !isProcessing) {
            triggerValidation(clean);
          }
        }
      }
    }, 250);
  }

  function updateLaser() {
    if (toggleAuto.checked && video.style.display !== 'none' && !isProcessing) {
      laser.style.display = 'block';
    } else {
      laser.style.display = 'none';
    }
  }

  toggleAuto.addEventListener('change', () => {
    updateLaser();
  });

  btnSwitch.addEventListener('click', () => {
    facingMode = facingMode === "user" ? "environment" : "user";
    startCamera();
  });

  // Disparar envío (captura de foto + código + loading). La estación decide y muestra
  // el resultado (concedido/denegado, entrada/salida) en su propia pantalla.
  function triggerValidation(codeVal) {
    if (isProcessing) return; // Candado estricto anti-duplicados
    isProcessing = true;

    showLoading(true, "Enviando código...", `Código: ${codeVal || '(sin código)'}`);

    // Capturar frame del video
    let base64 = "";
    if (video.videoWidth > 0 && video.style.display !== 'none') {
      const maxDim = 320;
      let w = video.videoWidth;
      let h = video.videoHeight;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
        else { w = Math.round((w * maxDim) / h); h = maxDim; }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.38);
      base64 = dataUrl.split(',')[1];
    }

    sendCapture(base64, codeVal);
  }

  // Envía el código a la estación y solo espera la confirmación de recepción (ack).
  // No espera ni muestra el resultado de la validación: eso lo hace la pantalla SIA.
  async function sendCapture(base64Data, codeVal) {
    try {
      await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeVal || "",
          image: base64Data || ""
        })
      });
      if (navigator.vibrate) navigator.vibrate(80);
      loadingTitle.textContent = "Código enviado";
      loadingDesc.textContent = "Revisa el resultado en la pantalla de la estación";
      setTimeout(() => showLoading(false), 900);
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate([200, 80, 200]);
      loadingTitle.textContent = "Error de conexión";
      loadingDesc.textContent = "No se pudo comunicar con la estación. Intenta de nuevo.";
      setTimeout(() => showLoading(false), 1600);
    } finally {
      setTimeout(() => {
        isProcessing = false;
        codeInput.value = '';
      }, 1800);
    }
  }

  // Si el usuario escribe o usa un lector físico que presiona Enter
  codeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const clean = extractStudentCode(codeInput.value);
      if (clean.length > 0 && !isProcessing) {
        lastScannedCode = clean;
        lastScanTime = Date.now();
        triggerValidation(clean);
      }
    }
  });

  // Botón manual de validación
  btnCapture.addEventListener('click', () => {
    if (isProcessing) return;
    const clean = extractStudentCode(codeInput.value);
    lastScannedCode = clean;
    lastScanTime = Date.now();
    triggerValidation(clean);
  });

  fallbackFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      const img = new Image();
      img.onload = function() {
        const maxDim = 320;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
          else { w = Math.round((w * maxDim) / h); h = maxDim; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.38);
        const base64 = dataUrl.split(',')[1];
        
        const clean = extractStudentCode(codeInput.value);
        isProcessing = true;
        showLoading(true);
        sendCapture(base64, clean);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    startCamera();
  } else {
    chromeGuide.style.display = 'block';
  }
</script>
</body>
</html>
)rawliteral";

static const char WIFI_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SIA · Configurar Wi-Fi</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0f172a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; min-height: 100vh; padding: 20px; }
  .card { width: 100%; max-width: 420px; background: #1e293b; padding: 24px; border-radius: 16px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
  h1 { font-size: 1.25rem; color: #38bdf8; margin-bottom: 6px; }
  p { font-size: 0.85rem; color: #94a3b8; margin-bottom: 20px; }
  label { font-size: 0.8rem; color: #cbd5e1; font-weight: 600; margin-bottom: 6px; display: block; }
  select, input { width: 100%; background: #0f172a; border: 1px solid #475569; color: #fff; padding: 12px; border-radius: 10px; font-size: 1rem; margin-bottom: 16px; outline: none; }
  select:focus, input:focus { border-color: #38bdf8; }
  button { width: 100%; background: #0284c7; color: #fff; border: none; padding: 14px; border-radius: 10px; font-size: 1rem; font-weight: 700; cursor: pointer; }
  button:active { background: #0369a1; }
  #status { margin-top: 16px; padding: 12px; border-radius: 10px; display: none; text-align: center; font-size: 0.9rem; }
  .status-ok { background: #064e3b; color: #6ee7b7; }
  .status-err { background: #7f1d1d; color: #fca5a5; }
</style>
</head>
<body>
<div class="card">
  <h1>Configurar Wi-Fi de la Estación</h1>
  <p>Selecciona tu red e ingresa la contraseña para conectar la pantalla SIA a internet.</p>
  <label for="ssid">Red Wi-Fi:</label>
  <select id="ssid"></select>
  <div id="manual-group" style="display:none;">
    <label for="manual-ssid">Nombre de la red (SSID manual):</label>
    <input type="text" id="manual-ssid" placeholder="Escribe el nombre de tu red">
  </div>
  <label for="password">Contraseña:</label>
  <input type="password" id="password" placeholder="Ingresa la contraseña">
  <button id="btn-submit" type="button" onclick="sendWifi()">Conectar Estación</button>
  <div id="status"></div>
</div>
<script>
  async function loadNetworks() {
    const sel = document.getElementById('ssid');
    sel.innerHTML = '<option value="">Cargando redes disponibles...</option>';
    try {
      const res = await fetch('/api/scan');
      const data = await res.json();
      sel.innerHTML = '';
      if (data.networks && data.networks.length > 0) {
        data.networks.forEach(net => {
          const opt = document.createElement('option');
          opt.value = net.ssid;
          opt.textContent = `${net.ssid} (${net.rssi} dBm)`;
          sel.appendChild(opt);
        });
      }
      const optManual = document.createElement('option');
      optManual.value = "__manual__";
      optManual.textContent = "› Escribir otra red...";
      sel.appendChild(optManual);
    } catch(e) {
      sel.innerHTML = '<option value="__manual__">› Escribir red manualmente</option>';
      document.getElementById('manual-group').style.display = 'block';
    }
  }
  document.getElementById('ssid').addEventListener('change', function() {
    document.getElementById('manual-group').style.display = (this.value === '__manual__') ? 'block' : 'none';
  });
  async function sendWifi() {
    const sel = document.getElementById('ssid').value;
    const manual = document.getElementById('manual-ssid').value.trim();
    const ssid = (sel === '__manual__') ? manual : sel;
    const pass = document.getElementById('password').value;
    const stat = document.getElementById('status');
    const btn = document.getElementById('btn-submit');
    if (!ssid) { alert('Debes seleccionar o ingresar una red Wi-Fi.'); return; }
    btn.disabled = true;
    stat.style.display = 'block';
    stat.className = '';
    stat.style.background = '#334155';
    stat.style.color = '#38bdf8';
    stat.textContent = 'Enviando credenciales a la pantalla...';
    try {
      const res = await fetch('/api/wifi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ssid: ssid, password: pass })
      });
      const data = await res.json();
      if (data.ok) {
        stat.className = 'status-ok';
        stat.textContent = '✓ Credenciales recibidas. Conectando... Observa la pantalla.';
      } else {
        stat.className = 'status-err';
        stat.textContent = 'Error: ' + (data.message || 'No se pudo procesar');
        btn.disabled = false;
      }
    } catch(e) {
      stat.className = 'status-err';
      stat.textContent = 'Error de comunicación con la estación.';
      btn.disabled = false;
    }
  }
  loadNetworks();
</script>
</body>
</html>
)rawliteral";

void PhoneCameraServer::begin() {
    int channel = (WiFi.status() == WL_CONNECTED) ? WiFi.channel() : 1;
    if (channel <= 0) channel = 1;

    WiFi.mode(WIFI_AP_STA);
    WiFi.setTxPower(WIFI_POWER_15dBm);

    // SoftAP en el mismo canal que la red Wi-Fi para evitar desconexiones de radio
    bool apOk = WiFi.softAP(DEFAULT_AP_SSID, nullptr, channel, 0, 4);
    if (apOk) {
        Serial.printf("[AP] Red abierta creada: %s | Canal: %d | IP: %s\n", DEFAULT_AP_SSID, channel, WiFi.softAPIP().toString().c_str());
    } else {
        Serial.println("[AP] Error al crear SoftAP");
    }

    setupRoutes();
    _server.begin();
    Serial.println("[HTTP] Servidor web activo en puerto 80.");
}

void PhoneCameraServer::update() {
    _server.handleClient();
}

String PhoneCameraServer::getApIp() const {
    return WiFi.softAPIP().toString();
}

String PhoneCameraServer::getStaIp() const {
    return WiFi.localIP().toString();
}

void PhoneCameraServer::notifyResult(bool success, const String& title, const String& message) {
    _lastResultSuccess = success;
    _lastResultTitle = title;
    _lastResultMessage = message;
    _lastResultTime = millis();
}

void PhoneCameraServer::setupRoutes() {
    _server.on("/", HTTP_GET, [this]() {
        handleRoot();
    });

    _server.on("/wifi", HTTP_GET, [this]() {
        handleWifiGet();
    });

    _server.on("/api/scan", HTTP_GET, [this]() {
        int n = WiFi.scanComplete();
        if (n < 0) {
            n = WiFi.scanNetworks(false, false);
        }
        JsonDocument doc;
        JsonArray nets = doc["networks"].to<JsonArray>();
        for (int i = 0; i < n; i++) {
            JsonObject item = nets.add<JsonObject>();
            item["ssid"] = WiFi.SSID(i);
            item["rssi"] = WiFi.RSSI(i);
        }
        String out;
        serializeJson(doc, out);
        _server.send(200, "application/json", out);
    });

    _server.on("/api/wifi", HTTP_POST, [this]() {
        handleWifiPost();
    });

    _server.on("/status", HTTP_GET, [this]() {
        handleStatus();
    });

    _server.on("/api/upload", HTTP_POST, [this]() {
        handleUpload();
    });

    _server.enableCORS(true);
}

void PhoneCameraServer::handleRoot() {
    if (!Storage.hasWifiConfig() || WiFi.status() != WL_CONNECTED) {
        handleWifiGet();
    } else {
        _server.send_P(200, "text/html", INDEX_HTML);
    }
}

void PhoneCameraServer::handleWifiGet() {
    _server.send_P(200, "text/html", WIFI_HTML);
}

void PhoneCameraServer::handleWifiPost() {
    if (!_server.hasArg("plain")) {
        _server.send(400, "application/json", "{\"ok\":false,\"message\":\"Payload vacio\"}");
        return;
    }

    String body = _server.arg("plain");
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, body);
    if (err) {
        _server.send(400, "application/json", "{\"ok\":false,\"message\":\"JSON invalido\"}");
        return;
    }

    String ssid = doc["ssid"].as<String>();
    String pass = doc["password"].as<String>();

    if (ssid.length() == 0) {
        _server.send(400, "application/json", "{\"ok\":false,\"message\":\"SSID requerido\"}");
        return;
    }

    _server.send(200, "application/json", "{\"ok\":true,\"message\":\"Recibido. Conectando...\"}");

    if (_wifiConfigCb) {
        _wifiConfigCb(ssid, pass);
    }
}

void PhoneCameraServer::handleStatus() {
    JsonDocument doc;
    doc["ok"] = true;
    doc["apIp"] = getApIp();
    doc["staIp"] = getStaIp();
    doc["station"] = Storage.getConfig().name;
    doc["provisioned"] = Storage.isProvisioned();

    if (millis() - _lastResultTime < 10000) {
        doc["lastResult"] = _lastResultSuccess ? "CONCEDIDO" : "DENEGADO";
        doc["lastTitle"] = _lastResultTitle;
        doc["lastMessage"] = _lastResultMessage;
    }

    String out;
    serializeJson(doc, out);
    _server.send(200, "application/json", out);
}

void PhoneCameraServer::handleUpload() {
    if (!_server.hasArg("plain")) {
        _server.send(400, "application/json", "{\"ok\":false,\"message\":\"Payload vacio\"}");
        return;
    }

    String body = _server.arg("plain");
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, body);
    if (err) {
        _server.send(400, "application/json", "{\"ok\":false,\"message\":\"JSON invalido\"}");
        return;
    }

    String code = doc["code"].as<String>();
    String imageBase64 = doc["image"].as<String>();
    doc.clear();

    code.trim();
    if (code.indexOf('?') >= 0) code = code.substring(0, code.indexOf('?'));
    if (code.indexOf('#') >= 0) code = code.substring(0, code.indexOf('#'));
    code.trim();
    int lastSlash = code.lastIndexOf('/');
    if (lastSlash >= 0 && lastSlash < (int)code.length() - 1) {
        code = code.substring(lastSlash + 1);
        code.trim();
    }

    Serial.printf("[HTTP-CAM] POST /api/upload recibido. Codigo='%s' | Base64=%u bytes | IP origen: %s\n",
                  code.c_str(), (unsigned int)imageBase64.length(), _server.client().remoteIP().toString().c_str());

    if (imageBase64.length() == 0 && code.length() == 0) {
        Serial.println("[HTTP-CAM] Rechazado: ni codigo ni imagen proporcionados.");
        _server.send(400, "application/json", "{\"ok\":false,\"message\":\"Debe proporcionar imagen o codigo\"}");
        return;
    }

    // Solo se confirma la recepcion (ack). La validacion real ocurre en el bucle
    // principal de forma asincrona y el resultado se muestra en la pantalla de la
    // estacion, no en el telefono.
    if (_captureCb) {
        _captureCb(code, imageBase64);
    }

    _server.send(200, "application/json", "{\"ok\":true,\"message\":\"Codigo recibido por la estacion\"}");
}
