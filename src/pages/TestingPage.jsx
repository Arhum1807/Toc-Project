import { useState } from 'react';
import { Play, Plus, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useMachine } from '../context/MachineContext';
import { simulateMoore } from '../algorithms/simulateMoore';
import { simulateMealy } from '../algorithms/simulateMealy';

export default function TestingPage() {
  const { state } = useMachine();
  const [machineType, setMachineType] = useState('MOORE');
  const [tests, setTests] = useState([
    { id: 1, input: '', expected: '', result: null },
    { id: 2, input: '', expected: '', result: null },
  ]);
  const [ran, setRan] = useState(false);

  const machine = machineType === 'MOORE' ? state.mooreMachine : state.mealyMachine;

  const addTest = () => {
    const id = Date.now();
    setTests([...tests, { id, input: '', expected: '', result: null }]);
  };

  const removeTest = (id) => setTests(tests.filter(t => t.id !== id));

  const updateTest = (id, field, val) => {
    setTests(tests.map(t => t.id === id ? { ...t, [field]: val, result: null } : t));
  };

  const runTest = (t) => {
    if (!machine) return { ...t, result: { status: 'error', message: 'No machine loaded' } };
    const sim = machineType === 'MOORE'
      ? simulateMoore(machine, t.input)
      : simulateMealy(machine, t.input);

    if (sim.error) {
      return { ...t, result: { status: 'error', message: sim.error } };
    }

    const actual = machineType === 'MOORE'
      ? sim.outputSequence.slice(1).join('') // Drop initial state output for comparison
      : sim.outputString;

    const pass = actual === t.expected;
    return { ...t, result: { status: pass ? 'pass' : 'fail', actual, full: sim.outputString } };
  };

  const runAll = () => {
    setTests(tests.map(runTest));
    setRan(true);
  };

  const passCount = tests.filter(t => t.result?.status === 'pass').length;
  const failCount = tests.filter(t => t.result?.status === 'fail').length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-1">Test Suite</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Define test cases and verify your machine's behavior</p>
      </div>

      {/* Machine selector */}
      <div className="card flex flex-wrap items-center gap-4">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Machine:</span>
        <div className="flex gap-1 bg-slate-100 dark:bg-dark-surface rounded-xl p-1">
          {['MOORE', 'MEALY'].map(type => (
            <button
              key={type}
              onClick={() => { setMachineType(type); setRan(false); setTests(tests.map(t => ({ ...t, result: null }))); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                machineType === type
                  ? 'bg-white dark:bg-dark-card text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {!machine && (
          <div className="alert-warning flex items-center gap-2 py-2 px-3 text-xs">
            <AlertCircle size={14} />
            No {machineType} machine loaded. Go to the {machineType === 'MOORE' ? 'Moore' : 'Mealy'} page to build one.
          </div>
        )}

        {machine && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle size={14} className="text-green-500" />
            {machineType} machine loaded: {machine.states.length} states, Σ = {'{' + machine.inputAlphabet.join(', ') + '}'}
          </div>
        )}
      </div>

      {machineType === 'MOORE' && (
        <div className="alert-info text-sm">
          <strong>Note:</strong> For Moore machines, the comparison uses transition-aligned outputs (initial state output is excluded).
          Moore produces n+1 outputs for n inputs, but comparison uses the last n.
        </div>
      )}

      {/* Summary */}
      {ran && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: tests.length, color: 'primary' },
            { label: 'Passed', value: passCount, color: 'success' },
            { label: 'Failed', value: failCount, color: 'error' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`card py-3 px-4 text-center border-2 ${
              color === 'success' ? 'border-green-400' : color === 'error' ? 'border-red-400' : 'border-primary-400'
            }`}>
              <div className="text-3xl font-extrabold text-slate-800 dark:text-white">{value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Test cases */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Test Cases</h3>
          <div className="flex gap-2">
            <button onClick={addTest} className="btn-secondary text-xs" id="add-test-btn">
              <Plus size={13} /> Add Test
            </button>
            <button onClick={runAll} disabled={!machine} className="btn-primary text-xs" id="run-all-tests-btn">
              <Play size={13} /> Run All Tests
            </button>
          </div>
        </div>

        {tests.map((t, i) => (
          <div key={t.id} className={`card p-4 transition-all ${
            t.result?.status === 'pass' ? 'border-green-400 dark:border-green-700' :
            t.result?.status === 'fail' ? 'border-red-400 dark:border-red-700' : ''
          }`}>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-16">Test {i + 1}</span>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div>
                  <label className="text-xs text-slate-500 block mb-0.5">Input</label>
                  <input
                    type="text"
                    value={t.input}
                    onChange={e => updateTest(t.id, 'input', e.target.value)}
                    placeholder="Input string"
                    className="input font-mono w-32"
                    id={`test-input-${i}`}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-0.5">Expected Output</label>
                  <input
                    type="text"
                    value={t.expected}
                    onChange={e => updateTest(t.id, 'expected', e.target.value)}
                    placeholder="Expected"
                    className="input font-mono w-32"
                    id={`test-expected-${i}`}
                  />
                </div>
                {t.result && (
                  <div className="ml-2">
                    <label className="text-xs text-slate-500 block mb-0.5">Actual Output</label>
                    <span className={`badge font-mono text-sm px-3 py-1 ${
                      t.result.status === 'pass' ? 'badge-success' :
                      t.result.status === 'fail' ? 'badge-error' : 'bg-slate-100 dark:bg-dark-border text-slate-600'
                    }`}>
                      {t.result.actual ?? t.result.message}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                {t.result?.status === 'pass' && <CheckCircle size={20} className="text-green-500" />}
                {t.result?.status === 'fail' && <XCircle size={20} className="text-red-500" />}
                <button
                  onClick={() => setTests(tests.map(tt => tt.id === t.id ? runTest(tt) : tt))}
                  disabled={!machine}
                  className="btn-secondary text-xs py-1"
                  id={`run-test-${i}`}
                >
                  <Play size={12} /> Run
                </button>
                <button onClick={() => removeTest(t.id)} className="btn-ghost p-1.5 text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Results table */}
      {ran && tests.some(t => t.result) && (
        <div className="card">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Results Summary</h4>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Input</th>
                  <th>Expected</th>
                  <th>Actual</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t, i) => (
                  <tr key={t.id}>
                    <td>{i + 1}</td>
                    <td className="font-mono">{t.input || '(empty)'}</td>
                    <td className="font-mono">{t.expected || '(empty)'}</td>
                    <td className="font-mono">{t.result?.actual ?? '—'}</td>
                    <td>
                      {t.result?.status === 'pass' && <span className="badge-success">✓ Pass</span>}
                      {t.result?.status === 'fail' && <span className="badge-error">✗ Fail</span>}
                      {t.result?.status === 'error' && <span className="badge bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">⚠ Error</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
