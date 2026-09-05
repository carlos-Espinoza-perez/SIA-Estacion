#pragma once

#include <Arduino.h>
#include <TFT_eSPI.h>
#include "Theme.h"

// Tipos de iconos vectoriales soportados
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
    // Inicialización de la pantalla y fuentes
    void initDisplay(TFT_eSPI& tft);

    // Limpia la pantalla al color de fondo estándar #333333
    void clearScreen(TFT_eSPI& tft);

    // Dibuja el encabezado superior (Ej: "SIA", "Hola, Carlos", "SIA · Administración")
    void drawHeader(TFT_eSPI& tft, const char* title, const char* subtitle = nullptr);

    // Dibuja un marco rectangular con líneas punteadas (usado para área de escaneo de Figma)
    void drawDashedRect(TFT_eSPI& tft, int16_t x, int16_t y, int16_t w, int16_t h, 
                        uint16_t color, int16_t dashLen = 10, int16_t gapLen = 8, 
                        int16_t radius = 16, int16_t thickness = 3);

    // Dibuja una tarjeta contenedora (Tarjetas WiFi, ítems, acciones de menú)
    void drawCard(TFT_eSPI& tft, int16_t x, int16_t y, int16_t w, int16_t h,
                  const char* title, const char* subtitle = nullptr,
                  const char* actionText = nullptr, uint16_t accentColor = Theme::COLOR_BLUE);

    // Dibuja un botón estilizado (Filled u Outlined con radio de 10px)
    void drawButton(TFT_eSPI& tft, int16_t x, int16_t y, int16_t w, int16_t h,
                    const char* text, uint16_t btnColor, bool isFilled = true,
                    uint16_t textColor = Theme::COLOR_TEXT_WHITE);

    // Dibuja la barra de progreso horizontal (Pantalla Boot)
    void drawProgressBar(TFT_eSPI& tft, int16_t x, int16_t y, int16_t w, int16_t h,
                         float progress, uint16_t fillColor = Theme::COLOR_BLUE);

    // Dibuja una pantalla de estado con icono central, badge, título y subtítulo
    void drawStatusView(TFT_eSPI& tft, IconType icon,
                        const char* badgeText, uint16_t badgeColor,
                        const char* titleText, uint16_t titleColor,
                        const char* subtitleText, uint16_t subtitleColor,
                        uint16_t haloColor);

    // Primitivas de iconos vectoriales (renderizadas directas con TFT_eSPI)
    void drawCheckIcon(TFT_eSPI& tft, int16_t cx, int16_t cy, int16_t size, uint16_t color);
    void drawCrossIcon(TFT_eSPI& tft, int16_t cx, int16_t cy, int16_t size, uint16_t color);
    void drawCameraIcon(TFT_eSPI& tft, int16_t cx, int16_t cy, uint16_t color);
    void drawWarningIcon(TFT_eSPI& tft, int16_t cx, int16_t cy, uint16_t color);
    void drawGearIcon(TFT_eSPI& tft, int16_t cx, int16_t cy, uint16_t color);
    void drawSpinner(TFT_eSPI& tft, int16_t cx, int16_t cy, int16_t radius, uint16_t color);
}
