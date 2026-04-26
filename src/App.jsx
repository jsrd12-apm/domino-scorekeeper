import { useState, useEffect, useRef } from 'react';
import { Plus, X, RotateCcw, Settings, Trophy, History, Pencil, Check, ChevronLeft, Trash2, Share2, Info, Mail, Edit3, FileText } from 'lucide-react';

// ==== Edit these defaults before deploying ====
const APP_VERSION = '1.0';
const DEFAULT_FEEDBACK_EMAIL = 'jsrd12@gmail.com';
const DEFAULT_GITHUB_REPO = 'https://github.com/jsrd12-apm/domino-scorekeeper';
// ==============================================

const STRINGS = {
  es: {
    new: 'Nuevo',
    add: 'AÑADIR',
    total: 'TOTAL',
    wins: 'GANARON',
    no_rounds: 'Sin juegos aún',
    settings: 'AJUSTES',
    paso_corrido: 'Paso Corrido',
    p_corrido: 'P. CORRIDO',
    for_whom: '¿Para quién?',
    cancel: 'Cancelar',
    win_at: 'Ganar a',
    language: 'Idioma',
    saved_games: 'Juegos guardados',
    no_saved: 'No hay juegos guardados',
    rounds_word: 'jugadas',
    delete_q: '¿Borrar?',
    save_q: '¿Guardar este juego en el historial?',
    new_q: '¿Empezar nuevo? Se borrará el actual.',
    back: 'Atrás',
    share: 'Compartir',
    sharing: 'Compartiendo...',
    share_failed: 'No se pudo compartir',
    add_another_paso: '¿Agregar otro Paso Corrido?',
    yes: 'Sí',
    edit_round: 'Editar jugada',
    main_score: 'Puntos',
    pc_count: 'Paso Corrido (cantidad)',
    save: 'Guardar',
    delete: 'Borrar',
    delete_round_q: '¿Borrar esta jugada?',
    export_text: 'Exportar texto',
    share_image: 'Compartir imagen',
    feedback: 'Sugerencias',
    send_email: 'Enviar email',
    open_github: 'Abrir GitHub',
    feedback_intro: 'Envía tus ideas para mejorar la app:',
    about: 'Acerca de',
    about_intro: 'Tanteador de dominó dominicano. Sin anuncios. Funciona sin internet.',
    how_scoring: 'Cómo funciona el puntaje',
    rule_teams: 'Cada equipo es de 2 jugadores.',
    rule_target: 'Se gana al llegar a la meta (por defecto 200, configurable en Ajustes).',
    rule_winner: 'Solo el equipo ganador de cada jugada anota; el otro recibe 0.',
    rule_paso: 'Paso Corrido: bono adicional para el equipo elegido. Puedes apilar varios en una jugada.',
    rule_edit: 'Toca una jugada en la tabla para editar o borrar.',
    how_to_use: 'Cómo usar',
    use_edit: 'Toca el lápiz junto a un nombre para editarlo.',
    use_score: 'Ingresa los puntos en las casillas y toca AÑADIR.',
    use_paso: 'Toca P. CORRIDO y elige el equipo. Toca de nuevo para apilar más.',
    use_share: 'Toca el botón compartir para enviar la imagen del juego.',
    use_history: 'Toca el reloj para ver juegos guardados.',
    privacy: 'Privacidad',
    privacy_text: 'Todos los datos se guardan solo en tu dispositivo. No se recolecta nada. No se envía nada a ningún servidor.',
    license: 'Licencia',
    license_text: 'Software libre de uso bajo tu propia responsabilidad. Sin garantías. No se recolectan datos. Todo se guarda localmente en el dispositivo del usuario.',
    created_by: 'Creado por',
    version: 'Versión',
    final: 'Final',
    winner: 'Ganador',
    game_export_subject: 'Juego de Dominó',
    feedback_subject: 'Sugerencia - Dominó Scorekeeper',
    no_p_corrido: 'sin P.C.',
    no_email_set: 'Email no configurado',
    no_repo_set: 'Repo no configurado',
    install_title: 'Instalar la app',
    install_btn: 'Instalar',
    install_ios_safari: 'Toca Compartir y luego "Agregar a Inicio" para instalar en tu iPhone.',
    install_ios_chrome: 'Para instalar en iPhone, abre este enlace en Safari.',
    install_android_fallback: 'Toca el menú (⋮) de Chrome y luego "Instalar aplicación".',
    install_dismiss: 'Cerrar',
  },
  en: {
    new: 'New',
    add: 'ADD',
    total: 'TOTAL',
    wins: 'WIN',
    no_rounds: 'No rounds yet',
    settings: 'SETTINGS',
    paso_corrido: 'Paso Corrido',
    p_corrido: 'P. CORRIDO',
    for_whom: 'For whom?',
    cancel: 'Cancel',
    win_at: 'Win at',
    language: 'Language',
    saved_games: 'Saved games',
    no_saved: 'No saved games',
    rounds_word: 'rounds',
    delete_q: 'Delete?',
    save_q: 'Save this game to history?',
    new_q: 'Start new? Current will be cleared.',
    back: 'Back',
    share: 'Share',
    sharing: 'Sharing...',
    share_failed: 'Share failed',
    add_another_paso: 'Add another Paso Corrido?',
    yes: 'Yes',
    edit_round: 'Edit round',
    main_score: 'Points',
    pc_count: 'Paso Corrido (count)',
    save: 'Save',
    delete: 'Delete',
    delete_round_q: 'Delete this round?',
    export_text: 'Export text',
    share_image: 'Share image',
    feedback: 'Feedback',
    send_email: 'Send email',
    open_github: 'Open GitHub',
    feedback_intro: 'Share your ideas to improve the app:',
    about: 'About',
    about_intro: 'Dominican domino scorekeeper. No ads. Works offline.',
    how_scoring: 'How scoring works',
    rule_teams: 'Each team has 2 players.',
    rule_target: 'First to reach the target wins (default 200, set in Settings).',
    rule_winner: 'Only the round winner scores; the other team gets 0.',
    rule_paso: 'Paso Corrido: extra bonus for the chosen team. You can stack several in one round.',
    rule_edit: 'Tap a round in the table to edit or delete.',
    how_to_use: 'How to use',
    use_edit: 'Tap the pencil next to a name to edit it.',
    use_score: 'Enter points in the boxes and tap ADD.',
    use_paso: 'Tap P. CORRIDO and pick a team. Tap again to stack more.',
    use_share: 'Tap the share button to send a game image.',
    use_history: 'Tap the clock to see saved games.',
    privacy: 'Privacy',
    privacy_text: 'All data is stored only on your device. Nothing is collected. Nothing is sent to any server.',
    license: 'License',
    license_text: 'Free software, use at your own risk. No warranty. No data collected. All data is stored locally on the user\'s device.',
    created_by: 'Created by',
    version: 'Version',
    final: 'Final',
    winner: 'Winner',
    game_export_subject: 'Domino Game',
    feedback_subject: 'Feedback - Dominó Scorekeeper',
    no_p_corrido: 'no P.C.',
    no_email_set: 'Email not configured',
    no_repo_set: 'Repo not configured',
    install_title: 'Install the app',
    install_btn: 'Install',
    install_ios_safari: 'Tap Share then "Add to Home Screen" to install on your iPhone.',
    install_ios_chrome: 'To install on iPhone, open this link in Safari.',
    install_android_fallback: 'Tap the Chrome menu (⋮) then "Install app".',
    install_dismiss: 'Dismiss',
  },
};

const DEFAULT_STATE = {
  lang: 'es',
  target: 200,
  teamA: { name: 'Nosotros', p1: 'Jugador Uno', p2: 'Jugador Dos' },
  teamB: { name: 'Ellos', p1: 'Jugador Tres', p2: 'Jugador Cuatro' },
  pasoValue: 25,
  creator: 'José Rodríguez',
  feedbackEmail: DEFAULT_FEEDBACK_EMAIL,
  githubRepo: DEFAULT_GITHUB_REPO,
  rounds: [],
};

const C = {
  bg: '#ffffff',
  blue: '#1e3a8a',
  blueDark: '#172554',
  blueLight: '#dbeafe',
  red: '#dc2626',
  redDark: '#991b1b',
  redLight: '#fee2e2',
  text: '#0f172a',
  textLight: '#64748b',
  border: '#e2e8f0',
  borderDark: '#cbd5e1',
  green: '#16a34a',
  amber: '#d97706',
  amberLight: '#fef3c7',
  gold: '#fbbf24',
};

const GRID_5 = '28px 1fr 38px 1fr 38px 28px';
const GRID_5_HIST = '32px 1fr 36px 1fr 36px';

// Migrate old rounds to include bonusCountA/bonusCountB
function migrateRound(r) {
  const bonusA = r.bonusA || 0;
  const bonusB = r.bonusB || 0;
  return {
    a: r.a || 0,
    b: r.b || 0,
    bonusA,
    bonusB,
    bonusCountA: r.bonusCountA != null ? r.bonusCountA : (bonusA > 0 ? 1 : 0),
    bonusCountB: r.bonusCountB != null ? r.bonusCountB : (bonusB > 0 ? 1 : 0),
  };
}

export default function DominoScorekeeper() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [history, setHistory] = useState([]);
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');
  const [pendingBonusA, setPendingBonusA] = useState(0);
  const [pendingBonusB, setPendingBonusB] = useState(0);
  const [pickingBonus, setPickingBonus] = useState(false);
  const [confirmingExtraBonus, setConfirmingExtraBonus] = useState(false);
  const [editingPaso, setEditingPaso] = useState(false);
  const [pasoEditValue, setPasoEditValue] = useState('25');
  const [editingField, setEditingField] = useState(null);
  const [editingRound, setEditingRound] = useState(null); // index of round
  const [view, setView] = useState('game');
  const [shareStatus, setShareStatus] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const t = STRINGS[state.lang];
  const roundsScrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const v = localStorage.getItem('domino-state');
        if (v) {
          const parsed = JSON.parse(v);
          parsed.rounds = (parsed.rounds || []).map(migrateRound);
          setState({ ...DEFAULT_STATE, ...parsed });
        }
      } catch (e) {}
      try {
        const v = localStorage.getItem('domino-history');
        if (v) {
          const hist = JSON.parse(v);
          setHistory(hist.map((g) => ({ ...g, rounds: g.rounds.map(migrateRound) })));
        }
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try { localStorage.setItem('domino-state', JSON.stringify(state)); } catch (e) {}
    })();
  }, [state, loaded]);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try { localStorage.setItem('domino-history', JSON.stringify(history)); } catch (e) {}
    })();
  }, [history, loaded]);

  useEffect(() => {
    if (roundsScrollRef.current) {
      roundsScrollRef.current.scrollTop = roundsScrollRef.current.scrollHeight;
    }
  }, [state.rounds.length]);

  const totalA = state.rounds.reduce((s, r) => s + r.a + (r.bonusA || 0), 0);
  const totalB = state.rounds.reduce((s, r) => s + r.b + (r.bonusB || 0), 0);
  const winner =
    totalA >= state.target && totalA > totalB ? state.teamA.name :
    totalB >= state.target && totalB > totalA ? state.teamB.name : null;

  const update = (patch) => setState((s) => ({ ...s, ...patch }));
  const updateTeam = (team, patch) => setState((s) => ({ ...s, [team]: { ...s[team], ...patch } }));

  const addRound = () => {
    const a = parseInt(scoreA) || 0;
    const b = parseInt(scoreB) || 0;
    const totalPending = pendingBonusA + pendingBonusB;
    if (a === 0 && b === 0 && totalPending === 0) return;

    const winnerA = a >= b;
    const round = {
      a: winnerA ? a : 0,
      b: winnerA ? 0 : b,
      bonusA: pendingBonusA * state.pasoValue,
      bonusB: pendingBonusB * state.pasoValue,
      bonusCountA: pendingBonusA,
      bonusCountB: pendingBonusB,
    };
    setState((s) => ({ ...s, rounds: [...s.rounds, round] }));
    setScoreA('');
    setScoreB('');
    setPendingBonusA(0);
    setPendingBonusB(0);
  };

  const handlePasoTap = () => {
    const totalPending = pendingBonusA + pendingBonusB;
    if (totalPending === 0) {
      setPickingBonus(true);
    } else {
      setConfirmingExtraBonus(true);
    }
  };

  const pickBonusTeam = (team) => {
    if (team === 'a') setPendingBonusA((c) => c + 1);
    else setPendingBonusB((c) => c + 1);
    setPickingBonus(false);
    setConfirmingExtraBonus(false);
  };

  const confirmAddExtra = () => {
    setConfirmingExtraBonus(false);
    setPickingBonus(true);
  };

  const clearPendingBonus = () => {
    setPendingBonusA(0);
    setPendingBonusB(0);
  };

  const startEditPaso = () => {
    setPasoEditValue(String(state.pasoValue));
    setEditingPaso(true);
  };

  const savePaso = () => {
    const v = parseInt(pasoEditValue) || 0;
    update({ pasoValue: Math.max(1, v) });
    setEditingPaso(false);
  };

  const deleteRound = (i) => setState((s) => ({ ...s, rounds: s.rounds.filter((_, idx) => idx !== i) }));

  const updateRound = (i, patch) => {
    setState((s) => ({
      ...s,
      rounds: s.rounds.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    }));
  };

  const newGame = () => {
    if (state.rounds.length === 0) return;
    if (winner && window.confirm(t.save_q)) {
      saveCurrentToHistory();
    } else if (!window.confirm(t.new_q)) {
      return;
    }
    setState((s) => ({ ...s, rounds: [] }));
    setScoreA('');
    setScoreB('');
    clearPendingBonus();
  };

  const saveCurrentToHistory = () => {
    if (state.rounds.length === 0) return;
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      teamA: { ...state.teamA },
      teamB: { ...state.teamB },
      target: state.target,
      pasoValue: state.pasoValue,
      rounds: [...state.rounds],
      totalA,
      totalB,
      winner,
    };
    setHistory((h) => [entry, ...h]);
  };

  const deleteHistoryGame = (id) => {
    if (!window.confirm(t.delete_q)) return;
    setHistory((h) => h.filter((g) => g.id !== id));
  };

  const shareGame = async () => {
    setShareStatus(t.sharing);
    try {
      const blob = await renderGameToBlob({ state, totalA, totalB, winner, date: new Date(), t });
      const file = new File([blob], 'domino.jpg', { type: 'image/jpeg' });
      const shareData = {
        files: [file],
        title: 'Dominó',
        text: `${state.teamA.name} ${totalA} – ${state.teamB.name} ${totalB}`,
      };
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share(shareData);
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'domino.jpg';
        a.click();
        URL.revokeObjectURL(url);
      }
      setShareStatus(null);
    } catch (err) {
      setShareStatus(null);
      if (err.name !== 'AbortError') alert(t.share_failed);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: '"Inter", system-ui, sans-serif', color: C.text }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Bebas+Neue&display=swap"
        rel="stylesheet"
      />

      <InstallBanner t={t} />

      <header className="app-header px-3 pb-3" style={{ background: C.blue }}>
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl tracking-wide leading-none" style={{ fontFamily: '"Bebas Neue", sans-serif', color: 'white', letterSpacing: '0.05em' }}>
              DOMINÓ
            </h1>
            <div className="w-1 h-1 rounded-full" style={{ background: C.red }} />
            <div className="w-1 h-1 rounded-full" style={{ background: 'white' }} />
            <div className="w-1 h-1 rounded-full" style={{ background: C.red }} />
          </div>
          <div className="flex gap-1.5">
            <IconBtn onClick={shareGame} disabled={state.rounds.length === 0}>
              <Share2 size={16} />
            </IconBtn>
            <IconBtn onClick={() => setView(view === 'history' ? 'game' : 'history')}>
              <History size={16} />
            </IconBtn>
            <IconBtn onClick={() => setView(view === 'about' ? 'game' : 'about')}>
              <Info size={16} />
            </IconBtn>
            <IconBtn onClick={() => setView(view === 'settings' ? 'game' : 'settings')}>
              <Settings size={16} />
            </IconBtn>
            <button
              onClick={newGame}
              className="px-3 py-1.5 rounded-md font-bold text-xs flex items-center gap-1 active:scale-95 transition"
              style={{ background: C.red, color: 'white' }}
            >
              <RotateCcw size={12} /> {t.new}
            </button>
          </div>
        </div>
        {shareStatus && <div className="text-center text-xs mt-1" style={{ color: C.blueLight }}>{shareStatus}</div>}
      </header>

      <div className="max-w-md mx-auto px-3 py-2">
        {view === 'game' && (
          <GameView
            t={t}
            state={state}
            totalA={totalA}
            totalB={totalB}
            winner={winner}
            scoreA={scoreA} setScoreA={setScoreA}
            scoreB={scoreB} setScoreB={setScoreB}
            pendingBonusA={pendingBonusA} pendingBonusB={pendingBonusB}
            pickingBonus={pickingBonus} setPickingBonus={setPickingBonus}
            confirmingExtraBonus={confirmingExtraBonus} setConfirmingExtraBonus={setConfirmingExtraBonus}
            handlePasoTap={handlePasoTap}
            pickBonusTeam={pickBonusTeam}
            confirmAddExtra={confirmAddExtra}
            clearPendingBonus={clearPendingBonus}
            editingPaso={editingPaso} startEditPaso={startEditPaso} savePaso={savePaso}
            pasoEditValue={pasoEditValue} setPasoEditValue={setPasoEditValue}
            editingField={editingField} setEditingField={setEditingField}
            updateTeam={updateTeam}
            addRound={addRound}
            setEditingRound={setEditingRound}
            roundsScrollRef={roundsScrollRef}
          />
        )}

        {view === 'settings' && <SettingsView t={t} state={state} update={update} onClose={() => setView('game')} />}
        {view === 'about' && <AboutView t={t} state={state} onClose={() => setView('game')} />}
        {view === 'history' && (
          <HistoryView t={t} state={state} history={history} onDelete={deleteHistoryGame} onClose={() => setView('game')} />
        )}
      </div>

      {editingRound !== null && (
        <EditRoundModal
          t={t}
          state={state}
          round={state.rounds[editingRound]}
          onSave={(patch) => { updateRound(editingRound, patch); setEditingRound(null); }}
          onDelete={() => { if (window.confirm(t.delete_round_q)) { deleteRound(editingRound); setEditingRound(null); } }}
          onClose={() => setEditingRound(null)}
        />
      )}
    </div>
  );
}

// =================== INSTALL BANNER ===================
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isAndroid = () => /Android/.test(navigator.userAgent);
const isStandalone = () =>
  (typeof window !== 'undefined') &&
  (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);
const isSafariIOS = () =>
  isIOS() && /Safari/.test(navigator.userAgent) &&
  !/CriOS|FxiOS|EdgiOS|OPiOS|GSA/.test(navigator.userAgent);

function InstallBanner({ t }) {
  const [dismissed, setDismissed] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Session-only dismissal: reload or new tab brings the banner back.
    try {
      if (sessionStorage.getItem('install-dismissed') === '1') setDismissed(true);
    } catch (e) {}
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    const installed = () => { setDismissed(true); setDeferredPrompt(null); };
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  if (dismissed || isStandalone()) return null;

  const dismiss = () => {
    try { sessionStorage.setItem('install-dismissed', '1'); } catch (e) {}
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') { setDeferredPrompt(null); dismiss(); }
  };

  const ios = isIOS();
  const android = isAndroid();
  const safariIOS = isSafariIOS();
  const showAndroidPrompt = !!deferredPrompt;
  const showAndroidFallback = android && !deferredPrompt;
  const showSafariHint = ios && safariIOS;
  const showChromeIOSHint = ios && !safariIOS;

  if (!showAndroidPrompt && !showAndroidFallback && !showSafariHint && !showChromeIOSHint) return null;

  const hint = showSafariHint ? t.install_ios_safari
    : showChromeIOSHint ? t.install_ios_chrome
    : showAndroidFallback ? t.install_android_fallback
    : '';

  return (
    <div className="install-banner px-3 pb-2 flex items-center justify-between gap-2" style={{ background: C.amberLight, borderBottom: `1px solid ${C.amber}`, color: C.text }}>
      <div className="flex-1 text-xs" style={{ lineHeight: 1.3 }}>
        <div className="font-bold mb-0.5" style={{ color: C.text }}>{t.install_title}</div>
        {hint && <div style={{ color: C.textLight }}>{hint}</div>}
      </div>
      {showAndroidPrompt && (
        <button onClick={handleInstall} className="px-3 py-1.5 rounded font-bold text-xs active:scale-95 transition" style={{ background: C.blue, color: 'white' }}>
          {t.install_btn}
        </button>
      )}
      <button onClick={dismiss} className="p-1 active:scale-90 transition" style={{ color: C.textLight }} aria-label={t.install_dismiss}>
        <X size={16} />
      </button>
    </div>
  );
}

function IconBtn({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-1.5 rounded-md active:scale-95 transition disabled:opacity-40"
      style={{ background: C.blueDark, color: 'white' }}
    >
      {children}
    </button>
  );
}

// =================== GAME VIEW ===================
function GameView(p) {
  const { t, state, totalA, totalB, winner, scoreA, setScoreA, scoreB, setScoreB,
    pendingBonusA, pendingBonusB, pickingBonus, setPickingBonus,
    confirmingExtraBonus, setConfirmingExtraBonus,
    handlePasoTap, pickBonusTeam, confirmAddExtra, clearPendingBonus,
    editingPaso, startEditPaso, savePaso, pasoEditValue, setPasoEditValue,
    editingField, setEditingField, updateTeam, addRound, setEditingRound, roundsScrollRef } = p;

  const totalPendingBonus = pendingBonusA + pendingBonusB;

  return (
    <>
      {winner && (
        <div className="mb-2 py-1.5 px-2 rounded-lg text-center flex items-center justify-center gap-1" style={{ background: C.gold, color: C.blueDark }}>
          <Trophy size={14} />
          <span className="text-sm font-bold tracking-wide" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
            {winner.toUpperCase()} {t.wins}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-2">
        <TeamColumn team={state.teamA} teamKey="teamA" accent={C.red} editingField={editingField} setEditingField={setEditingField} updateTeam={updateTeam} />
        <TeamColumn team={state.teamB} teamKey="teamB" accent={C.blue} editingField={editingField} setEditingField={setEditingField} updateTeam={updateTeam} />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <ScoreBox value={scoreA} onChange={setScoreA} onEnter={addRound} accent={C.red} pendingBonus={pendingBonusA} pasoValue={state.pasoValue} onClearBonus={clearPendingBonus} />
        <ScoreBox value={scoreB} onChange={setScoreB} onEnter={addRound} accent={C.blue} pendingBonus={pendingBonusB} pasoValue={state.pasoValue} onClearBonus={clearPendingBonus} />
      </div>

      <div className="gap-1.5 mb-2" style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr auto' }}>
        <button
          onClick={addRound}
          disabled={!scoreA && !scoreB && totalPendingBonus === 0}
          className="font-bold py-2.5 rounded-lg flex items-center justify-center gap-1 active:scale-95 transition disabled:opacity-40"
          style={{ background: C.blue, color: 'white', fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.1em', fontSize: '15px' }}
        >
          <Plus size={16} /> {t.add}
        </button>
        {!editingPaso ? (
          <button
            onClick={handlePasoTap}
            className="font-bold py-2.5 rounded-lg active:scale-95 transition flex items-center justify-center gap-1"
            style={{
              background: totalPendingBonus > 0 ? C.amber : 'white',
              color: totalPendingBonus > 0 ? 'white' : C.amber,
              border: `2px solid ${C.amber}`,
              fontFamily: '"Bebas Neue", sans-serif',
              letterSpacing: '0.05em',
              fontSize: '13px',
            }}
          >
            {totalPendingBonus > 0 ? `${t.p_corrido} ×${totalPendingBonus}` : (
              <>{t.p_corrido} <span style={{ color: C.amber }}>+{state.pasoValue}</span></>
            )}
          </button>
        ) : (
          <input
            autoFocus
            type="number"
            inputMode="numeric"
            value={pasoEditValue}
            onChange={(e) => setPasoEditValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && savePaso()}
            onBlur={savePaso}
            className="font-bold py-2.5 rounded-lg text-center outline-none"
            style={{ background: 'white', color: C.amber, border: `2px solid ${C.amber}`, fontFamily: '"Bebas Neue", sans-serif', fontSize: '17px' }}
          />
        )}
        <button
          onClick={editingPaso ? savePaso : startEditPaso}
          className="px-2.5 rounded-lg active:scale-95 transition"
          style={{ background: 'white', border: `2px solid ${C.borderDark}`, color: C.amber }}
        >
          {editingPaso ? <Check size={16} /> : <Pencil size={14} />}
        </button>
      </div>

      {/* Confirmation: stacking another P. Corrido */}
      {confirmingExtraBonus && (
        <div className="mb-2 p-3 rounded-lg" style={{ background: C.amberLight, border: `1px solid ${C.amber}` }}>
          <div className="text-center mb-2 text-sm font-bold" style={{ color: C.text }}>
            {t.add_another_paso}
            <div className="text-xs font-normal mt-0.5" style={{ color: C.textLight }}>
              {pendingBonusA > 0 && `${state.teamA.name}: ×${pendingBonusA} `}
              {pendingBonusB > 0 && `${state.teamB.name}: ×${pendingBonusB}`}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button onClick={() => setConfirmingExtraBonus(false)} className="py-2 rounded font-bold text-sm active:scale-95 transition" style={{ background: 'white', color: C.text, border: `1px solid ${C.border}` }}>
              {t.cancel}
            </button>
            <button onClick={confirmAddExtra} className="py-2 rounded font-bold text-sm active:scale-95 transition" style={{ background: C.amber, color: 'white' }}>
              {t.yes}
            </button>
          </div>
        </div>
      )}

      {/* Bonus team picker */}
      {pickingBonus && (
        <div className="mb-2 p-2 rounded-lg" style={{ background: C.amberLight, border: `1px solid ${C.amber}` }}>
          <div className="text-center mb-1.5 text-xs font-bold" style={{ color: C.text }}>
            {t.paso_corrido} +{state.pasoValue} — {t.for_whom}
          </div>
          <div className="grid grid-cols-2 gap-1.5 mb-1.5">
            <button onClick={() => pickBonusTeam('a')} className="py-2 rounded font-bold text-sm active:scale-95 transition" style={{ background: C.red, color: 'white' }}>
              {state.teamA.name}
            </button>
            <button onClick={() => pickBonusTeam('b')} className="py-2 rounded font-bold text-sm active:scale-95 transition" style={{ background: C.blue, color: 'white' }}>
              {state.teamB.name}
            </button>
          </div>
          <button onClick={() => setPickingBonus(false)} className="w-full py-1 rounded text-xs active:scale-95 transition" style={{ background: 'white', color: C.text, border: `1px solid ${C.border}` }}>
            {t.cancel}
          </button>
        </div>
      )}

      {/* Rounds table */}
      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
        <div
          className="py-1.5 text-center text-xs font-bold"
          style={{ display: 'grid', gridTemplateColumns: GRID_5, background: C.blueDark, color: 'white', fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.08em' }}
        >
          <div></div>
          <div className="col-span-2 truncate px-1">{state.teamA.name}</div>
          <div className="col-span-2 truncate px-1">{state.teamB.name}</div>
          <div></div>
        </div>

        <div
          className="py-0.5 text-center text-[9px] font-semibold"
          style={{ display: 'grid', gridTemplateColumns: GRID_5, background: '#eff6ff', color: C.textLight, letterSpacing: '0.05em' }}
        >
          <div></div>
          <div>•</div>
          <div style={{ color: C.amber }}>P.C.</div>
          <div>•</div>
          <div style={{ color: C.amber }}>P.C.</div>
          <div></div>
        </div>

        <div ref={roundsScrollRef} className="overflow-y-auto" style={{ maxHeight: '32vh', background: 'white' }}>
          {state.rounds.length === 0 ? (
            <div className="text-center py-6 italic text-sm" style={{ color: C.textLight }}>{t.no_rounds}</div>
          ) : (
            state.rounds.map((r, i) => (
              <button
                key={i}
                onClick={() => setEditingRound(i)}
                className="w-full items-center py-1.5 text-center active:bg-blue-50 transition"
                style={{ display: 'grid', gridTemplateColumns: GRID_5, alignItems: 'center', borderBottom: `1px solid ${C.border}` }}
              >
                <div className="text-xs font-semibold" style={{ color: C.textLight }}>P{i + 1}</div>
                <ScoreSlot value={r.a} color={C.red} />
                <BonusSlot value={r.bonusA || 0} count={r.bonusCountA || 0} />
                <ScoreSlot value={r.b} color={C.blue} />
                <BonusSlot value={r.bonusB || 0} count={r.bonusCountB || 0} />
                <Edit3 size={12} style={{ color: C.textLight, opacity: 0.4, margin: '0 auto' }} />
              </button>
            ))
          )}
        </div>

        <div
          className="items-center py-2 text-center"
          style={{ display: 'grid', gridTemplateColumns: GRID_5, alignItems: 'center', background: C.blueDark, color: 'white' }}
        >
          <div className="text-[10px] font-bold tracking-wider" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{t.total}</div>
          <div className="col-span-2 text-2xl font-bold tabular-nums" style={{ fontFamily: '"Bebas Neue", sans-serif', color: totalA > totalB ? C.gold : 'white' }}>
            {totalA}
          </div>
          <div className="col-span-2 text-2xl font-bold tabular-nums" style={{ fontFamily: '"Bebas Neue", sans-serif', color: totalB > totalA ? C.gold : 'white' }}>
            {totalB}
          </div>
          <div></div>
        </div>
      </div>
    </>
  );
}

function ScoreSlot({ value, color }) {
  return (
    <div className="text-lg font-bold tabular-nums" style={{ color: value > 0 ? color : C.textLight, fontFamily: '"Bebas Neue", sans-serif', opacity: value > 0 ? 1 : 0.4 }}>
      {value}
    </div>
  );
}

function BonusSlot({ value, count }) {
  if (value === 0) {
    return <div className="text-xs" style={{ color: C.textLight, opacity: 0.3 }}>—</div>;
  }
  return (
    <div className="flex flex-col items-center justify-center leading-none">
      <span className="text-base font-bold tabular-nums" style={{ color: C.amber, fontFamily: '"Bebas Neue", sans-serif' }}>
        +{value}
      </span>
      {count > 1 && (
        <span className="text-[8px] font-semibold" style={{ color: C.amber }}>×{count}</span>
      )}
    </div>
  );
}

function TeamColumn({ team, teamKey, accent, editingField, setEditingField, updateTeam }) {
  const fieldKey = (f) => `${teamKey}.${f}`;
  return (
    <div className="px-2 py-1.5 rounded-lg text-center" style={{ background: 'white', border: `2px solid ${accent}` }}>
      <EditableLine
        value={team.name}
        editing={editingField === fieldKey('name')}
        onEdit={() => setEditingField(fieldKey('name'))}
        onSave={() => setEditingField(null)}
        onChange={(v) => updateTeam(teamKey, { name: v })}
        size="lg" accent={accent}
      />
      <div className="flex justify-center gap-2 mt-0.5">
        <EditableLine
          value={team.p1}
          editing={editingField === fieldKey('p1')}
          onEdit={() => setEditingField(fieldKey('p1'))}
          onSave={() => setEditingField(null)}
          onChange={(v) => updateTeam(teamKey, { p1: v })}
          size="sm" accent={accent}
        />
        <span style={{ color: C.textLight, fontSize: '10px' }}>·</span>
        <EditableLine
          value={team.p2}
          editing={editingField === fieldKey('p2')}
          onEdit={() => setEditingField(fieldKey('p2'))}
          onSave={() => setEditingField(null)}
          onChange={(v) => updateTeam(teamKey, { p2: v })}
          size="sm" accent={accent}
        />
      </div>
    </div>
  );
}

function EditableLine({ value, editing, onEdit, onSave, onChange, size, accent }) {
  const styles = size === 'lg'
    ? { fontSize: '15px', fontWeight: 700, color: accent, fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.03em' }
    : { fontSize: '11px', color: C.textLight, fontWeight: 500 };

  if (editing) {
    return (
      <div className="flex items-center gap-1 justify-center">
        <input autoFocus value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onSave}
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
          className="text-center bg-transparent outline-none w-full min-w-0"
          style={{ ...styles, borderBottom: `1px solid ${accent}` }}
          maxLength={14}
        />
      </div>
    );
  }
  return (
    <button onClick={onEdit} className="flex items-center gap-0.5 justify-center active:opacity-70">
      <span style={styles}>{value || '...'}</span>
      <Pencil size={size === 'lg' ? 9 : 8} style={{ color: accent, opacity: 0.5 }} />
    </button>
  );
}

function ScoreBox({ value, onChange, onEnter, accent, pendingBonus, pasoValue, onClearBonus }) {
  const totalBonus = pendingBonus * pasoValue;
  return (
    <div className="relative">
      <input
        type="number" inputMode="numeric" placeholder="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onEnter()}
        className="w-full rounded-lg px-2 py-3 text-3xl text-center font-bold outline-none transition"
        style={{
          border: `2px solid ${pendingBonus > 0 ? C.amber : value ? accent : C.borderDark}`,
          color: accent, background: 'white', fontFamily: '"Bebas Neue", sans-serif',
        }}
      />
      {pendingBonus > 0 && (
        <button
          onClick={onClearBonus}
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5"
          style={{ background: C.amber, color: 'white', fontFamily: '"Bebas Neue", sans-serif' }}
        >
          +{totalBonus}{pendingBonus > 1 ? ` ×${pendingBonus}` : ''} <X size={9} />
        </button>
      )}
    </div>
  );
}

// =================== EDIT ROUND MODAL ===================
function EditRoundModal({ t, state, round, onSave, onDelete, onClose }) {
  const [a, setA] = useState(String(round.a || 0));
  const [b, setB] = useState(String(round.b || 0));
  const [countA, setCountA] = useState(round.bonusCountA || 0);
  const [countB, setCountB] = useState(round.bonusCountB || 0);

  const save = () => {
    const aNum = parseInt(a) || 0;
    const bNum = parseInt(b) || 0;
    onSave({
      a: aNum,
      b: bNum,
      bonusCountA: Math.max(0, countA),
      bonusCountB: Math.max(0, countB),
      bonusA: Math.max(0, countA) * state.pasoValue,
      bonusB: Math.max(0, countB) * state.pasoValue,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-md rounded-xl p-4" style={{ background: 'white' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif', color: C.blue, letterSpacing: '0.08em' }}>
            {t.edit_round}
          </h3>
          <button onClick={onClose} className="p-1"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <EditTeamPanel
            label={state.teamA.name}
            accent={C.red}
            score={a} setScore={setA}
            count={countA} setCount={setCountA}
            pasoValue={state.pasoValue}
            t={t}
          />
          <EditTeamPanel
            label={state.teamB.name}
            accent={C.blue}
            score={b} setScore={setB}
            count={countB} setCount={setCountB}
            pasoValue={state.pasoValue}
            t={t}
          />
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button onClick={save} className="py-2.5 rounded-lg font-bold active:scale-95 transition flex items-center justify-center gap-1" style={{ background: C.blue, color: 'white', fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.08em' }}>
            <Check size={16} /> {t.save}
          </button>
          <button onClick={onDelete} className="px-3 rounded-lg active:scale-95 transition" style={{ background: 'white', color: C.red, border: `2px solid ${C.red}` }}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function EditTeamPanel({ label, accent, score, setScore, count, setCount, pasoValue, t }) {
  return (
    <div className="rounded-lg p-2" style={{ border: `2px solid ${accent}`, background: 'white' }}>
      <div className="text-center text-xs font-bold mb-1" style={{ color: accent, fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div className="text-[9px] mb-1 text-center" style={{ color: C.textLight }}>{t.main_score}</div>
      <input
        type="number" inputMode="numeric"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        className="w-full text-center text-xl font-bold rounded px-2 py-1.5 outline-none mb-2"
        style={{ border: `1px solid ${C.border}`, color: accent, fontFamily: '"Bebas Neue", sans-serif' }}
      />
      <div className="text-[9px] mb-1 text-center" style={{ color: C.textLight }}>{t.pc_count}</div>
      <div className="grid grid-cols-[auto_1fr_auto] gap-1 items-center">
        <button onClick={() => setCount(Math.max(0, count - 1))} className="w-7 h-7 rounded font-bold active:scale-90" style={{ background: C.amberLight, color: C.amber }}>−</button>
        <div className="text-center font-bold" style={{ color: C.amber, fontFamily: '"Bebas Neue", sans-serif', fontSize: '15px' }}>
          {count > 0 ? `+${count * pasoValue} ×${count}` : '—'}
        </div>
        <button onClick={() => setCount(count + 1)} className="w-7 h-7 rounded font-bold active:scale-90" style={{ background: C.amber, color: 'white' }}>+</button>
      </div>
    </div>
  );
}

// =================== SETTINGS ===================
function SettingsView({ t, state, update, onClose }) {
  return (
    <div>
      <button onClick={onClose} className="flex items-center gap-1 mb-3 text-sm font-semibold active:scale-95 transition" style={{ color: C.blue }}>
        <ChevronLeft size={16} /> {t.back}
      </button>
      <h2 className="text-xl mb-3 font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif', color: C.blue, letterSpacing: '0.08em' }}>
        {t.settings}
      </h2>

      <Section title={t.language}>
        <div className="grid grid-cols-2 gap-2">
          <LangBtn active={state.lang === 'es'} onClick={() => update({ lang: 'es' })} label="Español" />
          <LangBtn active={state.lang === 'en'} onClick={() => update({ lang: 'en' })} label="English" />
        </div>
      </Section>

      <Section title={t.win_at}>
        <input
          type="number" inputMode="numeric" value={state.target}
          onChange={(e) => update({ target: parseInt(e.target.value) || 200 })}
          className="w-full text-center text-2xl font-bold rounded-lg px-2 py-2 border-2 outline-none"
          style={{ borderColor: C.blue, color: C.blue, background: 'white', fontFamily: '"Bebas Neue", sans-serif' }}
        />
      </Section>

      <Section title={t.created_by}>
        <input
          type="text" value={state.creator}
          onChange={(e) => update({ creator: e.target.value })}
          className="w-full text-center text-base font-semibold rounded-lg px-2 py-2 border-2 outline-none"
          style={{ borderColor: C.border, color: C.text, background: 'white' }}
          maxLength={40}
        />
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-3 p-3 rounded-lg" style={{ background: 'white', border: `1px solid ${C.border}` }}>
      <div className="text-[10px] tracking-[0.2em] mb-2 font-bold" style={{ color: C.textLight }}>{title.toUpperCase()}</div>
      {children}
    </div>
  );
}

function LangBtn({ active, onClick, label }) {
  return (
    <button onClick={onClick} className="py-2.5 rounded-lg font-bold active:scale-95 transition"
      style={{ background: active ? C.blue : 'white', color: active ? 'white' : C.text, border: `2px solid ${active ? C.blue : C.border}` }}>
      {label}
    </button>
  );
}

// =================== ABOUT ===================
function AboutView({ t, state, onClose }) {
  const sendFeedbackEmail = () => {
    if (!state.feedbackEmail) { alert(t.no_email_set); return; }
    window.location.href = `mailto:${state.feedbackEmail}?subject=${encodeURIComponent(t.feedback_subject)}`;
  };

  return (
    <div>
      <button onClick={onClose} className="flex items-center gap-1 mb-3 text-sm font-semibold active:scale-95 transition" style={{ color: C.blue }}>
        <ChevronLeft size={16} /> {t.back}
      </button>

      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-1 mb-1">
          <h1 className="text-3xl tracking-wide leading-none" style={{ fontFamily: '"Bebas Neue", sans-serif', color: C.blue, letterSpacing: '0.05em' }}>
            DOMINÓ
          </h1>
          <div className="flex gap-0.5 ml-1">
            <div className="w-1 h-1 rounded-full" style={{ background: C.red }} />
            <div className="w-1 h-1 rounded-full border" style={{ background: 'white', borderColor: C.borderDark }} />
            <div className="w-1 h-1 rounded-full" style={{ background: C.red }} />
          </div>
        </div>
        <p className="text-xs" style={{ color: C.textLight, lineHeight: 1.4 }}>{t.about_intro}</p>
      </div>

      <Section title={t.how_scoring}>
        <ul className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4 }}>
          <li>• {t.rule_teams}</li>
          <li>• {t.rule_target}</li>
          <li>• {t.rule_winner}</li>
          <li>• {t.rule_paso}</li>
          <li>• {t.rule_edit}</li>
        </ul>
      </Section>

      <Section title={t.how_to_use}>
        <ul className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4 }}>
          <li>• {t.use_edit}</li>
          <li>• {t.use_score}</li>
          <li>• {t.use_paso}</li>
          <li>• {t.use_share}</li>
          <li>• {t.use_history}</li>
        </ul>
      </Section>

      <Section title={t.feedback}>
        <p className="text-xs mb-2" style={{ color: C.textLight }}>{t.feedback_intro}</p>
        <button onClick={sendFeedbackEmail} className="w-full py-2 px-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-1 active:scale-95 transition" style={{ background: C.blue, color: 'white' }}>
          <Mail size={14} /> {t.send_email}
        </button>
      </Section>

      <Section title={t.privacy}>
        <p className="text-sm" style={{ color: C.text, lineHeight: 1.4 }}>{t.privacy_text}</p>
      </Section>

      <Section title={t.license}>
        <p className="text-sm" style={{ color: C.text, lineHeight: 1.4 }}>{t.license_text}</p>
      </Section>

      <div className="text-center pt-2 pb-4">
        <div className="text-xs mb-1" style={{ color: C.textLight }}>{t.created_by}</div>
        <div className="text-base font-bold" style={{ color: C.blue }}>{state.creator}</div>
        <div className="text-[10px] mt-2 tracking-widest" style={{ color: C.textLight }}>
          {t.version} {APP_VERSION}
        </div>
      </div>
    </div>
  );
}

// =================== HISTORY ===================
function HistoryView({ t, state, history, onDelete, onClose }) {
  const [selected, setSelected] = useState(null);
  if (selected) return <HistoryDetail game={selected} t={t} state={state} onBack={() => setSelected(null)} />;

  return (
    <div>
      <button onClick={onClose} className="flex items-center gap-1 mb-3 text-sm font-semibold active:scale-95 transition" style={{ color: C.blue }}>
        <ChevronLeft size={16} /> {t.back}
      </button>
      <h2 className="text-xl mb-3 font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif', color: C.blue, letterSpacing: '0.08em' }}>
        {t.saved_games}
      </h2>
      {history.length === 0 ? (
        <div className="p-6 text-center italic rounded-lg" style={{ background: 'white', border: `1px solid ${C.border}`, color: C.textLight }}>
          {t.no_saved}
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((g) => (
            <HistoryCard key={g.id} game={g} t={t} onDelete={() => onDelete(g.id)} onOpen={() => setSelected(g)} />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryCard({ game, t, onDelete, onOpen }) {
  const date = new Date(game.date);
  const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const aWon = game.winner === game.teamA.name;
  return (
    <div className="p-3 rounded-lg shadow-sm" style={{ background: 'white', border: `1px solid ${C.border}` }}>
      <div className="flex items-start justify-between mb-2">
        <button onClick={onOpen} className="text-xs tracking-wider font-medium active:opacity-70" style={{ color: C.textLight }}>
          {dateStr}
        </button>
        <button onClick={onDelete} className="opacity-50 active:scale-90 transition" style={{ color: C.red }}>
          <Trash2 size={14} />
        </button>
      </div>
      <button onClick={onOpen} className="w-full grid grid-cols-2 gap-2 active:opacity-80">
        <TeamSummary team={game.teamA} total={game.totalA} accent={C.red} isWinner={aWon} />
        <TeamSummary team={game.teamB} total={game.totalB} accent={C.blue} isWinner={!aWon && game.winner === game.teamB.name} />
      </button>
      <div className="text-[10px] tracking-wider text-center mt-2" style={{ color: C.textLight }}>
        {game.rounds.length} {t.rounds_word}
      </div>
    </div>
  );
}

function TeamSummary({ team, total, accent, isWinner }) {
  const players = [team.p1, team.p2].filter(Boolean).join(' · ');
  return (
    <div className="p-2 rounded-lg text-center" style={{ background: isWinner ? C.gold : 'white', border: `2px solid ${isWinner ? C.blueDark : accent}` }}>
      <div className="font-bold text-xs" style={{ color: accent }}>{team.name}</div>
      {players && <div className="text-[9px] mb-0.5" style={{ color: C.textLight }}>{players}</div>}
      <div className="text-xl font-bold tabular-nums" style={{ color: accent, fontFamily: '"Bebas Neue", sans-serif' }}>{total}</div>
    </div>
  );
}

function HistoryDetail({ game, t, state, onBack }) {
  const aWon = game.winner === game.teamA.name;
  const bWon = game.winner === game.teamB.name;
  const date = new Date(game.date);

  const exportText = async () => {
    const text = formatGameAsText(game, t);
    const filename = `domino-${game.id}.txt`;
    try {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const file = new File([blob], filename, { type: 'text/plain' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: t.game_export_subject,
          text: `${game.teamA.name} ${game.totalA} – ${game.teamB.name} ${game.totalB}`,
        });
      } else {
        // Fallback: mailto with body
        const url = `mailto:?subject=${encodeURIComponent(t.game_export_subject)}&body=${encodeURIComponent(text)}`;
        window.location.href = url;
      }
    } catch (err) {
      if (err.name !== 'AbortError') alert(t.share_failed);
    }
  };

  const shareImage = async () => {
    try {
      const blob = await renderGameToBlob({
        state: { teamA: game.teamA, teamB: game.teamB, target: game.target, pasoValue: game.pasoValue || state.pasoValue, rounds: game.rounds, lang: state.lang },
        totalA: game.totalA, totalB: game.totalB, winner: game.winner, date, t,
      });
      const file = new File([blob], 'domino.jpg', { type: 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Dominó', text: `${game.teamA.name} ${game.totalA} – ${game.teamB.name} ${game.totalB}` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'domino.jpg'; a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if (err.name !== 'AbortError') alert(t.share_failed);
    }
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 mb-3 text-sm font-semibold active:scale-95 transition" style={{ color: C.blue }}>
        <ChevronLeft size={16} /> {t.back}
      </button>
      <div className="text-xs text-center mb-2" style={{ color: C.textLight }}>{date.toLocaleString()}</div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <TeamSummary team={game.teamA} total={game.totalA} accent={C.red} isWinner={aWon} />
        <TeamSummary team={game.teamB} total={game.totalB} accent={C.blue} isWinner={bWon} />
      </div>

      {/* Export buttons */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button onClick={exportText} className="py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-1 active:scale-95 transition" style={{ background: 'white', color: C.blue, border: `2px solid ${C.blue}` }}>
          <FileText size={14} /> {t.export_text}
        </button>
        <button onClick={shareImage} className="py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-1 active:scale-95 transition" style={{ background: C.blue, color: 'white' }}>
          <Share2 size={14} /> {t.share_image}
        </button>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
        <div className="py-1.5 text-center text-xs font-bold"
          style={{ display: 'grid', gridTemplateColumns: GRID_5_HIST, background: C.blueDark, color: 'white', fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.08em' }}>
          <div></div>
          <div className="col-span-2 truncate px-1">{game.teamA.name}</div>
          <div className="col-span-2 truncate px-1">{game.teamB.name}</div>
        </div>
        {game.rounds.map((r, i) => (
          <div key={i} className="items-center py-1.5 text-center"
            style={{ display: 'grid', gridTemplateColumns: GRID_5_HIST, alignItems: 'center', borderBottom: `1px solid ${C.border}`, background: 'white' }}>
            <div className="text-xs" style={{ color: C.textLight }}>P{i + 1}</div>
            <ScoreSlot value={r.a} color={C.red} />
            <BonusSlot value={r.bonusA || 0} count={r.bonusCountA || 0} />
            <ScoreSlot value={r.b} color={C.blue} />
            <BonusSlot value={r.bonusB || 0} count={r.bonusCountB || 0} />
          </div>
        ))}
        <div className="items-center py-2 text-center"
          style={{ display: 'grid', gridTemplateColumns: GRID_5_HIST, alignItems: 'center', background: C.blueDark, color: 'white' }}>
          <div className="text-[10px] font-bold tracking-wider" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{t.total}</div>
          <div className="col-span-2 text-xl font-bold tabular-nums" style={{ fontFamily: '"Bebas Neue", sans-serif', color: aWon ? C.gold : 'white' }}>
            {game.totalA}
          </div>
          <div className="col-span-2 text-xl font-bold tabular-nums" style={{ fontFamily: '"Bebas Neue", sans-serif', color: bWon ? C.gold : 'white' }}>
            {game.totalB}
          </div>
        </div>
      </div>
    </div>
  );
}

// =================== TEXT EXPORT ===================
function formatGameAsText(game, t) {
  const date = new Date(game.date).toLocaleString();
  const lines = [];
  lines.push('================================');
  lines.push('   DOMINÓ - ' + (t.game_export_subject || 'Game'));
  lines.push('================================');
  lines.push(date);
  lines.push('');
  lines.push(game.teamA.name + ': ' + game.totalA);
  if (game.teamA.p1 || game.teamA.p2) {
    lines.push('  ' + [game.teamA.p1, game.teamA.p2].filter(Boolean).join(' · '));
  }
  lines.push('');
  lines.push(game.teamB.name + ': ' + game.totalB);
  if (game.teamB.p1 || game.teamB.p2) {
    lines.push('  ' + [game.teamB.p1, game.teamB.p2].filter(Boolean).join(' · '));
  }
  lines.push('');
  if (game.winner) {
    lines.push(t.winner.toUpperCase() + ': ' + game.winner);
    lines.push('');
  }
  lines.push('--- ' + t.rounds_word.toUpperCase() + ' ---');
  game.rounds.forEach((r, i) => {
    const a = r.a + (r.bonusA ? ` (+${r.bonusA}${(r.bonusCountA || 0) > 1 ? `×${r.bonusCountA}` : ''})` : '');
    const b = r.b + (r.bonusB ? ` (+${r.bonusB}${(r.bonusCountB || 0) > 1 ? `×${r.bonusCountB}` : ''})` : '');
    lines.push(`P${i + 1}:  ${a.padEnd(20)}  ${b}`);
  });
  lines.push('');
  lines.push(t.total + ': ' + game.totalA + ' - ' + game.totalB);
  lines.push('');
  lines.push('--');
  lines.push('Dominó Scorekeeper v' + APP_VERSION);
  return lines.join('\n');
}

// =================== CANVAS RENDER FOR SHARE ===================
function renderGameToBlob({ state, totalA, totalB, winner, date, t }) {
  return new Promise((resolve, reject) => {
    try {
      const W = 720;
      const PAD = 40;
      const headerH = 90;
      const teamH = 110;
      const winnerH = winner ? 60 : 0;
      const rowsHeaderH = 36;
      const rowH = 42;
      const totalH = 70;
      const footerH = 30;
      const H = PAD + headerH + teamH + winnerH + rowsHeaderH + (state.rounds.length * rowH) + totalH + footerH + PAD;

      const canvas = document.createElement('canvas');
      const scale = 2;
      canvas.width = W * scale;
      canvas.height = H * scale;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      let y = PAD;
      ctx.fillStyle = C.blue;
      ctx.fillRect(0, 0, W, PAD + headerH);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 56px "Bebas Neue", sans-serif';
      ctx.fillText('DOMINÓ', W / 2, y + 50);

      const dotY = y + 70, dotSp = 10, dotR = 3;
      [-3, -1, 1, 3].forEach((mult, i) => {
        const colors = [C.red, '#ffffff', '#ffffff', C.red];
        ctx.beginPath();
        ctx.arc(W / 2 + mult * dotSp, dotY, dotR, 0, Math.PI * 2);
        ctx.fillStyle = colors[i];
        ctx.fill();
      });

      ctx.font = '14px Inter, system-ui, sans-serif';
      ctx.fillStyle = C.blueLight;
      ctx.fillText(date.toLocaleString(), W / 2, y + 90);

      y = PAD + headerH + 20;
      const teamW = (W - PAD * 2 - 20) / 2;
      drawTeamBox(ctx, PAD, y, teamW, teamH - 20, state.teamA, C.red, totalA, totalA > totalB);
      drawTeamBox(ctx, PAD + teamW + 20, y, teamW, teamH - 20, state.teamB, C.blue, totalB, totalB > totalA);
      y += teamH;

      if (winner) {
        ctx.fillStyle = C.gold;
        roundRect(ctx, PAD, y, W - PAD * 2, 44, 8);
        ctx.fill();
        ctx.fillStyle = C.blueDark;
        ctx.font = 'bold 22px "Bebas Neue", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${winner.toUpperCase()} ${t.wins}`, W / 2, y + 30);
        y += winnerH;
      }

      ctx.fillStyle = C.blueDark;
      ctx.fillRect(PAD, y, W - PAD * 2, rowsHeaderH);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px "Bebas Neue", sans-serif';
      ctx.textAlign = 'center';

      const numW = 60, bonusW = 70;
      const mainW = (W - PAD * 2 - numW - bonusW * 2) / 2;
      const colXs = {
        num: PAD + numW / 2,
        aMain: PAD + numW + mainW / 2,
        aBonus: PAD + numW + mainW + bonusW / 2,
        bMain: PAD + numW + mainW + bonusW + mainW / 2,
        bBonus: PAD + numW + mainW + bonusW + mainW + bonusW / 2,
      };
      const teamACenterX = PAD + numW + mainW + bonusW / 2;
      const teamBCenterX = PAD + numW + mainW + bonusW + mainW + bonusW / 2;

      ctx.fillText('#', colXs.num, y + 23);
      ctx.fillText(state.teamA.name.toUpperCase(), teamACenterX, y + 23);
      ctx.fillText(state.teamB.name.toUpperCase(), teamBCenterX, y + 23);
      y += rowsHeaderH;

      state.rounds.forEach((r, i) => {
        ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#f8fafc';
        ctx.fillRect(PAD, y, W - PAD * 2, rowH);
        ctx.fillStyle = C.textLight;
        ctx.font = '600 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`P${i + 1}`, colXs.num, y + 27);
        drawScoreSlot(ctx, colXs.aMain, y + 27, r.a, C.red);
        drawBonusSlot(ctx, colXs.aBonus, y + 27, r.bonusA || 0, r.bonusCountA || 0);
        drawScoreSlot(ctx, colXs.bMain, y + 27, r.b, C.blue);
        drawBonusSlot(ctx, colXs.bBonus, y + 27, r.bonusB || 0, r.bonusCountB || 0);
        y += rowH;
      });

      ctx.fillStyle = C.blueDark;
      ctx.fillRect(PAD, y, W - PAD * 2, totalH);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px "Bebas Neue", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t.total, colXs.num, y + totalH / 2 + 5);
      ctx.font = 'bold 38px "Bebas Neue", sans-serif';
      ctx.fillStyle = totalA > totalB ? C.gold : '#ffffff';
      ctx.fillText(String(totalA), teamACenterX, y + totalH / 2 + 14);
      ctx.fillStyle = totalB > totalA ? C.gold : '#ffffff';
      ctx.fillText(String(totalB), teamBCenterX, y + totalH / 2 + 14);
      y += totalH;

      ctx.fillStyle = C.textLight;
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText('Dominó · Scorekeeper', W / 2, y + 20);

      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('toBlob failed')), 'image/jpeg', 0.92);
    } catch (e) { reject(e); }
  });
}

function drawTeamBox(ctx, x, y, w, h, team, accent, total, isLeading) {
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill(); ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = 'bold 22px "Bebas Neue", sans-serif';
  ctx.fillText(team.name.toUpperCase(), x + w / 2, y + 28);
  const players = [team.p1, team.p2].filter(Boolean).join('  ·  ');
  if (players) {
    ctx.fillStyle = C.textLight;
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(players, x + w / 2, y + 50);
  }
  ctx.fillStyle = accent;
  ctx.font = 'bold 36px "Bebas Neue", sans-serif';
  ctx.fillText(String(total), x + w / 2, y + h - 12);
}

function drawScoreSlot(ctx, cx, baseline, value, color) {
  ctx.textAlign = 'center';
  if (value === 0) {
    ctx.fillStyle = C.textLight; ctx.globalAlpha = 0.4;
    ctx.font = 'bold 22px "Bebas Neue", sans-serif';
    ctx.fillText('0', cx, baseline);
    ctx.globalAlpha = 1; return;
  }
  ctx.fillStyle = color;
  ctx.font = 'bold 22px "Bebas Neue", sans-serif';
  ctx.fillText(String(value), cx, baseline);
}

function drawBonusSlot(ctx, cx, baseline, value, count) {
  ctx.textAlign = 'center';
  if (value === 0) {
    ctx.fillStyle = C.textLight; ctx.globalAlpha = 0.3;
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('—', cx, baseline);
    ctx.globalAlpha = 1; return;
  }
  ctx.fillStyle = C.amber;
  ctx.font = 'bold 18px "Bebas Neue", sans-serif';
  ctx.fillText(`+${value}`, cx, baseline - (count > 1 ? 4 : 0));
  if (count > 1) {
    ctx.font = 'bold 10px "Bebas Neue", sans-serif';
    ctx.fillText(`×${count}`, cx, baseline + 9);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
