import { AlertTriangle, RotateCcw, Home, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ErrorScreenProps {
  message: string;
  onTryAgain: () => void;
}

const ERROR_HINTS: { pattern: RegExp; hint: string }[] = [
  {
    pattern: /fetch|network|failed to fetch|cors/i,
    hint: 'This is usually caused by a network issue or a misconfigured webhook URL. Check that your n8n webhook is running and accessible.',
  },
  {
    pattern: /status 4[0-9]{2}/i,
    hint: 'The webhook returned a client error. Verify that the webhook URL is correct and the endpoint is accepting POST requests.',
  },
  {
    pattern: /status 5[0-9]{2}/i,
    hint: 'The webhook returned a server error. Your n8n workflow may have crashed — check the execution logs in n8n.',
  },
  {
    pattern: /timeout/i,
    hint: 'The request timed out. The target website or your n8n server may be slow to respond. Try again in a moment.',
  },
  {
    pattern: /invalid url|url/i,
    hint: 'Double-check the URL format. It should start with https:// or http:// and point to a publicly accessible website.',
  },
];

function getHint(message: string): string {
  for (const { pattern, hint } of ERROR_HINTS) {
    if (pattern.test(message)) return hint;
  }
  return 'An unexpected error occurred. Try scraping the URL again or check your n8n workflow configuration.';
}

export default function ErrorScreen({ message, onTryAgain }: ErrorScreenProps) {
  const [copied, setCopied] = useState(false);
  const hint = getHint(message);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="mb-5">
          <svg width="112" height="96" viewBox="0 0 112 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="8" y="16" width="96" height="68" rx="10" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1.5"/>
            <rect x="8" y="16" width="96" height="22" rx="10" fill="#FEE2E2"/>
            <rect x="8" y="28" width="96" height="10" fill="#FEE2E2"/>
            <circle cx="22" cy="27" r="4" fill="#FCA5A5"/>
            <circle cx="34" cy="27" r="4" fill="#FCA5A5" opacity="0.5"/>
            <circle cx="46" cy="27" r="4" fill="#FCA5A5" opacity="0.3"/>
            <rect x="20" y="48" width="72" height="5" rx="2.5" fill="#FECACA"/>
            <rect x="20" y="58" width="56" height="5" rx="2.5" fill="#FEE2E2"/>
            <rect x="20" y="68" width="64" height="5" rx="2.5" fill="#FEE2E2"/>
            <circle cx="84" cy="72" r="20" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1.5"/>
            <path d="M84 62 L84 72" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="84" cy="78" r="2" fill="#EF4444"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
        <p className="text-slate-500 text-sm max-w-sm">
          The scrape couldn't be completed. See the details below for more information.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-4">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Error Message</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm font-mono text-red-600 break-all leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-8">
        <div className="flex items-start gap-4">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0 mt-0.5">
            <rect width="40" height="40" rx="10" fill="#FEF3C7"/>
            <path d="M20 11 L31 29 H9 Z" stroke="#F59E0B" strokeWidth="1.5" strokeLinejoin="round" fill="#FEF9C3"/>
            <path d="M20 18 L20 23" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="20" cy="26.5" r="1.25" fill="#D97706"/>
          </svg>
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1.5">What might help</p>
            <p className="text-sm text-amber-800 leading-relaxed">{hint}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <svg width="120" height="32" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="16" cy="16" r="8" fill="#FEE2E2" stroke="#FECACA" strokeWidth="1.5"/>
          <circle cx="16" cy="16" r="3" fill="#EF4444"/>
          <circle cx="60" cy="16" r="8" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1.5"/>
          <path d="M57 13 L63 19 M63 13 L57 19" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="104" cy="16" r="8" fill="#FEE2E2" stroke="#FECACA" strokeWidth="1.5"/>
          <circle cx="104" cy="16" r="3" fill="#EF4444"/>
          <line x1="24" y1="16" x2="52" y2="16" stroke="#FECACA" strokeWidth="1.5" strokeDasharray="3 2"/>
          <line x1="68" y1="16" x2="96" y2="16" stroke="#FECACA" strokeWidth="1.5" strokeDasharray="3 2"/>
        </svg>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onTryAgain}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
        <button
          onClick={onTryAgain}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-xl transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
