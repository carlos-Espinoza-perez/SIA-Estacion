#pragma once

#include <Arduino.h>

#define FIRMWARE_VERSION "1.0.0"

#define DEFAULT_WIFI_SSID       "SIA_LAB_WIFI"
#define DEFAULT_WIFI_PASSWORD   "SiaSecure2026"
#define DEFAULT_AP_SSID         "SIA-ESTACION-CAM"
#define DEFAULT_AP_PASSWORD     "SiaSecure2026"
#define DEFAULT_API_BASE_URL    "https://sia-api-app.azurewebsites.net"
#define DEFAULT_PAIRING_WEB_URL "https://sia-api-app.azurewebsites.net/estaciones/vincular?mac="


// CYD UART (Serial2)
#define PIN_CYD_RX          16
#define PIN_CYD_TX          17
#define CYD_BAUD_RATE       115200

// Scanner GM65 (Serial1)
#define PIN_SCANNER_RX      25
#define PIN_SCANNER_TX      26
#define SCANNER_BAUD_RATE   9600

// RFID RC522 (VSPI)
#define PIN_RFID_SS         5
#define PIN_RFID_RST        22
#define PIN_RFID_SCK        18
#define PIN_RFID_MISO       19
#define PIN_RFID_MOSI       23

// IO
#define PIN_RELAY           4
#define PIN_BUZZER          2
#define PIN_BUTTON_RESET    0

// Timing (ms)
#define RELAY_ACTIVE_TIME_MS    2500
#define HEARTBEAT_INTERVAL_MS   30000
#define LONG_POLL_TIMEOUT_MS    32000
#define RESULT_FEEDBACK_TIME_MS 3500
