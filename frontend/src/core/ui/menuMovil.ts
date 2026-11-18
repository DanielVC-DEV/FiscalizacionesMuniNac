import { createContext, useContext } from 'react';

// Función que abre el menú lateral deslizable del celular. La entrega
// navigation/ShellWeb.tsx a todas las pantallas con sesión; vale null cuando
// no hay menú de ese tipo (por ejemplo en la web ancha, que ya tiene barra fija).
const MenuMovilContext = createContext<(() => void) | null>(null);

export const ProveedorMenuMovil = MenuMovilContext.Provider;

export function useAbrirMenuMovil(): (() => void) | null {
  return useContext(MenuMovilContext);
}
