// ============================================================
// Screen_Wifi.inc — Modulo 2: Seleccion y Configuracion WiFi
// showWifiList | showWifiScanning | showWifiEmpty | showWifiPassword
// ============================================================
// NOTA: Este archivo es incluido por LvglManager.cpp
//       No compilar de forma independiente.
// ============================================================

// Crea un boton "Volver" generico a las coordenadas dadas. Solo se usa cuando
// se paso un onCancel real, es decir, cuando la seleccion de red se entro
// desde el panel admin (no durante el emparejamiento inicial).
static lv_obj_t* createWifiBackButton(int x, int y, int w, lv_align_t align, std::function<void()> onCancel) {
    _onBackCb = onCancel;
    lv_obj_t* btn = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btn, w, 44);
    lv_obj_align(btn, align, x, y);
    lv_obj_set_style_bg_color(btn, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_radius(btn, 8, LV_PART_MAIN);
    lv_obj_t* lbl = lv_label_create(btn);
    lv_label_set_text(lbl, LV_SYMBOL_LEFT " Volver");
    lv_obj_set_style_text_font(lbl, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_center(lbl);
    lv_obj_add_event_cb(btn, [](lv_event_t* e) {
        if (_onBackCb) _onBackCb();
    }, LV_EVENT_CLICKED, NULL);
    return btn;
}

void LvglManager::showWifiList(int numNetworks,
                              std::function<void(int)> onSelect,
                              std::function<void()> onRefresh,
                              std::function<void()> onOther,
                              std::function<void()> onCancel) {
    if (!_initialized) return;

    _onSelectCb = onSelect;
    _onRefreshCb = onRefresh;
    _onOtherCb = onOther;
    _active = true;

    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    createFigmaHeader("Selecciona una red WiFi", "Redes disponibles en el area");

    lv_obj_t* list = lv_list_create(lv_scr_act());
    lv_obj_set_size(list, 444, 185);
    lv_obj_align(list, LV_ALIGN_TOP_MID, 0, 68);
    lv_obj_set_style_bg_color(list, lv_color_hex(0x111827), LV_PART_MAIN);
    lv_obj_set_style_border_color(list, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_border_width(list, 1, LV_PART_MAIN);
    lv_obj_set_style_radius(list, 10, LV_PART_MAIN);
    lv_obj_set_style_pad_all(list, 6, LV_PART_MAIN);
    lv_obj_set_style_pad_row(list, 6, LV_PART_MAIN);
    lv_obj_set_scrollbar_mode(list, LV_SCROLLBAR_MODE_AUTO);
    lv_obj_set_scroll_dir(list, LV_DIR_VER);

    for (int i = 0; i < numNetworks; i++) {
        String ssid = WiFi.SSID(i);
        int32_t rssi = WiFi.RSSI(i);
        const char* quality = (rssi > -65) ? "Excelente senal" : ((rssi > -80) ? "Buena senal" : "Senal regular");

        char labelText[96];
        snprintf(labelText, sizeof(labelText), "%s  -  %s", ssid.c_str(), quality);

        lv_obj_t* btn = lv_list_add_btn(list, LV_SYMBOL_WIFI, labelText);
        lv_obj_set_style_bg_color(btn, lv_color_hex(0x182234), LV_PART_MAIN);
        lv_obj_set_style_bg_color(btn, lv_color_hex(0x2563EB), LV_STATE_PRESSED);
        lv_obj_set_style_text_color(btn, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
        lv_obj_set_style_text_font(btn, &lv_font_montserrat_14, LV_PART_MAIN);
        lv_obj_set_style_radius(btn, 8, LV_PART_MAIN);
        lv_obj_set_style_pad_ver(btn, 12, LV_PART_MAIN);
        lv_obj_set_style_pad_hor(btn, 12, LV_PART_MAIN);

        lv_obj_add_event_cb(btn, [](lv_event_t * e) {
            int netIdx = (int)(uintptr_t)lv_event_get_user_data(e);
            if (_onSelectCb) _onSelectCb(netIdx);
        }, LV_EVENT_CLICKED, (void*)(uintptr_t)i);
    }

    // Botones: 2 columnas normalmente; 3 (con Volver) cuando se entro desde el panel admin.
    int btnW = onCancel ? 140 : 210;

    if (onCancel) {
        createWifiBackButton(20, -10, btnW, LV_ALIGN_BOTTOM_LEFT, onCancel);
    }

    lv_obj_t* btn_ref = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btn_ref, btnW, 44);
    lv_obj_align(btn_ref, onCancel ? LV_ALIGN_BOTTOM_MID : LV_ALIGN_BOTTOM_LEFT, onCancel ? 0 : 20, -10);
    lv_obj_set_style_bg_color(btn_ref, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_radius(btn_ref, 8, LV_PART_MAIN);
    lv_obj_t* lbl_ref = lv_label_create(btn_ref);
    lv_label_set_text(lbl_ref, LV_SYMBOL_REFRESH "  Actualizar");
    lv_obj_set_style_text_font(lbl_ref, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_center(lbl_ref);
    lv_obj_add_event_cb(btn_ref, [](lv_event_t * e) {
        if (_onRefreshCb) _onRefreshCb();
    }, LV_EVENT_CLICKED, NULL);

    lv_obj_t* btn_other = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btn_other, btnW, 44);
    lv_obj_align(btn_other, LV_ALIGN_BOTTOM_RIGHT, -20, -10);
    lv_obj_set_style_bg_color(btn_other, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_radius(btn_other, 8, LV_PART_MAIN);
    lv_obj_t* lbl_oth = lv_label_create(btn_other);
    lv_label_set_text(lbl_oth, "Otra red...");
    lv_obj_set_style_text_font(lbl_oth, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_center(lbl_oth);
    lv_obj_add_event_cb(btn_other, [](lv_event_t * e) {
        if (_onOtherCb) _onOtherCb();
    }, LV_EVENT_CLICKED, NULL);
}

void LvglManager::showWifiScanning(std::function<void()> onRefresh, std::function<void()> onOther, std::function<void()> onCancel) {
    if (!_initialized) return;
    _onRefreshCb = onRefresh;
    _onOtherCb = onOther;
    _active = true;
    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    createFigmaHeader("Configuracion Wi-Fi", "Busqueda de redes inalambricas");

    lv_obj_t* spinner = lv_spinner_create(lv_scr_act(), 1000, 60);
    lv_obj_set_size(spinner, 56, 56);
    lv_obj_center(spinner);
    lv_obj_set_style_arc_color(spinner, lv_color_hex(0x2563EB), LV_PART_INDICATOR);
    lv_obj_set_style_arc_color(spinner, lv_color_hex(0x1F2937), LV_PART_MAIN);

    lv_obj_t* msg = lv_label_create(lv_scr_act());
    lv_label_set_text(msg, "Escaneando redes cercanas...");
    lv_obj_set_style_text_color(msg, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(msg, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(msg, LV_ALIGN_CENTER, 0, 48);

    if (onCancel) {
        createWifiBackButton(0, -14, 210, LV_ALIGN_BOTTOM_MID, onCancel);
    }
}

void LvglManager::showWifiEmpty(std::function<void()> onRefresh, std::function<void()> onOther, std::function<void()> onCancel) {
    if (!_initialized) return;
    _onRefreshCb = onRefresh;
    _onOtherCb = onOther;
    _active = true;
    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    createFigmaHeader("Configuracion Wi-Fi", "No se detectaron redes");

    lv_obj_t* msg = lv_label_create(lv_scr_act());
    lv_label_set_text(msg, "No se encontraron redes WiFi disponibles");
    lv_obj_set_style_text_color(msg, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(msg, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(msg, LV_ALIGN_CENTER, 0, -20);

    lv_obj_t* sub = lv_label_create(lv_scr_act());
    lv_label_set_text(sub, "Verifica que el router 2.4 GHz este transmitiendo.");
    lv_obj_set_style_text_color(sub, lv_color_hex(0x94A3B8), LV_PART_MAIN);
    lv_obj_set_style_text_font(sub, &lv_font_montserrat_12, LV_PART_MAIN);
    lv_obj_align(sub, LV_ALIGN_CENTER, 0, 12);

    if (onCancel) {
        createWifiBackButton(20, -20, 210, LV_ALIGN_BOTTOM_LEFT, onCancel);
    }

    lv_obj_t* btn_ref = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btn_ref, 210, 44);
    lv_obj_align(btn_ref, onCancel ? LV_ALIGN_BOTTOM_RIGHT : LV_ALIGN_BOTTOM_MID, onCancel ? -20 : 0, -20);
    lv_obj_set_style_bg_color(btn_ref, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_radius(btn_ref, 8, LV_PART_MAIN);
    lv_obj_t* lbl_ref = lv_label_create(btn_ref);
    lv_label_set_text(lbl_ref, "Reintentar escaneo");
    lv_obj_center(lbl_ref);
    lv_obj_add_event_cb(btn_ref, [](lv_event_t* e) {
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
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    // Cabecera
    lv_obj_t* title = lv_label_create(lv_scr_act());
    lv_label_set_text(title, "INGRESE LA CONTRASENA");
    lv_obj_set_style_text_color(title, lv_color_hex(0x94A3B8), LV_PART_MAIN);
    lv_obj_set_style_text_font(title, &lv_font_montserrat_12, LV_PART_MAIN);
    lv_obj_align(title, LV_ALIGN_TOP_LEFT, 20, 10);

    lv_obj_t* ssidLbl = lv_label_create(lv_scr_act());
    lv_label_set_text(ssidLbl, ssid ? ssid : "Red WiFi");
    lv_obj_set_style_text_color(ssidLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(ssidLbl, &lv_font_montserrat_16, LV_PART_MAIN);
    lv_obj_align(ssidLbl, LV_ALIGN_TOP_LEFT, 20, 26);

    // Boton Cancelar/Volver en cabecera derecha
    lv_obj_t* btn_back = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btn_back, 85, 34);
    lv_obj_align(btn_back, LV_ALIGN_TOP_RIGHT, -18, 10);
    lv_obj_set_style_bg_color(btn_back, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_radius(btn_back, 6, LV_PART_MAIN);
    lv_obj_t* lbl_b = lv_label_create(btn_back);
    lv_label_set_text(lbl_b, "Volver");
    lv_obj_center(lbl_b);
    lv_obj_add_event_cb(btn_back, [](lv_event_t * e) {
        if (_onBackCb) _onBackCb();
    }, LV_EVENT_CLICKED, NULL);

    // TextArea
    lv_obj_t* ta = lv_textarea_create(lv_scr_act());
    lv_obj_set_size(ta, 330, 42);
    lv_obj_align(ta, LV_ALIGN_TOP_LEFT, 20, 50);
    lv_textarea_set_password_mode(ta, true);
    lv_textarea_set_one_line(ta, true);
    lv_textarea_set_max_length(ta, 63);
    lv_textarea_set_placeholder_text(ta, "Contrasena");
    if (currentPass && strlen(currentPass) > 0) {
        lv_textarea_set_text(ta, currentPass);
    }
    lv_obj_set_style_bg_color(ta, lv_color_hex(0x111827), LV_PART_MAIN);
    lv_obj_set_style_border_color(ta, lv_color_hex(0x2563EB), LV_PART_MAIN);
    lv_obj_set_style_text_color(ta, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(ta, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_set_style_radius(ta, 8, LV_PART_MAIN);

    // Boton Mostrar/Ocultar
    lv_obj_t* btn_eye = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btn_eye, 98, 42);
    lv_obj_align(btn_eye, LV_ALIGN_TOP_RIGHT, -18, 50);
    lv_obj_set_style_bg_color(btn_eye, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_radius(btn_eye, 8, LV_PART_MAIN);
    lv_obj_t* lbl_eye = lv_label_create(btn_eye);
    lv_label_set_text(lbl_eye, "Ver");
    lv_obj_center(lbl_eye);
    lv_obj_add_event_cb(btn_eye, [](lv_event_t * e) {
        lv_obj_t* target_ta = (lv_obj_t*)lv_event_get_user_data(e);
        bool current = lv_textarea_get_password_mode(target_ta);
        lv_textarea_set_password_mode(target_ta, !current);
        lv_obj_t* label = lv_obj_get_child(lv_event_get_target(e), 0);
        lv_label_set_text(label, !current ? "Ocultar" : "Ver");
    }, LV_EVENT_CLICKED, ta);

    // Teclado virtual
    lv_obj_t* kb = lv_keyboard_create(lv_scr_act());
    lv_obj_set_size(kb, 444, 215);
    lv_obj_align(kb, LV_ALIGN_BOTTOM_MID, 0, -5);
    lv_keyboard_set_textarea(kb, ta);
    lv_obj_set_style_bg_color(kb, lv_color_hex(0x0E141E), LV_PART_MAIN);
    lv_obj_set_style_radius(kb, 10, LV_PART_MAIN);

    lv_obj_add_event_cb(kb, [](lv_event_t * e) {
        lv_event_code_t code = lv_event_get_code(e);
        if (code == LV_EVENT_READY) {
            lv_obj_t* target_ta = (lv_obj_t*)lv_event_get_user_data(e);
            const char* passText = lv_textarea_get_text(target_ta);
            if (_onConnectCb) _onConnectCb(passText);
        } else if (code == LV_EVENT_CANCEL) {
            if (_onBackCb) _onBackCb();
        }
    }, LV_EVENT_ALL, ta);
}
