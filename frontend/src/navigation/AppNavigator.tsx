import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MenuScreen from '../modules/menu/MenuScreen';
import ResumenScreen from '../modules/resumen/ResumenScreen';
import CrearTicketScreen from '../modules/tickets/CrearTicketScreen';
import ContratosScreen from '../modules/contratos/ContratosScreen';
import ContratoDetalleScreen from '../modules/contratos/ContratoDetalleScreen';
import CrearContratoScreen from '../modules/contratos/CrearContratoScreen';
import EmpresasScreen from '../modules/empresas/EmpresasScreen';
import AreasScreen from '../modules/areas/AreasScreen';

// Único lugar donde se registran las pantallas. Los nombres de ruta
// ("Menu", "Resumen", ...) son los que usan navigation.navigate(...).
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Menu" component={MenuScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Resumen" component={ResumenScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CrearTicket" component={CrearTicketScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Contratos" component={ContratosScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ContratoDetalle" component={ContratoDetalleScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CrearContrato" component={CrearContratoScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Empresas" component={EmpresasScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Areas" component={AreasScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
