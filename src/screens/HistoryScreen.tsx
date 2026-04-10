import { Clock, ExternalLink, ChevronRight, SearchX } from 'lucide-react';
import { useState } from 'react';
import { ScrapeResult } from '../types';

interface HistoryScreenProps {
  history: ScrapeResult[];
  onBack: () => void;
  onSelectResult: (result: ScrapeResult) => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function HistoryItem({
  result,
  onSelect,
}: {
  result: ScrapeResult;
  onSelect: () => void;
}) {
  return (
    <div className="group bg-white border border-slate-200 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all duration-200 overflow-hidden">
      <button
        onClick={onSelect}
        className="w-full text-left px-6 py-5 flex items-center gap-4"
      >
        <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-50 transition-colors shrink-0 flex items-center justify-center overflow-hidden">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect x="4" y="6" width="20" height="16" rx="3" fill="#DBEAFE" className="group-hover:fill-blue-100" stroke="#93C5FD" strokeWidth="1"/>
            <rect x="7" y="10" width="14" height="2" rx="1" fill="#60A5FA"/>
            <rect x="7" y="14" width="10" height="1.5" rx="0.75" fill="#BFDBFE"/>
            <rect x="7" y="17" width="12" height="1.5" rx="0.75" fill="#BFDBFE"/>
            <circle cx="21" cy="20" r="5" fill="#2563EB"/>
            <path d="M19.5 20 L20.8 21.4 L22.8 18.8" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 text-sm truncate">{getDomain(result.url)}</p>
          <p className="text-slate-400 text-xs truncate mt-0.5">{result.url}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              {result.scraped_at ? formatDate(result.scraped_at) : 'Just now'}
            </span>
            <span className="text-slate-200">·</span>
            <span className="text-xs text-slate-500">{result.total_items} items</span>
            <span className="text-slate-200">·</span>
            <span className="text-xs text-slate-500">{result.titles.length} titles</span>
            <span className="text-slate-200">·</span>
            <span className="text-xs text-slate-500">{result.headings.length} headings</span>
            <span className="text-slate-200">·</span>
            <span className="text-xs text-slate-500">{result.links.length} links</span>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors shrink-0" />
      </button>
    </div>
  );
}

export default function HistoryScreen({ history, onBack, onSelectResult }: HistoryScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = searchQuery.trim()
    ? history.filter(r =>
        r.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.summary?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : history;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl px-6 py-5 mb-8 overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-48 flex items-center justify-end pr-4 pointer-events-none" aria-hidden="true">
          <svg width="160" height="100" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="130" cy="50" r="48" fill="white" fillOpacity="0.03"/>
            <circle cx="130" cy="50" r="32" fill="white" fillOpacity="0.04"/>
            <rect x="24" y="18" width="56" height="68" rx="6" fill="white" fillOpacity="0.06" stroke="white" strokeOpacity="0.12" strokeWidth="1"/>
            <rect x="33" y="28" width="38" height="3" rx="1.5" fill="white" fillOpacity="0.3"/>
            <rect x="33" y="35" width="28" height="2" rx="1" fill="white" fillOpacity="0.15"/>
            <rect x="33" y="40" width="32" height="2" rx="1" fill="white" fillOpacity="0.15"/>
            <rect x="33" y="45" width="22" height="2" rx="1" fill="white" fillOpacity="0.1"/>
            <rect x="30" y="14" width="56" height="68" rx="6" fill="white" fillOpacity="0.06" stroke="white" strokeOpacity="0.1" strokeWidth="1"/>
            <rect x="39" y="24" width="38" height="3" rx="1.5" fill="white" fillOpacity="0.25"/>
            <rect x="39" y="31" width="26" height="2" rx="1" fill="white" fillOpacity="0.12"/>
            <rect x="39" y="36" width="30" height="2" rx="1" fill="white" fillOpacity="0.12"/>
            <rect x="39" y="41" width="20" height="2" rx="1" fill="white" fillOpacity="0.08"/>
            <rect x="36" y="10" width="56" height="68" rx="6" fill="#1E293B" stroke="white" strokeOpacity="0.15" strokeWidth="1"/>
            <rect x="45" y="20" width="38" height="3.5" rx="1.75" fill="white" fillOpacity="0.5"/>
            <rect x="45" y="27" width="28" height="2.5" rx="1.25" fill="white" fillOpacity="0.2"/>
            <rect x="45" y="32.5" width="32" height="2.5" rx="1.25" fill="white" fillOpacity="0.2"/>
            <rect x="45" y="38" width="20" height="2.5" rx="1.25" fill="white" fillOpacity="0.15"/>
            <rect x="45" y="43.5" width="26" height="2.5" rx="1.25" fill="white" fillOpacity="0.15"/>
            <circle cx="110" cy="58" r="16" fill="white" fillOpacity="0.07" stroke="white" strokeOpacity="0.2" strokeWidth="1.2"/>
            <circle cx="110" cy="55" r="8" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" fill="none"/>
            <path d="M110 51.5 L110 55.5 L112.5 58" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18" y1="50" x2="36" y2="50" stroke="none"/>
          </svg>
        </div>
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">Scrape History</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {`${history.length} result${history.length !== 1 ? 's' : ''} recorded this session`}
            </p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-900 bg-white rounded-xl hover:bg-slate-100 transition-colors shrink-0"
          >
            New Scrape
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div className="mb-5 flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by URL or summary..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-400 transition-colors bg-white"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="2" y="4" width="16" height="12" rx="3" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1"/>
              <rect x="5" y="7" width="10" height="1.8" rx="0.9" fill="#2563EB" fillOpacity="0.5"/>
              <rect x="5" y="10.2" width="7" height="1.8" rx="0.9" fill="#2563EB" fillOpacity="0.3"/>
            </svg>
            <span className="text-xs font-semibold text-blue-600">{history.length}</span>
          </div>
        </div>
      )}

      {history.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6">
            <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="20" y="90" width="120" height="16" rx="5" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1"/>
              <rect x="28" y="94" width="60" height="2.5" rx="1.25" fill="#CBD5E1"/>
              <rect x="28" y="99" width="44" height="2" rx="1" fill="#E2E8F0"/>
              <rect x="18" y="72" width="124" height="20" rx="5" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1"/>
              <rect x="26" y="76.5" width="64" height="2.5" rx="1.25" fill="#CBD5E1"/>
              <rect x="26" y="82" width="48" height="2" rx="1" fill="#E2E8F0"/>
              <rect x="16" y="54" width="128" height="20" rx="5" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1"/>
              <rect x="24" y="58.5" width="68" height="2.5" rx="1.25" fill="#94A3B8"/>
              <rect x="24" y="64" width="50" height="2" rx="1" fill="#CBD5E1"/>
              <rect x="14" y="32" width="132" height="24" rx="6" fill="white" stroke="#CBD5E1" strokeWidth="1.2"/>
              <rect x="22" y="38" width="72" height="3" rx="1.5" fill="#64748B"/>
              <rect x="22" y="45" width="54" height="2.5" rx="1.25" fill="#94A3B8"/>
              <circle cx="130" cy="44" r="10" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.2"/>
              <path d="M130 40 L130 44.5 L132.5 47" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="80" cy="18" r="10" fill="#FEF9C3" stroke="#FDE68A" strokeWidth="1.2"/>
              <path d="M77 18 L79.5 20.5 L83 16" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="80" y1="28" x2="80" y2="32" stroke="#E2E8F0" strokeWidth="1.2" strokeDasharray="2 1.5"/>
              <line x1="80" y1="106" x2="80" y2="114" stroke="#E2E8F0" strokeWidth="1.2" strokeDasharray="2 1.5"/>
              <circle cx="80" cy="120" r="10" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1.2"/>
              <circle cx="80" cy="120" r="4" stroke="#94A3B8" strokeWidth="1.2" fill="none"/>
              <path d="M83.2 123.2 L86 126" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M80 116 L80 120.5 L82 123" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-slate-700 font-semibold text-base">Nothing here yet</p>
          <p className="text-slate-400 text-sm mt-1.5 max-w-xs leading-relaxed">
            Each page you scrape is saved here so you can revisit results any time.
          </p>
          <button
            onClick={onBack}
            className="mt-6 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Scrape your first website
          </button>
        </div>
      )}

      {history.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <SearchX className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-700 font-semibold">No results match your search</p>
          <p className="text-slate-400 text-sm mt-1">Try a different keyword or URL.</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((result, i) => (
            <HistoryItem
              key={result.id ?? i}
              result={result}
              onSelect={() => onSelectResult(result)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
