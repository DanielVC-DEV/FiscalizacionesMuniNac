// Cálculo de plazos en días hábiles (sección 8 del Informe de Requerimientos:
// "El plazo se calculará en días hábiles, comenzando desde el día siguiente
// al registro").
//
// OJO: esto NO descuenta feriados. El informe no entrega un calendario de
// feriados chilenos, así que por ahora solo se saltan sábados y domingos.
// Es un punto pendiente de confirmar con la Municipalidad.
export function sumarDiasHabiles(desde: Date, dias: number): Date {
  const resultado = new Date(desde);
  let restantes = dias;
  while (restantes > 0) {
    resultado.setDate(resultado.getDate() + 1);
    const diaSemana = resultado.getDay(); // 0 = domingo, 6 = sábado
    if (diaSemana !== 0 && diaSemana !== 6) {
      restantes -= 1;
    }
  }
  return resultado;
}

export function formatearFecha(fecha: Date): string {
  const d = String(fecha.getDate()).padStart(2, '0');
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const y = fecha.getFullYear();
  return `${d}/${m}/${y}`;
}
