import { ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme/colors';

interface Props {
  // Contenido opcional a la derecha (por ejemplo, el usuario y cerrar sesión).
  derecha?: ReactNode;
}

// Barra de marca, presente en todas las pantallas: logo + nombre de la
// plataforma + lo que se pase en "derecha". No conoce la sesión: eso lo
// arma modules/auth/components/SesionHeader.tsx.
export default function Header({ derecha }: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Logo Ilustre Municipalidad de Nacimiento"
      />
      <View style={styles.textos}>
        <Text style={styles.nombre} numberOfLines={1}>
          Ilustre Municipalidad de Nacimiento
        </Text>
      </View>
      {derecha}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.superficie,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.azul,
  },
  logo: { width: 44, height: 44 },
  textos: { flex: 1, justifyContent: 'center' },
  nombre: { color: COLORS.azul, fontSize: 13.5, fontWeight: '700' },
  usuario: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.azulSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  usuarioIniciales: { color: COLORS.azul, fontSize: 12.5, fontWeight: '700' },
});
