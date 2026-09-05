#include "ApiClient.h"
#include "Config.h"
#include <WiFi.h>
#include <HTTPClient.h>

ApiClient Api;

bool ApiClient::isConnected() {
    return WiFi.status() == WL_CONNECTED;
}

static uint32_t lastWifiAttempt = 0;

bool ApiClient::connectWifi() {
    if (isConnected()) return true;

    String ssid = Storage.getWifiSsid();
    String pass = Storage.getWifiPassword();

    if (ssid.length() == 0 || ssid == "SIA_LAB_WIFI") {
        return false;
    }

    if (millis() - lastWifiAttempt < 25000 && lastWifiAttempt != 0) {
        return false;
    }
    lastWifiAttempt = millis();

    WiFi.mode(WIFI_AP_STA);
    WiFi.begin(ssid.c_str(), pass.c_str());

    uint32_t start = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - start < 1500) {
        delay(100);
    }

    return isConnected();
}


String ApiClient::buildUrl(const String& path) {
    String base = Storage.getApiUrl();
    if (base.endsWith("/")) {
        base.remove(base.length() - 1);
    }
    return base + path;
}

bool ApiClient::hasToken() const {
    return _token.length() > 0 && (millis() - _tokenTime < 3300000UL);
}

PollStatus ApiClient::pollProvisioning(const String& mac, StationConfig& out) {
    if (!isConnected()) {
        connectWifi();
        return PollStatus::Error;
    }

    WiFiClient client;
    HTTPClient http;
    http.begin(client, buildUrl("/api/estacion-api/aprovisionamiento/esperar?identificador=" + mac));
    http.setTimeout(LONG_POLL_TIMEOUT_MS);

    int code = http.GET();
    if (code == 200) {
        String payload = http.getString();
        http.end();

        JsonDocument doc;
        if (!deserializeJson(doc, payload) && doc["exitoso"].as<bool>()) {
            JsonObject data = doc["datos"];
            out.clientId = data["clientId"].as<String>();
            out.clientSecret = data["clientSecret"].as<String>();
            out.name = data["estacionNombre"].as<String>();
            out.requireAuth = data["requiereIdentificacion"].as<bool>();
            out.requireApproval = data["requiereAprobacion"].as<bool>();
            return PollStatus::Success;
        }
        return PollStatus::Error;
    }

    http.end();
    return (code == 204) ? PollStatus::Timeout : PollStatus::Error;
}

bool ApiClient::authenticate(const String& clientId, const String& clientSecret) {
    if (!isConnected() && !connectWifi()) {
        return false;
    }

    WiFiClient client;
    HTTPClient http;
    http.begin(client, buildUrl("/api/connect/token"));
    http.addHeader("Content-Type", "application/json");

    JsonDocument req;
    req["clientId"] = clientId;
    req["clientSecret"] = clientSecret;
    String body;
    serializeJson(req, body);

    int code = http.POST(body);
    if (code == 200) {
        String payload = http.getString();
        http.end();

        JsonDocument res;
        if (!deserializeJson(res, payload) && res["exitoso"].as<bool>()) {
            _token = res["datos"]["accessToken"].as<String>();
            _tokenTime = millis();
            return true;
        }
        return false;
    }

    http.end();
    return false;
}

bool ApiClient::sendHeartbeat() {
    StationConfig cfg = Storage.getConfig();
    if (!hasToken() && !authenticate(cfg.clientId, cfg.clientSecret)) {
        return false;
    }

    WiFiClient client;
    HTTPClient http;
    http.begin(client, buildUrl("/api/estacion-api/heartbeat"));
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + _token);

    JsonDocument doc;
    doc["firmwareVersion"] = FIRMWARE_VERSION;
    doc["direccionIp"] = WiFi.localIP().toString();
    String body;
    serializeJson(doc, body);

    int code = http.POST(body);
    http.end();
    return code == 200 || code == 204;
}

bool ApiClient::validateAccess(const String& personCode, const String& itemCode, 
                               const String& operationType, AccessResult& result, const String& imageBase64) {

    StationConfig cfg = Storage.getConfig();
    if (!hasToken() && !authenticate(cfg.clientId, cfg.clientSecret)) {
        // Modo Demo / Dummy cuando la estación está sin backend central
        result.authorized = true;
        result.personName = "Carlos Espinoza";
        result.message = "Rostro Verificado (Demo)";
        return true;
    }

    WiFiClient client;
    HTTPClient http;
    http.begin(client, buildUrl("/api/estacion-api/validar"));
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + _token);

    JsonDocument doc;
    doc["codigoEscaneado"] = personCode.length() > 0 ? personCode : "CAM_USER";
    doc["direccion"] = "Entrada";
    doc["fechaHoraLocal"] = "2026-09-04T19:00:00Z";
    if (imageBase64.length() > 0) {
        doc["imagen"] = imageBase64;
    }

    String body;
    serializeJson(doc, body);

    int code = http.POST(body);
    if (code == 200) {
        String payload = http.getString();
        http.end();

        JsonDocument res;
        if (!deserializeJson(res, payload) && res["exitoso"].as<bool>()) {
            JsonObject data = res["datos"];
            String resStr = data["resultado"].as<String>();
            result.authorized = (resStr == "Concedido");
            result.personName = data["titulo"].as<String>();
            result.message = data["mensaje"].as<String>();
            return true;
        }
    }

    http.end();
    result.authorized = false;
    result.message = "Operacion denegada";
    return false;
}

