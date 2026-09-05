#pragma once

#include <Arduino.h>
#include <TFT_eSPI.h>
#include "SerialProtocol.h"
#include "TouchManager.h"

enum class ScreenState {
    BOOT,
    WAITING,
    PROCESSING,
    GRANTED,
    DENIED,
    OFFLINE,
    ERROR_STATE,
    UNCONFIGURED,
    LINK_CODE,
    LINKED,
    IDENTITY_DETECTED,
    SCAN_CARD,
    SCAN_ITEM,
    ITEM_ADDED,
    ITEM_SUMMARY,
    VALIDATING,
    LOAN_COMPLETED,
    APPROVAL_SENT,
    LOAN_REJECTED,
    OUT_OF_SERVICE,
    ADMIN_PANEL
};

class ScreenManager {
public:
    ScreenManager(TFT_eSPI& tft, TouchManager& touch);

    void init();
    
    // Cambia el estado visual de la pantalla y dibuja la vista correspondiente
    void transitionTo(ScreenState newState, const ParsedCommand* cmd = nullptr);

    // Actualizaciones periódicas (animaciones de spinner, barras de progreso, etc.)
    void update();

    // Retorna el estado actual
    ScreenState getCurrentState() const { return _currentState; }

private:
    TFT_eSPI& _tft;
    TouchManager& _touch;
    ScreenState _currentState;

    // Buffers para datos dinámicos actuales (FSM)
    char _param1[48];
    char _param2[48];
    float _bootProgress;
    uint32_t _lastAnimTime;

    // Métodos de dibujo específicos de cada vista según Figma
    void renderBoot();
    void renderWaiting();
    void renderProcessing();
    void renderGranted();
    void renderDenied();
    void renderOffline();
    void renderError();
    void renderUnconfigured();
    void renderLinkCode();
    void renderLinked();
    void renderIdentityDetected();
    void renderScanCard();
    void renderScanItem();
    void renderItemAdded();
    void renderItemSummary();
    void renderValidating();
    void renderLoanCompleted();
    void renderApprovalSent();
    void renderLoanRejected();
    void renderOutOfService();
    void renderAdminPanel();
};
