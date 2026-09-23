import { StyleSheet, Text, View } from 'react-native';

export default function Header() {
  return (
    <View style={styles.container}>
      <Text style={[styles.texto, styles.logo]}>Logo</Text>
      <Text style={[styles.texto, styles.nombre]} numberOfLines={1}>
        Plataforma de Fiscalización
      </Text>
      <Text style={[styles.texto, styles.usuario]}>Usuario</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  texto: {
    color: '#1c2126',
    fontSize: 13,
    fontWeight: '600',
  },
  logo: { width: 56 },
  nombre: { flex: 1, textAlign: 'center' },
  usuario: { width: 64, textAlign: 'right' },
});
