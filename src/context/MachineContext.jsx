import { createContext, useContext, useReducer, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────────────────────────────────────
const initialState = {
  // Dark mode
  darkMode: localStorage.getItem('darkMode') === 'true',

  // Current machines being edited/viewed
  mooreMachine: null,
  mealyMachine: null,

  // Converted machines
  convertedMachine: null,  // result of conversion
  conversionDirection: null, // 'MOORE_TO_MEALY' | 'MEALY_TO_MOORE'

  // Notification
  notification: null, // { type: 'success'|'error'|'info', message: string }
};

// ─────────────────────────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_DARK_MODE':
      return { ...state, darkMode: action.payload };

    case 'SET_MOORE_MACHINE':
      return { ...state, mooreMachine: action.payload };

    case 'SET_MEALY_MACHINE':
      return { ...state, mealyMachine: action.payload };

    case 'SET_CONVERTED_MACHINE':
      return {
        ...state,
        convertedMachine: action.payload.machine,
        conversionDirection: action.payload.direction,
      };

    case 'CLEAR_CONVERSION':
      return { ...state, convertedMachine: null, conversionDirection: null };

    case 'SET_NOTIFICATION':
      return { ...state, notification: action.payload };

    case 'CLEAR_NOTIFICATION':
      return { ...state, notification: null };

    case 'RESET_ALL':
      return {
        ...initialState,
        darkMode: state.darkMode, // preserve dark mode
      };

    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────
const MachineContext = createContext(null);

export function MachineProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Persist dark mode
  useEffect(() => {
    localStorage.setItem('darkMode', String(state.darkMode));
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  // Auto-dismiss notifications after 4s
  useEffect(() => {
    if (state.notification) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_NOTIFICATION' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state.notification]);

  const actions = {
    setDarkMode: (val) => dispatch({ type: 'SET_DARK_MODE', payload: val }),
    setMooreMachine: (m) => dispatch({ type: 'SET_MOORE_MACHINE', payload: m }),
    setMealyMachine: (m) => dispatch({ type: 'SET_MEALY_MACHINE', payload: m }),
    setConvertedMachine: (machine, direction) =>
      dispatch({ type: 'SET_CONVERTED_MACHINE', payload: { machine, direction } }),
    clearConversion: () => dispatch({ type: 'CLEAR_CONVERSION' }),
    notify: (type, message) => dispatch({ type: 'SET_NOTIFICATION', payload: { type, message } }),
    clearNotification: () => dispatch({ type: 'CLEAR_NOTIFICATION' }),
    resetAll: () => dispatch({ type: 'RESET_ALL' }),
  };

  return (
    <MachineContext.Provider value={{ state, actions }}>
      {children}
    </MachineContext.Provider>
  );
}

export function useMachine() {
  const ctx = useContext(MachineContext);
  if (!ctx) throw new Error('useMachine must be used within MachineProvider');
  return ctx;
}
