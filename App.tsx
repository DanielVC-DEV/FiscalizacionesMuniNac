import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MenuScreen from './src/screens/MenuScreen';
import ResumenScreen from './src/screens/ResumenScreen';
import CrearTicketScreen from './src/screens/CrearTicketScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="Resumen" component={ResumenScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CrearTicket" component={CrearTicketScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
