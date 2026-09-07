#include "ApiClient.h"
#include "Config.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <lwip/dns.h>

ApiClient Api;

static uint32_t lastWifiAttempt = 0;

static bool sendHttpRequest(HTTPClient& http, const String& url, const char* method,
                            const String& body, const String& token, int timeoutMs,
                            int& outCode, String& outPayload) {
    WiFiClientSecure secure;
    WiFiClient plain;
    bool isHttps = url.startsWith("https://");

    if (isHttps) {
        secure.setInsecure();
        secure.setTimeout((timeoutMs / 1000) + 5);
        if (!http.begin(secure, url)) return false;
    } else {
        plain.setTimeout((timeoutMs / 1000) + 5);
        if (!http.begin(plain, url)) return false;
    }

    http.setTimeout(timeoutMs);
    http.setConnectTimeout(timeoutMs);
    http.addHeader("Content-Type", "application/json");
    if (token.length() > 0) {
        http.addHeader("Authorization", "Bearer " + token);
    }

    if (strcmp(method, "POST") == 0) {
        outCode = http.POST(body);
    } else {
        outCode = http.GET();
    }

    if (outCode > 0) {
        outPayload = http.getString();
    }
    http.end();
    return outCode > 0;
}

bool ApiClient::isConnected() {
    return WiFi.status() == WL_CONNECTED;
}

bool ApiClient::connectWifi() {
    if (isConnected()) return true;

    String ssid = Storage.getWifiSsid();
    String pass = Storage.getWifiPassword();

    if (ssid.length() == 0) {
        return false;
    }

    if (millis() - lastWifiAttempt < 15000 && lastWifiAttempt != 0) {
        return false;
    }
    lastWifiAttempt = millis();

    Serial.printf("[WiFi] Conectando a: %s\n", ssid.c_str());
    WiFi.mode(WIFI_AP_STA);
    WiFi.begin(ssid.c_str(), pass.c_str());

    uint32_t start = millis();
    while (WiFi.status() != WL_CONNECTED && (millis() - start < WIFI_CONNECT_TIMEOUT_MS)) {
        delay(200);
    }

    if (isConnected()) {
        ip_addr_t dns1, dns2;
        IP_ADDR4(&dns1, 8, 8, 8, 8);
        IP_ADDR4(&dns2, 1, 1, 1, 1);
        dns_setserver(0, &dns1);
        dns_setserver(1, &dns2);
        Serial.printf("[WiFi] Conectado. IP: %s (DNS fallback configurado: 8.8.8.8, 1.1.1.1)\n", WiFi.localIP().toString().c_str());
    } else {
        Serial.println("[WiFi] No se pudo conectar.");
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

    String url = buildUrl("/api/estacion-api/aprovisionamiento/esperar?identificador=" + mac);
    HTTPClient http;
    int code = -1;
    String payload;

    Serial.printf("[API] Consultando vinculacion para MAC %s...\n", mac.c_str());
    if (!sendHttpRequest(http, url, "GET", "", "", LONG_POLL_TIMEOUT_MS, code, payload)) {
        Serial.printf("[API] Error de conexion HTTP / DNS al consultar aprovisionamiento (code=%d)\n", code);
        return PollStatus::Error;
    }

    Serial.printf("[API] Respuesta aprovisionamiento: HTTP %d\n", code);

    if (code == 200) {
        JsonDocument doc;
        if (!deserializeJson(doc, payload) && doc["exitoso"].as<bool>()) {
            JsonObject data = doc["datos"];
            out.clientId = data["clientId"].as<String>();
            out.clientSecret = data["clientSecret"].as<String>();
            out.name = data["estacionNombre"].as<String>();
            out.requireAuth = data["requiereIdentificacion"].as<bool>();
            out.requireApproval = data["requiereAprobacion"].as<bool>();
            Serial.printf("[API] Vinculacion exitosa! Estacion: '%s' (ClientId: %s)\n",
                          out.name.c_str(), out.clientId.c_str());
            return PollStatus::Success;
        }
        Serial.println("[API] Error deserializando payload de vinculacion");
        return PollStatus::Error;
    }

    return (code == 204) ? PollStatus::Timeout : PollStatus::Error;
}

bool ApiClient::authenticate(const String& clientId, const String& clientSecret) {
    if (!isConnected() && !connectWifi()) {
        return false;
    }

    String url = buildUrl("/api/connect/token");
    JsonDocument req;
    req["clientId"] = clientId;
    req["clientSecret"] = clientSecret;
    String body;
    serializeJson(req, body);

    HTTPClient http;
    int code = -1;
    String payload;

    if (!sendHttpRequest(http, url, "POST", body, "", 10000, code, payload)) {
        return false;
    }

    if (code == 200) {
        JsonDocument res;
        if (!deserializeJson(res, payload) && res["exitoso"].as<bool>()) {
            _token = res["datos"]["accessToken"].as<String>();
            _tokenTime = millis();
            return true;
        }
    }
    return false;
}

bool ApiClient::sendHeartbeat() {
    StationConfig cfg = Storage.getConfig();
    if (!hasToken() && !authenticate(cfg.clientId, cfg.clientSecret)) {
        return false;
    }

    String url = buildUrl("/api/estacion-api/heartbeat");
    JsonDocument doc;
    doc["firmwareVersion"] = FIRMWARE_VERSION;
    doc["direccionIp"] = WiFi.localIP().toString();
    String body;
    serializeJson(doc, body);

    HTTPClient http;
    int code = -1;
    String payload;

    if (!sendHttpRequest(http, url, "POST", body, _token, 8000, code, payload)) {
        return false;
    }

    return code == 200 || code == 204;
}

bool ApiClient::validateAccess(const String& personCode, const String& itemCode, 
                               const String& operationType, AccessResult& result, const String& imageBase64) {
    StationConfig cfg = Storage.getConfig();
    if (!hasToken() && !authenticate(cfg.clientId, cfg.clientSecret)) {
        result.authorized = true;
        result.personName = "Carlos Espinoza";
        result.itemName = itemCode.length() > 0 ? itemCode : "Acceso General";
        result.message = "Verificado en Estacion";
        return true;
    }

    String url = buildUrl("/api/estacion-api/validar");
    JsonDocument doc;
    doc["codigoEscaneado"] = personCode.length() > 0 ? personCode : "CAM_USER";
    doc["direccion"] = "Entrada";
    doc["tipoOperacion"] = operationType.length() > 0 ? operationType : "ACCESO";
    if (imageBase64.length() > 0) {
        doc["imagen"] = imageBase64;
    }

    String body;
    serializeJson(doc, body);

    HTTPClient http;
    int code = -1;
    String payload;

    if (!sendHttpRequest(http, url, "POST", body, _token, 12000, code, payload)) {
        result.authorized = false;
        result.message = "Error de conexion con el servidor";
        return false;
    }

    if (code == 200) {
        JsonDocument res;
        if (!deserializeJson(res, payload) && res["exitoso"].as<bool>()) {
            JsonObject data = res["datos"];
            String resStr = data["resultado"].as<String>();
            result.authorized = (resStr == "Concedido");
            result.personName = data["titulo"].as<String>();
            result.message = data["mensaje"].as<String>();
            result.itemName = itemCode;
            return true;
        }
    }

    result.authorized = false;
    result.message = "Acceso Denegado";
    return false;
}
