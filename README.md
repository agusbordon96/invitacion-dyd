# La Gran Expedición

Invitación web interactiva para **La Convocatoria del Huevo Primigenio**. Es HTML, CSS y JavaScript sin frameworks, lista para GitHub Pages y con un backend opcional de Google Apps Script.

## Abrir localmente

Abrí `index.html` con un navegador. Para que la descarga del PDF cargue sus librerías, necesitás conexión a internet. Sin configurar Apps Script, la convocatoria usa **modo demostración** y guarda los registros de prueba en el navegador.

## Publicar en GitHub Pages

1. Creá un repositorio y subí todos los archivos, conservando las carpetas `css`, `js` y `apps-script`.
2. En GitHub, abrí **Settings → Pages**.
3. Elegí desplegar desde la rama principal y la carpeta raíz (`/root`).
4. Guardá: GitHub mostrará la URL pública en unos minutos.

## Conectar Google Sheets y Apps Script

1. Creá una planilla de Google Sheets. No hace falta crear columnas: el script crea la hoja **Invitados** y sus encabezados al primer registro.
2. Copiá el identificador de la planilla, que está entre `/d/` y `/edit` en su URL.
3. Abrí [script.google.com](https://script.google.com), creá un proyecto y copiá el contenido de `apps-script/Code.gs`.
4. Reemplazá `PEGAR_AQUI_EL_ID_DE_TU_GOOGLE_SHEET` por el identificador copiado.
5. En **Implementar → Nueva implementación**, seleccioná **Aplicación web**. Ejecutar como: tu cuenta. Acceso: cualquier persona que tenga el enlace. Autorizá el proyecto y copiá la URL de la aplicación web.
6. En `js/config.js`, reemplazá `PEGAR_AQUI_LA_URL_DEL_WEB_APP` por esa URL. Volvé a publicar el sitio.

El backend usa `LockService` para que dos registros simultáneos no ocupen la misma plaza. También bloquea nombres repetidos, conserva las parejas en la misma orden, busca clases aún no cubiertas y equilibra las órdenes.

## Ajustes habituales

- **Fecha, horario, dirección y mapa:** editá `EVENT_DETAILS` en `js/config.js`.
- **Preguntas y afinidades:** editá `QUIZ` en `js/quiz.js`. Cada objeto de afinidad suma puntos a las seis clases permitidas.
- **Clases y órdenes:** sus textos y emblemas están concentrados en `CLASSES` y `ORDERS` de `js/quiz.js`.
- **Capacidad:** en `apps-script/Code.gs`, ajustá `MAX_PEOPLE_PER_ORDER`, `NUMBER_OF_CORE_CLASSES` y `MAX_TOTAL_GUESTS`.

## Modo demostración

Mientras `APPS_SCRIPT_URL` conserve el texto de ejemplo, la aplicación funciona sin servidor. Los datos quedan solo en `localStorage` bajo la clave `gran-expedicion-registros`, y la pantalla final avisa que no fueron enviados a la Custodia. Para reiniciar las pruebas, eliminá los datos del sitio desde las herramientas del navegador.

## Notas

El PDF usa jsPDF y html2canvas desde CDN. El resto de la experiencia no depende de frameworks ni compilación.
