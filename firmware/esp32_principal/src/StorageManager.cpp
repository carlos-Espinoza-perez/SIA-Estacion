#include "StorageManager.h"
#include "Config.h"
#include <esp_wifi.h>

StorageManager Storage;

bool StorageManager::begin() {
    initMac();
    return _prefs.begin("sia", false);
}

void StorageManager::initMac() {
    uint8_t raw[6];
    esp_read_mac(raw, ESP_MAC_WIFI_STA);
    char buf[18];
    snprintf(buf, sizeof(buf), "%02X:%02X:%02X:%02X:%02X:%02X",
             raw[0], raw[1], raw[2], raw[3], raw[4], raw[5]);
    _mac = String(buf);
}

bool StorageManager::isProvisioned() {
    return _prefs.getBool("ok", false);
}

StationConfig StorageManager::getConfig() {
    StationConfig cfg;
    cfg.clientId = _prefs.getString("cid", "");
    cfg.clientSecret = _prefs.getString("sec", "");
    cfg.name = _prefs.getString("name", "Estacion SIA");
    cfg.requireAuth = _prefs.getBool("req_id", true);
    cfg.requireApproval = _prefs.getBool("req_ap", false);
    return cfg;
}

bool StorageManager::saveConfig(const StationConfig& cfg) {
    _prefs.putString("cid", cfg.clientId);
    _prefs.putString("sec", cfg.clientSecret);
    _prefs.putString("name", cfg.name);
    _prefs.putBool("req_id", cfg.requireAuth);
    _prefs.putBool("req_ap", cfg.requireApproval);
    _prefs.putBool("ok", true);
    return true;
}

void StorageManager::clearConfig() {
    _prefs.remove("ok");
    _prefs.remove("cid");
    _prefs.remove("sec");
    _prefs.remove("name");
    _prefs.remove("req_id");
    _prefs.remove("req_ap");
}

String StorageManager::getWifiSsid() {
    return _prefs.getString("w_ssid", DEFAULT_WIFI_SSID);
}

String StorageManager::getWifiPassword() {
    return _prefs.getString("w_pass", DEFAULT_WIFI_PASSWORD);
}

String StorageManager::getApiUrl() {
    return _prefs.getString("api_url", DEFAULT_API_BASE_URL);
}

void StorageManager::setWifi(const String& ssid, const String& password) {
    _prefs.putString("w_ssid", ssid);
    _prefs.putString("w_pass", password);
}

void StorageManager::setApiUrl(const String& url) {
    _prefs.putString("api_url", url);
}

void StorageManager::factoryReset() {
    _prefs.clear();
}
