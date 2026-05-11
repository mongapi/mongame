import React, { useState, useEffect } from 'react';
import { Text } from '@react-three/drei';
import Card3D from '../components/canvas3D/meshes/Card3D';
import RoomCanvas from '../components/canvas3D/scenes/RoomCanvas';
import { motion } from 'motion/react';
import { BrainCircuit, RotateCcw, MonitorPlay, MessageSquare } from 'lucide-react';

const CHARACTERS = [
  { id: 1, name: 'Albert Einstein', subject: 'Física', female: false, glasses: false, facialHair: true, century20: true, color: '#3b82f6' },
  { id: 2, name: 'Marie Curie', subject: 'Química', female: true, glasses: false, facialHair: false, century20: true, color: '#ec4899' },
  { id: 3, name: 'Isaac Newton', subject: 'Física', female: false, glasses: false, facialHair: false, century20: false, color: '#8b5cf6' },
  { id: 4, name: 'Charles Darwin', subject: 'Biología', female: false, glasses: false, facialHair: true, century20: false, color: '#10b981' },
  { id: 5, name: 'Ada Lovelace', subject: 'Informática', female: true, glasses: false, facialHair: false, century20: false, color: '#ec4899' },
  { id: 6, name: 'Galileo Galilei', subject: 'Astron.', female: false, glasses: false, facialHair: true, century20: false, color: '#f59e0b' },
  { id: 7, name: 'Pitágoras', subject: 'Matem.', female: false, glasses: false, facialHair: true, century20: false, color: '#f43f5e' },
  { id: 8, name: 'Rosalind Franklin', subject: 'Biología', female: true, glasses: false, facialHair: false, century20: true, color: '#10b981' },
  { id: 9, name: 'Nikola Tesla', subject: 'Física', female: false, glasses: false, facialHair: true, century20: true, color: '#3b82f6' },
  { id: 10, name: 'Stephen Hawking', subject: 'Física', female: false, glasses: true, facialHair: false, century20: true, color: '#8b5cf6' },
  { id: 11, name: 'Katherine J.', subject: 'Matem.', female: true, glasses: true, facialHair: false, century20: true, color: '#f43f5e' },
  { id: 12, name: 'Alan Turing', subject: 'Informática', female: false, glasses: false, facialHair: false, century20: true, color: '#8b5cf6' }
];

const QUESTIONS = [
  { id: 'q1', text: '👩‍🔬 ¿Es mujer?', attr: 'female', value: true },
  { id: 'q2', text: '👨‍🔬 ¿Es hombre?', attr: 'female', value: false },
  { id: 'q3', text: '👓 ¿Usa lentes/gafas?', attr: 'glasses', value: true },
  { id: 'q4', text: '🧔 ¿Tiene barba/bigote?', attr: 'facialHair', value: true },
  { id: 'q5', text: '🚀 ¿Es del siglo XX?', attr: 'century20', value: true },
  { id: 'q6', text: '📜 ¿Nació ANTES del siglo XX?', attr: 'century20', value: false },
  { id: 'q7', text: '🔭 ¿Se dedica a Física o Astron.?', attr: 'subject', customCheck: (char) => ['Física', 'Astron.'].includes(char.subject) },
  { id: 'q8', text: '💻 ¿Se dedica a Matem. o Info.?', attr: 'subject', customCheck: (char) => ['Matem.', 'Informática'].includes(char.subject) },
  { id: 'q9', text: '🧬 ¿Se dedica a Biología o Quím.?', attr: 'subject', customCheck: (char) => ['Biología', 'Química'].includes(char.subject) },
];

const INTER_FONT = "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf";

const CardFront = ({ char }) => (
  <mesh>
    <planeGeometry args={[2.2, 3.2]} />
    <meshStandardMaterial color={char.color} />
    <mesh position={[0, 0, 0.001]}>
       <planeGeometry args={[2.0, 3.0]} />
       <meshStandardMaterial color="#1e1b4b" opacity={0.7} transparent />
    </mesh>
    <Text position={[0, 0.4, 0.01]} fontSize={0.28} maxWidth={1.8} textAlign="center" color="white" anchorX="center" anchorY="middle" font={INTER_FONT}>
      {char.name}
    </Text>
    <Text position={[0, -0.4, 0.01]} fontSize={0.2} color="#a5b4fc" anchorX="center" anchorY="middle" font={INTER_FONT}>
      {char.subject}
    </Text>
  </mesh>
);

const CardBack = () => (
  <mesh>
    <planeGeometry args={[2.2, 3.2]} />
    <meshStandardMaterial color="#0f172a" />
    <Text position={[0, 0, 0.01]} fontSize={0.8} color="#334155" anchorX="center" anchorY="middle" font={INTER_FONT}>
      ?
    </Text>
  </mesh>
);

export default function AdivinaQue3D() {
  const [secretCharacter, setSecretCharacter] = useState(null);
  const [eliminatedIds, setEliminatedIds] = useState([]);
  const [message, setMessage] = useState("Iniciando conexión con la computadora analítica...");
  const [isWon, setIsWon] = useState(false);
  const [history, setHistory] = useState([]);
  
  const initGame = () => {
    const randomChar = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
    setSecretCharacter(randomChar);
    setEliminatedIds([]);
    setIsWon(false);
    setHistory([]);
    setMessage("Sistema listo. Selecciona una pregunta para deducir al personaje secreto.");
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleAsk = (question) => {
    if (isWon || !secretCharacter) return;
    
    const matchesSecret = question.customCheck 
       ? question.customCheck(secretCharacter) 
       : secretCharacter[question.attr] === question.value;

    const computerAnswer = matchesSecret ? "AFIRMATIVO" : "NEGATIVO";
    setMessage(`Análisis: ${question.text.split('¿')[1]} -> ${computerAnswer}`);
    
    setHistory(prev => [{ text: question.text, answer: matchesSecret }, ...prev]);
  };

  const handleCardFlip = (charId) => {
    if (isWon) return;
    
    setEliminatedIds(prev => {
        const isCurrentlyEliminated = prev.includes(charId);
        const nextEliminated = isCurrentlyEliminated 
            ? prev.filter(id => id !== charId)
            : [...prev, charId];
            
        // Check win condition
        const remaining = CHARACTERS.filter(c => !nextEliminated.includes(c.id));
        if (remaining.length === 1 && remaining[0].id === secretCharacter.id) {
            setIsWon(true);
            setMessage(`¡DEDUCCIÓN EXITOSA! El personaje secreto es ${secretCharacter.name}.`);
        }
        
        return nextEliminated;
    });
  };

  const getGridPosition = (index) => {
    const cols = 4;
    const col = index % cols;
    const row = Math.floor(index / cols);
    const spacingX = 2.6;
    const spacingY = 3.6;
    const startX = -((cols - 1) * spacingX) / 2;
    const startY = ((3 - 1) * spacingY) / 2;
    return [startX + col * spacingX, startY - row * spacingY, 0];
  };

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-white overflow-hidden font-sans">
      <header className="px-8 py-5 shrink-0 flex items-center justify-between border-b border-white/5 bg-zinc-900/80 backdrop-blur-md z-10 shadow-lg">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
               <BrainCircuit className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">
                    Adivina Qué 3D
                </h1>
                <p className="text-xs text-indigo-300/70 font-semibold uppercase tracking-widest mt-1">
                    Protocolo de Deducción
                </p>
            </div>
        </div>
        
        {isWon && (
            <motion.button 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={initGame}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/20 transition-all uppercase tracking-wider text-sm"
            >
                <RotateCcw className="w-4 h-4" />
                Jugar de Nuevo
            </motion.button>
        )}
      </header>

      <main className="flex-1 relative bg-gradient-to-b from-zinc-900 to-zinc-950">
          <RoomCanvas cameraPosition={[0, 0, 13]}>
              {CHARACTERS.map((char, index) => {
                  const pos = getGridPosition(index);
                  const isEliminated = eliminatedIds.includes(char.id);
                  return (
                      <Card3D
                          key={char.id}
                          position={pos}
                          front={<CardFront char={char} />}
                          back={<CardBack />}
                          isFlipped={isEliminated}
                          width={2.2}
                          height={3.2}
                          canFlipOnClick={!isWon}
                          onFlip={() => handleCardFlip(char.id)}
                          hoverEffect={!isWon}
                          flipSpeed={4}
                      />
                  );
              })}
          </RoomCanvas>
      </main>

      <footer className="h-[340px] bg-zinc-900/95 border-t border-white/5 shrink-0 flex items-stretch relative z-10 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex-1 p-6 flex flex-col border-r border-white/5">
              <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                      <MessageSquare className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-wide">PANEL DE INTERROGATORIO</h2>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-4 pb-4">
                  {QUESTIONS.map(q => {
                     const isAsked = history.some(h => h.text === q.text);
                     return (
                         <button
                             key={q.id}
                             onClick={() => handleAsk(q)}
                             disabled={isWon || isAsked || !secretCharacter}
                             className={`px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all duration-300 border shadow-sm ${
                                 isAsked 
                                 ? 'bg-zinc-800/30 border-zinc-700/30 text-zinc-600 cursor-not-allowed' 
                                 : 'bg-zinc-800 border-zinc-700 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:shadow-[0_4px_20px_rgba(99,102,241,0.15)] text-zinc-300 hover:text-indigo-200 hover:-translate-y-0.5'
                             }`}
                         >
                             {q.text}
                         </button>
                     );
                  })}
              </div>
          </div>
          
          <div className="w-[450px] bg-black/40 p-6 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />
              
              <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <MonitorPlay className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-wide">TERMINAL CENTRAL</h2>
              </div>

              <motion.div 
                  key={message}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-xl border mb-5 shadow-lg relative overflow-hidden ${
                      isWon ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  }`}
              >
                  {isWon && <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />}
                  <p className="font-mono text-sm leading-relaxed relative z-10 font-medium">{message}</p>
              </motion.div>

              <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-2">
                  {history.map((h, i) => (
                      <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          key={i} 
                          className="flex items-center justify-between bg-zinc-800/40 border border-white/5 px-4 py-3 rounded-xl shadow-sm"
                      >
                          <span className="text-sm text-zinc-300 font-medium truncate pr-4">{h.text}</span>
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-md tracking-wider ${h.answer ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                              {h.answer ? 'AFIRMATIVO' : 'NEGATIVO'}
                          </span>
                      </motion.div>
                  ))}
              </div>
          </div>
      </footer>
    </div>
  );
}
