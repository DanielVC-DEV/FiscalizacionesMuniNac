import { ComponentType, useState } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { COLORS } from '../core/theme/colors';
import { ProveedorMenuMovil } from '../core/ui/menuMovil';
import BarraLateral from '../modules/menu/components/BarraLateral';
import MenuLateralMovil from '../modules/menu/components/MenuLateralMovil';
import { useOpcionesMenu } from '../modules/menu/opciones';

// Desde este ancho (sólo en la web) las pantallas llevan la barra lateral fija.
const ANCHO_MINIMO_LATERAL = 900;

// Marco de las pantallas con sesión.
// - Web de 900 px o más: barra lateral fija a la izquierda y la pantalla a la derecha.
// - Celular, tablet y ventanas angostas: la pantalla a todo el ancho y el mismo
//   menú como panel deslizable, que abre el botón de tres barras del encabezado
//   (ver modules/auth/components/SesionHeader.tsx).
function ShellWeb({ navigation, route, children }: { navigation: any; route: any; children: React.ReactNode }) {
  const ancho = useWindowDimensions().width;
  const { principales, gestion } = useOpcionesMenu();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const enlaces = [
    { titulo: 'Inicio', destino: 'Menu' },
    ...principales.filter((o) => o.destino !== 'Resumen').map((o) => ({ titulo: o.titulo, destino: o.destino })),
  ];
  const enlacesGestion = gestion.map((o) => ({ titulo: o.titulo, destino: o.destino }));
  const activo = route?.name === 'Resumen' ? 'Menu' : route?.name;

  if (Platform.OS === 'web' && ancho >= ANCHO_MINIMO_LATERAL) {
    return (
      <View style={styles.marco}>
        <BarraLateral
          principales={enlaces}
          gestion={enlacesGestion}
          onIr={(destino) => navigation.navigate(destino)}
          activo={activo}
        />
        <View style={styles.contenido}>{children}</View>
      </View>
    );
  }

  return (
    <ProveedorMenuMovil value={() => setMenuAbierto(true)}>
      {children}
      <MenuLateralMovil
        visible={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        principales={enlaces}
        gestion={enlacesGestion}
        onIr={(destino) => navigation.navigate(destino)}
        activo={activo}
      />
    </ProveedorMenuMovil>
  );
}

// Envuelve una pantalla registrada en el navegador con ShellWeb. Se llama una
// vez por pantalla, a nivel de módulo, para que React no recree el componente.
export function conShellWeb(Pantalla: ComponentType<any>): ComponentType<any> {
  function Envuelta(props: any) {
    return (
      <ShellWeb navigation={props.navigation} route={props.route}>
        <Pantalla {...props} />
      </ShellWeb>
    );
  }
  Envuelta.displayName = `ShellWeb(${Pantalla.displayName ?? Pantalla.name ?? 'Pantalla'})`;
  return Envuelta;
}

const styles = StyleSheet.create({
  marco: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.fondo },
  contenido: { flex: 1 },
});
