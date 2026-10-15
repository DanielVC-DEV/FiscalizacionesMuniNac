import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme/colors';

// Etiqueta de subsección dentro de una pantalla (ej: "Datos generales",
// "Órdenes de compra"). Antes cada pantalla dibujaba esta barra gris a
// mano; ahora es un solo componente con el estilo institucional.
export default function SeccionLabel({ texto }: { texto: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.marca} />
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, marginBottom: 10 },
  marca: { width: 4, height: 14, borderRadius: 2, backgroundColor: COLORS.azul },
  texto: { fontSize: 12, fontWeight: '700', color: COLORS.textoPrimario, letterSpacing: 0.3 },
});
