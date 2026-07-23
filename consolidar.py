import os
import glob
import re
import json

def parse_markdown(content):
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
    positions = []
    
    for key_id, pattern in keys:
        regex = r'(?:\d+\.\s*)?\*?\*?' + pattern + r':?\*?\*?:?'
        match = re.search(regex, content, re.IGNORECASE)
        if match:
            positions.append((key_id, match.start(), match.end()))
            
    positions.sort(key=lambda x: x[1])
    
    for i in range(len(positions)):
        key_id, start, end = positions[i]
        next_start = positions[i+1][1] if i+1 < len(positions) else len(content)
        
        section_text = content[end:next_start].strip()
        section_text = re.sub(r'^[\s\n\*\-\#\:]+', '', section_text)
        section_text = re.sub(r'[\s\n\*\-\#]+$', '', section_text)
        data[key_id] = section_text
        
    for key_id, _ in keys:
        if key_id not in data:
            data[key_id] = ""
            
    # Identificar si está asociado a la enfermedad dermatológica / alérgica
    dermatology_terms = [
        'dermatol', 'alerg', 'apoquel', 'cyclavance', 'cytopoint', 
        'prednisolona', 'cortavance', 'clobetasol', 'anallergenic', 
        'dermosyn', 'sanimicon', 'alernex', 'piel', 'rascado', 'prurito', 'otitis'
    ]
    
    content_lower = content.lower()
    matches = [term for term in dermatology_terms if term in content_lower]
    data["es_dermatologico"] = len(matches) > 0
    data["terminos_enfermedad"] = matches
    
    return data

def main():
    md_files = sorted(glob.glob("*.md"))
    md_files = [f for f in md_files if f not in ["CONTEXTO_LOCAL.md", "README.md", "consolidar.py", "extraer_historia.py"]]
    
    documents = []
    for md_file in md_files:
        file_id = os.path.splitext(md_file)[0]
        with open(md_file, "r", encoding="utf-8") as f:
            content = f.read()
            
        doc_data = parse_markdown(content)
        doc_data["id"] = file_id
        doc_data["filename"] = md_file
        documents.append(doc_data)
        
    output_js = "data.js"
    with open(output_js, "w", encoding="utf-8") as f:
        f.write("// Datos consolidados de la historia clínica de Jack\n")
        f.write("const CLINICAL_HISTORY = ")
        f.write(json.dumps(documents, indent=2, ensure_ascii=False))
        f.write(";\n")
        
    print(f"Consolidación exitosa. {len(documents)} registros procesados.")

if __name__ == "__main__":
    main()
