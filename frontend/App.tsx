import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MenuScreen from './src/screens/MenuScreen';
import ResumenScreen from './src/screens/ResumenScreen';
import CrearTicketScreen from './src/screens/CrearTicketScreen';
import ContratosScreen from './src/screens/ContratosScreen';
import ContratoDetalleScreen from './src/screens/ContratoDetalleScreen';
import CrearContratoScreen from './src/screens/CrearContratoScreen';
import EmpresasScreen from './src/screens/EmpresasScreen';
import AreasScreen from './src/screens/AreasScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Menu" component={MenuScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Resumen" component={ResumenScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CrearTicket" component={CrearTicketScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Contratos" component={ContratosScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="ContratoDetalle"
            component={ContratoDetalleScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CrearContrato"
            component={CrearContratoScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Empresas" component={EmpresasScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Areas" component={AreasScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
