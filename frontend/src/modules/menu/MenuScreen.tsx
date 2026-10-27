import { Image, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../auth/components/SesionHeader';
import { COLORS, RADIOS, SOMBRA } from '../../core/theme/colors';
import { esAdministrador, useSesion } from '../auth/store';
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
    titulo: 'Tickets',
    descripcion: 'Crear una fiscalización',
    destino: 'CrearTicket',
    glifo: <IconoTicket />,
  },
  {
    titulo: 'Contratos',
    descripcion: 'Ver y crear contratos',
    destino: 'Contratos',
    glifo: <IconoDocumento />,
  },
  {
    titulo: 'Empresas',
    descripcion: 'Empresas contratistas',
    destino: 'Empresas',
    glifo: <IconoEdificio />,
  },
  {
    titulo: 'Áreas',
    descripcion: 'Administrar áreas',
    destino: 'Areas',
    glifo: <IconoDocumento />,
  },
  {
    titulo: 'Supervisores',
    descripcion: 'Crear supervisores de empresa',
    destino: 'Supervisores',
    glifo: <IconoDocumento />,
  },
] as const;

// Destinos que sólo ve el administrador (ver auth/store.ts).
const DESTINOS_ADMIN: string[] = ['Empresas', 'Areas', 'Supervisores'];

export default function MenuScreen({ navigation }: any) {
  const sesion = useSesion();
  const esAdmin = esAdministrador(sesion?.usuario);
  const opcionesVisibles = OPCIONES.filter((opcion) => esAdmin || !DESTINOS_ADMIN.includes(opcion.destino));

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
              style={styles.tile}
              activeOpacity={0.75}
              onPress={() => navigation.navigate(opcion.destino)}
            >
              <View style={styles.tileIcono}>{opcion.glifo}</View>
              <Text style={styles.tileTitulo}>{opcion.titulo}</Text>
              <Text style={styles.tileDescripcion}>{opcion.descripcion}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  tile: {
    width: '47%',
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
