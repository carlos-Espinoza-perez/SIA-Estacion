#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>
#include "StorageManager.h"

enum class PollStatus {
    Success,
    Timeout,
    Error
};

struct AccessResult {
    bool authorized;
    String message;
    String personName;
    String itemName;
    String operationId;
};

class ApiClient {
public:
    bool isConnected();
    bool connectWifi();

    PollStatus pollProvisioning(const String& mac, StationConfig& out);
    bool authenticate(const String& clientId, const String& clientSecret);
    bool sendHeartbeat();
    bool validateAccess(const String& personCode, const String& itemCode, 
                        const String& operationType, AccessResult& result, const String& imageBase64 = "");


    bool hasToken() const;

private:
    String _token;
    uint32_t _tokenTime = 0;
    String buildUrl(const String& path);
};

extern ApiClient Api;
