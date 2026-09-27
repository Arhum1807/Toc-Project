/**
 * graphBuilder.js
 *
 * Converts machine objects into React Flow nodes and edges.
 * Self-loops use type 'selfLoop'. Parallel edges use curvature.
 */

// Auto-layout: arrange states in a horizontal row or circle
function autoLayout(states, cx = 320, cy = 200, radius = 160) {
  const positions = {};
  const n = states.length;
  if (n === 0) return positions;

  if (n <= 4) {
    // Horizontal row
    const spacing = Math.max(160, 600 / n);
    const totalWidth = (n - 1) * spacing;
    const startX = cx - totalWidth / 2;
    states.forEach((state, i) => {
      positions[state] = { x: startX + i * spacing, y: cy };
    });
  } else {
    // Circle layout
    states.forEach((state, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      positions[state] = {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });
  }
  return positions;
}

/**
 * Build React Flow nodes and edges from a Moore machine.
 */
export function buildMooreGraph(machine, highlightedState = null) {
  if (!machine || !machine.states) return { nodes: [], edges: [] };

  const {
    states,
    inputAlphabet = [],
    initialState,
    finalStates = [],
    outputs = {},
    transitions = {},
  } = machine;

  const positions = autoLayout(states);

  const nodes = states.map((state) => ({
    id: state,
    type: 'mooreState',
    position: positions[state],
    draggable: false, // read-only — dragging disabled globally, toggled by prop
    data: {
      label: state,
      output: outputs[state] ?? '',
      isInitial: state === initialState,
      isFinal: Array.isArray(finalStates) && finalStates.includes(state),
      isHighlighted: state === highlightedState,
    },
  }));

  // Merge parallel transitions: same source+dest → one edge with joined labels
  const edgeMap = {};
  for (const fromState of states) {
    for (const symbol of inputAlphabet) {
      const toState = transitions[fromState]?.[symbol];
      if (!toState) continue;
      const key = `${fromState}___${toState}`;
      if (!edgeMap[key]) {
        edgeMap[key] = { from: fromState, to: toState, labels: [] };
      }
      edgeMap[key].labels.push(symbol);
    }
  }

  // Track how many non-self edges exist between each unordered pair
  // so we can offset curvature for bidirectional edges
  const pairCount = {};
  const pairIndex = {};
  for (const { from, to } of Object.values(edgeMap)) {
    if (from === to) continue;
    const pairKey = [from, to].sort().join('___');
    pairCount[pairKey] = (pairCount[pairKey] || 0) + 1;
  }

  const edges = Object.entries(edgeMap).map(([key, { from, to, labels }], i) => {
    const isSelfLoop = from === to;
    const label = labels.join(', ');

    if (isSelfLoop) {
      return {
        id: `e-${key}-${i}`,
        source: from,
        target: to,
        label,
        type: 'selfLoop',
        data: { color: '#6366f1' },
        labelStyle: { fill: '#6366f1', fontWeight: 700, fontSize: 13 },
        labelBgStyle: { fill: '#1e1b4b', fillOpacity: 0.9, rx: 5 },
        style: { stroke: '#6366f1' },
        markerEnd: { type: 'arrowclosed', color: '#6366f1' },
      };
    }

    const pairKey = [from, to].sort().join('___');
    const count = pairCount[pairKey] || 1;
    if (!pairIndex[pairKey]) pairIndex[pairKey] = 0;
    const idx = pairIndex[pairKey]++;
    // Give bidirectional edges a strong curvature so they don't overlap
    const curvature = count > 1 ? (idx % 2 === 0 ? 0.4 : -0.4) : 0.15;

    return {
      id: `e-${key}-${i}`,
      source: from,
      target: to,
      label,
      type: 'smoothstep',
      pathOptions: { curvature },
      animated: false,
      style: { stroke: '#6366f1', strokeWidth: 2.5 },
      labelStyle: { fill: '#6366f1', fontWeight: 700, fontSize: 13 },
      labelBgStyle: { fill: '#1e1b4b', fillOpacity: 0.9, rx: 5 },
      markerEnd: { type: 'arrowclosed', color: '#6366f1' },
    };
  });

  return { nodes, edges };
}

/**
 * Build React Flow nodes and edges from a Mealy machine.
 */
export function buildMealyGraph(machine, highlightedState = null) {
  if (!machine || !machine.states) return { nodes: [], edges: [] };

  const {
    states,
    inputAlphabet = [],
    initialState,
    finalStates = [],
    transitions = {},
  } = machine;

  const positions = autoLayout(states);

  const nodes = states.map((state) => ({
    id: state,
    type: 'mealyState',
    position: positions[state],
    draggable: false,
    data: {
      label: state,
      isInitial: state === initialState,
      isFinal: Array.isArray(finalStates) && finalStates.includes(state),
      isHighlighted: state === highlightedState,
    },
  }));

  const edgeMap = {};
  for (const fromState of states) {
    for (const symbol of inputAlphabet) {
      const trans = transitions[fromState]?.[symbol];
      if (!trans) continue;
      const { nextState, output } = trans;
      const key = `${fromState}___${nextState}`;
      if (!edgeMap[key]) {
        edgeMap[key] = { from: fromState, to: nextState, labels: [] };
      }
      edgeMap[key].labels.push(`${symbol}/${output}`);
    }
  }

  const pairCount = {};
  const pairIndex = {};
  for (const { from, to } of Object.values(edgeMap)) {
    if (from === to) continue;
    const pairKey = [from, to].sort().join('___');
    pairCount[pairKey] = (pairCount[pairKey] || 0) + 1;
  }

  const edges = Object.entries(edgeMap).map(([key, { from, to, labels }], i) => {
    const isSelfLoop = from === to;
    const label = labels.join(', ');

    if (isSelfLoop) {
      return {
        id: `e-${key}-${i}`,
        source: from,
        target: to,
        label,
        type: 'selfLoop',
        data: { color: '#8b5cf6' },
        labelStyle: { fill: '#8b5cf6', fontWeight: 700, fontSize: 13 },
        labelBgStyle: { fill: '#1e1b4b', fillOpacity: 0.9, rx: 5 },
        style: { stroke: '#8b5cf6' },
        markerEnd: { type: 'arrowclosed', color: '#8b5cf6' },
      };
    }

    const pairKey = [from, to].sort().join('___');
    const count = pairCount[pairKey] || 1;
    if (!pairIndex[pairKey]) pairIndex[pairKey] = 0;
    const idx = pairIndex[pairKey]++;
    const curvature = count > 1 ? (idx % 2 === 0 ? 0.4 : -0.4) : 0.15;

    return {
      id: `e-${key}-${i}`,
      source: from,
      target: to,
      label,
      type: 'smoothstep',
      pathOptions: { curvature },
      animated: false,
      style: { stroke: '#8b5cf6', strokeWidth: 2.5 },
      labelStyle: { fill: '#8b5cf6', fontWeight: 700, fontSize: 13 },
      labelBgStyle: { fill: '#1e1b4b', fillOpacity: 0.9, rx: 5 },
      markerEnd: { type: 'arrowclosed', color: '#8b5cf6' },
    };
  });

  return { nodes, edges };
}
