/**
 * exportImport.js
 *
 * JSON export and import utilities for Moore and Mealy machines.
 */

import { validateImportedJSON } from './validation';

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a machine object to a formatted JSON string.
 */
export function exportMachine(machine) {
  // Strip internal fields used only by the UI
  const exportable = {};
  const fields = ['type', 'states', 'inputAlphabet', 'outputAlphabet', 'initialState', 'outputs', 'transitions'];
  for (const field of fields) {
    if (machine[field] !== undefined) {
      exportable[field] = machine[field];
    }
  }
  return JSON.stringify(exportable, null, 2);
}

/**
 * Triggers a browser download of the machine JSON file.
 */
export function downloadMachineJSON(machine, filename) {
  const json = exportMachine(machine);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${machine.type?.toLowerCase() ?? 'machine'}_machine.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPORT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parses a JSON string into a machine object and validates it.
 * @param {string} jsonString
 * @returns {{ machine: Object|null, errors: string[], valid: boolean }}
 */
export function importMachine(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    return {
      machine: null,
      errors: [`Invalid JSON format: ${e.message}`],
      valid: false,
    };
  }

  const { valid, errors } = validateImportedJSON(parsed);
  if (!valid) {
    return { machine: null, errors, valid: false };
  }

  return { machine: parsed, errors: [], valid: true };
}

/**
 * Reads a File object and returns a Promise with the parsed machine.
 */
export function importMachineFromFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(importMachine(e.target.result));
    };
    reader.onerror = () => {
      resolve({ machine: null, errors: ['Could not read the file. Please try again.'], valid: false });
    };
    reader.readAsText(file);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MACHINE PARSER (normalize/sanitize)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalizes a raw machine object to ensure all required fields are present.
 */
export function normalizeMachine(raw) {
  if (!raw) return null;
  return {
    type: raw.type || 'MOORE',
    states: Array.isArray(raw.states) ? raw.states.map(String) : [],
    inputAlphabet: Array.isArray(raw.inputAlphabet) ? raw.inputAlphabet.map(String) : [],
    outputAlphabet: Array.isArray(raw.outputAlphabet) ? raw.outputAlphabet.map(String) : [],
    initialState: raw.initialState ? String(raw.initialState) : '',
    outputs: raw.outputs || {},
    transitions: raw.transitions || {},
  };
}
