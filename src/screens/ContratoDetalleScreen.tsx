import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import TopBar from '../components/TopBar';
import Card from '../components/Card';
import SeccionLabel from '../components/SeccionLabel';
import { COLORS, RADIOS } from '../theme/colors';
import { Contrato } from '../types';
import { formatearMonto } from '../utils/formato';

export default function ContratoDetalleScreen({ navigation, route }: any) {
  const contrato: Contrato | undefined = route?.params?.contrato;

  if (!contrato) {
    return (
      <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
        <Header />
        <TopBar title="Contrato" onBack={() => navigation.goBack()} />
        <View style={styles.contenido}>
          <Text style={styles.sinDatos}>No se encontró información de este contrato.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />
      <TopBar title={contrato.nombre} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.contenido}>
        <SeccionLabel texto="Datos generales" />
        <Card style={styles.datosBox}>
          <DatoFila label="Nombre del contrato" valor={contrato.nombre} />
          <DatoFila label="RUT de la empresa" valor={contrato.rutEmpresa} />
          <DatoFila label="Nombre de la empresa" valor={contrato.nombreEmpresa} />
          <DatoFila label="Fecha de inicio" valor={contrato.fechaInicio} />
          <DatoFila label="Fecha de término" valor={contrato.fechaTermino} />
          <DatoFila
            label="Día de respuesta a ticket"
            valor={`${contrato.diasRespuestaTicket} día(s) hábil(es)`}
          />
        </Card>

        <SeccionLabel texto="Órdenes de compra" />
        {contrato.ordenesCompra.length === 0 ? (
          <Text style={styles.sinDatos}>Este contrato no tiene órdenes de compra registradas.</Text>
        ) : (
          <View style={styles.ocLista}>
            {contrato.ordenesCompra.map((oc) => (
              <Card key={oc.id} style={styles.ocItem}>
                <View style={styles.ocFila}>
                  <Text style={styles.ocCodigo}>OC {oc.codigo}</Text>
                  <Text style={styles.ocMonto}>{formatearMonto(oc.monto)}</Text>
                </View>
                <Text style={styles.ocFecha}>Fecha: {oc.fecha}</Text>
              </Card>
            ))}
          </View>
        )}

        <SeccionLabel texto="Tickets asociados a este contrato" />
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
  pantalla: { flex: 1, backgroundColor: COLORS.fondo },
  contenido: { padding: 16, paddingBottom: 24 },
  datosBox: { gap: 8 },
  datoFila: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  datoLabel: { fontSize: 12, color: COLORS.textoSecundario, flexShrink: 0 },
  datoValor: { fontSize: 12, color: COLORS.textoPrimario, fontWeight: '600', textAlign: 'right', flexShrink: 1 },
  ocLista: { gap: 8, marginBottom: 8 },
  ocItem: { padding: 10, borderRadius: RADIOS.sm },
  ocFila: { flexDirection: 'row', justifyContent: 'space-between' },
  ocCodigo: { fontSize: 12, fontWeight: '700', color: COLORS.textoPrimario },
  ocMonto: { fontSize: 12, fontWeight: '700', color: COLORS.azul },
  ocFecha: { fontSize: 11, color: COLORS.textoSecundario, marginTop: 2 },
  sinDatos: { color: COLORS.textoSecundario, fontSize: 12, fontStyle: 'italic', marginBottom: 12 },
});
