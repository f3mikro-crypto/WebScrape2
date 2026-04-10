import { useState } from 'react';
import { ArrowRight, Globe, Shield } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { ScrapeResult } from '../types';

const N8N_WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL as string;

interface HomeScreenProps {
  onSuccess: (result: ScrapeResult) => void;
  onError: (message: string) => void;
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function HomeScreen({ onSuccess, onError }: HomeScreenProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState('');

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUrl(e.target.value);
    if (inputError) setInputError('');
  }

  async function handleScrape() {
    const trimmed = url.trim();

    if (!trimmed) {
      setInputError('Please enter a URL to scrape.');
      return;
    }

    const urlToScrape = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;

    if (!isValidUrl(urlToScrape)) {
      setInputError('Please enter a valid URL, e.g. https://example.com');
      return;
    }

    setLoading(true);
    setInputError('');

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToScrape }),
      });

      if (!response.ok) {
        throw new Error(`Webhook responded with status ${response.status}`);
      }

      const text = await response.text();
      console.log('Raw webhook response:', text);

      let data: Record<string, unknown>;
      try {
        data = JSON.parse(text);
      } catch {
        onError('The webhook returned an invalid response. Please try again.');
        return;
      }

      const splitField = (field: unknown): string[] =>
        typeof field === 'string'
          ? field.split(',').map((s) => s.trim()).filter(Boolean)
          : Array.isArray(field)
          ? (field as string[])
          : [];

      const titles = splitField(data.Titles);
      const headings = splitField(data.Headings);
      const links = splitField(data.Links);
      const summary = typeof data.Summary === 'string' ? data.Summary : '';
      const total_items = titles.length + headings.length + links.length;

      const result: ScrapeResult = {
        url: typeof data.URL === 'string' ? data.URL : urlToScrape,
        titles,
        headings,
        links,
        summary,
        total_items,
        scraped_at: new Date().toISOString(),
      };

      onSuccess(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      onError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleScrape();
  }

  return (
    <>
      {loading && <LoadingSpinner />}

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-7">
              <svg width="148" height="112" viewBox="0 0 148 112" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="12" y="18" width="124" height="80" rx="10" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5"/>
                <rect x="12" y="18" width="124" height="26" rx="10" fill="#DBEAFE"/>
                <rect x="12" y="34" width="124" height="10" fill="#DBEAFE"/>
                <circle cx="28" cy="31" r="5" fill="#93C5FD"/>
                <circle cx="42" cy="31" r="5" fill="#6EE7B7"/>
                <circle cx="56" cy="31" r="5" fill="#FCA5A5"/>
                <rect x="66" y="26" width="56" height="10" rx="5" fill="#BFDBFE"/>
                <rect x="24" y="56" width="40" height="7" rx="3.5" fill="#93C5FD"/>
                <rect x="24" y="68" width="100" height="5" rx="2.5" fill="#E2E8F0"/>
                <rect x="24" y="78" width="80" height="5" rx="2.5" fill="#E2E8F0"/>
                <rect x="24" y="88" width="88" height="5" rx="2.5" fill="#E2E8F0"/>
                <circle cx="112" cy="84" r="22" fill="#2563EB" opacity="0.12"/>
                <circle cx="112" cy="84" r="16" fill="#2563EB"/>
                <path d="M106 84 L110.5 88.5 L118 80" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M136 20 L140 14 M140 20 L136 14" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="72" r="3" fill="#BFDBFE"/>
                <circle cx="144" cy="50" r="2" fill="#6EE7B7"/>
              </svg>
            </div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Globe className="w-4 h-4" />
              Instant website content extraction
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-3 leading-tight">
              Scrape any website<br />in seconds
            </h1>
            <p className="text-slate-500 text-lg">
              Paste a URL below to extract titles, headings, and links — then get an AI-powered summary.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <label htmlFor="url-input" className="block text-sm font-medium text-slate-700 mb-2">
              Website URL
            </label>

            <div className={`flex items-center border-2 rounded-xl transition-colors overflow-hidden ${
              inputError
                ? 'border-red-400'
                : 'border-slate-200 focus-within:border-blue-500'
            }`}>
              <div className="pl-4 pr-2 text-slate-400">
                <Globe className="w-5 h-5" />
              </div>
              <input
                id="url-input"
                type="text"
                value={url}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com"
                className="flex-1 py-4 pr-4 text-base text-slate-900 placeholder-slate-400 outline-none bg-transparent"
                disabled={loading}
                autoFocus
              />
            </div>

            {inputError && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                {inputError}
              </p>
            )}

            <button
              onClick={handleScrape}
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors text-base"
            >
              Scrape Website
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-sm">
            <Shield className="w-4 h-4" />
            <span>No account required. Results are available instantly.</span>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-5">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="44" height="44" rx="12" fill="#EFF6FF"/>
                <rect x="10" y="12" width="24" height="3" rx="1.5" fill="#93C5FD"/>
                <rect x="10" y="18" width="18" height="2.5" rx="1.25" fill="#BFDBFE"/>
                <rect x="10" y="23" width="20" height="2.5" rx="1.25" fill="#BFDBFE"/>
                <rect x="10" y="28" width="14" height="2.5" rx="1.25" fill="#BFDBFE"/>
                <circle cx="33" cy="29" r="7" fill="#2563EB"/>
                <path d="M30.5 29 L32.3 31 L35.5 27" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-xs font-medium text-slate-600 text-center leading-snug">Extract titles &amp; headings</p>
            </div>
            <div className="flex flex-col items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-5">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="44" height="44" rx="12" fill="#ECFDF5"/>
                <path d="M13 22 C13 16.477 17.477 12 23 12 C28.523 12 33 16.477 33 22 C33 27.523 28.523 32 23 32" stroke="#10B981" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <path d="M23 32 L20 29 M23 32 L26 29" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 22 L21.5 25.5 L28 19" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-xs font-medium text-slate-600 text-center leading-snug">Collect all page links</p>
            </div>
            <div className="flex flex-col items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-5">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="44" height="44" rx="12" fill="#FFFBEB"/>
                <circle cx="22" cy="19" r="6" stroke="#F59E0B" strokeWidth="1.8" fill="none"/>
                <path d="M22 13 L22 11 M22 27 L22 29 M28 19 L30 19 M14 19 L16 19" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="14" y="30" width="16" height="3" rx="1.5" fill="#FCD34D"/>
                <rect x="17" y="25" width="10" height="2" rx="1" fill="#F59E0B" opacity="0.5"/>
              </svg>
              <p className="text-xs font-medium text-slate-600 text-center leading-snug">AI-powered summary</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
