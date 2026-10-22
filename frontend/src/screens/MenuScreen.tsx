import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { COLORS, RADIOS, SOMBRA } from '../theme/colors';

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
] as const;

export default function MenuScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />

      <View style={styles.encabezado}>
        <Image
          source={require('../../assets/logo-completo.png')}
          style={styles.logoGrande}
          resizeMode="contain"
          accessibilityLabel="Ilustre Municipalidad de Nacimiento, Unidos por una mejor comuna"
        />
        <Text style={styles.titulo}>¿Qué haremos hoy?</Text>
      </View>

      <View style={styles.grilla}>
        {OPCIONES.map((opcion) => (
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
    </SafeAreaView>
  );
}

// Glifos simples hechos con Views/Text, sin librería de íconos: mantiene
// el look formal sin agregar una dependencia nativa nueva.
function IconoBarras() {
  return (
    <View style={iconos.filaBarras}>
      <View style={[iconos.barra, { height: 10 }]} />
      <View style={[iconos.barra, { height: 16 }]} />
      <View style={[iconos.barra, { height: 22 }]} />
    </View>
  );
}
function IconoTicket() {
  return (
    <View style={iconos.ticket}>
      <View style={iconos.ticketLinea} />
      <View style={iconos.ticketLinea} />
    </View>
  );
}
function IconoDocumento() {
  return (
    <View style={iconos.documento}>
      <View style={iconos.documentoLinea} />
      <View style={[iconos.documentoLinea, { width: '70%' }]} />
      <View style={[iconos.documentoLinea, { width: '50%' }]} />
    </View>
  );
}
function IconoEdificio() {
  return (
    <View style={iconos.edificio}>
      <View style={iconos.edificioFila}>
        <View style={iconos.ventana} />
        <View style={iconos.ventana} />
      </View>
      <View style={iconos.edificioFila}>
        <View style={iconos.ventana} />
        <View style={iconos.ventana} />
      </View>
    </View>
  );
}

const iconos = StyleSheet.create({
  filaBarras: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 22 },
  barra: { width: 5, borderRadius: 2, backgroundColor: COLORS.azul },
  ticket: { width: 22, height: 16, borderRadius: 4, backgroundColor: COLORS.azul, justifyContent: 'center', gap: 3, paddingHorizontal: 4 },
  ticketLinea: { height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.65)' },
  documento: { width: 18, height: 22, borderRadius: 3, backgroundColor: COLORS.superficie, borderWidth: 1.5, borderColor: COLORS.azul, padding: 3, justifyContent: 'center', gap: 3 },
  documentoLinea: { height: 2, width: '85%', borderRadius: 1, backgroundColor: COLORS.azul },
  edificio: { width: 22, height: 20, gap: 3 },
  edificioFila: { flexDirection: 'row', gap: 3 },
  ventana: { width: 9, height: 8, borderRadius: 2, backgroundColor: COLORS.azul },
});

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORS.fondo,
  },
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
