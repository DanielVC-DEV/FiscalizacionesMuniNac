import { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Button from '../../../core/ui/Button';
import Card from '../../../core/ui/Card';
import { avisar, confirmar } from '../../../core/ui/avisos';
import { COLORS, RADIOS } from '../../../core/theme/colors';
import { fechaDesdeApi } from '../../../core/utils/fechas';
import { consultaApi, EnlaceApi, urlConsultaPublica } from '../../consulta/api';

interface Props {
  idTicket: number;
}

function estadoDelEnlace(enlace: EnlaceApi): 'Revocado' | 'Vencido' | 'Vigente' {
  if (enlace.revocada_en) return 'Revocado';
  return new Date(enlace.expira_en).getTime() <= Date.now() ? 'Vencido' : 'Vigente';
}

// Gestión de enlaces de consulta externa de un ticket (sólo usuarios municipales).
// El enlace completo se muestra una sola vez, al generarlo: el servidor guarda sólo su hash.
export default function EnlacesConsulta({ idTicket }: Props) {
  const [enlaces, setEnlaces] = useState<EnlaceApi[]>([]);
  const [urlNueva, setUrlNueva] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setEnlaces(await consultaApi.listarEnlaces(idTicket));
    } catch (err) {
      avisar('No se pudieron cargar los enlaces', (err as Error).message);
    }
  }, [idTicket]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function generar() {
    setTrabajando(true);
    try {
      const creado = await consultaApi.crearEnlace(idTicket);
      const url = urlConsultaPublica(creado.token);
      setUrlNueva(url);
      if (Platform.OS === 'web') await navigator.clipboard?.writeText(url).catch(() => undefined);
      await cargar();
    } catch (err) {
      avisar('No se pudo generar el enlace', (err as Error).message);
    } finally {
      setTrabajando(false);
    }
  }

  async function revocar(enlace: EnlaceApi) {
    if (!(await confirmar('Revocar enlace', 'Quien tenga este enlace dejará de poder consultar el ticket.'))) return;
    try {
      await consultaApi.revocarEnlace(enlace.id_consulta);
      await cargar();
    } catch (err) {
      avisar('No se pudo revocar el enlace', (err as Error).message);
    }
  }

  return (
    <Card style={styles.tarjeta}>
      <Text style={styles.seccion}>Consulta externa</Text>
      <Text style={styles.secundario}>
        Genera un enlace de sólo lectura para que alguien sin cuenta vea el estado de este ticket. Vigencia: 30 días.
      </Text>
      <Button label="Generar enlace" variante="secundario" onPress={generar} cargando={trabajando} />

      {urlNueva && (
        <View style={styles.nuevo}>
          <Text style={styles.etiqueta}>
            Enlace nuevo{Platform.OS === 'web' ? ' (copiado al portapapeles)' : ''}. No se vuelve a mostrar:
          </Text>
          <Text style={styles.url} selectable>
            {urlNueva}
          </Text>
        </View>
      )}

      {enlaces.map((enlace) => {
        const estado = estadoDelEnlace(enlace);
        return (
          <View key={enlace.id_consulta} style={styles.fila}>
            <View style={styles.flex}>
              <Text style={styles.texto}>
                {estado} · vence {fechaDesdeApi(enlace.expira_en)}
              </Text>
              <Text style={styles.secundario}>Creado {fechaDesdeApi(enlace.creada_en)}</Text>
            </View>
            {estado === 'Vigente' && <Button label="Revocar" variante="suave" onPress={() => revocar(enlace)} />}
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  tarjeta: { gap: 8 },
  seccion: { fontSize: 14, fontWeight: '700', color: COLORS.azul, marginTop: 4 },
  secundario: { fontSize: 12, lineHeight: 17, color: COLORS.textoSecundario },
  texto: { fontSize: 13, color: COLORS.textoPrimario },
  nuevo: { backgroundColor: COLORS.azulSuave, borderRadius: RADIOS.md, padding: 10, gap: 4 },
  etiqueta: { fontSize: 11, fontWeight: '700', color: COLORS.azulOscuro },
  url: { fontSize: 12, color: COLORS.azulOscuro },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.bordeSuave,
    paddingTop: 8,
  },
  flex: { flex: 1 },
});
