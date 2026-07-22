// Lógica principal de la aplicación Historia Clínica de Jack

// 1. Datos históricos de peso estructurados para el gráfico de Canvas
const WEIGHT_HISTORY = [
  { date: "05/2023", weight: 4.1 },
  { date: "06/2023", weight: 5.8 },
  { date: "08/2023", weight: 12.2 },
  { date: "10/2023", weight: 16.0 },
  { date: "12/2023", weight: 18.5 },
  { date: "03/2024", weight: 21.0 },
  { date: "10/2024", weight: 24.6 },
  { date: "07/2025", weight: 26.0 },
  { date: "10/2025", weight: 25.5 },
  { date: "02/2026", weight: 26.7 },
  { date: "03/2026", weight: 26.4 },
  { date: "04/2026", weight: 26.4 },
  { date: "05/2026", weight: 26.4 }
];

document.addEventListener("DOMContentLoaded", () => {
  calculateAge();
  initWeightChart();
  renderTimeline();
  setupFilters();
  setupModal();
});

// 2. Calcular la edad de Jack basada en su nacimiento (15 de Abril de 2023)
function calculateAge() {
  const birthDate = new Date("2023-04-15");
  const currentDate = new Date("2026-07-22"); // Fecha actual del sistema en metadatos
  
  let years = currentDate.getFullYear() - birthDate.getFullYear();
  let months = currentDate.getMonth() - birthDate.getMonth();
  
  if (months < 0 || (months === 0 && currentDate.getDate() < birthDate.getDate())) {
    years--;
    months += 12;
  }
  
  const ageString = `${years} años y ${months} meses`;
  document.getElementById("petAge").textContent = ageString;
}

// 3. Dibujar gráfico de peso personalizado en un Canvas HTML5
function initWeightChart() {
  const canvas = document.getElementById("weightChart");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  
  // Ajustar resolución del canvas para pantallas de alta densidad (Retina)
  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    drawChart(canvas, ctx);
  };
  
  // Observar redimensionamientos de la ventana
  window.addEventListener("resize", resizeCanvas);
  
  // Pequeño retardo para asegurar que el DOM cargó el tamaño real del contenedor
  setTimeout(resizeCanvas, 100);
}

function drawChart(canvas, ctx) {
  const width = canvas.width / window.devicePixelRatio;
  const height = canvas.height / window.devicePixelRatio;
  
  // Limpiar lienzo
  ctx.clearRect(0, 0, width, height);
  
  // Configuración de márgenes
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  const maxWeight = 30; // Peso máximo para la escala
  const minWeight = 0;
  
  // Dibujar líneas de guía horizontales (Grid)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#8b949e";
  ctx.font = "10px Inter";
  ctx.textAlign = "right";
  
  const gridLines = 4;
  for (let i = 0; i <= gridLines; i++) {
    const val = minWeight + ((maxWeight - minWeight) / gridLines) * i;
    const y = height - paddingBottom - (chartHeight / gridLines) * i;
    
    // Línea
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(width - paddingRight, y);
    ctx.stroke();
    
    // Etiqueta de peso
    ctx.fillText(`${val} kg`, paddingLeft - 8, y + 3);
  }
  
  // Calcular coordenadas de los puntos
  const points = WEIGHT_HISTORY.map((item, index) => {
    const x = paddingLeft + (chartWidth / (WEIGHT_HISTORY.length - 1)) * index;
    const y = height - paddingBottom - (chartHeight * (item.weight - minWeight)) / (maxWeight - minWeight);
    return { x, y, label: item.date, weight: item.weight };
  });
  
  // 1. Dibujar área con gradiente bajo la curva
  ctx.beginPath();
  ctx.moveTo(points[0].x, height - paddingBottom);
  points.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length - 1].x, height - paddingBottom);
  ctx.closePath();
  
  const fillGradient = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
  fillGradient.addColorStop(0, "rgba(59, 130, 246, 0.25)"); // Azul brillante
  fillGradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");
  ctx.fillStyle = fillGradient;
  ctx.fill();
  
  // 2. Dibujar la línea de la curva
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    // Usar curvas bezier para suavizar la línea
    const xc = (points[i - 1].x + points[i].x) / 2;
    const yc = (points[i - 1].y + points[i].y) / 2;
    ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 3;
  ctx.shadowColor = "rgba(59, 130, 246, 0.5)";
  ctx.shadowBlur = 8;
  ctx.stroke();
  
  // Resetear sombras
  ctx.shadowBlur = 0;
  
  // 3. Dibujar puntos (círculos) sobre la curva y etiquetas del eje X
  ctx.textAlign = "center";
  ctx.fillStyle = "#f0f6fc";
  
  points.forEach((p, index) => {
    // Dibujar punto
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#3b82f6";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    
    // Escribir peso encima solo de algunos puntos para no saturar
    if (index % 2 === 0 || index === points.length - 1) {
      ctx.fillStyle = "#f0f6fc";
      ctx.font = "600 10px Inter";
      ctx.fillText(`${p.weight}`, p.x, p.y - 10);
    }
    
    // Etiquetas de fecha en el eje X
    if (index % 2 === 0 || index === points.length - 1) {
      ctx.fillStyle = "#8b949e";
      ctx.font = "9px Inter";
      ctx.fillText(p.label, p.x, height - 10);
    }
  });
}

// 4. Renderizar el Timeline de eventos médicos
let activeFilter = "all";
let searchQuery = "";

function renderTimeline() {
  const container = document.getElementById("timelineContainer");
  if (!container) return;
  
  container.innerHTML = "";
  
  // Procesar y parsear fechas para el ordenamiento cronológico inverso
  const parsedHistory = CLINICAL_HISTORY.map(doc => {
    let dateObj = new Date("1970-01-01"); // Fecha por defecto si no es parseable
    const rawDate = doc.fecha_consulta || "";
    
    // Intentar extraer una fecha YYYY-MM-DD
    const matchYMD = rawDate.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (matchYMD) {
      dateObj = new Date(matchYMD[0]);
    } else {
      // Intentar extraer de formatos alternativos o rangos en el texto
      const matchRange = rawDate.match(/(\d{2})[-/](\d{2})[-/](\d{4})/);
      if (matchRange) {
        dateObj = new Date(`${matchRange[3]}-${matchRange[2]}-${matchRange[1]}`);
      }
    }
    
    return { ...doc, dateObj };
  });
  
  // Ordenar cronológicamente descendente
  parsedHistory.sort((a, b) => b.dateObj - a.dateObj);
  
  // Filtrar según estado de filtros y búsquedas
  const filteredHistory = parsedHistory.filter(doc => {
    // Filtro por tipo
    if (activeFilter !== "all") {
      if (activeFilter === "Historial de Desparasitación") {
        if (!doc.tipo_documento.includes("Desparasitación") && !doc.tipo_documento.includes("Antiparasitario")) {
          return false;
        }
      } else if (activeFilter === "Exámenes") {
        if (!doc.tipo_documento.includes("Exámenes") && !doc.tipo_documento.includes("Laboratorio")) {
          return false;
        }
      } else if (doc.tipo_documento !== activeFilter) {
        return false;
      }
    }
    
    // Filtro por búsqueda de texto
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchType = doc.tipo_documento.toLowerCase().includes(q);
      const matchClinica = doc.clinica_profesional.toLowerCase().includes(q);
      const matchDiag = doc.diagnosticos_sintomas.toLowerCase().includes(q);
      const matchMed = doc.medicamentos_tratamiento.toLowerCase().includes(q);
      const matchIndic = doc.indicaciones_adicionales.toLowerCase().includes(q);
      const matchTransc = doc.transcripcion_completa.toLowerCase().includes(q);
      
      return matchType || matchClinica || matchDiag || matchMed || matchIndic || matchTransc;
    }
    
    return true;
  });
  
  // Renderizar
  if (filteredHistory.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-folder-open"></i>
        <p>No se encontraron registros médicos que coincidan con la búsqueda.</p>
      </div>
    `;
    return;
  }
  
  filteredHistory.forEach(doc => {
    const card = document.createElement("article");
    card.className = "timeline-card";
    card.setAttribute("data-type", doc.tipo_documento);
    
    // Generar formato de fecha legible
    let displayDate = doc.fecha_consulta || "Fecha No Especificada";
    if (doc.dateObj.getFullYear() > 1970) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      displayDate = doc.dateObj.toLocaleDateString('es-ES', options);
    }
    
    // Limpiar nombre clínica para el subtítulo de la tarjeta
    let clinicName = "Clínica Veterinaria Pequeños Animales Reyes";
    if (doc.clinica_profesional) {
      const firstLine = doc.clinica_profesional.split('\n')[0];
      clinicName = firstLine.replace('Nombre del Centro:**', '').replace('Clínica Veterinaria:**', '').trim();
    }
    if (clinicName.toLowerCase().includes("no disponible")) {
      clinicName = "Registro Local / Cartilla Sanitaria";
    }
    
    // Resumir el diagnóstico/síntomas para mostrar en la tarjeta
    let diagSnippet = doc.diagnosticos_sintomas || "No especificado en el registro";
    diagSnippet = diagSnippet.replace('Inferido de tratamientos:**', '').trim();
    if (diagSnippet.length > 150) {
      diagSnippet = diagSnippet.substring(0, 147) + "...";
    }
    
    // Resumir medicamentos
    let medListHtml = "";
    if (doc.medicamentos_tratamiento && !doc.medicamentos_tratamiento.toLowerCase().includes("no se especifican") && !doc.medicamentos_tratamiento.toLowerCase().includes("no disponible")) {
      const meds = doc.medicamentos_tratamiento.split('\n').filter(line => line.trim().startsWith('*') || line.trim().match(/^[I|V|X]+\)/)).slice(0, 3);
      meds.forEach(med => {
        const cleanedMed = med.replace(/^[\*\-\s]+/, '').replace(/^[I|V|X]+\)\s*/, '').replace(/\*\*/g, '').trim();
        if (cleanedMed) {
          medListHtml += `<li>${cleanedMed}</li>`;
        }
      });
    }
    
    if (!medListHtml) {
      medListHtml = `<li>Ver detalles del documento</li>`;
    }
    
    card.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-card-header">
        <div>
          <h3 class="doc-type">${doc.tipo_documento || "Documento Médico"}</h3>
          <div class="doc-clinic"><i class="fa-solid fa-user-doctor"></i> ${clinicName}</div>
        </div>
        <span class="doc-date">${displayDate}</span>
      </div>
      
      <div class="doc-summary-item">
        <div class="doc-summary-label">Diagnósticos / Síntomas</div>
        <div class="doc-summary-value">${diagSnippet}</div>
      </div>
      
      <div class="doc-summary-item">
        <div class="doc-summary-label">Tratamiento / Indicaciones Clave</div>
        <div class="doc-summary-value">
          <ul>
            ${medListHtml}
          </ul>
        </div>
      </div>
      
      <div class="card-actions">
        <button class="btn-detail" onclick="openDetails('${doc.id}')">
          <i class="fa-solid fa-eye"></i> Ver Historia Completa
        </button>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// 5. Configurar Filtros y Barra de Búsqueda
function setupFilters() {
  // Filtros por botón
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      filterBtns.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      activeFilter = e.target.getAttribute("data-filter");
      renderTimeline();
    });
  });
  
  // Barra de búsqueda en tiempo real
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderTimeline();
    });
  }
}

// 6. Configurar Ventana Modal Interactiva y Tabs
let selectedDoc = null;

function setupModal() {
  const modal = document.getElementById("detailModal");
  const closeBtn = document.getElementById("closeModalBtn");
  
  // Cerrar al hacer clic en X
  closeBtn.addEventListener("click", closeModal);
  
  // Cerrar al hacer clic fuera del modal
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  
  // Cerrar al pulsar Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
  
  // Lógica de Tabs del Modal
  const tabBtns = document.querySelectorAll(".modal-tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      tabBtns.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      
      const tabId = e.target.getAttribute("data-tab");
      document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
      
      if (tabId === "resumen") {
        document.getElementById("tabResumen").classList.add("active");
      } else {
        document.getElementById("tabTranscripcion").classList.add("active");
      }
    });
  });
}

function openDetails(docId) {
  selectedDoc = CLINICAL_HISTORY.find(doc => doc.id === docId);
  if (!selectedDoc) return;
  
  const modal = document.getElementById("detailModal");
  
  // Configurar metadatos del header del modal
  document.getElementById("modalTitle").textContent = selectedDoc.tipo_documento || "Detalle Médico";
  document.getElementById("modalSubtitle").textContent = `Archivo original: ${selectedDoc.filename} | Código ID: ${selectedDoc.id}`;
  
  // Llenar contenido de las secciones del resumen
  fillSection("Clinica", selectedDoc.clinica_profesional);
  fillSection("Paciente", selectedDoc.datos_paciente);
  fillSection("Diagnostico", selectedDoc.diagnosticos_sintomas);
  fillSection("Tratamiento", selectedDoc.medicamentos_tratamiento);
  fillSection("Resultados", selectedDoc.examenes_resultados);
  fillSection("Indicaciones", selectedDoc.indicaciones_adicionales);
  
  // Llenar transcripción completa
  document.getElementById("valTranscripcion").textContent = selectedDoc.transcripcion_completa || "No disponible.";
  
  // Resetear pestañas del modal (volver al resumen por defecto)
  document.querySelectorAll(".modal-tab-btn").forEach(btn => {
    if (btn.getAttribute("data-tab") === "resumen") btn.classList.add("active");
    else btn.classList.remove("active");
  });
  document.getElementById("tabResumen").classList.add("active");
  document.getElementById("tabTranscripcion").classList.remove("active");
  
  // Mostrar modal con efectos
  modal.classList.add("active");
  document.body.style.overflow = "hidden"; // Desactivar scroll de fondo
}

function fillSection(secName, value) {
  const section = document.getElementById(`sec${secName}`);
  const valContainer = document.getElementById(`val${secName}`);
  
  if (!value || value.toLowerCase().includes("no disponible") || value.toLowerCase().includes("no se especifica")) {
    section.style.display = "none";
  } else {
    section.style.display = "block";
    valContainer.innerHTML = formatMarkdownToHTML(value);
  }
}

function closeModal() {
  const modal = document.getElementById("detailModal");
  modal.classList.remove("active");
  document.body.style.overflow = ""; // Reactivar scroll de fondo
}

// Convertidor básico de Markdown ligero a HTML para mantener las negritas y viñetas
function formatMarkdownToHTML(text) {
  if (!text) return "";
  
  let html = text;
  
  // Reemplazar negritas (**texto**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Reemplazar viñetas (* item o - item)
  html = html.replace(/^\*\s+(.*)$/gm, '<li>$1</li>');
  html = html.replace(/^\-\s+(.*)$/gm, '<li>$1</li>');
  
  // Agrupar elementos <li> en listas <ul>
  // Un parser muy simplificado pero suficiente para nuestro formato estructurado
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  return html;
}
