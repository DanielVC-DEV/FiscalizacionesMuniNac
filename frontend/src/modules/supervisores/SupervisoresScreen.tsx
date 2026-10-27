import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../auth/components/SesionHeader';
import TopBar from '../../core/ui/TopBar';
import Card from '../../core/ui/Card';
import Button from '../../core/ui/Button';
import SelectField from '../../core/ui/SelectField';
import { COLORS, RADIOS } from '../../core/theme/colors';
import { supervisoresApi, SupervisorApi } from './api';
import { empresasApi, EmpresaApi } from '../empresas/api';

export default function SupervisoresScreen({ navigation }: any) {
  const [supervisores, setSupervisores] = useState<SupervisorApi[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaApi[]>([]);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [empresaOpcion, setEmpresaOpcion] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      const [supervisoresCargados, empresasCargadas] = await Promise.all([
        supervisoresApi.listar(),
        empresasApi.listar(),
      ]);
      setSupervisores(supervisoresCargados);
      setEmpresas(empresasCargadas);
      setErrorCarga(null);
    } catch (error) {
      setErrorCarga((error as Error).message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [cargarDatos])
  );

  async function crearSupervisor() {
    const empresa = empresas.find((item) => item.razon_social === empresaOpcion);
    if (!nombre.trim() || !email.trim() || !empresa) {
      setErrorFormulario('Completa el nombre, el correo y la empresa.');
      return;
    }

    setGuardando(true);
    setErrorFormulario(null);
    try {
      await supervisoresApi.crear({
        nombre: nombre.trim(),
        email: email.trim(),
        id_empresa: empresa.id_empresa,
      });
      setNombre('');
      setEmail('');
      setEmpresaOpcion(null);
      setMostrarFormulario(false);
      await cargarDatos();
      Alert.alert('Supervisor creado', 'Ya aparece para asignarlo a contratos y tickets.');
    } catch (error) {
      setErrorFormulario((error as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />
      <TopBar title="Supervisores" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        {!!errorCarga && <Text style={styles.nota}>No se pudo cargar el servidor: {errorCarga}</Text>}

        <Button
          label={mostrarFormulario ? 'Cancelar alta' : '+ Agregar supervisor'}
          variante={mostrarFormulario ? 'secundario' : 'primario'}
          onPress={() => {
            setMostrarFormulario((visible) => !visible);
            setErrorFormulario(null);
          }}
          style={styles.botonAlta}
        />

        {mostrarFormulario && (
          <Card style={styles.formulario}>
            <Text style={styles.tituloFormulario}>Nuevo supervisor</Text>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre completo"
              placeholderTextColor={COLORS.textoTenue}
            />
            <Text style={styles.label}>Correo *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="correo@empresa.cl"
              placeholderTextColor={COLORS.textoTenue}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <SelectField
              label="Empresa"
              requerido
              placeholder="Seleccionar empresa"
              value={empresaOpcion}
              options={empresas.map((empresa) => empresa.razon_social)}
              onChange={setEmpresaOpcion}
              mensajeVacio="No hay empresas. Registra una en el módulo Empresas."
            />
            {!!errorFormulario && <Text style={styles.error}>{errorFormulario}</Text>}
            <Button label="Guardar supervisor" onPress={crearSupervisor} cargando={guardando} />
          </Card>
        )}

        <View style={styles.lista}>
          {supervisores.map((supervisor) => (
            <Card key={supervisor.id_usuario} style={styles.card}>
              <Text style={styles.cardNombre}>{supervisor.nombre}</Text>
              <Text style={styles.cardDato}>{supervisor.email}</Text>
              {supervisor.empresa_nombre && (
                <Text style={styles.cardDato}>Empresa: {supervisor.empresa_nombre}</Text>
              )}
            </Card>
          ))}
        </View>
        {!errorCarga && supervisores.length === 0 && (
          <Text style={styles.nota}>No hay supervisores registrados.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.fondo },
  contenido: { padding: 16, paddingBottom: 24 },
  nota: { color: COLORS.textoSecundario, fontSize: 11, fontStyle: 'italic', marginBottom: 16 },
  lista: { gap: 10 },
  card: { marginBottom: 10 },
  formulario: { marginVertical: 12 },
  tituloFormulario: { fontSize: 14, fontWeight: '700', color: COLORS.textoPrimario, marginBottom: 8 },
  label: { fontSize: 12, color: COLORS.textoPrimario, marginBottom: 4, fontWeight: '600' },
  input: {
    height: 46,
    borderRadius: RADIOS.md,
    borderWidth: 1.5,
    borderColor: COLORS.borde,
    backgroundColor: COLORS.superficie,
    paddingHorizontal: 12,
    fontSize: 13,
    color: COLORS.textoPrimario,
    marginBottom: 8,
  },
  error: { color: COLORS.rojo, fontSize: 11, marginBottom: 8 },
  botonAlta: { marginBottom: 4 },
  cardNombre: { fontSize: 13.5, fontWeight: '700', color: COLORS.textoPrimario, marginBottom: 4 },
  cardDato: { fontSize: 12, color: COLORS.textoSecundario, marginTop: 2 },
});
