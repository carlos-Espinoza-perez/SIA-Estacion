#include "OfflineManager.h"
#include <SPIFFS.h>
#include <ArduinoJson.h>
#include <time.h>

OfflineManager Offline;

static const char* CODIGOS_PATH = "/codigos.json";
static const char* PENDIENTES_PATH = "/pendientes.json";
static const char* DIRECCIONES_PATH = "/direcciones.json";
static const int MAX_PENDIENTES = 300;      // limite defensivo de la cola offline
static const int MAX_CODIGOS_DIRECCION = 300; // limite de codigos con memoria de direccion

void OfflineManager::begin() {
    _spiffsOk = SPIFFS.begin(true); // formatea si el sistema de archivos no existe aun
    if (!_spiffsOk) {
        Serial.println("[OFFLINE] Error montando SPIFFS. El modo sin conexion quedara deshabilitado.");
        return;
    }
    Serial.printf("[OFFLINE] SPIFFS listo. Usado: %u/%u KB\n",
                  (unsigned int)(SPIFFS.usedBytes() / 1024), (unsigned int)(SPIFFS.totalBytes() / 1024));
}

String OfflineManager::nowIso8601Utc() {
    time_t now = time(nullptr);
    if (now < 1700000000) { // reloj no sincronizado aun (antes de ~2023)
        return "0001-01-01T00:00:00Z";
    }
    struct tm tmInfo;
    gmtime_r(&now, &tmInfo);
    char buf[25];
    strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &tmInfo);
    return String(buf);
}

String OfflineManager::nuevoIdEvento() {
    uint8_t b[16];
    for (int i = 0; i < 16; i += 4) {
        uint32_t r = esp_random();
        memcpy(&b[i], &r, 4);
    }
    char buf[37];
    snprintf(buf, sizeof(buf),
              "%02x%02x%02x%02x-%02x%02x-%02x%02x-%02x%02x-%02x%02x%02x%02x%02x%02x",
              b[0], b[1], b[2], b[3], b[4], b[5], b[6], b[7],
              b[8], b[9], b[10], b[11], b[12], b[13], b[14], b[15]);
    return String(buf);
}

// ------------------------- Copia local de codigos validos -------------------------

bool OfflineManager::actualizarCodigosDesdeJson(const String& jsonArray) {
    if (!_spiffsOk) return false;

    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, jsonArray);
    if (err) {
        Serial.printf("[OFFLINE] Error parseando codigos de sincronizacion: %s\n", err.c_str());
        return false;
    }

    JsonDocument out;
    out["ts"] = nowIso8601Utc();
    JsonArray codigos = out["codigos"].to<JsonArray>();
    JsonArray origen = doc["codigos"].as<JsonArray>();
    for (JsonVariant v : origen) {
        codigos.add(v.as<String>());
    }

    File f = SPIFFS.open(CODIGOS_PATH, FILE_WRITE);
    if (!f) {
        Serial.println("[OFFLINE] No se pudo abrir codigos.json para escritura.");
        return false;
    }
    serializeJson(out, f);
    f.close();

    Serial.printf("[OFFLINE] Copia local actualizada: %u codigos\n", (unsigned int)codigos.size());
    return true;
}

bool OfflineManager::tieneCopiaLocal() {
    return _spiffsOk && SPIFFS.exists(CODIGOS_PATH);
}

String OfflineManager::obtenerUltimaSincronizacionCodigos() {
    if (!tieneCopiaLocal()) return "Nunca";

    File f = SPIFFS.open(CODIGOS_PATH, FILE_READ);
    if (!f) return "Nunca";

    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, f);
    f.close();
    if (err) return "Nunca";

    return doc["ts"].as<String>();
}

bool OfflineManager::codigoValidoLocal(const String& codigo) {
    if (!tieneCopiaLocal()) return false;

    File f = SPIFFS.open(CODIGOS_PATH, FILE_READ);
    if (!f) return false;

    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, f);
    f.close();
    if (err) return false;

    JsonArray codigos = doc["codigos"].as<JsonArray>();
    for (JsonVariant v : codigos) {
        if (v.as<String>() == codigo) return true;
    }
    return false;
}

// ------------------------- Direccion local (Ingreso/Egreso) -------------------------

String OfflineManager::determinarDireccionLocal(const String& codigo) {
    JsonDocument doc;
    if (_spiffsOk && SPIFFS.exists(DIRECCIONES_PATH)) {
        File f = SPIFFS.open(DIRECCIONES_PATH, FILE_READ);
        if (f) {
            DeserializationError err = deserializeJson(doc, f);
            f.close();
            if (err) doc.clear();
        }
    }

    JsonObject mapa = doc["mapa"].is<JsonObject>() ? doc["mapa"].as<JsonObject>() : doc["mapa"].to<JsonObject>();

    String ultima = mapa[codigo] | "Egreso"; // si no hay registro previo, el primer acceso sera "Ingreso"
    String nueva = (ultima == "Ingreso") ? "Egreso" : "Ingreso";

    if ((int)mapa.size() >= MAX_CODIGOS_DIRECCION && mapa[codigo].isNull()) {
        // Limite alcanzado con un codigo nuevo: se reinicia la memoria para no crecer sin control.
        doc.clear();
        mapa = doc["mapa"].to<JsonObject>();
    }
    mapa[codigo] = nueva;

    if (_spiffsOk) {
        File f = SPIFFS.open(DIRECCIONES_PATH, FILE_WRITE);
        if (f) {
            serializeJson(doc, f);
            f.close();
        }
    }

    return nueva;
}

// ------------------------- Cola de eventos pendientes -------------------------

void OfflineManager::encolarEvento(const String& codigo, const String& direccion, const String& resultado) {
    if (!_spiffsOk) return;

    JsonDocument doc;
    if (SPIFFS.exists(PENDIENTES_PATH)) {
        File f = SPIFFS.open(PENDIENTES_PATH, FILE_READ);
        if (f) {
            DeserializationError err = deserializeJson(doc, f);
            f.close();
            if (err) doc.clear();
        }
    }

    JsonArray eventos = doc["eventos"].is<JsonArray>() ? doc["eventos"].as<JsonArray>() : doc["eventos"].to<JsonArray>();

    if ((int)eventos.size() >= MAX_PENDIENTES) {
        eventos.remove(0); // descarta el mas antiguo para no crecer sin limite
        Serial.println("[OFFLINE] Cola de pendientes llena, se descarta el evento mas antiguo.");
    }

    JsonObject evento = eventos.add<JsonObject>();
    evento["id"] = nuevoIdEvento();
    evento["codigo"] = codigo;
    evento["direccion"] = direccion;
    evento["resultado"] = resultado;
    evento["fecha"] = nowIso8601Utc();

    File f = SPIFFS.open(PENDIENTES_PATH, FILE_WRITE);
    if (f) {
        serializeJson(doc, f);
        f.close();
    }

    Serial.printf("[OFFLINE] Evento encolado (%s, %s). Pendientes: %u\n",
                  direccion.c_str(), resultado.c_str(), (unsigned int)eventos.size());
}

int OfflineManager::contarPendientes() {
    if (!_spiffsOk || !SPIFFS.exists(PENDIENTES_PATH)) return 0;

    File f = SPIFFS.open(PENDIENTES_PATH, FILE_READ);
    if (!f) return 0;

    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, f);
    f.close();
    if (err) return 0;

    return doc["eventos"].as<JsonArray>().size();
}

String OfflineManager::obtenerUltimaSincronizacionEventos() {
    if (!_spiffsOk || !SPIFFS.exists(PENDIENTES_PATH)) return "Sin datos";

    File f = SPIFFS.open(PENDIENTES_PATH, FILE_READ);
    if (!f) return "Sin datos";

    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, f);
    f.close();
    if (err) return "Sin datos";

    return doc["ultimaSync"] | "Nunca";
}

String OfflineManager::construirLoteJson() {
    if (!_spiffsOk || !SPIFFS.exists(PENDIENTES_PATH)) return "";

    File f = SPIFFS.open(PENDIENTES_PATH, FILE_READ);
    if (!f) return "";

    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, f);
    f.close();
    if (err) return "";

    JsonArray eventos = doc["eventos"].as<JsonArray>();
    if (eventos.size() == 0) return "";

    JsonDocument out;
    JsonArray outEventos = out["eventos"].to<JsonArray>();
    for (JsonObject ev : eventos) {
        JsonObject o = outEventos.add<JsonObject>();
        o["idEvento"] = ev["id"];
        o["codigoEscaneado"] = ev["codigo"];
        o["direccion"] = ev["direccion"];
        o["resultado"] = ev["resultado"];
        o["fechaHoraLocal"] = ev["fecha"];
    }

    String body;
    serializeJson(out, body);
    return body;
}

void OfflineManager::marcarPendientesSincronizados() {
    if (!_spiffsOk) return;

    JsonDocument doc;
    doc["eventos"].to<JsonArray>();
    doc["ultimaSync"] = nowIso8601Utc();

    File f = SPIFFS.open(PENDIENTES_PATH, FILE_WRITE);
    if (f) {
        serializeJson(doc, f);
        f.close();
    }
    Serial.println("[OFFLINE] Lote sincronizado con exito. Cola local vaciada.");
}

void OfflineManager::limpiarPendientes() {
    if (!_spiffsOk) return;
    SPIFFS.remove(PENDIENTES_PATH);
    Serial.println("[OFFLINE] Cola de pendientes limpiada manualmente desde el panel admin.");
}
