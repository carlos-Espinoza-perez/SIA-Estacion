#include <Arduino.h>
#include "Config.h"
#include "StorageManager.h"
#include "DisplayBridge.h"
#include "HardwareController.h"
#include "ApiClient.h"
#include "PhoneCameraServer.h"

enum class State {
    Boot,
    Connecting,
    Unpaired,
    Standby,
    Validating,
    Feedback
};

static State currentState = State::Boot;
static String activePersonCode;
static String activeItemCode;
static uint32_t stateTimer = 0;
static uint32_t heartbeatTimer = 0;

static void onDisplayCommand(const String& cmd, const String& arg);
static void onCardRead(const String& uid);
static void onBarcodeRead(const String& code);
static void onCameraCapture(const String& code, const String& imageBase64);
static void checkFactoryReset();


void setup() {
    Serial.begin(115200);

    Storage.begin();
    Display.begin();
    Display.setCommandHandler(onDisplayCommand);
    Display.showBoot();

    Hardware.begin();
    Hardware.onCard(onCardRead);
    Hardware.onBarcode(onBarcodeRead);
    Hardware.beep(50, 1);

    CameraServer.begin();
    CameraServer.onCapture(onCameraCapture);

    currentState = State::Connecting;
    bool wifiOk = Api.connectWifi();
    if (!wifiOk) {
        Display.showError("Sin conexion WiFi");
    }

    if (Storage.isProvisioned()) {
        StationConfig cfg = Storage.getConfig();
        if (wifiOk) {
            Api.authenticate(cfg.clientId, cfg.clientSecret);
        }
        currentState = State::Standby;
        Display.showStandby();
    } else {
        currentState = State::Unpaired;
        Display.showUnpaired(DEFAULT_PAIRING_WEB_URL + Storage.getMacAddress());
    }

    heartbeatTimer = millis();
}

void loop() {
    Display.update();
    Hardware.update();
    CameraServer.update();
    checkFactoryReset();


    switch (currentState) {
        case State::Unpaired: {
            if (Api.isConnected()) {
                StationConfig cfg;
                PollStatus status = Api.pollProvisioning(Storage.getMacAddress(), cfg);

                if (status == PollStatus::Success) {
                    Storage.saveConfig(cfg);
                    Api.authenticate(cfg.clientId, cfg.clientSecret);
                    Hardware.notifySuccess();
                    currentState = State::Standby;
                    Display.showStandby();
                } else if (status == PollStatus::Error) {
                    delay(500);
                }
            } else {
                static uint32_t lastStaTry = 0;
                if (millis() - lastStaTry >= 20000) {
                    lastStaTry = millis();
                    Api.connectWifi();
                }
                delay(5);
            }
            break;
        }


        case State::Standby: {
            if (millis() - heartbeatTimer >= HEARTBEAT_INTERVAL_MS) {
                heartbeatTimer = millis();
                if (Api.isConnected()) {
                    Api.sendHeartbeat();
                }
            }
            break;
        }

        case State::Validating: {
            AccessResult res;
            bool ok = Api.validateAccess(activePersonCode, activeItemCode, "PRESTAMO", res);

            if (ok && res.authorized) {
                Hardware.notifySuccess();
                Display.showApproved(res.personName, res.itemName);
            } else {
                Hardware.notifyError();
                Display.showRejected(res.message);
            }

            stateTimer = millis();
            currentState = State::Feedback;
            break;
        }

        case State::Feedback: {
            if (millis() - stateTimer >= RESULT_FEEDBACK_TIME_MS) {
                activePersonCode = "";
                activeItemCode = "";
                currentState = State::Standby;
                Display.showStandby();
            }
            break;
        }

        default:
            break;
    }
}

static void onDisplayCommand(const String& cmd, const String& arg) {
    if (cmd == "INICIAR_PROCESO") {
        if (currentState == State::Standby) {
            Display.showScanning();
        }
    } else if (cmd == "REINTENTAR") {
        activePersonCode = "";
        activeItemCode = "";
        currentState = State::Standby;
        Display.showStandby();
    } else if (cmd == "RESET") {
        Storage.clearConfig();
        ESP.restart();
    }
}

static void onCardRead(const String& uid) {
    if (currentState != State::Standby && currentState != State::Validating) return;

    activePersonCode = uid;
    StationConfig cfg = Storage.getConfig();

    if (!cfg.requireAuth || activeItemCode.length() > 0) {
        Display.showScanning();
        currentState = State::Validating;
    } else {
        Hardware.beep(60, 1);
        Display.showScanning();
    }
}

static void onBarcodeRead(const String& code) {
    if (currentState != State::Standby && currentState != State::Validating) return;

    if (activePersonCode.length() == 0) {
        activePersonCode = code;
        Hardware.beep(60, 1);
        Display.showScanning();
    } else {
        activeItemCode = code;
        Display.showScanning();
        currentState = State::Validating;
    }
}

static void checkFactoryReset() {
    if (!Hardware.isResetHeld()) return;

    uint32_t start = millis();
    while (Hardware.isResetHeld()) {
        if (millis() - start >= 5000) {
            Hardware.beep(600, 2);
            Storage.factoryReset();
            Display.showError("Reset Fabrica");
            delay(1500);
            ESP.restart();
        }
        delay(40);
    }
}

static void onCameraCapture(const String& code, const String& imageBase64) {
    Display.showScanning();

    AccessResult res;
    bool ok = Api.validateAccess(code, "", "ACCESO", res, imageBase64);


    if (ok && res.authorized) {
        Hardware.notifySuccess();
        Display.showApproved(res.personName, "Acceso Autorizado");
        CameraServer.notifyResult(true, res.personName, res.message);
    } else {
        Hardware.notifyError();
        Display.showRejected(res.message);
        CameraServer.notifyResult(false, "Acceso Denegado", res.message);
    }

    stateTimer = millis();
    currentState = State::Feedback;
}

