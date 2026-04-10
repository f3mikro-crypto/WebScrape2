import { History, Globe as Globe2, FileText, AlertTriangle, Home } from 'lucide-react';
import { Screen } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (screen: Screen) => void;
  currentScreen: Screen;
  hasResult: boolean;
  hasError: boolean;
}

interface NavItem {
  screen: Screen;
  label: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export default function Layout({ children, onNavigate, currentScreen, hasResult, hasError }: LayoutProps) {
  const navItems: NavItem[] = [
    { screen: 'home', label: 'Home', icon: <Home className="w-4 h-4" />, enabled: true },
    { screen: 'results', label: 'Results', icon: <FileText className="w-4 h-4" />, enabled: hasResult },
    { screen: 'history', label: 'History', icon: <History className="w-4 h-4" />, enabled: true },
    { screen: 'error', label: 'Error', icon: <AlertTriangle className="w-4 h-4" />, enabled: hasError },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Globe2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              WebScrape
            </span>
            <span className="text-xs text-slate-400 font-normal ml-[0.0625rem] translate-y-[0.5em]">by the LtGeneralist</span>
          </button>

          <nav className="flex items-center gap-1">
            {navItems.map(({ screen, label, icon, enabled }) => (
              <button
                key={screen}
                onClick={() => enabled && onNavigate(screen)}
                disabled={!enabled}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentScreen === screen
                    ? 'bg-blue-50 text-blue-600'
                    : enabled
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {children}
      </main>
    </div>
  );
}
