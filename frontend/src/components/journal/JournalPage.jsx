import { useEffect, useState } from 'react';
import { BookOpen, Filter, BarChart3, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, LoadingSpinner } from '../shared';
import useJournalStore from '../../store/journalStore';
import JournalFilters from './JournalFilters';
import JournalTable from './JournalTable';
import JournalStats from './JournalStats';

export default function JournalPage() {
  const navigate = useNavigate();
  const { entries, stats, loading, fetchEntries, fetchStats } = useJournalStore();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, [fetchEntries, fetchStats]);

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="text-blue-500" size={32} />
            Bitácora de Trading
          </h1>
          <p className="text-slate-400 mt-2">
            Gestiona y analiza todas tus operaciones
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="success"
            size="md"
            onClick={() => navigate('/journal/patterns')}
            className="flex items-center gap-2"
          >
            <Target size={20} />
            Patrones
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/journal/analytics')}
            className="flex items-center gap-2"
          >
            <BarChart3 size={20} />
            Analytics
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter size={20} />
            Filtros
          </Button>
        </div>
      </div>

      <JournalStats stats={stats} />

      {showFilters && <JournalFilters />}

      <JournalTable entries={entries} loading={loading} />
    </div>
  );
}
