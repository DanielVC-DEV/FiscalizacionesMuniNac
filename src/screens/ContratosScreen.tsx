import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import TopBar from '../components/TopBar';
import Card from '../components/Card';
import Button from '../components/Button';
import { COLORS, RADIOS } from '../theme/colors';
import { useContratos } from '../data/store';

export default function ContratosScreen({ navigation }: any) {
  // Lee del almacén en memoria (src/data/store.ts): todavía no hay backend,
  // así que esto dura solo mientras la app esté abierta. Un contrato creado
  // en "Nuevo contrato" aparece aquí de inmediato.
  const CONTRATOS = useContratos();
  const [busqueda, setBusqueda] = useState('');

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

      <View style={styles.contenido}>
        <Button
          label="+ Nuevo contrato"
          onPress={() => navigation.navigate('CrearContrato')}
          style={styles.botonNuevo}
        />

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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.fondo },
  contenido: { padding: 16, flex: 1 },
  botonNuevo: { marginBottom: 14 },
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
  lista: { gap: 10 },
  card: { marginBottom: 10 },
  cardNombre: { fontSize: 13.5, fontWeight: '700', color: COLORS.textoPrimario, marginBottom: 4 },
  cardEmpresa: { fontSize: 12, color: COLORS.textoSecundario, marginBottom: 6 },
  cardFila: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardDato: { fontSize: 11, color: COLORS.textoSecundario },
});
