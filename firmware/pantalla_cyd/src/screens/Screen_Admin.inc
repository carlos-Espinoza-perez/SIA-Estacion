// ============================================================
// Screen_Admin.inc — Modulo 6: Administracion Local
// showAdminDetected | showAdminPanel | showAdminSync | showAdminStorage | showAdminConfig
// ============================================================
// NOTA: Este archivo es incluido por LvglManager.cpp
//       No compilar de forma independiente.
// ============================================================

void LvglManager::showAdminDetected(std::function<void()> onEnter) {
    if (!_initialized) return;
    _onAction1Cb = onEnter;
    _active = true;
    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    lv_obj_t* card = lv_obj_create(lv_scr_act());
    lv_obj_set_size(card, 440, 240);
    lv_obj_center(card);
    lv_obj_set_style_bg_color(card, lv_color_hex(0x111827), LV_PART_MAIN);
    lv_obj_set_style_border_color(card, lv_color_hex(0x2563EB), LV_PART_MAIN);
    lv_obj_set_style_radius(card, 14, LV_PART_MAIN);

    lv_obj_t* badge = lv_obj_create(card);
    lv_obj_set_size(badge, 180, 26);
    lv_obj_align(badge, LV_ALIGN_TOP_MID, 0, 10);
    lv_obj_set_style_bg_color(badge, lv_color_hex(0x1E3A8A), LV_PART_MAIN);
    lv_obj_set_style_radius(badge, 6, LV_PART_MAIN);
    lv_obj_t* bLbl = lv_label_create(badge);
    lv_label_set_text(bLbl, LV_SYMBOL_SETTINGS " ACCESO ADMIN");
    lv_obj_set_style_text_color(bLbl, lv_color_hex(0x93C5FD), LV_PART_MAIN);
    lv_obj_center(bLbl);

    lv_obj_t* tLbl = lv_label_create(card);
    lv_label_set_text(tLbl, "Credencial detectada");
    lv_obj_set_style_text_color(tLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(tLbl, &lv_font_montserrat_20, LV_PART_MAIN);
    lv_obj_align(tLbl, LV_ALIGN_CENTER, 0, -15);

    lv_obj_t* sLbl = lv_label_create(card);
    lv_label_set_text(sLbl, "Credencial administrativa autorizada.");
    lv_obj_set_style_text_color(sLbl, lv_color_hex(0x94A3B8), LV_PART_MAIN);
    lv_obj_set_style_text_font(sLbl, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(sLbl, LV_ALIGN_CENTER, 0, 15);

    lv_obj_t* btnEnter = lv_btn_create(card);
    lv_obj_set_size(btnEnter, 360, 46);
    lv_obj_align(btnEnter, LV_ALIGN_BOTTOM_MID, 0, -10);
    lv_obj_set_style_bg_color(btnEnter, lv_color_hex(0x2563EB), LV_PART_MAIN);
    lv_obj_set_style_radius(btnEnter, 8, LV_PART_MAIN);
    lv_obj_t* eLbl = lv_label_create(btnEnter);
    lv_label_set_text(eLbl, "Entrar al panel de gestion");
    lv_obj_center(eLbl);
    lv_obj_add_event_cb(btnEnter, [](lv_event_t* e) {
        if (_onAction1Cb) _onAction1Cb();
    }, LV_EVENT_CLICKED, NULL);
}

void LvglManager::showAdminPanel(int pendingSyncs, const char* stationName, bool isOnline,
                                std::function<void()> onSync,
                                std::function<void()> onStorage,
                                std::function<void()> onConfig,
                                std::function<void()> onExit) {
    if (!_initialized) return;

    _onAdminWifiCb = onConfig;
    _onAdminSyncCb = onSync;
    _onOtherCb = onStorage;
    _onAdminExitCb = onExit;
    _active = true;

    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    // Cabecera exacta Figma
    char subHeader[96];
    snprintf(subHeader, sizeof(subHeader), "%s - %s", 
             stationName ? stationName : "Laboratorio", 
             isOnline ? "Con conexion" : "Sin conexion");
    createFigmaHeader("Gestion de la estacion", subHeader);

    // Contenedor lista de 4 opciones Figma
    lv_obj_t* listCont = lv_obj_create(lv_scr_act());
    lv_obj_set_size(listCont, 444, 240);
    lv_obj_align(listCont, LV_ALIGN_TOP_MID, 0, 68);
    lv_obj_set_style_bg_color(listCont, lv_color_hex(0x0A0E17), LV_PART_MAIN);
    lv_obj_set_style_border_width(listCont, 0, LV_PART_MAIN);
    lv_obj_set_style_pad_all(listCont, 0, LV_PART_MAIN);
    lv_obj_set_style_pad_row(listCont, 8, LV_PART_MAIN);
    lv_obj_set_flex_flow(listCont, LV_FLEX_FLOW_COLUMN);
    lv_obj_clear_flag(listCont, LV_OBJ_FLAG_SCROLLABLE);

    // Funcion lambda para crear cada tarjeta del menu
    auto createOptionCard = [&](const char* title, const char* desc, lv_event_cb_t cb) {
        lv_obj_t* btn = lv_btn_create(listCont);
        lv_obj_set_size(btn, 444, 50);
        lv_obj_set_style_bg_color(btn, lv_color_hex(0x111827), LV_PART_MAIN);
        lv_obj_set_style_bg_color(btn, lv_color_hex(0x1E293B), LV_STATE_PRESSED);
        lv_obj_set_style_border_color(btn, lv_color_hex(0x1F2937), LV_PART_MAIN);
        lv_obj_set_style_border_width(btn, 1, LV_PART_MAIN);
        lv_obj_set_style_radius(btn, 10, LV_PART_MAIN);
        lv_obj_set_style_pad_hor(btn, 14, LV_PART_MAIN);
        lv_obj_set_style_pad_ver(btn, 6, LV_PART_MAIN);

        lv_obj_t* t = lv_label_create(btn);
        lv_label_set_text(t, title);
        lv_obj_set_style_text_color(t, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
        lv_obj_set_style_text_font(t, &lv_font_montserrat_14, LV_PART_MAIN);
        lv_obj_align(t, LV_ALIGN_TOP_LEFT, 0, 2);

        lv_obj_t* d = lv_label_create(btn);
        lv_label_set_text(d, desc);
        lv_obj_set_style_text_color(d, lv_color_hex(0x94A3B8), LV_PART_MAIN);
        lv_obj_set_style_text_font(d, &lv_font_montserrat_12, LV_PART_MAIN);
        lv_obj_align(d, LV_ALIGN_BOTTOM_LEFT, 0, -2);

        lv_obj_t* arrow = lv_label_create(btn);
        lv_label_set_text(arrow, LV_SYMBOL_RIGHT);
        lv_obj_set_style_text_color(arrow, lv_color_hex(0x64748B), LV_PART_MAIN);
        lv_obj_align(arrow, LV_ALIGN_RIGHT_MID, 0, 0);

        lv_obj_add_event_cb(btn, cb, LV_EVENT_CLICKED, NULL);
    };

    // 1. Sincronizacion
    char syncDesc[64];
    snprintf(syncDesc, sizeof(syncDesc), "%d eventos pendientes", pendingSyncs);
    createOptionCard("Sincronizacion", syncDesc, [](lv_event_t* e) {
        if (_onAdminSyncCb) _onAdminSyncCb();
    });

    // 2. Datos almacenados
    createOptionCard("Datos almacenados", "Ver y gestionar datos locales", [](lv_event_t* e) {
        if (_onOtherCb) _onOtherCb();
    });

    // 3. Configuracion
    createOptionCard("Configuracion", "Red, estacion y preferencias", [](lv_event_t* e) {
        if (_onAdminWifiCb) _onAdminWifiCb();
    });

    // 4. Salir de administracion
    createOptionCard("Salir de administracion", "Volver al modo de operacion", [](lv_event_t* e) {
        if (_onAdminExitCb) _onAdminExitCb();
    });
}

void LvglManager::showAdminSync(int pendingCount, bool isOnline, 
                               std::function<void()> onRetry, std::function<void()> onBack) {
    if (!_initialized) return;
    _onRefreshCb = onRetry;
    _onBackCb = onBack;
    _active = true;
    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    createFigmaHeader("Sincronizacion", isOnline ? "Conexion activa con el servidor" : "Sin conexion al servidor");

    lv_obj_t* card = lv_obj_create(lv_scr_act());
    lv_obj_set_size(card, 440, 150);
    lv_obj_align(card, LV_ALIGN_TOP_MID, 0, 72);
    lv_obj_set_style_bg_color(card, lv_color_hex(0x111827), LV_PART_MAIN);
    lv_obj_set_style_border_color(card, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_radius(card, 12, LV_PART_MAIN);

    char pBuf[64];
    snprintf(pBuf, sizeof(pBuf), "%d eventos pendientes", pendingCount);
    lv_obj_t* tLbl = lv_label_create(card);
    lv_label_set_text(tLbl, pBuf);
    lv_obj_set_style_text_color(tLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(tLbl, &lv_font_montserrat_18, LV_PART_MAIN);
    lv_obj_align(tLbl, LV_ALIGN_TOP_LEFT, 10, 15);

    lv_obj_t* sLbl = lv_label_create(card);
    lv_label_set_text(sLbl, "Se enviaran automaticamente al recuperar conexion.");
    lv_obj_set_style_text_color(sLbl, lv_color_hex(0x94A3B8), LV_PART_MAIN);
    lv_obj_set_style_text_font(sLbl, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(sLbl, LV_ALIGN_TOP_LEFT, 10, 50);

    // Botones
    lv_obj_t* btnRetry = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btnRetry, 210, 46);
    lv_obj_align(btnRetry, LV_ALIGN_BOTTOM_LEFT, 20, -14);
    lv_obj_set_style_bg_color(btnRetry, lv_color_hex(0x2563EB), LV_PART_MAIN);
    lv_obj_set_style_radius(btnRetry, 8, LV_PART_MAIN);
    lv_obj_t* rLbl = lv_label_create(btnRetry);
    lv_label_set_text(rLbl, "Reintentar conexion");
    lv_obj_center(rLbl);
    lv_obj_add_event_cb(btnRetry, [](lv_event_t* e) {
        if (_onRefreshCb) _onRefreshCb();
    }, LV_EVENT_CLICKED, NULL);

    lv_obj_t* btnBack = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btnBack, 210, 46);
    lv_obj_align(btnBack, LV_ALIGN_BOTTOM_RIGHT, -20, -14);
    lv_obj_set_style_bg_color(btnBack, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_radius(btnBack, 8, LV_PART_MAIN);
    lv_obj_t* bLbl = lv_label_create(btnBack);
    lv_label_set_text(bLbl, "Volver al panel");
    lv_obj_center(bLbl);
    lv_obj_add_event_cb(btnBack, [](lv_event_t* e) {
        if (_onBackCb) _onBackCb();
    }, LV_EVENT_CLICKED, NULL);
}

void LvglManager::showAdminStorage(int pendingCount, const char* lastSync, 
                                  std::function<void()> onClear, std::function<void()> onBack) {
    if (!_initialized) return;
    _onAction1Cb = onClear;
    _onBackCb = onBack;
    _active = true;
    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    createFigmaHeader("Datos almacenados", "Informacion disponible localmente");

    lv_obj_t* list = lv_obj_create(lv_scr_act());
    lv_obj_set_size(list, 444, 160);
    lv_obj_align(list, LV_ALIGN_TOP_MID, 0, 70);
    lv_obj_set_style_bg_color(list, lv_color_hex(0x111827), LV_PART_MAIN);
    lv_obj_set_style_border_color(list, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_radius(list, 10, LV_PART_MAIN);
    lv_obj_clear_flag(list, LV_OBJ_FLAG_SCROLLABLE);

    char buf1[64];
    snprintf(buf1, sizeof(buf1), "Eventos pendientes: %d registros por sincronizar", pendingCount);
    lv_obj_t* l1 = lv_label_create(list);
    lv_label_set_text(l1, buf1);
    lv_obj_set_style_text_color(l1, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(l1, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(l1, LV_ALIGN_TOP_LEFT, 10, 10);

    lv_obj_t* l2 = lv_label_create(list);
    lv_label_set_text(l2, "Copia local: Datos disponibles para modo offline");
    lv_obj_set_style_text_color(l2, lv_color_hex(0x94A3B8), LV_PART_MAIN);
    lv_obj_set_style_text_font(l2, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(l2, LV_ALIGN_TOP_LEFT, 10, 48);

    char buf3[64];
    snprintf(buf3, sizeof(buf3), "Ultima sincronizacion: %s", lastSync ? lastSync : "Hoy");
    lv_obj_t* l3 = lv_label_create(list);
    lv_label_set_text(l3, buf3);
    lv_obj_set_style_text_color(l3, lv_color_hex(0x94A3B8), LV_PART_MAIN);
    lv_obj_set_style_text_font(l3, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(l3, LV_ALIGN_TOP_LEFT, 10, 86);

    // Botones
    lv_obj_t* btnClear = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btnClear, 210, 46);
    lv_obj_align(btnClear, LV_ALIGN_BOTTOM_LEFT, 20, -14);
    lv_obj_set_style_bg_color(btnClear, lv_color_hex(0x7F1D1D), LV_PART_MAIN);
    lv_obj_set_style_radius(btnClear, 8, LV_PART_MAIN);
    lv_obj_t* cLbl = lv_label_create(btnClear);
    lv_label_set_text(cLbl, "Limpiar sincronizados");
    lv_obj_center(cLbl);
    lv_obj_add_event_cb(btnClear, [](lv_event_t* e) {
        if (_onAction1Cb) _onAction1Cb();
    }, LV_EVENT_CLICKED, NULL);

    lv_obj_t* btnBack = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btnBack, 210, 46);
    lv_obj_align(btnBack, LV_ALIGN_BOTTOM_RIGHT, -20, -14);
    lv_obj_set_style_bg_color(btnBack, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_radius(btnBack, 8, LV_PART_MAIN);
    lv_obj_t* bLbl = lv_label_create(btnBack);
    lv_label_set_text(bLbl, "Volver al panel");
    lv_obj_center(bLbl);
    lv_obj_add_event_cb(btnBack, [](lv_event_t* e) {
        if (_onBackCb) _onBackCb();
    }, LV_EVENT_CLICKED, NULL);
}

void LvglManager::showAdminConfig(const char* stationName, const char* wifiSsid, const char* ip, const char* mac, 
                                 std::function<void()> onUpdateConfig, std::function<void()> onBack) {
    if (!_initialized) return;
    _onAction1Cb = onUpdateConfig;
    _onBackCb = onBack;
    _active = true;
    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    createFigmaHeader("Configuracion", "Estado y ajustes de la estacion");

    lv_obj_t* card = lv_obj_create(lv_scr_act());
    lv_obj_set_size(card, 444, 160);
    lv_obj_align(card, LV_ALIGN_TOP_MID, 0, 70);
    lv_obj_set_style_bg_color(card, lv_color_hex(0x111827), LV_PART_MAIN);
    lv_obj_set_style_border_color(card, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_radius(card, 10, LV_PART_MAIN);
    lv_obj_clear_flag(card, LV_OBJ_FLAG_SCROLLABLE);

    char buf1[64];
    snprintf(buf1, sizeof(buf1), "Red Wi-Fi: Conectada a %s", wifiSsid ? wifiSsid : "SIA");
    lv_obj_t* l1 = lv_label_create(card);
    lv_label_set_text(l1, buf1);
    lv_obj_set_style_text_color(l1, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(l1, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(l1, LV_ALIGN_TOP_LEFT, 10, 10);

    char buf2[96];
    snprintf(buf2, sizeof(buf2), "Estacion: %s  -  IP: %s", stationName ? stationName : "SIA-CYD", ip ? ip : "0.0.0.0");
    lv_obj_t* l2 = lv_label_create(card);
    lv_label_set_text(l2, buf2);
    lv_obj_set_style_text_color(l2, lv_color_hex(0x94A3B8), LV_PART_MAIN);
    lv_obj_set_style_text_font(l2, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(l2, LV_ALIGN_TOP_LEFT, 10, 48);

    char buf3[64];
    snprintf(buf3, sizeof(buf3), "MAC Hardware: %s", mac ? mac : "00:00:00:00:00:00");
    lv_obj_t* l3 = lv_label_create(card);
    lv_label_set_text(l3, buf3);
    lv_obj_set_style_text_color(l3, lv_color_hex(0x60A5FA), LV_PART_MAIN);
    lv_obj_set_style_text_font(l3, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(l3, LV_ALIGN_TOP_LEFT, 10, 86);

    // Botones
    lv_obj_t* btnSync = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btnSync, 210, 46);
    lv_obj_align(btnSync, LV_ALIGN_BOTTOM_LEFT, 20, -14);
    lv_obj_set_style_bg_color(btnSync, lv_color_hex(0x2563EB), LV_PART_MAIN);
    lv_obj_set_style_radius(btnSync, 8, LV_PART_MAIN);
    lv_obj_t* sLbl = lv_label_create(btnSync);
    lv_label_set_text(sLbl, "Actualizar config");
    lv_obj_center(sLbl);
    lv_obj_add_event_cb(btnSync, [](lv_event_t* e) {
        if (_onAction1Cb) _onAction1Cb();
    }, LV_EVENT_CLICKED, NULL);

    lv_obj_t* btnBack = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btnBack, 210, 46);
    lv_obj_align(btnBack, LV_ALIGN_BOTTOM_RIGHT, -20, -14);
    lv_obj_set_style_bg_color(btnBack, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_radius(btnBack, 8, LV_PART_MAIN);
    lv_obj_t* bLbl = lv_label_create(btnBack);
    lv_label_set_text(bLbl, "Salir de admin");
    lv_obj_center(bLbl);
    lv_obj_add_event_cb(btnBack, [](lv_event_t* e) {
        if (_onBackCb) _onBackCb();
    }, LV_EVENT_CLICKED, NULL);
}
