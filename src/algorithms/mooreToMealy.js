/**
 * mooreToMealy.js
 *
 * Converts a Moore Machine to an equivalent Mealy Machine.
 *
 * Algorithm:
 *   For every Moore transition:  q_i --a--> q_j
 *   The equivalent Mealy transition is:  q_i --a/λ(q_j)--> q_j
 *   where λ(q_j) is the output associated with the destination state q_j.
 *
 * The Mealy machine has the SAME states and alphabet as the Moore machine.
 * Only the output function changes: output is moved from states to transitions.
 */

/**
 * @param {Object} mooreMachine - A validated Moore machine object:
 *   {
 *     type: 'MOORE',
 *     states: string[],
 *     inputAlphabet: string[],
 *     outputAlphabet: string[],
 *     initialState: string,
 *     outputs: { [state]: string },          // λ: Q → Δ
 *     transitions: { [state]: { [symbol]: string } }  // δ: Q×Σ → Q
 *   }
 *
 * @returns {Object} - Equivalent Mealy machine:
 *   {
 *     type: 'MEALY',
 *     states: string[],
 *     inputAlphabet: string[],
 *     outputAlphabet: string[],
 *     initialState: string,
 *     transitions: {
 *       [state]: {
 *         [symbol]: { nextState: string, output: string }
 *       }
 *     },
 *     conversionSteps: Array<{ mooreTransition, destinationOutput, mealyTransition }>
 *   }
 */
export function mooreToMealy(mooreMachine) {
  const { states, inputAlphabet, outputAlphabet, initialState, outputs, transitions } = mooreMachine;

  const mealyTransitions = {};
  const conversionSteps = [];

  // Initialize transition table for all states
  for (const state of states) {
    mealyTransitions[state] = {};
  }

  // For every state and every input symbol, build the Mealy transition
  for (const state of states) {
    for (const symbol of inputAlphabet) {
      const destState = transitions[state]?.[symbol];
      if (destState === undefined || destState === '') {
        // Transition not defined — skip (validation should catch this before conversion)
        continue;
      }

      // The Mealy output for this transition = output of the DESTINATION state in Moore
      const output = outputs[destState];

      mealyTransitions[state][symbol] = {
        nextState: destState,
        output: output,
      };

      // Record step for the explanation UI
      conversionSteps.push({
        mooreTransition: `${state} --${symbol}--> ${destState}`,
        destinationState: destState,
        destinationOutput: output,
        mealyTransition: `${state} --${symbol}/${output}--> ${destState}`,
        fromState: state,
        inputSymbol: symbol,
        toState: destState,
      });
    }
  }

  return {
    type: 'MEALY',
    states: [...states],
    inputAlphabet: [...inputAlphabet],
    outputAlphabet: [...outputAlphabet],
    initialState,
    transitions: mealyTransitions,
    conversionSteps,
    sourceType: 'MOORE',
  };
}
