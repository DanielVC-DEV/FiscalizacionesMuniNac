import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../auth/components/SesionHeader';
import TopBar from '../../core/ui/TopBar';
import { COLORS } from '../../core/theme/colors';
import ResumenPanel from './components/ResumenPanel';

// Pantalla "Resumen de tickets": encabezado, barra con volver y el panel
// con los indicadores y las filas por estado (ver components/ResumenPanel).
export default function ResumenScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />
      <TopBar title="Resumen de tickets" onBack={() => navigation.goBack()} />
      <ResumenPanel navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.fondo },
});
