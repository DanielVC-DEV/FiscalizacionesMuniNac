import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../auth/components/SesionHeader';
import TopBar from '../../core/ui/TopBar';
import Card from '../../core/ui/Card';
import Button from '../../core/ui/Button';
import TarjetaSeccion, { FilaCampos } from '../../core/ui/TarjetaSeccion';
import SeccionLabel from '../../core/ui/SeccionLabel';
import { avisar, confirmar } from '../../core/ui/avisos';
import { COLORS, RADIOS } from '../../core/theme/colors';
import { notificacionesApi, DestinatarioApi } from './api';
import { CONTENIDO_WEB } from '../../core/ui/anchoWeb';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Administración (sólo admin) de los correos que reciben avisos de tickets, además del
// supervisor responsable: creación, solicitudes de subsanación, respuestas, recordatorios y vencimientos.
export default function DestinatariosScreen({ navigation }: any) {
  const [destinatarios, setDestinatarios] = useState<DestinatarioApi[]>([]);
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setDestinatarios(await notificacionesApi.listarDestinatarios());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  async function agregar() {
    if (!EMAIL_VALIDO.test(email.trim())) {
      setError('Ingresa un correo válido.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await notificacionesApi.crearDestinatario({ email: email.trim(), nombre: nombre.trim() || undefined });
      setEmail('');
      setNombre('');
      await cargar();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  async function alternarActivo(destinatario: DestinatarioApi) {
    try {
      await notificacionesApi.cambiarActivo(destinatario.id_destinatario, !destinatario.activo);
      await cargar();
    } catch (err) {
      avisar('No se pudo actualizar', (err as Error).message);
    }
  }

  async function eliminar(destinatario: DestinatarioApi) {
    if (!(await confirmar('Eliminar destinatario', `Se dejará de avisar a ${destinatario.email}.`, 'Eliminar'))) return;
    try {
      await notificacionesApi.eliminarDestinatario(destinatario.id_destinatario);
      await cargar();
    } catch (err) {
      avisar('No se pudo eliminar', (err as Error).message);
    }
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />
      <TopBar title="Notificaciones" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.contenido, CONTENIDO_WEB]} keyboardShouldPersistTaps="handled">
        <TarjetaSeccion
          titulo="Agregar destinatario"
          descripcion="Recibe los avisos por correo de todos los tickets, además del supervisor responsable de cada uno."
        >
          <FilaCampos>
          <TextInput
            style={styles.campo}
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.cl"
            placeholderTextColor={COLORS.textoTenue}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.campo}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre (opcional)"
            placeholderTextColor={COLORS.textoTenue}
          />
          </FilaCampos>
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Button label="Agregar" onPress={agregar} cargando={guardando} disabled={!email.trim()} style={styles.botonGuardar} />
        </TarjetaSeccion>

        <SeccionLabel texto="Destinatarios" />
        {destinatarios.length === 0 ? (
          <Text style={styles.secundario}>Aún no hay destinatarios adicionales configurados.</Text>
        ) : (
          destinatarios.map((destinatario) => (
            <Card key={destinatario.id_destinatario} style={styles.fila}>
              <View style={styles.datos}>
                <Text style={styles.texto}>{destinatario.nombre || destinatario.email}</Text>
                {!!destinatario.nombre && <Text style={styles.secundario}>{destinatario.email}</Text>}
                <Text style={[styles.estado, !destinatario.activo && styles.estadoInactivo]}>
                  {destinatario.activo ? 'Activo' : 'Inactivo'}
                </Text>
              </View>
              <View style={styles.acciones}>
                <Button
                  label={destinatario.activo ? 'Desactivar' : 'Activar'}
                  variante="suave"
                  onPress={() => alternarActivo(destinatario)}
                />
                <Button label="Eliminar" variante="secundario" onPress={() => eliminar(destinatario)} />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.fondo },
  contenido: { padding: 20, paddingBottom: 28, gap: 12 },
  botonGuardar: { alignSelf: 'flex-end', minWidth: 200, marginTop: 8 },
  titulo: { fontSize: 14, fontWeight: '700', color: COLORS.azul },
  campo: {
    minHeight: 44,
    borderWidth: 1.5,
    borderColor: COLORS.borde,
    borderRadius: RADIOS.md,
    paddingHorizontal: 12,
    backgroundColor: COLORS.superficie,
    fontSize: 13,
    color: COLORS.textoPrimario,
  },
  error: { color: COLORS.rojo, fontSize: 12, fontWeight: '600' },
  texto: { fontSize: 13, fontWeight: '600', color: COLORS.textoPrimario },
  secundario: { fontSize: 12, lineHeight: 17, color: COLORS.textoSecundario },
  fila: { gap: 8 },
  datos: { gap: 2 },
  estado: { fontSize: 11, fontWeight: '700', color: COLORS.verde },
  estadoInactivo: { color: COLORS.textoTenue },
  acciones: { flexDirection: 'row', gap: 8 },
});
