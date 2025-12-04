
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

// --- ICONS ---
const CloseIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const UploadIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-500 group-hover:text-yellow-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>);
const SparklesIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.172a2 2 0 00.586 1.414l2.828 2.828a2 2 0 002.828 0l2.828-2.828A2 2 0 0015 4.172V3a1 1 0 10-2 0v1.172a.5.5 0 01-.146.354l-2.828 2.828a.5.5 0 01-.708 0L6.464 4.526A.5.5 0 016 4.172V3a1 1 0 00-1-1zm10 4a1 1 0 00-1 1v6.828a2 2 0 00.586 1.414l2.828 2.828a2 2 0 002.828 0l2.828-2.828A2 2 0 0021 13.828V7a1 1 0 10-2 0v6.828a.5.5 0 01-.146.354l-2.828 2.828a.5.5 0 01-.708 0L12.464 14.18A.5.5 0 0112 13.828V7a1 1 0 00-1-1zM2 5a1 1 0 00-1 1v6.828a2 2 0 00.586 1.414l2.828 2.828a2 2 0 002.828 0l2.828-2.828A2 2 0 0011 13.828V7a1 1 0 10-2 0v6.828a.5.5 0 01-.146.354l-2.828 2.828a.5.5 0 01-.708 0L2.464 14.18A.5.5 0 012 13.828V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>);
const ChevronDownIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const ChevronUpIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>);
const DownloadIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.086V3a1 1 0 112 0v8.086l1.293-1.379a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const CopyIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);

// --- COMPONENTS ---

const ImageUploadBox: React.FC<{
    image: string | null;
    onImageUpdate: (dataUrl: string) => void;
    onClear: () => void;
    label: string;
    subLabel?: string;
    height?: string;
    disabled?: boolean;
}> = ({ image, onImageUpdate, onClear, label, subLabel, height = "h-64", disabled = false }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileRead = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => onImageUpdate(reader.result as string);
        reader.readAsDataURL(file);
    }, [onImageUpdate]);

    if (image) {
        return (
            <div className={`relative w-full ${height} bg-zinc-900/50 rounded-xl border border-zinc-700/50 overflow-hidden group`}>
                <img src={image} alt={label} className="w-full h-full object-contain" />
                {!disabled && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button onClick={() => fileInputRef.current?.click()} className="bg-zinc-800 text-white p-2 rounded-full hover:bg-yellow-400 hover:text-black transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                        </button>
                        <button onClick={onClear} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files && handleFileRead(e.target.files[0])} />
            </div>
        );
    }

    return (
        <div 
            onClick={() => !disabled && fileInputRef.current?.click()}
            className={`relative w-full ${height} bg-zinc-900/30 rounded-xl border-2 border-dashed ${disabled ? 'border-zinc-800 cursor-not-allowed opacity-50' : 'border-zinc-700 cursor-pointer hover:border-zinc-500'} flex flex-col items-center justify-center text-center transition-all group`}
        >
            <div className={`p-4 rounded-full bg-zinc-800/50 mb-3 ${!disabled && 'group-hover:scale-110 transition-transform'}`}>
                <UploadIcon />
            </div>
            <p className="text-sm font-bold text-zinc-400">{label}</p>
            {subLabel && <p className="text-xs text-zinc-600 mt-1">{subLabel}</p>}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" disabled={disabled} onChange={(e) => e.target.files && handleFileRead(e.target.files[0])} />
        </div>
    );
};

const ProcessingStepCard: React.FC<{
    title: string;
    image: string | null;
    isLoading: boolean;
    statusText?: string;
}> = ({ title, image, isLoading, statusText }) => {
    return (
        <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 flex flex-col h-64">
            <h4 className="text-sm font-semibold text-yellow-500 mb-2 text-center">{title}</h4>
            <div className="flex-1 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center overflow-hidden relative">
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-contain" />
                ) : isLoading ? (
                    <div className="flex flex-col items-center text-zinc-500">
                        <div className="w-8 h-8 border-2 border-zinc-600 border-t-yellow-400 rounded-full animate-spin mb-2"></div>
                        <span className="text-xs animate-pulse">{statusText || 'Đang xử lý...'}</span>
                    </div>
                ) : (
                    <span className="text-xs text-zinc-600 p-4 text-center">{statusText || 'Chờ xử lý...'}</span>
                )}
            </div>
        </div>
    );
};

const VisualizationImprovementTool: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'exterior' | 'interior'>('exterior');
    
    // Steps state
    const [step, setStep] = useState(1); // 1: Upload, 2: Auto Process, 3: Final Render
    const [isStepsExpanded, setIsStepsExpanded] = useState(true);

    // Images
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [enhancedImage, setEnhancedImage] = useState<string | null>(null); // Step 1 result (Exterior only)
    const [sketchImage, setSketchImage] = useState<string | null>(null);     // Step 2 result
    const [referenceImage, setReferenceImage] = useState<string | null>(null); // Step 3 input
    const [finalResultImage, setFinalResultImage] = useState<string | null>(null);

    // Prompts & Status
    const [customPrompt, setCustomPrompt] = useState('');
    const [isProcessingAuto, setIsProcessingAuto] = useState(false);
    const [processingStage, setProcessingStage] = useState< 'enhancing' | 'sketching' | 'done' | 'idle' >('idle');
    const [isGeneratingFinal, setIsGeneratingFinal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dataUrlToPart = (dataUrl: string) => {
        const [header, base64Data] = dataUrl.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1];
        if (!mimeType || !base64Data) throw new Error("Invalid data URL");
        return { inlineData: { mimeType, data: base64Data } };
    };

    const handleStartAutoProcess = async () => {
        if (!originalImage) {
            setError("Vui lòng tải lên ảnh gốc.");
            return;
        }
        
        setIsProcessingAuto(true);
        setError(null);
        setIsStepsExpanded(true);
        
        // Reset downstream images
        setEnhancedImage(null);
        setSketchImage(null);
        setFinalResultImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const originalPart = dataUrlToPart(originalImage);

            let inputForSketch = originalPart;

            // STEP 1: Enhance (Only for Exterior)
            if (activeTab === 'exterior') {
                setProcessingStage('enhancing');
                setStep(2);

                const enhancePrompt = "Enhance this architectural exterior image. Correct lighting, exposure, and remove noise. Make the building structure clear and distinct from the background.";

                const enhanceResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [originalPart, { text: enhancePrompt }] },
                    config: { responseModalities: [Modality.IMAGE] },
                });
                
                const enhancePart = enhanceResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                if (!enhancePart?.inlineData) throw new Error("Không thể xử lý ảnh bước 1.");
                const enhancedUrl = `data:image/png;base64,${enhancePart.inlineData.data}`;
                setEnhancedImage(enhancedUrl);
                
                // Use enhanced image for next step
                inputForSketch = dataUrlToPart(enhancedUrl);
            }

            // STEP 2: Convert to Sketch (For both, but input differs)
            setProcessingStage('sketching');
            setStep(2); // Ensure we are at step 2 UI
            
            const sketchPrompt = activeTab === 'exterior'
                ? "Convert this image into a clean, professional architectural line sketch (black lines on white background). Focus on the main structure and key elements. Remove unnecessary textures."
                : "Convert this interior image into a clean, professional architectural line sketch (black lines on white background). Focus on the furniture outlines, walls, and spatial layout. Remove colors and complex textures. Do not modify the layout.";
            
            const sketchResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [inputForSketch, { text: sketchPrompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });

            const sketchPart = sketchResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (!sketchPart?.inlineData) throw new Error("Không thể tạo sketch.");
            const sketchUrl = `data:image/png;base64,${sketchPart.inlineData.data}`;
            setSketchImage(sketchUrl);

            setProcessingStage('done');
            setStep(3); // Move to final step ready state

        } catch (e) {
            console.error(e);
            setError(`Lỗi xử lý: ${e instanceof Error ? e.message : 'Không xác định'}`);
            setStep(1);
        } finally {
            setIsProcessingAuto(false);
        }
    };

    const handleGenerateFinal = async () => {
        if (!sketchImage) return;
        
        setIsGeneratingFinal(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const sketchPart = dataUrlToPart(sketchImage);
            const parts: any[] = [sketchPart];

            let promptText = activeTab === 'exterior'
                ? "Render a photorealistic exterior architectural image based on this sketch structure. High quality, 8k, cinematic lighting, realistic materials and landscaping. "
                : "Render a photorealistic interior design image based on this sketch layout. High quality, 8k, soft lighting, realistic textures and furniture details. ";

            if (referenceImage) {
                parts.push(dataUrlToPart(referenceImage));
                promptText += "Use the second image as a STYLE REFERENCE. Copy the color palette, materials, lighting mood, and overall aesthetic from the reference image. ";
            }

            if (customPrompt.trim()) {
                promptText += `Additional requirements: ${customPrompt}`;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: promptText }, ...parts] }, // Put text first sometimes helps context
                config: { responseModalities: [Modality.IMAGE] },
            });

            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part?.inlineData) {
                setFinalResultImage(`data:image/png;base64,${part.inlineData.data}`);
            } else {
                throw new Error("Không thể tạo ảnh cuối cùng.");
            }

        } catch (e) {
            console.error(e);
            setError(`Lỗi render: ${e instanceof Error ? e.message : 'Không xác định'}`);
        } finally {
            setIsGeneratingFinal(false);
        }
    };

    const handleDownload = (url: string | null) => {
        if (!url) return;
        const link = document.createElement('a');
        link.href = url;
        link.download = `ctai-render-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyImage = async (imageUrl: string) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob,
                }),
            ]);
            alert('Đã sao chép ảnh vào bộ nhớ tạm!');
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Trình duyệt không hỗ trợ sao chép tự động. Hãy nhấn giữ vào ảnh để sao chép thủ công.');
        }
    };

    const getDescriptionText = () => {
        if (activeTab === 'exterior') {
             return "AI sẽ thực hiện 2 bước tự động: Xử lý ảnh gốc, sau đó chuyển ảnh đã xử lý sang dạng sketch màu để bạn có thể render lại với bối cảnh và ánh sáng mới.";
        }
        return "AI sẽ tự động chuyển ảnh của bạn sang dạng sketch để bạn có thể render lại với vật liệu và ánh sáng mới.";
    };

    return (
        <div className="w-full h-full flex flex-col animate-fade-in bg-zinc-900/30 text-zinc-100 overflow-y-auto">
            <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8">
                
                {/* Tab Switcher */}
                <div className="flex justify-center">
                     <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                        <button 
                            onClick={() => { setActiveTab('exterior'); setStep(1); setOriginalImage(null); setEnhancedImage(null); setSketchImage(null); setFinalResultImage(null); }}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'exterior' ? 'bg-yellow-400 text-black shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                        >
                            Cải thiện ngoại thất
                        </button>
                        <button 
                            onClick={() => { setActiveTab('interior'); setStep(1); setOriginalImage(null); setEnhancedImage(null); setSketchImage(null); setFinalResultImage(null); }}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'interior' ? 'bg-yellow-400 text-black shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                        >
                            Cải thiện nội thất
                        </button>
                    </div>
                </div>

                {/* STEP 1: UPLOAD */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">1. Tải Lên Ảnh Render {activeTab === 'exterior' ? 'Ngoại Thất' : 'Nội Thất'}</h2>
                    <ImageUploadBox 
                        image={originalImage} 
                        onImageUpdate={setOriginalImage} 
                        onClear={() => { setOriginalImage(null); setStep(1); setEnhancedImage(null); setSketchImage(null); setFinalResultImage(null); }} 
                        label="Nhấp hoặc kéo tệp vào đây"
                        subLabel="PNG, JPG, WEBP"
                        height="h-48"
                    />
                </div>

                {/* STEP 2: START PROCESS */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-2">2. Bắt Đầu Quá Trình</h2>
                    <p className="text-sm text-zinc-400 mb-6">
                        {getDescriptionText()}
                    </p>
                    <button 
                        onClick={handleStartAutoProcess}
                        disabled={!originalImage || isProcessingAuto}
                        className="w-full py-4 bg-slate-600 hover:bg-slate-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        {isProcessingAuto ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                Bắt Đầu Cải Thiện
                            </>
                        )}
                    </button>
                </div>

                {/* PROCESSING STEPS VISUALIZATION */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
                    <button 
                        onClick={() => setIsStepsExpanded(!isStepsExpanded)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
                    >
                        <h2 className="text-lg font-bold text-white">Các Bước Xử Lý Của AI</h2>
                        {isStepsExpanded ? <ChevronUpIcon className="w-5 h-5 text-zinc-500"/> : <ChevronDownIcon className="w-5 h-5 text-zinc-500"/>}
                    </button>
                    
                    {isStepsExpanded && (
                        <div className={`p-6 pt-0 grid gap-4 animate-fade-in ${activeTab === 'exterior' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                            <ProcessingStepCard 
                                title="Ảnh Gốc" 
                                image={originalImage} 
                                isLoading={false}
                                statusText="Ảnh bạn tải lên sẽ hiện ở đây."
                            />
                            
                            {activeTab === 'exterior' && (
                                <ProcessingStepCard 
                                    title="Bước 1: Xử lý nền" 
                                    image={enhancedImage} 
                                    isLoading={processingStage === 'enhancing'}
                                    statusText="Kết quả sau khi xử lý nền."
                                />
                            )}

                            <ProcessingStepCard 
                                title="Chuyển sang Sketch" 
                                image={sketchImage} 
                                isLoading={processingStage === 'sketching'}
                                statusText="Kết quả sau khi chuyển sang sketch."
                            />
                        </div>
                    )}
                </div>

                {/* STEP 3: FINAL RENDER & CUSTOMIZATION */}
                <div className={`bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 transition-opacity duration-500 ${step >= 3 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <h2 className="text-lg font-bold text-white mb-4">3. Render Lại Với Prompt Tùy Chỉnh</h2>
                    
                    {step < 3 ? (
                        <div className="text-center py-8 text-zinc-500 text-sm">
                            Hoàn thành các bước trên để mở khóa phần này.
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div>
                                    <label className="block text-sm font-semibold text-zinc-400 mb-2">Ảnh tham chiếu phong cách (Tùy chọn)</label>
                                    <ImageUploadBox 
                                        image={referenceImage} 
                                        onImageUpdate={setReferenceImage} 
                                        onClear={() => setReferenceImage(null)} 
                                        label="Tải ảnh mẫu để bắt chước màu sắc/ánh sáng"
                                        height="h-40"
                                    />
                                 </div>
                                 <div>
                                     <label className="block text-sm font-semibold text-zinc-400 mb-2">Mô tả thêm (Prompt)</label>
                                     <textarea 
                                        value={customPrompt}
                                        onChange={e => setCustomPrompt(e.target.value)}
                                        placeholder="VD: Ánh sáng buổi sáng, không gian ấm cúng, thêm cây xanh..."
                                        className="w-full h-40 bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-200 focus:border-yellow-400 focus:ring-0 outline-none resize-none"
                                     />
                                 </div>
                             </div>
                             
                             <button 
                                onClick={handleGenerateFinal}
                                disabled={isGeneratingFinal}
                                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:brightness-110 text-black font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {isGeneratingFinal ? 'Đang Render...' : 'Render Kết Quả Cuối Cùng'}
                            </button>

                            {error && (
                                <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            {finalResultImage && (
                                <div className="mt-6">
                                    <h3 className="text-center text-yellow-400 font-bold text-lg mb-4">KẾT QUẢ</h3>
                                    <div className="relative group max-w-2xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-zinc-700">
                                        <img src={finalResultImage} alt="Final Result" className="w-full h-auto" />
                                        {/* Desktop Overlay Buttons */}
                                        <div className="hidden md:flex absolute bottom-4 right-4 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button onClick={() => handleCopyImage(finalResultImage)} className="bg-zinc-900/80 text-white px-4 py-2 rounded-lg hover:bg-yellow-400 hover:text-black transition-colors text-sm font-semibold flex items-center gap-2">
                                                <CopyIcon className="w-4 h-4" /> Sao chép
                                            </button>
                                            <button onClick={() => handleDownload(finalResultImage)} className="bg-zinc-900/80 text-white px-4 py-2 rounded-lg hover:bg-yellow-400 hover:text-black transition-colors text-sm font-semibold flex items-center gap-2">
                                                <DownloadIcon className="w-4 h-4" /> Tải xuống
                                            </button>
                                        </div>
                                    </div>
                                    {/* Mobile Buttons Bar (Below image for easy access) */}
                                    <div className="flex md:hidden gap-3 mt-4 justify-center">
                                         <button onClick={() => handleCopyImage(finalResultImage)} className="flex-1 bg-zinc-800 text-white px-4 py-3 rounded-xl hover:bg-zinc-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 border border-zinc-700">
                                            <CopyIcon className="w-5 h-5" /> Sao chép
                                        </button>
                                         <button onClick={() => handleDownload(finalResultImage)} className="flex-1 bg-yellow-400 text-black px-4 py-3 rounded-xl hover:bg-yellow-300 transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-lg">
                                            <DownloadIcon className="w-5 h-5" /> Tải xuống
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default VisualizationImprovementTool;
