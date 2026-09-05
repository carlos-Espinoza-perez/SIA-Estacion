#include "HardwareController.h"
#include <SPI.h>

HardwareController Hardware;

void HardwareController::begin() {
    pinMode(PIN_RELAY, OUTPUT);
    digitalWrite(PIN_RELAY, LOW);

    pinMode(PIN_BUZZER, OUTPUT);
    digitalWrite(PIN_BUZZER, LOW);

    pinMode(PIN_BUTTON_RESET, INPUT_PULLUP);

    SPI.begin(PIN_RFID_SCK, PIN_RFID_MISO, PIN_RFID_MOSI, PIN_RFID_SS);
    _rfid.PCD_Init();

    _scanner.begin(SCANNER_BAUD_RATE, SERIAL_8N1, PIN_SCANNER_RX, PIN_SCANNER_TX);
    _scannerBuf.reserve(128);
}

void HardwareController::update() {
    if (_relayOpen && (millis() - _relayOpenTime >= RELAY_ACTIVE_TIME_MS)) {
        digitalWrite(PIN_RELAY, LOW);
        _relayOpen = false;
    }

    pollRfid();
    pollScanner();
}

void HardwareController::unlock(uint32_t ms) {
    digitalWrite(PIN_RELAY, HIGH);
    _relayOpen = true;
    _relayOpenTime = millis();
}

void HardwareController::beep(uint16_t ms, uint8_t times) {
    for (uint8_t i = 0; i < times; i++) {
        digitalWrite(PIN_BUZZER, HIGH);
        delay(ms);
        digitalWrite(PIN_BUZZER, LOW);
        if (i < times - 1) delay(80);
    }
}

void HardwareController::notifySuccess() {
    unlock();
    beep(75, 2);
}

void HardwareController::notifyError() {
    beep(350, 1);
}

bool HardwareController::isResetHeld() {
    return digitalRead(PIN_BUTTON_RESET) == LOW;
}

void HardwareController::pollRfid() {
    if (!_rfid.PICC_IsNewCardPresent() || !_rfid.PICC_ReadCardSerial()) {
        return;
    }

    String uid;
    for (byte i = 0; i < _rfid.uid.size; i++) {
        if (_rfid.uid.uidByte[i] < 0x10) uid += "0";
        uid += String(_rfid.uid.uidByte[i], HEX);
    }
    uid.toUpperCase();

    _rfid.PICC_HaltA();
    _rfid.PCD_StopCrypto1();

    if (_cardCb) {
        _cardCb(uid);
    }
}

void HardwareController::pollScanner() {
    while (_scanner.available()) {
        char c = (char)_scanner.read();
        if (c == '\r' || c == '\n') {
            _scannerBuf.trim();
            if (_scannerBuf.length() > 0 && _barcodeCb) {
                _barcodeCb(_scannerBuf);
            }
            _scannerBuf = "";
        } else if (_scannerBuf.length() < 120) {
            _scannerBuf += c;
        }
    }
}
