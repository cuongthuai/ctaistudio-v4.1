
import React, { useState, useEffect } from 'react';

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const CoffeeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
        <path d="M2 8h14v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
        <line x1="6" y1="1" x2="6" y2="4"></line>
        <line x1="10" y1="1" x2="10" y2="4"></line>
        <line x1="14" y1="1" x2="14" y2="4"></line>
    </svg>
);

const CountdownItem: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center mx-2 sm:mx-4">
        <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tabular-nums tracking-tight drop-shadow-lg">
            {String(value).padStart(2, '0')}
        </div>
        <div className="text-[10px] sm:text-xs uppercase tracking-widest text-zinc-400 mt-1 font-medium">
            {label}
        </div>
    </div>
);

const Separator: React.FC = () => (
    <div className="text-xl sm:text-2xl md:text-3xl font-light text-zinc-600 -mt-4">:</div>
);

const LandingPage: React.FC<{ onEnterApp: () => void }> = ({ onEnterApp }) => {
    const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState(false);
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const targetDate = new Date('2025-12-25T00:00:00'); // Christmas 2025 target
        
        const updateCountdown = () => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setCountdown({ days, hours, minutes, seconds });
            } else {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div className="relative h-screen w-screen bg-[#101010] text-white font-sans flex flex-col items-center justify-center overflow-hidden">
                {/* Snowfall Effect */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0" aria-hidden="true">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div
                            key={i}
                            className="snowflake"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `-${Math.random() * 10}s`,
                                opacity: Math.random() * 0.7 + 0.3,
                                '--start-x': `${Math.random() * 20 - 10}vw`,
                                '--end-x': `${Math.random() * 20 - 10}vw`,
                            } as React.CSSProperties}
                        />
                    ))}
                </div>

                {/* Background Image */}
                <img
                    src="https://i.pinimg.com/1200x/26/48/5f/26485fdd6298ff0deb5c3f5c676d6087.jpg"
                    alt="Architectural wireframe background"
                    className="absolute inset-0 w-full h-full object-cover opacity-30 z-0"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-0"></div>

                {/* Main Content */}
                <main className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4 text-center">
                    
                    {/* 1. Merry Christmas */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl text-[#ef4444] font-normal mb-8 animate-glow drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ fontFamily: "'Mountains of Christmas', cursive" }}>
                        Merry Christmas
                    </h1>

                    {/* 2. Countdown Timer */}
                    <div className="flex items-center justify-center mb-10 sm:mb-12 animate-entry" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 sm:px-8 sm:py-4 shadow-2xl">
                            <CountdownItem value={countdown.days} label="NGÀY" />
                            <Separator />
                            <CountdownItem value={countdown.hours} label="GIỜ" />
                            <Separator />
                            <CountdownItem value={countdown.minutes} label="PHÚT" />
                            <Separator />
                            <CountdownItem value={countdown.seconds} label="GIÂY" />
                        </div>
                    </div>

                    {/* 3. Logo Section */}
                    <div className="flex flex-col items-center mb-8 animate-entry" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            {/* CT Text */}
                            <span className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tighter text-white leading-none">CT</span>
                            
                            {/* Graphic Logo */}
                            <svg width="60" height="80" viewBox="0 0 60 80" fill="none" className="h-14 sm:h-16 md:h-20 w-auto self-center">
                                {/* Left White Shard */}
                                <path d="M15 75 L40 5 L55 5 L30 75 Z" fill="white" />
                                {/* Right Red Shard */}
                                <path d="M40 75 L65 5 L80 5 L55 75 Z" fill="#ef4444" /> 
                            </svg>
                        </div>
                        
                        {/* STUDIO Text */}
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[0.25em] text-white leading-tight ml-2">
                            STUDIO
                        </h2>
                        
                        {/* Version */}
                        <p className="text-sm text-zinc-400 font-medium tracking-widest mt-2 uppercase">
                            Version V3
                        </p>
                    </div>

                    {/* 4. Description */}
                    <div className="animate-entry space-y-4 max-w-2xl" style={{ animationDelay: '0.6s' }}>
                        <p className="text-zinc-300 text-sm sm:text-base md:text-lg font-light leading-relaxed">
                            Tăng tốc sáng tạo cùng ứng dụng AI miễn phí dành cho kiến trúc, nội thất <br className="hidden sm:block"/> và phong thuỷ.
                        </p>
                        
                        <p className="text-yellow-400 text-xs sm:text-sm font-semibold tracking-wide">
                            Bạn đang muốn tạo APP cho riêng bạn hoặc Công ty. Hãy liên hệ với tôi !
                        </p>
                    </div>

                    {/* 5. Buttons */}
                    <div className="flex items-center gap-4 mt-10 animate-entry" style={{ animationDelay: '0.8s' }}>
                        <button
                            onClick={onEnterApp}
                            className="bg-[#DC2626] hover:bg-red-700 text-white font-bold text-sm sm:text-base px-8 py-3 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:shadow-[0_0_25px_rgba(220,38,38,0.7)] transition-all duration-300 transform hover:scale-105 tracking-wide"
                        >
                            VÀO APP
                        </button>
                        
                        <button
                            onClick={() => setIsCoffeeModalOpen(true)}
                            className="bg-[#FACC15] hover:bg-yellow-300 text-black w-11 h-11 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(250,204,21,0.4)] hover:shadow-[0_0_25px_rgba(250,204,21,0.6)] transition-all duration-300 transform hover:scale-105 hover:rotate-12"
                            aria-label="Mời Cafe"
                        >
                            <CoffeeIcon className="w-6 h-6" />
                        </button>
                    </div>

                </main>

                {/* Footer */}
                <footer className="absolute bottom-4 text-zinc-500 text-xs tracking-wider z-10">
                    © 2025 CTAI STUDIO
                </footer>
            </div>

            {/* Coffee Modal */}
            {isCoffeeModalOpen && (
                <div 
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
                    onClick={() => setIsCoffeeModalOpen(false)}
                >
                    <div 
                        className="relative bg-zinc-900 border border-zinc-700 rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl transform transition-all scale-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setIsCoffeeModalOpen(false)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        >
                            <CloseIcon />
                        </button>
                        
                        <div className="w-16 h-16 bg-[#FACC15] rounded-full flex items-center justify-center mx-auto mb-6 text-black">
                             <CoffeeIcon className="w-8 h-8" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-2">Mời mình một ly cafe!</h3>
                        <p className="text-zinc-400 text-sm mb-8">Sự ủng hộ của bạn giúp duy trì server và phát triển thêm tính năng mới.</p>
                        
                        <div className="space-y-4">
                            <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Zalo / MoMo</p>
                                <p className="text-xl font-mono text-[#FACC15] tracking-widest font-bold">0589 33 8888</p>
                            </div>
                            <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Ngân hàng MB Bank</p>
                                <p className="text-xl font-mono text-[#FACC15] tracking-widest font-bold">0589 33 8888</p>
                                <p className="text-xs text-zinc-500 mt-1">NGUYEN MANH CUONG</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LandingPage;
