import { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

export default function ConversionSteps({ conversionResult, direction }) {
  const [expanded, setExpanded] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState({});

  if (!conversionResult) return null;

  const toggleStep = (i) => setExpandedSteps(prev => ({ ...prev, [i]: !prev[i] }));

  const isMooreToMealy = direction === 'MOORE_TO_MEALY';

  return (
    <div className="space-y-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-950/30 rounded-xl border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-950/50 transition-colors"
        id="toggle-conversion-steps"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <span className="font-semibold text-primary-700 dark:text-primary-300">
            {isMooreToMealy ? 'Moore → Mealy Conversion Steps' : 'Mealy → Moore Conversion Steps'}
          </span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-primary-600" /> : <ChevronDown size={16} className="text-primary-600" />}
      </button>

      {expanded && (
        <div className="space-y-3 animate-fade-in">
          {/* Algorithm overview */}
          <div className="card border-l-4 border-l-primary-500">
            <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Algorithm Overview</h4>
            {isMooreToMealy ? (
              <ol className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2"><span className="badge-primary mt-0.5 flex-shrink-0">1</span>Read each Moore state output (λ function)</li>
                <li className="flex items-start gap-2"><span className="badge-primary mt-0.5 flex-shrink-0">2</span>For each Moore transition: q_i --a--{'>'} q_j</li>
                <li className="flex items-start gap-2"><span className="badge-primary mt-0.5 flex-shrink-0">3</span>Look up the output of the DESTINATION state: λ(q_j)</li>
                <li className="flex items-start gap-2"><span className="badge-primary mt-0.5 flex-shrink-0">4</span>Attach that output to the transition: q_i --a/λ(q_j)--{'>'} q_j</li>
                <li className="flex items-start gap-2"><span className="badge-primary mt-0.5 flex-shrink-0">5</span>States remain the same — only outputs move from states to transitions</li>
              </ol>
            ) : (
              <ol className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2"><span className="badge-accent mt-0.5 flex-shrink-0">1</span>For each destination state, collect all incoming transition outputs</li>
                <li className="flex items-start gap-2"><span className="badge-accent mt-0.5 flex-shrink-0">2</span>If a state receives one unique output: create one Moore state</li>
                <li className="flex items-start gap-2"><span className="badge-accent mt-0.5 flex-shrink-0">3</span>If a state receives multiple outputs: SPLIT into multiple Moore states</li>
                <li className="flex items-start gap-2"><span className="badge-accent mt-0.5 flex-shrink-0">4</span>Rebuild all transitions between new Moore states</li>
                <li className="flex items-start gap-2"><span className="badge-accent mt-0.5 flex-shrink-0">5</span>Handle the initial state (no incoming transitions: assign default output)</li>
              </ol>
            )}
          </div>

          {/* Per-transition steps */}
          {isMooreToMealy && conversionResult.conversionSteps?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Per-Transition Conversion</h4>
              {conversionResult.conversionSteps.map((step, i) => (
                <div key={i} className="rounded-xl border border-slate-200 dark:border-dark-border overflow-hidden">
                  <button
                    onClick={() => toggleStep(i)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-dark-card hover:bg-slate-50 dark:hover:bg-dark-surface transition-colors text-left"
                  >
                    <span className="badge-primary text-xs flex-shrink-0">Step {i + 1}</span>
                    <span className="font-mono text-sm text-slate-700 dark:text-slate-300 flex-1 min-w-0 truncate">
                      {step.mooreTransition} → {step.mealyTransition}
                    </span>
                    {expandedSteps[i] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expandedSteps[i] && (
                    <div className="px-4 pb-4 pt-2 bg-slate-50 dark:bg-dark-surface text-sm space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="code-block text-center py-2">
                          <div className="text-slate-500 text-xs mb-1">Moore Transition</div>
                          <div className="text-green-400 font-mono">{step.mooreTransition}</div>
                        </div>
                        <div className="flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-xs text-slate-500 mb-1">Output of {step.destinationState}</div>
                            <div className="badge-accent text-lg px-4 py-1">λ({step.destinationState}) = {step.destinationOutput}</div>
                          </div>
                        </div>
                        <div className="code-block text-center py-2">
                          <div className="text-slate-500 text-xs mb-1">Mealy Transition</div>
                          <div className="text-purple-400 font-mono">{step.mealyTransition}</div>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">
                        Because the destination state <strong>{step.destinationState}</strong> has Moore output <strong>"{step.destinationOutput}"</strong>,
                        the Mealy transition on input <strong>"{step.inputSymbol}"</strong> from <strong>{step.fromState}</strong> gets output <strong>"{step.destinationOutput}"</strong>.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Mealy to Moore state mapping */}
          {!isMooreToMealy && conversionResult.conversionSteps?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">State Creation Steps</h4>
              {conversionResult.conversionSteps.map((step, i) => (
                <div key={i} className={`rounded-xl border p-3 text-sm ${
                  step.type === 'split_start'
                    ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20'
                    : step.type === 'split_state'
                    ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/20 ml-4'
                    : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card'
                }`}>
                  <p className="text-slate-700 dark:text-slate-300 font-mono text-xs">{step.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Transition rebuild steps for Mealy → Moore */}
          {!isMooreToMealy && conversionResult.transitionSteps?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Rebuilt Transitions</h4>
              <div className="table-wrapper">
                <table className="table text-xs">
                  <thead>
                    <tr>
                      <th>From (Moore)</th>
                      <th>Input</th>
                      <th>Mealy</th>
                      <th>To (Moore)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversionResult.transitionSteps.slice(0, 30).map((ts, i) => (
                      <tr key={i}>
                        <td className="font-mono text-primary-600 dark:text-primary-400">{ts.fromMooreState}</td>
                        <td className="font-mono">{ts.symbol}</td>
                        <td className="font-mono text-slate-500">{ts.fromMealyState} --{ts.symbol}/{ts.mealyOutput}--{'>'} {ts.toMealyState}</td>
                        <td className="font-mono text-primary-600 dark:text-primary-400">{ts.toMooreState}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
