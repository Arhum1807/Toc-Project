# Implementation of Moore and Mealy Machine Converters

## 🎯 Features

- **Moore Machine Designer** — Wizard-based editor: define states, alphabets, outputs, transitions
- **Mealy Machine Designer** — Wizard-based editor: define states, alphabets, transitions with outputs
- **Moore → Mealy Conversion** — Fully dynamic, algorithmically computed
- **Mealy → Moore Conversion** — State-splitting algorithm, handles all edge cases
- **Interactive State Diagrams** — React Flow graphs: zoom, pan, drag, minimap
- **Step-by-Step Simulation** — Trace state sequences and outputs step by step
- **Output Comparison** — Side-by-side with Moore/Mealy offset explanation
- **JSON Import / Export** — Save and load machine configurations
- **Built-in Examples** — 6 pre-built machines (3 Moore, 3 Mealy)
- **Test Suite** — Define expected outputs and verify machine behavior
- **Dark / Light Mode** — Persisted in localStorage
- **Educational Learn Page** — Full theory guide with conversion algorithms
- **Validation** — Friendly error messages for all invalid inputs

## 🛠 Technologies

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| React Flow | State diagram visualization |
| React Router v6 | SPA navigation |
| Tailwind CSS v3 | Styling |
| Lucide React | Icons |

## 🚀 Installation

```bash
npm install
npm run dev
```

## 🏗 Build

```bash
npm run build
```

## 📖 Usage

### Creating a Moore Machine
1. Navigate to **Moore Machine → Create Machine**
2. Enter the number of states and click **Generate States**
3. Rename states if desired
4. Define the input alphabet and output alphabet
5. Assign an output to each state
6. Define transitions via dropdown menus
7. Click **Build Moore Machine**

### Converting Moore → Mealy
1. Navigate to **Conversion → Moore → Mealy**
2. Build or load a Moore machine
3. Click **Convert to Mealy Machine**
4. View the generated Mealy machine with conversion steps
5. Compare outputs using the same input string

### Converting Mealy → Moore
1. Navigate to **Conversion → Mealy → Moore**
2. Build or load a Mealy machine
3. Click **Convert to Moore Machine**
4. View the generated Moore machine (states may be split)
5. Compare outputs using the same input string

## ⚙️ Conversion Algorithms

### Moore → Mealy
```
For every Moore transition: q_i --a--> q_j
  output = λ(q_j)   [output of destination state]
  Mealy transition: q_i --a/output--> q_j
```
- States remain identical
- Output moves from state labels to transition labels

### Mealy → Moore (State Splitting)
```
For each destination state q:
  Collect all incoming outputs: {x, y, z, ...}
  
  If only one unique output x:
    Create one Moore state [q, x] with output x
    
  If multiple outputs {x, y, z}:
    Create Moore states [q, x], [q, y], [q, z]
    each with respective output

Rebuild transitions:
  Mealy: q_i --a/x--> q_j
  Moore: [q_i, *] --a--> [q_j, x]

Initial state:
  Has no incoming transitions → assign default output
```

## 📊 Output Convention

| Machine | Output Length | Convention |
|---------|--------------|------------|
| Moore | n + 1 | Includes output for initial state before reading any input |
| Mealy | n | One output per input symbol |

When comparing, Moore output[1:] is aligned with Mealy output[:].

## 🔧 Project Structure

```
src/
├── algorithms/
│   ├── mooreToMealy.js    # Moore → Mealy conversion algorithm
│   ├── mealyToMoore.js    # Mealy → Moore state-splitting algorithm
│   ├── simulateMoore.js   # Moore machine simulation
│   └── simulateMealy.js   # Mealy machine simulation
├── components/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── MachineGraph.jsx   # React Flow state diagram
│   ├── MooreEditor.jsx    # 5-step Moore machine wizard
│   ├── MealyEditor.jsx    # 4-step Mealy machine wizard
│   ├── SimulationPanel.jsx
│   ├── ConversionSteps.jsx
│   ├── MachineComparison.jsx
│   ├── ImportExport.jsx
│   └── Notification.jsx
├── context/
│   └── MachineContext.jsx  # Global state management
├── data/
│   └── examples.js         # Built-in machine examples
├── pages/
│   ├── Dashboard.jsx
│   ├── MoorePage.jsx
│   ├── MealyPage.jsx
│   ├── MooreToMealyPage.jsx
│   ├── MealyToMoorePage.jsx
│   ├── ComparePage.jsx
│   ├── LearnPage.jsx
│   ├── ExamplesPage.jsx
│   ├── TestingPage.jsx
│   └── AboutPage.jsx
└── utils/
    ├── validation.js
    ├── exportImport.js
    └── graphBuilder.js
```

## 📝 Examples

### Moore — Binary Parity
```json
{
  "type": "MOORE",
  "states": ["q0", "q1"],
  "inputAlphabet": ["0", "1"],
  "outputAlphabet": ["0", "1"],
  "initialState": "q0",
  "outputs": { "q0": "0", "q1": "1" },
  "transitions": {
    "q0": { "0": "q0", "1": "q1" },
    "q1": { "0": "q1", "1": "q0" }
  }
}
```

### Mealy — Sequence Detector
```json
{
  "type": "MEALY",
  "states": ["q0", "q1"],
  "inputAlphabet": ["0", "1"],
  "outputAlphabet": ["0", "1"],
  "initialState": "q0",
  "transitions": {
    "q0": {
      "0": { "nextState": "q0", "output": "0" },
      "1": { "nextState": "q1", "output": "0" }
    },
    "q1": {
      "0": { "nextState": "q0", "output": "1" },
      "1": { "nextState": "q1", "output": "0" }
    }
  }
}
```
