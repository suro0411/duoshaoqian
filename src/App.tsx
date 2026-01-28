import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Trophy,
  Info,
  Home,
  MapPin,
  ArrowRight,
  CheckCircle,
  XCircle,
  Skull,
  Heart,
  Volume2,
} from "lucide-react";

// --- Firebase Initialization ---

// --- Types & Constants ---

type GameMode = 'survival' | 'challenge' | 'oni' | null;
type Region = 'china' | 'taiwan' | null;
type GameState = 'title' | 'regionSelect' | 'modeSelect' | 'playing' | 'result' | 'info' | 'ranking';



interface RegionConfig {
  name: string;
  sub: string;
  currency: string;
  unit: string;
  denominations: number[];
  survivalExtra: number[];
  voiceLang: string;
  moneyType: 'bill' | 'coin';
  feedback: {
    correct: string;
    wrong: string;
  };
}

const CHINA_DENOMINATIONS = [1, 5, 10, 20, 50, 100, 200, 500];
const TAIWAN_DENOMINATIONS = [1, 5, 10, 50, 100, 200, 500, 1000, 2000];
const SURVIVAL_EXTRA = [1000, 5000, 10000, 50000];

const REGION_CONFIGS: Record<string, RegionConfig> = {
  china: {
    name: '中国 (大陸)',
    sub: '普通話 / 人民元',
    currency: 'CNY',
    unit: '元',
    denominations: CHINA_DENOMINATIONS,
    survivalExtra: SURVIVAL_EXTRA,
    voiceLang: 'zh-CN',
    moneyType: 'bill',
    feedback: { correct: '正确!', wrong: '错误...' }
  },
  taiwan: {
    name: '台湾 (Taiwan)',
    sub: '台湾華語 / 新台湾ドル',
    currency: 'TWD',
    unit: '元',
    denominations: TAIWAN_DENOMINATIONS,
    survivalExtra: SURVIVAL_EXTRA,
    voiceLang: 'zh-TW',
    moneyType: 'coin',
    feedback: { correct: '正確!', wrong: '錯誤...' }
  }
};

const BILL_STYLES: Record<number, string> = {
  1: 'bg-green-700 text-white border-green-800',
  5: 'bg-purple-700 text-white border-purple-800',
  10: 'bg-blue-700 text-white border-blue-800',
  20: 'bg-yellow-800 text-white border-yellow-900', 
  50: 'bg-teal-700 text-white border-teal-800',
  100: 'bg-red-600 text-white border-red-700',
  200: 'bg-green-600 text-white border-green-700',
  500: 'bg-indigo-600 text-white border-indigo-700',
  1000: 'bg-slate-700 text-white border-slate-800',
  5000: 'bg-slate-800 text-white border-slate-900',
  10000: 'bg-black text-white border-slate-950',
  50000: 'bg-slate-900 text-white border-black',
};

const TAIWAN_STYLES: Record<number, string> = {
  1: 'coin bg-amber-600 text-amber-100 border-amber-700',
  5: 'coin bg-slate-300 text-slate-600 border-slate-400',
  10: 'coin bg-slate-300 text-slate-600 border-slate-400',
  50: 'coin bg-yellow-500 text-yellow-900 border-yellow-600',
  100: 'bill bg-red-500 text-white border-red-600',
  200: 'bill bg-green-600 text-white border-green-700',
  500: 'bill bg-amber-800 text-white border-amber-900',
  1000: 'bill bg-blue-800 text-white border-blue-900',
  2000: 'bill bg-purple-900 text-white border-purple-950',
  5000: 'bill bg-slate-800 text-white border-slate-900',
  10000: 'bill bg-black text-white border-slate-950',
  50000: 'bill bg-slate-900 text-white border-black',
};

// --- Sub Components ---

const MenuBoard = ({ className = "" }: { className?: string }) => (
  <div className={`relative w-28 h-36 bg-slate-800 border-4 border-amber-900 rounded-lg shadow-2xl p-2 flex flex-col items-center gap-1 ${className}`}>
    <div className="w-full h-1 bg-amber-800/50 rounded-full mb-1" />
    <div className="relative w-10 h-14 my-1">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-12 bg-red-400/80 rounded-full z-0" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-12 bg-white/40 border border-white/30 rounded-b-lg z-10 overflow-hidden">
        <div className="absolute bottom-0 w-full h-3/4 bg-amber-200/40" />
        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-slate-900 rounded-full" />
        <div className="absolute bottom-2 left-3 w-1.5 h-1.5 bg-slate-900 rounded-full" />
        <div className="absolute bottom-1 left-5 w-1.5 h-1.5 bg-slate-900 rounded-full" />
      </div>
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-9 h-2 bg-white/80 rounded-full z-20 shadow-sm" />
    </div>
    <div className="w-full flex justify-between px-1">
      <div className="w-8 h-1 bg-white/20 rounded" />
      <div className="w-4 h-1 bg-yellow-400/40 rounded" />
    </div>
    <div className="w-full flex justify-between px-1">
      <div className="w-10 h-1 bg-white/20 rounded" />
      <div className="w-3 h-1 bg-yellow-400/40 rounded" />
    </div>
    <div className="mt-auto mb-1 flex gap-1">
        <div className="w-2 h-2 rounded-full bg-red-400/60" />
        <div className="w-2 h-2 rounded-full bg-sky-400/60" />
        <div className="w-2 h-2 rounded-full bg-green-400/60" />
    </div>
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-amber-900 rounded-full border-2 border-slate-400" />
  </div>
);

const TapiocaDrink = ({ className = "" }: { className?: string }) => (
  <div className={`relative w-24 h-32 ${className} flex items-center justify-center`}>
    <div className="absolute top-0 left-[55%] w-2 h-24 bg-red-400 rounded-full -rotate-6 z-0" />
    <div className="absolute top-12 w-20 h-4 bg-white/90 rounded-full z-20 shadow-sm" />
    <div className="absolute bottom-0 w-16 h-24 bg-white/30 backdrop-blur-md border-2 border-white/60 rounded-b-2xl overflow-hidden z-10">
      <div className="absolute bottom-0 w-full h-4/5 bg-amber-200/50" />
      <div className="absolute bottom-2 left-2 w-3 h-3 bg-slate-800 rounded-full" />
      <div className="absolute bottom-3 left-6 w-3 h-3 bg-slate-800 rounded-full" />
      <div className="absolute bottom-1 left-10 w-3 h-3 bg-slate-800 rounded-full" />
      <div className="absolute bottom-6 left-4 w-3 h-3 bg-slate-800 rounded-full" />
      <div className="absolute bottom-5 left-9 w-3 h-3 bg-slate-800 rounded-full" />
    </div>
  </div>
);

const DrinkStandBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-sky-50" />
    <div className="absolute top-0 left-0 right-0 h-32 bg-yellow-400 flex shadow-lg">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex-1 h-32 border-r border-yellow-500/30 relative">
          <div className="absolute -bottom-4 left-0 right-0 h-8 bg-yellow-400 rounded-b-full shadow-md" />
        </div>
      ))}
    </div>
    <TapiocaDrink className="absolute top-40 -left-6 opacity-30 -rotate-12 scale-150" />
    <TapiocaDrink className="absolute top-36 -right-4 opacity-20 rotate-12 scale-110" />
    <TapiocaDrink className="absolute top-[60%] right-4 opacity-40 -rotate-6 scale-125" />
    <div className="absolute bottom-1/4 left-0 right-0 h-2 bg-slate-200" />
  </div>
);

const Shopkeeper = ({ speaking, onClick }: { speaking: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick}
    disabled={speaking}
    className={`relative w-24 h-24 transition-transform duration-200 outline-none ${speaking ? 'scale-110 cursor-default' : 'scale-100 cursor-pointer hover:scale-105 active:scale-95'}`}
  >
     <div className="absolute inset-0 bg-orange-100 rounded-full border-4 border-white shadow-lg overflow-hidden z-10">
        <div className="absolute top-0 left-0 right-0 h-8 bg-amber-900 rounded-t-full" />
        <div className="absolute top-10 left-6 w-2.5 h-2.5 bg-slate-800 rounded-full" />
        <div className="absolute top-10 right-6 w-2.5 h-2.5 bg-slate-800 rounded-full" />
        <div className={`absolute top-[64px] left-1/2 -translate-x-1/2 transition-all duration-100 ${speaking ? 'w-4 h-4 border-2 bg-red-400 rounded-full' : 'w-4 h-1.5 border-b-2 border-red-400 rounded-b-full'}`} />
     </div>
     {!speaking && (
       <div className="absolute -top-2 -right-2 bg-sky-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white animate-bounce">
         <Volume2 size={16} />
       </div>
     )}
  </button>
);

const Money = ({ value, region, onClick, size = 'md' }: { value: number; region: Region; onClick?: () => void; size?: 'sm' | 'md' | 'lg' }) => {
  const isTaiwan = region === 'taiwan';
  const isTaiwanCoin = isTaiwan && value <= 50;
  
  if (isTaiwanCoin) {
    const sizePx = size === 'lg' ? "w-16 h-16 text-2xl" : size === 'md' ? "w-14 h-14 text-xl" : "w-10 h-10 text-xs";
    const coinStyle = TAIWAN_STYLES[value] || 'bg-gray-400';
    return (
      <div 
        className={`relative rounded-full shadow-[0_3px_0_rgb(0,0,0,0.3)] flex items-center justify-center font-black cursor-pointer select-none transition-transform active:scale-90 border-2 shrink-0 ${sizePx} ${coinStyle.replace('coin ', '')}`}
        onClick={onClick}
      >
        <span className="drop-shadow-md">{value}</span>
      </div>
    );
  } else {
    const baseClasses = "relative rounded shadow-md flex items-center justify-center font-black cursor-pointer select-none transition-transform active:scale-90 shrink-0";
    const sizeClasses = size === 'lg' ? "w-24 h-12 text-2xl" : size === 'md' ? "w-20 h-11 text-lg" : "w-12 h-7 text-[10px]";
    const styleClass = isTaiwan 
      ? (TAIWAN_STYLES[value] || 'bg-gray-500').replace('bill ', '') 
      : (BILL_STYLES[value] || 'bg-gray-500');

    return (
      <div 
        className={`${baseClasses} ${sizeClasses} ${styleClass}`}
        onClick={onClick}
      >
        <div className="absolute left-1 top-0.5 opacity-40 text-[0.35em] leading-none font-bold">{isTaiwan ? '中華' : '中国'}</div>
        <span className="drop-shadow-lg z-10">{value}</span>
        <div className="absolute right-1 bottom-0.5 opacity-40 text-[0.35em] leading-none font-bold">{value}</div>
      </div>
    );
  }
};

// --- Main Component ---

export default function App() {
  const [gameState, setGameState] = useState<GameState>('title');
  const [region, setRegion] = useState<Region>(null);
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [currentTray, setCurrentTray] = useState<number[]>([]);
  const [score, setScore] = useState<number>(0);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // ---- 遊び方 ----
  const renderInfo = () => (
    <div className="flex flex-col h-full p-6 overflow-hidden relative">
      <DrinkStandBackground />
      {/* 省略：中身はそのままでOK */}
    </div>
  );

  // ---- ランキング ----
  const renderRanking = () => (
    <div className="flex flex-col h-full items-center justify-center p-6 text-center bg-sky-50">
      <h2 className="text-2xl font-black text-sky-900 mb-4">ランキング</h2>
      <p className="text-slate-500 font-bold mb-2">🚧 現在準備中です</p>
      <button
        onClick={() => setGameState('title')}
        className="px-6 py-3 bg-sky-500 text-white rounded-2xl font-black"
      >
        タイトルへ戻る
      </button>
    </div>
  );

  useEffect(() => {
    if (!window.speechSynthesis) return;
      const warmUp = new SpeechSynthesisUtterance(' ');
  warmUp.volume = 0;
  window.speechSynthesis.speak(warmUp);
  }, []);

// 🔊 voices 初期化（Chrome対策）
  useEffect(() => {
  if (!window.speechSynthesis) return;
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);


  // Leaderboard listener


  function generateOniReading(num: number): string {
    const units = ['', '十', '百', '千', '万'];
    const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

    let result = '';
    let str = String(num);
    let len = str.length;

    for (let i = 0; i < len; i++) {
      const n = Number(str[i]);
      const pos = len - i - 1;

      if (n === 0) {
      // 口語ルール：0は基本読まない（lingを言わない）
      continue;
      }

    // 「一十」→「十」にはしない（口語・買い物想定）
    result += digits[n] + units[pos];
  }

  return result;
}



const speakAmount = useCallback((amount: number) => {
  if (!window.speechSynthesis || !region) return;

  setIsSpeaking(true);

  let text = '';

  if (gameMode !== 'oni') {
  const unit = region === 'taiwan' ? '块' : '元';
  text = `一共是${amount}${unit}`;
  } else {
  text = generateOniReading(amount);
  } 


  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = REGION_CONFIGS[region].voiceLang;

  utterance.rate = gameMode === 'oni' ? 1.3 : 1.0;
  utterance.pitch = gameMode === 'oni' ? 0.8 : 1.0;

  utterance.onend = () => setIsSpeaking(false);
  utterance.onerror = () => setIsSpeaking(false);


  // ⭐ 頭切れ防止
  setTimeout(() => {
  window.speechSynthesis.speak(utterance);
}, 300);

}, [region, gameMode]);



  const generateAmount = (currentQ: number): number => {
    let min, max;
    if (gameMode === 'oni') {min = 1; max = 99999; } 
    else if (gameMode === 'survival') {
      if (currentQ <= 10) { min = 10; max = 99; }
      else if (currentQ <= 20) { min = 100; max = 999; }
      else if (currentQ <= 30) { min = 1000; max = 9999; }
      else if (currentQ <= 40) { min = 10000; max = 99999; }
      else { min = 10; max = 50000; }
    } else {
      if (currentQ < 6) { min = 10; max = 99; }
      else { min = 100; max = 999; }
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const generateQuestion = (nextQCount: number) => {
    const amount = generateAmount(nextQCount);
    setTargetAmount(amount);
    setCurrentTray([]);
    setFeedback(null);
    setFeedbackMessage('');
  };

  const startMode = (mode: GameMode) => {
    setGameMode(mode);
    setScore(0);
    setQuestionCount(1);
    setGameState('playing');
    generateQuestion(1);
  };

  const addToTray = (amount: number) => {
    if (feedback !== null) return;
    setCurrentTray(prev => [...prev, amount]);
  };

  const removeFromTray = (index: number) => {
    if (feedback !== null) return;
    setCurrentTray(prev => prev.filter((_, i) => i !== index));
  };

const checkAnswer = () => {
  if (!region) return;

  const currentTotal = currentTray.reduce((a, b) => a + b, 0);

  if (currentTotal === targetAmount) {
    setFeedback('correct');
    setScore(prev => prev + 1);

    setTimeout(() => {
      if (gameMode === 'challenge' && questionCount >= 10) {
        setGameState('result');
      } else if (gameMode === 'survival' && questionCount >= 50) {
        setGameState('result');
      } else {
        const nextQ = questionCount + 1;
        setQuestionCount(nextQ);
        generateQuestion(nextQ);
      }
    }, 1200);

  } else {
    setFeedback('wrong');
    const diff = currentTotal - targetAmount;
    setFeedbackMessage(
      diff > 0 ? `多いです (+${diff})` : `足りません (${diff})`
    );

    setTimeout(() => {
      if (gameMode === 'survival' || gameMode === 'oni') {
        setGameState('result');
      } else if (questionCount >= 10) {
        setGameState('result');
      } else {
        const nextQ = questionCount + 1;
        setQuestionCount(nextQ);
        generateQuestion(nextQ);
      }
    }, 2000);
  }
};



  const getScoreMessage = (score: number) => {
    if (score >= 45) return { phrase: "太牛了！", text: "驚異的なリスニング力！現地で店長を任せられるレベルです。" };
    if (score >= 30) return { phrase: "太棒了！", text: "素晴らしい！高額な会計も迷わずこなせていますね。" };
    if (score >= 15) return { phrase: "厲害！", text: "かなり耳が中国語に慣れてきましたね。その調子です！" };
    if (score >= 5) return { phrase: "不錯！", text: "基本的なやり取りはバッチリ。もっと上を目指しましょう！" };
    return { phrase: "加油！", text: "まずは短い数字から。繰り返し挑戦して耳を慣らしていきましょう！" };
  };

  const availableDenominations = useMemo(() => {
    if (!region) return [];
    const config = REGION_CONFIGS[region];
    const base = config.denominations;
    const extra = gameMode === 'survival' || gameMode === 'oni' ? config.survivalExtra : [];
    return Array.from(new Set([...base, ...extra])).sort((a, b) => a - b);
  }, [region, gameMode]);

  // Views
  const renderTitle = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-8 relative overflow-hidden">
      <DrinkStandBackground />
      <div className="z-10 text-center space-y-2">
        <div className="bg-white p-5 rounded-3xl inline-block mb-2 shadow-xl border-4 border-sky-400">
          <MenuBoard />
        </div>
        <h1 className="text-5xl font-bold text-sky-900 tracking-tight drop-shadow-sm">多少錢？</h1>
        <p className="text-sky-700 font-medium bg-white/50 px-4 py-1 rounded-full text-sm">Duōshǎo qián?</p>
      </div>
      <button onClick={() => setGameState('regionSelect')} className="z-10 w-full max-w-xs bg-sky-600 text-white text-xl py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 ring-4 ring-sky-200 transition-transform font-bold">スタート</button>
      <div className="z-10 flex gap-6">
        <button onClick={() => setGameState('ranking')} className="text-sky-700 flex flex-col items-center text-xs gap-1 font-bold"><Trophy size={20} />ランキング</button>
        <button onClick={() => setGameState('info')} className="text-sky-700 flex flex-col items-center text-xs gap-1 font-bold"><Info size={20} />遊び方</button>
      </div>
    </div>
  );

  const renderRegionSelect = () => (
    <div className="flex flex-col h-full p-6 space-y-6 relative overflow-hidden">
      <DrinkStandBackground />
      <div className="flex items-center gap-2 text-gray-600 mb-2 z-10">
        <button onClick={() => setGameState('title')}><Home size={24}/></button>
        <h2 className="text-xl font-bold">地域・言語を選択</h2>
      </div>
      <button onClick={() => { setRegion('china'); setGameState('modeSelect'); }} className="z-10 bg-white/90 border-2 border-slate-200 hover:border-red-500 rounded-2xl p-6 shadow-sm active:scale-95 transition-all text-left backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="bg-red-100 p-4 rounded-full text-red-600"><MapPin size={32} /></div>
          <div><div className="text-2xl font-bold">中国 (大陸)</div><div className="text-sm text-slate-500">人民元 / 普通話</div></div>
        </div>
      </button>
      <button onClick={() => { setRegion('taiwan'); setGameState('modeSelect'); }} className="z-10 bg-white/90 border-2 border-slate-200 hover:border-blue-500 rounded-2xl p-6 shadow-sm active:scale-95 transition-all text-left backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600"><MapPin size={32} /></div>
          <div><div className="text-2xl font-bold">台湾 (Taiwan)</div><div className="text-sm text-slate-500">新台湾ドル / 台湾華語</div></div>
        </div>
      </button>
    </div>
  );

  const renderModeSelect = () => (
    <div className="flex flex-col h-full p-6 space-y-6 relative overflow-hidden">
      <DrinkStandBackground />
      <div className="flex items-center gap-2 text-gray-600 mb-2 z-10">
        <button onClick={() => setGameState('regionSelect')}><ArrowRight className="rotate-180"/></button>
        <h2 className="text-xl font-bold">コース選択</h2>
      </div>
      <button onClick={() => startMode('survival')} className="z-10 flex-1 bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center gap-2 active:scale-95 border-4 border-orange-200">
        <Trophy size={48} className="text-yellow-200" /><span className="text-2xl font-bold">サバイバル</span>
        <span className="text-xs opacity-80 text-center font-bold">最大50問 / ミスで即終了</span>
      </button>
      <button onClick={() => startMode('challenge')} className="z-10 flex-1 bg-gradient-to-br from-sky-400 to-sky-600 text-white rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center gap-2 active:scale-95 border-4 border-sky-200">
        <CheckCircle size={48} /><span className="text-2xl font-bold">10問チャレンジ</span>
        <span className="text-xs opacity-80 text-center font-bold">ミスしても最後まで練習</span>
      </button>
      <button onClick={() => startMode('oni')} className="z-10 flex-1 bg-gradient-to-br from-red-500 to-red-700 text-white rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center gap-2 active:scale-95 border-4 border-red-300">
        <Skull size={48} />
        <span className="text-2xl font-bold">鬼モード</span>
        <span className="text-xs opacity-80 text-center font-bold">桁数ランダム、音声早め</span>
      </button>
    </div>
  );

  const renderPlaying = () => {
    if (!region) return null;
    const config = REGION_CONFIGS[region];
    const currentSum = currentTray.reduce((a, b) => a + b, 0);

    return (
      <div className="flex flex-col h-full max-h-screen relative overflow-hidden">
        <DrinkStandBackground />
        <div className="relative z-10 bg-white/60 backdrop-blur-md px-3 py-2 text-sky-900 flex justify-between items-center shadow-sm shrink-0">
          <button onClick={() => setGameState('title')} className="p-1"><Home size={20} /></button>
          <div className="text-center">
            <div className="text-[10px] font-bold opacity-70 leading-none">{config.name}</div>
            <div className="text-lg font-black text-sky-600 leading-tight">
                {gameMode === 'survival' && `${questionCount}/50 問目`}{gameMode === 'challenge' && `${questionCount}/10 問目`}{gameMode === 'oni' && `鬼モード`}
            </div>
          </div>
          <div className="w-8"></div>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center z-10 p-2 min-h-0 relative">
          <div className="text-xs text-sky-700 font-bold mb-4 bg-white/60 px-3 py-1 rounded-full border border-sky-200 shadow-sm animate-pulse">店員さんをタップして聞く</div>
          <Shopkeeper speaking={isSpeaking} onClick={() => speakAmount(targetAmount)} />
          
          {feedback && (
            <div className="absolute inset-0 flex items-center justify-center bg-sky-900/40 z-50 p-4 backdrop-blur-sm">
              <div className="bg-white p-5 rounded-3xl flex flex-col items-center shadow-2xl w-full max-w-xs border-4 border-white animate-in zoom-in duration-200">
                {feedback === 'correct' ? (
                  <><CheckCircle size={48} className="text-green-500 mb-1"/><span className="text-2xl font-black text-green-600">{config.feedback.correct}</span></>
                ) : (
                  <><XCircle size={48} className="text-red-500 mb-1"/><span className="text-2xl font-black text-red-600">{config.feedback.wrong}</span><span className="text-xs text-gray-600 mt-1 font-bold">{feedbackMessage}</span></>
                )}
                <div className="mt-4 p-2 bg-sky-50 rounded-xl w-full text-center border-2 border-sky-100">
                  <span className="text-sky-500 text-[9px] font-bold uppercase">正解の金額</span>
                  <div className="text-xl font-black text-slate-800">{targetAmount} <span className="text-sm">{config.unit}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative z-20 bg-white rounded-t-[2.5rem] shadow-[0_-8px_20px_-5px_rgba(0,0,0,0.1)] flex flex-col shrink-0 border-t-4 border-sky-200 overflow-hidden">
          <div className="bg-slate-50 mx-4 mt-3 mb-1 h-16 rounded-xl border-2 border-dashed border-slate-200 relative overflow-hidden flex flex-wrap gap-1.5 p-2 content-start overflow-y-auto">
            {currentTray.map((val, idx) => (
              <Money 
                key={`tray-${idx}-${val}`} 
                value={val} 
                region={region} 
                size="sm" 
                onClick={() => removeFromTray(idx)}
              />
            ))}
            {currentTray.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-[10px] font-medium text-center px-4 italic">トレイのお金をタップして戻す</div>}
            {currentTray.length > 0 && (
              <button onClick={() => setCurrentTray([])} className="absolute bottom-1 right-1 bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full text-[9px] font-bold active:bg-slate-300">クリア</button>
            )}
          </div>

          <div className="px-5 py-1.5 flex justify-between items-center bg-white shrink-0">
             <div>
               <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">支払い合計</div>
               <div className="text-lg font-black text-slate-800 leading-none">{currentSum} <span className="text-xs font-bold text-slate-500">{config.unit}</span></div>
             </div>
             <button onClick={checkAnswer} disabled={feedback !== null || currentTray.length === 0} className={`px-5 py-2 rounded-full font-black shadow-lg transition-all text-xs ${feedback !== null || currentTray.length === 0 ? 'bg-slate-100 text-slate-300' : 'bg-yellow-400 text-yellow-900 active:scale-95'}`}>
              支払う
            </button>
          </div>

          <div className="bg-white px-3 pb-6 pt-1 flex flex-wrap justify-center gap-2 overflow-y-auto max-h-[180px]">
            {availableDenominations.map((val) => (
              <Money key={`denom-${val}`} value={val} region={region} size="md" onClick={() => addToTray(val)} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    const msg = getScoreMessage(score);
    return (
      <div className="flex flex-col h-full p-6 items-center justify-center relative overflow-y-auto">
        <DrinkStandBackground />
        <div className="relative z-10 flex flex-col items-center w-full">
          <Trophy size={64} className="text-yellow-400 mb-2" />
          <h2 className="text-3xl font-black text-sky-900 mb-4">結果発表</h2>
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-[2.5rem] shadow-xl w-full max-w-sm text-center mb-6 border-4 border-white relative">
            <div className="text-sky-500 font-black mb-1 text-xs uppercase tracking-widest">最終スコア</div>
            <div className="text-7xl font-black text-sky-600 mb-6 drop-shadow-sm">{score}</div>
            <div className="bg-sky-50 rounded-2xl p-5 border-2 border-sky-100 text-center">
              <p className="text-sky-800 font-black text-2xl mb-2 flex items-center justify-center gap-2">
                <Heart size={20} className="fill-red-400 text-red-400" /> {msg.phrase}
              </p>
              <p className="text-slate-600 text-xs font-bold leading-relaxed">{msg.text}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <button
              onClick={() => setGameState('title')}
              className="w-full px-6 py-4 bg-sky-500 text-white rounded-2xl font-black shadow-lg active:scale-95"
              >ホームに戻る
            </button>
          </div>
        </div>
      </div>
    );
  };



  return (
    <div className="w-full h-screen max-w-md mx-auto bg-sky-50 shadow-2xl overflow-hidden font-sans text-slate-800 flex flex-col relative border-x border-slate-200">
      {gameState === 'title' && renderTitle()}

      {gameState === 'title' && (
  <p className="absolute bottom-3 left-0 right-0 text-xs text-gray-500 text-center px-4">
    ※ 音が出ない場合は、Chrome や Safari などのブラウザで開いてください<br />
    ※iPhoneで中国語が他言語で流れる場合<br />
    「言語と地域」や「Siri」の設定に中国語を追加してください<br />
  </p>
)}

      {gameState === 'regionSelect' && renderRegionSelect()}
      {gameState === 'modeSelect' && renderModeSelect()}
      {gameState === 'ranking' && renderRanking()}
      {gameState === 'playing' && renderPlaying()}
      {gameState === 'result' && renderResult()}
      {gameState === 'info' && renderInfo()}
    </div>
  );
}  