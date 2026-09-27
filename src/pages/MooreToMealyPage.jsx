import { useState } from 'react';
import { ArrowRight, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { useMachine } from '../context/MachineContext';
import MooreEditor from '../components/MooreEditor';
import MachineGraph from '../components/MachineGraph';
import ConversionSteps from '../components/ConversionSteps';
import MachineComparison from '../components/MachineComparison';
import { mooreToMealy } from '../algorithms/mooreToMealy';
import { validateMoore } from '../utils/validation';
import { mooreExamples } from '../data/examples';

const WORKFLOW = ['Enter Moore', 'Review', 'Convert', 'Compare'];

export default function MooreToMealyPage() {
  const { state, actions } = useMachine();
  const [wfStep, setWfStep] = useState(0);
  const [mooreMachine, setMooreMachine] = useState(state.mooreMachine);
  const [mealyResult, setMealyResult] = useState(null);
  const [errors, setErrors] = useState([]);

  const handleMooreReady = (m) => {
    setMooreMachine(m);
    actions.setMooreMachine(m);
    setWfStep(1);
  };

  const handleConvert = () => {
    if (!mooreMachine) return;
    const { valid, errors: errs } = validateMoore(mooreMachine);
    if (!valid) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    const result = mooreToMealy(mooreMachine);
    setMealyResult(result);
    actions.setMealyMachine(result);
    actions.setConvertedMachine(result, 'MOORE_TO_MEALY');
    actions.notify('success', 'Converted to Mealy machine successfully!');
    setWfStep(2);
  };

  const loadExample = (example) => {
    setMooreMachine(example.machine);
    actions.setMooreMachine(example.machine);
    setWfStep(1);
    actions.notify('info', `Loaded example: ${example.name}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="badge-primary p-2 rounded-xl"><span className="font-bold text-sm">M</span></div>
          <ArrowRight size={20} className="text-slate-400" />
          <div className="badge-accent p-2 rounded-xl"><Zap size={16} /></div>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Moore → Mealy Conversion</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Attach each Moore state's output to its incoming Mealy transitions
          </p>
        </div>
      </div>

      {/* Workflow steps */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {WORKFLOW.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-shrink-0">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              i === wfStep
                ? 'bg-primary-600 text-white shadow-md'
                : i < wfStep
                ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-400'
                : 'bg-slate-100 dark:bg-dark-border text-slate-400'
            }`}>
              {i < wfStep ? <CheckCircle size={14} /> : <span className="w-5 h-5 flex items-center justify-center">{i + 1}</span>}
              {label}
            </div>
            {i < WORKFLOW.length - 1 && <ArrowRight size={14} className="text-slate-300 dark:text-slate-600" />}
          </div>
        ))}
      </div>

      {/* Examples */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Load an Example</h3>
        <div className="flex flex-wrap gap-2">
          {mooreExamples.map(ex => (
            <button
              key={ex.id}
              onClick={() => loadExample(ex)}
              className="btn-secondary text-xs"
              id={`load-moore-example-${ex.id}`}
            >
              {ex.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      {wfStep === 0 && (
        <div className="card">
          <h3 className="section-title">Step 1: Enter Moore Machine</h3>
          <MooreEditor onMachineReady={handleMooreReady} initialMachine={mooreMachine} />
        </div>
      )}

      {wfStep >= 1 && mooreMachine && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Original Moore */}
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title m-0">Original: Moore Machine</h3>
                <span className="badge-primary">Moore</span>
              </div>
              <MachineGraph machine={mooreMachine} machineType="MOORE" />

              <div className="table-wrapper mt-4">
                <table className="table">
                  <thead>
                    <tr>
                      <th>State</th>
                      {mooreMachine.inputAlphabet.map(s => <th key={s}>{s}</th>)}
                      <th>Output</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mooreMachine.states.map(st => (
                      <tr key={st}>
                        <td className="font-mono font-semibold text-primary-600 dark:text-primary-400">{st}</td>
                        {mooreMachine.inputAlphabet.map(sym => (
                          <td key={sym} className="font-mono">{mooreMachine.transitions[st]?.[sym] ?? '—'}</td>
                        ))}
                        <td><span className="badge-accent font-mono">{mooreMachine.outputs[st]}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="alert-error">
                <div className="flex items-center gap-2 font-semibold mb-2"><AlertCircle size={16} />Validation Errors</div>
                {errors.map((e, i) => <p key={i} className="text-sm">• {e}</p>)}
              </div>
            )}

            {wfStep === 1 && (
              <button onClick={handleConvert} className="btn-primary w-full justify-center py-3 text-base" id="convert-moore-to-mealy-btn">
                <ArrowRight size={18} />
                Convert to Mealy Machine
              </button>
            )}

            <button onClick={() => { setMooreMachine(null); setMealyResult(null); setWfStep(0); }} className="btn-secondary w-full justify-center">
              ← Edit Moore Machine
            </button>
          </div>

          {/* Converted Mealy */}
          {wfStep >= 2 && mealyResult && (
            <div className="space-y-4">
              <div className="card border-2 border-accent-400 dark:border-accent-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="section-title m-0">Converted: Mealy Machine</h3>
                  <span className="badge-accent flex items-center gap-1"><CheckCircle size={12} />Converted</span>
                </div>
                <MachineGraph machine={mealyResult} machineType="MEALY" />

                <div className="table-wrapper mt-4">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>State</th>
                        {mealyResult.inputAlphabet.map(s => <th key={s}>{s} → (next / out)</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {mealyResult.states.map(st => (
                        <tr key={st}>
                          <td className="font-mono font-semibold text-accent-600 dark:text-accent-400">{st}</td>
                          {mealyResult.inputAlphabet.map(sym => {
                            const t = mealyResult.transitions[st]?.[sym];
                            return (
                              <td key={sym} className="font-mono">
                                {t ? <span className="badge-accent">{t.nextState} / {t.output}</span> : '—'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Side-by-side conversion table */}
              <div className="card">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Conversion Mapping</h4>
                <div className="table-wrapper">
                  <table className="table text-xs">
                    <thead>
                      <tr>
                        <th>Moore Transition</th>
                        <th>Destination Output</th>
                        <th>Mealy Transition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mealyResult.conversionSteps.map((step, i) => (
                        <tr key={i}>
                          <td className="font-mono text-primary-600 dark:text-primary-400">{step.mooreTransition}</td>
                          <td><span className="badge-accent font-mono">λ({step.destinationState}) = {step.destinationOutput}</span></td>
                          <td className="font-mono text-accent-600 dark:text-accent-400">{step.mealyTransition}</td>
                        </tr>
                      ))}
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

      {/* Step 2: Conversion Steps */}
      {wfStep >= 2 && mealyResult && (
        <ConversionSteps conversionResult={mealyResult} direction="MOORE_TO_MEALY" />
      )}

      {/* Step 3: Compare */}
      {wfStep >= 3 && mealyResult && (
        <div className="card">
          <MachineComparison
            original={mooreMachine}
            converted={mealyResult}
            direction="MOORE_TO_MEALY"
          />
        </div>
      )}
    </div>
  );
}
