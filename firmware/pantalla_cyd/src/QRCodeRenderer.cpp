#include "QRCodeRenderer.h"
#include "Theme.h"
#include <qrcode.h>

namespace QR {

    bool draw(TFT_eSPI& tft, const char* text, int16_t boxX, int16_t boxY, int16_t boxSize, int16_t margin) {
        if (text == nullptr || text[0] == '\0') {
            return false;
        }

        size_t len = strlen(text);
        uint8_t qrVersion = 3;
        if (len > 50) qrVersion = 5;
        if (len > 100) qrVersion = 7;

        QRCode qrcode;
        uint8_t qrcodeData[qrcode_getBufferSize(qrVersion)];

        int8_t status = qrcode_initText(&qrcode, qrcodeData, qrVersion, ECC_LOW, text);
        if (status != 0) {
            if (qrVersion < 7) {
                qrVersion = 7;
                uint8_t qrcodeData2[qrcode_getBufferSize(qrVersion)];
                status = qrcode_initText(&qrcode, qrcodeData2, qrVersion, ECC_LOW, text);
                if (status != 0) return false;
            } else {
                return false;
            }
        }

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
