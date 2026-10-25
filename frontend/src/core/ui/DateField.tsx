import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { MESES, diasEnMes } from '../utils/fechas';
import { COLORS, RADIOS } from '../theme/colors';

interface Props {
  label: string;
  requerido?: boolean;
  // Valor como "dd/mm/aaaa", o '' si todavía no está completo.
  value: string;
  onChange: (value: string) => void;
  error?: string;
  anioDesde?: number;
  anioHasta?: number;
}

type Campo = 'dia' | 'mes' | 'anio' | null;

function parsear(value: string) {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  return {
    dia: partes ? Number(partes[1]) : null,
    mes: partes ? Number(partes[2]) : null,
    anio: partes ? Number(partes[3]) : null,
  };
}

export default function DateField({ label, requerido, value, onChange, error, anioDesde, anioHasta }: Props) {
  // OJO: dia/mes/anio se guardan como estado propio de este campo (no se
  // recalculan desde `value` en cada render). Si se hiciera así, al elegir
  // solo el día (sin mes ni año todavía) el valor completo seguiría
  // incompleto, onChange('') borraría todo, y en el siguiente render el
  // día elegido se "olvidaría". Por eso cada parte se recuerda acá hasta
  // que las tres estén listas.
  const inicial = parsear(value);
  const [dia, setDia] = useState<number | null>(inicial.dia);
  const [mes, setMes] = useState<number | null>(inicial.mes);
  const [anio, setAnio] = useState<number | null>(inicial.anio);

  const [abierto, setAbierto] = useState<Campo>(null);

  const anioMin = anioDesde ?? new Date().getFullYear() - 5;
  const anioMax = anioHasta ?? new Date().getFullYear() + 10;
  const anios = Array.from({ length: anioMax - anioMin + 1 }, (_, i) => anioMin + i);
  const meses = MESES.map((_, i) => i + 1);

  const maxDia = mes ? diasEnMes(mes, anio ?? new Date().getFullYear()) : 31;
  const dias = Array.from({ length: maxDia }, (_, i) => i + 1);

  function elegir(item: number) {
    let nuevoDia = dia;
    let nuevoMes = mes;
    let nuevoAnio = anio;
    if (abierto === 'dia') nuevoDia = item;
    if (abierto === 'mes') nuevoMes = item;
    if (abierto === 'anio') nuevoAnio = item;

    if (nuevoDia && nuevoMes) {
      const maximo = diasEnMes(nuevoMes, nuevoAnio ?? new Date().getFullYear());
      if (nuevoDia > maximo) nuevoDia = maximo;
    }

    setDia(nuevoDia);
    setMes(nuevoMes);
    setAnio(nuevoAnio);

    if (nuevoDia && nuevoMes && nuevoAnio) {
      onChange(`${String(nuevoDia).padStart(2, '0')}/${String(nuevoMes).padStart(2, '0')}/${nuevoAnio}`);
    } else {
      onChange('');
    }
    setAbierto(null);
  }

  const datosSheet = abierto === 'dia' ? dias : abierto === 'mes' ? meses : anios;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {requerido && <Text style={styles.req}> *</Text>}
      </Text>
      <View style={styles.fila}>
        <Selector
          flex={0.8}
          texto={dia ? String(dia).padStart(2, '0') : 'Día'}
          relleno={!dia}
          onPress={() => setAbierto('dia')}
        />
        <Selector
          flex={1.5}
          texto={mes ? MESES[mes - 1].slice(0, 3) : 'Mes'}
          relleno={!mes}
          onPress={() => setAbierto('mes')}
        />
        <Selector
          flex={1.1}
          texto={anio ? String(anio) : 'Año'}
          relleno={!anio}
          onPress={() => setAbierto('anio')}
        />
      </View>
      {!!error && <Text style={styles.errorTexto}>{error}</Text>}

      <Modal visible={abierto !== null} transparent animationType="fade" onRequestClose={() => setAbierto(null)}>
        <Pressable style={styles.overlay} onPress={() => setAbierto(null)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>
              {abierto === 'dia' ? 'Día' : abierto === 'mes' ? 'Mes' : 'Año'}
            </Text>
            <FlatList
              data={datosSheet}
              keyExtractor={(item) => String(item)}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.option} onPress={() => elegir(item)}>
                  <Text style={styles.optionText}>
                    {abierto === 'mes' ? MESES[item - 1] : String(item).padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function Selector({
  texto,
  relleno,
  onPress,
  flex,
}: {
  texto: string;
  relleno: boolean;
  onPress: () => void;
  flex: number;
}) {
  return (
    <TouchableOpacity style={[styles.selector, { flex }]} onPress={onPress}>
      <Text style={relleno ? styles.placeholderText : styles.valueText} numberOfLines={1}>
        {texto}
      </Text>
      <Text style={styles.chevron}>▾</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 12 },
  label: { fontSize: 12, color: COLORS.textoPrimario, marginBottom: 4, fontWeight: '600' },
  req: { color: COLORS.rojo },
  fila: { flexDirection: 'row', gap: 6 },
  selector: {
    height: 46,
    borderRadius: RADIOS.md,
    borderWidth: 1.5,
    borderColor: COLORS.borde,
    backgroundColor: COLORS.superficie,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholderText: { color: COLORS.textoTenue, fontSize: 12.5 },
  valueText: { color: COLORS.textoPrimario, fontSize: 12.5 },
  chevron: { color: COLORS.azul, fontSize: 11, fontWeight: '700' },
  errorTexto: { color: COLORS.rojo, fontSize: 11, marginTop: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(5,15,25,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.superficie,
    borderTopLeftRadius: RADIOS.lg,
    borderTopRightRadius: RADIOS.lg,
    maxHeight: '60%',
    padding: 16,
  },
  sheetTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8, color: COLORS.azul },
  option: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.bordeSuave },
  optionText: { fontSize: 14, color: COLORS.textoPrimario },
});
