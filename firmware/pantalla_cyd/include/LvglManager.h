#pragma once

#include <Arduino.h>
#include <TFT_eSPI.h>
#include <lvgl.h>
#include <functional>

class LvglManager {
public:
    LvglManager();

    void init(TFT_eSPI* tft);
    void update();

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

    void showProcessing(const char* title, const char* subtitle = nullptr);
    void showStatusMessage(bool success, const char* badge, const char* title, const char* subtitle = nullptr);
    void showWaiting(const char* title, const char* subtitle, std::function<void()> onAdminClick);
    void showAdminPanel(std::function<void()> onWifi, std::function<void()> onSync, std::function<void()> onExit);
    void showGranted(const char* person, const char* item);
    void showDenied(const char* reason);
    void showLinked(const char* name, const char* mode);

    void clear();
    bool isActive() const { return _active; }

private:
    bool _initialized;
    bool _active;
    uint32_t _lastTick;

    static void dispFlushCb(lv_disp_drv_t *disp, const lv_area_t *area, lv_color_t *color_p);
    static void touchReadCb(lv_indev_drv_t *indev, lv_indev_data_t *data);
};

extern LvglManager Lvgl;
