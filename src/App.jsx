import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MachineProvider } from './context/MachineContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Notification from './components/Notification';

// Pages
import Dashboard from './pages/Dashboard';
import MoorePage from './pages/MoorePage';
import MealyPage from './pages/MealyPage';
import MooreToMealyPage from './pages/MooreToMealyPage';
import MealyToMoorePage from './pages/MealyToMoorePage';
import ComparePage from './pages/ComparePage';
import LearnPage from './pages/LearnPage';
import ExamplesPage from './pages/ExamplesPage';
import TestingPage from './pages/TestingPage';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Notification />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/moore" element={<MoorePage />} />
          <Route path="/moore/simulate" element={<MoorePage initialTab="Simulate" />} />
          <Route path="/mealy" element={<MealyPage />} />
          <Route path="/mealy/simulate" element={<MealyPage initialTab="Simulate" />} />
          <Route path="/moore-to-mealy" element={<MooreToMealyPage />} />
          <Route path="/mealy-to-moore" element={<MealyToMoorePage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/examples" element={<ExamplesPage />} />
          <Route path="/testing" element={<TestingPage />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MachineProvider>
        <AppLayout />
      </MachineProvider>
    </BrowserRouter>
  );
}
