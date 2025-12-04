
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import {
    UndoIcon, RedoIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, ArrowDownIcon, PlusIcon, MinusIcon
} from './icons/ViewerIcons';
import { BackIcon } from './icons/ChatIcons';

// --- ICONS ---
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-8 w-8 text-zinc-500 group-hover:text-[var(--accent-color)] transition-colors"} fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>);
const PanoramaIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-zinc-500 dark:text-zinc-600 my-4" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 0118 0 9 9 0 01-18 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 00-9-9v18a9 9 0 009-9zM3 12a9 9 0 019-9v18a9 9 0 01-9-9z" /></svg>);
const RotateLeftIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg> );
const RotateRightIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg> );
const ErrorIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);


// --- HELPER COMPONENTS ---
const ImageUpload: React.FC<{onImageUpdate: (dataUrl: string) => void;}> = ({ onImageUpdate }) => {
    const handleFileRead = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => onImageUpdate(reader.result as string);
        reader.readAsDataURL(file);
    }, [onImageUpdate]);

    return (
      <div className="relative aspect-video bg-gray-100 dark:bg-zinc-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-700 flex flex-col items-center justify-center text-center transition-colors hover:border-[var(--accent-color)] group cursor-pointer">
            <>
                <UploadIcon />
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mt-2">Kéo và thả ảnh</p>
                <p className="text-xs text-zinc-500">hoặc <span className="text-[var(--accent-color)] font-semibold">nhấn vào đây</span></p>
            </>
        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label="Tải lên ảnh 360" onChange={(e) => e.target.files && handleFileRead(e.target.files[0])} accept="image/png, image/jpeg, image/webp" />
      </div>
    );
};

const ControlButton: React.FC<{onClick: () => void, title: string, disabled?: boolean, children: React.ReactNode, className?: string}> = ({ onClick, title, disabled, children, className }) => (
    <button 
        onClick={onClick} 
        title={title} 
        disabled={disabled} 
        className={`p-4 bg-zinc-800 text-zinc-200 rounded-xl hover:bg-zinc-700 hover:text-white transition-all active:scale-95 disabled:bg-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed shadow-md border border-zinc-700/50 ${className}`}
    >
        {children}
    </button>
)

// --- MAIN COMPONENT ---
interface ThirtySixtyVirtualTourToolProps { onBack: () => void; }

const ThirtySixtyVirtualTourTool: React.FC<ThirtySixtyVirtualTourToolProps> = ({ onBack }) => {
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [movementStep, setMovementStep] = useState<15 | 30 | 45>(30);

    const currentImage = history[historyIndex] || null;

    const handleImageUpdate = (dataUrl: string) => {
        setHistory([dataUrl]);
        setHistoryIndex(0);
        setError(null);
    };

    const generateNextImage = async (actionPrompt: string) => {
        if (!currentImage) {
            setError("Không có ảnh để thực hiện hành động.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const qualityBooster = 'Ultra realistic, hyper-detailed, 8K resolution, photorealistic masterpiece, ultra sharp focus, high dynamic range, cinematic lighting, perfect composition, volumetric light, physically accurate texture, ultra-high-definition, detailed skin pores and materials, natural shadows, true-to-life colors, incredibly detailed, depth of field, high clarity, realistic contrast, fine detail, rich tones, professional photography, award-winning photo';
            const finalPrompt = `${actionPrompt}, ${qualityBooster}`;

            const imagePart = {
                inlineData: {
                    mimeType: currentImage.match(/:(.*?);/)?.[1]!,
                    data: currentImage.split(',')[1],
                },
            };
            const textPart = { text: finalPrompt };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [imagePart, textPart] },
                config: { responseModalities: [Modality.IMAGE] },
            });

            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part?.inlineData) {
                const newImage = `data:image/png;base64,${part.inlineData.data}`;
                const newHistory = history.slice(0, historyIndex + 1);
                setHistory([...newHistory, newImage]);
                setHistoryIndex(newHistory.length);
            } else {
                throw new Error("AI không trả về hình ảnh hợp lệ.");
            }
        } catch (e) {
            console.error(e);
            setError(`Đã xảy ra lỗi: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
        }
    };

    const handleAction = (action: 'Pan Left' | 'Pan Right' | 'Pan Up' | 'Pan Down' | 'Orbit Left' | 'Orbit Right' | 'Zoom In' | 'Zoom Out') => {
        let prompt = '';
        const degreeText = `${movementStep} độ`;
        
        switch (action) {
            case 'Pan Left':
                prompt = `Giữ nguyên vị trí đứng, xoay góc nhìn camera sang trái ${degreeText}. Giữ nguyên phong cách, ánh sáng và các chi tiết của cảnh quan.`;
                break;
            case 'Pan Right':
                prompt = `Giữ nguyên vị trí đứng, xoay góc nhìn camera sang phải ${degreeText}. Giữ nguyên phong cách, ánh sáng và các chi tiết của cảnh quan.`;
                break;
            case 'Pan Up':
                prompt = `Giữ nguyên vị trí đứng, ngước góc nhìn camera lên trên ${degreeText}. Giữ nguyên phong cách và ánh sáng.`;
                break;
            case 'Pan Down':
                prompt = `Giữ nguyên vị trí đứng, cúi góc nhìn camera xuống dưới ${degreeText}. Giữ nguyên phong cách và ánh sáng.`;
                break;
            case 'Orbit Left':
                prompt = `Di chuyển camera theo quỹ đạo vòng cung sang trái ${degreeText} xung quanh tâm điểm của bức ảnh. Giữ nguyên đối tượng trung tâm nhưng thay đổi góc nhìn nền phía sau tương ứng.`;
                break;
            case 'Orbit Right':
                prompt = `Di chuyển camera theo quỹ đạo vòng cung sang phải ${degreeText} xung quanh tâm điểm của bức ảnh. Giữ nguyên đối tượng trung tâm nhưng thay đổi góc nhìn nền phía sau tương ứng.`;
                break;
            case 'Zoom In':
                prompt = `Phóng to (Zoom in) vào trung tâm bức ảnh khoảng 20%. Làm rõ các chi tiết, giữ nguyên chất lượng và ánh sáng.`;
                break;
            case 'Zoom Out':
                prompt = `Thu nhỏ (Zoom out) góc nhìn khoảng 20% để thấy được nhiều bối cảnh xung quanh hơn. Mở rộng không gian một cách tự nhiên, giữ nguyên phong cách.`;
                break;
        }
        
        generateNextImage(prompt);
    };

    return (
        <div className="w-full h-full flex flex-col animate-fade-in bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
                <h1 className="text-xl font-bold text-black dark:text-white">AI Tham quan ảo 360°</h1>
                <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" aria-label="Quay lại">
                    <BackIcon className="h-5 w-5" />
                    <span>Quay lại</span>
                </button>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_400px] overflow-hidden">
                {/* Main Viewport */}
                <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gray-200 dark:bg-black/40 overflow-hidden relative order-2 lg:order-1">
                    <div className="w-full h-full flex-1 flex items-center justify-center">
                    {isLoading ? (
                         <div role="status" className="flex flex-col items-center text-center text-zinc-500 dark:text-zinc-400">
                            <svg aria-hidden="true" className="w-12 h-12 mb-4 text-zinc-200 dark:text-zinc-600 animate-spin fill-[var(--accent-color)]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-300">Đang tạo ảnh mới...</h2><p className="mt-1">Vui lòng đợi trong giây lát.</p><span className="sr-only">Loading...</span>
                        </div>
                    ) : error ? (
                         <div className="text-center text-red-500 flex flex-col items-center">
                            <ErrorIcon />
                            <h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2>
                            <p className="mt-1 max-w-md">{error}</p>
                        </div>
                    ) : currentImage ? (
                        <img src={currentImage} alt="Virtual tour view" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"/>
                    ) : (
                        <div className="text-center text-zinc-500 flex flex-col items-center">
                            <PanoramaIcon />
                            <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Trình xem ảnh 360°</h2>
                            <p className="mt-1">Tải lên một hình ảnh để bắt đầu.</p>
                        </div>
                    )}
                    </div>
                </main>

                {/* Control Panel Sidebar */}
                <aside className="p-6 flex flex-col overflow-y-auto bg-gray-50 dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 order-1 lg:order-2">
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">1. ẢNH ĐẦU VÀO</h2>
                            <ImageUpload onImageUpdate={handleImageUpdate} />
                        </section>

                        <section className="bg-white dark:bg-zinc-800/50 p-6 rounded-2xl border border-gray-200 dark:border-zinc-700/50 shadow-sm">
                            <h2 className="text-sm font-bold text-zinc-800 dark:text-white mb-4 uppercase tracking-wider">2. Bảng Điều Khiển Camera</h2>
                            
                            {/* Movement Level */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Mức độ di chuyển</span>
                                </div>
                                <div className="flex bg-zinc-200 dark:bg-zinc-900 p-1 rounded-lg">
                                    {[15, 30, 45].map((deg) => (
                                        <button
                                            key={deg}
                                            onClick={() => setMovementStep(deg as any)}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${movementStep === deg ? 'bg-[var(--accent-color)] text-black shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                                        >
                                            {deg}°
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-1.5 text-center">Áp dụng cho Pan và Orbit. Zoom có mức độ cố định.</p>
                            </div>

                            {/* Pan Controls (D-Pad style) */}
                            <div className="mb-6 flex flex-col items-center">
                                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-3">Pan (Xoay camera tại chỗ)</span>
                                <div className="grid grid-cols-3 gap-2">
                                    <div />
                                    <ControlButton onClick={() => handleAction('Pan Up')} title="Lên" disabled={isLoading || !currentImage}>
                                        <ArrowUpIcon />
                                    </ControlButton>
                                    <div />
                                    
                                    <ControlButton onClick={() => handleAction('Pan Left')} title="Trái" disabled={isLoading || !currentImage}>
                                        <ArrowLeftIcon />
                                    </ControlButton>
                                    <div className="flex items-center justify-center">
                                        <div className="w-2 h-2 bg-zinc-600 rounded-full"></div>
                                    </div>
                                    <ControlButton onClick={() => handleAction('Pan Right')} title="Phải" disabled={isLoading || !currentImage}>
                                        <ArrowRightIcon />
                                    </ControlButton>
                                    
                                    <div />
                                    <ControlButton onClick={() => handleAction('Pan Down')} title="Xuống" disabled={isLoading || !currentImage}>
                                        <ArrowDownIcon />
                                    </ControlButton>
                                    <div />
                                </div>
                            </div>

                            {/* Orbit & Zoom Row */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Orbit (Quỹ đạo)</span>
                                    <div className="flex gap-2">
                                        <ControlButton onClick={() => handleAction('Orbit Left')} title="Quay Trái" disabled={isLoading || !currentImage} className="p-3">
                                            <RotateLeftIcon className="w-5 h-5" />
                                        </ControlButton>
                                        <ControlButton onClick={() => handleAction('Orbit Right')} title="Quay Phải" disabled={isLoading || !currentImage} className="p-3">
                                            <RotateRightIcon className="w-5 h-5" />
                                        </ControlButton>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Zoom</span>
                                    <div className="flex gap-2">
                                        <ControlButton onClick={() => handleAction('Zoom In')} title="Gần lại" disabled={isLoading || !currentImage} className="p-3">
                                            <PlusIcon />
                                        </ControlButton>
                                        <ControlButton onClick={() => handleAction('Zoom Out')} title="Ra xa" disabled={isLoading || !currentImage} className="p-3">
                                            <MinusIcon />
                                        </ControlButton>
                                    </div>
                                </div>
                            </div>

                            {/* History Controls */}
                            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700 flex gap-3">
                                <button 
                                    onClick={handleUndo} 
                                    disabled={isLoading || historyIndex <= 0}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <UndoIcon /> Hoàn Tác ({historyIndex})
                                </button>
                                <button 
                                    onClick={handleRedo} 
                                    disabled={isLoading || historyIndex >= history.length - 1}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <RedoIcon /> Làm Lại ({history.length - 1 - historyIndex})
                                </button>
                            </div>
                        </section>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default ThirtySixtyVirtualTourTool;
