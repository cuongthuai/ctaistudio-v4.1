
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { BackIcon } from './icons/ChatIcons';

// --- ICONS ---
const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-500 mb-2 group-hover:text-[var(--accent-color)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);
const VideoCameraIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" />
    </svg>
);
const PlaceholderIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const TrashIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);
const ErrorIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const CopyIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);
const CheckIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>);
const SendIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);
const ClockIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const LOADING_MESSAGES = [
    "Đang khởi tạo quá trình tạo video...",
    "Đang khởi động mô hình AI, có thể mất một chút thời gian...",
    "Đang phân tích nội dung và ảnh tham chiếu của bạn...",
    "Đang kết xuất các khung hình đầu tiên...",
    "Quá trình này có thể mất vài phút. Vui lòng đợi.",
    "Đang ghép các phân đoạn video...",
    "Thêm các chỉnh sửa cuối cùng...",
    "Sắp xong, đang chuẩn bị video của bạn...",
];

const LoadingState: React.FC<{title?: string}> = ({ title = "Đang tạo Video..." }) => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % LOADING_MESSAGES.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div role="status" className="flex flex-col items-center text-center text-zinc-500 dark:text-zinc-400">
            <svg aria-hidden="true" className="w-12 h-12 mb-4 text-zinc-200 dark:text-zinc-600 animate-spin fill-[var(--accent-color)]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-300">{title}</h2>
            <p className="mt-2 max-w-xs transition-opacity duration-500">{LOADING_MESSAGES[messageIndex]}</p>
        </div>
    );
};

const dataUrlToPart = (dataUrl: string) => {
    const [header, base64Data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1];
    if (!mimeType || !base64Data) throw new Error("Invalid data URL");
    return { inlineData: { mimeType, data: base64Data } };
};

interface DirectorScript {
    id: number;
    title: string;
    script: string;
    isLoading?: boolean;
    videoUrl?: string | null;
    error?: string | null;
}

interface MotionImageToolProps { onBack: () => void; }

const MotionImageTool: React.FC<MotionImageToolProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'generate' | 'director'>('generate');
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isTimelapse, setIsTimelapse] = useState(false);
    
    // Director AI state
    const [directorImage, setDirectorImage] = useState<string | null>(null);
    const [directorResults, setDirectorResults] = useState<DirectorScript[]>([]);
    const [copiedScriptId, setCopiedScriptId] = useState<number | null>(null);
    
    useEffect(() => {
        if (activeTab === 'generate') {
            setDirectorResults([]);
        } else {
            setGeneratedVideoUrl(null);
        }
        setError(null);
    }, [activeTab]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReferenceImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
     const handleDirectorFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDirectorImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const generateVideo = async () => {
        if (!prompt && !referenceImage) {
            setError('Vui lòng cung cấp nội dung hoặc ảnh tham chiếu.');
            return;
        }
    
        setIsLoading(true);
        setError(null);
        setGeneratedVideoUrl(null);
    
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
            let finalPrompt = prompt;
            if (isTimelapse) {
                 finalPrompt = `Cinematic construction timelapse of: ${prompt}. Show the building process from ground up, fast motion, time-lapse style, hyperrealistic, 8k resolution.`;
            }

            const payload: any = {
                model: 'veo-3.1-fast-generate-preview',
                prompt: finalPrompt,
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatio
                }
            };
    
            if (referenceImage) {
                const [header, base64Data] = referenceImage.split(',');
                const mimeType = header.match(/:(.*?);/)?.[1];
                payload.image = {
                    imageBytes: base64Data,
                    mimeType: mimeType || 'image/png'
                };
            }
    
            let operation = await ai.models.generateVideos(payload);
            
            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000)); 
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }
    
            if (operation.error) {
                throw new Error(operation.error.message);
            }
    
            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (!downloadLink) {
                throw new Error("Tạo video thành công nhưng không có liên kết tải xuống.");
            }

            const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            if (!videoResponse.ok) {
                const errorBody = await videoResponse.text();
                throw new Error(`Tải video thất bại: ${videoResponse.statusText} - ${errorBody}`);
            }

            const videoBlob = await videoResponse.blob();
            const videoUrl = URL.createObjectURL(videoBlob);
            setGeneratedVideoUrl(videoUrl);
    
        } catch (e: any) {
            console.error(e);
            let errorMessage = `Đã xảy ra lỗi: ${e.message}`;
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDirectorAI = async () => {
        if (!prompt || !directorImage) {
            setError('Vui lòng cung cấp ý tưởng và hình ảnh tham khảo.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setDirectorResults([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const directorPromptText = `Bạn là một đạo diễn AI chuyên nghiệp. Dựa trên ý tưởng video sau: "${prompt}", và hình ảnh được cung cấp, hãy phát triển thành 20 kịch bản video chi tiết và sáng tạo. Mỗi kịch bản phải có tiêu đề và nội dung chi tiết.

Trả về kết quả dưới dạng một mảng JSON. Mỗi đối tượng trong mảng phải có hai khóa: "title" (string, một tiêu đề ngắn gọn cho kịch bản) và "script" (string, nội dung chi tiết của kịch bản, bao gồm phân cảnh, mô tả hình ảnh, âm thanh).`;
            
            const imagePart = dataUrlToPart(directorImage);
            const textPart = { text: directorPromptText };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                script: { type: Type.STRING },
                            },
                            required: ["title", "script"],
                        },
                    },
                },
            });

            const scriptsFromAI = JSON.parse(response.text);
            if (Array.isArray(scriptsFromAI)) {
                const newScripts: DirectorScript[] = scriptsFromAI.map((s, index) => ({
                    id: index,
                    title: s.title,
                    script: s.script,
                }));
                setDirectorResults(newScripts);
            } else {
                throw new Error("AI không trả về định dạng mảng JSON hợp lệ.");
            }

        } catch (e: any) {
            console.error(e);
            let errorMessage = `Đã xảy ra lỗi: ${e.message}`;
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateVideoFromScript = async (scriptId: number, scriptText: string) => {
        setDirectorResults(prev => prev.map(s => s.id === scriptId ? { ...s, isLoading: true, error: null, videoUrl: null } : s));
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const payload: any = {
                model: 'veo-3.1-fast-generate-preview',
                prompt: scriptText,
                config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio }
            };

            if (directorImage) {
                const [header, base64Data] = directorImage.split(',');
                const mimeType = header.match(/:(.*?);/)?.[1];
                payload.image = { imageBytes: base64Data, mimeType: mimeType || 'image/png' };
            }
            
            let operation = await ai.models.generateVideos(payload);
            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            if (operation.error) { throw new Error(operation.error.message); }
            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (!downloadLink) { throw new Error("Không có link tải video."); }

            const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            if (!videoResponse.ok) { throw new Error(`Tải video thất bại: ${videoResponse.statusText}`); }

            const videoBlob = await videoResponse.blob();
            const videoUrl = URL.createObjectURL(videoBlob);
            
            setDirectorResults(prev => prev.map(s => s.id === scriptId ? { ...s, isLoading: false, videoUrl: videoUrl } : s));

        } catch (e: any) {
            console.error(e);
            let errorMessage = e.message;
            setDirectorResults(prev => prev.map(s => s.id === scriptId ? { ...s, isLoading: false, error: errorMessage } : s));
        }
    };


    return (
        <div className="w-full h-full flex flex-col animate-fade-in bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <VideoCameraIcon className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
                    <h1 className="text-xl font-bold text-black dark:text-white">Tạo Video</h1>
                    <span className="text-xs font-bold bg-[var(--accent-color)] text-black px-2 py-0.5 rounded-full">VEO 2</span>
                </div>
                <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" aria-label="Quay lại">
                    <BackIcon className="h-5 w-5" />
                    <span>Quay lại</span>
                </button>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
                <>
                    <aside className="p-6 flex flex-col overflow-y-auto bg-gray-50 dark:bg-zinc-800/50 border-r border-gray-200 dark:border-zinc-800">
                        <div className="flex bg-gray-200 dark:bg-zinc-700/50 p-1 rounded-lg mb-6">
                            <button onClick={() => setActiveTab('generate')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${activeTab === 'generate' ? 'bg-[var(--accent-color)] text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>Tạo Video</button>
                            <button onClick={() => setActiveTab('director')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${activeTab === 'director' ? 'bg-[var(--accent-color)] text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>DirectorAI (biên tập)</button>
                        </div>

                        <div className="space-y-6">
                            <section>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                        {activeTab === 'generate' ? 'Nội dung' : 'Ý tưởng Video'}
                                    </label>
                                    {activeTab === 'generate' && (
                                            <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="timelapse-mode"
                                                checked={isTimelapse}
                                                onChange={(e) => setIsTimelapse(e.target.checked)}
                                                className="w-4 h-4 text-[var(--accent-color)] bg-gray-100 border-gray-300 rounded focus:ring-[var(--accent-color)] dark:focus:ring-[var(--accent-color)] dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600 accent-[var(--accent-color)]"
                                            />
                                            <label htmlFor="timelapse-mode" className="text-xs font-bold text-[var(--accent-color)] cursor-pointer select-none flex items-center gap-1">
                                                <ClockIcon className="w-3 h-3" /> Timelapse Xây dựng
                                            </label>
                                        </div>
                                    )}
                                </div>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={isTimelapse ? "VD: Quá trình xây dựng một biệt thự hiện đại ven biển từ móng đến hoàn thiện..." : (activeTab === 'generate' ? "VD: Một con sư tử oai vệ gầm trên mỏm đá lúc hoàng hôn" : "VD: Tạo một video quảng cáo ngắn cho một quán cà phê mới mở.")}
                                    rows={4}
                                    className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 p-3 rounded-lg border-2 border-gray-300 dark:border-zinc-700 focus:border-[var(--accent-color)] focus:ring-0 outline-none transition-colors text-sm"
                                />
                            </section>
                            
                            {activeTab === 'generate' && (
                                <>
                                    <section>
                                        <label className="block text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">Tỷ lệ khung hình</label>
                                        <div className="flex bg-gray-200 dark:bg-zinc-700/50 p-1 rounded-lg">
                                            <button onClick={() => setAspectRatio('16:9')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${aspectRatio === '16:9' ? 'bg-[var(--accent-color)] text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>16:9 Ngang</button>
                                            <button onClick={() => setAspectRatio('9:16')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${aspectRatio === '9:16' ? 'bg-[var(--accent-color)] text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>9:16 Dọc</button>
                                        </div>
                                    </section>
                                    <section>
                                        <label className="block text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">Ảnh tham chiếu (Tùy chọn)</label>
                                        {referenceImage ? (
                                            <div className="relative group">
                                                <img src={referenceImage} alt="Reference" className="w-full h-auto max-h-60 object-contain rounded-lg bg-gray-100 dark:bg-zinc-900 p-2" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button onClick={() => setReferenceImage(null)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors" title="Xóa ảnh">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="relative aspect-video bg-gray-100 dark:bg-zinc-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-700 flex flex-col items-center justify-center text-center transition-colors hover:border-[var(--accent-color)] group cursor-pointer">
                                                <UploadIcon />
                                                <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">Nhấn để tải lên hoặc kéo và thả</p>
                                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                            </label>
                                        )}
                                        {isTimelapse && <p className="text-xs text-zinc-500 mt-2 italic">Mẹo: Với chế độ Timelapse, hãy sử dụng ảnh hiện trạng đất trống hoặc mô tả chi tiết công trình để có kết quả tốt nhất.</p>}
                                    </section>
                                </>
                            )}
                            {activeTab === 'director' && (
                                <>
                                    <section>
                                        <label className="block text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">Ảnh tham khảo</label>
                                        {directorImage ? (
                                            <div className="relative group">
                                                <img src={directorImage} alt="Reference for Director AI" className="w-full h-auto max-h-60 object-contain rounded-lg bg-gray-100 dark:bg-zinc-900 p-2" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button onClick={() => setDirectorImage(null)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors" title="Xóa ảnh">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="relative aspect-video bg-gray-100 dark:bg-zinc-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-700 flex flex-col items-center justify-center text-center transition-colors hover:border-[var(--accent-color)] group cursor-pointer">
                                                <UploadIcon />
                                                <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">Tải ảnh tham khảo cho kịch bản</p>
                                                <input type="file" className="hidden" onChange={handleDirectorFileChange} accept="image/*" />
                                            </label>
                                        )}
                                    </section>
                                    <div className="mt-4">
                                        <button onClick={handleDirectorAI} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors" disabled={isLoading || !prompt.trim() || !directorImage}>
                                            {isLoading ? 'Đang phân tích...' : 'Phân tích & Phát triển'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        <footer className="mt-auto pt-6">
                            {activeTab === 'generate' && (
                                <button onClick={generateVideo} className="w-full bg-[var(--accent-color)] text-black font-bold py-3 px-10 rounded-lg hover:brightness-95 transition-colors text-base shadow-lg hover:shadow-[var(--accent-color)]/20 disabled:bg-zinc-600 disabled:cursor-not-allowed" disabled={isLoading}>
                                    {isLoading ? 'Đang tạo...' : 'Tạo Video'}
                                </button>
                            )}
                        </footer>
                    </aside>
                    
                    <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gray-100 dark:bg-zinc-900/80 overflow-hidden">
                        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider self-start">KẾT QUẢ</h2>
                        <div className="w-full flex-1 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700/50 shadow-inner overflow-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full"><LoadingState title={activeTab === 'director' ? 'Đang tạo 20 kịch bản...' : 'Đang tạo Video...'} /></div>
                            ) : error ? (
                                <div className="text-center text-red-500 flex flex-col items-center justify-center h-full p-4">
                                    <ErrorIcon />
                                    <h3 className="text-xl font-semibold">Thao tác Thất bại</h3>
                                    <p className="mt-1 max-w-md text-sm">{error}</p>
                                </div>
                            ) : activeTab === 'director' ? (
                                directorResults.length > 0 ? (
                                    <div className="p-4 space-y-4">
                                        {directorResults.map(script => (
                                            <div key={script.id} className="bg-gray-50 dark:bg-zinc-700/50 p-4 rounded-lg">
                                                <h4 className="font-bold text-yellow-500 dark:text-yellow-400">{script.title}</h4>
                                                <p className="text-xs text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap mt-2">{script.script}</p>
                                                <div className="flex items-center flex-wrap gap-2 mt-4">
                                                    <button onClick={() => { setCopiedScriptId(script.id); navigator.clipboard.writeText(script.script); setTimeout(() => setCopiedScriptId(null), 2000); }} className="flex items-center gap-1 text-xs font-semibold bg-gray-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200 px-2.5 py-1 rounded-full hover:bg-gray-300 dark:hover:bg-zinc-500 transition-colors">
                                                        {copiedScriptId === script.id ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4"/>}
                                                        {copiedScriptId === script.id ? 'Đã chép' : 'Sao chép'}
                                                    </button>
                                                    <button onClick={() => { setPrompt(script.script); setActiveTab('generate'); }} className="flex items-center gap-1 text-xs font-semibold bg-gray-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200 px-2.5 py-1 rounded-full hover:bg-gray-300 dark:hover:bg-zinc-500 transition-colors">
                                                        <SendIcon className="w-4 h-4"/> Chuyển về mô tả
                                                    </button>
                                                    <button onClick={() => handleGenerateVideoFromScript(script.id, script.script)} disabled={script.isLoading} className="flex items-center gap-1 text-xs font-semibold bg-[var(--accent-color)] text-black px-2.5 py-1 rounded-full hover:brightness-95 transition-colors disabled:bg-zinc-500 disabled:cursor-not-allowed">
                                                        <VideoCameraIcon className="w-4 h-4"/> Tạo video
                                                    </button>
                                                </div>
                                                {script.isLoading && <div className="mt-3"><LoadingState title="Đang tạo video từ kịch bản..."/></div>}
                                                {script.error && <p className="mt-3 text-xs text-red-500">{script.error}</p>}
                                                {script.videoUrl && <video src={script.videoUrl} controls autoPlay loop className="mt-3 w-full rounded-md" />}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-center text-zinc-500 p-4">
                                        <p>Kịch bản được tạo sẽ xuất hiện ở đây.</p>
                                    </div>
                                )
                            ) : generatedVideoUrl ? (
                                <div className="flex items-center justify-center h-full">
                                    <video src={generatedVideoUrl} controls autoPlay loop className="max-w-full max-h-full object-contain rounded-md" />
                                </div>
                            ) : (
                                <div className="text-center text-zinc-500 flex flex-col items-center justify-center h-full p-4">
                                    <PlaceholderIcon />
                                    <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">Video được tạo sẽ xuất hiện ở đây.</h3>
                                </div>
                            )}
                        </div>
                    </main>
                </>
            </div>
        </div>
    );
};

export default MotionImageTool;
