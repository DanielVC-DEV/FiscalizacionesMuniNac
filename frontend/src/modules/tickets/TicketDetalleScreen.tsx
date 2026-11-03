import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../auth/components/SesionHeader';
import { useSesion } from '../auth/store';
import Button from '../../core/ui/Button';
import Card from '../../core/ui/Card';
import EstadoBadge from '../../core/ui/EstadoBadge';
import TopBar from '../../core/ui/TopBar';
import { COLORS, RADIOS } from '../../core/theme/colors';
import { cargarTickets } from './store';
import { ticketsApi, TicketDetalleApi } from './api';

export default function TicketDetalleScreen({ navigation, route }: any) {
  const { idTicket } = route.params;
  const sesion = useSesion();
  const rol = sesion?.usuario.rol;
  const esAdmin = rol === 'admin';
  const esMunicipal = esAdmin || rol === 'director';
  const [ticket, setTicket] = useState<TicketDetalleApi | null>(null);
  const [comentario, setComentario] = useState('');
  const [comentarioRevision, setComentarioRevision] = useState('');
  const [mostrarSolicitud, setMostrarSolicitud] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarDetalle = useCallback(async () => {
    try {
      const detalle = await ticketsApi.obtener(idTicket);
      setError(null);
      setTicket(detalle);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }, [idTicket]);

  useEffect(() => {
    let activa = true;
    ticketsApi.obtener(idTicket)
      .then((detalle) => {
        if (!activa) return;
        setError(null);
        setTicket(detalle);
      })
      .catch((e: Error) => {
        if (activa) setError(e.message);
      })
      .finally(() => {
        if (activa) setCargando(false);
      });
    return () => {
      activa = false;
    };
  }, [idTicket]);

  async function completarAccion(accion: () => Promise<unknown>, mensaje: string) {
    setGuardando(true);
    try {
      const resultado = await accion();
      await Promise.all([cargarDetalle(), cargarTickets()]);
      setComentario('');
      setComentarioRevision('');
      setMostrarSolicitud(false);
      const aviso = resultado && typeof resultado === 'object' && 'aviso' in resultado &&
        typeof resultado.aviso === 'string' ? resultado.aviso : null;
      Alert.alert(aviso ? 'Respuesta registrada con aviso' : 'Ticket actualizado', aviso || mensaje);
    } catch (e) {
      Alert.alert('No se pudo actualizar el ticket', (e as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  function enviarRespuesta() {
    const texto = comentario.trim();
    if (!texto) {
      Alert.alert('Respuesta requerida', 'Describe las acciones realizadas para subsanar la observación.');
      return;
    }
    if (texto.length > 5000) {
      Alert.alert('Respuesta demasiado larga', 'La respuesta no puede superar los 5000 caracteres.');
      return;
    }
    return completarAccion(
      () => ticketsApi.responder(idTicket, texto),
      'La respuesta quedó registrada y se inició el envío de la notificación por correo.',
    );
  }

  function solicitarNuevaSubsanacion() {
    const texto = comentarioRevision.trim();
    if (!texto) {
      Alert.alert('Indica qué falta', 'Describe los aspectos que la empresa debe corregir.');
      return;
    }
    return completarAccion(
      () => ticketsApi.solicitarSubsanacion(idTicket, texto),
      'Se solicitó una nueva subsanación y se inició el envío de la notificación por correo.',
    );
  }

  function darConformidad() {
    return completarAccion(
      () => ticketsApi.darConformidad(idTicket, comentarioRevision.trim() || undefined),
      'La respuesta quedó marcada como subsanada conforme.',
    );
  }

  function cerrarTicket() {
    return completarAccion(
      () => ticketsApi.cerrar(idTicket, comentarioRevision.trim() || undefined),
      'El ticket quedó cerrado.',
    );
  }

  const puedeResponder = (esMunicipal || rol === 'supervisor_empresa') &&
    ['ABIERTO', 'REQUIERE_NUEVA_SUBSANACION', 'VENCIDO'].includes(ticket?.estado ?? '');

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />
      <TopBar title={ticket?.numero ?? 'Detalle del ticket'} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        {cargando && <Text style={styles.secundario}>Cargando ticket...</Text>}
        {!!error && (
          <Card>
            <Text style={styles.error}>{error}</Text>
            <Button label="Reintentar" variante="suave" onPress={cargarDetalle} style={styles.botonSeparado} />
          </Card>
        )}

        {ticket && (
          <>
            <Card style={styles.tarjeta}>
              <View style={styles.filaTitulo}>
                <Text style={styles.titulo}>{ticket.numero}</Text>
                <EstadoBadge estado={ticket.estado} />
              </View>
              <Text style={styles.seccion}>Observación</Text>
              <Text style={styles.texto}>{ticket.descripcion}</Text>
              <Text style={styles.etiqueta}>Contrato</Text>
              <Text style={styles.texto}>{ticket.contrato_nombre}</Text>
              <Text style={styles.etiqueta}>Empresa</Text>
              <Text style={styles.texto}>{ticket.empresa_nombre}</Text>
              <Text style={styles.etiqueta}>Vencimiento de subsanación</Text>
              <Text style={styles.texto}>{ticket.fecha_vencimiento}</Text>
              {!!ticket.ubicacion && (
                <>
                  <Text style={styles.etiqueta}>Ubicación</Text>
                  <Text style={styles.texto}>{ticket.ubicacion}</Text>
                </>
              )}
            </Card>

            {ticket.respuestas.length > 0 && (
              <Card style={styles.tarjeta}>
                <Text style={styles.seccion}>Respuestas de la empresa</Text>
                {ticket.respuestas.map((respuesta) => (
                  <View key={respuesta.id_respuesta} style={styles.itemHistorial}>
                    <Text style={styles.texto}>{respuesta.comentario}</Text>
                    <Text style={styles.secundario}>
                      {respuesta.usuario_nombre} · {new Date(respuesta.fecha).toLocaleString('es-CL')}
                    </Text>
                  </View>
                ))}
              </Card>
            )}

            {puedeResponder && (
              <Card style={styles.tarjeta}>
                <Text style={styles.seccion}>Informar subsanación</Text>
                <Text style={styles.secundario}>
                  {esMunicipal
                    ? 'Modo de prueba: puedes registrar una respuesta como usuario municipal. Al enviarla, se intentará avisar por correo al equipo municipal.'
                    : 'Explica las acciones realizadas. Al enviar, se intentará avisar por correo al equipo municipal.'}
                </Text>
                <TextInput
                  accessibilityLabel="Respuesta de subsanación"
                  style={styles.campo}
                  value={comentario}
                  onChangeText={setComentario}
                  placeholder="Describe cómo se corrigió la observación"
                  placeholderTextColor={COLORS.textoTenue}
                  multiline
                  maxLength={5000}
                  textAlignVertical="top"
                />
                <Button
                  label="Enviar respuesta"
                  onPress={enviarRespuesta}
                  cargando={guardando}
                  disabled={!comentario.trim()}
                />
              </Card>
            )}

            {esMunicipal && ticket.estado === 'RESPONDIDO' && (
              <Card style={styles.tarjeta}>
                <Text style={styles.seccion}>Revisar respuesta</Text>
                <TextInput
                  accessibilityLabel="Comentario de revisión"
                  style={[styles.campo, styles.campoCorto]}
                  value={comentarioRevision}
                  onChangeText={setComentarioRevision}
                  placeholder="Comentario opcional o aspectos pendientes"
                  placeholderTextColor={COLORS.textoTenue}
                  multiline
                  maxLength={5000}
                  textAlignVertical="top"
                />
                {mostrarSolicitud ? (
                  <>
                    <Text style={styles.secundario}>
                      Describe claramente qué debe corregir la empresa. Se intentará enviar una notificación.
                    </Text>
                    <Button
                      label="Enviar solicitud de subsanación"
                      onPress={solicitarNuevaSubsanacion}
                      cargando={guardando}
                      disabled={!comentarioRevision.trim()}
                    />
                    <Button
                      label="Cancelar"
                      variante="secundario"
                      onPress={() => setMostrarSolicitud(false)}
                      style={styles.botonSeparado}
                    />
                  </>
                ) : (
                  <View style={styles.filaBotones}>
                    <Button
                      label="Pedir corrección"
                      variante="secundario"
                      onPress={() => setMostrarSolicitud(true)}
                      style={styles.botonFlexible}
                    />
                    <Button
                      label="Dar conformidad"
                      onPress={darConformidad}
                      cargando={guardando}
                      style={styles.botonFlexible}
                    />
                  </View>
                )}
              </Card>
            )}

            {esMunicipal && ticket.estado === 'SUBSANADO_CONFORME' && (
              <Card style={styles.tarjeta}>
                <Text style={styles.seccion}>Cerrar ticket</Text>
                <Text style={styles.secundario}>
                  La subsanación fue aprobada. Puedes agregar un comentario final antes de cerrar el ticket.
                </Text>
                <TextInput
                  accessibilityLabel="Comentario de cierre"
                  style={[styles.campo, styles.campoCorto]}
                  value={comentarioRevision}
                  onChangeText={setComentarioRevision}
                  placeholder="Comentario final (opcional)"
                  placeholderTextColor={COLORS.textoTenue}
                  multiline
                  maxLength={5000}
                  textAlignVertical="top"
                />
                <Button
                  label="Confirmar cierre del ticket"
                  onPress={cerrarTicket}
                  cargando={guardando}
                />
              </Card>
            )}

            <Card style={styles.tarjeta}>
              <Text style={styles.seccion}>Historial</Text>
              {ticket.historial.length === 0 ? (
                <Text style={styles.secundario}>No hay actuaciones registradas.</Text>
              ) : (
                ticket.historial.map((actuacion) => (
                  <View key={actuacion.id_actuacion} style={styles.itemHistorial}>
                    <Text style={styles.texto}>{actuacion.descripcion || actuacion.tipo}</Text>
                    <Text style={styles.secundario}>
                      {actuacion.usuario_nombre || 'Sistema'} · {new Date(actuacion.fecha).toLocaleString('es-CL')}
                    </Text>
                  </View>
                ))
              )}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.fondo },
  contenido: { padding: 16, paddingBottom: 28, gap: 12 },
  tarjeta: { gap: 8 },
  filaTitulo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  titulo: { fontSize: 17, fontWeight: '700', color: COLORS.textoPrimario },
  seccion: { fontSize: 14, fontWeight: '700', color: COLORS.azul, marginTop: 4, marginBottom: 4 },
  etiqueta: { fontSize: 11, fontWeight: '700', color: COLORS.textoSecundario, marginTop: 8 },
  texto: { color: COLORS.textoPrimario, fontSize: 13, lineHeight: 19 },
  secundario: { color: COLORS.textoSecundario, fontSize: 12, lineHeight: 17 },
  campo: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: COLORS.borde,
    borderRadius: RADIOS.md,
    padding: 12,
    color: COLORS.textoPrimario,
    backgroundColor: COLORS.superficie,
    fontSize: 13,
    marginVertical: 8,
  },
  campoCorto: { minHeight: 76 },
  itemHistorial: { borderTopWidth: 1, borderTopColor: COLORS.bordeSuave, paddingTop: 10, marginTop: 4, gap: 4 },
  filaBotones: { flexDirection: 'row', gap: 8, marginTop: 8 },
  botonFlexible: { flex: 1 },
  botonSeparado: { marginTop: 8 },
  error: { color: COLORS.rojo, fontSize: 13 },
});
