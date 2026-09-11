#include "LvglManager.h"
#include "Config.h"
#include <WiFi.h>
#include <qrcode.h>

LvglManager Lvgl;

static TFT_eSPI* _activeTft = nullptr;
static lv_disp_draw_buf_t _drawBuf;
static lv_color_t _buf1[480 * 20]; // 19.2 KB draw buffer
static lv_disp_drv_t _dispDrv;
static lv_indev_drv_t _indevDrv;
static lv_obj_t* _bootSubtitleLabel = nullptr;

// Callbacks para navegacion y acciones tactiles
static std::function<void(int)> _onSelectCb = nullptr;
static std::function<void()> _onRefreshCb = nullptr;
static std::function<void()> _onOtherCb = nullptr;
static std::function<void(const char*)> _onConnectCb = nullptr;
static std::function<void()> _onBackCb = nullptr;
static std::function<void()> _onAdminClickCb = nullptr;
static std::function<void()> _onAdminWifiCb = nullptr;
static std::function<void()> _onAdminSyncCb = nullptr;
static std::function<void()> _onAdminExitCb = nullptr;
static std::function<void()> _onAction1Cb = nullptr;
static std::function<void()> _onAction2Cb = nullptr;

// Buffer de Canvas 1-bit para QR (~2.5 KB RAM)
static uint8_t _qrCanvasBuf[LV_CANVAS_BUF_SIZE_INDEXED_1BIT(154, 154)];

// Helper para dibujar un codigo QR en un lv_canvas
static void renderQrOnCanvas(lv_obj_t* canvas, const char* text) {
    lv_canvas_set_buffer(canvas, _qrCanvasBuf, 154, 154, LV_IMG_CF_INDEXED_1BIT);
    // LVGL 8.x: bit=0 -> palette[0], bit=1 -> palette[1]
    // Para QR estandar (modulos oscuros sobre fondo claro) la paleta debe ser invertida
    lv_canvas_set_palette(canvas, 0, lv_color_black());  // bit=0 -> negro (modulos QR)
    lv_canvas_set_palette(canvas, 1, lv_color_white());  // bit=1 -> blanco (fondo)
    lv_canvas_fill_bg(canvas, lv_color_white(), LV_OPA_COVER); // llena con blanco (bit=1)

    if (!text || text[0] == '\0') return;

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
            if (status != 0) return;
        } else {
            return;
        }
    }

    int16_t margin = 7;
    int16_t qrAreaSize = 154 - (2 * margin);
    int16_t moduleSize = qrAreaSize / qrcode.size;
    if (moduleSize < 1) moduleSize = 1;
    int16_t actualQrSize = moduleSize * qrcode.size;
    int16_t startX = (154 - actualQrSize) / 2;
    int16_t startY = (154 - actualQrSize) / 2;

    for (uint8_t y = 0; y < qrcode.size; y++) {
        for (uint8_t x = 0; x < qrcode.size; x++) {
            if (qrcode_getModule(&qrcode, x, y)) {
                for (int my = 0; my < moduleSize; my++) {
                    for (int mx = 0; mx < moduleSize; mx++) {
                        // Dibujar modulo como blanco -> LVGL mapea al indice mas cercano a blanco = palette[1]
                        // pero en 1-bit, fill_bg deja todo en bit=1 (blanco) y necesitamos bit=0 (negro) para modulos
                        // Por eso dibujamos con lv_color_black() que mapea a palette[0] (bit=0 -> negro)
                        lv_canvas_set_px_color(canvas, startX + (x * moduleSize) + mx, startY + (y * moduleSize) + my, lv_color_black());
                    }
                }
            }
        }
    }
}

// Translitera caracteres UTF-8 con tildes o simbolos no-ASCII a ASCII plano
// para compatibilidad perfecta con las fuentes Montserrat de LVGL
static String sanitizeForDisplay(const char* str) {
    if (!str) return String("");
    String out = "";
    out.reserve(strlen(str));
    for (size_t i = 0; str[i] != '\0'; i++) {
        unsigned char c = (unsigned char)str[i];
        if (c < 0x80) {
            out += (char)c;
        } else if (c == 0xC3 && str[i + 1] != '\0') {
            i++;
            unsigned char next = (unsigned char)str[i];
            switch (next) {
                case 0xA1: out += 'a'; break; // á
                case 0xA9: out += 'e'; break; // é
                case 0xAD: out += 'i'; break; // í
                case 0xB3: out += 'o'; break; // ó
                case 0xBA: out += 'u'; break; // ú
                case 0xB1: out += 'n'; break; // ñ
                case 0x81: out += 'A'; break; // Á
                case 0x89: out += 'E'; break; // É
                case 0x8D: out += 'I'; break; // Í
                case 0x93: out += 'O'; break; // Ó
                case 0x9A: out += 'U'; break; // Ú
                case 0x91: out += 'N'; break; // Ñ
                case 0xBC: out += 'u'; break; // ü
                case 0x9C: out += 'U'; break; // Ü
                default: break;
            }
        } else if (c == 0xC2 && str[i + 1] != '\0') {
            i++;
            unsigned char next = (unsigned char)str[i];
            if (next == 0xB7) out += '-'; // ·
        }
    }
    return out;
}

// Helper para crear una cabecera Figma estandar
static void createFigmaHeader(const char* titleText, const char* subtitleText) {
    lv_obj_t* headerBox = lv_obj_create(lv_scr_act());
    lv_obj_set_size(headerBox, 440, 52);
    lv_obj_align(headerBox, LV_ALIGN_TOP_MID, 0, 10);
    lv_obj_set_style_bg_color(headerBox, lv_color_hex(0x111827), LV_PART_MAIN);
    lv_obj_set_style_border_color(headerBox, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_border_width(headerBox, 1, LV_PART_MAIN);
    lv_obj_set_style_radius(headerBox, 10, LV_PART_MAIN);
    lv_obj_set_style_pad_hor(headerBox, 14, LV_PART_MAIN);
    lv_obj_set_style_pad_ver(headerBox, 6, LV_PART_MAIN);
    lv_obj_clear_flag(headerBox, LV_OBJ_FLAG_SCROLLABLE);

    lv_obj_t* titleLbl = lv_label_create(headerBox);
    String cleanTitle = sanitizeForDisplay(titleText ? titleText : "SIA");
    lv_label_set_text(titleLbl, cleanTitle.c_str());
    lv_obj_set_style_text_color(titleLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(titleLbl, &lv_font_montserrat_16, LV_PART_MAIN);
    lv_obj_align(titleLbl, LV_ALIGN_TOP_LEFT, 0, 2);

    if (subtitleText && subtitleText[0] != '\0') {
        lv_obj_t* subLbl = lv_label_create(headerBox);
        String cleanSub = sanitizeForDisplay(subtitleText);
        lv_label_set_text(subLbl, cleanSub.c_str());
        lv_obj_set_style_text_color(subLbl, lv_color_hex(0x94A3B8), LV_PART_MAIN);
        lv_obj_set_style_text_font(subLbl, &lv_font_montserrat_12, LV_PART_MAIN);
        lv_obj_align(subLbl, LV_ALIGN_BOTTOM_LEFT, 0, -2);
    }
}

LvglManager::LvglManager() 
    : _initialized(false), _active(false), _lastTick(0) {}

void LvglManager::dispFlushCb(lv_disp_drv_t *disp, const lv_area_t *area, lv_color_t *color_p) {
    if (!Lvgl.isActive() || !_activeTft) {
        lv_disp_flush_ready(disp);
        return;
    }

    uint32_t w = (area->x2 - area->x1 + 1);
    uint32_t h = (area->y2 - area->y1 + 1);

    _activeTft->startWrite();
    _activeTft->setAddrWindow(area->x1, area->y1, w, h);
    _activeTft->pushColors((uint16_t *)&color_p->full, w * h, true);
    _activeTft->endWrite();

    lv_disp_flush_ready(disp);
}

void LvglManager::touchReadCb(lv_indev_drv_t *indev, lv_indev_data_t *data) {
    if (!Lvgl.isActive() || !_activeTft) {
        data->state = LV_INDEV_STATE_REL;
        return;
    }

    uint16_t touchX = 0, touchY = 0;
    bool touched = _activeTft->getTouch(&touchX, &touchY);

    if (touched) {
        data->state = LV_INDEV_STATE_PR;
        data->point.x = touchX;
        data->point.y = touchY;
    } else {
        data->state = LV_INDEV_STATE_REL;
    }
}

void LvglManager::init(TFT_eSPI* tft) {
    if (_initialized) return;
    _activeTft = tft;

    lv_init();

    lv_disp_draw_buf_init(&_drawBuf, _buf1, NULL, 480 * 20);

    lv_disp_drv_init(&_dispDrv);
    _dispDrv.hor_res = 480;
    _dispDrv.ver_res = 320;
    _dispDrv.flush_cb = dispFlushCb;
    _dispDrv.draw_buf = &_drawBuf;
    lv_disp_drv_register(&_dispDrv);

    lv_indev_drv_init(&_indevDrv);
    _indevDrv.type = LV_INDEV_TYPE_POINTER;
    _indevDrv.read_cb = touchReadCb;
    _indevDrv.scroll_limit = 8;
    lv_indev_drv_register(&_indevDrv);

    _lastTick = millis();
    _initialized = true;
    Serial.println("[LVGL] Motor grafico LVGL 8.3 inicializado con exito.");
}

void LvglManager::update() {
    if (!_initialized || !_active) return;

    uint32_t now = millis();
    lv_tick_inc(now - _lastTick);
    _lastTick = now;

    lv_timer_handler();
}

void LvglManager::clear() {
    if (!_initialized) return;
    if (_active) {
        lv_obj_clean(lv_scr_act());
        _active = false;
        _onSelectCb = nullptr;
        _onRefreshCb = nullptr;
        _onOtherCb = nullptr;
        _onConnectCb = nullptr;
        _onBackCb = nullptr;
        _onAdminClickCb = nullptr;
        _onAdminWifiCb = nullptr;
        _onAdminSyncCb = nullptr;
        _onAdminExitCb = nullptr;
        _onAction1Cb = nullptr;
        _onAction2Cb = nullptr;
        _bootSubtitleLabel = nullptr;
    }
}

// ============================================================
// Modulos de Pantalla (un archivo por vista)
// ============================================================
#include "screens/Screen_Boot.inc"
#include "screens/Screen_Wifi.inc"
#include "screens/Screen_Pairing.inc"
#include "screens/Screen_Access.inc"
#include "screens/Screen_Items.inc"
#include "screens/Screen_Admin.inc"
#include "screens/Screen_Status.inc"
