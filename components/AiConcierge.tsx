import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Mic, MicOff, X, Sparkles, Volume2, Waveform, Loader2, Bot, Radio } from 'lucide-react';
import { Match } from '../types';

// Audio decoding helper as per guidelines
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encodeBase64(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// --- CONTEXT GENERATOR (RAG) ---
const generateMatchContext = (matches: Match[]) => {
  const live = matches.filter(m => m.isLive);
  const upcoming = matches.filter(m => !m.isLive && m.isPopular).slice(0, 5);
  
  if (live.length === 0 && upcoming.length === 0) return "There are no major matches right now.";

  let context = "REAL-TIME DATA FEED:\n";
  
  if (live.length > 0) {
    context += "LIVE MATCHES:\n";
    live.forEach(m => {
        const homeOdds = m.odds.main.find(o => o.label === '1')?.value || 'N/A';
        const awayOdds = m.odds.main.find(o => o.label === '2')?.value || 'N/A';
        context += `- ${m.homeTeam.name} vs ${m.awayTeam.name}: SCORE ${m.scores?.home}-${m.scores?.away} (Min: ${m.minute}). Odds: Home ${homeOdds}, Away ${awayOdds}.\n`;
    });
  }

  if (upcoming.length > 0) {
    context += "\nUPCOMING HIGHLIGHTS:\n";
    upcoming.forEach(m => {
        context += `- ${m.homeTeam.name} vs ${m.awayTeam.name} @ ${m.startTime.toLocaleTimeString()}.\n`;
    });
  }

  return context;
};

interface AiConciergeProps {
  isOpen: boolean;
  onClose: () => void;
  matches: Match[]; // Injected Data
}

const AiConcierge: React.FC<AiConciergeProps> = ({ isOpen, onClose, matches }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState('');
  const nextStartTime = useRef(0);
  const audioCtx = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sources = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    setIsConnecting(true);
    
    // Generate context from the actual app state
    const matchContext = generateMatchContext(matches);
    console.log("AI Context Loaded:", matchContext.length, "chars");

    // Robust API Key Access
    const env = (import.meta as any).env || {};
    const apiKey = env.VITE_API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : undefined);

    if (!apiKey) {
       console.error("Missing Gemini API Key");
       setIsConnecting(false);
       return;
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const inputCtx = new AudioContext({ sampleRate: 16000 });
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        // INJECTING RAG DATA HERE
        systemInstruction: `
          You are the NXB Betting Concierge. You are helpful, energetic, and concise.
          
          HERE IS THE CURRENT LIVE MATCH DATA. USE THIS TO ANSWER QUESTIONS:
          ${matchContext}

          Rules:
          1. If asked about a score, use the data above.
          2. If asked for a tip, find a team with good odds in the data or suggest a favorite.
          3. Keep answers under 2 sentences unless asked for analysis.
          4. Do not mention "internal data", just speak naturally like a sportscaster.
        `,
        inputAudioTranscription: {},
        outputAudioTranscription: {}
      },
      callbacks: {
        onopen: () => {
          setIsConnecting(false);
          setIsActive(true);
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            sessionPromise.then(s => s.sendRealtimeInput({ 
              media: { data: encodeBase64(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
            }));
          };
          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onmessage: async (msg: LiveServerMessage) => {
          if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
            const audioData = decodeBase64(msg.serverContent.modelTurn.parts[0].inlineData.data);
            const buffer = await decodeAudioData(audioData, audioCtx.current!, 24000, 1);
            const source = audioCtx.current!.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx.current!.destination);
            nextStartTime.current = Math.max(nextStartTime.current, audioCtx.current!.currentTime);
            source.start(nextStartTime.current);
            nextStartTime.current += buffer.duration;
            sources.current.add(source);
          }
          if (msg.serverContent?.inputTranscription) {
            setTranscription(msg.serverContent.inputTranscription.text);
          }
        },
        onclose: () => {
          setIsActive(false);
          onClose();
        },
        onerror: () => setIsConnecting(false)
      }
    });

    sessionRef.current = await sessionPromise;
  };

  const endSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    sources.current.forEach(s => s.stop());
    setIsActive(false);
    onClose();
  };

  if (!isOpen) return null;

  const liveCount = matches.filter(m => m.isLive).length;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative">
        
        {/* Header Background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-500/10 to-transparent"></div>

        <div className="p-8 text-center relative z-10">
          <div className="relative w-24 h-24 mx-auto mb-6">
            {/* Ripples */}
            <div className={`absolute inset-0 bg-emerald-500/20 rounded-full ${isActive ? 'animate-ping' : ''}`}></div>
            <div className={`absolute inset-[-8px] bg-emerald-500/10 rounded-full ${isActive ? 'animate-pulse' : ''}`}></div>
            
            {/* Main Circle */}
            <div className={`relative w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-xl ring-4 ring-white dark:ring-slate-900 transition-all duration-500 ${isActive ? 'scale-110' : 'scale-100'}`}>
              {isConnecting ? <Loader2 className="animate-spin" size={40} /> : <Bot size={40} />}
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 italic tracking-tight">AI Concierge</h2>
          
          <div className="flex items-center justify-center gap-2 mb-8">
             <div className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <Radio size={12} className={liveCount > 0 ? "text-emerald-500 animate-pulse" : "text-slate-400"} />
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                    {liveCount} Live Matches Connected
                </span>
             </div>
          </div>

          <div className="h-16 flex items-center justify-center mb-6">
            {isActive ? (
              <div className="flex gap-1.5 items-center h-10">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="w-1.5 bg-emerald-500 rounded-full animate-music" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            ) : transcription ? (
               <p className="text-slate-600 dark:text-slate-300 italic text-sm animate-in slide-in-from-bottom-2">"{transcription}"</p>
            ) : (
               <p className="text-slate-400 text-sm">Tap "Start Voice" to ask about odds or scores.</p>
            )}
          </div>

          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 transition-all">
              CLOSE
            </button>
            {!isActive ? (
              <button onClick={startSession} className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 group">
                <Mic size={20} className="group-hover:scale-110 transition-transform" /> START VOICE
              </button>
            ) : (
              <button onClick={endSession} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-500 transition-all">
                END SESSION
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiConcierge;