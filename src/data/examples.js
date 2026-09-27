/**
 * examples.js
 *
 * Built-in example machines for Moore and Mealy.
 */

// ─────────────────────────────────────────────────────────────────────────────
// MOORE EXAMPLES
// ─────────────────────────────────────────────────────────────────────────────

export const mooreExamples = [
  {
    id: 'moore-parity',
    name: 'Binary Parity Machine',
    description: 'Detects whether the number of 1s seen so far is even (output 0) or odd (output 1). Classic Moore machine example.',
    category: 'Moore',
    sampleInput: '1011',
    expectedOutput: '01010', // Initial + one per input
    machine: {
      type: 'MOORE',
      states: ['q0', 'q1'],
      inputAlphabet: ['0', '1'],
      outputAlphabet: ['0', '1'],
      initialState: 'q0',
      outputs: { q0: '0', q1: '1' },
      transitions: {
        q0: { '0': 'q0', '1': 'q1' },
        q1: { '0': 'q1', '1': 'q0' },
      },
    },
  },
  {
    id: 'moore-seq-detector',
    name: 'Sequence Detector (101)',
    description: 'Outputs 1 when the sequence 101 has been detected in the input stream.',
    category: 'Moore',
    sampleInput: '10101',
    expectedOutput: '000010',
    machine: {
      type: 'MOORE',
      states: ['q0', 'q1', 'q2', 'q3'],
      inputAlphabet: ['0', '1'],
      outputAlphabet: ['0', '1'],
      initialState: 'q0',
      outputs: { q0: '0', q1: '0', q2: '0', q3: '1' },
      transitions: {
        q0: { '0': 'q0', '1': 'q1' },
        q1: { '0': 'q2', '1': 'q1' },
        q2: { '0': 'q0', '1': 'q3' },
        q3: { '0': 'q2', '1': 'q1' },
      },
    },
  },
  {
    id: 'moore-traffic',
    name: 'Simple Traffic Light',
    description: 'Models a 3-state traffic light: Red (R), Green (G), Yellow (Y). Cycles through states on each input tick.',
    category: 'Moore',
    sampleInput: '000',
    expectedOutput: 'RGYR',
    machine: {
      type: 'MOORE',
      states: ['red', 'green', 'yellow'],
      inputAlphabet: ['0'],
      outputAlphabet: ['R', 'G', 'Y'],
      initialState: 'red',
      outputs: { red: 'R', green: 'G', yellow: 'Y' },
      transitions: {
        red: { '0': 'green' },
        green: { '0': 'yellow' },
        yellow: { '0': 'red' },
      },
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MEALY EXAMPLES
// ─────────────────────────────────────────────────────────────────────────────

export const mealyExamples = [
  {
    id: 'mealy-binary-detector',
    name: 'Binary Sequence Detector',
    description: 'Outputs 1 when the last two inputs were 1,0. Demonstrates how Mealy machines can respond immediately to input.',
    category: 'Mealy',
    sampleInput: '1010',
    expectedOutput: '0101',
    machine: {
      type: 'MEALY',
      states: ['q0', 'q1'],
      inputAlphabet: ['0', '1'],
      outputAlphabet: ['0', '1'],
      initialState: 'q0',
      transitions: {
        q0: {
          '0': { nextState: 'q0', output: '0' },
          '1': { nextState: 'q1', output: '0' },
        },
        q1: {
          '0': { nextState: 'q0', output: '1' },
          '1': { nextState: 'q1', output: '0' },
        },
      },
    },
  },
  {
    id: 'mealy-complement',
    name: "1's Complement Machine",
    description: 'Outputs the bitwise complement of each input bit. Output 0 for input 1 and 1 for input 0.',
    category: 'Mealy',
    sampleInput: '1010',
    expectedOutput: '0101',
    machine: {
      type: 'MEALY',
      states: ['q0'],
      inputAlphabet: ['0', '1'],
      outputAlphabet: ['0', '1'],
      initialState: 'q0',
      transitions: {
        q0: {
          '0': { nextState: 'q0', output: '1' },
          '1': { nextState: 'q0', output: '0' },
        },
      },
    },
  },
  {
    id: 'mealy-control',
    name: 'Simple Control System',
    description: 'A vending machine model: stays idle (0) when no coin (0), outputs product (1) when coin (1) is inserted.',
    category: 'Mealy',
    sampleInput: '0100',
    expectedOutput: '0100',
    machine: {
      type: 'MEALY',
      states: ['idle', 'ready'],
      inputAlphabet: ['0', '1'],
      outputAlphabet: ['0', '1'],
      initialState: 'idle',
      transitions: {
        idle: {
          '0': { nextState: 'idle', output: '0' },
          '1': { nextState: 'ready', output: '0' },
        },
        ready: {
          '0': { nextState: 'idle', output: '0' },
          '1': { nextState: 'ready', output: '1' },
        },
      },
    },
  },
];

export const allExamples = [...mooreExamples, ...mealyExamples];
