/**
 * validation.js
 *
 * Validation functions for Moore and Mealy machines.
 * Returns { valid: boolean, errors: string[] }
 */

// ─────────────────────────────────────────────────────────────────────────────
// MOORE MACHINE VALIDATION
// ─────────────────────────────────────────────────────────────────────────────
export function validateMoore(machine) {
  const errors = [];
  if (!machine) return { valid: false, errors: ['No machine data provided.'] };

  const { states = [], inputAlphabet = [], outputAlphabet = [], initialState, outputs = {}, transitions = {} } = machine;

  // States
  if (states.length === 0) errors.push('Your machine must have at least one state.');
  const uniqueStates = new Set(states);
  if (uniqueStates.size !== states.length) errors.push('Duplicate state names detected. Each state must have a unique name.');

  // Alphabets
  if (inputAlphabet.length === 0) errors.push('Your machine must have at least one input symbol.');
  const uniqueInput = new Set(inputAlphabet);
  if (uniqueInput.size !== inputAlphabet.length) errors.push('Duplicate input alphabet symbols detected.');
  if (outputAlphabet.length === 0) errors.push('Your machine must have at least one output symbol.');
  const uniqueOutput = new Set(outputAlphabet);
  if (uniqueOutput.size !== outputAlphabet.length) errors.push('Duplicate output alphabet symbols detected.');

  // Initial state
  if (!initialState) {
    errors.push('No initial state selected. Please choose one state as the initial state.');
  } else if (!uniqueStates.has(initialState)) {
    errors.push(`Initial state "${initialState}" is not in the states list.`);
  }

  // State outputs
  for (const state of states) {
    const out = outputs[state];
    if (out === undefined || out === null || out === '') {
      errors.push(`Your Moore machine is missing an output for state "${state}". Please assign exactly one output to every state.`);
    } else if (!outputAlphabet.includes(out)) {
      errors.push(`State "${state}" has output "${out}" which is not in the output alphabet.`);
    }
  }

  // Transitions
  for (const state of states) {
    for (const symbol of inputAlphabet) {
      const dest = transitions[state]?.[symbol];
      if (dest === undefined || dest === null || dest === '') {
        errors.push(`The machine cannot be converted yet because state "${state}" has no transition defined for input symbol "${symbol}".`);
      } else if (!uniqueStates.has(dest)) {
        errors.push(`Transition from "${state}" on input "${symbol}" leads to "${dest}" which is not a valid state.`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─────────────────────────────────────────────────────────────────────────────
// MEALY MACHINE VALIDATION
// ─────────────────────────────────────────────────────────────────────────────
export function validateMealy(machine) {
  const errors = [];
  if (!machine) return { valid: false, errors: ['No machine data provided.'] };

  const { states = [], inputAlphabet = [], outputAlphabet = [], initialState, transitions = {} } = machine;

  // States
  if (states.length === 0) errors.push('Your machine must have at least one state.');
  const uniqueStates = new Set(states);
  if (uniqueStates.size !== states.length) errors.push('Duplicate state names detected. Each state must have a unique name.');

  // Alphabets
  if (inputAlphabet.length === 0) errors.push('Your machine must have at least one input symbol.');
  const uniqueInput = new Set(inputAlphabet);
  if (uniqueInput.size !== inputAlphabet.length) errors.push('Duplicate input alphabet symbols detected.');
  if (outputAlphabet.length === 0) errors.push('Your machine must have at least one output symbol.');
  const uniqueOutput = new Set(outputAlphabet);
  if (uniqueOutput.size !== outputAlphabet.length) errors.push('Duplicate output alphabet symbols detected.');

  // Initial state
  if (!initialState) {
    errors.push('No initial state selected. Please choose one state as the initial state.');
  } else if (!uniqueStates.has(initialState)) {
    errors.push(`Initial state "${initialState}" is not in the states list.`);
  }

  // Transitions
  for (const state of states) {
    for (const symbol of inputAlphabet) {
      const trans = transitions[state]?.[symbol];
      if (!trans) {
        errors.push(`Missing transition: state "${state}" on input "${symbol}" has no transition defined.`);
      } else {
        if (!trans.nextState || !uniqueStates.has(trans.nextState)) {
          errors.push(`Transition from "${state}" on input "${symbol}" has invalid next state "${trans.nextState}".`);
        }
        if (trans.output === undefined || trans.output === null || trans.output === '') {
          errors.push(`Transition from "${state}" on input "${symbol}" is missing an output value.`);
        } else if (!outputAlphabet.includes(trans.output)) {
          errors.push(`Transition from "${state}" on input "${symbol}" has output "${trans.output}" which is not in the output alphabet.`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTED JSON VALIDATION
// ─────────────────────────────────────────────────────────────────────────────
export function validateImportedJSON(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid JSON: expected an object.'] };
  }
  if (!data.type || !['MOORE', 'MEALY'].includes(data.type)) {
    errors.push('JSON must have a "type" field set to "MOORE" or "MEALY".');
  }
  if (!Array.isArray(data.states)) errors.push('"states" must be an array of state names.');
  if (!Array.isArray(data.inputAlphabet)) errors.push('"inputAlphabet" must be an array of symbols.');
  if (!Array.isArray(data.outputAlphabet)) errors.push('"outputAlphabet" must be an array of symbols.');
  if (!data.initialState) errors.push('"initialState" must be specified.');
  if (!data.transitions || typeof data.transitions !== 'object') errors.push('"transitions" must be an object.');

  if (data.type === 'MOORE' && errors.length === 0) {
    if (!data.outputs || typeof data.outputs !== 'object') {
      errors.push('Moore machine JSON must have an "outputs" object mapping states to output values.');
    }
    return errors.length === 0
      ? validateMoore(data)
      : { valid: false, errors };
  }

  if (data.type === 'MEALY' && errors.length === 0) {
    return validateMealy(data);
  }

  return { valid: errors.length === 0, errors };
}
