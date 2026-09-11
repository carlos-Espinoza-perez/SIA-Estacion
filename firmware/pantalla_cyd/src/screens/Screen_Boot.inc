// ============================================================
// Screen_Boot.inc — Modulo 1: Conectividad y Arranque
// showBoot | updateBootStatus | showConnecting | showBootNoNetwork
// ============================================================
// NOTA: Este archivo es incluido por LvglManager.cpp
//       No compilar de forma independiente.
// ============================================================

void LvglManager::showBoot(const char* title, const char* subtitle) {
    if (!_initialized) return;
    _active = true;
    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    // Contenedor Central
    lv_obj_t* card = lv_obj_create(lv_scr_act());
    lv_obj_set_size(card, 420, 240);
    lv_obj_center(card);
    lv_obj_set_style_bg_color(card, lv_color_hex(0x111827), LV_PART_MAIN);
    lv_obj_set_style_border_color(card, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_border_width(card, 1, LV_PART_MAIN);
    lv_obj_set_style_radius(card, 16, LV_PART_MAIN);
    lv_obj_clear_flag(card, LV_OBJ_FLAG_SCROLLABLE);

    // Logo SIA Badge
    lv_obj_t* badge = lv_obj_create(card);
    lv_obj_set_size(badge, 64, 64);
    lv_obj_align(badge, LV_ALIGN_TOP_MID, 0, 10);
    lv_obj_set_style_bg_color(badge, lv_color_hex(0x2563EB), LV_PART_MAIN);
    lv_obj_set_style_radius(badge, 14, LV_PART_MAIN);
    lv_obj_clear_flag(badge, LV_OBJ_FLAG_SCROLLABLE);

    lv_obj_t* badgeLbl = lv_label_create(badge);
    lv_label_set_text(badgeLbl, "SIA");
    lv_obj_set_style_text_color(badgeLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(badgeLbl, &lv_font_montserrat_20, LV_PART_MAIN);
    lv_obj_center(badgeLbl);

    // Titulo
    lv_obj_t* titleLbl = lv_label_create(card);
    lv_label_set_text(titleLbl, title ? title : "Sistema de Identificacion Automatica");
    lv_obj_set_style_text_color(titleLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(titleLbl, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(titleLbl, LV_ALIGN_TOP_MID, 0, 86);

    // Subtitulo dinamico
    _bootSubtitleLabel = lv_label_create(card);
    lv_label_set_text(_bootSubtitleLabel, subtitle ? subtitle : "Iniciando sistema...");
    lv_obj_set_style_text_color(_bootSubtitleLabel, lv_color_hex(0x94A3B8), LV_PART_MAIN);
    lv_obj_set_style_text_font(_bootSubtitleLabel, &lv_font_montserrat_12, LV_PART_MAIN);
    lv_obj_align(_bootSubtitleLabel, LV_ALIGN_TOP_MID, 0, 114);

    // Spinner
    lv_obj_t* spinner = lv_spinner_create(card, 1000, 60);
    lv_obj_set_size(spinner, 40, 40);
    lv_obj_align(spinner, LV_ALIGN_BOTTOM_MID, 0, -15);
    lv_obj_set_style_arc_color(spinner, lv_color_hex(0x2563EB), LV_PART_INDICATOR);
    lv_obj_set_style_arc_color(spinner, lv_color_hex(0x1F2937), LV_PART_MAIN);
}

void LvglManager::updateBootStatus(const char* subtitle) {
    if (_bootSubtitleLabel && subtitle) {
        lv_label_set_text(_bootSubtitleLabel, subtitle);
    }
}

void LvglManager::showConnecting(const char* ssid) {
    if (!_initialized) return;
    _active = true;
    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    lv_obj_t* card = lv_obj_create(lv_scr_act());
    lv_obj_set_size(card, 420, 220);
    lv_obj_center(card);
    lv_obj_set_style_bg_color(card, lv_color_hex(0x111827), LV_PART_MAIN);
    lv_obj_set_style_border_color(card, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_radius(card, 14, LV_PART_MAIN);
    lv_obj_clear_flag(card, LV_OBJ_FLAG_SCROLLABLE);

    // Badge
    lv_obj_t* badge = lv_obj_create(card);
    lv_obj_set_size(badge, 180, 26);
    lv_obj_align(badge, LV_ALIGN_TOP_MID, 0, 10);
    lv_obj_set_style_bg_color(badge, lv_color_hex(0x1D4ED8), LV_PART_MAIN);
    lv_obj_set_style_radius(badge, 6, LV_PART_MAIN);
    lv_obj_clear_flag(badge, LV_OBJ_FLAG_SCROLLABLE);

    lv_obj_t* badgeLbl = lv_label_create(badge);
    lv_label_set_text(badgeLbl, "CONECTANDO A LA RED");
    lv_obj_set_style_text_color(badgeLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(badgeLbl, &lv_font_montserrat_12, LV_PART_MAIN);
    lv_obj_center(badgeLbl);

    // SSID
    char ssidBuf[64];
    snprintf(ssidBuf, sizeof(ssidBuf), "Conectando a %s", ssid ? ssid : "la red");
    lv_obj_t* titleLbl = lv_label_create(card);
    lv_label_set_text(titleLbl, ssidBuf);
    lv_obj_set_style_text_color(titleLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(titleLbl, &lv_font_montserrat_16, LV_PART_MAIN);
    lv_obj_align(titleLbl, LV_ALIGN_CENTER, 0, -10);

    lv_obj_t* subLbl = lv_label_create(card);
    lv_label_set_text(subLbl, "Espera un momento...");
    lv_obj_set_style_text_color(subLbl, lv_color_hex(0x94A3B8), LV_PART_MAIN);
    lv_obj_set_style_text_font(subLbl, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(subLbl, LV_ALIGN_CENTER, 0, 18);

    // Spinner
    lv_obj_t* spinner = lv_spinner_create(card, 1000, 60);
    lv_obj_set_size(spinner, 36, 36);
    lv_obj_align(spinner, LV_ALIGN_BOTTOM_MID, 0, -10);
    lv_obj_set_style_arc_color(spinner, lv_color_hex(0x2563EB), LV_PART_INDICATOR);
    lv_obj_set_style_arc_color(spinner, lv_color_hex(0x1F2937), LV_PART_MAIN);
}

void LvglManager::showBootNoNetwork(const char* ssid, std::function<void()> onRetry, std::function<void()> onConfig) {
    if (!_initialized) return;
    _onRefreshCb = onRetry;
    _onOtherCb = onConfig;
    _active = true;
    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    createFigmaHeader("Sin conexion a la red", ssid ? ssid : "Red Wi-Fi");

    lv_obj_t* card = lv_obj_create(lv_scr_act());
    lv_obj_set_size(card, 440, 170);
    lv_obj_align(card, LV_ALIGN_TOP_MID, 0, 72);
    lv_obj_set_style_bg_color(card, lv_color_hex(0x111827), LV_PART_MAIN);
    lv_obj_set_style_border_color(card, lv_color_hex(0xEF4444), LV_PART_MAIN);
    lv_obj_set_style_border_width(card, 1, LV_PART_MAIN);
    lv_obj_set_style_radius(card, 12, LV_PART_MAIN);

    lv_obj_t* badge = lv_obj_create(card);
    lv_obj_set_size(badge, 170, 24);
    lv_obj_align(badge, LV_ALIGN_TOP_LEFT, 0, 0);
    lv_obj_set_style_bg_color(badge, lv_color_hex(0x7F1D1D), LV_PART_MAIN);
    lv_obj_set_style_radius(badge, 6, LV_PART_MAIN);
    lv_obj_t* bLbl = lv_label_create(badge);
    lv_label_set_text(bLbl, "ERROR DE CONEXION");
    lv_obj_set_style_text_color(bLbl, lv_color_hex(0xFCA5A5), LV_PART_MAIN);
    lv_obj_set_style_text_font(bLbl, &lv_font_montserrat_12, LV_PART_MAIN);
    lv_obj_center(bLbl);

    char buf[128];
    snprintf(buf, sizeof(buf), "Intentando conectar a: %s\nNo se pudo establecer conexion.", ssid ? ssid : "SIA-LAB");
    lv_obj_t* textLbl = lv_label_create(card);
    lv_label_set_text(textLbl, buf);
    lv_obj_set_style_text_color(textLbl, lv_color_hex(0xE2E8F0), LV_PART_MAIN);
    lv_obj_set_style_text_font(textLbl, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(textLbl, LV_ALIGN_LEFT_MID, 0, 10);

    // Botones
    lv_obj_t* btnRetry = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btnRetry, 210, 48);
    lv_obj_align(btnRetry, LV_ALIGN_BOTTOM_LEFT, 20, -14);
    lv_obj_set_style_bg_color(btnRetry, lv_color_hex(0x2563EB), LV_PART_MAIN);
    lv_obj_set_style_radius(btnRetry, 8, LV_PART_MAIN);
    lv_obj_t* rLbl = lv_label_create(btnRetry);
    lv_label_set_text(rLbl, "Reintentar conexion");
    lv_obj_center(rLbl);
    lv_obj_add_event_cb(btnRetry, [](lv_event_t* e) {
        if (_onRefreshCb) _onRefreshCb();
    }, LV_EVENT_CLICKED, NULL);

    lv_obj_t* btnCfg = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btnCfg, 210, 48);
    lv_obj_align(btnCfg, LV_ALIGN_BOTTOM_RIGHT, -20, -14);
    lv_obj_set_style_bg_color(btnCfg, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_radius(btnCfg, 8, LV_PART_MAIN);
    lv_obj_t* cLbl = lv_label_create(btnCfg);
    lv_label_set_text(cLbl, "Seleccionar red");
    lv_obj_center(cLbl);
    lv_obj_add_event_cb(btnCfg, [](lv_event_t* e) {
        if (_onOtherCb) _onOtherCb();
    }, LV_EVENT_CLICKED, NULL);
}
