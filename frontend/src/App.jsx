import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import ValidatorPage from './components/validator/ValidatorPage';
import ScannerPage from './components/scanner/ScannerPage';
import JournalPage from './components/journal/JournalPage';
import TradeDetailPage from './components/journal/TradeDetailPage';
import CloseTradeForm from './components/journal/CloseTradeForm';
import AnalyticsPage from './components/journal/AnalyticsPage';
import PatternAnalysisPage from './components/journal/PatternAnalysisPage';

import NewEntryPage from './components/journal/NewEntryPage';
export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/validator" replace />} />
          <Route path="validator" element={<ValidatorPage />} />
          <Route path="scanner" element={<ScannerPage />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="journal/analytics" element={<AnalyticsPage />} />
          <Route path="journal/patterns" element={<PatternAnalysisPage />} />
          <Route path="journal/:id" element={<TradeDetailPage />} />
          <Route path="journal/:id/close" element={<CloseTradeForm />} />
          <Route path="journal/new" element={<NewEntryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
