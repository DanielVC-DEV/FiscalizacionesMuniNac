import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import MarcoWeb from './src/core/ui/MarcoWeb';
import ConsultaPublicaScreen from './src/modules/consulta/ConsultaPublicaScreen';

// En la web, /empresa/consulta/<token> es la página pública de consulta de un ticket
// (sólo lectura, sin sesión). Devuelve el token, o null si la dirección es otra.
function tokenDeConsultaPublica(): string | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const coincidencia = /\/consulta\/([A-Za-z0-9_-]+)\/?$/.exec(window.location.pathname);
  return coincidencia ? coincidencia[1] : null;
}

// Raíz de la aplicación: proveedores globales (área segura y navegación).
// Las pantallas viven en src/modules y se registran en src/navigation.
export default function App() {
  const tokenConsulta = tokenDeConsultaPublica();

  return (
    <SafeAreaProvider>
      <MarcoWeb>
        {tokenConsulta ? (
          <ConsultaPublicaScreen token={tokenConsulta} />
        ) : (
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        )}
      </MarcoWeb>
    </SafeAreaProvider>
  );
}
