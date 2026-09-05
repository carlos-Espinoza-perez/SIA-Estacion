#pragma once

#include <Arduino.h>
#include <WebServer.h>

class PhoneCameraServer {
public:
    using CaptureCallback = void (*)(const String& code, const String& imageBase64);

    void begin();
    void update();

    void onCapture(CaptureCallback cb) { _captureCb = cb; }
    void notifyResult(bool success, const String& title, const String& message);

    String getApIp() const;
    String getStaIp() const;

private:
    WebServer _server{80};
    CaptureCallback _captureCb = nullptr;

    bool _lastResultSuccess = false;
    String _lastResultTitle;
    String _lastResultMessage;
    uint32_t _lastResultTime = 0;

    void setupRoutes();
    void handleRoot();
    void handleStatus();
    void handleUpload();
};

extern PhoneCameraServer CameraServer;
