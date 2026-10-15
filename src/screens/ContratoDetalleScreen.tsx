import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { Contrato } from '../types';
import { formatearMonto } from '../utils/formato';

export default function ContratoDetalleScreen({ navigation, route }: any) {
  const contrato: Contrato | undefined = route?.params?.contrato;

  if (!contrato) {
    return (
      <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
        <Header />
        <View style={styles.linea} />
        <View style={styles.contenido}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.sinDatos}>No se encontró información de este contrato.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />
      <View style={styles.linea} />

      <ScrollView contentContainerStyle={styles.contenido}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.barraTitulo}>
          <Text style={styles.barraTitulotexto} numberOfLines={2}>
            {contrato.nombre}
          </Text>
        </View>

        <View style={styles.seccionTitulo}>
          <Text style={styles.seccionTexto}>Datos generales</Text>
        </View>
        <View style={styles.datosBox}>
          <DatoFila label="Nombre del contrato" valor={contrato.nombre} />
          <DatoFila label="RUT de la empresa" valor={contrato.rutEmpresa} />
          <DatoFila label="Nombre de la empresa" valor={contrato.nombreEmpresa} />
          <DatoFila label="Fecha de inicio" valor={contrato.fechaInicio} />
          <DatoFila label="Fecha de término" valor={contrato.fechaTermino} />
          <DatoFila
            label="Día de respuesta a ticket"
            valor={`${contrato.diasRespuestaTicket} día(s) hábil(es)`}
          />
        </View>

        <View style={styles.seccionTitulo}>
          <Text style={styles.seccionTexto}>Órdenes de compra</Text>
        </View>
        {contrato.ordenesCompra.length === 0 ? (
          <Text style={styles.sinDatos}>Este contrato no tiene órdenes de compra registradas.</Text>
        ) : (
          <View style={styles.ocLista}>
            {contrato.ordenesCompra.map((oc) => (
              <View key={oc.id} style={styles.ocItem}>
                <View style={styles.ocFila}>
                  <Text style={styles.ocCodigo}>OC {oc.codigo}</Text>
                  <Text style={styles.ocMonto}>{formatearMonto(oc.monto)}</Text>
                </View>
                <Text style={styles.ocFecha}>Fecha: {oc.fecha}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.seccionTitulo}>
          <Text style={styles.seccionTexto}>Tickets asociados a este contrato</Text>
        </View>
        <Text style={styles.sinDatos}>
          Todavía no hay tickets guardados para consultar (esto se conecta cuando exista el backend).
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function DatoFila({ label, valor }: { label: string; valor: string }) {
  return (
    <View style={styles.datoFila}>
      <Text style={styles.datoLabel}>{label}</Text>
      <Text style={styles.datoValor} numberOfLines={2}>
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#d9d9d9' },
  linea: { height: 1, backgroundColor: '#111', marginHorizontal: 4 },
  contenido: { padding: 16, paddingBottom: 24 },
  back: { fontSize: 13, color: '#1c2126', marginBottom: 10 },
  barraTitulo: {
    backgroundColor: '#686462',
    borderRadius: 6,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 14,
  },
  barraTitulotexto: { color: '#fff', fontSize: 13.5, fontWeight: '700' },
  seccionTitulo: {
    backgroundColor: '#686462',
    borderRadius: 6,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  seccionTexto: { color: '#fff', fontSize: 12.5, fontWeight: '700' },
  datosBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e6ea',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  datoFila: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  datoLabel: { fontSize: 12, color: '#5b6570', flexShrink: 0 },
  datoValor: { fontSize: 12, color: '#1c2126', fontWeight: '600', textAlign: 'right', flexShrink: 1 },
  ocLista: { gap: 8, marginBottom: 8 },
  ocItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e6ea',
    borderRadius: 6,
    padding: 10,
  },
  ocFila: { flexDirection: 'row', justifyContent: 'space-between' },
  ocCodigo: { fontSize: 12, fontWeight: '700', color: '#1c2126' },
  ocMonto: { fontSize: 12, fontWeight: '700', color: '#1c2126' },
  ocFecha: { fontSize: 11, color: '#5b6570', marginTop: 2 },
  sinDatos: { color: '#5b6570', fontSize: 12, fontStyle: 'italic', marginBottom: 12 },
});
