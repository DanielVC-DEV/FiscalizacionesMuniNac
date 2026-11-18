import { Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Header from '../../../core/ui/Header';
import { useAbrirMenuMovil } from '../../../core/ui/menuMovil';
import { COLORS, RADIOS } from '../../../core/theme/colors';
import { cerrarSesion, useSesion } from '../store';

// Encabezado de las pantallas con sesión: a la izquierda el botón del menú
// lateral (celular), y a la derecha la inicial del usuario (A si es
// administrador, U en los demás roles). Si no hay menú lateral, muestra el
// botón para cerrar sesión.
export default function SesionHeader() {
  const sesion = useSesion();
  const ancho = useWindowDimensions().width;
  const abrirMenu = useAbrirMenuMovil();
  const inicial = sesion?.usuario.rol === 'admin' ? 'A' : 'U';

  // En la web ancha la marca y la sesión van en el menú lateral (navigation/ShellWeb).
  if (Platform.OS === 'web' && ancho >= 900) return null;

  return (
    <Header
      izquierda={
        abrirMenu ? (
          <TouchableOpacity
            onPress={abrirMenu}
            style={styles.hamburguesa}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityRole="button"
            accessibilityLabel="Abrir menú"
          >
            <View style={styles.barra} />
            <View style={styles.barra} />
            <View style={styles.barra} />
          </TouchableOpacity>
        ) : undefined
      }
      derecha={
        <View style={styles.derecha}>
          <View style={styles.avatar} accessibilityLabel={sesion?.usuario.nombre}>
            <Text style={styles.inicial}>{inicial}</Text>
          </View>
          {!abrirMenu && (
            <TouchableOpacity
              onPress={cerrarSesion}
              style={styles.salir}
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión"
            >
              <Text style={styles.salirTexto}>Cerrar sesión</Text>
            </TouchableOpacity>
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  hamburguesa: {
    width: 38,
    height: 38,
    borderRadius: RADIOS.md,
    backgroundColor: COLORS.azulSuave,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  barra: { width: 18, height: 2.5, borderRadius: 2, backgroundColor: COLORS.azul },
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
