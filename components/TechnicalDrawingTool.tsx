import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { BackIcon } from './icons/ChatIcons';

// Add declaration for jsPDF global variable
declare var jspdf: any;

// --- ICONS ---
const CloseIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const UploadIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-500 group-hover:text-yellow-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>);
const PlaceholderIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-zinc-500 dark:text-zinc-600 my-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 2a1 1 0 000 2h6a1 1 0 100-2H9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6" /></svg>);
const LoadingSpinner: React.FC = () => ( <div role="status" className="flex flex-col items-center text-center text-zinc-500 dark:text-zinc-400"><svg aria-hidden="true" className="w-12 h-12 mb-4 text-zinc-200 dark:text-zinc-600 animate-spin fill-yellow-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg><h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-300">Đang tạo bản vẽ...</h2><p className="mt-1">AI đang phân tích mô hình 3D.</p><span className="sr-only">Loading...</span></div>);
const ErrorIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const ZoomIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.086V3a1 1 0 112 0v8.086l1.293-1.379a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const PdfIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H4zm6 10a2 2 0 110-4 2 2 0 010 4zm-3-3a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
const DwgIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.921-.666 2.737l-1.58-1.58A3.987 3.987 0 0014 10a4 4 0 10-4 4 3.987 3.987 0 001.328-.246l-1.58 1.58C8.921 15.759 8 14.993 8 14a6 6 0 116-4zm-2.737 5.334A5.976 5.976 0 0110 16a6 6 0 114-11.314V4a8 8 0 00-8 8c0 .993.241 1.921.666 2.737l4.597-4.597z" /></svg>;

// --- HELPER COMPONENTS ---
const ImageUploadArea: React.FC<{
    onImageUpdate: (dataUrl: string) => void;
    image: string | null;
    onClear: () => void;
    label: string;
}> = ({ onImageUpdate, image, onClear, label }) => {
    const handleFileRead = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => onImageUpdate(reader.result as string);
        reader.readAsDataURL(file);
    }, [onImageUpdate]);

    if (image) {
        return (
             <div className="relative group">
                <img src={image} alt="Input" className="w-full h-auto object-contain rounded-lg border border-gray-300 dark:border-zinc-700" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                     <button onClick={onClear} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors" title="Xóa ảnh đầu vào">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        )
    }

    return (
      <div className="relative aspect-video bg-gray-100 dark:bg-zinc-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-700 flex flex-col items-center justify-center text-center transition-colors hover:border-yellow-400 group cursor-pointer">
        <UploadIcon />
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mt-2">{label}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-500">hoặc <span className="text-yellow-400 font-semibold">nhấn vào đây</span></p>
        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label="Tải lên ảnh đầu vào" onChange={(e) => e.target.files && handleFileRead(e.target.files[0])} accept="image/png, image/jpeg, image/webp" />
      </div>
    );
};

const SegmentedControl: React.FC<{label: string; value: string; options: {label: string, value: string}[]; onChange: (value: any) => void, columns?: number}> = ({ label, value, options, onChange, columns = 3 }) => (
    <div>
        <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-300 mb-2">{label}</label>
        <div className={`grid gap-1 bg-gray-200 dark:bg-zinc-700/50 p-1 rounded-lg grid-cols-${columns}`}>
            {options.map(opt => (
                 <button key={opt.value} onClick={() => onChange(opt.value)} className={`text-center text-xs font-semibold py-2 rounded-md transition-colors ${value === opt.value ? 'bg-yellow-400 text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

const CustomSelect: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; }> = ({ label, value, onChange, children }) => (
    <div className="relative">
        <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-300 mb-2">{label}</label>
        <select
            value={value}
            onChange={onChange}
            aria-label={label}
            className="w-full appearance-none bg-white dark:bg-zinc-800 border-2 border-gray-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-300 px-4 py-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm"
        >
            {children}
        </select>
        <svg className="absolute right-3 bottom-3 w-4 h-4 text-zinc-500 dark:text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
    </div>
);

const MultiSelectDropdown: React.FC<{
    label: string;
    options: { value: string; label: string }[];
    selected: string[];
    onChange: (selected: string[]) => void;
}> = ({ label, options, selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref]);

    const handleSelect = (value: string) => {
        const newSelected = selected.includes(value)
            ? selected.filter(item => item !== value)
            : [...selected, value];
        onChange(newSelected);
    };

    return (
        <div className="relative" ref={ref}>
             <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-300 mb-2">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={label}
                className="w-full flex items-center justify-between appearance-none bg-white dark:bg-zinc-800 border-2 border-gray-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-300 px-4 py-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm"
            >
                <span className="truncate pr-2">{selected.length > 0 ? selected.join(', ') : 'Chọn vật liệu'}</span>
                <svg className={`w-4 h-4 text-zinc-500 dark:text-zinc-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {options.map(option => (
                        <label key={option.value} className="flex items-center px-4 py-2 text-sm text-zinc-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selected.includes(option.value)}
                                onChange={() => handleSelect(option.value)}
                                className="h-4 w-4 rounded bg-gray-100 dark:bg-zinc-900 border-gray-300 dark:border-zinc-600 text-yellow-400 focus:ring-yellow-500"
                            />
                            <span className="ml-3">{option.label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};


// --- OPTIONS DATA ---
const sketchupStyleOptions = [
    { value: 'Hiện đại', label: 'Hiện đại' },
    { value: 'Tân cổ điển', label: 'Tân cổ điển' },
    { value: 'Indochine (Đông Dương)', label: 'Indochine' },
    { value: 'Tối giản (Minimalism)', label: 'Tối giản' },
    { value: 'Brutalist', label: 'Brutalist' },
    { value: 'Tương lai (Futuristic)', label: 'Tương lai' },
];
const sketchupMaterialOptions = [
    { value: 'Bê tông', label: 'Bê tông' },
    { value: 'Kính', label: 'Kính' },
    { value: 'Gỗ', label: 'Gỗ' },
    { value: 'Thép', label: 'Thép' },
    { value: 'Gạch', label: 'Gạch' },
];
const sketchupEnvironmentOptions = [
    { value: 'Thành thị', label: 'Thành thị' },
    { value: 'Nông thôn', label: 'Nông thôn' },
    { value: 'Ven biển', label: 'Ven biển' },
    { value: 'Miền núi', label: 'Miền núi' },
    { value: 'Rừng cây', label: 'Rừng cây' },
];
const sketchupCameraAngleOptions = [
    { value: 'góc nhìn tầm mắt', label: 'Tầm mắt' },
    { value: 'góc nhìn từ trên không', label: 'Từ trên không (Aerial)' },
    { value: 'góc nhìn từ dưới lên', label: 'Từ dưới lên' },
    { value: 'góc nhìn 3/4', label: 'Góc 3/4' },
];


// --- MAIN COMPONENT ---
interface TechnicalDrawingToolProps { onBack: () => void; }

const TechnicalDrawingTool: React.FC<TechnicalDrawingToolProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'drawing' | 'sketchup'>('drawing');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [zoomedImageSrc, setZoomedImageSrc] = useState<string | null>(null);
    const [isExportingDwg, setIsExportingDwg] = useState(false);

    // Drawing state
    const [inputImage, setInputImage] = useState<string | null>(null);
    const [outputImage, setOutputImage] = useState<string | null>(null);
    const [drawingType, setDrawingType] = useState('sơ đồ mặt bằng (floor plan)');
    const [detailLevel, setDetailLevel] = useState('chi tiết, thể hiện vật liệu và kết cấu');
    const [lineStyle, setLineStyle] = useState('đường mực sạch sẽ, sắc nét');
    const [prompt, setPrompt] = useState('');
    
    // Sketchup State
    const [floorplanImage, setFloorplanImage] = useState<string | null>(null);
    const [sketchupPrompt, setSketchupPrompt] = useState('');
    const [sketchupResults, setSketchupResults] = useState<string[]>([]);
    const [selectedSketchupImage, setSelectedSketchupImage] = useState<string | null>(null);
    const [sketchupBuildingStyle, setSketchupBuildingStyle] = useState('Hiện đại');
    const [sketchupMaterials, setSketchupMaterials] = useState<string[]>([]);
    const [sketchupEnvironment, setSketchupEnvironment] = useState('Thành thị');
    const [sketchupCameraAngle, setSketchupCameraAngle] = useState('góc nhìn tầm mắt');


    const handleGenerate = async () => {
        if (!inputImage) {
            setError('Vui lòng tải lên ảnh mô hình 3D.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setOutputImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const qualityBooster = 'Hình ảnh thực tế, ultra sharp focus, high clarity, fine detail, 8K resolution';
            let fullPrompt = '';

            if (drawingType === 'sơ đồ mặt bằng (floor plan)') {
                // New prompt for floor plan generation, focusing on functional layout
                fullPrompt = `Từ hình ảnh mô hình 3D này, hãy phân tích và tính toán để tạo ra một bản vẽ mặt bằng kiến trúc chi tiết. Quan trọng nhất: hãy bố trí các không gian công năng dựa trên các yêu cầu sau: "${prompt || 'Bố trí công năng hợp lý cho một ngôi nhà ở điển hình.'}". Bản vẽ mặt bằng phải thể hiện rõ các phòng, đồ nội thất cơ bản, ký hiệu và kích thước sơ bộ. Phong cách bản vẽ là ${lineStyle}, mức độ chi tiết là ${detailLevel}. ${qualityBooster}`;
            } else {
                // Original prompt for other drawing types
                fullPrompt = `Từ hình ảnh 3D này, hãy tạo một bản vẽ kỹ thuật chuyên nghiệp dạng ${drawingType}. Phong cách là ${lineStyle}. Mức độ chi tiết phải ${detailLevel}. Thêm các chú thích và kích thước chính để làm rõ bản vẽ. ${prompt}. ${qualityBooster}`;
            }
            
            const imagePart = {
                inlineData: {
                    mimeType: inputImage.match(/:(.*?);/)?.[1]!,
                    data: inputImage.split(',')[1],
                },
            };
            const textPart = { text: fullPrompt };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [imagePart, textPart] },
                config: { responseModalities: [Modality.IMAGE] },
            });
            
            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part?.inlineData) {
                const newImage = `data:image/png;base64,${part.inlineData.data}`;
                setOutputImage(newImage);
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
    
    const handleSketchupGenerate = async () => {
        if (!floorplanImage) {
            setError('Vui lòng tải lên ảnh mặt bằng 2D.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setSketchupResults([]);
        setSelectedSketchupImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const perspectiveDetails = [
                `Phong cách kiến trúc ${sketchupBuildingStyle}`,
                sketchupMaterials.length > 0 ? `với vật liệu chủ đạo là ${sketchupMaterials.join(', ')}` : '',
                `đặt trong bối cảnh ${sketchupEnvironment}`,
                sketchupPrompt,
            ].filter(Boolean).join(', ');

            const basePrompt = `Từ mặt bằng 2D được cung cấp, hãy tạo ra một hình ảnh thể hiện mô hình 3D. Giữ phong cách như bản vẽ kỹ thuật Sketchup, với các đường nét rõ ràng, màu sắc đơn giản, có thể có bóng đổ nhẹ.`;

            const prompts = [
                `${basePrompt} Yêu cầu: tạo hình ảnh phối cảnh với ${sketchupCameraAngle}. ${perspectiveDetails}.`,
                `${basePrompt} Yêu cầu: tạo hình ảnh mặt đứng chính.`,
                `${basePrompt} Yêu cầu: tạo hình ảnh mặt bằng mái.`,
                `${basePrompt} Yêu cầu: tạo hình ảnh một mặt cắt dọc.`,
            ];

            const imagePart = {
                inlineData: {
                    mimeType: floorplanImage.match(/:(.*?);/)?.[1]!,
                    data: floorplanImage.split(',')[1],
                },
            };
            
            const generationPromises = prompts.map(prompt => 
                ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [imagePart, { text: prompt }] },
                    config: { responseModalities: [Modality.IMAGE] },
                })
            );
            
            const responses = await Promise.all(generationPromises);

            const newImages = responses.map(response => {
                const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                return part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : null;
            }).filter((img): img is string => img !== null);
            
            if (newImages.length > 0) {
                setSketchupResults(newImages);
                setSelectedSketchupImage(newImages[0]);
            } else {
                throw new Error("AI không thể tạo ra các hình ảnh Sketchup.");
            }
        } catch (e) {
            console.error(e);
            setError(`Đã xảy ra lỗi: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownloadImage = () => {
        const imageToDownload = activeTab === 'drawing' ? outputImage : selectedSketchupImage;
        if (!imageToDownload) return;
        const link = document.createElement('a');
        link.href = imageToDownload;
        link.download = `ctai-drawing-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        const imageToExport = activeTab === 'drawing' ? outputImage : selectedSketchupImage;
        if (!imageToExport) return;
    
        const { jsPDF } = jspdf;
        const img = new Image();
        img.src = imageToExport;
        img.onload = () => {
            const imgWidth = img.width;
            const imgHeight = img.height;
            const orientation = imgWidth > imgHeight ? 'l' : 'p';
            const doc = new jsPDF(orientation, 'mm', 'a4');
    
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = doc.internal.pageSize.getHeight();
    
            // Maintain aspect ratio
            const ratio = imgWidth / imgHeight;
            let newImgWidth = pdfWidth;
            let newImgHeight = newImgWidth / ratio;
    
            if (newImgHeight > pdfHeight) {
                newImgHeight = pdfHeight;
                newImgWidth = newImgHeight * ratio;
            }
    
            const x = (pdfWidth - newImgWidth) / 2;
            const y = (pdfHeight - newImgHeight) / 2;
    
            doc.addImage(imageToExport, 'PNG', x, y, newImgWidth, newImgHeight);
            doc.save(`ctai-drawing-${Date.now()}.pdf`);
        };
    };
    
    const handleExportDWG = async () => {
        const imageToExport = activeTab === 'drawing' ? outputImage : selectedSketchupImage;
        if (!imageToExport) {
            alert('Không có bản vẽ để xuất.');
            return;
        }

        setIsExportingDwg(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = {
                inlineData: {
                    mimeType: imageToExport.match(/:(.*?);/)?.[1]!,
                    data: imageToExport.split(',')[1],
                },
            };
            const textPart = { text: "Phân tích hình ảnh bản vẽ kỹ thuật này và chuyển đổi nó thành định dạng tệp DXF (Drawing Exchange Format). Chỉ trả về nội dung tệp DXF thô, không có bất kỳ giải thích hay định dạng nào khác. Nội dung phải bắt đầu bằng '0\\nSECTION' và kết thúc bằng '0\\nEOF'." };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro', // Using pro for a more complex task
                contents: { parts: [imagePart, textPart] },
            });

            const dxfContent = response.text;
            
            if (!dxfContent.includes('EOF')) {
                throw new Error("AI không trả về nội dung DXF hợp lệ.");
            }

            const blob = new Blob([dxfContent], { type: 'application/dxf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `ctai-drawing-${Date.now()}.dxf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (e) {
            console.error(e);
            setError(`Lỗi khi xuất DXF: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
        } finally {
            setIsExportingDwg(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col animate-fade-in bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
                <h1 className="text-xl font-bold text-black dark:text-white">Bản vẽ kỹ thuật & Sketchup</h1>
                <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" aria-label="Quay lại">
                    <BackIcon className="h-5 w-5" />
                    <span>Quay lại</span>
                </button>
            </header>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-[420px_1fr] overflow-hidden">
                <aside className="p-6 flex flex-col overflow-y-auto bg-gray-50 dark:bg-zinc-900/30">
                     <div className="flex bg-gray-200 dark:bg-zinc-700/50 p-1 rounded-lg mb-6">
                        <button onClick={() => setActiveTab('drawing')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${activeTab === 'drawing' ? 'bg-yellow-400 text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>Bản vẽ Kỹ thuật</button>
                        <button onClick={() => setActiveTab('sketchup')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${activeTab === 'sketchup' ? 'bg-yellow-400 text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>Vẽ Sketchup</button>
                    </div>

                    <div className="space-y-6">
                        {activeTab === 'drawing' ? (
                            <>
                                <section>
                                    <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Ảnh mô hình 3D</h2>
                                    <ImageUploadArea 
                                        image={inputImage} 
                                        onImageUpdate={(dataUrl) => { setInputImage(dataUrl); setOutputImage(null); setError(null); }} 
                                        onClear={() => { setInputImage(null); setOutputImage(null); setError(null); }} 
                                        label="Tải ảnh render 3D"
                                    />
                                </section>
                                <section className="space-y-4">
                                    <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tùy chọn bản vẽ</h2>
                                    <SegmentedControl 
                                        label="Loại bản vẽ" 
                                        value={drawingType} 
                                        onChange={setDrawingType} 
                                        options={[
                                            {label: 'Mặt bằng', value: 'sơ đồ mặt bằng (floor plan)'}, 
                                            {label: 'Mặt đứng', value: 'bản vẽ mặt đứng (elevation view)'}, 
                                            {label: 'Mặt cắt', value: 'bản vẽ mặt cắt (section view)'}
                                        ]}
                                        columns={3}
                                    />
                                    <SegmentedControl 
                                        label="Mức độ chi tiết" 
                                        value={detailLevel} 
                                        onChange={setDetailLevel}
                                        options={[
                                            {label: 'Cơ bản', value: 'cơ bản với các đường nét chính'}, 
                                            {label: 'Chi tiết', value: 'chi tiết, thể hiện vật liệu và kết cấu'}, 
                                            {label: 'Chú thích', value: 'chi tiết đầy đủ với chú thích và kích thước'},
                                            {label: 'Địa hình', value: 'bao gồm cả địa hình và bối cảnh xung quanh'}
                                        ]}
                                        columns={2}
                                    />
                                    <SegmentedControl 
                                        label="Phong cách nét vẽ" 
                                        value={lineStyle} 
                                        onChange={setLineStyle}
                                        options={[
                                            {label: 'Nét chì', value: 'phác thảo bằng bút chì mềm mại'}, 
                                            {label: 'Nét mực', value: 'đường mực sạch sẽ, sắc nét'}, 
                                            {label: 'Bút sắt', value: 'nét vẽ bút sắt chi tiết, kỹ thuật'},
                                            {label: 'Màu nước', value: 'bản vẽ phác thảo kiến trúc bằng màu nước'},
                                            {label: 'Kiến trúc (CAD)', value: 'theo tiêu chuẩn CAD kiến trúc'}
                                        ]}
                                        columns={3}
                                    />
                                </section>
                                 <section>
                                    <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Yêu cầu thêm (Tùy chọn)</h2>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="VD: Tập trung vào chi tiết cửa sổ, thêm kích thước cho phòng khách..."
                                        rows={3}
                                        className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 placeholder-zinc-500 p-3 rounded-lg border-2 border-gray-300 dark:border-zinc-700/80 focus:border-yellow-400 focus:ring-0 outline-none transition-colors resize-none text-sm"
                                    />
                                </section>
                            </>
                        ) : (
                             <>
                                <section>
                                    <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Mặt bằng 2D</h2>
                                    <ImageUploadArea 
                                        image={floorplanImage} 
                                        onImageUpdate={(dataUrl) => { setFloorplanImage(dataUrl); setSketchupResults([]); setSelectedSketchupImage(null); }}
                                        onClear={() => { setFloorplanImage(null); setSketchupResults([]); setSelectedSketchupImage(null); }} 
                                        label="Tải lên mặt bằng" 
                                    />
                                </section>
                                <section className="space-y-4">
                                    <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tùy chọn mô hình 3D</h2>
                                    <CustomSelect label="Phong cách kiến trúc" value={sketchupBuildingStyle} onChange={e => setSketchupBuildingStyle(e.target.value)}>
                                        {sketchupStyleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </CustomSelect>
                                    <MultiSelectDropdown label="Vật liệu chủ đạo" options={sketchupMaterialOptions} selected={sketchupMaterials} onChange={setSketchupMaterials} />
                                    <CustomSelect label="Môi trường xung quanh" value={sketchupEnvironment} onChange={e => setSketchupEnvironment(e.target.value)}>
                                        {sketchupEnvironmentOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </CustomSelect>
                                    <CustomSelect label="Góc nhìn phối cảnh" value={sketchupCameraAngle} onChange={e => setSketchupCameraAngle(e.target.value)}>
                                        {sketchupCameraAngleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </CustomSelect>
                                </section>
                                <section>
                                    <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Yêu cầu thêm (Tùy chọn)</h2>
                                    <textarea value={sketchupPrompt} onChange={(e) => setSketchupPrompt(e.target.value)} placeholder="VD: Thêm mái dốc, sử dụng vật liệu gỗ..." rows={3} className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 placeholder-zinc-500 p-3 rounded-lg border-2 border-gray-300 dark:border-zinc-700/80 focus:border-yellow-400 focus:ring-0 outline-none transition-colors resize-none text-sm"/>
                                </section>
                            </>
                        )}
                    </div>

                    <footer className="mt-auto pt-6">
                        <button 
                            onClick={activeTab === 'drawing' ? handleGenerate : handleSketchupGenerate}
                            className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-400 dark:disabled:bg-zinc-600 disabled:cursor-not-allowed" 
                            disabled={isLoading || (activeTab === 'drawing' && !inputImage) || (activeTab === 'sketchup' && !floorplanImage)}
                        >
                            {isLoading ? 'Đang xử lý...' : activeTab === 'drawing' ? 'Tạo bản vẽ' : 'Tạo hình ảnh'}
                        </button>
                    </footer>
                </aside>
                
                <main className="flex-1 flex items-center justify-center p-8 bg-gray-200 dark:bg-black/40 overflow-hidden relative">
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : error ? (
                        <div className="text-center text-red-500 flex flex-col items-center">
                            <ErrorIcon />
                            <h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2>
                            <p className="mt-1 max-w-md">{error}</p>
                        </div>
                    ) : activeTab === 'drawing' ? (
                        outputImage ? (
                            <div className="w-full h-full flex items-center justify-center relative group/output">
                                <img src={outputImage} alt="Generated technical drawing" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl bg-white"/>
                                 <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover/output:opacity-100 transition-opacity">
                                    <button onClick={() => setZoomedImageSrc(outputImage)} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Phóng to"><ZoomIcon /></button>
                                    <button onClick={handleDownloadImage} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Tải xuống PNG"><DownloadIcon /></button>
                                    <button onClick={handleExportPDF} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Tải PDF"><PdfIcon /></button>
                                    <button onClick={handleExportDWG} disabled={isExportingDwg || isLoading} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-wait" title="Tải DXF (Tương thích DWG)">
                                        {isExportingDwg ? (
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <DwgIcon />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-zinc-500 flex flex-col items-center">
                                <PlaceholderIcon />
                                <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Kết quả Bản vẽ Kỹ thuật</h2>
                                <p className="mt-1">Bản vẽ của bạn sẽ xuất hiện ở đây.</p>
                            </div>
                        )
                    ) : ( // sketchup tab
                         sketchupResults.length > 0 && selectedSketchupImage ? (
                            <div className="flex flex-col w-full h-full gap-4">
                                <div className="flex-1 w-full bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-lg flex items-center justify-center overflow-hidden relative group">
                                    <img src={selectedSketchupImage} alt="Selected view" className="max-w-full max-h-full object-contain animate-fade-in"/>
                                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setZoomedImageSrc(selectedSketchupImage)} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Phóng to"><ZoomIcon /></button>
                                        <button onClick={handleDownloadImage} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Tải xuống PNG"><DownloadIcon /></button>
                                        <button onClick={handleExportPDF} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Tải xuống PDF"><PdfIcon /></button>
                                        <button 
                                            onClick={handleExportDWG} 
                                            disabled={isExportingDwg || isLoading || selectedSketchupImage === sketchupResults[0]} 
                                            className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed" 
                                            title={selectedSketchupImage === sketchupResults[0] ? 'Không thể xuất phối cảnh sang DXF' : 'Tải DXF (Tương thích DWG)'}
                                        >
                                            {isExportingDwg ? (
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <DwgIcon />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 grid grid-cols-4 gap-3 h-32">
                                    {sketchupResults.map((src, i) => (
                                        <div key={i} onClick={() => setSelectedSketchupImage(src)} className={`p-1 rounded-md shadow-sm cursor-pointer border-2 transition-all duration-200 ${selectedSketchupImage === src ? 'border-yellow-400 scale-105' : 'border-transparent hover:border-zinc-500'}`}>
                                            <img src={src} alt={`Thumbnail ${i+1}`} className="w-full h-full object-cover rounded-sm"/>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-zinc-500 flex flex-col items-center"><PlaceholderIcon /><h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Mô hình 3D</h2><p className="mt-1">Các góc nhìn của mô hình sẽ xuất hiện ở đây.</p></div>
                        )
                    )}
                </main>
            </div>
             {zoomedImageSrc && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setZoomedImageSrc(null)}>
                    <img src={zoomedImageSrc} alt="Kết quả được phóng to" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
                    <button className="absolute top-4 right-4 text-white p-2 bg-black/50 rounded-full hover:bg-black/80" onClick={() => setZoomedImageSrc(null)}><CloseIcon className="h-6 w-6" /></button>
                </div>
            )}
        </div>
    );
};

export default TechnicalDrawingTool;