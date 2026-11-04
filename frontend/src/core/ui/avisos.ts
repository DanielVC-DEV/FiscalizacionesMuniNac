import { Alert, Platform } from 'react-native';

// Avisos al usuario que funcionan en celular y en navegador. `Alert.alert` de
// React Native no hace nada en la web, así que ahí se usa el cuadro del navegador.

export function avisar(titulo: string, mensaje?: string) {
  if (Platform.OS === 'web') {
    window.alert(mensaje ? `${titulo}\n\n${mensaje}` : titulo);
    return;
  }
  Alert.alert(titulo, mensaje);
}

// Pide confirmación antes de una acción. Resuelve true si el usuario acepta.
export function confirmar(titulo: string, mensaje: string, textoAceptar = 'Confirmar'): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${titulo}\n\n${mensaje}`));
  }
  return new Promise((resolver) => {
    Alert.alert(
      titulo,
      mensaje,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolver(false) },
        { text: textoAceptar, onPress: () => resolver(true) },
      ],
      { cancelable: true, onDismiss: () => resolver(false) },
    );
  });
}
