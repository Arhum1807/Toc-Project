import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Circle, Zap, ArrowRightLeft, GitCompare,
  BookOpen, FlaskConical, ChevronDown, ChevronRight, Plus,
  Play, BookMarked, Repeat, Cpu
} from 'lucide-react';
import { useState } from 'react';

const NavGroup = ({ label, icon: Icon, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        <Icon size={13} />
        <span>{label}</span>
        <span className="ml-auto">{open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}</span>
      </button>
      {open && <div className="space-y-0.5 pl-2">{children}</div>}
    </div>
  );
};

const Item = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      isActive ? 'nav-item-active' : 'nav-item'
    }
  >
    <Icon size={16} />
    <span>{label}</span>
  </NavLink>
);

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-200 dark:border-dark-border">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <Cpu size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">FSM Converter</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-none mt-0.5">Theory of Computation</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-4 pt-4">

          {/* Dashboard */}
          <Item to="/" icon={LayoutDashboard} label="Dashboard" />

          {/* Moore Machine */}
          <NavGroup label="Moore Machine" icon={Circle}>
            <Item to="/moore" icon={Plus} label="Create Machine" />
            <Item to="/moore/simulate" icon={Play} label="Simulator" />
            <Item to="/examples?filter=moore" icon={BookMarked} label="Examples" />
          </NavGroup>

          {/* Mealy Machine */}
          <NavGroup label="Mealy Machine" icon={Zap}>
            <Item to="/mealy" icon={Plus} label="Create Machine" />
            <Item to="/mealy/simulate" icon={Play} label="Simulator" />
            <Item to="/examples?filter=mealy" icon={BookMarked} label="Examples" />
          </NavGroup>

          {/* Conversion */}
          <NavGroup label="Conversion" icon={ArrowRightLeft}>
            <Item to="/moore-to-mealy" icon={Repeat} label="Moore → Mealy" />
            <Item to="/mealy-to-moore" icon={Repeat} label="Mealy → Moore" />
          </NavGroup>

          {/* Other */}
          <div className="space-y-0.5 pt-1 border-t border-slate-200 dark:border-dark-border">
            <Item to="/compare" icon={GitCompare} label="Compare Machines" />
            <Item to="/learn" icon={BookOpen} label="Learn" />
            <Item to="/testing" icon={FlaskConical} label="Testing" />
            <Item to="/examples" icon={BookMarked} label="Examples" />
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-dark-border">
          <p className="text-xs text-slate-400 dark:text-slate-600 text-center">
            TOC Project · Moore &amp; Mealy Converter
          </p>
        </div>
      </aside>
    </>
  );
}
