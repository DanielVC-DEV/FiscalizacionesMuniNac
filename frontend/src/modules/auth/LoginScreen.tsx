import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../core/ui/Button';
import { COLORS, RADIOS } from '../../core/theme/colors';
import { authApi } from './api';
import CampoTexto from './components/CampoTexto';
import PantallaAcceso from './components/PantallaAcceso';
import { iniciarSesion } from './store';

// Primera pantalla de la app: la sesión se inicia contra PostgreSQL vía /api/auth/login.
// Al tener éxito, la navegación cambia sola al menú principal (ver AppNavigator).
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function ingresar() {
    if (cargando) return;
    if (!email.trim() || !password) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }

    setError(null);
    setCargando(true);
    try {
      const respuesta = await authApi.login(email.trim(), password);
      iniciarSesion(respuesta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible iniciar sesión.');
      setCargando(false);
    }
  }

  return (
    <PantallaAcceso titulo="Iniciar sesión" subtitulo="Ingresa con tu cuenta institucional.">
      {error && (
        <View style={styles.error} accessibilityRole="alert">
          <Text style={styles.errorTexto}>{error}</Text>
        </View>
      )}

      <CampoTexto
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        placeholder="nombre@municipalidad.cl"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        editable={!cargando}
      />

      <CampoTexto
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        placeholder="Tu contraseña"
        esPassword
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="password"
        textContentType="password"
        editable={!cargando}
        onSubmitEditing={ingresar}
        returnKeyType="go"
      />

      <Button label="Ingresar" onPress={ingresar} cargando={cargando} style={styles.boton} />
    </PantallaAcceso>
  );
}

const styles = StyleSheet.create({
  error: {
    backgroundColor: COLORS.rojoSuave,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.rojo,
    borderRadius: RADIOS.sm,
    padding: 10,
  },
  errorTexto: { color: COLORS.rojoOscuro, fontSize: 13, fontWeight: '600' },
  boton: { marginTop: 4 },
});
