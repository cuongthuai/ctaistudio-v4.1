
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { BackIcon } from './icons/ChatIcons';

// --- ICONS ---
const MusicIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
  </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

const PauseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const SkipBackIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const SkipForwardIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const ShuffleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
  </svg>
);

const RepeatIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12.75l-3-3m0 0l3-3m-3 3h7.5" transform="rotate(-90 12 12)" />
  </svg>
);

const SpeakerIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  );

const MicIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.172a2 2 0 00.586 1.414l2.828 2.828a2 2 0 002.828 0l2.828-2.828A2 2 0 0015 4.172V3a1 1 0 10-2 0v1.172a.5.5 0 01-.146.354l-2.828 2.828a.5.5 0 01-.708 0L6.464 4.526A.5.5 0 016 4.172V3a1 1 0 00-1-1zm10 4a1 1 0 00-1 1v6.828a2 2 0 00.586 1.414l2.828 2.828a2 2 0 002.828 0l2.828-2.828A2 2 0 0021 13.828V7a1 1 0 10-2 0v6.828a.5.5 0 01-.146.354l-2.828 2.828a.5.5 0 01-.708 0L12.464 14.18A.5.5 0 0112 13.828V7a1 1 0 00-1-1zM2 5a1 1 0 00-1 1v6.828a2 2 0 00.586 1.414l2.828 2.828a2 2 0 002.828 0l2.828-2.828A2 2 0 0011 13.828V7a1 1 0 10-2 0v6.828a.5.5 0 01-.146.354l-2.828 2.828a.5.5 0 01-.708 0L2.464 14.18A.5.5 0 012 13.828V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

// --- TYPES ---
interface Track {
  id: string;
  title: string;
  lyrics: string;
  style: string;
  duration: number; // in seconds
  audioUrl: string | null;
  imageUrl: string;
  createdAt: Date;
  status: 'generating' | 'completed' | 'error';
}

// --- HELPER FUNCTIONS ---

// Convert raw PCM base64 string to WAV Blob URL
const pcmToWavBlobUrl = (base64PCM: string, sampleRate: number = 24000, numChannels: number = 1): string => {
    const binaryString = atob(base64PCM);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // WAV Header Construction
    const buffer = new ArrayBuffer(44 + len);
    const view = new DataView(buffer);

    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // file length
    view.setUint32(4, 36 + len, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // format chunk identifier
    writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true);
    // channel count
    view.setUint16(22, numChannels, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sampleRate * blockAlign)
    view.setUint32(28, sampleRate * 2 * numChannels, true); // 2 bytes per sample (16-bit)
    // block align (channel count * bytes per sample)
    view.setUint16(32, numChannels * 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, len, true);

    // Write PCM data
    const pcmData = new Uint8Array(buffer, 44);
    pcmData.set(bytes);

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
};

const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
};

const PromptGeneratorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (prompt: string) => void;
}> = ({ isOpen, onClose, onGenerate }) => {
    const [topic, setTopic] = useState('');
    const [emotion, setEmotion] = useState('');
    const [reference, setReference] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleOptimize = async () => {
        if (!topic && !emotion && !reference) return;
        
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `Bạn là một chuyên gia sản xuất âm nhạc và kỹ sư prompt cho AI (như MusicFX, Lyria). Nhiệm vụ của bạn là tạo ra một prompt mô tả âm nhạc chuyên nghiệp, tối ưu để đưa vào các công cụ tạo nhạc AI.

            **Dữ liệu đầu vào:**
            - Chủ đề: ${topic}
            - Cảm xúc: ${emotion}
            - Phong cách/Tham khảo: ${reference}

            **Yêu cầu đầu ra:**
            Hãy viết một đoạn prompt hoàn chỉnh (2-5 câu) bằng Tiếng Việt, bao gồm đầy đủ các yếu tố sau:
            1. Thể loại nhạc (Pop, Ballad, EDM, Lo-fi, v.v.)
            2. Cảm xúc chính (Buồn, vui, hào hứng, v.v.)
            3. Nhịp độ / BPM (ước lượng cụ thể)
            4. Nhạc cụ chủ đạo (Piano, Guitar, Synth, v.v.)
            5. Không khí (Atmosphere/Mood)
            6. Mô tả chi tiết giai điệu hoặc cấu trúc (nếu cần).

            **Ví dụ output mong muốn:**
            "Tạo bản ballad nhẹ nhàng, cảm xúc buồn và cô đơn, tempo khoảng 70–80 BPM. Piano giữ vai trò chủ đạo, kèm string nền êm và synth nhẹ. Giai điệu mang màu sắc đêm mưa, u buồn nhưng sâu lắng."
            
            Chỉ trả về nội dung prompt, không thêm lời dẫn.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ parts: [{ text: "Tạo prompt nhạc tối ưu." }] }],
                config: { systemInstruction: systemInstruction }
            });

            onGenerate(response.text.trim());
            onClose();
        } catch (error) {
            console.error("Prompt optimization failed", error);
            alert("Không thể tạo prompt. Vui lòng thử lại.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
                    <CloseIcon className="w-6 h-6" />
                </button>
                
                <div className="flex items-center gap-2 mb-6">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                        <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Music Prompt Generator</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Chủ đề bài nhạc</label>
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="VD: Đêm mưa, Chuyến đi mùa hè..."
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[var(--accent-color)] focus:ring-0 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Cảm xúc</label>
                        <input 
                            type="text" 
                            value={emotion}
                            onChange={(e) => setEmotion(e.target.value)}
                            placeholder="VD: Buồn, Hoài niệm, Hào hứng..."
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[var(--accent-color)] focus:ring-0 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Phong cách / Tham khảo</label>
                        <input 
                            type="text" 
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="VD: Lo-fi chill, Son Tung M-TP style..."
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-[var(--accent-color)] focus:ring-0 outline-none transition-colors"
                        />
                    </div>

                    <button 
                        onClick={handleOptimize}
                        disabled={isGenerating || (!topic && !emotion && !reference)}
                        className="w-full mt-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Đang tối ưu...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-4 h-4" /> Tạo Prompt tối ưu
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT ---
interface MusicGenerationToolProps { onBack: () => void; }

const MusicGenerationTool: React.FC<MusicGenerationToolProps> = ({ onBack }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  
  // Input states
  const [creationMode, setCreationMode] = useState<'simple' | 'custom'>('custom');
  const [lyrics, setLyrics] = useState('');
  const [style, setStyle] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [vocalGender, setVocalGender] = useState<'female' | 'male'>('female');
  
  // Prompt Generator State
  const [isPromptGeneratorOpen, setIsPromptGeneratorOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateRandomLyrics = async () => {
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: "Write a short, catchy song chorus (4-6 lines) about a futuristic city. Just the lyrics."
          });
          setLyrics(response.text);
      } catch (e) {
          console.error("Lyrics generation failed", e);
      }
  };
  
  const handlePromptGenerated = (generatedPrompt: string) => {
      if (creationMode === 'simple') {
          setDescription(generatedPrompt);
      } else {
          setStyle(generatedPrompt);
      }
  };

  const handleCreate = async () => {
    const inputPrompt = creationMode === 'simple' ? description : lyrics;
    if (!inputPrompt.trim() && !isInstrumental) {
      alert("Please enter lyrics or description.");
      return;
    }

    const newTrackId = Date.now().toString();
    const displayTitle = title || (creationMode === 'simple' ? (description.slice(0, 20) + '...') : (lyrics.slice(0, 20) + '...'));
    
    const newTrack: Track = {
      id: newTrackId,
      title: displayTitle,
      lyrics: creationMode === 'simple' ? description : lyrics,
      style: style || 'AI Generated',
      duration: 0,
      audioUrl: null,
      imageUrl: 'https://via.placeholder.com/150?text=Generating...',
      createdAt: new Date(),
      status: 'generating'
    };

    setTracks(prev => [newTrack, ...prev]);
    setIsGenerating(true);

    // 1. Generate Audio (TTS as Fallback for Song Generation)
    const generateAudio = async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Select voice based on gender preference
        const voiceName = vocalGender === 'male' ? 'Fenrir' : 'Kore';
        const ttsPrompt = isInstrumental ? " [Instrumental Melodic Interlude] " : inputPrompt;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: ttsPrompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } },
            },
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    };

    // 2. Generate Cover Art
    const generateCover = async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const imagePrompt = `Album cover art for a song about: ${inputPrompt}. Style: ${style || 'abstract artistic'}. High quality, 1:1 aspect ratio.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: [{ parts: [{ text: imagePrompt }] }],
            config: { responseModalities: [Modality.IMAGE] },
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    };

    try {
        const [audioData, imageData] = await Promise.all([generateAudio(), generateCover()]);

        let audioUrl = null;
        let imageUrl = 'https://via.placeholder.com/150?text=Error';

        if (audioData) {
            audioUrl = pcmToWavBlobUrl(audioData);
        }
        
        if (imageData) {
            imageUrl = `data:image/png;base64,${imageData}`;
        }

        setTracks(prev => prev.map(t => {
            if (t.id === newTrackId) {
                return {
                    ...t,
                    status: 'completed',
                    audioUrl: audioUrl,
                    imageUrl: imageUrl,
                };
            }
            return t;
        }));

    } catch (error) {
        console.error("Generation error:", error);
        setTracks(prev => prev.map(t => t.id === newTrackId ? { ...t, status: 'error' } : t));
    } finally {
        setIsGenerating(false);
    }
  };

  const handlePlay = (track: Track) => {
    if (currentTrackId === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentTrackId(track.id);
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
      if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
      }
  };

  const handleLoadedMetadata = () => {
      if (audioRef.current) {
          setDuration(audioRef.current.duration);
          // Update track duration in list
          if (currentTrackId) {
              setTracks(prev => prev.map(t => t.id === currentTrackId ? {...t, duration: audioRef.current!.duration} : t));
          }
      }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = parseFloat(e.target.value);
      if (audioRef.current) {
          audioRef.current.currentTime = time;
          setCurrentTime(time);
      }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      if (audioRef.current) {
          audioRef.current.volume = newVolume;
      }
  };

  // Auto-play effect
  useEffect(() => {
    if (currentTrackId && isPlaying && audioRef.current) {
        const track = tracks.find(t => t.id === currentTrackId);
        if (track?.audioUrl && audioRef.current.src !== track.audioUrl) {
            audioRef.current.src = track.audioUrl;
            audioRef.current.play().catch(e => console.error("Play error:", e));
        } else if (audioRef.current.paused) {
            audioRef.current.play().catch(e => console.error("Play error:", e));
        }
    }
  }, [currentTrackId, isPlaying]);

  const currentTrack = tracks.find(t => t.id === currentTrackId);

  return (
    <div className="w-full h-full flex flex-col animate-fade-in bg-[#101010] text-white overflow-hidden font-sans">
        {/* HEADER */}
        <header className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md flex-shrink-0 h-16 z-20">
            <div className="flex items-center gap-3">
                <div className="bg-[var(--accent-color)] p-1.5 rounded-md">
                    <MusicIcon className="w-5 h-5 text-black" />
                </div>
                <h1 className="text-lg font-bold tracking-wide">AI Music Creation</h1>
                <span className="text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full ml-2">Suno v5</span>
            </div>
            <button onClick={onBack} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors">
                <BackIcon className="h-4 w-4" /> Back
            </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
            {/* LEFT SIDEBAR - CREATION */}
            <aside className="w-full md:w-[380px] lg:w-[420px] bg-[#121212] border-r border-zinc-800 flex flex-col overflow-y-auto flex-shrink-0 z-10 custom-scrollbar">
                <div className="p-6">
                    {/* Mode Switcher */}
                    <div className="flex bg-zinc-800/50 p-1 rounded-full mb-6 w-full relative">
                        <div 
                            className={`absolute top-1 bottom-1 rounded-full bg-zinc-700 shadow-sm transition-all duration-300`}
                            style={{ left: creationMode === 'simple' ? '4px' : '50%', width: 'calc(50% - 4px)' }}
                        />
                        <button onClick={() => setCreationMode('simple')} className={`flex-1 py-1.5 rounded-full text-sm font-medium z-10 transition-colors ${creationMode === 'simple' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}>Simple</button>
                        <button onClick={() => setCreationMode('custom')} className={`flex-1 py-1.5 rounded-full text-sm font-medium z-10 transition-colors ${creationMode === 'custom' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}>Custom</button>
                    </div>

                    <div className="space-y-6">
                        {creationMode === 'simple' ? (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Song Description</label>
                                    <button onClick={() => setIsPromptGeneratorOpen(true)} className="text-[10px] flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 px-2 py-1 rounded text-white transition-colors">
                                        <SparklesIcon className="w-3 h-3" /> Magic Prompt
                                    </button>
                                </div>
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="A relaxing acoustic song about rain in Tokyo..." 
                                    className="w-full h-32 bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-sm text-zinc-100 focus:border-[var(--accent-color)] focus:ring-0 outline-none resize-none placeholder-zinc-600 leading-relaxed transition-colors"
                                />
                            </div>
                        ) : (
                            <>
                                {/* Lyrics Input */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Lyrics</label>
                                        <button onClick={generateRandomLyrics} className="text-[10px] flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-zinc-300 transition-colors">
                                            <span className="text-[var(--accent-color)]">✨</span> Generate Lyrics
                                        </button>
                                    </div>
                                    <textarea 
                                        value={lyrics}
                                        onChange={(e) => setLyrics(e.target.value)}
                                        placeholder="Enter your own lyrics..." 
                                        className="w-full h-40 bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-sm text-zinc-100 focus:border-[var(--accent-color)] focus:ring-0 outline-none resize-none placeholder-zinc-600 font-mono leading-relaxed transition-colors"
                                        disabled={isInstrumental}
                                    />
                                    
                                    <div className="flex flex-col gap-4 mt-4">
                                        {/* Instrumental Toggle */}
                                        <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-xl border border-zinc-800/50">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <MusicIcon className="w-4 h-4 text-zinc-400" />
                                                <span className="text-sm font-medium text-zinc-300">Instrumental</span>
                                            </label>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" checked={isInstrumental} onChange={(e) => setIsInstrumental(e.target.checked)} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-color)]"></div>
                                            </label>
                                        </div>

                                        {/* Vocal Gender Selection */}
                                        <div className={`flex items-center justify-between p-3 bg-zinc-800/30 rounded-xl border border-zinc-800/50 transition-opacity ${isInstrumental ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                            <label className="flex items-center gap-2">
                                                <MicIcon className="w-4 h-4 text-zinc-400" />
                                                <span className="text-sm font-medium text-zinc-300">Vocal Voice</span>
                                            </label>
                                            <div className="flex bg-zinc-900 rounded-lg p-1">
                                                <button 
                                                    onClick={() => setVocalGender('female')} 
                                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${vocalGender === 'female' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                >
                                                    Female
                                                </button>
                                                <button 
                                                    onClick={() => setVocalGender('male')} 
                                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${vocalGender === 'male' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                >
                                                    Male
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Style Input */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Style of Music</label>
                                        <button onClick={() => setIsPromptGeneratorOpen(true)} className="text-[10px] flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 px-2 py-1 rounded text-white transition-colors">
                                            <SparklesIcon className="w-3 h-3" /> Magic Prompt
                                        </button>
                                    </div>
                                    <textarea 
                                        value={style}
                                        onChange={(e) => setStyle(e.target.value)}
                                        placeholder="Enter style (e.g., 'upbeat pop', 'lofi hip hop')..." 
                                        className="w-full h-20 bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-sm text-zinc-100 focus:border-[var(--accent-color)] focus:ring-0 outline-none resize-none placeholder-zinc-600 transition-colors"
                                    />
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {['Electronic', 'Pop', 'Rock', 'Jazz', 'Lofi', 'Ambient'].map(tag => (
                                            <button 
                                                key={tag}
                                                onClick={() => setStyle(prev => prev ? `${prev}, ${tag}` : tag)}
                                                className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Title Input */}
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Title (Optional)</label>
                                    <input 
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter a title..." 
                                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:border-[var(--accent-color)] focus:ring-0 outline-none placeholder-zinc-600 transition-colors"
                                    />
                                </div>
                            </>
                        )}

                        {/* Create Button */}
                        <div className="pt-2">
                            <button 
                                onClick={handleCreate}
                                disabled={isGenerating}
                                className="w-full py-3.5 bg-[var(--accent-color)] hover:bg-yellow-300 text-black font-bold rounded-xl transition-all shadow-lg hover:shadow-[var(--accent-color)]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <span className="text-lg">🎵</span> Create
                                    </>
                                )}
                            </button>
                            <div className="flex justify-between text-xs text-zinc-500 mt-3 px-1">
                                <span>Credits remaining: 50</span>
                                <span>v5</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* RIGHT AREA - LIBRARY */}
            <main className="flex-1 bg-[#0a0a0a] flex flex-col min-w-0">
                {/* Top Bar */}
                <div className="px-8 py-6 border-b border-zinc-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-1">
                            <span>Workspaces</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            <span className="text-zinc-300">My Workspace</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Library</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search songs..." 
                                className="bg-zinc-900 border border-zinc-800 rounded-full py-2 px-4 pl-10 text-sm text-zinc-300 focus:border-zinc-600 outline-none w-64 transition-colors"
                            />
                            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Track List */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                    {tracks.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-6">
                            <div className="w-32 h-32 rounded-full bg-zinc-900 flex items-center justify-center relative group">
                                <div className="absolute inset-0 bg-[var(--accent-color)]/10 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                <MusicIcon className="w-12 h-12 opacity-20" />
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-medium text-zinc-300">No songs created yet</p>
                                <p className="text-sm mt-2 max-w-xs mx-auto text-zinc-500">Enter a prompt or lyrics in the sidebar to start creating music with AI.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {tracks.map((track) => (
                                <div 
                                    key={track.id} 
                                    className={`group flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-900 transition-colors cursor-pointer border ${currentTrackId === track.id ? 'bg-zinc-900 border-zinc-700' : 'border-transparent border-b-zinc-900'}`}
                                    onClick={() => handlePlay(track)}
                                >
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800 shadow-lg">
                                        <img src={track.imageUrl} alt={track.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 ${currentTrackId === track.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity backdrop-blur-[1px]`}>
                                            {currentTrackId === track.id && isPlaying ? (
                                                <div className="flex gap-1 items-end h-5">
                                                    <div className="w-1 bg-white animate-[bounce_1s_infinite] h-2"></div>
                                                    <div className="w-1 bg-white animate-[bounce_1.2s_infinite] h-5"></div>
                                                    <div className="w-1 bg-white animate-[bounce_0.8s_infinite] h-3"></div>
                                                </div>
                                            ) : (
                                                <PlayIcon className="w-8 h-8 text-white drop-shadow-lg pl-1" />
                                            )}
                                        </div>
                                        {track.status === 'generating' && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 py-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`font-bold text-base sm:text-lg truncate ${currentTrackId === track.id ? 'text-[var(--accent-color)]' : 'text-white'}`}>{track.title}</h3>
                                            {track.status === 'generating' && <span className="text-[10px] bg-blue-900/50 text-blue-200 px-2 py-0.5 rounded border border-blue-800 animate-pulse">Generating...</span>}
                                            {track.status === 'error' && <span className="text-[10px] bg-red-900/50 text-red-200 px-2 py-0.5 rounded border border-red-800">Error</span>}
                                        </div>
                                        <p className="text-sm text-zinc-400 line-clamp-2 mb-1">{track.lyrics || track.style}</p>
                                        <div className="flex items-center gap-2">
                                            {track.style && <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{track.style.split(',')[0]}</span>}
                                            <span className="text-xs text-zinc-600">v5</span>
                                        </div>
                                    </div>

                                    <div className="text-zinc-500 text-sm font-mono hidden sm:block pr-4">
                                        {formatTime(track.duration)}
                                    </div>

                                    <div className="flex items-center gap-2 pr-2">
                                        <button 
                                            className="p-2.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                            onClick={(e) => { e.stopPropagation(); /* Like logic */ }}
                                            title="Like"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                        </button>
                                        <button 
                                            className="p-2.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                            onClick={(e) => { e.stopPropagation(); if(track.audioUrl) { const a = document.createElement('a'); a.href=track.audioUrl; a.download=`${track.title}.wav`; a.click(); } }}
                                            title="Download"
                                        >
                                            <DownloadIcon className="w-5 h-5" />
                                        </button>
                                        <button className="p-2.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>

        {/* PLAYER BAR */}
        <footer className="h-24 bg-[#121212] border-t border-zinc-800 flex flex-col justify-center relative z-20 px-4 sm:px-6 shadow-2xl">
            {/* Audio Element */}
            <audio 
                ref={audioRef} 
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className="hidden" 
            />

            <div className="flex items-center justify-between gap-4 h-full">
                {/* Left: Track Info */}
                <div className="flex items-center gap-4 w-1/4 min-w-[200px]">
                    {currentTrack ? (
                        <>
                            <div className="w-14 h-14 rounded-md bg-zinc-800 overflow-hidden flex-shrink-0 shadow-md relative group">
                                <img src={currentTrack.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 hidden group-hover:block"></div>
                            </div>
                            <div className="min-w-0 overflow-hidden">
                                <h4 className="font-bold text-white truncate text-sm">{currentTrack.title}</h4>
                                <p className="text-xs text-zinc-400 truncate">{currentTrack.lyrics ? 'Lyrics' : 'Instrumental'}</p>
                            </div>
                            <button className="text-zinc-400 hover:text-red-500 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg></button>
                        </>
                    ) : (
                        <div className="flex items-center gap-3 opacity-50">
                            <div className="w-14 h-14 rounded-md bg-zinc-800"></div>
                            <div className="text-xs text-zinc-500">Select a track to play</div>
                        </div>
                    )}
                </div>

                {/* Center: Controls */}
                <div className="flex flex-col items-center justify-center gap-1 flex-1 max-w-xl">
                    <div className="flex items-center gap-6">
                        <button className="text-zinc-500 hover:text-white transition-colors" title="Shuffle"><ShuffleIcon className="w-4 h-4" /></button>
                        <button className="text-zinc-400 hover:text-white transition-colors" title="Previous"><SkipBackIcon className="w-5 h-5" /></button>
                        <button 
                            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                            onClick={() => { if (currentTrackId) setIsPlaying(!isPlaying); }}
                        >
                            {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5 pl-0.5" />}
                        </button>
                        <button className="text-zinc-400 hover:text-white transition-colors" title="Next"><SkipForwardIcon className="w-5 h-5" /></button>
                        <button className="text-zinc-500 hover:text-white transition-colors" title="Repeat"><RepeatIcon className="w-4 h-4" /></button>
                    </div>
                    
                    <div className="w-full flex items-center gap-3 text-xs text-zinc-500 font-mono select-none">
                        <span className="w-8 text-right">{formatTime(currentTime)}</span>
                        <div className="flex-1 h-1 bg-zinc-800 rounded-full relative group cursor-pointer">
                            <input 
                                type="range" 
                                min="0" 
                                max={duration || 100} 
                                value={currentTime} 
                                onChange={handleSeek}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div 
                                className="absolute top-0 left-0 h-full bg-[var(--accent-color)] rounded-full pointer-events-none" 
                                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                            ></div>
                            <div 
                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                                style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
                            ></div>
                        </div>
                        <span className="w-8">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Right: Volume & Extras */}
                <div className="w-1/4 min-w-[150px] flex justify-end items-center gap-4">
                    <div className="flex items-center gap-2 group">
                        <SpeakerIcon className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                        <div className="w-24 h-1 bg-zinc-800 rounded-full relative cursor-pointer">
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.01" 
                                value={volume} 
                                onChange={handleVolumeChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div 
                                className="absolute top-0 left-0 h-full bg-zinc-500 group-hover:bg-white rounded-full transition-colors pointer-events-none" 
                                style={{ width: `${volume * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
        
        <PromptGeneratorModal 
            isOpen={isPromptGeneratorOpen}
            onClose={() => setIsPromptGeneratorOpen(false)}
            onGenerate={handlePromptGenerated}
        />
    </div>
  );
};

export default MusicGenerationTool;
