import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { avisar } from '../../../core/ui/avisos';
import * as ImagePicker from 'expo-image-picker';
import Button from '../../../core/ui/Button';
import { COLORS, RADIOS } from '../../../core/theme/colors';

export interface Foto {
  id: string;
  // Para mostrar la miniatura.
  uri: string;
  // Imagen en base64 ("data:image/jpeg;base64,..."): lo que acepta el servidor.
  dataUrl: string;
}

// El servidor acepta hasta 10 fotos por actuación y sólo JPEG, PNG o WEBP.
export const MAX_FOTOS = 10;
const MIMES_ACEPTADOS = ['image/jpeg', 'image/png', 'image/webp'];

function aFoto(asset: ImagePicker.ImagePickerAsset): Foto | null {
  const mime = asset.mimeType ?? 'image/jpeg';
  if (!asset.base64 || !MIMES_ACEPTADOS.includes(mime)) return null;
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    uri: asset.uri,
    dataUrl: `data:${mime};base64,${asset.base64}`,
  };
}

interface Props {
  fotos: Foto[];
  onChange: (fotos: Foto[]) => void;
  titulo?: string;
}

// Captura o selección de fotografías para la observación de un ticket,
// con miniaturas y botón para quitar cada una.
export default function FotosField({ fotos, onChange, titulo = 'Fotografías' }: Props) {
  function agregar(resultado: ImagePicker.ImagePickerResult) {
    if (resultado.canceled) return;
    const foto = aFoto(resultado.assets[0]);
    if (!foto) {
      avisar('Formato no válido', 'Sólo se aceptan imágenes JPEG, PNG o WEBP.');
      return;
    }
    onChange([...fotos, foto]);
  }

  function hayCupo(): boolean {
    if (fotos.length < MAX_FOTOS) return true;
    avisar('Límite de fotos', `Puedes adjuntar hasta ${MAX_FOTOS} fotos.`);
    return false;
  }

  async function tomarFoto() {
    if (!hayCupo()) return;
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      avisar('Permiso necesario', 'Se necesita acceso a la cámara para tomar la foto.');
      return;
    }
    agregar(await ImagePicker.launchCameraAsync({ quality: 0.6, base64: true }));
  }

  async function elegirImagen() {
    if (!hayCupo()) return;
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      avisar('Permiso necesario', 'Se necesita acceso a la galería para elegir la imagen.');
      return;
    }
    agregar(await ImagePicker.launchImageLibraryAsync({ quality: 0.6, base64: true }));
  }

  function quitarFoto(id: string) {
    onChange(fotos.filter((f) => f.id !== id));
  }

  return (
    <>
      <Text style={[styles.label, { marginTop: 10 }]}>{titulo}</Text>
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
