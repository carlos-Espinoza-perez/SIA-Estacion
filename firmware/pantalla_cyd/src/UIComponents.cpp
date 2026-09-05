#include "UIComponents.h"
#include "Config.h"

namespace UI {

    void initDisplay(TFT_eSPI& tft) {
        tft.init();
        tft.setRotation(SCREEN_ROTATION);
        tft.fillScreen(Theme::COLOR_BG);
        tft.setTextWrap(false, false);
        
        #if defined(TFT_BL) && (TFT_BL >= 0)
            pinMode(TFT_BL, OUTPUT);
            digitalWrite(TFT_BL, HIGH);
        #endif
    }

    void clearScreen(TFT_eSPI& tft) {
        tft.fillScreen(Theme::COLOR_BG);
    }

    void drawHeader(TFT_eSPI& tft, const char* title, const char* subtitle) {
        tft.setTextDatum(TL_DATUM);
        tft.setTextColor(Theme::COLOR_TEXT_MUTED, Theme::COLOR_BG);
        tft.setTextFont(2);
        tft.drawString(title, 24, 14);

        if (subtitle != nullptr && subtitle[0] != '\0') {
            tft.drawString(subtitle, 24, 32);
        }
    }

    void drawDashedRect(TFT_eSPI& tft, int16_t x, int16_t y, int16_t w, int16_t h, 
                        uint16_t color, int16_t dashLen, int16_t gapLen, 
                        int16_t radius, int16_t thickness) {
        for (int16_t t = 0; t < thickness; ++t) {
            tft.drawRoundRect(x + t, y + t, w - 2 * t, h - 2 * t, radius, color);
        }

        int16_t step = dashLen + gapLen;
        
        for (int16_t dx = radius; dx < w - radius - gapLen; dx += step) {
            int16_t gStart = dx + dashLen;
            int16_t gWidth = (gStart + gapLen > w - radius) ? (w - radius - gStart) : gapLen;
            if (gWidth > 0) {
                tft.fillRect(x + gStart, y, gWidth, thickness, Theme::COLOR_BG);
                tft.fillRect(x + gStart, y + h - thickness, gWidth, thickness, Theme::COLOR_BG);
            }
        }

        for (int16_t dy = radius; dy < h - radius - gapLen; dy += step) {
            int16_t gStart = dy + dashLen;
            int16_t gHeight = (gStart + gapLen > h - radius) ? (h - radius - gStart) : gapLen;
            if (gHeight > 0) {
                tft.fillRect(x, y + gStart, thickness, gHeight, Theme::COLOR_BG);
                tft.fillRect(x + w - thickness, y + gStart, thickness, gHeight, Theme::COLOR_BG);
            }
        }
    }

    void drawCard(TFT_eSPI& tft, int16_t x, int16_t y, int16_t w, int16_t h,
                  const char* title, const char* subtitle,
                  const char* actionText, uint16_t accentColor) {
        tft.fillRoundRect(x, y, w, h, Theme::RADIUS_CARD, Theme::COLOR_CARD);
        tft.drawRoundRect(x, y, w, h, Theme::RADIUS_CARD, Theme::COLOR_CARD_BORDER);

        tft.fillCircle(x + 18, y + h / 2, 4, accentColor);

        // Título con fuente 2 nítida
        tft.setTextDatum(TL_DATUM);
        tft.setTextColor(Theme::COLOR_TEXT_WHITE, Theme::COLOR_CARD);
        tft.setTextFont(2);
        tft.drawString(title, x + 34, y + 6);

        // Subtítulo con fuente 2 limpia
        if (subtitle != nullptr && subtitle[0] != '\0') {
            tft.setTextColor(Theme::COLOR_TEXT_MUTED, Theme::COLOR_CARD);
            tft.setTextFont(2);
            tft.drawString(subtitle, x + 34, y + 24);
        }

        // Acción a la derecha
        if (actionText != nullptr && actionText[0] != '\0') {
            tft.setTextDatum(TR_DATUM);
            tft.setTextColor(accentColor, Theme::COLOR_CARD);
            tft.setTextFont(2);
            tft.drawString(actionText, x + w - 16, y + (h / 2) - 8);
        }
    }

    void drawButton(TFT_eSPI& tft, int16_t x, int16_t y, int16_t w, int16_t h,
                    const char* text, uint16_t btnColor, bool isFilled, uint16_t textColor) {
        if (isFilled) {
            tft.fillRoundRect(x, y, w, h, Theme::RADIUS_BUTTON, btnColor);
        } else {
            tft.fillRoundRect(x, y, w, h, Theme::RADIUS_BUTTON, Theme::COLOR_CARD);
            tft.drawRoundRect(x, y, w, h, Theme::RADIUS_BUTTON, btnColor);
        }

        tft.setTextDatum(MC_DATUM);
        tft.setTextColor(isFilled ? textColor : btnColor, isFilled ? btnColor : Theme::COLOR_CARD);
        tft.setTextFont(2);
        tft.drawString(text, x + w / 2, y + h / 2);
    }

    void drawProgressBar(TFT_eSPI& tft, int16_t x, int16_t y, int16_t w, int16_t h,
                         float progress, uint16_t fillColor) {
        tft.fillRoundRect(x, y, w, h, 3, Theme::COLOR_CARD);
        
        float p = (progress < 0.0f) ? 0.0f : ((progress > 1.0f) ? 1.0f : progress);
        int16_t fillW = (int16_t)(w * p);
        if (fillW > 0) {
            tft.fillRoundRect(x, y, fillW, h, 3, fillColor);
        }
    }

    void drawStatusView(TFT_eSPI& tft, IconType icon,
                        const char* badgeText, uint16_t badgeColor,
                        const char* titleText, uint16_t titleColor,
                        const char* subtitleText, uint16_t subtitleColor,
                        uint16_t haloColor) {
        const int16_t centerX = SCREEN_WIDTH / 2;
        const int16_t centerY = 96;

        tft.fillCircle(centerX, centerY, 48, haloColor);

        switch (icon) {
            case IconType::CHECKMARK:
                drawCheckIcon(tft, centerX, centerY, 24, badgeColor);
                break;
            case IconType::CROSS:
                drawCrossIcon(tft, centerX, centerY, 20, badgeColor);
                break;
            case IconType::CAMERA:
                drawCameraIcon(tft, centerX, centerY, badgeColor);
                break;
            case IconType::WARNING:
                drawWarningIcon(tft, centerX, centerY, badgeColor);
                break;
            case IconType::GEAR:
                drawGearIcon(tft, centerX, centerY, badgeColor);
                break;
            case IconType::OFFLINE_DOT:
                tft.fillCircle(centerX, centerY, 10, badgeColor);
                break;
            default:
                break;
        }

        // Badge
        if (badgeText != nullptr && badgeText[0] != '\0') {
            tft.setTextDatum(TC_DATUM);
            tft.setTextColor(badgeColor, Theme::COLOR_BG);
            tft.setTextFont(2);
            tft.drawString(badgeText, centerX, 164);
        }

        // Título Principal (Font 4: 26px bold limpia)
        if (titleText != nullptr && titleText[0] != '\0') {
            tft.setTextDatum(TC_DATUM);
            tft.setTextColor(titleColor, Theme::COLOR_BG);
            tft.setTextFont(4);
            tft.drawString(titleText, centerX, 192);
        }

        // Subtítulo (Font 2: 16px limpia)
        if (subtitleText != nullptr && subtitleText[0] != '\0') {
            tft.setTextDatum(TC_DATUM);
            tft.setTextColor(subtitleColor, Theme::COLOR_BG);
            tft.setTextFont(2);
            tft.drawString(subtitleText, centerX, 230);
        }
    }

    void drawCheckIcon(TFT_eSPI& tft, int16_t cx, int16_t cy, int16_t size, uint16_t color) {
        int16_t x0 = cx - size * 0.55;
        int16_t y0 = cy;
        int16_t x1 = cx - size * 0.15;
        int16_t y1 = cy + size * 0.45;
        int16_t x2 = cx + size * 0.65;
        int16_t y2 = cy - size * 0.45;

        for (int8_t i = -2; i <= 2; ++i) {
            tft.drawLine(x0, y0 + i, x1, y1 + i, color);
            tft.drawLine(x1, y1 + i, x2, y2 + i, color);
            tft.drawLine(x0 + i, y0, x1 + i, y1, color);
            tft.drawLine(x1 + i, y1, x2 + i, y2, color);
        }
    }

    void drawCrossIcon(TFT_eSPI& tft, int16_t cx, int16_t cy, int16_t size, uint16_t color) {
        for (int8_t i = -2; i <= 2; ++i) {
            tft.drawLine(cx - size + i, cy - size, cx + size + i, cy + size, color);
            tft.drawLine(cx - size + i, cy + size, cx + size + i, cy - size, color);
            tft.drawLine(cx - size, cy - size + i, cx + size, cy + size + i, color);
            tft.drawLine(cx - size, cy + size + i, cx + size, cy - size + i, color);
        }
    }

    void drawCameraIcon(TFT_eSPI& tft, int16_t cx, int16_t cy, uint16_t color) {
        tft.drawRoundRect(cx - 26, cy - 16, 52, 34, 6, color);
        tft.drawRoundRect(cx - 25, cy - 15, 50, 32, 5, color);
        tft.fillRect(cx - 10, cy - 22, 20, 6, color);
        tft.drawCircle(cx, cy + 1, 10, color);
        tft.drawCircle(cx, cy + 1, 9, color);
    }

    void drawWarningIcon(TFT_eSPI& tft, int16_t cx, int16_t cy, uint16_t color) {
        tft.drawCircle(cx, cy, 26, color);
        tft.drawCircle(cx, cy, 25, color);
        tft.fillRect(cx - 2, cy - 14, 5, 16, color);
        tft.fillCircle(cx, cy + 10, 3, color);
    }

    void drawGearIcon(TFT_eSPI& tft, int16_t cx, int16_t cy, uint16_t color) {
        tft.drawCircle(cx, cy, 18, color);
        tft.drawCircle(cx, cy, 17, color);
        tft.fillCircle(cx, cy, 6, color);
        for (int16_t a = 0; a < 360; a += 45) {
            float rad = a * 0.0174533f;
            int16_t x0 = cx + cos(rad) * 16;
            int16_t y0 = cy + sin(rad) * 16;
            int16_t x1 = cx + cos(rad) * 23;
            int16_t y1 = cy + sin(rad) * 23;
            tft.drawLine(x0, y0, x1, y1, color);
        }
    }

    void drawSpinner(TFT_eSPI& tft, int16_t cx, int16_t cy, int16_t radius, uint16_t color) {
        tft.drawCircle(cx, cy, radius, color);
        tft.drawCircle(cx, cy, radius - 1, color);
        tft.drawCircle(cx, cy, radius - 2, color);
    }
}
