
import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';

// --- ICONS ---
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className || "h-5 w-5"}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// --- RULER DATA ---
interface SubSegment {
  name: string;
}
interface RulerSegment {
  name: string;
  isGood: boolean;
  subSegments: SubSegment[];
}
interface RulerData {
  name: string;
  description: string;
  cycle: number; // in mm
  segments: RulerSegment[];
}

const RULER_DATA: Record<string, RulerData> = {
  '52.2': {
    name: 'Thước Lỗ Ban 52.2cm',
    description: 'Khoảng thông thủy (cửa, cửa sổ...)',
    cycle: 522,
    segments: [
      { name: 'Quý Nhân', isGood: true, subSegments: [{ name: 'Quyền Tước' }, { name: 'Tài Lộc' }, { name: 'Trung Tín' }, { name: 'Tác Quan' }] },
      { name: 'Hiểm Họa', isGood: false, subSegments: [{ name: 'Tán Tài' }, { name: 'Quan Quỷ' }, { name: 'Kiếp Tài' }, { name: 'Độc Hại' }] },
      { name: 'Thiên Tai', isGood: false, subSegments: [{ name: 'Trường Bệnh' }, { name: 'Tố Tụng' }, { name: 'Lao Chấp' }, { name: 'Ôn Hoàng' }] },
      { name: 'Thiên Tài', isGood: true, subSegments: [{ name: 'Thi Thơ' }, { name: 'Hoạch Tài' }, { name: 'Hiếu Tử' }, { name: 'Quý Nhân' }] },
      { name: 'Phúc', isGood: true, subSegments: [{ name: 'Trí Tồn' }, { name: 'Phú Quý' }, { name: 'Tiến Bửu' }, { name: 'Thập Thiện' }] },
      { name: 'Cô Độc', isGood: false, subSegments: [{ name: 'Bất Lợi' }, { name: 'Vô Tự' }, { name: 'Ly Hương' }, { name: 'Tửu Thực' }] },
      { name: 'Thiên Tặc', isGood: false, subSegments: [{ name: 'Thoát Tài' }, { name: 'Quan Hình' }, { name: 'Cấp Bệnh' }, { name: 'Trường Cô' }] },
      { name: 'Tể Tướng', isGood: true, subSegments: [{ name: 'Thiên Lộc' }, { name: 'Đại Tài' }, { name: 'Hưng Vượng' }, { name: 'Dịch Mã' }] },
    ],
  },
  '42.9': {
    name: 'Thước Lỗ Ban 42.9cm (Dương trạch)',
    description: 'Khối xây dựng (bếp, bệ, bậc...)',
    cycle: 429,
    segments: [
      { name: 'Tài', isGood: true, subSegments: [{ name: 'Tài Đức' }, { name: 'Bảo Khố' }, { name: 'Lục Hợp' }, { name: 'Nghênh Phúc' }] },
      { name: 'Bệnh', isGood: false, subSegments: [{ name: 'Thoái Tài' }, { name: 'Công Sự' }, { name: 'Lao Chấp' }, { name: 'Cô Quả' }] },
      { name: 'Ly', isGood: false, subSegments: [{ name: 'Trường Khố' }, { name: 'Kiếp Tài' }, { name: 'Quan Quỷ' }, { name: 'Thất Thoát' }] },
      { name: 'Nghĩa', isGood: true, subSegments: [{ name: 'Thêm Đinh' }, { name: 'Ích Lợi' }, { name: 'Quý Tử' }, { name: 'Đại Cát' }] },
      { name: 'Quan', isGood: true, subSegments: [{ name: 'Thuận Khoa' }, { name: 'Hoạch Tài' }, { name: 'Tiến Ích' }, { name: 'Phú Quý' }] },
      { name: 'Kiếp', isGood: false, subSegments: [{ name: 'Tử Biệt' }, { name: 'Thoái Khẩu' }, { name: 'Ly Hương' }, { name: 'Tài Thất' }] },
      { name: 'Hại', isGood: false, subSegments: [{ name: 'Tai Chi' }, { name: 'Tử Tuyệt' }, { name: 'Bệnh Lâm' }, { name: 'Khẩu Thiệt' }] },
      { name: 'Bản', isGood: true, subSegments: [{ name: 'Tài Chí' }, { name: 'Đăng Khoa' }, { name: 'Tiến Bảo' }, { name: 'Hưng Vượng' }] },
    ],
  },
  '38.8': {
    name: 'Thước Lỗ Ban 38.8cm (Âm phần)',
    description: 'Đồ nội thất (bàn thờ, tủ...)',
    cycle: 388,
    segments: [
      { name: 'Đinh', isGood: true, subSegments: [{ name: 'Phúc Tinh' }, { name: 'Cập Đệ' }, { name: 'Tài Vượng' }, { name: 'Đăng Khoa' }] },
      { name: 'Hại', isGood: false, subSegments: [{ name: 'Khẩu Thiệt' }, { name: 'Bệnh Lâm' }, { name: 'Tử Tuyệt' }, { name: 'Tai Chi' }] },
      { name: 'Vượng', isGood: true, subSegments: [{ name: 'Thiên Đức' }, { name: 'Hỷ Sự' }, { name: 'Tiến Bảo' }, { name: 'Thêm Phúc' }] },
      { name: 'Khổ', isGood: false, subSegments: [{ name: 'Thất Thoát' }, { name: 'Quan Quỷ' }, { name: 'Kiếp Tài' }, { name: 'Vô Tự' }] },
      { name: 'Nghĩa', isGood: true, subSegments: [{ name: 'Đại Cát' }, { name: 'Tài Vượng' }, { name: 'Ích Lợi' }, { name: 'Thiên Khố' }] },
      { name: 'Quan', isGood: true, subSegments: [{ name: 'Phú Quý' }, { name: 'Tiến Bảo' }, { name: 'Hoạch Tài' }, { name: 'Thuận Khoa' }] },
      { name: 'Tử', isGood: false, subSegments: [{ name: 'Ly Hương' }, { name: 'Tử Biệt' }, { name: 'Thoái Đinh' }, { name: 'Thất Tài' }] },
      { name: 'Hưng', isGood: true, subSegments: [{ name: 'Đăng Khoa' }, { name: 'Quý Tử' }, { name: 'Thêm Đinh' }, { name: 'Hưng Vượng' }] },
      { name: 'Thất', isGood: false, subSegments: [{ name: 'Cô Quả' }, { name: 'Lao Chấp' }, { name: 'Công Sự' }, { name: 'Thoái Tài' }] },
      { name: 'Tài', isGood: true, subSegments: [{ name: 'Nghênh Phúc' }, { name: 'Lục Hợp' }, { name: 'Tiến Bảo' }, { name: 'Tài Đức' }] },
    ],
  },
};

const getRulerResult = (rulerData: RulerData, value: number) => {
  if (value <= 0) return { main: null, sub: null, isGood: false };
  const posInCycle = value % rulerData.cycle === 0 ? rulerData.cycle : value % rulerData.cycle;
  
  const segmentLength = rulerData.cycle / rulerData.segments.length;
  const segmentIndex = Math.floor((posInCycle - 1) / segmentLength);
  const mainSegment = rulerData.segments[segmentIndex];
  
  const posInMainSegment = (posInCycle - 1) % segmentLength;
  const subSegmentLength = segmentLength / mainSegment.subSegments.length;
  const subSegmentIndex = Math.floor(posInMainSegment / subSegmentLength);
  const subSegment = mainSegment.subSegments[subSegmentIndex];
  
  return { main: mainSegment.name, sub: subSegment.name, isGood: mainSegment.isGood };
};

const RulerTape = React.memo(({ rulerData, pixelsPerMm }: { rulerData: RulerData, pixelsPerMm: number }) => {
    const totalCycles = 20;
    const tapeWidth = rulerData.cycle * totalCycles;
    const segmentLength = rulerData.cycle / rulerData.segments.length;

    return (
        <div className="relative h-[88px]" style={{ width: `${tapeWidth * pixelsPerMm}px` }}>
            {/* Ticks */}
            <div className="absolute top-0 left-0 right-0 h-8">
                {Array.from({ length: tapeWidth / 5 }).map((_, i) => {
                    const mm = (i + 1) * 5;
                    const isCm = mm % 10 === 0;
                    return (
                        <div key={mm}
                             className={`absolute bottom-0 w-px ${isCm ? 'h-4 bg-zinc-600 dark:bg-zinc-400' : 'h-2 bg-zinc-500 dark:bg-zinc-500'}`}
                             style={{ left: `${mm * pixelsPerMm}px` }}>
                            {isCm && (
                                <span className="absolute -top-5 -translate-x-1/2 text-xs text-zinc-600 dark:text-zinc-400">
                                    {mm / 10}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
            {/* Red divider line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-red-500" />
            
            {/* Segments */}
            <div className="absolute top-9 left-0 right-0 h-16">
                {Array.from({ length: totalCycles }).flatMap((_, cycleIndex) =>
                    rulerData.segments.map((seg, segIndex) => {
                        const cycleOffset = cycleIndex * rulerData.cycle;
                        const segmentOffset = segIndex * segmentLength;
                        return (
                            <div
                                key={`${cycleIndex}-${segIndex}`}
                                className={`absolute h-full flex flex-col items-center justify-center text-white p-1
                                    ${seg.isGood ? 'bg-red-600' : 'bg-zinc-900'}`
                                }
                                style={{
                                    left: `${(cycleOffset + segmentOffset) * pixelsPerMm}px`,
                                    width: `${segmentLength * pixelsPerMm}px`,
                                }}
                            >
                                <div className="text-sm font-semibold truncate">{seg.name}</div>
                                <div className="flex w-full mt-1">
                                    {seg.subSegments.map((subSeg, subIdx) => (
                                        <div key={subIdx} className="flex-1 text-center text-[10px] truncate border-l border-white/20 first:border-l-0">
                                            {subSeg.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
});

interface RulerDisplayProps {
    rulerData: RulerData;
    value: number;
    onValueChange: React.Dispatch<React.SetStateAction<number>>;
}
const RulerDisplay: React.FC<RulerDisplayProps> = ({ rulerData, value, onValueChange }) => {
    const rulerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const lastX = useRef(0);
    const PIXELS_PER_MM = 4;

    const handleDragStart = useCallback((clientX: number) => {
        isDragging.current = true;
        lastX.current = clientX;
        if (rulerRef.current) {
            rulerRef.current.classList.add('cursor-grabbing');
        }
    }, []);

    const handleDragMove = useCallback((clientX: number) => {
        if (!isDragging.current) return;
        const deltaX = clientX - lastX.current;
        lastX.current = clientX;
        const deltaValue = -deltaX / PIXELS_PER_MM;
        onValueChange(prev => Math.max(1, prev + deltaValue));
    }, [onValueChange]);

    const handleDragEnd = useCallback(() => {
        isDragging.current = false;
        if (rulerRef.current) {
            rulerRef.current.classList.remove('cursor-grabbing');
        }
    }, []);

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX);
        const onTouchMove = (e: TouchEvent) => handleDragMove(e.touches[0].clientX);
        const onMouseUp = () => handleDragEnd();
        window.addEventListener('touchend', onMouseUp);

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('touchend', onMouseUp);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchend', onMouseUp);
        };
    }, [handleDragMove, handleDragEnd]);
    
    const offset = useMemo(() => {
        if (!rulerRef.current) return 0;
        const containerWidth = rulerRef.current.clientWidth;
        return -(value * PIXELS_PER_MM) + containerWidth / 2;
    }, [value, rulerRef.current?.clientWidth]);

    const result = getRulerResult(rulerData, Math.round(value));

    return (
        <div className="bg-white dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-200 dark:border-zinc-700/50 select-none">
            <div className="flex justify-between items-baseline mb-2">
                <div>
                    <h3 className="text-base font-bold text-black dark:text-white">{rulerData.name}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{rulerData.description}</p>
                </div>
                 <div className="text-right flex-shrink-0 ml-4">
                    <p className={`text-base font-bold ${result.isGood ? 'text-red-500' : 'text-zinc-500'}`}>
                        {result.main || '---'}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{result.sub || '---'}</p>
                </div>
            </div>
            <div ref={rulerRef}
                 className="w-full h-[88px] relative overflow-hidden cursor-grab bg-gray-100 dark:bg-zinc-900/50 rounded-md"
                 onMouseDown={(e) => handleDragStart(e.clientX)}
                 onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
            >
                <div className="absolute top-0 left-0 h-full" style={{ transform: `translateX(${offset}px)` }}>
                    <RulerTape rulerData={rulerData} pixelsPerMm={PIXELS_PER_MM} />
                </div>
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-[var(--accent-color)] z-10 pointer-events-none" />
            </div>
        </div>
    );
};

const StaircaseDrawing: React.FC<{
  steps: number;
  riserHeight: number;
  totalHeight: number;
  onClose: () => void;
}> = ({ steps, riserHeight, totalHeight, onClose }) => {
    // Calculations
    const going = Math.max(250, 630 - 2 * riserHeight);
    const totalRun = going * (steps - 1);
    const angle = Math.atan(totalHeight / totalRun) * (180 / Math.PI);

    // SVG path for the stairs
    let path = `M 0 0`;
    for (let i = 0; i < steps - 1; i++) {
        path += ` v ${-riserHeight} h ${going}`;
    }
    path += ` v ${-riserHeight}`; // Last riser

    const padding = 100;
    const textPadding = 10;
    const viewBoxWidth = totalRun + padding * 2;
    const viewBoxHeight = totalHeight + padding * 2;
    
    // Position the drawing inside the viewbox
    const offsetX = padding;
    const offsetY = totalHeight + padding;

    return (
        <div className="mt-8 bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-lg animate-fade-in relative">
            <button onClick={onClose} className="absolute top-2 right-2 p-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                <CloseIcon className="w-6 h-6" />
            </button>
            <h4 className="font-semibold text-lg mb-4 text-black dark:text-white">Bản vẽ chi tiết Cầu thang</h4>
            <div className="text-center grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                 <div className="p-2 bg-gray-200 dark:bg-zinc-800 rounded">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Số bậc</div>
                    <div className="font-bold text-lg">{steps}</div>
                </div>
                <div className="p-2 bg-gray-200 dark:bg-zinc-800 rounded">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Cao độ cổ bậc</div>
                    <div className="font-bold text-lg">{riserHeight.toFixed(1)} mm</div>
                </div>
                <div className="p-2 bg-gray-200 dark:bg-zinc-800 rounded">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Rộng mặt bậc</div>
                    <div className="font-bold text-lg">{going.toFixed(1)} mm</div>
                </div>
                <div className="p-2 bg-gray-200 dark:bg-zinc-800 rounded">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Độ dốc</div>
                    <div className="font-bold text-lg">{angle.toFixed(1)}°</div>
                </div>
            </div>
            <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-auto bg-white dark:bg-zinc-800 rounded">
                <g transform={`translate(${offsetX}, ${offsetY})`}>
                    {/* Main staircase path */}
                    <path d={path} stroke="currentColor" strokeWidth="2" fill="none" />

                    {/* Dimension lines - thin and gray */}
                    <g stroke="#888" strokeWidth="1" fill="#888" fontSize="10">
                        {/* Total Height */}
                        <line x1={-padding/2} y1="0" x2={-padding/2} y2={-totalHeight} />
                        <line x1={-padding/2 - 5} y1="0" x2={-padding/2 + 5} y2="0" />
                        <line x1={-padding/2 - 5} y1={-totalHeight} x2={-padding/2 + 5} y2={-totalHeight} />
                        <text x={-padding/2 - textPadding} y={-totalHeight/2} transform={`rotate(-90, ${-padding/2 - textPadding}, ${-totalHeight/2})`} textAnchor="middle">{totalHeight.toFixed(0)} mm</text>
                        
                        {/* Total Run */}
                        <line x1="0" y1={padding/2} x2={totalRun} y2={padding/2} />
                        <line x1="0" y1={padding/2 - 5} x2="0" y2={padding/2 + 5} />
                        <line x1={totalRun} y1={padding/2 - 5} x2={totalRun} y2={padding/2 + 5} />
                        <text x={totalRun/2} y={padding/2 + textPadding + 5} textAnchor="middle">{totalRun.toFixed(0)} mm</text>
                        
                        {/* First Riser */}
                        <line x1={-textPadding} y1="0" x2={-textPadding} y2={-riserHeight} />
                        <line x1={-textPadding - 3} y1="0" x2={-textPadding + 3} y2="0" />
                        <line x1={-textPadding - 3} y1={-riserHeight} x2={-textPadding + 3} y2={-riserHeight} />
                        <text x={-textPadding-3} y={-riserHeight/2} transform={`rotate(-90, ${-textPadding-3}, ${-riserHeight/2})`} textAnchor="middle">{riserHeight.toFixed(1)}</text>
                        
                        {/* First Going */}
                        <line x1={0} y1={-riserHeight - textPadding} x2={going} y2={-riserHeight - textPadding} />
                        <line x1="0" y1={-riserHeight - textPadding - 3} x2="0" y2={-riserHeight - textPadding + 3} />
                        <line x1={going} y1={-riserHeight - textPadding - 3} x2={going} y2={-riserHeight - textPadding + 3} />
                        <text x={going/2} y={-riserHeight - textPadding - 3} textAnchor="middle">{going.toFixed(1)}</text>
                        
                         {/* Slope angle */}
                        <path d={`M 50 0 A 50 50 0 0 0 ${50 * Math.cos(-angle * Math.PI / 180)} ${50 * Math.sin(-angle * Math.PI / 180)}`} fill="none" strokeDasharray="2" />
                        <text x="60" y="-15" fill="currentColor" fontSize="12">{angle.toFixed(1)}°</text>
                    </g>
                </g>
            </svg>
        </div>
    );
};

const StairsCalculator: React.FC = () => {
    const [totalHeight, setTotalHeight] = useState<number>(3600);
    const [results, setResults] = useState<Array<{ steps: number; riserHeight: number; status: string; type: 'best' | 'good' }>>([]);
    const [hasCalculated, setHasCalculated] = useState(false);
    const [drawingStaircase, setDrawingStaircase] = useState<{ steps: number; riserHeight: number } | null>(null);

    const handleCalculate = () => {
        setDrawingStaircase(null);
        if (totalHeight <= 0) {
            setResults([]);
            setHasCalculated(true);
            return;
        }

        const MIN_RISER_HEIGHT = 150;
        const MAX_RISER_HEIGHT = 180;

        const minSteps = Math.ceil(totalHeight / MAX_RISER_HEIGHT);
        const maxSteps = Math.floor(totalHeight / MIN_RISER_HEIGHT);

        const calculatedResults = [];
        for (let i = minSteps; i <= maxSteps; i++) {
            const remainder = i % 4;
            if (remainder === 1) {
                calculatedResults.push({
                    steps: i,
                    riserHeight: totalHeight / i,
                    status: 'Cung Sinh (Tốt nhất)',
                    type: 'best' as const
                });
            } else if (remainder === 3) {
                calculatedResults.push({
                    steps: i,
                    riserHeight: totalHeight / i,
                    status: 'Cung Bệnh (Số lẻ)',
                    type: 'good' as const
                });
            }
        }
        setResults(calculatedResults);
        setHasCalculated(true);
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-black dark:text-white text-center">Tính toán Cầu thang Phong thủy</h3>
            <p className="text-center text-zinc-600 dark:text-zinc-400">
                Nhập tổng chiều cao tầng để tìm số bậc thang lẻ theo chu kỳ Sinh-Lão-Bệnh-Tử (lấy 1 và 3).
            </p>
            
            <div className="flex items-center justify-center gap-4">
                <label htmlFor="total-height-input" className="text-sm font-medium shrink-0">Tổng chiều cao (mm):</label>
                <input
                    id="total-height-input"
                    type="number"
                    value={totalHeight}
                    onChange={(e) => setTotalHeight(parseInt(e.target.value, 10) || 0)}
                    className="w-48 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-center text-lg font-bold p-2 rounded-md border-2 border-gray-300 dark:border-zinc-700 focus:border-yellow-400 focus:ring-0 outline-none"
                />
                <button onClick={handleCalculate} className="px-8 py-2.5 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transition-colors">
                    Tính
                </button>
            </div>

            <div className="mt-8 text-center">
                {!hasCalculated && (
                    <p className="text-zinc-500">Nhấn "Tính" để xem kết quả.</p>
                )}
                {hasCalculated && results.length > 0 && (
                    <div className="bg-gray-100 dark:bg-zinc-800/50 p-6 rounded-lg animate-fade-in">
                        <h4 className="font-semibold text-lg mb-4 text-black dark:text-white">Các phương án số lẻ (Sinh - Bệnh):</h4>
                        <ul className="space-y-3 text-left max-w-md mx-auto">
                            {results.map((res, index) => (
                                <li key={index} className="flex justify-between items-center p-3 bg-white dark:bg-zinc-700/50 rounded-md">
                                     <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-zinc-800 dark:text-zinc-200">{res.steps} bậc</span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${res.type === 'best' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                {res.status}
                                            </span>
                                        </div>
                                        <span className="text-zinc-500 dark:text-zinc-400 text-sm">Cổ bậc: {res.riserHeight.toFixed(1)} mm</span>
                                    </div>
                                    <button 
                                        onClick={() => setDrawingStaircase(res)}
                                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                                            drawingStaircase?.steps === res.steps ? 
                                            'bg-yellow-500 text-white' : 
                                            'bg-yellow-400 text-black hover:bg-yellow-300'
                                        }`}
                                    >
                                        Vẽ
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {hasCalculated && results.length === 0 && (
                     <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg text-red-700 dark:text-red-300 animate-fade-in">
                        Không tìm thấy số bậc thang lẻ phù hợp (với chiều cao cổ bậc từ 150-180mm). Vui lòng thử một chiều cao tầng khác.
                    </div>
                )}
            </div>

            {drawingStaircase && (
                <StaircaseDrawing 
                    steps={drawingStaircase.steps} 
                    riserHeight={drawingStaircase.riserHeight}
                    totalHeight={totalHeight}
                    onClose={() => setDrawingStaircase(null)}
                />
            )}

            <div className="mt-10 pt-6 border-t border-gray-200 dark:border-zinc-700 space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                <p><strong>Chiếu nghỉ:</strong> Với số bậc thang lớn (thường trên 18 bậc), nên bố trí chiếu nghỉ để chia cầu thang thành 2 vế, giúp di chuyển thoải mái và an toàn hơn.</p>
                <p><strong>Chiều rộng:</strong> Chiều rộng một vế thang nên từ 80cm - 120cm để đảm bảo đi lại và vận chuyển đồ đạc thuận tiện.</p>
            </div>
        </div>
    );
};

const RoofDrawing: React.FC<{
  roofWidth: number;
  peakHeight: number;
  slopeAngle: number;
  onClose: () => void;
}> = ({ roofWidth, peakHeight, slopeAngle, onClose }) => {
    const padding = 100;
    const textPadding = 10;
    const viewBoxWidth = roofWidth + padding * 2;
    const viewBoxHeight = peakHeight + padding * 2;
    const offsetX = padding;
    const offsetY = peakHeight + padding;

    return (
        <div className="mt-8 bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-lg animate-fade-in relative">
            <button onClick={onClose} className="absolute top-2 right-2 p-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                <CloseIcon className="w-6 h-6" />
            </button>
            <h4 className="font-semibold text-lg mb-4 text-black dark:text-white">Bản vẽ Cấu tạo Mái</h4>
             <div className="text-center grid grid-cols-3 gap-2 mb-4">
                 <div className="p-2 bg-gray-200 dark:bg-zinc-800 rounded">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Rộng mái (L)</div>
                    <div className="font-bold text-lg">{roofWidth} mm</div>
                </div>
                <div className="p-2 bg-gray-200 dark:bg-zinc-800 rounded">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Cao đỉnh mái (H)</div>
                    <div className="font-bold text-lg">{peakHeight.toFixed(0)} mm</div>
                </div>
                <div className="p-2 bg-gray-200 dark:bg-zinc-800 rounded">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Độ dốc</div>
                    <div className="font-bold text-lg">{slopeAngle.toFixed(1)}°</div>
                </div>
            </div>
            <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-auto bg-white dark:bg-zinc-800 rounded">
                <g transform={`translate(${offsetX}, ${offsetY})`}>
                    {/* Roof Structure */}
                    <path d={`M 0 0 L ${roofWidth / 2} ${-peakHeight} L ${roofWidth} 0 Z`} stroke="currentColor" strokeWidth="2" fill="none" />
                    <line x1="0" y1="0" x2={roofWidth} y2="0" stroke="currentColor" strokeWidth="2" />
                    
                    {/* Dimension lines */}
                    <g stroke="#888" strokeWidth="1" fill="#888" fontSize="10">
                        {/* Total Width (L) */}
                        <line x1="0" y1={padding/2} x2={roofWidth} y2={padding/2} />
                        <line x1="0" y1={padding/2 - 5} x2="0" y2={padding/2 + 5} />
                        <line x1={roofWidth} y1={padding/2 - 5} x2={roofWidth} y2={padding/2 + 5} />
                        <text x={roofWidth/2} y={padding/2 + textPadding + 5} textAnchor="middle">L = {roofWidth} mm</text>
                        
                        {/* Peak Height (H) */}
                        <line x1={roofWidth / 2} y1="0" x2={roofWidth / 2} y2={-peakHeight} strokeDasharray="2" />
                        <line x1={roofWidth + padding/2} y1="0" x2={roofWidth + padding/2} y2={-peakHeight} />
                        <line x1={roofWidth + padding/2 - 5} y1="0" x2={roofWidth + padding/2 + 5} y2="0" />
                        <line x1={roofWidth + padding/2 - 5} y1={-peakHeight} x2={roofWidth + padding/2 + 5} y2={-peakHeight} />
                        <text x={roofWidth + padding/2 + textPadding} y={-peakHeight/2} transform={`rotate(-90, ${roofWidth + padding/2 + textPadding}, ${-peakHeight/2})`} textAnchor="middle">H = {peakHeight.toFixed(0)} mm</text>
                        
                        {/* Slope angle */}
                        <path d={`M 0 0 L 50 0 A 50 50 0 0 1 ${50 * Math.cos(-slopeAngle * Math.PI / 180)} ${50 * Math.sin(-slopeAngle * Math.PI / 180)}`} fill="none" strokeDasharray="2" />
                        <text x="60" y="-15" fill="currentColor" fontSize="12">{slopeAngle.toFixed(1)}°</text>
                    </g>
                </g>
            </svg>
        </div>
    );
};


const RafterCalculator: React.FC = () => {
  const [roofingMaterial, setRoofingMaterial] = useState('Tôn');
  const [roofWidth, setRoofWidth] = useState(8000);
  const [selectedTruc, setSelectedTruc] = useState('Thành');
  const [isDrawingVisible, setIsDrawingVisible] = useState(false);

  // Log state
  const [logEntries, setLogEntries] = useState<Array<{id: number; date: string; time: string; notes: string}>>([]);
  const [newLogDate, setNewLogDate] = useState('');
  const [newLogTime, setNewLogTime] = useState('');
  const [newLogNotes, setNewLogNotes] = useState('');

  useEffect(() => {
    try {
        const savedLog = localStorage.getItem('ctai_thuong_luong_log');
        if (savedLog) {
            setLogEntries(JSON.parse(savedLog));
        }
    } catch (e) { console.error("Failed to load log from storage", e); }
  }, []);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogDate || !newLogTime) {
        alert("Vui lòng nhập ngày và giờ.");
        return;
    }
    const newEntry = { id: Date.now(), date: newLogDate, time: newLogTime, notes: newLogNotes };
    const updatedLog = [...logEntries, newEntry];
    setLogEntries(updatedLog);
    localStorage.setItem('ctai_thuong_luong_log', JSON.stringify(updatedLog));
    setNewLogDate(''); setNewLogTime(''); setNewLogNotes('');
  };

  const handleDeleteLog = (id: number) => {
    const updatedLog = logEntries.filter(entry => entry.id !== id);
    setLogEntries(updatedLog);
    localStorage.setItem('ctai_thuong_luong_log', JSON.stringify(updatedLog));
  };


  const materialData: Record<string, { range: string; note: string }> = {
    'Tôn': { range: '80cm - 120cm', note: 'Đối với tôn lợp thông thường, tùy thuộc vào độ dày tôn và khẩu độ mái.' },
    'Ngói xi măng': { range: '90cm - 110cm', note: 'Khoảng cách có thể thay đổi theo trọng lượng ngói và hệ kết cấu.' },
    'Ngói đất nung': { range: '80cm - 100cm', note: 'Cần tính toán kỹ vì ngói đất nung nặng hơn tôn.' },
  };

  const trucData = [
    { name: 'Kiến', ratio: 0.5, status: 'Cát', description: 'Kiên cố, vững chắc' },
    { name: 'Trừ', ratio: 0.625, status: 'Cát', description: 'Trừ tai, hóa giải điềm xấu' },
    { name: 'Mãn', ratio: 0.75, status: 'Cát', description: 'Viên mãn, đủ đầy' },
    { name: 'Bình', ratio: 0.875, status: 'Cát', description: 'Bình an, ổn định' },
    { name: 'Định', ratio: 1.0, status: 'Cát', description: 'Ổn định, bền vững' },
    { name: 'Chấp', ratio: 1.125, status: 'Cát', description: 'Bền vững, chắc chắn' },
    { name: 'Phá', ratio: 1.25, status: 'Hung', description: 'Phá sản, hao tài' },
    { name: 'Nguy', ratio: 1.375, status: 'Hung', description: 'Nguy hiểm, bất an' },
    { name: 'Thành', ratio: 1.5, status: 'Cát', description: 'Thành công, tốt đẹp' },
    { name: 'Thu', ratio: 1.625, status: 'Cát', description: 'Thu hoạch, tài lộc' },
    { name: 'Khai', ratio: 1.75, status: 'Cát', description: 'Khai mở, thuận lợi' },
    { name: 'Bế', ratio: 1.875, status: 'Hung', description: 'Bế tắc, không thông' },
  ];

  const slopeCalculation = useMemo(() => {
    const truc = trucData.find(t => t.name === selectedTruc);
    if (!truc || roofWidth <= 0) {
      return { peakHeight: 0, slopeAngle: 0, status: 'Hung', description: 'Vui lòng nhập thông số hợp lệ.' };
    }
    const peakHeight = (roofWidth / 2) * truc.ratio;
    const slopeAngle = Math.atan(truc.ratio) * (180 / Math.PI);
    return { peakHeight, slopeAngle, status: truc.status, description: truc.description };
  }, [roofWidth, selectedTruc]);
  
  const thuongLuongCalculations = useMemo(() => {
      if (roofWidth <= 0) return [];
      const ruler = RULER_DATA['42.9'];
      const results: { name: string, range: string }[] = [];
      const numCycles = Math.floor(roofWidth / ruler.cycle);

      for(let i = -1; i <= 1; i++) {
          const base = (numCycles + i) * ruler.cycle;
          ruler.segments.forEach((seg, segIndex) => {
              if (seg.isGood) {
                  const segmentLength = ruler.cycle / ruler.segments.length;
                  const start = base + segIndex * segmentLength;
                  const end = start + segmentLength;
                  if (start > 0) {
                    results.push({ name: seg.name, range: `${Math.round(start)} - ${Math.round(end)}` });
                  }
              }
          });
      }
      return results;
  }, [roofWidth]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Section 1: Rafter Spacing Guide */}
      <div className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Hướng dẫn Chia Xà gồ Mái nhà</h3>
        <p className="text-sm text-zinc-400 mb-4">Chọn loại vật liệu lợp mái để xem khoảng cách xà gồ khuyến nghị.</p>
        
        <div className="flex items-center gap-4 mb-6">
          <label htmlFor="material-select" className="text-sm font-medium text-zinc-300">Vật liệu lợp:</label>
          <div className="relative">
            <select
              id="material-select"
              value={roofingMaterial}
              onChange={e => setRoofingMaterial(e.target.value)}
              className="appearance-none bg-zinc-700 border border-zinc-600 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full pl-3 pr-8 py-2"
            >
              {Object.keys(materialData).map(mat => <option key={mat} value={mat}>{mat}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-zinc-400">Khoảng cách khuyến nghị:</p>
        <p className="text-3xl font-bold text-yellow-400 my-2">{materialData[roofingMaterial].range}</p>
        <p className="text-xs text-zinc-500">{materialData[roofingMaterial].note}</p>
        
        <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
          <strong>Lưu ý quan trọng:</strong> Các thông số trên chỉ mang tính tham khảo. Khoảng cách thực tế phụ thuộc vào nhiều yếu tố như độ dốc mái, loại và kích thước xà gồ, tải trọng gió tại địa phương. Luôn cần tham khảo ý kiến của kỹ sư kết cấu để đảm bảo an toàn tuyệt đối cho công trình.
        </div>
      </div>

      {/* Section 2: Roof Slope Calculator */}
      <div className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Tính Độ Dốc Mái theo 12 Trực</h3>
        <p className="text-sm text-zinc-400 mb-6">Nhập chiều rộng mái (L) và chọn Trực để tính chiều cao đỉnh mái (H) và độ dốc theo phong thủy.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="roof-width" className="block text-sm font-medium text-zinc-300 mb-2">Chiều rộng mái (L) (mm)</label>
            <input
              id="roof-width"
              type="number"
              value={roofWidth}
              onChange={e => setRoofWidth(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-zinc-900 border border-zinc-600 text-white text-base p-3 rounded-lg focus:border-yellow-500 focus:ring-0 outline-none"
            />
          </div>
          <div>
            <label htmlFor="truc-select" className="block text-sm font-medium text-zinc-300 mb-2">Chọn Trực</label>
            <div className="relative">
              <select
                id="truc-select"
                value={selectedTruc}
                onChange={e => setSelectedTruc(e.target.value)}
                className="appearance-none bg-zinc-900 border border-zinc-600 text-white text-base rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-3"
              >
                {trucData.map(t => <option key={t.name} value={t.name}>{`${t.name} (${t.status === 'Cát' ? 'Tốt' : 'Xấu'})`}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-zinc-700 pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Trạng thái:</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-zinc-200">{`${slopeCalculation.status} - ${slopeCalculation.description}`}</span>
              <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${slopeCalculation.status === 'Cát' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {slopeCalculation.status.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Chiều cao đỉnh mái (H):</span>
            <span className="text-2xl font-bold text-yellow-400">{slopeCalculation.peakHeight.toFixed(0)} mm</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Độ dốc (góc):</span>
            <span className="text-2xl font-bold text-yellow-400">{slopeCalculation.slopeAngle.toFixed(2)}°</span>
          </div>
        </div>
        <div className="mt-6 text-center">
            <button
                onClick={() => setIsDrawingVisible(prev => !prev)}
                disabled={roofWidth <= 0}
                className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed"
            >
                {isDrawingVisible ? 'Ẩn bản vẽ' : 'Vẽ cấu tạo mái'}
            </button>
        </div>
        <p className="text-xs text-zinc-500 mt-6">Lưu ý: Chiều cao đỉnh mái (H) được tính dựa trên một nửa chiều rộng mái (L/2).</p>
      </div>

      {isDrawingVisible && roofWidth > 0 && (
          <RoofDrawing
              roofWidth={roofWidth}
              peakHeight={slopeCalculation.peakHeight}
              slopeAngle={slopeCalculation.slopeAngle}
              onClose={() => setIsDrawingVisible(false)}
          />
      )}

      {/* Section 3: Ridge Beam Calculator */}
      <div className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Tính Kích thước Thượng Lương (Đòn Dông)</h3>
        <p className="text-sm text-zinc-400 mb-6">Dựa vào chiều rộng mái ({roofWidth}mm), dưới đây là các khoảng kích thước tốt cho Thượng Lương theo thước Lỗ Ban 42.9cm.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {thuongLuongCalculations.map((calc, index) => (
                <div key={index} className="bg-green-900/50 border border-green-700 p-3 rounded-lg text-center">
                    <p className="font-bold text-green-300">{calc.name}</p>
                    <p className="text-sm text-white">{calc.range} mm</p>
                </div>
            ))}
        </div>
         <p className="text-xs text-zinc-500 mt-4">Gợi ý các khoảng kích thước gần với chiều rộng mái đã nhập.</p>
      </div>
      
      {/* Section 4: Ridge Beam Ceremony Log */}
      <div className="bg-zinc-800/50 p-6 rounded-xl border border-zinc-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Nhật ký Gác Thượng Lương</h3>
        <form onSubmit={handleAddLog} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-zinc-300 mb-1">Ngày gác</label>
            <input type="date" value={newLogDate} onChange={e => setNewLogDate(e.target.value)} required className="w-full bg-zinc-900 border border-zinc-600 text-white text-sm p-2 rounded-lg focus:border-yellow-500 focus:ring-0"/>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-zinc-300 mb-1">Giờ gác</label>
            <input type="time" value={newLogTime} onChange={e => setNewLogTime(e.target.value)} required className="w-full bg-zinc-900 border border-zinc-600 text-white text-sm p-2 rounded-lg focus:border-yellow-500 focus:ring-0"/>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-300 mb-1">Ghi chú</label>
            <input type="text" value={newLogNotes} onChange={e => setNewLogNotes(e.target.value)} placeholder="VD: Thời tiết đẹp, mọi việc thuận lợi" className="w-full bg-zinc-900 border border-zinc-600 text-white text-sm p-2 rounded-lg focus:border-yellow-500 focus:ring-0"/>
          </div>
          <button type="submit" className="md:col-span-4 w-full bg-yellow-400 text-black font-semibold py-2 rounded-lg hover:bg-yellow-300 transition-colors">Thêm vào Nhật ký</button>
        </form>

        <div className="space-y-2">
            {logEntries.length > 0 ? logEntries.map(entry => (
                <div key={entry.id} className="flex justify-between items-center bg-zinc-700/50 p-2 rounded-md text-sm">
                    <div className="flex gap-4 items-center">
                        <strong className="text-zinc-200">{new Date(entry.date).toLocaleDateString('vi-VN')}</strong>
                        <span className="text-zinc-300">{entry.time}</span>
                        <span className="text-zinc-400 italic">{entry.notes}</span>
                    </div>
                    <button onClick={() => handleDeleteLog(entry.id)} className="text-red-400 hover:text-red-300 pr-2">Xóa</button>
                </div>
            )) : <p className="text-center text-zinc-500 text-sm">Chưa có ghi chép nào.</p>}
        </div>
      </div>
    </div>
  );
};

const GateCalculator: React.FC = () => {
    const [gateWidth, setGateWidth] = useState(1280);

    const gateData = [
        {
            category: 'Kích thước phổ biến cho cổng nhà ở',
            description: 'Dựa trên cung tốt của thước Lỗ Ban 52.2cm.',
            sizes: [
                { width: 810, name: 'Cung Quý Nhân (Tài Lộc)' },
                { width: 1070, name: 'Cung Thiên Tài (Quý Nhân)' },
                { width: 1280, name: 'Cung Thiên Tài (Hoạch Tài)', note: 'Ví dụ: Cổng Hưng Long' },
                { width: 1470, name: 'Cung Thiên Tài (Thi Thơ)' },
                { width: 1670, name: 'Cung Phúc (Tiến Bửu)' },
                { width: 1900, name: 'Cung Tể Tướng (Hưng Vượng)' },
                { width: 2110, name: 'Cung Tể Tướng (Thiên Lộc)' },
            ]
        },
        {
            category: 'Kích thước phổ biến cho cổng ô tô 4-7 chỗ',
            description: 'Đảm bảo xe ra vào thoải mái và hợp phong thủy.',
            sizes: [
                { width: 2320, name: 'Cung Tể Tướng (Hưng Vượng)' },
                { width: 2550, name: 'Cung Quý Nhân (Tác Quan)' },
                { width: 2820, name: 'Cung Thiên Tài (Hiếu Tử)' },
                { width: 3010, name: 'Cung Phúc (Thập Thiện)' },
                { width: 3220, name: 'Cung Tể Tướng (Đại Tài)' },
            ]
        }
    ];

    const result522 = getRulerResult(RULER_DATA['52.2'], gateWidth);

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                <h3 className="text-xl font-bold text-black dark:text-white">Tra cứu Kích thước Cửa Cổng Phong Thủy</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    Kiểm tra và tham khảo các kích thước thông thủy (lọt lòng) đẹp cho cửa cổng.
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-800/50 p-6 rounded-xl border border-gray-200 dark:border-zinc-700/50">
                <h4 className="font-semibold text-lg mb-4 text-black dark:text-white">Kiểm tra kích thước bất kỳ</h4>
                <div className="flex items-center gap-4 mb-4">
                    <label htmlFor="gate-width-input" className="text-sm font-medium shrink-0">Nhập chiều rộng (mm):</label>
                    <input
                        id="gate-width-input"
                        type="number"
                        value={gateWidth}
                        onChange={(e) => setGateWidth(parseInt(e.target.value, 10) || 0)}
                        className="w-48 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-center text-lg font-bold p-2 rounded-md border-2 border-gray-300 dark:border-zinc-700 focus:border-yellow-400 focus:ring-0 outline-none"
                    />
                </div>
                <div className={`p-4 rounded-lg text-center ${result522.isGood ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : 'bg-gray-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'}`}>
                    <p className="text-sm">Thước 52.2cm (Thông thủy)</p>
                    <p className="text-2xl font-bold my-1">{result522.main || '---'}</p>
                    <p>{result522.sub || '---'}</p>
                </div>
            </div>

            {gateData.map((categoryData, index) => (
                <div key={index} className="bg-white dark:bg-zinc-800/50 p-6 rounded-xl border border-gray-200 dark:border-zinc-700/50">
                    <h4 className="font-semibold text-lg mb-2 text-black dark:text-white">{categoryData.category}</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{categoryData.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categoryData.sizes.map((size) => (
                            <div key={size.width} className="p-3 bg-red-500/10 dark:bg-red-900/30 border border-red-500/20 rounded-lg text-center cursor-pointer hover:bg-red-500/20" onClick={() => setGateWidth(size.width)}>
                                <p className="font-bold text-2xl text-red-600 dark:text-red-400">{size.width / 1000}m</p>
                                <p className="text-xs text-zinc-600 dark:text-zinc-300">{size.name}</p>
                                {size.note && <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">({size.note})</p>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-700 space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                <p><strong>Lưu ý về "Đạo sinh nhất...":</strong> Nguyên lý "Đạo sinh nhất, Nhất sinh nhị, Nhị sinh tam, Tam sinh vạn vật" của Đạo giáo tượng trưng cho sự sinh sôi, nảy nở. Trong kiến trúc, nó thường được vận dụng một cách tượng trưng để cầu mong sự phát triển, thịnh vượng, chứ không phải là một công thức tính toán cụ thể. Các kích thước trên là những con số đẹp được đúc kết từ thước Lỗ Ban và kinh nghiệm dân gian để phù hợp với triết lý đó.</p>
            </div>
        </div>
    );
};

const RampSlopeCalculator: React.FC = () => {
    const [height, setHeight] = useState(2200);
    const [length, setLength] = useState(12000);

    const calculationResult = useMemo(() => {
        if (length <= 0 || height <= 0) {
            return {
                slope: 0,
                evaluation: 'Vui lòng nhập thông số hợp lệ',
                colorClass: 'text-zinc-500',
                advice: 'Chiều cao và chiều dài phải lớn hơn 0.',
                transitionLength: 0,
            };
        }
        const slope = (height / length) * 100;
        let evaluation = '';
        let colorClass = '';
        let advice = '';

        if (slope > 25) {
            evaluation = 'Rất Dốc - Nguy hiểm';
            colorClass = 'text-red-500';
            advice = 'Độ dốc này vi phạm tiêu chuẩn an toàn, gây nguy hiểm cho người và phương tiện. Về mặt phong thủy, nó tạo ra dòng khí chảy xiết (sát khí), gây bất ổn và hao tán tài lộc.';
        } else if (slope > 20) {
            evaluation = 'Dốc - Cần cẩn trọng';
            colorClass = 'text-orange-500';
            advice = 'Độ dốc khá cao, xe gầm thấp có thể bị cạ gầm. Cần bố trí đoạn đệm chuyển tiếp đủ dài để đảm bảo an toàn và làm dịu dòng khí.';
        } else if (slope >= 15) {
            evaluation = 'Tốt - An toàn & Hài hòa';
            colorClass = 'text-green-500';
            advice = 'Độ dốc lý tưởng, nằm trong tiêu chuẩn xây dựng, đảm bảo an toàn và tạo dòng khí lưu thông ôn hòa, tốt cho việc dẫn khí vào tầng hầm.';
        } else if (slope >= 13) {
            evaluation = 'Hơi thoải - Chấp nhận được';
            colorClass = 'text-blue-400';
            advice = 'Độ dốc an toàn nhưng có thể chiếm nhiều diện tích. Phù hợp nếu có không gian rộng rãi. Dòng khí di chuyển chậm rãi, bình ổn.';
        } else {
            evaluation = 'Quá thoải - Tốn diện tích';
            colorClass = 'text-zinc-500';
            advice = 'Độ dốc rất thấp, chiếm nhiều diện tích không cần thiết. Dòng khí lưu thông chậm, có thể gây tù đọng nếu không có thông gió tốt.';
        }
        
        const transitionLength = Math.min(4000, length / 3);

        return { slope, evaluation, colorClass, advice, transitionLength };
    }, [height, length]);
    
    const SvgDiagram: React.FC = () => {
        const viewBoxWidth = 1000;
        const scale = viewBoxWidth / length;
        const scaledHeight = height * scale;
        
        return (
            <svg viewBox={`-50 -${scaledHeight + 20} ${viewBoxWidth + 100} ${scaledHeight + 40}`} className="w-full h-auto">
                <line x1="0" y1="0" x2={viewBoxWidth} y2="0" stroke="currentColor" strokeWidth="1" strokeDasharray="4" />
                <line x1={viewBoxWidth} y1="0" x2={viewBoxWidth} y2={-scaledHeight} stroke="currentColor" strokeWidth="1" strokeDasharray="4" />
                
                <text x={viewBoxWidth / 2} y="15" textAnchor="middle" fontSize="12" fill="currentColor">L = {length} mm</text>
                <text x={viewBoxWidth + 10} y={-scaledHeight / 2} textAnchor="start" fontSize="12" fill="currentColor">H = {height} mm</text>
                
                <path d={`M 0 0 L ${viewBoxWidth} ${-scaledHeight}`} stroke="#facc15" strokeWidth="3" fill="none" />
            </svg>
        );
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                <h3 className="text-xl font-bold text-black dark:text-white">Tính toán Ram dốc tầng hầm</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    Tính độ dốc và nhận khuyến nghị về an toàn, kỹ thuật và phong thủy cho ram dốc thẳng.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="bg-white dark:bg-zinc-800/50 p-6 rounded-xl border border-gray-200 dark:border-zinc-700/50 space-y-4">
                     <div>
                        <label htmlFor="ramp-height-input" className="block text-sm font-medium">Chiều cao hầm (H)</label>
                        <div className="relative mt-1">
                            <input
                                id="ramp-height-input"
                                type="number"
                                value={height}
                                onChange={(e) => setHeight(parseInt(e.target.value, 10) || 0)}
                                className="w-full bg-white dark:bg-zinc-800 p-2 rounded-md border-2 border-gray-300 dark:border-zinc-700 focus:border-yellow-400 focus:ring-0 outline-none pr-12"
                            />
                             <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500">mm</span>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="ramp-length-input" className="block text-sm font-medium">Chiều dài đoạn dốc (L)</label>
                        <div className="relative mt-1">
                            <input
                                id="ramp-length-input"
                                type="number"
                                value={length}
                                onChange={(e) => setLength(parseInt(e.target.value, 10) || 0)}
                                className="w-full bg-white dark:bg-zinc-800 p-2 rounded-md border-2 border-gray-300 dark:border-zinc-700 focus:border-yellow-400 focus:ring-0 outline-none pr-12"
                            />
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500">mm</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-800/50 p-6 rounded-xl border border-gray-200 dark:border-zinc-700/50 space-y-3 text-center">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Độ dốc tính toán (i = H/L)</p>
                    <p className="text-5xl font-bold text-yellow-400">{calculationResult.slope.toFixed(1)}%</p>
                    <p className={`font-semibold ${calculationResult.colorClass}`}>{calculationResult.evaluation}</p>
                </div>
            </div>

            <div className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 animate-fade-in">
                 <h4 className="font-semibold text-lg mb-4 text-black dark:text-white">Luận giải & Khuyến nghị</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <h5 className="font-bold text-zinc-800 dark:text-zinc-200">Đánh giá Phong thủy & Kỹ thuật</h5>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{calculationResult.advice}</p>
                        </div>
                         <div>
                            <h5 className="font-bold text-zinc-800 dark:text-zinc-200">Khuyến nghị đoạn đệm</h5>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                Nên bố trí 2 đoạn dốc đệm ở đầu và cuối ram dốc, mỗi đoạn dài khoảng <strong>{calculationResult.transitionLength / 1000}m</strong>. 
                                Độ dốc của đoạn đệm nên bằng một nửa độ dốc chính (<strong>{(calculationResult.slope / 2).toFixed(1)}%</strong>) để xe lên xuống êm ái, tránh va gầm.
                            </p>
                        </div>
                        <div>
                            <h5 className="font-bold text-zinc-800 dark:text-zinc-200">Tiêu chuẩn khác</h5>
                             <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 mt-1 space-y-1">
                                <li><strong>Chiều rộng ram dốc:</strong> Tối thiểu 3m cho 1 chiều xe, 5.5m cho 2 chiều xe.</li>
                                <li><strong>Chiều cao thông thủy:</strong> Tối thiểu 2.2m để đảm bảo an toàn.</li>
                                <li><strong>Bề mặt:</strong> Cần được làm nhám, xẻ rãnh để chống trơn trượt.</li>
                            </ul>
                        </div>
                    </div>
                     <div className="flex items-center justify-center">
                        <SvgDiagram />
                    </div>
                 </div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
interface LuBanRulerToolProps { onBack: () => void; }

const LuBanRulerTool: React.FC<LuBanRulerToolProps> = ({ onBack }) => {
    const [width, setWidth] = useState<number>(1940);
    const [height, setHeight] = useState<number>(810);
    const [activeDimension, setActiveDimension] = useState<'width' | 'height'>('width');
    const [activeTab, setActiveTab] = useState<'ruler' | 'stairs' | 'rafters' | 'gate' | 'rampslope'>('ruler');

    const activeValue = activeDimension === 'width' ? width : height;
    const setActiveValue = activeDimension === 'width' ? setWidth : setHeight;

    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const num = e.target.valueAsNumber;
        if (!isNaN(num) && num >= 0) {
            setWidth(num);
        } else if (e.target.value === '') {
            setWidth(0);
        }
    };
    
    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const num = e.target.valueAsNumber;
        if (!isNaN(num) && num >= 0) {
            setHeight(num);
        } else if (e.target.value === '') {
            setHeight(0);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'stairs':
                return <StairsCalculator />;
            case 'rafters':
                return <RafterCalculator />;
            case 'gate':
                return <GateCalculator />;
            case 'rampslope':
                return <RampSlopeCalculator />;
            case 'ruler':
            default:
                return (
                    <>
                        <div className="max-w-4xl mx-auto text-center mb-10">
                            <div className="flex justify-center items-start gap-4 mb-4">
                                <div>
                                    <label htmlFor="width-input" className="block text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Rộng (mm)</label>
                                    <input
                                        id="width-input"
                                        type="number"
                                        value={Math.round(width)}
                                        onChange={handleWidthChange}
                                        onClick={() => setActiveDimension('width')}
                                        className="w-32 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-center text-xl font-bold p-2 rounded-md border-2 border-gray-300 dark:border-zinc-700 focus:border-yellow-400 focus:ring-0 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="height-input" className="block text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Cao (mm)</label>
                                    <input
                                        id="height-input"
                                        type="number"
                                        value={Math.round(height)}
                                        onChange={handleHeightChange}
                                        onClick={() => setActiveDimension('height')}
                                        className="w-32 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-center text-xl font-bold p-2 rounded-md border-2 border-gray-300 dark:border-zinc-700 focus:border-yellow-400 focus:ring-0 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mr-4">Kiểm tra theo:</span>
                                <div className="inline-flex bg-gray-200 dark:bg-zinc-700/50 p-1 rounded-lg">
                                    <button onClick={() => setActiveDimension('width')} className={`px-6 py-2 text-sm font-semibold rounded-md transition-colors ${activeDimension === 'width' ? 'bg-yellow-400 text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>
                                        Chiều Rộng
                                    </button>
                                    <button onClick={() => setActiveDimension('height')} className={`px-6 py-2 text-sm font-semibold rounded-md transition-colors ${activeDimension === 'height' ? 'bg-yellow-400 text-black' : 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-600'}`}>
                                        Chiều Cao
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                        {Object.values(RULER_DATA).map(data => (
                                <RulerDisplay key={data.name} rulerData={data} value={activeValue} onValueChange={setActiveValue} />
                        ))}
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="w-full h-full flex flex-col animate-fade-in bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
                <h1 className="text-xl font-bold text-black dark:text-white">Thước Lỗ Ban & Tiện ích</h1>
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" aria-label="Close"><CloseIcon /></button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-max mx-auto bg-zinc-900/70 p-1.5 rounded-xl flex items-center gap-2 mb-8 backdrop-blur-sm flex-wrap justify-center">
                    <button onClick={() => setActiveTab('ruler')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 ${activeTab === 'ruler' ? 'bg-[var(--accent-color)] text-black' : 'text-zinc-400 hover:text-white'}`}>
                        Thước Lỗ Ban
                    </button>
                    <button onClick={() => setActiveTab('gate')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 ${activeTab === 'gate' ? 'bg-[var(--accent-color)] text-black' : 'text-zinc-400 hover:text-white'}`}>
                        Cửa cổng
                    </button>
                    <button onClick={() => setActiveTab('stairs')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 ${activeTab === 'stairs' ? 'bg-[var(--accent-color)] text-black' : 'text-zinc-400 hover:text-white'}`}>
                        Cầu thang
                    </button>
                    <button onClick={() => setActiveTab('rampslope')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 ${activeTab === 'rampslope' ? 'bg-[var(--accent-color)] text-black' : 'text-zinc-400 hover:text-white'}`}>
                        Ram dốc
                    </button>
                    <button onClick={() => setActiveTab('rafters')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 ${activeTab === 'rafters' ? 'bg-[var(--accent-color)] text-black' : 'text-zinc-400 hover:text-white'}`}>
                        Mái nhà
                    </button>
                </div>
                {renderContent()}
            </main>
        </div>
    );
};

export default LuBanRulerTool;
