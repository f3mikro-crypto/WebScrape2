import { ExternalLink, Heading, Link2, Type, Sparkles, History, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { ScrapeResult } from '../types';

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  items: string[];
  color: string;
  isLink?: boolean;
}

function Section({ icon, title, count, items, color, isLink = false }: SectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
          </div>
          <div className="text-left">
            <p className="font-semibold text-slate-900 text-sm">{title}</p>
            <p className="text-slate-400 text-xs">{count} {count === 1 ? 'item' : 'items'} found</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
            {count}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100">
          {items.length === 0 ? (
            <p className="px-6 py-4 text-slate-400 text-sm italic">No items found.</p>
          ) : (
            <ul className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
              {items.map((item, i) => (
                <li key={i} className="px-6 py-3 flex items-start gap-3 group hover:bg-slate-50 transition-colors">
                  <span className="text-slate-300 text-xs font-mono mt-0.5 w-5 shrink-0 text-right">{i + 1}</span>
                  {isLink ? (
                    <a
                      href={item}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm break-all flex items-start gap-1.5 group"
                    >
                      <span className="break-all">{item}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ) : (
                    <span className="text-slate-700 text-sm">{item}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

interface ResultsScreenProps {
  result: ScrapeResult | null;
  onViewHistory: () => void;
  onScrapeAgain: () => void;
}

export default function ResultsScreen({ result, onViewHistory, onScrapeAgain }: ResultsScreenProps) {
  if (!result) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="36" height="36" rx="10" fill="#EFF6FF"/>
              <rect x="8" y="9" width="20" height="3" rx="1.5" fill="#93C5FD"/>
              <rect x="8" y="15" width="16" height="2.5" rx="1.25" fill="#BFDBFE"/>
              <rect x="8" y="20" width="18" height="2.5" rx="1.25" fill="#BFDBFE"/>
              <rect x="8" y="25" width="12" height="2.5" rx="1.25" fill="#BFDBFE"/>
              <circle cx="27" cy="25" r="6" fill="#2563EB"/>
              <path d="M24.5 25 L26.5 27 L29.5 23" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h1 className="text-2xl font-bold text-slate-900">Scrape Results</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1 break-all">
            <span className="font-medium">URL:</span> {result.url}
          </p>
          {result.scraped_at && (
            <p className="text-slate-400 text-xs mt-0.5">
              Scraped on {new Date(result.scraped_at).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onScrapeAgain}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            New Scrape
          </button>
          <button
            onClick={onViewHistory}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <History className="w-4 h-4" />
            View History
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-white rounded-xl border border-slate-200 px-5 py-4 text-center">
          <div className="flex justify-center mb-1.5">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <rect x="3" y="4" width="16" height="2.5" rx="1.25" fill="#6EE7B7"/>
              <rect x="3" y="9" width="12" height="2" rx="1" fill="#D1FAE5"/>
              <rect x="3" y="13.5" width="14" height="2" rx="1" fill="#D1FAE5"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-900">{result.titles.length}</p>
          <p className="text-slate-500 text-xs mt-0.5">Titles</p>
        </div>
        <div className="flex-1 bg-white rounded-xl border border-slate-200 px-5 py-4 text-center">
          <div className="flex justify-center mb-1.5">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <rect x="3" y="4" width="16" height="3" rx="1.5" fill="#93C5FD"/>
              <rect x="3" y="10" width="10" height="2" rx="1" fill="#BFDBFE"/>
              <rect x="3" y="15" width="13" height="2" rx="1" fill="#BFDBFE"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-900">{result.headings.length}</p>
          <p className="text-slate-500 text-xs mt-0.5">Headings</p>
        </div>
        <div className="flex-1 bg-white rounded-xl border border-slate-200 px-5 py-4 text-center">
          <div className="flex justify-center mb-1.5">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M5 11 C5 8.239 7.239 6 10 6 L12 6" stroke="#FB923C" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              <path d="M17 11 C17 13.761 14.761 16 12 16 L10 16" stroke="#FB923C" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              <line x1="8" y1="11" x2="14" y2="11" stroke="#FED7AA" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-900">{result.links.length}</p>
          <p className="text-slate-500 text-xs mt-0.5">Links</p>
        </div>
        <div className="flex-1 bg-white rounded-xl border border-slate-200 px-5 py-4 text-center">
          <div className="flex justify-center mb-1.5">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <rect x="3" y="14" width="4" height="5" rx="1" fill="#93C5FD"/>
              <rect x="9" y="10" width="4" height="9" rx="1" fill="#60A5FA"/>
              <rect x="15" y="6" width="4" height="13" rx="1" fill="#2563EB"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-blue-600">{result.total_items}</p>
          <p className="text-slate-500 text-xs mt-0.5">Total Items</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <Section
          icon={<Type className="w-4 h-4 text-emerald-600" />}
          title="Titles Found"
          count={result.titles.length}
          items={result.titles}
          color="bg-emerald-50"
        />
        <Section
          icon={<Heading className="w-4 h-4 text-blue-600" />}
          title="Headings Found"
          count={result.headings.length}
          items={result.headings}
          color="bg-blue-50"
        />
        <Section
          icon={<Link2 className="w-4 h-4 text-orange-600" />}
          title="Links Found"
          count={result.links.length}
          items={result.links}
          color="bg-orange-50"
          isLink
        />
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </div>
            <div>
              <p className="font-semibold text-sm">AI Summary</p>
              <p className="text-slate-400 text-xs">Powered by OpenAI</p>
            </div>
          </div>
          <svg width="56" height="36" viewBox="0 0 56 36" fill="none" aria-hidden="true">
            <circle cx="10" cy="18" r="3" fill="white" opacity="0.15"/>
            <circle cx="21" cy="10" r="4" fill="white" opacity="0.12"/>
            <circle cx="21" cy="26" r="2.5" fill="white" opacity="0.1"/>
            <circle cx="34" cy="14" r="5" fill="white" opacity="0.1"/>
            <circle cx="34" cy="24" r="3" fill="white" opacity="0.08"/>
            <circle cx="46" cy="18" r="6" fill="white" opacity="0.07"/>
            <path d="M10 18 L21 10 L21 26 L34 14 L34 24 L46 18" stroke="white" strokeWidth="1" strokeOpacity="0.2" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
        {result.summary ? (
          <p className="text-slate-200 text-sm leading-relaxed">{result.summary}</p>
        ) : (
          <p className="text-slate-400 text-sm italic">No AI summary available.</p>
        )}
      </div>
    </div>
  );
}
