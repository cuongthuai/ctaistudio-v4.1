
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';

// --- ICONS ---
const CloseIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const UploadIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-500 group-hover:text-yellow-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>);
const PlaceholderIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-zinc-500 dark:text-zinc-600 my-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>);
const LoadingSpinner: React.FC<{text?: string}> = ({ text }) => ( <div role="status" className="flex flex-col items-center text-center text-zinc-500 dark:text-zinc-400"><svg aria-hidden="true" className="w-10 h-10 mb-3 text-zinc-200 dark:text-zinc-600 animate-spin fill-yellow-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg><h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-300">{text || 'Đang xử lý...'}</h3><p className="mt-1 text-sm">{text ? '' : 'AI đang làm việc, vui lòng chờ.'}</p><span className="sr-only">Loading...</span></div>);
const ErrorIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const ZoomIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>);
const DownloadIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.086V3a1 1 0 112 0v8.086l1.293-1.379a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const SparklesIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.172a2 2 0 00.586 1.414l2.828 2.828a2 2 0 002.828 0l2.828-2.828A2 2 0 0015 4.172V3a1 1 0 10-2 0v1.172a.5.5 0 01-.146.354l-2.828 2.828a.5.5 0 01-.708 0L6.464 4.526A.5.5 0 016 4.172V3a1 1 0 00-1-1zm10 4a1 1 0 00-1 1v6.828a2 2 0 00.586 1.414l2.828 2.828a2 2 0 002.828 0l2.828-2.828A2 2 0 0021 13.828V7a1 1 0 10-2 0v6.828a.5.5 0 01-.146.354l-2.828 2.828a.5.5 0 01-.708 0L12.464 14.18A.5.5 0 0112 13.828V7a1 1 0 00-1-1zM2 5a1 1 0 00-1 1v6.828a2 2 0 00.586 1.414l2.828 2.828a2 2 0 002.828 0l2.828-2.828A2 2 0 0011 13.828V7a1 1 0 10-2 0v6.828a.5.5 0 01-.146.354l-2.828 2.828a.5.5 0 01-.708 0L2.464 14.18A.5.5 0 012 13.828V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>);


const provincesOfVietnam = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'];

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
        <select value={value} onChange={onChange} aria-label={label} className="w-full appearance-none bg-white dark:bg-zinc-800 border-2 border-gray-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-300 px-4 py-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm">
            {children}
        </select>
        <svg className="absolute right-3 bottom-3 w-4 h-4 text-zinc-500 dark:text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
    </div>
);

const NumberInput: React.FC<{ label: string; value: number; onChange: (value: number) => void; min?: number; max?: number }> = ({ label, value, onChange, min = 0, max = 20 }) => (
    <div>
        <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">{label}</label>
        <div className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-lg p-1 border-2 border-gray-300 dark:border-zinc-700">
            <button onClick={() => onChange(Math.max(min, value - 1))} className="px-4 py-1 text-xl font-bold text-zinc-800 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-md transition-colors">-</button>
            <span className="text-lg font-bold text-black dark:text-white tabular-nums">{value}</span>
            <button onClick={() => onChange(Math.min(max, value + 1))} className="px-4 py-1 text-xl font-bold text-zinc-800 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-md transition-colors">+</button>
        </div>
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

const LandPlotEditor: React.FC<{
    image: string | null;
    onImageUpdate: (dataUrl: string) => void;
    onClear: () => void;
    mask: string | null;
    onMaskChange: (maskDataUrl: string | null) => void;
    label: string;
}> = ({ image, onImageUpdate, onClear, mask, onMaskChange, label }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const isDrawing = useRef(false);
    const startPoint = useRef<{ x: number; y: number } | null>(null);
    
    const getCoords = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const clearMask = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
        onMaskChange(null);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        clearMask();
        isDrawing.current = true;
        startPoint.current = getCoords(e);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing.current || !startPoint.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const currentPoint = getCoords(e);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(250, 204, 21, 0.5)'; // yellow-400 with 50% opacity
        ctx.strokeStyle = 'rgba(250, 204, 21, 1)'; // yellow-400 solid
        ctx.lineWidth = 2;
        ctx.fillRect(startPoint.current.x, startPoint.current.y, currentPoint.x - startPoint.current.x, currentPoint.y - startPoint.current.y);
        ctx.strokeRect(startPoint.current.x, startPoint.current.y, currentPoint.x - startPoint.current.x, currentPoint.y - startPoint.current.y);
    };

    const handleMouseUp = () => {
        if (!isDrawing.current) return;
        isDrawing.current = false;
        const canvas = canvasRef.current;
        if (canvas) {
            onMaskChange(canvas.toDataURL());
        }
        startPoint.current = null;
    };

    const handleFileRead = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => onImageUpdate(reader.result as string);
        reader.readAsDataURL(file);
    }, [onImageUpdate]);
    
    useEffect(() => {
        const img = imageRef.current;
        const canvas = canvasRef.current;
        if (img && canvas) {
            const setSize = () => {
                canvas.width = img.clientWidth;
                canvas.height = img.clientHeight;
                clearMask();
            };
            img.onload = setSize;
            if (img.complete) setSize();
            
            const resizeObserver = new ResizeObserver(setSize);
            resizeObserver.observe(img);
            return () => resizeObserver.disconnect();
        }
    }, [image]);

    if (!image) {
        return (
          <div className="relative aspect-video bg-gray-100 dark:bg-zinc-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-700 flex flex-col items-center justify-center text-center transition-colors hover:border-yellow-400 group cursor-pointer">
            <UploadIcon />
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mt-2">{label}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">hoặc <span className="text-yellow-400 font-semibold">nhấn vào đây</span></p>
            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label={label} onChange={(e) => e.target.files && handleFileRead(e.target.files[0])} accept="image/png, image/jpeg, image/webp" />
          </div>
        );
    }

    return (
         <div className="relative group">
            <img ref={imageRef} src={image} alt="Land Plot" className="w-full h-auto object-contain rounded-lg border border-gray-300 dark:border-zinc-700" />
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />
            <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 {mask && <button onClick={clearMask} className="bg-yellow-400 text-black p-2 rounded-full hover:bg-yellow-300 transition-colors" title="Xóa vùng chọn">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                </button>}
                <button onClick={onClear} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors" title="Xóa ảnh">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
interface AIEngineeringToolProps { onBack: () => void; }

type ArchResultType = 'perspective' | 'plan' | 'elevation' | 'section';
type ArchResults = Record<ArchResultType, string | null>;

type StructureDrawingType = 'beam' | 'column' | 'foundation' | 'roof';
type StructureDrawings = Record<StructureDrawingType, string | null>;
interface StructureResult {
    table: any[] | null;
    drawings: StructureDrawings;
}

const AIEngineeringTool: React.FC<AIEngineeringToolProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'architecture' | 'structure' | 'mep'>('architecture');
    const [isLoading, setIsLoading] = useState(false);
    const [isDetailing, setIsDetailing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(420);
    const isResizing = useRef(false);

    // Architecture state
    const [landImage, setLandImage] = useState<string | null>(null);
    const [landImageMask, setLandImageMask] = useState<string | null>(null);
    const [landWidth, setLandWidth] = useState(10);
    const [landLength, setLandLength] = useState(20);
    const [archPrompt, setArchPrompt] = useState('');
    const [numBedrooms, setNumBedrooms] = useState(3);
    const [numBathrooms, setNumBathrooms] = useState(2);
    const [numLivingRooms, setNumLivingRooms] = useState(1);
    const [numKitchens, setNumKitchens] = useState(1);
    const [numDiningRooms, setNumDiningRooms] = useState(1);
    const [floors, setFloors] = useState(2);
    const [floorHeights, setFloorHeights] = useState<number[]>([3.6, 3.3]);
    const [roofType, setRoofType] = useState('Mái bằng');
    const [archStyle, setArchStyle] = useState('Hiện đại');
    const [archResults, setArchResults] = useState<ArchResults>({ perspective: null, plan: null, elevation: null, section: null });
    const [selectedArchImageType, setSelectedArchImageType] = useState<ArchResultType>('perspective');

    const [location, setLocation] = useState('TP. Hồ Chí Minh');
    const [constructionYear, setConstructionYear] = useState(new Date().getFullYear());
    const [archMaterials, setArchMaterials] = useState<string[]>([]);
    const [archEnvironment, setArchEnvironment] = useState('Thành thị');

    const materialOptions = [ { value: 'Bê tông', label: 'Bê tông' }, { value: 'Kính', label: 'Kính' }, { value: 'Gỗ', label: 'Gỗ' }, { value: 'Thép', label: 'Thép' }, { value: 'Gạch', label: 'Gạch' }, ];
    const environmentOptions = [ { value: 'Thành thị', label: 'Thành thị' }, { value: 'Nông thôn', label: 'Nông thôn' }, { value: 'Ven biển', label: 'Ven biển' }, { value: 'Miền núi', label: 'Miền núi' }, { value: 'Ngoại ô', label: 'Ngoại ô' }, ];

    // Structure state
    const [structureDrawing, setStructureDrawing] = useState<string | null>(null);
    const [structureResult, setStructureResult] = useState<StructureResult | null>(null);
    const [selectedStructureDrawing, setSelectedStructureDrawing] = useState<StructureDrawingType | null>(null);

    // MEP state
    const [mepDrawing, setMepDrawing] = useState<string | null>(null);
    const [mepSystem, setMepSystem] = useState('Điện (Chiếu sáng)');
    const [mepResult, setMepResult] = useState<string | null>(null);
    const [mepOverlayOpacity, setMepOverlayOpacity] = useState(0.8);

    // --- Resizable Divider Logic ---
    const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizing.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const handleResizeMouseUp = useCallback(() => {
        isResizing.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    const handleResizeMouseMove = useCallback((e: MouseEvent) => {
        if (isResizing.current) {
            const newWidth = e.clientX;
            if (newWidth >= 360 && newWidth <= 800) {
                setSidebarWidth(newWidth);
            }
        }
    }, []);
    
    useEffect(() => {
        window.addEventListener('mousemove', handleResizeMouseMove);
        window.addEventListener('mouseup', handleResizeMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleResizeMouseMove);
            window.removeEventListener('mouseup', handleResizeMouseUp);
        };
    }, [handleResizeMouseMove, handleResizeMouseUp]);

    useEffect(() => {
        setFloorHeights(currentHeights => {
            const newHeights = [...currentHeights];
            const defaultHeight = 3.3; // Default for new floors
            if (floors > newHeights.length) {
                for (let i = newHeights.length; i < floors; i++) {
                    newHeights.push(currentHeights[currentHeights.length - 1] || defaultHeight);
                }
            } else if (floors < newHeights.length) {
                return newHeights.slice(0, floors);
            }
            return newHeights;
        });
    }, [floors]);
    
    const handleFloorHeightChange = (index: number, value: string) => {
        const newHeights = [...floorHeights];
        newHeights[index] = parseFloat(value) || 0;
        setFloorHeights(newHeights);
    };

    const handleGenerateArchitecture = async () => {
        if (!archPrompt.trim()) { setError('Vui lòng nhập yêu cầu công năng.'); return; }
        setIsLoading(true); setError(null);
        setArchResults({ perspective: null, plan: null, elevation: null, section: null });
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let basePrompt = `Yêu cầu công năng: "${archPrompt}". Phong cách kiến trúc: "${archStyle}". Công trình có ${floors} tầng, chiều cao các tầng lần lượt là ${floorHeights.join('m, ')}m. Mái: ${roofType}. Số phòng: ${numBedrooms} phòng ngủ, ${numBathrooms} phòng vệ sinh, ${numLivingRooms} phòng khách, ${numDiningRooms} phòng ăn, ${numKitchens} bếp. Địa điểm xây dựng: ${location}, năm ${constructionYear}. Bối cảnh: ${archEnvironment}. Vật liệu chủ đạo: ${archMaterials.length > 0 ? archMaterials.join(', ') : 'không xác định'}.`;
            if (landImage) {
                 if (landImageMask) { basePrompt += ` Hãy thiết kế công trình BÊN TRONG khu vực được đánh dấu trên ảnh mảnh đất (ảnh mask đi kèm). Kích thước khu đất khoảng ${landWidth}m x ${landLength}m.`;
                 } else { basePrompt += ` Hãy thiết kế công trình dựa trên mảnh đất được cung cấp trong hình ảnh, đặt công trình ở vị trí hợp lý trên khu đất đó. Kích thước khu đất khoảng ${landWidth}m x ${landLength}m.`; }
            }

            const prompts: Record<ArchResultType, string> = {
                perspective: `${basePrompt} Yêu cầu chính: Tạo một hình ảnh phối cảnh ngoại thất tổng thể, chuyên nghiệp, rõ nét.`,
                plan: `${basePrompt} Yêu cầu chính: Tạo một bản vẽ mặt bằng kiến trúc tầng điển hình, có thể hiện đồ nội thất cơ bản, ký hiệu và kích thước sơ bộ.`,
                elevation: `${basePrompt} Yêu cầu chính: Tạo một bản vẽ mặt đứng chính của công trình theo phong cách bản vẽ kỹ thuật.`,
                section: `${basePrompt} Yêu cầu chính: Tạo một bản vẽ mặt cắt dọc qua khu vực cầu thang hoặc không gian chính, thể hiện chiều cao tầng.`,
            };
            
            const landImagePart = landImage ? { inlineData: { mimeType: landImage.match(/:(.*?);/)?.[1]!, data: landImage.split(',')[1] } } : null;
            const maskImagePart = landImageMask ? { inlineData: { mimeType: landImageMask.match(/:(.*?);/)?.[1]!, data: landImageMask.split(',')[1] } } : null;

            const generationPromises = (Object.keys(prompts) as ArchResultType[]).map(key => {
                const contentParts: any[] = [];
                if (landImagePart) contentParts.push(landImagePart);
                if (maskImagePart) contentParts.push(maskImagePart);
                contentParts.push({ text: prompts[key] });
                
                return ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: contentParts },
                    config: { responseModalities: [Modality.IMAGE] },
                });
            });

            const responses = await Promise.all(generationPromises);
            
            const newResults: ArchResults = { perspective: null, plan: null, elevation: null, section: null };
            (Object.keys(prompts) as ArchResultType[]).forEach((key, index) => {
                const part = responses[index].candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                if (part?.inlineData) {
                    newResults[key] = `data:image/png;base64,${part.inlineData.data}`;
                }
            });
            
            setArchResults(newResults);
            setSelectedArchImageType('perspective');

        } catch (e) { console.error(e); setError(`Đã xảy ra lỗi: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
        } finally { setIsLoading(false); }
    };
    
    const handleGenerateDetails = async () => {
        const imageTypeToDetail = selectedArchImageType;
        if (imageTypeToDetail !== 'plan' && imageTypeToDetail !== 'elevation' && imageTypeToDetail !== 'section') { setError('Chỉ có thể bổ chi tiết cho mặt bằng, mặt đứng, và mặt cắt.'); return; }

        const imageToDetail = archResults[imageTypeToDetail];
        if (!imageToDetail) { setError(`Không có hình ảnh '${imageTypeToDetail}' để bổ chi tiết.`); return; }

        setIsDetailing(true); setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            let prompt = '';
            switch (imageTypeToDetail) {
                case 'plan': prompt = "Từ hình ảnh mặt bằng kiến trúc này, hãy tạo ra một bản vẽ kỹ thuật chi tiết hơn. Bổ sung các đường kích thước tiêu chuẩn, chú thích tên phòng, ký hiệu cửa đi/cửa sổ, và thể hiện độ dày tường. Phong cách phải giống như một bản vẽ CAD chuyên nghiệp. Giữ nguyên bố cục tổng thể."; break;
                case 'elevation': prompt = "Từ bản vẽ mặt đứng này, hãy bổ sung các đường kích thước cao độ tầng, cao độ cửa sổ, và chú thích vật liệu hoàn thiện mặt ngoài theo tiêu chuẩn bản vẽ kỹ thuật."; break;
                case 'section': prompt = "Từ bản vẽ mặt cắt này, hãy bổ sung kích thước cao độ, chi tiết kết cấu sàn/mái, và chú thích các lớp vật liệu theo tiêu chuẩn bản vẽ kỹ thuật."; break;
            }
            
            const imagePart = { inlineData: { mimeType: imageToDetail.match(/:(.*?);/)?.[1]!, data: imageToDetail.split(',')[1] } };
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts: [imagePart, { text: prompt }] }, config: { responseModalities: [Modality.IMAGE] } });
            
            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part?.inlineData) {
                setArchResults(prev => ({ ...prev, [imageTypeToDetail]: `data:image/png;base64,${part.inlineData.data}` }));
            } else { throw new Error("AI không thể tạo ra bản vẽ chi tiết."); }
        } catch (e) { console.error(e); setError(`Lỗi khi bổ chi tiết: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
        } finally { setIsDetailing(false); }
    };

    const handleAnalyzeStructure = async () => {
        if (!structureDrawing) { setError('Vui lòng tải lên một bản vẽ kiến trúc (mặt bằng, mặt đứng, hoặc mặt cắt).'); return; }
        setIsLoading(true); setError(null); setStructureResult(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = { inlineData: { mimeType: structureDrawing.match(/:(.*?);/)?.[1]!, data: structureDrawing.split(',')[1] } };
            
            const tablePrompt = `Dựa trên bản vẽ kiến trúc được cung cấp, hãy phân tích và đưa ra một bảng thống kê sơ bộ các cấu kiện kết cấu chính. Bảng phải bao gồm các cột: "Hạng mục" (ví dụ: Móng, Cột, Dầm, Sàn), "Vật liệu đề xuất" (ví dụ: Bê tông cốt thép M250), "Thông số kỹ thuật sơ bộ" (ví dụ: Cột 200x200, Thép chủ 4d16), và "Ghi chú". Trả về kết quả dưới dạng một mảng JSON.`;
            const tableResponse = await ai.models.generateContent({
                model: 'gemini-2.5-pro', contents: { parts: [imagePart, { text: tablePrompt }] },
                config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { 'Hạng mục': { type: Type.STRING }, 'Vật liệu đề xuất': { type: Type.STRING }, 'Thông số kỹ thuật sơ bộ': { type: Type.STRING }, 'Ghi chú': { type: Type.STRING } } } } }
            });
            const tableData = JSON.parse(tableResponse.text);

            const drawingPrompts: Record<StructureDrawingType, string> = {
                foundation: "Từ bản vẽ kiến trúc này, tạo một bản vẽ chi tiết kết cấu móng và sàn điển hình.",
                column: "Từ bản vẽ kiến trúc này, tạo một bản vẽ chi tiết kết cấu cột điển hình.",
                beam: "Từ bản vẽ kiến trúc này, tạo một bản vẽ chi tiết kết cấu dầm điển hình.",
                roof: "Từ bản vẽ kiến trúc này, tạo một bản vẽ chi tiết kết cấu mái điển hình.",
            };

            const drawingPromises = (Object.keys(drawingPrompts) as StructureDrawingType[]).map(key =>
                ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts: [imagePart, { text: drawingPrompts[key] }] }, config: { responseModalities: [Modality.IMAGE] } })
            );
            const drawingResponses = await Promise.all(drawingPromises);
            const drawings: StructureDrawings = { beam: null, column: null, foundation: null, roof: null };
            (Object.keys(drawingPrompts) as StructureDrawingType[]).forEach((key, index) => {
                const part = drawingResponses[index].candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                if (part?.inlineData) { drawings[key] = `data:image/png;base64,${part.inlineData.data}`; }
            });

            setStructureResult({ table: tableData, drawings: drawings });
            setSelectedStructureDrawing('foundation');
        } catch (e) { console.error(e); setError(`Đã xảy ra lỗi khi phân tích kết cấu: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
        } finally { setIsLoading(false); }
    };
    
    const handleGenerateMEP = async () => {
        if (!mepDrawing) { setError('Vui lòng tải lên mặt bằng kiến trúc.'); return; }
        setIsLoading(true); setError(null); setMepResult(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let systemDescription = '';
            switch (mepSystem) {
                case 'Điện (Chiếu sáng)':
                    systemDescription = 'hệ thống chiếu sáng. Hãy chỉ vị trí đèn trần (màu vàng) và đèn tường (màu cam).';
                    break;
                case 'Điện (Cấp nguồn)':
                    systemDescription = 'hệ thống cấp nguồn điện. Hãy chỉ vị trí ổ cắm (màu đỏ) và công tắc (màu xanh dương).';
                    break;
                case 'Nước':
                    systemDescription = 'hệ thống cấp thoát nước. Hãy chỉ vị trí và đường đi của các đường ống nước.';
                    break;
                case 'Điều hoà':
                    systemDescription = 'hệ thống điều hòa không khí. Hãy chỉ vị trí đặt các dàn lạnh, dàn nóng và đường ống đồng.';
                    break;
                case 'Camera':
                    systemDescription = 'hệ thống camera an ninh. Hãy chỉ vị trí camera trong nhà (màu tím) và camera ngoài trời (màu xanh lá).';
                    break;
                default:
                    systemDescription = `hệ thống ${mepSystem}`;
            }

            const promptText = `Từ hình ảnh mặt bằng kiến trúc này, hãy tạo một bản vẽ kỹ thuật chi tiết cho ${systemDescription}. Bản vẽ phải bao gồm các ký hiệu tiêu chuẩn, đường đi của hệ thống, và các chú thích cần thiết. Phong cách bản vẽ phải rõ ràng, chuyên nghiệp như một bản vẽ CAD. **Quan trọng: Hình ảnh kết quả phải có nền trong suốt (transparent background), chỉ chứa các đường nét và ký hiệu đã vẽ thêm.**`;
            const imagePart = { inlineData: { mimeType: mepDrawing.match(/:(.*?);/)?.[1]!, data: mepDrawing.split(',')[1] } };
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts: [imagePart, { text: promptText }] }, config: { responseModalities: [Modality.IMAGE] } });
            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part?.inlineData) { setMepResult(`data:image/png;base64,${part.inlineData.data}`);
            } else { throw new Error("AI không thể tạo ra bản vẽ ME. Vui lòng thử lại."); }
        } catch (e) { console.error(e); setError(`Đã xảy ra lỗi: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
        } finally { setIsLoading(false); }
    };

    const selectedImageUrl = activeTab === 'architecture' ? archResults[selectedArchImageType] : 
                             (activeTab === 'structure' && selectedStructureDrawing && structureResult) ? structureResult.drawings[selectedStructureDrawing] :
                             (activeTab === 'mep' ? mepResult : null);

    return (
        <div className="w-full h-full flex flex-col animate-fade-in bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
                <h1 className="text-xl font-bold text-black dark:text-white">AI Kỹ thuật</h1>
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" aria-label="Close"><CloseIcon /></button>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
                <aside 
                    className="w-full lg:flex-shrink-0 bg-gray-50 dark:bg-zinc-900/30 p-4 sm:p-6 flex flex-col lg:max-h-full"
                    style={{ flexBasis: 'auto', width: '100%', maxWidth: '100%', '@media (min-width: 1024px)': { width: `${sidebarWidth}px`, maxWidth: '800px' } }}
                >
                    <div className='flex-1 min-h-0 overflow-y-auto'>
                        <div className="flex bg-gray-200 dark:bg-zinc-700/50 p-1 rounded-lg mb-6 sticky top-0 z-10 backdrop-blur-sm">
                            <button onClick={() => setActiveTab('architecture')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${activeTab === 'architecture' ? 'bg-yellow-400 text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>Thiết kế Kiến trúc</button>
                            <button onClick={() => setActiveTab('structure')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${activeTab === 'structure' ? 'bg-yellow-400 text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>Tính toán Kết cấu</button>
                            <button onClick={() => setActiveTab('mep')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${activeTab === 'mep' ? 'bg-yellow-400 text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>Thiết kế ME</button>
                        </div>

                        <div className="space-y-6">
                            {activeTab === 'architecture' && (
                                <>
                                    <section>
                                        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Thông số Mảnh đất & Vị trí</h2>
                                        <div className="space-y-4">
                                            <LandPlotEditor image={landImage} onImageUpdate={setLandImage} onClear={() => { setLandImage(null); setLandImageMask(null); }} mask={landImageMask} onMaskChange={setLandImageMask} label="Tải ảnh và khoanh vùng đất" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <NumberInput label="Chiều rộng đất (m)" value={landWidth} onChange={setLandWidth} max={200}/>
                                                <NumberInput label="Chiều dài đất (m)" value={landLength} onChange={setLandLength} max={200}/>
                                            </div>
                                            <CustomSelect label="Địa điểm xây dựng" value={location} onChange={(e) => setLocation(e.target.value)}>
                                                {provincesOfVietnam.map(province => (<option key={province} value={province}>{province}</option>))}
                                            </CustomSelect>
                                        </div>
                                    </section>
                                    <section>
                                        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Yêu cầu Công năng & Bố trí</h2>
                                        <textarea value={archPrompt} onChange={(e) => setArchPrompt(e.target.value)} placeholder="VD: Nhà 2 tầng, 3 phòng ngủ, có sân vườn. Phòng khách và bếp ở góc Đông Nam mảnh đất..." rows={4} className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 placeholder-zinc-500 p-3 rounded-lg border-2 border-gray-300 dark:border-zinc-700/80 focus:border-yellow-400 focus:ring-0 outline-none transition-colors resize-none text-sm"/>
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <NumberInput label="Phòng ngủ" value={numBedrooms} onChange={setNumBedrooms} />
                                            <NumberInput label="Vệ sinh" value={numBathrooms} onChange={setNumBathrooms} />
                                            <NumberInput label="Phòng khách" value={numLivingRooms} onChange={setNumLivingRooms} />
                                            <NumberInput label="Bếp" value={numKitchens} onChange={setNumKitchens} />
                                            <NumberInput label="Phòng ăn" value={numDiningRooms} onChange={setNumDiningRooms} />
                                        </div>
                                    </section>
                                    <section className="space-y-4">
                                        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Thông số Thiết kế</h2>
                                        <div className="grid grid-cols-2 gap-4">
                                            <NumberInput label="Số tầng" value={floors} onChange={(val) => setFloors(val < 1 ? 1 : val)} min={1} />
                                            <div>
                                                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Năm xây dựng</label>
                                                <input type="number" value={constructionYear} onChange={(e) => setConstructionYear(Number(e.target.value))} className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 p-2.5 rounded-lg border-2 border-gray-300 dark:border-zinc-700 focus:border-yellow-400 focus:ring-0 outline-none"/>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {floorHeights.map((height, index) => (
                                                <div key={index} className="flex items-center gap-3">
                                                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 flex-1">Cao Tầng {index + 1} (m)</label>
                                                    <input type="number" value={height} onChange={(e) => handleFloorHeightChange(index, e.target.value)} step="0.1" className="w-24 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 p-2 text-center rounded-lg border-2 border-gray-300 dark:border-zinc-700 focus:border-yellow-400 focus:ring-0 outline-none"/>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <CustomSelect label="Loại mái" value={roofType} onChange={e => setRoofType(e.target.value)}>
                                                <option>Mái bằng</option><option>Mái Thái</option><option>Mái Nhật</option><option>Mái tôn</option>
                                            </CustomSelect>
                                            <CustomSelect label="Phong cách kiến trúc" value={archStyle} onChange={e => setArchStyle(e.target.value)}>
                                                <option>Hiện đại</option><option>Tân cổ điển</option><option>Tối giản</option><option>Indochine</option><option>Brutalist</option>
                                            </CustomSelect>
                                        </div>
                                        <MultiSelectDropdown label="Vật liệu chủ đạo" options={materialOptions} selected={archMaterials} onChange={setArchMaterials} />
                                        <CustomSelect label="Bối cảnh" value={archEnvironment} onChange={e => setArchEnvironment(e.target.value)}>
                                            {environmentOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </CustomSelect>
                                    </section>
                                </>
                            )}
                            {activeTab === 'structure' && ( <section><h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Bản vẽ kiến trúc</h2><ImageUploadArea image={structureDrawing} onImageUpdate={setStructureDrawing} onClear={() => setStructureDrawing(null)} label="Tải lên bản vẽ" /></section> )}
                            {activeTab === 'mep' && ( <> <section><h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Mặt bằng kiến trúc</h2><ImageUploadArea image={mepDrawing} onImageUpdate={setMepDrawing} onClear={() => setMepDrawing(null)} label="Tải lên mặt bằng" /></section>
                            <section>
                                <CustomSelect label="Hệ thống ME" value={mepSystem} onChange={e => setMepSystem(e.target.value)}>
                                    <option value="Điện (Chiếu sáng)">Điện (Chiếu sáng)</option>
                                    <option value="Điện (Cấp nguồn)">Điện (Cấp nguồn)</option>
                                    <option value="Nước">Nước</option>
                                    <option value="Điều hoà">Điều hoà</option>
                                    <option value="Camera">Camera</option>
                                </CustomSelect>
                            </section>
                            </> )}
                        </div>
                    </div>
                    
                    <footer className="mt-auto pt-6 flex-shrink-0">
                        <button onClick={activeTab === 'architecture' ? handleGenerateArchitecture : activeTab === 'structure' ? handleAnalyzeStructure : handleGenerateMEP} className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-600 disabled:cursor-not-allowed" disabled={isLoading || isDetailing}>
                            {isLoading ? 'Đang tạo...' : (isDetailing ? 'Đang bổ chi tiết...' : 'Tạo kết quả')}
                        </button>
                    </footer>
                </aside>
                
                <div
                    className="w-1.5 cursor-col-resize bg-gray-300 dark:bg-zinc-700 hover:bg-yellow-500 transition-colors hidden lg:block flex-shrink-0"
                    onMouseDown={handleResizeMouseDown}
                />

                <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gray-200 dark:bg-black/40 overflow-y-auto">
                    {isLoading || isDetailing ? <LoadingSpinner text={isDetailing ? 'Đang bổ chi tiết kỹ thuật...' : (isLoading && activeTab === 'structure' ? 'Đang phân tích kết cấu...' : 'Đang tạo bộ phương án...')} /> : error ? (
                        <div className="text-center text-red-500 flex flex-col items-center"><ErrorIcon /><h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2><p className="mt-1 max-w-md">{error}</p></div>
                    ) : (
                        <>
                            {activeTab === 'architecture' && (
                                (archResults.perspective || archResults.plan) ? (
                                    <div className="flex flex-col w-full h-full gap-4">
                                        <div className="flex-1 w-full bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-lg flex items-center justify-center overflow-hidden relative group/main">
                                            {selectedImageUrl ? <img src={selectedImageUrl} alt="Selected view" className="max-w-full max-h-full object-contain animate-fade-in"/> : <PlaceholderIcon />}
                                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover/main:opacity-100 transition-opacity">
                                                <button onClick={() => setIsZoomed(true)} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Phóng to"><ZoomIcon /></button>
                                                <a href={selectedImageUrl || ''} download={`ctai-design-${selectedArchImageType}.png`} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Tải xuống"><DownloadIcon /></a>
                                                {['plan', 'elevation', 'section'].includes(selectedArchImageType) && (
                                                    <button onClick={handleGenerateDetails} disabled={isDetailing} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed" title="Bổ chi tiết kỹ thuật"><SparklesIcon className="w-5 h-5"/></button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 grid grid-cols-4 gap-3">
                                            {(Object.keys(archResults) as ArchResultType[]).map((key) => {
                                                const src = archResults[key];
                                                const labels: Record<ArchResultType, string> = { perspective: 'Phối cảnh', plan: 'Mặt bằng', elevation: 'Mặt đứng', section: 'Mặt cắt' };
                                                return (
                                                    <div key={key} onClick={() => setSelectedArchImageType(key)} className={`text-center cursor-pointer`}>
                                                        <div className={`aspect-square p-1 rounded-md shadow-sm border-2 transition-all duration-200 ${selectedArchImageType === key ? 'border-yellow-400 scale-105' : 'border-transparent hover:border-zinc-500'}`}>
                                                            {src ? <img src={src} alt={labels[key]} className="w-full h-full object-cover rounded-sm bg-white"/> : <div className="w-full h-full bg-gray-100 dark:bg-zinc-700 rounded-sm flex items-center justify-center text-xs text-zinc-400">Chưa có ảnh</div>}
                                                        </div>
                                                        <p className={`mt-1.5 text-xs font-semibold ${selectedArchImageType === key ? 'text-black dark:text-white' : 'text-zinc-500'}`}>{labels[key]}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : <div className="text-center text-zinc-500 flex flex-col items-center"><PlaceholderIcon /><h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Phương án Thiết kế</h2><p className="mt-1">Kết quả thiết kế sẽ hiện ở đây.</p></div>
                            )}

                             {activeTab === 'structure' && (structureResult ? (
                                <div className="flex flex-col w-full h-full gap-4">
                                     <div className="w-full bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-lg overflow-y-auto max-h-48">
                                        <h3 className="text-sm font-bold text-black dark:text-white mb-2 uppercase">Bảng tính toán kết cấu sơ bộ</h3>
                                        <table className="w-full text-xs text-left text-zinc-600 dark:text-zinc-300">
                                            <thead className="text-xs text-zinc-700 uppercase bg-gray-100 dark:bg-zinc-700 dark:text-zinc-400">
                                                <tr>
                                                    <th scope="col" className="px-2 py-2">Hạng mục</th>
                                                    <th scope="col" className="px-2 py-2">Vật liệu</th>
                                                    <th scope="col" className="px-2 py-2">Thông số</th>
                                                    <th scope="col" className="px-2 py-2">Ghi chú</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {structureResult.table?.map((row, index) => (
                                                    <tr key={index} className="border-b dark:border-zinc-700">
                                                        <td className="px-2 py-1 font-semibold">{row['Hạng mục']}</td>
                                                        <td className="px-2 py-1">{row['Vật liệu đề xuất']}</td>
                                                        <td className="px-2 py-1">{row['Thông số kỹ thuật sơ bộ']}</td>
                                                        <td className="px-2 py-1">{row['Ghi chú']}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex-1 w-full bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-lg flex items-center justify-center overflow-hidden relative group/main">
                                        {selectedImageUrl ? <img src={selectedImageUrl} alt="Selected structure drawing" className="max-w-full max-h-full object-contain animate-fade-in"/> : <PlaceholderIcon />}
                                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover/main:opacity-100 transition-opacity">
                                            <button onClick={() => setIsZoomed(true)} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Phóng to"><ZoomIcon /></button>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 grid grid-cols-4 gap-3">
                                        {(Object.keys(structureResult.drawings) as StructureDrawingType[]).map(key => {
                                            const src = structureResult.drawings[key];
                                            const labels: Record<StructureDrawingType, string> = { foundation: 'Móng, Sàn', column: 'Cột', beam: 'Dầm', roof: 'Mái' };
                                            return (
                                                <div key={key} onClick={() => setSelectedStructureDrawing(key)} className="text-center cursor-pointer">
                                                     <div className={`aspect-square p-1 rounded-md shadow-sm border-2 transition-all duration-200 ${selectedStructureDrawing === key ? 'border-yellow-400 scale-105' : 'border-transparent hover:border-zinc-500'}`}>
                                                        {src ? <img src={src} alt={labels[key]} className="w-full h-full object-cover rounded-sm bg-white"/> : <div className="w-full h-full bg-gray-100 dark:bg-zinc-700 rounded-sm flex items-center justify-center text-xs text-zinc-400">Chưa có ảnh</div>}
                                                    </div>
                                                    <p className={`mt-1.5 text-xs font-semibold ${selectedStructureDrawing === key ? 'text-black dark:text-white' : 'text-zinc-500'}`}>{labels[key]}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                             ) : <div className="text-center text-zinc-500 flex flex-col items-center"><PlaceholderIcon /><h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Phân tích Kết cấu</h2><p className="mt-1">Kết quả phân tích sẽ hiện ở đây.</p></div>)}
                            
                            {activeTab === 'mep' && (
                                mepResult ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                        <div className="flex-1 w-full relative group/main">
                                            <img src={mepDrawing || ''} alt="Mặt bằng gốc" className="absolute inset-0 w-full h-full object-contain rounded-lg shadow-lg"/>
                                            <img src={mepResult} alt={`Sơ đồ ME - ${mepSystem}`} className="absolute inset-0 w-full h-full object-contain rounded-lg transition-opacity" style={{ opacity: mepOverlayOpacity }}/>
                                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover/main:opacity-100 transition-opacity">
                                                <button onClick={() => setIsZoomed(true)} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Phóng to"><ZoomIcon /></button>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 w-full max-w-sm p-2 bg-white/10 dark:bg-zinc-800/50 backdrop-blur-sm rounded-lg">
                                            <label htmlFor="opacity-slider" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Độ mờ lớp ME</label>
                                            <input
                                                id="opacity-slider"
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.05"
                                                value={mepOverlayOpacity}
                                                onChange={(e) => setMepOverlayOpacity(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-300 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-zinc-500 flex flex-col items-center">
                                        <PlaceholderIcon />
                                        <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Sơ đồ ME</h2>
                                        <p className="mt-1">Sơ đồ hệ thống sẽ hiện ở đây.</p>
                                    </div>
                                )
                            )}

                        </>
                    )}
                </main>
            </div>

            {isZoomed && selectedImageUrl && (
                <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4 gap-4" onClick={() => setIsZoomed(false)}>
                    <div className="relative flex-1 w-full max-w-[95vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                        {activeTab === 'mep' && mepDrawing ? (
                            <>
                                <img src={mepDrawing} alt="Mặt bằng gốc (phóng to)" className="absolute inset-0 w-full h-full object-contain rounded-lg"/>
                                <img src={selectedImageUrl} alt="Sơ đồ ME (phóng to)" className="absolute inset-0 w-full h-full object-contain rounded-lg" style={{ opacity: mepOverlayOpacity }}/>
                            </>
                        ) : (
                            <img src={selectedImageUrl} alt="Zoomed view" className="w-full h-full object-contain rounded-lg bg-white" />
                        )}
                    </div>
                    {activeTab === 'mep' && (
                         <div className="flex-shrink-0 w-full max-w-sm p-2 bg-black/50 backdrop-blur-sm rounded-lg" onClick={(e) => e.stopPropagation()}>
                            <label htmlFor="zoom-opacity-slider" className="text-xs font-medium text-zinc-300">Độ mờ lớp ME</label>
                            <input
                                id="zoom-opacity-slider"
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={mepOverlayOpacity}
                                onChange={(e) => setMepOverlayOpacity(Number(e.target.value))}
                                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                            />
                        </div>
                    )}
                    <button className="absolute top-4 right-4 text-white p-2 bg-black/50 rounded-full hover:bg-black/80" onClick={() => setIsZoomed(false)}><CloseIcon className="h-6 w-6" /></button>
                </div>
            )}
        </div>
    );
};

export default AIEngineeringTool;
