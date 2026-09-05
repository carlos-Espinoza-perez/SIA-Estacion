#pragma once

#include <Arduino.h>
#include <Preferences.h>

struct StationConfig {
    String clientId;
    String clientSecret;
    String name;
    bool requireAuth;
    bool requireApproval;
};

class StorageManager {
public:
    bool begin();

    bool isProvisioned();
    StationConfig getConfig();
    bool saveConfig(const StationConfig& config);
    void clearConfig();

    String getWifiSsid();
    String getWifiPassword();
    String getApiUrl();
    void setWifi(const String& ssid, const String& password);
    void setApiUrl(const String& url);

    String getMacAddress() const { return _mac; }
    void factoryReset();

private:
    Preferences _prefs;
    String _mac;
    void initMac();
};

extern StorageManager Storage;
