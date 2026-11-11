import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MenuScreen from '../modules/menu/MenuScreen';
import ResumenPanel from '../modules/resumen/components/ResumenPanel';
import ResumenScreen from '../modules/resumen/ResumenScreen';
import IndicadoresScreen from '../modules/reportes/IndicadoresScreen';
import CrearTicketScreen from '../modules/tickets/CrearTicketScreen';
import TicketDetalleScreen from '../modules/tickets/TicketDetalleScreen';
import ContratosScreen from '../modules/contratos/ContratosScreen';
import ContratoDetalleScreen from '../modules/contratos/ContratoDetalleScreen';
import CrearContratoScreen from '../modules/contratos/CrearContratoScreen';
import EmpresasScreen from '../modules/empresas/EmpresasScreen';
import AreasScreen from '../modules/areas/AreasScreen';
import DestinatariosScreen from '../modules/notificaciones/DestinatariosScreen';
import SupervisoresScreen from '../modules/supervisores/SupervisoresScreen';
import { conShellWeb } from './ShellWeb';
import LoginScreen from '../modules/auth/LoginScreen';
import { esAdministrador, esMunicipal, useSesion } from '../modules/auth/store';

// En la web, cada pantalla con sesión lleva el menú lateral a la izquierda (ver ShellWeb).
const MenuWeb = conShellWeb((props: any) => (
  <MenuScreen {...props} panel={<ResumenPanel navigation={props.navigation} relleno={40} />} />
));
const ResumenWeb = conShellWeb(ResumenScreen);
const TicketDetalleWeb = conShellWeb(TicketDetalleScreen);
const CrearTicketWeb = conShellWeb(CrearTicketScreen);
const IndicadoresWeb = conShellWeb(IndicadoresScreen);
const ContratosWeb = conShellWeb(ContratosScreen);
const ContratoDetalleWeb = conShellWeb(ContratoDetalleScreen);
const CrearContratoWeb = conShellWeb(CrearContratoScreen);
const EmpresasWeb = conShellWeb(EmpresasScreen);
const AreasWeb = conShellWeb(AreasScreen);
const SupervisoresWeb = conShellWeb(SupervisoresScreen);
const DestinatariosWeb = conShellWeb(DestinatariosScreen);

// Único lugar donde se registran las pantallas. Los nombres de ruta
// ("Menu", "Resumen", ...) son los que usan navigation.navigate(...).
const Stack = createNativeStackNavigator();

// Sin sesión la app arranca en Login. Al iniciar sesión, el grupo
// cambia solo y se muestran las pantallas de la aplicación. Las pantallas
// de administración sólo se registran para el rol admin.
export default function AppNavigator() {
  const sesion = useSesion();
  const esAdmin = esAdministrador(sesion?.usuario);
  const municipal = esMunicipal(sesion?.usuario);

  return (
    <Stack.Navigator>
      {sesion ? (
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Menu" component={MenuWeb} />
          <Stack.Screen name="Resumen" component={ResumenWeb} />
          <Stack.Screen name="TicketDetalle" component={TicketDetalleWeb} />
        </Stack.Group>
      ) : (
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Group>
      )}

      {sesion && municipal ? (
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="CrearTicket" component={CrearTicketWeb} />
          <Stack.Screen name="Indicadores" component={IndicadoresWeb} />
          <Stack.Screen name="Contratos" component={ContratosWeb} />
          <Stack.Screen name="ContratoDetalle" component={ContratoDetalleWeb} />
        </Stack.Group>
      ) : null}

      {sesion && esAdmin ? (
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="CrearContrato" component={CrearContratoWeb} />
          <Stack.Screen name="Empresas" component={EmpresasWeb} />
          <Stack.Screen name="Areas" component={AreasWeb} />
          <Stack.Screen name="Supervisores" component={SupervisoresWeb} />
          <Stack.Screen name="Destinatarios" component={DestinatariosWeb} />
        </Stack.Group>
      ) : null}
    </Stack.Navigator>
  );
}
