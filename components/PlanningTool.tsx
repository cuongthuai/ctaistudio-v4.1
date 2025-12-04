import React, { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { BackIcon } from './icons/ChatIcons';

// --- ICONS ---
const CloseIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const UploadIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-500 group-hover:text-yellow-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>);
const PlaceholderIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-zinc-500 dark:text-zinc-600 my-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const LoadingSpinner: React.FC = () => ( <div role="status" className="flex flex-col items-center text-center text-zinc-500 dark:text-zinc-400"><svg aria-hidden="true" className="w-12 h-12 mb-4 text-zinc-200 dark:text-zinc-600 animate-spin fill-yellow-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg><h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-300">Đang xử lý...</h2><p className="mt-1">AI đang làm việc, vui lòng chờ.</p><span className="sr-only">Loading...</span></div>);
const ErrorIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const ZoomIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.086V3a1 1 0 112 0v8.086l1.293-1.379a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const SendToInputIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>;
const MapPinIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 21l-4.95-6.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>);
const BrushIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const PaintBucketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M2 5.621a1 1 0 011.18-.992l11.352 1.514A1 1 0 0115.5 7.135V15a1 1 0 01-1 1H5a1 1 0 01-1-1V5.621zM4 14h10V8.865l-9.81-.327A1 1 0 014 8.53v5.47zm2-3.5a.5.5 0 000 1h4a.5.5 0 000-1H6z" clip-rule="evenodd" /><path d="M17.5 7.135a1 1 0 01-1.99.134L14.47 4.79A1 1 0 0115.46 3.21l1.03 2.576a1 1 0 011.01 1.349z" /></svg>;
const UndoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l4-4m-4 4l4 4" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;


// --- HELPER COMPONENTS ---

interface DrawingActions { undo: () => void; clear: () => void; }

const DrawingCanvas = forwardRef<DrawingActions, {
    imageSrc: string;
    tool: 'brush' | 'fill';
    color: string;
    brushSize: number;
    onDrawingChange: (dataUrl: string | null) => void;
}>(({ imageSrc, tool, color, brushSize, onDrawingChange }, ref) => {
    const imageRef = useRef<HTMLImageElement>(null);
    const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const history = useRef<ImageData[]>([]);

    const getCanvasContext = (canvas: HTMLCanvasElement | null) => canvas?.getContext('2d', { willReadFrequently: true });

    const setCanvasSizes = useCallback(() => {
        const image = imageRef.current;
        const canvas = drawingCanvasRef.current;
        if (image && canvas) {
            const { naturalWidth, naturalHeight } = image;
            if (canvas.width !== naturalWidth || canvas.height !== naturalHeight) {
                canvas.width = naturalWidth;
                canvas.height = naturalHeight;
                history.current = [];
                saveState();
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
        const canvas = drawingCanvasRef.current;
        const ctx = getCanvasContext(canvas);
        if (ctx && canvas) {
            history.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            if (history.current.length > 20) history.current.shift();
            
            const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
            const isEmpty = !pixelBuffer.some(color => (color & 0xff000000) > 0);
            onDrawingChange(isEmpty ? null : canvas.toDataURL('image/png'));
        }
    }, [onDrawingChange]);

    useImperativeHandle(ref, () => ({
        undo: () => {
            if (history.current.length > 1) {
                history.current.pop();
                const lastState = history.current[history.current.length - 1];
                const ctx = getCanvasContext(drawingCanvasRef.current);
                if (ctx && lastState) {
                    ctx.putImageData(lastState, 0, 0);
                    onDrawingChange(drawingCanvasRef.current?.toDataURL('image/png') ?? null);
                }
            }
        },
        clear: () => {
            const canvas = drawingCanvasRef.current;
            const ctx = getCanvasContext(canvas);
            if (canvas && ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                history.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
                onDrawingChange(null);
            }
        },
    }));

    const getCoords = (e: React.MouseEvent) => {
        const canvas = drawingCanvasRef.current;
        const image = imageRef.current;
        if (!canvas || !image) return { x: 0, y: 0 };
        const rect = image.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    };

    const floodFill = (startX: number, startY: number) => {
        const dCtx = getCanvasContext(drawingCanvasRef.current);
        if (!dCtx || !imageRef.current) return;
        const { width, height } = dCtx.canvas;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tCtx = tempCanvas.getContext('2d');
        if(!tCtx) return;
        tCtx.drawImage(imageRef.current, 0, 0, width, height);
        
        const drawingData = dCtx.getImageData(0, 0, width, height);
        const sourceData = tCtx.getImageData(0, 0, width, height);
        
        const startPos = (Math.round(startY) * width + Math.round(startX)) * 4;
        const startR = sourceData.data[startPos];
        const startG = sourceData.data[startPos+1];
        const startB = sourceData.data[startPos+2];

        const [r, g, b] = color.match(/\w\w/g)!.map(x => parseInt(x, 16));

        const tolerance = 30;
        const stack = [[Math.round(startX), Math.round(startY)]];
        
        while (stack.length) {
            const [x, y] = stack.pop()!;
            let currentPos = (y * width + x) * 4;

            if (x < 0 || x >= width || y < 0 || y >= height) continue;
            if (drawingData.data[currentPos + 3] > 0) continue; // Already filled

            const dR = sourceData.data[currentPos] - startR;
            const dG = sourceData.data[currentPos+1] - startG;
            const dB = sourceData.data[currentPos+2] - startB;

            if (Math.sqrt(dR*dR + dG*dG + dB*dB) <= tolerance) {
                drawingData.data[currentPos] = r;
                drawingData.data[currentPos + 1] = g;
                drawingData.data[currentPos + 2] = b;
                drawingData.data[currentPos + 3] = 255;
                stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
            }
        }
        dCtx.putImageData(drawingData, 0, 0);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const coords = getCoords(e);
        const ctx = getCanvasContext(drawingCanvasRef.current);
        if (!ctx) return;
        
        if (tool === 'brush') {
            isDrawing.current = true;
            ctx.beginPath();
            ctx.moveTo(coords.x, coords.y);
        } else if (tool === 'fill') {
            floodFill(coords.x, coords.y);
            saveState();
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (tool !== 'brush' || !isDrawing.current) return;
        const coords = getCoords(e);
        const ctx = getCanvasContext(drawingCanvasRef.current);
        if (!ctx || !drawingCanvasRef.current) return;
        
        const scaledBrushSize = brushSize * (drawingCanvasRef.current.width / imageRef.current!.clientWidth);
        
        ctx.lineTo(coords.x, coords.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = scaledBrushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    };

    const handleMouseUp = () => {
        if (tool !== 'brush' || !isDrawing.current) return;
        isDrawing.current = false;
        const ctx = getCanvasContext(drawingCanvasRef.current);
        ctx?.closePath();
        saveState();
    };

    return (
        <div className="relative w-full cursor-crosshair" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <img ref={imageRef} src={imageSrc} alt="Input for drawing" className="w-full h-auto object-contain rounded-md select-none pointer-events-none" draggable="false" />
            <canvas ref={drawingCanvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-auto" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} />
        </div>
    );
});

const ImageUploadArea: React.FC<{onImageUpdate: (dataUrl: string) => void; label: string;}> = ({ onImageUpdate, label }) => {
    const handleFileRead = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => onImageUpdate(reader.result as string);
        reader.readAsDataURL(file);
    }, [onImageUpdate]);

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

const MapView: React.FC<{lat: number; lng: number;}> = ({ lat, lng }) => {
    const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`;
    return ( <iframe width="100%" height="100%" src={mapSrc} className="border-0 rounded-lg" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe> );
};

const layoutOptions = { type: [ { value: 'Khu đô thị mới', label: 'Khu đô thị mới' }, { value: 'Khu dân cư thấp tầng', label: 'Khu dân cư thấp tầng' }, { value: 'Công viên trung tâm', label: 'Công viên trung tâm' }, { value: 'Khu công nghiệp phức hợp', label: 'Khu công nghiệp phức hợp' }, ], scale: [ { value: 'Tỷ lệ 1/500', label: '1/500' }, { value: 'Tỷ lệ 1/1000', label: '1/1000' }, { value: 'Tỷ lệ 1/2000', label: '1/2000' }, ], style: [ { value: 'Hiện đại & Tối giản', label: 'Hiện đại & Tối giản' }, { value: 'Sinh thái & Bền vững', label: 'Sinh thái & Bền vững' }, { value: 'Tân cổ điển', label: 'Tân cổ điển' }, ] };
const threeDOptions = { style: [ { value: 'Kiến trúc Hiện đại', label: 'Hiện đại' }, { value: 'Kiến trúc Tương lai', label: 'Tương lai' }, { value: 'Kiến trúc Brutalist', label: 'Brutalist' }, ], context: [ { value: 'Bối cảnh thành phố', label: 'Thành phố' }, { value: 'Bối cảnh ven biển', label: 'Ven biển' }, { value: 'Bối cảnh đồi núi', label: 'Đồi núi' }, ], time: [ { value: 'Ánh sáng ban ngày', label: 'Ban ngày' }, { value: 'Hoàng hôn rực rỡ', label: 'Hoàng hôn' }, { value: 'Buổi đêm lung linh', label: 'Ban đêm' }, ] };
const threeDViewOptions = [ { value: 'góc nhìn từ trên cao xuống (bird\'s eye view)', label: 'Nhìn từ trên cao' }, { value: 'góc nhìn tầm mắt', label: 'Tầm mắt' }, { value: 'góc nhìn cao', label: 'Góc cao' }, { value: 'góc nhìn cận cảnh chi tiết', label: 'Cận cảnh' }, { value: 'phối cảnh isometric', label: 'Isometric' }, ];

interface PlanningToolProps { onBack: () => void; }

const PlanningTool: React.FC<PlanningToolProps> = ({ onBack }) => {
    const [activeMode, setActiveMode] = useState<'layout' | '2d-to-3d'>('layout');
    const [inputImage, setInputImage] = useState<string | null>(null);
    const [outputImage, setOutputImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOutputZoomed, setIsOutputZoomed] = useState(false);
    
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    const [layoutType, setLayoutType] = useState(layoutOptions.type[0].value);
    const [layoutScale, setLayoutScale] = useState(layoutOptions.scale[0].value);
    const [layoutStyle, setLayoutStyle] = useState(layoutOptions.style[0].value);

    const [archStyle, setArchStyle] = useState(threeDOptions.style[0].value);
    const [context, setContext] = useState(threeDOptions.context[0].value);
    const [timeOfDay, setTimeOfDay] = useState(threeDOptions.time[0].value);
    const [threeDView, setThreeDView] = useState('');

    // Drawing state
    const [activeDrawingTool, setActiveDrawingTool] = useState<'brush' | 'fill'>('brush');
    const [selectedColor, setSelectedColor] = useState('#EF4444'); // red-500
    const [brushSize, setBrushSize] = useState(20);
    const [drawingData, setDrawingData] = useState<string | null>(null);
    const drawingCanvasRef = useRef<DrawingActions>(null);

    const handleGetLocation = () => {
        if (!navigator.geolocation) { setLocationError("Trình duyệt không hỗ trợ định vị."); return; }
        setIsGettingLocation(true); setLocation(null); setLocationError(null);
        navigator.geolocation.getCurrentPosition( (position) => { setLocation({ lat: position.coords.latitude, lng: position.coords.longitude, }); setIsGettingLocation(false); }, (error) => { setLocationError(`Lỗi lấy vị trí: ${error.message}`); setIsGettingLocation(false); } );
    };

    const mergeImageAndDrawing = async (): Promise<string | null> => {
        if (!inputImage) return null;
        if (!drawingData) return inputImage;
        return new Promise((resolve) => {
            const baseImage = new Image();
            baseImage.onload = () => {
                const drawingImage = new Image();
                drawingImage.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = baseImage.naturalWidth;
                    canvas.height = baseImage.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(baseImage, 0, 0);
                        ctx.globalAlpha = 0.7; // Make color semi-transparent
                        ctx.drawImage(drawingImage, 0, 0, canvas.width, canvas.height);
                        resolve(canvas.toDataURL('image/jpeg'));
                    } else {
                        resolve(inputImage);
                    }
                };
                drawingImage.src = drawingData;
            };
            baseImage.src = inputImage;
        });
    };

    const handleGenerate = async () => {
        if (activeMode === '2d-to-3d' && !inputImage) { setError('Vui lòng tải lên mặt bằng 2D để chuyển đổi.'); return; }
        setIsLoading(true); setError(null); setOutputImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const finalImageToProcess = await mergeImageAndDrawing();
            
            let fullPrompt = '';
            const locationPrompt = location ? ` cho khu vực có vĩ độ ${location.lat.toFixed(5)} và kinh độ ${location.lng.toFixed(5)}` : '';
            const drawingPrompt = drawingData ? ' Chú ý đến các khu vực đã được tô màu để xác định chức năng: màu đỏ cho thương mại, xanh dương cho mặt nước, xanh lá cho cây xanh/công viên, vàng cho khu dân cư.' : '';

            if (activeMode === 'layout') {
                fullPrompt = `Bạn là một chuyên gia AI về quy hoạch đô thị. Dựa trên hình ảnh tham khảo (nếu có) và yêu cầu sau, hãy tạo ra một bản vẽ mặt bằng quy hoạch tổng thể${locationPrompt}. Yêu cầu: loại quy hoạch là ${layoutType}, phong cách ${layoutStyle}, ${layoutScale}.${drawingPrompt} ${prompt}`;
            } else {
                const viewPrompt = threeDView ? `, với ${threeDView}` : '';
                fullPrompt = `Bạn là một AI chuyên diễn họa kiến trúc 3D. Dựa trên mặt bằng 2D được cung cấp, hãy tạo ra một hình ảnh diễn họa 3D phối cảnh tổng thể${locationPrompt}. Yêu cầu: phong cách kiến trúc là ${archStyle}, đặt trong ${context}, vào lúc ${timeOfDay}${viewPrompt}.${drawingPrompt} ${prompt}`;
            }
            
            const contentParts: any[] = [];
            if (finalImageToProcess) {
                 contentParts.push({ inlineData: { mimeType: finalImageToProcess.match(/:(.*?);/)?.[1]!, data: finalImageToProcess.split(',')[1], }, });
            }
            contentParts.push({ text: fullPrompt });

            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts: contentParts }, config: { responseModalities: [Modality.IMAGE] }, });
            
            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part?.inlineData) { setOutputImage(`data:image/png;base64,${part.inlineData.data}`); } else { throw new Error("AI không trả về hình ảnh hợp lệ."); }
        } catch (e) { console.error(e); setError(`Đã xảy ra lỗi: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`); } finally { setIsLoading(false); }
    };
    
    const handleDownloadImage = () => { if (!outputImage) return; const link = document.createElement('a'); link.href = outputImage; link.download = `ctai-planning-${Date.now()}.png`; document.body.appendChild(link); link.click(); document.body.removeChild(link); };
    const renderDropdownOptions = (options: {value: string, label: string}[], placeholder?: string) => ( <> {placeholder && <option value="">{placeholder}</option>} {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)} </> );
    const handleInputImageUpdate = (dataUrl: string) => { setInputImage(dataUrl); setOutputImage(null); setError(null); setDrawingData(null); };
    const handleClearInput = () => { setInputImage(null); setOutputImage(null); setError(null); setDrawingData(null); };

    const handleUseOutputAsInput = () => {
        if (outputImage) {
            setInputImage(outputImage);
            setActiveMode('2d-to-3d');
            setOutputImage(null);
            setDrawingData(null);
            if (drawingCanvasRef.current) {
                drawingCanvasRef.current.clear();
            }
        }
    };

    const colors = [ { name: 'Residential', hex: '#FBBF24' }, { name: 'Commercial', hex: '#EF4444' }, { name: 'Park/Greenery', hex: '#22C55E' }, { name: 'Water', hex: '#3B82F6' }, { name: 'Industrial', hex: '#6B7280' }, ];

    return (
        <div className="w-full h-full flex flex-col animate-fade-in bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
                <h1 className="text-xl font-bold text-black dark:text-white">AI Quy hoạch</h1>
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" aria-label="Close"><CloseIcon /></button>
            </header>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-[420px_1fr] overflow-hidden">
                <aside className="p-6 flex flex-col overflow-y-auto bg-gray-50 dark:bg-zinc-900/30">
                    <div className="space-y-6">
                        <section>
                            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Chế độ</h2>
                            <div className="flex bg-gray-200 dark:bg-zinc-700/50 p-1 rounded-lg">
                                <button onClick={() => setActiveMode('layout')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${activeMode === 'layout' ? 'bg-yellow-400 text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>Tạo mặt bằng</button>
                                <button onClick={() => setActiveMode('2d-to-3d')} className={`flex-1 text-center text-sm font-semibold py-2 rounded-md transition-colors ${activeMode === '2d-to-3d' ? 'bg-yellow-400 text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>Tạo phối cảnh 3D</button>
                            </div>
                        </section>
                        
                        <>
                            <section>
                                <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Ảnh tham khảo / Mặt bằng 2D</h2>
                                <ImageUploadArea onImageUpdate={handleInputImageUpdate} label={activeMode === 'layout' ? 'Tải ảnh tham khảo (tùy chọn)' : 'Tải lên mặt bằng 2D'}/>
                            </section>
                            <section>
                                <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Yêu cầu</h2>
                                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="VD: Quy hoạch khu đô thị ven sông, ưu tiên không gian xanh..." rows={3} className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 placeholder-zinc-500 p-3 rounded-lg border-2 border-gray-300 dark:border-zinc-700/80 focus:border-yellow-400 focus:ring-0 outline-none transition-colors resize-none text-sm"/>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tùy chỉnh</h2>
                                {activeMode === 'layout' ? (
                                    <>
                                        <CustomSelect label="Loại hình" value={layoutType} onChange={(e) => setLayoutType(e.target.value)} children={renderDropdownOptions(layoutOptions.type)} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <CustomSelect label="Tỷ lệ" value={layoutScale} onChange={(e) => setLayoutScale(e.target.value)} children={renderDropdownOptions(layoutOptions.scale)} />
                                            <CustomSelect label="Phong cách" value={layoutStyle} onChange={(e) => setLayoutStyle(e.target.value)} children={renderDropdownOptions(layoutOptions.style)} />
                                        </div>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <CustomSelect label="Phong cách" value={archStyle} onChange={(e) => setArchStyle(e.target.value)} children={renderDropdownOptions(threeDOptions.style)} />
                                        <CustomSelect label="Bối cảnh" value={context} onChange={(e) => setContext(e.target.value)} children={renderDropdownOptions(threeDOptions.context)} />
                                        <CustomSelect label="Thời điểm" value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} children={renderDropdownOptions(threeDOptions.time)} />
                                        <CustomSelect label="Góc nhìn" value={threeDView} onChange={(e) => setThreeDView(e.target.value)} children={renderDropdownOptions(threeDViewOptions, 'Mặc định')} />
                                    </div>
                                )}
                            </section>

                            <section>
                                <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Vị trí (Tùy chọn)</h2>
                                <div className="p-3 bg-gray-100 dark:bg-zinc-800/50 rounded-lg space-y-3">
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Cung cấp vị trí để AI tạo quy hoạch dựa trên bối cảnh thực tế.</p>
                                    <button onClick={handleGetLocation} disabled={isGettingLocation} className="w-full flex items-center justify-center gap-2 bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-300 transition-colors text-sm disabled:bg-zinc-600 disabled:cursor-not-allowed">
                                        <MapPinIcon className="w-4 h-4" />
                                        {isGettingLocation ? 'Đang lấy vị trí...' : 'Lấy vị trí hiện tại'}
                                    </button>
                                    {locationError && <p className="text-xs text-red-500 text-center">{locationError}</p>}
                                    {location && (<div className="h-32 w-full rounded-md overflow-hidden"><MapView lat={location.lat} lng={location.lng} /></div>)}
                                </div>
                            </section>
                        </>
                    </div>
                    {activeMode !== 'lookup' && (
                        <footer className="mt-auto pt-6">
                            <button onClick={handleGenerate} className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-600 disabled:cursor-not-allowed" disabled={isLoading}>
                                {isLoading ? 'Đang xử lý...' : activeMode === 'layout' ? 'Tạo Mặt bằng' : 'Tạo Phối cảnh'}
                            </button>
                        </footer>
                    )}
                </aside>
                
                <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gray-200 dark:bg-black/40 overflow-hidden">
                    {isLoading ? <LoadingSpinner /> : error ? (
                        <div className="text-center text-red-500 flex flex-col items-center"><ErrorIcon /><h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2><p className="mt-1 max-w-md">{error}</p></div>
                    ) : outputImage ? (
                        <div className="w-full h-full flex items-center justify-center relative group/output">
                            <img src={outputImage} alt="AI Generated Result" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"/>
                            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover/output:opacity-100 transition-opacity">
                                <button onClick={() => setIsOutputZoomed(true)} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Phóng to"><ZoomIcon /></button>
                                <button onClick={handleDownloadImage} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Tải xuống"><DownloadIcon /></button>
                                <button onClick={handleUseOutputAsInput} className="p-2.5 bg-zinc-800/80 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-colors" title="Dùng làm đầu vào 3D"><SendToInputIcon /></button>
                            </div>
                        </div>
                    ) : inputImage ? (
                        <div className="w-full h-full flex flex-col gap-4">
                            <div className="flex-1 relative">
                                <DrawingCanvas ref={drawingCanvasRef} imageSrc={inputImage} tool={activeDrawingTool} color={selectedColor} brushSize={brushSize} onDrawingChange={setDrawingData} />
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-4 p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-md">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setActiveDrawingTool('brush')} className={`p-2 rounded-md ${activeDrawingTool === 'brush' ? 'bg-yellow-400 text-black' : 'bg-gray-200 dark:bg-zinc-700'}`}><BrushIcon/></button>
                                    <button onClick={() => setActiveDrawingTool('fill')} className={`p-2 rounded-md ${activeDrawingTool === 'fill' ? 'bg-yellow-400 text-black' : 'bg-gray-200 dark:bg-zinc-700'}`}><PaintBucketIcon/></button>
                                </div>
                                <div className="flex items-center gap-2">
                                    {colors.map(c => <button key={c.hex} onClick={() => setSelectedColor(c.hex)} style={{backgroundColor: c.hex}} className={`w-6 h-6 rounded-full ${selectedColor === c.hex ? 'ring-2 ring-offset-2 ring-offset-zinc-800 ring-white' : ''}`} title={c.name}/>)}
                                </div>
                                <div className="flex items-center gap-2 flex-grow">
                                    <label className="text-sm text-zinc-500">Cỡ cọ:</label>
                                    <input type="range" min="5" max="100" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-full accent-yellow-400" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => drawingCanvasRef.current?.undo()} className="p-2 bg-gray-200 dark:bg-zinc-700 rounded-md"><UndoIcon/></button>
                                    <button onClick={() => drawingCanvasRef.current?.clear()} className="p-2 bg-gray-200 dark:bg-zinc-700 rounded-md"><TrashIcon/></button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-zinc-500 flex flex-col items-center">
                            <PlaceholderIcon />
                            <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Kết quả Quy hoạch</h2>
                            <p className="mt-1">Mặt bằng hoặc phối cảnh của bạn sẽ xuất hiện ở đây.</p>
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

export default PlanningTool;