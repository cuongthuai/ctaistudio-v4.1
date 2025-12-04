import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { BackIcon } from './icons/ChatIcons';

// A list of provinces in Vietnam
const provincesOfVietnam = [
    'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
    'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
    'Bình Thuận', 'Cà Mau', 'Cần Thơ', 'Cao Bằng', 'Đà Nẵng', 'Đắk Lắk',
    'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
    'Hà Nam', 'Hà Nội', 'Hà Tĩnh', 'Hải Dương', 'Hải Phòng', 'Hậu Giang',
    'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
    'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An',
    'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam',
    'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh',
    'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang',
    'TP. Hồ Chí Minh', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];

const FireIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
    </svg>
);

const LoadingSpinner: React.FC = () => (
    <div role="status" className="flex flex-col items-center text-center text-zinc-500 dark:text-zinc-400">
        <svg aria-hidden="true" className="w-10 h-10 mb-3 text-zinc-200 dark:text-zinc-600 animate-spin fill-yellow-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-300">Đang tra cứu...</h3>
    </div>
);

const ConstructionDensityCalculator: React.FC = () => {
    const [length, setLength] = useState<number>(20);
    const [width, setWidth] = useState<number>(5);
    const [province, setProvince] = useState('TP. Hồ Chí Minh');
    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const area = length * width;

    const handleCalculate = async () => {
        if (area <= 0) {
            setError('Vui lòng nhập chiều dài và chiều rộng hợp lệ.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Bạn là một chuyên gia về quy hoạch và xây dựng tại Việt Nam. 
Dựa vào diện tích mảnh đất là ${area} m² tại tỉnh/thành phố ${province}, hãy cho biết mật độ xây dựng tối đa cho phép đối với nhà ở riêng lẻ theo quy định hiện hành của Việt Nam (QCVN 01:2021/BXD).

Hãy trình bày kết quả theo định dạng sau:
1.  **Kết quả:** Ghi rõ Mật độ xây dựng tối đa là bao nhiêu phần trăm (%).
2.  **Diện tích xây dựng tối đa:** Tính toán và ghi rõ diện tích xây dựng tối đa cho phép trên mảnh đất này (bằng ${area} m² * Mật độ xây dựng).
3.  **Diễn giải:** Giải thích ngắn gọn về quy định áp dụng cho trường hợp này, trích dẫn từ bảng 2.7 của QCVN 01:2021/BXD.
4.  **Lưu ý:** Thêm các lưu ý quan trọng khác (nếu có) về quy định tại địa phương (${province}) hoặc các yếu tố khác như số tầng cao, khoảng lùi...`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            setResult(response.text);

        } catch (e) {
            console.error(e);
            setError(`Đã xảy ra lỗi khi tra cứu: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto space-y-8">
             <div className="text-center">
                <h2 className="text-2xl font-bold text-black dark:text-white">Tra cứu Mật độ Xây dựng</h2>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">Tính toán mật độ xây dựng tối đa cho phép theo diện tích đất và tỉnh thành.</p>
            </div>
            
            <div className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Thông số mảnh đất</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                             <label htmlFor="land-length" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">Chiều dài (m)</label>
                             <input type="number" id="land-length" value={length} onChange={e => setLength(Number(e.target.value) || 0)} className="mt-1 w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 p-2.5 rounded-lg border-2 border-gray-300 dark:border-zinc-700 focus:border-yellow-400 focus:ring-0 outline-none" />
                        </div>
                         <div>
                             <label htmlFor="land-width" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">Chiều rộng (m)</label>
                             <input type="number" id="land-width" value={width} onChange={e => setWidth(Number(e.target.value) || 0)} className="mt-1 w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 p-2.5 rounded-lg border-2 border-gray-300 dark:border-zinc-700 focus:border-yellow-400 focus:ring-0 outline-none" />
                        </div>
                    </div>
                     <p className="text-center text-sm mt-3 p-2 bg-gray-100 dark:bg-zinc-700/50 rounded-md">
                        Tổng diện tích: <span className="font-bold text-lg text-black dark:text-white">{area.toLocaleString('vi-VN')} m²</span>
                    </p>
                </div>
                <div>
                    <label htmlFor="province-select" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Tỉnh/Thành phố</label>
                    <select id="province-select" value={province} onChange={e => setProvince(e.target.value)} className="w-full appearance-none bg-white dark:bg-zinc-800 border-2 border-gray-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-300 px-4 py-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm">
                        {provincesOfVietnam.sort().map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                 <button onClick={handleCalculate} disabled={isLoading} className="w-full bg-yellow-400 text-black font-bold py-3 px-10 rounded-lg hover:bg-yellow-300 transition-colors text-base shadow-lg hover:shadow-yellow-400/20 disabled:bg-zinc-600 disabled:cursor-not-allowed">
                    {isLoading ? 'Đang tra cứu...' : 'Tra cứu Mật độ'}
                </button>
            </div>
            
             <div className="mt-8">
                {isLoading && <LoadingSpinner />}
                {error && <p className="text-center text-red-500">{error}</p>}
                {result && (
                    <div className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 animate-fade-in">
                        <h3 className="text-lg font-bold text-black dark:text-white mb-4">Kết quả Tra cứu</h3>
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{result}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

const FireSafetyLookup: React.FC = () => {
    const [buildingType, setBuildingType] = useState('Nhà ở riêng lẻ (Kết hợp kinh doanh)');
    const [specificQuestion, setSpecificQuestion] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const buildingTypes = [
        'Nhà ở riêng lẻ (Kết hợp kinh doanh)',
        'Nhà trọ / Nhà cho thuê (Chung cư mini)',
        'Nhà nghỉ / Khách sạn',
        'Nhà chung cư / Nhà cao tầng',
        'Cơ sở kinh doanh Karaoke / Bar / Vũ trường',
        'Văn phòng làm việc',
        'Nhà xưởng / Kho bãi'
    ];

    const handleSearch = async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            let prompt = `Bạn là một chuyên gia tư vấn và Cảnh sát Phòng cháy chữa cháy (PCCC) tại Việt Nam.
Nhiệm vụ của bạn là cung cấp thông tin chính xác về quy định PCCC hiện hành (như QCVN 06:2022/BXD, Nghị định 136/2020/NĐ-CP, TCVN 3890:2023 và các văn bản liên quan).

Loại hình công trình cần tra cứu: **${buildingType}**.
${specificQuestion ? `Câu hỏi cụ thể của người dùng: "${specificQuestion}"` : 'Người dùng muốn biết các quy định và yêu cầu cơ bản về PCCC cho loại hình này.'}

Hãy trả lời chi tiết, rõ ràng theo cấu trúc sau:
1.  **Yêu cầu pháp lý cơ bản:** Các tiêu chuẩn, quy chuẩn bắt buộc áp dụng.
2.  **Giải pháp PCCC cụ thể:**
    *   Lối thoát nạn (số lượng, chiều rộng, khoảng cách).
    *   Hệ thống báo cháy, chữa cháy (bình chữa cháy, họng nước, Sprinkler...).
    *   Ngăn cháy lan (tường, cửa chống cháy).
3.  **Thủ tục hành chính:** (Nếu cần) Thẩm duyệt thiết kế, nghiệm thu PCCC.
4.  **Lưu ý quan trọng:** Các lỗi thường gặp hoặc khuyến cáo đặc biệt cho loại hình ${buildingType}.

Trình bày dễ hiểu, sử dụng gạch đầu dòng.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setResult(response.text);

        } catch (e) {
            console.error(e);
            setError(`Đã xảy ra lỗi khi tra cứu: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-black dark:text-white">Tra cứu Quy định PCCC</h2>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">Tìm hiểu các quy định phòng cháy chữa cháy cho nhà ở, kinh doanh theo tiêu chuẩn Việt Nam.</p>
            </div>

            <div className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 space-y-6">
                <div>
                    <label htmlFor="building-type" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Loại hình công trình</label>
                    <select
                        id="building-type"
                        value={buildingType}
                        onChange={e => setBuildingType(e.target.value)}
                        className="w-full appearance-none bg-white dark:bg-zinc-800 border-2 border-gray-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-300 px-4 py-2.5 rounded-lg focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm"
                    >
                        {buildingTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="specific-question" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Câu hỏi cụ thể (Tùy chọn)</label>
                    <textarea
                        id="specific-question"
                        value={specificQuestion}
                        onChange={e => setSpecificQuestion(e.target.value)}
                        placeholder="VD: Chiều rộng cầu thang thoát hiểm tối thiểu là bao nhiêu? Nhà 5 tầng có cần hệ thống báo cháy tự động không?"
                        rows={3}
                        className="w-full bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 p-3 rounded-lg border-2 border-gray-300 dark:border-zinc-700 focus:border-yellow-400 focus:ring-0 outline-none transition-colors text-sm"
                    />
                </div>
                <button onClick={handleSearch} disabled={isLoading} className="w-full bg-red-600 text-white font-bold py-3 px-10 rounded-lg hover:bg-red-700 transition-colors text-base shadow-lg shadow-red-600/20 disabled:bg-zinc-600 disabled:cursor-not-allowed">
                    {isLoading ? 'Đang tra cứu...' : 'Tra cứu Quy định PCCC'}
                </button>
            </div>

            <div className="mt-8">
                {isLoading && <LoadingSpinner />}
                {error && <p className="text-center text-red-500">{error}</p>}
                {result && (
                    <div className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 animate-fade-in">
                        <h3 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                            <FireIcon className="w-6 h-6 text-red-500" />
                            Kết quả Tra cứu PCCC
                        </h3>
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{result}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

const planningPortals = [
    { name: 'TP. Hồ Chí Minh', url: 'https://thongtinquyhoach.hochiminhcity.gov.vn/' },
    { name: 'Hà Nội', url: 'http://qhkh.hanoi.vn/' },
    { name: 'Đà Nẵng', url: 'https://thongtinquyhoach.danang.gov.vn/' },
    { name: 'Bình Dương', url: 'https://thongtinquyhoach.binhduong.gov.vn/' },
    { name: 'Đồng Nai', url: 'https://atlas.dongnai.gov.vn/' },
    { name: 'Bà Rịa - Vũng Tàu', url: 'http://quyhoach.baria-vungtau.gov.vn/gis' },
    { name: 'Long An', url: 'https://gis.longan.gov.vn/ban-do' },
    { name: 'Cần Thơ', url: 'https://qhxaydung.cantho.gov.vn/' },
];

const PlanningLookup: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-black dark:text-white">Tra cứu Thông tin Quy hoạch</h2>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">Truy cập cổng thông tin quy hoạch của các tỉnh/thành phố lớn.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {planningPortals.map(portal => (
          <a
            key={portal.name}
            href={portal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 text-center hover:border-yellow-400 hover:scale-105 transition-all"
          >
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">{portal.name}</p>
          </a>
        ))}
      </div>
    </div>
  );
};


interface ReferenceToolProps { onBack: () => void; }

const ReferenceTool: React.FC<ReferenceToolProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'density' | 'lookup' | 'fire-safety'>('density');

    return (
        <div className="w-full h-full flex flex-col animate-fade-in bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
                <h1 className="text-xl font-bold text-black dark:text-white">AI Tra cứu & Tham khảo</h1>
                <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" aria-label="Quay lại">
                    <BackIcon className="h-5 w-5" />
                    <span>Quay lại</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-max mx-auto bg-zinc-900/70 p-1.5 rounded-xl flex items-center gap-2 mb-8 backdrop-blur-sm flex-wrap justify-center">
                    <button onClick={() => setActiveTab('density')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'density' ? 'bg-yellow-400 text-black' : 'text-zinc-400 hover:text-white'}`}>
                        Mật độ Xây dựng
                    </button>
                    <button onClick={() => setActiveTab('lookup')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'lookup' ? 'bg-yellow-400 text-black' : 'text-zinc-400 hover:text-white'}`}>
                        Quy hoạch Tỉnh/TP
                    </button>
                    <button onClick={() => setActiveTab('fire-safety')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'fire-safety' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'}`}>
                        <FireIcon className="w-4 h-4" />
                        Tra cứu PCCC
                    </button>
                </div>
                {activeTab === 'density' && <ConstructionDensityCalculator />}
                {activeTab === 'lookup' && <PlanningLookup />}
                {activeTab === 'fire-safety' && <FireSafetyLookup />}
            </main>
        </div>
    );
};

export default ReferenceTool;