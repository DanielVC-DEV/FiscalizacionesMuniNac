import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MenuScreen from '../modules/menu/MenuScreen';
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
import LoginScreen from '../modules/auth/LoginScreen';
import { esAdministrador, esMunicipal, useSesion } from '../modules/auth/store';

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
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="Resumen" component={ResumenScreen} />
          <Stack.Screen name="TicketDetalle" component={TicketDetalleScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Group>
      )}

      {sesion && municipal ? (
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="CrearTicket" component={CrearTicketScreen} />
          <Stack.Screen name="Indicadores" component={IndicadoresScreen} />
          <Stack.Screen name="Contratos" component={ContratosScreen} />
          <Stack.Screen name="ContratoDetalle" component={ContratoDetalleScreen} />
        </Stack.Group>
      ) : null}

      {sesion && esAdmin ? (
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="CrearContrato" component={CrearContratoScreen} />
          <Stack.Screen name="Empresas" component={EmpresasScreen} />
          <Stack.Screen name="Areas" component={AreasScreen} />
          <Stack.Screen name="Supervisores" component={SupervisoresScreen} />
          <Stack.Screen name="Destinatarios" component={DestinatariosScreen} />
        </Stack.Group>
      ) : null}
    </Stack.Navigator>
  );
}
