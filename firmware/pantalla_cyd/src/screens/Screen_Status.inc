// ============================================================
// Screen_Status.inc — Modulo 7: Mensajes de Estado Genericos
// showStatusMessage
// ============================================================
// NOTA: Este archivo es incluido por LvglManager.cpp
//       No compilar de forma independiente.
// ============================================================

void LvglManager::showStatusMessage(bool success, const char* badge, const char* title, const char* subtitle) {
    if (!_initialized) return;
    _active = true;
    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    lv_color_t colorAcc = success ? lv_color_hex(0x10B981) : lv_color_hex(0xEF4444);

    lv_obj_t* card = lv_obj_create(lv_scr_act());
    lv_obj_set_size(card, 440, 240);
    lv_obj_center(card);
    lv_obj_set_style_bg_color(card, lv_color_hex(0x111827), LV_PART_MAIN);
    lv_obj_set_style_border_color(card, colorAcc, LV_PART_MAIN);
    lv_obj_set_style_border_width(card, 2, LV_PART_MAIN);
    lv_obj_set_style_radius(card, 16, LV_PART_MAIN);
    lv_obj_clear_flag(card, LV_OBJ_FLAG_SCROLLABLE);

    if (badge) {
        lv_obj_t* bObj = lv_obj_create(card);
        lv_obj_set_size(bObj, 220, 28);
        lv_obj_align(bObj, LV_ALIGN_TOP_MID, 0, 12);
        lv_obj_set_style_bg_color(bObj, colorAcc, LV_PART_MAIN);
        lv_obj_set_style_radius(bObj, 6, LV_PART_MAIN);
        lv_obj_t* bLbl = lv_label_create(bObj);
        String cleanBadge = sanitizeForDisplay(badge);
        lv_label_set_text(bLbl, cleanBadge.c_str());
        lv_obj_set_style_text_color(bLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
        lv_obj_set_style_text_font(bLbl, &lv_font_montserrat_12, LV_PART_MAIN);
        lv_obj_center(bLbl);
    }

    if (title) {
        lv_obj_t* tLbl = lv_label_create(card);
        String cleanTitle = sanitizeForDisplay(title);
        lv_label_set_text(tLbl, cleanTitle.c_str());
        lv_obj_set_style_text_color(tLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
        lv_obj_set_style_text_font(tLbl, &lv_font_montserrat_20, LV_PART_MAIN);
        lv_obj_align(tLbl, LV_ALIGN_CENTER, 0, -5);
    }

    if (subtitle) {
        lv_obj_t* sLbl = lv_label_create(card);
        String cleanSub = sanitizeForDisplay(subtitle);
        lv_label_set_text(sLbl, cleanSub.c_str());
        lv_obj_set_style_text_color(sLbl, lv_color_hex(0x94A3B8), LV_PART_MAIN);
        lv_obj_set_style_text_font(sLbl, &lv_font_montserrat_14, LV_PART_MAIN);
        lv_obj_align(sLbl, LV_ALIGN_CENTER, 0, 32);
    }
}
