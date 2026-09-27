/**
 * simulateMoore.js
 *
 * Simulates a Moore machine on an input string.
 *
 * Moore output convention:
 *   - The machine produces an output for the INITIAL state BEFORE reading any input.
 *   - Then for each input symbol, it transitions and produces the output of the new state.
 *   - Output length = input length + 1
 *
 * Example:
 *   States: q0(out=0), q1(out=1)
 *   Initial: q0
 *   Input: "01"
 *
 *   Step 0: State=q0, Output=0   (initial state output)
 *   Step 1: Input=0, → q1, Output=1
 *   Step 2: Input=1, → q0, Output=0
 *
 *   Output sequence: [0, 1, 0]
 */

/**
 * @param {Object} mooreMachine
 * @param {string} inputString - e.g. "0110"
 * @returns {Object} simulation result:
 *   {
 *     steps: Array<{ stepIndex, state, inputSymbol, output, isInitial }>
 *     stateSequence: string[]
 *     outputSequence: string[]
 *     outputString: string
 *     accepted: boolean (always false for transducers, included for completeness)
 *     error: string | null
 *   }
 */
export function simulateMoore(mooreMachine, inputString) {
  const { states, inputAlphabet, initialState, outputs, transitions } = mooreMachine;

  const steps = [];
  const stateSequence = [];
  const outputSequence = [];

  let currentState = initialState;

  // Step 0: Initial state output (before any input)
  const initialOutput = outputs[currentState] ?? '';
  steps.push({
    stepIndex: 0,
    state: currentState,
    inputSymbol: null,
    output: initialOutput,
    isInitial: true,
    description: `Initial state: ${currentState} → Output: ${initialOutput}`,
  });
  stateSequence.push(currentState);
  outputSequence.push(initialOutput);

  // Process each input symbol
  for (let i = 0; i < inputString.length; i++) {
    const symbol = inputString[i];

    // Validate symbol
    if (!inputAlphabet.includes(symbol)) {
      return {
        steps,
        stateSequence,
        outputSequence,
        outputString: outputSequence.join(''),
        error: `Invalid input symbol "${symbol}" at position ${i + 1}. Valid symbols: ${inputAlphabet.join(', ')}`,
      };
    }

    const nextState = transitions[currentState]?.[symbol];
    if (nextState === undefined || nextState === '') {
      return {
        steps,
        stateSequence,
        outputSequence,
        outputString: outputSequence.join(''),
        error: `No transition defined for state "${currentState}" on input "${symbol}".`,
      };
    }

    const output = outputs[nextState] ?? '';
    currentState = nextState;

    steps.push({
      stepIndex: i + 1,
      state: currentState,
      inputSymbol: symbol,
      output: output,
      isInitial: false,
      description: `Step ${i + 1}: Input "${symbol}" → State "${currentState}" → Output "${output}"`,
    });
    stateSequence.push(currentState);
    outputSequence.push(output);
  }

  return {
    steps,
    stateSequence,
    outputSequence,
    outputString: outputSequence.join(''),
    error: null,
  };
}
