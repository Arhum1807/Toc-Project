import { useState } from 'react';
import { useMachine } from '../context/MachineContext';
import MachineComparison from '../components/MachineComparison';
import MachineGraph from '../components/MachineGraph';
import { GitCompare, AlertCircle } from 'lucide-react';

export default function ComparePage() {
  const { state } = useMachine();
  const [direction, setDirection] = useState('MOORE_TO_MEALY');

  const original = direction === 'MOORE_TO_MEALY' ? state.mooreMachine : state.mealyMachine;
  const converted = state.convertedMachine;

  const hasConversion = converted && state.conversionDirection === direction;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <GitCompare size={24} className="text-primary-600 dark:text-primary-400" />
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Compare Machines</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Run both machines on the same input and compare outputs side-by-side</p>
        </div>
      </div>

      {/* Direction selector */}
      <div className="flex gap-1 bg-slate-100 dark:bg-dark-surface rounded-xl p-1 w-fit">
        {[
          { val: 'MOORE_TO_MEALY', label: 'Moore → Mealy' },
          { val: 'MEALY_TO_MOORE', label: 'Mealy → Moore' },
        ].map(({ val, label }) => (
          <button
            key={val}
            onClick={() => setDirection(val)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              direction === val
                ? 'bg-white dark:bg-dark-card text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
            id={`compare-direction-${val}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Status */}
      {!original && (
        <div className="alert-warning flex items-center gap-2">
          <AlertCircle size={16} />
          No {direction === 'MOORE_TO_MEALY' ? 'Moore' : 'Mealy'} machine loaded.
          Go to the {direction === 'MOORE_TO_MEALY' ? 'Moore → Mealy' : 'Mealy → Moore'} page to create and convert one.
        </div>
      )}

      {original && !hasConversion && (
        <div className="alert-warning flex items-center gap-2">
          <AlertCircle size={16} />
          No converted machine found for this direction.
          Go to the conversion page first.
        </div>
      )}

      {/* Side-by-side graphs */}
      {original && hasConversion && converted && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  Original ({direction === 'MOORE_TO_MEALY' ? 'Moore' : 'Mealy'})
                </h3>
                <span className={direction === 'MOORE_TO_MEALY' ? 'badge-primary' : 'badge-accent'}>
                  {direction === 'MOORE_TO_MEALY' ? 'Moore' : 'Mealy'}
                </span>
              </div>
              <MachineGraph
                machine={original}
                machineType={direction === 'MOORE_TO_MEALY' ? 'MOORE' : 'MEALY'}
              />
            </div>
            <div className="card border-2 border-green-400 dark:border-green-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  Converted ({direction === 'MOORE_TO_MEALY' ? 'Mealy' : 'Moore'})
                </h3>
                <span className={direction === 'MOORE_TO_MEALY' ? 'badge-accent' : 'badge-primary'}>
                  {direction === 'MOORE_TO_MEALY' ? 'Mealy' : 'Moore'}
                </span>
              </div>
              <MachineGraph
                machine={converted}
                machineType={direction === 'MOORE_TO_MEALY' ? 'MEALY' : 'MOORE'}
              />
            </div>
          </div>

          {/* Comparison */}
          <div className="card">
            <MachineComparison
              original={original}
              converted={converted}
              direction={direction}
            />
          </div>
        </>
      )}
    </div>
  );
}
