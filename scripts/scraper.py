import os
import uuid
import pyodbc
import requests
from bs4 import BeautifulSoup
from azure.storage.blob import BlobServiceClient
from datetime import datetime, timezone

# Configuraciones
BLOB_CONNECTION_STRING = "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"
BLOB_CONTAINER = "filepersonas"
DB_CONNECTION_STRING = "Driver={ODBC Driver 17 for SQL Server};Server=tcp:siabd.database.windows.net,1433;Database=siadb;Uid=siadb;Pwd=ContrasenaAle01:);Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"

# ==============================================================================
# COOKIES DE SESIÓN
# IMPORTANTE: Reemplaza estos valores con las cookies reales de tu navegador
# ==============================================================================
COOKIES = {
    "XSRF-TOKEN": "AQUI_TU_XSRF_TOKEN",
    "laravel_session": "AQUI_TU_LARAVEL_SESSION"
}
# ==============================================================================

def get_image_url_and_download(codigo):
    """
    Simula la petición al portal SIVE con las cookies,
    extrae el HTML, busca el tag de la foto y la descarga.
    """
    url_info = f"https://sive.ulsa.edu.ni/documentos/infoEstudiante?codigo={codigo}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "text/html, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": "https://sive.ulsa.edu.ni/"
    }
    
    try:
        # 1. Hacer la petición a infoEstudiante para obtener el HTML
        response = requests.get(url_info, cookies=COOKIES, headers=headers, timeout=10)
        
        if response.status_code == 200 and len(response.text.strip()) > 0:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 2. Buscar la imagen de perfil en el HTML devuelto
            # Usualmente la foto del estudiante está en un tag <img>. 
            # (Ajusta el selector si la universidad usa una clase CSS específica)
            img_tag = soup.find('img')
            
            if img_tag and 'src' in img_tag.attrs:
                img_url = img_tag['src']
                
                # Si la URL es relativa, la convertimos a absoluta
                if img_url.startswith('/'):
                    img_url = "https://sive.ulsa.edu.ni" + img_url
                elif not img_url.startswith('http'):
                    img_url = "https://sive.ulsa.edu.ni/" + img_url
                    
                print(f"  -> Foto encontrada: {img_url}")
                
                # 3. Descargar la imagen real usando el consecutivo
                img_response = requests.get(img_url, cookies=COOKIES, headers=headers, timeout=10)
                if img_response.status_code == 200:
                    # Retornamos el contenido binario de la imagen y el nombre real del archivo
                    filename = img_url.split('/')[-1]
                    return img_response.content, filename
            else:
                print(f"  -> No se encontró etiqueta de imagen en la respuesta HTML.")
        else:
            print(f"  -> La respuesta del servidor fue vacía o con error ({response.status_code}). Verifica las Cookies.")
            
    except Exception as e:
        print(f"  -> Error buscando/descargando imagen para {codigo}: {e}")
        
    return None, None


def main():
    if COOKIES["laravel_session"] == "AQUI_TU_LARAVEL_SESSION":
        print("ERROR: Debes reemplazar las cookies en el archivo antes de ejecutar el script.")
        return

    # 1. Conectar a Azure Blob Storage local (Azurite)
    try:
        blob_service_client = BlobServiceClient.from_connection_string(BLOB_CONNECTION_STRING)
        container_client = blob_service_client.get_container_client(BLOB_CONTAINER)
        if not container_client.exists():
            container_client.create_container()
    except Exception as e:
        print("ERROR: Asegúrate de que Azurite está corriendo en tu máquina (puerto 10000).")
        print(str(e))
        return

    # 2. Conectar a SQL Server para obtener los códigos de todos los estudiantes
    try:
        conn = pyodbc.connect(DB_CONNECTION_STRING)
        cursor = conn.cursor()
    except Exception as e:
        print("ERROR: No se pudo conectar a la base de datos.")
        print(str(e))
        return

    # Extraemos todos los estudiantes que NO tienen foto de referencia o que queramos re-procesar
    cursor.execute("SELECT Id, CodigoEstudiantil FROM Personas WHERE TipoPersona = 'Estudiante'")
    estudiantes = cursor.fetchall()
    
    print(f"Se encontraron {len(estudiantes)} estudiantes en la base de datos.")

    procesados = 0
    # 3. Procesar cada código
    for row in estudiantes:
        persona_id = row[0]
        codigo = row[1]
        
        print(f"Procesando {codigo}...")
        
        # Simular petición web con cookies y descargar imagen real
        image_data, file_name = get_image_url_and_download(codigo)
        
        if image_data and file_name:
            blob_client = container_client.get_blob_client(file_name)
            
            # Subir al Blob Storage
            blob_client.upload_blob(image_data, overwrite=True)
            print(f"  -> Subida exitosa a Blob Storage.")
            
            # Insertar o actualizar la referencia en la BD
            cursor.execute("SELECT Id FROM FotosReferencia WHERE PersonaId = ?", persona_id)
            foto_row = cursor.fetchone()
            
            if foto_row:
                cursor.execute(
                    "UPDATE FotosReferencia SET Url = ? WHERE Id = ?",
                    file_name, foto_row[0]
                )
            else:
                foto_id = str(uuid.uuid4())
                ahora = datetime.now(timezone.utc)
                cursor.execute(
                    "INSERT INTO FotosReferencia (Id, PersonaId, Url, EsPrincipal, FechaRegistro) VALUES (?, ?, ?, ?, ?)",
                    foto_id, persona_id, file_name, True, ahora
                )
            
            # Actualizar el flag en la tabla Personas
            cursor.execute(
                "UPDATE Personas SET TieneFotoReferencia = 1 WHERE Id = ?",
                persona_id
            )
            
            conn.commit()
            procesados += 1
                
    conn.close()
    print(f"\n¡Proceso completado! Se subieron {procesados} fotos reales a Azurite y SQL.")

if __name__ == "__main__":
    main()
