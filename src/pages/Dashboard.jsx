import { Link, useNavigate } from 'react-router-dom';
import {
  Circle, Zap, ArrowRightLeft, BookOpen, FlaskConical,
  BookMarked, GitCompare, Cpu, ChevronRight, ArrowRight
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, to, color = 'primary', badge }) => {
  return (
    <Link to={to} className="card-hover group flex flex-col gap-3 p-5">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
        color === 'primary' ? 'bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400' :
        color === 'accent' ? 'bg-accent-100 dark:bg-accent-950 text-accent-600 dark:text-accent-400' :
        'bg-slate-100 dark:bg-dark-border text-slate-600 dark:text-slate-400'
      }`}>
        <Icon size={22} />
      </div>
      {badge && <span className="badge-primary self-start text-xs">{badge}</span>}
      <div>
        <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{description}</p>
      </div>
      <div className="mt-auto flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 group-hover:gap-2 transition-all">
        Open <ChevronRight size={13} />
      </div>
    </Link>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 p-8 md:p-12 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-64 h-64 rounded-full bg-accent-400 blur-3xl" />
          <div className="absolute bottom-4 left-4 w-48 h-48 rounded-full bg-primary-400 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Cpu size={24} className="text-white" />
            </div>
            <span className="badge bg-white/20 text-white text-xs backdrop-blur">Theory of Computation</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 leading-tight">
            Moore &amp; Mealy<br />
            <span className="gradient-text">Machine Converter</span>
          </h1>

          <p className="text-primary-200 text-lg max-w-2xl mb-8">
            Interactive Design, Conversion and Simulation of Finite State Machines.
            Build, convert, visualize, and compare Moore and Mealy machines in real time.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/moore-to-mealy')}
              className="btn bg-white text-primary-700 hover:bg-primary-50 shadow-lg font-bold px-6 py-3"
              id="hero-moore-to-mealy"
            >
              Moore → Mealy <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/mealy-to-moore')}
              className="btn bg-white/20 backdrop-blur text-white hover:bg-white/30 border border-white/30 font-semibold px-6 py-3"
              id="hero-mealy-to-moore"
            >
              Mealy → Moore <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/learn')}
              className="btn bg-transparent text-white hover:bg-white/10 border border-white/20 font-semibold px-6 py-3"
              id="hero-learn"
            >
              <BookOpen size={16} /> Learn First
            </button>
          </div>
        </div>
      </div>

      {/* Main action cards */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Machine Builders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/moore" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white hover:shadow-2xl hover:shadow-primary-500/30 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-x-8 -translate-y-8" />
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
              <Circle size={24} />
            </div>
            <h2 className="text-xl font-bold mb-2">Moore Machine</h2>
            <p className="text-primary-200 text-sm mb-4 leading-relaxed">
              A Moore machine produces output based only on the current state.
              Output is associated with each state.
            </p>
            <div className="code-block bg-white/10 text-white text-xs p-3 rounded-lg mb-4 font-mono">
              State → Output<br/>
              q0 / 0, q1 / 1, q2 / 0
            </div>
            <div className="flex items-center gap-1 font-semibold text-sm group-hover:gap-2 transition-all">
              Create Moore Machine <ChevronRight size={16} />
            </div>
          </Link>

          <Link to="/mealy" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-600 to-accent-800 p-6 text-white hover:shadow-2xl hover:shadow-accent-500/30 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-x-8 -translate-y-8" />
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
              <Zap size={24} />
            </div>
            <h2 className="text-xl font-bold mb-2">Mealy Machine</h2>
            <p className="text-accent-200 text-sm mb-4 leading-relaxed">
              A Mealy machine produces output based on the current state and input.
              Output is associated with each transition.
            </p>
            <div className="code-block bg-white/10 text-white text-xs p-3 rounded-lg mb-4 font-mono">
              State + Input → Output<br/>
              q0 --0/1→ q1, q0 --1/0→ q0
            </div>
            <div className="flex items-center gap-1 font-semibold text-sm group-hover:gap-2 transition-all">
              Create Mealy Machine <ChevronRight size={16} />
            </div>
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            icon={ArrowRightLeft}
            title="Moore → Mealy Conversion"
            description="Convert any Moore machine to an equivalent Mealy machine with step-by-step explanation."
            to="/moore-to-mealy"
            color="primary"
            badge="Core Feature"
          />
          <FeatureCard
            icon={ArrowRightLeft}
            title="Mealy → Moore Conversion"
            description="Convert Mealy machines to Moore machines using the state-splitting algorithm."
            to="/mealy-to-moore"
            color="accent"
            badge="Core Feature"
          />
          <FeatureCard
            icon={GitCompare}
            title="Compare Machines"
            description="Run both machines on the same input and compare outputs side by side."
            to="/compare"
            color="primary"
          />
          <FeatureCard
            icon={BookOpen}
            title="Learn Theory"
            description="Complete beginner-friendly guide to Moore machines, Mealy machines, and conversion algorithms."
            to="/learn"
          />
          <FeatureCard
            icon={FlaskConical}
            title="Test Suite"
            description="Define test cases with expected outputs and run them against your machines."
            to="/testing"
          />
          <FeatureCard
            icon={BookMarked}
            title="Examples"
            description="Built-in examples: parity checker, sequence detector, traffic light, and more."
            to="/examples"
          />
        </div>
      </div>

      {/* Quick comparison */}
      <div className="card">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Moore vs Mealy — Quick Reference</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Moore Machine</th>
                <th>Mealy Machine</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Output depends on', 'Current state only', 'State + Input'],
                ['Output placed on', 'State (state label)', 'Transition (edge label)'],
                ['Notation', 'q / output', 'input / output'],
                ['Output timing', 'On entering a state', 'On taking a transition'],
                ['Output length', 'Input length + 1', 'Input length'],
                ['States needed', 'May require more states', 'Often fewer states'],
              ].map(([feature, moore, mealy]) => (
                <tr key={feature}>
                  <td className="font-semibold text-slate-700 dark:text-slate-300">{feature}</td>
                  <td><span className="badge-primary font-mono text-xs">{moore}</span></td>
                  <td><span className="badge-accent font-mono text-xs">{mealy}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
