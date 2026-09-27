import { Info, BookOpen, Cpu, Code2, FlaskConical } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Info size={24} className="text-primary-600 dark:text-primary-400" />
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">About This Project</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Theory of Computation — Automata Theory</p>
        </div>
      </div>

      {/* Project info */}
      <div className="card bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30 border-primary-200 dark:border-primary-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Cpu size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
              Implementation of Moore and Mealy Machine Converters
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Theory of Computation / Automata Theory — College Project</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          This application provides an interactive platform for designing, converting, simulating, and comparing
          Moore and Mealy finite state machines. It is fully dynamic — all conversions are computed algorithmically
          from user-defined machines, not from hard-coded examples.
        </p>
      </div>

      {/* Features list */}
      <div className="card">
        <h3 className="section-title">Features</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            'User-defined Moore machine builder (wizard)',
            'User-defined Mealy machine builder (wizard)',
            'Moore → Mealy conversion (dynamic)',
            'Mealy → Moore conversion (state-splitting)',
            'Interactive state diagram (React Flow)',
            'Zoom, pan, drag nodes',
            'Step-by-step conversion explanation',
            'Input string simulation',
            'Step-by-step simulation trace',
            'Output comparison (with offset handling)',
            'JSON import / export',
            'Dark / light mode (persisted)',
            'Built-in examples (6 machines)',
            'Test suite with pass/fail',
            'Machine validation with friendly errors',
            'Responsive design (desktop, tablet)',
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="card">
        <h3 className="section-title">Technology Stack</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { name: 'React 18', desc: 'UI framework' },
            { name: 'Vite', desc: 'Build tool' },
            { name: 'React Flow', desc: 'State diagrams' },
            { name: 'React Router v6', desc: 'SPA navigation' },
            { name: 'Tailwind CSS v3', desc: 'Styling' },
            { name: 'Lucide React', desc: 'Icons' },
          ].map(({ name, desc }) => (
            <div key={name} className="card py-3 px-4">
              <p className="font-semibold text-sm text-slate-800 dark:text-white">{name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Algorithm references */}
      <div className="card">
        <h3 className="section-title">Algorithms</h3>
        <div className="space-y-3">
          {[
            {
              title: 'Moore → Mealy',
              file: 'src/algorithms/mooreToMealy.js',
              desc: 'For each transition q --a--> dest, attach output λ(dest) to create Mealy transition q --a/λ(dest)--> dest.',
            },
            {
              title: 'Mealy → Moore',
              file: 'src/algorithms/mealyToMoore.js',
              desc: 'State-splitting: group incoming transitions by output, split states with multiple outputs, rebuild transitions.',
            },
            {
              title: 'Moore Simulation',
              file: 'src/algorithms/simulateMoore.js',
              desc: 'Produces output for initial state, then one output per input symbol. Total output length = input length + 1.',
            },
            {
              title: 'Mealy Simulation',
              file: 'src/algorithms/simulateMealy.js',
              desc: 'Produces one output per input symbol. Total output length = input length.',
            },
          ].map(({ title, file, desc }) => (
            <div key={title} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-dark-surface">
              <Code2 size={16} className="text-primary-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-slate-800 dark:text-white">{title}</p>
                <code className="text-xs text-slate-500 dark:text-slate-400 font-mono">{file}</code>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* References */}
      <div className="card">
        <h3 className="section-title">References</h3>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          {[
            'Introduction to Automata Theory, Languages, and Computation — Hopcroft, Motwani, Ullman',
            'Theory of Computation — Michael Sipser',
            'Elements of the Theory of Computation — Lewis & Papadimitriou',
            'Formal Languages and Automata Theory — C.K. Nagpal',
          ].map((ref, i) => (
            <p key={i} className="flex items-start gap-2">
              <BookOpen size={14} className="flex-shrink-0 mt-0.5 text-primary-500" />
              {ref}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
