import { Children, ReactNode } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { COLORS, RADIOS, SOMBRA } from '../theme/colors';

// Ancho desde el cual los campos de una fila se ponen uno al lado del otro.
const ANCHO_COLUMNAS = 720;

interface TarjetaProps {
  titulo: string;
  descripcion?: string;
  children: ReactNode;
}

// Agrupa los campos de un formulario en una tarjeta con título y una línea
// divisoria, como en los formularios administrativos habituales.
export default function TarjetaSeccion({ titulo, descripcion, children }: TarjetaProps) {
  return (
    <View style={styles.tarjeta}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>{titulo}</Text>
        {!!descripcion && <Text style={styles.descripcion}>{descripcion}</Text>}
      </View>
      <View style={styles.cuerpo}>{children}</View>
    </View>
  );
}

// Pone sus hijos en columnas iguales cuando hay ancho suficiente (web y
// tablet) y uno bajo otro en el celular. Cada hijo es un campo completo.
export function FilaCampos({ children }: { children: ReactNode }) {
  const enColumnas = useWindowDimensions().width >= ANCHO_COLUMNAS;
  return (
    <View style={[styles.fila, enColumnas && styles.filaColumnas]}>
      {Children.toArray(children).map((hijo, indice) => (
        <View key={indice} style={enColumnas ? styles.columna : undefined}>
          {hijo}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: COLORS.superficie,
    borderRadius: RADIOS.lg,
    borderWidth: 1,
    borderColor: COLORS.bordeSuave,
    marginBottom: 16,
    ...SOMBRA,
  },
  encabezado: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bordeSuave,
  },
  titulo: { fontSize: 15, fontWeight: '700', color: COLORS.azulOscuro },
  descripcion: { fontSize: 12, color: COLORS.textoSecundario, marginTop: 3 },
  cuerpo: { padding: 20 },
  fila: { gap: 0 },
  filaColumnas: { flexDirection: 'row', gap: 20 },
  columna: { flex: 1, minWidth: 0 },
});
