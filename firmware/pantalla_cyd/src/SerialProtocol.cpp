#include "SerialProtocol.h"
#include <string.h>

SerialProtocol::SerialProtocol() : _bufIndex(0), _lastByteTime(0) {
    _buffer[0] = '\0';
}

void SerialProtocol::init(uint32_t baud) {
    // Puerto de depuración USB
    Serial.begin(baud);
    
    // UART2 para comunicación física punto a punto con ESP32 Principal
    Serial2.begin(baud, SERIAL_8N1, UART2_RX_PIN, UART2_TX_PIN);
    
    Serial.println(F("[SIA CYD] Serial Protocol Inicializado (115200 baud)."));
}

bool SerialProtocol::poll(ParsedCommand& outCmd) {
    // Descarte por timeout si hay bytes residuales sin terminar en \n
    if (_bufIndex > 0 && (millis() - _lastByteTime > SERIAL_TIMEOUT_MS)) {
        _bufIndex = 0;
        _buffer[0] = '\0';
    }

    // Leemos de UART2 o de Serial (USB para pruebas interactivas)
    HardwareSerial* ports[] = { &Serial2, &Serial };

    for (auto* port : ports) {
        while (port->available() > 0) {
            char c = (char)port->read();
            _lastByteTime = millis();

            if (c == '\r') {
                continue; // Ignorar retornos de carro
            }

            if (c == '\n') {
                _buffer[_bufIndex] = '\0';
                bool success = processLine(_buffer, outCmd);
                _bufIndex = 0;
                _buffer[0] = '\0';
                if (success) {
                    return true;
                }
            } else {
                if (_bufIndex < (SERIAL_BUF_SIZE - 1)) {
                    _buffer[_bufIndex++] = c;
                } else {
                    // Buffer saturado sin delimitador: reset
                    _bufIndex = 0;
                    _buffer[0] = '\0';
                }
            }
        }
    }

    return false;
}

bool SerialProtocol::processLine(char* line, ParsedCommand& outCmd) {
    // Robustez mínima especificada en Notion:
    // "el CYD descarta cualquier línea que no empiece con EST:"
    if (strncmp(line, "EST:", 4) != 0) {
        return false;
    }

    outCmd.type = CommandType::UNKNOWN;
    outCmd.param1[0] = '\0';
    outCmd.param2[0] = '\0';

    char* savePtr = nullptr;
    char* token = strtok_r(line + 4, ":", &savePtr);
    if (token == nullptr) {
        return false;
    }

    // Identificación del comando
    if (strcmp(token, "BOOT") == 0)                     outCmd.type = CommandType::BOOT;
    else if (strcmp(token, "ESPERANDO") == 0)            outCmd.type = CommandType::ESPERANDO;
    else if (strcmp(token, "PROCESANDO") == 0)           outCmd.type = CommandType::PROCESANDO;
    else if (strcmp(token, "CONCEDIDO") == 0)            outCmd.type = CommandType::CONCEDIDO;
    else if (strcmp(token, "DENEGADO") == 0)             outCmd.type = CommandType::DENEGADO;
    else if (strcmp(token, "ESPERANDO_APROBACION") == 0) outCmd.type = CommandType::ESPERANDO_APROBACION;
    else if (strcmp(token, "OFFLINE") == 0)              outCmd.type = CommandType::OFFLINE;
    else if (strcmp(token, "ERROR") == 0)                outCmd.type = CommandType::ERROR;
    else if (strcmp(token, "VINCULAR") == 0)             outCmd.type = CommandType::VINCULAR;
    else if (strcmp(token, "SIN_CONFIGURAR") == 0)       outCmd.type = CommandType::SIN_CONFIGURAR;
    else if (strcmp(token, "VINCULADA") == 0)            outCmd.type = CommandType::VINCULADA;
    else if (strcmp(token, "IDENTIDAD_DETECTADA") == 0)  outCmd.type = CommandType::IDENTIDAD_DETECTADA;
    else if (strcmp(token, "ESCANEA_CARNET") == 0)       outCmd.type = CommandType::ESCANEA_CARNET;
    else if (strcmp(token, "AHORA_ESCANEA_ITEM") == 0)   outCmd.type = CommandType::AHORA_ESCANEA_ITEM;
    else if (strcmp(token, "ITEM_AGREGADO") == 0)        outCmd.type = CommandType::ITEM_AGREGADO;
    else if (strcmp(token, "ITEM_RESUMEN") == 0)         outCmd.type = CommandType::ITEM_RESUMEN;
    else if (strcmp(token, "VALIDANDO") == 0)            outCmd.type = CommandType::VALIDANDO;
    else if (strcmp(token, "PRESTAMO_COMPLETADO") == 0)  outCmd.type = CommandType::PRESTAMO_COMPLETADO;
    else if (strcmp(token, "PRESTAMO_RECHAZADO") == 0)   outCmd.type = CommandType::PRESTAMO_RECHAZADO;
    else if (strcmp(token, "SIN_RED") == 0)              outCmd.type = CommandType::SIN_RED;
    else if (strcmp(token, "FUERA_SERVICIO") == 0)       outCmd.type = CommandType::FUERA_SERVICIO;
    else if (strcmp(token, "ADMIN_DETECTADO") == 0)      outCmd.type = CommandType::ADMIN_DETECTADO;
    else if (strcmp(token, "ADMIN_PANEL") == 0)          outCmd.type = CommandType::ADMIN_PANEL;
    else if (strcmp(token, "ADMIN_SYNC") == 0)           outCmd.type = CommandType::ADMIN_SYNC;

    // Extracción de parámetros adicionales si existen
    token = strtok_r(nullptr, ":", &savePtr);
    if (token != nullptr) {
        strncpy(outCmd.param1, token, sizeof(outCmd.param1) - 1);
        outCmd.param1[sizeof(outCmd.param1) - 1] = '\0';

        token = strtok_r(nullptr, ":", &savePtr);
        if (token != nullptr) {
            strncpy(outCmd.param2, token, sizeof(outCmd.param2) - 1);
            outCmd.param2[sizeof(outCmd.param2) - 1] = '\0';
        }
    }

    return (outCmd.type != CommandType::UNKNOWN);
}
