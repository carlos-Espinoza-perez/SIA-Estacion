#include <Arduino.h>
#include <TFT_eSPI.h>
#include <WiFi.h>
#include "Config.h"
#include "Theme.h"
#include "UIComponents.h"
#include "TouchManager.h"
#include "Screens.h"
#include "StorageManager.h"
#include "ApiClient.h"
#include "PhoneCameraServer.h"

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

static void startWifiScan();
static void onCameraCapture(const String& code, const String& imageBase64);
static void onWifiConfigReceived(const String& ssid, const String& password);
static void handleSerialCli();
static void enterStandbyView();
static void showPairingView();
static bool attemptWifiConnection(const String& ssid, const String& pass);
static void reportPerformance(bool force = false);

static void startWifiScan() {
    WiFi.setSleep(false);
    WiFi.mode(WIFI_STA);
    WiFi.disconnect(false, true);
    delay(60);
    WiFi.setTxPower(WIFI_POWER_15dBm);
    WiFi.scanDelete();
    WiFi.scanNetworks(true, true, false, 150);
    wifiScanRendered = false;
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
static bool pendingAdminExit = false;

void setup() {
    Serial.begin(SERIAL_BAUD);
    delay(200);

    Serial.printf("\nIniciando SIA Estacion v%s\n", FIRMWARE_VERSION);

    Storage.begin();
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

    screens.onAdminExit([]() {
        pendingAdminExit = true;
    });

    bootStartTime = millis();
    lastPerfReport = millis();
    currentState = StationState::Boot;
}

void loop() {
    loopIterations++;
    screens.update();
    CameraServer.update();
    handleSerialCli();
    reportPerformance(false);

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
        Api.sendHeartbeat();
        screens.transitionTo(ScreenState::ADMIN_PANEL);
    }

    if (pendingAdminExit) {
        pendingAdminExit = false;
        currentState = StationState::Standby;
        enterStandbyView();
    }

    switch (currentState) {
        case StationState::Boot: {
            if (millis() - bootStartTime > 1800) {
                if (Storage.hasWifiConfig()) {
                    bool ok = Api.connectWifi();
                    if (ok) {
                        if (Storage.isProvisioned()) {
                            StationConfig cfg = Storage.getConfig();
                            Api.authenticate(cfg.clientId, cfg.clientSecret);
                            currentState = StationState::Standby;
                            enterStandbyView();
                        } else {
                            currentState = StationState::Unpaired;
                            showPairingView();
                        }
                    } else {
                        wifiScanRetries = 0;
                        startWifiScan();
                        currentState = StationState::SelectWifi;
                        screens.transitionTo(ScreenState::SELECT_WIFI);
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
            if (scanStatus == WIFI_SCAN_FAILED) {
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
                    delay(500);
                }
            } else {
                if (millis() - lastStaRetry >= 15000) {
                    lastStaRetry = millis();
                    Api.connectWifi();
                }
            }
            break;
        }

        case StationState::Standby: {
            if (millis() - heartbeatTimer >= HEARTBEAT_INTERVAL_MS) {
                heartbeatTimer = millis();
                if (Api.isConnected()) {
                    Api.sendHeartbeat();
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
    StationConfig cfg = Storage.getConfig();
    String title = cfg.name.length() > 0 ? cfg.name : "Estacion SIA";
    String info = "Web: http://" + (Api.isConnected() ? WiFi.localIP().toString() : WiFi.softAPIP().toString());
    screens.transitionTo(ScreenState::WAITING, title.c_str(), info.c_str());
    heartbeatTimer = millis();
}

static void showPairingView() {
    CameraServer.begin();
    String pairingUrl = DEFAULT_PAIRING_WEB_URL + Storage.getCleanMac();
    screens.transitionTo(ScreenState::LINK_CODE, pairingUrl.c_str(), Storage.getMacAddress().c_str());
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

        // Feedback visual de éxito en LVGL
        screens.showWifiSuccess(ssid.c_str(), WiFi.localIP().toString().c_str());
        uint32_t sStart = millis();
        while (millis() - sStart < 2200) {
            screens.update();
            delay(20);
        }

        if (Storage.isProvisioned()) {
            StationConfig cfg = Storage.getConfig();
            Api.authenticate(cfg.clientId, cfg.clientSecret);
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

static void onCameraCapture(const String& code, const String& imageBase64) {
    if (currentState != StationState::Standby && currentState != StationState::Validating) {
        return;
    }

    currentState = StationState::Validating;
    screens.transitionTo(ScreenState::PROCESSING, "Validando Acceso", "Consultando sistema...");

    AccessResult res;
    bool ok = Api.validateAccess(code, "", "ACCESO", res, imageBase64);

    if (ok && res.authorized) {
        screens.transitionTo(ScreenState::GRANTED, res.personName.c_str(), res.itemName.c_str());
        CameraServer.notifyResult(true, res.personName, res.message);
    } else {
        screens.transitionTo(ScreenState::DENIED, res.message.c_str());
        CameraServer.notifyResult(false, "Acceso Denegado", res.message);
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
    } else if (line == "RESET") {
        Storage.factoryReset();
        ESP.restart();
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
    } else if (line == "HELP") {
        Serial.println("Comandos disponibles: STATUS | PERF | SCAN | CAL | RESET | WIFI:<ssid>:<pass>");
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
