#include <Arduino.h>
#include <TFT_eSPI.h>
#include <WiFi.h>
#include <esp_task_wdt.h>
#include "Config.h"
#include "Theme.h"
#include "UIComponents.h"
#include "TouchManager.h"
#include "Screens.h"
#include "StorageManager.h"
#include "ApiClient.h"
#include "PhoneCameraServer.h"
#include "OfflineManager.h"

static TFT_eSPI        tft;
static TouchManager    touch(tft);
static ScreenManager   screens(tft, touch);

enum class StationState {
    Boot,
    SelectWifi,
    WifiPassword,
    Unpaired,
    Standby,
    Validating,
    Feedback,
    Admin
};

static StationState currentState = StationState::Boot;
static uint32_t bootStartTime = 0;
static uint32_t stateTimer = 0;
static uint32_t heartbeatTimer = 0;
static uint32_t lastStaRetry = 0;
static String   selectedSsid = "";
static bool     wifiScanRendered = false;

static uint32_t lastPerfReport = 0;
static uint32_t loopIterations = 0;
static uint8_t  wifiScanRetries = 0;

static bool wifiConnectAttempted = false;
static bool authTaskStarted = false;
static volatile bool authTaskFinished = false;
static volatile bool authTaskSuccess = false;

static void authBackgroundTask(void* pv) {
    StationConfig cfg = Storage.getConfig();
    authTaskSuccess = Api.authenticate(cfg.clientId, cfg.clientSecret);
    authTaskFinished = true;
    vTaskDelete(NULL);
}

static void startWifiScan();
static void onCameraCapture(const String& code, const String& imageBase64);
static void processPendingCapture();
static void onWifiConfigReceived(const String& ssid, const String& password);
static void handleSerialCli();
static void enterStandbyView();
static void showPairingView();
static bool attemptWifiConnection(const String& ssid, const String& pass);
static void reportPerformance(bool force = false);

static bool   pendingCaptureReady = false;
static String pendingCaptureCode;
static String pendingCaptureImage;

static uint32_t wifiScanStartTime = 0;

static void startWifiScan() {
    WiFi.setSleep(false);
    // Si el SoftAP de la camara ya esta activo (CameraServer.begin() ya se llamo),
    // conservar WIFI_AP_STA en vez de forzar WIFI_STA: cambiar de modo mientras el
    // AP tiene clientes conectados puede dejar el escaneo colgado indefinidamente
    // (WiFi.scanComplete() nunca sale de WIFI_SCAN_RUNNING) y ademas tira el AP.
    wifi_mode_t modoActual = WiFi.getMode();
    if (modoActual == WIFI_MODE_AP || modoActual == WIFI_MODE_APSTA) {
        WiFi.mode(WIFI_AP_STA);
    } else {
        WiFi.mode(WIFI_STA);
    }
    WiFi.disconnect(false, true);
    delay(60);
    WiFi.setTxPower(WIFI_POWER_15dBm);
    WiFi.scanDelete();
    WiFi.scanNetworks(true, true, false, 150);
    wifiScanRendered = false;
    wifiScanStartTime = millis();
}

static int pendingWifiSelectIdx = -1;
static bool pendingWifiRefresh = false;
static bool pendingWifiOther = false;
static String pendingWifiConnectPass = "";
static bool pendingDoConnect = false;
static bool pendingWifiBack = false;
static bool pendingAdminOpen = false;
static bool pendingAdminWifi = false;
static bool pendingAdminSync = false;
static bool pendingAdminStorage = false;
static bool pendingAdminExit = false;

static bool wasConnected = false;
static bool codigosSincronizadosAlMenosUnaVez = false;
static uint32_t lastCodigosSyncTime = 0;
static const uint32_t CODIGOS_SYNC_INTERVAL_MS = 10UL * 60UL * 1000UL; // cada 10 minutos

void setup() {
    Serial.begin(SERIAL_BAUD);
    delay(200);

    Serial.printf("\nIniciando SIA Estacion v%s\n", FIRMWARE_VERSION);

    esp_reset_reason_t rstReason = esp_reset_reason();
    const char* rstDesc = "Desconocido";
    switch (rstReason) {
        case ESP_RST_POWERON:   rstDesc = "Encendido normal (POWER ON)"; break;
        case ESP_RST_EXT:       rstDesc = "Boton / Pin de reset externo"; break;
        case ESP_RST_SW:        rstDesc = "Reinicio por software (ESP.restart)"; break;
        case ESP_RST_PANIC:     rstDesc = "CRASH / PANIC EXCEPTION (Memoria / Puntero nulo)"; break;
        case ESP_RST_INT_WDT:   rstDesc = "Watchdog de interrupcion colgada"; break;
        case ESP_RST_TASK_WDT:  rstDesc = "Task Watchdog (Bucle bloqueado >30s)"; break;
        case ESP_RST_WDT:       rstDesc = "Watchdog secundario"; break;
        case ESP_RST_DEEPSLEEP: rstDesc = "Salida de Deep Sleep"; break;
        case ESP_RST_BROWNOUT:  rstDesc = "BROWNOUT DETECTADO (Caida de voltaje electrico en 3.3V)"; break;
        case ESP_RST_SDIO:      rstDesc = "Reset por SDIO"; break;
        default:                rstDesc = "Desconocido"; break;
    }
    Serial.println("==================================================");
    Serial.printf("[DIAGNOSTICO] Motivo del ultimo reinicio: [%d] %s\n", (int)rstReason, rstDesc);
    Serial.printf("[DIAGNOSTICO] RAM Libre inicial: %u KB | Bloque Max: %u KB\n",
                  ESP.getFreeHeap() / 1024, ESP.getMaxAllocHeap() / 1024);
    Serial.println("==================================================");

    Storage.begin();
    Offline.begin();
    Serial.printf("MAC STA: %s\n", Storage.getMacAddress().c_str());

    screens.init();
    touch.init();

    WiFi.setSleep(false);
    WiFi.setTxPower(WIFI_POWER_15dBm);

    CameraServer.onCapture(onCameraCapture);
    CameraServer.onWifiConfig(onWifiConfigReceived);

    screens.onWifiSelect([](int idx) {
        pendingWifiSelectIdx = idx;
    });

    screens.onWifiRefresh([]() {
        pendingWifiRefresh = true;
    });

    screens.onWifiOther([]() {
        pendingWifiOther = true;
    });

    screens.onWifiConnect([](const char* pass) {
        pendingWifiConnectPass = pass ? pass : "";
        pendingDoConnect = true;
    });

    screens.onWifiBack([]() {
        pendingWifiBack = true;
    });

    screens.onAdminClick([]() {
        pendingAdminOpen = true;
    });

    screens.onAdminWifi([]() {
        pendingAdminWifi = true;
    });

    screens.onAdminSync([]() {
        pendingAdminSync = true;
    });

    screens.onAdminStorage([]() {
        pendingAdminStorage = true;
    });

    screens.onAdminExit([]() {
        pendingAdminExit = true;
    });

    bootStartTime = millis();
    lastPerfReport = millis();
    currentState = StationState::Boot;
    screens.transitionTo(ScreenState::BOOT, "Iniciando", "Cargando componentes...");

    esp_task_wdt_init(30, true);
    esp_task_wdt_add(NULL);
}

void loop() {
    esp_task_wdt_reset();
    loopIterations++;
    screens.update();
    CameraServer.update();
    handleSerialCli();
    reportPerformance(false);
    processPendingCapture();

    if (pendingWifiSelectIdx >= 0) {
        int idx = pendingWifiSelectIdx;
        pendingWifiSelectIdx = -1;
        int n = WiFi.scanComplete();
        if (idx >= 0 && idx < n) {
            selectedSsid = WiFi.SSID(idx);
            screens.clearPassword();
            currentState = StationState::WifiPassword;
            screens.transitionTo(ScreenState::WIFI_PASSWORD, selectedSsid.c_str());
        }
    }

    if (pendingWifiRefresh) {
        pendingWifiRefresh = false;
        Serial.println("[WiFi] Reescaneando redes...");
        wifiScanRetries = 0;
        startWifiScan();
        screens.transitionTo(ScreenState::SELECT_WIFI);
    }

    if (pendingWifiOther) {
        pendingWifiOther = false;
        selectedSsid = "";
        screens.clearPassword();
        currentState = StationState::WifiPassword;
        screens.transitionTo(ScreenState::WIFI_PASSWORD, "Ingresa red manual");
    }

    if (pendingWifiBack) {
        pendingWifiBack = false;
        Serial.println("[UI] Regresando a Seleccionar Red WiFi");
        currentState = StationState::SelectWifi;
        if (WiFi.scanComplete() <= 0) {
            wifiScanRetries = 0;
            startWifiScan();
        }
        screens.transitionTo(ScreenState::SELECT_WIFI);
    }

    if (pendingDoConnect) {
        pendingDoConnect = false;
        String pass = pendingWifiConnectPass;
        pendingWifiConnectPass = "";
        attemptWifiConnection(selectedSsid, pass);
    }

    if (pendingAdminOpen) {
        pendingAdminOpen = false;
        currentState = StationState::Admin;
        screens.transitionTo(ScreenState::ADMIN_PANEL);
    }

    if (pendingAdminWifi) {
        pendingAdminWifi = false;
        wifiScanRetries = 0;
        startWifiScan();
        currentState = StationState::SelectWifi;
        screens.transitionTo(ScreenState::SELECT_WIFI);
    }

    if (pendingAdminSync) {
        pendingAdminSync = false;
        if (Api.isConnected()) {
            Api.sendHeartbeat();
            String lote = Offline.construirLoteJson();
            if (lote.length() > 0 && Api.sincronizarEventosOffline(lote)) {
                Offline.marcarPendientesSincronizados();
            }
        } else {
            Api.connectWifi();
        }
        screens.transitionTo(ScreenState::ADMIN_SYNC);
    }

    if (pendingAdminStorage) {
        pendingAdminStorage = false;
        Offline.limpiarPendientes();
        screens.transitionTo(ScreenState::ADMIN_STORAGE);
    }

    if (pendingAdminExit) {
        pendingAdminExit = false;
        currentState = StationState::Standby;
        enterStandbyView();
    }

    switch (currentState) {
        case StationState::Boot: {
            if (millis() - bootStartTime > 1200) {
                if (Storage.hasWifiConfig()) {
                    if (!wifiConnectAttempted) {
                        wifiConnectAttempted = true;
                        screens.updateBootStatus("Conectando a la red WiFi...");
                        bool ok = Api.connectWifi();
                        if (!ok) {
                            wifiScanRetries = 0;
                            startWifiScan();
                            currentState = StationState::SelectWifi;
                            screens.transitionTo(ScreenState::SELECT_WIFI);
                            break;
                        }
                    }

                    if (Storage.isProvisioned()) {
                        if (!authTaskStarted) {
                            authTaskStarted = true;
                            authTaskFinished = false;
                            screens.updateBootStatus("Autenticando con el servidor...");
                            xTaskCreatePinnedToCore(authBackgroundTask, "auth_bg", 8192, NULL, 1, NULL, 0);
                        }

                        if (authTaskFinished) {
                            if (authTaskSuccess) {
                                screens.updateBootStatus("Autenticado con exito");
                            } else {
                                screens.updateBootStatus("Modo fuera de linea");
                            }
                            screens.update();
                            delay(600);
                            authTaskStarted = false;
                            currentState = StationState::Standby;
                            enterStandbyView();
                        }
                    } else {
                        currentState = StationState::Unpaired;
                        showPairingView();
                    }
                } else {
                    Serial.println("[BOOT] Sin credenciales WiFi. Iniciando escaneo de redes...");
                    wifiScanRetries = 0;
                    startWifiScan();
                    currentState = StationState::SelectWifi;
                    screens.transitionTo(ScreenState::SELECT_WIFI);
                }
            }
            break;
        }

        case StationState::SelectWifi: {
            int scanStatus = WiFi.scanComplete();
            if (scanStatus == WIFI_SCAN_RUNNING && millis() - wifiScanStartTime > 8000) {
                Serial.println("[WIFI] Escaneo colgado por mas de 8s, forzando reintento...");
                startWifiScan();
            } else if (scanStatus == WIFI_SCAN_FAILED) {
                startWifiScan();
            } else if (scanStatus == 0 && wifiScanRetries < 2) {
                wifiScanRetries++;
                Serial.printf("[WIFI] Escaneo dio 0 redes, reintentando automaticamente (intento %d)...\n", wifiScanRetries);
                startWifiScan();
            } else if (scanStatus >= 0 && !wifiScanRendered) {
                Serial.printf("[WIFI] Escaneo completado: %d redes detectadas\n", scanStatus);
                for (int i = 0; i < scanStatus; i++) {
                    Serial.printf("  [%d] SSID: '%s' | RSSI: %d dBm | Canal: %d\n",
                                  i, WiFi.SSID(i).c_str(), WiFi.RSSI(i), WiFi.channel(i));
                }
                wifiScanRetries = 0;
                wifiScanRendered = true;
                screens.resetWifiScroll();
                screens.transitionTo(ScreenState::SELECT_WIFI);
            }
            break;
        }

        case StationState::Unpaired: {
            esp_task_wdt_reset();
            if (Api.isConnected()) {
                StationConfig cfg;
                PollStatus status = Api.pollProvisioning(Storage.getCleanMac(), cfg);

                if (status == PollStatus::Success) {
                    Storage.saveConfig(cfg);
                    Api.authenticate(cfg.clientId, cfg.clientSecret);

                    screens.transitionTo(ScreenState::LINKED, cfg.name.c_str(), "Estacion Vinculada");
                    delay(2500);
                    currentState = StationState::Standby;
                    enterStandbyView();
                } else if (status == PollStatus::Error) {
                    screens.update();
                    delay(1000);
                }
            } else {
                if (millis() - lastStaRetry >= 10000) {
                    lastStaRetry = millis();
                    Api.connectWifi();
                }
            }
            break;
        }

        case StationState::Standby: {
            bool nowConnected = Api.isConnected();
            if (nowConnected != wasConnected) {
                // Cambio de conectividad detectado: refrescar la pantalla de espera
                // (Waiting <-> Offline) y, si se acaba de recuperar la red, sincronizar.
                wasConnected = nowConnected;
                enterStandbyView();
                if (nowConnected) {
                    String lote = Offline.construirLoteJson();
                    if (lote.length() > 0 && Api.sincronizarEventosOffline(lote)) {
                        Offline.marcarPendientesSincronizados();
                    }
                    String codigosJson;
                    if (Api.obtenerCodigosSincronizacion(codigosJson)) {
                        Offline.actualizarCodigosDesdeJson(codigosJson);
                        codigosSincronizadosAlMenosUnaVez = true;
                        lastCodigosSyncTime = millis();
                    }
                }
            }

            if (millis() - heartbeatTimer >= HEARTBEAT_INTERVAL_MS) {
                heartbeatTimer = millis();
                if (nowConnected) {
                    Api.sendHeartbeat();

                    String lote = Offline.construirLoteJson();
                    if (lote.length() > 0 && Api.sincronizarEventosOffline(lote)) {
                        Offline.marcarPendientesSincronizados();
                    }

                    // Siempre en el primer heartbeat tras el arranque, luego cada CODIGOS_SYNC_INTERVAL_MS
                    if (!codigosSincronizadosAlMenosUnaVez || millis() - lastCodigosSyncTime >= CODIGOS_SYNC_INTERVAL_MS) {
                        String codigosJson;
                        if (Api.obtenerCodigosSincronizacion(codigosJson)) {
                            Offline.actualizarCodigosDesdeJson(codigosJson);
                            codigosSincronizadosAlMenosUnaVez = true;
                        }
                        lastCodigosSyncTime = millis();
                    }
                } else {
                    Api.connectWifi();
                }
            }
            break;
        }

        case StationState::Feedback: {
            if (millis() - stateTimer >= RESULT_FEEDBACK_TIME_MS) {
                currentState = StationState::Standby;
                enterStandbyView();
            }
            break;
        }

        default:
            break;
    }
}

static void enterStandbyView() {
    CameraServer.begin();
    wasConnected = Api.isConnected();

    if (wasConnected) {
        StationConfig cfg = Storage.getConfig();
        String stationName = cfg.name.length() > 0 ? cfg.name : "Entrada Principal";
        screens.transitionTo(ScreenState::WAITING, stationName.c_str(), "Control de Acceso e Identificacion");
    } else {
        screens.transitionTo(ScreenState::OFFLINE);
    }

    heartbeatTimer = millis();
}

static void showPairingView() {
    CameraServer.begin();
    screens.transitionTo(ScreenState::LINK_CODE);
}

static bool attemptWifiConnection(const String& ssid, const String& pass) {
    if (ssid.length() == 0) return false;

    screens.transitionTo(ScreenState::PROCESSING, "Conectando a la red", ssid.c_str());

    WiFi.mode(WIFI_AP_STA);
    WiFi.begin(ssid.c_str(), pass.c_str());

    uint32_t start = millis();
    while (WiFi.status() != WL_CONNECTED && (millis() - start < WIFI_CONNECT_TIMEOUT_MS)) {
        screens.update();
        delay(20);
    }

    if (WiFi.status() == WL_CONNECTED) {
        Storage.setWifi(ssid, pass);

        // Feedback visual de exito en LVGL
        screens.showWifiSuccess(ssid.c_str(), WiFi.localIP().toString().c_str());
        uint32_t sStart = millis();
        while (millis() - sStart < 2200) {
            screens.update();
            delay(20);
        }

        if (Storage.isProvisioned()) {
            screens.transitionTo(ScreenState::PROCESSING, "Autenticando", "Conectando al servidor...");
            authTaskStarted = true;
            authTaskFinished = false;
            xTaskCreatePinnedToCore(authBackgroundTask, "auth_bg", 8192, NULL, 1, NULL, 0);
            while (!authTaskFinished) {
                screens.update();
                esp_task_wdt_reset();
                delay(20);
            }
            authTaskStarted = false;
            currentState = StationState::Standby;
            enterStandbyView();
        } else {
            currentState = StationState::Unpaired;
            showPairingView();
        }
        return true;
    } else {
        wl_status_t st = WiFi.status();
        const char* reason = "Contrasena incorrecta";
        const char* hint = "Verifica la clave e intenta de nuevo";

        if (st == WL_CONNECT_FAILED) {
            reason = "Contrasena incorrecta";
            hint = "La clave no coincide con la red";
        } else if (st == WL_NO_SSID_AVAIL) {
            reason = "Red no disponible";
            hint = "Verifica que este encendida";
        } else {
            reason = "Tiempo agotado al conectar";
            hint = "Clave incorrecta o senal debil";
        }

        Serial.printf("[WIFI] Fallo al conectar con status %d: %s\n", (int)st, reason);

        // Feedback visual de fallo en LVGL
        screens.showWifiError(reason, hint);
        uint32_t fStart = millis();
        while (millis() - fStart < 2500) {
            screens.update();
            delay(20);
        }

        // Regresar a la pantalla de clave con el motivo del fallo
        screens.transitionTo(ScreenState::WIFI_PASSWORD, ssid.c_str(), reason);
        return false;
    }
}

static void onWifiConfigReceived(const String& ssid, const String& password) {
    selectedSsid = ssid;
    screens.setPassword(password.c_str());
    attemptWifiConnection(ssid, password);
}

// Se ejecuta dentro del manejador HTTP del telefono (CameraServer.update()). Debe
// devolver el control de inmediato para que el telefono reciba su ack rapido: solo
// encola la captura, la validacion real la hace processPendingCapture() en el loop().
static void onCameraCapture(const String& code, const String& imageBase64) {
    if (currentState != StationState::Standby) {
        Serial.printf("[ACCESO] Ignorando captura: estado actual (%d) no es Standby\n", (int)currentState);
        return;
    }
    if (pendingCaptureReady) {
        Serial.println("[ACCESO] Ya hay una captura pendiente de procesar; se descarta la nueva.");
        return;
    }

    pendingCaptureCode = code;
    pendingCaptureImage = imageBase64;
    pendingCaptureReady = true;
}

// Procesa en el loop principal la captura encolada por onCameraCapture(): valida contra
// el backend (que decide Ingreso/Egreso dinamicamente) y muestra el resultado en la
// pantalla de la estacion. El telefono ya recibio su ack y no espera este resultado.
static void processPendingCapture() {
    if (!pendingCaptureReady) return;
    pendingCaptureReady = false;

    String code = pendingCaptureCode;
    String imageBase64 = pendingCaptureImage;
    pendingCaptureCode = "";
    pendingCaptureImage = "";

    Serial.printf("[ACCESO] Procesando validacion: Codigo='%s', ImagenBase64=%u bytes\n",
                  code.c_str(), (unsigned int)imageBase64.length());

    currentState = StationState::Validating;
    screens.transitionTo(ScreenState::PROCESSING, "Validando acceso", "Consultando sistema...");

    bool intentarOnline = Api.isConnected();
    AccessResult res;
    bool ok = intentarOnline ? Api.validateAccess(code, "", "ACCESO", res, imageBase64) : false;

    if (ok && res.isAdmin) {
        Serial.println("[AUTH] Credencial administrativa detectada (verificada por el servidor)");
        screens.transitionTo(ScreenState::ADMIN_DETECTED);
        CameraServer.notifyResult(true, "Administrador", "Acceso Administrativo");
        currentState = StationState::Admin;
        return;
    }

    if (ok) {
        // Respuesta valida del servidor (Concedido o Denegado como decision real del negocio)
        if (res.authorized) {
            Serial.printf("[ACCESO] Concedido -> %s (%s)\n", res.personName.c_str(), res.direction.c_str());
            String dirLabel = (res.direction == "Egreso") ? "Salida Concedida" : "Entrada Concedida";
            screens.transitionTo(ScreenState::GRANTED, res.personName.c_str(), dirLabel.c_str());
            String msg = dirLabel + (res.message.length() > 0 ? (" - " + res.message) : "");
            CameraServer.notifyResult(true, res.personName, msg);
        } else {
            Serial.printf("[ACCESO] Denegado -> %s\n", res.message.c_str());
            screens.transitionTo(ScreenState::DENIED, res.message.c_str());
            CameraServer.notifyResult(false, "Acceso Denegado", res.message);
        }
    } else {
        // Sin conexion o el servidor no respondio: se valida contra la copia local
        // (descargada de /sync/codigos) y el evento se encola para subirlo despues.
        bool localOk = Offline.codigoValidoLocal(code);
        String direccion = Offline.determinarDireccionLocal(code);
        Offline.encolarEvento(code, direccion, localOk ? "Concedido" : "Denegado");

        Serial.printf("[ACCESO-OFFLINE] Codigo='%s' -> %s (%s) | Copia local: %s\n",
                      code.c_str(), localOk ? "Concedido" : "Denegado", direccion.c_str(),
                      Offline.tieneCopiaLocal() ? "disponible" : "vacia");

        if (localOk) {
            String dirLabel = (direccion == "Egreso") ? "Salida Concedida (Offline)" : "Entrada Concedida (Offline)";
            screens.transitionTo(ScreenState::GRANTED, "Codigo valido", dirLabel.c_str());
            CameraServer.notifyResult(true, "Acceso Offline", dirLabel);
        } else {
            const char* motivo = Offline.tieneCopiaLocal()
                ? "Codigo no reconocido (sin conexion)"
                : "Sin conexion y sin copia local de codigos";
            screens.transitionTo(ScreenState::DENIED, motivo);
            CameraServer.notifyResult(false, "Acceso Denegado", motivo);
        }
    }

    stateTimer = millis();
    currentState = StationState::Feedback;
}

static void handleSerialCli() {
    if (!Serial.available()) return;

    String line = Serial.readStringUntil('\n');
    line.trim();
    if (line.length() == 0) return;

    if (line == "STATUS") {
        Serial.printf("Estado: %d | Provisioned: %d | WiFi STA: %s | AP: %s\n",
                      (int)currentState, Storage.isProvisioned(),
                      WiFi.localIP().toString().c_str(), WiFi.softAPIP().toString().c_str());
    } else if (line == "UNPAIR") {
        Serial.println("[CLI] Desvinculando estacion...");
        Storage.clearConfig();
        currentState = StationState::Unpaired;
        showPairingView();
    } else if (line == "RESET") {
        Storage.factoryReset();
        ESP.restart();
    } else if (line.startsWith("STATE:")) {
        String stName = line.substring(6);
        stName.toUpperCase();
        if (stName == "BOOT") screens.transitionTo(ScreenState::BOOT, "Iniciando", "Cargando componentes...");
        else if (stName == "WAITING" || stName == "STANDBY") enterStandbyView();
        else if (stName == "GRANTED") screens.transitionTo(ScreenState::GRANTED, "Carlos Espinoza", "Autorizado");
        else if (stName == "DENIED") screens.transitionTo(ScreenState::DENIED, "Acceso no autorizado");
        else if (stName == "ADMIN") screens.transitionTo(ScreenState::ADMIN_PANEL);
        else if (stName == "UNCONFIGURED" || stName == "UNPAIR") showPairingView();
        else if (stName == "LINK") screens.transitionTo(ScreenState::LINK_CODE);
        else if (stName == "WIFI") screens.transitionTo(ScreenState::SELECT_WIFI);
        else if (stName == "ITEM") screens.transitionTo(ScreenState::ITEM_SUMMARY);
        Serial.printf("[CLI] Cambiado a pantalla: %s\n", stName.c_str());
    } else if (line.startsWith("WIFI:")) {
        int sep = line.indexOf(':', 5);
        if (sep != -1) {
            String ssid = line.substring(5, sep);
            String pass = line.substring(sep + 1);
            attemptWifiConnection(ssid, pass);
        }
    } else if (line == "SCAN") {
        Serial.println("[CLI] Iniciando escaneo de redes...");
        wifiScanRetries = 0;
        startWifiScan();
        currentState = StationState::SelectWifi;
        screens.transitionTo(ScreenState::SELECT_WIFI);
    } else if (line == "CAL") {
        touch.runCalibration();
        screens.transitionTo(ScreenState::SELECT_WIFI);
    } else if (line == "PERF") {
        reportPerformance(true);
    } else if (line.startsWith("CAPTURE:")) {
        String code = line.substring(8);
        Serial.printf("[CLI] Simulando captura de camara con codigo='%s'\n", code.c_str());
        onCameraCapture(code, "");
    } else if (line == "OFFLINE") {
        Serial.printf("[OFFLINE] Conectado: %d | Copia local de codigos: %s | Ultima sync codigos: %s | Pendientes por sincronizar: %d | Ultima sync eventos: %s\n",
                      Api.isConnected(), Offline.tieneCopiaLocal() ? "SI" : "NO",
                      Offline.obtenerUltimaSincronizacionCodigos().c_str(), Offline.contarPendientes(),
                      Offline.obtenerUltimaSincronizacionEventos().c_str());
    } else if (line == "HELP") {
        Serial.println("Comandos disponibles: STATUS | UNPAIR | STATE:<BOOT|WAITING|GRANTED|DENIED|ADMIN|WIFI|LINK|ITEM> | PERF | OFFLINE | CAPTURE:<codigo> | SCAN | CAL | RESET | WIFI:<ssid>:<pass>");
    }
}

static void reportPerformance(bool force) {
    uint32_t now = millis();
    if (force || (now - lastPerfReport >= 10000)) {
        float elapsedSec = (now - lastPerfReport) / 1000.0f;
        if (elapsedSec <= 0.001f) elapsedSec = 0.001f;
        uint32_t hz = (uint32_t)(loopIterations / elapsedSec);
        loopIterations = 0;
        lastPerfReport = now;

        uint32_t freeHeap = ESP.getFreeHeap();
        uint32_t minHeap = ESP.getMinFreeHeap();
        uint32_t maxBlock = ESP.getMaxAllocHeap();

        String wifiStatus;
        if (WiFi.status() == WL_CONNECTED) {
            wifiStatus = WiFi.SSID() + " (" + String(WiFi.RSSI()) + " dBm)";
        } else {
            wifiStatus = "Desconectado (AP: 192.168.4.1)";
        }

        Serial.printf("[PERF] RAM: %u KB libre (Min: %u KB, BloqueMax: %u KB) | Frecuencia: %u Hz | WiFi: %s | Uptime: %lu s\n",
                      freeHeap / 1024, minHeap / 1024, maxBlock / 1024, hz, wifiStatus.c_str(), now / 1000);
    }
}
