# Contexto de Desarrollo Local - WSL2 Ubuntu

Este documento resume las especificaciones técnicas y herramientas disponibles en el entorno local para optimizar la generación de código y la toma de decisiones arquitectónicas por parte de IAs.

## 1. Hardware y Sistema Operativo
*   **Host:** HP Pavilion Laptop 13-bb0xxx
*   **SO:** Ubuntu 24.04.4 LTS (WSL2) sobre Windows 11 Home (Build 26200)
*   **Kernel:** 6.6.114.1-microsoft-standard-WSL2
*   **CPU:** Intel Core i5-1135G7 (Tiger Lake-U) @ 2.40GHz
    *   Físico: 4 Cores / 8 Threads (10nm).
    *   Instrucciones clave: AVX, AVX2, **AVX-512** (VNNI, BITALG, VPOPCNTDQ), AES, SHA.
    *   Configuración WSL: 6 hilos lógicos asignados.
*   **Memoria RAM:** 
    *   Física: 8GB DDR4-3200 (2x4GB Micron).
    *   Asignada a WSL2: 4GB (3.8Gi disponibles).
*   **Gráficos:** Intel Iris Xe Graphics.
*   **Almacenamiento:** 
    *   Físico: NVMe SK hynix 256GB.
    *   Virtual (WSL): Disco de 256GB (30GB usados, ext4).
*   **Arquitectura:** x86_64

## 2. Stack de Lenguajes y Gestores
*   **Python:** 3.12.3 (Eje principal de desarrollo)
    *   Gestores: `uv` (preferido), `pipx`, `venv`.
*   **Node.js:** v22.22.3 (npm 10.9.8)
*   **Rust:** 1.96.0 (cargo disponible)
*   **PHP:** 8.3.6 (con Composer 2.7.1)
*   **Base de Datos:** MariaDB 10.11.14 (MySQL compatible)

## 3. Entorno Python Especializado
El entorno principal de desarrollo se encuentra en `/home/pedro/.virtualenvs/dev`. Está optimizado para:
*   **IA/LLM:** LangChain, LangGraph, Google Generative AI.
*   **Web Scraping:** Scrapy, Playwright, BeautifulSoup4.
*   **Document Processing:** PyMuPDF (fitz), PDFPlumber, MarkItDown.

## 4. Entorno Node.js y Herramientas Globales
Paquetes globales instalados para integración con Google Workspace y productividad:
*   `@google/gemini-cli`
*   `@googleworkspace/cli` (gws)
*   `@google/clasp`
*   `@google/jules`
*   `@openai/codex`

## 5. Integración y Herramientas Cloud
*   **Cloud:** Google Cloud SDK (`gcloud`), `kubectl`.
*   **VCS:** Git 2.43.0, GitHub CLI (`gh`).
*   **Editor:** VS Code (Interoperabilidad mediante `code .`).
*   **Red:** DNS de Google configurado (8.8.8.8).

## 6. Estándares de Calidad y Estilo
Para asegurar que el código sea mantenible y compatible con las herramientas locales:
*   **Python:** 
    *   Seguir **PEP8**.
    *   Uso obligatorio de **Type Hinting** (Python 3.12+).
    *   Herramienta de validación: `ruff` (disponible en venv `dev`).
*   **JavaScript:** 
    *   Preferir **Vanilla JS** moderno (ES6+).
    *   Evitar dependencias pesadas si es posible.

## 7. Flujo de Trabajo y Validación
*   **Testing:** Uso de `pytest` y `pytest-asyncio` para Python.
*   **Gestión de Dependencias:** Preferir `uv pip install` o `uv add` para velocidad.
*   **Auditoría Node:** Uso de `npm-check` y `depcheck` para limpiar `package.json`.

## 8. Interoperabilidad y Contenedores
*   **Docker:** Actualmente **NO está instalado** ni disponible. El entorno está configurado para desarrollo nativo. No se deben proponer soluciones basadas en contenedores (Docker/Compose) para evitar consumo innecesario de RAM y CPU.
*   **Contenedores:** Priorizar ejecuciones nativas (scripts directos, servicios del sistema). No intentar instalar motores de contenedores.
*   **Interoperabilidad:** Acceso a archivos de Windows mediante `/mnt/c/`. Los comandos de Windows (`powershell.exe`, `explorer.exe`) están integrados en el PATH.

## 9. Variables de Entorno Clave
El entorno dispone de las siguientes variables (usar `os.getenv` o `process.env`):
*   `GOOGLE_API_KEY`: Para servicios de IA de Google.
*   `GITHUB_TOKEN` y `GITHUB_USER`: Para automatización con `gh` y Git.
*   `DBUS_SESSION_BUS_ADDRESS`: Configurada para extensiones de Gemini CLI.

## 10. Notas Críticas para la IA
1.  **Memoria Limite (4GB):** Es el "cuello de botella". Priorizar procesamiento asíncrono (`asyncio`, `aiohttp`) y generadores para evitar errores de OOM (Out of Memory).
2.  **Web Scraping:** Playwright debe usarse en modo **headless** por defecto a menos que se requiera depuración visual.
3.  **Seguridad:** NUNCA generar código que incluya claves privadas. Utilizar las variables de entorno mencionadas.
4.  **Ubicación de Código:** Todo trabajo nuevo debe proponerse dentro de `~/JOB/`.

## 11. Protocolo de Instalación (Donde instalar qué)
Si la IA determina que falta una herramienta, debe seguir estas reglas:
*   **Librerías Python de Proyecto:** Instalar en `/home/pedro/.virtualenvs/dev` usando `uv pip install <paquete>`.
*   **Herramientas CLI de Python:** Usar `pipx install <paquete>` para mantenerlas aisladas en `~/.local/bin`.
*   **Paquetes Node.js Globales:** Instalar con `npm install -g <paquete>`. Se ubicarán automáticamente en `/home/pedro/.npm-global/bin` (ya en el PATH).
*   **Scripts de Usuario:** Guardar en `~/.local/bin` para herramientas de un solo archivo.

## 12. Comandos de Auditoría Rápida
Para verificar las librerías y paquetes instalados en cualquier momento, puedes ejecutar:

```bash
# Python: Listar librerías del entorno virtual dev (usando uv para mayor velocidad)
source /home/pedro/.virtualenvs/dev/bin/activate && uv pip list

# Node.js: Listar paquetes globales
npm list -g --depth=0
```
