#pragma once

#include <Arduino.h>
#include <Preferences.h>

struct StationConfig {
    String clientId;
    String clientSecret;
    String name;
    String tipoRecurso = "ControlAcceso"; // ControlAcceso | EquipoLaboratorio | MaterialBibliografico
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

    bool hasWifiConfig();
    String getWifiSsid();
    String getWifiPassword();
    String getApiUrl();
    void setWifi(const String& ssid, const String& password);
    void setApiUrl(const String& url);

    String getMacAddress() const { return _mac; }
    String getCleanMac() const { return _cleanMac; }
    void factoryReset();

    bool getTouchCalibration(uint16_t* calData);
    void saveTouchCalibration(const uint16_t* calData);

private:
    Preferences _prefs;
    String _mac;
    String _cleanMac;
    void initMac();
};

extern StorageManager Storage;
