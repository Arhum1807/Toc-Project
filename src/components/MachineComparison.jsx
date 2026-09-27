import { useState } from 'react';
import { Play, Info } from 'lucide-react';
import { simulateMoore } from '../algorithms/simulateMoore';
import { simulateMealy } from '../algorithms/simulateMealy';

export default function MachineComparison({ original, converted, direction }) {
  const [inputString, setInputString] = useState('');
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState(null);

  const handleCompare = () => {
    if (!original || !converted) return;
    setError(null);

    const isMooreToMealy = direction === 'MOORE_TO_MEALY';

    let origResult, convResult;

    if (isMooreToMealy) {
      // Original: Moore, Converted: Mealy
      origResult = simulateMoore(original, inputString);
      convResult = simulateMealy(converted, inputString);
    } else {
      // Original: Mealy, Converted: Moore
      origResult = simulateMealy(original, inputString);
      convResult = simulateMoore(converted, inputString);
    }

    if (origResult.error) { setError(`Original machine: ${origResult.error}`); return; }
    if (convResult.error) { setError(`Converted machine: ${convResult.error}`); return; }

    // Compare outputs
    // Moore output has one extra at the start (initial state output)
    // Mealy output length = input length
    // For alignment, we compare Mealy outputs with Moore outputs[1:] (dropping initial state output)
    let origOutputs, convOutputs;
    let mooreOutputs, mealyOutputs;

    if (isMooreToMealy) {
      mooreOutputs = origResult.outputSequence; // length n+1
      mealyOutputs = convResult.outputSequence;  // length n

      // Standard comparison: Moore[1:] should equal Mealy[:]
      origOutputs = origResult.outputSequence.slice(1); // Transition-aligned outputs
      convOutputs = convResult.outputSequence;
    } else {
      mealyOutputs = origResult.outputSequence; // length n
      mooreOutputs = convResult.outputSequence; // length n+1

      origOutputs = origResult.outputSequence;
      convOutputs = convResult.outputSequence.slice(1); // Drop initial Moore output
    }

    const equivalent = origOutputs.join('') === convOutputs.join('');

    setComparison({
      inputString,
      original: origResult,
      converted: convResult,
      origOutputs,
      convOutputs,
      equivalent,
      isMooreToMealy,
      mooreOutputs,
      mealyOutputs,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="section-title">Compare Outputs</h3>
        <p className="section-subtitle">Run both machines on the same input and compare results</p>
      </div>

      <div className="alert-info text-sm flex items-start gap-2">
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <div>
          <strong>Output Convention:</strong> Moore machines produce one extra output (for the initial state before any input).
          When comparing with a Mealy machine, we align Moore outputs by dropping the initial state output.
          Both machines should then produce identical output sequences.
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={inputString}
          onChange={e => setInputString(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCompare()}
          placeholder="Enter input string to compare..."
          className="input flex-1 min-w-0 font-mono"
          id="compare-input"
        />
        <button
          onClick={handleCompare}
          disabled={!original || !converted}
          className="btn-primary"
          id="compare-btn"
        >
          <Play size={15} /> Compare
        </button>
      </div>

      {error && <div className="alert-error text-sm">{error}</div>}

      {comparison && (
        <div className="space-y-4 animate-fade-in">
          {/* Equivalence verdict */}
          <div className={`rounded-xl p-4 border-2 ${
            comparison.equivalent
              ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
              : 'border-red-400 bg-red-50 dark:bg-red-950/20'
          }`}>
            <div className="flex items-center gap-2 font-bold text-lg">
              {comparison.equivalent ? '✅' : '❌'}
              <span className={comparison.equivalent ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                {comparison.equivalent
                  ? 'Machines are EQUIVALENT — outputs match!'
                  : 'Outputs differ — check your machine definition'}
              </span>
            </div>
          </div>

          {/* Moore full output */}
          <div className="card">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Moore Machine Output (full)</div>
            <div className="flex flex-wrap gap-2">
              {comparison.mooreOutputs.map((out, i) => (
                <div key={i} className="text-center">
                  <div className="text-xs text-slate-400 mb-1">{i === 0 ? 'init' : `in[${i-1}]`}</div>
                  <span className="badge-primary font-mono text-sm px-3 py-1">{out}</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Full Moore sequence (length = input length + 1)
            </div>
          </div>

          {/* Mealy output */}
          <div className="card">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Mealy Machine Output</div>
            <div className="flex flex-wrap gap-2">
              {comparison.mealyOutputs.map((out, i) => (
                <div key={i} className="text-center">
                  <div className="text-xs text-slate-400 mb-1">in[{i}]</div>
                  <span className="badge-accent font-mono text-sm px-3 py-1">{out}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side-by-side comparison table */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Aligned Comparison (Moore drops initial output)
            </h4>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Input Symbol</th>
                    <th>{comparison.isMooreToMealy ? 'Original (Moore)' : 'Original (Mealy)'}</th>
                    <th>{comparison.isMooreToMealy ? 'Converted (Mealy)' : 'Converted (Moore)'}</th>
                    <th>Match?</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.origOutputs.map((out, i) => {
                    const convOut = comparison.convOutputs[i];
                    const match = out === convOut;
                    return (
                      <tr key={i}>
                        <td className="font-mono">{i + 1}</td>
                        <td className="font-mono">{comparison.inputString[i] ?? '—'}</td>
                        <td><span className="badge-primary font-mono">{out}</span></td>
                        <td><span className="badge-accent font-mono">{convOut ?? '—'}</span></td>
                        <td>{match ? '✅' : '❌'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
