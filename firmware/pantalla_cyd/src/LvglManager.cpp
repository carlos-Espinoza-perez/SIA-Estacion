#include "LvglManager.h"
#include <WiFi.h>

LvglManager Lvgl;

static TFT_eSPI* _activeTft = nullptr;
static lv_disp_draw_buf_t _drawBuf;
static lv_color_t _buf1[480 * 20]; // 19.2 KB draw buffer
static lv_disp_drv_t _dispDrv;
static lv_indev_drv_t _indevDrv;

static std::function<void(int)> _onSelectCb = nullptr;
static std::function<void()> _onRefreshCb = nullptr;
static std::function<void()> _onOtherCb = nullptr;
static std::function<void(const char*)> _onConnectCb = nullptr;
static std::function<void()> _onBackCb = nullptr;
static std::function<void()> _onAdminClickCb = nullptr;
static std::function<void()> _onAdminWifiCb = nullptr;
static std::function<void()> _onAdminSyncCb = nullptr;
static std::function<void()> _onAdminExitCb = nullptr;

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
    _indevDrv.scroll_limit = 8; // Sensibilidad de scroll: 8px antes de bloquear clicks
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
    }
}

void LvglManager::showWifiList(int numNetworks, 
                              std::function<void(int)> onSelect,
                              std::function<void()> onRefresh,
                              std::function<void()> onOther) {
    if (!_initialized) return;

    _onSelectCb = onSelect;
    _onRefreshCb = onRefresh;
    _onOtherCb = onOther;
    _active = true;

    lv_obj_clean(lv_scr_act());

    // Fondo general oscuro
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0a1118), LV_PART_MAIN);

    // Titulo de vista
    lv_obj_t* title = lv_label_create(lv_scr_act());
    lv_label_set_text(title, "SIA - REDES WIFI DISPONIBLES");
    lv_obj_set_style_text_color(title, lv_color_hex(0x00d2ff), LV_PART_MAIN);
    lv_obj_set_style_text_font(title, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(title, LV_ALIGN_TOP_LEFT, 20, 14);

    // Contador de redes
    char countBuf[32];
    snprintf(countBuf, sizeof(countBuf), "%d redes encontradas", numNetworks);
    lv_obj_t* countLbl = lv_label_create(lv_scr_act());
    lv_label_set_text(countLbl, countBuf);
    lv_obj_set_style_text_color(countLbl, lv_color_hex(0x8899a6), LV_PART_MAIN);
    lv_obj_set_style_text_font(countLbl, &lv_font_montserrat_12, LV_PART_MAIN);
    lv_obj_align(countLbl, LV_ALIGN_TOP_RIGHT, -20, 16);

    // Contenedor List scrollable nativo de LVGL
    lv_obj_t* list = lv_list_create(lv_scr_act());
    lv_obj_set_size(list, 444, 192);
    lv_obj_align(list, LV_ALIGN_TOP_MID, 0, 42);
    lv_obj_set_style_bg_color(list, lv_color_hex(0x0f172a), LV_PART_MAIN);
    lv_obj_set_style_border_color(list, lv_color_hex(0x1e293b), LV_PART_MAIN);
    lv_obj_set_style_border_width(list, 1, LV_PART_MAIN);
    lv_obj_set_style_radius(list, 10, LV_PART_MAIN);
    lv_obj_set_style_pad_all(list, 6, LV_PART_MAIN);
    lv_obj_set_style_pad_row(list, 6, LV_PART_MAIN);

    lv_obj_set_scrollbar_mode(list, LV_SCROLLBAR_MODE_AUTO);
    lv_obj_set_scroll_dir(list, LV_DIR_VER);

    // Estilo de la barra de desplazamiento
    lv_obj_set_style_bg_color(list, lv_color_hex(0x2563eb), LV_PART_SCROLLBAR);
    lv_obj_set_style_bg_opa(list, LV_OPA_80, LV_PART_SCROLLBAR);
    lv_obj_set_style_width(list, 5, LV_PART_SCROLLBAR);

    for (int i = 0; i < numNetworks; i++) {
        String ssid = WiFi.SSID(i);
        int32_t rssi = WiFi.RSSI(i);

        char labelText[96];
        const char* quality = (rssi > -65) ? "Excelente" : ((rssi > -80) ? "Buena" : "Regular");
        snprintf(labelText, sizeof(labelText), "%s  (%s)", ssid.c_str(), quality);

        lv_obj_t* btn = lv_list_add_btn(list, LV_SYMBOL_WIFI, labelText);
        lv_obj_set_style_bg_color(btn, lv_color_hex(0x182234), LV_PART_MAIN);
        lv_obj_set_style_bg_color(btn, lv_color_hex(0x2563eb), LV_STATE_PRESSED);
        lv_obj_set_style_text_color(btn, lv_color_hex(0xffffff), LV_PART_MAIN);
        lv_obj_set_style_text_font(btn, &lv_font_montserrat_14, LV_PART_MAIN);
        lv_obj_set_style_radius(btn, 8, LV_PART_MAIN);
        lv_obj_set_style_pad_ver(btn, 14, LV_PART_MAIN);
        lv_obj_set_style_pad_hor(btn, 14, LV_PART_MAIN);

        lv_obj_add_event_cb(btn, [](lv_event_t * e) {
            int netIdx = (int)(uintptr_t)lv_event_get_user_data(e);
            Serial.printf("[LVGL] Click en red WiFi indice %d\n", netIdx);
            if (_onSelectCb) _onSelectCb(netIdx);
        }, LV_EVENT_CLICKED, (void*)(uintptr_t)i);
    }

    // Boton "Buscar de nuevo"
    lv_obj_t* btn_ref = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btn_ref, 210, 46);
    lv_obj_align(btn_ref, LV_ALIGN_BOTTOM_LEFT, 20, -14);
    lv_obj_set_style_bg_color(btn_ref, lv_color_hex(0x1e293b), LV_PART_MAIN);
    lv_obj_set_style_bg_color(btn_ref, lv_color_hex(0x334155), LV_STATE_PRESSED);
    lv_obj_set_style_radius(btn_ref, 8, LV_PART_MAIN);
    lv_obj_t* lbl_ref = lv_label_create(btn_ref);
    lv_label_set_text(lbl_ref, "Buscar de nuevo");
    lv_obj_set_style_text_font(lbl_ref, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_center(lbl_ref);
    lv_obj_add_event_cb(btn_ref, [](lv_event_t * e) {
        Serial.println("[LVGL] Click en 'Buscar de nuevo'");
        if (_onRefreshCb) _onRefreshCb();
    }, LV_EVENT_CLICKED, NULL);
}

void LvglManager::showWifiScanning(std::function<void()> onRefresh,
                                   std::function<void()> onOther) {
    if (!_initialized) return;

    _onRefreshCb = onRefresh;
    _onOtherCb = onOther;
    _active = true;

    lv_obj_clean(lv_scr_act());

    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0a1118), LV_PART_MAIN);

    lv_obj_t* title = lv_label_create(lv_scr_act());
    lv_label_set_text(title, "SIA - CONFIGURACION WIFI");
    lv_obj_set_style_text_color(title, lv_color_hex(0x00d2ff), LV_PART_MAIN);
    lv_obj_set_style_text_font(title, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(title, LV_ALIGN_TOP_LEFT, 20, 14);

    lv_obj_t* spinner = lv_spinner_create(lv_scr_act(), 1000, 60);
    lv_obj_set_size(spinner, 64, 64);
    lv_obj_center(spinner);
    lv_obj_set_style_arc_color(spinner, lv_color_hex(0x2563eb), LV_PART_INDICATOR);
    lv_obj_set_style_arc_color(spinner, lv_color_hex(0x1e293b), LV_PART_MAIN);

    lv_obj_t* msg = lv_label_create(lv_scr_act());
    lv_label_set_text(msg, "Escaneando redes WiFi cercanas...");
    lv_obj_set_style_text_color(msg, lv_color_hex(0xffffff), LV_PART_MAIN);
    lv_obj_set_style_text_font(msg, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(msg, LV_ALIGN_CENTER, 0, 52);

    // Botones inferiores
    lv_obj_t* btn_ref = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btn_ref, 210, 46);
    lv_obj_align(btn_ref, LV_ALIGN_BOTTOM_LEFT, 20, -14);
    lv_obj_set_style_bg_color(btn_ref, lv_color_hex(0x1e293b), LV_PART_MAIN);
    lv_obj_set_style_radius(btn_ref, 8, LV_PART_MAIN);
    lv_obj_t* lbl_ref = lv_label_create(btn_ref);
    lv_label_set_text(lbl_ref, "Buscar de nuevo");
    lv_obj_set_style_text_font(lbl_ref, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_center(lbl_ref);
    lv_obj_add_event_cb(btn_ref, [](lv_event_t * e) {
        if (_onRefreshCb) _onRefreshCb();
    }, LV_EVENT_CLICKED, NULL);
}

void LvglManager::showWifiEmpty(std::function<void()> onRefresh,
                                std::function<void()> onOther) {
    if (!_initialized) return;

    _onRefreshCb = onRefresh;
    _onOtherCb = onOther;
    _active = true;

    lv_obj_clean(lv_scr_act());

    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0a1118), LV_PART_MAIN);

    lv_obj_t* title = lv_label_create(lv_scr_act());
    lv_label_set_text(title, "SIA - CONFIGURACION WIFI");
    lv_obj_set_style_text_color(title, lv_color_hex(0x00d2ff), LV_PART_MAIN);
    lv_obj_set_style_text_font(title, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(title, LV_ALIGN_TOP_LEFT, 20, 14);

    lv_obj_t* msg = lv_label_create(lv_scr_act());
    lv_label_set_text(msg, "No se encontraron redes WiFi disponibles");
    lv_obj_set_style_text_color(msg, lv_color_hex(0xffffff), LV_PART_MAIN);
    lv_obj_set_style_text_font(msg, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(msg, LV_ALIGN_CENTER, 0, -20);

    lv_obj_t* sub = lv_label_create(lv_scr_act());
    lv_label_set_text(sub, "Verifica que tu router de 2.4 GHz este encendido");
    lv_obj_set_style_text_color(sub, lv_color_hex(0x8899a6), LV_PART_MAIN);
    lv_obj_set_style_text_font(sub, &lv_font_montserrat_12, LV_PART_MAIN);
    lv_obj_align(sub, LV_ALIGN_CENTER, 0, 12);

    // Botones inferiores
    lv_obj_t* btn_ref = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btn_ref, 210, 46);
    lv_obj_align(btn_ref, LV_ALIGN_BOTTOM_LEFT, 20, -14);
    lv_obj_set_style_bg_color(btn_ref, lv_color_hex(0x1e293b), LV_PART_MAIN);
    lv_obj_set_style_radius(btn_ref, 8, LV_PART_MAIN);
    lv_obj_t* lbl_ref = lv_label_create(btn_ref);
    lv_label_set_text(lbl_ref, "Buscar de nuevo");
    lv_obj_set_style_text_font(lbl_ref, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_center(lbl_ref);
    lv_obj_add_event_cb(btn_ref, [](lv_event_t * e) {
        if (_onRefreshCb) _onRefreshCb();
    }, LV_EVENT_CLICKED, NULL);
}

void LvglManager::showWifiPassword(const char* ssid,
                                   const char* currentPass,
                                   const char* errorMsg,
                                   std::function<void(const char*)> onConnect,
                                   std::function<void()> onBack) {
    if (!_initialized) return;

    _onConnectCb = onConnect;
    _onBackCb = onBack;
    _active = true;

    lv_obj_clean(lv_scr_act());

    // Fondo general
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0a1118), LV_PART_MAIN);

    // 1. Cabecera (Figma)
    lv_obj_t* lbl_sub = lv_label_create(lv_scr_act());
    lv_label_set_text(lbl_sub, "INGRESE LA CONTRASENA");
    lv_obj_set_style_text_color(lbl_sub, lv_color_hex(0x38bdf8), LV_PART_MAIN);
    lv_obj_set_style_text_font(lbl_sub, &lv_font_montserrat_12, LV_PART_MAIN);
    lv_obj_align(lbl_sub, LV_ALIGN_TOP_LEFT, 24, 10);

    lv_obj_t* title = lv_label_create(lv_scr_act());
    lv_label_set_text_fmt(title, "%s", (ssid && ssid[0]) ? ssid : "Red WiFi");
    lv_obj_set_style_text_color(title, lv_color_hex(0xffffff), LV_PART_MAIN);
    lv_obj_set_style_text_font(title, &lv_font_montserrat_16, LV_PART_MAIN);
    lv_obj_align(title, LV_ALIGN_TOP_LEFT, 24, 26);

    // 2. Campo de Contrasena y Boton "Ver/Ocultar" (y = 52, h = 42)
    lv_obj_t* ta = lv_textarea_create(lv_scr_act());
    lv_obj_set_size(ta, 344, 42);
    lv_obj_align(ta, LV_ALIGN_TOP_LEFT, 24, 52);
    lv_textarea_set_placeholder_text(ta, "Toca aqui para escribir...");
    lv_textarea_set_password_mode(ta, true);
    lv_textarea_set_one_line(ta, true);
    lv_textarea_set_max_length(ta, 63);
    if (currentPass && currentPass[0]) {
        lv_textarea_set_text(ta, currentPass);
    }
    lv_obj_set_style_bg_color(ta, lv_color_hex(0x0f172a), LV_PART_MAIN);
    lv_obj_set_style_border_color(ta, lv_color_hex(0x334155), LV_PART_MAIN);
    lv_obj_set_style_border_color(ta, lv_color_hex(0x2563eb), LV_STATE_FOCUSED);
    lv_obj_set_style_text_color(ta, lv_color_hex(0xffffff), LV_PART_MAIN);
    lv_obj_set_style_text_font(ta, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_set_style_radius(ta, 8, LV_PART_MAIN);
    lv_obj_set_style_pad_all(ta, 9, LV_PART_MAIN);

    // Boton "Ver/Ocultar"
    lv_obj_t* btn_eye = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btn_eye, 80, 42);
    lv_obj_align(btn_eye, LV_ALIGN_TOP_RIGHT, -24, 52);
    lv_obj_set_style_bg_color(btn_eye, lv_color_hex(0x1e293b), LV_PART_MAIN);
    lv_obj_set_style_radius(btn_eye, 8, LV_PART_MAIN);
    lv_obj_t* lbl_eye = lv_label_create(btn_eye);
    lv_label_set_text(lbl_eye, "Ver");
    lv_obj_set_style_text_color(lbl_eye, lv_color_hex(0x00d2ff), LV_PART_MAIN);
    lv_obj_set_style_text_font(lbl_eye, &lv_font_montserrat_12, LV_PART_MAIN);
    lv_obj_center(lbl_eye);
    lv_obj_add_event_cb(btn_eye, [](lv_event_t * e) {
        lv_obj_t* ta_target = (lv_obj_t*)lv_event_get_user_data(e);
        lv_obj_t* btn = lv_event_get_target(e);
        lv_obj_t* label = lv_obj_get_child(btn, 0);
        bool pwMode = lv_textarea_get_password_mode(ta_target);
        lv_textarea_set_password_mode(ta_target, !pwMode);
        lv_label_set_text(label, !pwMode ? "Ocultar" : "Ver");
    }, LV_EVENT_CLICKED, ta);

    // 3. Mensaje Informativo o de Error (y = 100)
    lv_obj_t* info1 = lv_label_create(lv_scr_act());
    if (errorMsg && errorMsg[0]) {
        lv_label_set_text_fmt(info1, "[!] %s", errorMsg);
        lv_obj_set_style_text_color(info1, lv_color_hex(0xef4444), LV_PART_MAIN);
    } else {
        lv_label_set_text(info1, "La contrasena se guardara solo en esta Estacion.");
        lv_obj_set_style_text_color(info1, lv_color_hex(0x8899a6), LV_PART_MAIN);
    }
    lv_obj_set_style_text_font(info1, &lv_font_montserrat_12, LV_PART_MAIN);
    lv_obj_align(info1, LV_ALIGN_TOP_LEFT, 24, 100);

    // 4. Contenedor de Botones Inferiores (Figma)
    lv_obj_t* cont_btn = lv_obj_create(lv_scr_act());
    lv_obj_set_size(cont_btn, 480, 60);
    lv_obj_align(cont_btn, LV_ALIGN_BOTTOM_MID, 0, 0);
    lv_obj_set_style_bg_opa(cont_btn, LV_OPA_TRANSP, LV_PART_MAIN);
    lv_obj_set_style_border_opa(cont_btn, LV_OPA_TRANSP, LV_PART_MAIN);
    lv_obj_set_style_pad_all(cont_btn, 0, LV_PART_MAIN);

    lv_obj_t* btn_back_bottom = lv_btn_create(cont_btn);
    lv_obj_set_size(btn_back_bottom, 160, 46);
    lv_obj_align(btn_back_bottom, LV_ALIGN_LEFT_MID, 24, 0);
    lv_obj_set_style_bg_color(btn_back_bottom, lv_color_hex(0x1e293b), LV_PART_MAIN);
    lv_obj_set_style_bg_color(btn_back_bottom, lv_color_hex(0x334155), LV_STATE_PRESSED);
    lv_obj_set_style_radius(btn_back_bottom, 8, LV_PART_MAIN);
    lv_obj_t* lbl_back_b = lv_label_create(btn_back_bottom);
    lv_label_set_text(lbl_back_b, "Volver");
    lv_obj_set_style_text_font(lbl_back_b, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_center(lbl_back_b);
    lv_obj_add_event_cb(btn_back_bottom, [](lv_event_t * e) {
        Serial.println("[LVGL] Click en 'Volver' inferior");
        if (_onBackCb) _onBackCb();
    }, LV_EVENT_CLICKED, NULL);

    lv_obj_t* btn_connect = lv_btn_create(cont_btn);
    lv_obj_set_size(btn_connect, 216, 46);
    lv_obj_align(btn_connect, LV_ALIGN_RIGHT_MID, -24, 0);
    lv_obj_set_style_bg_color(btn_connect, lv_color_hex(0x2563eb), LV_PART_MAIN);
    lv_obj_set_style_bg_color(btn_connect, lv_color_hex(0x1d4ed8), LV_STATE_PRESSED);
    lv_obj_set_style_radius(btn_connect, 8, LV_PART_MAIN);
    lv_obj_t* lbl_conn = lv_label_create(btn_connect);
    lv_label_set_text(lbl_conn, "Conectar");
    lv_obj_set_style_text_font(lbl_conn, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_center(lbl_conn);
    lv_obj_add_event_cb(btn_connect, [](lv_event_t * e) {
        lv_obj_t* ta_target = (lv_obj_t*)lv_event_get_user_data(e);
        const char* passText = lv_textarea_get_text(ta_target);
        Serial.printf("[LVGL] Conectar presionado con clave de %d caracteres\n", strlen(passText));
        if (_onConnectCb) _onConnectCb(passText);
    }, LV_EVENT_CLICKED, ta);

    // 5. Teclado Virtual QWERTY (Ocupa y = 140..320, dejando y = 0..140 completamente visible y despejado)
    lv_obj_t* kb = lv_keyboard_create(lv_scr_act());
    lv_obj_set_size(kb, 480, 180);
    lv_obj_align(kb, LV_ALIGN_BOTTOM_MID, 0, 0);
    lv_keyboard_set_textarea(kb, ta);
    lv_obj_set_style_bg_color(kb, lv_color_hex(0x0a1118), LV_PART_MAIN);
    lv_obj_set_style_bg_color(kb, lv_color_hex(0x182234), LV_PART_ITEMS);
    lv_obj_set_style_bg_color(kb, lv_color_hex(0x2563eb), LV_PART_ITEMS | LV_STATE_PRESSED);
    lv_obj_set_style_text_color(kb, lv_color_hex(0xffffff), LV_PART_ITEMS);
    lv_obj_set_style_radius(kb, 4, LV_PART_ITEMS);

    // Asociamos cont_btn a kb para alternar visibilidad
    lv_obj_set_user_data(kb, cont_btn);

    // Inicialmente OCULTO segun diseño
    lv_obj_add_flag(kb, LV_OBJ_FLAG_HIDDEN);

    // Al hacer clic en el input de texto, se muestra el teclado y se ocultan los botones inferiores
    lv_obj_add_event_cb(ta, [](lv_event_t * e) {
        lv_obj_t* keyboard = (lv_obj_t*)lv_event_get_user_data(e);
        lv_obj_t* buttons = (lv_obj_t*)lv_obj_get_user_data(keyboard);
        Serial.println("[LVGL] Input tocado -> Abriendo teclado");
        lv_obj_clear_flag(keyboard, LV_OBJ_FLAG_HIDDEN);
        lv_obj_move_foreground(keyboard);
        if (buttons) lv_obj_add_flag(buttons, LV_OBJ_FLAG_HIDDEN);
    }, LV_EVENT_CLICKED, kb);

    // Eventos del teclado (Enter conecta, Cancel oculta teclado)
    lv_obj_add_event_cb(kb, [](lv_event_t * e) {
        lv_event_code_t code = lv_event_get_code(e);
        lv_obj_t* kb_obj = lv_event_get_target(e);
        lv_obj_t* buttons = (lv_obj_t*)lv_obj_get_user_data(kb_obj);
        lv_obj_t* ta_target = lv_keyboard_get_textarea(kb_obj);

        if (code == LV_EVENT_READY) {
            lv_obj_add_flag(kb_obj, LV_OBJ_FLAG_HIDDEN);
            if (buttons) lv_obj_clear_flag(buttons, LV_OBJ_FLAG_HIDDEN);
            const char* passText = lv_textarea_get_text(ta_target);
            Serial.printf("[LVGL] Teclado READY presionado con clave de %d caracteres\n", strlen(passText));
            if (_onConnectCb) _onConnectCb(passText);
        } else if (code == LV_EVENT_CANCEL) {
            Serial.println("[LVGL] Teclado cerrado");
            lv_obj_add_flag(kb_obj, LV_OBJ_FLAG_HIDDEN);
            if (buttons) lv_obj_clear_flag(buttons, LV_OBJ_FLAG_HIDDEN);
        }
    }, LV_EVENT_ALL, NULL);
}

void LvglManager::showProcessing(const char* title, const char* subtitle) {
    if (!_initialized) return;
    _active = true;

    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0a1118), LV_PART_MAIN);

    // Encabezado SIA
    lv_obj_t* hdr = lv_label_create(lv_scr_act());
    lv_label_set_text(hdr, "SIA");
    lv_obj_set_style_text_color(hdr, lv_color_hex(0x38bdf8), LV_PART_MAIN);
    lv_obj_set_style_text_font(hdr, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(hdr, LV_ALIGN_TOP_LEFT, 24, 16);

    // Spinner animado (rotación continua a 1000ms por vuelta)
    lv_obj_t* spinner = lv_spinner_create(lv_scr_act(), 1000, 60);
    lv_obj_set_size(spinner, 72, 72);
    lv_obj_align(spinner, LV_ALIGN_CENTER, 0, -35);
    lv_obj_set_style_arc_color(spinner, lv_color_hex(0x1e293b), LV_PART_MAIN);
    lv_obj_set_style_arc_width(spinner, 6, LV_PART_MAIN);
    lv_obj_set_style_arc_color(spinner, lv_color_hex(0x00d2ff), LV_PART_INDICATOR);
    lv_obj_set_style_arc_width(spinner, 6, LV_PART_INDICATOR);

    // Título principal
    lv_obj_t* lbl_title = lv_label_create(lv_scr_act());
    lv_label_set_text(lbl_title, (title && title[0]) ? title : "Procesando...");
    lv_obj_set_style_text_color(lbl_title, lv_color_hex(0xffffff), LV_PART_MAIN);
    lv_obj_set_style_text_font(lbl_title, &lv_font_montserrat_18, LV_PART_MAIN);
    lv_obj_align(lbl_title, LV_ALIGN_CENTER, 0, 35);

    // Subtítulo
    if (subtitle && subtitle[0]) {
        lv_obj_t* lbl_sub = lv_label_create(lv_scr_act());
        lv_label_set_text(lbl_sub, subtitle);
        lv_obj_set_style_text_color(lbl_sub, lv_color_hex(0x94a3b8), LV_PART_MAIN);
        lv_obj_set_style_text_font(lbl_sub, &lv_font_montserrat_14, LV_PART_MAIN);
        lv_obj_align(lbl_sub, LV_ALIGN_CENTER, 0, 65);
    }
}

void LvglManager::showStatusMessage(bool success, const char* badge, const char* title, const char* subtitle) {
    if (!_initialized) return;
    _active = true;

    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0a1118), LV_PART_MAIN);

    // Encabezado SIA
    lv_obj_t* hdr = lv_label_create(lv_scr_act());
    lv_label_set_text(hdr, "SIA");
    lv_obj_set_style_text_color(hdr, lv_color_hex(0x38bdf8), LV_PART_MAIN);
    lv_obj_set_style_text_font(hdr, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(hdr, LV_ALIGN_TOP_LEFT, 24, 16);

    uint32_t colorAccent = success ? 0x10b981 : 0xef4444;

    // Tarjeta central
    lv_obj_t* card = lv_obj_create(lv_scr_act());
    lv_obj_set_size(card, 432, 230);
    lv_obj_align(card, LV_ALIGN_CENTER, 0, 15);
    lv_obj_set_style_bg_color(card, lv_color_hex(0x0f172a), LV_PART_MAIN);
    lv_obj_set_style_border_color(card, lv_color_hex(colorAccent), LV_PART_MAIN);
    lv_obj_set_style_border_width(card, 2, LV_PART_MAIN);
    lv_obj_set_style_radius(card, 16, LV_PART_MAIN);
    lv_obj_set_style_pad_all(card, 16, LV_PART_MAIN);
    lv_obj_clear_flag(card, LV_OBJ_FLAG_SCROLLABLE);

    // Ícono circular decorativo
    lv_obj_t* circle = lv_obj_create(card);
    lv_obj_set_size(circle, 56, 56);
    lv_obj_align(circle, LV_ALIGN_TOP_MID, 0, 4);
    lv_obj_set_style_bg_color(circle, lv_color_hex(success ? 0x064e3b : 0x7f1d1d), LV_PART_MAIN);
    lv_obj_set_style_border_color(circle, lv_color_hex(colorAccent), LV_PART_MAIN);
    lv_obj_set_style_border_width(circle, 2, LV_PART_MAIN);
    lv_obj_set_style_radius(circle, LV_RADIUS_CIRCLE, LV_PART_MAIN);
    lv_obj_clear_flag(circle, LV_OBJ_FLAG_SCROLLABLE);

    lv_obj_t* icon = lv_label_create(circle);
    lv_label_set_text(icon, success ? "OK" : "X");
    lv_obj_set_style_text_color(icon, lv_color_hex(colorAccent), LV_PART_MAIN);
    lv_obj_set_style_text_font(icon, &lv_font_montserrat_18, LV_PART_MAIN);
    lv_obj_center(icon);

    // Badge
    lv_obj_t* lbl_badge = lv_label_create(card);
    lv_label_set_text(lbl_badge, badge ? badge : (success ? "EXITO" : "ERROR"));
    lv_obj_set_style_text_color(lbl_badge, lv_color_hex(colorAccent), LV_PART_MAIN);
    lv_obj_set_style_text_font(lbl_badge, &lv_font_montserrat_12, LV_PART_MAIN);
    lv_obj_align(lbl_badge, LV_ALIGN_TOP_MID, 0, 74);

    // Título
    lv_obj_t* lbl_t = lv_label_create(card);
    lv_label_set_text(lbl_t, title ? title : "");
    lv_obj_set_style_text_color(lbl_t, lv_color_hex(0xffffff), LV_PART_MAIN);
    lv_obj_set_style_text_font(lbl_t, &lv_font_montserrat_18, LV_PART_MAIN);
    lv_obj_align(lbl_t, LV_ALIGN_TOP_MID, 0, 98);

    // Subtítulo
    if (subtitle && subtitle[0]) {
        lv_obj_t* lbl_sub = lv_label_create(card);
        lv_label_set_text(lbl_sub, subtitle);
        lv_obj_set_style_text_color(lbl_sub, lv_color_hex(0x38bdf8), LV_PART_MAIN);
        lv_obj_set_style_text_font(lbl_sub, &lv_font_montserrat_14, LV_PART_MAIN);
        lv_obj_align(lbl_sub, LV_ALIGN_TOP_MID, 0, 132);
    }
}

void LvglManager::showWaiting(const char* title, const char* subtitle, std::function<void()> onAdminClick) {
    if (!_initialized) return;
    _onAdminClickCb = onAdminClick;
    _active = true;

    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0a1118), LV_PART_MAIN);

    // Header
    lv_obj_t* hdr = lv_label_create(lv_scr_act());
    lv_label_set_text(hdr, "SIA - ESTACION");
    lv_obj_set_style_text_color(hdr, lv_color_hex(0x38bdf8), LV_PART_MAIN);
    lv_obj_set_style_text_font(hdr, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(hdr, LV_ALIGN_TOP_LEFT, 24, 16);

    // Indicador "En línea"
    lv_obj_t* dot = lv_obj_create(lv_scr_act());
    lv_obj_set_size(dot, 12, 12);
    lv_obj_align(dot, LV_ALIGN_TOP_RIGHT, -24, 18);
    lv_obj_set_style_bg_color(dot, lv_color_hex(0x10b981), LV_PART_MAIN);
    lv_obj_set_style_radius(dot, LV_RADIUS_CIRCLE, LV_PART_MAIN);
    lv_obj_set_style_border_opa(dot, LV_OPA_TRANSP, LV_PART_MAIN);

    // Tarjeta central
    lv_obj_t* card = lv_obj_create(lv_scr_act());
    lv_obj_set_size(card, 432, 168);
    lv_obj_align(card, LV_ALIGN_TOP_MID, 0, 48);
    lv_obj_set_style_bg_color(card, lv_color_hex(0x0f172a), LV_PART_MAIN);
    lv_obj_set_style_border_color(card, lv_color_hex(0x2563eb), LV_PART_MAIN);
    lv_obj_set_style_border_width(card, 1, LV_PART_MAIN);
    lv_obj_set_style_radius(card, 12, LV_PART_MAIN);
    lv_obj_clear_flag(card, LV_OBJ_FLAG_SCROLLABLE);

    // Badge "ESTACION ACTIVA"
    lv_obj_t* badge = lv_label_create(card);
    lv_label_set_text(badge, "ESTACION ACTIVA");
    lv_obj_set_style_text_color(badge, lv_color_hex(0x10b981), LV_PART_MAIN);
    lv_obj_set_style_text_font(badge, &lv_font_montserrat_12, LV_PART_MAIN);
    lv_obj_align(badge, LV_ALIGN_TOP_LEFT, 16, 12);

    // Nombre de la estación
    lv_obj_t* lbl_t = lv_label_create(card);
    lv_label_set_text(lbl_t, (title && title[0]) ? title : "Estacion SIA");
    lv_obj_set_style_text_color(lbl_t, lv_color_hex(0xffffff), LV_PART_MAIN);
    lv_obj_set_style_text_font(lbl_t, &lv_font_montserrat_18, LV_PART_MAIN);
    lv_obj_align(lbl_t, LV_ALIGN_TOP_LEFT, 16, 36);

    // Indicaciones / URL visor
    lv_obj_t* lbl_sub = lv_label_create(card);
    lv_label_set_text(lbl_sub, (subtitle && subtitle[0]) ? subtitle : "Acerca tu credencial o abre la camara web");
    lv_obj_set_style_text_color(lbl_sub, lv_color_hex(0x94a3b8), LV_PART_MAIN);
    lv_obj_set_style_text_font(lbl_sub, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(lbl_sub, LV_ALIGN_TOP_LEFT, 16, 68);

    lv_obj_t* hint = lv_label_create(card);
    lv_label_set_text(hint, "Listo para lectura de credenciales y validacion.");
    lv_obj_set_style_text_color(hint, lv_color_hex(0x64748b), LV_PART_MAIN);
    lv_obj_set_style_text_font(hint, &lv_font_montserrat_12, LV_PART_MAIN);
    lv_obj_align(hint, LV_ALIGN_TOP_LEFT, 16, 98);

    // Botón Panel de Administración
    lv_obj_t* btn_adm = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btn_adm, 220, 46);
    lv_obj_align(btn_adm, LV_ALIGN_BOTTOM_MID, 0, -18);
    lv_obj_set_style_bg_color(btn_adm, lv_color_hex(0x1e293b), LV_PART_MAIN);
    lv_obj_set_style_bg_color(btn_adm, lv_color_hex(0x334155), LV_STATE_PRESSED);
    lv_obj_set_style_radius(btn_adm, 8, LV_PART_MAIN);
    lv_obj_t* lbl_adm = lv_label_create(btn_adm);
    lv_label_set_text(lbl_adm, "Panel de Estacion");
    lv_obj_set_style_text_font(lbl_adm, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_center(lbl_adm);

    lv_obj_add_event_cb(btn_adm, [](lv_event_t * e) {
        Serial.println("[LVGL] Click en Panel de Estacion");
        if (_onAdminClickCb) _onAdminClickCb();
    }, LV_EVENT_CLICKED, NULL);
}

void LvglManager::showAdminPanel(std::function<void()> onWifi, std::function<void()> onSync, std::function<void()> onExit) {
    if (!_initialized) return;
    _onAdminWifiCb = onWifi;
    _onAdminSyncCb = onSync;
    _onAdminExitCb = onExit;
    _active = true;

    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0a1118), LV_PART_MAIN);

    // Header
    lv_obj_t* hdr = lv_label_create(lv_scr_act());
    lv_label_set_text(hdr, "PANEL DE ADMINISTRACION");
    lv_obj_set_style_text_color(hdr, lv_color_hex(0x38bdf8), LV_PART_MAIN);
    lv_obj_set_style_text_font(hdr, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(hdr, LV_ALIGN_TOP_LEFT, 24, 16);

    // Botón 1: Configurar Wi-Fi
    lv_obj_t* btn_wifi = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btn_wifi, 432, 50);
    lv_obj_align(btn_wifi, LV_ALIGN_TOP_MID, 0, 56);
    lv_obj_set_style_bg_color(btn_wifi, lv_color_hex(0x1e293b), LV_PART_MAIN);
    lv_obj_set_style_bg_color(btn_wifi, lv_color_hex(0x334155), LV_STATE_PRESSED);
    lv_obj_set_style_radius(btn_wifi, 8, LV_PART_MAIN);
    lv_obj_t* lbl_w = lv_label_create(btn_wifi);
    lv_label_set_text(lbl_w, "Configurar Red Wi-Fi");
    lv_obj_set_style_text_font(lbl_w, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_center(lbl_w);
    lv_obj_add_event_cb(btn_wifi, [](lv_event_t* e) {
        if (_onAdminWifiCb) _onAdminWifiCb();
    }, LV_EVENT_CLICKED, NULL);

    // Botón 2: Sincronizar con Servidor
    lv_obj_t* btn_sync = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btn_sync, 432, 50);
    lv_obj_align(btn_sync, LV_ALIGN_TOP_MID, 0, 118);
    lv_obj_set_style_bg_color(btn_sync, lv_color_hex(0x1e293b), LV_PART_MAIN);
    lv_obj_set_style_bg_color(btn_sync, lv_color_hex(0x334155), LV_STATE_PRESSED);
    lv_obj_set_style_radius(btn_sync, 8, LV_PART_MAIN);
    lv_obj_t* lbl_s = lv_label_create(btn_sync);
    lv_label_set_text(lbl_s, "Sincronizar con Servidor (Heartbeat)");
    lv_obj_set_style_text_font(lbl_s, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_center(lbl_s);
    lv_obj_add_event_cb(btn_sync, [](lv_event_t* e) {
        if (_onAdminSyncCb) _onAdminSyncCb();
    }, LV_EVENT_CLICKED, NULL);

    // Botón 3: Volver
    lv_obj_t* btn_exit = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btn_exit, 432, 50);
    lv_obj_align(btn_exit, LV_ALIGN_TOP_MID, 0, 180);
    lv_obj_set_style_bg_color(btn_exit, lv_color_hex(0x2563eb), LV_PART_MAIN);
    lv_obj_set_style_bg_color(btn_exit, lv_color_hex(0x1d4ed8), LV_STATE_PRESSED);
    lv_obj_set_style_radius(btn_exit, 8, LV_PART_MAIN);
    lv_obj_t* lbl_e = lv_label_create(btn_exit);
    lv_label_set_text(lbl_e, "Volver al Modo Espera");
    lv_obj_set_style_text_font(lbl_e, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_center(lbl_e);
    lv_obj_add_event_cb(btn_exit, [](lv_event_t* e) {
        if (_onAdminExitCb) _onAdminExitCb();
    }, LV_EVENT_CLICKED, NULL);
}

void LvglManager::showGranted(const char* person, const char* item) {
    showStatusMessage(true, "ACCESO CONCEDIDO", person ? person : "Usuario Identificado", item ? item : "Autorizado");
}

void LvglManager::showDenied(const char* reason) {
    showStatusMessage(false, "ACCESO DENEGADO", reason ? reason : "No autorizado", "Consulta con el administrador");
}

void LvglManager::showLinked(const char* name, const char* mode) {
    showStatusMessage(true, "ESTACION VINCULADA", name ? name : "Estacion SIA", mode ? mode : "Configuracion guardada");
}

