// Cálculo de plazos en días hábiles (Informe de Requerimientos, sección 8):
// el plazo se cuenta desde el día siguiente al registro, saltando sábados,
// domingos y los feriados cargados en la tabla "feriado".
//
// Trabaja con fechas ISO (aaaa-mm-dd) y en UTC para no depender de la zona
// horaria del servidor.

const ZONA_OPERACION = 'America/Santiago';

// Fecha de hoy en Chile, como aaaa-mm-dd.
function hoyEnChile() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_OPERACION }).format(new Date());
}

// `feriados` es un Set con fechas aaaa-mm-dd.
function sumarDiasHabiles(desdeISO, dias, feriados = new Set()) {
  const fecha = new Date(`${desdeISO}T00:00:00Z`);
  let restantes = dias;

  while (restantes > 0) {
    fecha.setUTCDate(fecha.getUTCDate() + 1);
    const diaSemana = fecha.getUTCDay(); // 0 = domingo, 6 = sábado
    const iso = fecha.toISOString().slice(0, 10);
    if (diaSemana !== 0 && diaSemana !== 6 && !feriados.has(iso)) {
      restantes -= 1;
    }
  }

  return fecha.toISOString().slice(0, 10);
}

module.exports = { hoyEnChile, sumarDiasHabiles };
