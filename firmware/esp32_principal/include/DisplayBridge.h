#pragma once

#include <Arduino.h>

class DisplayBridge {
public:
    using CommandHandler = void (*)(const String& cmd, const String& arg);

    void begin();
    void update();

    void showBoot();
    void showUnpaired(const String& pairingUrl);
    void showStandby();
    void showScanning();
    void showApproved(const String& personName, const String& itemName);
    void showRejected(const String& reason);
    void showSyncing(int pending);
    void showError(const String& msg);

    void setCommandHandler(CommandHandler handler);

private:
    HardwareSerial _serial{2};
    String _rxBuf;
    CommandHandler _handler = nullptr;

    void send(const String& line);
    void handleLine(const String& line);
};

extern DisplayBridge Display;
