import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const Section = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h2>
        {open ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      {open && <div className="mt-4 space-y-3 animate-fade-in">{children}</div>}
    </div>
  );
};

const P = ({ children }) => (
  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{children}</p>
);

const Code = ({ children }) => (
  <pre className="code-block text-xs leading-relaxed">{children}</pre>
);

export default function LearnPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen size={26} className="text-primary-600 dark:text-primary-400" />
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Learn</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">A beginner-friendly guide to Moore machines, Mealy machines, and conversion algorithms</p>
        </div>
      </div>

      <Section title="What is a Finite State Machine (FSM)?">
        <P>
          A Finite State Machine (FSM) is a mathematical model of computation that describes the behavior of a system
          using a finite number of states, transitions between those states, and actions (outputs).
        </P>
        <P>
          FSMs are fundamental in computer science, used in compiler design, digital circuit design, protocol analysis,
          pattern matching, and many other areas.
        </P>
        <P>
          There are two main types of finite transducers (FSMs that produce output):
          <strong> Moore machines</strong> and <strong>Mealy machines</strong>.
        </P>
      </Section>

      <Section title="Moore Machine — M = (Q, Σ, Δ, δ, λ, q₀)">
        <P>In a Moore machine, the output depends <strong>only on the current state</strong>, not on the input.</P>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Q', 'Set of all states'],
            ['Σ', 'Input alphabet (set of input symbols)'],
            ['Δ', 'Output alphabet (set of output symbols)'],
            ['δ: Q × Σ → Q', 'Transition function'],
            ['λ: Q → Δ', 'Output function (state → output)'],
            ['q₀ ∈ Q', 'Initial state'],
          ].map(([sym, def]) => (
            <div key={sym} className="card py-2 px-3">
              <code className="font-mono text-primary-600 dark:text-primary-400 font-bold">{sym}</code>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{def}</p>
            </div>
          ))}
        </div>

        <Code>{`Example Moore Machine:
States:     Q = { q0, q1, q2 }
Input:      Σ = { 0, 1 }
Output:     Δ = { 0, 1 }
Initial:    q0

State Outputs (λ):
  q0 → 0
  q1 → 1
  q2 → 0

Transitions (δ):
  δ(q0, 0) = q1      δ(q0, 1) = q2
  δ(q1, 0) = q0      δ(q1, 1) = q2
  δ(q2, 0) = q2      δ(q2, 1) = q0

Diagram:
  → q0/0 ──0──→ q1/1
     │              │
     1              │0,1
     ↓              ↓
    q2/0 ←──0──── q2/0
     └──1──→ q0/0`}</Code>
      </Section>

      <Section title="Mealy Machine — M = (Q, Σ, Δ, δ, λ, q₀)">
        <P>In a Mealy machine, the output depends on <strong>both the current state AND the input symbol</strong>.</P>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Q', 'Set of all states'],
            ['Σ', 'Input alphabet'],
            ['Δ', 'Output alphabet'],
            ['δ: Q × Σ → Q', 'Transition function'],
            ['λ: Q × Σ → Δ', 'Output function (state + input → output)'],
            ['q₀ ∈ Q', 'Initial state'],
          ].map(([sym, def]) => (
            <div key={sym} className="card py-2 px-3">
              <code className="font-mono text-accent-600 dark:text-accent-400 font-bold">{sym}</code>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{def}</p>
            </div>
          ))}
        </div>

        <Code>{`Example Mealy Machine:
States:     Q = { q0, q1 }
Input:      Σ = { 0, 1 }
Output:     Δ = { 0, 1 }
Initial:    q0

Transitions + Outputs (δ, λ):
  q0 --0/1--> q1    (in state q0, read 0, go to q1, output 1)
  q0 --1/0--> q0    (in state q0, read 1, stay q0, output 0)
  q1 --0/0--> q0    (in state q1, read 0, go to q0, output 0)
  q1 --1/1--> q1    (in state q1, read 1, stay q1, output 1)`}</Code>
      </Section>

      <Section title="Key Difference: Moore vs Mealy">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Moore Machine</th>
                <th>Mealy Machine</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Output function', 'λ: Q → Δ (state only)', 'λ: Q × Σ → Δ (state + input)'],
                ['Output on', 'State (node)', 'Transition (edge)'],
                ['Notation', 'state / output', 'input / output'],
                ['Output timing', 'After entering state', 'During transition'],
                ['Output length', 'n + 1 (for n inputs)', 'n (one per input)'],
                ['States needed', 'Often more states', 'Often fewer states'],
                ['Equivalence', 'Always equivalent to some Mealy', 'Always equivalent to some Moore'],
              ].map(([f, m, ml]) => (
                <tr key={f}>
                  <td className="font-semibold">{f}</td>
                  <td className="text-primary-600 dark:text-primary-400">{m}</td>
                  <td className="text-accent-600 dark:text-accent-400">{ml}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Moore → Mealy Conversion Algorithm">
        <P>Converting Moore to Mealy is straightforward. The states remain identical.</P>
        <Code>{`Algorithm: Moore → Mealy

For every Moore transition:   q_i --a--> q_j

  The output of q_j in Moore is: λ(q_j)

  The Mealy transition becomes:  q_i --a/λ(q_j)--> q_j

Key insight:
  In Moore, the output is produced UPON ENTERING a state.
  In Mealy, we ATTACH that output to the transition that ENTERS the state.

Example:
  Moore:
    q0 output = 0
    q1 output = 1
    q0 --0--> q1

  Mealy (converted):
    q0 --0/1--> q1   (output=λ(q1)=1)

Number of states: SAME as the original Moore machine.`}</Code>
      </Section>

      <Section title="Mealy → Moore Conversion Algorithm (State Splitting)">
        <P>Converting Mealy to Moore is more complex. States may need to be <strong>split</strong>.</P>
        <Code>{`Algorithm: Mealy → Moore

Problem: A Mealy state can be entered with DIFFERENT outputs on different
         transitions. But a Moore state has only ONE output.

Solution: SPLIT states that receive multiple different outputs.

Step 1: For each destination state q, collect all incoming outputs.
Step 2: If q receives only ONE unique output x:
          Create one Moore state [q, x] with output x.
Step 3: If q receives MULTIPLE unique outputs {x, y, z, ...}:
          Create Moore states [q, x], [q, y], [q, z], ...
          each with its respective output.
Step 4: Rebuild transitions:
          Mealy: q_i --a/x--> q_j
          Moore:  [q_i, *] --a--> [q_j, x]
Step 5: Handle initial state:
          The initial state has no incoming transitions, so assign
          a default output (first available output symbol).

Example:
  Mealy transitions entering q1:
    q0 --0/1--> q1    → creates [q1, 1]  output=1
    q2 --1/0--> q1    → creates [q1, 0]  output=0

  State q1 is split into: q1_1 and q1_0`}</Code>
      </Section>

      <Section title="Output Timing — The Initial Output Issue">
        <P>
          Moore machines produce output for every state, including the <strong>initial state</strong>.
          This means before reading any input, the Moore machine already outputs something.
        </P>
        <P>
          Mealy machines produce output only when reading input, so there is no initial output.
          This creates an <strong>offset of one output</strong> when comparing the two.
        </P>
        <Code>{`Input string: "01"

Moore machine output (length = input + 1):
  Step 0 (initial): State=q0, Output=0   ← extra initial output
  Step 1 (input=0): State=q1, Output=1
  Step 2 (input=1): State=q0, Output=0
  Full Moore output: "010"

Equivalent Mealy machine output (length = input):
  Step 1 (input=0): q0→q1, Output=1
  Step 2 (input=1): q1→q0, Output=0
  Full Mealy output: "10"

Comparison: Moore[1:] = "10" = Mealy[:] = "10" ✓
Both machines are equivalent (ignoring the initial offset).`}</Code>
      </Section>

      <Section title="Applications of Finite State Machines">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'Compiler Design', desc: 'Lexical analyzers use FSMs to tokenize input', color: 'primary' },
            { title: 'Digital Circuits', desc: 'Sequential circuits are implemented as Moore/Mealy machines', color: 'accent' },
            { title: 'Protocol Design', desc: 'Network protocols use FSMs to model state transitions', color: 'primary' },
            { title: 'Text Processing', desc: 'Pattern matching and regular expression engines', color: 'accent' },
            { title: 'Game AI', desc: 'NPC behavior trees and state-based AI systems', color: 'primary' },
            { title: 'Control Systems', desc: 'Embedded systems for controlling hardware devices', color: 'accent' },
          ].map(({ title, desc, color }) => (
            <div key={title} className={`card py-3 px-4 border-l-4 ${color === 'primary' ? 'border-l-primary-500' : 'border-l-accent-500'}`}>
              <h4 className="font-semibold text-sm text-slate-800 dark:text-white">{title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
