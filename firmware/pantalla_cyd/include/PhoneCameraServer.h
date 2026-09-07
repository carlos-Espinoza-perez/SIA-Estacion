#pragma once

#include <Arduino.h>
#include <WebServer.h>

class PhoneCameraServer {
public:
    using CaptureCallback = void (*)(const String& code, const String& imageBase64);
    using WifiConfigCallback = void (*)(const String& ssid, const String& password);

    void begin();
    void update();

    void onCapture(CaptureCallback cb) { _captureCb = cb; }
    void onWifiConfig(WifiConfigCallback cb) { _wifiConfigCb = cb; }
    void notifyResult(bool success, const String& title, const String& message);

    String getApIp() const;
    String getStaIp() const;

private:
    WebServer _server{80};
    CaptureCallback _captureCb = nullptr;
    WifiConfigCallback _wifiConfigCb = nullptr;

    bool _lastResultSuccess = false;
    String _lastResultTitle;
    String _lastResultMessage;
    uint32_t _lastResultTime = 0;

    void setupRoutes();
    void handleRoot();
    void handleStatus();
    void handleUpload();
    void handleWifiGet();
    void handleWifiPost();
};

extern PhoneCameraServer CameraServer;
