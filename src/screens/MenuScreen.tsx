import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Header from '../components/Header';

export default function MenuScreen({ navigation }: any) {
  return (
    <View style={styles.pantalla}>
      <Header />
      <View style={styles.linea} />

      <View style={styles.barra}>
        <Text style={styles.barraTexto}>Menú principal</Text>
      </View>

      <View style={styles.grilla}>
        <TouchableOpacity
          style={styles.tile}
          onPress={() => navigation.navigate('Resumen')}
        >
          <Text style={styles.tileTexto}>Resúmenes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tile}
          onPress={() => navigation.navigate('CrearTicket')}
        >
          <Text style={styles.tileTexto}>Tickets</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tile} onPress={() => {}}>
          <Text style={styles.tileTexto}>Contratos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tile} onPress={() => {}}>
          <Text style={styles.tileTexto}>Reportes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#d9d9d9',
  },
  linea: {
    height: 1,
    backgroundColor: '#111',
    marginHorizontal: 4,
  },
  barra: {
    backgroundColor: '#686462',
    borderRadius: 6,
    height: 40,
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barraTexto: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  grilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    padding: 16,
  },
  tile: {
    width: '45%',
    aspectRatio: 1.5,
    backgroundColor: '#686462',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTexto: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
