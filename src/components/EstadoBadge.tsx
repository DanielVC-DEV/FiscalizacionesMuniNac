import { StyleSheet, Text, View } from 'react-native';
import { COLOR_ESTADO, RADIOS } from '../theme/colors';

interface Props {
  // Clave de COLOR_ESTADO: un EstadoTicket, o 'VENCIDO' (condición
  // derivada, no un estado guardado — ver esFechaPasada en utils/fechas.ts).
  estado: string;
  etiqueta?: string;
  tamano?: 'sm' | 'md';
}

// Badge de color por estado, según el código de colores de la sección 25
// del informe (aplicado a estados de ticket vía COLOR_ESTADO).
export default function EstadoBadge({ estado, etiqueta, tamano = 'md' }: Props) {
  const def = COLOR_ESTADO[estado] ?? COLOR_ESTADO.CERRADO;
  const chico = tamano === 'sm';
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: def.suave },
        chico && styles.baseChico,
      ]}
    >
      <View style={[styles.punto, { backgroundColor: def.color }]} />
      <Text style={[styles.texto, { color: def.oscuro }, chico && styles.textoChico]} numberOfLines={1}>
        {etiqueta ?? def.etiqueta}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: RADIOS.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  baseChico: { paddingHorizontal: 8, paddingVertical: 3 },
  punto: { width: 7, height: 7, borderRadius: 4 },
  texto: { fontSize: 11, fontWeight: '700' },
  textoChico: { fontSize: 9.5 },
});
