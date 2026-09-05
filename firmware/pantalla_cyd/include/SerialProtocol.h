#pragma once

#include <Arduino.h>
#include "Config.h"

enum class CommandType {
    UNKNOWN,
    BOOT,
    ESPERANDO,
    PROCESANDO,
    CONCEDIDO,
    DENEGADO,
    ESPERANDO_APROBACION,
    OFFLINE,
    ERROR,
    VINCULAR,
    SIN_CONFIGURAR,
    VINCULADA,
    IDENTIDAD_DETECTADA,
    ESCANEA_CARNET,
    AHORA_ESCANEA_ITEM,
    ITEM_AGREGADO,
    ITEM_RESUMEN,
    VALIDANDO,
    PRESTAMO_COMPLETADO,
    PRESTAMO_RECHAZADO,
    SIN_RED,
    FUERA_SERVICIO,
    ADMIN_DETECTADO,
    ADMIN_PANEL,
    ADMIN_SYNC
};

struct ParsedCommand {
    CommandType type;
    char param1[48];
    char param2[48];
};

class SerialProtocol {
public:
    SerialProtocol();

    // Inicializa UART2 (enlace físico) y opcionalmente monitorea Serial0 (USB)
    void init(uint32_t baud = SERIAL_BAUD);

    // Sondeo no bloqueante; retorna true si se procesó una trama EST: completa
    bool poll(ParsedCommand& outCmd);

private:
    char _buffer[SERIAL_BUF_SIZE];
    size_t _bufIndex;
    uint32_t _lastByteTime;

    bool processLine(char* line, ParsedCommand& outCmd);
};
