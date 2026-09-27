import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMachine } from '../context/MachineContext';
import { mooreExamples, mealyExamples } from '../data/examples';
import MachineGraph from '../components/MachineGraph';
import SimulationPanel from '../components/SimulationPanel';
import { BookMarked, Circle, Zap, ChevronDown, ChevronUp } from 'lucide-react';

function ExampleCard({ example, onLoad, onConvert }) {
  const [expanded, setExpanded] = useState(false);
  const isMoore = example.category === 'Moore';

  return (
    <div className={`card transition-all ${isMoore ? 'border-primary-200 dark:border-primary-900' : 'border-accent-200 dark:border-accent-900'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {isMoore
            ? <Circle size={18} className="text-primary-600 dark:text-primary-400 flex-shrink-0" />
            : <Zap size={18} className="text-accent-600 dark:text-accent-400 flex-shrink-0" />
          }
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white">{example.name}</h3>
            <span className={`badge text-xs ${isMoore ? 'badge-primary' : 'badge-accent'}`}>{example.category}</span>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="btn-ghost p-1.5 flex-shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{example.description}</p>

      <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
        <span>States: <strong className="text-slate-700 dark:text-slate-300">{example.machine.states.join(', ')}</strong></span>
        <span>Σ: <strong className="text-slate-700 dark:text-slate-300">{example.machine.inputAlphabet.join(', ')}</strong></span>
        <span>Δ: <strong className="text-slate-700 dark:text-slate-300">{example.machine.outputAlphabet.join(', ')}</strong></span>
        <span>Sample: <strong className="font-mono text-slate-700 dark:text-slate-300">{example.sampleInput}</strong></span>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 animate-fade-in">
          <MachineGraph machine={example.machine} machineType={example.category.toUpperCase()} />
          <div className="table-wrapper">
            {isMoore ? (
              <table className="table text-xs">
                <thead>
                  <tr>
                    <th>State</th>
                    {example.machine.inputAlphabet.map(s => <th key={s}>{s}</th>)}
                    <th>Output</th>
                  </tr>
                </thead>
                <tbody>
                  {example.machine.states.map(st => (
                    <tr key={st}>
                      <td className="font-mono font-semibold text-primary-600 dark:text-primary-400">{st}</td>
                      {example.machine.inputAlphabet.map(sym => (
                        <td key={sym} className="font-mono">{example.machine.transitions[st]?.[sym] ?? '—'}</td>
                      ))}
                      <td><span className="badge-accent font-mono">{example.machine.outputs[st]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="table text-xs">
                <thead>
                  <tr>
                    <th>State</th>
                    {example.machine.inputAlphabet.map(s => <th key={s}>{s} → (next/out)</th>)}
                  </tr>
                </thead>
                <tbody>
                  {example.machine.states.map(st => (
                    <tr key={st}>
                      <td className="font-mono font-semibold text-accent-600 dark:text-accent-400">{st}</td>
                      {example.machine.inputAlphabet.map(sym => {
                        const t = example.machine.transitions[st]?.[sym];
                        return <td key={sym} className="font-mono">{t ? `${t.nextState}/${t.output}` : '—'}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button onClick={() => onLoad(example)} className="btn-primary text-xs" id={`load-${example.id}`}>
          Load into Editor
        </button>
        <button onClick={() => onConvert(example)} className="btn-secondary text-xs" id={`convert-${example.id}`}>
          {isMoore ? 'Convert → Mealy' : 'Convert → Moore'}
        </button>
      </div>
    </div>
  );
}

export default function ExamplesPage() {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  const [filter, setFilter] = useState(filterParam || 'all');
  const { actions } = useMachine();
  const navigate = (typeof window !== 'undefined') ? (p) => window.location.href = p : () => {};

  const examples = filter === 'moore' ? mooreExamples : filter === 'mealy' ? mealyExamples : [...mooreExamples, ...mealyExamples];

  const handleLoad = (example) => {
    if (example.category === 'Moore') {
      actions.setMooreMachine(example.machine);
      actions.notify('success', `Loaded: ${example.name}`);
    } else {
      actions.setMealyMachine(example.machine);
      actions.notify('success', `Loaded: ${example.name}`);
    }
  };

  const handleConvert = (example) => {
    if (example.category === 'Moore') {
      actions.setMooreMachine(example.machine);
      window.location.hash = '#/moore-to-mealy';
    } else {
      actions.setMealyMachine(example.machine);
      window.location.hash = '#/mealy-to-moore';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <BookMarked size={24} className="text-primary-600 dark:text-primary-400" />
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Examples</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Built-in Moore and Mealy machine examples — load, view, and convert</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-slate-100 dark:bg-dark-surface rounded-xl p-1 w-fit">
        {['all', 'moore', 'mealy'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              filter === f
                ? 'bg-white dark:bg-dark-card text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
            id={`filter-${f}`}
          >
            {f === 'all' ? 'All Examples' : f === 'moore' ? 'Moore' : 'Mealy'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {examples.map(ex => (
          <ExampleCard key={ex.id} example={ex} onLoad={handleLoad} onConvert={handleConvert} />
        ))}
      </div>
    </div>
  );
}
