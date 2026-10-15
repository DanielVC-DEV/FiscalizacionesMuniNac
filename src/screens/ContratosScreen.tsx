import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
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
      <View style={styles.linea} />

      <View style={styles.contenido}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.barraTitulo}>
          <Text style={styles.barraTitulotexto}>Contratos</Text>
        </View>

        <TouchableOpacity
          style={styles.botonNuevo}
          onPress={() => navigation.navigate('CrearContrato')}
        >
          <Text style={styles.botonNuevoTexto}>+ Nuevo contrato</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.buscador}
          placeholder="Buscar por nombre o RUT de empresa"
          placeholderTextColor="#8b93a0"
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
                style={styles.card}
                onPress={() => navigation.navigate('ContratoDetalle', { contrato: c })}
              >
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
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#d9d9d9' },
  linea: { height: 1, backgroundColor: '#111', marginHorizontal: 4 },
  contenido: { padding: 16, flex: 1 },
  back: { fontSize: 13, color: '#1c2126', marginBottom: 10 },
  barraTitulo: {
    backgroundColor: '#686462',
    borderRadius: 6,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  barraTitulotexto: { color: '#fff', fontSize: 14, fontWeight: '700' },
  botonNuevo: {
    backgroundColor: '#1c2126',
    borderRadius: 6,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  botonNuevoTexto: { color: '#fff', fontSize: 13, fontWeight: '700' },
  buscador: {
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d7dbe0',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#1c2126',
    marginBottom: 16,
  },
  sinContratos: {
    color: '#5b6570',
    fontSize: 12.5,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  lista: { gap: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e3e6ea',
    padding: 12,
    marginBottom: 10,
  },
  cardNombre: { fontSize: 13.5, fontWeight: '700', color: '#1c2126', marginBottom: 4 },
  cardEmpresa: { fontSize: 12, color: '#3a4048', marginBottom: 6 },
  cardFila: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardDato: { fontSize: 11, color: '#5b6570' },
});
