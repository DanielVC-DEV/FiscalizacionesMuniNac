import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../../core/theme/colors';
import BarraLateral, { EnlaceMenu } from './BarraLateral';

interface Props {
  visible: boolean;
  onClose: () => void;
  principales: readonly EnlaceMenu[];
  gestion: readonly EnlaceMenu[];
  onIr: (destino: string) => void;
  activo?: string;
}

// Menú lateral del celular: la misma barra de la web, que se desliza sobre la
// pantalla con un fondo oscuro. Tocar el fondo, o elegir un acceso, lo cierra.
export default function MenuLateralMovil({ visible, onClose, principales, gestion, onIr, activo }: Props) {
  const ancho = useWindowDimensions().width;
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.contenedor}>
        <View style={[styles.panel, { width: Math.min(300, ancho * 0.85), paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <BarraLateral
            principales={principales}
            gestion={gestion}
            activo={activo}
            onIr={(destino) => {
              onClose();
              onIr(destino);
            }}
          />
        </View>
        <Pressable style={styles.fondo} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar menú" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, flexDirection: 'row' },
  panel: { backgroundColor: COLORS.azulOscuro },
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
});
