#include "TouchManager.h"

TouchManager::TouchManager() 
    : _touch(XPT2046_CS_PIN, XPT2046_IRQ_PIN),
      _lastTouchTime(0),
      _currentAreas(nullptr),
      _areaCount(0) {}

void TouchManager::init() {
    _touch.begin();
    _touch.setRotation(SCREEN_ROTATION);
}

bool TouchManager::poll(int16_t& outX, int16_t& outY) {
    if (millis() - _lastTouchTime < TOUCH_DEBOUNCE_MS) {
        return false;
    }

    if (_touch.touched()) {
        TS_Point p = _touch.getPoint();
        _lastTouchTime = millis();

        // Mapeo de coordenadas raw a resolución de pantalla 480x320
        int16_t mappedX = map(p.x, TS_MINX, TS_MAXX, 0, SCREEN_WIDTH);
        int16_t mappedY = map(p.y, TS_MINY, TS_MAXY, 0, SCREEN_HEIGHT);

        outX = constrain(mappedX, 0, SCREEN_WIDTH - 1);
        outY = constrain(mappedY, 0, SCREEN_HEIGHT - 1);
        return true;
    }

    return false;
}

void TouchManager::setAreas(const TouchArea* areas, size_t count) {
    _currentAreas = areas;
    _areaCount = count;
}

const char* TouchManager::checkHit(int16_t x, int16_t y) {
    if (_currentAreas == nullptr || _areaCount == 0) {
        return nullptr;
    }

    for (size_t i = 0; i < _areaCount; ++i) {
        const auto& a = _currentAreas[i];
        if (x >= a.x && x <= (a.x + a.w) && y >= a.y && y <= (a.y + a.h)) {
            return a.actionId;
        }
    }

    return nullptr;
}
