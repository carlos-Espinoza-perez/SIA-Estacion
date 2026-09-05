# Firmware de Pantalla CYD (3.5" ST7796) — Estación SIA

Firmware de la pantalla esclava para la **Hosyond ESP32-3248S035R (CYD 3.5" Cheap Yellow Display)** de la Estación del Sistema de Identificación Automática (SIA · ULSA 2026).

Basado directamente en los diseños del lienzo **`📟 Estación (480×320)`** de Figma y la arquitectura documentada en Notion (Páginas 04, 08, 09, 10 y 16).

---

## 1. Características Técnicas y Arquitectura Robusta

* **Controlador Gráfico:** ST7796 sobre bus SPI a **40 MHz**.
* **Resolución:** 480 × 320 px (orientación horizontal `rotation = 1`).
* **Panel Táctil:** Resistivo XPT2046 con calibración y debouncing no bloqueante.
* **Cero Fragmentación de Memoria (`Zero-Dynamic-Allocation`):** No se utiliza la clase `String` de Arduino en el ciclo principal ni en el parseo serial para evitar fugas de memoria y caídas de heap.
* **Canal Serial Dedicado (UART2):** RX=16, TX=17 (independiente del puerto USB-CH340 para evitar interferencias).
* **Generación Nativa de Código QR:** La pantalla genera el código QR localmente en pantalla a partir de la cadena (`EST:VINCULAR:<code>`) sin requerir transmisión de imágenes pesadas.

---

## 2. Estructura del Proyecto

```
firmware/pantalla_cyd/
├── platformio.ini              # Dependencias y flags de hardware (ST7796, SPI 40MHz)
├── include/
│   ├── Config.h                # Pines, dimensiones y parámetros de calibración
│   ├── Theme.h                 # Tokens de diseño RGB565 extraídos de Figma (#333333, #71DD8C, #7DBBFF, etc.)
│   ├── UIComponents.h          # Primitivas visuales (Header, Card, Button, DashedRect, StatusView)
│   ├── QRCodeRenderer.h        # Adaptador nativo de código QR
│   ├── SerialProtocol.h        # Parser no bloqueante del protocolo EST:
│   ├── TouchManager.h          # Controlador de eventos táctiles
│   └── Screens.h               # Definición y máquina de estados de las pantallas
└── src/
    ├── main.cpp                # Ciclo principal de orquestación
    ├── UIComponents.cpp        # Renderizado de componentes vectoriales
    ├── QRCodeRenderer.cpp      # Renderizado de módulos QR
    ├── SerialProtocol.cpp      # Procesamiento de comandos UART
    ├── TouchManager.cpp        # Lectura y debounce táctil
    └── Screens.cpp             # Implementación visual 1:1 de cada pantalla
```

---

## 3. Protocolo de Comandos Seriales (`EST:`)

El ESP32 Principal envía comandos por UART2 (115200 baudios) con una línea terminada en `\n`:

| Comando | Parámetros | Ejemplo | Descripción |
| :--- | :--- | :--- | :--- |
| `BOOT` | — | `EST:BOOT` | Pantalla de arranque inicial con barra de progreso. |
| `ESPERANDO` | — | `EST:ESPERANDO` | Pantalla de reposo con marco dashed para código QR. |
| `PROCESANDO` | — | `EST:PROCESANDO` | Indicador circular de verificación. |
| `CONCEDIDO` | `tipo`, `nombre` | `EST:CONCEDIDO:ACCESO:Carlos Espinoza` | Halo verde, checkmark y nombre de la persona. |
| `DENEGADO` | `tipo`, `motivo` | `EST:DENEGADO:ACCESO:Acceso no autorizado` | Halo rojo, cruz y motivo del rechazo. |
| `OFFLINE` | — | `EST:OFFLINE` | Modo contingencia sin conexión (turquesa `#6BE6D3`). |
| `ERROR` | `motivo` | `EST:ERROR:QR_NO_RECONOCIDO` | Estado de error del sistema (morado `#B899EB`). |
| `SIN_CONFIGURAR`| — | `EST:SIN_CONFIGURAR` | Prompt táctil para iniciar vinculación. |
| `VINCULAR` | `codigo` | `EST:VINCULAR:A4CF128B9E70` | Genera QR en pantalla con el código alfanumérico. |
| `VINCULADA` | `nombre`, `modo`| `EST:VINCULADA:Lab Electronica:Acceso` | Confirmación de aprovisionamiento exitoso. |
| `IDENTIDAD_DETECTADA` | — | `EST:IDENTIDAD_DETECTADA` | Solicita mirar hacia la cámara. |
| `ESCANEA_CARNET` | — | `EST:ESCANEA_CARNET` | Esperando credencial de usuario para préstamo. |
| `AHORA_ESCANEA_ITEM` | `nombre` | `EST:AHORA_ESCANEA_ITEM:Carlos Espinoza` | **Pantalla de referencia** con saludo y botón. |
| `ITEM_AGREGADO` | `nombre`, `total` | `EST:ITEM_AGREGADO:Multimetro:1` | Confirmación de ítem escaneado con botones de acción. |
| `ITEM_RESUMEN` | — | `EST:ITEM_RESUMEN` | Lista detallada de ítems en préstamo con botón Completar. |
| `VALIDANDO` | — | `EST:VALIDANDO` | Verificando disponibilidad de ítems con backend. |
| `PRESTAMO_COMPLETADO` | — | `EST:PRESTAMO_COMPLETADO` | Préstamo registrado satisfactoriamente. |
| `ESPERANDO_APROBACION`| — | `EST:ESPERANDO_APROBACION` | Solicitud encolada a aprobación del administrador. |
| `PRESTAMO_RECHAZADO` | — | `EST:PRESTAMO_RECHAZADO` | Restricción en el préstamo de ítem. |
| `FUERA_SERVICIO` | — | `EST:FUERA_SERVICIO` | Estado inoperativo de la estación. |
| `ADMIN_PANEL` | — | `EST:ADMIN_PANEL` | Menú local de administración. |

---

## 4. Compilación y Carga con PlatformIO

### Desde terminal:
```bash
cd "firmware/pantalla_cyd"

# Compilar proyecto
pio run

# Cargar a la placa conectada por USB
pio run -t upload

# Abrir monitor serial para pruebas interactivas
pio run -t monitor
```

### Pruebas interactivas por Monitor Serial:
Puedes escribir directamente cualquiera de los comandos anteriores en el monitor serial a **115200 baudios** (ej. `EST:AHORA_ESCANEA_ITEM:Carlos Espinoza\n`) y la pantalla transicionará en tiempo real.
