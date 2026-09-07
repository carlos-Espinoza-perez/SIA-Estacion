#include "Screens.h"
#include "UIComponents.h"
#include "QRCodeRenderer.h"
#include "Theme.h"
#include "Config.h"
#include "LvglManager.h"
#include <WiFi.h>

static const TouchArea TOUCH_SELECT_WIFI[] = {
    { 20, 44,  440, 60, "BTN_WIFI_0" },
    { 20, 108, 440, 60, "BTN_WIFI_1" },
    { 20, 172, 440, 60, "BTN_WIFI_2" },
    { 15, 235, 190, 75, "BTN_WIFI_REFRESH" },
    { 270, 235, 195, 75, "BTN_WIFI_OTHER" }
};

static const TouchArea TOUCH_WIFI_PASSWORD[] = {
    { 10, 5,   140, 40, "BTN_WIFI_BACK" },
    { 20, 85,  330, 60, "BTN_INPUT_PASS" },
    { 350, 85, 115, 60, "BTN_TOGGLE_PASS" },
    { 15, 235, 185, 75, "BTN_WIFI_BACK" },
    { 270, 235, 195, 75, "BTN_WIFI_CONNECT" }
};

static const TouchArea TOUCH_SCAN_ITEM[] = {
    { 340, 250, 108, 38, "BTN_VIEW_ITEMS" }
};

static const TouchArea TOUCH_ITEM_ADDED[] = {
    { 32,  250, 202, 38, "BTN_VIEW_ITEMS" },
    { 246, 250, 202, 38, "BTN_CONTINUE_SCAN" }
};

static const TouchArea TOUCH_ITEM_SUMMARY[] = {
    { 32,  252, 202, 38, "BTN_CONTINUE_SCAN" },
    { 246, 252, 202, 38, "BTN_COMPLETE_LOAN" },
    { 350, 100, 90,  46, "BTN_REMOVE_ITEM_1" },
    { 350, 154, 90,  46, "BTN_REMOVE_ITEM_2" }
};

static const TouchArea TOUCH_UNCONFIGURED[] = {
    { 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, "BTN_START_CONFIG" }
};

static const TouchArea TOUCH_ADMIN_PANEL[] = {
    { 32, 78,  416, 44, "BTN_ADMIN_SYNC" },
    { 32, 130, 416, 44, "BTN_ADMIN_DATA" },
    { 32, 182, 416, 44, "BTN_ADMIN_SETTINGS" },
    { 32, 234, 416, 44, "BTN_ADMIN_EXIT" }
};

ScreenManager::ScreenManager(TFT_eSPI& tft, TouchManager& touch)
    : _tft(tft),
      _touch(touch),
      _currentState(ScreenState::BOOT),
      _bootProgress(0.15f),
      _lastAnimTime(0),
      _scanAnimStep(0),
      _lastScanAnimTime(0),
      _wifiScrollOffset(0) {
    _param1[0] = '\0';
    _param2[0] = '\0';
    _passwordInput[0] = '\0';
    _showPassword = false;
}

void ScreenManager::scrollWifiUp() {
    if (_wifiScrollOffset > 0) {
        _wifiScrollOffset--;
        UI::clearScreen(_tft);
        renderSelectWifi();
    }
}

void ScreenManager::scrollWifiDown() {
    int numNetworks = WiFi.scanComplete();
    if (_wifiScrollOffset + 3 < numNetworks) {
        _wifiScrollOffset++;
        UI::clearScreen(_tft);
        renderSelectWifi();
    }
}

void ScreenManager::init() {
    UI::initDisplay(_tft);
    Lvgl.init(&_tft);
    transitionTo(ScreenState::BOOT);
}

void ScreenManager::transitionTo(ScreenState newState, const char* param1, const char* param2) {
    bool wasLvgl = (_currentState == ScreenState::BOOT ||
                    _currentState == ScreenState::SELECT_WIFI || 
                    _currentState == ScreenState::WIFI_PASSWORD ||
                    _currentState == ScreenState::PROCESSING ||
                    _currentState == ScreenState::WAITING ||
                    _currentState == ScreenState::ADMIN_PANEL ||
                    _currentState == ScreenState::GRANTED ||
                    _currentState == ScreenState::DENIED ||
                    _currentState == ScreenState::LINKED);

    bool willBeLvgl = (newState == ScreenState::BOOT ||
                      newState == ScreenState::SELECT_WIFI || 
                      newState == ScreenState::WIFI_PASSWORD ||
                      newState == ScreenState::PROCESSING ||
                      newState == ScreenState::WAITING ||
                      newState == ScreenState::ADMIN_PANEL ||
                      newState == ScreenState::GRANTED ||
                      newState == ScreenState::DENIED ||
                      newState == ScreenState::LINKED);

    if (wasLvgl && !willBeLvgl) {
        Lvgl.clear();
    }
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

    if (!willBeLvgl) {
        UI::clearScreen(_tft);
    }
    _touch.setAreas(nullptr, 0);

    switch (_currentState) {
        case ScreenState::BOOT:
            renderBoot();
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

void ScreenManager::renderUnconfigured() {
    UI::drawHeader(_tft, "SIA");
    _touch.setAreas(TOUCH_UNCONFIGURED, 1);

    _tft.fillCircle(SCREEN_WIDTH / 2, 96, 48, Theme::COLOR_CARD);
    _tft.fillRect(SCREEN_WIDTH / 2 - 28, 86, 56, 4, Theme::COLOR_TEXT_MUTED);
    _tft.fillCircle(SCREEN_WIDTH / 2 - 12, 88, 6, Theme::COLOR_TEXT_WHITE);

    _tft.fillRect(SCREEN_WIDTH / 2 - 28, 98, 56, 4, Theme::COLOR_TEXT_MUTED);
    _tft.fillCircle(SCREEN_WIDTH / 2 + 10, 100, 6, Theme::COLOR_TEXT_WHITE);

    _tft.fillRect(SCREEN_WIDTH / 2 - 28, 110, 56, 4, Theme::COLOR_TEXT_MUTED);
    _tft.fillCircle(SCREEN_WIDTH / 2 - 2, 112, 6, Theme::COLOR_TEXT_WHITE);

    _tft.setTextDatum(TC_DATUM);
    _tft.setTextColor(Theme::COLOR_TEXT_WHITE, Theme::COLOR_BG);
    _tft.setTextFont(4);
    _tft.drawString("Estacion sin configurar", SCREEN_WIDTH / 2, 168);

    _tft.setTextColor(Theme::COLOR_TEXT_MUTED, Theme::COLOR_BG);
    _tft.setTextFont(2);
    _tft.drawString("Este equipo aun no esta vinculado al sistema", SCREEN_WIDTH / 2, 200);

    _tft.setTextColor(Theme::COLOR_BLUE, Theme::COLOR_BG);
    _tft.setTextFont(2);
    _tft.drawString("Toca la pantalla para comenzar", SCREEN_WIDTH / 2, 250);
}

void ScreenManager::renderLinkCode() {
    UI::drawHeader(_tft, "SIA");

    _tft.setTextDatum(TC_DATUM);
    _tft.setTextColor(Theme::COLOR_TEXT_WHITE, Theme::COLOR_BG);
    _tft.setTextFont(4);
    _tft.drawString("Vincular estacion", SCREEN_WIDTH / 2, 24);

    const char* qrContent = (_param1[0] != '\0') ? _param1 : "A4CF128B9E70";
    const char* labelContent = (_param2[0] != '\0') ? _param2 : qrContent;

    QR::draw(_tft, qrContent, 165, 54, 150, 10);

    _tft.setTextDatum(TC_DATUM);
    _tft.setTextColor(Theme::COLOR_TEXT_MUTED, Theme::COLOR_BG);
    _tft.setTextFont(2);
    _tft.drawString("Escanee este codigo QR o ingrese el identificador:", SCREEN_WIDTH / 2, 214);

    _tft.fillRoundRect(60, 240, 360, 36, 10, Theme::COLOR_CARD);
    _tft.setTextDatum(MC_DATUM);
    _tft.setTextColor(Theme::COLOR_BLUE, Theme::COLOR_CARD);
    _tft.setTextFont(4);
    _tft.drawString(labelContent, SCREEN_WIDTH / 2, 258);
}

void ScreenManager::renderLinked() {
    const char* stationName = (_param1[0] != '\0') ? _param1 : "Laboratorio de Electronica";
    const char* stationMode = (_param2[0] != '\0') ? _param2 : "Control de acceso";
    Lvgl.showLinked(stationName, stationMode);
}

void ScreenManager::renderWaiting() {
    const char* stationTitle = (_param1[0] != '\0') ? _param1 : "Estacion Lista";
    const char* subTitle = (_param2[0] != '\0') ? _param2 : "Abre la camara web del telefono para validar";
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
    UI::drawHeader(_tft, "SIA");

    _tft.fillCircle(SCREEN_WIDTH / 2 - 75, 94, 5, Theme::COLOR_TURQUOISE);
    _tft.setTextDatum(TL_DATUM);
    _tft.setTextColor(Theme::COLOR_TURQUOISE, Theme::COLOR_BG);
    _tft.setTextFont(2);
    _tft.drawString("Modo sin conexion", SCREEN_WIDTH / 2 - 62, 86);

    _tft.setTextDatum(TC_DATUM);
    _tft.setTextColor(Theme::COLOR_TEXT_WHITE, Theme::COLOR_BG);
    _tft.setTextFont(4);
    _tft.drawString("Acerca tu codigo QR", SCREEN_WIDTH / 2, 148);

    _tft.setTextColor(Theme::COLOR_TEXT_MUTED, Theme::COLOR_BG);
    _tft.setTextFont(2);
    _tft.drawString("Validando solo contra la copia local", SCREEN_WIDTH / 2, 178);
}

void ScreenManager::renderError() {
    const char* errCode = (_param1[0] != '\0') ? _param1 : "QR no reconocido";

    UI::drawHeader(_tft, "SIA");
    UI::drawStatusView(_tft, IconType::WARNING,
                       "ERROR", Theme::COLOR_PURPLE,
                       errCode, Theme::COLOR_TEXT_WHITE,
                       nullptr, 0,
                       Theme::COLOR_HALO_PURPLE);
}

void ScreenManager::renderIdentityDetected() {
    UI::drawHeader(_tft, "SIA");
    UI::drawStatusView(_tft, IconType::CAMERA,
                       nullptr, 0,
                       "Identidad detectada", Theme::COLOR_TEXT_WHITE,
                       "Mira hacia la camara", Theme::COLOR_BLUE,
                       Theme::COLOR_HALO_BLUE);
}

void ScreenManager::renderOutOfService() {
    UI::drawHeader(_tft, "SIA");
    UI::drawStatusView(_tft, IconType::WARNING,
                       nullptr, 0,
                       "Estacion fuera de servicio", Theme::COLOR_TEXT_WHITE,
                       "Contacta al encargado del laboratorio", Theme::COLOR_TEXT_MUTED,
                       Theme::COLOR_HALO_YELLOW);
}

void ScreenManager::renderScanCard() {
    UI::drawHeader(_tft, "SIA");
    UI::drawDashedRect(_tft, 170, 60, 140, 140, Theme::COLOR_BLUE, 10, 8, 16, 3);

    _tft.setTextDatum(TC_DATUM);
    _tft.setTextColor(Theme::COLOR_TEXT_WHITE, Theme::COLOR_BG);
    _tft.setTextFont(4);
    _tft.drawString("Escanea tu carnet", SCREEN_WIDTH / 2, 222);

    _tft.setTextColor(Theme::COLOR_TEXT_MUTED, Theme::COLOR_BG);
    _tft.setTextFont(2);
    _tft.drawString("Estacion de gestion de items", SCREEN_WIDTH / 2, 252);
}

void ScreenManager::renderScanItem() {
    const char* greeting = (_param1[0] != '\0') ? _param1 : "Carlos Espinoza";
    char headerText[64];
    snprintf(headerText, sizeof(headerText), "Hola, %s", greeting);
    UI::drawHeader(_tft, headerText);

    UI::drawDashedRect(_tft, 170, 60, 140, 140, Theme::COLOR_BLUE, 10, 8, 16, 3);

    _tft.setTextDatum(TC_DATUM);
    _tft.setTextColor(Theme::COLOR_TEXT_WHITE, Theme::COLOR_BG);
    _tft.setTextFont(4);
    _tft.drawString("Ahora escanea el item", SCREEN_WIDTH / 2, 222);

    UI::drawButton(_tft, 330, 250, 126, 38, "Ver items (2)", Theme::COLOR_BLUE, true);
    _touch.setAreas(TOUCH_SCAN_ITEM, 1);
}

void ScreenManager::renderItemAdded() {
    const char* greeting = (_param1[0] != '\0') ? _param1 : "Carlos Espinoza";
    char headerText[64];
    snprintf(headerText, sizeof(headerText), "Hola, %s", greeting);
    UI::drawHeader(_tft, headerText);

    _tft.setTextDatum(TC_DATUM);
    _tft.setTextColor(Theme::COLOR_GREEN, Theme::COLOR_BG);
    _tft.setTextFont(4);
    _tft.drawString("Item agregado", SCREEN_WIDTH / 2, 86);

    _tft.setTextColor(Theme::COLOR_TEXT_WHITE, Theme::COLOR_BG);
    _tft.setTextFont(4);
    _tft.drawString((_param2[0] != '\0') ? _param2 : "Multimetro digital", SCREEN_WIDTH / 2, 122);

    _tft.setTextColor(Theme::COLOR_TEXT_MUTED, Theme::COLOR_BG);
    _tft.setTextFont(2);
    _tft.drawString("Puedes seguir escaneando mas items.", SCREEN_WIDTH / 2, 154);

    UI::drawButton(_tft, 32, 250, 202, 38, "Ver items (2)", Theme::COLOR_BLUE, false);
    UI::drawButton(_tft, 246, 250, 202, 38, "Continuar escaneando", Theme::COLOR_BLUE, true);

    _touch.setAreas(TOUCH_ITEM_ADDED, 2);
}

void ScreenManager::renderItemSummary() {
    UI::drawHeader(_tft, "Hola, Carlos");

    _tft.setTextDatum(TL_DATUM);
    _tft.setTextColor(Theme::COLOR_TEXT_WHITE, Theme::COLOR_BG);
    _tft.setTextFont(4);
    _tft.drawString("Items seleccionados", 32, 46);

    _tft.setTextColor(Theme::COLOR_TEXT_MUTED, Theme::COLOR_BG);
    _tft.setTextFont(2);
    _tft.drawString("2 items", 32, 72);

    UI::drawCard(_tft, 32, 100, 416, 46, "Multimetro digital", "Codigo: ELEC-042", "Quitar", Theme::COLOR_BLUE);
    UI::drawCard(_tft, 32, 154, 416, 46, "Juego de destornilladores", "Codigo: HERR-018", "Quitar", Theme::COLOR_BLUE);

    UI::drawButton(_tft, 32, 252, 202, 38, "Continuar escaneando", Theme::COLOR_BLUE, false);
    UI::drawButton(_tft, 246, 252, 202, 38, "Completar", Theme::COLOR_BLUE, true);

    _touch.setAreas(TOUCH_ITEM_SUMMARY, 4);
}

void ScreenManager::renderValidating() {
    UI::drawHeader(_tft, "SIA");

    _tft.fillCircle(SCREEN_WIDTH / 2, 110, 40, Theme::COLOR_HALO_BLUE);
    UI::drawSpinner(_tft, SCREEN_WIDTH / 2, 110, 26, Theme::COLOR_BLUE);

    _tft.setTextDatum(TC_DATUM);
    _tft.setTextColor(Theme::COLOR_TEXT_WHITE, Theme::COLOR_BG);
    _tft.setTextFont(4);
    _tft.drawString("Validando solicitud", SCREEN_WIDTH / 2, 168);

    _tft.setTextColor(Theme::COLOR_TEXT_MUTED, Theme::COLOR_BG);
    _tft.setTextFont(2);
    _tft.drawString("Estamos verificando los items y tu solicitud.", SCREEN_WIDTH / 2, 198);
}

void ScreenManager::renderLoanCompleted() {
    UI::drawHeader(_tft, "Hola, Carlos");
    UI::drawStatusView(_tft, IconType::CHECKMARK,
                       nullptr, 0,
                       "Prestamo realizado", Theme::COLOR_TEXT_WHITE,
                       "Tu prestamo se realizo correctamente.", Theme::COLOR_TEXT_MUTED,
                       Theme::COLOR_HALO_GREEN);
}

void ScreenManager::renderApprovalSent() {
    UI::drawHeader(_tft, "Hola, Carlos");

    _tft.fillCircle(SCREEN_WIDTH / 2, 90, 45, Theme::COLOR_HALO_BLUE);
    UI::drawSpinner(_tft, SCREEN_WIDTH / 2, 90, 24, Theme::COLOR_BLUE);

    _tft.setTextDatum(TC_DATUM);
    _tft.setTextColor(Theme::COLOR_TEXT_WHITE, Theme::COLOR_BG);
    _tft.setTextFont(4);
    _tft.drawString("Solicitud enviada", SCREEN_WIDTH / 2, 148);

    _tft.setTextColor(Theme::COLOR_TEXT_MUTED, Theme::COLOR_BG);
    _tft.setTextFont(2);
    _tft.drawString("Tu prestamo fue enviado a aprobacion.", SCREEN_WIDTH / 2, 178);
    _tft.drawString("Te notificaremos cuando sea aprobada.", SCREEN_WIDTH / 2, 204);
}

void ScreenManager::renderLoanRejected() {
    UI::drawHeader(_tft, "Hola, Carlos");
    UI::drawStatusView(_tft, IconType::WARNING,
                       nullptr, 0,
                       "Solicitud no aceptada", Theme::COLOR_TEXT_WHITE,
                       "El prestamo no pudo completarse.", Theme::COLOR_TEXT_MUTED,
                       Theme::COLOR_HALO_RED);
}

void ScreenManager::renderAdminPanel() {
    Lvgl.showAdminPanel(_onAdminWifiCb, _onAdminSyncCb, _onAdminExitCb);
}

void ScreenManager::renderSelectWifi() {
    int numNetworks = WiFi.scanComplete();

    if (numNetworks < 0) {
        Lvgl.showWifiScanning(_onWifiRefreshCb, _onWifiOtherCb);
        return;
    }

    if (numNetworks == 0) {
        Lvgl.showWifiEmpty(_onWifiRefreshCb, _onWifiOtherCb);
        return;
    }

    Lvgl.showWifiList(numNetworks, _onWifiSelectCb, _onWifiRefreshCb, _onWifiOtherCb);
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
