# Author: Carlos Espinoza
# Description: Importa directamente los modelos STEP sólidos y editables de la Estación SIA en Fusion 360.

import adsk.core
import adsk.fusion
import os
import traceback

def run(context):
    ui = None
    try:
        app = adsk.core.Application.get()
        ui = app.userInterface
        
        product = app.activeProduct
        design = adsk.fusion.Design.cast(product)
        if not design:
            ui.messageBox("Por favor, abre o activa el diseño 'Estacion Ingreso Salida' en Fusion 360 antes de ejecutar.", "Aviso SIA")
            return
            
        rootComp = design.rootComponent
        importMgr = app.importManager
        
        stl_dir = r"e:\Carlos Espinoza\Universidad\3. Trimestre - 2026\Sistema de identificacion automatica\stl"
        
        # Archivos STEP sólidos ya modelados y listos
        step_files = [
            ("Cascaron_Frontal.step", "Cascaron Frontal"),
            ("Tapa_Trasera.step", "Tapa Trasera")
        ]
        
        importados = []
        for filename, comp_name in step_files:
            full_path = os.path.join(stl_dir, filename)
            if not os.path.exists(full_path):
                ui.messageBox("No se encontró el archivo:\n" + full_path, "Error")
                return
                
            stepOptions = importMgr.createSTEPImportOptions(full_path)
            res = importMgr.importToTarget(stepOptions, rootComp)
            if res:
                importados.append(comp_name)

        ui.messageBox(
            "¡Modelos paramétricos B-Rep insertados con éxito!\n\n" +
            "Se han cargado como Cuerpos Sólidos 100% Editables en 'Estacion Ingreso Salida':\n" +
            "• " + "\n• ".join(importados) + "\n\n" +
            "Ya puedes modificarlos, extruir, acotar y croquizar sobre cualquiera de sus caras.",
            "Estación SIA - Autodesk Fusion 360"
        )

    except:
        if ui:
            ui.messageBox("Error al insertar los modelos:\n" + traceback.format_exc(), "Error SIA")
