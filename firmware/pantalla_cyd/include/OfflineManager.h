#pragma once

#include <Arduino.h>

// Gestiona el modo sin conexion de la estacion:
//  - Cachea localmente (SPIFFS) la lista de codigos QR validos de la empresa,
//    descargada de /api/estacion-api/sync/codigos mientras hay conexion.
//  - Encola eventos de acceso resueltos localmente mientras no hay conexion.
//  - Sube el lote acumulado a /api/estacion-api/sync/eventos al recuperar la red.
class OfflineManager {
public:
    void begin();

    // Copia local de codigos validos (para validar QR sin depender del servidor)
    bool actualizarCodigosDesdeJson(const String& jsonArray);
    bool codigoValidoLocal(const String& codigo);
    bool tieneCopiaLocal();
    String obtenerUltimaSincronizacionCodigos();

    // Cola de eventos pendientes de sincronizar
    // Devuelve "Ingreso" o "Egreso" alternando localmente segun el ultimo evento
    // concedido de ese codigo (aproximacion sin servidor).
    String determinarDireccionLocal(const String& codigo);
    void encolarEvento(const String& codigo, const String& direccion, const String& resultado);
    int contarPendientes();
    String obtenerUltimaSincronizacionEventos();

    // Construye el cuerpo JSON (LoteEventosRequest) con los eventos pendientes.
    // Devuelve cadena vacia si no hay nada pendiente.
    String construirLoteJson();
    // Llamar tras subir exitosamente el lote devuelto por construirLoteJson().
    void marcarPendientesSincronizados();
    // Vacía la cola local sin sincronizar (accion manual desde el panel admin).
    void limpiarPendientes();

private:
    bool _spiffsOk = false;

    String nowIso8601Utc();
    String nuevoIdEvento();
};

extern OfflineManager Offline;
