import { useState, useRef } from 'react';
import { Play, SkipForward, RotateCcw, ChevronRight } from 'lucide-react';
import { simulateMoore } from '../algorithms/simulateMoore';
import { simulateMealy } from '../algorithms/simulateMealy';

export default function SimulationPanel({ machine, machineType = 'MOORE', onHighlight }) {
  const [inputString, setInputString] = useState('');
  const [result, setResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  const handleSimulate = () => {
    if (!machine) return;
    setError(null);
    const res = machineType === 'MOORE'
      ? simulateMoore(machine, inputString)
      : simulateMealy(machine, inputString);

    if (res.error) {
      setError(res.error);
      setResult(null);
      return;
    }

    setResult(res);
    setCurrentStep(0);

    // Highlight initial state on graph
    const firstState = res.steps[0]?.state ?? res.steps[0]?.fromState ?? machine.initialState;
    if (onHighlight) onHighlight(firstState);
  };

  const handleStep = () => {
    if (!result) return;
    const nextStep = currentStep + 1;
    if (nextStep >= result.steps.length) return;
    setCurrentStep(nextStep);

    // Highlight current state on graph
    const step = result.steps[nextStep];
    const state = step.state ?? step.toState ?? machine.initialState;
    if (onHighlight) onHighlight(state);
  };

  const handleReset = () => {
    setResult(null);
    setCurrentStep(-1);
    setError(null);
    if (onHighlight) onHighlight(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="section-title">Simulate Machine</h3>
        <p className="section-subtitle">Enter an input string and run the machine</p>
      </div>

      {/* Input */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={inputString}
          onChange={e => setInputString(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSimulate()}
          placeholder={`Input string (e.g. ${machine?.inputAlphabet?.slice(0,2).join('') ?? '01'}10)`}
          className="input flex-1 min-w-0 font-mono"
          id="simulation-input"
        />
        <button onClick={handleSimulate} disabled={!machine} className="btn-primary" id="simulate-btn">
          <Play size={15} /> Simulate
        </button>
        <button onClick={handleStep} disabled={!result || currentStep >= (result?.steps?.length ?? 0) - 1} className="btn-secondary" id="step-btn">
          <SkipForward size={15} /> Step
        </button>
        <button onClick={handleReset} className="btn-ghost" id="reset-btn">
          <RotateCcw size={15} /> Reset
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="alert-error text-sm">{error}</div>
      )}

      {/* Output summary */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Output string */}
          <div className="card py-3 px-5 flex flex-wrap items-center gap-4">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Input</div>
              <div className="font-mono font-bold text-lg tracking-widest text-slate-800 dark:text-white">
                {inputString || <span className="text-slate-400">(empty)</span>}
              </div>
            </div>
            <ChevronRight className="text-slate-400" size={20} />
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Output</div>
              <div className="font-mono font-bold text-lg tracking-widest text-primary-600 dark:text-primary-400">
                {result.outputString || <span className="text-slate-400">(empty)</span>}
              </div>
            </div>
            {machineType === 'MOORE' && (
              <div className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                Output length: {result.outputSequence.length} (input + 1)
              </div>
            )}
          </div>

          {/* Step-by-step trace */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {result.steps.map((step, i) => {
              const isActive = i === currentStep;
              const isDone = i < currentStep;
              return (
                <div key={i} className={`sim-step ${isActive ? 'sim-step-active' : ''} transition-all duration-200`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${isActive ? 'bg-primary-600 text-white' : isDone ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-dark-border text-slate-500'}`}>
                    {isDone ? '✓' : i}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{step.description}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {machineType === 'MOORE' ? (
                        <>
                          <span className="badge-primary font-mono">State: {step.state}</span>
                          <span className="badge-accent font-mono">Output: {step.output}</span>
                          {step.inputSymbol && <span className="badge-primary font-mono">Input: {step.inputSymbol}</span>}
                          {step.isInitial && <span className="badge-success">Initial</span>}
                        </>
                      ) : (
                        <>
                          <span className="badge-primary font-mono">{step.fromState}</span>
                          <span className="text-xs text-slate-400">→</span>
                          <span className="badge-primary font-mono">{step.toState}</span>
                          <span className="badge-accent font-mono">/{step.output}</span>
                          <span className="badge-primary font-mono">in: {step.inputSymbol}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !error && (
        <div className="text-center py-8 text-slate-400 dark:text-slate-600">
          <Play size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Enter an input string and click Simulate</p>
        </div>
      )}
    </div>
  );
}
