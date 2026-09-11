#include "Screens.h"
#include "Theme.h"
#include "Config.h"
#include <WiFi.h>
#include "LvglManager.h"
#include "StorageManager.h"
#include "UIComponents.h"
#include "OfflineManager.h"

ScreenManager::ScreenManager(TFT_eSPI& tft, TouchManager& touch)
    : _tft(tft), _touch(touch), _currentState(ScreenState::BOOT),
      _bootProgress(0.0f), _lastAnimTime(0),
      _scanAnimStep(0), _lastScanAnimTime(0), _wifiScrollOffset(0),
      _showPassword(false),
      _onWifiSelectCb(nullptr), _onWifiRefreshCb(nullptr), _onWifiOtherCb(nullptr),
      _onWifiConnectCb(nullptr), _onWifiBackCb(nullptr),
      _onAdminClickCb(nullptr), _onAdminWifiCb(nullptr), _onAdminSyncCb(nullptr),
      _onAdminStorageCb(nullptr), _onAdminExitCb(nullptr) {
    _param1[0] = '\0';
    _param2[0] = '\0';
    _passwordInput[0] = '\0';
}

void ScreenManager::init() {
    UI::initDisplay(_tft);
    _touch.init();
    pinMode(27, OUTPUT);
    digitalWrite(27, HIGH);
    Lvgl.init(&_tft);
    transitionTo(ScreenState::BOOT);
}

void ScreenManager::transitionTo(ScreenState newState, const char* param1, const char* param2) {
    _currentState = newState;

    if (param1 != nullptr) {
        strncpy(_param1, param1, sizeof(_param1) - 1);
        _param1[sizeof(_param1) - 1] = '\0';
    } else {
        _param1[0] = '\0';
    }

    if (param2 != nullptr) {
        strncpy(_param2, param2, sizeof(_param2) - 1);
        _param2[sizeof(_param2) - 1] = '\0';
    } else {
        _param2[0] = '\0';
    }

    switch (_currentState) {
        case ScreenState::BOOT:
            renderBoot();
            break;
        case ScreenState::CONNECTING:
            renderConnecting();
            break;
        case ScreenState::BOOT_NO_NETWORK:
            renderBootNoNetwork();
            break;
        case ScreenState::WAITING:
            renderWaiting();
            break;
        case ScreenState::PROCESSING:
            renderProcessing();
            break;
        case ScreenState::GRANTED:
            renderGranted();
            break;
        case ScreenState::DENIED:
            renderDenied();
            break;
        case ScreenState::OFFLINE:
            renderOffline();
            break;
        case ScreenState::ERROR_STATE:
            renderError();
            break;
        case ScreenState::UNCONFIGURED:
            renderUnconfigured();
            break;
        case ScreenState::LINK_CODE:
            renderLinkCode();
            break;
        case ScreenState::LINKED:
            renderLinked();
            break;
        case ScreenState::IDENTITY_DETECTED:
            renderIdentityDetected();
            break;
        case ScreenState::SCAN_CARD:
            renderScanCard();
            break;
        case ScreenState::SCAN_ITEM:
            renderScanItem();
            break;
        case ScreenState::ITEM_ADDED:
            renderItemAdded();
            break;
        case ScreenState::ITEM_SUMMARY:
            renderItemSummary();
            break;
        case ScreenState::VALIDATING:
            renderValidating();
            break;
        case ScreenState::LOAN_COMPLETED:
            renderLoanCompleted();
            break;
        case ScreenState::APPROVAL_SENT:
            renderApprovalSent();
            break;
        case ScreenState::LOAN_REJECTED:
            renderLoanRejected();
            break;
        case ScreenState::OUT_OF_SERVICE:
            renderOutOfService();
            break;
        case ScreenState::ADMIN_PANEL:
            renderAdminPanel();
            break;
        case ScreenState::ADMIN_SYNC:
            renderAdminSync();
            break;
        case ScreenState::ADMIN_STORAGE:
            renderAdminStorage();
            break;
        case ScreenState::ADMIN_CONFIG:
            renderAdminConfig();
            break;
        case ScreenState::ADMIN_DETECTED:
            renderAdminDetected();
            break;
        case ScreenState::SELECT_WIFI:
            renderSelectWifi();
            break;
        case ScreenState::WIFI_PASSWORD:
            renderWifiPassword();
            break;
    }
}

void ScreenManager::update() {
    if (Lvgl.isActive()) {
        Lvgl.update();
    }

    if (_currentState == ScreenState::SELECT_WIFI) {
        static int lastScanStatus = -999;
        int currentScanStatus = WiFi.scanComplete();
        if (currentScanStatus != lastScanStatus) {
            lastScanStatus = currentScanStatus;
            renderSelectWifi();
        }
    }
}

void ScreenManager::renderBoot() {
    const char* title = (_param1[0] != '\0') ? _param1 : "Iniciando";
    const char* subtitle = (_param2[0] != '\0') ? _param2 : "Conectando al sistema...";
    Lvgl.showBoot(title, subtitle);
}

void ScreenManager::updateBootStatus(const char* subtitle) {
    Lvgl.updateBootStatus(subtitle);
}

void ScreenManager::renderConnecting() {
    const char* ssid = (_param1[0] != '\0') ? _param1 : "Red Wi-Fi";
    Lvgl.showConnecting(ssid);
}

void ScreenManager::renderBootNoNetwork() {
    const char* ssid = (_param1[0] != '\0') ? _param1 : "SIA-LAB";
    Lvgl.showBootNoNetwork(ssid, _onWifiRefreshCb, _onWifiOtherCb);
}

void ScreenManager::renderUnconfigured() {
    Lvgl.showUnconfigured([this]() {
        transitionTo(ScreenState::LINK_CODE);
    });
}

void ScreenManager::renderLinkCode() {
    String code = Storage.getCleanMac();
    const char* c = (_param1[0] != '\0') ? _param1 : code.c_str();
    // El QR codifica SOLO el MAC limpio — el backend lo acepta y normaliza directamente
    Lvgl.showLinkCode(c, c, [this]() {
        transitionTo(ScreenState::SELECT_WIFI);
    });
}

void ScreenManager::renderLinked() {
    const char* stationName = (_param1[0] != '\0') ? _param1 : "Laboratorio de Electronica";
    const char* stationMode = (_param2[0] != '\0') ? _param2 : "Control de acceso";
    Lvgl.showLinked(stationName, stationMode);
}

void ScreenManager::renderWaiting() {
    const char* stationTitle = (_param1[0] != '\0') ? _param1 : "Entrada Principal";
    const char* subTitle = (_param2[0] != '\0') ? _param2 : "Estacion lista";
    Lvgl.showWaiting(stationTitle, subTitle, _onAdminClickCb);
}

void ScreenManager::renderProcessing() {
    const char* title = (_param1[0] != '\0') ? _param1 : "Verificando";
    const char* subtitle = (_param2[0] != '\0') ? _param2 : "Consultando con el sistema";
    Lvgl.showProcessing(title, subtitle);
}

void ScreenManager::renderGranted() {
    const char* personName = (_param1[0] != '\0') ? _param1 : "Carlos Espinoza";
    const char* itemName = (_param2[0] != '\0') ? _param2 : "Acceso Autorizado";
    Lvgl.showGranted(personName, itemName);
}

void ScreenManager::renderDenied() {
    const char* reason = (_param1[0] != '\0') ? _param1 : "Acceso no autorizado";
    Lvgl.showDenied(reason);
}

void ScreenManager::renderOffline() {
    Lvgl.showOfflineMode(_onAdminClickCb);
}

void ScreenManager::renderError() {
    const char* errTitle = (_param1[0] != '\0') ? _param1 : "QR no reconocido";
    const char* errSub = (_param2[0] != '\0') ? _param2 : "Intente acercar el codigo nuevamente";
    Lvgl.showError(errTitle, errSub);
}

void ScreenManager::renderIdentityDetected() {
    const char* name = (_param1[0] != '\0') ? _param1 : "Usuario detectado";
    const char* sub = (_param2[0] != '\0') ? _param2 : "Mira hacia la camara";
    Lvgl.showIdentityDetected(name, sub);
}

void ScreenManager::renderOutOfService() {
    const char* reason = (_param1[0] != '\0') ? _param1 : "Estacion fuera de servicio";
    const char* hint = (_param2[0] != '\0') ? _param2 : "Contacta al encargado del laboratorio";
    Lvgl.showOutOfService(reason, hint);
}

void ScreenManager::renderScanCard() {
    const char* station = (_param1[0] != '\0') ? _param1 : "Laboratorio SIA";
    Lvgl.showItemScanCard(station);
}

void ScreenManager::renderScanItem() {
    const char* person = (_param1[0] != '\0') ? _param1 : "Carlos";
    Lvgl.showItemScanNext(person, 2, [this]() {
        transitionTo(ScreenState::ITEM_SUMMARY);
    });
}

void ScreenManager::renderItemAdded() {
    const char* itemName = (_param1[0] != '\0') ? _param1 : "Multimetro digital";
    const char* itemCode = (_param2[0] != '\0') ? _param2 : "ELEC-042";
    Lvgl.showItemAdded(itemName, itemCode, 2, 
        [this]() { transitionTo(ScreenState::SCAN_ITEM); },
        [this]() { transitionTo(ScreenState::ITEM_SUMMARY); });
}

void ScreenManager::renderItemSummary() {
    static const ItemSummaryEntry demoItems[] = {
        {"Multimetro digital", "ELEC-042"},
        {"Juego de destornilladores", "HERR-018"}
    };
    Lvgl.showItemSummary(demoItems, 2,
        [this]() { transitionTo(ScreenState::SCAN_ITEM); },
        [this]() { transitionTo(ScreenState::VALIDATING); });
}

void ScreenManager::renderValidating() {
    const char* title = (_param1[0] != '\0') ? _param1 : "Validando solicitud";
    const char* subtitle = (_param2[0] != '\0') ? _param2 : "Estamos verificando los items y tu solicitud.";
    Lvgl.showItemValidating(title, subtitle);
}

void ScreenManager::renderLoanCompleted() {
    const char* title = (_param1[0] != '\0') ? _param1 : "Prestamo realizado";
    const char* subtitle = (_param2[0] != '\0') ? _param2 : "Tu prestamo se realizo correctamente.";
    Lvgl.showLoanCompleted(title, subtitle);
}

void ScreenManager::renderApprovalSent() {
    const char* detail = (_param1[0] != '\0') ? _param1 : "Tu prestamo fue enviado a aprobacion.";
    Lvgl.showLoanApprovalSent(detail);
}

void ScreenManager::renderLoanRejected() {
    const char* reason = (_param1[0] != '\0') ? _param1 : "El prestamo no pudo completarse.";
    Lvgl.showLoanRejected(reason);
}

void ScreenManager::renderAdminPanel() {
    const char* name = (_param1[0] != '\0') ? _param1 : "Laboratorio de Electronica";
    bool online = (WiFi.status() == WL_CONNECTED);
    Lvgl.showAdminPanel(Offline.contarPendientes(), name, online,
        [this]() { transitionTo(ScreenState::ADMIN_SYNC); },
        [this]() { transitionTo(ScreenState::ADMIN_STORAGE); },
        [this]() { transitionTo(ScreenState::ADMIN_CONFIG); },
        _onAdminExitCb);
}

void ScreenManager::renderAdminSync() {
    bool online = (WiFi.status() == WL_CONNECTED);
    Lvgl.showAdminSync(Offline.contarPendientes(), online, _onAdminSyncCb, [this]() {
        transitionTo(ScreenState::ADMIN_PANEL);
    });
}

void ScreenManager::renderAdminStorage() {
    Lvgl.showAdminStorage(Offline.contarPendientes(), Offline.obtenerUltimaSincronizacionEventos().c_str(), _onAdminStorageCb, [this]() {
        transitionTo(ScreenState::ADMIN_PANEL);
    });
}

void ScreenManager::renderAdminConfig() {
    const char* name = (_param1[0] != '\0') ? _param1 : "Laboratorio SIA";
    // El boton dice "Salir de admin": debe salir de verdad del modo administrador
    // (antes solo regresaba al menu del panel, dejando al usuario atrapado en admin).
    Lvgl.showAdminConfig(name, WiFi.SSID().c_str(), WiFi.localIP().toString().c_str(), WiFi.macAddress().c_str(),
        _onAdminWifiCb,
        _onAdminExitCb);
}

void ScreenManager::renderAdminDetected() {
    Lvgl.showAdminDetected([this]() {
        transitionTo(ScreenState::ADMIN_PANEL);
    });
}

void ScreenManager::renderSelectWifi() {
    int numNetworks = WiFi.scanComplete();
    // El boton "Volver" solo aparece si se entro a la seleccion de red desde el
    // panel admin: durante el emparejamiento inicial no hay a donde volver.
    std::function<void()> cancelCb = _wifiFromAdmin ? _onWifiCancelCb : nullptr;

    if (numNetworks < 0) {
        Lvgl.showWifiScanning(_onWifiRefreshCb, _onWifiOtherCb, cancelCb);
        return;
    }

    if (numNetworks == 0) {
        Lvgl.showWifiEmpty(_onWifiRefreshCb, _onWifiOtherCb, cancelCb);
        return;
    }

    Lvgl.showWifiList(numNetworks, _onWifiSelectCb, _onWifiRefreshCb, _onWifiOtherCb, cancelCb);
}

void ScreenManager::renderWifiPassword() {
    const char* ssid = (_param1[0] != '\0') ? _param1 : "Red WiFi";
    const char* errorMsg = (_param2[0] != '\0') ? _param2 : nullptr;
    Lvgl.showWifiPassword(ssid, _passwordInput, errorMsg, _onWifiConnectCb, _onWifiBackCb);
}

void ScreenManager::showWifiSuccess(const char* ssid, const char* ip) {
    Lvgl.showStatusMessage(true, "WIFI CONECTADO",
                           (ssid && ssid[0]) ? ssid : "Red WiFi",
                           (ip && ip[0]) ? ip : "IP asignada con exito");
}

void ScreenManager::showWifiError(const char* reason, const char* hint) {
    Lvgl.showStatusMessage(false, "ERROR DE CONEXION",
                           (reason && reason[0]) ? reason : "Fallo al conectar",
                           (hint && hint[0]) ? hint : "Verifica e intenta nuevamente");
}

void ScreenManager::addPasswordChar(char c) {
    size_t len = strlen(_passwordInput);
    if (len < sizeof(_passwordInput) - 1) {
        _passwordInput[len] = c;
        _passwordInput[len + 1] = '\0';
    }
}

void ScreenManager::backspacePassword() {
    size_t len = strlen(_passwordInput);
    if (len > 0) {
        _passwordInput[len - 1] = '\0';
    }
}

void ScreenManager::toggleShowPassword() {
    _showPassword = !_showPassword;
}

void ScreenManager::setPassword(const char* p) {
    if (p != nullptr) {
        strncpy(_passwordInput, p, sizeof(_passwordInput) - 1);
        _passwordInput[sizeof(_passwordInput) - 1] = '\0';
    } else {
        _passwordInput[0] = '\0';
    }
}

void ScreenManager::clearPassword() {
    _passwordInput[0] = '\0';
}
