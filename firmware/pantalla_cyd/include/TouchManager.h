#pragma once

#include <Arduino.h>
#include <SPI.h>
#include <XPT2046_Touchscreen.h>
#include "Config.h"

struct TouchArea {
    int16_t x;
    int16_t y;
    int16_t w;
    int16_t h;
    const char* actionId;
};

class TouchManager {
public:
    TouchManager();

    void init();
    
    // Sondeo de pulsación con debouncing y mapeo a coordenadas 480x320
    bool poll(int16_t& outX, int16_t& outY);

    // Registra áreas interactivas para la vista actual
    void setAreas(const TouchArea* areas, size_t count);

    // Comprueba si las coordenadas coinciden con un botón interactivo
    const char* checkHit(int16_t x, int16_t y);

private:
    XPT2046_Touchscreen _touch;
    uint32_t _lastTouchTime;
    const TouchArea* _currentAreas;
    size_t _areaCount;
};
