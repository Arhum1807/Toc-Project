# Project Report

## Implementation of Moore and Mealy Machine Converters

---

## 1. Title

**Implementation of Moore and Mealy Machine Converters**

Course: Theory of Computation / Automata Theory  
Type: Interactive Web Application

---

## 2. Abstract

This project presents a fully interactive, browser-based application for the design, conversion, simulation, and comparison of Moore and Mealy finite state machines. The application allows users to define arbitrary machines through a wizard-based interface, converts between the two types algorithmically, visualizes state diagrams using interactive graphs, and provides step-by-step educational explanations of each conversion. The system supports JSON import/export, input string simulation, test suites, and educational content.

---

## 3. Introduction

Finite State Machines (FSMs) are foundational computational models used extensively in computer science, digital design, compiler construction, and formal language theory. Among FSMs that produce output (transducers), Moore and Mealy machines are the two canonical forms. Understanding the relationship between these two types — and being able to convert between them — is a core competency in Automata Theory courses.

This project addresses the need for an interactive, educational tool that makes these concepts accessible through visual, hands-on learning.

---

## 4. Problem Statement

Students studying Automata Theory often struggle to understand:

1. The structural difference between Moore and Mealy machines
2. Why and how state splitting occurs during Mealy → Moore conversion
3. The output timing offset between the two machine types
4. How to verify that a converted machine is equivalent to the original

Existing tools are often static, hard-coded, or lack proper educational context. This project provides a fully dynamic, user-driven application.

---

## 5. Objectives

- Implement a complete Moore machine designer with wizard interface
- Implement a complete Mealy machine designer with wizard interface
- Implement the Moore → Mealy conversion algorithm
- Implement the Mealy → Moore conversion algorithm (state splitting)
- Provide interactive graph visualization of state diagrams
- Provide step-by-step simulation of input strings
- Compare outputs of original and converted machines
- Explain conversions with per-transition/per-state educational content
- Support JSON import/export for machine configurations
- Provide a test suite for verifying machine behavior

---

## 6. Moore Machine Theory

A Moore machine is a 6-tuple M = (Q, Σ, Δ, δ, λ, q₀) where:

- Q: Finite set of states
- Σ: Input alphabet
- Δ: Output alphabet
- δ: Q × Σ → Q (transition function)
- λ: Q → Δ (output function — depends only on state)
- q₀: Initial state

**Key property:** Output depends only on the current state, not on the input.

Example:
```
States: { q0, q1, q2 }
Transitions: δ(q0, 0) = q1, δ(q0, 1) = q0
State outputs: λ(q0) = 0, λ(q1) = 1, λ(q2) = 0
```

---

## 7. Mealy Machine Theory

A Mealy machine is a 6-tuple M = (Q, Σ, Δ, δ, λ, q₀) where:

- Q: Finite set of states
- Σ: Input alphabet
- Δ: Output alphabet
- δ: Q × Σ → Q (transition function)
- λ: Q × Σ → Δ (output function — depends on state AND input)
- q₀: Initial state

**Key property:** Output depends on both the current state and the current input symbol.

Example:
```
Transitions with output:
  δ(q0, 0) = q1, λ(q0, 0) = 1
  δ(q0, 1) = q0, λ(q0, 1) = 0
```

---

## 8. Moore vs Mealy — Comparison

| Feature | Moore | Mealy |
|---------|-------|-------|
| Output function | λ: Q → Δ | λ: Q × Σ → Δ |
| Output on | State (node) | Transition (edge) |
| Output timing | After entering state | During transition |
| Output length | Input length + 1 | Input length |
| States needed | Often more | Often fewer |
| Equivalence | Any Mealy has equivalent Moore | Any Moore has equivalent Mealy |

---

## 9. Conversion Algorithms

### 9.1 Moore → Mealy Conversion

**Algorithm:**
```
For every Moore transition: q_i --a--> q_j
  Mealy output = λ_moore(q_j)
  Mealy transition: q_i --a/λ_moore(q_j)--> q_j
```

- States: Identical to Moore
- Output: Moved from state labels to transition labels
- Time complexity: O(|Q| × |Σ|)

### 9.2 Mealy → Moore Conversion (State Splitting)

**Algorithm:**
```
1. For each state q, collect incoming_outputs(q) = {output : ∃ transition entering q with output}

2. For each state q:
   - If |incoming_outputs(q)| = 1 with output x:
     Create Moore state [q, x] with λ_moore([q, x]) = x
   - If |incoming_outputs(q)| > 1:
     For each unique output x ∈ incoming_outputs(q):
       Create Moore state [q, x] with λ_moore([q, x]) = x

3. For initial state q₀:
   Create Moore state [q₀, default] with default output

4. Rebuild transitions:
   Mealy: q_i --a/x--> q_j
   Moore: [q_i, *] --a--> [q_j, x]
```

- States: May be more than original Mealy (due to splitting)
- Handles self-loops and multiple input symbols correctly

---

## 10. System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js 16+ (for development)
- Internet connection (optional, for Google Fonts)

---

## 11. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Application                      │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │ Sidebar  │  │  Navbar  │  │   Notification Toast   │ │
│  └──────────┘  └──────────┘  └────────────────────────┘ │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │                    Pages                           │  │
│  │  Dashboard | Moore | Mealy | Conversion | ...      │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────┐     │
│  │              Components                         │     │
│  │  MooreEditor | MealyEditor | MachineGraph       │     │
│  │  SimulationPanel | ConversionSteps | ...        │     │
│  └─────────────────────────────────────────────────┘     │
│                                                           │
│  ┌──────────────────┐  ┌───────────────────────────┐     │
│  │   Context/State  │  │     Pure Algorithms        │     │
│  │  MachineContext  │  │  mooreToMealy.js           │     │
│  │  useReducer      │  │  mealyToMoore.js           │     │
│  └──────────────────┘  │  simulateMoore.js          │     │
│                         │  simulateMealy.js          │     │
│                         └───────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

---

## 12. Implementation

### 12.1 Algorithm Layer

All conversion and simulation algorithms are implemented as pure JavaScript functions in `src/algorithms/`. These are completely independent of the React UI layer, making them testable and reusable.

### 12.2 Component Architecture

Components are organized into:
- **Editor components**: MooreEditor, MealyEditor (wizard-based machine builders)
- **Visualization**: MachineGraph (React Flow wrapper with custom node types)
- **Simulation**: SimulationPanel (input, step, reset, trace display)
- **Conversion**: ConversionSteps (expandable explanation accordion)
- **Comparison**: MachineComparison (side-by-side output table)
- **Utility**: ImportExport, Notification

### 12.3 State Management

Global state is managed using React Context + useReducer pattern, avoiding external state libraries. State includes: current Moore machine, current Mealy machine, converted machine, conversion direction, dark mode preference, and notifications.

---

## 13. Algorithms — Implementation Details

### mooreToMealy.js

```javascript
for (const state of states) {
  for (const symbol of inputAlphabet) {
    const destState = transitions[state][symbol];
    const output = outputs[destState]; // λ(destState)
    mealyTransitions[state][symbol] = { nextState: destState, output };
  }
}
```

### mealyToMoore.js (State Splitting)

```javascript
// Collect incoming outputs
for (const fromState of states) {
  for (const symbol of inputAlphabet) {
    const { nextState, output } = transitions[fromState][symbol];
    incomingOutputs[nextState].add(output);
  }
}

// Create Moore states
for (const state of states) {
  for (const output of incomingOutputs[state]) {
    mooreStates.push({ id: `${state}_${output}`, mealyState: state, output });
  }
}
```

---

## 14. User Interface

The UI uses Tailwind CSS v3 with a custom design system including:
- Dark/light mode with smooth transitions
- Premium color palette (indigo primary, fuchsia accent)
- Card-based layout with hover animations
- Wizard-style machine editors
- React Flow for interactive state diagrams
- Toast notifications

---

## 15. Test Cases

### Moore → Mealy Test Cases

| Machine | Input | Moore Output | Mealy Output |
|---------|-------|-------------|-------------|
| Parity | 1011 | 01010 | 1010 |
| Sequence | 10101 | 000010 | 00001 |
| Traffic | 000 | RGYR | GYR |

### Mealy → Moore Test Cases

| Machine | Requires Splitting? |
|---------|-------------------|
| Binary Detector | No (single output per dest) |
| Complement | No (self-loop only) |
| Control System | No |
| Multi-output test | Yes |

---

## 16. Results

- Moore → Mealy conversion verified correct for all test cases
- Mealy → Moore conversion handles both single-output and multi-output (splitting) cases
- Simulation produces correct output sequences for all tested input strings
- Import/export round-trips correctly
- Dark mode persisted correctly

---

## 17. Applications

1. **Compiler Design** — Lexical analyzers (scanners) use Moore machines to recognize tokens
2. **Digital Circuits** — Sequential circuits (flip-flops, registers) modeled as Moore/Mealy machines
3. **Network Protocols** — Protocol state machines
4. **Text Processing** — Regular expression matching engines
5. **Game Development** — NPC behavior and state-based AI
6. **Control Systems** — Embedded system controllers

---

## 18. Advantages

1. **Interactivity** — Users can define arbitrary machines and see real-time results
2. **Educational** — Step-by-step explanations make algorithms clear
3. **Dynamic** — All conversions computed algorithmically, not hard-coded
4. **Validation** — Friendly error messages guide users to correct input
5. **Portable** — Browser-based, no installation required
6. **Exportable** — Machines can be saved as JSON and shared

---

## 19. Limitations

1. Graph auto-layout is circular; complex machines may have overlapping edges
2. Very large machines (20+ states) may be harder to visualize
3. The Mealy → Moore algorithm assumes completely defined transitions
4. No file-system persistence (localStorage not used for machines)

---

## 20. Future Scope

1. Automatic graph layout using force-directed algorithms
2. NFA/DFA support
3. Regular expression to FSM conversion
4. Minimization of Moore/Mealy machines
5. Export as LaTeX (tikz state diagrams)
6. Support for partial functions (transitions not defined for all inputs)
7. Collaborative editing (multi-user sessions)

---

## 21. Conclusion

This project successfully implements a complete, interactive tool for Moore and Mealy machine design, conversion, and simulation. All conversion algorithms are computed dynamically from user-defined machines. The application provides educational value through step-by-step explanations and clear visualization of state diagrams. It demonstrates key concepts of Automata Theory in an accessible and engaging format.

---

## 22. References

1. Hopcroft, J.E., Motwani, R., Ullman, J.D. — *Introduction to Automata Theory, Languages, and Computation*, 3rd Edition
2. Sipser, M. — *Introduction to the Theory of Computation*, 3rd Edition
3. Lewis, H.R., Papadimitriou, C.H. — *Elements of the Theory of Computation*
4. Nagpal, C.K. — *Formal Languages and Automata Theory*
5. React Documentation — https://react.dev
6. React Flow Documentation — https://reactflow.dev
7. Tailwind CSS Documentation — https://tailwindcss.com
