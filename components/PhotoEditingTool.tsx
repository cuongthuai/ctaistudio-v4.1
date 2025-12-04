
import React, { useState, useCallback, useRef, useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { BackIcon } from './icons/ChatIcons';

// --- ICONS ---
const CloseIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const PlaceholderIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-zinc-600 my-4" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 12l3.414-3.414a2 2 0 012.828 0L13 11.172a2 2 0 002.828 0L20 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>);
const UploadIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-500 group-hover:text-[var(--accent-color)] transition-colors" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>);
const PlusIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" /></svg>);
const LoadingSpinner: React.FC<{text?: string}> = ({ text }) => ( <div role="status" className="flex flex-col items-center text-center text-zinc-400"><svg aria-hidden="true" className="w-12 h-12 mb-4 text-zinc-600 animate-spin fill-[var(--accent-color)]" viewBox="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg><h2 className="text-xl font-semibold text-zinc-300">{text || 'Đang xử lý...'}</h2><p className="mt-1">AI đang thực hiện phép màu.</p><span className="sr-only">Loading...</span></div>);
const ErrorIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="http://www.w3.org/2000/svg" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const UndoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l4-4m-4 4l4 4" /></svg>;
const ZoomIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="http://www.w3.org/2000/svg" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
const SendToInputIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="http://www.w3.org/2000/svg" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="http://www.w3.org/2000/svg" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.086V3a1 1 0 112 0v8.086l1.293-1.379a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const BrushIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="http://www.w3.org/2000/svg" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const RectangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="http://www.w3.org/2000/svg" fill="currentColor"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5z" clipRule="evenodd" /></svg>;
const LassoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.151 4.316l-2.062 1.375a3.375 3.375 0 00-2.063 3.655l.54 2.7a.375.375 0 01-.7 0l-.54-2.7a3.375 3.375 0 00-5.718-1.59l-2.062 1.375a1.5 1.5 0 00-.44 1.767l.202.605a1.5 1.5 0 001.768.441l2.062-1.375a3.375 3.375 0 002.063-3.655l-.54-2.7a.375.375 0 01.7 0l.54 2.7a3.375 3.375 0 005.718 1.59l2.062-1.375a1.5 1.5 0 00.44-1.767l-.202-.605a1.5 1.5 0 00-1.768-.441z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15.75c-3.488 0-6.44-2.26-6.44-5.25s2.952-5.25 6.44-5.25c3.488 0 6.44 2.26 6.44 5.25s-2.952 5.25-6.44 5.25z" /></svg>;
const PolygonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>;
const LineIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" /></svg>;
const PolylineIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l6-6 4 4 8-8" /></svg>;
const ReplaceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="http://www.w3.org/2000/svg" fill="currentColor"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="http://www.w3.org/2000/svg" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.172a2 2 0 00.586 1.414l2.828 2.828a2 2 0 002.828 0l2.828-2.828A2 2 0 0015 4.172V3a1 1 0 10-2 0v1.172a.5.5 0 01-.146.354l-2.828 2.828a.5.5 0 01-.708 0L6.464 4.526A.5.5 0 016 4.172V3a1 1 0 00-1-1zm10 4a1 1 0 00-1 1v6.828a2 2 0 00.586 1.414l2.828 2.828a2 2 0 002.828 0l2.828-2.828A2 2 0 0021 13.828V7a1 1 0 10-2 0v6.828a.5.5 0 01-.146.354l-2.828 2.828a.5.5 0 01-.708 0L12.464 14.18A.5.5 0 0112 13.828V7a1 1 0 00-1-1zM2 5a1 1 0 00-1 1v6.828a2 2 0 00.586 1.414l2.828 2.828a2 2 0 002.828 0l2.828-2.828A2 2 0 0011 13.828V7a1 1 0 10-2 0v6.828a.5.5 0 01-.146.354l-2.828 2.828a.5.5 0 01-.708 0L2.464 14.18A.5.5 0 012 13.828V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;


// --- DATA & HELPER COMPONENTS ---

type MaskTool = 'brush' | 'rectangle' | 'lasso' | 'polygon' | 'line' | 'polyline';

interface MaskingActions {
    undo: () => void;
    clear: () => void;
    loadMask: (dataUrl: string) => void;
}

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
        if(reader.result) {
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
    <div className="bg-zinc-800 p-3 rounded-lg">
        <div className="grid grid-cols-3 gap-2">
            {images.map((image, index) => (
                <div key={index} className="relative group aspect-square">
                    <img src={image} alt={`Context input ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => handleRemoveImage(index)} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                            <TrashIcon />
                        </button>
                    </div>
                </div>
            ))}
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-square bg-zinc-700/50 rounded-lg border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-center transition-colors hover:border-[var(--accent-color)] group cursor-pointer"
            >
                <PlusIcon />
                <span className="text-xs mt-1 text-zinc-500">Thêm bối cảnh</span>
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

const MaskingComponent = forwardRef<
    MaskingActions,
    { imageSrc: string; brushSize: number; onMaskChange: (dataUrl: string | null) => void; activeTool: MaskTool; }
>(({ imageSrc, brushSize, onMaskChange, activeTool }, ref) => {
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const history = useRef<ImageData[]>([]);
    const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
    const startPoint = useRef({ x: 0, y: 0 });
    const pathPoints = useRef<{ x: number; y: number }[]>([]);

    const getCanvasContext = (canvas: HTMLCanvasElement | null) => canvas?.getContext('2d');

    const setCanvasSizes = useCallback(() => {
        const image = imageRef.current;
        const canvas = canvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        if (image && canvas && overlayCanvas) {
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            overlayCanvas.width = image.naturalWidth;
            overlayCanvas.height = image.naturalHeight;
            const ctx = getCanvasContext(canvas);
            if (ctx && history.current.length === 0) {
                 history.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            }
        }
    }, []);

    useEffect(() => {
        const image = imageRef.current;
        if (image) {
            image.onload = setCanvasSizes;
            if (image.complete) setCanvasSizes();
        }
    }, [imageSrc, setCanvasSizes]);

    const saveState = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = getCanvasContext(canvas);
        if (ctx && canvas) {
            history.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            if(history.current.length > 20) history.current.shift();
            
            const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
            const isEmpty = !pixelBuffer.some(color => color !== 0);

            onMaskChange(isEmpty ? null : canvas.toDataURL('image/png'));
        }
    }, [onMaskChange]);
    
    const finishDrawing = useCallback(() => {
        const mainCtx = getCanvasContext(canvasRef.current);
        const overlayCtx = getCanvasContext(overlayCanvasRef.current);
        if (!mainCtx || !overlayCtx || !overlayCanvasRef.current || !canvasRef.current) return;
        
        if (pathPoints.current.length < 2) {
            pathPoints.current = [];
            overlayCtx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
            return;
        }

        if (activeTool === 'polygon') {
            if (pathPoints.current.length < 3) return;
            mainCtx.fillStyle = 'white';
            mainCtx.beginPath();
            mainCtx.moveTo(pathPoints.current[0].x, pathPoints.current[0].y);
            pathPoints.current.forEach(p => mainCtx.lineTo(p.x, p.y));
            mainCtx.closePath();
            mainCtx.fill();
        } else if (activeTool === 'polyline') {
            mainCtx.strokeStyle = 'white';
            mainCtx.lineWidth = brushSize * (canvasRef.current.width / imageRef.current!.clientWidth);
            mainCtx.lineCap = 'round';
            mainCtx.lineJoin = 'round';
            mainCtx.beginPath();
            mainCtx.moveTo(pathPoints.current[0].x, pathPoints.current[0].y);
            pathPoints.current.forEach(p => mainCtx.lineTo(p.x, p.y));
            mainCtx.stroke();
        }

        pathPoints.current = [];
        overlayCtx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
        saveState();
    }, [activeTool, brushSize, saveState]);

    useEffect(() => {
      if (activeTool !== 'polygon' && activeTool !== 'polyline' && pathPoints.current.length > 0) {
        finishDrawing();
      }
    }, [activeTool, finishDrawing]);

    useImperativeHandle(ref, () => ({
        undo: () => {
            if (history.current.length > 1) {
                history.current.pop();
                const lastState = history.current[history.current.length - 1];
                const ctx = getCanvasContext(canvasRef.current);
                if (ctx && lastState) {
                    ctx.putImageData(lastState, 0, 0);
                    onMaskChange(canvasRef.current?.toDataURL('image/png') ?? null);
                }
            }
        },
        clear: () => {
            const canvas = canvasRef.current;
            const ctx = getCanvasContext(canvas);
            const overlayCtx = getCanvasContext(overlayCanvasRef.current);
            if (canvas && ctx && overlayCtx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                overlayCtx.clearRect(0, 0, canvas.width, canvas.height);
                history.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
                pathPoints.current = [];
                onMaskChange(null);
            }
        },
        loadMask: (dataUrl: string) => {
            const canvas = canvasRef.current;
            const ctx = getCanvasContext(canvas);
            const image = imageRef.current;
            if (!canvas || !ctx || !image) return;

            const img = new Image();
            img.onload = () => {
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                saveState();
            };
            img.src = dataUrl;
        },
    }));

    const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        const image = imageRef.current;
        if (!canvas || !image) return { x: 0, y: 0 };
        const rect = image.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        isDrawing.current = true;
        const coords = getCoords(e);
        const ctx = getCanvasContext(canvasRef.current);
        if (!ctx) return;

        switch(activeTool) {
            case 'brush':
                ctx.beginPath();
                ctx.moveTo(coords.x, coords.y);
                break;
            case 'line':
            case 'rectangle':
                startPoint.current = coords;
                break;
            case 'lasso':
                pathPoints.current = [coords];
                break;
        }
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        const coords = getCoords(e);
        const imageElem = imageRef.current;
        if (imageElem) {
            const rect = imageElem.getBoundingClientRect();
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            setCursorPos({ x: clientX - rect.left, y: clientY - rect.top });
        }
        
        if (!isDrawing.current) return;
        
        const mainCtx = getCanvasContext(canvasRef.current);
        const overlayCtx = getCanvasContext(overlayCanvasRef.current);
        if (!mainCtx || !overlayCtx || !canvasRef.current || !overlayCanvasRef.current) return;
        
        overlayCtx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
        
        const scaledBrushSize = brushSize * (canvasRef.current.width / imageRef.current!.clientWidth);

        switch(activeTool) {
            case 'brush':
                mainCtx.lineTo(coords.x, coords.y);
                mainCtx.strokeStyle = 'white';
                mainCtx.lineWidth = scaledBrushSize;
                mainCtx.lineCap = 'round';
                mainCtx.lineJoin = 'round';
                mainCtx.stroke();
                break;
            case 'line':
                overlayCtx.beginPath();
                overlayCtx.moveTo(startPoint.current.x, startPoint.current.y);
                overlayCtx.lineTo(coords.x, coords.y);
                overlayCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                overlayCtx.lineWidth = scaledBrushSize;
                overlayCtx.lineCap = 'round';
                overlayCtx.stroke();
                break;
            case 'rectangle':
                overlayCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                overlayCtx.fillRect(startPoint.current.x, startPoint.current.y, coords.x - startPoint.current.x, coords.y - startPoint.current.y);
                break;
            case 'lasso':
                pathPoints.current.push(coords);
                overlayCtx.beginPath();
                overlayCtx.moveTo(pathPoints.current[0].x, pathPoints.current[0].y);
                pathPoints.current.forEach(p => overlayCtx.lineTo(p.x, p.y));
                overlayCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                overlayCtx.lineWidth = 2;
                overlayCtx.stroke();
                break;
        }
    };
    
    const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing.current) return;
        isDrawing.current = false;
        
        const mainCtx = getCanvasContext(canvasRef.current);
        const overlayCtx = getCanvasContext(overlayCanvasRef.current);
        if (!mainCtx || !overlayCtx || !overlayCanvasRef.current || !canvasRef.current) return;

        overlayCtx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
        
        const scaledBrushSize = brushSize * (canvasRef.current.width / imageRef.current!.clientWidth);
        const endCoords = getCoords(e);

        switch(activeTool) {
            case 'brush':
                mainCtx.closePath();
                break;
            case 'line':
                mainCtx.beginPath();
                mainCtx.moveTo(startPoint.current.x, startPoint.current.y);
                mainCtx.lineTo(endCoords.x, endCoords.y);
                mainCtx.strokeStyle = 'white';
                mainCtx.lineWidth = scaledBrushSize;
                mainCtx.lineCap = 'round';
                mainCtx.stroke();
                break;
            case 'rectangle':
                mainCtx.fillStyle = 'white';
                mainCtx.fillRect(startPoint.current.x, startPoint.current.y, endCoords.x - startPoint.current.x, endCoords.y - startPoint.current.y);
                break;
            case 'lasso':
                if (pathPoints.current.length < 3) break;
                mainCtx.fillStyle = 'white';
                mainCtx.beginPath();
                mainCtx.moveTo(pathPoints.current[0].x, pathPoints.current[0].y);
                pathPoints.current.forEach(p => mainCtx.lineTo(p.x, p.y));
                mainCtx.closePath();
                mainCtx.fill();
                break;
        }
        pathPoints.current = [];
        saveState();
    };


    const handleCanvasClick = (e: React.MouseEvent) => {
        if (activeTool !== 'polygon' && activeTool !== 'polyline') return;
        const coords = getCoords(e);
        pathPoints.current.push(coords);
        
        const overlayCtx = getCanvasContext(overlayCanvasRef.current);
        if (!overlayCtx || !overlayCanvasRef.current) return;

        overlayCtx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
        overlayCtx.beginPath();
        overlayCtx.moveTo(pathPoints.current[0].x, pathPoints.current[0].y);
        pathPoints.current.forEach(p => overlayCtx.lineTo(p.x, p.y));
        overlayCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        overlayCtx.lineWidth = 2;
        overlayCtx.stroke();
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (activeTool === 'polygon' || activeTool === 'polyline') {
            finishDrawing();
        }
    };

    const cursorStyle = {
        brush: 'none',
        rectangle: 'crosshair',
        lasso: 'crosshair',
        polygon: 'crosshair',
        line: 'crosshair',
        polyline: 'crosshair',
    }[activeTool];

    return (
        <div 
            className="relative w-full touch-none flex items-center justify-center"
            onMouseLeave={(e) => { setCursorPos({x: -100, y: -100}); if(isDrawing.current) handleMouseUp(e as any); }}
            onMouseMove={(e) => handleMouseMove(e)}
            onMouseDown={(e) => handleMouseDown(e)}
            onMouseUp={(e) => handleMouseUp(e)}
            onTouchStart={(e) => handleMouseDown(e)}
            onTouchMove={(e) => handleMouseMove(e)}
            onTouchEnd={(e) => handleMouseUp(e)}
            onClick={handleCanvasClick}
            onDoubleClick={handleDoubleClick}
        >
            <img 
                ref={imageRef} 
                src={imageSrc} 
                alt="Input for masking" 
                className="max-w-full max-h-full object-contain rounded-md select-none pointer-events-none"
                draggable="false"
            />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-50 mix-blend-screen pointer-events-none" />
            <canvas ref={overlayCanvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />

            <div 
                className="absolute rounded-full border-2 border-[var(--accent-color)] bg-[var(--accent-color)]/30 pointer-events-none"
                style={{
                    left: cursorPos.x, top: cursorPos.y,
                    width: brushSize, height: brushSize,
                    transform: `translate(-50%, -50%)`,
                    display: activeTool === 'brush' ? 'block' : 'none',
                }}
            />
            <style>{`.touch-none { cursor: ${cursorStyle}; }`}</style>
        </div>
    );
});


const ImageUploadArea: React.FC<{
  onImageUpdate: (file: File) => void;
  label?: string;
}> = ({ onImageUpdate, label = "Kéo thả, dán, hoặc click" }) => {
  const handleFileRead = useCallback((file: File) => {
      onImageUpdate(file);
  }, [onImageUpdate]);

  return (
    <div className="relative aspect-[1.5] bg-zinc-800/50 rounded-lg border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-center transition-colors hover:border-orange-500 group cursor-pointer p-4">
        <div className="text-zinc-400">
            <p>{label}</p>
            <p className="text-xs mt-1">PNG, JPG, WEBP</p>
        </div>
      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label="Tải lên ảnh đầu vào" onChange={(e) => e.target.files && handleFileRead(e.target.files[0])} accept="image/png, image/jpeg, image/webp" />
    </div>
  );
};

const ReferenceImageUploader: React.FC<{
  image: string | null;
  onImageUpdate: (file: File) => void;
  onClear: () => void;
}> = ({ image, onImageUpdate, onClear }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageUpdate(e.target.files[0]);
        }
    };

    if (image) {
        return (
            <div className="relative group bg-zinc-900/50 p-2 rounded-lg border border-zinc-700">
                <img src={image} alt="Ảnh tham chiếu" className="w-full h-auto object-contain rounded-md" style={{ maxHeight: '180px' }} />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-zinc-800 rounded-full text-white hover:bg-[var(--accent-color)] hover:text-black transition-colors" title="Thay ảnh"><ReplaceIcon /></button>
                    <button onClick={onClear} className="p-2.5 bg-zinc-800 rounded-full text-white hover:bg-red-500 transition-colors" title="Xoá ảnh"><TrashIcon /></button>
                </div>
            </div>
        );
    }

    return (
        <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative bg-zinc-800/50 rounded-lg border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-center transition-colors hover:border-[var(--accent-color)] group cursor-pointer p-4 min-h-[120px]"
        >
            <input type="file" ref={fileInputRef} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label="Tải lên ảnh tham chiếu" onChange={handleFileChange} accept="image/*" />
            <UploadIcon />
            <p className="text-sm font-semibold text-zinc-300 mt-1">Tải ảnh vật liệu / nội thất</p>
            <p className="text-xs text-zinc-500">Kéo thả hoặc nhấn</p>
        </div>
    );
};


const ToolButton: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => (
    <button 
        onClick={onClick} 
        title={label}
        className={`p-2.5 rounded-lg transition-colors ${isActive ? 'bg-[var(--accent-color)] text-black' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
    >
        {icon}
    </button>
);

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
        <div className="bg-zinc-800 p-3 rounded-lg">
            <div className="grid grid-cols-3 gap-2">
                {furniture.map(item => (
                    <div key={item.id} className="relative group aspect-square">
                        <img 
                            src={item.processed || item.original} 
                            alt={`Furniture item`} 
                            className="w-full h-full object-contain rounded-md bg-zinc-900/50"
                        />
                        {item.isLoading && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-md">
                                <div className="w-5 h-5 border-2 border-zinc-400 border-t-[var(--accent-color)] rounded-full animate-spin"></div>
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
                    className="relative aspect-square bg-zinc-700/50 rounded-lg border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-center transition-colors hover:border-[var(--accent-color)] group cursor-pointer"
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

// --- MAIN COMPONENT ---
interface PhotoEditingToolProps {
  onBack: () => void;
}

type EditFunction = 'edit' | 'paint' | 'merge' | 'material' | 'interior' | 'character-sync' | 'completion' | 'interior-completion';

interface PaintColor {
  brand: 'Dulux' | 'Mykolor' | 'Jotun';
  name: string;
  code: string;
  hex: string;
  type: 'interior' | 'exterior' | 'both';
}

const PAINT_COLORS: PaintColor[] = [
    // Dulux Exterior
    { brand: 'Dulux', name: 'Trắng Sứ (White On White™)', code: '30GY 88/014', hex: '#F4F4EB', type: 'both' },
    { brand: 'Dulux', name: 'Xám Ghi (Grey Port)', code: '00NN 37/000', hex: '#8A8A8A', type: 'exterior' },
    { brand: 'Dulux', name: 'Vàng Kem (Pale Cream)', code: '60YY 83/160', hex: '#F7E9BE', type: 'both' },
    { brand: 'Dulux', name: 'Nâu Mật Ong (Spiced Honey)', code: '00YY 26/220', hex: '#B1884C', type: 'exterior' },
    { brand: 'Dulux', name: 'Xanh Cổ Vịt (Teal Tension)', code: '10BG 11/223', hex: '#004D54', type: 'exterior' },
    { brand: 'Dulux', name: 'Đỏ Đất (Red Ochre)', code: '10YR 17/465', hex: '#8E4A3B', type: 'exterior' },
    // Dulux Interior
    { brand: 'Dulux', name: 'Xanh Bạc Hà (Tranquil Dawn)', code: '45GY 55/052', hex: '#BFCFBA', type: 'interior' },
    { brand: 'Dulux', name: 'Xanh Dương Nhạt (First Frost)', code: '90BG 72/083', hex: '#D3E0E1', type: 'interior' },
    { brand: 'Dulux', name: 'Hồng Nâu (Heart Wood)', code: '10YR 28/072', hex: '#B9A59C', type: 'interior' },
    { brand: 'Dulux', name: 'Xanh Rêu (Kiwi Burst 3)', code: '70YY 57/333', hex: '#B6C37A', type: 'interior' },
    // Mykolor (Assuming 'both' for simplicity)
    { brand: 'Mykolor', name: 'Vàng Chanh', code: '109-4', hex: '#F9D861', type: 'both' },
    { brand: 'Mykolor', name: 'Xanh Ngọc', code: '118-2', hex: '#A3D9CC', type: 'both' },
    { brand: 'Mykolor', name: 'Hồng Phấn', code: '13-3', hex: '#F6C9C4', type: 'both' },
    { brand: 'Mykolor', name: 'Xám Xanh', code: '50-1', hex: '#A5B0B5', type: 'both' },
    { brand: 'Mykolor', name: 'Tím Cà', code: '144-4', hex: '#774F67', type: 'both' },
    { brand: 'Mykolor', name: 'Xanh Lá Mạ', code: '94-2', hex: '#C5D68F', type: 'both' },
    // Jotun
    { brand: 'Jotun', name: 'Evening Sky (Xanh Xám)', code: '4618', hex: '#A9B3B8', type: 'interior' },
    { brand: 'Jotun', name: 'Let it Green (Xanh Lá)', code: '8494', hex: '#B5C0AF', type: 'interior' },
    { brand: 'Jotun', name: 'Blushing Peach (Hồng Đào)', code: '20047', hex: '#F0D4C9', type: 'interior' },
    { brand: 'Jotun', name: 'Washed Linen (Be Sáng)', code: '10679', hex: '#EAE5DB', type: 'both' },
    { brand: 'Jotun', name: 'Telegrey (Xám Ghi)', code: '1877', hex: '#878A8D', type: 'exterior' },
    { brand: 'Jotun', name: 'Labrador (Nâu Đất)', code: '1909', hex: '#635951', type: 'exterior' },
];


interface PaintStatistic {
    brand: string;
    name: string;
    code: string;
    hex: string;
    location: string;
}

const PhotoEditingTool: React.FC<PhotoEditingToolProps> = ({ onBack }) => {
  const [activeFunction, setActiveFunction] = useState<EditFunction>('edit');
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [maskImage, setMaskImage] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(30);
  const [activeMaskTool, setActiveMaskTool] = useState<MaskTool>('brush');
  const [prompt, setPrompt] = useState('');
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOutputZoomed, setIsOutputZoomed] = useState(false);
  const [outputQuality, setOutputQuality] = useState('hd');
  const [outputSize, setOutputSize] = useState<'default' | '2x' | '4x'>('default');
  
  // Paint Tab States
  const [paintColor, setPaintColor] = useState('#F4F4EB');
  const [paintStatistics, setPaintStatistics] = useState<PaintStatistic[]>([]);
  const [imageType, setImageType] = useState<'interior' | 'exterior' | 'unknown' | 'analyzing'>('unknown');
  const [paintBrand, setPaintBrand] = useState<'Dulux' | 'Mykolor' | 'Jotun'>('Dulux');

  // Character Sync States
  const [syncContextImages, setSyncContextImages] = useState<string[]>([]);
  const [characterInputType, setCharacterInputType] = useState<'image' | 'generate'>('image');
  const [characterImage, setCharacterImage] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<string[]>([]);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  
  // New states for Character Generation
  const [characterGenPrompt, setCharacterGenPrompt] = useState('');
  const [isGeneratingCharacter, setIsGeneratingCharacter] = useState(false);
  const [isSuggestingCompletion, setIsSuggestingCompletion] = useState(false);
  
  const maskingCanvasRef = useRef<MaskingActions>(null);
  const characterFileInputRef = useRef<HTMLInputElement>(null);

  const analyzeImageType = async (dataUrl: string) => {
      setImageType('analyzing');
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: {
                  parts: [
                      dataUrlToPart(dataUrl),
                      { text: "Is this an image of an 'interior' or 'exterior' of a building? Answer only with 'interior' or 'exterior'." }
                  ]
              }
          });
          const result = response.text.trim().toLowerCase();
          if (result.includes('interior')) {
              setImageType('interior');
          } else if (result.includes('exterior')) {
              setImageType('exterior');
          } else {
              setImageType('unknown');
          }
      } catch (e) {
          console.error("Image type analysis failed:", e);
          setImageType('unknown'); // Fallback on error
      }
  };
  
  const handleImageUpdate = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setInputImage(dataUrl);
        setOutputImage(null);
        setMaskImage(null);
        setPaintStatistics([]);
        maskingCanvasRef.current?.clear();
        if (activeFunction === 'paint') {
            analyzeImageType(dataUrl);
        }
    };
    reader.readAsDataURL(file);
  }, [activeFunction]);
  
  const handleClearInput = () => {
    setInputImage(null);
    setOutputImage(null);
    setMaskImage(null);
    setPaintStatistics([]);
    maskingCanvasRef.current?.clear();
  };

  const handleReferenceImageUpdate = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        setReferenceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);
  
  useEffect(() => {
    if (activeFunction === 'merge' && inputImage && referenceImage) {
        setPrompt("Sử dụng ảnh gốc làm nền, ghép ngôi nhà từ ảnh tham chiếu vào một cách chân thực nhất. Phân tích phối cảnh, nguồn sáng và môi trường của ảnh gốc để tích hợp ngôi nhà một cách liền mạch. Tạo ra bóng đổ chính xác và điều chỉnh màu sắc của ngôi nhà cho phù hợp với môi trường xung quanh.");
    } else if (activeFunction === 'material' && maskImage && referenceImage) {
        setPrompt("Thay vật liệu trong vùng chọn bằng vật liệu từ ảnh tham chiếu.");
    }
  }, [activeFunction, inputImage, referenceImage, maskImage]);

  const dataUrlToPart = (dataUrl: string) => {
    const [header, base64Data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1];
    if (!mimeType || !base64Data) throw new Error("Invalid data URL");
    return { inlineData: { mimeType, data: base64Data } };
  };

  const handleRefineEdge = async () => {
    if (!inputImage || !maskImage || isLoading || isRefining) {
        return;
    }
    setIsRefining(true);
    setError(null);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const contentParts = [
            dataUrlToPart(inputImage),
            dataUrlToPart(maskImage),
            { text: "Refine the provided rough mask to accurately segment the main subject from the original image. Pay close attention to fine details like hair or fur. Output a clean, black-and-white mask image where white represents the selected area." }
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: contentParts },
            config: { responseModalities: [Modality.IMAGE] },
        });

        const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (part?.inlineData) {
            const refinedMask = `data:image/png;base64,${part.inlineData.data}`;
            maskingCanvasRef.current?.loadMask(refinedMask); // This will trigger onMaskChange -> setMaskImage
        } else {
            setError('Không thể tinh chỉnh vùng chọn. Vui lòng thử lại.');
        }
    } catch (e) {
        console.error(e);
        setError(`Lỗi khi tinh chỉnh: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
        setIsRefining(false);
    }
  };
  
    const generatePaintStatistics = async (baseImage: string, mask: string, colorInfo: PaintColor) => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const analysisPrompt = `Dựa trên ảnh gốc và vùng được đánh dấu trong ảnh mask, hãy mô tả ngắn gọn vị trí đang được sơn (ví dụ: "Tường mặt tiền tầng 1", "Mảng tường ban công", "Cửa sổ"). Chỉ trả về một cụm từ ngắn gọn, tối đa 5-7 từ.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        dataUrlToPart(baseImage),
                        dataUrlToPart(mask),
                        { text: analysisPrompt }
                    ]
                }
            });
            
            const location = response.text.trim();
            setPaintStatistics(prev => [...prev, { ...colorInfo, location: location || 'Không xác định' }]);

        } catch (e) {
            console.error("Lỗi khi tạo thống kê sơn:", e);
            setPaintStatistics(prev => [...prev, { ...colorInfo, location: 'Lỗi phân tích vị trí' }]);
        }
    };

    const handleCharacterImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCharacterImage(reader.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleGenerateCharacter = async () => {
        if (!characterGenPrompt) {
            setError("Vui lòng nhập mô tả nhân vật.");
            return;
        }
        setIsGeneratingCharacter(true);
        setError(null);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            // Optimized prompt for character generation to be used in synchronization
            const promptText = `Tạo hình ảnh một nhân vật: ${characterGenPrompt}. Nhân vật toàn thân, tách biệt nền (nền trắng hoặc đơn sắc), phong cách chân thực, ánh sáng tốt, độ phân giải cao 8k, chi tiết sắc nét.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: promptText }] },
                config: { responseModalities: [Modality.IMAGE] },
            });

            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part?.inlineData) {
                const generatedImage = `data:image/png;base64,${part.inlineData.data}`;
                setCharacterImage(generatedImage);
            } else {
                setError("Không thể tạo ảnh nhân vật. Vui lòng thử lại.");
            }
        } catch (e) {
            console.error(e);
            setError(`Lỗi tạo nhân vật: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
        } finally {
            setIsGeneratingCharacter(false);
        }
    };

    const handleSuggestCompletion = async () => {
        if (!inputImage) {
            setError(activeFunction === 'completion' ? "Vui lòng tải lên ảnh công trình đang dang dở." : "Vui lòng tải lên ảnh phòng trống.");
            return;
        }
        setIsSuggestingCompletion(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = dataUrlToPart(inputImage);
            let promptText = "";

            if (activeFunction === 'completion') {
                promptText = "Hãy đóng vai kiến trúc sư. Phân tích hình ảnh công trình xây dựng đang dang dở này. Đề xuất phương án hoàn thiện ngoại thất đẹp, hiện đại và viết một đoạn mô tả (prompt) chi tiết bằng tiếng Việt để tạo ảnh hoàn thiện. Mô tả kỹ về vật liệu, màu sắc, ánh sáng và cảnh quan sân vườn. Viết dưới dạng một đoạn văn mô tả hình ảnh.";
            } else {
                 promptText = "Hãy đóng vai nhà thiết kế nội thất. Phân tích hình ảnh căn phòng thô (hoặc trống) này. Đề xuất phương án hoàn thiện nội thất đẹp, sang trọng, phù hợp với không gian và viết một đoạn mô tả (prompt) chi tiết bằng tiếng Việt để tạo ảnh render nội thất hoàn chỉnh. Mô tả kỹ về phong cách, màu sắc, đồ đạc, ánh sáng, rèm cửa, thảm và vật liệu sàn/tường/trần. Viết dưới dạng một đoạn văn mô tả hình ảnh.";
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, { text: promptText }] },
            });

            setPrompt(response.text.trim());
        } catch (e) {
            console.error(e);
            setError("Không thể tạo gợi ý hoàn thiện. Vui lòng thử lại.");
        } finally {
            setIsSuggestingCompletion(false);
        }
    };


  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setOutputImage(null);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    if (activeFunction === 'character-sync') {
        if (syncContextImages.length === 0) {
            setError('Vui lòng tải lên ít nhất một ảnh bối cảnh.');
            setIsLoading(false);
            return;
        }
        if (characterInputType === 'image' && !characterImage) {
            setError('Vui lòng tải lên ảnh nhân vật.');
            setIsLoading(false);
            return;
        }
        if (characterInputType === 'generate' && !characterImage) {
             setError('Vui lòng tạo ảnh nhân vật trước khi đồng bộ.');
             setIsLoading(false);
             return;
        }

        setSyncResults([]);
        setSyncProgress({ current: 0, total: syncContextImages.length });

        try {
             for (let i = 0; i < syncContextImages.length; i++) {
                const bgImage = syncContextImages[i];
                setSyncProgress({ current: i + 1, total: syncContextImages.length });
                
                // New context-aware artistic prompt
                let promptText = `Analyze the background image to understand its lighting, shadows, perspective, and mood. Seamlessly integrate the provided character into this scene. The result must be a professional art photography masterpiece, with perfect composition, depth of field, and color grading matching the background. Ensure the character's pose and interaction look natural within the specific context of the background. High quality, 8k resolution, hyperrealistic.`;
                
                const contentParts = [];
                contentParts.push(dataUrlToPart(bgImage));
                
                if (characterImage) {
                    contentParts.push(dataUrlToPart(characterImage));
                }
                
                contentParts.push({ text: promptText });
                
                try {
                     const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash-image',
                        contents: { parts: contentParts },
                        config: { responseModalities: [Modality.IMAGE] },
                    });

                    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                    if (part?.inlineData) {
                        const newImage = `data:image/png;base64,${part.inlineData.data}`;
                        setSyncResults(prev => [...prev, newImage]);
                    } else {
                        console.warn(`Failed to generate image for context ${i + 1}`);
                    }
                } catch (innerError) {
                    console.error(`Error generating for image ${i}:`, innerError);
                }
             }
        } catch (e) {
             console.error(e);
             setError(`Lỗi đồng bộ: ${e instanceof Error ? e.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
        return;
    }

    // --- SINGLE IMAGE GENERATION ---
    if (!inputImage) {
        setError('Vui lòng tải lên một hình ảnh để chỉnh sửa.');
        setIsLoading(false);
        return;
    }

    if (activeFunction !== 'paint' && activeFunction !== 'completion' && activeFunction !== 'interior-completion' && activeFunction !== 'interior' && !prompt.trim()) {
      setError('Vui lòng nhập mô tả cho việc chỉnh sửa.');
      setIsLoading(false);
      return;
    }

    try {
        let finalPrompt = prompt;

        const qualityBooster = 'Ultra realistic, hyper-detailed, 8K resolution, photorealistic masterpiece, ultra sharp focus, high dynamic range, cinematic lighting, perfect composition, volumetric light, physically accurate texture, ultra-high-definition, detailed skin pores and materials, natural shadows, true-to-life colors, incredibly detailed, depth of field, high clarity, realistic contrast, fine detail, rich tones, professional photography, award-winning photo';

        if (activeFunction === 'paint') {
            const selectedColorInfo = PAINT_COLORS.find(c => c.hex.toLowerCase() === paintColor.toLowerCase());
            if (!selectedColorInfo) {
                throw new Error("Màu sơn không hợp lệ.");
            }
            finalPrompt = `Sơn lại khu vực đã chọn bằng màu ${selectedColorInfo.name} (${selectedColorInfo.code}) từ hãng ${selectedColorInfo.brand}. Bề mặt sơn phải che phủ hoàn toàn vật liệu gốc, tạo ra một bề mặt sơn thực tế. Giữ lại ánh sáng và bóng đổ tự nhiên của ảnh gốc để trông thật nhất có thể. ${prompt}`;
        } else if (activeFunction === 'completion') {
             finalPrompt = `Dựa trên ảnh hiện trạng công trình thô, hãy tạo ra hình ảnh hoàn thiện (render) thực tế. Chi tiết hoàn thiện: ${prompt || 'Phong cách hiện đại, sang trọng'}. Giữ nguyên góc chụp và cấu trúc chính.`;
        } else if (activeFunction === 'interior-completion') {
             finalPrompt = `Dựa trên ảnh hiện trạng căn phòng thô, hãy tạo ra hình ảnh nội thất hoàn thiện (render) thực tế, đẹp mắt. Chi tiết thiết kế: ${prompt || 'Phong cách nội thất hiện đại, ấm cúng'}. Giữ nguyên góc chụp và cấu trúc tường/sàn/trần. Lấp đầy không gian bằng đồ nội thất phù hợp.`;
        } else if (activeFunction === 'interior') {
            const hasFurniture = looseFurniture.some(f => f.processed);
            if (!hasFurniture) {
                setError('Vui lòng tải lên ít nhất một món đồ nội thất và chờ xử lý xong.');
                setIsLoading(false);
                return;
            }
            finalPrompt = `Sử dụng các món đồ nội thất được cung cấp (với nền trong suốt) để đặt vào trong ảnh phòng. ${prompt || 'Hãy sắp xếp chúng một cách tự nhiên và hợp lý.'}`;
            if (maskImage) {
                finalPrompt += ' Vùng được đánh dấu (mask) có thể được dùng làm gợi ý cho vị trí đặt đồ.'
            }
        }

        if (outputQuality === 'hd') {
            finalPrompt += ', high quality, detailed, 4k resolution';
        }
        
        const sizePrompt = {
            'default': '',
            '2x': ', 2x upscale',
            '4x': ', 4x upscale, ultra high resolution'
        }[outputSize];
        
        finalPrompt += sizePrompt;
        finalPrompt += `, ${qualityBooster}`;

        const contentParts = [];
        contentParts.push(dataUrlToPart(inputImage));
        
        if (maskImage && (activeFunction === 'edit' || activeFunction === 'material' || activeFunction === 'paint' || activeFunction === 'interior')) {
            contentParts.push(dataUrlToPart(maskImage));
        }
        if (referenceImage && (activeFunction === 'merge' || activeFunction === 'material')) {
            contentParts.push(dataUrlToPart(referenceImage));
        }
        if (activeFunction === 'interior') {
            looseFurniture.forEach(item => {
                if (item.processed) {
                    contentParts.push(dataUrlToPart(item.processed));
                }
            });
        }

        contentParts.push({ text: finalPrompt });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: contentParts },
            config: { responseModalities: [Modality.IMAGE] },
        });

        const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (part?.inlineData) {
            const newImage = `data:image/png;base64,${part.inlineData.data}`;
            setOutputImage(newImage);
            
            if (activeFunction === 'paint' && maskImage) {
                const selectedColorInfo = PAINT_COLORS.find(c => c.hex.toLowerCase() === paintColor.toLowerCase());
                if(selectedColorInfo) {
                    generatePaintStatistics(inputImage, maskImage, selectedColorInfo);
                }
            }
        } else {
            setError('Không thể tạo ảnh từ phản hồi của AI. Vui lòng thử lại với một mô tả khác.');
        }
    } catch (e) {
        console.error(e);
        setError(`Đã xảy ra lỗi: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleUseAsInput = () => {
      if (outputImage) {
          setInputImage(outputImage);
          setOutputImage(null);
          setReferenceImage(null);
          setPaintStatistics([]);
          maskingCanvasRef.current?.clear();
          alert("Đã đưa ảnh kết quả về làm ảnh đầu vào cho lần chỉnh sửa tiếp theo.");
      }
  };
  
  const handleDownloadImage = (urlToDownload: string | null) => {
      const target = urlToDownload || outputImage;
      if (!target) return;
      const link = document.createElement('a');
      link.href = target;
      link.download = `ctai-edit-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };
  
  const functionDescriptions = {
      edit: "Xóa hoặc thay thế đối tượng trong ảnh bằng cách vẽ vùng chọn và nhập mô tả.",
      paint: "Chọn vùng tường và thử các màu sơn chính hãng cho ngôi nhà của bạn.",
      merge: "Ghép một ngôi nhà từ ảnh tham chiếu vào ảnh hiện trạng.",
      material: "Chọn một vùng và thay thế vật liệu bằng ảnh tham chiếu.",
      interior: "Thêm đồ nội thất (đã được tự động tách nền) vào không gian phòng.",
      'character-sync': "Đồng bộ hóa một nhân vật vào nhiều bối cảnh khác nhau.",
      completion: "Biến ảnh công trình xây dựng dang dở thành ảnh hoàn thiện thực tế.",
      'interior-completion': "Biến ảnh phòng thô thành ảnh nội thất hoàn thiện.",
  }

  const promptPlaceholder = useMemo(() => {
    if (activeFunction === 'paint') return 'Mô tả thêm về loại sơn (VD: sơn bóng, sơn mịn...)';
    if (activeFunction === 'merge' || activeFunction === 'material') return 'Mô tả này sẽ được AI ưu tiên khi kết hợp ảnh.';
    if (activeFunction === 'interior') return 'VD: Đặt ghế sofa gần cửa sổ, thêm bàn trà...';
    if (activeFunction === 'completion') return 'VD: Hoàn thiện công trình theo phong cách hiện đại, tường trắng, mái ngói đỏ...';
    if (activeFunction === 'interior-completion') return 'VD: Hoàn thiện nội thất căn phòng theo phong cách Indochine...';
    if (maskImage) return "Mô tả thay đổi cho vùng đã chọn";
    return "VD: Thêm một con mèo đang ngủ trên ghế sofa";
  }, [activeFunction, maskImage]);

  // --- LOOSE FURNITURE LOGIC FOR 'interior' TAB ---
  const [looseFurniture, setLooseFurniture] = useState<LooseFurniture[]>([]);

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
  
  useEffect(() => {
    // Clear furniture when switching away from the interior tab
    setLooseFurniture([]);
  }, [activeFunction]);


  const FunctionButton: React.FC<{label: string, id: EditFunction}> = ({ label, id }) => (
    <button
        onClick={() => {
            setActiveFunction(id);
            setPrompt(''); // Clear prompt on function change
            if (id === 'paint' && inputImage && imageType === 'unknown') {
                analyzeImageType(inputImage);
            }
        }}
        className={`px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
            activeFunction === id
                ? 'bg-orange-600 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
        }`}
    >
        {label}
    </button>
  );
  
  const displayedPaintColors = useMemo(() => {
      const filteredByBrand = PAINT_COLORS.filter(c => c.brand === paintBrand);
      if (imageType === 'interior') {
          return filteredByBrand.filter(c => c.type === 'interior' || c.type === 'both');
      }
      if (imageType === 'exterior') {
          return filteredByBrand.filter(c => c.type === 'exterior' || c.type === 'both');
      }
      return filteredByBrand; // Show all for 'unknown' or 'analyzing'
  }, [paintBrand, imageType]);

  return (
    <div className="w-full h-full flex flex-col animate-fade-in bg-zinc-900/95 text-zinc-100">
        <header className="flex items-center justify-between p-4 border-b border-zinc-800 flex-shrink-0">
            <h1 className="text-xl font-bold text-white">AI Chỉnh sửa ảnh & Tạo LoRA</h1>
            <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors" aria-label="Quay lại">
                <BackIcon className="h-5 w-5" />
                <span>Quay lại</span>
            </button>
        </header>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
            <aside className="p-6 flex flex-col overflow-y-auto bg-zinc-900/30">
                <div className="space-y-6">
                    <section>
                        <h2 className="text-lg font-semibold text-zinc-100 mb-3">1. Chọn chức năng</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                           <FunctionButton label="Sửa vùng chọn" id="edit" />
                           <FunctionButton label="Sơn nhà" id="paint" />
                           <FunctionButton label="Ghép nhà" id="merge" />
                           <FunctionButton label="Thay vật liệu" id="material" />
                           <FunctionButton label="Thay nội thất" id="interior" />
                           <FunctionButton label="Đồng bộ nhân vật" id="character-sync" />
                           <FunctionButton label="Hoàn thiện nhà" id="completion" />
                           <FunctionButton label="Hoàn thiện nội thất" id="interior-completion" />
                        </div>
                        <p className="text-zinc-400 text-sm mt-3">
                           {functionDescriptions[activeFunction]}
                        </p>
                    </section>
                    
                    {activeFunction === 'character-sync' ? (
                        <div className="space-y-6 animate-fade-in">
                            <section>
                                <h2 className="text-lg font-semibold text-zinc-100 mb-3">2. Tải các bối cảnh</h2>
                                <MultiImageUploadArea images={syncContextImages} onImagesUpdate={setSyncContextImages} />
                            </section>
                            <section>
                                <h2 className="text-lg font-semibold text-zinc-100 mb-3">3. Thông tin nhân vật</h2>
                                <div className="flex bg-zinc-800 p-1 rounded-lg mb-3">
                                    <button onClick={() => setCharacterInputType('image')} className={`flex-1 py-2 text-sm rounded-md transition-colors ${characterInputType === 'image' ? 'bg-[var(--accent-color)] text-black font-bold' : 'text-zinc-400 hover:text-white'}`}>Hình ảnh</button>
                                    <button onClick={() => setCharacterInputType('generate')} className={`flex-1 py-2 text-sm rounded-md transition-colors ${characterInputType === 'generate' ? 'bg-[var(--accent-color)] text-black font-bold' : 'text-zinc-400 hover:text-white'}`}>Tạo ảnh</button>
                                </div>
                                {characterInputType === 'image' ? (
                                    characterImage ? (
                                        <div className="relative group bg-zinc-800 p-2 rounded-lg">
                                            <img src={characterImage} alt="Character" className="w-full h-40 object-contain rounded-md" />
                                            <button onClick={() => setCharacterImage(null)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"><TrashIcon /></button>
                                        </div>
                                    ) : (
                                        <div onClick={() => characterFileInputRef.current?.click()} className="relative h-40 bg-zinc-800/50 border-2 border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[var(--accent-color)]">
                                            <UploadIcon />
                                            <p className="text-xs text-zinc-500 mt-2">Tải ảnh nhân vật</p>
                                            <input type="file" ref={characterFileInputRef} onChange={handleCharacterImageUpload} accept="image/*" className="hidden" />
                                        </div>
                                    )
                                ) : (
                                    // Generate Mode
                                    <div className="space-y-3">
                                         {characterImage ? (
                                            <div className="relative group bg-zinc-800 p-2 rounded-lg">
                                                <img src={characterImage} alt="Generated Character" className="w-full h-40 object-contain rounded-md" />
                                                <button onClick={() => setCharacterImage(null)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600" title="Xóa và tạo lại"><TrashIcon /></button>
                                            </div>
                                        ) : (
                                            <>
                                                <textarea 
                                                    value={characterGenPrompt} 
                                                    onChange={(e) => setCharacterGenPrompt(e.target.value)} 
                                                    placeholder="Mô tả nhân vật bạn muốn tạo (VD: Một chiến binh robot tương lai...)"
                                                    className="w-full h-24 bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-200 focus:border-[var(--accent-color)] focus:ring-0 outline-none resize-none"
                                                />
                                                <button 
                                                    onClick={handleGenerateCharacter} 
                                                    disabled={isGeneratingCharacter || !characterGenPrompt}
                                                    className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:bg-zinc-600 disabled:cursor-not-allowed"
                                                >
                                                    {isGeneratingCharacter ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="h-4 w-4" />}
                                                    {isGeneratingCharacter ? 'Đang tạo...' : 'Tạo nhân vật'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </section>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <section>
                                <h2 className="text-lg font-semibold text-zinc-100 mb-3">
                                    {activeFunction === 'completion' ? '2. Tải Ảnh Công Trình Đang Dở' : (activeFunction === 'interior-completion' ? '2. Tải Lên Ảnh Phòng Trống' : '2. Tải ảnh')}
                                </h2>
                                {inputImage ? (
                                    <div className="relative group bg-zinc-900/50 p-2 rounded-lg border border-zinc-700">
                                        <img src={inputImage} alt="Ảnh đầu vào" className="w-full h-auto object-contain rounded-md" style={{ maxHeight: '180px' }} />
                                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button onClick={handleClearInput} className="p-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors" title="Xoá ảnh">
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <ImageUploadArea onImageUpdate={handleImageUpdate} label={activeFunction === 'interior-completion' ? 'Tải ảnh phòng thô/trống' : undefined} />
                                )}
                            </section>
                            
                            {inputImage && (
                                <>
                                    {(activeFunction === 'edit' || activeFunction === 'paint' || activeFunction === 'material' || activeFunction === 'interior') && (
                                        <section>
                                            <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Công cụ chọn vùng</h2>
                                            <div className="flex items-center justify-center flex-wrap gap-2 bg-zinc-800 p-2 rounded-lg mb-4">
                                                <ToolButton icon={<BrushIcon />} label="Vẽ" isActive={activeMaskTool === 'brush'} onClick={() => setActiveMaskTool('brush')} />
                                                <ToolButton icon={<RectangleIcon />} label="Chữ nhật" isActive={activeMaskTool === 'rectangle'} onClick={() => setActiveMaskTool('rectangle')} />
                                                <ToolButton icon={<LassoIcon />} label="Lasso" isActive={activeMaskTool === 'lasso'} onClick={() => setActiveMaskTool('lasso')} />
                                                <ToolButton icon={<PolygonIcon />} label="Đa giác" isActive={activeMaskTool === 'polygon'} onClick={() => setActiveMaskTool('polygon')} />
                                                <ToolButton icon={<LineIcon />} label="Đường thẳng" isActive={activeMaskTool === 'line'} onClick={() => setActiveMaskTool('line')} />
                                                <ToolButton icon={<PolylineIcon />} label="Đường gấp khúc" isActive={activeMaskTool === 'polyline'} onClick={() => setActiveMaskTool('polyline')} />
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="brushSize" className="flex justify-between text-sm font-medium text-zinc-300 mb-2"><span>{activeMaskTool === 'brush' ? 'Kích thước bút vẽ' : 'Độ dày đường kẻ'}</span><span className="text-zinc-400">{brushSize}px</span></label>
                                                <input id="brushSize" type="range" min="5" max="100" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]" />
                                            </div>
                                            
                                            <div className="flex gap-2 mt-3">
                                                <button onClick={() => maskingCanvasRef.current?.undo()} className="flex-1 flex items-center justify-center gap-2 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold py-2 rounded-lg transition-colors"><UndoIcon /> Hoàn tác</button>
                                                <button onClick={() => maskingCanvasRef.current?.clear()} className="flex-1 flex items-center justify-center gap-2 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold py-2 rounded-lg transition-colors"><TrashIcon /> Xóa</button>
                                                <button onClick={handleRefineEdge} disabled={!maskImage || isLoading || isRefining} className="flex-1 flex items-center justify-center gap-2 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold py-2 rounded-lg transition-colors disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed">
                                                    {isRefining ? <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon />} Tinh chỉnh
                                                </button>
                                            </div>
                                        </section>
                                    )}

                                    {activeFunction === 'paint' && (
                                        <section>
                                            <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">3. Chọn màu sơn</h2>
                                            <div className="bg-zinc-800 p-4 rounded-lg">
                                                <div className="flex bg-zinc-700/50 p-1 rounded-lg mb-4">
                                                    {(['Dulux', 'Mykolor', 'Jotun'] as const).map(brand => (
                                                        <button key={brand} onClick={() => setPaintBrand(brand)} className={`flex-1 text-center text-xs font-semibold py-2 rounded-md transition-colors ${paintBrand === brand ? 'bg-yellow-400 text-black' : 'text-zinc-300'}`}>{brand}</button>
                                                    ))}
                                                </div>
                                                
                                                {imageType === 'analyzing' ? (
                                                    <p className="text-xs text-center text-zinc-400 py-4">Đang phân tích loại ảnh...</p>
                                                ) : (
                                                    <div className="grid grid-cols-6 gap-3 max-h-40 overflow-y-auto pr-2">
                                                        {displayedPaintColors.map(color => (
                                                            <div key={color.code} className="group relative">
                                                                <button
                                                                    onClick={() => setPaintColor(color.hex)}
                                                                    className={`w-full aspect-square rounded-full transition-transform hover:scale-110 border-2 border-transparent ${paintColor.toLowerCase() === color.hex.toLowerCase() ? 'ring-2 ring-offset-2 ring-offset-zinc-800 ring-white' : ''}`}
                                                                    style={{ backgroundColor: color.hex }}
                                                                />
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max p-2 bg-black/80 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                                    {color.name}<br/>({color.code})
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                <div className="mt-4 flex items-center gap-3 border-t border-zinc-700 pt-4">
                                                    <div className="relative w-10 h-10 rounded-full border-2 border-zinc-600 flex-shrink-0" style={{ backgroundColor: paintColor }}/>
                                                    <div className="flex-1 min-w-0">
                                                         <p className="text-xs text-zinc-400 truncate">{PAINT_COLORS.find(c => c.hex.toLowerCase() === paintColor.toLowerCase())?.name || 'Màu tùy chỉnh'}</p>
                                                         <p className="font-mono text-sm text-white truncate">{PAINT_COLORS.find(c => c.hex.toLowerCase() === paintColor.toLowerCase())?.code || paintColor.toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    )}
                                    
                                    {(activeFunction === 'merge' || activeFunction === 'material') && (
                                        <section>
                                            <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">3. Tải ảnh tham chiếu</h2>
                                            <ReferenceImageUploader image={referenceImage} onImageUpdate={handleReferenceImageUpdate} onClear={() => setReferenceImage(null)} />
                                        </section>
                                    )}

                                    {activeFunction === 'interior' && (
                                        <section>
                                            <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">3. Thêm đồ nội thất</h2>
                                            <p className="text-xs text-zinc-500 mb-2">Tải lên ảnh đồ nội thất. AI sẽ tự động xóa nền.</p>
                                            <LooseFurnitureUploader 
                                                furniture={looseFurniture}
                                                onUpload={handleLooseFurnitureUpload}
                                                onRemove={handleRemoveLooseFurniture}
                                            />
                                        </section>
                                    )}
                                    
                                    {(activeFunction === 'completion' || activeFunction === 'interior-completion') && (
                                        <section>
                                            <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">3. Tạo Gợi Ý Hoàn Thiện</h2>
                                            <button 
                                                onClick={handleSuggestCompletion} 
                                                disabled={isSuggestingCompletion}
                                                className="w-full mb-3 flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSuggestingCompletion ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Đang phân tích...
                                                    </>
                                                ) : (
                                                    <>
                                                        <SparklesIcon />
                                                        Tạo Gợi Ý Từ AI
                                                    </>
                                                )}
                                            </button>
                                        </section>
                                    )}

                                    <section>
                                        <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
                                            {activeFunction === 'completion' || activeFunction === 'interior-completion' ? 'Hoặc Nhập Mô Tả' : '4. Mô tả chỉnh sửa'}
                                        </h2>
                                        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={promptPlaceholder} rows={3} disabled={activeFunction === 'merge' || activeFunction === 'material'} className={`w-full text-zinc-300 placeholder-zinc-500 p-4 rounded-lg border-2 border-zinc-700/80 focus:border-[var(--accent-color)] focus:ring-0 outline-none transition-colors resize-none text-sm bg-zinc-800 disabled:bg-zinc-700/50 disabled:cursor-not-allowed`} />
                                    </section>

                                    <section className="space-y-3">
                                        <h2 className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wider">5. Tùy chọn đầu ra</h2>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-300 mb-2">Chất lượng</label>
                                            <div className="flex bg-zinc-800 p-1 rounded-lg">
                                                <button onClick={() => setOutputQuality('standard')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${outputQuality === 'standard' ? 'bg-[var(--accent-color)] text-black' : 'text-zinc-300 hover:bg-zinc-700'}`}>Tiêu chuẩn</button>
                                                <button onClick={() => setOutputQuality('hd')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${outputQuality === 'hd' ? 'bg-[var(--accent-color)] text-black' : 'text-zinc-300 hover:bg-zinc-700'}`}>Chất lượng cao</button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-300 mb-2">Kích thước</label>
                                            <div className="flex bg-zinc-800 p-1 rounded-lg">
                                                <button onClick={() => setOutputSize('default')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${outputSize === 'default' ? 'bg-[var(--accent-color)] text-black' : 'text-zinc-300 hover:bg-zinc-700'}`}>Mặc định</button>
                                                <button onClick={() => setOutputSize('2x')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${outputSize === '2x' ? 'bg-[var(--accent-color)] text-black' : 'text-zinc-300 hover:bg-zinc-700'}`}>2x</button>
                                                 <button onClick={() => setOutputSize('4x')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${outputSize === '4x' ? 'bg-[var(--accent-color)] text-black' : 'text-zinc-300 hover:bg-zinc-700'}`}>4x</button>
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <footer className="mt-auto pt-6">
                    <button onClick={handleGenerate} className="w-full bg-[var(--accent-color)] text-black font-bold py-3.5 px-10 rounded-xl hover:brightness-95 transition-all text-base shadow-lg hover:shadow-[var(--accent-color)]/20 disabled:bg-zinc-600 disabled:text-zinc-400 disabled:cursor-not-allowed" disabled={isLoading || isRefining}>
                        {isLoading ? (activeFunction === 'character-sync' ? 'Đang xử lý...' : 'Đang xử lý...') : (
                            activeFunction === 'character-sync' ? `Đồng bộ ${syncContextImages.length} ảnh` : 
                            (activeFunction === 'completion' || activeFunction === 'interior-completion') ? 'Hoàn Thiện' : 'Tạo 1 ảnh'
                        )}
                    </button>
                </footer>
            </aside>
            
            <main className="flex-1 flex flex-col items-center justify-center p-8 bg-black/40 overflow-hidden relative">
                {activeFunction === 'character-sync' ? (
                    <div className="w-full h-full flex flex-col">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center h-full">
                                <LoadingSpinner text={`Đang đồng bộ ${syncProgress.current}/${syncProgress.total}`} />
                            </div>
                        )}
                        {!isLoading && error && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <ErrorIcon />
                                <p className="text-red-500 mt-2">{error}</p>
                            </div>
                        )}
                        {!isLoading && !error && syncResults.length === 0 && (
                             <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500">
                                <PlaceholderIcon />
                                <h2 className="text-xl font-semibold text-zinc-300">Đồng bộ nhân vật</h2>
                                <p className="mt-1">Kết quả đồng bộ sẽ xuất hiện ở đây.</p>
                            </div>
                        )}
                        {!isLoading && syncResults.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full h-full overflow-y-auto p-4">
                                {syncResults.map((img, idx) => (
                                    <div key={idx} className="relative group aspect-video bg-zinc-800 rounded-lg overflow-hidden">
                                        <img src={img} alt={`Sync result ${idx + 1}`} className="w-full h-full object-cover" onClick={() => { setOutputImage(img); setIsOutputZoomed(true); }} />
                                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setOutputImage(img); setIsOutputZoomed(true); }} className="p-2 bg-black/60 text-white rounded-full hover:bg-[var(--accent-color)] hover:text-black"><ZoomIcon /></button>
                                            <button onClick={() => handleDownloadImage(img)} className="p-2 bg-black/60 text-white rounded-full hover:bg-[var(--accent-color)] hover:text-black"><DownloadIcon /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col w-full h-full">
                        <div className="flex-1 flex items-center justify-center relative">
                            {isLoading ? (
                                <LoadingSpinner />
                            ) : error ? (
                                <div className="text-center text-red-500 flex flex-col items-center">
                                    <ErrorIcon />
                                    <h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2>
                                    <p className="mt-1 max-w-md">{error}</p>
                                </div>
                            ) : outputImage ? (
                                <div className="w-full h-full flex items-center justify-center relative group/output">
                                    <img src={outputImage} alt="AI Edited Result" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"/>
                                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover/output:opacity-100 transition-opacity">
                                        <button onClick={() => setIsOutputZoomed(true)} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-[var(--accent-color)] hover:text-black transition-colors" title="Phóng to"><ZoomIcon /></button>
                                        <button onClick={handleUseAsInput} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-[var(--accent-color)] hover:text-black transition-colors" title="Sử dụng làm ảnh đầu vào"><SendToInputIcon /></button>
                                        <button onClick={() => handleDownloadImage(null)} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-[var(--accent-color)] hover:text-black transition-colors" title="Tải xuống"><DownloadIcon /></button>
                                    </div>
                                </div>
                            ) : inputImage ? (
                                <MaskingComponent 
                                    ref={maskingCanvasRef} 
                                    imageSrc={inputImage} 
                                    brushSize={brushSize} 
                                    onMaskChange={setMaskImage} 
                                    activeTool={activeMaskTool} 
                                />
                            ) : (
                                <div className="text-center text-zinc-500 flex flex-col items-center">
                                    <PlaceholderIcon />
                                    <h2 className="text-xl font-semibold text-zinc-300">
                                        {activeFunction === 'completion' ? 'Kết quả Hoàn thiện' : (activeFunction === 'interior-completion' ? 'Kết quả Hoàn thiện Nội thất' : 'Kết quả chỉnh sửa')}
                                    </h2>
                                    <p className="mt-1">
                                        {activeFunction === 'completion' || activeFunction === 'interior-completion' ? 'Ảnh hoàn thiện sẽ xuất hiện ở đây.' : 'Ảnh đã chỉnh sửa của bạn sẽ xuất hiện ở đây.'}
                                    </p>
                                </div>
                            )}
                        </div>
                        {activeFunction === 'paint' && paintStatistics.length > 0 && (
                            <div className="mt-4 bg-zinc-800 p-4 rounded-lg animate-fade-in flex-shrink-0">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Bảng thống kê màu sơn</h3>
                                    <button onClick={() => setPaintStatistics([])} className="text-xs text-red-400 hover:text-red-300">Xóa bảng</button>
                                </div>
                                <div className="max-h-32 overflow-y-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="border-b border-zinc-700">
                                                <th className="py-2 px-2 text-zinc-300">Màu sơn</th>
                                                <th className="py-2 px-2 text-zinc-300">Mã số</th>
                                                <th className="py-2 px-2 text-zinc-300">Vị trí</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paintStatistics.map((item, index) => (
                                                <tr key={index} className="border-b border-zinc-700/50 last:border-b-0">
                                                    <td className="py-2 px-2 flex items-center gap-2 text-zinc-200">
                                                        <span className="w-4 h-4 rounded-full border border-zinc-500" style={{ backgroundColor: item.hex }}></span>
                                                        <span>{item.name}</span>
                                                    </td>
                                                    <td className="py-2 px-2 font-mono text-zinc-400">{item.code}</td>
                                                    <td className="py-2 px-2 text-zinc-300">{item.location}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
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

export default PhotoEditingTool;
