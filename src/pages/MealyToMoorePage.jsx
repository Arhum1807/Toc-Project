import { useState } from 'react';
import { ArrowRight, AlertCircle, CheckCircle, Circle } from 'lucide-react';
import { useMachine } from '../context/MachineContext';
import MealyEditor from '../components/MealyEditor';
import MachineGraph from '../components/MachineGraph';
import ConversionSteps from '../components/ConversionSteps';
import MachineComparison from '../components/MachineComparison';
import { mealyToMoore } from '../algorithms/mealyToMoore';
import { validateMealy } from '../utils/validation';
import { mealyExamples } from '../data/examples';

const WORKFLOW = ['Enter Mealy', 'Review', 'Convert', 'Compare'];

export default function MealyToMoorePage() {
  const { state, actions } = useMachine();
  const [wfStep, setWfStep] = useState(0);
  const [mealyMachine, setMealyMachine] = useState(state.mealyMachine);
  const [mooreResult, setMooreResult] = useState(null);
  const [errors, setErrors] = useState([]);

  const handleMealyReady = (m) => {
    setMealyMachine(m);
    actions.setMealyMachine(m);
    setWfStep(1);
  };

  const handleConvert = () => {
    if (!mealyMachine) return;
    const { valid, errors: errs } = validateMealy(mealyMachine);
    if (!valid) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    const result = mealyToMoore(mealyMachine);
    setMooreResult(result);
    actions.setMooreMachine(result);
    actions.setConvertedMachine(result, 'MEALY_TO_MOORE');
    actions.notify('success', 'Converted to Moore machine successfully!');
    setWfStep(2);
  };

  const loadExample = (example) => {
    setMealyMachine(example.machine);
    actions.setMealyMachine(example.machine);
    setWfStep(1);
    actions.notify('info', `Loaded example: ${example.name}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="badge-accent p-2 rounded-xl"><span className="text-sm font-bold">M</span></div>
          <ArrowRight size={20} className="text-slate-400" />
          <div className="badge-primary p-2 rounded-xl"><Circle size={16} /></div>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Mealy → Moore Conversion</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            State-splitting algorithm — states with multiple incoming outputs are split
          </p>
        </div>
      </div>

      {/* Workflow steps */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {WORKFLOW.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-shrink-0">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              i === wfStep
                ? 'bg-accent-600 text-white shadow-md'
                : i < wfStep
                ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-400'
                : 'bg-slate-100 dark:bg-dark-border text-slate-400'
            }`}>
              {i < wfStep ? <CheckCircle size={14} /> : <span>{i + 1}</span>}
              {label}
            </div>
            {i < WORKFLOW.length - 1 && <ArrowRight size={14} className="text-slate-300 dark:text-slate-600" />}
          </div>
        ))}
      </div>

      {/* State splitting explanation */}
      <div className="card border-l-4 border-l-amber-400">
        <h4 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-500" />
          State Splitting — Key Concept
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          In a Mealy machine, different transitions can arrive at the same state with different outputs.
          A Moore machine requires a unique output per state. Therefore, if a state receives transitions
          with different outputs, it must be <strong>split into multiple Moore states</strong> — one per unique incoming output.
        </p>
        <div className="mt-3 font-mono text-xs bg-slate-900 dark:bg-black text-green-400 p-3 rounded-lg">
          <div className="text-slate-500">// Example: q1 receives two different outputs</div>
          <div>q0 --0/1--&gt; q1  →  creates: q1_1 (output=1)</div>
          <div>q2 --1/0--&gt; q1  →  creates: q1_0 (output=0)</div>
        </div>
      </div>

      {/* Examples */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Load an Example</h3>
        <div className="flex flex-wrap gap-2">
          {mealyExamples.map(ex => (
            <button
              key={ex.id}
              onClick={() => loadExample(ex)}
              className="btn-secondary text-xs"
              id={`load-mealy-example-${ex.id}`}
            >
              {ex.name}
            </button>
          ))}
        </div>
      </div>

      {/* Step 0 */}
      {wfStep === 0 && (
        <div className="card">
          <h3 className="section-title">Step 1: Enter Mealy Machine</h3>
          <MealyEditor onMachineReady={handleMealyReady} initialMachine={mealyMachine} />
        </div>
      )}

      {/* Step 1+ */}
      {wfStep >= 1 && mealyMachine && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Original Mealy */}
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title m-0">Original: Mealy Machine</h3>
                <span className="badge-accent">Mealy</span>
              </div>
              <MachineGraph machine={mealyMachine} machineType="MEALY" />
              <div className="table-wrapper mt-4">
                <table className="table">
                  <thead>
                    <tr>
                      <th>State</th>
                      {mealyMachine.inputAlphabet.map(s => <th key={s}>{s} → (next/out)</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {mealyMachine.states.map(st => (
                      <tr key={st}>
                        <td className="font-mono font-semibold text-accent-600 dark:text-accent-400">{st}</td>
                        {mealyMachine.inputAlphabet.map(sym => {
                          const t = mealyMachine.transitions[st]?.[sym];
                          return (
                            <td key={sym} className="font-mono">
                              {t ? <span className="badge-accent">{t.nextState}/{t.output}</span> : '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="alert-error">
                <div className="flex items-center gap-2 font-semibold mb-2"><AlertCircle size={16} />Errors</div>
                {errors.map((e, i) => <p key={i} className="text-sm">• {e}</p>)}
              </div>
            )}

            {wfStep === 1 && (
              <button onClick={handleConvert} className="btn-accent w-full justify-center py-3 text-base" id="convert-mealy-to-moore-btn">
                <ArrowRight size={18} />
                Convert to Moore Machine
              </button>
            )}
            <button onClick={() => { setMealyMachine(null); setMooreResult(null); setWfStep(0); }} className="btn-secondary w-full justify-center">
              ← Edit Mealy Machine
            </button>
          </div>

          {/* Converted Moore */}
          {wfStep >= 2 && mooreResult && (
            <div className="space-y-4">
              <div className="card border-2 border-primary-400 dark:border-primary-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="section-title m-0">Converted: Moore Machine</h3>
                  <span className="badge-primary flex items-center gap-1"><CheckCircle size={12} />Converted</span>
                </div>
                <MachineGraph machine={mooreResult} machineType="MOORE" />

                <div className="table-wrapper mt-4">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Moore State</th>
                        <th>From Mealy</th>
                        <th>Output</th>
                        {mooreResult.inputAlphabet.map(s => <th key={s}>{s}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {mooreResult.states.map(st => {
                        const detail = mooreResult.mooreStateDetails?.find(d => d.id === st);
                        return (
                          <tr key={st}>
                            <td className="font-mono font-semibold text-primary-600 dark:text-primary-400">
                              {st}
                              {st === mooreResult.initialState && <span className="ml-1 text-xs text-slate-400">(→)</span>}
                            </td>
                            <td className="font-mono text-slate-500">{detail?.mealyState ?? st}</td>
                            <td><span className="badge-accent font-mono">{mooreResult.outputs[st]}</span></td>
                            {mooreResult.inputAlphabet.map(sym => (
                              <td key={sym} className="font-mono">{mooreResult.transitions[st]?.[sym] ?? '—'}</td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <button onClick={() => setWfStep(3)} className="btn-primary w-full justify-center">
                Compare Outputs →
              </button>
            </div>
          )}
        </div>
      )}

      {wfStep >= 2 && mooreResult && (
        <ConversionSteps conversionResult={mooreResult} direction="MEALY_TO_MOORE" />
      )}

      {wfStep >= 3 && mooreResult && (
        <div className="card">
          <MachineComparison
            original={mealyMachine}
            converted={mooreResult}
            direction="MEALY_TO_MOORE"
          />
        </div>
      )}
    </div>
  );
}
