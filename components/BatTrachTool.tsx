import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';

// Add declaration for jsPDF global variable
declare var jspdf: any;

// --- ICONS ---
const CloseIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const UploadIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-500 group-hover:text-yellow-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>);
const PlaceholderIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-zinc-500 dark:text-zinc-600 my-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const LoadingSpinner: React.FC<{text?: string}> = ({ text }) => ( <div role="status" className="flex flex-col items-center text-center text-zinc-500 dark:text-zinc-400"><svg aria-hidden="true" className="w-10 h-10 mb-3 text-zinc-200 dark:text-zinc-600 animate-spin fill-yellow-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg><h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-300">{text || 'Đang phân tích...'}</h3><p className="mt-1 text-sm">{text ? '' : 'AI đang làm việc, vui lòng chờ.'}</p><span className="sr-only">Loading...</span></div>);
const ErrorIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const ZoomIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.086V3a1 1 0 112 0v8.086l1.293-1.379a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const PrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;
const SensorIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 19l-4.95-6.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>);
const ManualIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M15.5 2.25a.75.75 0 00-1.06 0L8.22 8.47a.75.75 0 000 1.06l6.22 6.22a.75.75 0 001.06-1.06L10.06 9l5.44-5.44a.75.75 0 000-1.06zM4.25 3.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" /></svg>);
const SaveIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" /><path d="M8 8a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /></svg>);
const PlusIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" /></svg>);
const TrashIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const PdfIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H4zm6 10a2 2 0 110-4 2 2 0 010 4zm-3-3a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>);
const CameraIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2H4zm12 12H4a1 1 0 01-1-1V7a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1zM9 10a3 3 0 100 6 3 3 0 000-6zm-1 3a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" /></svg>);


// --- HELPER COMPONENTS ---
const ImageUploadArea: React.FC<{onImageUpdate: (dataUrl: string) => void; image: string | null; onClear: () => void; label?: string}> = ({ onImageUpdate, image, onClear, label }) => {
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
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mt-2">{label || 'Tải lên mặt bằng'}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-500">hoặc <span className="text-yellow-400 font-semibold">nhấn vào đây</span></p>
        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label="Tải lên ảnh đầu vào" onChange={(e) => e.target.files && handleFileRead(e.target.files[0])} accept="image/png, image/jpeg, image/webp" />
      </div>
    );
};

const CustomSelect: React.FC<{ label?: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; className?: string; }> = ({ label, value, onChange, children, className = '' }) => (
    <div className="relative">
        {label && <label className="sr-only">{label}</label>}
        <select
            value={value}
            onChange={onChange}
            aria-label={label}
            className={`w-full appearance-none bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm ${className}`}
        >
            {children}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
    </div>
);

const directions = [
    { name: 'Bắc', angle: 0, trigram: '☵', label: 'Khảm' },
    { name: 'Đông Bắc', angle: 45, trigram: '☶', label: 'Cấn' },
    { name: 'Đông', angle: 90, trigram: '☳', label: 'Chấn' },
    { name: 'Đông Nam', angle: 135, trigram: '☴', label: 'Tốn' },
    { name: 'Nam', angle: 180, trigram: '☲', label: 'Ly' },
    { name: 'Tây Nam', angle: 225, trigram: '☷', label: 'Khôn' },
    { name: 'Tây', angle: 270, trigram: '☱', label: 'Đoài' },
    { name: 'Tây Bắc', angle: 315, trigram: '☰', label: 'Càn' },
];

const Compass: React.FC<{
  degree: number;
  onDegreeChange: (degree: number) => void;
  isDirectionGood: (direction: string) => boolean | null;
  disabled?: boolean;
}> = ({ degree, onDegreeChange, isDirectionGood, disabled = false }) => {
    const compassRef = React.useRef<HTMLDivElement>(null);
    const isDragging = React.useRef(false);

    const getDirectionFromAngle = useCallback((angle: number): string => {
        const roundedAngle = (Math.round(angle) % 360 + 360) % 360;
        if (roundedAngle >= 337.5 || roundedAngle < 22.5) return 'Bắc';
        if (roundedAngle >= 22.5 && roundedAngle < 67.5) return 'Đông Bắc';
        if (roundedAngle >= 67.5 && roundedAngle < 112.5) return 'Đông';
        if (roundedAngle >= 112.5 && roundedAngle < 157.5) return 'Đông Nam';
        if (roundedAngle >= 157.5 && roundedAngle < 202.5) return 'Nam';
        if (roundedAngle >= 202.5 && roundedAngle < 247.5) return 'Tây Nam';
        if (roundedAngle >= 247.5 && roundedAngle < 292.5) return 'Tây';
        return 'Tây Bắc';
    }, []);

    const direction = getDirectionFromAngle(degree);

    const handleInteraction = useCallback((clientX: number, clientY: number) => {
        if (disabled || !compassRef.current) return;
        const rect = compassRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angleRad = Math.atan2(clientY - centerY, clientX - centerX);
        let angleDeg = angleRad * (180 / Math.PI) + 90; // +90 to make North at top
        if (angleDeg < 0) angleDeg += 360;

        onDegreeChange(angleDeg);
    }, [onDegreeChange, disabled]);

    const onMouseDown = (e: React.MouseEvent) => {
        if (disabled) return;
        isDragging.current = true;
        handleInteraction(e.clientX, e.clientY);
    };

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging.current) return;
        e.preventDefault();
        handleInteraction(e.clientX, e.clientY);
    }, [handleInteraction]);

    const onMouseUp = () => {
        isDragging.current = false;
    };
    
    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [onMouseMove]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        let value = parseInt(e.target.value, 10);
        if (isNaN(value)) {
            onDegreeChange(0);
        } else {
            value = Math.max(0, Math.min(359, value));
            onDegreeChange(value);
        }
    };

    const currentDirectionInfo = directions.find(d => d.name === direction);
    const isGood = isDirectionGood(direction);

    return (
        <div className="flex flex-col items-center">
            <div 
                ref={compassRef} 
                onMouseDown={onMouseDown} 
                className={`relative w-64 h-64 rounded-full bg-zinc-100 dark:bg-zinc-800 border-4 border-zinc-300 dark:border-zinc-700 select-none ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
                style={{ touchAction: 'none' }}
            >
                {/* Major Ticks */}
                {Array.from({ length: 8 }).map((_, i) => (
                     <div key={`tick-${i}`} className="absolute w-full h-full" style={{ transform: `rotate(${i * 45}deg)` }}>
                        <div className={`absolute h-3 w-px bg-zinc-400 dark:bg-zinc-500 top-0 left-1/2 -translate-x-1/2`} />
                    </div>
                ))}
                {/* Direction Labels */}
                {directions.map(d => (
                    <div key={d.name} className="absolute w-full h-full" style={{ transform: `rotate(${d.angle}deg)` }}>
                        <div className={`absolute top-5 left-1/2 -translate-x-1/2 text-center text-sm font-bold ${d.name === direction ? 'text-yellow-400' : 'text-zinc-500'}`}>
                            <div style={{ transform: `rotate(${-d.angle}deg)` }}>{d.name}</div>
                        </div>
                    </div>
                ))}
                {/* Needle */}
                <div className="absolute w-full h-full pointer-events-none" style={{ transform: `rotate(${degree}deg)` }}>
                    <div className="absolute top-1/2 left-1/2 w-1 h-1/2 bg-red-500 origin-bottom" style={{ transform: `translateX(-50%) rotate(180deg)` }} />
                </div>
                {/* Center Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white dark:bg-zinc-900 rounded-full border-4 border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center pointer-events-none">
                    {currentDirectionInfo && (
                        <>
                            <div className="text-3xl font-mono text-zinc-700 dark:text-zinc-300">{currentDirectionInfo.trigram}</div>
                            <div className="font-semibold text-zinc-800 dark:text-zinc-200">{currentDirectionInfo.label}</div>
                            <div className={`text-xs font-bold ${isGood === null ? 'text-zinc-500' : (isGood ? 'text-green-500' : 'text-red-500')}`}>
                                {isGood === null ? '' : (isGood ? 'Tốt' : 'Xấu')}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="mt-4 text-center">
                <span className="text-2xl font-bold text-black dark:text-white">{direction}</span>
                <span className="text-xl font-semibold text-zinc-500 dark:text-zinc-400 ml-2">{Math.round(degree)}°</span>
            </div>
            {!disabled && (
                 <div className="mt-2 flex items-center gap-2 p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg w-64">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Nhập độ:</span>
                    <input
                        type="number"
                        value={Math.round(degree)}
                        onChange={handleInputChange}
                        min="0"
                        max="359"
                        disabled={disabled}
                        className="w-20 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-center text-lg font-bold p-1 rounded-md border-2 border-gray-300 dark:border-zinc-700 focus:border-yellow-400 focus:ring-0 outline-none disabled:bg-zinc-200 dark:disabled:bg-zinc-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-lg font-bold text-yellow-400">°</span>
                </div>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---
interface BatTrachToolProps { onBack: () => void; }

type ActiveTab = 'battrach' | 'loandau' | 'kymon' | 'phitinh' | 'lichvannien' | 'duongtrach' | 'amtrach' | 'xemtuoi' | 'ngaygiotot' | 'thansat' | 'vankhan' | 'mausac' | 'tienkiep' | 'trachmenh';

const TABS: { id: ActiveTab; label: string }[] = [
    { id: 'battrach', label: 'Bát Trạch' },
    { id: 'amtrach', label: 'Âm Trạch' },
    { id: 'trachmenh', label: 'Trạch Mệnh' },
    { id: 'loandau', label: 'Loan Đầu' },
    { id: 'duongtrach', label: 'Dương Trạch' },
    { id: 'phitinh', label: 'Huyền không' },
    { id: 'thansat', label: 'Thần Sát' },
    { id: 'xemtuoi', label: 'Xem Tuổi' },
    { id: 'ngaygiotot', label: 'Ngày giờ tốt' },
    { id: 'vankhan', label: 'Văn Khấn' },
    { id: 'mausac', label: 'Màu sắc' },
    { id: 'tienkiep', label: 'Tiền kiếp' },
];

interface AnalysisResult {
  analysisText: string;
  constructionYears: string;
}

interface MauSacResult {
  element: string;
  goodColors: string[];
  badColors: string[];
  explanation: string;
}

interface FamilyMember {
    id: number;
    role: 'Ông' | 'Bà' | 'Vợ' | 'Chồng' | 'Con Trai' | 'Con Gái';
    name: string;
    birthDay: string;
    birthMonth: string;
    birthYear: string;
    gender: 'Nam' | 'Nữ';
    lunarDate?: string | null;
    isConvertingDate?: boolean;
    menhTrach?: 'Đông tứ mệnh' | 'Tây tứ mệnh' | null;
    isGettingMenhTrach?: boolean;
}
const familyRoles: FamilyMember['role'][] = ['Ông', 'Bà', 'Vợ', 'Chồng', 'Con Trai', 'Con Gái'];


const BatTrachTool: React.FC<BatTrachToolProps> = ({ onBack }) => {
    // Shared State
    const [name, setName] = useState('');
    const [birthDay, setBirthDay] = useState('');
    const [birthMonth, setBirthMonth] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const [gender, setGender] = useState('Nam');
    const [address, setAddress] = useState('');
    const [constructionYear, setConstructionYear] = useState('');
    const [lunarDate, setLunarDate] = useState<string | null>(null);
    const [isConvertingDate, setIsConvertingDate] = useState(false);
    const [userGroup, setUserGroup] = useState<'Đông tứ mệnh' | 'Tây tứ mệnh' | null>(null);
    const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
    const [isGettingGroup, setIsGettingGroup] = useState(false);

    // Tab State
    const [activeTab, setActiveTab] = useState<ActiveTab>('battrach');
    
    // Bat Trach Tab State
    const [inputImage, setInputImage] = useState<string | null>(null);
    const [outputImage, setOutputImage] = useState<string | null>(null);
    const [houseDirection, setHouseDirection] = useState('Bắc');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOutputZoomed, setIsOutputZoomed] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [houseCenter, setHouseCenter] = useState<{ x: number; y: number } | null>(null);

    // Loan Dau Tab State & Shared Location State
    const [loanDauImage, setLoanDauImage] = useState<string | null>(null);
    const [loanDauMapImage, setLoanDauMapImage] = useState<string | null>(null);
    const [loanDauDescription, setLoanDauDescription] = useState('');
    const [isLoanDauLoading, setIsLoanDauLoading] = useState(false);
    const [isLoanDauMapLoading, setIsLoanDauMapLoading] = useState(false);
    const [loanDauResult, setLoanDauResult] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    // Duong Trach Tab State
    const [doorDirection, setDoorDirection] = useState('Bắc');
    const [kitchenDirection, setKitchenDirection] = useState('Đông Nam');
    const [bedroomDirection, setBedroomDirection] = useState('Đông');
    const [isDuongTrachLoading, setIsDuongTrachLoading] = useState(false);
    const [duongTrachResult, setDuongTrachResult] = useState<string | null>(null);

    // Phi Tinh (Huyen Khong) Tab State
    const [phiTinhResult, setPhiTinhResult] = useState<string | null>(null);
    const [isPhiTinhLoading, setIsPhiTinhLoading] = useState(false);
    
    // Than Sat Tab State
    const [thanSatDescription, setThanSatDescription] = useState('');
    const [isThanSatLoading, setIsThanSatLoading] = useState(false);
    const [thanSatResult, setThanSatResult] = useState<string | null>(null);

    // Xem Tuoi Tab State
    const [tuoiXayNhaResult, setTuoiXayNhaResult] = useState<string | null>(null);
    const [isTuoiXayNhaLoading, setIsTuoiXayNhaLoading] = useState(false);

    // Van Khan Tab State
    const [vanKhanType, setVanKhanType] = useState('Lễ động thổ (làm móng)');
    const [vanKhanResult, setVanKhanResult] = useState<string | null>(null);
    const [isVanKhanLoading, setIsVanKhanLoading] = useState(false);

    // Mau Sac Tab State
    const [mauSacResult, setMauSacResult] = useState<MauSacResult | null>(null);
    const [isMauSacLoading, setIsMauSacLoading] = useState(false);

    // Tiền Kiếp Tab State
    const [tienKiepResult, setTienKiepResult] = useState<string | null>(null);
    const [isTienKiepLoading, setIsTienKiepLoading] = useState(false);

    // Âm Trạch Tab State
    const [deathDay, setDeathDay] = useState('');
    const [deathMonth, setDeathMonth] = useState('');
    const [deathYear, setDeathYear] = useState('');
    const [deathHour, setDeathHour] = useState('Tý (23h-1h)');
    const [spouseName, setSpouseName] = useState('');
    const [spouseBirthYear, setSpouseBirthYear] = useState('');
    const [eldestChildType, setEldestChildType] = useState<'son' | 'daughter'>('son');
    const [eldestChildName, setEldestChildName] = useState('');
    const [eldestChildBirthYear, setEldestChildBirthYear] = useState('');
    const [graveDirection, setGraveDirection] = useState('Bắc');
    const [isAmTrachLoading, setIsAmTrachLoading] = useState(false);
    const [amTrachResult, setAmTrachResult] = useState<string | null>(null);
    const [amTrachLandImage, setAmTrachLandImage] = useState<string | null>(null);
    const [graveMarkerPosition, setGraveMarkerPosition] = useState<{ x: number; y: number } | null>(null);
    
    // Ngay Gio Tot Tab State
    const [eventType, setEventType] = useState('Động thổ');
    const [isNgayGioTotLoading, setIsNgayGioTotLoading] = useState(false);
    const [ngayGioTotResult, setNgayGioTotResult] = useState<string | null>(null);
    
    // Lich Van Nien State
    const [lichDate, setLichDate] = useState(new Date().toISOString().split('T')[0]);
    const [lichResult, setLichResult] = useState<string|null>(null);
    const [isLichLoading, setIsLichLoading] = useState(false);

    // Ky Mon State
    const [kyMonDateTime, setKyMonDateTime] = useState(new Date().toISOString().slice(0, 16));
    const [kyMonResult, setKyMonResult] = useState<string|null>(null);
    const [isKyMonLoading, setIsKyMonLoading] = useState(false);
    
    // Trach Menh Tab State
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [trachMenhLandImage, setTrachMenhLandImage] = useState<string | null>(null);
    const [trachMenhHouseCenter, setTrachMenhHouseCenter] = useState<{ x: number; y: number } | null>(null);
    const [trachMenhCompassAngle, setTrachMenhCompassAngle] = useState(0);
    const [consultationResult, setConsultationResult] = useState<string | null>(null);
    const [isTrachMenhLoading, setIsTrachMenhLoading] = useState(false);
    const [copiedTrachMenh, setCopiedTrachMenh] = useState(false);


    // Compass state
    const [compassMode, setCompassMode] = useState<'manual' | 'auto'>('manual');
    const [savedDirection, setSavedDirection] = useState<{ direction: string; degree: number } | null>(null);
    const [deviceOrientation, setDeviceOrientation] = useState<number | null>(null);
    const [orientationPermission, setOrientationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
    const [compassPhoto, setCompassPhoto] = useState<string | null>(null);
    const [isAnalyzingCompassPhoto, setIsAnalyzingCompassPhoto] = useState(false);
    const [compassPhotoError, setCompassPhotoError] = useState<string | null>(null);
    const compassPhotoInputRef = useRef<HTMLInputElement>(null);

    // Refs for interaction
    const interactivePlotRef = useRef<HTMLDivElement>(null);
    const amTrachPlotRef = useRef<HTMLDivElement>(null);
    const trachMenhPlotRef = useRef<HTMLDivElement>(null);
    const isRotating = useRef(false);

    const getDirectionFromAngle = useCallback((angle: number): string => {
        const roundedAngle = (Math.round(angle) % 360 + 360) % 360;
        if (roundedAngle >= 337.5 || roundedAngle < 22.5) return 'Bắc';
        if (roundedAngle >= 22.5 && roundedAngle < 67.5) return 'Đông Bắc';
        if (roundedAngle >= 67.5 && roundedAngle < 112.5) return 'Đông';
        if (roundedAngle >= 112.5 && roundedAngle < 157.5) return 'Đông Nam';
        if (roundedAngle >= 157.5 && roundedAngle < 202.5) return 'Nam';
        if (roundedAngle >= 202.5 && roundedAngle < 247.5) return 'Tây Nam';
        if (roundedAngle >= 247.5 && roundedAngle < 292.5) return 'Tây';
        return 'Tây Bắc';
    }, []);

    const getAngleFromDirection = useCallback((direction: string): number => {
        return directions.find(d => d.name === direction)?.angle ?? 0;
    }, []);

    const [houseDirectionAngle, setHouseDirectionAngle] = useState(() => getAngleFromDirection(houseDirection));
    const [graveDirectionAngle, setGraveDirectionAngle] = useState(() => getAngleFromDirection(graveDirection));

    const handleHouseDirectionAngleChange = useCallback((angle: number) => {
        const newAngle = (angle % 360 + 360) % 360;
        setHouseDirectionAngle(newAngle);
        setHouseDirection(getDirectionFromAngle(newAngle));
    }, [getDirectionFromAngle]);

    const handleGraveDirectionAngleChange = useCallback((angle: number) => {
        const newAngle = (angle % 360 + 360) % 360;
        setGraveDirectionAngle(newAngle);
        setGraveDirection(getDirectionFromAngle(newAngle));
    }, [getDirectionFromAngle]);
    
    // --- COMPASS AUTO MODE LOGIC ---
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
    
    const saveCurrentDirection = () => {
        const activeAngle = activeTab === 'battrach' ? houseDirectionAngle : graveDirectionAngle;
        const activeDirection = getDirectionFromAngle(activeAngle);
        const savedData = {
            direction: activeDirection,
            degree: Math.round(activeAngle),
        };
        setSavedDirection(savedData);
        alert(`Đã lưu hướng: ${savedData.direction} (${savedData.degree}°)`);
    };

    useEffect(() => {
        const handleOrientation = (event: DeviceOrientationEvent) => {
            if (event.alpha !== null) {
                const heading = (360 - event.alpha + 360) % 360; // Normalize
                setDeviceOrientation(heading);
            }
        };

        if (compassMode === 'auto' && orientationPermission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, true);
        }

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation, true);
        };
    }, [compassMode, orientationPermission]);

    useEffect(() => {
        if (compassMode === 'auto' && deviceOrientation !== null) {
            if (activeTab === 'battrach') {
                handleHouseDirectionAngleChange(deviceOrientation);
            } else if (activeTab === 'amtrach') {
                handleGraveDirectionAngleChange(deviceOrientation);
            }
        }
    }, [compassMode, deviceOrientation, activeTab, handleHouseDirectionAngleChange, handleGraveDirectionAngleChange]);
    

    const getDaysInMonth = (yearStr: string, monthStr: string) => {
        const month = parseInt(monthStr);
        const year = parseInt(yearStr);
        if (!month || !year || year < 1000) return 31;
        return new Date(year, month, 0).getDate();
    };

    const birthDaysInMonth = useMemo(() => getDaysInMonth(birthYear, birthMonth), [birthMonth, birthYear]);
    const deathDaysInMonth = useMemo(() => getDaysInMonth(deathYear, deathMonth), [deathMonth, deathYear]);

    useEffect(() => { if (parseInt(birthDay) > birthDaysInMonth) setBirthDay(''); }, [birthDaysInMonth, birthDay]);
    useEffect(() => { if (parseInt(deathDay) > deathDaysInMonth) setDeathDay(''); }, [deathDaysInMonth, deathDay]);
    
    const handleCopyToClipboard = (textToCopy: string | null, identifier: string) => {
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy);
        setCopiedStatus(identifier);
        setTimeout(() => setCopiedStatus(null), 2000);
    };
    
    const handlePrint = (title: string, content: string | null) => {
        if (!content) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Không thể mở cửa sổ in. Vui lòng kiểm tra cài đặt chặn pop-up của trình duyệt.');
            return;
        }
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${title}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
                        body {
                            font-family: 'Roboto', sans-serif;
                            color: #000;
                            margin: 1.5cm;
                            position: relative;
                            line-height: 1.6;
                        }
                        .print-container {
                            position: relative;
                            z-index: 1;
                        }
                        h1 {
                            text-align: center;
                            font-size: 20px;
                            margin-bottom: 24px;
                            color: #1a1a1a;
                            font-weight: 700;
                        }
                        div.content {
                           white-space: pre-wrap; /* This preserves newlines and spacing */
                           font-size: 11pt;
                           text-align: justify;
                        }
                        @media print {
                            body::after {
                                content: 'CTAI';
                                position: fixed;
                                top: 50%;
                                left: 50%;
                                transform: translate(-50%, -50%) rotate(-45deg);
                                font-size: 120px;
                                font-weight: 900;
                                font-family: sans-serif;
                                color: rgba(0, 0, 0, 0.07);
                                z-index: 0;
                                pointer-events: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        <h1>${title}</h1>
                        <div class="content">${content}</div>
                    </div>
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                window.onafterprint = function() {
                                    window.close();
                                }
                            }, 100);
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const directionOptions = [
        { label: 'Bắc (Khảm)', value: 'Bắc' }, { label: 'Đông Bắc (Cấn)', value: 'Đông Bắc' },
        { label: 'Đông (Chấn)', value: 'Đông' }, { label: 'Đông Nam (Tốn)', value: 'Đông Nam' },
        { label: 'Nam (Ly)', value: 'Nam' }, { label: 'Tây Nam (Khôn)', value: 'Tây Nam' },
        { label: 'Tây (Đoài)', value: 'Tây' }, { label: 'Tây Bắc (Càn)', value: 'Tây Bắc' },
    ];
    
    const vanKhanOptions = [
      'Lễ động thổ (làm móng)', 'Lễ cất nóc', 'Lễ nhập trạch (về nhà mới)', 'Lễ sửa chữa nhà'
    ];

    const eventTypeOptions = ['Động thổ', 'Nhập trạch', 'Cưới hỏi', 'Khai trương', 'An táng'];

    const deathHourOptions = [
      'Tý (23h-1h)', 'Sửu (1h-3h)', 'Dần (3h-5h)', 'Mão (5h-7h)', 'Thìn (7h-9h)', 'Tỵ (9h-11h)',
      'Ngọ (11h-13h)', 'Mùi (13h-15h)', 'Thân (15h-17h)', 'Dậu (17h-19h)', 'Tuất (19h-21h)', 'Hợi (21h-23h)'
    ];

    const colorMap: { [key: string]: string } = {
        'Vàng': '#facc15', 'Nâu đất': '#a16207', 'Trắng': '#f9fafb', 'Xám': '#6b7280', 'Ghi': '#9ca3af',
        'Đen': '#1f2937', 'Xanh nước biển': '#3b82f6', 'Xanh lá cây': '#22c55e', 'Xanh lục': '#16a34a',
        'Đỏ': '#ef4444', 'Hồng': '#ec4899', 'Tím': '#a855f7', 'Cam': '#f97316'
    };

    // --- SHARED LOGIC ---
    useEffect(() => {
        const convertDate = async () => {
            if (birthDay && birthMonth && birthYear && birthYear.length === 4) {
                setIsConvertingDate(true);
                setLunarDate(null);
                try {
                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: `Quy đổi ngày dương lịch ${birthDay}/${birthMonth}/${birthYear} sang ngày âm lịch của Việt Nam. Trả về một chuỗi duy nhất theo định dạng "Ngày ... tháng ... năm ... (Can Chi năm)". Ví dụ: "Ngày 15 tháng 1 năm Tân Dậu".`,
                    });
                    setLunarDate(response.text);
                } catch (e) { console.error("Lỗi quy đổi ngày:", e); setLunarDate("Không thể quy đổi."); } 
                finally { setIsConvertingDate(false); }
            }
        };
        const timeoutId = setTimeout(convertDate, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [birthDay, birthMonth, birthYear]);
    
    useEffect(() => {
        const getFengShuiInfo = async () => {
            if (birthYear && birthYear.length === 4 && gender) {
                setIsGettingGroup(true);
                setUserGroup(null);
                try {
                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: `Dựa trên Bát Trạch phong thủy Việt Nam, cho một người ${gender} sinh năm ${birthYear}, hãy xác định: 1. Họ thuộc nhóm nào (Đông tứ mệnh hay Tây tứ mệnh). 2. Hướng Sinh Khí (tốt nhất) của họ là hướng nào. Trả về một đối tượng JSON với hai key: "group" và "bestDirection". Ví dụ: { "group": "Tây tứ mệnh", "bestDirection": "Tây Bắc" }`,
                        config: { responseMimeType: "application/json" }
                    });
                    const result = JSON.parse(response.text);
                    if (result.group) setUserGroup(result.group);
                    if (result.bestDirection) {
                        const newAngle = getAngleFromDirection(result.bestDirection);
                        handleHouseDirectionAngleChange(newAngle);
                        handleGraveDirectionAngleChange(newAngle);
                    }
                } catch (e) { console.error("Lỗi lấy thông tin Bát trạch:", e); setUserGroup(null); }
                finally { setIsGettingGroup(false); }
            }
        };
        getFengShuiInfo();
    }, [birthYear, gender, getAngleFromDirection, handleHouseDirectionAngleChange, handleGraveDirectionAngleChange]);
    
    // Auto-set directions for Duong Trach based on user group
    useEffect(() => {
        if (userGroup) {
            const allDirections = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'];
            
            const eastGroupGoodDirections = ['Nam', 'Bắc', 'Đông Nam', 'Đông'];
            const westGroupGoodDirections = ['Tây Bắc', 'Đông Bắc', 'Tây Nam', 'Tây'];

            let goodDirections: string[];
            let badDirections: string[];

            if (userGroup === 'Đông tứ mệnh') {
                goodDirections = eastGroupGoodDirections;
            } else { // Tây tứ mệnh
                goodDirections = westGroupGoodDirections;
            }
            
            badDirections = allDirections.filter(d => !goodDirections.includes(d));

            // Set default directions based on Feng Shui principles for Duong Trach
            if (activeTab === 'duongtrach' && goodDirections.length >= 2 && badDirections.length >= 1) {
                setDoorDirection(goodDirections[0]);
                setBedroomDirection(goodDirections[1]);
                setKitchenDirection(badDirections[0]);
            }
        }
    }, [userGroup, activeTab]);

    const isDirectionGood = useCallback((direction: string) => {
        if (!userGroup) return null;
        const eastGroupDirections = ['Bắc', 'Đông', 'Đông Nam', 'Nam'];
        const westGroupDirections = ['Tây Bắc', 'Đông Bắc', 'Tây Nam', 'Tây'];
        const goodDirections = userGroup === 'Đông tứ mệnh' ? eastGroupDirections : westGroupDirections;
        return goodDirections.includes(direction);
    }, [userGroup]);

    const handleAnalyzeCompassPhoto = async (file: File) => {
        setIsAnalyzingCompassPhoto(true);
        setCompassPhotoError(null);
        setCompassPhoto(null);

        const reader = new FileReader();
        reader.onloadend = async () => {
            const dataUrl = reader.result as string;
            setCompassPhoto(dataUrl);

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const imagePart = {
                    inlineData: {
                        mimeType: file.type,
                        data: dataUrl.split(',')[1],
                    },
                };
                const textPart = {
                    text: "Phân tích hình ảnh này, đây là một la bàn đang đo hướng một mảnh đất. Hãy xác định hướng chính (ví dụ: Bắc, Tây Nam) và số độ chính xác (0-359) mà kim màu đỏ đang chỉ tới. Trả về kết quả dưới dạng một đối tượng JSON với hai khóa: `direction` (string, ví dụ: 'Tây Bắc') và `degree` (number, ví dụ: 315)."
                };

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: { parts: [imagePart, textPart] },
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                direction: { type: Type.STRING, description: "Hướng chính theo la bàn, ví dụ 'Bắc', 'Tây Nam'" },
                                degree: { type: Type.NUMBER, description: "Số độ chính xác từ 0 đến 359" },
                            },
                            required: ["direction", "degree"]
                        }
                    }
                });
                
                const result = JSON.parse(response.text);
                if (result.degree !== undefined && result.direction) {
                    const newAngle = (result.degree % 360 + 360) % 360;
                    if (activeTab === 'amtrach') {
                        handleGraveDirectionAngleChange(newAngle);
                    } else { 
                        handleHouseDirectionAngleChange(newAngle);
                    }
                } else {
                    throw new Error("Phản hồi của AI không chứa đủ thông tin hướng và độ.");
                }

            } catch (e) {
                console.error(e);
                setCompassPhotoError(`Phân tích ảnh thất bại: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
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


    // --- TAB SPECIFIC LOGIC ---
    
    // Tab 1: Bát Trạch
    const handleGenerateBatTrach = async () => {
        if (!inputImage) { setError('Vui lòng tải lên một mặt bằng.'); return; }
        if (!houseCenter) { setError('Vui lòng click vào ảnh để chọn tâm nhà trước khi phân tích.'); return; }
        if (!name.trim() || !birthYear.trim()) { setError('Vui lòng nhập đầy đủ Tên và Năm sinh của gia chủ.'); return; }
        
        setIsLoading(true);
        setError(null);
        setOutputImage(null);
        setAnalysisResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const contentParts: any[] = [];

            // --- Call 1: Get Text Analysis (JSON) ---
            let analysisPrompt = `Bạn là một chuyên gia phong thủy Bát Trạch Việt Nam. Dựa trên thông tin gia chủ (${name}, ${gender}, sinh năm ${birthYear}, mệnh ${userGroup}), nhà tại địa chỉ ${address || '(chưa cung cấp)'} và có hướng ${houseDirection} (${houseDirectionAngle.toFixed(1)} độ)`;
            if (location) {
                analysisPrompt += `, tại vị trí địa lý vĩ độ ${location.lat.toFixed(5)}, kinh độ ${location.lng.toFixed(5)}`;
            }
            analysisPrompt += `, hãy phân tích và trả về một đối tượng JSON hợp lệ chứa hai khóa:
- \`analysisText\`: Một chuỗi văn bản (khoảng 150 từ) diễn giải ưu/nhược điểm bố trí nhà dựa trên các cung sao tốt/xấu và đưa ra gợi ý cải thiện. Nếu có vị trí địa lý, hãy xem xét cả địa thế xung quanh.
- \`constructionYears\`: Một chuỗi văn bản liệt kê các năm tốt để xây nhà trong 10 năm tới.`;

            const analysisResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: analysisPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            analysisText: { 
                                type: Type.STRING, 
                                description: "Diễn giải ưu/nhược điểm bố trí nhà và đưa ra gợi ý cải thiện." 
                            },
                            constructionYears: { 
                                type: Type.STRING,
                                description: "Liệt kê các năm tốt để xây nhà trong 10 năm tới."
                            },
                        }
                    }
                }
            });
            
            const parsedAnalysis = JSON.parse(analysisResponse.text);
            if (!parsedAnalysis.analysisText || !parsedAnalysis.constructionYears) {
                 throw new Error("AI không trả về dữ liệu phân tích văn bản hợp lệ.");
            }
            setAnalysisResult(parsedAnalysis);


            // --- Call 2: Get Annotated Image ---
            let imagePrompt = `Bạn là một chuyên gia phong thủy Bát Trạch Việt Nam. Dựa trên thông tin gia chủ (${name}, ${gender}, sinh năm ${birthYear}, mệnh ${userGroup}), nhà tại địa chỉ ${address || '(chưa cung cấp)'} và có hướng ${houseDirection} (${houseDirectionAngle.toFixed(1)} độ).`;
            if (location) {
                imagePrompt += ` Vị trí thực tế của ngôi nhà là vĩ độ ${location.lat.toFixed(5)}, kinh độ ${location.lng.toFixed(5)}, hãy xem xét bối cảnh xung quanh khi phân tích.`;
            }
            imagePrompt += ` Hãy vẽ một đồ hình Bát quái chuyên nghiệp, chi tiết và đẹp mắt lên tâm của hình ảnh mặt bằng được cung cấp, xoay đúng theo hướng nhà đã chỉ định (hướng ${houseDirectionAngle.toFixed(1)} độ là hướng của cửa chính, hướng 0 độ là hướng Bắc). Đồ hình phải có dạng vòng tròn nhiều lớp, giống như một la bàn phong thủy thực thụ, bao gồm:
- **Vòng ngoài cùng:** Tên 8 hướng chính.
- **Vòng Bát quái:** Tên 8 quẻ và ký hiệu quẻ tương ứng.
- **Vòng Cung sao:** Dựa vào mệnh trạch của gia chủ, ghi rõ tên của 8 cung sao (Sinh Khí, Diên Niên, Thiên Y, Phục Vị, Tuyệt Mệnh, Ngũ Quỷ, Lục Sát, Họa Hại) vào đúng ô của từng hướng.
- **Màu sắc:** Sử dụng màu đỏ/sáng cho các cung tốt và màu đen/tối cho các cung xấu.
- **Trung tâm:** Để trống hoặc trong suốt để thấy được tâm nhà.
Chỉ trả về hình ảnh đã được chỉnh sửa.`;

            contentParts.push({
                inlineData: {
                    mimeType: inputImage.match(/:(.*?);/)?.[1]!,
                    data: inputImage.split(',')[1],
                },
            });
            contentParts.push({ text: imagePrompt });

            const imageResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: contentParts },
                config: { responseModalities: [Modality.IMAGE] },
            });

            const imageOutputPart = imageResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (imageOutputPart?.inlineData) {
                const newImage = `data:image/png;base64,${imageOutputPart.inlineData.data}`;
                setOutputImage(newImage);
            } else {
                setOutputImage(inputImage); 
                console.warn("AI did not return an annotated image. Displaying input image instead.");
            }

        } catch (e) {
            console.error(e);
            setError(`Đã xảy ra lỗi khi phân tích: ${e instanceof Error ? e.message : 'Lỗi không xác định'}. Vui lòng thử lại.`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownloadImage = () => {
        if (!outputImage) return;
        const link = document.createElement('a');
        link.href = outputImage;
        link.download = `ctai-battrach-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Tab: Loan Dau
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Trình duyệt không hỗ trợ định vị.");
            return;
        }
        setIsGettingLocation(true);
        setLocation(null);
        setLocationError(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setIsGettingLocation(false);
            },
            (error) => {
                setLocationError(`Lỗi lấy vị trí: ${error.message}`);
                setIsGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleAnalyzeLoanDau = async () => {
        if (!loanDauDescription.trim() && !loanDauImage && !location && !address.trim()) {
            alert("Vui lòng mô tả địa hình, tải ảnh, cung cấp vị trí hoặc địa chỉ.");
            return;
        }
        setIsLoanDauLoading(true);
        setIsLoanDauMapLoading(true);
        setLoanDauResult(null);
        setLoanDauMapImage(null);
        setError(null);
    
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // --- TEXT ANALYSIS ---
            let textPrompt = `Bạn là một chuyên gia phong thủy phái Hình Thế (Loan Đầu) của Việt Nam. Nhiệm vụ của bạn là phân tích một bất động sản tại Việt Nam. Địa chỉ: ${address || '(chưa cung cấp)'}. Hãy thực hiện theo các bước sau một cách có hệ thống:\n`;
            
            if (location) {
                textPrompt += `**Bối cảnh:** Bạn đã được cung cấp tọa độ GPS. BẠN BẮT BUỘC PHẢI sử dụng công cụ Google Maps đi kèm để thực hiện phân tích địa thế.\n**Bước 1: Phân tích Địa thế Tứ Tượng (Sử dụng Google Maps)**\n...\n`;
            } else {
                 textPrompt += `**Bối cảnh:** Bạn KHÔNG được cung cấp tọa độ GPS. Phân tích của bạn sẽ bị giới hạn trong phạm vi hình ảnh và mô tả do người dùng cung cấp.\n...`;
            }
            if (loanDauDescription.trim()) textPrompt += `\n**Mô tả bổ sung từ người dùng:** "${loanDauDescription}"`;
            textPrompt += "\nHãy trình bày kết quả phân tích theo từng mục rõ ràng, chuyên nghiệp.";
            
            const textRequestPayload: any = { model: 'gemini-2.5-flash', contents: textPrompt, config: {} };
            if (location) {
                textRequestPayload.config.tools = [{ googleMaps: {} }];
                textRequestPayload.config.toolConfig = { retrievalConfig: { latLng: { latitude: location.lat, longitude: location.lng } } };
            }
            const textResponse = await ai.models.generateContent(textRequestPayload);
            setLoanDauResult(textResponse.text);
            setIsLoanDauLoading(false);

            // --- MAP IMAGE GENERATION ---
            if (location) {
                const mapPrompt = `Tạo một hình ảnh bản đồ vệ tinh thực tế cho khu vực có vĩ độ ${location.lat}, kinh độ ${location.lng}. Trên bản đồ này, hãy xác định và vẽ một đường màu đỏ bán trong suốt để thể hiện vị trí của "long mạch" (dòng năng lượng chính của đất) đi qua khu vực này. Đường màu đỏ nên đậm nhất ở lõi và mờ dần ra các cạnh để thể hiện cường độ. Đảm bảo hình ảnh rõ nét và chuyên nghiệp. Địa chỉ tham khảo: ${address}.`;
                
                const imageResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [{ text: mapPrompt }] },
                    config: { responseModalities: [Modality.IMAGE] },
                });
                
                const imagePart = imageResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                if (imagePart?.inlineData) {
                    setLoanDauMapImage(`data:image/png;base64,${imagePart.inlineData.data}`);
                }
            }

        } catch (e) {
            console.error(e);
            setError("Không thể phân tích. Vui lòng thử lại.");
        } finally {
            setIsLoanDauLoading(false);
            setIsLoanDauMapLoading(false);
        }
    };

    // Tab: Duong Trach
    const handleAnalyzeDuongTrach = async () => {
        if (!birthYear) { alert("Vui lòng nhập năm sinh gia chủ."); return; }
        setIsDuongTrachLoading(true); setDuongTrachResult(null); setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Bạn là một chuyên gia phong thủy phái Dương Trạch Tam Yếu. Phân tích mối quan hệ giữa ba yếu tố: Cửa chính (Môn) ở hướng ${doorDirection}, Bếp (Táo) ở hướng ${kitchenDirection}, và Giường ngủ chính (Chủ) ở hướng ${bedroomDirection}. Gia chủ là ${gender} sinh năm ${birthYear} (thuộc ${userGroup}). Hãy luận giải sự phối hợp này là tốt hay xấu, ảnh hưởng đến các khía cạnh nào của cuộc sống (sức khỏe, tài lộc, gia đạo) và đưa ra lời khuyên nếu cần.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setDuongTrachResult(response.text);
        } catch (e) { setError("Không thể phân tích. Vui lòng thử lại."); } finally { setIsDuongTrachLoading(false); }
    };

    // Tab: Phi tinh
    const handleFetchPhiTinhInfo = async () => {
        if (!constructionYear) { alert("Vui lòng nhập năm xây dựng của ngôi nhà."); return; }
        setIsPhiTinhLoading(true); setPhiTinhResult(null); setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Bạn là một chuyên gia Huyền không phi tinh. Cho một ngôi nhà được xây dựng vào năm ${constructionYear} (thuộc vận mấy?), có hướng là ${houseDirection}. Gia chủ là ${gender} sinh năm ${birthYear}. Hãy thực hiện các phân tích sau:
1.  Lập tinh bàn Huyền không cho ngôi nhà này trong Vận 9 (2024-2043), thể hiện rõ sao chủ vận, sao sơn, sao hướng tại 9 cung.
2.  Phân tích ý nghĩa của các cặp sao tại từng cung (đặc biệt là cung có cửa chính, phòng ngủ, bếp). Chỉ ra đâu là sao vượng khí, sinh khí, thoái khí, tử khí.
3.  Đưa ra các khuyến nghị cụ thể về cách kích hoạt vượng khí (ví dụ: đặt nước, đèn) và hóa giải sát khí (ví dụ: đặt vật phẩm phong thủy) cho các khu vực quan trọng.
Trình bày kết quả một cách chi tiết, có cấu trúc, dễ hiểu.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
            setPhiTinhResult(response.text);
        } catch (e) { setError("Không thể tải được nội dung. Vui lòng thử lại."); } finally { setIsPhiTinhLoading(false); }
    };

    // Tab: Than Sat
    const handleAnalyzeThanSat = async () => {
        if (!thanSatDescription.trim()) { alert("Vui lòng mô tả các yếu tố có thể gây sát khí."); return; }
        setIsThanSatLoading(true); setThanSatResult(null); setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Bạn là một chuyên gia phong thủy phái Khai Môn Điểm Thần Sát. Dựa trên mô tả về các yếu tố có thể gây sát khí cho một ngôi nhà, hãy xác định đó là loại sát khí gì (ví dụ: Thương sát, Xung bối sát, Đao trảm sát,...) và đưa ra phương pháp hóa giải cụ thể, dễ áp dụng.\n\nMô tả: "${thanSatDescription}"`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setThanSatResult(response.text);
        } catch (e) { setError("Không thể phân tích. Vui lòng thử lại."); } finally { setIsThanSatLoading(false); }
    };

    // Tab: Xem Tuoi
    const handleAnalyzeTuoiXayNha = async () => {
        if (!birthYear) { alert("Vui lòng nhập năm sinh."); return; }
        setIsTuoiXayNhaLoading(true); setTuoiXayNhaResult(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Bạn là một chuyên gia phong thủy Việt Nam. Dựa vào năm sinh ${birthYear} của gia chủ ${gender}, hãy phân tích tuổi làm nhà trong 10 năm tới (từ năm hiện tại). Với mỗi năm, phân tích 3 yếu tố: Tam Tai, Kim Lâu, Hoang Ốc. Sau đó kết luận năm đó "Tốt", "Bình thường", hay "Xấu". Trả về kết quả dưới dạng chuỗi văn bản, mỗi năm một đoạn.`,
            });
            setTuoiXayNhaResult(response.text);
        } catch (e) { setTuoiXayNhaResult("Đã xảy ra lỗi khi phân tích."); } 
        finally { setIsTuoiXayNhaLoading(false); }
    };
    
    // Tab: Văn Khấn
    const handleFetchVanKhan = useCallback(async () => {
        setIsVanKhanLoading(true); setVanKhanResult(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const currentDate = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const prompt = `Bạn là một chuyên gia về văn hóa và nghi lễ truyền thống Việt Nam. Nhiệm vụ của bạn là soạn một bài văn khấn đầy đủ và trang trọng cho '${vanKhanType}'. PHẢI tự động điền các thông tin về thời gian (dựa vào ngày hôm nay là ${currentDate}, hãy quy đổi sang âm lịch), tín chủ (${name || '[điền tên]'}), và địa chỉ (${address || '[điền địa chỉ]'}) vào những chỗ thích hợp trong thân bài. Nội dung cần có phần chuẩn bị lễ vật, nội dung chính của bài văn khấn, và lưu ý sau khi cúng.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setVanKhanResult(response.text);
        } catch (e) { setVanKhanResult("Không thể tải được nội dung. Vui lòng thử lại."); }
        finally { setIsVanKhanLoading(false); }
    }, [vanKhanType, name, address]);
    
    // Tab: Màu Sắc
    const handleAnalyzeMauSac = useCallback(async () => {
        if (!birthYear) return;
        setIsMauSacLoading(true); setMauSacResult(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Dựa trên năm sinh ${birthYear} và giới tính ${gender} của một người Việt Nam, hãy xác định mệnh Ngũ hành và cung cấp gợi ý màu sắc phong thủy.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT, properties: {
                            element: { type: Type.STRING, description: "Tên mệnh Ngũ hành (ví dụ: 'Kim', 'Mộc')." },
                            goodColors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Mảng các màu Tương sinh và Tương hợp." },
                            badColors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Mảng các màu Tương khắc." },
                            explanation: { type: Type.STRING, description: "Giải thích ngắn gọn tại sao các màu lại hợp/khắc." }
                        }
                    }
                }
            });
            setMauSacResult(JSON.parse(response.text));
        } catch (e) { setError("Không thể tải được nội dung."); } 
        finally { setIsMauSacLoading(false); }
    }, [birthYear, gender]);

    useEffect(() => { if(activeTab === 'mausac' && birthYear) handleAnalyzeMauSac(); }, [activeTab, birthYear, gender, handleAnalyzeMauSac]);

    // Tab: Tiền kiếp
    const handleAnalyzeTienKiep = async () => {
        if (!name || !birthDay || !birthMonth || !birthYear) { alert("Vui lòng nhập đầy đủ họ tên và ngày tháng năm sinh."); return; }
        setIsTienKiepLoading(true); setTienKiepResult(null); setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Bạn là một nhà ngoại cảm có khả năng nhìn thấu tiền kiếp. Dựa trên thông tin họ tên "${name}", ngày sinh dương lịch ${birthDay}/${birthMonth}/${birthYear}, giới tính ${gender}, và ngày tháng năm sinh âm lịch là ${lunarDate}, hãy kể một câu chuyện hư cấu, mang tính giải trí và chiêm nghiệm về một kiếp sống trước đây của người này. Câu chuyện nên bao gồm: bối cảnh, họ là ai, một sự kiện quan trọng, và mối liên hệ đến kiếp sống hiện tại. Nhấn mạnh rằng đây là câu chuyện hư cấu.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setTienKiepResult(response.text);
        } catch (e) { setError("Không thể xem tiền kiếp lúc này. Vui lòng thử lại sau."); } finally { setIsTienKiepLoading(false); }
    };

    // Tab: Âm Trạch
    const handleAnalyzeAmTrach = async () => {
        if (!name || !birthYear || !deathYear) { alert("Vui lòng nhập đủ thông tin của người đã mất."); return; }
        if (amTrachLandImage && !graveMarkerPosition) { setError('Vui lòng click vào ảnh để chọn tâm mộ trước khi phân tích.'); return; }
        setIsAmTrachLoading(true); setAmTrachResult(null); setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const contentParts: any[] = [];
            const eldestChildRole = eldestChildType === 'son' ? 'Con trai trưởng' : 'Con gái trưởng';
            let prompt = `Bạn là một bậc thầy phong thủy chuyên về Âm trạch của Việt Nam. Dựa vào các thông tin sau: Người đã mất: ${name}, ${gender}, sinh ${birthYear}, mất ${deathDay}/${deathMonth}/${deathYear} giờ ${deathHour}. Vợ/chồng: ${spouseName || 'N/A'}, sinh ${spouseBirthYear || 'N/A'}. ${eldestChildRole}: ${eldestChildName || 'N/A'}, sinh ${eldestChildBirthYear || 'N/A'}. Hướng mộ: ${graveDirection} (${graveDirectionAngle.toFixed(1)} độ).`;
            if (amTrachLandImage) {
                prompt += `Phân tích hình ảnh khu đất và vị trí mộ được đánh dấu để đánh giá Loan Đầu (thế đất, long mạch, hình sát). Luận giải vị trí là tốt hay xấu.`;
                contentParts.push({ inlineData: { mimeType: amTrachLandImage.match(/:(.*?);/)?.[1]!, data: amTrachLandImage.split(',')[1] } });
            }
            prompt += `Hãy phân tích toàn diện (tuổi, mệnh, hướng mộ, địa thế) và đưa ra luận giải về ảnh hưởng đến con cháu cùng đề xuất hóa giải nếu cần.`;
            contentParts.push({ text: prompt });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: { parts: contentParts } });
            setAmTrachResult(response.text);
        } catch (e) { setError("Không thể phân tích. Vui lòng thử lại."); } finally { setIsAmTrachLoading(false); }
    };
    
    const handleImageMarkerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isRotating.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setGraveMarkerPosition({ x, y });
    };

    // Tab: Ngày Giờ Tốt
    const handleAnalyzeNgayGioTot = async () => {
        if (!birthYear) { alert("Vui lòng nhập năm sinh."); return; }
        setIsNgayGioTotLoading(true); setNgayGioTotResult(null); setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Bạn là một chuyên gia chọn ngày giờ tốt theo phong thủy Việt Nam. Dựa vào thông tin gia chủ (${gender}, sinh năm ${birthYear}), hãy tìm những ngày giờ tốt nhất trong 3 tháng tới để thực hiện việc '${eventType}'. Liệt kê ít nhất 3 lựa chọn, mỗi lựa chọn bao gồm ngày dương lịch, ngày âm lịch, giờ hoàng đạo tốt nhất và lý do tại sao ngày đó tốt.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setNgayGioTotResult(response.text);
        } catch (e) { setError("Không thể phân tích. Vui lòng thử lại."); } finally { setIsNgayGioTotLoading(false); }
    };
    
    // Tab: Lich Van Nien
    const handleFetchLichVanNien = async () => {
        setIsLichLoading(true); setLichResult(null); setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Bạn là chuyên gia về Lịch Vạn Niên của Việt Nam. Cung cấp thông tin chi tiết cho ngày ${lichDate} (dương lịch), bao gồm: ngày âm lịch (kèm can chi ngày/tháng/năm), ngày là hoàng đạo hay hắc đạo, danh sách các giờ hoàng đạo, các sao tốt/xấu chính, và danh sách các việc nên làm và nên kiêng kỵ trong ngày. Trình bày rõ ràng theo từng mục.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setLichResult(response.text);
        } catch (e) { setError("Không thể tải thông tin. Vui lòng thử lại."); } finally { setIsLichLoading(false); }
    };

    // Tab: Ky Mon
    const handleFetchKyMon = async () => {
        setIsKyMonLoading(true); setKyMonResult(null); setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Bạn là một chuyên gia Kỳ Môn Độn Giáp. Lập bàn và diễn giải Kỳ Môn chi tiết cho thời điểm ${kyMonDateTime} (dương lịch). Phân tích Cục, Cửu tinh, Bát môn, Bát thần, và cấu trúc Can trên Can dưới tại các cung. Đưa ra luận giải tổng quan về thời điểm này và các hướng tốt/xấu.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
            setKyMonResult(response.text);
        } catch (e) { setError("Không thể lập bàn. Vui lòng thử lại."); } finally { setIsKyMonLoading(false); }
    };
    
    // Tab: Trach Menh
    useEffect(() => {
        familyMembers.forEach(member => {
            if (member.birthYear.length === 4 && member.gender && member.menhTrach === undefined && !member.isGettingMenhTrach) {
                (async () => {
                    setFamilyMembers(prev => prev.map(m => m.id === member.id ? { ...m, isGettingMenhTrach: true } : m));
                    try {
                        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                        const response = await ai.models.generateContent({
                            model: 'gemini-2.5-flash',
                            contents: `Dựa trên Bát Trạch phong thủy Việt Nam, cho một người ${member.gender} sinh năm ${member.birthYear}, hãy xác định họ thuộc nhóm nào (Đông tứ mệnh hay Tây tứ mệnh). Trả về một đối tượng JSON với một key duy nhất là "group". Ví dụ: { "group": "Tây tứ mệnh" }`,
                            config: { responseMimeType: "application/json" }
                        });
                        const result = JSON.parse(response.text);
                        const menhTrach = result.group || null;
                        setFamilyMembers(prev => prev.map(m => m.id === member.id ? { ...m, menhTrach, isGettingMenhTrach: false } : m));
                    } catch (e) {
                        console.error("Lỗi lấy mệnh trạch cho thành viên:", e);
                        setFamilyMembers(prev => prev.map(m => m.id === member.id ? { ...m, menhTrach: null, isGettingMenhTrach: false } : m));
                    }
                })();
            }
        });
    }, [familyMembers]);

    useEffect(() => {
        familyMembers.forEach(member => {
            if (member.birthDay && member.birthMonth && member.birthYear.length === 4 && !member.lunarDate && !member.isConvertingDate) {
                (async () => {
                    setFamilyMembers(prev => prev.map(m => m.id === member.id ? { ...m, isConvertingDate: true } : m));
                    try {
                        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                        const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: `Quy đổi ngày dương lịch ${member.birthDay}/${member.birthMonth}/${member.birthYear} sang ngày âm lịch của Việt Nam. Trả về một chuỗi duy nhất theo định dạng "Ngày ... tháng ... năm ... (Can Chi năm)".`});
                        setFamilyMembers(prev => prev.map(m => m.id === member.id ? { ...m, lunarDate: response.text, isConvertingDate: false } : m));
                    } catch (e) {
                        console.error("Lỗi quy đổi ngày:", e);
                        setFamilyMembers(prev => prev.map(m => m.id === member.id ? { ...m, lunarDate: "Lỗi", isConvertingDate: false } : m));
                    }
                })();
            }
        });
    }, [familyMembers]);
    
    const getDaysInMonthForMember = (yearStr: string, monthStr: string) => {
        const month = parseInt(monthStr, 10);
        const year = parseInt(yearStr, 10);
        if (!month || !year || year < 1000) return 31;
        return new Date(year, month, 0).getDate();
    };
    
    const addFamilyMember = () => {
        setFamilyMembers(prev => [...prev, { id: Date.now(), name: '', birthDay: '', birthMonth: '', birthYear: '', gender: 'Nam', role: 'Con Trai' }]);
    };

    const removeFamilyMember = (id: number) => {
        setFamilyMembers(prev => prev.filter(member => member.id !== id));
    };

    const handleFamilyMemberChange = (id: number, field: keyof Omit<FamilyMember, 'id' | 'lunarDate' | 'isConvertingDate' | 'menhTrach' | 'isGettingMenhTrach'>, value: string) => {
        setFamilyMembers(prev => prev.map(member => {
            if (member.id === id) {
                const updatedMember: FamilyMember = { ...member, [field]: value };
                if (field === 'role') {
                    const role = value as FamilyMember['role'];
                    if (['Ông', 'Chồng', 'Con Trai'].includes(role)) updatedMember.gender = 'Nam';
                    else if (['Bà', 'Vợ', 'Con Gái'].includes(role)) updatedMember.gender = 'Nữ';
                }
                if (['birthDay', 'birthMonth', 'birthYear'].includes(field)) {
                    updatedMember.lunarDate = undefined;
                }
                 if (['birthYear', 'gender'].includes(field)) {
                    updatedMember.menhTrach = undefined;
                }
                return updatedMember;
            }
            return member;
        }));
    };
    
    const handleSetTrachMenhHouseCenter = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isRotating.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setTrachMenhHouseCenter({ x, y });
    };

    const handleTrachMenhRotation = useCallback((clientX: number, clientY: number) => {
        if (!isRotating.current || !trachMenhPlotRef.current || !trachMenhHouseCenter) return;
        const rect = trachMenhPlotRef.current.getBoundingClientRect();
        const centerX = rect.left + (trachMenhHouseCenter.x / 100) * rect.width;
        const centerY = rect.top + (trachMenhHouseCenter.y / 100) * rect.height;
        const angleRad = Math.atan2(clientY - centerY, clientX - centerX);
        let angleDeg = angleRad * (180 / Math.PI) + 90;
        setTrachMenhCompassAngle(angleDeg);
    }, [trachMenhHouseCenter]);
    
    const handleTrachMenhDegreeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = parseInt(e.target.value, 10);
        if (isNaN(value)) {
           setTrachMenhCompassAngle(0);
        } else {
            value = Math.max(0, Math.min(359, value));
            setTrachMenhCompassAngle(value);
        }
    };
    
    const handleGenerateConsultation = async () => {
        if (!userGroup) { setError('Chưa xác định được mệnh trạch của gia chủ.'); return; }
        if (!trachMenhHouseCenter) { setError('Vui lòng chọn tâm nhà trên mảnh đất.'); return; }
        
        setIsTrachMenhLoading(true);
        setError(null);
        setConsultationResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const chosenDirection = getDirectionFromAngle(trachMenhCompassAngle);
            const familyInfo = familyMembers
                .filter(m => m.name.trim() && m.birthYear.trim())
                .map(m => `- ${m.role}: ${m.name}, ${m.gender}, sinh năm ${m.birthYear}${m.menhTrach ? `, mệnh trạch: ${m.menhTrach}` : ''}`)
                .join('\n');

            const prompt = `Bạn là một chuyên gia phong thủy Bát Trạch bậc thầy tại Việt Nam. Hãy đưa ra lời tư vấn cho một gia chủ đang xem xét mua một mảnh đất.
**Thông tin Gia chủ:**
- Tên: ${name || 'Chưa cung cấp'}
- Giới tính: ${gender}
- Năm sinh: ${birthYear}
- Mệnh trạch: ${userGroup}
- Các thành viên khác trong gia đình:\n${familyInfo || 'Không có'}

**Thông tin Mảnh đất:**
- Gia chủ đã chọn tâm nhà và định hướng cửa chính là hướng **${chosenDirection}** (${Math.round(trachMenhCompassAngle % 360)} độ).

**Nhiệm vụ:**
1.  Phân tích xem hướng nhà đã chọn (${chosenDirection}) có hợp với mệnh trạch (${userGroup}) của gia chủ không. Giải thích rõ các cung tốt (Sinh Khí, Diên Niên, Thiên Y, Phục Vị) và cung xấu (Tuyệt Mệnh, Ngũ Quỷ, Lục Sát, Họa Hại) của gia chủ.
2.  Đánh giá mức độ phù hợp của hướng nhà đã chọn.
3.  Dựa trên phân tích, đưa ra kết luận cuối cùng: **"Nên mua"**, **"Cần cân nhắc kỹ"**, hoặc **"Không nên mua"**. In đậm kết luận này.
4.  Nếu "Cần cân nhắc", hãy đề xuất các phương án hóa giải hoặc điều chỉnh nhỏ (ví dụ: xoay cửa, dùng vật phẩm phong thủy).
5.  Phân tích sơ bộ ảnh hưởng của hướng nhà đến các thành viên khác trong gia đình, dựa trên mệnh trạch của họ (nếu có thông tin).

Trình bày lời tư vấn một cách rõ ràng, chuyên nghiệp, và dễ hiểu cho người không chuyên.`;
            
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setConsultationResult(response.text);

        } catch (e) {
            console.error(e);
            setError(`Đã xảy ra lỗi: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
        } finally {
            setIsTrachMenhLoading(false);
        }
    };

    const handleCopyTrachMenh = () => {
        if (!consultationResult) return;
        navigator.clipboard.writeText(consultationResult);
        setCopiedTrachMenh(true);
        setTimeout(() => setCopiedTrachMenh(false), 2000);
    };

    const handlePrintTrachMenh = () => handlePrint("Tư vấn Trạch mệnh", consultationResult);

    const handleExportPDFTrachMenh = () => {
        if (!consultationResult) return;
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        doc.setFont('helvetica');

        doc.text("Báo cáo Tư vấn Trạch mệnh", 105, 15, { align: 'center' });
        
        (doc as any).autoTable({
            startY: 25,
            head: [['Thông tin Gia chủ']],
            body: [['Tên', name || 'N/A'], ['Năm sinh', birthYear || 'N/A'], ['Giới tính', gender], ['Mệnh trạch', userGroup || 'N/A']],
            theme: 'grid',
        });
        
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        const textLines = doc.splitTextToSize(consultationResult, 180);
        doc.text(textLines, 14, finalY);
        
        doc.save(`tu-van-trach-menh-${name || 'report'}.pdf`);
    };

    const isAnyLoading = isLoading || isLoanDauLoading || isDuongTrachLoading || isPhiTinhLoading || isThanSatLoading || isTuoiXayNhaLoading || isVanKhanLoading || isMauSacLoading || isTienKiepLoading || isAmTrachLoading || isNgayGioTotLoading || isLichLoading || isKyMonLoading || isLoanDauMapLoading || isTrachMenhLoading;

    const CompassPhotoAnalyzer = () => (
        <div className="mt-4 pt-4 border-t border-zinc-700/50">
            <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider text-center">Đo hướng tự động</h4>
            <p className="text-xs text-center text-zinc-500 mb-3">Chụp ảnh la bàn đặt trên đất để AI tự xác định hướng.</p>
            <input 
                type="file" 
                accept="image/*" 
                capture 
                ref={compassPhotoInputRef}
                onChange={handleCompassPhotoUpload}
                className="hidden"
            />
            <button 
                onClick={() => compassPhotoInputRef.current?.click()}
                disabled={isAnalyzingCompassPhoto}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:bg-zinc-600 disabled:cursor-wait"
            >
                {isAnalyzingCompassPhoto ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang phân tích...
                    </>
                ) : (
                    <>
                        <CameraIcon className="w-5 h-5" />
                        Chụp & Phân tích ảnh La bàn
                    </>
                )}
            </button>
            {compassPhotoError && <p className="text-xs text-red-500 text-center mt-2">{compassPhotoError}</p>}
            {compassPhoto && !isAnalyzingCompassPhoto && !compassPhotoError && (
                 <div className="mt-2 text-center p-2 bg-green-900/40 rounded-md">
                     <p className="text-xs text-green-300">Đã phân tích thành công. Hướng nhà đã được cập nhật.</p>
                 </div>
            )}
        </div>
    );

    const CompassControls = () => (
        <div className="flex flex-col items-center gap-3 mt-4">
            <div className="flex items-center gap-2">
                <button 
                    onClick={toggleCompassMode} 
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors"
                >
                    {compassMode === 'manual' ? <><SensorIcon className="w-4 h-4" /> Tự động</> : <><ManualIcon className="w-4 h-4" /> Thủ công</>}
                </button>
                <button 
                    onClick={saveCurrentDirection} 
                    disabled={isAnyLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-colors"
                >
                    <SaveIcon className="w-4 h-4" /> Lưu hướng
                </button>
            </div>
            {savedDirection && (
                <div className="p-2 text-center bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-lg text-sm w-full max-w-xs">
                    <strong>Đã lưu:</strong> {savedDirection.direction} ({savedDirection.degree}°)
                </div>
            )}
        </div>
    );

    const handleImageUpdate = (dataUrl: string) => {
        setInputImage(dataUrl);
        setOutputImage(null);
        setAnalysisResult(null);
        setHouseCenter(null);
        setError(null);
    };

    const handleSetHouseCenter = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isRotating.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setHouseCenter({ x, y });
    };
    
    const handleRotationStart = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        isRotating.current = true;
        document.body.style.cursor = 'grabbing';
    };

    const handleRotation = useCallback((clientX: number, clientY: number) => {
        if (!isRotating.current) return;

        if (activeTab === 'battrach' && interactivePlotRef.current && houseCenter) {
            const rect = interactivePlotRef.current.getBoundingClientRect();
            const centerX = rect.left + (houseCenter.x / 100) * rect.width;
            const centerY = rect.top + (houseCenter.y / 100) * rect.height;
            const angleRad = Math.atan2(clientY - centerY, clientX - centerX);
            let angleDeg = angleRad * (180 / Math.PI) + 90;
            handleHouseDirectionAngleChange(angleDeg);
        } else if (activeTab === 'amtrach' && amTrachPlotRef.current && graveMarkerPosition) {
            const rect = amTrachPlotRef.current.getBoundingClientRect();
            const centerX = rect.left + (graveMarkerPosition.x / 100) * rect.width;
            const centerY = rect.top + (graveMarkerPosition.y / 100) * rect.height;
            const angleRad = Math.atan2(clientY - centerY, clientX - centerX);
            let angleDeg = angleRad * (180 / Math.PI) + 90;
            handleGraveDirectionAngleChange(angleDeg);
        } else if (activeTab === 'trachmenh') {
             handleTrachMenhRotation(clientX, clientY);
        }
    }, [activeTab, houseCenter, graveMarkerPosition, handleHouseDirectionAngleChange, handleGraveDirectionAngleChange, handleTrachMenhRotation]);

    const handleMouseMove = useCallback((e: MouseEvent) => handleRotation(e.clientX, e.clientY), [handleRotation]);
    
    const handleMouseUp = useCallback(() => {
        isRotating.current = false;
        document.body.style.cursor = '';
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return (
        <div className="w-full h-full flex flex-col animate-fade-in bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-black dark:text-white">Phong thủy</h1>
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">Mang tính tham khảo, bạn nên mời các chuyên gia phong thủy xem hướng, góc độ và phân tích vị trí đó</p>
                </div>
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" aria-label="Close"><CloseIcon /></button>
            </header>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-[420px_1fr] overflow-hidden">
                <aside className="p-6 flex flex-col overflow-y-auto bg-black/50">
                    <div className="space-y-6">
                        <section>
                             <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
                                {activeTab === 'amtrach' ? 'Thông tin người đã mất' : 'Thông tin gia chủ'}
                            </h2>
                             <div className="space-y-3">
                                <input type="text" placeholder="Họ và tên" value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 placeholder-zinc-400 px-3 py-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm"/>
                                
                                <div className="grid grid-cols-3 gap-3">
                                     <CustomSelect label="Ngày sinh" value={birthDay} onChange={e => setBirthDay(e.target.value)}>
                                        <option value="" className="bg-zinc-900 text-zinc-300">Ngày</option>
                                        {Array.from({ length: birthDaysInMonth }, (_, i) => i + 1).map(day => <option key={day} value={day} className="bg-zinc-900 text-zinc-300">{day}</option>)}
                                    </CustomSelect>
                                     <CustomSelect label="Tháng sinh" value={birthMonth} onChange={e => setBirthMonth(e.target.value)}>
                                        <option value="" className="bg-zinc-900 text-zinc-300">Tháng</option>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => <option key={month} value={month} className="bg-zinc-900 text-zinc-300">{month}</option>)}
                                    </CustomSelect>
                                    <input type="number" placeholder="Năm sinh" value={birthYear} onChange={e => setBirthYear(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 placeholder-zinc-400 px-3 py-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
                                </div>
                                 <div className="flex bg-zinc-700/50 p-1 rounded-lg">
                                    <button onClick={() => setGender('Nam')} className={`flex-1 text-center text-sm font-semibold py-1.5 rounded-md transition-colors ${gender === 'Nam' ? 'bg-yellow-400 text-black' : 'text-zinc-300'}`}>Nam</button>
                                    <button onClick={() => setGender('Nữ')} className={`flex-1 text-center text-sm font-semibold py-1.5 rounded-md transition-colors ${gender === 'Nữ' ? 'bg-yellow-400 text-black' : 'text-zinc-300'}`}>Nữ</button>
                                </div>
                                <div className="text-sm text-center p-2 bg-zinc-800 rounded-md">
                                    <p className="text-zinc-400">Âm lịch: <span className="font-semibold text-white">{isConvertingDate ? 'Đang quy đổi...' : (lunarDate || '...')}</span></p>
                                    <p className="text-zinc-400">Mệnh trạch: <span className={`font-bold ${userGroup ? (userGroup === 'Đông tứ mệnh' ? 'text-green-500' : 'text-blue-500') : ''}`}>{isGettingGroup ? 'Đang xác định...' : (userGroup || '...')}</span></p>
                                </div>
                            </div>
                        </section>

                        <div className="flex flex-wrap gap-2">
                           {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${activeTab === tab.id ? 'bg-yellow-400 text-black' : 'bg-zinc-700/50 text-zinc-300 hover:bg-zinc-700'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="border-t border-zinc-700/50"></div>

                        {/* Tab specific inputs */}
                        <div className="relative">
                            {activeTab === 'battrach' && (
                                <div className="space-y-4 animate-fade-in">
                                    <input type="text" placeholder="Địa chỉ" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-zinc-700/50 border border-zinc-600 text-zinc-300 placeholder-zinc-400 px-3 py-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm"/>
                                    <ImageUploadArea image={inputImage} onImageUpdate={handleImageUpdate} onClear={() => handleImageUpdate('')} />
                                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider text-center pt-2">Hướng nhà</h3>
                                    <Compass degree={houseDirectionAngle} onDegreeChange={handleHouseDirectionAngleChange} isDirectionGood={isDirectionGood} disabled={compassMode === 'auto'} />
                                    <CompassControls />
                                    <CompassPhotoAnalyzer />
                                </div>
                            )}
                             {activeTab === 'trachmenh' && (
                                <div className="space-y-4 animate-fade-in">
                                    <section>
                                        <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Thành viên khác trong gia đình</h2>
                                        <div className="space-y-3">
                                            {familyMembers.map((member, index) => {
                                                const days = getDaysInMonthForMember(member.birthYear, member.birthMonth);
                                                return (
                                                    <div key={member.id} className="p-3 bg-zinc-800/50 rounded-lg space-y-2 relative">
                                                        <button onClick={() => removeFamilyMember(member.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600" aria-label={`Xóa ${member.name || 'thành viên'}`}>
                                                            <TrashIcon />
                                                        </button>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <CustomSelect value={member.role} onChange={e => handleFamilyMemberChange(member.id, 'role', e.target.value)}>
                                                                {familyRoles.map(r => <option key={r} value={r} className="bg-zinc-900 text-zinc-300">{r}</option>)}
                                                            </CustomSelect>
                                                            <input type="text" placeholder="Tên" value={member.name} onChange={e => handleFamilyMemberChange(member.id, 'name', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 placeholder-zinc-500 px-3 py-2 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none text-sm" />
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <CustomSelect value={member.birthDay} onChange={e => handleFamilyMemberChange(member.id, 'birthDay', e.target.value)}><option value="" className="bg-zinc-900 text-zinc-300">Ngày</option>{Array.from({ length: days }, (_, i) => i + 1).map(day => <option key={day} value={day} className="bg-zinc-900 text-zinc-300">{day}</option>)}</CustomSelect>
                                                            <CustomSelect value={member.birthMonth} onChange={e => handleFamilyMemberChange(member.id, 'birthMonth', e.target.value)}><option value="" className="bg-zinc-900 text-zinc-300">Tháng</option>{Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m} className="bg-zinc-900 text-zinc-300">{m}</option>)}</CustomSelect>
                                                            <input type="number" placeholder="Năm" value={member.birthYear} onChange={e => handleFamilyMemberChange(member.id, 'birthYear', e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 placeholder-zinc-500 px-3 py-2 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none text-sm"/>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-1 text-xs text-center p-1 bg-zinc-700 rounded">
                                                            <div>Âm lịch: <span className="font-semibold">{member.isConvertingDate ? '...' : (member.lunarDate || '...')}</span></div>
                                                            <div>Mệnh trạch: <span className={`font-semibold ${member.menhTrach === 'Đông tứ mệnh' ? 'text-green-500' : 'text-blue-500'}`}>
                                                                {member.isGettingMenhTrach ? '...' : (member.menhTrach || 'N/A')}
                                                            </span></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <button onClick={addFamilyMember} className="w-full mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-yellow-500 hover:text-yellow-400 transition-colors">
                                            <PlusIcon className="w-5 h-5" /> Thêm thành viên
                                        </button>
                                    </section>
                                    <section>
                                        <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Thông tin Mảnh đất</h2>
                                        <ImageUploadArea image={trachMenhLandImage} onImageUpdate={(dataUrl) => {setTrachMenhLandImage(dataUrl); setTrachMenhHouseCenter(null); setConsultationResult(null);}} onClear={() => {setTrachMenhLandImage(null); setTrachMenhHouseCenter(null);}} label="Tải ảnh mảnh đất"/>
                                        {trachMenhHouseCenter && (
                                            <div className="mt-4">
                                                <label className="block text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Hướng nhà</label>
                                                <div className="flex items-center gap-2 p-2 bg-zinc-800 rounded-lg">
                                                    <label className="text-sm font-medium text-zinc-400">Nhập độ:</label>
                                                    <input type="number" value={Math.round(trachMenhCompassAngle % 360)} onChange={handleTrachMenhDegreeInputChange} min="0" max="359" className="w-full flex-grow bg-zinc-900 text-zinc-200 text-center text-lg font-bold p-1 rounded-md border-2 border-zinc-700 focus:border-yellow-400 focus:ring-0 outline-none"/>
                                                    <span className="text-lg font-bold text-yellow-400">°</span>
                                                </div>
                                            </div>
                                        )}
                                    </section>
                                </div>
                            )}
                            {activeTab === 'loandau' && (
                                <div className="space-y-4 animate-fade-in">
                                    <input type="text" placeholder="Địa chỉ" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-zinc-700/50 border border-zinc-600 text-zinc-300 placeholder-zinc-400 px-3 py-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm"/>
                                    <ImageUploadArea image={loanDauImage} onImageUpdate={setLoanDauImage} onClear={() => setLoanDauImage(null)} label="Tải ảnh công trình" />
                                    <textarea placeholder="Mô tả thêm về địa hình, đường xá, công trình xung quanh..." value={loanDauDescription} onChange={e => setLoanDauDescription(e.target.value)} rows={3} className="w-full bg-zinc-700/50 border border-zinc-600 text-zinc-300 placeholder-zinc-400 p-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm"/>
                                    <div className="p-3 bg-zinc-800/50 rounded-lg space-y-3">
                                        <p className="text-xs text-zinc-400">Cung cấp vị trí để AI phân tích địa thế xung quanh bằng bản đồ vệ tinh.</p>
                                        <button onClick={handleGetLocation} disabled={isGettingLocation} className="w-full bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-300 transition-colors text-sm disabled:bg-zinc-600 disabled:cursor-not-allowed">
                                            {isGettingLocation ? 'Đang lấy...' : 'Lấy vị trí hiện tại'}
                                        </button>
                                        {locationError && <p className="text-xs text-red-500 text-center">{locationError}</p>}
                                        {location && <p className="text-xs text-center font-mono text-zinc-400">Vĩ độ: {location.lat.toFixed(5)}, Kinh độ: {location.lng.toFixed(5)}</p>}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'duongtrach' && (
                                <div className="space-y-4 animate-fade-in">
                                    <CustomSelect label="Hướng cửa chính (Môn)" value={doorDirection} onChange={e => setDoorDirection(e.target.value)}>
                                        {directionOptions.map(opt => <option key={opt.value} value={opt.value} className={isDirectionGood(opt.value) ? 'text-green-400' : 'text-red-400'}>{opt.label}</option>)}
                                    </CustomSelect>
                                     <CustomSelect label="Vị trí bếp (Táo)" value={kitchenDirection} onChange={e => setKitchenDirection(e.target.value)}>
                                        {directionOptions.map(opt => <option key={opt.value} value={opt.value} className={!isDirectionGood(opt.value) ? 'text-green-400' : 'text-red-400'}>{opt.label}</option>)}
                                    </CustomSelect>
                                     <CustomSelect label="Hướng giường ngủ (Chủ)" value={bedroomDirection} onChange={e => setBedroomDirection(e.target.value)}>
                                        {directionOptions.map(opt => <option key={opt.value} value={opt.value} className={isDirectionGood(opt.value) ? 'text-green-400' : 'text-red-400'}>{opt.label}</option>)}
                                    </CustomSelect>
                                </div>
                            )}
                             {activeTab === 'phitinh' && (
                                <div className="space-y-4 animate-fade-in">
                                    <input type="number" placeholder="Năm xây dựng" value={constructionYear} onChange={e => setConstructionYear(e.target.value)} className="w-full bg-zinc-700/50 border border-zinc-600 text-zinc-300 placeholder-zinc-400 p-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm"/>
                                     <CustomSelect label="Hướng nhà" value={houseDirection} onChange={e => setHouseDirection(e.target.value)}>
                                        {directionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </CustomSelect>
                                </div>
                            )}
                            {activeTab === 'thansat' && (
                                <div className="space-y-4 animate-fade-in">
                                    <textarea placeholder="Mô tả các vật thể hoặc kiến trúc bên ngoài nhà bạn nghi ngờ là sát khí..." value={thanSatDescription} onChange={e => setThanSatDescription(e.target.value)} rows={5} className="w-full bg-zinc-700/50 border border-zinc-600 text-zinc-300 placeholder-zinc-400 p-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm"/>
                                </div>
                            )}
                            {activeTab === 'vankhan' && (
                                <div className="space-y-4 animate-fade-in">
                                    <CustomSelect label="Chọn loại văn khấn" value={vanKhanType} onChange={e => setVanKhanType(e.target.value)}>
                                        {vanKhanOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </CustomSelect>
                                </div>
                            )}
                             {activeTab === 'tienkiep' && (
                                <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-xs text-red-300">
                                  Lưu ý: Chức năng này chỉ mang tính chất giải trí, chiêm nghiệm và hoàn toàn hư cấu.
                                </div>
                            )}
                             {activeTab === 'ngaygiotot' && (
                                <div className="space-y-4 animate-fade-in">
                                    <CustomSelect label="Chọn loại việc" value={eventType} onChange={e => setEventType(e.target.value)}>
                                        {eventTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </CustomSelect>
                                </div>
                            )}
                             {activeTab === 'amtrach' && (
                                <div className="space-y-4 animate-fade-in">
                                     <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Thông tin ngày mất</h3>
                                     <div className="grid grid-cols-3 gap-2">
                                        <CustomSelect label="Ngày mất" value={deathDay} onChange={e => setDeathDay(e.target.value)}><option value="">Ngày</option>{Array.from({ length: deathDaysInMonth }, (_, i) => i + 1).map(day => <option key={day} value={day}>{day}</option>)}</CustomSelect>
                                        <CustomSelect label="Tháng mất" value={deathMonth} onChange={e => setDeathMonth(e.target.value)}><option value="">Tháng</option>{Array.from({ length: 12 }, (_, i) => i + 1).map(month => <option key={month} value={month}>{month}</option>)}</CustomSelect>
                                        <input type="number" placeholder="Năm" value={deathYear} onChange={e => setDeathYear(e.target.value)} className="w-full bg-zinc-700/50 border border-zinc-600 text-zinc-300 placeholder-zinc-400 p-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none text-sm"/>
                                    </div>
                                    <CustomSelect label="Giờ mất" value={deathHour} onChange={e => setDeathHour(e.target.value)}>{deathHourOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</CustomSelect>
                                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Thông tin người thân (Tùy chọn)</h3>
                                    <input type="text" placeholder="Tên Vợ/Chồng" value={spouseName} onChange={e => setSpouseName(e.target.value)} className="w-full bg-zinc-700/50 border border-zinc-600 text-zinc-300 placeholder-zinc-400 p-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none text-sm"/>
                                    <input type="number" placeholder="Năm sinh Vợ/Chồng" value={spouseBirthYear} onChange={e => setSpouseBirthYear(e.target.value)} className="w-full bg-zinc-700/50 border border-zinc-600 text-zinc-300 placeholder-zinc-400 p-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none text-sm"/>
                                    <div className="space-y-2 pt-2">
                                        <div className="flex bg-zinc-700/50 p-1 rounded-lg">
                                            <button onClick={() => setEldestChildType('son')} className={`flex-1 text-center text-xs font-semibold py-1 rounded-md transition-colors ${eldestChildType === 'son' ? 'bg-yellow-400 text-black' : 'text-zinc-300'}`}>Con trai trưởng</button>
                                            <button onClick={() => setEldestChildType('daughter')} className={`flex-1 text-center text-xs font-semibold py-1 rounded-md transition-colors ${eldestChildType === 'daughter' ? 'bg-yellow-400 text-black' : 'text-zinc-300'}`}>Con gái trưởng</button>
                                        </div>
                                        <input type="text" placeholder={`Tên ${eldestChildType === 'son' ? 'Con trai trưởng' : 'Con gái trưởng'}`} value={eldestChildName} onChange={e => setEldestChildName(e.target.value)} className="w-full bg-zinc-700/50 border border-zinc-600 text-zinc-300 placeholder-zinc-400 p-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none text-sm"/>
                                        <input type="number" placeholder={`Năm sinh ${eldestChildType === 'son' ? 'Con trai trưởng' : 'Con gái trưởng'}`} value={eldestChildBirthYear} onChange={e => setEldestChildBirthYear(e.target.value)} className="w-full bg-zinc-700/50 border border-zinc-600 text-zinc-300 placeholder-zinc-400 p-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none text-sm"/>
                                    </div>
                                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider text-center">Hướng mộ</h3>
                                    <Compass degree={graveDirectionAngle} onDegreeChange={handleGraveDirectionAngleChange} isDirectionGood={isDirectionGood} disabled={compassMode === 'auto'} />
                                    <CompassControls />
                                    <CompassPhotoAnalyzer />
                                     <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Địa thế (Loan Đầu)</h3>
                                    <ImageUploadArea image={amTrachLandImage} onImageUpdate={setAmTrachLandImage} onClear={() => {setAmTrachLandImage(null); setGraveMarkerPosition(null);}} label="Tải ảnh khu đất" />
                                </div>
                            )}
                        </div>
                    </div>

                    <footer className="mt-auto pt-6">
                        { activeTab === 'battrach' && <button onClick={handleGenerateBatTrach} disabled={isLoading} className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-600 disabled:cursor-not-allowed">Phân tích Bát Trạch</button> }
                        { activeTab === 'trachmenh' && <button onClick={handleGenerateConsultation} disabled={isTrachMenhLoading || !userGroup || !trachMenhHouseCenter} className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-600 disabled:cursor-not-allowed">Xem Tư vấn</button> }
                        { activeTab === 'amtrach' && <button onClick={handleAnalyzeAmTrach} disabled={isAmTrachLoading} className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-600 disabled:cursor-not-allowed">Phân tích Âm Trạch</button> }
                        { activeTab === 'loandau' && <button onClick={handleAnalyzeLoanDau} disabled={isLoanDauLoading || isLoanDauMapLoading} className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-600 disabled:cursor-not-allowed">Phân tích Loan Đầu</button> }
                        { activeTab === 'duongtrach' && <button onClick={handleAnalyzeDuongTrach} disabled={isDuongTrachLoading} className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-600 disabled:cursor-not-allowed">Phân tích Dương Trạch</button> }
                        { activeTab === 'phitinh' && <button onClick={handleFetchPhiTinhInfo} disabled={isPhiTinhLoading} className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-600 disabled:cursor-not-allowed">Xem Phi Tinh</button> }
                        { activeTab === 'thansat' && <button onClick={handleAnalyzeThanSat} disabled={isThanSatLoading} className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-600 disabled:cursor-not-allowed">Phân tích Thần Sát</button> }
                        { activeTab === 'xemtuoi' && <button onClick={handleAnalyzeTuoiXayNha} disabled={isTuoiXayNhaLoading} className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-600 disabled:cursor-not-allowed">Xem tuổi làm nhà</button> }
                        { activeTab === 'ngaygiotot' && <button onClick={handleAnalyzeNgayGioTot} disabled={isNgayGioTotLoading} className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-600 disabled:cursor-not-allowed">Xem ngày giờ tốt</button> }
                        { activeTab === 'vankhan' && <button onClick={handleFetchVanKhan} disabled={isVanKhanLoading} className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-600 disabled:cursor-not-allowed">Tải văn khấn</button> }
                        { activeTab === 'mausac' && <button onClick={handleAnalyzeMauSac} disabled={isMauSacLoading} className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-600 disabled:cursor-not-allowed">Xem màu hợp mệnh</button> }
                        { activeTab === 'tienkiep' && <button onClick={handleAnalyzeTienKiep} disabled={isTienKiepLoading} className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-600 disabled:cursor-not-allowed">Xem tiền kiếp</button> }
                    </footer>
                </aside>
                
                <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gray-200 dark:bg-black/40 overflow-y-auto">
                   {isAnyLoading && <LoadingSpinner />}
                   {error && !isAnyLoading && <div className="text-center text-red-500 flex flex-col items-center"><ErrorIcon /><h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2><p className="mt-1 max-w-md">{error}</p></div>}
                    
                    {!isAnyLoading && !error && (
                      <>
                        {activeTab === 'battrach' && (outputImage && analysisResult ? (
                            <div className="w-full max-w-5xl space-y-6">
                                <div className="relative group/output"><img src={outputImage} alt="Bản vẽ Bát Trạch" className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xl mx-auto"/></div>
                                <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg">
                                    <h3 className="text-lg font-bold text-black dark:text-white">Luận giải Bát Trạch</h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{analysisResult.analysisText}</p>
                                    <h3 className="text-lg font-bold text-black dark:text-white mt-4 mb-2">Năm tốt để xây dựng</h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-300">{analysisResult.constructionYears}</p>
                                </div>
                            </div>
                        ) : inputImage ? (
                            <div
                                ref={interactivePlotRef}
                                className="relative w-full h-full cursor-pointer flex items-center justify-center"
                                onClick={handleSetHouseCenter}
                            >
                                <img src={inputImage} alt="Mặt bằng để phân tích" className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
                                {houseCenter && userGroup && (
                                    <div
                                        className="absolute flex flex-col items-center pointer-events-none"
                                        style={{ left: `${houseCenter.x}%`, top: `${houseCenter.y}%`, transform: 'translate(-50%, -50%)' }}
                                    >
                                        <div
                                            className="relative w-64 h-64 rounded-full bg-zinc-800/80 border-2 border-zinc-600 select-none"
                                            style={{ pointerEvents: 'auto' }}
                                        >
                                            {/* Compass Body for Dragging */}
                                            <div 
                                                className="absolute inset-0 cursor-grab"
                                                onMouseDown={handleRotationStart}
                                            ></div>
                                            {/* Labels and Ticks */}
                                            {directions.map((d) => (
                                                <div key={d.name} className="absolute w-full h-full" style={{ transform: `rotate(${d.angle}deg)` }}>
                                                    <div className={`absolute top-5 left-1/2 -translate-x-1/2 text-center text-sm font-semibold transition-colors ${d.name === houseDirection ? 'text-yellow-400' : 'text-zinc-400'}`}>
                                                        <div style={{ transform: `rotate(${-d.angle}deg)` }}>{d.name}</div>
                                                    </div>
                                                </div>
                                            ))}
                                            {/* Red Indicator Arrow */}
                                            <div className="absolute w-full h-full" style={{ transform: `rotate(${houseDirectionAngle}deg)` }}>
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 w-1 flex flex-col items-center">
                                                    <div className="w-0 h-0 border-x-[5px] border-x-transparent border-b-[10px] border-b-red-500"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute w-3 h-3 bg-yellow-400 rounded-full border-2 border-white pointer-events-none" style={{ left: `${houseCenter?.x}%`, top: `${houseCenter?.y}%`, transform: 'translate(-50%, -50%)', visibility: houseCenter ? 'visible' : 'hidden' }} />
                                {!houseCenter && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg pointer-events-none">
                                        <p className="text-white text-lg font-semibold">Click để chọn tâm nhà</p>
                                    </div>
                                )}
                            </div>
                        ) : (<div className="text-center text-zinc-500 flex flex-col items-center"><PlaceholderIcon /><h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Phân tích Bát Trạch</h2><p className="mt-1">Kết quả phân tích mặt bằng của bạn sẽ hiện ở đây.</p></div>))}

                        {activeTab === 'loandau' && (loanDauResult || loanDauMapImage ? (
                             <div className="w-full max-w-4xl space-y-6">
                                {isLoanDauMapLoading && <LoadingSpinner text="Đang tạo bản đồ Long Mạch..."/>}
                                {loanDauMapImage && <div className="bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-lg"><img src={loanDauMapImage} alt="Bản đồ Long Mạch" className="max-w-full max-h-[40vh] object-contain mx-auto rounded-md"/></div>}
                                {isLoanDauLoading && <LoadingSpinner text="Đang phân tích Loan Đầu..."/>}
                                {loanDauResult && <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg"><h3 className="text-lg font-bold text-black dark:text-white mb-2">Phân tích Loan Đầu (Hình Thế)</h3><div className="text-sm whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 leading-relaxed">{loanDauResult}</div></div>}
                            </div>
                        ) : !isLoanDauLoading && (<div className="text-center text-zinc-500 flex flex-col items-center"><PlaceholderIcon /><h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Phân tích Loan Đầu</h2><p className="mt-1">Kết quả phân tích địa thế sẽ hiện ở đây.</p></div>))}

                        {activeTab === 'amtrach' && (amTrachResult ? (
                            <div className="w-full max-w-3xl bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg">
                                 <div className="flex justify-between items-start mb-3">
                                     <h3 className="text-lg font-bold text-black dark:text-white">Phân tích Âm Trạch</h3>
                                 </div>
                                 <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-[70vh] overflow-y-auto">{amTrachResult}</div>
                             </div>
                        ) : amTrachLandImage ? (
                            <div
                                ref={amTrachPlotRef}
                                className="relative w-full h-full cursor-pointer flex items-center justify-center"
                                onClick={handleImageMarkerClick}
                            >
                                <img src={amTrachLandImage} alt="Khu đất để phân tích" className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
                                {graveMarkerPosition && userGroup && (
                                    <div
                                        className="absolute flex flex-col items-center pointer-events-none"
                                        style={{ left: `${graveMarkerPosition.x}%`, top: `${graveMarkerPosition.y}%`, transform: 'translate(-50%, -50%)' }}
                                    >
                                        <div
                                            className="relative w-64 h-64 rounded-full bg-zinc-800/80 border-2 border-zinc-600 select-none"
                                            style={{ pointerEvents: 'auto' }}
                                        >
                                            <div className="absolute inset-0 cursor-grab" onMouseDown={handleRotationStart}></div>
                                            {directions.map((d) => (
                                                <div key={d.name} className="absolute w-full h-full" style={{ transform: `rotate(${d.angle}deg)` }}>
                                                    <div className={`absolute top-5 left-1/2 -translate-x-1/2 text-center text-sm font-semibold transition-colors ${d.name === graveDirection ? 'text-yellow-400' : 'text-zinc-400'}`}>
                                                        <div style={{ transform: `rotate(${-d.angle}deg)` }}>{d.name}</div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="absolute w-full h-full" style={{ transform: `rotate(${graveDirectionAngle}deg)` }}>
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 w-1 flex flex-col items-center">
                                                    <div className="w-0 h-0 border-x-[5px] border-x-transparent border-b-[10px] border-b-red-500"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute w-3 h-3 bg-yellow-400 rounded-full border-2 border-white pointer-events-none" style={{ left: `${graveMarkerPosition?.x}%`, top: `${graveMarkerPosition?.y}%`, transform: 'translate(-50%, -50%)', visibility: graveMarkerPosition ? 'visible' : 'hidden' }} />
                                {!graveMarkerPosition && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg pointer-events-none">
                                        <p className="text-white text-lg font-semibold">Click để chọn tâm mộ</p>
                                    </div>
                                )}
                            </div>
                        ) : (<div className="text-center text-zinc-500 flex flex-col items-center"><PlaceholderIcon /><h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Phân tích Âm Trạch</h2><p className="mt-1">Kết quả phân tích sẽ hiện ở đây.</p></div>))}

                        {/* Other tabs render logic */}
                        {['duongtrach', 'phitinh', 'thansat', 'xemtuoi', 'ngaygiotot', 'vankhan', 'tienkiep', 'lichvannien', 'kymon'].includes(activeTab) && (
                            (() => {
                                const resultsMap: Record<string, {loading: boolean, result: string|null, title: string}> = {
                                    duongtrach: { loading: isDuongTrachLoading, result: duongTrachResult, title: 'Phân tích Dương Trạch Tam Yếu' },
                                    phitinh: { loading: isPhiTinhLoading, result: phiTinhResult, title: 'Phân tích Phi Tinh' },
                                    thansat: { loading: isThanSatLoading, result: thanSatResult, title: 'Phân tích Thần Sát' },
                                    xemtuoi: { loading: isTuoiXayNhaLoading, result: tuoiXayNhaResult, title: 'Phân tích Tuổi làm nhà' },
                                    ngaygiotot: { loading: isNgayGioTotLoading, result: ngayGioTotResult, title: `Các ngày giờ tốt cho việc ${eventType}` },
                                    vankhan: { loading: isVanKhanLoading, result: vanKhanResult, title: `Văn khấn ${vanKhanType}` },
                                    tienkiep: { loading: isTienKiepLoading, result: tienKiepResult, title: `Câu chuyện tiền kiếp của ${name}` },
                                    lichvannien: { loading: isLichLoading, result: lichResult, title: `Thông tin ngày ${new Date(lichDate).toLocaleDateString('vi-VN')}` },
                                    kymon: { loading: isKyMonLoading, result: kyMonResult, title: `Bàn Kỳ Môn lúc ${new Date(kyMonDateTime).toLocaleString('vi-VN')}` },
                                };
                                const current = resultsMap[activeTab];
                                return !current.loading && current.result ? (
                                    <div className="w-full max-w-3xl bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-lg font-bold text-black dark:text-white">{current.title}</h3>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <button onClick={() => handleCopyToClipboard(current.result, activeTab)} className="flex items-center gap-1.5 text-xs font-semibold bg-gray-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1 rounded-full hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors">{copiedStatus === activeTab ? <CheckIcon /> : <CopyIcon />} Sao chép</button>
                                                <button onClick={() => handlePrint(current.title, current.result)} className="flex items-center gap-1.5 text-xs font-semibold bg-gray-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1 rounded-full hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors"><PrintIcon /> In</button>
                                            </div>
                                        </div>
                                        <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-[70vh] overflow-y-auto">{current.result}</div>
                                    </div>
                                ) : !current.loading && (<div className="text-center text-zinc-500 flex flex-col items-center"><PlaceholderIcon /><h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">{current.title}</h2><p className="mt-1">Kết quả phân tích sẽ hiện ở đây.</p></div>)
                            })()
                        )}
                        {activeTab === 'mausac' && (!isMauSacLoading && mauSacResult ? (
                             <div className="w-full max-w-2xl bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg text-center">
                                <h3 className="text-lg font-bold text-black dark:text-white">Gia chủ sinh năm {birthYear} thuộc mệnh</h3>
                                <p className="text-4xl font-bold my-4 text-yellow-400">{mauSacResult.element}</p>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">{mauSacResult.explanation}</p>
                             </div>
                        ) : !isMauSacLoading && (<div className="text-center text-zinc-500 flex flex-col items-center"><PlaceholderIcon /><h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Xem màu hợp mệnh</h2><p className="mt-1">Nhập năm sinh để AI phân tích.</p></div>))}
                        
                        {activeTab === 'trachmenh' && (consultationResult ? (
                            <div className="w-full max-w-3xl bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg max-h-full overflow-y-auto">
                               <div className="flex justify-between items-start mb-4">
                                   <h3 className="text-lg font-bold text-black dark:text-white">Kết quả Tư vấn Trạch mệnh</h3>
                                   <div className="flex items-center gap-2">
                                       <button onClick={handleCopyTrachMenh} className="flex items-center gap-1 text-xs font-semibold bg-gray-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-full hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors">{copiedTrachMenh ? <><CheckIcon className="w-4 h-4 text-green-500"/>Đã chép</> : <><CopyIcon className="w-4 h-4"/>Sao chép</>}</button>
                                       <button onClick={handlePrintTrachMenh} className="flex items-center gap-1 text-xs font-semibold bg-gray-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-full hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors"><PrintIcon className="w-4 h-4"/>In</button>
                                       <button onClick={handleExportPDFTrachMenh} className="flex items-center gap-1 text-xs font-semibold bg-gray-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-full hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors"><PdfIcon className="w-4 h-4"/>Xuất PDF</button>
                                   </div>
                               </div>
                               <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{consultationResult}</div>
                            </div>
                        ) : trachMenhLandImage ? (
                            <div
                                ref={trachMenhPlotRef}
                                className="relative w-full h-full cursor-pointer flex items-center justify-center"
                                onClick={handleSetTrachMenhHouseCenter}
                            >
                                <img src={trachMenhLandImage} alt="Mảnh đất để tư vấn" className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
                                {trachMenhHouseCenter && userGroup && (
                                    <div
                                        className="absolute flex flex-col items-center pointer-events-none"
                                        style={{ left: `${trachMenhHouseCenter.x}%`, top: `${trachMenhHouseCenter.y}%`, transform: 'translate(-50%, -50%)' }}
                                    >
                                        <div
                                            className="relative w-64 h-64 rounded-full bg-zinc-800/80 border-2 border-zinc-600 select-none"
                                            style={{ pointerEvents: 'auto' }}
                                        >
                                            <div 
                                                className="absolute inset-0 cursor-grab"
                                                onMouseDown={handleRotationStart}
                                            ></div>
                                            {directions.map((d) => (
                                                <div key={d.name} className="absolute w-full h-full" style={{ transform: `rotate(${d.angle}deg)` }}>
                                                    <div className={`absolute top-5 left-1/2 -translate-x-1/2 text-center text-sm font-semibold transition-colors ${d.name === getDirectionFromAngle(trachMenhCompassAngle) ? 'text-yellow-400' : 'text-zinc-400'}`}>
                                                        <div style={{ transform: `rotate(${-d.angle}deg)` }}>{d.name}</div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="absolute w-full h-full" style={{ transform: `rotate(${trachMenhCompassAngle}deg)` }}>
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 w-1 flex flex-col items-center">
                                                    <div className="w-0 h-0 border-x-[5px] border-x-transparent border-b-[10px] border-b-red-500"></div>
                                                </div>
                                            </div>
                                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute w-3 h-3 bg-yellow-400 rounded-full border-2 border-white pointer-events-none" style={{ left: `${trachMenhHouseCenter?.x}%`, top: `${trachMenhHouseCenter?.y}%`, transform: 'translate(-50%, -50%)', visibility: trachMenhHouseCenter ? 'visible' : 'hidden' }} />
                                {!trachMenhHouseCenter && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg pointer-events-none">
                                        <p className="text-white text-lg font-semibold">Click để chọn tâm nhà</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-zinc-500 flex flex-col items-center justify-center h-full">
                                <PlaceholderIcon />
                                <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Tư vấn Mua đất</h2>
                                <p className="mt-1 max-w-sm">Nhập thông tin và tải ảnh mảnh đất để AI phân tích và đưa ra lời khuyên.</p>
                            </div>
                        ))}

                      </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default BatTrachTool;