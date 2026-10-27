import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { COLORS, RADIOS } from '../../../core/theme/colors';

interface Props extends Omit<TextInputProps, 'style'> {
  label: string;
  // Muestra un botón "Mostrar / Ocultar" cuando el campo es una contraseña.
  esPassword?: boolean;
  ayuda?: string;
}

// Campo de formulario con etiqueta, borde que resalta al escribir y, en
// contraseñas, un interruptor para ver lo que se escribe.
export default function CampoTexto({ label, esPassword, ayuda, ...inputProps }: Props) {
  const [enfocado, setEnfocado] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.grupo}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.caja, enfocado && styles.cajaEnfocada]}>
        <TextInput
          {...inputProps}
          style={styles.input}
          placeholderTextColor={COLORS.textoTenue}
          secureTextEntry={esPassword && !visible}
          onFocus={(e) => {
            setEnfocado(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setEnfocado(false);
            inputProps.onBlur?.(e);
          }}
        />
        {esPassword && (
          <TouchableOpacity onPress={() => setVisible((v) => !v)} hitSlop={8} accessibilityRole="button">
            <Text style={styles.alternar}>{visible ? 'Ocultar' : 'Mostrar'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {ayuda && <Text style={styles.ayuda}>{ayuda}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { gap: 6 },
  label: { color: COLORS.textoPrimario, fontSize: 13, fontWeight: '600' },
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: RADIOS.md,
    borderWidth: 1.5,
    borderColor: COLORS.borde,
    backgroundColor: COLORS.superficie,
    paddingHorizontal: 12,
    gap: 8,
  },
  cajaEnfocada: { borderColor: COLORS.azul },
  input: { flex: 1, color: COLORS.textoPrimario, fontSize: 15 },
  alternar: { color: COLORS.azul, fontSize: 12.5, fontWeight: '700' },
  ayuda: { color: COLORS.textoTenue, fontSize: 11.5 },
});
