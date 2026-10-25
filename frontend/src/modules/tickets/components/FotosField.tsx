import { StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '../../../core/ui/Button';
import { COLORS, RADIOS } from '../../../core/theme/colors';

export interface Foto {
  id: string;
  uri: string;
}

interface Props {
  fotos: Foto[];
  onChange: (fotos: Foto[]) => void;
}

// Captura o selección de fotografías para la observación de un ticket,
// con miniaturas y botón para quitar cada una.
export default function FotosField({ fotos, onChange }: Props) {
  async function tomarFoto() {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso necesario', 'Se necesita acceso a la cámara para tomar la foto.');
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!resultado.canceled) {
      onChange([...fotos, { id: `${Date.now()}`, uri: resultado.assets[0].uri }]);
    }
  }

  async function elegirImagen() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso necesario', 'Se necesita acceso a la galería para elegir la imagen.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });
    if (!resultado.canceled) {
      onChange([...fotos, { id: `${Date.now()}`, uri: resultado.assets[0].uri }]);
    }
  }

  function quitarFoto(id: string) {
    onChange(fotos.filter((f) => f.id !== id));
  }

  return (
    <>
      <Text style={[styles.label, { marginTop: 10 }]}>Fotografías</Text>
      <View style={styles.fila}>
        <Button label="Tomar foto" variante="suave" onPress={tomarFoto} style={{ flex: 1 }} />
        <Button label="Elegir desde el dispositivo" variante="suave" onPress={elegirImagen} style={{ flex: 1 }} />
      </View>
      {fotos.length > 0 && (
        <View style={styles.miniaturas}>
          {fotos.map((f) => (
            <View key={f.id} style={styles.miniaturaBox}>
              <Image source={{ uri: f.uri }} style={styles.miniatura} />
              <TouchableOpacity style={styles.miniaturaQuitar} onPress={() => quitarFoto(f.id)}>
                <Text style={styles.miniaturaQuitarTexto}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, color: COLORS.textoPrimario, marginBottom: 4, marginTop: 6, fontWeight: '600' },
  fila: { flexDirection: 'row', gap: 8, marginTop: 4 },
  miniaturas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  miniaturaBox: { width: 64, height: 64 },
  miniatura: { width: 64, height: 64, borderRadius: RADIOS.sm, backgroundColor: COLORS.borde },
  miniaturaQuitar: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.rojo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniaturaQuitarTexto: { color: COLORS.textoClaro, fontSize: 11, fontWeight: '700' },
});
