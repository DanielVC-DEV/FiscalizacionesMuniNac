import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { COLORS, RADIOS } from '../theme/colors';

interface Props {
  label: string;
  requerido?: boolean;
  placeholder: string;
  value: string | null;
  options: string[];
  onChange: (value: string) => void;
  // Texto que se muestra cuando `options` todavía viene vacío (por ejemplo,
  // "Aún no hay contratos cargados"). El campo queda deshabilitado en ese caso.
  mensajeVacio?: string;
  error?: string;
}

export default function SelectField({
  label,
  requerido,
  placeholder,
  value,
  options,
  onChange,
  mensajeVacio,
  error,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const sinOpciones = options.length === 0;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {requerido && <Text style={styles.req}> *</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.input, sinOpciones && styles.inputDeshabilitado, !!error && styles.inputError]}
        onPress={() => !sinOpciones && setAbierto(true)}
        activeOpacity={sinOpciones ? 1 : 0.7}
      >
        <Text style={value ? styles.valueText : styles.placeholderText} numberOfLines={1}>
          {value ?? placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>
      {sinOpciones && !!mensajeVacio && <Text style={styles.avisoVacio}>{mensajeVacio}</Text>}
      {!sinOpciones && !!error && <Text style={styles.errorTexto}>{error}</Text>}

      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <Pressable style={styles.overlay} onPress={() => setAbierto(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onChange(item);
                    setAbierto(false);
                  }}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 12 },
  label: { fontSize: 12, color: COLORS.textoPrimario, marginBottom: 4, fontWeight: '600' },
  req: { color: COLORS.rojo },
  input: {
    height: 46,
    borderRadius: RADIOS.md,
    borderWidth: 1.5,
    borderColor: COLORS.borde,
    backgroundColor: COLORS.superficie,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputDeshabilitado: {
    backgroundColor: COLORS.fondo,
  },
  inputError: {
    borderColor: COLORS.rojo,
  },
  placeholderText: { color: COLORS.textoTenue, fontSize: 13, flex: 1 },
  valueText: { color: COLORS.textoPrimario, fontSize: 13, flex: 1 },
  chevron: { color: COLORS.azul, fontWeight: '700' },
  avisoVacio: { color: COLORS.textoSecundario, fontSize: 11, marginTop: 4 },
  errorTexto: { color: COLORS.rojo, fontSize: 11, marginTop: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(5,15,25,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.superficie,
    borderTopLeftRadius: RADIOS.lg,
    borderTopRightRadius: RADIOS.lg,
    maxHeight: '60%',
    padding: 16,
  },
  sheetTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8, color: COLORS.azul },
  option: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.bordeSuave },
  optionText: { fontSize: 14, color: COLORS.textoPrimario },
});
