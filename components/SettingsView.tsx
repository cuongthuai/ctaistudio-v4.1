
import React, { useState } from 'react';

const RefreshCwIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M3 21v-5h5"/>
    </svg>
);

const CheckCircleIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

interface SettingsViewProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    accentColor: string;
    setAccentColor: (color: string) => void;
    background: string;
    setBackground: (background: string) => void;
}

const PRESET_COLORS = [
    { name: 'Mặc định (Vàng)', value: '#facc15' }, // yellow-400
    { name: 'Cam', value: '#f97316' }, // orange-500
    { name: 'Đỏ', value: '#ef4444' }, // red-500
    { name: 'Xanh dương', value: '#3b82f6' }, // blue-500
    { name: 'Hồng', value: '#ec4899' }, // pink-500
];

const PRESET_BACKGROUNDS = [
    { name: 'Mặc định', value: 'solid' },
    { name: 'Bình minh', value: 'linear-gradient(to top right, #1e3a8a, #4f46e5, #9333ea)' },
    { name: 'Hoàng hôn', value: 'linear-gradient(to top right, #f97316, #ea580c, #7c2d12)' },
    { name: 'Lục bảo', value: 'linear-gradient(to top right, #064e3b, #10b981, #059669)' },
    { name: 'Xám khói', value: 'linear-gradient(to top right, #18181b, #3f3f46, #52525b)' },
    { name: 'Thiên hà', value: 'linear-gradient(135deg, #0f172a, #1e293b, #334155)' },
];


const SettingsView: React.FC<SettingsViewProps> = ({ theme, setTheme, accentColor, setAccentColor, background, setBackground }) => {
    const [selectedBackground, setSelectedBackground] = useState(background);
    const [isBgSaved, setIsBgSaved] = useState(false);

    const handleClearCache = () => {
        if(confirm('Bạn có chắc chắn muốn xóa cache và tải lại trang không? Thao tác này sẽ xóa tất cả lịch sử và cài đặt đã lưu.')) {
            try {
                localStorage.clear();
                sessionStorage.clear();
                alert('Đã xóa cache. Đang tải lại trang...');
                window.location.reload();
            } catch (error) {
                alert('Không thể xóa cache. Vui lòng thử xóa thủ công trong cài đặt trình duyệt.');
            }
        }
    };
    
    const handleApplyBackground = () => {
        setBackground(selectedBackground);
        setIsBgSaved(true);
        setTimeout(() => setIsBgSaved(false), 2000);
    };


    return (
        <div className="relative animate-fade-in text-zinc-800 dark:text-zinc-200 -m-6 md:-m-12 p-6 md:p-12 min-h-full">
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 -z-20">
                <img 
                    src="https://i.pinimg.com/1200x/26/48/5f/26485fdd6298ff0deb5c3f5c676d6087.jpg" 
                    alt="background" 
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm -z-10"></div>

            <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white">Cài đặt</h2>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">Quản lý tài khoản và cấu hình giao diện.</p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md p-8 rounded-xl shadow-lg space-y-8 border border-gray-200 dark:border-zinc-700">
                    
                    <div>
                         <h4 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">Giao diện</h4>
                         <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">Chọn giao diện sáng hoặc tối cho ứng dụng.</p>
                         <div className="flex items-center gap-6 mt-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="theme" value="light" checked={theme === 'light'} onChange={() => setTheme('light')} className="w-4 h-4 text-[var(--accent-color)] focus:ring-[var(--accent-color)] border-gray-300 dark:border-zinc-600 bg-gray-100 dark:bg-zinc-700"/>
                                <span className="font-medium text-zinc-800 dark:text-zinc-200">Sáng</span>
                            </label>
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="theme" value="dark" checked={theme === 'dark'} onChange={() => setTheme('dark')} className="w-4 h-4 text-[var(--accent-color)] focus:ring-[var(--accent-color)] border-gray-300 dark:border-zinc-600 bg-gray-100 dark:bg-zinc-700"/>
                                <span className="font-medium text-zinc-800 dark:text-zinc-200">Tối</span>
                            </label>
                         </div>
                    </div>

                    <div className="border-t border-gray-300 dark:border-zinc-700 pt-8">
                        <h4 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">Màu nhấn</h4>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">Tùy chỉnh màu sắc chủ đạo của các nút và liên kết.</p>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="relative w-12 h-12 rounded-md border-2 border-gray-300 dark:border-zinc-600 overflow-hidden">
                                <input
                                    type="color"
                                    value={accentColor}
                                    onChange={(e) => setAccentColor(e.target.value)}
                                    className="absolute -top-1 -left-1 w-20 h-20 cursor-pointer"
                                    aria-label="Color picker"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color.value}
                                        onClick={() => setAccentColor(color.value)}
                                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${accentColor.toLowerCase() === color.value.toLowerCase() ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-800 ring-[var(--accent-color)]' : ''}`}
                                        style={{ backgroundColor: color.value }}
                                        aria-label={`Set accent color to ${color.name}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-300 dark:border-zinc-700 pt-8">
                        <div className="flex justify-between items-center mb-4">
                             <div>
                                <h4 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">Nền ứng dụng</h4>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">Chọn nền gradient cho ứng dụng.</p>
                            </div>
                             <button
                                onClick={handleApplyBackground}
                                disabled={isBgSaved || selectedBackground === background}
                                className={`flex items-center justify-center gap-2 font-semibold px-4 py-2 rounded-md transition-all duration-300 text-sm disabled:cursor-not-allowed ${
                                    isBgSaved
                                    ? 'bg-green-600 text-white'
                                    : 'bg-yellow-400 text-black hover:bg-yellow-300 disabled:opacity-50'
                                }`}
                                style={{ minWidth: '110px' }}
                            >
                                {isBgSaved ? (
                                    <>
                                        <CheckCircleIcon className="w-5 h-5" />
                                        <span>Đã áp dụng</span>
                                    </>
                                ) : (
                                    'Áp dụng'
                                )}
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {PRESET_BACKGROUNDS.map(bg => (
                                <div key={bg.name} className="text-center">
                                    <button
                                        onClick={() => setSelectedBackground(bg.value)}
                                        className={`w-16 h-10 rounded-lg transition-all duration-200 shadow-inner ${selectedBackground === bg.value ? 'ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-zinc-900 ring-[var(--accent-color)] scale-105' : 'hover:scale-105'}`}
                                        style={{ 
                                            background: bg.value === 'solid' ? (theme === 'dark' ? '#18181b' : '#ffffff') : bg.value,
                                            border: bg.value === 'solid' ? `2px solid ${theme === 'dark' ? '#3f3f46' : '#e5e7eb'}` : 'none'
                                        }}
                                        aria-label={`Set background to ${bg.name}`}
                                    />
                                    <span className={`mt-2 text-xs block ${selectedBackground === bg.value ? 'font-semibold text-zinc-800 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}>{bg.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-300 dark:border-zinc-700 pt-8">
                         <h4 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">Hệ thống</h4>
                         <button
                            onClick={handleClearCache}
                            className="mt-4 flex items-center justify-center gap-2 w-full max-w-xs px-6 py-3 bg-red-100/80 dark:bg-red-900/60 text-red-700 dark:text-red-300 font-semibold rounded-md hover:bg-red-200/80 dark:hover:bg-red-900/80 transition-colors"
                         >
                            <RefreshCwIcon className="w-5 h-5" />
                            Xóa Cache & Tải lại trang
                         </button>
                    </div>

                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Cách hoạt động</h3>
                        <p className="text-zinc-600 dark:text-zinc-300 mt-3 text-sm leading-relaxed">
                            ctai.arch V1 sử dụng sức mạnh của mô hình AI Google Gemini để thực hiện các tác vụ chỉnh sửa ảnh và tạo nội dung kiến trúc.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
