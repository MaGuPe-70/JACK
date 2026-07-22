import os
import glob
import re
import json

def parse_markdown(content):
    # Lista de claves en el orden en que aparecen típicamente en los documentos
    keys = [
        ("tipo_documento", r'Tipo de Documento'),
        ("fecha_consulta", r'Fecha(?: de)? Emisión/Consulta'),
        ("clinica_profesional", r'Clínica Veterinaria\s*/\s*Profesional'),
        ("datos_paciente", r'Datos del Paciente'),
        ("diagnosticos_sintomas", r'Diagnósticos y Síntomas'),
        ("medicamentos_tratamiento", r'Medicamentos y Tratamiento Prescrito'),
        ("examenes_resultados", r'Exámenes y Resultados'),
        ("indicaciones_adicionales", r'Indicaciones Adicionales'),
        ("transcripcion_completa", r'Transcripción Literal Clave o Completa')
    ]
    
    data = {}
    
    # Encontrar las posiciones de inicio de cada sección en el texto
    positions = []
    for key_id, pattern in keys:
        # Buscar el patrón rodeado opcionalmente de asteriscos, números y dos puntos
        # Ej: "1. **Tipo de Documento:**" o "**Tipo de Documento**:" o "Tipo de Documento:"
        regex = r'(?:\d+\.\s*)?\*?\*?' + pattern + r':?\*?\*?:?'
        match = re.search(regex, content, re.IGNORECASE)
        if match:
            positions.append((key_id, match.start(), match.end()))
            
    # Ordenar posiciones por su aparición en el texto
    positions.sort(key=lambda x: x[1])
    
    # Extraer el contenido entre las posiciones encontradas
    for i in range(len(positions)):
        key_id, start, end = positions[i]
        next_start = positions[i+1][1] if i+1 < len(positions) else len(content)
        
        section_text = content[end:next_start].strip()
        # Limpiar posibles asteriscos o guiones iniciales/finales sobrantes
        section_text = re.sub(r'^[\s\n\*\-\#\:]+', '', section_text)
        section_text = re.sub(r'[\s\n\*\-\#]+$', '', section_text)
        data[key_id] = section_text
        
    # Llenar las claves que no se encontraron
    for key_id, _ in keys:
        if key_id not in data:
            data[key_id] = ""
            
    return data

def main():
    md_files = sorted(glob.glob("*.md"))
    # Excluir archivos que no son historias médicas individuales
    md_files = [f for f in md_files if f != "CONTEXTO_LOCAL.md" and f != "README.md" and f != "consolidar.py" and f != "extraer_historia.py"]
    
    documents = []
    
    for md_file in md_files:
        file_id = os.path.splitext(md_file)[0]
        print(f"Parseando {md_file}...")
        
        with open(md_file, "r", encoding="utf-8") as f:
            content = f.read()
            
        doc_data = parse_markdown(content)
        doc_data["id"] = file_id
        doc_data["filename"] = md_file
        
        documents.append(doc_data)
        
    # Guardar a un archivo JavaScript
    output_js = "data.js"
    with open(output_js, "w", encoding="utf-8") as f:
        f.write("// Datos consolidados de la historia clínica de Jack\n")
        f.write("const CLINICAL_HISTORY = ")
        f.write(json.dumps(documents, indent=2, ensure_ascii=False))
        f.write(";\n")
        
    print(f"Consolidación exitosa. Creado archivo {output_js} con {len(documents)} registros.")

if __name__ == "__main__":
    main()
