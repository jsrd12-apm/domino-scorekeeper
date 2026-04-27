import { useState, useEffect, useRef } from 'react';
import { Plus, X, RotateCcw, Settings, Trophy, History, Pencil, Check, ChevronLeft, Trash2, Share2, Info, Mail, Edit3, FileText, Save } from 'lucide-react';
import {
  applyModeChange,
  bonusTotal,
  canAcceptBonus,
  createId,
  ensureTeamId,
  incrementSets,
  isDuplicateSave,
  migrateRound,
  roundTotals,
  saveFingerprint,
  winnerSide,
} from './scoring.js';

// ==== Edit these defaults before deploying ====
const APP_VERSION = '0.0.21';
const BUILD_DATE = (process.env.BUILD_DATE || '');
const BUILT_CACHE_VERSION = (process.env.CACHE_VERSION || '');

const CONTRIBUTORS = [
  { name: 'Daniel Rodríguez', role: 'Idea original' },
  { name: 'Marcos Rodríguez', role: 'Hermano' },
  { name: 'Ramón Rodríguez', role: 'Hermano' },
];
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
    no: 'No',
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
    about_full: 'Esta aplicación fue creada para contribuir y fomentar el juego de dominó de forma simple. No colectamos ninguna información. Los juegos permanecen en tu celular y solo recibe información del internet si el usuario desea actualizar.\n\nCreado por José Rodríguez con contribuciones del visionario Daniel Rodríguez, el arquitecto de la idea original, y mis queridos hermanos Marcos y Ramón.\n\nSugerencias para mejorar son bienvenidas. Añadiré una sección para nombrar los contribuyentes más adelante. ¡Disfruten!',
    how_scoring: 'Cómo funciona el puntaje',
    rule_teams: 'Cada equipo es de 2 jugadores.',
    rule_target: 'Se gana al llegar a la meta (por defecto 200, configurable en Ajustes).',
    rule_winner: 'Solo el equipo ganador de cada jugada anota; el otro recibe 0.',
    rule_paso: 'Bonos: Paso Corrido (CORRIDO) y +10 son extras que sumas a la jugada antes de tocar el botón +. Puedes apilar varios.',
    rule_edit: 'Toca una jugada en la tabla para editar o borrar.',
    how_to_use: 'Cómo usar',
    use_edit: 'Toca cualquier nombre de equipo o jugador para editarlo. Toca el icono de lápiz junto al valor.',
    use_score: 'Ingresa los puntos del equipo ganador en su casilla y toca el botón + (AÑADIR) para registrar la jugada.',
    use_paso: 'Toca CORRIDO y elige el equipo. Cada toque suma un bono que se aplica a la próxima jugada.',
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
    check_updates: 'Buscar actualizaciones',
    checking: 'Buscando...',
    up_to_date: 'Estás al día. No hay actualizaciones nuevas.',
    update_failed: 'No se pudo buscar actualizaciones.',
    share_section: 'Cómo compartir un juego',
    share_step1: 'Toca el icono compartir arriba a la derecha mientras juegas. Genera una imagen JPG instantánea.',
    share_step2: 'La app crea una imagen JPG con todas las jugadas, los totales y el ganador.',
    share_step3: 'Se abre el menú compartir nativo: envía a WhatsApp, Mensajes, Email o guarda en Fotos.',
    history_section: 'Ver juegos anteriores',
    history_step1: 'Al presionar "Nuevo" la app te pregunta: guardar y empezar nuevo, empezar sin guardar, o cancelar. También puedes tocar "Guardar" en cualquier momento.',
    history_step2: 'Toca el botón "Ver Anteriores" debajo del encabezado para abrir los juegos guardados.',
    history_step3: 'Cada tarjeta muestra la fecha, los equipos y el resultado. Toca una para ver el detalle jugada por jugada.',
    history_step4: 'En el detalle puedes exportar como texto para enviar por email o compartir como imagen JPG.',
    bonus_section: 'BONOS: Pase CORRIDO y + pase en salida',
    bonus_step1: 'Toca CORRIDO o +10 durante una jugada en curso.',
    bonus_step2: 'Selecciona el equipo que recibe el bono. Aparece como una jugada pendiente al final de la tabla con "?" en los puntos.',
    bonus_step3: 'Toca el botón del bono otra vez para otro pase corrido.',
    bonus_step4: 'Cuando termine la mano, ingresa los puntos del ganador y toca + para confirmar. El bono se aplica a esa mano.',
    series_section: 'Series (mejor de 3 o 5)',
    series_step1: 'Al tocar "Nuevo" eliges modo: un juego, mejor de 3, o mejor de 5.',
    series_step2: 'El marcador entre los equipos cuenta los sets ganados. Se actualiza automáticamente al guardar un juego.',
    series_step3: 'El equipo que llegue a 2 (de 3) o 3 (de 5) gana la serie.',
    update_section: 'Actualizaciones',
    update_step1: 'Toca "Actualizar" en el pie de página para buscar versión nueva.',
    update_step2: 'Si está al día, verás “Última versión” en verde por unos segundos.',
    update_step3: 'Si hay una nueva versión, la app la descarga y se reinicia automáticamente.',
    export_section: 'Exportar juegos',
    export_info_1: 'Desde "Ver Anteriores" toca "Exportar juegos".',
    export_info_2: 'Marca los juegos individuales con la casilla, o usa los filtros (fechas, equipos) y toca "Seleccionar todos".',
    export_info_3: 'Elige CSV (texto, ideal para hojas de cálculo) o JPG (imágenes individuales).',
    export_info_4: 'Se abre el menú compartir del sistema para enviarlos.',
    save_game: 'Guardar',
    view_previous: 'Ver Anteriores',
    saved_short: 'Guardado',
    no_rounds_save: 'No hay jugadas para guardar.',
    confirm_new_title: '¿Empezar un juego nuevo?',
    confirm_new_in_progress: 'jugadas en curso',
    save_and_new: 'Guardar y empezar nuevo',
    discard_and_new: 'Empezar sin guardar',
    best_of: 'Serie',
    best_of_1: 'Un juego',
    best_of_3: 'Mejor de 3',
    best_of_5: 'Mejor de 5',
    series_won: 'GANARON LA SERIE',
    pc_pending_hint: 'P.C. agregado',
    bonus_10: '+10',
    bonus_pc: 'CORRIDO',
    bonus_values: 'Valores de bonos',
    paso_corrido_value: 'Paso Corrido',
    bonus_10_value: 'Bono +10',
    beta: 'BETA',
    set_score: 'SETS',
    update_btn: 'Actualizar',
    up_to_date_short: 'Última versión',
    suggestions: 'Sugerencias',
    export_games: 'Exportar juegos',
    export_format: '¿Formato?',
    csv_format: 'CSV (texto)',
    jpg_format: 'JPG (imágenes)',
    export_filter: '¿Qué juegos?',
    export_all: 'Todos',
    export_last_7: 'Últimos 7 días',
    export_last_30: 'Últimos 30 días',
    export_by_team: 'Por equipo',
    pick_team: 'Elegir equipo',
    no_games_match: 'No hay juegos que coincidan.',
    export_done: 'Exportado',
    export_intro: 'Filtra los juegos que quieres exportar.',
    export_dates: 'Fechas',
    export_from: 'Desde',
    export_to: 'Hasta',
    export_any_date: 'Cualquier fecha',
    export_team_mode: 'Equipos',
    export_team_any: 'Cualquier equipo',
    export_team_specific: 'Equipos específicos',
    export_select_teams: 'Selecciona uno o más equipos',
    export_match_mode: 'Modo',
    export_match_any: 'Cualquier oponente',
    export_match_only: 'Sólo entre los seleccionados',
    export_summary: 'Resumen',
    export_count: 'juegos coinciden',
    export_continue: 'Continuar',
    export_select_all: 'Seleccionar todos',
    export_clear: 'Quitar selección',
    export_selected_count: 'seleccionados',
    export_filters: 'Filtros',
    export_apply_filter: 'Aplicar filtro',
    new_game_mode: 'Modo de juego',
    new_single: 'Un juego',
    new_best_of_3: 'Mejor de 3',
    new_best_of_5: 'Mejor de 5',
    selected_only: 'Solo seleccionados',
    close: 'Cerrar',
    clear_all_bonus: 'Quitar todos los bonos',
    strict_mode: 'Modo estricto',
    strict_mode_desc: 'Rechazar bonos que pasen la meta',
    no_caben: 'No caben',
    no_caben_hint: 'Cambia "modo estricto" en Ajustes si tu familia permite pasarse de la meta con bonos.',
    contributors: 'Contribuyentes',
    contributors_intro: 'Gracias a las personas que han ayudado a mejorar esta aplicación.',
    csv_date: 'Fecha',
    csv_team_a: 'Equipo A',
    csv_players_a: 'Jugadores A',
    csv_team_b: 'Equipo B',
    csv_players_b: 'Jugadores B',
    csv_total_a: 'Total A',
    csv_total_b: 'Total B',
    csv_winner: 'Ganador',
    csv_rounds: 'Jugadas',
    csv_detail: 'Detalle',
    text_export_title: 'DOMINÓ',
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
    no: 'No',
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
    about_full: 'This app was created to contribute to and encourage the game of dominoes in a simple way. We don\'t collect any information. Games stay on your phone and the app only contacts the internet if you choose to check for updates.\n\nCreated by José Rodríguez with contributions from the visionary Daniel Rodríguez, the architect of the original idea, and my dear brothers Marcos and Ramón.\n\nSuggestions for improvement are welcome. I\'ll add a contributors section later. Enjoy!',
    how_scoring: 'How scoring works',
    rule_teams: 'Each team has 2 players.',
    rule_target: 'First to reach the target wins (default 200, set in Settings).',
    rule_winner: 'Only the round winner scores; the other team gets 0.',
    rule_paso: 'Bonuses: Paso Corrido (CORRIDO) and +10 are extras you stack before hitting + (ADD). Multiple stacks per round are allowed.',
    rule_edit: 'Tap a round in the table to edit or delete.',
    how_to_use: 'How to use',
    use_edit: 'Tap any team or player name to edit it. Tap the pencil icon next to a value.',
    use_score: 'Enter the winning team\'s points and tap + (ADD) to record the round.',
    use_paso: 'Tap CORRIDO and pick a team. Each tap stacks one bonus, applied to the next round.',
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
    check_updates: 'Check for updates',
    checking: 'Checking...',
    up_to_date: "You're up to date. No new updates available.",
    update_failed: 'Update check failed.',
    share_section: 'How to share a game',
    share_step1: 'Tap the share icon at the top right while you play. Generates a JPG image of the current scoreboard.',
    share_step2: 'The app generates a JPG image with all rounds, totals, and the winner.',
    share_step3: 'The native share menu opens: send via WhatsApp, Messages, Email, or save to Photos.',
    history_section: 'View previous games',
    history_step1: 'When you tap "New" the app asks: save and start new, start without saving, or cancel. You can also tap "Save" anytime.',
    history_step2: 'Tap the "View Previous" button below the header to open saved games.',
    history_step3: 'Each card shows date, teams, and result. Tap one to see round-by-round detail.',
    history_step4: 'In the detail view you can export as text for email or share as a JPG image.',
    bonus_section: 'BONUSES: Pase CORRIDO and + pase en salida',
    bonus_step1: 'Tap CORRIDO or +10 during a hand in progress.',
    bonus_step2: 'Pick the team receiving the bonus. It appears as a pending round at the bottom of the table with "?" placeholders.',
    bonus_step3: 'Tap the bonus button again for another pase corrido.',
    bonus_step4: 'When the hand ends, enter the winner\'s points and tap + to commit. The bonus applies to that hand.',
    series_section: 'Series (best of 3 or 5)',
    series_step1: 'Tapping "New" lets you pick a mode: single game, best of 3, or best of 5.',
    series_step2: 'The middle scoreboard counts sets won. Auto-updates when a game is saved.',
    series_step3: 'First team to 2 (of 3) or 3 (of 5) wins the series.',
    update_section: 'Updates',
    update_step1: 'Tap "Update" in the footer to check for a new version.',
    update_step2: 'If up to date, you\'ll see “Up to date” in green briefly.',
    update_step3: 'If a new version exists, the app downloads and reloads automatically.',
    export_section: 'Exporting games',
    export_info_1: 'From "View Previous" tap "Export games".',
    export_info_2: 'Check individual games, or use filters (dates, teams) and tap "Select all".',
    export_info_3: 'Pick CSV (text, ideal for spreadsheets) or JPG (individual images).',
    export_info_4: 'The system share menu opens to send them.',
    save_game: 'Save',
    view_previous: 'View Previous',
    saved_short: 'Saved',
    no_rounds_save: 'No rounds to save.',
    confirm_new_title: 'Start a new game?',
    confirm_new_in_progress: 'rounds in progress',
    save_and_new: 'Save and start new',
    discard_and_new: 'Start without saving',
    best_of: 'Series',
    best_of_1: 'Single game',
    best_of_3: 'Best of 3',
    best_of_5: 'Best of 5',
    series_won: 'WON THE SERIES',
    pc_pending_hint: 'P.C. added',
    bonus_10: '+10',
    bonus_pc: 'CORRIDO',
    bonus_values: 'Bonus values',
    paso_corrido_value: 'Paso Corrido',
    bonus_10_value: 'Bonus +10',
    beta: 'BETA',
    set_score: 'SETS',
    update_btn: 'Update',
    up_to_date_short: 'Up to date',
    suggestions: 'Feedback',
    export_games: 'Export games',
    export_format: 'Format?',
    csv_format: 'CSV (text)',
    jpg_format: 'JPG (images)',
    export_filter: 'Which games?',
    export_all: 'All',
    export_last_7: 'Last 7 days',
    export_last_30: 'Last 30 days',
    export_by_team: 'By team',
    pick_team: 'Pick a team',
    no_games_match: 'No games match.',
    export_done: 'Exported',
    export_intro: 'Filter the games you want to export.',
    export_dates: 'Dates',
    export_from: 'From',
    export_to: 'To',
    export_any_date: 'Any date',
    export_team_mode: 'Teams',
    export_team_any: 'Any team',
    export_team_specific: 'Specific teams',
    export_select_teams: 'Select one or more teams',
    export_match_mode: 'Mode',
    export_match_any: 'vs any opponent',
    export_match_only: 'Only between selected',
    export_summary: 'Summary',
    export_count: 'games match',
    export_continue: 'Continue',
    export_select_all: 'Select all',
    export_clear: 'Clear',
    export_selected_count: 'selected',
    export_filters: 'Filters',
    export_apply_filter: 'Apply filter',
    new_game_mode: 'Game mode',
    new_single: 'Single game',
    new_best_of_3: 'Best of 3',
    new_best_of_5: 'Best of 5',
    selected_only: 'Selected only',
    close: 'Close',
    clear_all_bonus: 'Clear all bonuses',
    strict_mode: 'Strict mode',
    strict_mode_desc: 'Reject bonuses that overshoot the target',
    no_caben: "Won't fit",
    no_caben_hint: 'Toggle "strict mode" in Settings if your family allows bonuses to overshoot the target.',
    contributors: 'Contributors',
    contributors_intro: 'Thanks to the people who have helped make this app better.',
    csv_date: 'Date',
    csv_team_a: 'Team A',
    csv_players_a: 'Players A',
    csv_team_b: 'Team B',
    csv_players_b: 'Players B',
    csv_total_a: 'Total A',
    csv_total_b: 'Total B',
    csv_winner: 'Winner',
    csv_rounds: 'Rounds',
    csv_detail: 'Detail',
    text_export_title: 'DOMINÓ',
  },
};

const DEFAULT_STATE = {
  lang: 'es',
  target: 200,
  bestOf: 1,
  setsA: 0,
  setsB: 0,
  lastSavedFingerprint: null,
  teamA: { id: createId(), name: 'Nosotros', p1: 'Jugador Uno', p2: 'Jugador Dos' },
  teamB: { id: createId(), name: 'Ellos', p1: 'Jugador Tres', p2: 'Jugador Cuatro' },
  pasoValue: 25,
  bonus10Value: 10,
  strictBonus: true,
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

export default function DominoScorekeeper() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [history, setHistory] = useState([]);
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');
  const [pendingPasoA, setPendingPasoA] = useState(0);
  const [pendingPasoB, setPendingPasoB] = useState(0);
  const [pendingTenA, setPendingTenA] = useState(0);
  const [pendingTenB, setPendingTenB] = useState(0);
  const [pickingBonusType, setPickingBonusType] = useState(null); // 'paso' | 'ten' | null
  const [editingField, setEditingField] = useState(null);
  const [editingRound, setEditingRound] = useState(null); // index of round
  const [view, setView] = useState('game');
  const [shareStatus, setShareStatus] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [upToDateFlash, setUpToDateFlash] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [confirmingNew, setConfirmingNew] = useState(false);
  const [noCabenToast, setNoCabenToast] = useState(null);
  const [showContributors, setShowContributors] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const t = STRINGS[state.lang];
  const roundsScrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const v = localStorage.getItem('domino-state');
        if (v) {
          const parsed = JSON.parse(v);
          delete parsed.setHandledForRounds;
          parsed.rounds = (parsed.rounds || []).map(migrateRound);
          setState({
            ...DEFAULT_STATE,
            ...parsed,
            teamA: ensureTeamId({ ...DEFAULT_STATE.teamA, ...(parsed.teamA || {}) }),
            teamB: ensureTeamId({ ...DEFAULT_STATE.teamB, ...(parsed.teamB || {}) }),
            setsA: Number(parsed.setsA || 0),
            setsB: Number(parsed.setsB || 0),
          });
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

  useEffect(() => {
    if (!noCabenToast) return undefined;
    const timer = window.setTimeout(() => setNoCabenToast(false), 3500);
    return () => window.clearTimeout(timer);
  }, [noCabenToast]);

  const { totalA, totalB } = roundTotals(state.rounds);
  const currentWinnerSide = winnerSide({ totalA, totalB, target: state.target });
  const winner =
    currentWinnerSide === 'a' ? state.teamA.name :
    currentWinnerSide === 'b' ? state.teamB.name : null;

  const update = (patch) => setState((s) => ({ ...s, ...patch }));
  const updateTeam = (team, patch) => setState((s) => ({ ...s, [team]: { ...s[team], ...patch } }));

  const addRound = () => {
    const a = parseInt(scoreA) || 0;
    const b = parseInt(scoreB) || 0;
    const totalPending = pendingPasoA + pendingPasoB + pendingTenA + pendingTenB;
    if (a === 0 && b === 0 && totalPending === 0) return;

    const winnerA = a >= b;
    const bonusA = pendingPasoA * state.pasoValue + pendingTenA * state.bonus10Value;
    const bonusB = pendingPasoB * state.pasoValue + pendingTenB * state.bonus10Value;
    const round = {
      a: winnerA ? a : 0,
      b: winnerA ? 0 : b,
      bonusA,
      bonusB,
      bonusCountA: pendingPasoA,
      bonusCountB: pendingPasoB,
      tenCountA: pendingTenA,
      tenCountB: pendingTenB,
    };
    setState((s) => ({ ...s, rounds: [...s.rounds, round] }));
    setScoreA('');
    setScoreB('');
    setPendingPasoA(0);
    setPendingPasoB(0);
    setPendingTenA(0);
    setPendingTenB(0);
    setNoCabenToast(false);
  };

  // Bonus button always opens the team picker
  const handleBonusTap = (type) => setPickingBonusType(type);

  // Picking a team always stages the bonus on the NEXT round being assembled.
  // It folds into a real round when AÑADIR fires; never modifies past rounds.
  const pickBonusTeam = (team) => {
    const type = pickingBonusType;
    setPickingBonusType(null);
    if (!type) return;

    const isTeamA = team === 'a';
    const teamCurrentTotal = isTeamA ? totalA : totalB;
    const teamPendingValue = bonusTotal({
      pasoCount: isTeamA ? pendingPasoA : pendingPasoB,
      tenCount: isTeamA ? pendingTenA : pendingTenB,
      pasoValue: state.pasoValue,
      bonus10Value: state.bonus10Value,
    });
    const additionalBonusValue = type === 'paso' ? state.pasoValue : state.bonus10Value;

    if (!canAcceptBonus({
      currentTotal: teamCurrentTotal,
      pendingBonusValue: teamPendingValue,
      additionalBonusValue,
      target: state.target,
      strictMode: state.strictBonus,
    })) {
      setNoCabenToast((toastKey) => (Number(toastKey) || 0) + 1);
      return;
    }

    if (type === 'paso') {
      if (team === 'a') setPendingPasoA((c) => c + 1);
      else setPendingPasoB((c) => c + 1);
    } else {
      if (team === 'a') setPendingTenA((c) => c + 1);
      else setPendingTenB((c) => c + 1);
    }
  };

  const clearPendingBonusForTeam = (team) => {
    if (team === 'a') {
      setPendingPasoA(0);
      setPendingTenA(0);
    } else {
      setPendingPasoB(0);
      setPendingTenB(0);
    }
    setNoCabenToast(false);
  };

  const clearAllPending = () => {
    setPendingPasoA(0);
    setPendingPasoB(0);
    setPendingTenA(0);
    setPendingTenB(0);
    setNoCabenToast(false);
  };

  const deleteRound = (i) => setState((s) => ({ ...s, rounds: s.rounds.filter((_, idx) => idx !== i) }));

  const updateRound = (i, patch) => {
    setState((s) => ({
      ...s,
      rounds: s.rounds.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    }));
  };

  const resetGame = (nextBestOf = state.bestOf) => {
    setState((s) => ({ ...applyModeChange(s, nextBestOf), rounds: [], lastSavedFingerprint: null }));
    setScoreA('');
    setScoreB('');
    clearAllPending();
  };

  const newGame = () => {
    setConfirmingNew(true);
  };

  const buildHistoryEntry = (gameState, entryBestOf, totals, winnerName, fingerprint, setsAfter) => ({
    id: Date.now(),
    date: new Date().toISOString(),
    teamA: { ...gameState.teamA },
    teamB: { ...gameState.teamB },
    target: gameState.target,
    pasoValue: gameState.pasoValue,
    bonus10Value: gameState.bonus10Value,
    bestOf: entryBestOf,
    rounds: [...gameState.rounds],
    totalA: totals.totalA,
    totalB: totals.totalB,
    winner: winnerName,
    setsAAfterGame: setsAfter.setsA,
    setsBAfterGame: setsAfter.setsB,
    fingerprint,
  });

  const handleSaveAndNew = (nextBestOf = state.bestOf) => {
    const entryBestOf = Number(nextBestOf) || 1;
    const modeChanged = state.bestOf !== entryBestOf;
    const totals = roundTotals(state.rounds);
    const winningSide = winnerSide({ totalA: totals.totalA, totalB: totals.totalB, target: state.target });
    const winnerName = winningSide === 'a' ? state.teamA.name : winningSide === 'b' ? state.teamB.name : null;
    const fingerprint = saveFingerprint({ rounds: state.rounds, totalA: totals.totalA, totalB: totals.totalB });
    const duplicate = isDuplicateSave(history, fingerprint) && state.lastSavedFingerprint === fingerprint;
    const shouldSave = state.rounds.length > 0 && !duplicate;
    const setsAfter = (!modeChanged && shouldSave)
      ? incrementSets({ bestOf: entryBestOf, setsA: state.setsA, setsB: state.setsB, winner: winningSide })
      : { setsA: state.setsA, setsB: state.setsB };

    if (shouldSave) {
      setHistory((h) => [
        buildHistoryEntry(state, entryBestOf, totals, winnerName, fingerprint, setsAfter),
        ...h,
      ]);
    }

    setState((s) => {
      const next = applyModeChange(s, entryBestOf);
      return {
        ...next,
        rounds: [],
        lastSavedFingerprint: null,
        setsA: modeChanged || entryBestOf === 1 ? 0 : setsAfter.setsA,
        setsB: modeChanged || entryBestOf === 1 ? 0 : setsAfter.setsB,
      };
    });
    setScoreA('');
    setScoreB('');
    clearAllPending();
    setConfirmingNew(false);
  };

  const handleDiscardAndNew = (nextBestOf = state.bestOf) => {
    resetGame(nextBestOf);
    setConfirmingNew(false);
  };

  const saveCurrentToHistory = () => {
    if (state.rounds.length === 0) return false;
    const totals = roundTotals(state.rounds);
    const winningSide = winnerSide({ totalA: totals.totalA, totalB: totals.totalB, target: state.target });
    const winnerName = winningSide === 'a' ? state.teamA.name : winningSide === 'b' ? state.teamB.name : null;
    const fingerprint = saveFingerprint({ rounds: state.rounds, totalA: totals.totalA, totalB: totals.totalB });
    if (isDuplicateSave(history, fingerprint) && state.lastSavedFingerprint === fingerprint) return false;

    const setsAfter = incrementSets({
      bestOf: state.bestOf,
      setsA: state.setsA,
      setsB: state.setsB,
      winner: winningSide,
    });
    setHistory((h) => [
      buildHistoryEntry(state, state.bestOf, totals, winnerName, fingerprint, setsAfter),
      ...h,
    ]);
    if (setsAfter.setsA !== state.setsA || setsAfter.setsB !== state.setsB) {
      setState((s) => ({ ...s, ...setsAfter, lastSavedFingerprint: fingerprint }));
    } else {
      setState((s) => ({ ...s, lastSavedFingerprint: fingerprint }));
    }
    return true;
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

  const saveCurrentGame = () => {
    if (state.rounds.length === 0) {
      alert(t.no_rounds_save);
      return;
    }
    saveCurrentToHistory();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const checkForUpdates = async () => {
    if (updating) return;
    setUpdating(true);
    let isNewer = false;
    try {
      // Fetch the live service-worker.js (cache-busted) and parse its CACHE_VERSION.
      // Compare to the version baked into this bundle at build time.
      const swUrl = new URL('service-worker.js', window.location.href);
      swUrl.searchParams.set('_t', Date.now().toString(36));
      const res = await fetch(swUrl.toString(), { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        const m = text.match(/CACHE_VERSION\s*=\s*['"]([^'"]+)['"]/);
        const liveVersion = m ? m[1] : '';
        if (liveVersion && BUILT_CACHE_VERSION && liveVersion !== BUILT_CACHE_VERSION) {
          isNewer = true;
        }
      }
    } catch (e) {}

    if (isNewer) {
      // Tell the SW to fetch fresh and reload
      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg) {
            await reg.update();
            await new Promise((r) => setTimeout(r, 800));
            if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      } catch (e) {}
      const url = new URL(window.location.href);
      url.searchParams.set('_v', Date.now().toString(36));
      window.location.replace(url.toString());
    } else {
      setUpToDateFlash(true);
      setTimeout(() => setUpToDateFlash(false), 2500);
      setUpdating(false);
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
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl tracking-wide leading-none" style={{ fontFamily: '"Bebas Neue", sans-serif', color: 'white', letterSpacing: '0.05em' }}>
                DOMINÓ
              </h1>
              <span style={{ background: C.red, color: 'white', fontSize: '9px', fontWeight: 700, padding: '2px 5px', borderRadius: '4px', letterSpacing: '0.1em', fontFamily: '"Bebas Neue", sans-serif' }}>
                {t.beta}
              </span>
              <div className="w-1 h-1 rounded-full" style={{ background: C.red }} />
              <div className="w-1 h-1 rounded-full" style={{ background: 'white' }} />
              <div className="w-1 h-1 rounded-full" style={{ background: C.red }} />
            </div>
            <div className="text-[10px] mt-0.5 tracking-wider" style={{ color: C.blueLight, fontWeight: 600, letterSpacing: '0.08em' }}>
              v{APP_VERSION}{BUILD_DATE ? ` · ${BUILD_DATE}` : ''}
            </div>
          </div>
          <div className="flex gap-1.5">
            <IconBtn onClick={shareGame} disabled={state.rounds.length === 0}>
              <Share2 size={22} />
            </IconBtn>
            <IconBtn onClick={() => setView(view === 'about' ? 'game' : 'about')}>
              <Info size={22} />
            </IconBtn>
            <IconBtn onClick={() => setView(view === 'settings' ? 'game' : 'settings')}>
              <Settings size={22} />
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

      {view === 'game' && (
        <div className="max-w-md mx-auto px-3 pt-3 mt-1">
          <TeamRow
            t={t}
            state={state}
            setsA={state.setsA}
            setsB={state.setsB}
            editingField={editingField}
            setEditingField={setEditingField}
            updateTeam={updateTeam}
          />
        </div>
      )}

      {view === 'game' && (
        <div className="max-w-md mx-auto px-3 pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={saveCurrentGame}
            className="flex items-center justify-center gap-2 py-3 rounded-lg font-bold active:scale-95 transition"
            style={{
              background: justSaved ? C.green : 'white',
              color: justSaved ? 'white' : C.blue,
              border: `2px solid ${justSaved ? C.green : C.blue}`,
              fontFamily: '"Bebas Neue", sans-serif',
              letterSpacing: '0.05em',
              fontSize: '15px',
            }}
          >
            {justSaved ? <Check size={28} /> : <Save size={28} />}
            <span>{justSaved ? t.saved_short : t.save_game}</span>
          </button>
          <button
            onClick={() => setView('history')}
            className="flex items-center justify-center gap-2 py-3 rounded-lg font-bold active:scale-95 transition"
            style={{
              background: 'white',
              color: C.blue,
              border: `2px solid ${C.blue}`,
              fontFamily: '"Bebas Neue", sans-serif',
              letterSpacing: '0.05em',
              fontSize: '15px',
            }}
          >
            <History size={28} />
            <span>{t.view_previous}</span>
          </button>
        </div>
      )}

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
            pendingPasoA={pendingPasoA} pendingPasoB={pendingPasoB}
            pendingTenA={pendingTenA} pendingTenB={pendingTenB}
            pickingBonusType={pickingBonusType} setPickingBonusType={setPickingBonusType}
            handleBonusTap={handleBonusTap}
            pickBonusTeam={pickBonusTeam}
            clearPendingBonusForTeam={clearPendingBonusForTeam}
            clearAllPending={clearAllPending}
            noCabenToast={noCabenToast}
            setNoCabenToast={setNoCabenToast}
            editingField={editingField} setEditingField={setEditingField}
            updateTeam={updateTeam}
            addRound={addRound}
            setEditingRound={setEditingRound}
            roundsScrollRef={roundsScrollRef}
            checkForUpdates={checkForUpdates}
            updating={updating}
            upToDateFlash={upToDateFlash}
            update={update}
            onShowContributors={() => setShowContributors(true)}
          />
        )}

        {view === 'settings' && <SettingsView t={t} state={state} update={update} onClose={() => setView('game')} />}
        {view === 'about' && <AboutView t={t} state={state} onClose={() => setView('game')} />}
        {view === 'history' && (
          <HistoryView t={t} state={state} history={history} onDelete={deleteHistoryGame} onClose={() => setView('game')} />
        )}
      </div>

      {showContributors && (
        <ContributorsModal
          t={t}
          onClose={() => setShowContributors(false)}
        />
      )}

      {confirmingNew && (
        <NewGameModal
          t={t}
          state={state}
          roundCount={state.rounds.length}
          onSaveAndNew={handleSaveAndNew}
          onDiscardAndNew={handleDiscardAndNew}
          onCancel={() => setConfirmingNew(false)}
        />
      )}

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
      className="p-2 rounded-md active:scale-95 transition disabled:opacity-40"
      style={{ background: C.blueDark, color: 'white' }}
    >
      {children}
    </button>
  );
}

// =================== GAME VIEW ===================
function GameView(p) {
  const { t, state, totalA, totalB, winner, scoreA, setScoreA, scoreB, setScoreB,
    pendingPasoA, pendingPasoB, pendingTenA, pendingTenB,
    pickingBonusType, setPickingBonusType,
    handleBonusTap, pickBonusTeam,
    clearPendingBonusForTeam, clearAllPending,
    noCabenToast, setNoCabenToast,
    editingField, setEditingField, updateTeam, addRound, setEditingRound, roundsScrollRef,
    checkForUpdates, updating, upToDateFlash, update, onShowContributors } = p;

  // (totalPendingBonus computed inline where needed)

  return (
    <>
      {(() => {
        const setsToWin = Math.ceil(state.bestOf / 2);
        const seriesWinnerName = state.setsA >= setsToWin ? state.teamA.name
                               : state.setsB >= setsToWin ? state.teamB.name : null;
        if (state.bestOf > 1 && seriesWinnerName) {
          return (
            <div className="mb-2 py-2 px-2 rounded-lg text-center flex items-center justify-center gap-1" style={{ background: C.gold, color: C.blueDark, border: `2px solid ${C.blueDark}` }}>
              <Trophy size={16} />
              <span className="text-base font-bold tracking-wide" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                {seriesWinnerName.toUpperCase()} {t.series_won}
              </span>
            </div>
          );
        }
        if (winner) {
          return (
            <div className="mb-2 py-1.5 px-2 rounded-lg text-center flex items-center justify-center gap-1" style={{ background: C.gold, color: C.blueDark }}>
              <Trophy size={14} />
              <span className="text-sm font-bold tracking-wide" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                {winner.toUpperCase()} {t.wins}
              </span>
            </div>
          );
        }
        return null;
      })()}



      <div className="grid grid-cols-2 gap-2 mb-2">
        <ScoreBox value={scoreA} onChange={setScoreA} onEnter={addRound} accent={C.red} />
        <ScoreBox value={scoreB} onChange={setScoreB} onEnter={addRound} accent={C.blue} />
      </div>

      {noCabenToast && (
        <div
          className="mb-2 px-3 py-2 rounded-lg"
          style={{ background: C.amberLight, border: `1px dashed ${C.amber}` }}
        >
          <div className="flex items-center justify-between gap-2 font-bold text-sm" style={{ color: C.text }}>
            <span>{t.no_caben}</span>
            <button
              onClick={() => setNoCabenToast(false)}
              className="p-0.5 rounded active:scale-90 transition"
              style={{ color: C.amber }}
              aria-label={t.close}
            >
              <X size={14} />
            </button>
          </div>
          <div className="text-xs mt-0.5" style={{ color: C.textLight, lineHeight: 1.35 }}>
            {t.no_caben_hint}
          </div>
        </div>
      )}

      <div className="gap-1.5 mb-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
        <button
          onClick={() => handleBonusTap('paso')}
          className="font-bold rounded-lg active:scale-95 transition flex flex-col items-center justify-center"
          style={{
            background: 'white',
            color: C.amber,
            border: `2px solid ${C.amber}`,
            fontFamily: '"Bebas Neue", sans-serif',
            letterSpacing: '0.03em',
            minHeight: '64px',
            padding: '6px',
          }}
        >
          <span style={{ fontSize: '14px', lineHeight: 1 }}>{t.bonus_pc}</span>
          <span style={{ fontSize: '11px', lineHeight: 1, marginTop: '3px', opacity: 0.85 }}>+{state.pasoValue}</span>
        </button>
        <button
          onClick={() => handleBonusTap('ten')}
          className="font-bold rounded-lg active:scale-95 transition flex items-center justify-center"
          style={{
            background: 'white',
            color: C.green,
            border: `2px solid ${C.green}`,
            fontFamily: '"Bebas Neue", sans-serif',
            letterSpacing: '0.03em',
            minHeight: '64px',
            padding: '6px',
            fontSize: '20px',
          }}
        >
          +{state.bonus10Value}
        </button>
        <button
          onClick={addRound}
          disabled={!scoreA && !scoreB && (pendingPasoA + pendingPasoB + pendingTenA + pendingTenB) === 0}
          className="font-bold rounded-lg flex items-center justify-center active:scale-95 transition disabled:opacity-40"
          style={{
            background: C.blue,
            color: 'white',
            fontFamily: '"Bebas Neue", sans-serif',
            letterSpacing: '0.05em',
            minHeight: '64px',
            padding: '6px',
          }}
        >
          <Plus size={36} strokeWidth={3} />
        </button>
      </div>

      {/* Bonus team picker — same UX whether 1st or Nth bonus tap */}
      {pickingBonusType && (
        <div className="mb-2 p-2 rounded-lg" style={{ background: pickingBonusType === 'paso' ? C.amberLight : '#dcfce7', border: `1px solid ${pickingBonusType === 'paso' ? C.amber : C.green}` }}>
          <div className="text-center mb-1.5 text-xs font-bold" style={{ color: C.text }}>
            {pickingBonusType === 'paso' ? `${t.paso_corrido} +${state.pasoValue}` : `+${state.bonus10Value}`} — {t.for_whom}
          </div>
          <div className="grid grid-cols-2 gap-1.5 mb-1.5">
            <button onClick={() => pickBonusTeam('a')} className="py-2 rounded font-bold text-sm active:scale-95 transition" style={{ background: C.red, color: 'white' }}>
              {state.teamA.name}
            </button>
            <button onClick={() => pickBonusTeam('b')} className="py-2 rounded font-bold text-sm active:scale-95 transition" style={{ background: C.blue, color: 'white' }}>
              {state.teamB.name}
            </button>
          </div>
          <button onClick={() => setPickingBonusType(null)} className="w-full py-1 rounded text-xs active:scale-95 transition" style={{ background: 'white', color: C.text, border: `1px solid ${C.border}` }}>
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
          {state.rounds.length === 0 && !(pendingPasoA + pendingPasoB + pendingTenA + pendingTenB) ? (
            <div className="text-center py-6 italic text-sm" style={{ color: C.textLight }}>{t.no_rounds}</div>
          ) : (
            <>
              {state.rounds.map((r, i) => (
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
              ))}
              {(pendingPasoA + pendingPasoB + pendingTenA + pendingTenB) > 0 && (
                <div
                  className="w-full items-center py-1.5 text-center"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: GRID_5,
                    alignItems: 'center',
                    borderTop: `2px dashed ${C.amber}`,
                    background: '#fffbeb',
                  }}
                >
                  <div className="text-xs font-semibold" style={{ color: C.amber }}>
                    P{state.rounds.length + 1}
                  </div>
                  <div className="text-lg font-bold" style={{ color: C.textLight, fontFamily: '"Bebas Neue", sans-serif' }}>?</div>
                  <BonusSlot
                    value={pendingPasoA * state.pasoValue + pendingTenA * state.bonus10Value}
                    count={pendingPasoA}
                  />
                  <div className="text-lg font-bold" style={{ color: C.textLight, fontFamily: '"Bebas Neue", sans-serif' }}>?</div>
                  <BonusSlot
                    value={pendingPasoB * state.pasoValue + pendingTenB * state.bonus10Value}
                    count={pendingPasoB}
                  />
                  <button
                    onClick={clearAllPending}
                    className="active:scale-90"
                    style={{ color: C.amber, margin: '0 auto' }}
                    aria-label={t.clear_all_bonus}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div
          className="items-center py-2 text-center"
          style={{ display: 'grid', gridTemplateColumns: GRID_5, alignItems: 'center', background: '#e2e8f0', color: C.text, borderTop: `2px solid ${C.blueDark}` }}
        >
          <div className="text-[10px] font-bold tracking-wider" style={{ fontFamily: '"Bebas Neue", sans-serif', color: C.blueDark }}>{t.total}</div>
          <div className="col-span-2 text-2xl font-bold tabular-nums flex items-center justify-center gap-1" style={{ fontFamily: '"Bebas Neue", sans-serif', color: totalA > 0 ? (totalA > totalB ? C.gold : C.red) : C.textLight }}>
            {totalA === 0 && totalB > 0 ? <span style={{ fontSize: '22px', lineHeight: 1 }}>👞</span> : totalA}
          </div>
          <div className="col-span-2 text-2xl font-bold tabular-nums flex items-center justify-center gap-1" style={{ fontFamily: '"Bebas Neue", sans-serif', color: totalB > 0 ? (totalB > totalA ? C.gold : C.blue) : C.textLight }}>
            {totalB === 0 && totalA > 0 ? <span style={{ fontSize: '22px', lineHeight: 1 }}>👞</span> : totalB}
          </div>
          <div></div>
        </div>
      </div>

      {/* Action footer — Actualizar, Sugerencias, Contribuyentes */}
      <div className="flex items-center justify-center flex-wrap gap-2 mt-4 mb-2">
        <button
          onClick={checkForUpdates}
          disabled={updating}
          className="px-3 py-1.5 rounded-lg active:scale-95 transition disabled:opacity-60 flex items-center gap-1"
          style={{
            background: upToDateFlash ? C.green : C.blue,
            color: 'white',
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '0.05em',
          }}
        >
          {updating ? t.checking : upToDateFlash ? `✓ ${t.up_to_date_short}` : t.update_btn}
        </button>
        <button
          onClick={() => {
            const subject = encodeURIComponent(t.feedback_subject || 'Sugerencia');
            window.location.href = `mailto:jsrd12@gmail.com?subject=${subject}`;
          }}
          className="px-3 py-1.5 rounded-lg active:scale-95 transition flex items-center gap-1"
          style={{
            background: 'white',
            color: C.blue,
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '0.05em',
            border: `1.5px solid ${C.blue}`,
          }}
          aria-label={t.suggestions}
        >
          <Mail size={13} />
          {t.suggestions}
        </button>
        <button
          onClick={onShowContributors}
          className="px-3 py-1.5 rounded-lg active:scale-95 transition flex items-center gap-1"
          style={{
            background: 'white',
            color: C.blue,
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '0.05em',
            border: `1.5px solid ${C.blue}`,
          }}
          aria-label={t.contributors}
        >
          {t.contributors}
        </button>
      </div>
    </>
  );
}

function ContributorsModal({ t, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{
        background: 'rgba(0,0,0,0.5)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div
        className="w-full max-w-sm rounded-t-xl sm:rounded-xl flex flex-col"
        style={{ background: 'white', maxHeight: '80vh' }}
      >
        <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: C.border }}>
          <h3 className="text-lg font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif', color: C.blue, letterSpacing: '0.05em' }}>
            {t.contributors}
          </h3>
          <button
            onClick={onClose}
            className="p-2 -m-1 rounded-full active:scale-90"
            style={{ background: '#f1f5f9' }}
            aria-label={t.close}
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-4 pt-3 pb-2 text-xs" style={{ color: C.textLight, lineHeight: 1.4 }}>
          {t.contributors_intro}
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {CONTRIBUTORS.map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
              style={{ borderBottom: i < CONTRIBUTORS.length - 1 ? `1px solid ${C.border}` : 'none' }}
            >
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{
                  width: '36px',
                  height: '36px',
                  background: C.blue,
                  color: 'white',
                  fontFamily: '"Bebas Neue", sans-serif',
                  fontSize: '16px',
                  letterSpacing: '0.05em',
                }}
              >
                {c.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold" style={{ color: C.text }}>{c.name}</div>
                {c.role && (
                  <div className="text-[11px]" style={{ color: C.textLight }}>{c.role}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
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

function TeamRow({ t, state, setsA, setsB, editingField, setEditingField, updateTeam }) {
  const setsToWin = Math.ceil(state.bestOf / 2);
  const showSetsToWin = state.bestOf > 1;
  return (
    <div className="grid items-center gap-2" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
      <CompactTeamCard
        team={state.teamA}
        teamKey="teamA"
        accent={C.red}
        editingField={editingField}
        setEditingField={setEditingField}
        updateTeam={updateTeam}
        align="right"
      />
      <div className="flex flex-col items-center" style={{ minWidth: '64px' }}>
        <span style={{ fontSize: '9px', color: C.textLight, fontWeight: 700, letterSpacing: '0.15em' }}>
          {t.set_score}
        </span>
        <div className="flex items-baseline gap-1" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
          <span style={{ fontSize: '22px', color: C.red, fontWeight: 700 }}>{setsA}</span>
          <span style={{ fontSize: '16px', color: C.textLight }}>-</span>
          <span style={{ fontSize: '22px', color: C.blue, fontWeight: 700 }}>{setsB}</span>
        </div>
        {showSetsToWin && (
          <span style={{ fontSize: '9px', color: C.textLight, marginTop: '-2px' }}>
            a {setsToWin}
          </span>
        )}
      </div>
      <CompactTeamCard
        team={state.teamB}
        teamKey="teamB"
        accent={C.blue}
        editingField={editingField}
        setEditingField={setEditingField}
        updateTeam={updateTeam}
        align="left"
      />
    </div>
  );
}

function CompactTeamCard({ team, teamKey, accent, editingField, setEditingField, updateTeam, align }) {
  const fieldKey = (f) => `${teamKey}.${f}`;
  return (
    <div
      className="px-2 py-1 rounded-lg"
      style={{
        background: 'white',
        border: `2px solid ${accent}`,
        textAlign: align === 'right' ? 'right' : 'left',
      }}
    >
      <EditableLine
        value={team.name}
        editing={editingField === fieldKey('name')}
        onEdit={() => setEditingField(fieldKey('name'))}
        onSave={() => setEditingField(null)}
        onChange={(v) => updateTeam(teamKey, { name: v })}
        size="lg"
        accent={accent}
      />
      <div style={{ fontSize: '10px', color: C.textLight, marginTop: '1px' }}>
        <EditableLine
          value={team.p1}
          editing={editingField === fieldKey('p1')}
          onEdit={() => setEditingField(fieldKey('p1'))}
          onSave={() => setEditingField(null)}
          onChange={(v) => updateTeam(teamKey, { p1: v })}
          size="sm"
          accent={accent}
        />
        <EditableLine
          value={team.p2}
          editing={editingField === fieldKey('p2')}
          onEdit={() => setEditingField(fieldKey('p2'))}
          onSave={() => setEditingField(null)}
          onChange={(v) => updateTeam(teamKey, { p2: v })}
          size="sm"
          accent={accent}
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

function ScoreBox({ value, onChange, onEnter, accent }) {
  return (
    <input
      type="number" inputMode="numeric" placeholder="0"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onEnter()}
      className="w-full rounded-lg px-2 text-center font-bold outline-none transition"
      style={{
        border: `2px solid ${value ? accent : C.borderDark}`,
        color: accent, background: 'white', fontFamily: '"Bebas Neue", sans-serif',
        fontSize: '32px', height: '64px',
      }}
    />
  );
}

// =================== NEW GAME MODAL ===================
function NewGameModal({ t, state, roundCount, onSaveAndNew, onDiscardAndNew, onCancel }) {
  const [selectedMode, setSelectedMode] = useState(state.bestOf || 1);
  const apply = (action) => action(selectedMode);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', paddingTop: 'env(safe-area-inset-top, 0)' }}>
      <div className="w-full max-w-sm rounded-xl p-4 max-h-[85vh] overflow-y-auto" style={{ background: 'white' }}>
        <h3 className="text-lg font-bold mb-1 text-center" style={{ fontFamily: '"Bebas Neue", sans-serif', color: C.blue, letterSpacing: '0.05em' }}>
          {t.confirm_new_title}
        </h3>
        {roundCount > 0 && (
          <p className="text-xs mb-3 text-center" style={{ color: C.textLight }}>
            {roundCount} {t.confirm_new_in_progress}
          </p>
        )}

        {/* Game mode selector */}
        <div className="mb-3">
          <div className="text-[10px] font-semibold mb-1.5 text-center" style={{ color: C.textLight, letterSpacing: '0.15em' }}>
            {t.new_game_mode.toUpperCase()}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { value: 1, label: t.new_single },
              { value: 3, label: t.new_best_of_3 },
              { value: 5, label: t.new_best_of_5 },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedMode(opt.value)}
                className="py-2 rounded-lg font-bold text-xs active:scale-95 transition"
                style={{
                  background: selectedMode === opt.value ? C.blue : 'white',
                  color: selectedMode === opt.value ? 'white' : C.text,
                  border: `2px solid ${selectedMode === opt.value ? C.blue : C.border}`,
                  fontFamily: '"Bebas Neue", sans-serif',
                  letterSpacing: '0.03em',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {roundCount > 0 ? (
            <>
              <button
                onClick={() => apply(onSaveAndNew)}
                className="py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition"
                style={{ background: C.blue, color: 'white', fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                <Save size={16} /> {t.save_and_new}
              </button>
              <button
                onClick={() => apply(onDiscardAndNew)}
                className="py-3 rounded-lg font-bold text-sm active:scale-95 transition"
                style={{ background: 'white', color: C.red, border: `2px solid ${C.red}`, fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                {t.discard_and_new}
              </button>
            </>
          ) : (
            <button
              onClick={() => apply(onDiscardAndNew)}
              className="py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition"
              style={{ background: C.blue, color: 'white', fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            >
              {t.new}
            </button>
          )}
          <button
            onClick={onCancel}
            className="py-2 rounded-lg font-medium text-sm active:scale-95 transition"
            style={{ background: 'white', color: C.textLight, border: `1px solid ${C.border}` }}
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

// =================== EDIT ROUND MODAL ===================
function EditRoundModal({ t, state, round, onSave, onDelete, onClose }) {
  const [a, setA] = useState(String(round.a || 0));
  const [b, setB] = useState(String(round.b || 0));
  const [countA, setCountA] = useState(round.bonusCountA || 0);
  const [countB, setCountB] = useState(round.bonusCountB || 0);
  const [tenCountA, setTenCountA] = useState(round.tenCountA || 0);
  const [tenCountB, setTenCountB] = useState(round.tenCountB || 0);

  const save = () => {
    const aNum = parseInt(a) || 0;
    const bNum = parseInt(b) || 0;
    onSave({
      a: aNum,
      b: bNum,
      bonusCountA: Math.max(0, countA),
      bonusCountB: Math.max(0, countB),
      tenCountA: Math.max(0, tenCountA),
      tenCountB: Math.max(0, tenCountB),
      bonusA: bonusTotal({ pasoCount: countA, tenCount: tenCountA, pasoValue: state.pasoValue, bonus10Value: state.bonus10Value }),
      bonusB: bonusTotal({ pasoCount: countB, tenCount: tenCountB, pasoValue: state.pasoValue, bonus10Value: state.bonus10Value }),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="w-full max-w-md rounded-xl p-4 max-h-[85vh] overflow-y-auto" style={{ background: 'white' }}>
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
            tenCount={tenCountA} setTenCount={setTenCountA}
            pasoValue={state.pasoValue}
            tenValue={state.bonus10Value}
            t={t}
          />
          <EditTeamPanel
            label={state.teamB.name}
            accent={C.blue}
            score={b} setScore={setB}
            count={countB} setCount={setCountB}
            tenCount={tenCountB} setTenCount={setTenCountB}
            pasoValue={state.pasoValue}
            tenValue={state.bonus10Value}
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

function EditTeamPanel({ label, accent, score, setScore, count, setCount, tenCount, setTenCount, pasoValue, tenValue, t }) {
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
      <div className="text-[9px] mb-1 mt-2 text-center" style={{ color: C.textLight }}>{t.bonus_10}</div>
      <div className="grid grid-cols-[auto_1fr_auto] gap-1 items-center">
        <button onClick={() => setTenCount(Math.max(0, tenCount - 1))} className="w-7 h-7 rounded font-bold active:scale-90" style={{ background: '#dcfce7', color: C.green }}>−</button>
        <div className="text-center font-bold" style={{ color: C.green, fontFamily: '"Bebas Neue", sans-serif', fontSize: '15px' }}>
          {tenCount > 0 ? `+${tenCount * tenValue} ×${tenCount}` : '—'}
        </div>
        <button onClick={() => setTenCount(tenCount + 1)} className="w-7 h-7 rounded font-bold active:scale-90" style={{ background: C.green, color: 'white' }}>+</button>
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

      <Section title={t.best_of}>
        <div className="grid grid-cols-3 gap-2">
          {[1, 3, 5].map((n) => (
            <button
              key={n}
              onClick={() => update(applyModeChange(state, n))}
              className="py-2.5 rounded-lg font-bold active:scale-95 transition text-sm"
              style={{
                background: state.bestOf === n ? C.blue : 'white',
                color: state.bestOf === n ? 'white' : C.text,
                border: `2px solid ${state.bestOf === n ? C.blue : C.border}`,
              }}
            >
              {n === 1 ? t.best_of_1 : n === 3 ? t.best_of_3 : t.best_of_5}
            </button>
          ))}
        </div>
      </Section>

      <div className="mb-3 p-3 rounded-lg flex items-center justify-between gap-3" style={{ background: 'white', border: `1px solid ${C.border}` }}>
        <div>
          <div className="font-bold text-sm" style={{ color: C.text }}>{t.strict_mode}</div>
          <div className="text-xs mt-0.5" style={{ color: C.textLight }}>{t.strict_mode_desc}</div>
        </div>
        <button
          type="button"
          onClick={() => update({ strictBonus: !state.strictBonus })}
          className="py-2.5 px-4 rounded-lg font-bold active:scale-95 transition text-sm"
          style={{
            background: state.strictBonus ? C.blue : 'white',
            color: state.strictBonus ? 'white' : C.text,
            border: `2px solid ${state.strictBonus ? C.blue : C.border}`,
            minWidth: '72px',
          }}
        >
          {state.strictBonus ? t.yes : t.no}
        </button>
      </div>

      <Section title={t.bonus_values}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[10px] font-semibold mb-1 text-center" style={{ color: C.amber }}>
              {t.paso_corrido_value}
            </div>
            <input
              type="number" inputMode="numeric"
              value={state.pasoValue}
              onChange={(e) => update({ pasoValue: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full text-center text-xl font-bold rounded-lg px-2 py-2 border-2 outline-none"
              style={{ borderColor: C.amber, color: C.amber, background: 'white', fontFamily: '"Bebas Neue", sans-serif' }}
            />
          </div>
          <div>
            <div className="text-[10px] font-semibold mb-1 text-center" style={{ color: C.green }}>
              {t.bonus_10_value}
            </div>
            <input
              type="number" inputMode="numeric"
              value={state.bonus10Value}
              onChange={(e) => update({ bonus10Value: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full text-center text-xl font-bold rounded-lg px-2 py-2 border-2 outline-none"
              style={{ borderColor: C.green, color: C.green, background: 'white', fontFamily: '"Bebas Neue", sans-serif' }}
            />
          </div>
        </div>
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

      <Section title={t.about}>
        <p className="text-sm" style={{ color: C.text, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
          {t.about_full}
        </p>
      </Section>

      <Section title={t.how_scoring}>
        <ul className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4, listStyle: 'none', paddingLeft: 0 }}>
          <li>• {t.rule_teams}</li>
          <li>• {t.rule_target}</li>
          <li>• {t.rule_winner}</li>
          <li>• {t.rule_paso}</li>
          <li>• {t.rule_edit}</li>
        </ul>
      </Section>

      <Section title={t.how_to_use}>
        <ul className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4, listStyle: 'none', paddingLeft: 0 }}>
          <li>• {t.use_edit}</li>
          <li>• {t.use_score}</li>
          <li>• {t.use_paso}</li>
        </ul>
      </Section>

      <Section title={t.bonus_section}>
        <ol className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4, paddingLeft: '1.1rem', listStyleType: 'decimal' }}>
          <li>{t.bonus_step1}</li>
          <li>{t.bonus_step2}</li>
          <li>{t.bonus_step3}</li>
          <li>{t.bonus_step4}</li>
        </ol>
      </Section>

      <Section title={t.series_section}>
        <ol className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4, paddingLeft: '1.1rem', listStyleType: 'decimal' }}>
          <li>{t.series_step1}</li>
          <li>{t.series_step2}</li>
          <li>{t.series_step3}</li>
        </ol>
      </Section>

      <Section title={t.share_section}>
        <ol className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4, paddingLeft: '1.1rem', listStyleType: 'decimal' }}>
          <li>{t.share_step1}</li>
          <li>{t.share_step2}</li>
          <li>{t.share_step3}</li>
        </ol>
      </Section>

      <Section title={t.history_section}>
        <ol className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4, paddingLeft: '1.1rem', listStyleType: 'decimal' }}>
          <li>{t.history_step1}</li>
          <li>{t.history_step2}</li>
          <li>{t.history_step3}</li>
          <li>{t.history_step4}</li>
        </ol>
      </Section>

      <Section title={t.export_section}>
        <ol className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4, paddingLeft: '1.1rem', listStyleType: 'decimal' }}>
          <li>{t.export_info_1}</li>
          <li>{t.export_info_2}</li>
          <li>{t.export_info_3}</li>
          <li>{t.export_info_4}</li>
        </ol>
      </Section>

      <Section title={t.update_section}>
        <ol className="space-y-1.5 text-sm" style={{ color: C.text, lineHeight: 1.4, paddingLeft: '1.1rem', listStyleType: 'decimal' }}>
          <li>{t.update_step1}</li>
          <li>{t.update_step2}</li>
          <li>{t.update_step3}</li>
        </ol>
      </Section>

      {/* Sugerencias button */}
      <button
        onClick={sendFeedbackEmail}
        className="w-full py-3 rounded-lg active:scale-95 transition flex items-center justify-center gap-2 mb-2"
        style={{ background: C.blue, color: 'white', fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em', fontFamily: '"Bebas Neue", sans-serif' }}
      >
        <Mail size={16} /> {t.suggestions}
      </button>

      <div className="text-center pt-2 pb-4">
        <div className="text-[10px] tracking-widest" style={{ color: C.textLight }}>
          {t.version} {APP_VERSION}{BUILD_DATE ? ` · ${BUILD_DATE}` : ''}
        </div>
      </div>
    </div>
  );
}

// =================== HISTORY ===================
function HistoryView({ t, state, history, onDelete, onClose }) {
  const [selected, setSelected] = useState(null);
  const [showExport, setShowExport] = useState(false);
  if (selected) return <HistoryDetail game={selected} t={t} state={state} onBack={() => setSelected(null)} />;

  return (
    <div>
      <button onClick={onClose} className="flex items-center gap-1 mb-3 text-sm font-semibold active:scale-95 transition" style={{ color: C.blue }}>
        <ChevronLeft size={16} /> {t.back}
      </button>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif', color: C.blue, letterSpacing: '0.08em' }}>
          {t.saved_games}
        </h2>
        {history.length > 0 && (
          <button
            onClick={() => setShowExport(true)}
            className="px-3 py-1.5 rounded-lg active:scale-95 transition flex items-center gap-1"
            style={{ background: C.blue, color: 'white', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}
          >
            <Share2 size={13} /> {t.export_games}
          </button>
        )}
      </div>
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
      {showExport && (
        <ExportModal
          t={t}
          state={state}
          history={history}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}

function ExportModal({ t, state, history, onClose }) {
  // All teams across history, sorted
  const allTeamNames = Array.from(new Set(
    history.flatMap((g) => [g.teamA?.name, g.teamB?.name]).filter(Boolean)
  )).sort();

  // Date bounds
  const sortedDates = history.map((g) => g.date).sort();
  const minDate = sortedDates[0] ? sortedDates[0].slice(0, 10) : '';
  const maxDate = sortedDates[sortedDates.length - 1] ? sortedDates[sortedDates.length - 1].slice(0, 10) : '';

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filterTeams, setFilterTeams] = useState([]); // names to require

  const passesFilter = (g) => {
    const d = g.date.slice(0, 10);
    if (fromDate && d < fromDate) return false;
    if (toDate && d > toDate) return false;
    if (filterTeams.length > 0) {
      const a = g.teamA?.name || '';
      const b = g.teamB?.name || '';
      // Pass if at least one of the filtered teams is present
      if (!filterTeams.some(n => n === a || n === b)) return false;
    }
    return true;
  };

  const visibleGames = history.filter(passesFilter);

  // Selection state — selectedIds is the set of game IDs to export
  const [selectedIds, setSelectedIds] = useState(() => new Set(history.map(g => g.id)));

  // When filters change, intersect selection with visible games
  // (so hidden-by-filter games are removed from selection automatically)
  useEffect(() => {
    setSelectedIds(prev => {
      const visibleIdSet = new Set(visibleGames.map(g => g.id));
      const next = new Set();
      prev.forEach(id => { if (visibleIdSet.has(id)) next.add(id); });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, filterTeams.join(',')]);

  const toggle = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(visibleGames.map(g => g.id)));
  const clearAll = () => setSelectedIds(new Set());

  const toggleFilterTeam = (name) => {
    setFilterTeams(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const [busy, setBusy] = useState(false);
  const selectedGames = history.filter(g => selectedIds.has(g.id));

  const doExport = async (format) => {
    if (selectedGames.length === 0) return;
    setBusy(true);
    try {
      if (format === 'csv') {
        const csv = formatGamesAsCSV(selectedGames, t);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const file = new File([blob], `domino-${Date.now()}.csv`, { type: 'text/csv' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Dominó', text: `${selectedGames.length} juegos` });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = file.name; a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        const files = [];
        for (const g of selectedGames) {
          const blob = await renderGameToBlob({
            state: { teamA: g.teamA, teamB: g.teamB, target: g.target, pasoValue: g.pasoValue || state.pasoValue, rounds: g.rounds, lang: state.lang },
            totalA: g.totalA, totalB: g.totalB, winner: g.winner,
            date: new Date(g.date), t,
          });
          files.push(new File([blob], `domino-${g.id}.jpg`, { type: 'image/jpeg' }));
        }
        if (navigator.canShare && navigator.canShare({ files })) {
          await navigator.share({ files, title: 'Dominó', text: `${files.length} juegos` });
        } else if (files.length > 0 && navigator.canShare && navigator.canShare({ files: [files[0]] })) {
          await navigator.share({ files: [files[0]] });
        } else {
          for (const f of files) {
            const url = URL.createObjectURL(f);
            const a = document.createElement('a');
            a.href = url; a.download = f.name; a.click();
            URL.revokeObjectURL(url);
            await new Promise((r) => setTimeout(r, 150));
          }
        }
      }
      onClose();
    } catch (err) {
      if (err.name !== 'AbortError') alert(t.share_failed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{
        background: 'rgba(0,0,0,0.5)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div
        className="w-full max-w-md rounded-t-xl sm:rounded-xl flex flex-col"
        style={{ background: 'white', maxHeight: '85vh' }}
      >
        {/* Sticky header — close button always visible */}
        <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: C.border }}>
          <h3 className="text-lg font-bold" style={{ fontFamily: '"Bebas Neue", sans-serif', color: C.blue, letterSpacing: '0.05em' }}>
            {t.export_games}
          </h3>
          <button
            onClick={onClose}
            className="p-2 -m-1 rounded-full active:scale-90"
            style={{ background: '#f1f5f9' }}
            aria-label={t.close}
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-3 py-2 border-b flex items-center justify-between gap-2" style={{ borderColor: C.border, background: '#f8fafc' }}>
          <button
            onClick={() => setShowFilters(s => !s)}
            className="text-xs font-semibold flex items-center gap-1 active:opacity-60"
            style={{ color: C.blue }}
          >
            {showFilters ? '▼' : '▶'} {t.export_filters}
            {(fromDate || toDate || filterTeams.length > 0) && (
              <span className="px-1.5 rounded-full text-[10px]" style={{ background: C.blue, color: 'white' }}>
                {[fromDate || toDate ? 1 : 0, filterTeams.length > 0 ? 1 : 0].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>
          <div className="flex gap-2 text-xs">
            <button onClick={selectAll} className="font-semibold active:opacity-60" style={{ color: C.blue }}>
              {t.export_select_all}
            </button>
            <span style={{ color: C.borderDark }}>·</span>
            <button onClick={clearAll} className="font-semibold active:opacity-60" style={{ color: C.textLight }}>
              {t.export_clear}
            </button>
          </div>
        </div>

        {/* Filter panel — collapsible */}
        {showFilters && (
          <div className="px-3 py-3 border-b space-y-3" style={{ borderColor: C.border, background: '#f8fafc' }}>
            <div>
              <div className="text-[10px] font-bold mb-1" style={{ color: C.textLight, letterSpacing: '0.1em' }}>
                {t.export_dates.toUpperCase()}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={fromDate}
                  min={minDate}
                  max={maxDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  placeholder={t.export_from}
                  style={{ width: '100%', padding: '6px 8px', border: `1px solid ${C.border}`, borderRadius: '6px', fontSize: '13px', background: 'white' }}
                />
                <input
                  type="date"
                  value={toDate}
                  min={minDate}
                  max={maxDate}
                  onChange={(e) => setToDate(e.target.value)}
                  placeholder={t.export_to}
                  style={{ width: '100%', padding: '6px 8px', border: `1px solid ${C.border}`, borderRadius: '6px', fontSize: '13px', background: 'white' }}
                />
              </div>
            </div>

            {allTeamNames.length > 0 && (
              <div>
                <div className="text-[10px] font-bold mb-1" style={{ color: C.textLight, letterSpacing: '0.1em' }}>
                  {t.export_team_mode.toUpperCase()}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {allTeamNames.map(name => {
                    const sel = filterTeams.includes(name);
                    return (
                      <button
                        key={name}
                        onClick={() => toggleFilterTeam(name)}
                        className="px-2 py-1 rounded text-xs font-semibold active:scale-95 transition"
                        style={{
                          background: sel ? C.blue : 'white',
                          color: sel ? 'white' : C.text,
                          border: `1.5px solid ${sel ? C.blue : C.border}`,
                        }}
                      >
                        {sel ? '✓ ' : ''}{name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Game list — checkbox rows */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight: '200px' }}>
          {visibleGames.length === 0 ? (
            <div className="text-center py-8 italic text-sm" style={{ color: C.textLight }}>
              {t.no_games_match}
            </div>
          ) : (
            visibleGames.map(g => {
              const sel = selectedIds.has(g.id);
              const aWon = g.winner === g.teamA?.name;
              return (
                <button
                  key={g.id}
                  onClick={() => toggle(g.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 active:bg-blue-50 transition"
                  style={{ borderBottom: `1px solid ${C.border}`, textAlign: 'left' }}
                >
                  <div
                    className="flex items-center justify-center rounded shrink-0"
                    style={{
                      width: '20px', height: '20px',
                      background: sel ? C.blue : 'white',
                      border: `2px solid ${sel ? C.blue : C.borderDark}`,
                    }}
                  >
                    {sel && <Check size={14} style={{ color: 'white' }} strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold" style={{ color: C.textLight }}>
                      {formatUSDateTime(new Date(g.date))}
                    </div>
                    <div className="text-sm font-bold flex items-center gap-1.5" style={{ color: C.text, marginTop: '1px' }}>
                      <span style={{ color: aWon ? C.gold : C.text }}>{g.teamA?.name}</span>
                      <span className="tabular-nums" style={{ fontFamily: '"Bebas Neue", sans-serif', fontWeight: 700 }}>
                        {g.totalA}–{g.totalB}
                      </span>
                      <span style={{ color: !aWon && g.winner ? C.gold : C.text }}>{g.teamB?.name}</span>
                    </div>
                    {(g.teamA?.p1 || g.teamA?.p2 || g.teamB?.p1 || g.teamB?.p2) && (
                      <div className="text-[10px] truncate" style={{ color: C.textLight, marginTop: '1px' }}>
                        {[g.teamA?.p1, g.teamA?.p2].filter(Boolean).join(', ')}
                        {' vs '}
                        {[g.teamB?.p1, g.teamB?.p2].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Sticky footer — export action buttons */}
        <div className="border-t p-3 space-y-2" style={{ borderColor: C.border, background: 'white' }}>
          <div className="text-center text-xs" style={{ color: C.textLight }}>
            <strong style={{ color: C.blue }}>{selectedGames.length}</strong> {t.export_selected_count}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => doExport('csv')}
              disabled={busy || selectedGames.length === 0}
              className="py-2.5 rounded-lg font-bold flex items-center justify-center gap-1 active:scale-95 transition disabled:opacity-40"
              style={{ background: C.blue, color: 'white', fontSize: '13px', fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            >
              <FileText size={14} /> {t.csv_format}
            </button>
            <button
              onClick={() => doExport('jpg')}
              disabled={busy || selectedGames.length === 0}
              className="py-2.5 rounded-lg font-bold flex items-center justify-center gap-1 active:scale-95 transition disabled:opacity-40"
              style={{ background: 'white', color: C.blue, border: `2px solid ${C.blue}`, fontSize: '13px', fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
            >
              <Share2 size={14} /> {t.jpg_format}
            </button>
          </div>
          {busy && (
            <div className="text-center text-xs" style={{ color: C.textLight }}>{t.sharing}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatGamesAsCSV(games, t) {
  // Header row
  const headers = [
    t.csv_date, t.csv_team_a, t.csv_players_a, t.csv_team_b, t.csv_players_b,
    t.csv_total_a, t.csv_total_b, t.csv_winner, t.csv_rounds, t.csv_detail,
  ];
  const lines = [headers.join(',')];
  const esc = (v) => {
    if (v == null) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  games.forEach((g) => {
    const detail = g.rounds.map((r, i) => {
      const a = r.a + (r.bonusA ? `(+${r.bonusA})` : '');
      const b = r.b + (r.bonusB ? `(+${r.bonusB})` : '');
      return `P${i+1}:${a}/${b}`;
    }).join(' | ');
    lines.push([
      esc(formatUSDateTime(new Date(g.date))),
      esc(g.teamA?.name),
      esc([g.teamA?.p1, g.teamA?.p2].filter(Boolean).join(' & ')),
      esc(g.teamB?.name),
      esc([g.teamB?.p1, g.teamB?.p2].filter(Boolean).join(' & ')),
      esc(g.totalA),
      esc(g.totalB),
      esc(g.winner || ''),
      esc(g.rounds.length),
      esc(detail),
    ].join(','));
  });
  return lines.join('\n');
}

function HistoryCard({ game, t, onDelete, onOpen }) {
  const date = new Date(game.date);
  const dateStr = formatUSDateTime(date);
  const aWon = game.winner === game.teamA.name;
  return (
    <div className="p-3 rounded-lg shadow-sm" style={{ background: 'white', border: `1px solid ${C.border}` }}>
      <div className="flex items-start justify-between mb-2">
        <button onClick={onOpen} className="text-sm font-semibold tracking-wide active:opacity-70" style={{ color: C.blue }}>
          {dateStr}
        </button>
        <button onClick={onDelete} className="opacity-60 active:scale-90 transition" style={{ color: C.red }}>
          <Trash2 size={16} />
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
      <div className="text-sm font-semibold text-center mb-2" style={{ color: C.blue }}>{formatUSDateTime(date)}</div>

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
          style={{ display: 'grid', gridTemplateColumns: GRID_5_HIST, alignItems: 'center', background: '#e2e8f0', color: C.text, borderTop: `2px solid ${C.blueDark}` }}>
          <div className="text-[10px] font-bold tracking-wider" style={{ fontFamily: '"Bebas Neue", sans-serif', color: C.blueDark }}>{t.total}</div>
          <div className="col-span-2 text-xl font-bold tabular-nums flex items-center justify-center gap-1" style={{ fontFamily: '"Bebas Neue", sans-serif', color: game.totalA > 0 ? (aWon ? C.gold : C.red) : C.textLight }}>
            {game.totalA === 0 && game.totalB > 0 ? <span style={{ fontSize: '20px', lineHeight: 1 }}>👞</span> : game.totalA}
          </div>
          <div className="col-span-2 text-xl font-bold tabular-nums flex items-center justify-center gap-1" style={{ fontFamily: '"Bebas Neue", sans-serif', color: game.totalB > 0 ? (bWon ? C.gold : C.blue) : C.textLight }}>
            {game.totalB === 0 && game.totalA > 0 ? <span style={{ fontSize: '20px', lineHeight: 1 }}>👞</span> : game.totalB}
          </div>
        </div>
      </div>
    </div>
  );
}

// =================== TEXT EXPORT ===================
function formatUSDateTime(date) {
  const d = (date instanceof Date) ? date : new Date(date);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const yy = String(d.getFullYear()).slice(-2);
  let h = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${m}/${day}/${yy} ${h}:${min} ${ampm}`;
}

function formatGameAsText(game, t) {
  const lines = [];
  const players = (team) => [team.p1, team.p2].filter(Boolean).join(', ');
  const cell = (main, bonus, count) => {
    let s = String(main || 0);
    if (bonus) s += ' +' + bonus + (count > 1 ? '×' + count : '');
    return s;
  };

  lines.push('==================================');
  lines.push(`       ${t.text_export_title || 'DOMINÓ'} - ` + (t.game_export_subject || 'Game'));
  lines.push('==================================');
  lines.push('Fecha: ' + formatUSDateTime(new Date(game.date)));
  lines.push('');

  // Teams + players + final totals
  lines.push(game.teamA.name + ': ' + game.totalA);
  if (players(game.teamA)) lines.push('  ' + players(game.teamA));
  lines.push('');
  lines.push(game.teamB.name + ': ' + game.totalB);
  if (players(game.teamB)) lines.push('  ' + players(game.teamB));
  lines.push('');

  if (game.winner) {
    lines.push('>> ' + (t.winner ? t.winner.toUpperCase() : 'WINNER') + ': ' + game.winner + ' <<');
    lines.push('');
  }

  // Rounds table with column headers
  lines.push('--- ' + (t.rounds_word ? t.rounds_word.toUpperCase() : 'ROUNDS') + ' ---');
  const colA = game.teamA.name.slice(0, 14);
  const colB = game.teamB.name.slice(0, 14);
  lines.push('       ' + colA.padEnd(16) + colB);
  lines.push('       ' + '-'.repeat(colA.length) + ' '.repeat(16 - colA.length) + '-'.repeat(colB.length));
  game.rounds.forEach((r, i) => {
    const a = cell(r.a, r.bonusA, r.bonusCountA);
    const b = cell(r.b, r.bonusB, r.bonusCountB);
    const num = ('P' + (i + 1)).padEnd(6);
    lines.push(num + ' ' + a.padEnd(16) + b);
  });
  lines.push('       ' + '-'.repeat(16) + '-'.repeat(8));
  lines.push('TOTAL  ' + String(game.totalA).padEnd(16) + game.totalB);
  lines.push('');

  lines.push('--');
  lines.push('Dominó Scorekeeper v' + APP_VERSION + (BUILD_DATE ? ' (' + BUILD_DATE + ')' : ''));
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
