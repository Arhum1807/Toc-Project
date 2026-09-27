import { useRef } from 'react';
import { Download, Upload, Copy, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { exportMachine, downloadMachineJSON, importMachineFromFile } from '../utils/exportImport';
import { useState } from 'react';

export default function ImportExport({ machine, machineType, onImport }) {
  const [importErrors, setImportErrors] = useState([]);
  const [importSuccess, setImportSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleDownload = () => {
    if (!machine) return;
    downloadMachineJSON(machine, `${machineType?.toLowerCase() ?? 'machine'}_machine.json`);
  };

  const handleCopy = async () => {
    if (!machine) return;
    await navigator.clipboard.writeText(exportMachine(machine));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportErrors([]);
    setImportSuccess(false);

    const { machine: imported, errors, valid } = await importMachineFromFile(file);
    if (!valid) {
      setImportErrors(errors);
      return;
    }
    setImportSuccess(true);
    onImport(imported);
    setTimeout(() => setImportSuccess(false), 3000);
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Import / Export</h4>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={!machine}
          className="btn-secondary text-xs"
          id="export-json-btn"
        >
          <Download size={13} />
          Export JSON
        </button>
        <button
          onClick={handleCopy}
          disabled={!machine}
          className="btn-secondary text-xs"
          id="copy-json-btn"
        >
          {copied ? <CheckCircle size={13} className="text-green-500" /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-outline text-xs"
          id="import-json-btn"
        >
          <Upload size={13} />
          Import JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileChange}
          id="file-input"
        />
      </div>

      {importErrors.length > 0 && (
        <div className="alert-error text-xs space-y-1">
          <div className="flex items-center gap-1 font-semibold">
            <XCircle size={13} /> Import failed:
          </div>
          {importErrors.map((e, i) => <p key={i}>• {e}</p>)}
        </div>
      )}

      {importSuccess && (
        <div className="alert-success text-xs flex items-center gap-1">
          <CheckCircle size={13} />
          Machine imported successfully!
        </div>
      )}

      {/* Preview */}
      {machine && (
        <details className="rounded-xl border border-slate-200 dark:border-dark-border overflow-hidden">
          <summary className="px-4 py-2 bg-slate-50 dark:bg-dark-surface text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-card">
            JSON Preview
          </summary>
          <pre className="code-block rounded-none text-xs max-h-48 overflow-auto p-4">
            {exportMachine(machine)}
          </pre>
        </details>
      )}
    </div>
  );
}
