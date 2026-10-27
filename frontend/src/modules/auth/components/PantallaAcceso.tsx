import { ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIOS, SOMBRA } from '../../../core/theme/colors';

interface Props {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
}

// Marco común de Login y Registro: franja institucional azul arriba, logo,
// tarjeta blanca con el formulario y pie con el uso restringido.
export default function PantallaAcceso({ titulo, subtitulo, children }: Props) {
  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <View style={styles.franja} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <View style={styles.encabezado}>
            <Image
              source={require('../../../../assets/logo-completo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Ilustre Municipalidad de Nacimiento, Unidos por una mejor comuna"
            />
            <Text style={styles.sistema}>Plataforma de Fiscalización de Contratos</Text>
          </View>

          <View style={styles.tarjeta}>
            <Text style={styles.titulo}>{titulo}</Text>
            <Text style={styles.subtitulo}>{subtitulo}</Text>
            <View style={styles.formulario}>{children}</View>
          </View>

          <Text style={styles.pie}>
            Acceso exclusivo para personal municipal autorizado. Las acciones quedan registradas.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.fondo },
  flex: { flex: 1 },
  franja: { height: 6, backgroundColor: COLORS.azul },
  contenido: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24, justifyContent: 'center', gap: 20 },
  encabezado: { alignItems: 'center', gap: 8 },
  logo: { width: 210, height: 84 },
  sistema: { color: COLORS.textoSecundario, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  tarjeta: {
    backgroundColor: COLORS.superficie,
    borderRadius: RADIOS.xl,
    borderWidth: 1,
    borderColor: COLORS.bordeSuave,
    padding: 22,
    gap: 4,
    ...SOMBRA,
  },
  titulo: { color: COLORS.azul, fontSize: 20, fontWeight: '800' },
  subtitulo: { color: COLORS.textoSecundario, fontSize: 13.5, marginBottom: 14 },
  formulario: { gap: 14 },
  pie: { color: COLORS.textoTenue, fontSize: 11.5, textAlign: 'center', paddingHorizontal: 12 },
});
