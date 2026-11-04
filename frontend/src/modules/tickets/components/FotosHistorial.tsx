import { useEffect, useState } from 'react';
import { Image, ImageStyle, Modal, Platform, StyleProp, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, RADIOS } from '../../../core/theme/colors';
import { origenArchivo } from '../api';

// En el navegador `Image` no envía cabeceras, así que la foto protegida se descarga con
// `fetch` (que sí lleva la sesión) y se muestra desde un objeto local. En el celular `Image`
// acepta las cabeceras directamente.
function useUriProtegida(idArchivo: number): string | null {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let activa = true;
    let objeto: string | null = null;
    const origen = origenArchivo(idArchivo);
    fetch(origen.uri, { headers: origen.headers })
      .then((respuesta) => (respuesta.ok ? respuesta.blob() : Promise.reject(new Error('sin foto'))))
      .then((blob) => {
        objeto = URL.createObjectURL(blob);
        if (activa) setUri(objeto);
      })
      .catch(() => undefined);
    return () => {
      activa = false;
      if (objeto) URL.revokeObjectURL(objeto);
    };
  }, [idArchivo]);

  return uri;
}

function ImagenProtegida({ idArchivo, style, resizeMode }: {
  idArchivo: number;
  style: StyleProp<ImageStyle>;
  resizeMode?: 'contain' | 'cover';
}) {
  const uriWeb = useUriProtegida(idArchivo);
  if (Platform.OS !== 'web') {
    return <Image source={origenArchivo(idArchivo)} style={style} resizeMode={resizeMode} />;
  }
  return uriWeb ? <Image source={{ uri: uriWeb }} style={style} resizeMode={resizeMode} /> : <View style={style as object} />;
}

interface Props {
  archivos: { id_archivo: number; tipo_mime: string }[];
}

// Miniaturas de las fotos de una actuación del historial. Al tocar una se abre
// ampliada. Las imágenes se piden con la sesión activa (el servidor las protege).
export default function FotosHistorial({ archivos }: Props) {
  const [ampliada, setAmpliada] = useState<number | null>(null);

  return (
    <>
      <View style={styles.miniaturas}>
        {archivos.map((archivo) => (
          <TouchableOpacity key={archivo.id_archivo} onPress={() => setAmpliada(archivo.id_archivo)}>
            <ImagenProtegida idArchivo={archivo.id_archivo} style={styles.miniatura} resizeMode="cover" />
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={ampliada !== null} transparent animationType="fade" onRequestClose={() => setAmpliada(null)}>
        <TouchableOpacity style={styles.fondo} activeOpacity={1} onPress={() => setAmpliada(null)}>
          {ampliada !== null && (
            <ImagenProtegida idArchivo={ampliada} style={styles.grande} resizeMode="contain" />
          )}
          <Text style={styles.cerrar}>Toca para cerrar</Text>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  miniaturas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  miniatura: { width: 72, height: 72, borderRadius: RADIOS.sm, backgroundColor: COLORS.borde },
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  grande: { width: '100%', height: '80%' },
  cerrar: { color: COLORS.textoClaro, fontSize: 12, marginTop: 12 },
});
