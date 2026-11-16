# RAG Escenarios & LEL — Frontend Académico

Aplicación frontend modular desarrollada con **Vite + React 18 + TypeScript + Tailwind CSS v3** para la plataforma de elicitación, estructuración formal BNF y auditoría híbrida (determinística + semántica RAG) de Escenarios y Léxico Extendido del Lenguaje (LEL) bajo la metodología de **Hadad / Calegari**.

---

## 1. Requisitos e Instalación

Asegúrate de tener el backend NestJS corriendo en `http://localhost:3000` (o configura la variable `VITE_API_URL` en un archivo `.env`).

```bash
cd frontend
pnpm install
pnpm dev
```

La aplicación estará disponible en `http://localhost:5173`.

Para compilar y verificar tipos en producción:

```bash
pnpm run build
```

---

## 2. Arquitectura del Proyecto (`src/`)

```text
frontend/src/
├── components/
│   ├── Navbar.tsx                   # Barra académica superior + selector de pestañas + modal de configuración runtime LLM
│   └── ValidationFindingsTable.tsx  # Tabla unificada de defectos determinísticos BNF (O/E/D/A) y hallazgos semánticos RAG
├── services/
│   ├── api.ts                       # Cliente HTTP tipado hacia http://localhost:3000 con inyección de headers x-llm-*
│   └── presets.ts                   # Casos de prueba precargados (Caso de Estudio Juzgado + LEL + ejemplo con defectos)
├── types/
│   └── api.ts                       # Contratos TypeScript alineados con los DTOs e interfaces del backend NestJS
├── views/
│   ├── ExtractionView.tsx           # Pestaña 1: Extracción de Candidatos a Escenarios (POST /scenarios/extract)
│   ├── StructurerView.tsx           # Pestaña 2: Estructurador Formal BNF (POST /scenarios/structure)
│   ├── AuditBenchmarkView.tsx       # Pestaña 3: Auditoría Híbrida y Benchmark (POST /scenarios/benchmark & /validate)
│   └── RagVectorView.tsx            # Pestaña 4: Base Vectorial pgvector y Dominio LEL (GET/POST /rag/*)
├── App.tsx                          # Orquestador de vistas y flujo continuo entre pestañas
├── main.tsx                         # Punto de entrada React 18
└── index.css                        # Directivas Tailwind CSS y estilos de impresión académica (@media print)
```

---

## 3. Vistas y Flujo Metodológico

1. **Pestaña 1 — Extracción & Relevamiento (`ExtractionView.tsx`)**:
   - Permite cargar transcripciones de entrevistas o relevamientos desestructurados (`.md` / `.txt` o preset de 1 clic del *Caso de Estudio Juzgado*).
   - Invoca `POST /scenarios/extract` e identifica escenarios candidatos (`Integrador`, `Particular`, `Sub-Escenario`, `Excepción`) con su justificación y cita textual (`sourceQuote`).
   - Cada fila incluye el botón **"Enviar a Estructurar"**, que transfiere automáticamente el candidato seleccionado y su contexto a la Pestaña 2.

2. **Pestaña 2 — Estructurador Formal (`StructurerView.tsx`)**:
   - Convierte una narrativa informal en la plantilla formal BNF de escenarios mediante `POST /scenarios/structure`.
   - Renderiza la anatomía estructural parseada (Objetivo, Contexto Geográfico/Temporal/Precondiciones, Actores, Recursos, Episodios numerados con `[Restricción: ...]` y Excepciones `Causa`/`Tratamiento`), el Markdown formal descargable y el reporte inmediato de validación con acceso directo a la Pestaña 3 (**"Abrir en Auditoría"**).

3. **Pestaña 3 — Auditoría & Benchmark (`AuditBenchmarkView.tsx`)**:
   - **Auto-detección del formato de entrada**: distingue automáticamente entre una suite multi-escenario (`POST /scenarios/benchmark`), un escenario formal individual (`POST /scenarios/validate`) o texto narrativo sin estructura.
   - **Acciones rápidas**: botón *"Cargar y Ejecutar Caso de Estudio (Juzgado)"* (evalúa los 12 escenarios futuros normalizados en el servidor) y *"Cargar Ejemplo Individual con Defectos"*.
   - **Panel de KPIs y Acordeón de Escenarios**: tasa de validez, errores determinísticos, hallazgos semánticos RAG con citas al Marco Teórico y trazabilidad de símbolos LEL recuperados desde `pgvector`.
   - **Exportación Académica**: descarga del reporte completo en `.md` y vista de impresión limpia para PDF (`window.print()`).

4. **Pestaña 4 — Base Vectorial & Dominio LEL (`RagVectorView.tsx`)**:
   - Monitoreo de métricas `pgvector` (`GET /rag/stats`) desglosadas por `MARCO_TEORICO` y `LEL`.
   - Re-indexación con 1 clic del Corpus Oficial (`POST /rag/ingest/corpus`).
   - Indexación de nuevos glosarios LEL (`POST /rag/ingest/lel`) tanto en formato `### Símbolo Nº X` como en formato compacto.
   - Explorador de búsqueda semántica por similitud coseno (`POST /rag/search`) con filtros por tipo de documento, proyecto y `topK`.
