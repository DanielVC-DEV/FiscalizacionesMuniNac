import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, RADIOS } from '../../../core/theme/colors';
import { cerrarSesion, useSesion } from '../../auth/store';

export interface EnlaceMenu {
  titulo: string;
  destino: string;
}

interface Props {
  // Accesos principales (siempre visibles).
  principales: readonly EnlaceMenu[];
  // Accesos del menú desplegable "Creación y administración".
  gestion: readonly EnlaceMenu[];
  onIr: (destino: string) => void;
  // Nombre de la ruta abierta, para resaltar su acceso.
  activo?: string;
}

// Menú lateral izquierdo de la web: marca, accesos principales, el menú
// desplegable de creación y administración, y la sesión al pie.
export default function BarraLateral({ principales, gestion, onIr, activo }: Props) {
  const sesion = useSesion();
  const [abierto, setAbierto] = useState(true);

  return (
    <View style={styles.barra}>
      <View style={styles.marca}>
        <Image
          source={require('../../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Logo Ilustre Municipalidad de Nacimiento"
        />
        <View style={styles.marcaTexto}>
          <Text style={styles.marcaNombre}>Municipalidad de Nacimiento</Text>
          <Text style={styles.marcaSistema}>Fiscalización de contratos</Text>
        </View>
      </View>

      <ScrollView style={styles.lista} contentContainerStyle={styles.listaContenido}>
        <Text style={styles.seccion}>Navegación</Text>
        {principales.map((enlace) => (
          <TouchableOpacity key={enlace.destino} style={[styles.enlace, activo === enlace.destino && styles.activo]} onPress={() => onIr(enlace.destino)}>
            <View style={styles.punto} />
            <Text style={styles.enlaceTexto}>{enlace.titulo}</Text>
          </TouchableOpacity>
        ))}

        {gestion.length > 0 && (
          <>
            <Text style={[styles.seccion, styles.seccionSeparada]}>Gestión</Text>
            <TouchableOpacity
              style={styles.encabezadoGrupo}
              onPress={() => setAbierto((v) => !v)}
              accessibilityRole="button"
              accessibilityState={{ expanded: abierto }}
            >
              <Text style={styles.grupoTitulo}>Creación y administración</Text>
              <Text style={styles.chevron}>{abierto ? '▴' : '▾'}</Text>
            </TouchableOpacity>
            {abierto &&
              gestion.map((enlace) => (
                <TouchableOpacity key={enlace.destino} style={[styles.enlace, styles.subenlace, activo === enlace.destino && styles.activo]} onPress={() => onIr(enlace.destino)}>
                  <Text style={styles.enlaceTexto}>{enlace.titulo}</Text>
                </TouchableOpacity>
              ))}
          </>
        )}
      </ScrollView>

      <View style={styles.pie}>
        <View style={styles.avatar}>
          <Text style={styles.inicial}>{(sesion?.usuario.nombre ?? 'U').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.pieTexto}>
          <Text style={styles.usuario} numberOfLines={1}>
            {sesion?.usuario.nombre}
          </Text>
          <TouchableOpacity onPress={cerrarSesion} accessibilityRole="button" accessibilityLabel="Cerrar sesión">
            <Text style={styles.salir}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barra: { width: 270, height: '100%', backgroundColor: COLORS.azulOscuro },
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  logo: { width: 40, height: 40, backgroundColor: COLORS.blanco, borderRadius: RADIOS.md },
  marcaTexto: { flex: 1 },
  marcaNombre: { color: COLORS.blanco, fontSize: 13.5, fontWeight: '700' },
  marcaSistema: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 },
  lista: { flex: 1 },
  listaContenido: { padding: 12 },
  seccion: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  seccionSeparada: { marginTop: 18 },
  enlace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: RADIOS.md,
  },
  activo: { backgroundColor: 'rgba(255,255,255,0.18)' },
  subenlace: { paddingLeft: 24 },
  punto: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)' },
  enlaceTexto: { color: COLORS.blanco, fontSize: 13.5, fontWeight: '500' },
  encabezadoGrupo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: RADIOS.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 4,
  },
  grupoTitulo: { color: COLORS.blanco, fontSize: 13.5, fontWeight: '700' },
  chevron: { color: COLORS.blanco, fontSize: 14 },
  pie: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.azulSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicial: { color: COLORS.azul, fontSize: 14, fontWeight: '700' },
  pieTexto: { flex: 1 },
  usuario: { color: COLORS.blanco, fontSize: 12.5, fontWeight: '600' },
  salir: { color: 'rgba(255,255,255,0.7)', fontSize: 11.5, marginTop: 2, textDecorationLine: 'underline' },
});
