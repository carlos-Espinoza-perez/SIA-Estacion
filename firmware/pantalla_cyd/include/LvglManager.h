#pragma once

#include <Arduino.h>
#include <TFT_eSPI.h>
#include <lvgl.h>
#include <functional>

struct ItemSummaryEntry {
    const char* name;
    const char* code;
};

class LvglManager {
public:
    LvglManager();

    void init(TFT_eSPI* tft);
    void update();
    void clear();
    bool isActive() const { return _active; }

    // ==========================================
    // 1. Conectividad y Arranque
    // ==========================================
    void showBoot(const char* title = nullptr, const char* subtitle = nullptr);
    void updateBootStatus(const char* subtitle);
    void showConnecting(const char* ssid);
    void showBootNoNetwork(const char* ssid, std::function<void()> onRetry, std::function<void()> onConfig);
    void showWifiList(int numNetworks, 
                      std::function<void(int)> onSelect,
                      std::function<void()> onRefresh,
                      std::function<void()> onOther);
    void showWifiScanning(std::function<void()> onRefresh,
                          std::function<void()> onOther);
    void showWifiEmpty(std::function<void()> onRefresh,
                       std::function<void()> onOther);
    void showWifiPassword(const char* ssid,
                          const char* currentPass,
                          const char* errorMsg,
                          std::function<void(const char*)> onConnect,
                          std::function<void()> onBack);

    // ==========================================
    // 2. Vinculacion Inicial (Unpaired / Setup)
    // ==========================================
    void showUnconfigured(std::function<void()> onStart);
    void showLinkCode(const char* code, const char* qrPayload, std::function<void()> onCancel = nullptr);
    void showLinked(const char* name, const char* mode);

    // ==========================================
    // 3. Control de Acceso (Operacion Normal)
    // ==========================================
    void showWaiting(const char* title, const char* subtitle, std::function<void()> onAdminClick);
    void showProcessing(const char* title, const char* subtitle = nullptr);
    void showIdentityDetected(const char* name = nullptr, const char* subtitle = nullptr);
    void showGranted(const char* person, const char* item = nullptr);
    void showDenied(const char* reason);
    void showOfflineMode(std::function<void()> onAdminClick = nullptr);
    void showError(const char* title, const char* subtitle = nullptr, std::function<void()> onDismiss = nullptr);
    void showOutOfService(const char* reason = nullptr, const char* hint = nullptr);

    // ==========================================
    // 4. Gestion de Items y Prestamos
    // ==========================================
    void showItemScanCard(const char* stationName = nullptr);
    void showItemScanNext(const char* personName, int itemCount, std::function<void()> onViewItems = nullptr);
    void showItemAdded(const char* itemName, const char* itemCode, int itemCount, 
                       std::function<void()> onContinue, std::function<void()> onViewItems);
    void showItemSummary(const ItemSummaryEntry* items, int itemCount, 
                         std::function<void()> onContinue, std::function<void()> onComplete);
    void showItemValidating(const char* title = nullptr, const char* subtitle = nullptr);
    void showLoanCompleted(const char* person = nullptr, const char* detail = nullptr);
    void showLoanApprovalSent(const char* detail = nullptr);
    void showLoanRejected(const char* reason = nullptr);

    // ==========================================
    // 5. Modulo de Administracion Local
    // ==========================================
    void showAdminDetected(std::function<void()> onEnter = nullptr);
    void showAdminPanel(int pendingSyncs, const char* stationName, bool isOnline,
                        std::function<void()> onSync,
                        std::function<void()> onStorage,
                        std::function<void()> onConfig,
                        std::function<void()> onExit);
    void showAdminSync(int pendingCount, bool isOnline, 
                       std::function<void()> onRetry, std::function<void()> onBack);
    void showAdminStorage(int pendingCount, const char* lastSync, 
                          std::function<void()> onClear, std::function<void()> onBack);
    void showAdminConfig(const char* stationName, const char* wifiSsid, const char* ip, const char* mac, 
                         std::function<void()> onUpdateConfig, std::function<void()> onBack);
    void showAdminFaceVerify(std::function<void()> onCancel = nullptr);

    // Generico para mensajes de estado tipo badge
    void showStatusMessage(bool success, const char* badge, const char* title, const char* subtitle = nullptr);

private:
    bool _initialized;
    bool _active;
    uint32_t _lastTick;

    static void dispFlushCb(lv_disp_drv_t *disp, const lv_area_t *area, lv_color_t *color_p);
    static void touchReadCb(lv_indev_drv_t *indev, lv_indev_data_t *data);
};

extern LvglManager Lvgl;
