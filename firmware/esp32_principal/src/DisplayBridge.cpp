#include "DisplayBridge.h"
#include "Config.h"

DisplayBridge Display;

void DisplayBridge::begin() {
    _serial.begin(CYD_BAUD_RATE, SERIAL_8N1, PIN_CYD_RX, PIN_CYD_TX);
    _rxBuf.reserve(128);
}

void DisplayBridge::update() {
    while (_serial.available()) {
        char c = (char)_serial.read();
        if (c == '\n') {
            _rxBuf.trim();
            if (_rxBuf.length() > 0) {
                handleLine(_rxBuf);
            }
            _rxBuf = "";
        } else if (c != '\r' && _rxBuf.length() < 120) {
            _rxBuf += c;
        }
    }
}

void DisplayBridge::send(const String& line) {
    _serial.println(line);
}

void DisplayBridge::showBoot() {
    send("EST:BOOT");
}

void DisplayBridge::showUnpaired(const String& pairingUrl) {
    send("EST:DESVINCULADA:" + pairingUrl);
}

void DisplayBridge::showStandby() {
    send("EST:STANDBY");
}

void DisplayBridge::showScanning() {
    send("EST:ESCANEO");
}

void DisplayBridge::showApproved(const String& personName, const String& itemName) {
    send("EST:APROBADO:" + personName + ":" + itemName);
}

void DisplayBridge::showRejected(const String& reason) {
    send("EST:RECHAZADO:" + reason);
}

void DisplayBridge::showSyncing(int pending) {
    send("EST:SYNC:" + String(pending));
}

void DisplayBridge::showError(const String& msg) {
    send("EST:ERROR:" + msg);
}

void DisplayBridge::setCommandHandler(CommandHandler handler) {
    _handler = handler;
}

void DisplayBridge::handleLine(const String& line) {
    if (!_handler || !line.startsWith("CMD:")) return;

    int sep = line.indexOf(':', 4);
    if (sep == -1) {
        _handler(line.substring(4), "");
    } else {
        _handler(line.substring(4, sep), line.substring(sep + 1));
    }
}
