import { Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../auth/components/SesionHeader';
import { COLORS } from '../../core/theme/colors';
import { useSesion } from '../auth/store';

// "panel" es el contenido de inicio (el resumen de tickets). Lo inyecta
// navigation/AppNavigator.tsx para no importar otro módulo, y recibe el margen
// interior que corresponde a cada vista. El menú de accesos no va aquí: está en
// el menú lateral (barra fija en la web ancha, panel deslizable en el celular;
// ver navigation/ShellWeb.tsx).
export default function MenuScreen({ navigation, panel }: any) {
  const sesion = useSesion();
  // Desde 900 px la web usa menú lateral fijo y un encabezado más amplio.
  const ancho = useWindowDimensions().width;
  const webAncha = Platform.OS === 'web' && ancho >= 900;

  if (webAncha) {
    return (
      <View style={styles.webPrincipal}>
        <View style={styles.webEncabezado}>
          <Text style={styles.webTitulo}>Resumen de tickets</Text>
          <Text style={styles.webSubtitulo}>Hola, {sesion?.usuario.nombre}. Este es el estado actual de las fiscalizaciones.</Text>
        </View>
        {panel?.(40)}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />
      <View style={styles.saludo}>
        <Text style={styles.titulo}>Resumen de tickets</Text>
        <Text style={styles.subtitulo} numberOfLines={2}>
          Hola, {sesion?.usuario.nombre}. Abre el menú para ir a tickets, contratos y más.
        </Text>
      </View>
      <View style={styles.panel}>{panel?.(16)}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.fondo },
  webPrincipal: { flex: 1 },
  webEncabezado: { paddingHorizontal: 40, paddingTop: 32 },
  webTitulo: { fontSize: 26, fontWeight: '800', color: COLORS.azulOscuro },
  webSubtitulo: { fontSize: 14, color: COLORS.textoSecundario, marginTop: 6 },
  saludo: { paddingHorizontal: 16, paddingTop: 14 },
  titulo: { fontSize: 19, fontWeight: '800', color: COLORS.azulOscuro },
  subtitulo: { fontSize: 12.5, color: COLORS.textoSecundario, marginTop: 4 },
  panel: { flex: 1 },
});
