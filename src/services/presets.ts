import { CandidateScenarioRole } from '../types/api';

export const DEFAULT_BLANK_PROJECT_NAME = 'Mi Proyecto de Software';
export const JUZGADO_DEMO_PROJECT_NAME = 'Gestión de Documentos en Juzgado';

/**
 * Full Anonymized Interview Transcripts from `01-transcripcion-anonimizada.md`
 */
export const JUZGADO_FULL_TRANSCRIPT_MARKDOWN = `# Objetivos y Transcripciones de Entrevistas (Anonimizado)

> **Documento fuente original**: \`1-Obj-Transcripciones-Entrevistas.pdf\`  
> **Estado**: Versión Anonimizada para RAG y Extracción de Requisitos

---

## 1. Objetivo del Proyecto
Aplicar la Reingeniería en el Sistema de Software EJE para poder migrar a una APP WEB. Como objetivo se busca la transparencia total ante el usuario donde la única diferencia que debería percibir es utilizar un navegador web ante la anterior solución de VPN + RDP.

## 2. Objetivo del Sistema
Gestionar eficientemente todos los Documentos referidos a los distintos casos del Fuero Contencioso Administrativo y Tributario del Poder Judicial [JURISDICCIÓN_LOCAL].

## 3. Alcance del Sistema
- El sistema únicamente contempla al Fuero Contencioso Administrativo y Tributario.
- El sistema debe administrar la documentación de los casos.
- El sistema debe administrar los expedientes de los casos.
- El sistema debe administrar el estado de los casos y notificar a las partes correspondientes.
- Facilitar el acceso al sistema fuera del Poder Judicial.
- El sistema debe contar con seguridad en los datos y privacidad de la información.

## 4. Contexto Organizacional
Tras nuestra primera reunión con el cliente, pudimos detectar que actualmente para su labor diaria utilizan una conexión VPN, junto con un escritorio remoto. Sin embargo, estos métodos presentan inconvenientes relacionados con la estabilidad de la red y la carga del servidor, lo que provoca demoras en la conexión, caídas de sesión y problemas de conectividad.

Por esta razón, hemos propuesto una solución que consiste en el desarrollo de una aplicación web capaz de conectar los diferentes servicios y sistemas mediante APIs si fuese necesario. Esta solución permitirá a los usuarios evitar el problema de las sesiones remotas que caen debido a la inestabilidad de la red y la carga del servidor VPN.

Es importante destacar que nuestra solución también contempla una serie de requisitos no funcionales que resultan fundamentales para garantizar la calidad del producto final. Entre ellos, destacan la atomicidad, consistencia/integridad y durabilidad de las transacciones, que permitirán garantizar que las mismas se completen en su totalidad sin errores, así como la persistencia de los datos utilizando una base de datos.

Además, se ha decidido implementar un sistema de autenticación de múltiple factor (MFA) para garantizar la seguridad de los usuarios y un control de acceso adecuado en caso de ser necesario. Esta medida resulta especialmente importante en un mundo cada vez más conectado, donde la privacidad y la protección de datos personales son una necesidad.

---

## 5. Minutas y Transcripciones de Entrevistas

### Minuta de Reunión 1: Entrevista al Escribiente
- **Fecha**: 15 de marzo de 2023
- **Lugar**: Google Meet
- **Participantes**:
  - \`EE\`: Escribiente Entrevistado (Escribiente Judicial)
  - \`EA\`: Entrevistador A (Ingeniero de Requisitos)

**Temas conversados**:
- Relación y puesto de trabajo en el Poder Judicial [JURISDICCIÓN_LOCAL].
- Cargo de escribiente y sus responsabilidades en relación a los despachos de expedientes.
- Significado de "despachar".
- Sistemas informáticos y su interconexión con otros juzgados y abogados.
- Software utilizado actualmente (\`Sistema EJE\`) y problemáticas asociadas al mismo.
- Problemas con el acceso remoto al aplicativo y pérdida de información en el tiempo.

La reunión comenzó con una breve presentación del Escribiente y una descripción de su relación y puesto de trabajo en el Poder Judicial. El Escribiente explicó su cargo de escribiente y detalló sus responsabilidades en relación a los despachos de expedientes, donde sus superiores tienen que validar y verificar sus despachos. También se habló sobre el significado de "despachar" en el contexto judicial.
Posteriormente, se discutió sobre los sistemas informáticos utilizados en el juzgado y su interconexión con otros juzgados y abogados. Se mencionó el software utilizado actualmente y se conversó sobre las problemáticas asociadas al mismo, incluyendo los problemas de acceso remoto al aplicativo y la pérdida de información en el tiempo.
Se acordó una próxima reunión para conversar sobre las posibles soluciones a los problemas relevados.

#### Desgrabación de la Entrevista 1:

| Hablante | Conversado |
| :--- | :--- |
| **EA** | Buenas ¿cómo andan?, ¿todo bien? Bueno les presento, estoy con el estimado Escribiente. ¿Cómo estás? |
| **EE** | Hola, ¿qué tal? Buenas tardes a todos. |
| **EA** | Bueno, esta entrevista se realiza para ingeniería de requisitos con el objetivo de conocer el ambiente laboral en el juzgado, cuáles son sus tareas diarias y ver la incorporación de una solución de software que las facilite. Coméntanos un poquito en dónde trabajas. |
| **EE** | Bueno, yo trabajo en el Poder Judicial [JURISDICCIÓN_LOCAL], en el Fuero Contencioso Administrativo y Tributario, en un juzgado de primera instancia. |
| **EA** | Bien, perfecto. Y dentro de ese juzgado, ¿qué tareas tenés que realizar diariamente? ¿Tenés superiores a quienes reportar? |
| **EE** | Sí, trabajo en relación de dependencia. Tengo el cargo de escribiente, por lo cual en la escala jerárquica tengo varias personas por encima de mi cargo. Mi trabajo básicamente consiste en **despachar**. Si un sujeto acude al juzgado con alguna petición en específico en el marco de un expediente, yo tengo la tarea de responder esa petición acorde a derecho. Posteriormente ese despacho pasa para corrección y fiscalización de mis superiores para ver si lo que estoy contestando es correcto. |
| **EA** | Bien. Y cuando decís "despachar", ¿a qué te referís puntualmente? |
| **EE** | Despachar básicamente significa que cuando un abogado presenta un escrito en un juzgado solicitando algo en un expediente, nosotros contestamos o resolvemos dicha petición conforme a derecho mediante un informe, providencia o sentencia. |
| **EA** | Bien. ¿Y qué duración o complejidad tienen estas peticiones? |
| **EE** | Va variando según el despacho. Pueden ser sentencias interlocutorias o definitivas de mayor complejidad, o bien providencias simples que se resuelven en minutos. Pero como mencioné, los despachos que realizo son fiscalizados por un superior jerárquico que corrobora que esté en condiciones y sea acorde a derecho. |
| **EA** | ¿Tienen algún sistema informático que utilicen actualmente para comunicarse y trabajar? |
| **EE** | Sí, todas las causas que tramitan en nuestros juzgados se gestionan de forma digital, sin soporte papel. Tenemos un programa informático que se llama **Sistema EJE**, que concentra todas las funciones: despacho, notificaciones, creación de expedientes y consulta de causas. |
| **EA** | ¿Qué tipo de expedientes son los más frecuentes? |
| **EE** | Los más recurrentes son los juicios de ejecuciones fiscales. Al trabajar en el fuero contencioso administrativo y tributario, la mayoría son por deudas de impuestos (patentes, ABL, ingresos brutos). |
| **EA** | Y el Sistema EJE, ¿cómo resulta en eficiencia? ¿Qué fallas presenta? |
| **EE** | Funcionalmente cuenta con herramientas, pero el problema reside en el correcto funcionamiento y estabilidad: presenta fallas frecuentes. Si uno trabaja de forma remota y no presencial a través de la computadora, el sistema se traba frecuentemente y se pierde la conexión. |
| **EA** | Cuando se pierde la conexión cargando un documento o expediente, ¿se pierde la información? |
| **EE** | Depende del tiempo de desconexión. Al ser un sistema por VPN y escritorio remoto, si se desconecta brevemente la sesión puede reanudarse al reconectar. Pero si transcurre un lapso prolongado, la sesión cae y se pierde todo el trabajo que no se hubiese guardado. |
| **EA** | Excelente. Te agradezco mucho por tu tiempo y la predisposición para colaborar con el relevamiento. |
| **EE** | No, por favor. Gracias a ustedes. |

---

### Minuta de Reunión 2: Entrevista a Sistemas / Mesa de Ayuda
- **Fecha**: 3 de abril de 2023
- **Lugar**: \`[UBICACIÓN_REUNIÓN]\`
- **Participantes**:
  - \`IT\`: Integrante del Departamento de Sistemas (Supervisor de Mesa de Ayuda - Anónimo)
  - \`EB\`: Entrevistador B (Ingeniero de Requisitos)

**Agenda**:
- Puesto de trabajo en el departamento de sistemas como supervisor de mesa de ayuda.
- Metodología de VPN y escritorio remoto utilizados para la conexión externa.
- Problemas con la conexión VPN y desconexiones esporádicas con pérdida de datos.
- Propuesta de solución basada en arquitectura Web.
- Requerimientos de alta seguridad y confidencialidad de la información judicial.

#### Desgrabación de la Entrevista 2:

| Hablante | Conversado |
| :--- | :--- |
| **EB** | Gracias por recibirme y por tu tiempo. Entendí bien que solicitás reserva de identidad. |
| **IT** | Sí, te agradezco que no reveles mi identidad personal ni datos específicos, ya que la información del juzgado es confidencial y debemos resguardar los protocolos internos. |
| **EB** | Totalmente entendido y respetado. Contanos cuál es tu función en el área. |
| **IT** | Soy analista y supervisor de mesa de ayuda del departamento de sistemas. Recibo los incidentes y solicitudes de los usuarios del fuero judicial. |
| **EB** | En la entrevista anterior con el escribiente nos comentaron sobre el Sistema EJE y algunos problemas de acceso. ¿Qué nos podés comentar desde el punto de vista de soporte? |
| **IT** | Los problemas no son tanto funcionales del software EJE en sí, sino de la infraestructura de acceso remoto que se implementó. Desde la pandemia se migró al teletrabajo mediante VPN + Escritorio Remoto (RDP). La VPN suele saturarse y caerse. Cuando cae la VPN, se desconecta el escritorio remoto y muchos usuarios pierden lo que estaban cargando. |
| **EB** | Nosotros proponemos una aplicación web que elimine la dependencia del túnel VPN y el escritorio remoto, accediendo de forma segura y directa por navegador. ¿Lo ven viable? |
| **IT** | Sí, de hecho es lo que se estuvo evaluando y lo que se necesita técnicamente para estabilizar la operatoria diaria. |
| **EB** | ¿Qué aspectos técnicos priorizan para una nueva versión del sistema? |
| **IT** | La **prioridad absoluta es la seguridad**. La información de los expedientes, procesos y resoluciones es confidencial y crítica. Debe existir autenticación robusta (MFA), integridad de transacciones y control de permisos estricto. |
| **EB** | Impecable. Muchísimas gracias por el aporte técnico. |
| **IT** | Gracias a vos. Nos mantenemos en contacto. |`;

/**
 * Full 17 LEL Symbols from `02-lel-normalizado.md`
 */
export const JUZGADO_FULL_LEL_MARKDOWN = `# Léxico Extendido del Lenguaje (LEL) - Normalizado y Anonimizado

> **Proyecto**: Sistema de Gestión de Documentos Judiciales (Sistema EJE)  
> **Área**: Fuero Contencioso Administrativo y Tributario - Poder Judicial [JURISDICCIÓN_LOCAL]  
> **Versión**: 1.1 (Anonimizada para Benchmark e Ingesta RAG)

---

## 1. Lista de Símbolos

| Nº | Símbolo | Tipo (Sujeto / Objeto / Verbo / Estado) |
| :--- | :--- | :--- |
| 1 | Acorde a derecho | Estado |
| 2 | Despachar | Verbo |
| 3 | Despacho | Objeto |
| 4 | Documento | Objeto |
| 5 | Escribiente | Sujeto |
| 6 | Ejecución fiscal | Verbo |
| 7 | Expediente | Objeto |
| 8 | Fiscalizado | Estado |
| 9 | Fuero | Sujeto |
| 10 | Juzgado | Sujeto |
| 11 | Fiscal | Sujeto |
| 12 | Petición | Verbo |
| 13 | Proceso Judicial | Verbo |
| 14 | Sentencia | Objeto |
| 15 | Sentencia definitiva | Estado |
| 16 | Sentencia interlocutoria | Estado |
| 17 | Juez | Sujeto |

---

## 2. Descripción de Símbolos

### Símbolo Nº 1: Acorde a derecho
- **Tipo**: Estado
- **Noción**: Condición en la que se encuentra una providencia o sentencia judicial cuando se ajusta estrictamente al marco normativo y legal vigente.
- **Impacto**: La resolución o despacho es validada formalmente por el Juzgado.

### Símbolo Nº 2: Despachar
- **Tipo**: Verbo
- **Noción**: Acción llevada a cabo por el Escribiente en el trámite procesal para responder una petición o proveer un escrito presentado por un letrado o parte.
- **Impacto**: 
  1. El Escribiente analiza y clasifica los Expedientes.
  2. El Escribiente redacta el proveído y lo eleva para fiscalización de los superiores jerárquicos.

### Símbolo Nº 3: Despacho
- **Tipo**: Objeto
- **Noción**: Documento o resolución emitida en el juzgado en respuesta a un escrito procesal; también comprende la bandeja o repositorio digital donde se gestionan los trámites.
- **Impacto**:
  1. Almacena documentos y actuaciones vinculadas al expediente.
  2. Es revisado por los funcionarios del juzgado.

### Símbolo Nº 4: Documento
- **Tipo**: Objeto
- **Noción**: Archivo digital o pieza de información mínima que conforma el acervo probatorio o procesal dentro de un expediente judicial.
- **Impacto**: Guarda información y constancias referidas a un Proceso Judicial en el Sistema EJE.

### Símbolo Nº 5: Escribiente
- **Tipo**: Sujeto
- **Noción**: Agente o funcionario judicial encargado de la tramitación operativa, carga de documentación y elaboración inicial de despachos dentro de un Juzgado.
- **Impacto**:
  1. Categoriza y consulta expedientes.
  2. Carga y descarga documentos en el Sistema EJE.
  3. Elabora proyectos de despacho.

### Símbolo Nº 6: Ejecución fiscal
- **Tipo**: Verbo
- **Noción**: Procedimiento judicial compulsivo iniciado para el cobro de deudas tributarias impagas (impuestos comunales, patentes, tasas) ante el Fuero Contencioso Administrativo y Tributario.
- **Impacto**: Se exige la regularización de la deuda o se dictan medidas cautelares sobre bienes.

### Símbolo Nº 7: Expediente
- **Tipo**: Objeto
- **Noción**: Legajo digital unificado que agrupa de manera cronológica el conjunto de escritos, documentos, providencias y resoluciones de una causa judicial.
- **Impacto**:
  1. Es consultado y tramitado por el Escribiente.
  2. Es asignado a un Juzgado determinado.

### Símbolo Nº 8: Fiscalizado
- **Tipo**: Estado
- **Noción**: Condición en la que queda un despacho o expediente luego de que el funcionario superior o magistrado ha revisado y convalidado formalmente su contenido legal.
- **Impacto**: Habilita la firma digital y el pase a la siguiente etapa procesal o notificación a las partes.

### Símbolo Nº 9: Fuero
- **Tipo**: Sujeto
- **Noción**: Ámbito jurisdiccional material (en este caso, Contencioso Administrativo y Tributario) que define la competencia orgánica de los juzgados intervinientes.
- **Impacto**: Establece las materias y los tipos de controversias asignables al Juzgado.

### Símbolo Nº 10: Juzgado
- **Tipo**: Sujeto
- **Noción**: Órgano jurisdiccional colegiado o unipersonal de primera instancia perteneciente al Poder Judicial.
- **Impacto**: Administra los procesos y dicta resoluciones sobre los expedientes en trámite.

### Símbolo Nº 11: Fiscal
- **Tipo**: Sujeto
- **Noción**: Magistrado del Ministerio Público encargado de dictaminar sobre la legalidad de los procedimientos y velar por el interés público.
- **Impacto**: Emite dictámenes y valida solicitudes y vistas procesales.

### Símbolo Nº 12: Petición
- **Tipo**: Verbo
- **Noción**: Requerimiento formulado por una parte interviniente ante el Juzgado dentro del marco de un expediente judicial.
- **Impacto**: Ingresa a la bandeja de trámites pendientes para ser proveída por el Escribiente mediante un despacho.

### Símbolo Nº 13: Proceso Judicial
- **Tipo**: Verbo
- **Noción**: Secuencia de actos jurídicos reglados llevados adelante por las partes y el órgano judicial para resolver una controversia conforme a derecho.
- **Impacto**: Juzga las pretensiones de las partes y culmina en una sentencia.

### Símbolo Nº 14: Sentencia
- **Tipo**: Objeto
- **Noción**: Acto procesal resolutivo formal emitido por el Juez que decide sobre el fondo de la cuestión o sobre un incidente procesal.
- **Impacto**: Clasifica la resolución en sentencia definitiva o sentencia interlocutoria.

### Símbolo Nº 15: Sentencia definitiva
- **Tipo**: Estado
- **Noción**: Condición resolutiva final que dirime el litigio principal concluyendo la instancia procesal en el juzgado.
- **Impacto**: Pone fin al proceso judicial y dispone el archivo de las actuaciones o su ejecución.

### Símbolo Nº 16: Sentencia interlocutoria
- **Tipo**: Estado
- **Noción**: Condición resolutiva que resuelve una cuestión incidental previa o conexa sin poner fin definitivo al proceso principal.
- **Impacto**: El Juez resuelve un planteo específico y el proceso judicial continúa su curso ordinario.

### Símbolo Nº 17: Juez
- **Tipo**: Sujeto
- **Noción**: Magistrado titular del órgano jurisdiccional dotado de autoridad para resolver y dictar sentencias en los Procesos Judiciales asignados a su Juzgado.
- **Impacto**: Fiscaliza despachos de los escribientes y emite sentencias interlocutorias o definitivas.`;

/**
 * Full 12 Future Scenarios from `03-escenarios-futuros.md`
 */
export const JUZGADO_FULL_SCENARIOS_MARKDOWN = `# Modelo de Escenarios Futuros (Normalizado y Anonimizado)

> **Proyecto**: Sistema de Gestión de Documentos Judiciales (Sistema EJE Web)  
> **Área**: Fuero Contencioso Administrativo y Tributario - Poder Judicial [JURISDICCIÓN_LOCAL]  
> **Versión**: 1.0 (Normalizada para Benchmark e Ingesta RAG)

---

## Lista de Escenarios Futuros

| Nº | Título del Escenario | Tipo de Escenario |
| :--- | :--- | :--- |
| 1 | CARGAR DOCUMENTACIÓN | Particular |
| 2 | DESCARGAR DOCUMENTACIÓN | Sub-Escenario |
| 3 | ACTUALIZAR DOCUMENTACIÓN | Particular |
| 4 | ENVIAR DESPACHO | Particular |
| 5 | RECIBIR DESPACHO | Particular |
| 6 | FISCALIZAR DOCUMENTACIÓN | Particular |
| 7 | EJERCER JUICIO | Particular |
| 8 | NOTIFICAR RESULTADO DE JUICIO | Particular |
| 9 | LISTAR DOCUMENTOS | Sub-Escenario |
| 10 | CREAR PROCESO JUDICIAL | Particular |
| 11 | GESTIÓN DEL JUICIO | Integrador |
| 12 | LOGEAR AL SISTEMA | Particular |

---

## Descripción Detallada de Escenarios

### Escenario Nº: 1
- **Título**: CARGAR DOCUMENTACIÓN
- **Tipo**: Particular
- **Objetivo**: Subir Documentos al sistema de gestión.
- **Contexto**:
  - **Ubicación Geográfica**: -
  - **Ubicación Temporal**: -
  - **Precondiciones**:
    - El usuario se debe encontrar logueado.
    - Los Documentos deben estar en los formatos admitidos.
    - Debe existir el Proceso Judicial al que se le quieren cargar los Documentos.
- **Recursos**: Documento
- **Actores**: Escribiente, Sistema
- **Episodios**:
  1. LISTAR DOCUMENTOS
  2. El Sistema solicita la ruta de los Documentos a cargar.
  3. El Escribiente ingresa la ruta de cada Documento que desea cargar al sistema. [Restricción: "Los Documentos no deben superar el peso de 100 MB."]
  4. El Escribiente selecciona la opción de "Aceptar".
  5. El Sistema genera un ID único por cada Documento subido.
  6. El Sistema completa la subida de Documentos vinculados al Proceso Judicial.
  7. El Sistema avisa la carga exitosa de Documentos.
- **Excepciones**:
  - Causa: El tipo de archivo a subir está en un formato que no admite el Sistema. Tratamiento: El Sistema dará aviso que el tipo de archivo que intenta subir no es un formato admitido, mostrando los formatos que sí admite el sistema.

---

### Escenario Nº: 2
- **Título**: DESCARGAR DOCUMENTACIÓN
- **Tipo**: Sub-Escenario
- **Objetivo**: Descargar Documentos del sistema de gestión.
- **Contexto**:
  - **Ubicación Geográfica**: -
  - **Ubicación Temporal**: -
  - **Precondiciones**:
    - El Sistema debe contener Documentos cargados previamente.
    - El Escribiente se debe encontrar logueado.
- **Recursos**: Documento
- **Actores**: Escribiente, Sistema
- **Episodios**:
  1. LISTAR DOCUMENTOS
  2. El Escribiente selecciona los Documentos a descargar.
  3. El Escribiente selecciona la opción "Descargar".
  4. El Sistema firma digitalmente los Documentos.
  5. El Sistema comprime los Documentos en un archivo zip. [Restricción: "El Sistema solo podrá crear un archivo comprimido zip de hasta 175 MB."]
  6. El Sistema descarga los Documentos comprimidos en el archivo zip.
  7. El Sistema muestra un mensaje sobre la descarga exitosa.
- **Excepciones**:
  - Causa: El Sistema no encuentra el Documento que desea descargar. Tratamiento: El Sistema muestra un aviso de que el Documento que desea descargar no existe mientras este sea erróneo.

---

### Escenario Nº: 3
- **Título**: ACTUALIZAR DOCUMENTACIÓN
- **Tipo**: Particular
- **Objetivo**: Subir Documentos actualizados al sistema de gestión.
- **Contexto**:
  - **Ubicación Geográfica**: -
  - **Ubicación Temporal**: -
  - **Precondiciones**:
    - Los Documentos deben contar con los formatos admitidos.
    - El Escribiente se debe encontrar logueado.
    - El Sistema debe contener al menos un Documento cargado previamente.
- **Recursos**: Documento
- **Actores**: Escribiente, Sistema
- **Episodios**:
  1. LISTAR DOCUMENTOS
  2. El Escribiente selecciona el Documento a actualizar.
  3. El Sistema muestra el Documento.
  4. El Escribiente selecciona "Actualizar".
  5. El Sistema solicita la ruta del documento a cargar.
  6. El Escribiente ingresa la ruta del Documento que desea cargar al sistema. [Restricción: "Los Documentos no deben superar el peso de 100 MB."]
  7. El Escribiente selecciona la opción de "Aceptar".
  8. El Sistema genera un ID único para el Documento subido.
  9. El Sistema agrega el ID del nuevo Documento al listado de versiones del Documento y marca este nuevo ID como la versión más actualizada.
  10. El Sistema completa la subida del Documento.
  11. El Sistema avisa la carga exitosa de Documento.
  12. El Escribiente selecciona "Guardar".
  13. El Sistema muestra un mensaje confirmando que los Documentos han sido actualizados exitosamente.
  14. El Sistema notifica al Juez asociado que existe documentación a Fiscalizar.
- **Excepciones**:
  - Causa: El Sistema no encuentra el Documento que se desea actualizar. Tratamiento: El Sistema muestra un mensaje solicitando ingresar nuevamente el Documento.

---

### Escenario Nº: 4
- **Título**: ENVIAR DESPACHO
- **Tipo**: Particular
- **Objetivo**: Enviar Documentos de un Proceso judicial.
- **Contexto**:
  - **Ubicación Geográfica**: -
  - **Ubicación Temporal**: -
  - **Precondiciones**:
    - Los Documentos deben estar cargados correctamente en el Sistema.
    - El Escribiente se debe encontrar logueado.
- **Recursos**: Documento
- **Actores**: Escribiente, Sistema
- **Episodios**:
  1. LISTAR DOCUMENTOS
  2. DESCARGAR DOCUMENTACIÓN
  3. El Escribiente envía los Documentos a quien corresponda.
- **Excepciones**:
  - Causa: Falla de red o destinatario inválido. Tratamiento: El Sistema notifica la imposibilidad de envío y mantiene el estado pendiente.

---

### Escenario Nº: 5
- **Título**: RECIBIR DESPACHO
- **Tipo**: Particular
- **Objetivo**: Recibir documentos solicitados en el juzgado.
- **Contexto**:
  - **Ubicación Geográfica**: -
  - **Ubicación Temporal**: -
  - **Precondiciones**:
    - Los Documentos deben estar cargados correctamente en el Sistema.
    - El Escribiente se debe encontrar logueado.
- **Recursos**: Documento
- **Actores**: Escribiente, Sistema
- **Episodios**:
  1. LISTAR DOCUMENTOS
  2. El Sistema solicita la ruta de los Documentos a cargar.
  3. El Escribiente ingresa la ruta de cada Documento que desea cargar al sistema. [Restricción: "Los Documentos no deben superar el peso de 100 MB."]
  4. El Escribiente selecciona la opción de "Aceptar".
  5. El Sistema genera un ID único por cada Documento subido.
  6. El Sistema completa la subida de Documentos vinculados al Proceso Judicial.
  7. El Sistema avisa la carga exitosa de Documentos.
  8. El Sistema notifica al Juez asociado que existe Documentación a Fiscalizar.
- **Excepciones**:
  - Causa: Formato no admitido o documento corrupto. Tratamiento: El Sistema rechaza la recepción e informa el error al usuario.

---

### Escenario Nº: 6
- **Título**: FISCALIZAR DOCUMENTACIÓN
- **Tipo**: Particular
- **Objetivo**: Aprobar Documentos por un Fiscal o Magistrado.
- **Contexto**:
  - **Ubicación Geográfica**: -
  - **Ubicación Temporal**: -
  - **Precondiciones**:
    - Los Documentos deben estar cargados en el Sistema.
    - El Fiscal se debe encontrar logueado.
- **Recursos**: Documento
- **Actores**: Fiscal, Sistema
- **Episodios**:
  1. LISTAR DOCUMENTOS
  2. El Sistema marca los Documentos que se deben fiscalizar.
  3. El Fiscal selecciona un Documento de los marcados por el sistema para fiscalizar.
  4. El Sistema despliega el contenido del documento.
  5. El Fiscal verifica los Documentos.
  6. El Fiscal selecciona "Aprobar Documento".
  7. El Sistema guarda el estado del Documento como fiscalizado.
  8. El Sistema notifica al Escribiente que el documento está fiscalizado.
- **Excepciones**:
  - Causa: El documento presenta inconsistencias legales. Tratamiento: El Fiscal rechaza la aprobación e ingresa observaciones de corrección.

---

### Escenario Nº: 7
- **Título**: EJERCER JUICIO
- **Tipo**: Particular
- **Objetivo**: Actualizar el estado del Proceso judicial.
- **Contexto**:
  - **Ubicación Geográfica**: -
  - **Ubicación Temporal**: -
  - **Precondiciones**:
    - El Juez se debe encontrar logueado.
    - Los documentos deben contar con los formatos admitidos.
    - Debe existir el Proceso Judicial con los Documentos cargados.
- **Recursos**: Proceso judicial, Documento
- **Actores**: Juez, Sistema
- **Episodios**:
  1. El Juez ingresa a "Proceso Judicial".
  2. El Sistema muestra un listado con todos los Procesos judiciales asignados.
  3. El Juez selecciona el Proceso judicial que desea actualizar el estado y/o cargar un nuevo Documento.
  4. El Sistema despliega el contenido del Documento.
  5. El Juez selecciona "Modificar".
  6. El Sistema muestra detallado el estado y los Documentos ya subidos a ese Proceso judicial.
  7. El Juez selecciona "Actualizar estado".
  8. El Sistema despliega un listado con los posibles estados de ese proceso judicial. [Restricción: "El sistema debe tardar menos de 5 segundos en mostrar el listado del proceso judicial."]
  9. El Juez selecciona el estado y elige la opción de "Guardar".
  10. Si el Juez requiere añadir documentación, entonces el Sistema despliega la pantalla de carga de documento.
  11. El Juez elige la ruta del Documento a subir.
  12. El Sistema completa la subida de documentos y los vincula con el Proceso Judicial.
  13. El Sistema avisa la carga exitosa de Documentos y notifica al Fiscal asociado que existe documentación a Fiscalizar.
- **Excepciones**:
  - Causa: Conflicto de concurrencia al actualizar el estado del proceso. Tratamiento: El Sistema cancela la modificación y solicita recargar los datos actualizados.

---

### Escenario Nº: 8
- **Título**: NOTIFICAR RESULTADO DE JUICIO
- **Tipo**: Particular
- **Objetivo**: Notificar a todas las partes el cambio de resultado de un Proceso Judicial.
- **Contexto**:
  - **Ubicación Geográfica**: -
  - **Ubicación Temporal**: -
  - **Precondiciones**:
    - En el Sistema deben haber cargados participantes a los que se les quiere notificar.
    - Se realizó un cambio de estado en el Proceso judicial.
- **Recursos**: Proceso judicial
- **Actores**: Sistema, Fiscal
- **Episodios**:
  1. El Sistema obtiene la lista de los participantes del Proceso Judicial. [Restricción: "El sistema no debe demorar más de 10 segundos en actualizar la lista de los participantes."]
  2. El Fiscal selecciona "Aceptar participantes".
  3. El Sistema obtiene los datos de contacto de cada persona y envía una notificación con el resultado del Proceso Judicial.
  4. El Sistema da aviso al Fiscal sobre la notificación exitosa al resto de participantes.
- **Excepciones**:
  - Causa: Los datos de contacto no son válidos o no hay datos de contacto ingresados. Tratamiento: El Sistema solicita que se ingresen datos de contacto válidos para los participantes.

---

### Escenario Nº: 9
- **Título**: LISTAR DOCUMENTOS
- **Tipo**: Sub-Escenario
- **Objetivo**: Listar Documentos asignados al Proceso Judicial seleccionado por el Escribiente.
- **Contexto**:
  - **Ubicación Geográfica**: -
  - **Ubicación Temporal**: -
  - **Precondiciones**:
    - El Proceso Judicial debe estar creado.
- **Recursos**: Proceso Judicial, Documento
- **Actores**: Sistema, Escribiente
- **Episodios**:
  1. El Escribiente ingresa a "Almacenamiento de documentos".
  2. El Sistema solicita seleccionar el Proceso Judicial de una lista desplegable.
  3. El Escribiente selecciona el Proceso Judicial de la lista.
  4. El Escribiente selecciona "Continuar".
  5. El Sistema muestra un listado de la última versión de los Documentos asociados al Proceso Judicial seleccionado. [Restricción: "El sistema no debe tardar más de 5 segundos en mostrar la actualización del listado."]
- **Excepciones**:
  - Causa: No existen documentos cargados para el proceso seleccionado. Tratamiento: El Sistema muestra un mensaje informativo indicando que la bandeja está vacía.

---

### Escenario Nº: 10
- **Título**: CREAR PROCESO JUDICIAL
- **Tipo**: Particular
- **Objetivo**: Dar de alta un nuevo proceso judicial en el juzgado.
- **Contexto**:
  - **Ubicación Geográfica**: -
  - **Ubicación Temporal**: -
  - **Precondiciones**:
    - El Escribiente debe estar logueado en el sistema.
- **Recursos**: Proceso judicial
- **Actores**: Sistema, Escribiente
- **Episodios**:
  1. El Escribiente ingresa a "Proceso Judicial".
  2. El Escribiente selecciona "Crear Proceso Judicial".
  3. El Sistema solicita carátula y datos del Proceso Judicial.
  4. El Escribiente ingresa los datos de carátula del proceso judicial.
  5. El Escribiente carga los datos de partes, magistrados y fiscales asignados.
  6. El Escribiente selecciona "Guardar". [Restricción: "El sistema no debe demorar más de 10 segundos para guardar la información."]
  7. El Sistema guarda el Proceso Judicial.
  8. El Sistema informa que el Proceso Judicial fue creado con éxito.
  9. El Sistema notifica al Fiscal asignado la creación del Proceso Judicial para su intervención.
- **Excepciones**:
  - Causa: Número de expediente duplicado o datos obligatorios faltantes. Tratamiento: El Sistema resalta los campos faltantes e impide la grabación.

---

### Escenario Nº: 11
- **Título**: GESTIÓN DEL JUICIO
- **Tipo**: Integrador
- **Objetivo**: Gestionar el ciclo de vida completo de un proceso judicial en el fuero.
- **Contexto**:
  - **Ubicación Geográfica**: -
  - **Ubicación Temporal**: -
  - **Precondiciones**:
    - El usuario se debe encontrar logueado.
    - Los Documentos deben estar en los formatos admitidos.
    - Debe existir el Proceso Judicial.
- **Recursos**: -
- **Actores**: -
- **Episodios**:
  1. LOGEAR AL SISTEMA
  2. CREAR PROCESO JUDICIAL
  3. CARGAR DOCUMENTACIÓN
  4. #RECIBIR DESPACHO ACTUALIZAR DOCUMENTACIÓN ENVIAR DESPACHO#
  5. FISCALIZAR DOCUMENTACIÓN
  6. EJERCER JUICIO
  7. NOTIFICAR RESULTADO DE JUICIO
- **Restricciones Globales**:
  - [Restricción: "El usuario debe estar conectado a internet mediante protocolo seguro HTTPS."]
  - [Restricción: "El sistema debe ser compatible con navegadores web estándar en sus versiones actualizadas."]
- **Excepciones**:
  - Causa: Falla catastrófica de infraestructura o caída del servicio. Tratamiento: El Sistema preserva la integridad transaccional mediante rollback y notifica al administrador.

---

### Escenario Nº: 12
- **Título**: LOGEAR AL SISTEMA
- **Tipo**: Particular
- **Objetivo**: Autenticar al usuario en el sistema web.
- **Contexto**:
  - **Ubicación Geográfica**: -
  - **Ubicación Temporal**: -
  - **Precondiciones**:
    - El usuario debe tener conectividad a la red.
- **Recursos**: -
- **Actores**: Usuario, Sistema
- **Episodios**:
  1. El Usuario ingresa a la aplicación web del sistema.
  2. El Sistema solicita el nombre de usuario, contraseña y token de autenticación multifactor (MFA).
  3. El Usuario ingresa sus credenciales y presiona "Iniciar Sesión".
  4. El Sistema valida los datos provistos por el usuario.
  5. El Sistema carga la pantalla principal según el rol asignado.
- **Excepciones**:
  - Causa: El nombre de usuario, la contraseña o el token no son correctos. Tratamiento: El Sistema indica que alguno de los parámetros ingresados no es válido y solicita volver a intentar.`;

export interface CaseStudyPreset {
  projectName: string;
  transcriptMarkdown: string;
  lelMarkdown: string;
  scenariosMarkdown: string;
  structurerSample: {
    scenarioNumber: number;
    scenarioTitle: string;
    scenarioRole: CandidateScenarioRole;
    scenarioTimeframe: 'FUTURO' | 'ACTUAL';
    rawContextText: string;
  };
}

export const JUZGADO_CASE_STUDY_PRESET: CaseStudyPreset = {
  projectName: JUZGADO_DEMO_PROJECT_NAME,
  transcriptMarkdown: JUZGADO_FULL_TRANSCRIPT_MARKDOWN,
  lelMarkdown: JUZGADO_FULL_LEL_MARKDOWN,
  scenariosMarkdown: JUZGADO_FULL_SCENARIOS_MARKDOWN,
  structurerSample: {
    scenarioNumber: 1,
    scenarioTitle: 'DESPACHAR PETICIÓN EN EXPEDIENTE',
    scenarioRole: 'Particular',
    scenarioTimeframe: 'FUTURO',
    rawContextText: `Cuando una parte o letrado presenta una Petición vinculada a un Expediente en trámite ante el Juzgado, el Escribiente consulta el Expediente en el Sistema EJE, analiza los Documentos adjuntos y redacta un proyecto de Despacho acorde a derecho.
Una vez elaborado el Despacho, el Escribiente lo eleva para revisión del Juez o Fiscal según corresponda. Si el documento presenta inconsistencias o no se encuentra acorde a derecho, el superior solicita correcciones al Escribiente. Si el contenido es validado, pasa al estado Fiscalizado y se notifica la resolución.`,
  },
};

export const DEFECTIVE_SCENARIO_SAMPLE = `### Escenario Nº 1: REGISTRAR INGRESO DE DOCUMENTO EN SISTEMA (Particular)
**Título**: REGISTRAR INGRESO DE DOCUMENTO EN SISTEMA
**Tipo**: FUTURO
**Objetivo**: Que el usuario valide y registre rápidamente el documento en la base de datos PostgreSQL usando un formulario React.
**Contexto**:
- Ubicación Geográfica: Sede central de la organización.
- Ubicación Temporal: Días hábiles de 08:00 a 16:00 hs.
- Precondiciones: El usuario se encuentra autenticado con el Documento pendiente de carga y ya fue registrado el documento.
**Actores**:
- Escribiente
- Fiscal
- Supervisor Externo No Participante
**Recursos**:
- Documento
- Expediente
- Escáner Óptico No Utilizado
**Episodios**:
1. El Escribiente selecciona el Expediente y adjunta el Documento en el sistema.
2. El Escribiente ejecuta una consulta SQL SELECT en la tabla documentos_expediente y presiona el botón azul "Validar Firma Digital". [Restricción: Tiempo de respuesta inferior a 200ms]
3. El Sistema vincula el Documento al Expediente y notifica al Fiscal para su revisión.
**Excepciones**:
- **Causa**: El archivo adjunto supera el tamaño máximo o posee formato inválido. **Tratamiento**: Se informa el error.`;

export const GENERIC_LEL_TEMPLATE = `### Símbolo Nº 1: Pedido de Compra
- **Tipo**: Objeto
- **Noción**: Solicitud formal emitida por un Cliente para adquirir uno o más productos del catálogo comercial.
- **Impacto**:
  1. Se registra en estado Pendiente de Pago al confirmar el carrito.
  2. Es procesado por el Vendedor y el Sistema de Facturación.

### Símbolo Nº 2: Cliente
- **Tipo**: Sujeto
- **Noción**: Persona física o jurídica registrada en la plataforma que realiza adquisiciones de productos.
- **Impacto**:
  1. Crea y confirma el Pedido de Compra.
  2. Recibe la factura electrónica y el comprobante de envío.

### Símbolo Nº 3: Confirmar pedido
- **Tipo**: Verbo
- **Noción**: Acción mediante la cual se valida la disponibilidad de stock, se autoriza el medio de pago y se emite la orden de despacho.
- **Impacto**:
  1. Reserva las unidades en el inventario.
  2. Cambia el estado del Pedido de Compra a Confirmado.`;

export const GENERIC_COMPACT_LEL_TEMPLATE = `- Pedido de Compra (Objeto): Noción: Orden comercial generada por un Cliente con ítems del catálogo. / Impacto: Se crea al confirmar la selección; se actualiza al acreditar el pago y despachar el envío.
- Cliente (Sujeto): Noción: Usuario registrado que adquiere productos en la plataforma. / Impacto: Genera el Pedido de Compra y abona el importe total.
- Confirmar pedido (Verbo): Noción: Proceso de verificación de stock y autorización de pago de un Pedido de Compra. / Impacto: Se dispara cuando el Cliente envía la orden; genera la reserva de inventario.`;

export const GENERIC_SCENARIO_TEMPLATE = `### Escenario Nº: 1
- **Título**: CONFIRMAR PEDIDO DE COMPRA
- **Tipo**: Particular
- **Objetivo**: Confirmar un Pedido de Compra verificando disponibilidad de stock y medio de pago.
- **Contexto**:
  - **Ubicación Geográfica**: Plataforma web de comercio electrónico.
  - **Ubicación Temporal**: Operación continua las 24 horas.
  - **Precondiciones**:
    - El Cliente se encuentra autenticado en la plataforma.
    - Existe un Pedido de Compra en estado borrador con al menos un producto seleccionado.
- **Recursos**: Pedido de Compra, Catálogo de Productos
- **Actores**: Cliente, Sistema
- **Episodios**:
  1. El Cliente solicita confirmar el Pedido de Compra actual.
  2. El Sistema verifica la disponibilidad de stock de cada producto incluido en el Pedido de Compra. [Restricción: "La verificación de inventario debe completarse en menos de 3 segundos."]
  3. El Cliente ingresa los datos del medio de pago y confirma la operación.
  4. El Sistema registra el Pedido de Compra como confirmado y envía el comprobante al Cliente.
- **Excepciones**:
  - Causa: Alguno de los productos seleccionados carece de stock suficiente. Tratamiento: El Sistema informa las cantidades disponibles y permite al Cliente ajustar el Pedido de Compra antes de continuar.`;
