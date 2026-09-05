#pragma once

#include <Arduino.h>
#include <TFT_eSPI.h>

namespace QR {
    // Renderiza un código QR nativo en pantalla centrado dentro de una caja blanca con esquinas redondeadas
    bool draw(TFT_eSPI& tft, const char* text, int16_t boxX, int16_t boxY, int16_t boxSize, int16_t margin = 10);
}
