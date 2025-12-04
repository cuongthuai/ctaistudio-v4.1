
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { BackIcon } from './icons/ChatIcons';
import VisualizationImprovementTool from './VisualizationImprovementTool';
import { useLocalization } from '../contexts/LocalizationContext';

// --- ICONS ---
const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-500 mb-2 group-hover:text-yellow-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);
const CameraIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2H4zm12 12H4a1 1 0 01-1-1V7a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1zM9 10a3 3 0 100 6 3 3 0 000-6zm-1 3a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
    </svg>
);
const CloseIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const PlusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
    </svg>
);
const PlaceholderIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-zinc-500 dark:text-zinc-600 my-4" fill="currentColor" viewBox="http://www.w3.org/2000/svg">
        <path d="M11 2h2v3h-2z" />
        <path fillRule="evenodd" d="M12 5.5L6 10.75V22h12V10.75L12 5.5zM16.5 11.5v9h-9v-9l4.5-4.5 4.5 4.5z" />
    </svg>
);
const LoadingSpinner: React.FC<{
    isBatch?: boolean;
    progress?: { current: number; total: number; };
    small?: boolean;
    message?: string;
}> = ({ isBatch = false, progress = { current: 0, total: 0 }, small = false, message }) => {
    if (small) {
        return <svg aria-hidden="true" className="w-5 h-5 text-zinc-400 animate-spin fill-yellow-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>;
    }
    return (
    <div role="status" className="flex flex-col items-center text-center text-zinc-500 dark:text-zinc-400">
        <svg aria-hidden="true" className="w-12 h-12 mb-4 text-zinc-200 dark:text-zinc-600 animate-spin fill-yellow-400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        {isBatch ? (
            <>
                <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-300">{message || 'Đang tạo hàng loạt...'}</h2>
                <p className="mt-1">Đã hoàn thành {progress.current} / {progress.total} ảnh.</p>
            </>
        ) : (
             <>
                <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-300">{message || 'Đang xử lý...'}</h2>
                <p className="mt-1">Vui lòng đợi trong giây lát.</p>
            </>
        )}
        <span className="sr-only">Loading...</span>
    </div>
)};
const ErrorIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const ReplaceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" /></svg>;
const ZoomIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
const CropIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zM4 5a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" /><path d="M15 3a1 1 0 011 1v2h-2V4a1 1 0 011-1zM5 3a1 1 0 011-1h2v2H5V4a1 1 0 01-1-1zM4 15a1 1 0 011-1h2v2H5a1 1 0 01-1-1zM16 15a1 1 0 01-1 1h-2v-2h2a1 1 0 011 1z" /></svg>;
const SendToInputIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.086V3a1 1 0 112 0v8.086l1.293-1.379a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const SparklesIcon = ({ className }: { className?: string } = {}) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5 mr-2"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.172a2 2 0 00.586 1.414l2.828 2.828a2 2 0 002.828 0l2.828-2.828A2 2 0 0015 4.172V3a1 1 0 10-2 0v1.172a.5.5 0 01-.146.354l-2.828 2.828a.5.5 0 01-.708 0L6.464 4.526A.5.5 0 016 4.172V3a1 1 0 00-1-1zm10 4a1 1 0 00-1 1v6.828a2 2 0 00.586 1.414l2.828 2.828a2 2 0 002.828 0l2.828-2.828A2 2 0 0021 13.828V7a1 1 0 10-2 0v6.828a.5.5 0 01-.146.354l-2.828 2.828a.5.5 0 01-.708 0L12.464 14.18A.5.5 0 0112 13.828V7a1 1 0 00-1-1zM2 5a1 1 0 00-1 1v6.828a2 2 0 00.586 1.414l2.828 2.828a2 2 0 002.828 0l2.828-2.828A2 2 0 0011 13.828V7a1 1 0 10-2 0v6.828a.5.5 0 01-.146.354l-2.828 2.828a.5.5 0 01-.708 0L2.464 14.18A.5.5 0 012 13.828V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CheckIcon = ({ className }: { className?: string } = {}) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4 text-green-400"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const InfoIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);
const MapPinIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 21l-4.95-6.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>);

const CreativePromptsPlaceholderIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-zinc-500 dark:text-zinc-600 my-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>);
const CreativePromptsLoadingSpinner: React.FC<{text: string, small?: boolean}> = ({ text, small = false }) => ( 
    <div role="status" className={`flex flex-col items-center text-center text-zinc-500 dark:text-zinc-400 ${small ? 'p-4' : ''}`}>
        <svg aria-hidden="true" className={`${small ? 'w-8 h-8' : 'w-12 h-12'} mb-3 text-zinc-200 dark:text-zinc-600 animate-spin fill-yellow-400`} viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
        <h2 className={`${small ? 'text-sm' : 'text-xl'} font-semibold text-zinc-800 dark:text-zinc-300`}>{text}</h2>
        <span className="sr-only">Loading...</span>
    </div>
);


// --- HELPER COMPONENTS ---

const MapView: React.FC<{lat: number; lng: number;}> = ({ lat, lng }) => {
    const mapSrc = `https://maps.google.com/maps?q=${lat},${lng}&t=k&z=18&output=embed&hl=vi`;
    return (
        <iframe
            width="100%"
            height="100%"
            src={mapSrc}
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Bản đồ vị trí"
        ></iframe>
    );
};

const CropModal: React.FC<{
    imageSrc: string;
    onClose: () => void;
    onSave: (croppedDataUrl: string) => void;
}> = ({ imageSrc, onClose, onSave }) => {
    const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 }); // in percentage
    const [aspect, setAspect] = useState<number | undefined>(undefined);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const handleSave = () => {
        if (!imageRef.current) return;
        const img = imageRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;

        const pixelCrop = {
            x: (crop.x / 100) * img.width * scaleX,
            y: (crop.y / 100) * img.height * scaleY,
            width: (crop.width / 100) * img.width * scaleX,
            height: (crop.height / 100) * img.height * scaleY,
        };

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(
            img,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );
        onSave(canvas.toDataURL('image/jpeg'));
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        isDragging.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const dx = ((e.clientX - dragStart.current.x) / rect.width) * 100;
        const dy = ((e.clientY - dragStart.current.y) / rect.height) * 100;
        
        setCrop(c => ({
            ...c,
            x: Math.max(0, Math.min(c.x + dx, 100 - c.width)),
            y: Math.max(0, Math.min(c.y + dy, 100 - c.height))
        }));
        dragStart.current = { x: e.clientX, y: e.clientY };
    }, []);
    
    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);
    
    const changeAspect = (newAspect: number | undefined) => {
        setAspect(newAspect);
        if (newAspect && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setCrop(c => {
                const currentWidth = c.width;
                let newHeight = (currentWidth / 100 * rect.width) / newAspect / rect.height * 100;
                if (c.y + newHeight > 100) {
                    newHeight = 100 - c.y;
                }
                return { ...c, height: newHeight };
            });
        }
    };
    
    const aspectRatios = [
        { name: 'Tự động', value: undefined }, { name: 'Vuông (1:1)', value: 1/1 },
        { name: 'Ngang (4:3)', value: 4/3 }, { name: 'Dọc (3:4)', value: 3/4 },
        { name: 'Rộng (16:9)', value: 16/9 }, { name: 'Story (9:16)', value: 9/16 },
    ];

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-3xl" ref={containerRef}>
                <img ref={imageRef} src={imageSrc} alt="Cropping preview" className="max-w-full max-h-[70vh] object-contain" />
                <div 
                    className="absolute border-2 border-yellow-400 bg-black/40 cursor-move"
                    style={{
                        top: `${crop.y}%`, left: `${crop.x}%`,
                        width: `${crop.width}%`, height: `${crop.height}%`,
                    }}
                    onMouseDown={handleMouseDown}
                ></div>
            </div>
            <div className="mt-4 bg-zinc-800 p-3 rounded-lg flex items-center gap-2 flex-wrap justify-center">
                 {aspectRatios.map(ar => (
                    <button key={ar.name} onClick={() => changeAspect(ar.value)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${aspect === ar.value ? 'bg-yellow-400 text-black' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
                    >{ar.name}</button>
                ))}
            </div>
             <div className="mt-4 flex gap-4">
                <button onClick={onClose} className="px-6 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-500 transition-colors">Huỷ</button>
                <button onClick={handleSave} className="px-6 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transition-colors">Lưu</button>
            </div>
        </div>
    );
};

const ImageWithControls: React.FC<{
  image: string;
  onImageUpdate: (fileOrDataUrl: File | string) => void;
  onClear: () => void;
  alt: string;
  maxHeight?: string;
}> = ({ image, onImageUpdate, onClear, alt, maxHeight = '240px' }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isCropping, setIsCropping] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageUpdate(e.target.files[0]);
        }
    };
    
    const handleSaveCrop = (croppedDataUrl: string) => {
        onImageUpdate(croppedDataUrl);
        setIsCropping(false);
    };

    return (
        <>
            <div className="relative group bg-gray-200 dark:bg-zinc-900/50 p-2 rounded-lg border border-gray-300 dark:border-zinc-700">
                <img src={image} alt={alt} className="w-full h-auto object-contain rounded-md" style={{ maxHeight }} />
                <div className="absolute inset-0 flex items-center justify-center gap-3 transition-opacity lg:bg-black/70 lg:opacity-0 lg:group-hover:opacity-100">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-zinc-800 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Thay ảnh"><ReplaceIcon /></button>
                    <button onClick={() => setIsZoomed(true)} className="p-2.5 bg-zinc-800 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Phóng to"><ZoomIcon /></button>
                    <button onClick={() => setIsCropping(true)} className="p-2.5 bg-zinc-800 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Cắt ảnh"><CropIcon /></button>
                    <button onClick={onClear} className="p-2.5 bg-zinc-800 rounded-full text-white hover:bg-red-500 transition-colors" title="Xoá ảnh"><TrashIcon /></button>
                </div>
            </div>
            {isZoomed && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setIsZoomed(false)}>
                    <img src={image} alt={`${alt} zoomed`} className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
                     <button className="absolute top-4 right-4 text-white p-2 bg-black/50 rounded-full hover:bg-black/80" onClick={() => setIsZoomed(false)}><CloseIcon className="h-6 w-6" /></button>
                </div>
            )}
            {isCropping && (
                <CropModal imageSrc={image} onClose={() => setIsCropping(false)} onSave={handleSaveCrop} />
            )}
        </>
    );
};

const BatchImageUploadArea: React.FC<{
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
        newImageUrls.push(reader.result as string);
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
        <div className="grid grid-cols-3 gap-2">
            {images.map((image, index) => (
                <div key={index} className="relative group aspect-square">
                    <img src={image} alt={`Batch input ${index + 1}`} className="w-full h-full object-cover rounded-md" />
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

const CustomSelect: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; disabled?: boolean; }> = ({ label, value, onChange, children, disabled = false }) => (
    <div className={`relative ${disabled ? 'opacity-50' : ''}`}>
        <select
            value={value}
            onChange={onChange}
            aria-label={label}
            disabled={disabled}
            className="w-full appearance-none bg-gray-200 dark:bg-zinc-800 border-2 border-gray-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-300 px-4 py-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm disabled:cursor-not-allowed"
        >
            {children}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
    </div>
);

const MultiSelectDropdown: React.FC<{
    label: string;
    options: { value: string; label: string }[];
    selected: string[];
    onChange: (selected: string[]) => void;
    disabled?: boolean;
}> = ({ label, options, selected, onChange, disabled = false }) => {
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
        <div className={`relative ${disabled ? 'opacity-50' : ''}`} ref={ref}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                aria-label={label}
                disabled={disabled}
                className="w-full flex items-center justify-between appearance-none bg-gray-200 dark:bg-zinc-700/50 border-2 border-transparent text-zinc-800 dark:text-zinc-300 px-4 py-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm disabled:cursor-not-allowed"
            >
                <span>{label} {selected.length > 0 ? `(${selected.length})` : ''}</span>
                <svg className={`w-4 h-4 text-zinc-500 dark:text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 20 20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isOpen && !disabled && (
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


const NumberInput: React.FC<{ value: number; onChange: (newValue: number) => void; }> = ({ value, onChange }) => (
    <div className="flex items-center justify-between bg-gray-200 dark:bg-zinc-700/50 rounded-lg p-1.5">
        <button onClick={() => onChange(Math.max(1, value - 1))} className="px-4 py-1.5 text-xl font-bold text-zinc-800 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600 rounded-md transition-colors">-</button>
        <span className="text-lg font-bold text-black dark:text-white tabular-nums">{value}</span>
        <button onClick={() => onChange(Math.min(10, value + 1))} className="px-4 py-1.5 text-xl font-bold text-zinc-800 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600 rounded-md transition-colors">+</button>
    </div>
);

// Option definitions for select dropdowns
const controlOptions = {
    designStyle: [
        {value: 'phong cách hiện đại', label: 'Hiện đại'}, {value: 'phong cách tối giản', label: 'Tối giản'},
        {value: 'phong cách cổ điển', label: 'Cổ điển'}, {value: 'phong cách công nghiệp', label: 'Công nghiệp'},
        {value: 'phong cách brutalist', label: 'Brutalism'}, {value: 'phong cách tương lai', label: 'Tương lai'},
        {value: 'phong cách Scandinavian', label: 'Scandinavian'}, {value: 'phong cách Indochine', label: 'Indochine (Đông Dương)'},
        {value: 'phong cách Art Deco', label: 'Art Deco'}, {value: 'phong cách ven biển (Coastal)', label: 'Ven biển'},
    ],
    materials: [
        {value: 'bê tông', label: 'Bê tông'}, {value: 'kính', label: 'Kính'}, {value: 'gỗ', label: 'Gỗ'},
        {value: 'gạch', label: 'Gạch'}, {value: 'thép', label: 'Thép'}, {value: 'đá', label: 'Đá'},
    ],
    context: [
        {value: 'bối cảnh thành thị', label: 'Thành thị'}, {value: 'bối cảnh nông thôn', label: 'Nông thôn'},
        {value: 'bối cảnh ven biển', label: 'Ven biển'}, {value: 'bối cảnh miền núi', label: 'Miền núi'},
        {value: 'bối cảnh ngoại ô', label: 'Ngoại ô'}, {value: 'bối cảnh trong rừng', label: 'Trong rừng'},
    ],
    timeOfDay: [
        {value: 'vào bình minh', label: 'Bình minh'}, {value: 'vào buổi trưa', label: 'Buổi trưa'},
        {value: 'lúc hoàng hôn', label: 'Hoàng hôn'}, {value: 'vào ban đêm', label: 'Ban đêm'},
        {value: 'giờ vàng (golden hour)', label: 'Giờ vàng'}, {value: 'giờ xanh (blue hour)', label: 'Giờ xanh'},
    ],
    weather: [
        {value: 'trời nắng', label: 'Nắng'}, {value: 'nhiều mây', label: 'Nhiều mây'},
        {value: 'trời mưa', label: 'Mưa'}, {value: 'có tuyết', label: 'Tuyết'},
        {value: 'có sương mù', label: 'Sương mù'}, {value: 'bão tố', label: 'Bão tố'},
    ],
    cameraAngle: [
        {value: 'góc chụp ngang tầm mắt', label: 'Ngang tầm mắt'},
        {value: 'góc chụp từ trên cao xuống', label: 'Góc cao'},
        {value: 'góc chụp từ dưới lên', label: 'Góc thấp'},
        {value: 'góc chụp từ góc nhìn con sâu', label: 'Sát mặt đất'},
        {value: 'góc chụp từ góc nhìn chim bay', label: 'Nhìn từ trên không (drone)'},
    ],
    lighting: [
        {value: 'ánh sáng dịu nhẹ, khuếch tán', label: 'Ánh sáng dịu'},
        {value: 'ánh sáng gắt, tạo bóng đổ rõ nét', label: 'Ánh sáng gắt'},
        {value: 'ánh sáng giờ vàng', label: 'Giờ vàng'},
        {value: 'ánh sáng giờ xanh', label: 'Giờ xanh'},
        {value: 'ánh sáng ngược (backlight)', label: 'Ngược sáng'},
    ],
    exteriorView: [
        {value: 'Góc chụp trực diện toàn cảnh mặt tiền căn nhà', label: 'Toàn cảnh'},
        {value: 'Góc chụp 3/4 bên trái, thể hiện cả mặt tiền và hông nhà', label: 'Góc 3/4 trái'},
        {value: 'Góc chụp 3/4 bên phải, lấy được chiều sâu công trình', label:'Góc 3/4 phải'},
        {value: 'Góc chụp xuyên qua hàng cây/cảnh quan để tạo khung tự nhiên', label:'Góc chụp Xuyên cây'},
        {value: 'Góc chụp từ trong nhà nhìn ra sân vườn hoặc cổng', label:'Góc chụp trong nhà ra'},
        {value: 'Góc chụp ban đêm với ánh sáng nhân tạo, nhấn mạnh hệ thống đèn', label:'Góc chụp ban đêm'},
        {value: 'Góc chụp panorama quét ngang, bao trọn bối cảnh và môi trường xung quanh', label:'Góc panorama'},
        {value: 'Góc chụp từ dưới lên (low angle), nhấn mạnh chiều cao và sự bề thế', label: 'Từ dưới lên'},
        {value: 'Góc chụp từ trên cao nhìn xuống (drone view) toàn cảnh khuôn viên', label: 'Từ trên không'}, 
        {value: 'Góc chụp cận cảnh chi tiết cửa chính và vật liệu mặt tiền', label: 'Cận cảnh'},
    ],
    interiorView: [
        {value: 'nội thất phòng khách', label: 'Phòng khách'}, {value: 'nội thất phòng ngủ', label: 'Phòng ngủ'},
        {value: 'nội thất bếp', label: 'Bếp'}, {value: 'nội thất phòng tắm', label: 'Phòng tắm'},
        {value: 'nội thất văn phòng tại nhà', label: 'Văn phòng tại nhà'}, {value: 'nội thất phòng ăn', label: 'Phòng ăn'},
        {value: 'nội thất không gian mở', label: 'Không gian mở'},
    ],
    interiorStyle: [
        {value: 'phong cách hiện đại', label: 'Hiện đại'}, {value: 'phong cách tối giản', label: 'Tối giản'},
        {value: 'phong cách Scandinavian', label: 'Scandinavian'}, {value: 'phong cách Indochine', label: 'Indochine'},
        {value: 'phong cách Bohemian', label: 'Bohemian'}, {value: 'phong cách Japandi', label: 'Japandi'},
        {value: 'phong cách Art Deco', label: 'Art Deco'}, {value: 'phong cách công nghiệp', label: 'Công nghiệp'},
    ],
    interiorMood: [
        {value: 'ấm cúng và gần gũi', label: 'Ấm cúng, gần gũi'}, {value: 'sáng sủa và thoáng đãng', label: 'Sáng sủa, thoáng đãng'},
        {value: 'sang trọng và thanh lịch', label: 'Sang trọng, thanh lịch'}, {value: 'vui tươi và năng động', label: 'Vui tươi, năng động'},
        {value: 'tĩnh lặng và thiền định', label: 'Tĩnh lặng, thiền định'},
    ],
    colorPalette: [
        {value: 'tông màu trung tính (trắng, xám, be)', label: 'Trung tính'}, {value: 'tông màu đơn sắc (monochromatic)', label: 'Đơn sắc'},
        {value: 'màu sắc tương phản mạnh', label: 'Tương phản mạnh'}, {value: 'màu pastel nhẹ nhàng', label: 'Pastel'},
        {value: 'tông màu đất ấm áp', label: 'Tông đất'},
    ],
    landscapeStyle: [
        {value: 'phong cách vườn Nhật Bản (Zen garden)', label: 'Vườn Nhật (Zen)'},
        {value: 'phong cách nhiệt đới (tropical)', label: 'Nhiệt đới'},
        {value: 'phong cách Địa Trung Hải (Mediterranean)', label: 'Địa Trung Hải'},
        {value: 'phong cách vườn Anh (English cottage)', label: 'Vườn Anh'},
        {value: 'phong cách hiện đại, tối giản', label: 'Hiện đại'},
        {value: 'phong cách sa mạc (desert oasis)', label: 'Sa mạc'},
        {value: 'vườn trang trọng (formal garden)', label: 'Vườn trang trọng'},
    ],
    landscapeElements: [
        {value: 'hồ nước hoặc suối nhỏ', label: 'Hồ/Suối'},
        {value: 'lối đi bằng đá', label: 'Lối đi đá'},
        {value: 'sàn gỗ ngoài trời (deck)', label: 'Sàn gỗ'},
        {value: 'khu vực trồng hoa nhiều màu sắc', label: 'Luống hoa'},
        {value: 'cây cổ thụ', label: 'Cây cổ thụ'},
        {value: 'đèn chiếu sáng sân vườn', label: 'Đèn sân vườn'},
        {value: 'hòn non bộ', label: 'Hòn non bộ'},
        {value: 'khu vực BBQ ngoài trời', label: 'Khu vực BBQ'},
        {value: 'giàn hoa/gazebo', label: 'Giàn hoa/Gazebo'},
        {value: 'lò sưởi ngoài trời', label: 'Lò sưởi ngoài trời'},
        {value: 'tượng điêu khắc', label: 'Tượng điêu khắc'},
        {value: 'vườn rau', label: 'Vườn rau'},
    ],
};


// --- MAIN COMPONENT ---
interface AIArchitectureToolProps {
  onBack: () => void;
}

interface HistoryItem {
  id: string;
  toolId: number;
  toolTitle: string;
  generatedImage: string;
  analyzedPrompt: string;
  createdAt: string;
}

const HISTORY_KEY = 'ctai_detailed_history';
const HISTORY_LIMIT = 50;
const PROMPT_LIBRARY_KEY = 'ctai_prompt_library';

const dataUrlToPart = (dataUrl: string) => {
    const [header, base64Data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1];
    if (!mimeType || !base64Data) throw new Error("Invalid data URL");
    return { inlineData: { mimeType, data: base64Data } };
};

const updateHistory = async (newImage: string, inputDetails: any) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const analysisPrompt = `Phân tích các thông số đầu vào và hình ảnh kết quả để tạo ra một prompt ngắn gọn, súc tích nhưng đầy đủ bằng tiếng Việt. Prompt này phải mô tả quá trình tạo ảnh, đủ để người khác có thể tái tạo lại một hình ảnh tương tự.
        
        **Thông tin đầu vào:**
        - Công cụ: ${inputDetails.toolTitle}
        - Mô tả người dùng: "${inputDetails.prompt}"
        - Các tùy chọn đã chọn: ${JSON.stringify(inputDetails.options, null, 2)}
        - Có sử dụng ảnh đầu vào: ${inputDetails.hasInputImage ? 'Có' : 'Không'}
        
        **Hướng dẫn:**
        - Kết hợp tất cả thông tin trên thành một câu hoặc một đoạn văn ngắn.
        - Tập trung vào các yếu tố chính đã tạo nên hình ảnh.
        - Bỏ qua các chi tiết không cần thiết.
        - Ngôn ngữ tự nhiên, dễ đọc.`;

        const imagePart = dataUrlToPart(newImage);
        const textPart = { text: analysisPrompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        const analyzedPrompt = response.text.trim();

        const newItem: HistoryItem = {
            id: Date.now().toString(),
            toolId: 1, // Architectural Visualization Tool
            toolTitle: 'Diễn hoạ kiến trúc',
            generatedImage: newImage,
            analyzedPrompt,
            createdAt: new Date().toISOString(),
        };

        const historyRaw = localStorage.getItem(HISTORY_KEY);
        const history: HistoryItem[] = historyRaw ? JSON.parse(historyRaw) : [];
        const updatedHistory = [newItem, ...history].slice(0, HISTORY_LIMIT);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));

    } catch (e) {
        console.error("Failed to update detailed generation history:", e);
    }
};

interface LooseFurniture {
  id: number;
  original: string;
  processed: string | null;
  isLoading: boolean;
  error: string | null;
}

const LooseFurnitureUploader: React.FC<{
    furniture: LooseFurniture[];
    onUpload: (files: FileList | null) => void;
    onRemove: (id: number) => void;
}> = ({ furniture, onUpload, onRemove }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="bg-gray-100 dark:bg-zinc-800/50 p-3 rounded-lg">
            <div className="grid grid-cols-3 gap-2">
                {furniture.map(item => (
                    <div key={item.id} className="relative group aspect-square">
                        <img 
                            src={item.processed || item.original} 
                            alt={`Furniture item`} 
                            className="w-full h-full object-contain rounded-md bg-gray-200 dark:bg-zinc-700/50"
                        />
                        {item.isLoading && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-md">
                                <LoadingSpinner small />
                            </div>
                        )}
                        {item.error && (
                             <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center rounded-md text-center text-xs text-white p-1">
                                Lỗi
                            </div>
                        )}
                        {!item.isLoading && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => onRemove(item.id)} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                                    <TrashIcon />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative aspect-square bg-gray-200 dark:bg-zinc-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-700 flex flex-col items-center justify-center text-center transition-colors hover:border-yellow-400 group cursor-pointer"
                >
                    <PlusIcon />
                    <span className="text-xs mt-1 text-zinc-500">Thêm đồ</span>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        multiple 
                        onChange={(e) => onUpload(e.target.files)} 
                        accept="image/*" 
                        className="hidden"
                    />
                </div>
            </div>
        </div>
    );
};

interface CreativePrompt {
    id: number;
    text: string;
    images: string[];
    isLoading: boolean;
    error?: string | null;
}

const AIArchitectureTool: React.FC<AIArchitectureToolProps> = ({ onBack }) => {
  const { t, language } = useLocalization();
  // Main tool state
  const [activeToolTab, setActiveToolTab] = useState<'visualize' | 'creative' | 'improvement'>('visualize');

  // Visualization Tab State
  const [originalInputImage, setOriginalInputImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [outputImages, setOutputImages] = useState<string[]>([]);
  const [selectedOutputImage, setSelectedOutputImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOutputZoomed, setIsOutputZoomed] = useState(false);
  const [isOutputCropping, setIsOutputCropping] = useState(false);
  const [isOptimizingPrompt, setIsOptimizingPrompt] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [promptLibrary, setPromptLibrary] = useState<string[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [copiedLibraryPromptIndex, setCopiedLibraryPromptIndex] = useState<number | null>(null);
  const [fengShuiYear, setFengShuiYear] = useState<string>('');
  const [isSuggestingColors, setIsSuggestingColors] = useState(false);
  const [colorSuggestions, setColorSuggestions] = useState<{ element: string; exterior: string; interior: string; } | null>(null);
  const [activeView, setActiveView] = useState<'architecture' | 'interior' | 'landscape'>('architecture');
  const [designStyle, setDesignStyle] = useState('');
  const [materials, setMaterials] = useState<string[]>([]);
  const [context, setContext] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [weather, setWeather] = useState('');
  const [cameraAngle, setCameraAngle] = useState('');
  const [lighting, setLighting] = useState('');
  const [exteriorView, setExteriorView] = useState('');
  const [interiorView, setInteriorView] = useState('');
  const [interiorStyle, setInteriorStyle] = useState('');
  const [interiorMood, setInteriorMood] = useState('');
  const [colorPalette, setColorPalette] = useState('');
  const [landscapeStyle, setLandscapeStyle] = useState('');
  const [landscapeElements, setLandscapeElements] = useState<string[]>([]);
  const [keepShape, setKeepShape] = useState(false);
  const [isMetaMode, setIsMetaMode] = useState<boolean>(false);
  const [isNewBananaMode, setIsNewBananaMode] = useState<boolean>(false);
  const [isBananaFlowMode, setIsBananaFlowMode] = useState<boolean>(false);
  const [isCTAIProMode, setIsCTAIProMode] = useState<boolean>(false); // New State
  const [creativityLevel, setCreativityLevel] = useState(50);
  const [imageCount, setImageCount] = useState(1);
  const [seed, setSeed] = useState<string>('');
  const [presetName, setPresetName] = useState('');
  const [presets, setPresets] = useState<any[]>([]);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [generationMode, setGenerationMode] = useState<'single' | 'batch'>('single');
  const [batchInputImages, setBatchInputImages] = useState<string[]>([]);
  const [batchState, setBatchState] = useState<Record<keyof typeof controlOptions, string[]>>({
    designStyle: [], context: [], timeOfDay: [], weather: [], cameraAngle: [], lighting: [], exteriorView: [],
    materials: [], interiorView: [], interiorStyle: [], interiorMood: [], colorPalette: [], landscapeStyle: [], landscapeElements: [],
  });
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [wasLoading, setWasLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [looseFurniture, setLooseFurniture] = useState<LooseFurniture[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  // Creative View Tab State
  const [creativePrompts, setCreativePrompts] = useState<CreativePrompt[]>([]);
  const [isGeneratingCreativePrompts, setIsGeneratingCreativePrompts] = useState(false);
  const [creativePromptsError, setCreativePromptsError] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<number | null>(null);
  const [creativeAspectRatio, setCreativeAspectRatio] = useState('1:1');
  const [zoomedCreativeImage, setZoomedCreativeImage] = useState<string | null>(null);

  // New states for prompt suggestions
  const [isGeneratingPromptSuggestions, setIsGeneratingPromptSuggestions] = useState(false);
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  
  // Animation Logic
  const prevOutputImagesCount = useRef(outputImages.length);
  useEffect(() => {
    prevOutputImagesCount.current = outputImages.length;
  }); 
  const newImagesCount = outputImages.length > prevOutputImagesCount.current 
    ? outputImages.length - prevOutputImagesCount.current 
    : 0;

  useEffect(() => {
    setWasLoading(isLoading);
  }, [isLoading]);
  const shouldAnimateMain = !isLoading && wasLoading && newImagesCount > 0;
  
    const handleInputImageUpload = (fileOrDataUrl: File | string) => {
        const processDataUrl = (dataUrl: string) => {
            setOriginalInputImage(dataUrl);
            setOutputImages([]);
            setSelectedOutputImage(null);
        };

        if (typeof fileOrDataUrl === 'string') {
            processDataUrl(fileOrDataUrl);
        } else {
            const reader = new FileReader();
            reader.onloadend = () => {
                processDataUrl(reader.result as string);
            };
            reader.readAsDataURL(fileOrDataUrl);
        }
    };
    
    const handleReferenceImageUpload = (fileOrDataUrl: File | string) => {
        const processDataUrl = (dataUrl: string) => {
            setReferenceImage(dataUrl);
        };

        if (typeof fileOrDataUrl === 'string') {
            processDataUrl(fileOrDataUrl);
        } else {
            const reader = new FileReader();
            reader.onloadend = () => {
                processDataUrl(reader.result as string);
            };
            reader.readAsDataURL(fileOrDataUrl);
        }
    };

    const clearInputImage = () => {
        setOriginalInputImage(null);
        setOutputImages([]);
        setSelectedOutputImage(null);
    };
    
    const clearReferenceImage = () => {
        setReferenceImage(null);
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Trình duyệt không hỗ trợ định vị.");
            return;
        }
        setIsGettingLocation(true);
        setLocation(null);
        setLocationError(null);
        setAddress(''); // Clear address initially

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({
                    lat: latitude,
                    lng: longitude,
                });
                
                // Start reverse geocoding
                try {
                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: `Provide the full street address for the following coordinates in Vietnamese: latitude ${latitude}, longitude ${longitude}. Only return the address as a single string, without any introductory text.`
                    });
                    setAddress(response.text.trim());
                } catch (e) {
                    console.error("Reverse geocoding failed:", e);
                    // Don't set an error, just leave address blank
                } finally {
                    setIsGettingLocation(false);
                }
            },
            (error) => {
                setLocationError(`Lỗi lấy vị trí: ${error.message}`);
                setIsGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const handleGeocode = async () => {
        if (!address.trim()) {
            setLocationError("Vui lòng nhập một địa chỉ.");
            return;
        }
        setIsGeocoding(true);
        setLocation(null);
        setLocationError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Chuyển đổi địa chỉ sau thành tọa độ vĩ độ và kinh độ: "${address}". Chỉ trả về một đối tượng JSON với hai khóa: "lat" và "lng".`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } },
                        required: ["lat", "lng"]
                    }
                }
            });
            const result = JSON.parse(response.text.trim());
            if (result.lat && result.lng) {
                setLocation({ lat: result.lat, lng: result.lng });
            } else {
                 setLocationError("Không thể tìm thấy tọa độ cho địa chỉ này.");
            }
        } catch (e) {
            console.error("Geocoding failed:", e);
            setLocationError("Lỗi khi tìm kiếm địa chỉ.");
        } finally {
            setIsGeocoding(false);
        }
    };

    // --- Loose Furniture Logic ---
    const removeImageBackground = async (furnitureId: number, imageDataUrl: string) => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = dataUrlToPart(imageDataUrl);
            const textPart = { text: "Remove the background from this image of a piece of furniture. The output should be the furniture object on a transparent background. Maintain the original object's details and colors. Return only the processed image." };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [imagePart, textPart] },
                config: { responseModalities: [Modality.IMAGE] },
            });

            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part?.inlineData) {
                const processedUrl = `data:image/png;base64,${part.inlineData.data}`;
                setLooseFurniture(prev => prev.map(f => f.id === furnitureId ? { ...f, processed: processedUrl, isLoading: false } : f));
            } else {
                throw new Error("AI did not return a background-removed image.");
            }
        } catch (e) {
            console.error("Background removal failed:", e);
            setLooseFurniture(prev => prev.map(f => f.id === furnitureId ? { ...f, error: 'Lỗi', isLoading: false } : f));
        }
    };

    const handleLooseFurnitureUpload = (files: FileList | null) => {
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newItem: LooseFurniture = {
                    id: Date.now() + Math.random(),
                    original: reader.result as string,
                    processed: null,
                    isLoading: true,
                    error: null,
                };
                setLooseFurniture(currentFurniture => [...currentFurniture, newItem]);
                removeImageBackground(newItem.id, newItem.original);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveLooseFurniture = (id: number) => {
        setLooseFurniture(prev => prev.filter(f => f.id !== id));
    };

    const [newBananaCountdown, setNewBananaCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

    useEffect(() => {
        // Countdown for New Banana "release"
        const targetDate = new Date('2024-08-01T00:00:00');
        const interval = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                setNewBananaCountdown({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setNewBananaCountdown(null);
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);


  // --- Prompt Library Logic ---
  useEffect(() => {
    try {
        const savedLibrary = localStorage.getItem(PROMPT_LIBRARY_KEY);
        if (savedLibrary) {
            setPromptLibrary(JSON.parse(savedLibrary));
        }
    } catch (error) {
        console.error("Failed to load prompt library from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem(PROMPT_LIBRARY_KEY, JSON.stringify(promptLibrary));
    } catch (error) {
        console.error("Failed to save prompt library to localStorage", error);
    }
  }, [promptLibrary]);


  // --- Handlers ---
  const appendToPrompt = (text: string) => {
    setPrompt(p => p ? `${p}, ${text}` : text);
  };

  const handleBatchStateChange = (key: keyof typeof batchState, values: string[]) => {
      setBatchState(prev => ({ ...prev, [key]: values }));
  };

    const handleGeneratePromptSuggestions = async () => {
        if (!originalInputImage || isGeneratingPromptSuggestions) return;

        setIsGeneratingPromptSuggestions(true);
        setPromptSuggestions([]);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = dataUrlToPart(originalInputImage);
            
            const promptForPrompts = `Bạn là một AI chuyên gia tạo prompt cho diễn họa kiến trúc. Phân tích hình ảnh được cung cấp (có thể là ảnh chụp, bản vẽ 3D, hoặc phác thảo) và tạo ra 30 prompt đa dạng, nghệ thuật bằng tiếng Việt để tạo ra một **phiên bản ảnh thực tế (photorealistic)** của đối tượng trong ảnh. Các prompt phải mô tả một bức ảnh thực tế, không mô tả phong cách của ảnh đầu vào (ví dụ: không dùng từ "phác thảo", "bản vẽ"). Tập trung vào các góc nhìn khác nhau (ví dụ: xa, gần, cao, thấp, cận cảnh, qua hồ nước, bông hoa, lá cây, đồ derco, lọ hoa, bàn, ghế…).
Với mỗi prompt, xác định đó là cảnh 'interior' hay 'exterior'.
Trả về kết quả dưới dạng một mảng JSON hợp lệ. Mỗi đối tượng trong mảng phải có hai khóa: \`type\` (string, là "interior" hoặc "exterior") và \`prompt\` (string, là prompt tiếng Việt đã tạo).`;
            
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
                const formattedPrompts: string[] = promptsFromAI.map((p: any) => {
                    const prefix = p.type === 'exterior' ? 'Hình ảnh thực tế công trình' : 'Hình ảnh thực tế nội thất';
                    return `${prefix}, ${p.prompt}`;
                });
                setPromptSuggestions(formattedPrompts);
                setPromptLibrary(prevLibrary => {
                    const newAndUniquePrompts = formattedPrompts.filter((p: string) => !prevLibrary.includes(p));
                    return [...newAndUniquePrompts, ...prevLibrary];
                });
                setIsSuggestionModalOpen(true);
            } else {
                throw new Error("AI không trả về định dạng mảng JSON hợp lệ.");
            }

        } catch (e) {
            console.error("Lỗi khi tạo gợi ý prompt:", e);
            const errorMessage = `Đã xảy ra lỗi khi tạo gợi ý: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`;
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setIsGeneratingPromptSuggestions(false);
        }
    };

    const handleOptimizePromptWithAI = async () => {
        if (!prompt.trim() || isOptimizingPrompt) return;

        setIsOptimizingPrompt(true);
        setIsOptimized(false);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const optimizationPrompt = `You are an expert prompt engineer specializing in photorealistic architectural visualization. Your task is to transform a user's basic idea into a rich, detailed, and professional English prompt that will generate a stunning, realistic architectural image, as if captured by a professional photographer.

            **Instructions:**
            1.  **Analyze the Core Idea:** Understand the user's primary subject and intent from their Vietnamese prompt.
            2.  **Incorporate Photographic Qualities:** Elevate the prompt by adding professional photography terms. Think about:
                *   **Lighting:** Cinematic lighting, volumetric light, natural shadows, golden hour, blue hour, studio lighting.
                *   **Composition:** Perfect composition, depth of field, rule of thirds.
                *   **Realism:** Photorealistic masterpiece, hyper-detailed, ultra-sharp focus, high dynamic range (HDR), physically accurate textures.
                *   **Camera:** Specify lens types (e.g., wide-angle lens), camera angles (e.g., low-angle shot, aerial view).
            3.  **Use Inspirational Keywords:** Draw stylistic keywords, moods, materials, and environmental concepts from the inspirational prompt library to add more detail.
            4.  **Translate and Synthesize:** Translate the core idea into fluent English and seamlessly weave in the photographic and inspirational keywords.
            5.  **Final Output:** The result must be a single, coherent paragraph in English, ready for an advanced image generation model. Do not use lists or JSON.

            **User's Prompt:**
            "${prompt}"

            **Inspirational Prompt Library:**
            ${promptLibrary.map(p => `- ${p}`).join('\n')}

            **Output:** A single, optimized English prompt for a photorealistic architectural rendering.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: optimizationPrompt,
            });

            setPrompt(response.text.trim());
            setIsOptimized(true);
            setTimeout(() => setIsOptimized(false), 2000);

        } catch (e) {
            console.error("Error optimizing prompt:", e);
            alert("Không thể tối ưu prompt lúc này.");
        } finally {
            setIsOptimizingPrompt(false);
        }
    };


    const buildFullPrompt = (
        overrides: Partial<Record<keyof typeof batchState, string | string[]>> = {}
    ) => {
        if (referenceImage) {
             return `You are an expert architectural visualizer performing a **Style Transfer** task.
**Input 1 (Structure):** Use the structural geometry, building form, perspective, and composition from the FIRST image provided (the main input). Keep this EXACTLY as is.
**Input 2 (Style Reference):** Extract the *Tone & Mood* from the SECOND image provided. This includes:
- Color Palette and Color Grading.
- Lighting Conditions (e.g., golden hour, overcast, dramatic shadows).
- Material Textures and Finish styles.
- Environmental Atmosphere (fog, clarity, background style).
**Task:** Render the building from Input 1 using the Style/Mood of Input 2.
**Additional Description:** ${prompt}
**Result:** A seamless integration of Structure (1) + Style (2). Photorealistic, high quality.`;
        }

        const getSingleValue = (key: keyof typeof batchState, singleValue: any) => overrides[key] || (generationMode === 'single' ? singleValue : '');
        const getArrayValue = (key: keyof typeof batchState, singleValue: any) => (overrides[key] as string[]) || (generationMode === 'single' ? singleValue : []);
        
        const qualityPrompt = '8k, best quality, highly detailed, ultra-realistic, sharp focus';
        const sizePrompt = 'ultra high resolution';
        
        const qualityBooster = 'Ultra realistic, hyper-detailed, 8K resolution, photorealistic masterpiece, ultra sharp focus, high dynamic range, cinematic lighting, perfect composition, volumetric light, physically accurate texture, ultra-high-definition, detailed skin pores and materials, natural shadows, true-to-life colors, incredibly detailed, depth of field, high clarity, realistic contrast, fine detail, rich tones, professional photography, award-winning photo';
        const locationPrompt = location ? `với bối cảnh địa hình và môi trường xung quanh dựa trên vị trí thực tế tại vĩ độ ${location.lat.toFixed(5)} và kinh độ ${location.lng.toFixed(5)}` : '';

        let specificParts: string[] = [];
        let baseInstruction = "";

        if (activeView === 'architecture') {
            baseInstruction = "diễn họa kiến trúc";
            specificParts = [
                getSingleValue('designStyle', designStyle),
                getSingleValue('context', context),
                getSingleValue('exteriorView', exteriorView),
                ...getArrayValue('materials', materials)
            ];
        } else if (activeView === 'interior') {
            baseInstruction = "diễn họa nội thất";
            specificParts = [
                getSingleValue('interiorStyle', interiorStyle),
                getSingleValue('interiorView', interiorView),
                getSingleValue('interiorMood', interiorMood),
                getSingleValue('colorPalette', colorPalette),
            ];
            if (looseFurniture.some(f => f.processed)) {
                specificParts.push('hãy đặt các món đồ nội thất được cung cấp (với nền trong suốt) vào trong không gian một cách tự nhiên. Điều chỉnh tỷ lệ, ánh sáng và bóng đổ của chúng cho phù hợp với căn phòng.');
            }
        } else if (activeView === 'landscape') {
            baseInstruction = "diễn họa cảnh quan sân vườn";
            specificParts = [
                getSingleValue('landscapeStyle', landscapeStyle),
                ...getArrayValue('landscapeElements', landscapeElements)
            ];
        }

        const commonParts = [
            getSingleValue('timeOfDay', timeOfDay),
            getSingleValue('weather', weather),
            getSingleValue('cameraAngle', cameraAngle),
            getSingleValue('lighting', lighting),
        ];

        const allParts = [
            prompt,
            locationPrompt,
            ...specificParts,
            ...commonParts,
            keepShape ? 'giữ nguyên hình dạng và cấu trúc của tòa nhà trong ảnh đầu vào' : '',
            isBananaFlowMode ? 'phong cách kiến trúc uyển chuyển, dòng chảy, các đường cong mềm mại và chuyển tiếp liền mạch' : '',
            isNewBananaMode ? 'kết xuất siêu thực tế bằng kỹ thuật tiên tiến, nhiếp ảnh kiến trúc đoạt giải, lấy nét sắc nét, ánh sáng hoàn hảo, photorealistic masterpiece, hyper-detailed, 8K resolution, ultra sharp focus' : '',
            creativityLevel > 75 ? 'với mức độ sáng tạo và nghệ thuật cao' : '',
            creativityLevel < 25 ? 'bám sát thực tế và các chi tiết' : '',
            qualityPrompt,
            sizePrompt,
            qualityBooster
        ].filter(Boolean).join(', ');

        let instruction = `Tạo một hình ảnh ${baseInstruction}.`;
        
        if (originalInputImage) {
             instruction = `Dựa trên hình ảnh đầu vào, tạo một ${baseInstruction} mới với các đặc điểm sau: ${allParts}.`;
        } else if (allParts) {
            instruction = `Tạo một ${baseInstruction} với mô tả sau: ${allParts}.`;
        }
        return instruction;
    };
  
  // Helper for cartesian product for batch generation
  const getCombinations = (options: Record<string, string[]>) => {
      const keys = Object.keys(options).filter(key => options[key].length > 0);
      if (keys.length === 0) return [{}];

      let result: Record<string, string>[] = [{}];
      for (const key of keys) {
          const newResult: Record<string, string>[] = [];
          for (const res of result) {
              for (const value of options[key]) {
                  newResult.push({ ...res, [key]: value });
              }
          }
          result = newResult;
      }
      return result;
  };
    
  const runBatchGeneration = async (
    combinations: Record<string, string>[],
    inputImages: string[],
    syncedSeed: string
  ) => {
    // If no input images, we iterate once (simulating text-to-image batch)
    // The inner logic needs to handle syncedInputImage being potentially null/undefined.
    const hasInputImages = inputImages.length > 0;
    const loopSource = hasInputImages ? inputImages : [null]; 

    let generatedCount = 0;
    const totalImages = combinations.length * imageCount * loopSource.length;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    for (const syncedInputImage of loopSource) {
        for (const combo of combinations) {
            for (let i = 0; i < imageCount; i++) {
                generatedCount++;
                setBatchProgress({ current: generatedCount, total: totalImages });

                try {
                    const fullPrompt = buildFullPrompt(combo);

                    const contentParts = [];
                    // Only add image part if we have a valid syncedInputImage string
                    if (syncedInputImage) {
                        contentParts.push(dataUrlToPart(syncedInputImage));
                    }
                    contentParts.push({ text: fullPrompt });
                    
                    const config: any = { responseModalities: [Modality.IMAGE] };
                    const seedValue = parseInt(syncedSeed, 10);
                    if (!isNaN(seedValue)) {
                        config.seed = seedValue;
                    }

                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash-image',
                        contents: { parts: contentParts },
                        config,
                    });

                    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                    if (part?.inlineData) {
                        const newImage = `data:image/png;base64,${part.inlineData.data}`;
                        setOutputImages(prev => [newImage, ...prev]);
                        
                        const inputDetails = { toolTitle: 'Diễn hoạ kiến trúc', prompt, options: combo, hasInputImage: !!syncedInputImage };
                        updateHistory(newImage, inputDetails);


                        if (!selectedOutputImage) {
                            setSelectedOutputImage(newImage);
                        }
                    }
                } catch (e) {
                    console.error(`Error generating image ${generatedCount} of ${totalImages}:`, e);
                }
            }
        }
    }

    setIsLoading(false);
  };


  const handleGenerateImage = async () => {
    const isSpecialMode = isMetaMode || keepShape || isNewBananaMode || isBananaFlowMode;

    if (isCTAIProMode) {
        if (!originalInputImage) {
            setError('Vui lòng tải lên ảnh đầu vào cho chế độ CTAIpro.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setOutputImages([]); 
        setSelectedOutputImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const inputImagePart = dataUrlToPart(originalInputImage);
            
            // Step 1: Generate Watercolor Sketch
            setLoadingMessage('Bước 1/2: Tạo bản phác thảo màu nước...');
            const sketchPrompt = 'Create an architectural sketch of this building. Style: Architectural line drawing combined with watercolor rendering. Artistic, loose lines, soft colors. Emphasize the main structure and perspective. Return only the sketch image.';
            
            const sketchResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [inputImagePart, { text: sketchPrompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });
            
            const sketchPart = sketchResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            let sketchDataUrl: string;

            if (sketchPart?.inlineData) {
                sketchDataUrl = `data:image/png;base64,${sketchPart.inlineData.data}`;
            } else {
                throw new Error("Không thể tạo bản phác thảo.");
            }

            // Step 2: Generate Final Image
            setLoadingMessage('Bước 2/2: Tạo ảnh thực tế từ bản phác thảo...');
            const sketchImagePart = dataUrlToPart(sketchDataUrl);
            const finalPrompt = `Render a photorealistic architectural image based on this watercolor sketch. High quality, 8k, cinematic lighting, ultra sharp focus. ${prompt ? `Additional details: ${prompt}` : ''}`;

            const finalResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [sketchImagePart, { text: finalPrompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });

            const finalPart = finalResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (finalPart?.inlineData) {
                const newImage = `data:image/png;base64,${finalPart.inlineData.data}`;
                setOutputImages([newImage]);
                setSelectedOutputImage(newImage);
                const inputDetails = { toolTitle: 'CTAIpro (2 Steps)', prompt, options: { isCTAIProMode }, hasInputImage: true };
                updateHistory(newImage, inputDetails);
            } else {
                throw new Error("Không thể tạo hình ảnh cuối cùng.");
            }

        } catch (e) {
            console.error(e);
            setError(`Đã xảy ra lỗi: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
        return;
    }

    if (isSpecialMode) {
        if (!originalInputImage) {
            setError('Vui lòng tải lên ảnh đầu vào cho chế độ đặc biệt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setOutputImages([]); 
        setSelectedOutputImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const inputImagePart = dataUrlToPart(originalInputImage);
            
            // Step 1: Generate iron pen drawing
            setLoadingMessage('Bước 1/2: Tạo nét vẽ bút sắt...');
            const sketchPrompt = 'Convert this architectural image into a detailed iron pen drawing that clearly shows the materials of the building or interior. The sketch should be artistic yet informative about textures and surfaces. The output should only be the sketch image.';
            const sketchResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [inputImagePart, { text: sketchPrompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });
            
            const sketchPart = sketchResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            let sketchDataUrl: string;

            if (sketchPart?.inlineData) {
                sketchDataUrl = `data:image/png;base64,${sketchPart.inlineData.data}`;
            } else {
                throw new Error("Không thể tạo được bản vẽ bút sắt từ ảnh đầu vào.");
            }

            // Step 2: Generate final image from the sketch
            setLoadingMessage('Bước 2/2: Tạo ảnh thực tế từ bản vẽ...');
            
            const sketchImagePart = dataUrlToPart(sketchDataUrl);
            const finalPrompt = `Dựa vào **bản vẽ bút sắt** làm cấu trúc và chất liệu chính. Kết hợp với mô tả của người dùng: '${prompt || 'Tạo một phiên bản thực tế của kiến trúc này'}'. Hãy tạo ra một hình ảnh kiến trúc siêu thực tế, sắc nét, chi tiết dưới góc chụp của một nhiếp ảnh gia chuyên nghiệp, với chất lượng 8k, hyperrealistic, cinematic lighting, ultra sharp focus.`;

            const finalResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [sketchImagePart, { text: finalPrompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });

            const finalPart = finalResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (finalPart?.inlineData) {
                const newImage = `data:image/png;base64,${finalPart.inlineData.data}`;
                setOutputImages([newImage]);
                setSelectedOutputImage(newImage);
                 const inputDetails = { toolTitle: 'Diễn hoạ kiến trúc (Chế độ đặc biệt)', prompt, options: { isMetaMode, keepShape, isNewBananaMode, isBananaFlowMode }, hasInputImage: true };
                 updateHistory(newImage, inputDetails);
            } else {
                throw new Error("Không thể tạo được hình ảnh cuối cùng từ bản vẽ.");
            }

        } catch (e) {
            console.error(e);
            setError(`Đã xảy ra lỗi: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
        return;
    }


    if (!prompt && !originalInputImage) {
        setError('Vui lòng cung cấp mô tả hoặc tải lên hình ảnh.');
        return;
    }
    
    setIsLoading(true);
    setLoadingMessage('');
    setSelectedOutputImage(null);
    setError(null);
    
    if (generationMode === 'batch') {
        const imagesToProcess = batchInputImages.length > 0 ? batchInputImages : (originalInputImage ? [originalInputImage] : []);

        // Allow batch generation without images if prompt is present
        if (imagesToProcess.length === 0 && !prompt.trim()) {
            setError('Vui lòng cung cấp mô tả hoặc tải lên ít nhất một ảnh đầu vào để tạo hàng loạt.');
            setIsLoading(false);
            return;
        }

        const combinations = getCombinations(batchState);
        const hasVariations = combinations.length > 1 || (combinations.length > 0 && Object.keys(combinations[0]).length > 0);

        if (!hasVariations) {
            setError('Vui lòng chọn ít nhất một tùy chọn biến thể (phong cách, bối cảnh, v.v.) để tạo hàng loạt.');
            setIsLoading(false);
            return;
        }
        
        const countMultiplier = imagesToProcess.length > 0 ? imagesToProcess.length : 1;
        const totalImages = combinations.length * imageCount * countMultiplier;

        setBatchProgress({ current: 0, total: totalImages });
        
        const synchronizedSeed = seed || Math.floor(Math.random() * 1000000).toString();
        runBatchGeneration(combinations, imagesToProcess, synchronizedSeed);
        return;
    }

    // --- SINGLE GENERATION LOGIC ---
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const fullPrompt = buildFullPrompt({});
        
        const contentParts = [];
        if (originalInputImage) {
            contentParts.push(dataUrlToPart(originalInputImage));
        }

        if (referenceImage) {
            contentParts.push(dataUrlToPart(referenceImage));
        }

        if (activeView === 'interior' && !referenceImage) {
            looseFurniture.forEach(item => {
                if (item.processed) {
                    contentParts.push(dataUrlToPart(item.processed));
                }
            });
        }
        
        contentParts.push({ text: fullPrompt });

        const config: any = { responseModalities: [Modality.IMAGE] };
        const seedValue = parseInt(seed, 10);
        if (!isNaN(seedValue)) {
            config.seed = seedValue;
        }

        const generationPromises = Array(imageCount).fill(0).map(() => 
            ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: contentParts },
                config: config,
            })
        );
        
        const responses = await Promise.all(generationPromises);

        const newImages = responses.map(response => {
            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part?.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
            return null;
        }).filter((img): img is string => img !== null);

        if (newImages.length > 0) {
            setOutputImages(prev => [...newImages, ...prev]);
            setSelectedOutputImage(newImages[0]);
            
            const inputDetails = {
                toolTitle: 'Diễn hoạ kiến trúc',
                prompt,
                options: { activeView, designStyle, context, timeOfDay, weather, cameraAngle, lighting, exteriorView, interiorView, landscapeStyle, landscapeElements, keepShape, creativityLevel },
                hasInputImage: !!originalInputImage
            };
            newImages.forEach(img => updateHistory(img, inputDetails));
        } else {
            setError('Không thể tạo ảnh từ phản hồi của AI. Vui lòng thử lại.');
        }
    } catch (e) {
        console.error(e);
        setError(`Đã xảy ra lỗi: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  };

    const handleSaveOutputCrop = (croppedDataUrl: string) => {
        if (!selectedOutputImage) return;
        const index = outputImages.findIndex(img => img === selectedOutputImage);
        
        const newOutputImages = [...outputImages];
        if (index !== -1) {
            newOutputImages[index] = croppedDataUrl;
        }
        
        setOutputImages(newOutputImages);
        setSelectedOutputImage(croppedDataUrl);
        setIsOutputCropping(false);
    };

    const handleUseAsInput = () => {
        if (selectedOutputImage) {
            handleInputImageUpload(selectedOutputImage);
            alert("Đã đưa ảnh kết quả về làm ảnh đầu vào.");
        }
    };
    
    const handleDownloadImage = () => {
        if (!selectedOutputImage) return;
        const link = document.createElement('a');
        link.href = selectedOutputImage;
        link.download = `ctai-result-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSuggestColors = async () => {
        if (!fengShuiYear || parseInt(fengShuiYear) < 1920 || parseInt(fengShuiYear) > new Date().getFullYear()) {
            alert("Vui lòng nhập một năm sinh hợp lệ.");
            return;
        }

        setIsSuggestingColors(true);
        setColorSuggestions(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Dựa vào năm sinh âm lịch ${fengShuiYear} của một người Việt Nam, hãy xác định mệnh Ngũ hành của họ. Sau đó, đưa ra gợi ý màu sắc phong thủy cho kiến trúc. Trả lời bằng tiếng Việt.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            element: { type: Type.STRING, description: "Tên mệnh Ngũ hành của người sinh năm đó (ví dụ: 'Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ')." },
                            exterior: { type: Type.STRING, description: "Một đoạn văn ngắn (2-3 câu) gợi ý về cách phối màu cho ngoại thất, bao gồm màu chủ đạo, màu nhấn và màu nên tránh." },
                            interior: { type: Type.STRING, description: "Một đoạn văn ngắn (2-3 câu) gợi ý về cách phối màu cho nội thất, bao gồm màu chủ đạo, màu nhấn và màu nên tránh." },
                        }
                    }
                }
            });

            const jsonString = response.text.trim();
            const parsedData = JSON.parse(jsonString);

            if (parsedData.element && parsedData.exterior && parsedData.interior) {
                setColorSuggestions(parsedData);
            } else {
                throw new Error("Dữ liệu trả về không hợp lệ.");
            }

        } catch (e) {
            console.error(e);
            alert(`Đã xảy ra lỗi khi lấy gợi ý. Vui lòng thử lại.`);
        } finally {
            setIsSuggestingColors(false);
        }
    };


  // --- Preset Logic ---
  useEffect(() => {
    try {
      const savedPresets = localStorage.getItem('ctai_presets');
      if (savedPresets) {
        setPresets(JSON.parse(savedPresets));
      }
    } catch (error) {
      console.error("Failed to load presets from localStorage", error);
    }
  }, []);

  const savePreset = () => {
    if (!presetName.trim()) {
        alert("Vui lòng nhập tên cho cài đặt.");
        return;
    }
    const newPreset = {
        name: presetName,
        state: {
            prompt, designStyle, context, timeOfDay, weather, 
            cameraAngle, lighting,
            exteriorView, interiorView, keepShape, creativityLevel, imageCount,
            seed,
        }
    };
    const updatedPresets = [...presets.filter(p => p.name !== presetName), newPreset];
    setPresets(updatedPresets);
    localStorage.setItem('ctai_presets', JSON.stringify(updatedPresets));
    setPresetName('');
    alert(`Đã lưu cài đặt "${newPreset.name}"!`);
  };

  const loadPreset = (name: string) => {
    const preset = presets.find(p => p.name === name);
    if (preset) {
        setGenerationMode('single');
        const { state } = preset;
        setPrompt(state.prompt || '');
        setDesignStyle(state.designStyle || '');
        setContext(state.context || '');
        setTimeOfDay(state.timeOfDay || '');
        setWeather(state.weather || '');
        setCameraAngle(state.cameraAngle || '');
        setLighting(state.lighting || '');
        setExteriorView(state.exteriorView || '');
        setInteriorView(state.interiorView || '');
        setKeepShape(state.keepShape || false);
        setCreativityLevel(state.creativityLevel || 50);
        setImageCount(state.imageCount || 1);
        setSeed(state.seed || '');
        setSelectedPreset(name);
    }
  };
  
  const renderDropdownOptions = (options: {value: string, label: string}[], placeholder: string) => (
      <>
          <option value="" className="bg-white dark:bg-zinc-900">{placeholder}</option>
          {options.map(opt => <option key={opt.value} value={opt.value} className="bg-white dark:bg-zinc-900">{opt.label}</option>)}
      </>
  );

  const totalBatchImagesCount = useMemo(() => {
    if (generationMode !== 'batch') return 0;
    const imagesToProcess = batchInputImages.length > 0 ? batchInputImages : (originalInputImage ? [originalInputImage] : []);
    
    // Multiplier is at least 1 (for text-only batch) if no images are present
    const multiplier = imagesToProcess.length > 0 ? imagesToProcess.length : 1;
    
    const combinations = getCombinations(batchState);
    const hasVariations = combinations.length > 1 || (combinations.length > 0 && Object.keys(combinations[0]).length > 0);
    
    if (!hasVariations) return 0;
    
    return combinations.length * imageCount * multiplier;
  }, [generationMode, batchInputImages, originalInputImage, batchState, imageCount]);

  const canGenerate = useMemo(() => {
    if (isLoading) return false;
    if (isMetaMode || keepShape || isNewBananaMode || isBananaFlowMode || isCTAIProMode) return !!originalInputImage;
    if (generationMode === 'single') {
        return !!(prompt.trim() || originalInputImage);
    } else { // batch mode
         const imagesToProcess = batchInputImages.length > 0 ? batchInputImages : (originalInputImage ? [originalInputImage] : []);
         const hasInput = imagesToProcess.length > 0 || prompt.trim().length > 0;
         return totalBatchImagesCount > 0 && hasInput;
    }
  }, [isLoading, isMetaMode, keepShape, isNewBananaMode, isBananaFlowMode, isCTAIProMode, generationMode, prompt, originalInputImage, totalBatchImagesCount, batchInputImages]);
  
  const isMobileDevice = useMemo(() => /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent), []);

  // --- Creative Tab Logic ---
    const handleGenerateCreativePrompts = async () => {
        if (!originalInputImage) {
            setCreativePromptsError("Vui lòng tải lên một ảnh đầu vào để tạo gợi ý.");
            return;
        }

        setIsGeneratingCreativePrompts(true);
        setCreativePromptsError(null);
        setCreativePrompts([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = dataUrlToPart(originalInputImage);
            
            const promptForPrompts = `Bạn là một AI chuyên gia tạo prompt cho diễn họa kiến trúc. Nhiệm vụ của bạn là phân tích hình ảnh được cung cấp (có thể là ảnh chụp, bản vẽ 3D, hoặc phác thảo) và tạo ra 40 prompt đa dạng, nghệ thuật bằng tiếng Việt để tạo ra một **phiên bản ảnh thực tế (photorealistic)** của đối tượng trong ảnh. Các prompt phải mô tả một bức ảnh thực tế, không mô tả phong cách của ảnh đầu vào (ví dụ: không dùng từ "phác thảo", "bản vẽ").

Hướng dẫn:
1.  Tạo prompt cho cả cảnh **ngoại thất** và **nội thất** lấy cảm hứng từ ảnh.
2.  Tập trung vào các góc máy, ánh sáng và bố cục nghệ thuật, cảnh gần xa, cao thấp. Ví dụ:
    *   Chụp qua các yếu tố tiền cảnh (ví dụ: "qua giàn hoa giấy", "qua hồ nước cận cảnh bông hoa sen").
    *   Cận cảnh đồ trang trí và vật liệu (ví dụ: "cận cảnh lọ hoa trên bàn", "chi tiết vật liệu tường gạch thô").
    *   Thời gian và thời tiết khác nhau (ví dụ: "ánh nắng hoàng hôn xiên qua cửa sổ", "cảnh đêm mưa lãng mạn").
    *   Các góc nhìn độc đáo (ví dụ: "góc nhìn từ dưới thấp lên", "phản chiếu qua vũng nước trên sân").
3.  Với mỗi prompt, xác định đó là cảnh 'interior' hay 'exterior'.
4.  Trả về kết quả dưới dạng một mảng JSON hợp lệ. Mỗi đối tượng trong mảng phải có hai khóa: \`type\` (string, là "interior" hoặc "exterior") và \`prompt\` (string, là prompt tiếng Việt đã tạo).`;
            
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
                const formattedPrompts: CreativePrompt[] = promptsFromAI.map((p: any, index: number) => {
                    const prefix = p.type === 'exterior' ? 'Hình ảnh thực tế công trình' : 'Hình ảnh thực tế nội thất';
                    return {
                        id: index,
                        text: `${prefix}, ${p.prompt}`,
                        images: [],
                        isLoading: false,
                    };
                });
                setCreativePrompts(formattedPrompts);
            } else {
                throw new Error("AI không trả về định dạng mảng JSON hợp lệ.");
            }

        } catch (e) {
            console.error(e);
            setCreativePromptsError(`Đã xảy ra lỗi khi tạo gợi ý: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
        } finally {
            setIsGeneratingCreativePrompts(false);
        }
    };
    
    const handleGenerateImageForCreativePrompt = async (promptId: number) => {
        if (!originalInputImage) return;
        
        const promptToUse = creativePrompts.find(p => p.id === promptId);
        if (!promptToUse) return;

        setCreativePrompts(prev => prev.map(p => p.id === promptId ? { ...p, isLoading: true, images: [], error: null } : p));
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = dataUrlToPart(originalInputImage);
            const fullPrompt = `${promptToUse.text}, khổ ảnh ${creativeAspectRatio}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [imagePart, { text: fullPrompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });
            
            const newImages: string[] = [];
            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part?.inlineData) {
                const newImage = `data:image/png;base64,${part.inlineData.data}`;
                newImages.push(newImage);

                // Save to history
                try {
                    const newItem: HistoryItem = {
                        id: Date.now().toString(),
                        toolId: 1, // Architectural Visualization Tool
                        toolTitle: 'Diễn hoạ kiến trúc (Góc nhìn Sáng tạo)',
                        generatedImage: newImage,
                        analyzedPrompt: promptToUse.text, // Use the original prompt
                        createdAt: new Date().toISOString(),
                    };
            
                    const historyRaw = localStorage.getItem(HISTORY_KEY);
                    const history: HistoryItem[] = historyRaw ? JSON.parse(historyRaw) : [];
                    const updatedHistory = [newItem, ...history].slice(0, HISTORY_LIMIT);
                    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
                } catch (historyError) {
                    console.error("Failed to save creative view generation to history:", historyError);
                }
            }

            if (newImages.length === 0) {
                throw new Error('AI không trả về hình ảnh nào.');
            }

            setCreativePrompts(prev => prev.map(p => p.id === promptId ? { ...p, isLoading: false, images: newImages } : p));

        } catch (e) {
            console.error(`Error generating image for prompt ${promptId}:`, e);
            setCreativePrompts(prev => prev.map(p => p.id === promptId ? { ...p, isLoading: false, error: 'Lỗi tạo ảnh' } : p));
        }
    };

    const handleCopyPrompt = (text: string, id: number) => {
        navigator.clipboard.writeText(text);
        setCopiedPromptId(id);
        setTimeout(() => setCopiedPromptId(null), 2000);
    };

    const handleDownloadCreativeImage = (imageUrl: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `ctai-creative-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleLongPressDownload = (e: React.MouseEvent, imageUrl: string) => {
        e.preventDefault();
        handleDownloadCreativeImage(imageUrl);
    };


  return (
    <div className="w-full flex flex-col animate-fade-in bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
            <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-black dark:text-white">AI Diễn hoạ Kiến trúc</h1>
                <span className="text-xs font-bold bg-yellow-400 text-black px-2 py-0.5 rounded-full">Pro</span>
            </div>
            <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" aria-label="Quay lại">
                <BackIcon className="h-5 w-5" />
                <span>Quay lại</span>
            </button>
        </header>
        
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-zinc-800 px-4 sm:px-6">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setActiveToolTab('visualize')}
                    className={`py-3 px-1 text-sm font-semibold transition-colors border-b-2 ${activeToolTab === 'visualize' ? 'border-yellow-400 text-black dark:text-white' : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'}`}
                >
                    Diễn hoạ
                </button>
                <button 
                    onClick={() => setActiveToolTab('creative')}
                    className={`py-3 px-1 text-sm font-semibold transition-colors border-b-2 ${activeToolTab === 'creative' ? 'border-yellow-400 text-black dark:text-white' : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'}`}
                >
                    Góc nhìn Sáng tạo
                </button>
                <button 
                    onClick={() => setActiveToolTab('improvement')}
                    className={`py-3 px-1 text-sm font-semibold transition-colors border-b-2 ${activeToolTab === 'improvement' ? 'border-yellow-400 text-black dark:text-white' : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'}`}
                >
                    Cải thiện
                </button>
            </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
            {activeToolTab === 'visualize' ? (
                <>
                    <aside className="w-full lg:w-[420px] lg:flex-shrink-0 bg-gray-50 dark:bg-zinc-900/30 p-4 sm:p-6 flex flex-col lg:overflow-y-auto">
                        <div className="space-y-6">
                            {/* Input Image */}
                            <section>
                                <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">ẢNH ĐẦU VÀO</h2>
                                <div className="relative">
                                { !originalInputImage ? (
                                        <div className="space-y-3">
                                            <label
                                                htmlFor="input-image-upload"
                                                className="relative aspect-video bg-gray-100 dark:bg-zinc-800/50 rounded-lg border-2 border-dashed border-gray-400 dark:border-zinc-600 flex flex-col items-center justify-center text-center transition-colors hover:border-yellow-400 group cursor-pointer"
                                            >
                                                <UploadIcon />
                                                <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">Kéo và thả ảnh</p>
                                                <p className="text-xs text-zinc-500 mt-1">hoặc <span className="text-yellow-400 font-semibold">nhấn vào đây</span></p>
                                            </label>
                                            <input id="input-image-upload" type="file" className="hidden" aria-label="Tải lên ảnh đầu vào" onChange={(e) => e.target.files && handleInputImageUpload(e.target.files[0])} accept="image/png, image/jpeg, image/webp" />

                                            {isMobileDevice && (
                                                <button
                                                    onClick={() => setIsCameraOpen(true)}
                                                    className="w-full flex items-center justify-center gap-1 bg-gray-200 dark:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors text-sm"
                                                >
                                                    <CameraIcon />
                                                    Chụp ảnh
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <ImageWithControls
                                            image={originalInputImage}
                                            onImageUpdate={handleInputImageUpload}
                                            onClear={clearInputImage}
                                            alt="Ảnh đầu vào"
                                            maxHeight="240px"
                                        />
                                    )}
                                </div>
                            </section>
                            <section className={`transition-opacity ${isMetaMode ? 'opacity-50 pointer-events-none' : ''}`}>
                                <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">ẢNH THAM CHIẾU (TONE & MOOD)</h2>
                                { !referenceImage ? (
                                    <div 
                                        className="relative aspect-video bg-gray-100 dark:bg-zinc-800/50 rounded-lg border-2 border-dashed border-gray-400 dark:border-zinc-600 flex flex-col items-center justify-center text-center transition-colors hover:border-yellow-400 group cursor-pointer"
                                        onClick={() => document.getElementById('reference-image-upload')?.click()}
                                    >
                                        <UploadIcon />
                                        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">Tải ảnh tham chiếu</p>
                                        <p className="text-xs text-zinc-500 mt-1">AI sẽ lấy Tone Mood, ánh sáng từ ảnh này</p>
                                        <input id="reference-image-upload" type="file" className="hidden" onChange={(e) => e.target.files && handleReferenceImageUpload(e.target.files[0])} accept="image/*" />
                                    </div>
                                ) : (
                                    <ImageWithControls
                                        image={referenceImage}
                                        onImageUpdate={handleReferenceImageUpload}
                                        onClear={clearReferenceImage}
                                        alt="Ảnh tham chiếu"
                                        maxHeight="180px"
                                    />
                                )}
                            </section>
                            
                            {/* Prompt */}
                            <section>
                                <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">MÔ TẢ</h2>
                                <div className="relative">
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="VD: Một biệt thự tương lai về đêm, phát sáng với đèn neon."
                                        rows={3}
                                        className={`w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 placeholder-zinc-500 pl-4 pr-4 py-3 rounded-lg border-2 border-gray-300 dark:border-zinc-700/80 focus:border-yellow-400 focus:ring-0 outline-none transition-colors resize-none text-sm ${isOptimizingPrompt ? 'animate-pulse' : ''}`}
                                        disabled={isOptimizingPrompt}
                                    />
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <button
                                        onClick={handleGeneratePromptSuggestions}
                                        disabled={!originalInputImage || isGeneratingPromptSuggestions || isOptimizingPrompt}
                                        className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 font-semibold py-2 px-4 rounded-lg transition-colors text-sm disabled:bg-gray-100 dark:disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed"
                                    >
                                        {isGeneratingPromptSuggestions ? <LoadingSpinner small /> : <SparklesIcon className="h-5 w-5" />}
                                        <span>{isGeneratingPromptSuggestions ? 'Đang tạo...' : 'Tạo từ ảnh'}</span>
                                    </button>
                                    <button
                                        onClick={handleOptimizePromptWithAI}
                                        disabled={!prompt.trim() || isOptimizingPrompt || isOptimized}
                                        className={`w-full flex items-center justify-center gap-1 font-semibold py-2 px-4 rounded-lg transition-colors text-sm ${
                                            isOptimized 
                                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 cursor-default'
                                            : 'bg-gray-200 dark:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 hover:bg-gray-300 dark:hover:bg-zinc-700 disabled:bg-gray-100 dark:disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed'
                                        }`}
                                    >
                                        {isOptimizingPrompt ? <LoadingSpinner small/> : (isOptimized ? <CheckIcon className="h-5 w-5" /> : <SparklesIcon className="h-5 w-5" />)}
                                        {isOptimizingPrompt ? 'Đang tối ưu...' : (isOptimized ? 'Đã tối ưu!' : 'Tối ưu Prompt')}
                                    </button>
                                </div>
                            </section>
                            
                            <section>
                                <h2 
                                    className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider flex justify-between items-center cursor-pointer"
                                    onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                                >
                                    Thư viện prompt
                                    <svg className={`w-4 h-4 transition-transform ${isLibraryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </h2>
                                {isLibraryOpen && (
                                    <div className="bg-gray-100 dark:bg-zinc-800/50 p-3 rounded-lg max-h-48 overflow-y-auto space-y-2">
                                        {promptLibrary.length > 0 ? (
                                            promptLibrary.map((libPrompt, index) => (
                                                <div key={index} className="group bg-white dark:bg-zinc-700/50 p-2 rounded-md flex justify-between items-center gap-2">
                                                    <p className="text-xs text-zinc-700 dark:text-zinc-300 flex-grow">{libPrompt}</p>
                                                    <div className="flex-shrink-0 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setPrompt(libPrompt)}
                                                            className="p-1 text-zinc-500 hover:text-yellow-400 transition-colors"
                                                            title="Chuyển vào mô tả"
                                                        >
                                                            <SendToInputIcon className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(libPrompt);
                                                                setCopiedLibraryPromptIndex(index);
                                                                setTimeout(() => setCopiedLibraryPromptIndex(null), 2000);
                                                            }}
                                                            className="p-1 text-zinc-500 hover:text-green-500 transition-colors"
                                                            title="Sao chép"
                                                        >
                                                            {copiedLibraryPromptIndex === index ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon />}
                                                        </button>
                                                        <button
                                                            onClick={() => setPromptLibrary(prev => prev.filter((_, i) => i !== index))}
                                                            className="p-1 text-zinc-500 hover:text-red-500 transition-colors"
                                                            title="Xóa prompt"
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-center text-zinc-500 py-4">Thư viện của bạn trống. Tạo prompt từ ảnh để thêm vào đây.</p>
                                        )}
                                    </div>
                                )}
                            </section>

                            <section>
                                <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Chọn vị trí trên bản đồ vệ tinh</h2>
                                <div className="p-3 bg-gray-100 dark:bg-zinc-800/50 rounded-lg space-y-3">
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Tạo bối cảnh thực tế bằng cách chọn một vị trí.</p>
                                    
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={e => setAddress(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleGeocode()}
                                            placeholder={isGettingLocation ? "Đang lấy địa chỉ..." : "Nhập địa chỉ để tìm kiếm..."}
                                            disabled={isGettingLocation || isGeocoding}
                                            className="flex-grow bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 placeholder-zinc-500 px-3 py-2 rounded-md border-2 border-gray-300 dark:border-zinc-700/80 focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm disabled:cursor-wait"
                                        />
                                        <button onClick={handleGeocode} disabled={isGeocoding || isGettingLocation} className="px-4 py-2 bg-zinc-600 text-white font-semibold rounded-md hover:bg-zinc-500 transition-colors text-sm disabled:bg-zinc-700 disabled:cursor-wait">
                                            {isGeocoding ? '...' : 'Tìm'}
                                        </button>
                                    </div>
                                    
                                    <button onClick={handleGetLocation} disabled={isGettingLocation || isGeocoding} className="w-full flex items-center justify-center gap-2 bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-300 transition-colors text-sm disabled:bg-zinc-600 disabled:cursor-not-allowed">
                                        <MapPinIcon className="w-4 h-4" />
                                        {isGettingLocation ? 'Đang lấy vị trí...' : 'Dùng vị trí hiện tại'}
                                    </button>
                                    
                                    {(locationError && !isGettingLocation && !isGeocoding) && <p className="text-xs text-red-500 text-center">{locationError}</p>}
                                    
                                    {location && (
                                        <div className="space-y-2 pt-2 animate-fade-in">
                                            <div className="h-48 w-full bg-gray-200 dark:bg-zinc-700 rounded-md overflow-hidden border border-gray-300 dark:border-zinc-600">
                                                <MapView lat={location.lat} lng={location.lng} />
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <p className="font-mono text-zinc-600 dark:text-zinc-400">
                                                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                                                </p>
                                                <button onClick={() => { setLocation(null); setAddress(''); }} className="text-red-500 hover:underline">Xóa vị trí</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section>
                                <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                                    TƯ VẤN PHONG THỦY
                                </h2>
                                <div className="bg-gray-100 dark:bg-zinc-800/50 p-3 rounded-lg space-y-3">
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Nhập năm sinh Âm lịch của gia chủ để AI gợi ý màu sắc hợp mệnh.</p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={fengShuiYear}
                                            onChange={e => setFengShuiYear(e.target.value)}
                                            placeholder="Năm sinh (VD: 1990)"
                                            className="flex-grow bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 placeholder-zinc-500 px-3 py-2 rounded-md border-2 border-gray-300 dark:border-zinc-700/80 focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm"
                                        />
                                        <button
                                            onClick={handleSuggestColors}
                                            disabled={!fengShuiYear || isSuggestingColors}
                                            className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-md hover:bg-yellow-300 transition-colors text-sm disabled:bg-zinc-600 disabled:text-zinc-400 disabled:cursor-not-allowed"
                                        >
                                            {isSuggestingColors ? 'Đang...' : 'Gợi ý'}
                                        </button>
                                    </div>
                                </div>
                            </section>
                            
                            {/* Customizations */}
                            <section className="space-y-5">
                                <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">CHẾ ĐỘ TẠO</h2>
                                <div className="flex bg-gray-200 dark:bg-zinc-700/50 p-1 rounded-lg">
                                    <button onClick={() => setGenerationMode('single')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${generationMode === 'single' ? 'bg-yellow-400 text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>
                                        Tạo đơn
                                    </button>
                                    <button onClick={() => setGenerationMode('batch')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${generationMode === 'batch' ? 'bg-yellow-400 text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>
                                        Tạo hàng loạt
                                    </button>
                                </div>

                                {generationMode === 'batch' && (
                                    <section>
                                        <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-300 mb-2">Thêm ảnh hàng loạt (tùy chọn)</h3>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-3">Nếu bạn thêm ảnh ở đây, các tùy chọn hàng loạt sẽ được áp dụng cho từng ảnh. Nếu không có ảnh, AI sẽ tạo ảnh từ mô tả văn bản (Text-to-Image Batch).</p>
                                        <BatchImageUploadArea 
                                            images={batchInputImages} 
                                            onImagesUpdate={setBatchInputImages}
                                        />
                                    </section>
                                )}

                                <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">TÙY CHỈNH</h2>
                                {!!referenceImage && (
                                    <div className="text-center text-xs text-yellow-500 p-2 bg-yellow-400/10 rounded-md">
                                        Các tùy chọn tùy chỉnh đã bị vô hiệu hóa vì đang sử dụng ảnh tham chiếu để xác định phong cách.
                                    </div>
                                )}
                                
                                <div className="flex bg-gray-200 dark:bg-zinc-700/50 p-1 rounded-lg">
                                    <button onClick={() => setActiveView('architecture')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${activeView === 'architecture' ? 'bg-yellow-400 text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>
                                        Kiến trúc
                                    </button>
                                    <button onClick={() => setActiveView('interior')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${activeView === 'interior' ? 'bg-yellow-400 text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>
                                        Nội thất
                                    </button>
                                    <button onClick={() => setActiveView('landscape')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${activeView === 'landscape' ? 'bg-yellow-400 text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>
                                        Cảnh quan
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {generationMode === 'single' ? (
                                        <>
                                            {activeView === 'architecture' ? (
                                                <>
                                                    <CustomSelect label="Phong cách thiết kế" value={designStyle} onChange={e => setDesignStyle(e.target.value)} disabled={!!referenceImage}>
                                                        {renderDropdownOptions(controlOptions.designStyle, "Chọn phong cách")}
                                                    </CustomSelect>
                                                    <MultiSelectDropdown label="Vật liệu" options={controlOptions.materials} selected={materials} onChange={setMaterials} disabled={!!referenceImage}/>
                                                    <CustomSelect label="Bối cảnh" value={context} onChange={e => setContext(e.target.value)} disabled={!!referenceImage}>
                                                        {renderDropdownOptions(controlOptions.context, "Chọn bối cảnh")}
                                                    </CustomSelect>
                                                    <CustomSelect label="Thời điểm" value={timeOfDay} onChange={e => setTimeOfDay(e.target.value)} disabled={!!referenceImage}>
                                                        {renderDropdownOptions(controlOptions.timeOfDay, "Chọn thời điểm")}
                                                    </CustomSelect>
                                                    <CustomSelect label="Thời tiết" value={weather} onChange={e => setWeather(e.target.value)} disabled={!!referenceImage}>
                                                        {renderDropdownOptions(controlOptions.weather, "Chọn thời tiết")}
                                                    </CustomSelect>
                                                    <CustomSelect label="Góc máy" value={cameraAngle} onChange={e => setCameraAngle(e.target.value)} disabled={!!referenceImage}>
                                                        {renderDropdownOptions(controlOptions.cameraAngle, "Chọn góc máy")}
                                                    </CustomSelect>
                                                    <CustomSelect label="Ánh sáng" value={lighting} onChange={e => setLighting(e.target.value)} disabled={!!referenceImage}>
                                                        {renderDropdownOptions(controlOptions.lighting, "Chọn ánh sáng")}
                                                    </CustomSelect>
                                                    <CustomSelect label="Hướng nhìn ngoại thất" value={exteriorView} onChange={e => setExteriorView(e.target.value)} disabled={!!referenceImage}>
                                                        {renderDropdownOptions(controlOptions.exteriorView, "Chọn hướng nhìn")}
                                                    </CustomSelect>
                                                </>
                                            ) : activeView === 'interior' ? (
                                                <>
                                                    <CustomSelect label="Không gian" value={interiorView} onChange={e => setInteriorView(e.target.value)} disabled={!!referenceImage}>
                                                        {renderDropdownOptions(controlOptions.interiorView, "Chọn không gian")}
                                                    </CustomSelect>
                                                    <CustomSelect label="Phong cách" value={interiorStyle} onChange={e => setInteriorStyle(e.target.value)} disabled={!!referenceImage}>
                                                        {renderDropdownOptions(controlOptions.interiorStyle, "Chọn phong cách")}
                                                    </CustomSelect>
                                                    <CustomSelect label="Không khí/Cảm xúc" value={interiorMood} onChange={e => setInteriorMood(e.target.value)} disabled={!!referenceImage}>
                                                        {renderDropdownOptions(controlOptions.interiorMood, "Chọn không khí")}
                                                    </CustomSelect>
                                                    <CustomSelect label="Bảng màu" value={colorPalette} onChange={e => setColorPalette(e.target.value)} disabled={!!referenceImage}>
                                                        {renderDropdownOptions(controlOptions.colorPalette, "Chọn bảng màu")}
                                                    </CustomSelect>
                                                    <CustomSelect label="Ánh sáng" value={lighting} onChange={e => setLighting(e.target.value)} disabled={!!referenceImage}>
                                                        {renderDropdownOptions(controlOptions.lighting, "Chọn ánh sáng")}
                                                    </CustomSelect>
                                                </>
                                            ) : (
                                                <>
                                                    <CustomSelect label="Phong cách cảnh quan" value={landscapeStyle} onChange={e => setLandscapeStyle(e.target.value)} disabled={!!referenceImage}>
                                                        {renderDropdownOptions(controlOptions.landscapeStyle, "Chọn phong cách")}
                                                    </CustomSelect>
                                                    <MultiSelectDropdown label="Yếu tố cảnh quan" options={controlOptions.landscapeElements} selected={landscapeElements} onChange={setLandscapeElements} disabled={!!referenceImage} />
                                                    <CustomSelect label="Thời điểm" value={timeOfDay} onChange={e => setTimeOfDay(e.target.value)} disabled={!!referenceImage}>
                                                        {renderDropdownOptions(controlOptions.timeOfDay, "Chọn thời điểm")}
                                                    </CustomSelect>
                                                    <CustomSelect label="Thời tiết" value={weather} onChange={e => setWeather(e.target.value)} disabled={!!referenceImage}>
                                                        {renderDropdownOptions(controlOptions.weather, "Chọn thời tiết")}
                                                    </CustomSelect>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {activeView === 'architecture' ? (
                                                <>
                                                    <MultiSelectDropdown label="Phong cách thiết kế" options={controlOptions.designStyle} selected={batchState.designStyle} onChange={v => handleBatchStateChange('designStyle', v)} />
                                                    <MultiSelectDropdown label="Vật liệu" options={controlOptions.materials} selected={batchState.materials} onChange={v => handleBatchStateChange('materials', v)} />
                                                    <MultiSelectDropdown label="Bối cảnh" options={controlOptions.context} selected={batchState.context} onChange={v => handleBatchStateChange('context', v)} />
                                                    <MultiSelectDropdown label="Thời điểm" options={controlOptions.timeOfDay} selected={batchState.timeOfDay} onChange={v => handleBatchStateChange('timeOfDay', v)} />
                                                    <MultiSelectDropdown label="Thời tiết" options={controlOptions.weather} selected={batchState.weather} onChange={v => handleBatchStateChange('weather', v)} />
                                                </>
                                            ) : (
                                                <>
                                                    <MultiSelectDropdown label="Không gian" options={controlOptions.interiorView} selected={batchState.interiorView} onChange={v => handleBatchStateChange('interiorView', v)} />
                                                    <MultiSelectDropdown label="Phong cách" options={controlOptions.interiorStyle} selected={batchState.interiorStyle} onChange={v => handleBatchStateChange('interiorStyle', v)} />
                                                    <MultiSelectDropdown label="Không khí" options={controlOptions.interiorMood} selected={batchState.interiorMood} onChange={v => handleBatchStateChange('interiorMood', v)} />
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>

                                {activeView === 'interior' && (
                                    <section className={`transition-opacity ${!!referenceImage ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-300 mb-2">Đồ nội thất rời (Tùy chọn)</h3>
                                        <LooseFurnitureUploader 
                                            furniture={looseFurniture}
                                            onUpload={handleLooseFurnitureUpload}
                                            onRemove={handleRemoveLooseFurniture}
                                        />
                                    </section>
                                )}


                                <div>
                                    <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-300 mb-2">Chế độ đặc biệt</label>
                                    <div className="grid grid-cols-2 gap-3 items-start">
                                        <div>
                                            <button onClick={() => { setIsCTAIProMode(c => !c); setKeepShape(false); setIsMetaMode(false); setIsNewBananaMode(false); setIsBananaFlowMode(false); }} disabled={!!referenceImage} className={`w-full h-14 text-xs font-semibold px-2 rounded-lg transition-colors flex items-center justify-center text-center ${isCTAIProMode ? 'bg-yellow-400 text-black' : 'bg-gray-200 dark:bg-zinc-700/50 hover:bg-gray-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-300'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                                CTAIpro<br/>(2 Steps)
                                            </button>
                                        </div>
                                        <div>
                                            <button onClick={() => { setKeepShape(c => !c); setIsCTAIProMode(false); setIsMetaMode(false); setIsNewBananaMode(false); setIsBananaFlowMode(false); }} disabled={!!referenceImage} className={`w-full h-14 text-xs font-semibold px-2 rounded-lg transition-colors flex items-center justify-center text-center ${keepShape ? 'bg-yellow-400 text-black' : 'bg-gray-200 dark:bg-zinc-700/50 hover:bg-gray-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-300'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                                Giữ nguyên<br/>hình dạng
                                            </button>
                                        </div>
                                        <div>
                                            <button onClick={() => { setIsMetaMode(c => !c); setIsCTAIProMode(false); setKeepShape(false); setIsNewBananaMode(false); setIsBananaFlowMode(false); }} disabled={!!referenceImage} className={`w-full h-14 text-xs font-semibold px-2 rounded-lg transition-colors flex items-center justify-center text-center ${isMetaMode ? 'bg-yellow-400 text-black' : 'bg-gray-200 dark:bg-zinc-700/50 hover:bg-gray-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-300'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                                <span>AI Tạo ảnh<br/>Meta <span className="text-[9px] font-bold bg-red-600 text-white px-1 rounded-full ml-1">MỚI</span></span>
                                            </button>
                                        </div>
                                        <div>
                                            <button onClick={() => { setIsBananaFlowMode(c => !c); setIsCTAIProMode(false); setKeepShape(false); setIsMetaMode(false); setIsNewBananaMode(false); }} disabled={!!referenceImage} className={`w-full h-14 text-xs font-semibold px-2 rounded-lg transition-colors flex items-center justify-center text-center ${isBananaFlowMode ? 'bg-yellow-400 text-black' : 'bg-gray-200 dark:bg-zinc-700/50 hover:bg-gray-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-300'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                                Banana<br/>Flow
                                            </button>
                                        </div>
                                        <div>
                                            <button onClick={() => { setIsNewBananaMode(c => !c); setIsCTAIProMode(false); setKeepShape(false); setIsMetaMode(false); setIsBananaFlowMode(false); }} disabled={!!referenceImage} className={`w-full h-14 text-xs font-semibold px-2 rounded-lg transition-colors flex items-center justify-center text-center ${isNewBananaMode ? 'bg-yellow-400 text-black' : 'bg-gray-200 dark:bg-zinc-700/50 hover:bg-gray-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-300'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                                Banana<br/>Mới (Nano)
                                            </button>
                                            {newBananaCountdown && (
                                                <div className="text-center mt-1 text-red-500 text-xs font-semibold animate-pulse">
                                                    Còn {newBananaCountdown.days} ngày {String(newBananaCountdown.hours).padStart(2, '0')}:{String(newBananaCountdown.minutes).padStart(2, '0')}:{String(newBananaCountdown.seconds).padStart(2, '0')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="creativity" className="flex justify-between text-sm font-medium text-zinc-800 dark:text-zinc-300 mb-2">
                                        <span>Mức độ sáng tạo</span>
                                    </label>
                                    <input
                                        id="creativity"
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={creativityLevel}
                                        onChange={e => setCreativityLevel(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-300 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                                    />
                                    <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                        <span>Bám sát ảnh gốc</span>
                                        <span>Sáng tạo tối đa</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-300 mb-2">Số lượng ảnh (mỗi loại)</label>
                                    <NumberInput value={imageCount} onChange={setImageCount} />
                                </div>
                                
                                <div>
                                    <label htmlFor="seed-input" className="block text-sm font-medium text-zinc-800 dark:text-zinc-300 mb-2">Seed (Tùy chọn)</label>
                                    <input
                                        id="seed-input"
                                        type="number"
                                        value={seed}
                                        onChange={e => setSeed(e.target.value)}
                                        placeholder="Để trống để tạo ngẫu nhiên"
                                        className="w-full bg-gray-200 dark:bg-zinc-700/50 border-2 border-transparent text-zinc-800 dark:text-zinc-300 px-4 py-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-300 mb-2">Cài đặt sẵn (Presets)</label>
                                    <div className="flex gap-2 mb-2">
                                        <input type="text" value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="Tên cài đặt..." className="flex-grow bg-gray-200 dark:bg-zinc-700/50 text-zinc-800 dark:text-zinc-300 placeholder-zinc-500 px-4 py-2.5 rounded-lg border-2 border-transparent focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm"/>
                                        <button onClick={savePreset} className="bg-zinc-500 dark:bg-zinc-600 hover:bg-zinc-600 dark:hover:bg-zinc-500 text-white font-bold px-4 rounded-lg transition-colors text-sm">LƯU</button>
                                    </div>
                                    <CustomSelect label="Tải cài đặt" value={selectedPreset} onChange={e => loadPreset(e.target.value)} >
                                        <option value="">Tải một cài đặt...</option>
                                        {presets.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                    </CustomSelect>
                                </div>

                            </section>
                        </div>

                        <footer className="mt-8 pt-6 border-t border-gray-300 dark:border-zinc-700/50">
                            <button 
                                onClick={handleGenerateImage}
                                className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-600 disabled:text-zinc-400 disabled:cursor-not-allowed" 
                                disabled={!canGenerate}
                            >
                                {isLoading
                                    ? (generationMode === 'batch' ? 'Đang xử lý...' : 'Đang tạo...')
                                    : generationMode === 'single'
                                        ? `Tạo ${imageCount} ảnh`
                                        : `Tạo ${totalBatchImagesCount} ảnh hàng loạt`}
                            </button>
                        </footer>
                    </aside>
                    
                    <div className="flex-1 flex flex-col bg-gray-200 dark:bg-black/40 lg:overflow-hidden">
                        <main className="flex-1 flex items-center justify-center p-4 md:p-8 relative lg:overflow-hidden">
                            {isLoading ? (
                                <div className="flex flex-col items-center text-center">
                                    <LoadingSpinner isBatch={generationMode==='batch'} progress={batchProgress} message={loadingMessage}/>
                                </div>
                            ) : error ? (
                                <div className="text-center text-red-500 flex flex-col items-center">
                                    <ErrorIcon />
                                    <h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2>
                                    <p className="mt-1 max-w-md">{error}</p>
                                </div>
                            ) : selectedOutputImage ? (
                                <div className={`w-full h-full flex items-center justify-center relative group/output ${shouldAnimateMain ? 'animate-image-in' : ''}`}>
                                    {originalInputImage && (
                                        <img src={originalInputImage} alt="Input overlay" className="absolute inset-0 w-full h-full object-contain opacity-50 -z-10"/>
                                    )}
                                    <img src={selectedOutputImage} alt="AI Generated Result" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"/>
                                    <div className="absolute top-4 right-4 flex flex-col gap-2 transition-opacity lg:opacity-0 lg:group-hover/output:opacity-100">
                                        <button onClick={() => setIsOutputZoomed(true)} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Phóng to"><ZoomIcon /></button>
                                        <button onClick={() => setIsOutputCropping(true)} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Cắt ảnh"><CropIcon /></button>
                                        <button onClick={handleUseAsInput} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Đưa về ảnh đầu vào"><SendToInputIcon /></button>
                                        <button onClick={handleDownloadImage} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Tải xuống"><DownloadIcon /></button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-zinc-500 flex flex-col items-center">
                                    <PlaceholderIcon />
                                    <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Kết quả do AI tạo</h2>
                                    <p className="mt-1">Thiết kế mới của bạn sẽ xuất hiện ở đây.</p>
                                </div>
                            )}
                        </main>

                        {outputImages.length > 0 && (
                            <footer className="flex-shrink-0 bg-white dark:bg-zinc-900/50 p-4 border-t border-gray-200 dark:border-zinc-800">
                                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Lịch sử phiên</h3>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {outputImages.map((imgSrc, index) => (
                                        <div 
                                            key={`${index}-${imgSrc.substring(imgSrc.length-10)}`}
                                            className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${selectedOutputImage === imgSrc ? 'border-yellow-400' : 'border-transparent hover:border-zinc-600'} ${index < newImagesCount ? 'animate-image-in' : ''}`}
                                            onClick={() => setSelectedOutputImage(imgSrc)}
                                        >
                                            <img src={imgSrc} alt={`History item ${index + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </footer>
                        )}
                    </div>
                </>
            ) : activeToolTab === 'creative' ? (
                 <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    <aside className="w-full lg:w-[420px] lg:flex-shrink-0 bg-gray-50 dark:bg-zinc-900/30 p-4 sm:p-6 flex flex-col lg:overflow-y-auto">
                        <section>
                            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Ảnh đầu vào</h2>
                            { !originalInputImage ? (
                                <div>
                                    <label
                                        htmlFor="creative-input-image-upload"
                                        className="relative aspect-video bg-gray-100 dark:bg-zinc-800/50 rounded-lg border-2 border-dashed border-gray-400 dark:border-zinc-600 flex flex-col items-center justify-center text-center transition-colors hover:border-yellow-400 group cursor-pointer"
                                    >
                                        <UploadIcon />
                                        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">Tải lên ảnh</p>
                                        <p className="text-xs text-zinc-500 mt-1">hoặc <span className="text-yellow-400 font-semibold">nhấn vào đây</span></p>
                                    </label>
                                    <input id="creative-input-image-upload" type="file" className="hidden" aria-label="Tải lên ảnh đầu vào" onChange={(e) => e.target.files && handleInputImageUpload(e.target.files[0])} accept="image/png, image/jpeg, image/webp" />
                                </div>
                            ) : (
                                <ImageWithControls
                                    image={originalInputImage}
                                    onImageUpdate={handleInputImageUpload}
                                    onClear={clearInputImage}
                                    alt="Ảnh đầu vào cho gợi ý"
                                    maxHeight="240px"
                                />
                            )}
                        </section>
                        <section className="mt-6">
                             <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Khổ ảnh</h2>
                            <div className="grid grid-cols-5 gap-1 bg-gray-200 dark:bg-zinc-700/50 p-1 rounded-lg">
                                {['1:1', '16:9', '9:16', '4:3', '3:4'].map(ratio => (
                                    <button 
                                        key={ratio} 
                                        onClick={() => setCreativeAspectRatio(ratio)}
                                        className={`flex-1 text-center text-xs font-semibold py-2 rounded-md transition-colors ${creativeAspectRatio === ratio ? 'bg-yellow-400 text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}
                                    >
                                        {ratio}
                                    </button>
                                ))}
                            </div>
                        </section>
                        <footer className="mt-auto pt-6">
                            <button onClick={handleGenerateCreativePrompts} className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-600 disabled:cursor-not-allowed" disabled={isGeneratingCreativePrompts || !originalInputImage}>
                                {isGeneratingCreativePrompts ? 'Đang tạo...' : 'Tạo 40 gợi ý Prompt'}
                            </button>
                        </footer>
                    </aside>
                     <main className="flex-1 p-4 md:p-8 bg-gray-200 dark:bg-black/40 overflow-y-auto">
                        {isGeneratingCreativePrompts && <div className="flex items-center justify-center h-full"><CreativePromptsLoadingSpinner text="Đang tạo 40 gợi ý..." /></div>}
                        {creativePromptsError && !isGeneratingCreativePrompts && <div className="text-center text-red-500 flex flex-col items-center justify-center h-full"><ErrorIcon /><h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2><p className="mt-1 max-w-md">{creativePromptsError}</p></div>}
                        
                        {!isGeneratingCreativePrompts && !creativePromptsError && creativePrompts.length > 0 && (
                            <div className="space-y-4">
                                {creativePrompts.map((p) => (
                                    <div key={p.id} className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm">
                                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{p.text}</p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <button onClick={() => handleCopyPrompt(p.text, p.id)} className="flex items-center gap-1.5 text-xs font-semibold bg-gray-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1 rounded-full hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors">
                                                {copiedPromptId === p.id ? <CheckIcon /> : <CopyIcon />}
                                                {copiedPromptId === p.id ? 'Đã chép' : 'Sao chép'}
                                            </button>
                                            <button onClick={() => handleGenerateImageForCreativePrompt(p.id)} disabled={p.isLoading} className="flex items-center gap-1.5 text-xs font-semibold bg-yellow-400 text-black px-3 py-1 rounded-full hover:bg-yellow-300 transition-colors disabled:bg-zinc-500 disabled:cursor-not-allowed">
                                                <SparklesIcon />
                                                Tạo ảnh
                                            </button>
                                        </div>
                                        <div className="mt-3">
                                            {p.isLoading && <div className="flex items-center justify-center min-h-[120px]"><CreativePromptsLoadingSpinner text="Đang tạo ảnh..." small /></div>}
                                            {!p.isLoading && p.images.length > 0 && (
                                                <div className="grid grid-cols-1 gap-2">
                                                    {p.images.map((img, imgIndex) => (
                                                        <div key={imgIndex} className="relative group/image bg-gray-100 dark:bg-zinc-900/50 rounded-md flex items-center justify-center aspect-square">
                                                            <img 
                                                                src={img} 
                                                                alt={`Generated ${p.id}-${imgIndex}`} 
                                                                onClick={() => setZoomedCreativeImage(img)}
                                                                onContextMenu={(e) => handleLongPressDownload(e, img)}
                                                                className="max-w-full max-h-full object-contain cursor-pointer rounded" 
                                                            />
                                                            <div className={`absolute top-1 right-1 flex flex-col gap-1.5 transition-opacity ${isMobileDevice ? 'opacity-90' : 'opacity-0 group-hover/image:opacity-100'}`}>
                                                                <button onClick={(e) => { e.stopPropagation(); setZoomedCreativeImage(img); }} className="p-1.5 bg-zinc-800/70 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Phóng to">
                                                                    <ZoomIcon />
                                                                </button>
                                                                <button onClick={(e) => { e.stopPropagation(); handleDownloadCreativeImage(img); }} className="p-1.5 bg-zinc-800/70 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Tải xuống">
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
                        {!isGeneratingCreativePrompts && !creativePromptsError && creativePrompts.length === 0 && (
                            <div className="text-center text-zinc-500 flex flex-col items-center justify-center h-full">
                                <CreativePromptsPlaceholderIcon />
                                <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Gợi ý Prompt Nâng cao</h2>
                                <p className="mt-1 max-w-sm">Tải lên một ảnh đầu vào và nhấn "Tạo 40 gợi ý Prompt" để AI phân tích và tạo các góc nhìn độc đáo.</p>
                            </div>
                        )}
                    </main>
                </div>
            ) : (
                <VisualizationImprovementTool />
            )}
        </div>
        
        {isSuggestionModalOpen && (
            <div 
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
                onClick={() => setIsSuggestionModalOpen(false)}
            >
                <div 
                    className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
                        <h2 className="text-lg font-semibold text-black dark:text-white">Gợi ý Prompt từ AI</h2>
                        <button onClick={() => setIsSuggestionModalOpen(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                            <CloseIcon className="h-5 w-5" />
                        </button>
                    </header>
                    <div className="p-6 overflow-y-auto space-y-2">
                        {promptSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setPrompt(suggestion);
                                    setIsSuggestionModalOpen(false);
                                }}
                                className="w-full text-left p-3 text-sm text-zinc-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-700/50 rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {isCameraOpen && <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleInputImageUpload} />}

        {isOutputZoomed && selectedOutputImage && (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setIsOutputZoomed(false)}>
                <img src={selectedOutputImage} alt="Kết quả được phóng to" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
                <button className="absolute top-4 right-4 text-white p-2 bg-black/50 rounded-full hover:bg-black/80" onClick={() => setIsOutputZoomed(false)}><CloseIcon className="h-6 w-6" /></button>
            </div>
        )}
        
        {zoomedCreativeImage && (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setZoomedCreativeImage(null)}>
                <img src={zoomedCreativeImage} alt="Zoomed view" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
                <button className="absolute top-4 right-4 text-white p-2 bg-black/50 rounded-full hover:bg-black/80" onClick={() => setZoomedCreativeImage(null)}><CloseIcon className="h-6 w-6" /></button>
            </div>
        )}

        {isOutputCropping && selectedOutputImage && (
            <CropModal imageSrc={selectedOutputImage} onClose={() => setIsOutputCropping(false)} onSave={handleSaveOutputCrop} />
        )}

        {colorSuggestions && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
                        <h2 className="text-lg font-semibold text-black dark:text-white">
                            Gợi ý màu sắc cho Mệnh <span className="text-yellow-400">{colorSuggestions.element}</span>
                        </h2>
                        <button onClick={() => setColorSuggestions(null)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700">
                            <CloseIcon className="h-5 w-5" />
                        </button>
                    </header>
                    <div className="p-6 overflow-y-auto space-y-6">
                        <div>
                            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">🎨 Ngoại thất</h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{colorSuggestions.exterior}</p>
                            <button 
                                onClick={() => {
                                    appendToPrompt(`phối màu ngoại thất theo phong thủy: ${colorSuggestions.exterior}`);
                                    setColorSuggestions(null);
                                }}
                                className="mt-3 text-xs font-bold bg-gray-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-3 py-1 rounded-full hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors"
                            >
                                Áp dụng vào mô tả
                            </button>
                        </div>
                        <div>
                            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">🛋️ Nội thất</h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{colorSuggestions.interior}</p>
                            <button 
                                onClick={() => {
                                    appendToPrompt(`phối màu nội thất theo phong thủy: ${colorSuggestions.interior}`);
                                    setColorSuggestions(null);
                                }}
                                className="mt-3 text-xs font-bold bg-gray-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-3 py-1 rounded-full hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors"
                            >
                                Áp dụng vào mô tả
                            </button>
                        </div>
                    </div>
                    <footer className="p-4 border-t border-gray-200 dark:border-zinc-700 text-right">
                        <button 
                            onClick={() => {
                                appendToPrompt(`phối màu ngoại thất theo phong thủy: ${colorSuggestions.exterior}`);
                                appendToPrompt(`phối màu nội thất theo phong thủy: ${colorSuggestions.interior}`);
                                setColorSuggestions(null);
                            }}
                            className="px-5 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transition-colors text-sm"
                        >
                            Áp dụng tất cả
                        </button>
                    </footer>
                </div>
            </div>
        )}
    </div>
  );
};

const CameraModal: React.FC<{ isOpen: boolean; onClose: () => void; onCapture: (dataUrl: string) => void; }> = ({ isOpen, onClose, onCapture }) => {
    // Icons defined locally to be self-contained
    const FlashOnIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>);
    const FlashOffIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" /></svg>);
    const OptionsIconDots: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [zoomCapabilities, setZoomCapabilities] = useState<{ min: number; max: number; step: number; } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasFlash, setHasFlash] = useState(false);
    const [flashMode, setFlashMode] = useState<'on' | 'off'>('off');
    const [activeZoomPreset, setActiveZoomPreset] = useState<'0.5x' | '1x' | '2.5x'>('1x');
    const [availableZoomPresets, setAvailableZoomPresets] = useState<('0.5x' | '1x' | '2.5x')[]>(['1x']);

    useEffect(() => {
        const startCamera = async () => {
            if (isOpen) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.onloadedmetadata = () => {
                            const track = stream.getVideoTracks()[0];
                            const capabilities: any = track.getCapabilities();

                            if (capabilities.torch) {
                                setHasFlash(true);
                            }

                            if (capabilities.zoom) {
                                const { min, max, step } = capabilities.zoom;
                                setZoomCapabilities({ min, max, step });
                                setActiveZoomPreset('1x');
                                
                                const presets: ('0.5x' | '1x' | '2.5x')[] = [];
                                if (min < 1) presets.push('0.5x');
                                if (1 >= min && 1 <= max) presets.push('1x');
                                if (2.5 <= max) presets.push('2.5x');
                                else if (max > 1) presets.push('2.5x');
                                
                                setAvailableZoomPresets(presets.length > 0 ? presets : ['1x']);
                            }
                        };
                    }
                } catch (err) {
                    console.error("Camera error:", err);
                    setError("Không thể truy cập camera. Vui lòng cấp quyền và thử lại.");
                }
            } else {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
            }
        };

        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [isOpen]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            onCapture(canvas.toDataURL('image/jpeg'));
            onClose();
        }
    };
    
    const handleZoom = (level: number) => {
        if (streamRef.current && zoomCapabilities) {
            const track = streamRef.current.getVideoTracks()[0];
            const clampedLevel = Math.max(zoomCapabilities.min, Math.min(level, zoomCapabilities.max));
            try {
                track.applyConstraints({ advanced: [{ zoom: clampedLevel }] });
            } catch (err) {
                console.error("Zoom failed:", err);
            }
        }
    };

    const handleZoomPresetChange = (preset: '0.5x' | '1x' | '2.5x') => {
        if (!zoomCapabilities) return;
        setActiveZoomPreset(preset);
        let targetZoom = 1;
        switch (preset) {
            case '0.5x':
                targetZoom = Math.max(0.5, zoomCapabilities.min);
                break;
            case '1x':
                targetZoom = 1;
                break;
            case '2.5x':
                targetZoom = 2.5;
                break;
        }
        handleZoom(targetZoom);
    };
    
    const handleToggleFlash = () => {
        if (!hasFlash || !streamRef.current) return;
        const newMode = flashMode === 'on' ? 'off' : 'on';
        const track = streamRef.current.getVideoTracks()[0];
        try {
            track.applyConstraints({
                advanced: [{ torch: newMode === 'on' }]
            });
            setFlashMode(newMode);
        } catch(err) {
            console.error("Failed to toggle flash:", err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden">
            {error ? (
                 <div className="flex-1 flex items-center justify-center text-center text-white p-4">
                    <div>
                        <p className="text-red-500">{error}</p>
                        <button onClick={onClose} className="mt-4 px-4 py-2 bg-zinc-700 rounded-lg">Đóng</button>
                    </div>
                </div>
            ) : (
                <>
                    <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover"></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    
                    {/* Grid Overlay */}
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                        <div className="col-start-1 row-start-1 border-r border-b border-white/20"></div>
                        <div className="col-start-2 row-start-1 border-r border-b border-white/20"></div>
                        <div className="col-start-3 row-start-1 border-b border-white/20"></div>
                        <div className="col-start-1 row-start-2 border-r border-b border-white/20"></div>
                        <div className="col-start-2 row-start-2 border-r border-b border-white/20"></div>
                        <div className="col-start-3 row-start-2 border-b border-white/20"></div>
                        <div className="col-start-1 row-start-3 border-r border-white/20"></div>
                        <div className="col-start-2 row-start-3 border-r border-white/20"></div>
                    </div>

                    {/* Top Controls */}
                    <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                        <div className="flex justify-end items-center">
                             <div className="flex items-center gap-4 bg-black/30 backdrop-blur-sm p-2 rounded-full">
                                {hasFlash && (
                                    <button onClick={handleToggleFlash} className="text-white p-1.5 rounded-full">
                                        {flashMode === 'on' ? <FlashOnIcon className="w-6 h-6" /> : <FlashOffIcon className="w-6 h-6" />}
                                    </button>
                                )}
                                <button className="text-white p-1.5 rounded-full">
                                    <OptionsIconDots className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Close button on the left */}
                    <button onClick={onClose} className="absolute top-6 left-6 p-2 bg-black/40 rounded-full text-white backdrop-blur-sm">
                        <CloseIcon className="w-6 h-6" />
                    </button>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center gap-6 bg-gradient-to-t from-black/50 to-transparent">
                        {zoomCapabilities && (
                            <div className="flex items-center justify-center gap-2 bg-black/40 backdrop-blur-sm p-1.5 rounded-full">
                                {availableZoomPresets.includes('0.5x') && (
                                    <button onClick={() => handleZoomPresetChange('0.5x')} className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors ${activeZoomPreset === '0.5x' ? 'bg-yellow-400 text-black' : 'text-white'}`}>0.5</button>
                                )}
                                {availableZoomPresets.includes('1x') && (
                                    <button onClick={() => handleZoomPresetChange('1x')} className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors ${activeZoomPreset === '1x' ? 'bg-yellow-400 text-black' : 'text-white'}`}>1x</button>
                                )}
                                {availableZoomPresets.includes('2.5x') && (
                                    <button onClick={() => handleZoomPresetChange('2.5x')} className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors ${activeZoomPreset === '2.5x' ? 'bg-yellow-400 text-black' : 'text-white'}`}>2.5</button>
                                )}
                            </div>
                        )}
                        
                        <button onClick={handleCapture} className="w-20 h-20 rounded-full bg-white border-4 border-white/50 shadow-lg ring-2 ring-black/20"></button>
                    </div>
                </>
            )}
        </div>
    );
};


export default AIArchitectureTool;
