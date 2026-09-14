# GABINETE SIA - REPORTE TÉCNICO Y ESPECIFICACIONES DE IMPRESIÓN (v3.3)

## 1. Fijación y Tornillería
### A. Tapa Trasera (4 Postes de Esquina M3):
- **Tornillos:** M3 x 16 mm o 20 mm.
- **Diámetro:** 6.80 mm exterior / 3.00 mm barreno interior.
- **Coordenadas:** `(8, 8), (8, 74), (114, 8), (114, 74) mm`.
- **Compatibilidad:** 100% coincidente con la tapa trasera física ya impresa.

### B. Pantalla CYD 3.5" / ESP32-3248S035 (4 Postes Dedicados M2.5):
- **Tornillos:** M2.5 (o M2) x 6 mm.
- **Diámetro:** 6.00 mm exterior (cilindro sólido) / 2.30 mm barreno interior.
- **Altura de apoyo:** 5.60 mm desde el fondo interior.
- **Coordenadas:**
  - Inferior Izquierda: `(13.75, 17.05) mm`
  - Superior Izquierda: `(13.75, 64.95) mm`
  - Inferior Derecha: `(108.25, 17.05) mm`
  - Superior Derecha: `(108.25, 64.95) mm`
  - **Pitch X:** 94.50 mm | **Pitch Y:** 47.90 mm
- **Geometría:** Postes cilíndricos 100% independientes, sin líneas finas ni nervaduras, garantizando máxima facilidad de impresión 3D.

---

## 2. Resumen de Dimensiones y Métricas
- **Dimensiones exteriores:** 122.00 mm (X) x 82.00 mm (Y) x 18.00 mm (Z / 1.8 cm de alto).
- **Espesor de pared:** 2.00 mm.
- **Ventana de pantalla:** 85.50 mm x 55.50 mm (5.5 cm x 8.5 cm con +0.5 mm de tolerancia).
- **Volumen de material:** **25.16 cm³** (vs 45.87 cm³ del diseño original -> **-45.2% de filamento**).
- **Peso estimado en PLA:** **31.2 g** (ultraligero y rígido).
- **Tiempo estimado de impresión:** **~1h 35min**.
- **Soportes requeridos:** **0% (Cero soportes)** al imprimir con la cara frontal sobre la cama.

---

## 3. Archivos Actualizados en stl/
1. `Cascaron_Frontal.step`: Sólido CAD B-Rep limpio para Fusion 360.
2. `Cascaron_Frontal_Modelado.stl`: Malla STL optimizada para impresión 3D.
3. `Tapa_Trasera.step` y `Tapa_Trasera_Modelada.stl`: Tapa trasera plana con avellanados M3.
4. `Estacion_Ensamblada.step`: Ensamblaje completo.
