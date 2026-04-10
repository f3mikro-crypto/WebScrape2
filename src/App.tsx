import { useState } from 'react';
import Layout from './components/Layout';
import HomeScreen from './screens/HomeScreen';
import ResultsScreen from './screens/ResultsScreen';
import HistoryScreen from './screens/HistoryScreen';
import ErrorScreen from './screens/ErrorScreen';
import { Screen, ScrapeResult } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [history, setHistory] = useState<ScrapeResult[]>([]);

  function navigate(screen: Screen) {
    setCurrentScreen(screen);
  }

  function handleScrapeSuccess(result: ScrapeResult) {
    setScrapeResult(result);
    setHistory(prev => [result, ...prev]);
    navigate('results');
  }

  function handleScrapeError(message: string) {
    setErrorMessage(message);
    navigate('error');
  }

  function handleSelectHistoryResult(result: ScrapeResult) {
    setScrapeResult(result);
    navigate('results');
  }

  return (
    <Layout onNavigate={navigate} currentScreen={currentScreen} hasResult={scrapeResult !== null} hasError={errorMessage !== ''}>
      {currentScreen === 'home' && (
        <HomeScreen
          onSuccess={handleScrapeSuccess}
          onError={handleScrapeError}
        />
      )}

      {currentScreen === 'results' && (
        <ResultsScreen
          result={scrapeResult}
          onViewHistory={() => navigate('history')}
          onScrapeAgain={() => navigate('home')}
        />
      )}

      {currentScreen === 'history' && (
        <HistoryScreen
          history={history}
          onBack={() => navigate('home')}
          onSelectResult={handleSelectHistoryResult}
        />
      )}

      {currentScreen === 'error' && (
        <ErrorScreen
          message={errorMessage}
          onTryAgain={() => navigate('home')}
        />
      )}
    </Layout>
  );
}
