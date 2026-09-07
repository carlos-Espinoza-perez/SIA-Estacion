#include "TouchManager.h"
#include "StorageManager.h"

TouchManager::TouchManager(TFT_eSPI& tft) 
    : _tft(tft),
      _currentAreas(nullptr),
      _areaCount(0),
      _isPressed(false),
      _isDragging(false),
      _startX(0),
      _startY(0),
      _lastX(0),
      _lastY(0),
      _pressStartTime(0) {}

void TouchManager::init() {
    uint16_t calData[5];
    if (Storage.getTouchCalibration(calData)) {
        Serial.printf("[TOUCH] Calibracion cargada de memoria: {%d, %d, %d, %d, %d}\n",
                      calData[0], calData[1], calData[2], calData[3], calData[4]);
        _tft.setTouch(calData);
    } else {
        // Calibración exacta guardada para este panel Hosyond ESP32-3248S035R (3.5" Landscape 480x320)
        uint16_t defaultCal[5] = { 373, 3425, 431, 3211, 7 };
        Serial.println("[TOUCH] Usando calibracion nativa por defecto para CYD 3.5\"");
        _tft.setTouch(defaultCal);
    }
}

void TouchManager::runCalibration() {
    Serial.println("[TOUCH] Iniciando asistente de calibracion...");
    _tft.fillScreen(TFT_BLACK);
    _tft.setTextColor(TFT_WHITE, TFT_BLACK);
    _tft.setTextDatum(MC_DATUM);
    _tft.drawString("CALIBRACION DE PANTALLA", 240, 140, 4);
    _tft.drawString("Toca los puntos en las esquinas indicadas", 240, 180, 2);

    uint16_t calData[5];
    _tft.calibrateTouch(calData, TFT_RED, TFT_BLACK, 15);

    Serial.printf("[TOUCH] Calibracion completada: {%d, %d, %d, %d, %d}\n",
                  calData[0], calData[1], calData[2], calData[3], calData[4]);
    _tft.setTouch(calData);
    Storage.saveTouchCalibration(calData);
    Serial.println("[TOUCH] Guardada en memoria permanente.");
}

const char* TouchManager::pollAction(int16_t& outX, int16_t& outY) {
    uint16_t tx = 0, ty = 0;
    bool touched = _tft.getTouch(&tx, &ty);
    uint32_t now = millis();

    if (touched) {
        outX = (int16_t)tx;
        outY = (int16_t)ty;

        if (!_isPressed) {
            // Primer contacto
            _isPressed = true;
            _isDragging = false;
            _startX = outX;
            _startY = outY;
            _lastX = outX;
            _lastY = outY;
            _pressStartTime = now;
            return nullptr;
        }

        // Dedo arrastrándose sobre la pantalla
        int16_t stepY = outY - _lastY;
        int16_t totalY = outY - _startY;

        // Umbral para considerar gesto de arrastre (Scroll natural con el dedo)
        if (abs(totalY) > 20) {
            _isDragging = true;
        }

        if (_isDragging) {
            if (stepY < -24) { // Dedo se movió hacia arriba -> lista baja
                _lastY = outY;
                Serial.printf("[GESTURE] Swipe Up en (%d, %d)\n", outX, outY);
                return "GESTURE_SWIPE_UP";
            } else if (stepY > 24) { // Dedo se movió hacia abajo -> lista sube
                _lastY = outY;
                Serial.printf("[GESTURE] Swipe Down en (%d, %d)\n", outX, outY);
                return "GESTURE_SWIPE_DOWN";
            }
        }

        return nullptr;
    } else {
        // Dedo levantado
        if (_isPressed) {
            _isPressed = false;
            uint32_t pressDuration = now - _pressStartTime;

            // Si no fue un gesto de arrastre y fue toque breve (< 700ms), es un TAP
            if (!_isDragging && pressDuration < 700) {
                outX = _startX;
                outY = _startY;
                const char* hit = checkHit(_startX, _startY);
                if (hit != nullptr) {
                    Serial.printf("[TOUCH] Tap en (%d, %d) -> %s\n", _startX, _startY, hit);
                    return hit;
                }
            }

            _isDragging = false;
        }

        return nullptr;
    }
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
