import React, { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

// --- ICONS ---
const CloseIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const UploadIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-500 group-hover:text-yellow-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>);
const PlaceholderIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-zinc-500 dark:text-zinc-600 my-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const ErrorIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const ZoomIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.086V3a1 1 0 112 0v8.086l1.293-1.379a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const SendToInputIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>;
const ReplaceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;

const LoadingAtom = () => (
    <div className="relative w-32 h-32 filter drop-shadow-[0_0_8px_rgba(139,92,246,0.7)]">
        <svg className="absolute w-full h-full animate-[spin_4s_linear_infinite]" viewBox="0 0 100 100" style={{ filter: 'blur(1.5px)' }}>
            <ellipse cx="50" cy="50" rx="40" ry="20" stroke="url(#grad1)" strokeWidth="3" fill="none" transform="rotate(45 50 50)" />
        </svg>
        <svg className="absolute w-full h-full animate-[spin_5s_linear_infinite_reverse]" viewBox="0 0 100 100" style={{ filter: 'blur(1.5px)' }}>
            <ellipse cx="50" cy="50" rx="40" ry="20" stroke="url(#grad2)" strokeWidth="3" fill="none" transform="rotate(-45 50 50)" />
        </svg>
        <svg className="absolute w-full h-full animate-[spin_6s_linear_infinite]" viewBox="0 0 100 100" style={{ filter: 'blur(1.5px)' }}>
            <ellipse cx="50" cy="50" rx="30" ry="30" stroke="url(#grad1)" strokeWidth="3" fill="none" />
        </svg>
        <svg className="absolute w-full h-full" style={{width: 0, height: 0}}>
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#c084fc', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#f472b6', stopOpacity: 1}} />
                </linearGradient>
                <linearGradient id="grad2" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#67e8f9', stopOpacity: 1}} />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

const LoadingOverlay: React.FC<{onCancel: () => void; message: string;}> = ({ onCancel, message }) => (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 z-10 animate-fade-in">
        <LoadingAtom />
        <p className="text-white font-semibold animate-pulse">{message}</p>
        <button 
            onClick={onCancel}
            className="absolute bottom-4 right-4 w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
            aria-label="Hủy"
        >
            <CloseIcon className="w-5 h-5" />
        </button>
    </div>
);

const ImageUploadArea: React.FC<{ onImageUpdate: (dataUrl: string) => void; label: string }> = ({ onImageUpdate, label }) => {
    const handleFileRead = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => onImageUpdate(reader.result as string);
        reader.readAsDataURL(file);
    }, [onImageUpdate]);

    return (
        <div className="relative w-full h-full bg-gray-100 dark:bg-zinc-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-700 flex flex-col items-center justify-center text-center transition-colors hover:border-yellow-400 group cursor-pointer">
            <UploadIcon />
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mt-2">{label}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">hoặc <span className="text-yellow-400 font-semibold">nhấn vào đây</span></p>
            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label={label} onChange={(e) => e.target.files && handleFileRead(e.target.files[0])} accept="image/png, image/jpeg, image/webp" />
        </div>
    );
};

interface AIUpscaleToolProps { onBack: () => void; }

const AIUpscaleTool: React.FC<AIUpscaleToolProps> = ({ onBack }) => {
    const [inputImage, setInputImage] = useState<string | null>(null);
    const [outputImage, setOutputImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOutputZoomed, setIsOutputZoomed] = useState(false);
    const [upscaleProgress, setUpscaleProgress] = useState<{ current: number; total: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isCancelled = useRef(false);

    const handleImageUpdate = useCallback((dataUrl: string) => {
        setInputImage(dataUrl);
        setOutputImage(null);
        setError(null);
    }, []);

    const clearInputImage = () => {
        setInputImage(null);
        setOutputImage(null);
        setError(null);
    };
    
    const handleCancel = () => {
        isCancelled.current = true;
        setIsLoading(false);
        setUpscaleProgress(null);
        setError("Quá trình nâng cấp đã bị hủy.");
    };

    const handleApiError = (e: any): string => {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'Lỗi không xác định';
        
        const lowerCaseError = errorMessage.toLowerCase();
        if (lowerCaseError.includes('api key not valid') || 
            lowerCaseError.includes('api key is invalid') ||
            lowerCaseError.includes('api key has expired')) {
            return 'API Key không hợp lệ hoặc đã hết hạn. Vui lòng vào mục "Cài đặt" để kiểm tra và cập nhật API Key của bạn.';
        }
        
        return `Đã xảy ra lỗi: ${errorMessage}.`;
    };

    const dataUrlToPart = (dataUrl: string) => {
        const [header, base64Data] = dataUrl.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1];
        if (!mimeType || !base64Data) throw new Error("Invalid data URL");
        return { inlineData: { mimeType, data: base64Data } };
    };
    
    const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.onerror = (err) => reject(new Error("Không thể tải ảnh để lấy kích thước."));
            img.src = dataUrl;
        });
    };

    const handleGenerate = async (mode: 'standard' | 'ultra') => {
        if (!inputImage) {
            setError('Vui lòng tải lên một ảnh để nâng cấp.');
            return;
        }
    
        setIsLoading(true);
        isCancelled.current = false;
        setError(null);
        setOutputImage(null);
        
        if (mode === 'standard') {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const promptText = "Enhance and upscale this image to 4x its size, targeting 4K resolution with improved clarity.";
                const imagePart = dataUrlToPart(inputImage);
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [imagePart, { text: promptText }] },
                    config: { responseModalities: [Modality.IMAGE] },
                });
                
                if (isCancelled.current) return;

                const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                if (part?.inlineData) {
                    setOutputImage(`data:image/png;base64,${part.inlineData.data}`);
                } else {
                    throw new Error("AI không trả về hình ảnh hợp lệ.");
                }
            } catch (e) {
                if (isCancelled.current) return;
                setError(handleApiError(e));
            } finally {
                if (!isCancelled.current) setIsLoading(false);
            }
            return;
        }

        // Detailed 'ultra' mode with two-phase process
        const MAX_REIMAGINE_STEPS = 4;
        const FINAL_RESTORE_STEP = 1;
        const TOTAL_STEPS = MAX_REIMAGINE_STEPS + FINAL_RESTORE_STEP;
        const TARGET_RESOLUTION_EDGE = 3840;
        let currentImage = inputImage;
        let lastSuccessfulImage = inputImage;
    
        const reimaginePrompt = "Reimagine this photo with ultra-clear details and upscale it towards 4K resolution (3840px).";
        const restorePrompt = "Restore and enhance this photograph to a final 4K resolution (3840px on the longest side) by improving clarity, sharpness, and image quality while preserving all original details, colors, and composition exactly as they appear - remove noise, blur, and degradation artifacts to create a professionally restored version that maintains complete authenticity without any artistic interpretation or alterations.";

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
            // Phase 1: Iterative Reimagine/Upscale
            for (let i = 1; i <= MAX_REIMAGINE_STEPS; i++) {
                if (isCancelled.current) return;
                setUpscaleProgress({ current: i, total: TOTAL_STEPS });
    
                const { width, height } = await getImageDimensions(currentImage);
                if (Math.max(width, height) >= TARGET_RESOLUTION_EDGE) break;
    
                const imagePart = dataUrlToPart(currentImage);
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [imagePart, { text: reimaginePrompt }] },
                    config: { responseModalities: [Modality.IMAGE] },
                });
                
                if (isCancelled.current) return;
    
                const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                if (part?.inlineData) {
                    const newImage = `data:image/png;base64,${part.inlineData.data}`;
                    currentImage = newImage;
                    lastSuccessfulImage = newImage;
                } else {
                    throw new Error(`AI không trả về hình ảnh hợp lệ ở bước ${i}.`);
                }
            }
            
            // Phase 2: Final Restoration
            if (isCancelled.current) return;
            setUpscaleProgress({ current: TOTAL_STEPS, total: TOTAL_STEPS });
            const imagePartForRestore = dataUrlToPart(currentImage);
            const restoreResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [imagePartForRestore, { text: restorePrompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });
             
            if (isCancelled.current) return;
            const restorePart = restoreResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (restorePart?.inlineData) {
                const finalImage = `data:image/png;base64,${restorePart.inlineData.data}`;
                setOutputImage(finalImage);
                lastSuccessfulImage = finalImage;
            } else {
                throw new Error('AI thất bại trong bước phục hồi cuối cùng.');
            }
    
        } catch (e) {
            if (isCancelled.current) return;
            const apiError = handleApiError(e);
            setError(`${apiError} Hiển thị kết quả thành công cuối cùng.`);
            setOutputImage(lastSuccessfulImage);
        } finally {
            if (!isCancelled.current) {
                setIsLoading(false);
                setUpscaleProgress(null);
            }
        }
    };
    
    const handleUseAsInput = () => { if (outputImage) setInputImage(outputImage); setOutputImage(null); };
    const handleDownloadImage = () => { if (!outputImage) return; const link = document.createElement('a'); link.href = outputImage; link.download = `ctai-upscaled-${Date.now()}.png`; document.body.appendChild(link); link.click(); document.body.removeChild(link); };

    const loadingMessage = upscaleProgress 
        ? `Đang xử lý bước ${upscaleProgress.current}/${upscaleProgress.total}...`
        : "Đang nâng cấp...";

    return (
        <div className="w-full h-full flex flex-col animate-fade-in bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
                <h1 className="text-xl font-bold text-black dark:text-white">AI Upscale</h1>
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" aria-label="Close"><CloseIcon /></button>
            </header>

            <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
                    {/* Input Panel */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 text-center">Ảnh gốc</h2>
                        <div className="flex-1 min-h-0 bg-white dark:bg-zinc-800/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-700/50 flex items-center justify-center">
                            {inputImage ? (
                                <div className="relative group w-full h-full p-2 border border-dashed border-gray-300 dark:border-zinc-700 rounded-lg">
                                    <img src={inputImage} alt="Input" className="w-full h-full object-contain" />
                                    <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-zinc-800 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Chọn ảnh mới"><ReplaceIcon /></button>
                                        <button onClick={clearInputImage} className="p-3 bg-zinc-800 rounded-full text-white hover:bg-red-500 transition-colors" title="Xóa ảnh"><TrashIcon /></button>
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files && handleImageUpdate(URL.createObjectURL(e.target.files[0]))} />
                                </div>
                            ) : (
                                <ImageUploadArea onImageUpdate={handleImageUpdate} label="Tải lên ảnh cần nâng cấp" />
                            )}
                        </div>
                        <div className="space-y-3">
                            {isLoading ? (
                                <button disabled className="w-full bg-gray-300 dark:bg-zinc-700 text-zinc-500 font-bold py-3 px-10 rounded-lg cursor-not-allowed">Đang xử lý...</button>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => handleGenerate('standard')} disabled={!inputImage} className="w-full bg-zinc-800 text-white font-bold py-3 px-10 rounded-lg hover:bg-zinc-700 transition-colors disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed">Nâng cấp Nhanh</button>
                                    <button onClick={() => handleGenerate('ultra')} disabled={!inputImage} className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors disabled:bg-yellow-200 disabled:text-gray-500 disabled:cursor-not-allowed">Nâng cấp Chi tiết</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Output Panel */}
                     <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 text-center">Ảnh đã nâng cấp</h2>
                        <div className="flex-1 min-h-0 bg-white dark:bg-zinc-800/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-700/50 flex items-center justify-center relative">
                            {isLoading ? (
                                <>
                                    {inputImage && <img src={inputImage} alt="background" className="w-full h-full object-contain filter blur-md opacity-50" />}
                                    <LoadingOverlay onCancel={handleCancel} message={loadingMessage} />
                                </>
                            ) : error ? (
                                <div className="text-center text-red-500 flex flex-col items-center">
                                    <ErrorIcon />
                                    <h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2>
                                    <p className="mt-1 max-w-md">{error}</p>
                                </div>
                            ) : outputImage ? (
                                <div className="w-full h-full relative group/output">
                                    <img src={outputImage} alt="AI Upscaled Result" className="w-full h-full object-contain"/>
                                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover/output:opacity-100 transition-opacity">
                                        <button onClick={() => setIsOutputZoomed(true)} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Phóng to"><ZoomIcon /></button>
                                        <button onClick={handleUseAsInput} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Sử dụng làm ảnh đầu vào"><SendToInputIcon /></button>
                                        <button onClick={handleDownloadImage} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Tải xuống"><DownloadIcon /></button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-zinc-500 flex flex-col items-center">
                                    <PlaceholderIcon />
                                    <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Kết quả</h2>
                                    <p className="mt-1">Ảnh đã nâng cấp sẽ xuất hiện ở đây.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isOutputZoomed && outputImage && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setIsOutputZoomed(false)}>
                    <img src={outputImage} alt="Kết quả được phóng to" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
                    <button className="absolute top-4 right-4 text-white p-2 bg-black/50 rounded-full hover:bg-black/80" onClick={() => setIsOutputZoomed(false)}><CloseIcon className="h-6 w-6" /></button>
                </div>
            )}
        </div>
    );
};

export default AIUpscaleTool;
