#pragma once

#include <Arduino.h>
#include <MFRC522.h>
#include "Config.h"

class HardwareController {
public:
    using CardCallback = void (*)(const String& uid);
    using BarcodeCallback = void (*)(const String& code);

    void begin();
    void update();

    void unlock(uint32_t ms = RELAY_ACTIVE_TIME_MS);
    void notifySuccess();
    void notifyError();
    void beep(uint16_t ms = 100, uint8_t times = 1);

    void onCard(CardCallback cb) { _cardCb = cb; }
    void onBarcode(BarcodeCallback cb) { _barcodeCb = cb; }

    bool isResetHeld();

private:
    MFRC522 _rfid{PIN_RFID_SS, PIN_RFID_RST};
    HardwareSerial _scanner{1};
    String _scannerBuf;

    CardCallback _cardCb = nullptr;
    BarcodeCallback _barcodeCb = nullptr;

    bool _relayOpen = false;
    uint32_t _relayOpenTime = 0;

    void pollRfid();
    void pollScanner();
};

extern HardwareController Hardware;
