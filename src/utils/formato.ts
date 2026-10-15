// Formato de montos en pesos chilenos, sin depender de Intl (para evitar
// problemas de soporte en el motor JS de React Native).
export function formatearMonto(valor: string): string {
  const limpio = valor.replace(/[^0-9]/g, '');
  if (!limpio) return '';
  const conPuntos = limpio.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$ ${conPuntos}`;
}
