#pragma once

#include <Arduino.h>

#define FIRMWARE_VERSION "2.0.0"

// Pantalla ST7796 3.5" (480x320)
constexpr uint16_t SCREEN_WIDTH    = 480;
constexpr uint16_t SCREEN_HEIGHT   = 320;
constexpr uint8_t  SCREEN_ROTATION = 1;

// Pines del touch XPT2046
constexpr int8_t XPT2046_CS_PIN   = 33;
constexpr int8_t XPT2046_CLK_PIN  = 25;
constexpr int8_t XPT2046_MISO_PIN = 39;
constexpr int8_t XPT2046_MOSI_PIN = 32;
constexpr int8_t XPT2046_IRQ_PIN  = 36;

// Calibracion panel tactil
constexpr uint16_t TS_MINX = 200;
constexpr uint16_t TS_MAXX = 3800;
constexpr uint16_t TS_MINY = 240;
constexpr uint16_t TS_MAXY = 3800;

// Punto de acceso para configuracion y visor de camara
#define DEFAULT_AP_SSID         "SIA-ESTACION-CAM"
#define DEFAULT_AP_PASSWORD     ""

// Endpoints backend
#define DEFAULT_API_BASE_URL    "https://sia-api-app.azurewebsites.net"
#define DEFAULT_PAIRING_WEB_URL "https://sia-api-app.azurewebsites.net/estaciones/vincular?mac="

// Tiempos y timeouts (ms)
constexpr uint32_t SERIAL_BAUD             = 115200;
constexpr uint32_t TOUCH_DEBOUNCE_MS       = 120;
constexpr uint32_t HEARTBEAT_INTERVAL_MS   = 30000;
constexpr uint32_t LONG_POLL_TIMEOUT_MS    = 15000;
constexpr uint32_t RESULT_FEEDBACK_TIME_MS = 3500;
constexpr uint32_t WIFI_CONNECT_TIMEOUT_MS = 8000;
