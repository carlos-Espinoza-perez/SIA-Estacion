#pragma once

#include <Arduino.h>
#include <TFT_eSPI.h>
#include "Theme.h"

enum class IconType {
    NONE,
    CHECKMARK,
    CROSS,
    CAMERA,
    WARNING,
    GEAR,
    OFFLINE_DOT,
    QR_TARGET
};

namespace UI {
    void initDisplay(TFT_eSPI& tft);
    void clearScreen(TFT_eSPI& tft);

    void drawHeader(TFT_eSPI& tft, const char* title, const char* subtitle = nullptr);
    void drawDashedRect(TFT_eSPI& tft, int16_t x, int16_t y, int16_t w, int16_t h, 
                        uint16_t color, int16_t dashLen = 10, int16_t gapLen = 8, 
                        int16_t radius = 16, int16_t thickness = 3);
    void drawCard(TFT_eSPI& tft, int16_t x, int16_t y, int16_t w, int16_t h,
                  const char* title, const char* subtitle = nullptr,
                  const char* actionText = nullptr, uint16_t accentColor = Theme::COLOR_BLUE);
    void drawButton(TFT_eSPI& tft, int16_t x, int16_t y, int16_t w, int16_t h,
                    const char* text, uint16_t btnColor, bool isFilled = true,
                    uint16_t textColor = Theme::COLOR_TEXT_WHITE);
    void drawProgressBar(TFT_eSPI& tft, int16_t x, int16_t y, int16_t w, int16_t h,
                         float progress, uint16_t fillColor = Theme::COLOR_BLUE);

    void drawStatusView(TFT_eSPI& tft, IconType icon,
                        const char* badgeText, uint16_t badgeColor,
                        const char* titleText, uint16_t titleColor,
                        const char* subtitleText, uint16_t subtitleColor,
                        uint16_t haloColor);

    void drawCheckIcon(TFT_eSPI& tft, int16_t cx, int16_t cy, int16_t size, uint16_t color);
    void drawCrossIcon(TFT_eSPI& tft, int16_t cx, int16_t cy, int16_t size, uint16_t color);
    void drawCameraIcon(TFT_eSPI& tft, int16_t cx, int16_t cy, uint16_t color);
    void drawWarningIcon(TFT_eSPI& tft, int16_t cx, int16_t cy, uint16_t color);
    void drawGearIcon(TFT_eSPI& tft, int16_t cx, int16_t cy, uint16_t color);
    void drawSpinner(TFT_eSPI& tft, int16_t cx, int16_t cy, int16_t radius, uint16_t color);
}
