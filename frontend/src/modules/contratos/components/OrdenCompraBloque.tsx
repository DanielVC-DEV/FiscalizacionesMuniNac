import { StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import Card from '../../../core/ui/Card';
import DateField from '../../../core/ui/DateField';
import { COLORS, RADIOS } from '../../../core/theme/colors';
import { OrdenCompra } from '../types';

interface Props {
  oc: OrdenCompra;
  // Posición de la orden dentro del formulario (se muestra como "Orden de compra N").
  indice: number;
  errorMonto?: string;
  errorFecha?: string;
  onQuitar: () => void;
  onActualizar: (campo: keyof OrdenCompra, valor: string) => void;
}

// Bloque editable de una orden de compra dentro de "Nuevo contrato".
export default function OrdenCompraBloque({ oc, indice, errorMonto, errorFecha, onQuitar, onActualizar }: Props) {
  return (
    <Card style={styles.bloque}>
      <TouchableOpacity style={styles.cerrar} onPress={onQuitar}>
        <Text style={styles.cerrarTexto}>×</Text>
      </TouchableOpacity>
      <Text style={styles.titulo}>Orden de compra {indice + 1}</Text>

      <Text style={styles.label}>Monto</Text>
      <TextInput
        style={styles.input}
        placeholder="$"
        placeholderTextColor={COLORS.textoTenue}
        value={oc.monto}
        onChangeText={(v) => onActualizar('monto', v.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
      />
      {!!errorMonto && <Text style={styles.error}>{errorMonto}</Text>}

      <DateField label="Fecha" value={oc.fecha} onChange={(v) => onActualizar('fecha', v)} error={errorFecha} />
    </Card>
  );
}

const styles = StyleSheet.create({
  bloque: { marginBottom: 10 },
  cerrar: { position: 'absolute', top: 10, right: 12, zIndex: 1 },
  cerrarTexto: { fontSize: 16, color: COLORS.textoTenue, fontWeight: '700' },
  titulo: { fontSize: 11, color: COLORS.azul, fontWeight: '700', marginBottom: 4 },
  label: { fontSize: 12, color: COLORS.textoPrimario, marginBottom: 4, marginTop: 6, fontWeight: '600' },
  input: {
    height: 46,
    borderRadius: RADIOS.md,
    borderWidth: 1.5,
    borderColor: COLORS.borde,
    backgroundColor: COLORS.superficie,
    paddingHorizontal: 12,
    fontSize: 13,
    color: COLORS.textoPrimario,
    marginBottom: 8,
    justifyContent: 'center',
  },
  error: { color: COLORS.rojo, fontSize: 11, marginTop: -4, marginBottom: 6 },
});
