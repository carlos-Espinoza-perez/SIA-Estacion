#include "Screens.h"
#include "UIComponents.h"
#include "QRCodeRenderer.h"
#include "Theme.h"
#include "Config.h"

// Definición de áreas táctiles por vista
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
      _lastAnimTime(0) {
    _param1[0] = '\0';
    _param2[0] = '\0';
}

void ScreenManager::init() {
    UI::initDisplay(_tft);
    transitionTo(ScreenState::BOOT);
}

void ScreenManager::transitionTo(ScreenState newState, const ParsedCommand* cmd) {
    _currentState = newState;

    if (cmd != nullptr) {
        strncpy(_param1, cmd->param1, sizeof(_param1) - 1);
        _param1[sizeof(_param1) - 1] = '\0';

        strncpy(_param2, cmd->param2, sizeof(_param2) - 1);
        _param2[sizeof(_param2) - 1] = '\0';
    }

    UI::clearScreen(_tft);
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
    }
}

void ScreenManager::update() {
    if (_currentState == ScreenState::BOOT) {
        if (millis() - _lastAnimTime > 60) {
            _lastAnimTime = millis();
            if (_bootProgress < 1.0f) {
                _bootProgress += 0.04f;
                UI::drawProgressBar(_tft, 140, 210, 200, 6, _bootProgress, Theme::COLOR_BLUE);
                if (_bootProgress >= 1.0f) {
                    transitionTo(ScreenState::WAITING);
                }
            }
        }
    }
}

// ==============================================================================
// 1. Vistas de Arranque y Red
// ==============================================================================

void ScreenManager::renderBoot() {
    UI::drawHeader(_tft, "SIA");

    _tft.setTextDatum(TC_DATUM);
    _tft.setTextColor(Theme::COLOR_TEXT_WHITE, Theme::COLOR_BG);
    _tft.setTextFont(4);
    _tft.drawString("Iniciando", SCREEN_WIDTH / 2, 148);

    _tft.setTextColor(Theme::COLOR_TEXT_MUTED, Theme::COLOR_BG);
    _tft.setTextFont(2);
    _tft.drawString("Conectando a la red", SCREEN_WIDTH / 2, 180);

    UI::drawProgressBar(_tft, 140, 210, 200, 6, _bootProgress, Theme::COLOR_BLUE);
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

    const char* code = (_param1[0] != '\0') ? _param1 : "A4CF128B9E70";

    QR::draw(_tft, code, 165, 56, 150, 12);

    _tft.setTextDatum(TC_DATUM);
    _tft.setTextColor(Theme::COLOR_TEXT_MUTED, Theme::COLOR_BG);
    _tft.setTextFont(2);
    _tft.drawString("Escanee este codigo QR o ingrese el siguiente numero:", SCREEN_WIDTH / 2, 220);

    _tft.fillRoundRect(75, 246, 328, 34, 10, Theme::COLOR_CARD);
    _tft.setTextDatum(MC_DATUM);
    _tft.setTextColor(Theme::COLOR_BLUE, Theme::COLOR_CARD);
    _tft.setTextFont(4);
    _tft.drawString(code, SCREEN_WIDTH / 2, 263);
}

void ScreenManager::renderLinked() {
    const char* stationName = (_param1[0] != '\0') ? _param1 : "Laboratorio de Electronica";
    const char* stationMode = (_param2[0] != '\0') ? _param2 : "Control de acceso";

    UI::drawHeader(_tft, "SIA");
    UI::drawStatusView(_tft, IconType::CHECKMARK,
                       "ESTACION VINCULADA", Theme::COLOR_GREEN,
                       stationName, Theme::COLOR_TEXT_WHITE,
                       stationMode, Theme::COLOR_TEXT_MUTED,
                       Theme::COLOR_HALO_GREEN);
}

// ==============================================================================
// 2. Vistas de Control de Acceso
// ==============================================================================

void ScreenManager::renderWaiting() {
    UI::drawHeader(_tft, "SIA");

    UI::drawDashedRect(_tft, 170, 64, 140, 140, Theme::COLOR_BLUE, 10, 8, 16, 3);

    _tft.setTextDatum(TC_DATUM);
    _tft.setTextColor(Theme::COLOR_TEXT_WHITE, Theme::COLOR_BG);
    _tft.setTextFont(4);
    _tft.drawString("Acerca tu codigo QR", SCREEN_WIDTH / 2, 228);

    _tft.setTextColor(Theme::COLOR_TEXT_MUTED, Theme::COLOR_BG);
    _tft.setTextFont(2);
    _tft.drawString("Estacion lista", SCREEN_WIDTH / 2, 258);
}

void ScreenManager::renderProcessing() {
    UI::drawHeader(_tft, "SIA");

    _tft.drawCircle(SCREEN_WIDTH / 2, 100, 45, Theme::COLOR_BLUE);
    _tft.drawCircle(SCREEN_WIDTH / 2, 100, 44, Theme::COLOR_BLUE);
    _tft.drawCircle(SCREEN_WIDTH / 2, 100, 43, Theme::COLOR_BLUE);

    _tft.setTextDatum(TC_DATUM);
    _tft.setTextColor(Theme::COLOR_TEXT_WHITE, Theme::COLOR_BG);
    _tft.setTextFont(4);
    _tft.drawString("Verificando", SCREEN_WIDTH / 2, 178);

    _tft.setTextColor(Theme::COLOR_TEXT_MUTED, Theme::COLOR_BG);
    _tft.setTextFont(2);
    _tft.drawString("Consultando con el sistema", SCREEN_WIDTH / 2, 208);
}

void ScreenManager::renderGranted() {
    const char* personName = (_param1[0] != '\0') ? _param1 : "Carlos Espinoza";

    UI::drawHeader(_tft, "SIA");
    UI::drawStatusView(_tft, IconType::CHECKMARK,
                       "ACCESO CONCEDIDO", Theme::COLOR_GREEN,
                       personName, Theme::COLOR_TEXT_WHITE,
                       nullptr, 0,
                       Theme::COLOR_HALO_GREEN);
}

void ScreenManager::renderDenied() {
    const char* reason = (_param1[0] != '\0') ? _param1 : "Acceso no autorizado";

    UI::drawHeader(_tft, "SIA");
    UI::drawStatusView(_tft, IconType::CROSS,
                       "ACCESO DENEGADO", Theme::COLOR_RED,
                       reason, Theme::COLOR_TEXT_WHITE,
                       nullptr, 0,
                       Theme::COLOR_HALO_RED);
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

// ==============================================================================
// 3. Vistas de Gestión de Ítems
// ==============================================================================

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

// ==============================================================================
// 4. Vistas de Administración Local
// ==============================================================================

void ScreenManager::renderAdminPanel() {
    UI::drawHeader(_tft, "SIA · Administracion");

    _tft.setTextDatum(TL_DATUM);
    _tft.setTextColor(Theme::COLOR_TEXT_WHITE, Theme::COLOR_BG);
    _tft.setTextFont(4);
    _tft.drawString("Gestion de la estacion", 32, 34);

    _tft.setTextColor(Theme::COLOR_TEXT_MUTED, Theme::COLOR_BG);
    _tft.setTextFont(2);
    _tft.drawString("Laboratorio de Electronica · Sin conexion", 32, 58);

    UI::drawCard(_tft, 32, 78,  416, 44, "Sincronizacion", "3 eventos pendientes", "›", Theme::COLOR_BLUE);
    UI::drawCard(_tft, 32, 130, 416, 44, "Datos almacenados", "Ver y gestionar datos locales", "›", Theme::COLOR_BLUE);
    UI::drawCard(_tft, 32, 182, 416, 44, "Configuracion", "Red, estacion y preferencias", "›", Theme::COLOR_BLUE);

    UI::drawButton(_tft, 32, 234, 416, 44, "Salir de administracion", Theme::COLOR_CARD_BORDER, false, Theme::COLOR_TEXT_WHITE);

    _touch.setAreas(TOUCH_ADMIN_PANEL, 4);
}
