// ============================================================
// Screen_Pairing.inc — Modulo 3: Vinculacion Inicial (Unpaired / Setup)
// showUnconfigured | showLinkCode | showLinked
// ============================================================
// NOTA: Este archivo es incluido por LvglManager.cpp
//       No compilar de forma independiente.
// ============================================================

void LvglManager::showUnconfigured(std::function<void()> onStart) {
    if (!_initialized) return;
    _onAction1Cb = onStart;
    _active = true;
    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    lv_obj_t* card = lv_obj_create(lv_scr_act());
    lv_obj_set_size(card, 440, 260);
    lv_obj_center(card);
    lv_obj_set_style_bg_color(card, lv_color_hex(0x111827), LV_PART_MAIN);
    lv_obj_set_style_border_color(card, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_radius(card, 16, LV_PART_MAIN);
    lv_obj_clear_flag(card, LV_OBJ_FLAG_SCROLLABLE);

    // Badge
    lv_obj_t* badge = lv_obj_create(card);
    lv_obj_set_size(badge, 120, 26);
    lv_obj_align(badge, LV_ALIGN_TOP_MID, 0, 10);
    lv_obj_set_style_bg_color(badge, lv_color_hex(0x1E3A8A), LV_PART_MAIN);
    lv_obj_set_style_radius(badge, 6, LV_PART_MAIN);
    lv_obj_t* bLbl = lv_label_create(badge);
    lv_label_set_text(bLbl, "SISTEMA SIA");
    lv_obj_set_style_text_color(bLbl, lv_color_hex(0x93C5FD), LV_PART_MAIN);
    lv_obj_center(bLbl);

    // Titulo
    lv_obj_t* tLbl = lv_label_create(card);
    lv_label_set_text(tLbl, "Estacion sin configurar");
    lv_obj_set_style_text_color(tLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(tLbl, &lv_font_montserrat_20, LV_PART_MAIN);
    lv_obj_align(tLbl, LV_ALIGN_TOP_MID, 0, 52);

    // Subtitulo
    lv_obj_t* sLbl = lv_label_create(card);
    lv_label_set_text(sLbl, "Este equipo aun no esta vinculado al sistema.\nInicia el proceso para registrar esta estacion.");
    lv_obj_set_style_text_align(sLbl, LV_TEXT_ALIGN_CENTER, LV_PART_MAIN);
    lv_obj_set_style_text_color(sLbl, lv_color_hex(0x94A3B8), LV_PART_MAIN);
    lv_obj_set_style_text_font(sLbl, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(sLbl, LV_ALIGN_CENTER, 0, 10);

    // Boton comenzar
    lv_obj_t* btn = lv_btn_create(card);
    lv_obj_set_size(btn, 360, 50);
    lv_obj_align(btn, LV_ALIGN_BOTTOM_MID, 0, -10);
    lv_obj_set_style_bg_color(btn, lv_color_hex(0x2563EB), LV_PART_MAIN);
    lv_obj_set_style_radius(btn, 10, LV_PART_MAIN);
    lv_obj_t* btnLbl = lv_label_create(btn);
    lv_label_set_text(btnLbl, "Toca la pantalla para comenzar");
    lv_obj_set_style_text_font(btnLbl, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_center(btnLbl);

    lv_obj_add_event_cb(btn, [](lv_event_t* e) {
        if (_onAction1Cb) _onAction1Cb();
    }, LV_EVENT_CLICKED, NULL);
}

void LvglManager::showLinkCode(const char* code, const char* qrPayload, std::function<void()> onCancel) {
    if (!_initialized) return;
    _onBackCb = onCancel;
    _active = true;
    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x18181B), LV_PART_MAIN);

    // Etiqueta "SIA" arriba a la izquierda
    lv_obj_t* siaLbl = lv_label_create(lv_scr_act());
    lv_label_set_text(siaLbl, "SIA");
    lv_obj_set_style_text_color(siaLbl, lv_color_hex(0x71717A), LV_PART_MAIN);
    lv_obj_set_style_text_font(siaLbl, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(siaLbl, LV_ALIGN_TOP_LEFT, 24, 16);

    // Titulo central "Vincular estación"
    lv_obj_t* titleLbl = lv_label_create(lv_scr_act());
    lv_label_set_text(titleLbl, "Vincular estacion");
    lv_obj_set_style_text_color(titleLbl, lv_color_white(), LV_PART_MAIN);
    lv_obj_set_style_text_font(titleLbl, &lv_font_montserrat_18, LV_PART_MAIN);
    lv_obj_align(titleLbl, LV_ALIGN_TOP_MID, 0, 14);

    // Tarjeta blanca centrada para el codigo QR
    lv_obj_t* qrBox = lv_obj_create(lv_scr_act());
    lv_obj_set_size(qrBox, 154, 154);
    lv_obj_align(qrBox, LV_ALIGN_TOP_MID, 0, 46);
    lv_obj_set_style_bg_color(qrBox, lv_color_white(), LV_PART_MAIN);
    lv_obj_set_style_bg_opa(qrBox, LV_OPA_COVER, LV_PART_MAIN);
    lv_obj_set_style_radius(qrBox, 14, LV_PART_MAIN);
    lv_obj_set_style_border_width(qrBox, 0, LV_PART_MAIN);
    lv_obj_set_style_border_opa(qrBox, LV_OPA_TRANSP, LV_PART_MAIN);  // elimina borde oscuro del tema
    lv_obj_set_style_outline_width(qrBox, 0, LV_PART_MAIN);
    lv_obj_set_style_shadow_width(qrBox, 0, LV_PART_MAIN);
    lv_obj_set_style_pad_all(qrBox, 0, LV_PART_MAIN);
    lv_obj_set_style_clip_corner(qrBox, true, LV_PART_MAIN);  // recorta canvas a esquinas redondeadas
    lv_obj_clear_flag(qrBox, LV_OBJ_FLAG_SCROLLABLE);

    lv_obj_t* canvas = lv_canvas_create(qrBox);
    lv_obj_set_style_bg_color(canvas, lv_color_white(), LV_PART_MAIN);
    lv_obj_set_style_bg_opa(canvas, LV_OPA_COVER, LV_PART_MAIN);
    lv_obj_set_style_border_width(canvas, 0, LV_PART_MAIN);
    lv_obj_set_style_border_opa(canvas, LV_OPA_TRANSP, LV_PART_MAIN);
    lv_obj_center(canvas);
    renderQrOnCanvas(canvas, qrPayload ? qrPayload : (code ? code : "SIA-CYD"));

    // Texto descriptivo debajo del QR
    lv_obj_t* subLbl = lv_label_create(lv_scr_act());
    lv_label_set_text(subLbl, "Escanee este codigo QR o ingrese el siguiente numero:");
    lv_obj_set_style_text_color(subLbl, lv_color_hex(0x94A3B8), LV_PART_MAIN);
    lv_obj_set_style_text_font(subLbl, &lv_font_montserrat_12, LV_PART_MAIN);
    lv_obj_align(subLbl, LV_ALIGN_TOP_MID, 0, 214);

    // Pastilla/contenedor inferior para el codigo alfanumerico (Clean MAC)
    lv_obj_t* codeCard = lv_obj_create(lv_scr_act());
    lv_obj_set_size(codeCard, 290, 42);
    lv_obj_align(codeCard, LV_ALIGN_TOP_MID, 0, 246);
    lv_obj_set_style_bg_color(codeCard, lv_color_hex(0x27272A), LV_PART_MAIN);
    lv_obj_set_style_border_color(codeCard, lv_color_hex(0x3F3F46), LV_PART_MAIN);
    lv_obj_set_style_border_width(codeCard, 1, LV_PART_MAIN);
    lv_obj_set_style_radius(codeCard, 10, LV_PART_MAIN);
    lv_obj_clear_flag(codeCard, LV_OBJ_FLAG_SCROLLABLE);

    lv_obj_t* codeVal = lv_label_create(codeCard);
    lv_label_set_text(codeVal, code ? code : "A4CF128B9E70");
    lv_obj_set_style_text_color(codeVal, lv_color_hex(0x60A5FA), LV_PART_MAIN);
    lv_obj_set_style_text_font(codeVal, &lv_font_montserrat_18, LV_PART_MAIN);
    lv_obj_center(codeVal);

    if (onCancel) {
        lv_obj_add_event_cb(codeCard, [](lv_event_t* e) {
            if (_onBackCb) _onBackCb();
        }, LV_EVENT_CLICKED, NULL);
    }
}

void LvglManager::showLinked(const char* name, const char* mode) {
    showStatusMessage(true, "ESTACION VINCULADA", name ? name : "Laboratorio de Electronica", mode ? mode : "Control de acceso");
}
