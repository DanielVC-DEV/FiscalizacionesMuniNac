import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { avisar } from '../../core/ui/avisos';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../auth/components/SesionHeader';
import TopBar from '../../core/ui/TopBar';
import Card from '../../core/ui/Card';
import Button from '../../core/ui/Button';
import TarjetaSeccion, { FilaCampos } from '../../core/ui/TarjetaSeccion';
import SelectField from '../../core/ui/SelectField';
import { COLORS, RADIOS } from '../../core/theme/colors';
import { empresasApi, EmpresaApi } from './api';
import { areasApi, AreaApi } from '../areas/api';
import { normalizarRut } from '../../core/utils/rut';
import { CONTENIDO_WEB } from '../../core/ui/anchoWeb';

export default function EmpresasScreen({ navigation }: any) {
  const [empresas, setEmpresas] = useState<EmpresaApi[]>([]);
  const [areas, setAreas] = useState<AreaApi[]>([]);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [razonSocial, setRazonSocial] = useState('');
  const [rut, setRut] = useState('');
  const [areaOpcion, setAreaOpcion] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      const [empresasCargadas, areasCargadas] = await Promise.all([
        empresasApi.listar(),
        areasApi.listar(),
      ]);
      setEmpresas(empresasCargadas);
      setAreas(areasCargadas);
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

  async function crearEmpresa() {
    const area = areas.find((item) => item.nombre === areaOpcion);
    if (!razonSocial.trim() || !rut.trim() || !area) {
      setErrorFormulario('Completa la razón social, el RUT y el área.');
      return;
    }
    if (razonSocial.trim().length > 200) {
      setErrorFormulario('La razón social no puede superar los 200 caracteres.');
      return;
    }
    const rutFormateado = normalizarRut(rut);
    if (!rutFormateado) {
      setErrorFormulario('El RUT no es válido. Revisa el número y el dígito verificador.');
      return;
    }

    setGuardando(true);
    setErrorFormulario(null);
    try {
      await empresasApi.crear({
        razon_social: razonSocial.trim(),
        rut: rutFormateado,
        id_area: area.id_area,
      });
      setRazonSocial('');
      setRut('');
      setAreaOpcion(null);
      setMostrarFormulario(false);
      await cargarDatos();
      avisar('Empresa creada', 'La empresa quedó guardada en el servidor.');
    } catch (error) {
      setErrorFormulario((error as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <Header />
      <TopBar title="Empresas" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={[styles.contenido, CONTENIDO_WEB]} keyboardShouldPersistTaps="handled">
        {!!errorCarga && <Text style={styles.nota}>No se pudo cargar el servidor: {errorCarga}</Text>}

        <Button
          label={mostrarFormulario ? 'Cancelar alta' : '+ Agregar empresa'}
          variante={mostrarFormulario ? 'secundario' : 'primario'}
          onPress={() => {
            setMostrarFormulario((visible) => !visible);
            setErrorFormulario(null);
          }}
          style={styles.botonAlta}
        />

        {mostrarFormulario && (
          <TarjetaSeccion titulo="Nueva empresa" descripcion="Datos de la empresa contratista.">
            <FilaCampos>
            <View>
            <Text style={styles.label}>Razón social *</Text>
            <TextInput
              style={styles.input}
              value={razonSocial}
              onChangeText={setRazonSocial}
              placeholder="Nombre de la empresa"
              placeholderTextColor={COLORS.textoTenue}
            />
            </View>
            <View>
            <Text style={styles.label}>RUT *</Text>
            <TextInput
              style={styles.input}
              value={rut}
              onChangeText={setRut}
              onBlur={() => {
                // Si el RUT es válido, lo deja con formato 12.345.678-5 al salir del campo.
                const formateado = normalizarRut(rut);
                if (formateado) setRut(formateado);
              }}
              placeholder="Ej: 12.345.678-5"
              placeholderTextColor={COLORS.textoTenue}
              autoCapitalize="characters"
            />
            </View>
            </FilaCampos>
            <SelectField
              label="Área"
              requerido
              placeholder="Seleccionar área"
              value={areaOpcion}
              options={areas.map((area) => area.nombre)}
              onChange={setAreaOpcion}
              mensajeVacio="No hay áreas. Registra una en el módulo Áreas."
            />
            {!areas.length && (
              <Button
                label="Ir al módulo Áreas"
                variante="suave"
                onPress={() => navigation.navigate('Areas')}
                style={styles.botonAreas}
              />
            )}
            {!!errorFormulario && <Text style={styles.error}>{errorFormulario}</Text>}
            <Button label="Guardar empresa" onPress={crearEmpresa} cargando={guardando} style={styles.botonGuardar} />
          </TarjetaSeccion>
        )}

        <View style={styles.lista}>
          {empresas.map((empresa) => (
            <Card key={empresa.id_empresa} style={styles.card}>
              <Text style={styles.cardNombre}>{empresa.razon_social}</Text>
              <Text style={styles.cardRut}>RUT {empresa.rut}</Text>
              {empresa.area_nombre && <Text style={styles.cardRut}>Área: {empresa.area_nombre}</Text>}
            </Card>
          ))}
        </View>
        {!errorCarga && empresas.length === 0 && <Text style={styles.nota}>No hay empresas registradas.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.fondo },
  contenido: { padding: 20, paddingBottom: 24 },
  nota: { color: COLORS.textoSecundario, fontSize: 11, fontStyle: 'italic', marginBottom: 16 },
  lista: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { flexGrow: 1, flexBasis: 280 },
  botonGuardar: { alignSelf: 'flex-end', minWidth: 200 },
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
  botonAlta: { alignSelf: 'flex-end', minWidth: 200, marginBottom: 12 },
  botonAreas: { marginBottom: 10 },
  cardNombre: { fontSize: 13.5, fontWeight: '700', color: COLORS.textoPrimario, marginBottom: 4 },
  cardRut: { fontSize: 12, color: COLORS.textoSecundario, marginTop: 2 },
});
