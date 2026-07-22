import os
import glob
import time
from google import genai
from PIL import Image

def main():
    # Obtener la API key de la variable de entorno
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("Error: La variable de entorno GOOGLE_API_KEY no está configurada.")
        return

    # Inicializar el cliente de google-genai
    client = genai.Client(api_key=api_key)
    model_name = "gemini-3.5-flash"
    print(f"Inicializando modelo {model_name} usando google-genai...")

    # Buscar todas las imágenes JPG en el directorio actual
    images = sorted(glob.glob("*.jpg"))
    if not images:
        print("No se encontraron imágenes JPG en el directorio actual.")
        return

    print(f"Se encontraron {len(images)} imágenes para procesar.")

    prompt = (
        "Analiza detalladamente esta imagen, la cual forma parte del recorrido médico de mi perro Jack. "
        "Tu tarea es extraer toda la información médica relevante del documento (que puede ser una receta, "
        "examen de laboratorio, factura médica, informe de consulta, etc.) de manera estructurada en español.\n\n"
        "Escribe la salida directamente en formato Markdown estructurado con los siguientes apartados (si la información está disponible en el documento):\n"
        "1. **Tipo de Documento:** (Ej. Receta, Informe de Laboratorio, Factura, etc.)\n"
        "2. **Fecha de Emisión/Consulta:**\n"
        "3. **Clínica Veterinaria / Profesional:** (Nombre del centro y del veterinario a cargo)\n"
        "4. **Datos del Paciente:** (Nombre del paciente, especie, raza, edad, peso, propietario, etc.)\n"
        "5. **Diagnósticos y Síntomas:** (Diagnósticos indicados, signos clínicos mencionados)\n"
        "6. **Medicamentos y Tratamiento Prescrito:** (Nombre de los medicamentos, dosis, frecuencia, duración y vía de administración)\n"
        "7. **Exámenes y Resultados:** (Pruebas realizadas o solicitadas, valores de referencia y resultados obtenidos)\n"
        "8. **Indicaciones Adicionales:** (Recomendaciones, dieta, próxima cita, etc.)\n"
        "9. **Transcripción Literal Clave o Completa:** (Una transcripción del texto manuscrito o impreso para asegurar que no se pierda detalle)\n\n"
        "Por favor, genera únicamente el contenido en Markdown, limpio y profesional. No agregues preámbulos ni introducciones externas al bloque Markdown."
    )

    for i, img_path in enumerate(images, 1):
        md_path = os.path.splitext(img_path)[0] + ".md"
        
        # Omitir si ya fue procesado y no está vacío
        if os.path.exists(md_path) and os.path.getsize(md_path) > 10:
            print(f"[{i}/{len(images)}] {img_path} ya ha sido procesado. Omitiendo.")
            continue

        print(f"[{i}/{len(images)}] Procesando {img_path}...")
        
        retries = 3
        success = False
        while retries > 0 and not success:
            try:
                # Cargar la imagen usando PIL
                with Image.open(img_path) as img:
                    # Llamar a la API de Gemini usando google-genai
                    response = client.models.generate_content(
                        model=model_name,
                        contents=[img, prompt]
                    )
                    
                    if response.text:
                        # Guardar el contenido en el archivo markdown
                        with open(md_path, "w", encoding="utf-8") as f:
                            f.write(response.text)
                        print(f"  -> Guardado exitosamente en {md_path}")
                        success = True
                    else:
                        print(f"  -> Error: Respuesta vacía de la API para {img_path}.")
                        retries -= 1
            except Exception as e:
                error_msg = str(e)
                print(f"  -> Error al procesar {img_path}: {error_msg}")
                retries -= 1
                if retries > 0:
                    # Si es error de cuota agotada, esperamos 60 segundos en vez de 5
                    if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                        print("  -> Límite de cuota alcanzado (429/RESOURCE_EXHAUSTED). Esperando 60 segundos antes de reintentar...")
                        time.sleep(60)
                    else:
                        print("  -> Error genérico. Esperando 5 segundos antes de reintentar...")
                        time.sleep(5)
                else:
                    print(f"  -> Falló el procesamiento de {img_path} tras varios intentos.")
            
            # Pequeña pausa para no saturar la tasa de peticiones de la API
            if success:
                time.sleep(2)

    print("Proceso de extracción finalizado.")

if __name__ == "__main__":
    main()
