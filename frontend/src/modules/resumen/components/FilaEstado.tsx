import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Card from '../../../core/ui/Card';
import EstadoBadge from '../../../core/ui/EstadoBadge';
import { COLORS, COLOR_ESTADO, RADIOS } from '../../../core/theme/colors';
import { esFechaPasada } from '../../../core/utils/fechas';
import { Ticket, EstadoTicket } from '../../tickets/types';

interface Props {
  etiqueta: string;
  estadoClave?: EstadoTicket;
  tickets: Ticket[];
}

// Cada fila es un acordeón: muestra el nombre del estado y el total, y al
// tocarla se despliega la lista de tickets de ese estado.
export default function FilaEstado({ etiqueta, estadoClave, tickets }: Props) {
  const [abierto, setAbierto] = useState(false);
  const color = estadoClave ? COLOR_ESTADO[estadoClave].color : COLORS.azul;

  return (
    <View style={{ marginBottom: 10 }}>
      <TouchableOpacity style={styles.barra} onPress={() => setAbierto((v) => !v)} activeOpacity={0.75}>
        <View style={styles.barraIzquierda}>
          <View style={[styles.barraMarca, { backgroundColor: color }]} />
          <Text style={styles.barraTexto}>{etiqueta}</Text>
        </View>
        <View style={styles.barraDerecha}>
          <Text style={styles.barraNumero}>{tickets.length}</Text>
          <Text style={styles.barraChevron}>{abierto ? '▴' : '▾'}</Text>
        </View>
      </TouchableOpacity>
      {abierto && (
        <View style={styles.desplegable}>
          {tickets.length === 0 ? (
            <Text style={styles.sinTickets}>No hay tickets en este estado.</Text>
          ) : (
            tickets.map((t) => {
              const vencido =
                esFechaPasada(t.fechaVencimiento) && t.estado !== 'SUBSANADO_CONFORME' && t.estado !== 'CERRADO';
              return (
                <Card key={t.id} style={[styles.ticketBox, vencido && styles.ticketBoxVencido]}>
                  <View style={styles.ticketFila}>
                    <Text style={styles.ticketTexto} numberOfLines={1}>
                      {t.contrato}
                    </Text>
                    {vencido ? (
                      <EstadoBadge estado="VENCIDO" tamano="sm" />
                    ) : (
                      <EstadoBadge estado={t.estado} tamano="sm" />
                    )}
                  </View>
                  <Text style={styles.ticketSubtexto} numberOfLines={2}>
                    {t.descripcion}
                  </Text>
                  <Text style={styles.ticketSubtexto}>
                    Creado: {t.fechaCreacion} · Vence: {t.fechaVencimiento}
                  </Text>
                </Card>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    backgroundColor: COLORS.superficie,
    borderWidth: 1,
    borderColor: COLORS.bordeSuave,
    borderRadius: RADIOS.md,
    height: 46,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barraIzquierda: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barraMarca: { width: 4, height: 18, borderRadius: 2 },
  barraTexto: { color: COLORS.textoPrimario, fontSize: 13, fontWeight: '700' },
  barraDerecha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barraNumero: { color: COLORS.textoSecundario, fontSize: 13, fontWeight: '700' },
  barraChevron: { color: COLORS.azul, fontSize: 12 },
  desplegable: { marginTop: 8, marginBottom: 10, paddingHorizontal: 2, gap: 8 },
  sinTickets: { color: COLORS.textoSecundario, fontSize: 12, fontStyle: 'italic' },
  ticketBox: {},
  ticketBoxVencido: {
    backgroundColor: COLOR_ESTADO.VENCIDO.suave,
    borderColor: COLOR_ESTADO.VENCIDO.color,
  },
  ticketFila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  ticketTexto: { fontSize: 13, color: COLORS.textoPrimario, fontWeight: '700', flex: 1 },
  ticketSubtexto: { fontSize: 11, color: COLORS.textoSecundario, marginTop: 4 },
});
