
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';

// --- ICONS ---
const UploadCloudIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const UserPlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const FileTextIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const MonitorPlayIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

const FilmIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5M18 18.375v-5.25m0 0v-5.25m0 0h-1.5" />
  </svg>
);

const MusicIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
  </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
);

const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const dataUrlToPart = (dataUrl: string) => {
    const [header, base64Data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1];
    if (!mimeType || !base64Data) throw new Error("Invalid data URL");
    return { inlineData: { mimeType, data: base64Data } };
};

interface Scene {
    id: number;
    description: string;
    prompt: string;
    videoUrl?: string;
    isLoading?: boolean;
    error?: string;
}

const Ctaivid: React.FC = () => {
  const [activeCharTab, setActiveCharTab] = useState<'upload' | 'generate'>('upload');
  
  // State for Step 1: Backgrounds
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  
  // State for Step 2: Character
  const [charImage, setCharImage] = useState<string | null>(null);
  const [charPrompt, setCharPrompt] = useState('');
  const [isCharLoading, setIsCharLoading] = useState(false);

  // State for Step 3: Script
  const [videoIdea, setVideoIdea] = useState('');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isScriptLoading, setIsScriptLoading] = useState(false);

  // State for Step 5: Preview
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);

  const bgInputRef = useRef<HTMLInputElement>(null);
  const charInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          Array.from(e.target.files).forEach(file => {
              const reader = new FileReader();
              reader.onloadend = () => setBackgroundImages(prev => [...prev, reader.result as string]);
              reader.readAsDataURL(file as Blob);
          });
      }
  };

  const handleRemoveBg = (index: number) => {
      setBackgroundImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCharUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setCharImage(reader.result as string);
          reader.readAsDataURL(file);
      }
  };

  const handleGenerateCharacter = async () => {
      if (!charPrompt.trim()) return alert("Vui lòng nhập mô tả nhân vật.");
      setIsCharLoading(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: { parts: [{ text: `Tạo hình ảnh nhân vật: ${charPrompt}. Nhân vật toàn thân, tách biệt nền (nền trắng hoặc đơn sắc), chi tiết sắc nét, chất lượng cao 8k.` }] },
              config: { responseModalities: [Modality.IMAGE] }
          });
          const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
          if (part?.inlineData) {
              setCharImage(`data:image/png;base64,${part.inlineData.data}`);
          }
      } catch (e) {
          console.error(e);
          alert("Lỗi tạo nhân vật.");
      } finally {
          setIsCharLoading(false);
      }
  };

  const handleGenerateScript = async () => {
      if (!videoIdea.trim()) return alert("Vui lòng nhập ý tưởng video.");
      setIsScriptLoading(true);
      setScenes([]);
      
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          
          // Context from uploads
          let prompt = `Bạn là một đạo diễn video AI chuyên nghiệp. Dựa trên ý tưởng: "${videoIdea}", hãy viết một kịch bản phân cảnh (storyboard) gồm 3-5 cảnh ngắn để tạo video quảng cáo hoặc phim ngắn.
          
          Nếu có ảnh bối cảnh và nhân vật, hãy lồng ghép chúng vào kịch bản.
          - Có ${backgroundImages.length} ảnh bối cảnh.
          - ${charImage ? 'Có 1 nhân vật chính.' : 'Chưa có nhân vật cụ thể.'}

          Trả về kết quả dưới dạng JSON array, mỗi phần tử là một cảnh với cấu trúc:
          {
            "description": "Mô tả ngắn gọn nội dung cảnh bằng tiếng Việt",
            "prompt": "Prompt tiếng Anh chi tiết dùng để tạo video bằng AI (Veo/Sora), mô tả hành động, ánh sáng, góc máy (cinematic, 8k, photorealistic...)"
          }
          `;
          
          const parts: any[] = [{ text: prompt }];
          if (charImage) parts.push(dataUrlToPart(charImage));
          // Add first 3 backgrounds to context to avoid token limit if too many
          backgroundImages.slice(0, 3).forEach(bg => parts.push(dataUrlToPart(bg)));

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: { parts },
              config: { 
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.ARRAY,
                      items: {
                          type: Type.OBJECT,
                          properties: {
                              description: { type: Type.STRING },
                              prompt: { type: Type.STRING }
                          },
                          required: ["description", "prompt"]
                      }
                  }
               }
          });

          const scriptData = JSON.parse(response.text);
          setScenes(scriptData.map((s: any, i: number) => ({ id: i, description: s.description, prompt: s.prompt })));

      } catch (e) {
          console.error(e);
          alert("Lỗi tạo kịch bản.");
      } finally {
          setIsScriptLoading(false);
      }
  };

  const handleGenerateVideoClip = async (sceneId: number) => {
      const scene = scenes.find(s => s.id === sceneId);
      if (!scene) return;

      setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, isLoading: true, error: undefined } : s));

      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          // Use Veo model
          let operation = await ai.models.generateVideos({
              model: 'veo-3.1-fast-generate-preview',
              prompt: scene.prompt,
              config: {
                  numberOfVideos: 1,
                  resolution: '720p',
                  aspectRatio: '16:9'
              }
          });

          // Polling loop
          while (!operation.done) {
              await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
              operation = await ai.operations.getVideosOperation({ operation: operation });
          }

           const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (!downloadLink) throw new Error("Không có link video.");

            const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            const videoBlob = await videoResponse.blob();
            const videoUrl = URL.createObjectURL(videoBlob as any);

            setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, isLoading: false, videoUrl } : s));

      } catch (e: any) {
          console.error(e);
          setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, isLoading: false, error: e.message || "Lỗi tạo video" } : s));
      }
  };

  return (
    <div className="animate-fade-in w-full h-full flex flex-col text-zinc-200">
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-y-auto pb-20">
        
        {/* Left Column (Inputs) */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          
          {/* 1. Background Upload */}
          <div className="bg-white/5 dark:bg-zinc-800/40 backdrop-blur-md border border-zinc-700 rounded-xl p-4 flex flex-col shadow-lg min-h-[200px]">
            <h3 className="text-white font-bold text-base mb-3">1. Tải ảnh bối cảnh</h3>
            {backgroundImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 mb-3 overflow-y-auto max-h-40">
                    {backgroundImages.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square">
                            <img src={img} alt="bg" className="w-full h-full object-cover rounded-md" />
                            <button onClick={() => handleRemoveBg(idx)} className="absolute top-0 right-0 bg-red-500 p-1 rounded-bl-md text-white opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="w-3 h-3"/></button>
                        </div>
                    ))}
                    <div onClick={() => bgInputRef.current?.click()} className="flex items-center justify-center border border-dashed border-zinc-600 rounded-md cursor-pointer hover:bg-zinc-700/50"><UploadCloudIcon className="w-6 h-6 text-zinc-500"/></div>
                </div>
            ) : (
                <div onClick={() => bgInputRef.current?.click()} className="flex-1 border-2 border-dashed border-zinc-600 rounded-lg bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-500 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[100px] group">
                    <UploadCloudIcon className="w-10 h-10 text-zinc-500 group-hover:text-cyan-400 mb-2 transition-colors" />
                    <p className="text-sm text-zinc-400">Kéo thả hoặc nhấp để tải ảnh lên</p>
                </div>
            )}
            <input type="file" multiple accept="image/*" ref={bgInputRef} className="hidden" onChange={handleBackgroundUpload} />
            <button onClick={() => bgInputRef.current?.click()} className="mt-3 w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 rounded-lg transition-colors text-sm shadow-lg shadow-cyan-500/20">
              Chọn ảnh ({backgroundImages.length}/20)
            </button>
          </div>

          {/* 2. Add Character */}
          <div className="bg-white/5 dark:bg-zinc-800/40 backdrop-blur-md border border-zinc-700 rounded-xl p-4 flex flex-col shadow-lg">
            <h3 className="text-white font-bold text-base mb-3">2. Thêm nhân vật (Tùy chọn)</h3>
            
            <div className="flex border-b border-zinc-700 mb-4">
              <button onClick={() => setActiveCharTab('upload')} className={`flex-1 pb-2 text-sm font-medium transition-colors relative ${activeCharTab === 'upload' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Tải lên {activeCharTab === 'upload' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500"></span>}</button>
              <button onClick={() => setActiveCharTab('generate')} className={`flex-1 pb-2 text-sm font-medium transition-colors relative ${activeCharTab === 'generate' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Tạo nhân vật {activeCharTab === 'generate' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500"></span>}</button>
            </div>

            {charImage ? (
                <div className="relative group mb-3">
                    <img src={charImage} alt="Character" className="w-full h-40 object-contain bg-black/20 rounded-lg" />
                    <button onClick={() => setCharImage(null)} className="absolute top-2 right-2 bg-red-500 p-1 rounded-full text-white"><TrashIcon className="w-4 h-4"/></button>
                </div>
            ) : activeCharTab === 'upload' ? (
                <div onClick={() => charInputRef.current?.click()} className="h-32 border-2 border-dashed border-zinc-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-zinc-500 mb-3">
                    <UserPlusIcon className="w-8 h-8 text-zinc-500 mb-2"/>
                    <span className="text-xs text-zinc-500">Chọn ảnh nhân vật</span>
                    <input type="file" accept="image/*" ref={charInputRef} className="hidden" onChange={handleCharUpload} />
                </div>
            ) : (
                <div className="mb-3 space-y-2">
                    <textarea value={charPrompt} onChange={e => setCharPrompt(e.target.value)} placeholder="Mô tả nhân vật (VD: Một nữ chiến binh robot...)" className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-200 focus:border-red-500 outline-none resize-none" rows={3} />
                    <button onClick={handleGenerateCharacter} disabled={isCharLoading} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg text-xs font-bold disabled:opacity-50">{isCharLoading ? 'Đang tạo...' : 'Tạo AI'}</button>
                </div>
            )}
          </div>

          {/* 3. Script Generation */}
          <div className="bg-white/5 dark:bg-zinc-800/40 backdrop-blur-md border border-zinc-700 rounded-xl p-4 shadow-lg">
            <h3 className="text-white font-bold text-base mb-3">3. Tạo Kịch bản</h3>
            <textarea value={videoIdea} onChange={e => setVideoIdea(e.target.value)} placeholder="Nhập ý tưởng video của bạn vào đây..." className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-200 focus:border-red-500 outline-none resize-none mb-3" rows={3} />
            <button onClick={handleGenerateScript} disabled={isScriptLoading} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors text-sm disabled:bg-zinc-600 disabled:cursor-wait flex justify-center items-center gap-2">
              {isScriptLoading ? <Spinner /> : <FileTextIcon className="w-5 h-5" />}
              {isScriptLoading ? 'Đang viết kịch bản...' : 'Tạo kịch bản & prompts'}
            </button>
          </div>

        </div>

        {/* Right Column (Output & Timeline) */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full">
            
            {/* 4. Video Clips Preview */}
            <div className="bg-white/5 dark:bg-zinc-800/40 backdrop-blur-md border border-zinc-700 rounded-xl p-4 shadow-lg flex-1 min-h-[300px] flex flex-col">
                <h3 className="text-white font-bold text-base mb-3">4. Tạo Video Clips</h3>
                
                {scenes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[500px]">
                        {scenes.map((scene) => (
                            <div key={scene.id} className="bg-zinc-900/50 border border-zinc-700/50 rounded-lg p-3 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-red-400 uppercase">Cảnh {scene.id + 1}</span>
                                </div>
                                <p className="text-sm text-zinc-300 line-clamp-2" title={scene.description}>{scene.description}</p>
                                
                                {scene.videoUrl ? (
                                    <div className="relative group cursor-pointer" onClick={() => setPreviewVideo(scene.videoUrl!)}>
                                        <video src={scene.videoUrl} className="w-full h-32 object-cover rounded-md bg-black" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <PlayIcon className="w-10 h-10 text-white drop-shadow-lg"/>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-32 bg-black/20 rounded-md flex items-center justify-center border border-dashed border-zinc-700">
                                        {scene.isLoading ? (
                                            <div className="flex flex-col items-center text-xs text-zinc-400">
                                                <Spinner />
                                                <span className="mt-2">Đang quay (Veo 2)...</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-zinc-500">Chưa có video</span>
                                        )}
                                    </div>
                                )}

                                <div className="mt-auto">
                                    <button 
                                        onClick={() => handleGenerateVideoClip(scene.id)}
                                        disabled={scene.isLoading || !!scene.videoUrl}
                                        className={`w-full py-2 rounded-md text-xs font-bold transition-colors ${scene.videoUrl ? 'bg-green-600/20 text-green-400 cursor-default' : 'bg-zinc-700 hover:bg-zinc-600 text-white'}`}
                                    >
                                        {scene.videoUrl ? 'Đã tạo xong' : (scene.isLoading ? 'Đang xử lý...' : 'Tạo Video Clip')}
                                    </button>
                                    {scene.error && <p className="text-xs text-red-500 mt-1">{scene.error}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 bg-zinc-900/50 border border-zinc-700/50 rounded-lg flex flex-col items-center justify-center text-zinc-500 gap-3 p-8">
                        <MonitorPlayIcon className="w-12 h-12 opacity-50" />
                        <p className="text-sm">Tạo kịch bản ở bước 3 để xem các phân cảnh tại đây.</p>
                    </div>
                )}
            </div>

            {/* 5. Timeline & Editing */}
            <div className="bg-white/5 dark:bg-zinc-800/40 backdrop-blur-md border border-zinc-700 rounded-xl p-4 shadow-lg flex-1 flex flex-col min-h-[300px]">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-white font-bold text-base">5. Xem trước & Chỉnh sửa</h3>
                     <button className="bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold py-1.5 px-4 rounded-md transition-colors border border-zinc-600">
                        Ghép & Xuất Video
                     </button>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                    {/* Preview Area */}
                    <div className="flex-1 bg-black/80 rounded-lg flex items-center justify-center overflow-hidden relative min-h-[200px]">
                        {previewVideo ? (
                            <video src={previewVideo} controls autoPlay className="w-full h-full object-contain" />
                        ) : (
                            <p className="text-xs text-zinc-500">Chọn một clip bên trên để xem trước.</p>
                        )}
                    </div>

                    {/* Video Track */}
                    <div className="h-24 bg-zinc-900/50 border border-zinc-700 rounded-lg flex items-center p-2 gap-2 overflow-x-auto">
                        <div className="flex-shrink-0 w-8 flex justify-center"><FilmIcon className="w-5 h-5 text-zinc-600" /></div>
                        {scenes.filter(s => s.videoUrl).map((scene, idx) => (
                            <div key={idx} className="h-full aspect-video bg-zinc-800 rounded overflow-hidden relative cursor-pointer border border-zinc-600 hover:border-yellow-400" onClick={() => setPreviewVideo(scene.videoUrl!)}>
                                <video src={scene.videoUrl} className="w-full h-full object-cover" />
                                <span className="absolute bottom-1 left-1 bg-black/60 text-[10px] text-white px-1 rounded">Cảnh {scene.id + 1}</span>
                            </div>
                        ))}
                        {scenes.filter(s => s.videoUrl).length === 0 && <p className="text-xs text-zinc-500 w-full text-center">Chưa có clip nào được tạo.</p>}
                    </div>

                    {/* Audio Track (Placeholder) */}
                    <div className="h-12 bg-zinc-900/50 border border-zinc-700 rounded-lg flex items-center gap-2 px-2 hover:border-zinc-600 transition-colors cursor-pointer">
                        <MusicIcon className="w-5 h-5 text-zinc-600" />
                        <p className="text-xs text-zinc-500">Kéo và thả file âm thanh vào đây (Tính năng đang phát triển)</p>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Ctaivid;
