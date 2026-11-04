import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import MarcoWeb from './src/core/ui/MarcoWeb';

// Raíz de la aplicación: proveedores globales (área segura y navegación).
// Las pantallas viven en src/modules y se registran en src/navigation.
export default function App() {
  return (
    <SafeAreaProvider>
      <MarcoWeb>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </MarcoWeb>
    </SafeAreaProvider>
  );
}
