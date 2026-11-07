import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../auth/components/SesionHeader';
import { COLORS, RADIOS, SOMBRA } from '../../core/theme/colors';
import { esAdministrador, esMunicipal, useSesion } from '../auth/store';
import { IconoBarras, IconoTicket, IconoDocumento, IconoEdificio } from './components/IconosMenu';

// Destinos del menú principal. "destino" es el nombre de la ruta registrada
// en navigation/AppNavigator.tsx.
const OPCIONES = [
  {
    titulo: 'Resúmenes',
    descripcion: 'Estado de los tickets',
    destino: 'Resumen',
    glifo: <IconoBarras />,
  },
  {
    titulo: 'Indicadores',
    descripcion: 'Métricas y reporte PDF',
    destino: 'Indicadores',
    glifo: <IconoBarras />,
  },
] as const;

const OPCIONES_GESTION = [
  {
    titulo: 'Tickets',
    descripcion: 'Crear una fiscalización',
    destino: 'CrearTicket',
    glifo: <IconoTicket />,
  },
  {
    titulo: 'Áreas',
    descripcion: 'Administrar áreas',
    destino: 'Areas',
    glifo: <IconoDocumento />,
  },
  {
    titulo: 'Empresas',
    descripcion: 'Empresas contratistas',
    destino: 'Empresas',
    glifo: <IconoEdificio />,
  },
  {
    titulo: 'Contratos',
    descripcion: 'Ver y crear contratos',
    destino: 'Contratos',
    glifo: <IconoDocumento />,
  },
] as const;

// Destinos que sólo ve el administrador (ver auth/store.ts).
const DESTINOS_ADMIN: string[] = ['Empresas', 'Areas'];
// Destinos de usuarios municipales: el supervisor de empresa sólo ve "Resumen".
const DESTINOS_MUNICIPALES: string[] = ['CrearTicket', 'Contratos', 'Indicadores'];

export default function MenuScreen({ navigation }: any) {
  const sesion = useSesion();
  const [gestionAbierta, setGestionAbierta] = useState(false);
  const esAdmin = esAdministrador(sesion?.usuario);
  const municipal = esMunicipal(sesion?.usuario);
  const opcionesVisibles = OPCIONES.filter((opcion) => {
    if (DESTINOS_ADMIN.includes(opcion.destino)) return esAdmin;
    if (DESTINOS_MUNICIPALES.includes(opcion.destino)) return municipal;
    return true;
  });
  const gestionVisible = OPCIONES_GESTION.filter((opcion) => {
    if (DESTINOS_ADMIN.includes(opcion.destino)) return esAdmin;
    if (DESTINOS_MUNICIPALES.includes(opcion.destino)) return municipal;
    return true;
  });
  // El menú principal admite tres tarjetas en pantallas anchas.
  const anchoTile = useWindowDimensions().width >= 600 ? '31.5%' : '47%';

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
          <View style={styles.gestion}>
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
                {Array.from({ length: Math.ceil(gestionVisible.length / 2) }, (_, indiceFila) => (
                  <View key={indiceFila} style={styles.gestionFila}>
                    {gestionVisible.slice(indiceFila * 2, indiceFila * 2 + 2).map((opcion) => (
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
