# Estación SIA - Pantalla CYD (ESP32-3248S035R)

Firmware para la estación de control de acceso e inventario del Sistema de Identificación Automática (SIA), implementado sobre la placa CYD 3.5" (pantalla táctil ST7796 de 480x320 con controlador resistivo XPT2046).

## Características

- Interfaz gráfica táctil en pantalla de 480x320.
- Servidor web embebido para captura de códigos mediante la cámara del smartphone.
- Punto de acceso WiFi abierto (`SIA-ESTACION-CAM`) con portal cautivo para configuración de red.
- Conexión HTTPS directa a la API en Azure.
- Generación de códigos QR en pantalla para vinculación del dispositivo.
- Almacenamiento no volátil en NVS para credenciales y tokens.

## Estructura de archivos

```
pantalla_cyd/
├── platformio.ini       Configuración de PlatformIO y librerías
├── include/
│   ├── Config.h         Pines, URLs de la API y constantes
│   ├── Theme.h          Colores y dimensiones de la interfaz
│   ├── UIComponents.h   Funciones de dibujo de la interfaz
│   ├── Screens.h        Manejador de pantallas
│   ├── TouchManager.h   Lectura y calibración del touch
│   ├── ApiClient.h      Cliente HTTP/HTTPS para Azure
│   ├── StorageManager.h Gestión de NVS (Preferences)
│   ├── PhoneCameraServer.h Servidor web y portal cautivo
│   └── QRCodeRenderer.h Generador de código QR
└── src/
    ├── main.cpp
    ├── UIComponents.cpp
    ├── Screens.cpp
    ├── TouchManager.cpp
    ├── ApiClient.cpp
    ├── StorageManager.cpp
    ├── PhoneCameraServer.cpp
    └── QRCodeRenderer.cpp
```

## Compilación y carga

Compilar:
```bash
pio run
```

Subir al ESP32:
```bash
pio run -t upload --upload-port COM9
```

Monitor serial:
```bash
pio device monitor --port COM9 -b 115200
```
