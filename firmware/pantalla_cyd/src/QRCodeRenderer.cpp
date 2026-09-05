#include "QRCodeRenderer.h"
#include "Theme.h"
#include <qrcode.h>

namespace QR {

    bool draw(TFT_eSPI& tft, const char* text, int16_t boxX, int16_t boxY, int16_t boxSize, int16_t margin) {
        if (text == nullptr || text[0] == '\0') {
            return false;
        }

        // Buffer estático de QR Versión 3 (soporta hasta 77 caracteres alfanuméricos en ECC_LOW)
        constexpr uint8_t QR_VERSION = 3;
        QRCode qrcode;
        uint8_t qrcodeData[qrcode_getBufferSize(QR_VERSION)];

        int8_t status = qrcode_initText(&qrcode, qrcodeData, QR_VERSION, ECC_LOW, text);
        if (status != 0) {
            return false;
        }

        // Dibujar contenedor blanco con esquinas redondeadas
        tft.fillRoundRect(boxX, boxY, boxSize, boxSize, 12, TFT_WHITE);

        int16_t qrAreaSize = boxSize - (2 * margin);
        int16_t moduleSize = qrAreaSize / qrcode.size;
        int16_t actualQrSize = moduleSize * qrcode.size;
        int16_t startX = boxX + (boxSize - actualQrSize) / 2;
        int16_t startY = boxY + (boxSize - actualQrSize) / 2;

        for (uint8_t y = 0; y < qrcode.size; y++) {
            for (uint8_t x = 0; x < qrcode.size; x++) {
                if (qrcode_getModule(&qrcode, x, y)) {
                    tft.fillRect(startX + (x * moduleSize), 
                                 startY + (y * moduleSize), 
                                 moduleSize, moduleSize, TFT_BLACK);
                }
            }
        }

        return true;
    }
}
