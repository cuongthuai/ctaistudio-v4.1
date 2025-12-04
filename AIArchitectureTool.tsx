import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';

// Add declaration for jsPDF global variable
declare var jspdf: any;

// --- ICONS ---
const CloseIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const UploadIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-500 group-hover:text-yellow-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>);
const PlaceholderIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-zinc-500 dark:text-zinc-600 my-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>);
const LoadingSpinner: React.FC<{text?: string}> = ({ text }) => ( <div role="status" className="flex flex-col items-center text-center text-zinc-500 dark:text-zinc-400"><svg aria-hidden="true" className="w-10 h-10 mb-3 text-zinc-200 dark:text-zinc-600 animate-spin fill-yellow-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg><h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-300">{text || 'Đang xử lý...'}</h3><p className="mt-1 text-sm">{text ? '' : 'AI đang làm việc, vui lòng chờ.'}</p><span className="sr-only">Loading...</span></div>);
const ErrorIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const PdfIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H4zm6 10a2 2 0 110-4 2 2 0 010 4zm-3-3a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>);
const ExcelIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V4a1 1 0 00-1-1H3zm2 2v2h3V5H5zm4 0v2h4V5H9zm5 0v2h3V5h-3zM5 9v2h3V9H5zm4 0v2h4V9H9zm5 0v2h3V9h-3zM5 13v2h3v-2H5zm4 0v2h4v-2H9zm5 0v2h3v-2h-3z" clipRule="evenodd" /></svg>);
const ZoomIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>);
const PlusIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" /></svg>);
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;

// --- HELPER COMPONENTS ---
const ImageUploadArea: React.FC<{onImageUpdate: (dataUrl: string) => void; image: string | null; onClear: () => void; label: string;}> = ({ onImageUpdate, image, onClear, label }) => {
    const handleFileRead = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => onImageUpdate(reader.result as string);
        reader.readAsDataURL(file);
    }, [onImageUpdate]);

    if (image) {
        return (
             <div className="relative group">
                <img src={image} alt="Input" className="w-full h-auto object-contain rounded-lg border border-gray-300 dark:border-zinc-700" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <button onClick={onClear} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
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

const CustomSelect: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; }> = ({ label, value, onChange, children }) => (
    <div className="relative">
        <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">{label}</label>
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
             <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">{label}</label>
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

const MultiImageUploadArea: React.FC<{
  images: string[];
  onImagesUpdate: (images: string[]) => void;
}> = ({ images, onImagesUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newImageUrls: string[] = [];
    let processedCount = 0;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
            newImageUrls.push(reader.result as string);
        }
        processedCount++;
        if (processedCount === files.length) {
          onImagesUpdate([...images, ...newImageUrls]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onImagesUpdate(images.filter((_, index) => index !== indexToRemove));
  };
  
  return (
    <div className="bg-gray-100 dark:bg-zinc-800/50 p-3 rounded-lg">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {images.map((image, index) => (
                <div key={index} className="relative group aspect-square">
                    <img src={image} alt={`Input ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => handleRemoveImage(index)} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                            <TrashIcon />
                        </button>
                    </div>
                </div>
            ))}
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-square bg-gray-200 dark:bg-zinc-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-700 flex flex-col items-center justify-center text-center transition-colors hover:border-yellow-400 group cursor-pointer"
            >
                <PlusIcon />
                <span className="text-xs mt-1 text-zinc-500">Thêm ảnh</span>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    multiple 
                    onChange={(e) => handleFiles(e.target.files)} 
                    accept="image/*" 
                    className="hidden"
                />
            </div>
        </div>
    </div>
  );
};


// --- MAIN COMPONENT ---
interface AIArchitectureToolProps { onBack: () => void; }

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

const AIArchitectureTool: React.FC<AIArchitectureToolProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'sketchup' | 'costing'>('sketchup');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sketchup State
    const [floorplanImage, setFloorplanImage] = useState<string | null>(null);
    const [sketchupPrompt, setSketchupPrompt] = useState('');
    const [sketchupResults, setSketchupResults] = useState<string[]>([]);
    const [selectedSketchupImage, setSelectedSketchupImage] = useState<string | null>(null);
    const [isSketchupZoomed, setIsSketchupZoomed] = useState(false);
    const [sketchupBuildingStyle, setSketchupBuildingStyle] = useState('Hiện đại');
    const [sketchupMaterials, setSketchupMaterials] = useState<string[]>([]);
    const [sketchupEnvironment, setSketchupEnvironment] = useState('Thành thị');
    const [sketchupCameraAngle, setSketchupCameraAngle] = useState('góc nhìn tầm mắt');
    
    // Costing State
    const [area, setArea] = useState<number>(100);
    const [floors, setFloors] = useState<number>(1);
    const [location, setLocation] = useState('TP. Hồ Chí Minh');
    const [quality, setQuality] = useState('Trung bình');
    const [costResult, setCostResult] = useState<any | null>(null);
    const [houseStyle, setHouseStyle] = useState('Hiện đại');
    const [costingImages, setCostingImages] = useState<string[]>([]);

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
    
    const handleCostingGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setCostResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            let promptText = `Bạn là một chuyên gia dự toán xây dựng ở Việt Nam. Dựa vào thông tin sau: diện tích sàn ${area}m2, ${floors} tầng, phong cách nhà ${houseStyle}, tại ${location}, chất lượng hoàn thiện ${quality}, hãy lập một bảng dự toán chi phí đầu tư chi tiết.`;
            
            const contentParts: any[] = [];

            if (costingImages.length > 0) {
                promptText += ` Ngoài ra, hãy phân tích kỹ các hình ảnh mặt bằng và phối cảnh được cung cấp để đưa ra dự toán chính xác nhất có thể, bao gồm cả các hạng mục ngoại thất, cảnh quan nếu có.`;
                for (const image of costingImages) {
                    const [header, base64Data] = image.split(',');
                    const mimeType = header.match(/:(.*?);/)?.[1];
                    if (mimeType && base64Data) {
                        contentParts.push({ inlineData: { mimeType, data: base64Data } });
                    }
                }
            }
            
            contentParts.push({ text: promptText });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: contentParts },
                 config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: "Tiêu đề của bảng dự toán, ví dụ: 'Dự toán chi phí xây dựng nhà 2 tầng 100m2'" },
                            items: {
                                type: Type.ARRAY,
                                description: "Danh sách các hạng mục chi phí.",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        category: { type: Type.STRING, description: "Hạng mục lớn, ví dụ: 'Chi phí Xây dựng Phần thô', 'Chi phí Hoàn thiện'" },
                                        item: { type: Type.STRING, description: "Tên hạng mục chi tiết, ví dụ: 'Móng cọc', 'Sơn nước'" },
                                        unit: { type: Type.STRING, description: "Đơn vị tính, ví dụ: 'm2', 'gói'" },
                                        quantity: { type: Type.NUMBER, description: "Số lượng" },
                                        unitPrice: { type: Type.NUMBER, description: "Đơn giá (VND)" },
                                        total: { type: Type.NUMBER, description: "Thành tiền (VND)" },
                                    },
                                    required: ["category", "item", "unit", "quantity", "unitPrice", "total"]
                                }
                            },
                            summary: {
                                type: Type.OBJECT,
                                properties: {
                                    grandTotal: { type: Type.NUMBER, description: "Tổng cộng chi phí dự kiến (VND)" },
                                    notes: { type: Type.STRING, description: "Các ghi chú và khuyến cáo quan trọng." },
                                },
                                required: ["grandTotal", "notes"]
                            }
                        },
                        required: ["title", "items", "summary"]
                    }
                }
            });

            setCostResult(JSON.parse(response.text));

        } catch (e) {
            console.error(e);
            setError(`Đã xảy ra lỗi khi tạo dự toán: ${e instanceof Error ? e.message : 'Lỗi không xác định'}. Thử lại với yêu cầu đơn giản hơn.`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const exportResultToExcel = (resultData: any, fileName: string) => {
        if (!resultData || !resultData.items) return;

        const headers = ["Hạng mục lớn", "Hạng mục chi tiết", "Đơn vị", "Số lượng", "Đơn giá (VND)", "Thành tiền (VND)"];
        const rows = resultData.items.map((item: any) => [
            item.category,
            item.item,
            item.unit,
            item.quantity,
            item.unitPrice,
            item.total,
        ]);

        let csvContent = "\uFEFF"; // BOM for UTF-8
        csvContent += headers.join(",") + "\n";
        rows.forEach((rowArray: any[]) => {
            let row = rowArray.map((cell: any) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(",");
            csvContent += row + "\n";
        });
        
        csvContent += "\n";
        csvContent += `Tổng cộng,,,,,"${resultData.summary.grandTotal}"\n`;
        csvContent += `Ghi chú,"${resultData.summary.notes.replace(/"/g, '""')}"\n`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${fileName}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportResultToPDF = (resultData: any, fileName: string) => {
        if (!resultData || !resultData.items) return;

        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        
        // This is a placeholder for a proper TTF font for Vietnamese support.
        // Without it, accented characters may not render correctly.
        // For production, you would add a font like 'Arimo-Regular-normal.js'
        // and set doc.setFont('Arimo-Regular');
        
        const head = [["Hạng mục lớn", "Hạng mục chi tiết", "Đơn vị", "Số lượng", "Đơn giá", "Thành tiền"]];
        const body = resultData.items.map((item: any) => [
            item.category,
            item.item,
            item.unit,
            item.quantity.toLocaleString('vi-VN'),
            item.unitPrice.toLocaleString('vi-VN') + ' VND',
            item.total.toLocaleString('vi-VN') + ' VND',
        ]);

        doc.text(resultData.title || "Du toan chi phi", 14, 20);

        (doc as any).autoTable({
            startY: 25,
            head: head,
            body: body,
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 8 },
            headStyles: { fillColor: [250, 204, 21], textColor: [0,0,0] },
            didParseCell: function (data: any) {
                // This is a workaround to handle UTF-8 characters better with standard fonts
                if (data.cell.section === 'body' || data.cell.section === 'head') {
                    data.cell.text = data.cell.text;
                }
            }
        });
        
        const finalY = (doc as any).lastAutoTable.finalY || 100;

        doc.setFontSize(10);
        doc.text("Tong cong:", 14, finalY + 10);
        doc.text(resultData.summary.grandTotal.toLocaleString('vi-VN') + ' VND', 200, finalY + 10, { align: 'right' });
        
        doc.text("Ghi chu:", 14, finalY + 20);
        const notes = doc.splitTextToSize(resultData.summary.notes, 180);
        doc.text(notes, 14, finalY + 25);
        
        doc.save(`${fileName}.pdf`);
    };

    const renderCostTable = (resultData: any, excelFilename: string, pdfFilename: string) => {
        if (!resultData) return null;
        return (
            <div className="w-full max-w-4xl bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg max-h-full overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-black dark:text-white">{resultData.title || "Dự toán chi phí đầu tư"}</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={() => exportResultToExcel(resultData, excelFilename)} className="flex items-center gap-1.5 text-xs font-semibold bg-gray-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-full hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors">
                            <ExcelIcon className="w-4 h-4"/>
                            Xuất Excel
                        </button>
                        <button onClick={() => exportResultToPDF(resultData, pdfFilename)} className="flex items-center gap-1.5 text-xs font-semibold bg-gray-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-full hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors">
                            <PdfIcon className="w-4 h-4"/>
                            Xuất PDF
                        </button>
                    </div>
                </div>
                
                <table className="w-full text-sm text-left text-zinc-500 dark:text-zinc-400">
                    <thead className="text-xs text-zinc-700 uppercase bg-gray-50 dark:bg-zinc-700 dark:text-zinc-300">
                        <tr>
                            <th scope="col" className="px-4 py-3">Hạng mục</th>
                            <th scope="col" className="px-4 py-3 text-center">Đơn vị</th>
                            <th scope="col" className="px-4 py-3 text-right">Số lượng</th>
                            <th scope="col" className="px-4 py-3 text-right">Đơn giá</th>
                            <th scope="col" className="px-4 py-3 text-right">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(resultData.items.reduce((acc: any, item: any) => {
                            (acc[item.category] = acc[item.category] || []).push(item);
                            return acc;
                        }, {})).map(([category, items]) => (
                            <React.Fragment key={category}>
                                <tr className="bg-gray-50 dark:bg-zinc-700/50">
                                    <td colSpan={5} className="px-4 py-2 font-bold text-zinc-800 dark:text-zinc-200">{category}</td>
                                </tr>
                                {(items as any[]).map((item, index) => (
                                     <tr key={index} className="border-b dark:border-zinc-700">
                                        <td className="px-4 py-2 font-medium text-zinc-900 dark:text-white">{item.item}</td>
                                        <td className="px-4 py-2 text-center">{item.unit}</td>
                                        <td className="px-4 py-2 text-right">{item.quantity.toLocaleString('vi-VN')}</td>
                                        <td className="px-4 py-2 text-right">{item.unitPrice.toLocaleString('vi-VN')}</td>
                                        <td className="px-4 py-2 text-right font-semibold">{item.total.toLocaleString('vi-VN')}</td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                    <tfoot>
                         <tr className="font-bold text-black dark:text-white bg-gray-100 dark:bg-zinc-900/50">
                            <td colSpan={4} className="px-4 py-3 text-right text-base">TỔNG CỘNG</td>
                            <td className="px-4 py-3 text-right text-base">{resultData.summary.grandTotal.toLocaleString('vi-VN')} VND</td>
                        </tr>
                    </tfoot>
                </table>
                
                <div className="mt-6">
                     <h4 className="font-bold text-black dark:text-white mb-2">Ghi chú</h4>
                     <p className="text-xs whitespace-pre-wrap">{resultData.summary.notes}</p>
                </div>
            </div>
        )
    };

    return (
        <div className="w-full h-full flex flex-col animate-fade-in bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
                <h1 className="text-xl font-bold text-black dark:text-white">AI Kiến trúc</h1>
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" aria-label="Close"><CloseIcon /></button>
            </header>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-[420px_1fr] overflow-hidden">
                <aside className="p-6 flex flex-col overflow-y-auto bg-gray-50 dark:bg-zinc-900/30">
                    <div className="flex bg-gray-200 dark:bg-zinc-700/50 p-1 rounded-lg mb-6">
                        <button onClick={() => setActiveTab('sketchup')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${activeTab === 'sketchup' ? 'bg-yellow-400 text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>Vẽ Sketchup</button>
                        <button onClick={() => setActiveTab('costing')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${activeTab === 'costing' ? 'bg-yellow-400 text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>Dự toán Chi phí</button>
                    </div>

                    {activeTab === 'sketchup' ? (
                        <div className="space-y-6">
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
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <section>
                                <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Thông số Công trình</h2>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Hình ảnh Mặt bằng & Phối cảnh</label>
                                    <MultiImageUploadArea images={costingImages} onImagesUpdate={setCostingImages} />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Diện tích sàn (m²)</label>
                                        <input type="number" value={area} onChange={(e) => setArea(Number(e.target.value))} className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 p-2.5 rounded-lg border-2 border-gray-300 dark:border-zinc-700 focus:border-yellow-400 focus:ring-0 outline-none"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Số tầng</label>
                                        <input type="number" value={floors} onChange={(e) => setFloors(Number(e.target.value))} className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 p-2.5 rounded-lg border-2 border-gray-300 dark:border-zinc-700 focus:border-yellow-400 focus:ring-0 outline-none"/>
                                    </div>
                                    <CustomSelect label="Phong cách nhà" value={houseStyle} onChange={(e) => setHouseStyle(e.target.value)}>
                                        <option>Hiện đại</option>
                                        <option>Tân cổ điển</option>
                                        <option>Indochine (Đông Dương)</option>
                                        <option>Nhà mái Nhật</option>
                                        <option>Nhà mái Thái</option>
                                        <option>Tối giản (Minimalism)</option>
                                    </CustomSelect>
                                    <CustomSelect label="Địa điểm" value={location} onChange={(e) => setLocation(e.target.value)}>
                                        <option>TP. Hồ Chí Minh</option>
                                        <option>Hà Nội</option>
                                        <option>Đà Nẵng</option>
                                        <option>Tỉnh/Thành khác</option>
                                    </CustomSelect>
                                    <CustomSelect label="Chất lượng hoàn thiện" value={quality} onChange={(e) => setQuality(e.target.value)}>
                                        <option>Cơ bản</option>
                                        <option>Trung bình</option>
                                        <option>Cao cấp</option>
                                    </CustomSelect>
                                </div>
                            </section>
                        </div>
                    )}
                    
                    <footer className="mt-auto pt-6">
                         <button 
                            onClick={activeTab === 'sketchup' ? handleSketchupGenerate : handleCostingGenerate}
                            className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-600 disabled:cursor-not-allowed" 
                            disabled={isLoading || (activeTab === 'sketchup' && !floorplanImage)}
                        >
                            {isLoading ? 'Đang xử lý...' 
                                : activeTab === 'sketchup' ? 'Tạo hình ảnh' 
                                : 'Lập dự toán'}
                        </button>
                    </footer>
                </aside>
                
                <main className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-200 dark:bg-black/40 overflow-hidden">
                    {isLoading ? <LoadingSpinner /> : error ? (
                        <div className="text-center text-red-500 flex flex-col items-center"><ErrorIcon /><h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2><p className="mt-1 max-w-md">{error}</p></div>
                    ) : activeTab === 'sketchup' ? (
                        sketchupResults.length > 0 && selectedSketchupImage ? (
                            <div className="flex flex-col w-full h-full gap-4">
                                <div className="flex-1 w-full bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-lg flex items-center justify-center overflow-hidden relative group">
                                    <img src={selectedSketchupImage} alt="Selected view" className="max-w-full max-h-full object-contain animate-fade-in"/>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => setIsSketchupZoomed(true)} 
                                            className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" 
                                            title="Phóng to"
                                        >
                                            <ZoomIcon />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 grid grid-cols-4 gap-3 h-32">
                                    {sketchupResults.map((src, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => setSelectedSketchupImage(src)}
                                            className={`p-1 rounded-md shadow-sm cursor-pointer border-2 transition-all duration-200 ${selectedSketchupImage === src ? 'border-yellow-400 scale-105' : 'border-transparent hover:border-zinc-500'}`}
                                        >
                                            <img src={src} alt={`Thumbnail ${i+1}`} className="w-full h-full object-cover rounded-sm"/>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-zinc-500 flex flex-col items-center"><PlaceholderIcon /><h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Mô hình 3D</h2><p className="mt-1">Các góc nhìn của mô hình sẽ xuất hiện ở đây.</p></div>
                        )
                    ) : (
                        costResult ? renderCostTable(costResult, 'du-toan-chi-phi', 'du-toan-chi-phi') : (
                             <div className="text-center text-zinc-500 flex flex-col items-center"><PlaceholderIcon /><h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Dự toán Chi phí</h2><p className="mt-1">Bảng dự toán chi phí sẽ xuất hiện ở đây.</p></div>
                        )
                    )}
                </main>
            </div>

            {isSketchupZoomed && selectedSketchupImage && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setIsSketchupZoomed(false)}>
                    <img src={selectedSketchupImage} alt="Kết quả được phóng to" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
                    <button className="absolute top-4 right-4 text-white p-2 bg-black/50 rounded-full hover:bg-black/80" onClick={() => setIsSketchupZoomed(false)}><CloseIcon className="h-6 w-6" /></button>
                </div>
            )}
        </div>
    );
};

export default AIArchitectureTool;