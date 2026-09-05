#pragma once

#include <Arduino.h>

// ==============================================================================
// Dimensiones de Pantalla (Orientación Horizontal 480x320)
// ==============================================================================
constexpr uint16_t SCREEN_WIDTH  = 480;
constexpr uint16_t SCREEN_HEIGHT = 320;
constexpr uint8_t  SCREEN_ROTATION = 1; // 1 o 3 para apaisado (Landscape)

// ==============================================================================
// Pines Táctiles (Panel Resistivo XPT2046 en CYD 3.5" ESP32-3248S035R)
// ==============================================================================
constexpr int8_t XPT2046_CS_PIN   = 33;
constexpr int8_t XPT2046_CLK_PIN  = 25;
constexpr int8_t XPT2046_MISO_PIN = 39;
constexpr int8_t XPT2046_MOSI_PIN = 32;
constexpr int8_t XPT2046_IRQ_PIN  = 36;

// Constantes de Calibración Táctil (ajustables según lote físico)
constexpr uint16_t TS_MINX = 200;
constexpr uint16_t TS_MAXX = 3800;
constexpr uint16_t TS_MINY = 240;
constexpr uint16_t TS_MAXY = 3800;

// ==============================================================================
// Enlace Serial UART2 con ESP32 Principal
// ==============================================================================
// Se utiliza UART2 independiente para no colisionar con el puente USB-CH340 (UART0)
constexpr int8_t UART2_RX_PIN = 16;
constexpr int8_t UART2_TX_PIN = 17;
constexpr uint32_t SERIAL_BAUD = 115200;

// ==============================================================================
// Tiempos y Buffers (Enfoque Zero-Allocation)
// ==============================================================================
constexpr size_t SERIAL_BUF_SIZE     = 128;
constexpr uint32_t SERIAL_TIMEOUT_MS = 250;
constexpr uint32_t TOUCH_DEBOUNCE_MS = 120;
