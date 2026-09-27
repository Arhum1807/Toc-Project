import { useState, useCallback } from 'react';
import { Plus, Trash2, RefreshCw, ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { validateMoore } from '../utils/validation';

const STEPS = ['States', 'Alphabet', 'Outputs', 'Transitions', 'Review'];

// Generate default states: q0, q1, ...
function generateStates(count) {
  return Array.from({ length: count }, (_, i) => `q${i}`);
}

export default function MooreEditor({ onMachineReady, initialMachine }) {
  const [step, setStep] = useState(0);

  // Machine fields
  const [stateCount, setStateCount] = useState(
    initialMachine?.states?.length || 3
  );
  const [states, setStates] = useState(
    initialMachine?.states || generateStates(3)
  );
  const [inputAlphabet, setInputAlphabet] = useState(
    initialMachine?.inputAlphabet || ['0', '1']
  );
  const [outputAlphabet, setOutputAlphabet] = useState(
    initialMachine?.outputAlphabet || ['0', '1']
  );
  const [initialState, setInitialState] = useState(
    initialMachine?.initialState || 'q0'
  );
  const [finalStates, setFinalStates] = useState(
    initialMachine?.finalStates || []
  );
  const [outputs, setOutputs] = useState(initialMachine?.outputs || {});
  const [transitions, setTransitions] = useState(initialMachine?.transitions || {});

  const [newInput, setNewInput] = useState('');
  const [newOutput, setNewOutput] = useState('');
  const [errors, setErrors] = useState([]);

  // ─── Step 0: States ─────────────────────────────────────────────────────────
  const handleGenerateStates = () => {
    const n = Math.max(1, Math.min(20, parseInt(stateCount) || 3));
    const newStates = generateStates(n);
    setStates(newStates);
    setInitialState(newStates[0]);
    setFinalStates([]);
    // Clear dependent data when states change
    setOutputs({});
    setTransitions({});
  };

  const toggleFinal = (state) => {
    setFinalStates(prev =>
      prev.includes(state) ? prev.filter(s => s !== state) : [...prev, state]
    );
  };

  const handleRenameState = (idx, val) => {
    const next = [...states];
    const old = next[idx];
    next[idx] = val;
    setStates(next);

    // Rename in initial state
    if (initialState === old) setInitialState(val);

    // Rename in outputs
    const newOutputs = {};
    for (const [k, v] of Object.entries(outputs)) {
      newOutputs[k === old ? val : k] = v;
    }
    setOutputs(newOutputs);

    // Rename in transitions
    const newTransitions = {};
    for (const [fromState, symMap] of Object.entries(transitions)) {
      const newFromState = fromState === old ? val : fromState;
      newTransitions[newFromState] = {};
      for (const [sym, dest] of Object.entries(symMap)) {
        newTransitions[newFromState][sym] = dest === old ? val : dest;
      }
    }
    setTransitions(newTransitions);
  };

  const handleRemoveState = (idx) => {
    if (states.length <= 1) return;
    const removed = states[idx];
    const next = states.filter((_, i) => i !== idx);
    setStates(next);
    if (initialState === removed) setInitialState(next[0]);
    const newOutputs = { ...outputs };
    delete newOutputs[removed];
    setOutputs(newOutputs);
    const newTransitions = {};
    for (const [fromState, symMap] of Object.entries(transitions)) {
      if (fromState === removed) continue;
      newTransitions[fromState] = {};
      for (const [sym, dest] of Object.entries(symMap)) {
        if (dest !== removed) newTransitions[fromState][sym] = dest;
      }
    }
    setTransitions(newTransitions);
  };

  // ─── Step 1: Alphabets ──────────────────────────────────────────────────────
  const addInputSymbol = () => {
    const s = newInput.trim();
    if (!s || inputAlphabet.includes(s)) return;
    setInputAlphabet([...inputAlphabet, s]);
    setNewInput('');
  };

  const removeInputSymbol = (sym) => {
    setInputAlphabet(inputAlphabet.filter(s => s !== sym));
    // Remove from transitions
    const newTransitions = {};
    for (const [state, symMap] of Object.entries(transitions)) {
      newTransitions[state] = { ...symMap };
      delete newTransitions[state][sym];
    }
    setTransitions(newTransitions);
  };

  const addOutputSymbol = () => {
    const s = newOutput.trim();
    if (!s || outputAlphabet.includes(s)) return;
    setOutputAlphabet([...outputAlphabet, s]);
    setNewOutput('');
  };

  const removeOutputSymbol = (sym) => {
    setOutputAlphabet(outputAlphabet.filter(s => s !== sym));
  };

  // ─── Step 2: Outputs ────────────────────────────────────────────────────────
  const setStateOutput = (state, val) => {
    setOutputs(prev => ({ ...prev, [state]: val }));
  };

  // ─── Step 3: Transitions ────────────────────────────────────────────────────
  const setTransition = (fromState, symbol, destState) => {
    setTransitions(prev => ({
      ...prev,
      [fromState]: { ...(prev[fromState] || {}), [symbol]: destState },
    }));
  };

  // ─── Navigation ─────────────────────────────────────────────────────────────
  const canGoNext = () => {
    if (step === 0) return states.length > 0 && states.every(s => s.trim() !== '');
    if (step === 1) return inputAlphabet.length > 0 && outputAlphabet.length > 0;
    if (step === 2) return states.every(s => outputs[s]);
    if (step === 3) {
      return states.every(s =>
        inputAlphabet.every(sym => transitions[s]?.[sym])
      );
    }
    return true;
  };

  const handleNext = () => {
    if (canGoNext()) {
      setErrors([]);
      setStep(s => Math.min(s + 1, STEPS.length - 1));
    }
  };

  const handleBuild = () => {
    const machine = {
      type: 'MOORE',
      states,
      inputAlphabet,
      outputAlphabet,
      initialState,
      finalStates,
      outputs,
      transitions,
    };
    const { valid, errors: errs } = validateMoore(machine);
    if (!valid) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    onMachineReady(machine);
  };

  const stepDone = (s) => {
    if (s === 0) return states.length > 0 && states.every(st => st.trim() !== '');
    if (s === 1) return inputAlphabet.length > 0 && outputAlphabet.length > 0;
    if (s === 2) return states.every(st => outputs[st]);
    if (s === 3) return states.every(st => inputAlphabet.every(sym => transitions[st]?.[sym]));
    return false;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Wizard steps indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-1">
            <button
              onClick={() => i <= step && setStep(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                i === step
                  ? 'bg-primary-600 text-white shadow-md'
                  : stepDone(i)
                  ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-400'
                  : 'bg-slate-100 dark:bg-dark-border text-slate-500'
              }`}
            >
              {stepDone(i) && i !== step ? <Check size={11} /> : <span>{i + 1}</span>}
              {label}
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight size={13} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: States */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="section-title">Define States</h3>
            <p className="section-subtitle">How many states does your Moore machine have?</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-xs">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Number of States</label>
              <input
                type="number"
                min={1} max={20}
                value={stateCount}
                onChange={e => setStateCount(e.target.value)}
                className="input"
                id="state-count-input"
              />
            </div>
            <button
              onClick={handleGenerateStates}
              className="btn-primary mt-5"
              id="generate-states-btn"
            >
              <RefreshCw size={15} />
              Generate States
            </button>
          </div>

          <div className="space-y-2">
            {states.map((state, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-300 flex-shrink-0">
                  {idx}
                </div>
                <input
                  type="text"
                  value={state}
                  onChange={e => handleRenameState(idx, e.target.value)}
                  className="input max-w-xs"
                  placeholder={`q${idx}`}
                  id={`state-name-${idx}`}
                />
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                    <input
                      type="radio"
                      name="initialState"
                      checked={initialState === state}
                      onChange={() => setInitialState(state)}
                      className="accent-primary-600"
                    />
                    Initial
                  </label>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer"
                    style={{ color: finalStates.includes(state) ? '#10b981' : '#64748b' }}>
                    <input
                      type="checkbox"
                      checked={finalStates.includes(state)}
                      onChange={() => toggleFinal(state)}
                      style={{ accentColor: '#10b981' }}
                      id={`final-state-${idx}`}
                    />
                    <span style={{ fontWeight: finalStates.includes(state) ? 700 : 400 }}>Final</span>
                  </label>
                  <button
                    onClick={() => handleRemoveState(idx)}
                    className="btn-ghost p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    disabled={states.length <= 1}
                    id={`remove-state-${idx}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                const newState = `q${states.length}`;
                setStates([...states, newState]);
              }}
              className="btn-outline text-xs mt-2"
              id="add-state-btn"
            >
              <Plus size={13} />
              Add State
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Alphabet */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="section-title">Define Alphabets</h3>
            <p className="section-subtitle">Specify input and output symbol sets</p>
          </div>

          {/* Input Alphabet */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Input Alphabet (Σ)</label>
            <div className="flex flex-wrap gap-2">
              {inputAlphabet.map(sym => (
                <span key={sym} className="badge-primary flex items-center gap-1 pr-1">
                  <span className="font-mono">{sym}</span>
                  <button onClick={() => removeInputSymbol(sym)} className="hover:text-red-500 transition-colors">
                    <Trash2 size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newInput}
                onChange={e => setNewInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addInputSymbol()}
                placeholder="Symbol (e.g. 0, a, x)"
                className="input max-w-xs"
                id="new-input-symbol"
              />
              <button onClick={addInputSymbol} className="btn-primary" id="add-input-symbol-btn">
                <Plus size={14} /> Add Symbol
              </button>
            </div>
          </div>

          {/* Output Alphabet */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Output Alphabet (Δ)</label>
            <div className="flex flex-wrap gap-2">
              {outputAlphabet.map(sym => (
                <span key={sym} className="badge-accent flex items-center gap-1 pr-1">
                  <span className="font-mono">{sym}</span>
                  <button onClick={() => removeOutputSymbol(sym)} className="hover:text-red-500 transition-colors">
                    <Trash2 size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newOutput}
                onChange={e => setNewOutput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addOutputSymbol()}
                placeholder="Output symbol (e.g. 0, A, yes)"
                className="input max-w-xs"
                id="new-output-symbol"
              />
              <button onClick={addOutputSymbol} className="btn-accent" id="add-output-symbol-btn">
                <Plus size={14} /> Add Output
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Outputs */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="section-title">Define State Outputs</h3>
            <p className="section-subtitle">
              In a Moore machine, each state produces one output.
            </p>
          </div>

          <div className="alert-info text-sm">
            <strong>Moore principle:</strong> The output depends only on the current state, not the input.
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>Output (λ)</th>
                  <th>Initial?</th>
                </tr>
              </thead>
              <tbody>
                {states.map(state => (
                  <tr key={state}>
                    <td className="font-mono font-semibold text-primary-600 dark:text-primary-400">{state}</td>
                    <td>
                      <select
                        value={outputs[state] || ''}
                        onChange={e => setStateOutput(state, e.target.value)}
                        className="select max-w-xs"
                        id={`output-${state}`}
                      >
                        <option value="">Select output...</option>
                        {outputAlphabet.map(sym => (
                          <option key={sym} value={sym}>{sym}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {state === initialState && (
                        <span className="badge-primary">Initial</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 3: Transitions */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h3 className="section-title">Define Transitions</h3>
            <p className="section-subtitle">For each state and input, specify the next state (δ: Q × Σ → Q)</p>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>State</th>
                  {inputAlphabet.map(sym => (
                    <th key={sym}>
                      Input: <span className="font-mono text-primary-600 dark:text-primary-400">{sym}</span>
                    </th>
                  ))}
                  <th>Output</th>
                </tr>
              </thead>
              <tbody>
                {states.map(fromState => (
                  <tr key={fromState}>
                    <td className="font-mono font-semibold text-primary-600 dark:text-primary-400">
                      {fromState}
                      {fromState === initialState && (
                        <span className="ml-1 text-xs text-slate-400">(→)</span>
                      )}
                    </td>
                    {inputAlphabet.map(sym => (
                      <td key={sym}>
                        <select
                          value={transitions[fromState]?.[sym] || ''}
                          onChange={e => setTransition(fromState, sym, e.target.value)}
                          className="select w-28"
                          id={`trans-${fromState}-${sym}`}
                        >
                          <option value="">—</option>
                          {states.map(dest => (
                            <option key={dest} value={dest}>{dest}</option>
                          ))}
                        </select>
                      </td>
                    ))}
                    <td>
                      <span className="badge-accent font-mono">{outputs[fromState] ?? '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="space-y-5">
          <div>
            <h3 className="section-title">Review Your Moore Machine</h3>
            <p className="section-subtitle">Verify everything looks correct before building</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'States', value: states.join(', ') },
              { label: 'Input Σ', value: inputAlphabet.join(', ') },
              { label: 'Output Δ', value: outputAlphabet.join(', ') },
              { label: 'Initial', value: initialState },
            ].map(({ label, value }) => (
              <div key={label} className="card py-3 px-4">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</div>
                <div className="text-sm font-mono font-semibold text-slate-800 dark:text-white truncate">{value}</div>
              </div>
            ))}
          </div>

          {/* State outputs */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">State Outputs (λ)</h4>
            <div className="flex flex-wrap gap-2">
              {states.map(s => (
                <span key={s} className="badge-primary font-mono">
                  {s} → {outputs[s] ?? '?'}
                </span>
              ))}
            </div>
          </div>

          {/* Transition summary */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Transition Function (δ)</h4>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>State</th>
                    {inputAlphabet.map(sym => <th key={sym}>{sym}</th>)}
                    <th>Output</th>
                  </tr>
                </thead>
                <tbody>
                  {states.map(s => (
                    <tr key={s}>
                      <td className="font-mono font-semibold text-primary-600 dark:text-primary-400">{s}</td>
                      {inputAlphabet.map(sym => (
                        <td key={sym} className="font-mono">{transitions[s]?.[sym] || <span className="text-red-400">?</span>}</td>
                      ))}
                      <td><span className="badge-accent font-mono">{outputs[s] ?? '?'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="alert-error space-y-1">
              <div className="flex items-center gap-2 font-semibold mb-2">
                <AlertCircle size={16} /> Validation Errors
              </div>
              {errors.map((e, i) => <p key={i} className="text-sm">• {e}</p>)}
            </div>
          )}

          <button
            onClick={handleBuild}
            className="btn-primary w-full justify-center text-base py-3"
            id="build-moore-btn"
          >
            <Check size={18} />
            Build Moore Machine
          </button>
        </div>
      )}

      {/* Navigation buttons */}
      {step < 4 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-dark-border">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn-secondary"
            id="wizard-back-btn"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canGoNext()}
            className="btn-primary"
            id="wizard-next-btn"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
      {step === 4 && (
        <button
          onClick={() => setStep(3)}
          className="btn-secondary"
          id="wizard-back-from-review-btn"
        >
          <ChevronLeft size={16} /> Back to Transitions
        </button>
      )}
    </div>
  );
}
