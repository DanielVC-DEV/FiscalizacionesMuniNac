import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../../core/ui/Header';
import { COLORS, RADIOS } from '../../../core/theme/colors';
import { cerrarSesion, useSesion } from '../store';

// Encabezado de las pantallas con sesión: la inicial del usuario (A si es
// administrador, U en los demás roles) y el botón para cerrar sesión.
export default function SesionHeader() {
  const sesion = useSesion();
  const inicial = sesion?.usuario.rol === 'admin' ? 'A' : 'U';

  return (
    <Header
      derecha={
        <View style={styles.derecha}>
          <View style={styles.avatar} accessibilityLabel={sesion?.usuario.nombre}>
            <Text style={styles.inicial}>{inicial}</Text>
          </View>
          <TouchableOpacity
            onPress={cerrarSesion}
            style={styles.salir}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
          >
            <Text style={styles.salirTexto}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  derecha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.azulSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicial: { color: COLORS.azul, fontSize: 12.5, fontWeight: '700' },
  salir: {
    borderWidth: 1,
    borderColor: COLORS.borde,
    borderRadius: RADIOS.sm,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  salirTexto: { color: COLORS.textoPrimario, fontSize: 11.5, fontWeight: '700' },
});
