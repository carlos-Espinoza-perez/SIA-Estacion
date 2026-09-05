#pragma once

#include <TFT_eSPI.h>

// Las fuentes FreeSans ya están cargadas por TFT_eSPI gracias a -DLOAD_GFXFF=1
// Declaramos las referencias limpias sin redefinición de bitmaps
extern const GFXfont FreeSans9pt7b;
extern const GFXfont FreeSans12pt7b;
extern const GFXfont FreeSansBold12pt7b;
extern const GFXfont FreeSansBold18pt7b;

#define FONT_CAPTION      (&FreeSans9pt7b)       // Subtítulos y notas pequeñas (12px visuales)
#define FONT_BODY         (&FreeSans12pt7b)      // Texto regular y campos
#define FONT_TITLE        (&FreeSansBold12pt7b)  // Títulos medianos y botones
#define FONT_HERO         (&FreeSansBold18pt7b)  // Títulos grandes y nombres destacados
