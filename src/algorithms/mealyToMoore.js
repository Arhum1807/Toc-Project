/**
 * mealyToMoore.js
 *
 * Converts a Mealy Machine to an equivalent Moore Machine.
 *
 * Algorithm (State Splitting):
 *
 * 1. For every state q in the Mealy machine, collect all OUTPUTS that appear
 *    on transitions ENTERING q (i.e., incoming transition outputs).
 *
 * 2. If a state q has only ONE unique incoming output (say 'x'), it maps to
 *    one Moore state [q, 'x'] with output 'x'.
 *
 * 3. If a state q has MULTIPLE unique incoming outputs (say 'x' and 'y'),
 *    it is SPLIT into multiple Moore states:  [q, 'x'] and [q, 'y'].
 *
 * 4. For the INITIAL state (which has no incoming transitions in a typical
 *    Mealy machine), we create one Moore state [q0, ''] and assign an output
 *    of '' (or the first available output symbol) since Moore requires an
 *    output on every state. This is the "initial output" issue — clearly
 *    communicated in the UI.
 *
 * 5. Reconstruct all transitions. For a transition from Moore state [q, out]
 *    on symbol 'a':
 *    - Look at Mealy transition: q --a--> (nextState, mealyOutput)
 *    - The destination Moore state is [nextState, mealyOutput]
 *
 * 6. Return the resulting Moore machine.
 *
 * NOTE: The initial state handling means Moore output is "one step ahead" —
 * the Moore machine produces an output for the initial state before reading
 * any input. This is explained clearly in the UI.
 */

/**
 * @param {Object} mealyMachine - A validated Mealy machine:
 *   {
 *     type: 'MEALY',
 *     states: string[],
 *     inputAlphabet: string[],
 *     outputAlphabet: string[],
 *     initialState: string,
 *     transitions: {
 *       [state]: { [symbol]: { nextState: string, output: string } }
 *     }
 *   }
 *
 * @returns {Object} - Equivalent Moore machine with conversionSteps and stateMap
 */
export function mealyToMoore(mealyMachine) {
  const { states, inputAlphabet, outputAlphabet, initialState, transitions } = mealyMachine;

  // -----------------------------------------------------------------------
  // Step 1: Collect incoming outputs for every state
  // -----------------------------------------------------------------------
  // incomingOutputs[state] = Set of output values seen on transitions entering state
  const incomingOutputs = {};
  for (const state of states) {
    incomingOutputs[state] = new Set();
  }

  for (const fromState of states) {
    for (const symbol of inputAlphabet) {
      const trans = transitions[fromState]?.[symbol];
      if (trans) {
        incomingOutputs[trans.nextState].add(trans.output);
      }
    }
  }

  // -----------------------------------------------------------------------
  // Step 2: Build Moore states
  // Each Moore state is represented as { id, mealyState, output }
  // id is a human-readable name like "q0", "q1_0", "q1_1"
  // -----------------------------------------------------------------------
  const mooreStates = []; // Array of { id, mealyState, output }
  // Map from (mealyState, output) → Moore state id
  const stateKey = (mealyState, output) => `${mealyState}___${output}`;
  const stateMap = {};       // key → Moore state id
  const conversionSteps = []; // Explanation steps

  // Handle the initial state — it has no incoming transitions defining output
  // We create ONE Moore state for it with a placeholder output (usually the first output symbol or '')
  // Convention: if the initial state also appears as a destination, we handle both cases
  const initialOutputSet = incomingOutputs[initialState];

  // Create initial Moore state with empty/first-output (the "initial output problem")
  const initialMooreOutput = outputAlphabet[0] ?? '';
  const initialMooreId = initialState + (initialOutputSet.size > 0 ? `_init` : '');
  const initialMooreState = {
    id: initialState, // Use plain name for initial state
    mealyState: initialState,
    output: initialMooreOutput,
    isInitial: true,
  };
  mooreStates.push(initialMooreState);
  // Register for the initial state (for transitions from initial state)
  // We register the initial state keyed to its special case
  stateMap[stateKey(initialState, '__initial__')] = initialState;

  // Also register for each incoming output to initial state (in case other states transition into it)
  for (const out of initialOutputSet) {
    const sid = `${initialState}_${out}`;
    const existing = mooreStates.find(s => s.mealyState === initialState && s.output === out && !s.isInitial);
    if (!existing) {
      const ms = { id: sid, mealyState: initialState, output: out };
      mooreStates.push(ms);
      stateMap[stateKey(initialState, out)] = sid;
    }
  }
  // If no incoming outputs (initial state is never a destination), still valid
  if (initialOutputSet.size === 0) {
    stateMap[stateKey(initialState, '__any__')] = initialState;
  }

  // Now handle all NON-INITIAL states
  for (const state of states) {
    if (state === initialState) continue; // Already handled

    const outputs = incomingOutputs[state];

    if (outputs.size === 0) {
      // State is never a destination — create it with default output
      const ms = { id: state, mealyState: state, output: outputAlphabet[0] ?? '' };
      mooreStates.push(ms);
      stateMap[stateKey(state, '__any__')] = state;
      conversionSteps.push({
        type: 'no_incoming',
        mealyState: state,
        mooreState: state,
        output: ms.output,
        description: `State ${state} has no incoming transitions. Created Moore state "${state}" with default output "${ms.output}".`,
      });
    } else if (outputs.size === 1) {
      // Only one unique incoming output — no split needed
      const out = [...outputs][0];
      const sid = state;
      const ms = { id: sid, mealyState: state, output: out };
      mooreStates.push(ms);
      stateMap[stateKey(state, out)] = sid;
      conversionSteps.push({
        type: 'single_output',
        mealyState: state,
        mooreState: sid,
        output: out,
        description: `State ${state} has one unique incoming output "${out}". Created Moore state "${sid}" with output "${out}".`,
      });
    } else {
      // Multiple unique incoming outputs — SPLIT the state
      const outputsArr = [...outputs].sort();
      conversionSteps.push({
        type: 'split_start',
        mealyState: state,
        outputs: outputsArr,
        description: `State ${state} has multiple incoming outputs [${outputsArr.join(', ')}]. Splitting into ${outputsArr.length} Moore states.`,
      });
      for (const out of outputsArr) {
        const sid = `${state}_${out}`;
        const ms = { id: sid, mealyState: state, output: out };
        mooreStates.push(ms);
        stateMap[stateKey(state, out)] = sid;
        conversionSteps.push({
          type: 'split_state',
          mealyState: state,
          mooreState: sid,
          output: out,
          description: `  Created Moore state "${sid}" for Mealy state "${state}" with output "${out}".`,
        });
      }
    }
  }

  // -----------------------------------------------------------------------
  // Step 3: Build Moore transitions
  // -----------------------------------------------------------------------
  // For each Moore state [q, out], and each input symbol a:
  //   Mealy transition: q --a--> (nextState, mealyOutput)
  //   Moore transition: [q, out] --a--> [nextState, mealyOutput]
  // -----------------------------------------------------------------------
  const mooreTransitions = {};
  const mooreStateIds = mooreStates.map(s => s.id);
  const mooreOutputs = {};

  for (const ms of mooreStates) {
    mooreTransitions[ms.id] = {};
    mooreOutputs[ms.id] = ms.output;
  }

  const transitionSteps = [];

  for (const ms of mooreStates) {
    const mealyState = ms.mealyState;
    for (const symbol of inputAlphabet) {
      const trans = transitions[mealyState]?.[symbol];
      if (!trans) continue;

      const { nextState, output: transOutput } = trans;

      // Find the destination Moore state id for (nextState, transOutput)
      let destId = stateMap[stateKey(nextState, transOutput)];
      if (!destId) {
        // Try any fallback
        destId = stateMap[stateKey(nextState, '__any__')] ??
                 stateMap[stateKey(nextState, '__initial__')] ??
                 nextState;
      }

      mooreTransitions[ms.id][symbol] = destId;

      transitionSteps.push({
        fromMooreState: ms.id,
        fromMealyState: mealyState,
        symbol,
        toMealyState: nextState,
        mealyOutput: transOutput,
        toMooreState: destId,
        description: `Moore ${ms.id} --${symbol}--> ${destId}   (from Mealy: ${mealyState} --${symbol}/${transOutput}--> ${nextState})`,
      });
    }
  }

  const initialMooreStateId = initialMooreState.id;

  return {
    type: 'MOORE',
    states: mooreStateIds,
    inputAlphabet: [...inputAlphabet],
    outputAlphabet: [...outputAlphabet],
    initialState: initialMooreStateId,
    outputs: mooreOutputs,
    transitions: mooreTransitions,
    conversionSteps,
    transitionSteps,
    stateMap,
    mooreStateDetails: mooreStates, // Full details for display
    sourceType: 'MEALY',
  };
}
