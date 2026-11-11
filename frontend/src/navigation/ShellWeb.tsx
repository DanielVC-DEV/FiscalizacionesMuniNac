import { ComponentType } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { COLORS } from '../core/theme/colors';
import BarraLateral from '../modules/menu/components/BarraLateral';
import { useOpcionesMenu } from '../modules/menu/opciones';

// Desde este ancho (sólo en la web) las pantallas llevan menú lateral.
const ANCHO_MINIMO_LATERAL = 900;

// Marco de la web: menú lateral izquierdo en todas las pantallas con sesión y,
// a la derecha, la pantalla a todo el ancho disponible. En el celular y en
// ventanas angostas devuelve la pantalla sin marco.
function ShellWeb({ navigation, route, children }: { navigation: any; route: any; children: React.ReactNode }) {
  const ancho = useWindowDimensions().width;
  const { principales, gestion } = useOpcionesMenu();
  if (Platform.OS !== 'web' || ancho < ANCHO_MINIMO_LATERAL) return <>{children}</>;

  const enlaces = [
    { titulo: 'Inicio', destino: 'Menu' },
    ...principales.filter((o) => o.destino !== 'Resumen').map((o) => ({ titulo: o.titulo, destino: o.destino })),
  ];
  return (
    <View style={styles.marco}>
      <BarraLateral
        principales={enlaces}
        gestion={gestion.map((o) => ({ titulo: o.titulo, destino: o.destino }))}
        onIr={(destino) => navigation.navigate(destino)}
        activo={route?.name === 'Resumen' ? 'Menu' : route?.name}
      />
      <View style={styles.contenido}>{children}</View>
    </View>
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
