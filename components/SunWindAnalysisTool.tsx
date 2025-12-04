
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { BackIcon } from './icons/ChatIcons';

// --- ICONS ---
const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-500 group-hover:text-yellow-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);
const CloseIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const PlaceholderIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-zinc-500 dark:text-zinc-600 my-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
);
const LoadingSpinner: React.FC<{text?: string}> = ({ text }) => (
    <div role="status" className="flex flex-col items-center text-center text-zinc-500 dark:text-zinc-400">
        <svg aria-hidden="true" className="w-10 h-10 mb-3 text-zinc-200 dark:text-zinc-600 animate-spin fill-yellow-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-300">{text || 'Đang phân tích...'}</h3>
        <p className="mt-1 text-sm">AI đang tính toán bố cục, nhiệt độ và khí động học.</p>
    </div>
);
const ErrorIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const ZoomIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>);
const DownloadIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.086V3a1 1 0 112 0v8.086l1.293-1.379a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const CameraIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2H4zm12 12H4a1 1 0 01-1-1V7a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1zM9 10a3 3 0 100 6 3 3 0 000-6zm-1 3a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" /></svg>);
const SparklesIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.172a2 2 0 00.586 1.414l2.828 2.828a2 2 0 002.828 0l2.828-2.828A2 2 0 0015 4.172V3a1 1 0 10-2 0v1.172a.5.5 0 01-.146.354l-2.828 2.828a.5.5 0 01-.708 0L6.464 4.526A.5.5 0 016 4.172V3a1 1 0 00-1-1zm10 4a1 1 0 00-1 1v6.828a2 2 0 00.586 1.414l2.828 2.828a2 2 0 002.828 0l2.828-2.828A2 2 0 0021 13.828V7a1 1 0 10-2 0v6.828a.5.5 0 01-.146.354l-2.828 2.828a.5.5 0 01-.708 0L12.464 14.18A.5.5 0 0112 13.828V7a1 1 0 00-1-1zM2 5a1 1 0 00-1 1v6.828a2 2 0 00.586 1.414l2.828 2.828a.5.5 0 01-.708 0L2.464 14.18A.5.5 0 012 13.828V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>);
const ThermometerIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
    </svg>
);
const PlusIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" /></svg>);
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>);
const PrinterIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
);
const JsonIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);
const SensorIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 19l-4.95-6.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);
const ManualIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M15.5 2.25a.75.75 0 00-1.06 0L8.22 8.47a.75.75 0 000 1.06l6.22 6.22a.75.75 0 001.06-1.06L10.06 9l5.44-5.44a.75.75 0 000-1.06zM4.25 3.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" />
    </svg>
);

const provincesOfVietnam = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hải Phòng', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];

interface AnalysisResult {
    sunAnalysis: string;
    windAnalysis: string;
    recommendations: { location: string; suggestion: string }[];
    thermalAnalysis?: string;
}

interface SurroundingsState {
    north: { type: string; distance: number };
    south: { type: string; distance: number };
    east: { type: string; distance: number };
    west: { type: string; distance: number };
    northeast: { type: string; distance: number };
    northwest: { type: string; distance: number };
    southeast: { type: string; distance: number };
    southwest: { type: string; distance: number };
}

const obstacleOptions = [
    'Đất trống/Thoáng',
    'Nhà thấp (< 3 tầng)',
    'Nhà cao (> 3 tầng)',
    'Cây xanh lớn'
];

const seasonOptions = [
    'Hạ chí (Tháng 6 - Nắng đứng)',
    'Đông chí (Tháng 12 - Nắng xiên)',
    'Xuân phân (Tháng 3)',
    'Thu phân (Tháng 9)'
];

const solutionContextOptions = [
    'Đô thị hiện đại, đường phố sầm uất',
    'Khu dân cư yên tĩnh, nhiều cây xanh',
    'Ven biển, bầu trời trong xanh',
    'Vùng ngoại ô thoáng đãng',
    'Khu nghỉ dưỡng, resort cao cấp',
    'Rừng nhiệt đới, thiên nhiên hoang sơ',
    'Bối cảnh hoàng hôn lãng mạn',
    'Bối cảnh ban đêm với ánh đèn lung linh'
];

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

const MultiImageUploadArea: React.FC<{
  images: string[];
  onImagesUpdate: (images: string[]) => void;
  label?: string;
}> = ({ images, onImagesUpdate, label }) => {
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
    <div className="bg-gray-100 dark:bg-zinc-800/50 p-3 rounded-lg border border-gray-300 dark:border-zinc-700">
        <p className="text-xs font-semibold text-zinc-500 mb-2">{label || 'Tải ảnh'}</p>
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
                className="relative aspect-square bg-gray-200 dark:bg-zinc-700/50 rounded-lg border-2 border-dashed border-gray-400 dark:border-zinc-600 flex flex-col items-center justify-center text-center transition-colors hover:border-yellow-400 group cursor-pointer"
            >
                <PlusIcon />
                <span className="text-[10px] mt-1 text-zinc-500">Thêm ảnh</span>
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

const CustomSelect: React.FC<{ label?: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; className?: string }> = ({ label, value, onChange, children, className }) => (
    <div className="relative w-full">
        {label && <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">{label}</label>}
        <select
            value={value}
            onChange={onChange}
            aria-label={label}
            className={`w-full appearance-none bg-white dark:bg-zinc-800 border-2 border-gray-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-300 px-4 py-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm ${className}`}
        >
            {children}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
    </div>
);

interface SunWindAnalysisToolProps { onBack: () => void; }

const SunWindAnalysisTool: React.FC<SunWindAnalysisToolProps> = ({ onBack }) => {
    const [inputImage, setInputImage] = useState<string | null>(null);
    const [aerialImage, setAerialImage] = useState<string | null>(null);
    const [floorPlanImages, setFloorPlanImages] = useState<string[]>([]);
    const [interiorImages, setInteriorImages] = useState<string[]>([]);
    
    const [location, setLocation] = useState('TP. Hồ Chí Minh');
    const [orientation, setOrientation] = useState<number>(0); // 0 = North up
    const [compassMode, setCompassMode] = useState<'manual' | 'auto'>('manual');
    const [orientationPermission, setOrientationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
    const [buildingType, setBuildingType] = useState('Nhà ở riêng lẻ');
    const [season, setSeason] = useState('Hạ chí (Tháng 6 - Nắng đứng)');
    
    // Neighborhood context state
    const [surroundings, setSurroundings] = useState<SurroundingsState>({
        north: { type: 'Đất trống/Thoáng', distance: 5 },
        south: { type: 'Đất trống/Thoáng', distance: 5 },
        east: { type: 'Đất trống/Thoáng', distance: 5 },
        west: { type: 'Đất trống/Thoáng', distance: 5 },
        northeast: { type: 'Đất trống/Thoáng', distance: 5 },
        northwest: { type: 'Đất trống/Thoáng', distance: 5 },
        southeast: { type: 'Đất trống/Thoáng', distance: 5 },
        southwest: { type: 'Đất trống/Thoáng', distance: 5 },
    });
    
    // Additional Description
    const [additionalDescription, setAdditionalDescription] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    
    const [textResult, setTextResult] = useState<AnalysisResult | null>(null);
    const [visualResult, setVisualResult] = useState<string | null>(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomedImageSrc, setZoomedImageSrc] = useState<string | null>(null);

    // Solution Generation State
    const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);
    const [solutionImage, setSolutionImage] = useState<string | null>(null);
    const [solutionDescription, setSolutionDescription] = useState('');
    const [solutionContext, setSolutionContext] = useState('Đô thị hiện đại, đường phố sầm uất');
    const [keepShape, setKeepShape] = useState(false);

    // Heat Map State
    const [isAnalyzingHeat, setIsAnalyzingHeat] = useState(false);
    const [heatMapImage, setHeatMapImage] = useState<string | null>(null);
    const [activeResultTab, setActiveResultTab] = useState<'climate' | 'heat'>('climate');

    // Compass Photo State
    const [isAnalyzingCompassPhoto, setIsAnalyzingCompassPhoto] = useState(false);
    const [compassPhotoError, setCompassPhotoError] = useState<string | null>(null);
    const [compassImagePreview, setCompassImagePreview] = useState<string | null>(null);
    const compassPhotoInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpdate = (dataUrl: string) => {
        setInputImage(dataUrl);
        setVisualResult(null);
        setTextResult(null);
        setSolutionImage(null);
        setHeatMapImage(null);
        setError(null);
        // Clear auto-generated aerial view if main image changes
        setAerialImage(null);
    };

    const handleSurroundingChange = (direction: keyof SurroundingsState, field: 'type' | 'distance', value: string | number) => {
        setSurroundings(prev => ({
            ...prev,
            [direction]: {
                ...prev[direction],
                [field]: value
            }
        }));
    };

    // --- Compass Sensor Logic ---
    const requestOrientationPermission = async () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const permissionState = await (DeviceOrientationEvent as any).requestPermission();
                if (permissionState === 'granted') {
                    setOrientationPermission('granted');
                    setCompassMode('auto');
                } else {
                    setOrientationPermission('denied');
                    alert('Quyền truy cập cảm biến la bàn đã bị từ chối.');
                }
            } catch (error) {
                console.error("Lỗi khi yêu cầu quyền truy cập cảm biến:", error);
                setOrientationPermission('denied');
            }
        } else {
            setOrientationPermission('granted');
            setCompassMode('auto');
        }
    };

    const toggleCompassMode = () => {
        if (compassMode === 'manual') {
            if (orientationPermission === 'prompt') {
                requestOrientationPermission();
            } else if (orientationPermission === 'granted') {
                setCompassMode('auto');
            } else {
                alert('Quyền truy cập la bàn đã bị từ chối. Vui lòng kiểm tra cài đặt trình duyệt.');
            }
        } else {
            setCompassMode('manual');
        }
    };

    useEffect(() => {
        const handleOrientation = (event: DeviceOrientationEvent) => {
            if (event.alpha !== null) {
                // Webkit uses webkitCompassHeading if available (0 is North)
                // Standard alpha is 0 at East (counter-clockwise) or North depending on implementation
                // For most mobile browsers:
                // iOS: webkitCompassHeading (0 = North, clockwise)
                // Android: alpha (0 = North, counter-clockwise or depends on device frame)
                
                let heading = 0;
                if ((event as any).webkitCompassHeading) {
                    heading = (event as any).webkitCompassHeading;
                } else {
                    // Fallback for non-iOS, simplified conversion
                    // Note: True North calculation on Android is complex without absolute orientation API
                    heading = (360 - event.alpha + 360) % 360; 
                }
                
                setOrientation(Math.round(heading));
            }
        };

        if (compassMode === 'auto' && orientationPermission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, true);
        }

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation, true);
        };
    }, [compassMode, orientationPermission]);


    const handleAnalyzeCompassPhoto = async (file: File) => {
        setIsAnalyzingCompassPhoto(true);
        setCompassPhotoError(null);
        setCompassImagePreview(null);

        const reader = new FileReader();
        reader.onloadend = async () => {
            const dataUrl = reader.result as string;
            setCompassImagePreview(dataUrl);
            
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const imagePart = {
                    inlineData: {
                        mimeType: file.type,
                        data: dataUrl.split(',')[1],
                    },
                };
                const textPart = {
                    text: "Phân tích hình ảnh này, đây là một la bàn đang đo hướng. Hãy xác định số độ chính xác (0-359) mà kim đang chỉ tới. Trả về kết quả dưới dạng một đối tượng JSON với khóa `degree` (number). Ví dụ: { \"degree\": 180 }."
                };

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: { parts: [imagePart, textPart] },
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                degree: { type: Type.NUMBER, description: "Số độ chính xác từ 0 đến 359" },
                            },
                            required: ["degree"]
                        }
                    }
                });
                
                const result = JSON.parse(response.text);
                if (result.degree !== undefined) {
                    const newAngle = (result.degree % 360 + 360) % 360;
                    setOrientation(Math.round(newAngle));
                    setCompassMode('manual'); // Switch to manual to lock the value
                } else {
                    throw new Error("Không tìm thấy thông tin độ.");
                }

            } catch (e) {
                console.error(e);
                setCompassPhotoError(`Lỗi: ${e instanceof Error ? e.message : 'Không xác định'}`);
                setCompassImagePreview(null);
            } finally {
                setIsAnalyzingCompassPhoto(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleCompassPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleAnalyzeCompassPhoto(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!inputImage) {
            setError('Vui lòng tải lên ảnh phối cảnh 3D.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setVisualResult(null);
        setTextResult(null);
        setSolutionImage(null);
        setActiveResultTab('climate');
        setLoadingMessage('Đang khởi tạo...');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let currentAerialImage = aerialImage;

            // 1. Auto-generate Aerial View if missing
            if (!currentAerialImage) {
                setLoadingMessage('Đang tự động tạo phối cảnh tổng thể từ trên cao...');
                try {
                    const inputPart = {
                        inlineData: {
                            mimeType: inputImage.match(/:(.*?);/)?.[1]!,
                            data: inputImage.split(',')[1],
                        },
                    };
                    const genPrompt = "Generate a high-quality, photorealistic top-down aerial view (bird's eye view) of the building shown in the input image. The view should be straight down (plan view perspective) showing the roof plan and surrounding site clearly. Maintain the architectural style and context.";
                    
                    const genRes = await ai.models.generateContent({
                        model: 'gemini-2.5-flash-image',
                        contents: { parts: [inputPart, { text: genPrompt }] },
                        config: { responseModalities: [Modality.IMAGE] },
                    });
                    const genPart = genRes.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                    if (genPart?.inlineData) {
                        currentAerialImage = `data:image/png;base64,${genPart.inlineData.data}`;
                        setAerialImage(currentAerialImage); // Update state to show user
                    }
                } catch (e) {
                    console.warn("Auto-gen aerial failed", e);
                }
            }

            setLoadingMessage('Đang phân tích khí hậu & vẽ sơ đồ...');

            const parts: any[] = [];
            
            // Image 1: Main 3D Perspective
            parts.push({
                inlineData: {
                    mimeType: inputImage.match(/:(.*?);/)?.[1]!,
                    data: inputImage.split(',')[1],
                },
            });

            // Image 2: Aerial (if exists)
            let aerialImageIndex = -1;
            if (currentAerialImage) {
                parts.push({
                    inlineData: {
                        mimeType: currentAerialImage.match(/:(.*?);/)?.[1]!,
                        data: currentAerialImage.split(',')[1],
                    },
                });
                aerialImageIndex = parts.length;
            }

            // Floor Plans
            if (floorPlanImages.length > 0) {
                floorPlanImages.forEach(img => {
                    parts.push({
                        inlineData: {
                            mimeType: img.match(/:(.*?);/)?.[1]!,
                            data: img.split(',')[1],
                        },
                    });
                });
            }

            // Interior Images
            if (interiorImages.length > 0) {
                interiorImages.forEach(img => {
                    parts.push({
                        inlineData: {
                            mimeType: img.match(/:(.*?);/)?.[1]!,
                            data: img.split(',')[1],
                        },
                    });
                });
            }

            const promptContext = (floorPlanImages.length > 0 || interiorImages.length > 0)
                ? `You are provided with a set of architectural images: 
                   - Image 1: Main 3D Perspective.
                   ${currentAerialImage ? `- Image ${aerialImageIndex}: Top-down Aerial View.` : ''}
                   - Subsequent images: Floor Plans (if any) and Interior Views (if any).
                   Analyze ALL images collectively to understand the full building design.` 
                : "You are provided with the Main 3D Perspective of the building.";

            let directionSource = `The building's main facade orientation is ${orientation} degrees relative to North (0 deg).`;
            if (compassImagePreview) {
                directionSource = `Based on a real compass photo (analyzed as ${orientation} degrees), the building's precise orientation is confirmed as ${orientation} degrees. Use this as absolute truth.`;
            }

            // 1. Text Analysis Request
            const textPrompt = `Bạn là một chuyên gia kiến trúc và phân tích khí hậu tại Việt Nam. ${promptContext}
            Thông số phân tích:
            - Địa điểm: ${location} (Dữ liệu khí hậu, hướng gió).
            - Mùa: ${season}.
            - Hướng nhà: ${directionSource}
            - Loại công trình: ${buildingType}.
            - Bối cảnh: 
              Bắc: ${surroundings.north.type} (${surroundings.north.distance}m), 
              Nam: ${surroundings.south.type} (${surroundings.south.distance}m), 
              Đông: ${surroundings.east.type} (${surroundings.east.distance}m), 
              Tây: ${surroundings.west.type} (${surroundings.west.distance}m),
              Đông Bắc: ${surroundings.northeast.type} (${surroundings.northeast.distance}m),
              Tây Bắc: ${surroundings.northwest.type} (${surroundings.northwest.distance}m),
              Đông Nam: ${surroundings.southeast.type} (${surroundings.southeast.distance}m),
              Tây Nam: ${surroundings.southwest.type} (${surroundings.southwest.distance}m).
            ${additionalDescription ? `- Yêu cầu bổ sung từ người dùng: "${additionalDescription}"` : ''}

            Hãy thực hiện phân tích toàn diện và TRẢ LỜI BẰNG TIẾNG VIỆT:
            1. **Phân tích Nắng:** Xác định các bề mặt chịu nắng gắt và bóng râm dựa trên mùa và bối cảnh lân cận.
            2. **Phân tích Gió:** Xác định đường đi của gió qua công trình (dựa trên mặt bằng/nội thất) và sự che chắn của bối cảnh.
            3. **Tiện nghi Nhiệt:** Ước tính tích tụ nhiệt ở các vùng khác nhau (mái, tường tây, nội thất).
            4. **Giải pháp Thông gió:** Đề xuất vị trí mở cửa, thông tầng hoặc thay đổi bố trí để tối ưu thông gió tự nhiên.

            Trả về JSON:
            {
                "sunAnalysis": "Phân tích chi tiết về hướng nắng và bóng đổ...",
                "windAnalysis": "Phân tích chi tiết về hướng gió và thông gió...",
                "thermalAnalysis": "Phân tích về phân bổ nhiệt và tiện nghi nhiệt...",
                "recommendations": [
                    { "location": "Vị trí cụ thể (VD: Mặt tiền Tây, Phòng khách)", "suggestion": "Giải pháp kiến trúc cụ thể..." }
                ]
            }`;

            const textResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [...parts, { text: textPrompt }] }, 
                config: { responseMimeType: "application/json" }
            });
            
            setTextResult(JSON.parse(textResponse.text));

            // 2. Composite Moodboard Request
            const visualPrompt = `Act as an expert architectural presentation designer.
            You are provided with:
            1. **Main 3D Perspective** (Image 1) - This is the INPUT IMAGE.
            ${currentAerialImage ? `2. **Aerial View** (Image ${aerialImageIndex})` : ''}
            3. **Floor Plans** and **Interior Views** (Subsequent images).
            
            Context details:
            - Location: ${location}
            - Orientation: ${orientation} degrees
            ${additionalDescription ? `- User specific focus: "${additionalDescription}"` : ''}

            **TASK:** Create a professional **"Climate Analysis Moodboard"**.
            
            **LAYOUT & COMPOSITION RULES:**
            1.  **Primary Focus:** The **Main 3D Perspective** (Image 1) MUST be the largest element.
            2.  **Analysis Overlay (On Main Perspective):**
                -   **Blue Arrows/Lines:** Represent wind direction and airflow.
                -   **Yellow Lines/Arcs:** Represent sunlight direction.
                -   **Red Gradient/Highlights:** Represent heat radiation.
            3.  **Sun Path Diagram Overlay:**
                -   **CRITICAL:** Overlay a **scientific Sun Path Diagram (Solar Chart)** similar to Gaisma or standard architectural solar studies. 
                -   It should look like a wireframe dome or a 2D polar chart showing the sun's trajectory arcs for different months/seasons (Summer Solstice, Equinox, Winter Solstice) and hour loops.
                -   Place this diagram prominently, either superimposed over the building (3D dome style) or as a clear graphic on the Aerial View/Plan View.
                -   Mark the current season's path clearly.
            4.  **Secondary Elements:**
                ${currentAerialImage ? `-   Include the **Aerial View**.` : ''}
                -   Include Floor Plans (if available) with ventilation arrows.
            
            **STYLE:**
            -   Architectural competition board style.
            -   Clean, modern layout.
            -   The result must be a SINGLE composite image.
            -   **DO NOT** change the design of the building in the Main Perspective. Only overlay analysis graphics.
            `;

            const visualResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [...parts, { text: visualPrompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });

            const visualPart = visualResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (visualPart?.inlineData) {
                setVisualResult(`data:image/png;base64,${visualPart.inlineData.data}`);
            } else {
                console.warn("Visual generation failed or returned no image.");
            }

        } catch (e) {
            console.error(e);
            setError(`Đã xảy ra lỗi: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleGenerateHeatMap = async () => {
        if (!inputImage) return;
        setIsAnalyzingHeat(true);
        setError(null);
        setActiveResultTab('heat');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const imagePart = {
                inlineData: {
                    mimeType: inputImage.match(/:(.*?);/)?.[1]!,
                    data: inputImage.split(',')[1],
                },
            };

            const prompt = `Act as a Thermal Imaging Camera Simulator.
            Input: 3D perspective of a building.
            Context: Location ${location}, Season ${season}, Orientation ${orientation} degrees North.
            
            Task: Overlay a "Thermal Heat Map" on the building facade.
            - **RED/ORANGE:** High heat absorption (Roofs, West walls, exposed glass).
            - **BLUE/GREEN:** Cool/Shaded areas.
            
            Analyze specific zones (roof, walls) and apply the gradient accordingly. Keep the building form visible.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [imagePart, { text: prompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });

            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part?.inlineData) {
                setHeatMapImage(`data:image/png;base64,${part.inlineData.data}`);
            } else {
                throw new Error("Không thể tạo biểu đồ nhiệt.");
            }

        } catch (e) {
            console.error(e);
            setError(`Lỗi tạo biểu đồ nhiệt: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
        } finally {
            setIsAnalyzingHeat(false);
        }
    };

    const handleGenerateSolution = async () => {
        if (!inputImage) return;
        setIsGeneratingSolution(true);
        setError(null);
        
        let sourceImagePart = {
            inlineData: {
                mimeType: inputImage.match(/:(.*?);/)?.[1]!,
                data: inputImage.split(',')[1],
            },
        };

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            if (!keepShape) {
                // STEP 1: Convert to Sketch (Standard Mode - 2 Steps)
                setLoadingMessage('Đang tạo bản phác thảo (1/2)...');
                const sketchPrompt = "Convert this architectural image into a high-quality, detailed black and white architectural sketch. Focus on the outlines, structural elements, and perspective. Remove colors and textures to create a clean base drawing.";
                
                const sketchResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [sourceImagePart, { text: sketchPrompt }] },
                    config: { responseModalities: [Modality.IMAGE] },
                });

                const sketchPart = sketchResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                if (!sketchPart?.inlineData) {
                    throw new Error("Không thể tạo bản phác thảo (Bước 1).");
                }
                
                sourceImagePart = {
                    inlineData: {
                        mimeType: 'image/png', 
                        data: sketchPart.inlineData.data,
                    },
                };
            } else {
                setLoadingMessage('Đang xử lý hình ảnh (1/1)...');
            }
            
            // STEP 2: Generate Final (Directly or from Sketch)
            if (!keepShape) {
                setLoadingMessage('Đang render phối cảnh thực tế (2/2)...');
            }
            
            let prompt = "";
            if (keepShape) {
                // Direct Image Edit Prompt
                prompt = `Act as a world-class Architectural Photographer. 
                Input: Architectural Photo.
                Context: ${solutionContext}.
                Request: "${solutionDescription}".
                
                Task: Modify this building to be climate-responsive while **KEEPING THE ORIGINAL SHAPE AND MATERIALS** as much as possible. 
                - Add deep overhangs, louvers, or green facades for shading where necessary, but blend them naturally with the existing architecture.
                - Improve the atmosphere and lighting to match the selected context: "${solutionContext}".
                - Output must be a high-quality, photorealistic image (Canon EOS R5, 24mm lens).`;
            } else {
                // Sketch-to-Render Prompt
                prompt = `Act as a world-class Architectural Photographer and 3D Visualizer. 
                Input: Architectural Sketch. 
                Context: ${solutionContext}.
                User Request: "${solutionDescription}"
                
                Task: Transform this sketch into a sustainable, climate-responsive masterpiece based on the provided sun and wind analysis.
                1. **Climate-Responsive Design:** Apply deep overhangs or louvers for sun shading on exposed facades. Integrate green facades or vertical gardens to cool the building. Add openings for natural cross-ventilation.
                2. **Photorealism:** Create a hyper-realistic photo of the improved building. It must look like a real photograph taken by a professional (Canon EOS R5, 24mm lens, Depth of Field).
                3. **Context & Atmosphere:** Place the building in the selected context: "${solutionContext}". Use cinematic lighting, 8k resolution, highly detailed textures, and natural lighting suited to the context.
                
                **Output:** A single high-quality, photorealistic image showing the improved design in the specified context.`;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [sourceImagePart, { text: prompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });

            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part?.inlineData) {
                setSolutionImage(`data:image/png;base64,${part.inlineData.data}`);
            } else {
                throw new Error("Không thể tạo ảnh giải pháp.");
            }

        } catch (e) {
            console.error(e);
            setError(`Lỗi tạo ảnh giải pháp: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
        } finally {
            setIsGeneratingSolution(false);
            setLoadingMessage('');
        }
    };

    const handleDownload = (imageUrl: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `ctai-analysis-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintReport = () => {
        if (!textResult) return;

        const printContent = `
            <html>
                <head>
                    <title>Báo cáo Phân tích Khí hậu</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; line-height: 1.6; color: #1a1a1a; }
                        h1 { color: #1a1a1a; border-bottom: 2px solid #facc15; padding-bottom: 10px; margin-bottom: 30px; text-align: center; }
                        h2 { color: #333; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                        .meta { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9em; }
                        .meta p { margin: 5px 0; }
                        .content p { text-align: justify; }
                        .image-container { text-align: center; margin: 30px 0; page-break-inside: avoid; }
                        img { max-width: 100%; max-height: 600px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: 1px solid #eee; }
                        .recommendation { background: #fffbeb; padding: 15px; margin: 10px 0; border-left: 5px solid #facc15; border-radius: 4px; }
                        .footer { margin-top: 50px; text-align: center; font-size: 0.8em; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>BÁO CÁO PHÂN TÍCH KHÍ HẬU & KIẾN TRÚC</h1>
                    
                    <div class="meta">
                        <div>
                            <p><strong>Địa điểm:</strong> ${location}</p>
                            <p><strong>Hướng nhà:</strong> ${orientation}°</p>
                            <p><strong>Loại công trình:</strong> ${buildingType}</p>
                        </div>
                        <div>
                            <p><strong>Mùa phân tích:</strong> ${season}</p>
                            <p><strong>Ngày tạo:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
                        </div>
                    </div>

                    <div class="section content">
                        <h2>1. Phân tích Nắng & Gió</h2>
                        <p><strong>☀️ Phân tích Nắng:</strong></p>
                        <p>${textResult.sunAnalysis}</p>
                        <br/>
                        <p><strong>🌬️ Phân tích Gió:</strong></p>
                        <p>${textResult.windAnalysis}</p>
                        ${textResult.thermalAnalysis ? `<br/><p><strong>🔥 Phân tích Nhiệt:</strong></p><p>${textResult.thermalAnalysis}</p>` : ''}
                    </div>

                    ${visualResult ? `
                    <div class="section image-container">
                        <h2>2. Moodboard Phân tích Tổng hợp</h2>
                        <img src="${visualResult}" />
                        <p><em>Sơ đồ phân tích hướng nắng, gió và biểu đồ mặt trời</em></p>
                    </div>` : ''}

                    ${heatMapImage ? `
                    <div class="section image-container">
                        <h2>3. Biểu đồ Nhiệt (Thermal Map)</h2>
                        <img src="${heatMapImage}" />
                        <p><em>Mô phỏng phân bố nhiệt trên bề mặt công trình</em></p>
                    </div>` : ''}

                    <div class="section content">
                        <h2>4. Giải pháp Kiến trúc Đề xuất</h2>
                        ${textResult.recommendations.map(rec => `
                            <div class="recommendation">
                                <strong>📍 ${rec.location}:</strong> ${rec.suggestion}
                            </div>
                        `).join('')}
                    </div>

                    ${solutionImage ? `
                    <div class="section image-container">
                        <h2>5. Phối cảnh Giải pháp Thực tế</h2>
                        <img src="${solutionImage}" />
                        ${solutionDescription ? `<p><em>Ghi chú giải pháp: ${solutionDescription}</em></p>` : ''}
                    </div>` : ''}

                    <div class="footer">
                        <p>Báo cáo được tạo tự động bởi CTAI Studio - Công cụ Kiến trúc AI</p>
                    </div>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            // Wait for images to load before printing
            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
            };
        }
    };

    const handleExportJSON = () => {
        if (!textResult) return;
        const data = {
            metadata: {
                location,
                season,
                orientation,
                buildingType,
                date: new Date().toISOString()
            },
            analysis: textResult,
            images: {
                visualResult,
                heatMapImage,
                solutionImage
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ctai-climate-analysis-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const DirectionInput: React.FC<{ label: string, direction: keyof SurroundingsState }> = ({ label, direction }) => (
        <div className="grid grid-cols-12 gap-2 items-center">
            <span className="col-span-2 text-xs font-bold text-zinc-500 uppercase">{label}</span>
            <div className="col-span-6">
                <CustomSelect 
                    value={surroundings[direction].type} 
                    onChange={(e) => handleSurroundingChange(direction, 'type', e.target.value)}
                    className="py-1.5 px-2 text-xs"
                >
                    {obstacleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </CustomSelect>
            </div>
            <div className="col-span-4 relative">
                <input 
                    type="number" 
                    value={surroundings[direction].distance}
                    onChange={(e) => handleSurroundingChange(direction, 'distance', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 py-1.5 px-2 rounded-lg border-2 border-gray-300 dark:border-zinc-700 focus:border-yellow-400 focus:ring-0 outline-none text-xs text-center"
                    placeholder="m"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 pointer-events-none">m</span>
            </div>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col animate-fade-in bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
                <h1 className="text-xl font-bold text-black dark:text-white">Tính toán Hướng Nắng & Gió</h1>
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" aria-label="Close"><CloseIcon /></button>
            </header>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-[400px_1fr] overflow-hidden">
                <aside className="p-6 flex flex-col overflow-y-auto bg-gray-50 dark:bg-zinc-900/30">
                    <div className="space-y-6">
                        <section>
                            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">1. Hình ảnh đầu vào</h2>
                            <div className="space-y-3">
                                <ImageUploadArea 
                                    image={inputImage} 
                                    onImageUpdate={handleImageUpdate} 
                                    onClear={() => handleImageUpdate('')} 
                                    label="Phối cảnh 3D (Bắt buộc)"
                                />
                                <ImageUploadArea 
                                    image={aerialImage} 
                                    onImageUpdate={setAerialImage} 
                                    onClear={() => setAerialImage(null)} 
                                    label="Phối cảnh tổng thể từ trên cao (Tự tạo/Tải lên)"
                                />
                                <MultiImageUploadArea 
                                    images={floorPlanImages}
                                    onImagesUpdate={setFloorPlanImages}
                                    label="Mặt bằng các tầng (Nhiều ảnh)"
                                />
                                <MultiImageUploadArea 
                                    images={interiorImages}
                                    onImagesUpdate={setInteriorImages}
                                    label="Ảnh nội thất (Nhiều ảnh)"
                                />
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">2. Thông số môi trường</h2>
                            
                            <CustomSelect label="Địa điểm xây dựng" value={location} onChange={(e) => setLocation(e.target.value)}>
                                {provincesOfVietnam.map(province => (<option key={province} value={province}>{province}</option>))}
                            </CustomSelect>

                            <CustomSelect label="Mùa / Thời điểm" value={season} onChange={(e) => setSeason(e.target.value)}>
                                {seasonOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </CustomSelect>

                            <CustomSelect label="Loại công trình" value={buildingType} onChange={(e) => setBuildingType(e.target.value)}>
                                <option>Nhà ở riêng lẻ</option>
                                <option>Biệt thự</option>
                                <option>Chung cư cao tầng</option>
                                <option>Văn phòng</option>
                                <option>Nhà xưởng</option>
                            </CustomSelect>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400">Hướng công trình (Độ số la bàn)</label>
                                    <button onClick={toggleCompassMode} className="text-xs text-[var(--accent-color)] font-semibold hover:underline">
                                        {compassMode === 'auto' ? 'Tự động' : 'Thủ công'}
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 relative">
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="360" 
                                            value={orientation} 
                                            onChange={(e) => setOrientation(Number(e.target.value))} 
                                            className={`w-full h-2 bg-gray-300 dark:bg-zinc-700 rounded-lg appearance-none accent-yellow-400 ${compassMode === 'auto' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            disabled={compassMode === 'auto'}
                                        />
                                        <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                                            <span>B</span><span>Đ</span><span>N</span><span>T</span><span>B</span>
                                        </div>
                                    </div>
                                    {/* Compass Preview */}
                                    <div className="w-12 h-12 rounded-full border-2 border-zinc-500 relative flex items-center justify-center bg-white dark:bg-zinc-800 shadow-sm flex-shrink-0">
                                        <div className="absolute top-0 text-[8px] font-bold text-zinc-500">N</div>
                                        <div 
                                            className="w-0.5 h-5 bg-red-500 absolute top-1 origin-bottom transition-transform duration-200"
                                            style={{ transform: `rotate(${orientation}deg)` }} 
                                        />
                                        <div className="w-1.5 h-1.5 bg-zinc-900 dark:bg-white rounded-full z-10" />
                                    </div>
                                </div>
                                <div className="text-center mt-1">
                                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{orientation}°</span>
                                    {compassMode === 'auto' && <span className="ml-2 text-xs text-green-500 animate-pulse">(La bàn thiết bị)</span>}
                                </div>
                                
                                <div className="mt-4 bg-white dark:bg-zinc-800/50 p-3 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
                                    <div className="flex flex-col gap-3">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            ref={compassPhotoInputRef}
                                            onChange={handleCompassPhotoUpload}
                                            className="hidden"
                                        />
                                        <button 
                                            onClick={() => compassPhotoInputRef.current?.click()}
                                            disabled={isAnalyzingCompassPhoto}
                                            className="w-full flex items-center justify-center gap-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 font-semibold py-2 px-4 rounded-lg transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isAnalyzingCompassPhoto ? (
                                                <>
                                                    <div className="w-3 h-3 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                                                    Đang phân tích...
                                                </>
                                            ) : (
                                                <>
                                                    <CameraIcon className="w-4 h-4" />
                                                    Quét hướng từ ảnh La bàn
                                                </>
                                            )}
                                        </button>
                                        
                                        {compassImagePreview && (
                                            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 p-2 rounded-md border border-green-200 dark:border-green-800/50 animate-fade-in">
                                                <img src={compassImagePreview} alt="Compass" className="w-12 h-12 object-cover rounded-md border border-zinc-300 dark:border-zinc-600" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-green-700 dark:text-green-400">Đã xác định hướng</p>
                                                    <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate"><strong>{orientation}°</strong></p>
                                                </div>
                                                <button onClick={() => { setCompassImagePreview(null); }} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                                                    <CloseIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}

                                        {compassPhotoError && <p className="text-xs text-red-500 text-center mt-1">{compassPhotoError}</p>}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">3. Bối cảnh lân cận</h2>
                            <div className="bg-white dark:bg-zinc-800/50 p-3 rounded-lg space-y-3 border border-gray-200 dark:border-zinc-700">
                                <DirectionInput label="Bắc" direction="north" />
                                <DirectionInput label="Nam" direction="south" />
                                <DirectionInput label="Đông" direction="east" />
                                <DirectionInput label="Tây" direction="west" />
                                <DirectionInput label="Đông Bắc" direction="northeast" />
                                <DirectionInput label="Tây Bắc" direction="northwest" />
                                <DirectionInput label="Đông Nam" direction="southeast" />
                                <DirectionInput label="Tây Nam" direction="southwest" />
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">4. MÔ TẢ BỔ SUNG</h2>
                            <textarea
                                value={additionalDescription}
                                onChange={(e) => setAdditionalDescription(e.target.value)}
                                placeholder="VD: Tập trung phân tích hướng gió lùa vào phòng khách, kiểm tra nắng gắt ở ban công..."
                                rows={3}
                                className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 p-3 rounded-lg border-2 border-gray-300 dark:border-zinc-700 focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm resize-none"
                            />
                        </section>
                        
                        <section className="space-y-3">
                             <button 
                                onClick={handleGenerateHeatMap}
                                disabled={isAnalyzingHeat || !inputImage}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-2.5 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {isAnalyzingHeat ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Đang tạo bản đồ...
                                    </>
                                ) : (
                                    <>
                                        <span className="text-lg">🔥</span> Phân tích Biểu đồ Nhiệt
                                    </>
                                )}
                            </button>
                        </section>
                    </div>

                    <footer className="mt-auto pt-6">
                        <button 
                            onClick={handleAnalyze} 
                            className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-600 disabled:cursor-not-allowed" 
                            disabled={isLoading || !inputImage}
                        >
                            {isLoading ? 'Đang phân tích...' : 'Tạo Moodboard Phân tích Khí hậu'}
                        </button>
                    </footer>
                </aside>

                <main className="flex-1 flex flex-col p-4 md:p-8 bg-gray-200 dark:bg-black/40 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <LoadingSpinner text={loadingMessage || 'Đang tính toán khí hậu & vẽ sơ đồ...'} />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-red-500">
                            <ErrorIcon />
                            <h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2>
                            <p className="mt-1 max-w-md">{error}</p>
                        </div>
                    ) : (!textResult && !visualResult && !heatMapImage) ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500">
                            <PlaceholderIcon />
                            <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Phân tích Nắng & Gió 3D</h2>
                            <p className="mt-1 max-w-sm">Tải ảnh phối cảnh 3D để AI phân tích và tạo Moodboard khí hậu chi tiết.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
                            
                            {/* Result Switcher */}
                            {(visualResult && heatMapImage) && (
                                <div className="flex justify-center bg-white dark:bg-zinc-800 p-1 rounded-lg self-center border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                    <button 
                                        onClick={() => setActiveResultTab('climate')}
                                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeResultTab === 'climate' ? 'bg-yellow-400 text-black' : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'}`}
                                    >
                                        Bố cục Phân tích Tổng hợp (Moodboard)
                                    </button>
                                    <button 
                                        onClick={() => setActiveResultTab('heat')}
                                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeResultTab === 'heat' ? 'bg-red-500 text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'}`}
                                    >
                                        Biểu đồ Nhiệt (Riêng biệt)
                                    </button>
                                </div>
                            )}

                            {/* Main Image View */}
                            <div className="w-full bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-lg relative group">
                                <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 px-2 flex justify-between items-center">
                                    <span>{activeResultTab === 'climate' ? 'Moodboard Phân tích Khí hậu' : 'Biểu đồ Hấp thụ Nhiệt (Thermal Map)'}</span>
                                    <div className="flex gap-2">
                                        <button onClick={handleExportJSON} className="text-xs flex items-center gap-1 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 px-2 py-1 rounded transition-colors text-zinc-600 dark:text-zinc-300" title="Lưu dữ liệu (JSON)">
                                            <JsonIcon className="w-4 h-4"/> JSON
                                        </button>
                                        <button onClick={handlePrintReport} className="text-xs flex items-center gap-1 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 px-2 py-1 rounded transition-colors text-zinc-600 dark:text-zinc-300" title="Xuất báo cáo (PDF)">
                                            <PrinterIcon className="w-4 h-4"/> PDF
                                        </button>
                                    </div>
                                </h3>
                                <div className="relative overflow-hidden rounded-md bg-gray-100 dark:bg-zinc-900 flex items-center justify-center max-h-[70vh]">
                                    <img 
                                        src={activeResultTab === 'climate' ? visualResult || heatMapImage || '' : heatMapImage || visualResult || ''} 
                                        alt="Analysis Diagram" 
                                        className="object-contain w-full h-full" 
                                    />
                                </div>
                                
                                {/* Legend for Heat Map */}
                                {activeResultTab === 'heat' && (
                                    <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm p-3 rounded-lg border border-white/10 text-xs text-white">
                                        <div className="font-bold mb-2">Thang nhiệt độ</div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <span>Nóng / Hấp thụ cao</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                            <span>Trung bình</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                            <span>Mát / Bóng râm</span>
                                        </div>
                                    </div>
                                )}

                                <div className="absolute top-10 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setZoomedImageSrc(activeResultTab === 'climate' ? visualResult : heatMapImage); setIsZoomed(true); }} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Phóng to"><ZoomIcon /></button>
                                    <button onClick={() => handleDownload(activeResultTab === 'climate' ? visualResult! : heatMapImage!)} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Tải xuống"><DownloadIcon /></button>
                                </div>
                            </div>

                            {/* Solution Generation Button & Result */}
                            {activeResultTab === 'climate' && (
                                <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
                                    <div className="flex flex-col gap-4 mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                                                <SparklesIcon className="w-5 h-5 text-yellow-400" />
                                                Phối cảnh Giải pháp Kiến trúc Thực tế
                                            </h3>
                                            <p className="text-sm text-zinc-500">Tạo hình ảnh thực tế công trình sau khi áp dụng các giải pháp chắn nắng, đón gió và tối ưu nhiệt độ.</p>
                                        </div>
                                        
                                        <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400">Bối cảnh thực tế</label>
                                        <select
                                            value={solutionContext}
                                            onChange={(e) => setSolutionContext(e.target.value)}
                                            className="w-full appearance-none bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 rounded-lg px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-300 focus:border-blue-500 focus:ring-0 outline-none transition-colors"
                                        >
                                            {solutionContextOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>

                                        <textarea
                                            value={solutionDescription}
                                            onChange={(e) => setSolutionDescription(e.target.value)}
                                            placeholder="Mô tả thêm về giải pháp mong muốn (VD: Sử dụng lam gỗ conwood, trồng cây cúc tần ấn độ rủ xuống...)"
                                            rows={2}
                                            className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-0 transition-colors"
                                        />

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="keepShape"
                                                checked={keepShape}
                                                onChange={(e) => setKeepShape(e.target.checked)}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600"
                                            />
                                            <label htmlFor="keepShape" className="text-sm font-medium text-zinc-900 dark:text-zinc-300 select-none cursor-pointer">
                                                Giữ nguyên hình dáng & vật liệu (Bỏ qua bước Phác thảo)
                                            </label>
                                        </div>

                                        <button 
                                            onClick={handleGenerateSolution}
                                            disabled={isGeneratingSolution}
                                            className="self-start bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                                        >
                                            {isGeneratingSolution ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    {loadingMessage || 'Đang tạo ảnh...'}
                                                </>
                                            ) : (
                                                '✨ Tạo Phối cảnh Giải pháp'
                                            )}
                                        </button>
                                    </div>

                                    {solutionImage && (
                                        <div className="relative group mt-4 animate-fade-in">
                                            <div className="relative overflow-hidden rounded-md bg-gray-100 dark:bg-zinc-900 flex items-center justify-center max-h-[70vh]">
                                                <img src={solutionImage} alt="Architectural Solution Render" className="object-contain w-full h-full" />
                                            </div>
                                            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setZoomedImageSrc(solutionImage); setIsZoomed(true); }} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Phóng to"><ZoomIcon /></button>
                                                <button onClick={() => handleDownload(solutionImage)} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Tải xuống"><DownloadIcon /></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Text Report */}
                            {textResult && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg border-l-4 border-yellow-400">
                                        <h3 className="text-lg font-bold text-black dark:text-white mb-3 flex items-center gap-2">
                                            ☀️ Phân tích Nắng ({season})
                                        </h3>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{textResult.sunAnalysis}</p>
                                    </div>
                                    
                                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg border-l-4 border-blue-400">
                                        <h3 className="text-lg font-bold text-black dark:text-white mb-3 flex items-center gap-2">
                                            🌬️ Phân tích Gió
                                        </h3>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{textResult.windAnalysis}</p>
                                    </div>

                                    {textResult.thermalAnalysis && (
                                        <div className="md:col-span-2 bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg border-l-4 border-red-500">
                                            <h3 className="text-lg font-bold text-black dark:text-white mb-3 flex items-center gap-2">
                                                <ThermometerIcon className="w-5 h-5 text-red-500" />
                                                Phân tích Nhiệt (Thermal Analysis)
                                            </h3>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{textResult.thermalAnalysis}</p>
                                        </div>
                                    )}

                                    <div className="md:col-span-2 bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg border-t-4 border-green-500">
                                        <h3 className="text-lg font-bold text-black dark:text-white mb-4">🌿 Giải pháp Kiến trúc Đề xuất</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {textResult.recommendations.map((rec, idx) => (
                                                <div key={idx} className="bg-gray-50 dark:bg-zinc-700/30 p-4 rounded-md">
                                                    <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 mb-1">{rec.location}</h4>
                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{rec.suggestion}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Zoom Modal */}
            {isZoomed && zoomedImageSrc && (
                <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setIsZoomed(false)}>
                    <img src={zoomedImageSrc} alt="Zoomed View" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
                    <button className="absolute top-4 right-4 text-white p-2 bg-black/50 rounded-full hover:bg-black/80" onClick={() => setIsZoomed(false)}><CloseIcon className="h-6 w-6" /></button>
                </div>
            )}
        </div>
    );
};

export default SunWindAnalysisTool;
