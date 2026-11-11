import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../auth/components/SesionHeader';
import TopBar from '../../core/ui/TopBar';
import Card from '../../core/ui/Card';
import Button from '../../core/ui/Button';
import { COLORS, RADIOS } from '../../core/theme/colors';
import { esAdministrador, useSesion } from '../auth/store';
import { cargarContratos, useContratos } from './store';
import { CONTENIDO_WEB } from '../../core/ui/anchoWeb';

export default function ContratosScreen({ navigation }: any) {
  const CONTRATOS = useContratos();
  const esAdmin = esAdministrador(useSesion()?.usuario);
  const [busqueda, setBusqueda] = useState('');
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      // Actualiza el listado cada vez que se vuelve a esta pantalla.
      cargarContratos().catch((error: Error) => setErrorCarga(error.message));
    }, []),
  );

  const texto = busqueda.trim().toLowerCase();
  const filtrados = CONTRATOS.filter((c) => {
    if (!texto) return true;
    return (
      c.nombre.toLowerCase().includes(texto) ||
      c.nombreEmpresa.toLowerCase().includes(texto) ||
      c.rutEmpresa.toLowerCase().includes(texto)
    );
  });

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />
      <TopBar title="Contratos" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={[styles.contenido, CONTENIDO_WEB]} keyboardShouldPersistTaps="handled">
        {esAdmin && (
          <Button
            label="+ Nuevo contrato"
            onPress={() => navigation.navigate('CrearContrato')}
            style={styles.botonNuevo}
          />
        )}

        {!!errorCarga && <Text style={styles.sinContratos}>No se pudo cargar el servidor: {errorCarga}</Text>}

        <TextInput
          style={styles.buscador}
          placeholder="Buscar por nombre o RUT de empresa"
          placeholderTextColor={COLORS.textoTenue}
          value={busqueda}
          onChangeText={setBusqueda}
        />

        {filtrados.length === 0 ? (
          <Text style={styles.sinContratos}>
            {CONTRATOS.length === 0
              ? 'Aún no hay contratos registrados.'
              : 'No hay contratos que coincidan con la búsqueda.'}
          </Text>
        ) : (
          <View style={styles.lista}>
            {filtrados.map((c) => (
              <TouchableOpacity
                key={c.id}
                activeOpacity={0.75}
                style={styles.item}
                onPress={() => navigation.navigate('ContratoDetalle', { contrato: c })}
              >
                <Card style={styles.card}>
                  <Text style={styles.cardNombre}>{c.nombre}</Text>
                  <Text style={styles.cardEmpresa}>
                    {c.nombreEmpresa} · RUT {c.rutEmpresa}
                  </Text>
                  <View style={styles.cardFila}>
                    <Text style={styles.cardDato}>Inicio: {c.fechaInicio}</Text>
                    <Text style={styles.cardDato}>Término: {c.fechaTermino}</Text>
                  </View>
                  <Text style={styles.cardDato}>
                    Día de respuesta a ticket: {c.diasRespuestaTicket} día(s)
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.fondo },
  contenido: { padding: 20, paddingBottom: 24 },
  botonNuevo: { alignSelf: 'flex-end', minWidth: 200, marginBottom: 12 },
  buscador: {
    height: 44,
    borderRadius: RADIOS.md,
    borderWidth: 1.5,
    borderColor: COLORS.borde,
    backgroundColor: COLORS.superficie,
    paddingHorizontal: 12,
    fontSize: 13,
    color: COLORS.textoPrimario,
    marginBottom: 16,
  },
  sinContratos: {
    color: COLORS.textoSecundario,
    fontSize: 12.5,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  lista: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  item: { flexGrow: 1, flexBasis: 280 },
  card: { flexGrow: 1 },
  cardNombre: { fontSize: 13.5, fontWeight: '700', color: COLORS.textoPrimario, marginBottom: 4 },
  cardEmpresa: { fontSize: 12, color: COLORS.textoSecundario, marginBottom: 6 },
  cardFila: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardDato: { fontSize: 11, color: COLORS.textoSecundario },
});
