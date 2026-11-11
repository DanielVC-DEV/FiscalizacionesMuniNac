import { useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../auth/components/SesionHeader';
import { COLORS, RADIOS, SOMBRA } from '../../core/theme/colors';
import { useSesion } from '../auth/store';
import { useOpcionesMenu } from './opciones';

// "panel" es el contenido de inicio de la vista web (el resumen de tickets);
// lo inyecta navigation/AppNavigator.tsx para no importar otro módulo.
export default function MenuScreen({ navigation, panel }: any) {
  const sesion = useSesion();
  const [gestionAbierta, setGestionAbierta] = useState(false);
  const { principales: opcionesVisibles, gestion: gestionVisible } = useOpcionesMenu();
  // Celular y tablet: 2 o 3 tarjetas por fila. Desde 900 px se usa la vista web con menú lateral.
  const ancho = useWindowDimensions().width;
  const horizontal = Platform.OS === 'web' && ancho >= 900;
  const anchoTile = ancho >= 600 ? '31.5%' : '47%';
  const porFilaGestion = 2;

  // Vista web ancha: el menú lateral lo pone navigation/ShellWeb; aquí va el
  // panel de inicio (el resumen de tickets).
  if (horizontal) {
    return (
      <View style={styles.webPrincipal}>
        <View style={styles.webEncabezado}>
          <Text style={styles.webTitulo}>Resumen de tickets</Text>
          <Text style={styles.webSubtitulo}>Hola, {sesion?.usuario.nombre}. Este es el estado actual de las fiscalizaciones.</Text>
        </View>
        {panel}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />

      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <Image
            source={require('../../../assets/logo-completo.png')}
            style={styles.logoGrande}
            resizeMode="contain"
            accessibilityLabel="Ilustre Municipalidad de Nacimiento, Unidos por una mejor comuna"
          />
          <Text style={styles.titulo}>¿Qué haremos hoy?</Text>
        </View>

        <View style={styles.grilla}>
          {opcionesVisibles.map((opcion) => (
            <TouchableOpacity
              key={opcion.destino}
              style={[styles.tile, { width: anchoTile }]}
              activeOpacity={0.75}
              onPress={() => navigation.navigate(opcion.destino)}
            >
              <View style={styles.tileIcono}>{opcion.glifo}</View>
              <Text style={styles.tileTitulo}>{opcion.titulo}</Text>
              <Text style={styles.tileDescripcion}>{opcion.descripcion}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {gestionVisible.length > 0 && (
          <View style={[styles.gestion, horizontal && styles.gestionAncha]}>
            <TouchableOpacity
              style={styles.gestionEncabezado}
              activeOpacity={0.75}
              onPress={() => setGestionAbierta((abierta) => !abierta)}
              accessibilityRole="button"
              accessibilityState={{ expanded: gestionAbierta }}
            >
              <View style={styles.gestionTexto}>
                <Text style={styles.gestionTitulo}>Creación y administración</Text>
                <Text style={styles.gestionDescripcion}>Tickets, contratos, empresas y áreas</Text>
              </View>
              <Text style={styles.gestionChevron}>{gestionAbierta ? '▴' : '▾'}</Text>
            </TouchableOpacity>
            {gestionAbierta && (
              <View style={styles.gestionGrilla}>
                {Array.from({ length: Math.ceil(gestionVisible.length / porFilaGestion) }, (_, indiceFila) => (
                  <View key={indiceFila} style={styles.gestionFila}>
                    {gestionVisible.slice(indiceFila * porFilaGestion, (indiceFila + 1) * porFilaGestion).map((opcion) => (
                      <TouchableOpacity
                        key={opcion.destino}
                        style={[styles.tile, styles.gestionTile]}
                        activeOpacity={0.75}
                        onPress={() => navigation.navigate(opcion.destino)}
                      >
                        <View style={styles.tileIcono}>{opcion.glifo}</View>
                        <Text style={styles.tileTitulo}>{opcion.titulo}</Text>
                        <Text style={styles.tileDescripcion}>{opcion.descripcion}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORS.fondo,
  },
  webPrincipal: { flex: 1 },
  webEncabezado: { paddingHorizontal: 40, paddingTop: 32 },
  webTitulo: { fontSize: 26, fontWeight: '800', color: COLORS.azulOscuro },
  webSubtitulo: { fontSize: 14, color: COLORS.textoSecundario, marginTop: 6 },
  contenido: { paddingBottom: 16 },
  encabezado: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 2 },
  // Ancho y alto fijos (no "aspectRatio"): esta imagen es un rectángulo
  // ancho (900x360 en el archivo original), y calcular el alto desde un
  // porcentaje + aspectRatio daba un resultado inconsistente (una caja
  // mucho más alta de lo visible, con el logo "flotando" adentro con
  // espacio en blanco arriba y abajo). Con medidas fijas no pasa eso.
  logoGrande: { width: 190, height: 76, marginBottom: 4 },
  titulo: { fontSize: 16.5, fontWeight: '700', color: COLORS.textoPrimario },
  grilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 16,
  },
  gestion: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.superficie,
    borderRadius: RADIOS.lg,
    borderWidth: 1,
    borderColor: COLORS.bordeSuave,
    ...SOMBRA,
  },
  gestionAncha: { marginHorizontal: 16 },
  gestionEncabezado: {
    minHeight: 62,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gestionTexto: { flex: 1 },
  gestionTitulo: { color: COLORS.textoPrimario, fontSize: 14, fontWeight: '700' },
  gestionDescripcion: { color: COLORS.textoSecundario, fontSize: 11, marginTop: 3 },
  gestionChevron: { color: COLORS.azul, fontSize: 18, marginLeft: 12 },
  gestionGrilla: {
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 12,
  },
  gestionFila: { flexDirection: 'row', gap: 10 },
  gestionTile: { flex: 1 },
  tile: {
    aspectRatio: 1.35,
    backgroundColor: COLORS.superficie,
    borderRadius: RADIOS.lg,
    borderWidth: 1,
    borderColor: COLORS.bordeSuave,
    padding: 12,
    justifyContent: 'center',
    ...SOMBRA,
  },
  tileIcono: {
    width: 36,
    height: 36,
    borderRadius: RADIOS.md,
    backgroundColor: COLORS.azulSuave,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tileTitulo: { color: COLORS.textoPrimario, fontSize: 13.5, fontWeight: '700' },
  tileDescripcion: { color: COLORS.textoSecundario, fontSize: 10.5, marginTop: 2 },
});
