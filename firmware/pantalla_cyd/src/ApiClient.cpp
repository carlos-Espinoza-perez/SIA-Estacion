#include "ApiClient.h"
#include "Config.h"
#include "LvglManager.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <lwip/dns.h>
#include <esp_task_wdt.h>

ApiClient Api;

static uint32_t lastWifiAttempt = 0;
static WiFiClientSecure globalSecureClient;
static WiFiClient globalPlainClient;

static bool sendHttpRequest(HTTPClient& http, const String& url, const char* method,
                            const String& body, const String& token, int timeoutMs,
                            int& outCode, String& outPayload) {
    bool isHttps = url.startsWith("https://");

    Serial.printf("[HTTP] %s %s (RAM libre: %d KB)\n",
                  method, url.c_str(), ESP.getFreeHeap() / 1024);

    if (isHttps) {
        if (ESP.getMaxAllocHeap() < 16384) {
            Serial.printf("[HTTP] ADVERTENCIA: Bloque maximo de RAM insuficiente para TLS (%u bytes < 16KB). Omitiendo peticion para evitar crash.\n",
                          (unsigned int)ESP.getMaxAllocHeap());
            return false;
        }
        globalSecureClient.setInsecure();
        globalSecureClient.setHandshakeTimeout(8);
        if (!http.begin(globalSecureClient, url)) {
            Serial.println("[HTTP] Error en http.begin(globalSecureClient)");
            return false;
        }
    } else {
        if (!http.begin(globalPlainClient, url)) {
            Serial.println("[HTTP] Error en http.begin(globalPlainClient)");
            return false;
        }
    }

    http.setTimeout(timeoutMs);
    http.setConnectTimeout(timeoutMs);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Connection", "close");
    if (token.length() > 0) {
        http.addHeader("Authorization", "Bearer " + token);
    }

    esp_task_wdt_reset();
    uint32_t t0 = millis();
    if (strcmp(method, "POST") == 0) {
        outCode = http.POST(body);
    } else {
        outCode = http.GET();
    }
    esp_task_wdt_reset();
    uint32_t elapsed = millis() - t0;

    Serial.printf("[HTTP] Respuesta %d en %d ms (RAM libre: %d KB | BloqueMax: %d KB)\n",
                  outCode, (int)elapsed, ESP.getFreeHeap() / 1024, ESP.getMaxAllocHeap() / 1024);

    if (outCode > 0 && outCode != 204 && outCode != 304) {
        esp_task_wdt_reset();
        outPayload = http.getString();
        esp_task_wdt_reset();
    }
    http.end();
    if (isHttps) globalSecureClient.stop();
    else globalPlainClient.stop();

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
        if (Lvgl.isActive()) {
            Lvgl.update();
        }
        esp_task_wdt_reset();
        delay(20);
    }

    if (isConnected()) {
        ip_addr_t dns0, dns1;
        ipaddr_aton("8.8.8.8", &dns0);
        ipaddr_aton("1.1.1.1", &dns1);
        dns_setserver(0, &dns0);
        dns_setserver(1, &dns1);

        Serial.printf("[WiFi] Conectado. IP: %s | Gateway: %s | DNS Primario: %s | DNS Secundario: %s | RSSI: %d dBm\n",
                      WiFi.localIP().toString().c_str(),
                      WiFi.gatewayIP().toString().c_str(),
                      WiFi.dnsIP(0).toString().c_str(),
                      WiFi.dnsIP(1).toString().c_str(),
                      WiFi.RSSI());

        Serial.printf("[API] Destino base: %s\n", Storage.getApiUrl().c_str());
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
        DeserializationError err = deserializeJson(doc, payload);
        if (!err && !doc["datos"].isNull()) {
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
        Serial.printf("[API] Error deserializando payload de vinculacion: %s\n", err.c_str());
        return PollStatus::Error;
    }

    return (code == 204) ? PollStatus::Timeout : PollStatus::Error;
}

bool ApiClient::authenticate(const String& clientId, const String& clientSecret) {
    if (!isConnected() && !connectWifi()) {
        return false;
    }

    Serial.printf("[AUTH] Solicitando token JWT para ClientId '%s'... (RAM libre: %d KB)\n",
                  clientId.c_str(), ESP.getFreeHeap() / 1024);

    String url = buildUrl("/api/connect/token");
    JsonDocument req;
    req["clientId"] = clientId;
    req["clientSecret"] = clientSecret;
    String body;
    serializeJson(req, body);

    HTTPClient http;
    int code = -1;
    String payload;

    if (!sendHttpRequest(http, url, "POST", body, "", 5000, code, payload)) {
        Serial.printf("[AUTH] Fallo de comunicacion con /api/connect/token (code=%d)\n", code);
        return false;
    }

    if (code == 200) {
        JsonDocument res;
        DeserializationError err = deserializeJson(res, payload);
        if (!err && !res["datos"].isNull()) {
            _token = res["datos"]["accessToken"].as<String>();
            _tokenTime = millis();
            Serial.printf("[AUTH] Token JWT obtenido con exito (longitud %d) | RAM restante: %d KB\n",
                          _token.length(), ESP.getFreeHeap() / 1024);
            return true;
        }
        Serial.printf("[AUTH] Error deserializando respuesta: %s\n", err.c_str());
    } else {
        Serial.printf("[AUTH] Servidor rechazo autenticacion: HTTP %d | Payload: %s\n",
                      code, payload.c_str());
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
                               const String& operationType, AccessResult& result,
                               const String& imageBase64) {
    StationConfig cfg = Storage.getConfig();
    if (!hasToken() && !authenticate(cfg.clientId, cfg.clientSecret)) {
        result.authorized = false;
        result.message = "Sin sesion con el servidor";
        return false;
    }

    String url = buildUrl("/api/estacion-api/validar");
    JsonDocument doc;
    String cleanCode = personCode;
    cleanCode.trim();
    if (cleanCode.indexOf('?') >= 0) cleanCode = cleanCode.substring(0, cleanCode.indexOf('?'));
    if (cleanCode.indexOf('#') >= 0) cleanCode = cleanCode.substring(0, cleanCode.indexOf('#'));
    cleanCode.trim();
    int lastSlash = cleanCode.lastIndexOf('/');
    if (lastSlash >= 0 && lastSlash < (int)cleanCode.length() - 1) {
        cleanCode = cleanCode.substring(lastSlash + 1);
        cleanCode.trim();
    }
    if (cleanCode.length() == 0) cleanCode = "CAM_USER";

    // La direccion (Ingreso/Egreso) ya no la decide la estacion: el backend la calcula
    // dinamicamente segun el ultimo acceso concedido de la persona y la devuelve en la respuesta.
    doc["codigoEscaneado"] = cleanCode;
    doc["tipoOperacion"] = operationType.length() > 0 ? operationType : "ACCESO";
    if (imageBase64.length() > 0) {
        doc["imagen"] = imageBase64;
    }

    String body;
    serializeJson(doc, body);
    doc.clear(); // Liberar memoria JsonDocument de inmediato

    HTTPClient http;
    int code = -1;
    String payload;

    Serial.printf("[VALIDAR] >> Enviando a API: Codigo='%s', Imagen=%s (%d bytes Base64)\n",
                  cleanCode.c_str(), imageBase64.length() > 0 ? "SI" : "NO", (int)imageBase64.length());
    Serial.printf("[VALIDAR] RAM libre: %u KB | BloqueMax: %u KB | Payload total: %u bytes\n",
                  ESP.getFreeHeap() / 1024, ESP.getMaxAllocHeap() / 1024, (unsigned int)body.length());

    if (!sendHttpRequest(http, url, "POST", body, _token, 15000, code, payload)) {
        Serial.printf("[VALIDAR] << Fallo sendHttpRequest (code=%d)\n", code);
        result.authorized = false;
        result.message = "Error de conexion con el servidor";
        return false;
    }

    Serial.printf("[VALIDAR] << Servidor respondio HTTP %d | Payload: %s\n", code, payload.c_str());

    if (code == 200) {
        JsonDocument res;
        DeserializationError err = deserializeJson(res, payload);
        if (!err && !res["datos"].isNull()) {
            JsonObject data = res["datos"];
            String resStr = data["resultado"].as<String>();
            result.authorized = (resStr == "Concedido" || resStr == "Acceso Permitido");
            result.isAdmin = data["esAdmin"].as<bool>() || (data["rol"].as<String>() == "Admin") || (resStr == "Admin") || (data["tipo"].as<String>() == "ADMIN");
            result.personName = data["nombrePersona"].as<String>();
            result.message = data["mensaje"].as<String>();
            result.itemName = itemCode;
            result.direction = (data["direccion"].as<String>() == "Egreso") ? "Egreso" : "Ingreso";
            Serial.printf("[VALIDAR] Exito: Autorizado=%d, Direccion=%s, Persona='%s', Mensaje='%s', Admin=%d\n",
                          result.authorized, result.direction.c_str(), result.personName.c_str(), result.message.c_str(), result.isAdmin);
            return true;
        } else {
            Serial.printf("[VALIDAR] Error deserializando JSON de respuesta: %s\n", err.c_str());
        }
    } else {
        // Extraer mensaje especifico del servidor de Azure (ej. 400, 401, 403, 404, etc.)
        JsonDocument res;
        DeserializationError err = deserializeJson(res, payload);
        if (!err) {
            if (!res["mensaje"].isNull()) {
                result.message = res["mensaje"].as<String>();
            } else if (!res["datos"].isNull() && !res["datos"]["mensaje"].isNull()) {
                result.message = res["datos"]["mensaje"].as<String>();
            } else {
                result.message = "Acceso Denegado (HTTP " + String(code) + ")";
            }
        } else {
            result.message = "Acceso Denegado (HTTP " + String(code) + ")";
        }
        Serial.printf("[VALIDAR] Rechazado por servidor: HTTP %d | Motivo: '%s'\n", code, result.message.c_str());
    }

    result.authorized = false;
    return false;
}
