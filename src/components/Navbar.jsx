import { Sun, Moon, Cpu, ExternalLink, Menu } from 'lucide-react';
import { useMachine } from '../context/MachineContext';

export default function Navbar({ onMenuToggle }) {
  const { state, actions } = useMachine();

  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 z-30 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-md border-b border-slate-200 dark:border-dark-border flex items-center px-6 gap-4">
      <button
        onClick={onMenuToggle}
        className="btn-ghost p-2 -ml-2 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
          <Cpu size={16} className="text-white" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-base font-bold text-slate-800 dark:text-white leading-none">
            Moore &amp; Mealy Converter
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-none mt-0.5">
            Automata Theory · Theory of Computation
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost p-2 hidden sm:flex"
          aria-label="GitHub"
        >
          <ExternalLink size={18} />
        </a>

        <button
          id="dark-mode-toggle"
          onClick={() => actions.setDarkMode(!state.darkMode)}
          className="btn-ghost p-2 relative w-10 h-10 rounded-xl"
          aria-label="Toggle dark mode"
        >
          <Sun
            size={18}
            className={`absolute inset-0 m-auto transition-all duration-300 ${
              state.darkMode ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
            }`}
          />
          <Moon
            size={18}
            className={`absolute inset-0 m-auto transition-all duration-300 ${
              state.darkMode ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'
            }`}
          />
        </button>
      </div>
    </header>
  );
}
