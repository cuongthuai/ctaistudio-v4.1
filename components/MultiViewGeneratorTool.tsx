import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';

// --- ICONS ---
const CloseIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const UploadIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-500 group-hover:text-yellow-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>);
const PlaceholderIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-zinc-500 dark:text-zinc-600 my-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>);
const LoadingSpinner: React.FC<{text: string, small?: boolean}> = ({ text, small = false }) => ( 
    <div role="status" className={`flex flex-col items-center text-center text-zinc-500 dark:text-zinc-400 ${small ? 'p-4' : ''}`}>
        <svg aria-hidden="true" className={`${small ? 'w-8 h-8' : 'w-12 h-12'} mb-3 text-zinc-200 dark:text-zinc-600 animate-spin fill-yellow-400`} viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
        <h2 className={`${small ? 'text-sm' : 'text-xl'} font-semibold text-zinc-800 dark:text-zinc-300`}>{text}</h2>
        <span className="sr-only">Loading...</span>
    </div>
);
const ErrorIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM5 11a1 1 0 100 2h4a1 1 0 100-2H5z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.172a2 2 0 00.586 1.414l2.828 2.828a2 2 0 002.828 0l2.828-2.828A2 2 0 0015 4.172V3a1 1 0 10-2 0v1.172a.5.5 0 01-.146.354l-2.828 2.828a.5.5 0 01-.708 0L6.464 4.526A.5.5 0 016 4.172V3a1 1 0 00-1-1zm10 4a1 1 0 00-1 1v6.828a2 2 0 00.586 1.414l2.828 2.828a2 2 0 002.828 0l2.828-2.828A2 2 0 0021 13.828V7a1 1 0 10-2 0v6.828a.5.5 0 01-.146.354l-2.828 2.828a.5.5 0 01-.708 0L12.464 14.18A.5.5 0 0112 13.828V7a1 1 0 00-1-1zM2 5a1 1 0 00-1 1v6.828a2 2 0 00.586 1.414l2.828 2.828a2 2 0 002.828 0l2.828-2.828A2 2 0 0011 13.828V7a1 1 0 10-2 0v6.828a.5.5 0 01-.146.354l-2.828 2.828a.5.5 0 01-.708 0L2.464 14.18A.5.5 0 012 13.828V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const ZoomIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.086V3a1 1 0 112 0v8.086l1.293-1.379a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

interface MultiViewGeneratorToolProps { onBack: () => void; }

interface GeneratedPrompt {
    id: number;
    text: string;
    images: string[];
    isLoading: boolean;
    error?: string | null;
}

const dataUrlToPart = (dataUrl: string) => {
    const [header, base64Data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1];
    if (!mimeType || !base64Data) throw new Error("Invalid data URL");
    return { inlineData: { mimeType, data: base64Data } };
};

const MultiViewGeneratorTool: React.FC<MultiViewGeneratorToolProps> = ({ onBack }) => {
    const [inputImage, setInputImage] = useState<string | null>(null);
    const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[]>([]);
    const [isLoading, setIsLoading] = useState(false); // For generating prompts
    const [error, setError] = useState<string | null>(null);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    const [copiedPromptId, setCopiedPromptId] = useState<number | null>(null);
    const [aspectRatio, setAspectRatio] = useState('1:1');

    const handleImageUpdate = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                setInputImage(reader.result as string);
                setGeneratedPrompts([]);
                setError(null);
            }
        };
        reader.readAsDataURL(file);
    }, []);

    const handleCopy = (text: string, id: number) => {
        navigator.clipboard.writeText(text);
        setCopiedPromptId(id);
        setTimeout(() => setCopiedPromptId(null), 2000);
    };
    
    const handleDownloadImage = (imageUrl: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `ctai-generated-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleGeneratePrompts = async () => {
        if (!inputImage) {
            setError('Vui lòng tải lên một hình ảnh để bắt đầu.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedPrompts([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = dataUrlToPart(inputImage);
            
            const promptForPrompts = `Bạn là một AI chuyên gia tạo prompt cho diễn họa kiến trúc. Nhiệm vụ của bạn là phân tích hình ảnh được cung cấp và tạo ra 30 prompt đa dạng, nghệ thuật bằng tiếng Việt.

Hướng dẫn:
1. Tạo prompt cho cả cảnh **ngoại thất** và **nội thất** lấy cảm hứng từ ảnh.
2. Tập trung vào các góc máy, ánh sáng và bố cục nghệ thuật. Ví dụ:
   - Chụp qua các yếu tố tiền cảnh (ví dụ: "qua giàn hoa giấy", "qua hồ nước cận cảnh bông hoa sen").
   - Cận cảnh đồ trang trí và vật liệu (ví dụ: "cận cảnh lọ hoa trên bàn", "chi tiết vật liệu tường").
   - Thời gian và thời tiết khác nhau (ví dụ: "ánh nắng hoàng hôn xiên qua cửa sổ", "cảnh đêm mưa").
   - Các góc nhìn độc đáo (ví dụ: "góc nhìn từ dưới thấp", "phản chiếu qua vũng nước").
3. Với mỗi prompt, xác định đó là cảnh 'interior' hay 'exterior'.
4. Trả về kết quả dưới dạng một mảng JSON hợp lệ. Mỗi đối tượng trong mảng phải có hai khóa: \`type\` (string, là "interior" hoặc "exterior") và \`prompt\` (string, là prompt tiếng Việt đã tạo).`;
            
            const textPart = { text: promptForPrompts };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING },
                                prompt: { type: Type.STRING },
                            }
                        }
                    }
                }
            });

            const promptsFromAI = JSON.parse(response.text.trim());

            if (Array.isArray(promptsFromAI)) {
                const formattedPrompts: GeneratedPrompt[] = promptsFromAI.map((p, index) => {
                    const prefix = p.type === 'exterior' ? 'Hình ảnh chân thật công trình' : 'Hình ảnh chân thật nội thất';
                    return {
                        id: index,
                        text: `${prefix}, ${p.prompt}`,
                        images: [],
                        isLoading: false,
                    };
                });
                setGeneratedPrompts(formattedPrompts);
            } else {
                throw new Error("AI không trả về định dạng mảng JSON hợp lệ.");
            }

        } catch (e) {
            console.error(e);
            setError(`Đã xảy ra lỗi khi tạo gợi ý: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateImageForPrompt = async (promptId: number) => {
        if (!inputImage) return;
        
        const promptToUse = generatedPrompts.find(p => p.id === promptId);
        if (!promptToUse) return;

        setGeneratedPrompts(prev => prev.map(p => p.id === promptId ? { ...p, isLoading: true, images: [], error: null } : p));
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = dataUrlToPart(inputImage);
            const fullPrompt = `${promptToUse.text}, khổ ảnh ${aspectRatio}`;

            const generate = () => ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [imagePart, { text: fullPrompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });

            const [response1, response2] = await Promise.all([generate(), generate()]);
            
            const newImages: string[] = [];
            const part1 = response1.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part1?.inlineData) newImages.push(`data:image/png;base64,${part1.inlineData.data}`);

            const part2 = response2.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part2?.inlineData) newImages.push(`data:image/png;base64,${part2.inlineData.data}`);

            if (newImages.length === 0) {
                throw new Error('AI không trả về hình ảnh nào.');
            }

            setGeneratedPrompts(prev => prev.map(p => p.id === promptId ? { ...p, isLoading: false, images: newImages } : p));

        } catch (e) {
            console.error(`Error generating image for prompt ${promptId}:`, e);
            setGeneratedPrompts(prev => prev.map(p => p.id === promptId ? { ...p, isLoading: false, error: 'Lỗi tạo ảnh' } : p));
        }
    };


    return (
        <div className="w-full h-full flex flex-col animate-fade-in bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
                <h1 className="text-xl font-bold text-black dark:text-white">AI Tạo Gợi ý Sáng tạo</h1>
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" aria-label="Close"><CloseIcon /></button>
            </header>

             <div className="flex-1 grid grid-cols-1 md:grid-cols-[400px_1fr] overflow-hidden">
                <aside className="p-6 flex flex-col overflow-y-auto bg-gray-50 dark:bg-zinc-900/30">
                     <div className="space-y-6">
                        <section>
                            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Ảnh gốc</h2>
                            {inputImage ? (
                                <div className="relative group">
                                    <img src={inputImage} alt="Input" className="w-full h-auto object-contain rounded-lg" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={() => setInputImage(null)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
                                            <CloseIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative aspect-video bg-gray-100 dark:bg-zinc-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-700 flex flex-col items-center justify-center text-center transition-colors hover:border-yellow-400 group cursor-pointer">
                                    <UploadIcon />
                                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mt-2">Tải lên ảnh đối tượng</p>
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label="Tải lên ảnh" onChange={(e) => e.target.files && e.target.files[0] && handleImageUpdate(e.target.files[0])} accept="image/*" />
                                </div>
                            )}
                        </section>

                        <section>
                            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Khổ ảnh</h2>
                            <div className="grid grid-cols-5 gap-1 bg-gray-200 dark:bg-zinc-700/50 p-1 rounded-lg">
                                {['1:1', '16:9', '9:16', '4:3', '3:4'].map(ratio => (
                                    <button 
                                        key={ratio} 
                                        onClick={() => setAspectRatio(ratio)}
                                        className={`flex-1 text-center text-xs font-semibold py-2 rounded-md transition-colors ${aspectRatio === ratio ? 'bg-yellow-400 text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}
                                    >
                                        {ratio}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    <footer className="mt-auto pt-6">
                        <button onClick={handleGeneratePrompts} className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-600 disabled:cursor-not-allowed" disabled={isLoading || !inputImage}>
                            {isLoading ? 'Đang tạo...' : 'Tạo gợi ý Prompt'}
                        </button>
                    </footer>
                </aside>

                 <main className="flex-1 p-4 md:p-8 bg-gray-200 dark:bg-black/40 overflow-y-auto">
                    {isLoading && <div className="flex items-center justify-center h-full"><LoadingSpinner text="Đang tạo 30 gợi ý..." /></div>}
                    {error && !isLoading && <div className="text-center text-red-500 flex flex-col items-center justify-center h-full"><ErrorIcon /><h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2><p className="mt-1 max-w-md">{error}</p></div>}
                    
                    {!isLoading && !error && generatedPrompts.length > 0 && (
                        <div className="space-y-4">
                            {generatedPrompts.map((p) => (
                                <div key={p.id} className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{p.text}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <button onClick={() => handleCopy(p.text, p.id)} className="flex items-center gap-1.5 text-xs font-semibold bg-gray-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1 rounded-full hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors">
                                            {copiedPromptId === p.id ? <CheckIcon /> : <CopyIcon />}
                                            {copiedPromptId === p.id ? 'Đã chép' : 'Sao chép'}
                                        </button>
                                        <button onClick={() => handleGenerateImageForPrompt(p.id)} disabled={p.isLoading} className="flex items-center gap-1.5 text-xs font-semibold bg-yellow-400 text-black px-3 py-1 rounded-full hover:bg-yellow-300 transition-colors disabled:bg-zinc-500 disabled:cursor-not-allowed">
                                            <SparklesIcon />
                                            Tạo ảnh
                                        </button>
                                    </div>
                                    <div className="mt-3">
                                        {p.isLoading && <div className="flex items-center justify-center min-h-[120px]"><LoadingSpinner text="Đang tạo ảnh..." small /></div>}
                                        {!p.isLoading && p.images.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2">
                                                {p.images.map((img, imgIndex) => (
                                                    <div key={imgIndex} className="relative group/image bg-gray-100 dark:bg-zinc-900/50 rounded-md flex items-center justify-center aspect-square">
                                                        <img src={img} alt={`Generated ${p.id}-${imgIndex}`} onClick={() => setZoomedImage(img)} className="max-w-full max-h-full object-contain cursor-pointer rounded" />
                                                        <div className="absolute top-1 right-1 flex flex-col gap-1.5 opacity-0 group-hover/image:opacity-100 transition-opacity">
                                                            <button onClick={() => setZoomedImage(img)} className="p-1.5 bg-zinc-800/70 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Phóng to">
                                                                <ZoomIcon />
                                                            </button>
                                                            <button onClick={() => handleDownloadImage(img)} className="p-1.5 bg-zinc-800/70 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Tải xuống">
                                                                <DownloadIcon />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {p.error && <p className="text-xs text-red-500 text-center py-4">{p.error}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && !error && generatedPrompts.length === 0 && (
                        <div className="text-center text-zinc-500 flex flex-col items-center justify-center h-full">
                            <PlaceholderIcon />
                            <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Gợi ý sáng tạo</h2>
                            <p className="mt-1 max-w-sm">Tải lên một ảnh để AI tạo ra các gợi ý prompt độc đáo.</p>
                        </div>
                    )}
                </main>
            </div>

            {zoomedImage && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setZoomedImage(null)}>
                    <img src={zoomedImage} alt="Zoomed view" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
                    <button className="absolute top-4 right-4 text-white p-2 bg-black/50 rounded-full hover:bg-black/80" onClick={() => setZoomedImage(null)}><CloseIcon className="h-6 w-6" /></button>
                </div>
            )}
        </div>
    );
};

export default MultiViewGeneratorTool;
