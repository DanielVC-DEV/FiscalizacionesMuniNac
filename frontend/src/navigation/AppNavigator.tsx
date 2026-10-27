import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MenuScreen from '../modules/menu/MenuScreen';
import ResumenScreen from '../modules/resumen/ResumenScreen';
import CrearTicketScreen from '../modules/tickets/CrearTicketScreen';
import ContratosScreen from '../modules/contratos/ContratosScreen';
import ContratoDetalleScreen from '../modules/contratos/ContratoDetalleScreen';
import CrearContratoScreen from '../modules/contratos/CrearContratoScreen';
import EmpresasScreen from '../modules/empresas/EmpresasScreen';
import AreasScreen from '../modules/areas/AreasScreen';
import SupervisoresScreen from '../modules/supervisores/SupervisoresScreen';
import LoginScreen from '../modules/auth/LoginScreen';
import { esAdministrador, useSesion } from '../modules/auth/store';

// Único lugar donde se registran las pantallas. Los nombres de ruta
// ("Menu", "Resumen", ...) son los que usan navigation.navigate(...).
const Stack = createNativeStackNavigator();

// Sin sesión la app arranca en Login. Al iniciar sesión, el grupo
// cambia solo y se muestran las pantallas de la aplicación. Las pantallas
// de administración sólo se registran para el rol admin.
export default function AppNavigator() {
  const sesion = useSesion();
  const esAdmin = esAdministrador(sesion?.usuario);

  return (
    <Stack.Navigator>
      {sesion ? (
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="Resumen" component={ResumenScreen} />
          <Stack.Screen name="CrearTicket" component={CrearTicketScreen} />
          <Stack.Screen name="Contratos" component={ContratosScreen} />
          <Stack.Screen name="ContratoDetalle" component={ContratoDetalleScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Group>
      )}

      {sesion && esAdmin ? (
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="CrearContrato" component={CrearContratoScreen} />
          <Stack.Screen name="Empresas" component={EmpresasScreen} />
          <Stack.Screen name="Areas" component={AreasScreen} />
          <Stack.Screen name="Supervisores" component={SupervisoresScreen} />
        </Stack.Group>
      ) : null}
    </Stack.Navigator>
  );
}
