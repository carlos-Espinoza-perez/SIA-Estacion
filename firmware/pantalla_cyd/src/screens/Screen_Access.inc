// ============================================================
// Screen_Access.inc — Modulo 4: Control de Acceso (Operacion Normal)
// showWaiting | showProcessing | showIdentityDetected | showGranted | showDenied | showOfflineMode | showError | showOutOfService
// ============================================================
// NOTA: Este archivo es incluido por LvglManager.cpp
//       No compilar de forma independiente.
// ============================================================

void LvglManager::showWaiting(const char* title, const char* subtitle, std::function<void()> onAdminClick) {
    if (!_initialized) return;
    _onAdminClickCb = onAdminClick;
    _active = true;
    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    // Barra superior con Nombre de la Estacion y Estado de Red
    lv_obj_t* topBar = lv_obj_create(lv_scr_act());
    lv_obj_set_size(topBar, 440, 42);
    lv_obj_align(topBar, LV_ALIGN_TOP_MID, 0, 8);
    lv_obj_set_style_bg_color(topBar, lv_color_hex(0x111827), LV_PART_MAIN);
    lv_obj_set_style_border_color(topBar, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_border_width(topBar, 1, LV_PART_MAIN);
    lv_obj_set_style_radius(topBar, 8, LV_PART_MAIN);
    lv_obj_clear_flag(topBar, LV_OBJ_FLAG_SCROLLABLE);

    char topText[96];
    String cleanTitle = sanitizeForDisplay((title && title[0]) ? title : "Estacion lista");
    snprintf(topText, sizeof(topText), "SIA - %s", cleanTitle.c_str());
    lv_obj_t* statusLbl = lv_label_create(topBar);
    lv_label_set_text(statusLbl, topText);
    lv_obj_set_style_text_color(statusLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(statusLbl, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(statusLbl, LV_ALIGN_LEFT_MID, 10, 0);

    // Indicador descriptivo a la derecha
    lv_obj_t* statusRight = lv_label_create(topBar);
    lv_label_set_text(statusRight, "Ingreso / Salida de personal");
    lv_obj_set_style_text_color(statusRight, lv_color_hex(0x34D399), LV_PART_MAIN);
    lv_obj_set_style_text_font(statusRight, &lv_font_montserrat_12, LV_PART_MAIN);
    lv_obj_align(statusRight, LV_ALIGN_RIGHT_MID, -10, 0);

    // Acceso de respaldo opcional: 3 toques rapidos sobre la barra (invisible al publico)
    if (_onAdminClickCb) {
        lv_obj_add_flag(topBar, LV_OBJ_FLAG_CLICKABLE);
        lv_obj_add_event_cb(topBar, [](lv_event_t* e) {
            static uint32_t lastTap = 0;
            static int tapCount = 0;
            uint32_t now = millis();
            if (now - lastTap < 700) {
                tapCount++;
                if (tapCount >= 3) {
                    tapCount = 0;
                    if (_onAdminClickCb) _onAdminClickCb();
                }
            } else {
                tapCount = 1;
            }
            lastTap = now;
        }, LV_EVENT_CLICKED, NULL);
    }

    // Marco central de escaneo punteado/estilizado (Figma: 140x140 at center)
    lv_obj_t* scanBox = lv_obj_create(lv_scr_act());
    lv_obj_set_size(scanBox, 140, 140);
    lv_obj_align(scanBox, LV_ALIGN_TOP_MID, 0, 58);
    lv_obj_set_style_bg_color(scanBox, lv_color_hex(0x0E1726), LV_PART_MAIN);
    lv_obj_set_style_border_color(scanBox, lv_color_hex(0x2563EB), LV_PART_MAIN);
    lv_obj_set_style_border_width(scanBox, 2, LV_PART_MAIN);
    lv_obj_set_style_radius(scanBox, 16, LV_PART_MAIN);
    lv_obj_clear_flag(scanBox, LV_OBJ_FLAG_SCROLLABLE);

    // Mira o icono representativo de escaner
    lv_obj_t* qrIcon = lv_label_create(scanBox);
    lv_label_set_text(qrIcon, LV_SYMBOL_IMAGE);
    lv_obj_set_style_text_color(qrIcon, lv_color_hex(0x3B82F6), LV_PART_MAIN);
    lv_obj_set_style_text_font(qrIcon, &lv_font_montserrat_24, LV_PART_MAIN);
    lv_obj_center(qrIcon);

    // Titulo Principal exacto Figma: "Acerca tu codigo QR"
    lv_obj_t* tLbl = lv_label_create(lv_scr_act());
    lv_label_set_text(tLbl, "Acerca tu codigo QR");
    lv_obj_set_style_text_color(tLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(tLbl, &lv_font_montserrat_20, LV_PART_MAIN);
    lv_obj_align(tLbl, LV_ALIGN_TOP_MID, 0, 208);

    // Subtitulo exacto Figma: "Estacion lista"
    lv_obj_t* sLbl = lv_label_create(lv_scr_act());
    String cleanSub = sanitizeForDisplay((subtitle && subtitle[0]) ? subtitle : "Estacion lista - Carnet universitario");
    lv_label_set_text(sLbl, cleanSub.c_str());
    lv_obj_set_style_text_color(sLbl, lv_color_hex(0x94A3B8), LV_PART_MAIN);
    lv_obj_set_style_text_font(sLbl, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(sLbl, LV_ALIGN_TOP_MID, 0, 238);

    // Texto explicativo inferior
    lv_obj_t* camLbl = lv_label_create(lv_scr_act());
    lv_label_set_text(camLbl, "Acerca tu codigo QR o carnet frente a la camara");
    lv_obj_set_style_text_color(camLbl, lv_color_hex(0x60A5FA), LV_PART_MAIN);
    lv_obj_set_style_text_font(camLbl, &lv_font_montserrat_12, LV_PART_MAIN);
    lv_obj_align(camLbl, LV_ALIGN_BOTTOM_MID, 0, -8);
}

void LvglManager::showProcessing(const char* title, const char* subtitle) {
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

    lv_obj_t* spinner = lv_spinner_create(card, 1000, 60);
    lv_obj_set_size(spinner, 54, 54);
    lv_obj_align(spinner, LV_ALIGN_CENTER, 0, -35);
    lv_obj_set_style_arc_color(spinner, lv_color_hex(0x2563EB), LV_PART_INDICATOR);
    lv_obj_set_style_arc_color(spinner, lv_color_hex(0x1F2937), LV_PART_MAIN);

    lv_obj_t* tLbl = lv_label_create(card);
    lv_label_set_text(tLbl, title ? title : "Verificando");
    lv_obj_set_style_text_color(tLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(tLbl, &lv_font_montserrat_18, LV_PART_MAIN);
    lv_obj_align(tLbl, LV_ALIGN_CENTER, 0, 20);

    lv_obj_t* sLbl = lv_label_create(card);
    lv_label_set_text(sLbl, subtitle ? subtitle : "Consultando con el sistema...");
    lv_obj_set_style_text_color(sLbl, lv_color_hex(0x94A3B8), LV_PART_MAIN);
    lv_obj_set_style_text_font(sLbl, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(sLbl, LV_ALIGN_CENTER, 0, 48);
}

void LvglManager::showIdentityDetected(const char* name, const char* subtitle) {
    if (!_initialized) return;
    _active = true;
    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    lv_obj_t* card = lv_obj_create(lv_scr_act());
    lv_obj_set_size(card, 440, 240);
    lv_obj_center(card);
    lv_obj_set_style_bg_color(card, lv_color_hex(0x111827), LV_PART_MAIN);
    lv_obj_set_style_border_color(card, lv_color_hex(0x2563EB), LV_PART_MAIN);
    lv_obj_set_style_radius(card, 14, LV_PART_MAIN);
    lv_obj_clear_flag(card, LV_OBJ_FLAG_SCROLLABLE);

    lv_obj_t* badge = lv_obj_create(card);
    lv_obj_set_size(badge, 170, 26);
    lv_obj_align(badge, LV_ALIGN_TOP_MID, 0, 10);
    lv_obj_set_style_bg_color(badge, lv_color_hex(0x1D4ED8), LV_PART_MAIN);
    lv_obj_set_style_radius(badge, 6, LV_PART_MAIN);
    lv_obj_t* bLbl = lv_label_create(badge);
    lv_label_set_text(bLbl, "IDENTIDAD DETECTADA");
    lv_obj_set_style_text_color(bLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(bLbl, &lv_font_montserrat_12, LV_PART_MAIN);
    lv_obj_center(bLbl);

    lv_obj_t* nameLbl = lv_label_create(card);
    lv_label_set_text(nameLbl, name ? name : "Usuario detectado");
    lv_obj_set_style_text_color(nameLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(nameLbl, &lv_font_montserrat_20, LV_PART_MAIN);
    lv_obj_align(nameLbl, LV_ALIGN_CENTER, 0, -10);

    lv_obj_t* sLbl = lv_label_create(card);
    lv_label_set_text(sLbl, subtitle ? subtitle : "Mira hacia la camara");
    lv_obj_set_style_text_color(sLbl, lv_color_hex(0x60A5FA), LV_PART_MAIN);
    lv_obj_set_style_text_font(sLbl, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(sLbl, LV_ALIGN_CENTER, 0, 24);
}

void LvglManager::showGranted(const char* person, const char* item) {
    showStatusMessage(true, "ACCESO CONCEDIDO", person ? person : "Usuario Identificado", item ? item : "Autorizado");
}

void LvglManager::showDenied(const char* reason) {
    showStatusMessage(false, "ACCESO DENEGADO", reason ? reason : "No autorizado", "Consulta con el administrador");
}

void LvglManager::showOfflineMode(std::function<void()> onAdminClick) {
    if (!_initialized) return;
    _onAdminClickCb = onAdminClick;
    _active = true;
    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    lv_obj_t* topBar = lv_obj_create(lv_scr_act());
    lv_obj_set_size(topBar, 440, 40);
    lv_obj_align(topBar, LV_ALIGN_TOP_MID, 0, 10);
    lv_obj_set_style_bg_color(topBar, lv_color_hex(0x78350F), LV_PART_MAIN);
    lv_obj_set_style_radius(topBar, 8, LV_PART_MAIN);
    lv_obj_clear_flag(topBar, LV_OBJ_FLAG_SCROLLABLE);

    lv_obj_t* statusLbl = lv_label_create(topBar);
    lv_label_set_text(statusLbl, LV_SYMBOL_WARNING " MODO SIN CONEXION");
    lv_obj_set_style_text_color(statusLbl, lv_color_hex(0xFDE68A), LV_PART_MAIN);
    lv_obj_set_style_text_font(statusLbl, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(statusLbl, LV_ALIGN_LEFT_MID, 0, 0);

    // Acceso de respaldo local: 3 toques rapidos sobre la barra. El QR admin necesita
    // conexion (el servidor lo confirma), asi que sin red esta es la unica entrada al panel.
    if (_onAdminClickCb) {
        lv_obj_add_flag(topBar, LV_OBJ_FLAG_CLICKABLE);
        lv_obj_add_event_cb(topBar, [](lv_event_t* e) {
            static uint32_t lastTap = 0;
            static int tapCount = 0;
            uint32_t now = millis();
            if (now - lastTap < 700) {
                tapCount++;
                if (tapCount >= 3) {
                    tapCount = 0;
                    if (_onAdminClickCb) _onAdminClickCb();
                }
            } else {
                tapCount = 1;
            }
            lastTap = now;
        }, LV_EVENT_CLICKED, NULL);
    }

    lv_obj_t* card = lv_obj_create(lv_scr_act());
    lv_obj_set_size(card, 440, 220);
    lv_obj_align(card, LV_ALIGN_TOP_MID, 0, 60);
    lv_obj_set_style_bg_color(card, lv_color_hex(0x111827), LV_PART_MAIN);
    lv_obj_set_style_border_color(card, lv_color_hex(0xD97706), LV_PART_MAIN);
    lv_obj_set_style_border_width(card, 2, LV_PART_MAIN);
    lv_obj_set_style_radius(card, 14, LV_PART_MAIN);
    lv_obj_clear_flag(card, LV_OBJ_FLAG_SCROLLABLE);

    lv_obj_t* tLbl = lv_label_create(card);
    lv_label_set_text(tLbl, "Acerca tu codigo QR");
    lv_obj_set_style_text_color(tLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(tLbl, &lv_font_montserrat_20, LV_PART_MAIN);
    lv_obj_align(tLbl, LV_ALIGN_CENTER, 0, -25);

    lv_obj_t* sLbl = lv_label_create(card);
    lv_label_set_text(sLbl, "Validando solo contra la copia local");
    lv_obj_set_style_text_color(sLbl, lv_color_hex(0xF59E0B), LV_PART_MAIN);
    lv_obj_set_style_text_font(sLbl, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(sLbl, LV_ALIGN_CENTER, 0, 15);
}

void LvglManager::showError(const char* title, const char* subtitle, std::function<void()> onDismiss) {
    showStatusMessage(false, "ERROR", title ? title : "QR no reconocido", subtitle ? subtitle : "Intente nuevamente");
}

void LvglManager::showOutOfService(const char* reason, const char* hint) {
    if (!_initialized) return;
    _active = true;
    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    lv_obj_t* card = lv_obj_create(lv_scr_act());
    lv_obj_set_size(card, 440, 240);
    lv_obj_center(card);
    lv_obj_set_style_bg_color(card, lv_color_hex(0x111827), LV_PART_MAIN);
    lv_obj_set_style_border_color(card, lv_color_hex(0xDC2626), LV_PART_MAIN);
    lv_obj_set_style_border_width(card, 2, LV_PART_MAIN);
    lv_obj_set_style_radius(card, 14, LV_PART_MAIN);

    lv_obj_t* badge = lv_obj_create(card);
    lv_obj_set_size(badge, 160, 26);
    lv_obj_align(badge, LV_ALIGN_TOP_MID, 0, 10);
    lv_obj_set_style_bg_color(badge, lv_color_hex(0x7F1D1D), LV_PART_MAIN);
    lv_obj_set_style_radius(badge, 6, LV_PART_MAIN);
    lv_obj_t* bLbl = lv_label_create(badge);
    lv_label_set_text(bLbl, "FUERA DE SERVICIO");
    lv_obj_set_style_text_color(bLbl, lv_color_hex(0xFCA5A5), LV_PART_MAIN);
    lv_obj_center(bLbl);

    lv_obj_t* tLbl = lv_label_create(card);
    lv_label_set_text(tLbl, reason ? reason : "Estacion fuera de servicio");
    lv_obj_set_style_text_color(tLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(tLbl, &lv_font_montserrat_18, LV_PART_MAIN);
    lv_obj_align(tLbl, LV_ALIGN_CENTER, 0, -10);

    lv_obj_t* sLbl = lv_label_create(card);
    lv_label_set_text(sLbl, hint ? hint : "Contacta al encargado del laboratorio.");
    lv_obj_set_style_text_color(sLbl, lv_color_hex(0x94A3B8), LV_PART_MAIN);
    lv_obj_set_style_text_font(sLbl, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(sLbl, LV_ALIGN_CENTER, 0, 24);
}
