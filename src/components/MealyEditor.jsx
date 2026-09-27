import { useState } from 'react';
import { Plus, Trash2, RefreshCw, ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { validateMealy } from '../utils/validation';

const STEPS = ['States', 'Alphabet', 'Transitions', 'Review'];

function generateStates(count) {
  return Array.from({ length: count }, (_, i) => `q${i}`);
}

export default function MealyEditor({ onMachineReady, initialMachine }) {
  const [step, setStep] = useState(0);

  const [stateCount, setStateCount] = useState(initialMachine?.states?.length || 3);
  const [states, setStates] = useState(initialMachine?.states || generateStates(3));
  const [inputAlphabet, setInputAlphabet] = useState(initialMachine?.inputAlphabet || ['0', '1']);
  const [outputAlphabet, setOutputAlphabet] = useState(initialMachine?.outputAlphabet || ['0', '1']);
  const [initialState, setInitialState] = useState(initialMachine?.initialState || 'q0');
  const [finalStates, setFinalStates] = useState(initialMachine?.finalStates || []);
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
    if (initialState === old) setInitialState(val);

    const newTransitions = {};
    for (const [fromState, symMap] of Object.entries(transitions)) {
      const newFrom = fromState === old ? val : fromState;
      newTransitions[newFrom] = {};
      for (const [sym, trans] of Object.entries(symMap)) {
        newTransitions[newFrom][sym] = {
          nextState: trans.nextState === old ? val : trans.nextState,
          output: trans.output,
        };
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
    const newTransitions = {};
    for (const [fromState, symMap] of Object.entries(transitions)) {
      if (fromState === removed) continue;
      newTransitions[fromState] = {};
      for (const [sym, trans] of Object.entries(symMap)) {
        if (trans.nextState !== removed) newTransitions[fromState][sym] = trans;
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

  // ─── Step 2: Transitions ────────────────────────────────────────────────────
  const setTransitionField = (fromState, symbol, field, val) => {
    setTransitions(prev => ({
      ...prev,
      [fromState]: {
        ...(prev[fromState] || {}),
        [symbol]: {
          ...(prev[fromState]?.[symbol] || {}),
          [field]: val,
        },
      },
    }));
  };

  // ─── Navigation ─────────────────────────────────────────────────────────────
  const canGoNext = () => {
    if (step === 0) return states.length > 0 && states.every(s => s.trim() !== '');
    if (step === 1) return inputAlphabet.length > 0 && outputAlphabet.length > 0;
    if (step === 2) {
      return states.every(s =>
        inputAlphabet.every(sym => {
          const t = transitions[s]?.[sym];
          return t?.nextState && t?.output;
        })
      );
    }
    return true;
  };

  const stepDone = (s) => {
    if (s === 0) return states.length > 0 && states.every(st => st.trim() !== '');
    if (s === 1) return inputAlphabet.length > 0 && outputAlphabet.length > 0;
    if (s === 2) return states.every(st => inputAlphabet.every(sym => {
      const t = transitions[st]?.[sym];
      return t?.nextState && t?.output;
    }));
    return false;
  };

  const handleNext = () => {
    if (canGoNext()) {
      setErrors([]);
      setStep(s => Math.min(s + 1, STEPS.length - 1));
    }
  };

  const handleBuild = () => {
    const machine = {
      type: 'MEALY',
      states,
      inputAlphabet,
      outputAlphabet,
      initialState,
      finalStates,
      transitions,
    };
    const { valid, errors: errs } = validateMealy(machine);
    if (!valid) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    onMachineReady(machine);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Steps indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-1">
            <button
              onClick={() => i <= step && setStep(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                i === step
                  ? 'bg-accent-600 text-white shadow-md'
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
            <p className="section-subtitle">How many states does your Mealy machine have?</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-xs">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Number of States</label>
              <input
                type="number" min={1} max={20}
                value={stateCount}
                onChange={e => setStateCount(e.target.value)}
                className="input"
                id="mealy-state-count"
              />
            </div>
            <button onClick={handleGenerateStates} className="btn-accent mt-5" id="mealy-generate-states-btn">
              <RefreshCw size={15} /> Generate States
            </button>
          </div>

          <div className="space-y-2">
            {states.map((state, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-accent-100 dark:bg-accent-950 flex items-center justify-center text-xs font-bold text-accent-600 dark:text-accent-300 flex-shrink-0">
                  {idx}
                </div>
                <input
                  type="text"
                  value={state}
                  onChange={e => handleRenameState(idx, e.target.value)}
                  className="input max-w-xs"
                  placeholder={`q${idx}`}
                  id={`mealy-state-${idx}`}
                />
                <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                  <input
                    type="radio"
                    name="mealyInitialState"
                    checked={initialState === state}
                    onChange={() => setInitialState(state)}
                    className="accent-accent-600"
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
                    id={`mealy-final-state-${idx}`}
                  />
                  <span style={{ fontWeight: finalStates.includes(state) ? 700 : 400 }}>Final</span>
                </label>
                <button
                  onClick={() => handleRemoveState(idx)}
                  className="btn-ghost p-1.5 text-red-500"
                  disabled={states.length <= 1}
                  id={`mealy-remove-state-${idx}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button
              onClick={() => setStates([...states, `q${states.length}`])}
              className="btn-outline border-accent-500 text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-950 text-xs mt-2"
              id="mealy-add-state-btn"
            >
              <Plus size={13} /> Add State
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Alphabets */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="section-title">Define Alphabets</h3>
            <p className="section-subtitle">Specify input and output symbol sets</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Input Alphabet (Σ)</label>
            <div className="flex flex-wrap gap-2">
              {inputAlphabet.map(sym => (
                <span key={sym} className="badge-primary flex items-center gap-1 pr-1">
                  <span className="font-mono">{sym}</span>
                  <button onClick={() => removeInputSymbol(sym)} className="hover:text-red-500"><Trash2 size={11} /></button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text" value={newInput} onChange={e => setNewInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addInputSymbol()}
                placeholder="Symbol" className="input max-w-xs" id="mealy-new-input"
              />
              <button onClick={addInputSymbol} className="btn-primary" id="mealy-add-input-btn">
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Output Alphabet (Δ)</label>
            <div className="flex flex-wrap gap-2">
              {outputAlphabet.map(sym => (
                <span key={sym} className="badge-accent flex items-center gap-1 pr-1">
                  <span className="font-mono">{sym}</span>
                  <button onClick={() => removeOutputSymbol(sym)} className="hover:text-red-500"><Trash2 size={11} /></button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text" value={newOutput} onChange={e => setNewOutput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addOutputSymbol()}
                placeholder="Output symbol" className="input max-w-xs" id="mealy-new-output"
              />
              <button onClick={addOutputSymbol} className="btn-accent" id="mealy-add-output-btn">
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Transitions */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="section-title">Define Transitions</h3>
            <p className="section-subtitle">
              In a Mealy machine, each transition has a next state AND an output.
            </p>
          </div>

          <div className="alert-info text-sm">
            <strong>Mealy principle:</strong> The output depends on the current state AND the input symbol.
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>State</th>
                  {inputAlphabet.map(sym => (
                    <th key={sym} colSpan={2}>
                      Input: <span className="font-mono text-accent-600 dark:text-accent-400">{sym}</span>
                    </th>
                  ))}
                </tr>
                <tr>
                  <th></th>
                  {inputAlphabet.map(sym => (
                    <>
                      <th key={`${sym}-next`} className="text-xs text-slate-500">Next State</th>
                      <th key={`${sym}-out`} className="text-xs text-slate-500">Output</th>
                    </>
                  ))}
                </tr>
              </thead>
              <tbody>
                {states.map(fromState => (
                  <tr key={fromState}>
                    <td className="font-mono font-semibold text-accent-600 dark:text-accent-400">
                      {fromState}
                      {fromState === initialState && <span className="ml-1 text-xs text-slate-400">(→)</span>}
                    </td>
                    {inputAlphabet.map(sym => (
                      <>
                        <td key={`${fromState}-${sym}-next`}>
                          <select
                            value={transitions[fromState]?.[sym]?.nextState || ''}
                            onChange={e => setTransitionField(fromState, sym, 'nextState', e.target.value)}
                            className="select w-24"
                            id={`mealy-trans-${fromState}-${sym}-next`}
                          >
                            <option value="">—</option>
                            {states.map(dest => (
                              <option key={dest} value={dest}>{dest}</option>
                            ))}
                          </select>
                        </td>
                        <td key={`${fromState}-${sym}-out`}>
                          <select
                            value={transitions[fromState]?.[sym]?.output || ''}
                            onChange={e => setTransitionField(fromState, sym, 'output', e.target.value)}
                            className="select w-20"
                            id={`mealy-trans-${fromState}-${sym}-out`}
                          >
                            <option value="">—</option>
                            {outputAlphabet.map(o => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                        </td>
                      </>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h3 className="section-title">Review Your Mealy Machine</h3>
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

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>State</th>
                  {inputAlphabet.map(sym => (
                    <th key={sym}>{sym} → (next / out)</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {states.map(s => (
                  <tr key={s}>
                    <td className="font-mono font-semibold text-accent-600 dark:text-accent-400">{s}</td>
                    {inputAlphabet.map(sym => {
                      const t = transitions[s]?.[sym];
                      return (
                        <td key={sym} className="font-mono">
                          {t?.nextState && t?.output
                            ? <span className="badge-accent">{t.nextState} / {t.output}</span>
                            : <span className="text-red-400">?</span>
                          }
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
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
            className="btn-accent w-full justify-center text-base py-3"
            id="build-mealy-btn"
          >
            <Check size={18} />
            Build Mealy Machine
          </button>
        </div>
      )}

      {/* Navigation */}
      {step < 3 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-dark-border">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="btn-secondary">
            <ChevronLeft size={16} /> Back
          </button>
          <button onClick={handleNext} disabled={!canGoNext()} className="btn-accent">
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
      {step === 3 && (
        <button onClick={() => setStep(2)} className="btn-secondary">
          <ChevronLeft size={16} /> Back to Transitions
        </button>
      )}
    </div>
  );
}
