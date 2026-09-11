#pragma once

#include <Arduino.h>
#include <TFT_eSPI.h>
#include <functional>
#include "TouchManager.h"

enum class ScreenState {
    BOOT,
    CONNECTING,
    BOOT_NO_NETWORK,
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
    ADMIN_PANEL,
    ADMIN_SYNC,
    ADMIN_STORAGE,
    ADMIN_CONFIG,
    ADMIN_FACE_VERIFY,
    ADMIN_DETECTED,
    SELECT_WIFI,
    WIFI_PASSWORD
};

class ScreenManager {
public:
    ScreenManager(TFT_eSPI& tft, TouchManager& touch);

    void init();
    void transitionTo(ScreenState newState, const char* param1 = nullptr, const char* param2 = nullptr);
    void update();

    ScreenState getCurrentState() const { return _currentState; }

    void addPasswordChar(char c);
    void backspacePassword();
    void toggleShowPassword();
    void setPassword(const char* p);
    void clearPassword();
    const char* getPassword() const { return _passwordInput; }
    bool isPasswordVisible() const { return _showPassword; }

    int getWifiScrollOffset() const { return _wifiScrollOffset; }
    void scrollWifiUp();
    void scrollWifiDown();
    void resetWifiScroll() { _wifiScrollOffset = 0; }

    void onWifiSelect(std::function<void(int)> cb) { _onWifiSelectCb = cb; }
    void onWifiRefresh(std::function<void()> cb) { _onWifiRefreshCb = cb; }
    void onWifiOther(std::function<void()> cb) { _onWifiOtherCb = cb; }
    void onWifiConnect(std::function<void(const char*)> cb) { _onWifiConnectCb = cb; }
    void onWifiBack(std::function<void()> cb) { _onWifiBackCb = cb; }
    void onAdminClick(std::function<void()> cb) { _onAdminClickCb = cb; }
    void onAdminWifi(std::function<void()> cb) { _onAdminWifiCb = cb; }
    void onAdminSync(std::function<void()> cb) { _onAdminSyncCb = cb; }
    void onAdminStorage(std::function<void()> cb) { _onAdminStorageCb = cb; }
    void onAdminExit(std::function<void()> cb) { _onAdminExitCb = cb; }
    void showWifiSuccess(const char* ssid, const char* ip);
    void showWifiError(const char* reason, const char* hint);
    void updateBootStatus(const char* subtitle);

private:
    TFT_eSPI& _tft;
    TouchManager& _touch;
    ScreenState _currentState;

    char _param1[160];
    char _param2[64];
    float _bootProgress;
    uint32_t _lastAnimTime;
    uint8_t _scanAnimStep;
    uint32_t _lastScanAnimTime;
    int _wifiScrollOffset;

    char _passwordInput[64];
    bool _showPassword;

    std::function<void(int)> _onWifiSelectCb;
    std::function<void()> _onWifiRefreshCb;
    std::function<void()> _onWifiOtherCb;
    std::function<void(const char*)> _onWifiConnectCb;
    std::function<void()> _onWifiBackCb;
    std::function<void()> _onAdminClickCb;
    std::function<void()> _onAdminWifiCb;
    std::function<void()> _onAdminSyncCb;
    std::function<void()> _onAdminStorageCb;
    std::function<void()> _onAdminExitCb;

    void renderBoot();
    void renderConnecting();
    void renderBootNoNetwork();
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
    void renderAdminSync();
    void renderAdminStorage();
    void renderAdminConfig();
    void renderAdminFaceVerify();
    void renderAdminDetected();
    void renderSelectWifi();
    void renderWifiPassword();
};
