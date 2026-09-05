#include "PhoneCameraServer.h"
#include "Config.h"
#include "StorageManager.h"
#include <WiFi.h>
#include <ArduinoJson.h>

PhoneCameraServer CameraServer;

static const char INDEX_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>SIA · Camara de Estacion</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0f172a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex; flex-direction: column; align-items: center; min-height: 100vh; padding: 16px;
  }
  header { width: 100%; max-width: 480px; text-align: center; margin-bottom: 12px; }
  header h1 { font-size: 1.25rem; font-weight: 700; color: #f8fafc; letter-spacing: -0.02em; }
  header p { font-size: 0.82rem; color: #94a3b8; margin-top: 2px; }
  .badge { display: inline-flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 500; padding: 3px 10px; border-radius: 999px; background: #05966922; color: #34d399; margin-top: 6px; border: 1px solid #05966944; }
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

  .controls { width: 100%; max-width: 480px; margin-top: 14px; display: flex; flex-direction: column; gap: 10px; }
  
  .mode-switch-card {
    display: flex; align-items: center; justify-content: space-between;
    background: #1e293b; padding: 10px 14px; border-radius: 12px; border: 1px solid #334155;
  }
  .mode-label { font-size: 0.88rem; font-weight: 600; color: #f1f5f9; display: flex; align-items: center; gap: 8px; }
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
    border-radius: 10px; font-size: 0.95rem; outline: none;
  }
  .input-group input:focus { border-color: #38bdf8; }

  .btn-row { display: flex; gap: 10px; }
  button {
    flex: 1; padding: 12px; border-radius: 10px; border: none; font-size: 0.95rem; font-weight: 600;
    cursor: pointer; transition: all 0.15s ease;
  }
  .btn-primary { background: #0284c7; color: #fff; }
  .btn-primary:active { background: #0369a1; transform: scale(0.98); }
  .btn-secondary { background: #334155; color: #e2e8f0; }
  .btn-secondary:active { background: #475569; }

  #result-banner {
    width: 100%; max-width: 480px; margin-top: 12px; padding: 14px; border-radius: 12px;
    font-size: 0.88rem; display: none; text-align: center;
  }
  .banner-success { background: #064e3b; border: 1px solid #059669; color: #6ee7b7; }
  .banner-error { background: #7f1d1d; border: 1px solid #dc2626; color: #fca5a5; }

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
  <p>Cámara de Reconocimiento Facial</p>
  <div class="badge"><span class="badge-dot"></span> Conectado al ESP32</div>
</header>

<div class="viewfinder-card">
  <video id="video" autoplay playsinline muted></video>
  <div class="overlay-guide"></div>
  <div class="laser-line" id="laser"></div>
</div>

<div class="controls">
  <div class="mode-switch-card">
    <span class="mode-label">⚡ Escaneo Automático Continuo</span>
    <label class="toggle">
      <input type="checkbox" id="toggle-auto" checked>
      <span class="slider"></span>
    </label>
  </div>

  <div class="input-group">
    <label for="code-input">Código QR / Carnet Manual (Opcional):</label>
    <input type="text" id="code-input" placeholder="Escanea código o ingresa carnet">
  </div>

  <div class="btn-row">
    <button class="btn-secondary" id="btn-switch" type="button">Girar Cámara</button>
    <button class="btn-primary" id="btn-capture" type="button">Validar Ahora</button>
  </div>
</div>

<div id="result-banner"></div>

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
  let autoScanTimer = null;

  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const laser = document.getElementById('laser');
  const btnCapture = document.getElementById('btn-capture');
  const btnSwitch = document.getElementById('btn-switch');
  const toggleAuto = document.getElementById('toggle-auto');
  const codeInput = document.getElementById('code-input');
  const resultBanner = document.getElementById('result-banner');
  const chromeGuide = document.getElementById('chrome-guide');
  const fallbackFile = document.getElementById('fallback-file');

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
      initAutoScan();
    } catch (err) {
      console.warn("getUserMedia fallo:", err);
      video.style.display = 'none';
      chromeGuide.style.display = 'block';
      showResult(false, "Cámara no disponible", "Sigue las instrucciones abajo para habilitar el visor en Chrome.");
    }
  }

  function updateLaser() {
    if (toggleAuto.checked && video.style.display !== 'none') {
      laser.style.display = 'block';
    } else {
      laser.style.display = 'none';
    }
  }

  toggleAuto.addEventListener('change', () => {
    updateLaser();
    initAutoScan();
  });

  function initAutoScan() {
    if (autoScanTimer) {
      clearInterval(autoScanTimer);
      autoScanTimer = null;
    }
    if (toggleAuto.checked) {
      autoScanTimer = setInterval(() => {
        if (!isProcessing && video.videoWidth > 0) {
          captureAndSend(true);
        }
      }, 2000);
    }
  }

  btnSwitch.addEventListener('click', () => {
    facingMode = facingMode === "user" ? "environment" : "user";
    startCamera();
  });

  async function sendCapture(base64Data, codeVal, isAutoScan = false) {
    isProcessing = true;
    if (!isAutoScan) {
      showResult(null, "Verificando...", "Enviando imagen al servidor...");
      btnCapture.disabled = true;
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeVal || "",
          image: base64Data
        })
      });
      const data = await res.json();
      if (data.ok) {
        showResult(true, data.title || "Acceso Concedido", data.message || "Identidad verificada con exito.");
        // Pausa temporal en auto-scan para permitir el paso
        if (toggleAuto.checked) {
          clearInterval(autoScanTimer);
          setTimeout(() => { initAutoScan(); }, 4000);
        }
      } else {
        if (!isAutoScan || data.message !== "pending") {
          showResult(false, data.title || "Acceso Denegado", data.message || "Rostro no reconocido.");
        }
      }
    } catch (e) {
      if (!isAutoScan) {
        showResult(false, "Error de Conexión", "No se pudo comunicar con el ESP32.");
      }
    } finally {
      isProcessing = false;
      btnCapture.disabled = false;
    }
  }

  function captureAndSend(isAutoScan = false) {
    if (!video.videoWidth) {
      if (!isAutoScan) showResult(false, "Cámara no lista", "Espera un momento a que inicie el video.");
      return;
    }
    const maxDim = 480;
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
    const dataUrl = canvas.toDataURL('image/jpeg', 0.60);
    const base64 = dataUrl.split(',')[1];
    sendCapture(base64, codeInput.value.trim(), isAutoScan);
  }

  btnCapture.addEventListener('click', () => {
    captureAndSend(false);
  });

  fallbackFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      const img = new Image();
      img.onload = function() {
        const maxDim = 480;
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.60);
        const base64 = dataUrl.split(',')[1];
        sendCapture(base64, codeInput.value.trim(), false);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });

  function showResult(success, title, msg) {
    resultBanner.style.display = 'block';
    if (success === null) {
      resultBanner.className = '';
      resultBanner.style.background = '#1e293b';
      resultBanner.style.color = '#38bdf8';
      resultBanner.innerHTML = `<strong>${title}</strong><br>${msg}`;
    } else if (success) {
      resultBanner.className = 'banner-success';
      resultBanner.innerHTML = `<strong>✓ ${title}</strong><br>${msg}`;
    } else {
      resultBanner.className = 'banner-error';
      resultBanner.innerHTML = `<strong>✗ ${title}</strong><br>${msg}`;
    }
  }

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    startCamera();
  } else {
    chromeGuide.style.display = 'block';
    showResult(false, "Permiso requerido", "Configura la regla de seguridad en Chrome para activar el visor continuo.");
  }
</script>
</body>
</html>
)rawliteral";

void PhoneCameraServer::begin() {
    WiFi.disconnect(true);
    delay(100);
    WiFi.mode(WIFI_AP);
    WiFi.setTxPower(WIFI_POWER_19_5dBm);

    bool apOk = WiFi.softAP("SIA-ESTACION-CAM", nullptr, 6, 0, 4);
    if (apOk) {
        Serial.print("[AP] Red abierta creada: SIA-ESTACION-CAM IP: ");
        Serial.println(WiFi.softAPIP());
    } else {
        Serial.println("[AP] Error al crear SoftAP");
    }




    setupRoutes();
    _server.begin();
    Serial.println("[HTTP] Servidor de camara activo en puerto 80.");
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

    _server.on("/status", HTTP_GET, [this]() {
        handleStatus();
    });

    _server.on("/api/upload", HTTP_POST, [this]() {
        handleUpload();
    });

    _server.enableCORS(true);
}

void PhoneCameraServer::handleRoot() {
    _server.send_P(200, "text/html", INDEX_HTML);
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

    if (imageBase64.length() == 0 && code.length() == 0) {
        _server.send(400, "application/json", "{\"ok\":false,\"message\":\"Debe proporcionar imagen o codigo\"}");
        return;
    }

    if (_captureCb) {
        _captureCb(code, imageBase64);
    }

    // Esperar brevemente (hasta 5 segundos) a que main.cpp valide y actualice _lastResultTime
    uint32_t waitStart = millis();
    while (millis() - waitStart < 5000) {
        if (_lastResultTime >= waitStart) {
            break;
        }
        delay(50);
    }

    JsonDocument resp;
    resp["ok"] = _lastResultSuccess;
    resp["title"] = _lastResultTitle.length() > 0 ? _lastResultTitle : (_lastResultSuccess ? "Acceso Concedido" : "Acceso Denegado");
    resp["message"] = _lastResultMessage.length() > 0 ? _lastResultMessage : "Procesado por la estacion";

    String out;
    serializeJson(resp, out);
    _server.send(_lastResultSuccess ? 200 : 403, "application/json", out);
}
