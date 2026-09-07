#pragma once

#include <Arduino.h>
#include <TFT_eSPI.h>
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
    explicit TouchManager(TFT_eSPI& tft);

    void init();
    const char* pollAction(int16_t& outX, int16_t& outY);
    void setAreas(const TouchArea* areas, size_t count);
    const char* checkHit(int16_t x, int16_t y);
    void runCalibration();

private:
    TFT_eSPI& _tft;
    const TouchArea* _currentAreas;
    size_t _areaCount;

    bool _isPressed;
    bool _isDragging;
    int16_t _startX;
    int16_t _startY;
    int16_t _lastX;
    int16_t _lastY;
    uint32_t _pressStartTime;
};
