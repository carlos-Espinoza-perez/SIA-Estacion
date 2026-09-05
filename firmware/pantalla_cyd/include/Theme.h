#pragma once

#include <Arduino.h>

// ==============================================================================
// Utilidad constexpr para conversión de RGB a RGB565 en tiempo de compilación
// ==============================================================================
constexpr uint16_t rgb565(uint8_t r, uint8_t g, uint8_t b) {
    return ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3);
}

// ==============================================================================
// Tokens de Color extraídos 1:1 de Figma (SIA - Pantalla 480x320)
// ==============================================================================
namespace Theme {
    // Fondos y Superficies
    constexpr uint16_t COLOR_BG           = rgb565(51, 51, 51);     // #333333 (Fondo general)
    constexpr uint16_t COLOR_CARD         = rgb565(59, 59, 59);     // #3B3B3B (Tarjetas y campos)
    constexpr uint16_t COLOR_CARD_BORDER  = rgb565(75, 75, 75);     // #4B4B4B (Borde sutil de tarjeta)
    constexpr uint16_t COLOR_CARD_ACTIVE  = rgb565(70, 70, 70);     // #464646 (Tarjeta pulsada)
    
    // Textos
    constexpr uint16_t COLOR_TEXT_WHITE   = 0xFFFF;                 // #FFFFFF (Títulos primarios)
    constexpr uint16_t COLOR_TEXT_MUTED   = rgb565(158, 158, 158);  // #9E9E9E (Subtítulos, detalles)
    constexpr uint16_t COLOR_TEXT_BLACK   = 0x0000;                 // #000000
    
    // Acentos de Estado
    constexpr uint16_t COLOR_BLUE         = rgb565(125, 187, 255);  // #7DBBFF (Acento principal / ESP:ESPERANDO)
    constexpr uint16_t COLOR_GREEN        = rgb565(113, 221, 140);  // #71DD8C (Acceso concedido / Éxito)
    constexpr uint16_t COLOR_RED          = rgb565(232, 99, 99);    // #E86363 (Acceso denegado / Destructivo)
    constexpr uint16_t COLOR_TURQUOISE    = rgb565(107, 230, 211);  // #6BE6D3 (Modo sin conexión / Offline)
    constexpr uint16_t COLOR_PURPLE       = rgb565(184, 153, 235);  // #B899EB (Error del sistema)
    constexpr uint16_t COLOR_LILAC        = rgb565(173, 173, 251);  // #ADADFB (Esperando aprobación)
    constexpr uint16_t COLOR_YELLOW       = rgb565(233, 188, 99);   // #E9BC63 (Advertencias / Sin red)

    // Fondos con tinte para halos/círculos de iconos (Simulados sobre #333333)
    constexpr uint16_t COLOR_HALO_GREEN   = rgb565(60, 78, 65);     // Verde 16% sobre #333333
    constexpr uint16_t COLOR_HALO_RED     = rgb565(80, 58, 58);     // Rojo 16% sobre #333333
    constexpr uint16_t COLOR_HALO_BLUE    = rgb565(62, 72, 83);     // Azul 16% sobre #333333
    constexpr uint16_t COLOR_HALO_PURPLE  = rgb565(72, 67, 80);     // Morado 16% sobre #333333
    constexpr uint16_t COLOR_HALO_YELLOW  = rgb565(80, 73, 58);     // Amarillo 16% sobre #333333

    // Geometría y Radios de Componentes
    constexpr int16_t RADIUS_BUTTON   = 10;
    constexpr int16_t RADIUS_CARD     = 10;
    constexpr int16_t RADIUS_INPUT    = 8;
    constexpr int16_t RADIUS_QR_FRAME = 16;
}
