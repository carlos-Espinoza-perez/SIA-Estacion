// ============================================================
// Screen_Items.inc — Modulo 5: Gestion de Items y Prestamos
// showItemScanCard | showItemScanNext | showItemAdded | showItemSummary | showItemValidating | showLoanCompleted | showLoanApprovalSent | showLoanRejected
// ============================================================
// NOTA: Este archivo es incluido por LvglManager.cpp
//       No compilar de forma independiente.
// ============================================================

void LvglManager::showItemScanCard(const char* stationName) {
    if (!_initialized) return;
    _active = true;
    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    createFigmaHeader("Estacion de gestion de items", stationName ? stationName : "Laboratorio SIA");

    lv_obj_t* card = lv_obj_create(lv_scr_act());
    lv_obj_set_size(card, 440, 220);
    lv_obj_align(card, LV_ALIGN_TOP_MID, 0, 70);
    lv_obj_set_style_bg_color(card, lv_color_hex(0x111827), LV_PART_MAIN);
    lv_obj_set_style_border_color(card, lv_color_hex(0x2563EB), LV_PART_MAIN);
    lv_obj_set_style_border_width(card, 2, LV_PART_MAIN);
    lv_obj_set_style_radius(card, 14, LV_PART_MAIN);

    lv_obj_t* tLbl = lv_label_create(card);
    lv_label_set_text(tLbl, "Escanea tu carnet");
    lv_obj_set_style_text_color(tLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(tLbl, &lv_font_montserrat_20, LV_PART_MAIN);
    lv_obj_align(tLbl, LV_ALIGN_CENTER, 0, -20);

    lv_obj_t* sLbl = lv_label_create(card);
    lv_label_set_text(sLbl, "Acerca tu carnet universitario para iniciar el prestamo");
    lv_obj_set_style_text_color(sLbl, lv_color_hex(0x94A3B8), LV_PART_MAIN);
    lv_obj_set_style_text_font(sLbl, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(sLbl, LV_ALIGN_CENTER, 0, 18);
}

void LvglManager::showItemScanNext(const char* personName, int itemCount, std::function<void()> onViewItems) {
    if (!_initialized) return;
    _onAction1Cb = onViewItems;
    _active = true;
    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    char salute[64];
    snprintf(salute, sizeof(salute), "Hola, %s", personName ? personName : "Usuario");
    createFigmaHeader(salute, "Escaneo activo de items");

    lv_obj_t* card = lv_obj_create(lv_scr_act());
    lv_obj_set_size(card, 440, 160);
    lv_obj_align(card, LV_ALIGN_TOP_MID, 0, 70);
    lv_obj_set_style_bg_color(card, lv_color_hex(0x111827), LV_PART_MAIN);
    lv_obj_set_style_border_color(card, lv_color_hex(0x2563EB), LV_PART_MAIN);
    lv_obj_set_style_radius(card, 12, LV_PART_MAIN);

    lv_obj_t* tLbl = lv_label_create(card);
    lv_label_set_text(tLbl, "Ahora escanea el item");
    lv_obj_set_style_text_color(tLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(tLbl, &lv_font_montserrat_20, LV_PART_MAIN);
    lv_obj_align(tLbl, LV_ALIGN_CENTER, 0, -15);

    lv_obj_t* sLbl = lv_label_create(card);
    lv_label_set_text(sLbl, "Acerca el codigo QR o barras del equipo");
    lv_obj_set_style_text_color(sLbl, lv_color_hex(0x94A3B8), LV_PART_MAIN);
    lv_obj_set_style_text_font(sLbl, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(sLbl, LV_ALIGN_CENTER, 0, 18);

    // Boton Ver items
    char countBuf[32];
    snprintf(countBuf, sizeof(countBuf), "Ver items (%d)", itemCount);
    lv_obj_t* btnView = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btnView, 440, 48);
    lv_obj_align(btnView, LV_ALIGN_BOTTOM_MID, 0, -14);
    lv_obj_set_style_bg_color(btnView, lv_color_hex(0x2563EB), LV_PART_MAIN);
    lv_obj_set_style_radius(btnView, 10, LV_PART_MAIN);
    lv_obj_t* vLbl = lv_label_create(btnView);
    lv_label_set_text(vLbl, countBuf);
    lv_obj_center(vLbl);
    lv_obj_add_event_cb(btnView, [](lv_event_t* e) {
        if (_onAction1Cb) _onAction1Cb();
    }, LV_EVENT_CLICKED, NULL);
}

void LvglManager::showItemAdded(const char* itemName, const char* itemCode, int itemCount, 
                               std::function<void()> onContinue, std::function<void()> onViewItems) {
    if (!_initialized) return;
    _onAction1Cb = onContinue;
    _onAction2Cb = onViewItems;
    _active = true;
    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    createFigmaHeader("Item agregado", "Puedes seguir escaneando mas items");

    lv_obj_t* card = lv_obj_create(lv_scr_act());
    lv_obj_set_size(card, 440, 150);
    lv_obj_align(card, LV_ALIGN_TOP_MID, 0, 70);
    lv_obj_set_style_bg_color(card, lv_color_hex(0x111827), LV_PART_MAIN);
    lv_obj_set_style_border_color(card, lv_color_hex(0x10B981), LV_PART_MAIN);
    lv_obj_set_style_border_width(card, 1, LV_PART_MAIN);
    lv_obj_set_style_radius(card, 12, LV_PART_MAIN);

    lv_obj_t* tLbl = lv_label_create(card);
    lv_label_set_text(tLbl, itemName ? itemName : "Multimetro digital");
    lv_obj_set_style_text_color(tLbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
    lv_obj_set_style_text_font(tLbl, &lv_font_montserrat_18, LV_PART_MAIN);
    lv_obj_align(tLbl, LV_ALIGN_TOP_LEFT, 10, 10);

    char codeBuf[64];
    snprintf(codeBuf, sizeof(codeBuf), "Codigo: %s", itemCode ? itemCode : "ELEC-042");
    lv_obj_t* cLbl = lv_label_create(card);
    lv_label_set_text(cLbl, codeBuf);
    lv_obj_set_style_text_color(cLbl, lv_color_hex(0x10B981), LV_PART_MAIN);
    lv_obj_set_style_text_font(cLbl, &lv_font_montserrat_14, LV_PART_MAIN);
    lv_obj_align(cLbl, LV_ALIGN_TOP_LEFT, 10, 42);

    // Botones
    lv_obj_t* btnCont = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btnCont, 210, 48);
    lv_obj_align(btnCont, LV_ALIGN_BOTTOM_LEFT, 20, -14);
    lv_obj_set_style_bg_color(btnCont, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_radius(btnCont, 10, LV_PART_MAIN);
    lv_obj_t* cLblBtn = lv_label_create(btnCont);
    lv_label_set_text(cLblBtn, "Escanear otro");
    lv_obj_center(cLblBtn);
    lv_obj_add_event_cb(btnCont, [](lv_event_t* e) {
        if (_onAction1Cb) _onAction1Cb();
    }, LV_EVENT_CLICKED, NULL);

    char viewBuf[32];
    snprintf(viewBuf, sizeof(viewBuf), "Ver items (%d)", itemCount);
    lv_obj_t* btnView = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btnView, 210, 48);
    lv_obj_align(btnView, LV_ALIGN_BOTTOM_RIGHT, -20, -14);
    lv_obj_set_style_bg_color(btnView, lv_color_hex(0x2563EB), LV_PART_MAIN);
    lv_obj_set_style_radius(btnView, 10, LV_PART_MAIN);
    lv_obj_t* vLblBtn = lv_label_create(btnView);
    lv_label_set_text(vLblBtn, viewBuf);
    lv_obj_center(vLblBtn);
    lv_obj_add_event_cb(btnView, [](lv_event_t* e) {
        if (_onAction2Cb) _onAction2Cb();
    }, LV_EVENT_CLICKED, NULL);
}

void LvglManager::showItemSummary(const ItemSummaryEntry* items, int itemCount,
                                 std::function<void()> onContinue, std::function<void()> onComplete,
                                 std::function<void(int)> onRemove) {
    if (!_initialized) return;
    _onAction1Cb = onContinue;
    _onAction2Cb = onComplete;
    _onSelectCb = onRemove;
    _active = true;
    lv_obj_clean(lv_scr_act());
    lv_obj_set_style_bg_color(lv_scr_act(), lv_color_hex(0x0A0E17), LV_PART_MAIN);

    char countBuf[32];
    snprintf(countBuf, sizeof(countBuf), "%d items seleccionados", itemCount);
    createFigmaHeader("Resumen de items", countBuf);

    lv_obj_t* list = lv_obj_create(lv_scr_act());
    lv_obj_set_size(list, 444, 180);
    lv_obj_align(list, LV_ALIGN_TOP_MID, 0, 68);
    lv_obj_set_style_bg_color(list, lv_color_hex(0x111827), LV_PART_MAIN);
    lv_obj_set_style_border_color(list, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_border_width(list, 1, LV_PART_MAIN);
    lv_obj_set_style_radius(list, 10, LV_PART_MAIN);
    lv_obj_set_style_pad_all(list, 6, LV_PART_MAIN);
    lv_obj_set_style_pad_row(list, 6, LV_PART_MAIN);
    lv_obj_set_flex_flow(list, LV_FLEX_FLOW_COLUMN);
    lv_obj_set_scroll_dir(list, LV_DIR_VER);

    for (int i = 0; i < itemCount; i++) {
        // Fila propia (no lv_list_add_btn): asi el boton "Quitar" puede tener su
        // propio evento de click sin disparar el de toda la fila.
        lv_obj_t* row = lv_obj_create(list);
        lv_obj_set_size(row, LV_PCT(100), 46);
        lv_obj_set_style_bg_color(row, lv_color_hex(0x182234), LV_PART_MAIN);
        lv_obj_set_style_border_width(row, 0, LV_PART_MAIN);
        lv_obj_set_style_radius(row, 8, LV_PART_MAIN);
        lv_obj_set_style_pad_all(row, 8, LV_PART_MAIN);
        lv_obj_clear_flag(row, LV_OBJ_FLAG_SCROLLABLE);

        char itemText[96];
        snprintf(itemText, sizeof(itemText), "%s\nCodigo: %s",
                 (items && items[i].name) ? items[i].name : "Item",
                 (items && items[i].code) ? items[i].code : "ID");

        lv_obj_t* lbl = lv_label_create(row);
        lv_label_set_text(lbl, itemText);
        lv_obj_set_style_text_color(lbl, lv_color_hex(0xFFFFFF), LV_PART_MAIN);
        lv_obj_set_style_text_font(lbl, &lv_font_montserrat_12, LV_PART_MAIN);
        lv_obj_align(lbl, LV_ALIGN_LEFT_MID, 0, 0);

        lv_obj_t* btnQuitar = lv_btn_create(row);
        lv_obj_set_size(btnQuitar, 74, 30);
        lv_obj_align(btnQuitar, LV_ALIGN_RIGHT_MID, 0, 0);
        lv_obj_set_style_bg_color(btnQuitar, lv_color_hex(0x7F1D1D), LV_PART_MAIN);
        lv_obj_set_style_radius(btnQuitar, 6, LV_PART_MAIN);
        lv_obj_t* lblQuitar = lv_label_create(btnQuitar);
        lv_label_set_text(lblQuitar, "Quitar");
        lv_obj_set_style_text_color(lblQuitar, lv_color_hex(0xFCA5A5), LV_PART_MAIN);
        lv_obj_set_style_text_font(lblQuitar, &lv_font_montserrat_12, LV_PART_MAIN);
        lv_obj_center(lblQuitar);
        lv_obj_add_event_cb(btnQuitar, [](lv_event_t* e) {
            int idx = (int)(uintptr_t)lv_event_get_user_data(e);
            if (_onSelectCb) _onSelectCb(idx);
        }, LV_EVENT_CLICKED, (void*)(uintptr_t)i);
    }

    // Botones
    lv_obj_t* btnCont = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btnCont, 210, 44);
    lv_obj_align(btnCont, LV_ALIGN_BOTTOM_LEFT, 20, -10);
    lv_obj_set_style_bg_color(btnCont, lv_color_hex(0x1F2937), LV_PART_MAIN);
    lv_obj_set_style_radius(btnCont, 8, LV_PART_MAIN);
    lv_obj_t* cLbl = lv_label_create(btnCont);
    lv_label_set_text(cLbl, "Continuar escaneando");
    lv_obj_center(cLbl);
    lv_obj_add_event_cb(btnCont, [](lv_event_t* e) {
        if (_onAction1Cb) _onAction1Cb();
    }, LV_EVENT_CLICKED, NULL);

    lv_obj_t* btnDone = lv_btn_create(lv_scr_act());
    lv_obj_set_size(btnDone, 210, 44);
    lv_obj_align(btnDone, LV_ALIGN_BOTTOM_RIGHT, -20, -10);
    lv_obj_set_style_bg_color(btnDone, lv_color_hex(0x10B981), LV_PART_MAIN);
    lv_obj_set_style_radius(btnDone, 8, LV_PART_MAIN);
    lv_obj_t* dLbl = lv_label_create(btnDone);
    lv_label_set_text(dLbl, "Completar prestamo");
    lv_obj_center(dLbl);
    lv_obj_add_event_cb(btnDone, [](lv_event_t* e) {
        if (_onAction2Cb) _onAction2Cb();
    }, LV_EVENT_CLICKED, NULL);
}

void LvglManager::showItemValidating(const char* title, const char* subtitle) {
    showProcessing(title ? title : "Validando solicitud", 
                   subtitle ? subtitle : "Estamos verificando los items y tu solicitud.");
}

void LvglManager::showLoanCompleted(const char* person, const char* detail) {
    showStatusMessage(true, LV_SYMBOL_OK " PRESTAMO REALIZADO", 
                      person ? person : "Prestamo completado", 
                      detail ? detail : "Tu prestamo se realizo correctamente.");
}

void LvglManager::showLoanApprovalSent(const char* detail) {
    showStatusMessage(true, LV_SYMBOL_REFRESH " SOLICITUD ENVIADA", 
                      "Enviado a aprobacion", 
                      detail ? detail : "Tu prestamo fue enviado a aprobacion del laboratorio.");
}

void LvglManager::showLoanRejected(const char* reason) {
    showStatusMessage(false, "! SOLICITUD RECHAZADA", 
                      "Prestamo no aceptado", 
                      reason ? reason : "Restricciones en items seleccionados.");
}
