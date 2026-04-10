import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Scraping website...' }: LoadingSpinnerProps) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-slate-900 font-semibold text-lg">{message}</p>
        <p className="text-slate-500 text-sm mt-1">This may take a few seconds</p>
      </div>
    </div>
  );
}
