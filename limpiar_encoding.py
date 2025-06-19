#!/usr/bin/env python3
"""
Script para limpiar posibles problemas de encoding en main.js
"""

import os

def limpiar_main_js():
    file_path = "js/main.js"
    
    if not os.path.exists(file_path):
        print(f"❌ Archivo {file_path} no encontrado")
        return
    
    # Leer el archivo
    with open(file_path, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # Verificar si tiene BOM
    if contenido.startswith('\ufeff'):
        print("🔧 Eliminando BOM del archivo...")
        contenido = contenido[1:]
    
    # Normalizar saltos de línea
    contenido = contenido.replace('\r\n', '\n').replace('\r', '\n')
    
    # Escribir de vuelta sin BOM
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(contenido)
    
    print(f"✅ Archivo {file_path} limpiado correctamente")

if __name__ == "__main__":
    print("🧹 Limpiando posibles problemas de encoding...")
    limpiar_main_js()
    print("✅ Proceso completado")
