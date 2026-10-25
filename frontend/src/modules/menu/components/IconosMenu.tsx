import { StyleSheet, View } from 'react-native';
import { COLORS } from '../../../core/theme/colors';

// Glifos simples hechos con Views, sin librería de íconos: mantiene el look
// formal sin agregar una dependencia nativa nueva.

export function IconoBarras() {
  return (
    <View style={iconos.filaBarras}>
      <View style={[iconos.barra, { height: 10 }]} />
      <View style={[iconos.barra, { height: 16 }]} />
      <View style={[iconos.barra, { height: 22 }]} />
    </View>
  );
}

export function IconoTicket() {
  return (
    <View style={iconos.ticket}>
      <View style={iconos.ticketLinea} />
      <View style={iconos.ticketLinea} />
    </View>
  );
}

export function IconoDocumento() {
  return (
    <View style={iconos.documento}>
      <View style={iconos.documentoLinea} />
      <View style={[iconos.documentoLinea, { width: '70%' }]} />
      <View style={[iconos.documentoLinea, { width: '50%' }]} />
    </View>
  );
}

export function IconoEdificio() {
  return (
    <View style={iconos.edificio}>
      <View style={iconos.edificioFila}>
        <View style={iconos.ventana} />
        <View style={iconos.ventana} />
      </View>
      <View style={iconos.edificioFila}>
        <View style={iconos.ventana} />
        <View style={iconos.ventana} />
      </View>
    </View>
  );
}

const iconos = StyleSheet.create({
  filaBarras: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 22 },
  barra: { width: 5, borderRadius: 2, backgroundColor: COLORS.azul },
  ticket: { width: 22, height: 16, borderRadius: 4, backgroundColor: COLORS.azul, justifyContent: 'center', gap: 3, paddingHorizontal: 4 },
  ticketLinea: { height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.65)' },
  documento: { width: 18, height: 22, borderRadius: 3, backgroundColor: COLORS.superficie, borderWidth: 1.5, borderColor: COLORS.azul, padding: 3, justifyContent: 'center', gap: 3 },
  documentoLinea: { height: 2, width: '85%', borderRadius: 1, backgroundColor: COLORS.azul },
  edificio: { width: 22, height: 20, gap: 3 },
  edificioFila: { flexDirection: 'row', gap: 3 },
  ventana: { width: 9, height: 8, borderRadius: 2, backgroundColor: COLORS.azul },
});
