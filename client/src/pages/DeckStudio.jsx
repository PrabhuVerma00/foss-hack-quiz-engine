import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDeckStudioStore } from '../deckStudio/store';
import { fetchCloudDecks, downloadDeckToLocal } from '../deckStudio/cloudCatalog';
import CloudDeckCard from '../components/CloudDeckCard';

function isSlideValid(slide) {
  return (
    slide &&
    slide.prompt.trim().length > 0 &&
    Array.isArray(slide.options) &&
    slide.options.length === 4 &&
    slide.options.every((opt) => String(opt || '').trim().length > 0) &&
    Number.isInteger(slide.correctIndex) &&
    slide.correctIndex >= 0 &&
    slide.correctIndex < 4
  );
}

export default function DeckStudio({ onBack, onHostDeck }) {
  const {
    deck,
    selectedSlideId,
    validation,
    saveState,
    csvError,
    initDraft,
    setTitle,
    addSlide,
    removeSlide,
    selectSlide,
    updatePrompt,
    updateImageUrl,
    updateOption,
    setCorrectIndex,
    importCsvText,
    exportFlux,
    validateDeck,
    undo,
    redo,
    historyPast,
    historyFuture,
  } = useDeckStudioStore();

  const [csvText, setCsvText] = useState('');
  const [category, setCategory] = useState('General Knowledge');
  const [actionMessage, setActionMessage] = useState('');
  const [cloudDecks, setCloudDecks] = useState([]);
  const [cloudStatus, setCloudStatus] = useState('loading');
  const [cloudError, setCloudError] = useState('');
  const [downloadingDeckId, setDownloadingDeckId] = useState('');

  const csvTemplate =
    'prompt,optionA,optionB,optionC,optionD,correct,imageUrl\n' +
    'Which planet is known as the Red Planet?,Mercury,Venus,Mars,Jupiter,Mars,\n';

  useEffect(() => {
    initDraft();
  }, [initDraft]);

  const loadCloudCatalog = useCallback(async () => {
    setCloudStatus('loading');
    setCloudError('');
    try {
      const decks = await fetchCloudDecks();
      setCloudDecks(decks);
      setCloudStatus('ready');
    } catch (err) {
      const message = String(err?.message || '').toLowerCase();
      const isOffline =
        message.includes('failed to fetch') ||
        message.includes('network') ||
        message.includes('offline');
      setCloudDecks([]);
      setCloudStatus(isOffline ? 'offline' : 'error');
      setCloudError(err?.message || 'Unable to load cloud decks.');
    }
  }, []);

  useEffect(() => {
    loadCloudCatalog();
  }, [loadCloudCatalog]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const withModifier = event.metaKey || event.ctrlKey;
      if (!withModifier) return;
      const key = event.key.toLowerCase();

      if (key === 'z' && event.shiftKey) {
        event.preventDefault();
        redo();
        return;
      }

      if (key === 'z') {
        event.preventDefault();
        undo();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  const activeSlide = useMemo(
    () => deck.slides.find((slide) => slide.id === selectedSlideId) || deck.slides[0],
    [deck.slides, selectedSlideId]
  );

  const activeIndex = deck.slides.findIndex((slide) => slide.id === activeSlide?.id);
  const activeErrors = validation.bySlide[activeIndex] || {};
  const invalidSlideCount = Object.keys(validation.bySlide || {}).length;

  const validCount = useMemo(
    () => deck.slides.filter((slide) => isSlideValid(slide)).length,
    [deck.slides]
  );

  const progressPct = deck.slides.length > 0 ? Math.round((validCount / deck.slides.length) * 100) : 0;

  const onImportCsv = () => {
    if (!csvText.trim()) return;
    setActionMessage('');
    importCsvText(csvText);
  };

  const onExport = () => {
    const checked = validateDeck();
    if (!checked.ok) {
      setActionMessage('Cannot export yet. Fix validation errors first.');
      return;
    }
    const ok = exportFlux();
    setActionMessage(ok ? 'Deck exported as .flux.' : 'Export failed. Please try again.');
  };

  const onImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
    importCsvText(text);
  };

  const onDeleteQuestion = () => {
    if (!activeSlide || deck.slides.length <= 1) return;
    const ok = window.confirm('Delete this question? You can still Undo.');
    if (!ok) return;
    setActionMessage('');
    removeSlide(activeSlide.id);
  };

  const onAddQuestion = () => {
    setActionMessage('');
    addSlide();
    window.setTimeout(() => validateDeck(), 0);
  };

  const onHostDirectly = () => {
    const checked = validateDeck();
    if (!checked.ok) {
      setActionMessage('Cannot launch game yet. Fix validation errors first.');
      return;
    }
    if (!onHostDeck) {
      setActionMessage('Launch unavailable in this context.');
      return;
    }
    const questions = checked.data.slides.map((slide, index) => ({
      q_id: `q_${String(index + 1).padStart(2, '0')}`,
      type: slide.imageUrl ? 'image_guess' : 'text_only',
      prompt: slide.prompt,
      asset_ref: slide.imageUrl || null,
      options: slide.options,
      correct_answer: slide.options[slide.correctIndex],
      time_limit_ms: 20000,
      fuzzy_allowances: [],
    }));
    onHostDeck(questions);
    setActionMessage('Launching host with this deck...');
  };

  const onDownloadCloudDeck = async (deckMeta) => {
    if (!deckMeta?.deckUrl || downloadingDeckId) return;
    setActionMessage('');
    setDownloadingDeckId(deckMeta.id);
    try {
      const saved = await downloadDeckToLocal(deckMeta.deckUrl);
      setActionMessage(`Downloaded "${saved.title}" to local deck storage.`);
      await initDraft();
    } catch (err) {
      setActionMessage(err?.message || 'Cloud download failed.');
    } finally {
      setDownloadingDeckId('');
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="border-b border-slate-700 p-4">
          <h1 className="text-lg font-black tracking-tight">Deck Studio</h1>
          <p className="mt-1 text-xs text-slate-400">Slide Navigator</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {deck.slides.map((slide, index) => {
            const isActive = slide.id === activeSlide?.id;
            return (
              <button
                key={slide.id}
                onClick={() => selectSlide(slide.id)}
                className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                  isActive
                    ? 'border-emerald-400/70 bg-emerald-500/20'
                    : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                }`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">Question {index + 1}</p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-100">
                  {slide.prompt || 'Untitled question'}
                </p>
              </button>
            );
          })}
        </div>
        <div className="border-t border-slate-700 p-4">
          <button
            onClick={onAddQuestion}
            className="w-full rounded-xl bg-emerald-400 px-3 py-3 text-sm font-black tracking-wide text-black transition hover:bg-emerald-300"
          >
            + Add Question
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-slate-900 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-5xl rounded-2xl border border-slate-700 bg-slate-800/50 p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">WYSIWYG Canvas</p>
          <p className="mt-2 text-2xl font-black">Question editor canvas placeholder</p>
        </div>
      </main>

      <aside className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
        <div className="border-b border-slate-700 p-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Settings</p>
          <p className="text-xs text-emerald-300">Draft status: {saveState}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 text-xs text-slate-400">
          Settings placeholder
        </div>
      </aside>
    </div>
  );
}
