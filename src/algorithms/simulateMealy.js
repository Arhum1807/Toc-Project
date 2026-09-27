/**
 * simulateMealy.js
 *
 * Simulates a Mealy machine on an input string.
 *
 * Mealy output convention:
 *   - Output is produced ON EACH TRANSITION, not on states.
 *   - Output length = input length (one output per input symbol)
 *   - No output is produced in the initial state before reading input.
 *
 * Example:
 *   States: q0, q1
 *   Transitions: q0 --0/1--> q1,  q0 --1/0--> q0,  q1 --0/0--> q0,  q1 --1/1--> q1
 *   Initial: q0
 *   Input: "01"
 *
 *   Step 1: State=q0, Input=0, → q1, Output=1
 *   Step 2: State=q1, Input=1, → q1, Output=1
 *
 *   Output sequence: [1, 1]
 */

/**
 * @param {Object} mealyMachine
 * @param {string} inputString - e.g. "0110"
 * @returns {Object} simulation result:
 *   {
 *     steps: Array<{ stepIndex, fromState, inputSymbol, toState, output }>
 *     stateSequence: string[]
 *     outputSequence: string[]
 *     outputString: string
 *     error: string | null
 *   }
 */
export function simulateMealy(mealyMachine, inputString) {
  const { states, inputAlphabet, initialState, transitions } = mealyMachine;

  const steps = [];
  const stateSequence = [initialState]; // Track states visited
  const outputSequence = [];

  let currentState = initialState;

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

    const trans = transitions[currentState]?.[symbol];
    if (!trans) {
      return {
        steps,
        stateSequence,
        outputSequence,
        outputString: outputSequence.join(''),
        error: `No transition defined for state "${currentState}" on input "${symbol}".`,
      };
    }

    const { nextState, output } = trans;

    steps.push({
      stepIndex: i + 1,
      fromState: currentState,
      inputSymbol: symbol,
      toState: nextState,
      output: output,
      description: `Step ${i + 1}: State "${currentState}" + Input "${symbol}" → Next State "${nextState}", Output "${output}"`,
    });

    outputSequence.push(output);
    currentState = nextState;
    stateSequence.push(currentState);
  }

  return {
    steps,
    stateSequence,
    outputSequence,
    outputString: outputSequence.join(''),
    error: null,
  };
}
