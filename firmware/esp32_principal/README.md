# Firmware ESP32 Principal - SIA

Controlador de la estacion SIA basado en ESP32-WROOM-32.
Orquesta lectores de credenciales (RFID RC522 y escaner GM65), rele de apertura, buzzer, comunicacion WiFi con backend .NET 9 (autenticacion OAuth2 Client Credentials y aprovisionamiento por long-polling), y enlace serial con la pantalla CYD (ESP32-3248S035R).

## Conexionado de Hardware

### Pantalla CYD (Conector CN1)
| ESP32 Principal | Pantalla CYD | Funcion |
| :--- | :--- | :--- |
| GND | GND (Pin 3/4) | Masa comun |
| GPIO 17 (TX2) | RX (Pin 1 - IO35) | Comandos hacia pantalla (115200 baud) |
| GPIO 16 (RX2) | TX (Pin 2 - IO22) | Eventos tactiles |

### Lector RFID RC522 (VSPI)
| ESP32 Principal | RC522 |
| :--- | :--- |
| 3V3 | 3.3V |
| GND | GND |
| GPIO 5 | SDA (SS) |
| GPIO 18 | SCK |
| GPIO 23 | MOSI |
| GPIO 19 | MISO |
| GPIO 22 | RST |

### Lector GM65 / GM66
| ESP32 Principal | Modulo |
| :--- | :--- |
| 5V / 3V3 | VCC |
| GND | GND |
| GPIO 25 (RX1) | TX (9600 baud) |
| GPIO 26 (TX1) | RX |

### Actuadores y Control
| ESP32 Principal | Componente | Descripcion |
| :--- | :--- | :--- |
| GPIO 4 | Rele (IN) | Disparo cerradura (Activo HIGH) |
| GPIO 2 | Buzzer (+) | Senal sonora |
| GPIO 0 | Boton BOOT | Reset de fabrica (5 segundos presionado) |

## Servidor de Camara (Telefono como Camara)

Segun las decisiones D-06 y D-07 de Notion, el telefono sustituye temporalmente a la camara fisica (ESP32-CAM):

1. El ESP32 Principal levanta simultaneamente:
   - Modo Estacion (STA): Conectado al WiFi local para comunicarse con el backend .NET 9.
   - Punto de Acceso (AP): `SIA-ESTACION-CAM` (Password: `SiaSecure2026`, IP: `192.168.4.1`).
2. El telefono se conecta a la red WiFi del ESP32 o a la misma red local y abre en su navegador:
   `http://192.168.4.1/` (o la IP asignada por DHCP).
3. La interfaz web servida por el ESP32:
   - Muestra el visor en vivo de la camara del telefono (`getUserMedia`).
   - Permite alternar camara frontal/trasera o capturar foto directa.
   - Al capturar, envia la imagen comprimida (JPEG 640x480) y el codigo opcional al endpoint `/api/upload` del ESP32.
4. El ESP32 reenvia la imagen al backend (`POST /api/estacion-api/validar`), donde el servicio `FaceONNX` realiza el reconocimiento facial.
5. El resultado se notifica simultaneamente a la pantalla CYD (`EST:CONCEDIDO:ACCESO:<Nombre>` o `EST:DENEGADO:ACCESO:<Motivo>`) y a la pantalla del telefono.

## Compilacion y Flasheo

Compilar:
```bash
pio run -d firmware/esp32_principal
```

Flashear:
```bash
pio run -d firmware/esp32_principal --target upload --upload-port COMx
```

