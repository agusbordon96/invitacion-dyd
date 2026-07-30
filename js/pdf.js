function downloadConvocation(records) {
  if (!window.jspdf || !window.html2canvas) { showToast("No fue posible preparar el PDF. Revisá tu conexión.", true); return; }
  const card = document.getElementById("pdf-source");
  if (!card) return;
  showToast("La Custodia está sellando tu convocatoria…");
  html2canvas(card, { backgroundColor: "#090811", scale: 2, useCORS: true }).then(canvas => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    const width = 190, height = canvas.height * width / canvas.width;
    pdf.setFillColor(9, 8, 17); pdf.rect(0, 0, 210, 297, "F");
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, width, Math.min(height, 277));
    pdf.save("convocatoria-gran-expedicion.pdf");
  }).catch(() => showToast("No se pudo generar el PDF.", true));
}
