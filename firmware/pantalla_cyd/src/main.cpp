#include <Arduino.h>
#include <TFT_eSPI.h>
#include "Config.h"
#include "Theme.h"
#include "UIComponents.h"
#include "TouchManager.h"
#include "SerialProtocol.h"
#include "Screens.h"

// ==============================================================================
// Instancias Globales
// ==============================================================================
static TFT_eSPI        tft;
static TouchManager    touch;
static ScreenManager   screens(tft, touch);
static SerialProtocol  serialProto;

// Variables de Control para Modo Demo con Datos Dummy
static bool     demoModeEnabled   = true;
static uint32_t lastDemoStepTime  = 0;
static uint8_t  demoStep          = 0;
constexpr uint32_t DEMO_STEP_INTERVAL_MS = 6000; // Cambia cada 6 segundos en modo automático

void runDemoStep() {
    ParsedCommand dummyCmd;
    dummyCmd.param1[0] = '\0';
    dummyCmd.param2[0] = '\0';

    switch (demoStep) {
        case 0:
            // Pantalla 1: Esperando QR (Lienzo principal de acceso)
            Serial.println(F("[DEMO DUMMY] 1/7: Esperando QR (EST:ESPERANDO)"));
            screens.transitionTo(ScreenState::WAITING);
            break;

        case 1:
            // Pantalla 2: Acceso Concedido con datos de alumno
            Serial.println(F("[DEMO DUMMY] 2/7: Acceso Concedido (Carlos Espinoza)"));
            strncpy(dummyCmd.param1, "Carlos Espinoza", sizeof(dummyCmd.param1));
            screens.transitionTo(ScreenState::GRANTED, &dummyCmd);
            break;

        case 2:
            // Pantalla 3: Ahora escanea el ítem (Pantalla de referencia de Figma)
            Serial.println(F("[DEMO DUMMY] 3/7: Ahora escanea el item (Referencia Figma #79261:6417)"));
            strncpy(dummyCmd.param1, "Carlos Espinoza", sizeof(dummyCmd.param1));
            screens.transitionTo(ScreenState::SCAN_ITEM, &dummyCmd);
            break;

        case 3:
            // Pantalla 4: Resumen de ítems seleccionados
            Serial.println(F("[DEMO DUMMY] 4/7: Resumen de items seleccionados"));
            screens.transitionTo(ScreenState::ITEM_SUMMARY);
            break;

        case 4:
            // Pantalla 5: Préstamo completado satisfactoriamente
            Serial.println(F("[DEMO DUMMY] 5/7: Prestamo realizado"));
            screens.transitionTo(ScreenState::LOAN_COMPLETED);
            break;

        case 5:
            // Pantalla 6: Código de Vinculación y QR Dinámico
            Serial.println(F("[DEMO DUMMY] 6/7: Codigo de Vinculacion con QR local"));
            strncpy(dummyCmd.param1, "A4CF128B9E70", sizeof(dummyCmd.param1));
            screens.transitionTo(ScreenState::LINK_CODE, &dummyCmd);
            break;

        case 6:
            // Pantalla 7: Panel de Gestión Local de la Estación
            Serial.println(F("[DEMO DUMMY] 7/7: Panel de Administracion Local"));
            screens.transitionTo(ScreenState::ADMIN_PANEL);
            break;
    }

    demoStep = (demoStep + 1) % 7;
}

void setup() {
    // 1. Inicialización de enlace serial (UART2 para ESP32 Principal + Serial0 USB a 115200)
    serialProto.init(SERIAL_BAUD);

    // 2. Inicialización del panel táctil resistivo XPT2046
    touch.init();

    // 3. Inicialización del controlador gráfico ST7796
    screens.init();

    Serial.println(F("=================================================="));
    Serial.println(F("  SIA - ESTACION CYD 3.5\" (ST7796 480x320)"));
    Serial.println(F("  Modo Demo con Datos Dummy Activado"));
    Serial.println(F("  Puedes enviar comandos EST:... en cualquier momento"));
    Serial.println(F("=================================================="));

    lastDemoStepTime = millis() + 1500; // Breve pausa tras el boot inicial
}

void loop() {
    // 1. Actualización continua de animaciones (barra de progreso inicial, etc.)
    screens.update();

    // 2. Procesamiento no bloqueante de comandos seriales (EST:<CMD>:<PARAM>)
    ParsedCommand cmd;
    if (serialProto.poll(cmd)) {
        // Al recibir un comando serial real, pausamos temporalmente el carrusel de demo
        demoModeEnabled = false;

        Serial.printf("[SIA CYD] Comando Serial recibido: tipo %d | p1: %s | p2: %s\n", 
                      (int)cmd.type, cmd.param1, cmd.param2);

        switch (cmd.type) {
            case CommandType::BOOT:
                screens.transitionTo(ScreenState::BOOT, &cmd);
                break;
            case CommandType::ESPERANDO:
                screens.transitionTo(ScreenState::WAITING, &cmd);
                break;
            case CommandType::PROCESANDO:
                screens.transitionTo(ScreenState::PROCESSING, &cmd);
                break;
            case CommandType::CONCEDIDO:
                screens.transitionTo(ScreenState::GRANTED, &cmd);
                break;
            case CommandType::DENEGADO:
                screens.transitionTo(ScreenState::DENIED, &cmd);
                break;
            case CommandType::OFFLINE:
                screens.transitionTo(ScreenState::OFFLINE, &cmd);
                break;
            case CommandType::ERROR:
                screens.transitionTo(ScreenState::ERROR_STATE, &cmd);
                break;
            case CommandType::SIN_CONFIGURAR:
                screens.transitionTo(ScreenState::UNCONFIGURED, &cmd);
                break;
            case CommandType::VINCULAR:
                screens.transitionTo(ScreenState::LINK_CODE, &cmd);
                break;
            case CommandType::VINCULADA:
                screens.transitionTo(ScreenState::LINKED, &cmd);
                break;
            case CommandType::IDENTIDAD_DETECTADA:
                screens.transitionTo(ScreenState::IDENTITY_DETECTED, &cmd);
                break;
            case CommandType::ESCANEA_CARNET:
                screens.transitionTo(ScreenState::SCAN_CARD, &cmd);
                break;
            case CommandType::AHORA_ESCANEA_ITEM:
                screens.transitionTo(ScreenState::SCAN_ITEM, &cmd);
                break;
            case CommandType::ITEM_AGREGADO:
                screens.transitionTo(ScreenState::ITEM_ADDED, &cmd);
                break;
            case CommandType::ITEM_RESUMEN:
                screens.transitionTo(ScreenState::ITEM_SUMMARY, &cmd);
                break;
            case CommandType::VALIDANDO:
                screens.transitionTo(ScreenState::VALIDATING, &cmd);
                break;
            case CommandType::PRESTAMO_COMPLETADO:
                screens.transitionTo(ScreenState::LOAN_COMPLETED, &cmd);
                break;
            case CommandType::PRESTAMO_RECHAZADO:
                screens.transitionTo(ScreenState::LOAN_REJECTED, &cmd);
                break;
            case CommandType::ESPERANDO_APROBACION:
                screens.transitionTo(ScreenState::APPROVAL_SENT, &cmd);
                break;
            case CommandType::FUERA_SERVICIO:
                screens.transitionTo(ScreenState::OUT_OF_SERVICE, &cmd);
                break;
            case CommandType::ADMIN_PANEL:
                screens.transitionTo(ScreenState::ADMIN_PANEL, &cmd);
                break;
            default:
                break;
        }
    }

    // 3. Sondeo táctil interactivo
    int16_t touchX = 0, touchY = 0;
    if (touch.poll(touchX, touchY)) {
        const char* action = touch.checkHit(touchX, touchY);
        if (action != nullptr) {
            Serial.printf("[TOUCH] Accion activada: %s (x=%d, y=%d)\n", action, touchX, touchY);
            
            // Envío del evento táctil al ESP32 Principal por UART2
            Serial2.printf("CYD:TOUCH:%s\n", action);

            // Transiciones táctiles interactivas inmediatas
            if (strcmp(action, "BTN_START_CONFIG") == 0) {
                ParsedCommand dummy;
                strncpy(dummy.param1, "A4CF128B9E70", sizeof(dummy.param1));
                screens.transitionTo(ScreenState::LINK_CODE, &dummy);
            } else if (strcmp(action, "BTN_VIEW_ITEMS") == 0) {
                screens.transitionTo(ScreenState::ITEM_SUMMARY);
            } else if (strcmp(action, "BTN_CONTINUE_SCAN") == 0) {
                screens.transitionTo(ScreenState::SCAN_ITEM);
            } else if (strcmp(action, "BTN_COMPLETE_LOAN") == 0) {
                screens.transitionTo(ScreenState::LOAN_COMPLETED);
            } else if (strcmp(action, "BTN_ADMIN_EXIT") == 0) {
                screens.transitionTo(ScreenState::WAITING);
            }

            // Reinicia temporizador del demo
            lastDemoStepTime = millis();
        }
    }

    // 4. Ciclo automático del Modo Demo (cuando no hay comando serial explícito)
    if (demoModeEnabled && (screens.getCurrentState() != ScreenState::BOOT)) {
        if (millis() - lastDemoStepTime > DEMO_STEP_INTERVAL_MS) {
            lastDemoStepTime = millis();
            runDemoStep();
        }
    }
}
