#pragma once

#include <Arduino.h>

// Conversion RGB888 a RGB565 para la pantalla
constexpr uint16_t rgb565(uint8_t r, uint8_t g, uint8_t b) {
    return ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3);
}

namespace Theme {
    // Fondos y tarjetas
    constexpr uint16_t COLOR_BG          = rgb565(51, 51, 51);
    constexpr uint16_t COLOR_CARD        = rgb565(59, 59, 59);
    constexpr uint16_t COLOR_CARD_BORDER = rgb565(75, 75, 75);
    constexpr uint16_t COLOR_CARD_ACTIVE = rgb565(70, 70, 70);

    // Colores de texto
    constexpr uint16_t COLOR_TEXT_WHITE  = 0xFFFF;
    constexpr uint16_t COLOR_TEXT_MUTED  = rgb565(158, 158, 158);
    constexpr uint16_t COLOR_TEXT_BLACK  = 0x0000;

    // Estados y acentos
    constexpr uint16_t COLOR_BLUE        = rgb565(125, 187, 255);
    constexpr uint16_t COLOR_GREEN       = rgb565(113, 221, 140);
    constexpr uint16_t COLOR_RED         = rgb565(232, 99, 99);
    constexpr uint16_t COLOR_TURQUOISE   = rgb565(107, 230, 211);
    constexpr uint16_t COLOR_PURPLE      = rgb565(184, 153, 235);
    constexpr uint16_t COLOR_LILAC       = rgb565(173, 173, 251);
    constexpr uint16_t COLOR_YELLOW      = rgb565(233, 188, 99);

    // Halos de fondo para iconos de estado
    constexpr uint16_t COLOR_HALO_GREEN  = rgb565(60, 78, 65);
    constexpr uint16_t COLOR_HALO_RED    = rgb565(80, 58, 58);
    constexpr uint16_t COLOR_HALO_BLUE   = rgb565(62, 72, 83);
    constexpr uint16_t COLOR_HALO_PURPLE = rgb565(72, 67, 80);
    constexpr uint16_t COLOR_HALO_YELLOW = rgb565(80, 73, 58);

    // Radios de bordes
    constexpr int16_t RADIUS_BUTTON   = 10;
    constexpr int16_t RADIUS_CARD     = 10;
    constexpr int16_t RADIUS_INPUT    = 8;
    constexpr int16_t RADIUS_QR_FRAME = 16;
}
