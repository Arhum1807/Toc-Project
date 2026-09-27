import { useState } from 'react';
import { Circle, CheckCircle } from 'lucide-react';
import { useMachine } from '../context/MachineContext';
import MooreEditor from '../components/MooreEditor';
import MachineGraph from '../components/MachineGraph';
import SimulationPanel from '../components/SimulationPanel';
import ImportExport from '../components/ImportExport';

const TABS = ['Editor', 'Graph', 'Simulate'];

export default function MoorePage() {
  const { state, actions } = useMachine();
  const [tab, setTab] = useState('Editor');
  const [highlightedState, setHighlightedState] = useState(null);

  const machine = state.mooreMachine;

  const handleMachineReady = (m) => {
    actions.setMooreMachine(m);
    actions.notify('success', 'Moore machine built successfully!');
    setTab('Graph');
  };

  const handleEdit = () => setTab('Editor');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Circle size={22} className="text-primary-600 dark:text-primary-400" />
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Moore Machine</h1>
            {machine && <span className="badge-success flex items-center gap-1"><CheckCircle size={12} />Ready</span>}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            M = (Q, Σ, Δ, δ, λ, q₀) — Output depends only on the current state
          </p>
        </div>

        {machine && (
          <ImportExport
            machine={machine}
            machineType="MOORE"
            onImport={handleMachineReady}
          />
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-dark-surface rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-white dark:bg-dark-card text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            id={`moore-tab-${t.toLowerCase()}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="card">
        {tab === 'Editor' && (
          <MooreEditor
            onMachineReady={handleMachineReady}
            initialMachine={machine}
          />
        )}
        {tab === 'Graph' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="section-title">State Diagram — View Only</h3>
                <p className="section-subtitle">
                  Pan &amp; zoom to explore. ⊙ = initial state &nbsp;|&nbsp;
                  <span style={{ color: '#10b981' }}>inner ring</span> = final state
                </p>
              </div>
              {machine && (
                <button
                  onClick={handleEdit}
                  className="btn-primary text-sm"
                  id="moore-graph-edit-btn"
                >
                  ✏️ Edit Machine
                </button>
              )}
            </div>
            {!machine ? (
              <div className="alert-warning">No Moore machine built yet. Go to the Editor tab to create one.</div>
            ) : (
              <MachineGraph machine={machine} machineType="MOORE" highlightedState={highlightedState} readOnly={true} />
            )}

            {machine && (
              <div className="table-wrapper mt-4">
                <table className="table">
                  <thead>
                    <tr>
                      <th>State</th>
                      {machine.inputAlphabet.map(s => <th key={s}>δ({s})</th>)}
                      <th>Output λ(q)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {machine.states.map(s => (
                      <tr key={s}>
                        <td className="font-mono font-semibold text-primary-600 dark:text-primary-400">
                          {s === machine.initialState ? '→ ' : ''}{s}
                          {machine.finalStates?.includes(s) && <span className="ml-1 text-xs text-emerald-400">(F)</span>}
                        </td>
                        {machine.inputAlphabet.map(sym => (
                          <td key={sym} className="font-mono">{machine.transitions[s]?.[sym] ?? '—'}</td>
                        ))}
                        <td><span className="badge-accent font-mono">{machine.outputs[s]}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {tab === 'Simulate' && (
          <>
            {!machine ? (
              <div className="alert-warning">Build a Moore machine first in the Editor tab.</div>
            ) : (
              <>
                <MachineGraph machine={machine} machineType="MOORE" highlightedState={highlightedState} readOnly={true} />
                <div className="mt-4">
                  <SimulationPanel
                    machine={machine}
                    machineType="MOORE"
                    onHighlight={setHighlightedState}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Import/Export at bottom for build tab */}
      {tab === 'Editor' && !machine && (
        <div className="card">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Or import an existing machine:</h4>
          <ImportExport machine={null} machineType="MOORE" onImport={handleMachineReady} />
        </div>
      )}
    </div>
  );
}
