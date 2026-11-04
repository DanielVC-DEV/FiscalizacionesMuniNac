import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../core/ui/Card';
import EstadoBadge from '../../core/ui/EstadoBadge';
import { COLORS } from '../../core/theme/colors';
import { fechaDesdeApi } from '../../core/utils/fechas';
import { consultaApi, ConsultaPublicaApi } from './api';

interface Props {
  token: string;
}

const ETIQUETA_ACTUACION: Record<string, string> = {
  CREACION: 'Ticket creado',
  RESPUESTA: 'Respuesta de la empresa',
  SOLICITUD_SUBSANACION: 'Solicitud de nueva subsanación',
  CAMBIO_ESTADO: 'Cambio de estado',
  VENCIMIENTO: 'Plazo vencido',
  CONFORMIDAD: 'Conformidad',
  CIERRE: 'Ticket cerrado',
  REAPERTURA: 'Ticket reabierto',
};

// Página pública de consulta de un ticket, de sólo lectura. Se abre con el enlace
// que genera un usuario municipal; no pide cuenta ni muestra datos internos.
export default function ConsultaPublicaScreen({ token }: Props) {
  const [ticket, setTicket] = useState<ConsultaPublicaApi | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activa = true;
    consultaApi
      .consultarPublica(token)
      .then((datos) => activa && setTicket(datos))
      .catch((err: Error) => activa && setError(err.message));
    return () => {
      activa = false;
    };
  }, [token]);

  const ubicacion = ticket
    ? [ticket.ubicacion.direccion, ticket.ubicacion.sector, ticket.ubicacion.referencia].filter(Boolean).join(', ')
    : '';

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <Image
            source={require('../../../assets/logo-completo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Ilustre Municipalidad de Nacimiento"
          />
          <Text style={styles.sistema}>Consulta de ticket de fiscalización</Text>
        </View>

        {!ticket && !error && <ActivityIndicator color={COLORS.azul} />}
        {!!error && (
          <Card>
            <Text style={styles.error}>{error}</Text>
            <Text style={styles.secundario}>Solicita un nuevo enlace a la Municipalidad.</Text>
          </Card>
        )}

        {ticket && (
          <>
            <Card style={styles.tarjeta}>
              <View style={styles.fila}>
                <Text style={styles.titulo}>{ticket.numero}</Text>
                <EstadoBadge estado={ticket.estado} />
              </View>
              <Dato etiqueta="Empresa" valor={ticket.empresa_nombre} />
              <Dato etiqueta="Contrato" valor={ticket.contrato_nombre} />
              <Dato etiqueta="Prioridad" valor={ticket.prioridad} />
              <Dato etiqueta="Creado" valor={fechaDesdeApi(ticket.fecha_creacion)} />
              <Dato etiqueta="Vencimiento de subsanación" valor={fechaDesdeApi(ticket.fecha_vencimiento)} />
              {!!ticket.fecha_cierre && <Dato etiqueta="Cierre" valor={fechaDesdeApi(ticket.fecha_cierre)} />}
              {!!ubicacion && <Dato etiqueta="Ubicación" valor={ubicacion} />}
              <Dato etiqueta="Observación" valor={ticket.descripcion} />
            </Card>

            {ticket.respuestas.length > 0 && (
              <Card style={styles.tarjeta}>
                <Text style={styles.seccion}>Respuestas de la empresa</Text>
                {ticket.respuestas.map((respuesta, i) => (
                  <View key={i} style={styles.item}>
                    <Text style={styles.texto}>{respuesta.comentario}</Text>
                    <Text style={styles.secundario}>{new Date(respuesta.fecha).toLocaleString('es-CL')}</Text>
                  </View>
                ))}
              </Card>
            )}

            <Card style={styles.tarjeta}>
              <Text style={styles.seccion}>Historial</Text>
              {ticket.historial.map((actuacion, i) => (
                <View key={i} style={styles.item}>
                  <Text style={styles.texto}>
                    {actuacion.descripcion || ETIQUETA_ACTUACION[actuacion.tipo] || actuacion.tipo}
                  </Text>
                  <Text style={styles.secundario}>{new Date(actuacion.fecha).toLocaleString('es-CL')}</Text>
                </View>
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={styles.dato}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <Text style={styles.texto}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.fondo },
  contenido: { padding: 16, paddingBottom: 28, gap: 12 },
  encabezado: { alignItems: 'center', gap: 6, marginBottom: 4 },
  logo: { width: 190, height: 76 },
  sistema: { color: COLORS.textoSecundario, fontSize: 13, fontWeight: '600' },
  tarjeta: { gap: 6 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  titulo: { fontSize: 17, fontWeight: '700', color: COLORS.textoPrimario },
  seccion: { fontSize: 14, fontWeight: '700', color: COLORS.azul },
  dato: { marginTop: 6 },
  etiqueta: { fontSize: 11, fontWeight: '700', color: COLORS.textoSecundario },
  texto: { fontSize: 13, lineHeight: 19, color: COLORS.textoPrimario },
  secundario: { fontSize: 12, color: COLORS.textoSecundario },
  item: { borderTopWidth: 1, borderTopColor: COLORS.bordeSuave, paddingTop: 8, marginTop: 4, gap: 2 },
  error: { color: COLORS.rojo, fontSize: 13, fontWeight: '600', marginBottom: 4 },
});
