
import React, { useState, useRef, useEffect } from 'react';
import { FacebookIcon, TwitterIcon, InstagramIcon, YoutubeIcon, ShareIcon } from './icons/SocialIcons';
import { useLocalization } from '../contexts/LocalizationContext';
import { ToolCardData } from '../types';
import { 
  HomeIcon, ArchVizIcon, View360Icon, VideoIcon, EditIcon, 
  DrawingIcon, RulerIcon, CompassIcon, MapIcon, CalculatorIcon, BookIcon, MagicWandIcon, SunWindIcon
} from './icons/SidebarIcons';

interface SidebarProps {
  toolCards?: ToolCardData[];
  selectedToolId?: number | null;
  onSelectTool?: (id: number) => void;
  onGoHome?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ toolCards = [], selectedToolId, onSelectTool, onGoHome }) => {
  const { t, language, setLanguage } = useLocalization();
  const [isSocialMenuOpen, setIsSocialMenuOpen] = useState(false);
  const socialMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (socialMenuRef.current && !socialMenuRef.current.contains(event.target as Node)) {
        setIsSocialMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getToolIcon = (id: number) => {
    const iconClass = "w-6 h-6 transition-transform duration-300 group-hover:scale-110"; 
    switch(id) {
      case 1: return <ArchVizIcon className={iconClass} />;
      case 2: return <View360Icon className={iconClass} />;
      case 3: return <VideoIcon className={iconClass} />;
      case 4: return <EditIcon className={iconClass} />;
      case 5: return <DrawingIcon className={iconClass} />;
      case 6: return <RulerIcon className={iconClass} />;
      case 7: return <CompassIcon className={iconClass} />;
      case 8: return <MapIcon className={iconClass} />;
      case 9: return <CalculatorIcon className={iconClass} />;
      case 10: return <BookIcon className={iconClass} />;
      case 12: return <MagicWandIcon className={iconClass} />;
      case 14: return <SunWindIcon className={iconClass} />;
      default: return <div className={`${iconClass} rounded-full bg-gray-300`}></div>;
    }
  };

  return (
    <aside className="hidden md:flex flex-col items-center w-28 bg-gray-50/90 dark:bg-black/80 backdrop-blur-lg py-4 sticky top-0 h-screen border-r border-black/5 dark:border-white/5 z-20 transition-all duration-300">
      <div onClick={onGoHome} className="cursor-pointer mb-4 flex-shrink-0 px-2">
        <img
            src="https://i.postimg.cc/1RjHYzzS/Logo-Photoroom.png"
            alt="ctai.arch logo"
            className="w-24 h-auto hover:scale-105 transition-transform duration-300 drop-shadow-lg"
        />
      </div>
      
      <div className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col items-center gap-1.5 px-2">
          <button
            onClick={onGoHome}
            className={`p-3 rounded-xl transition-all duration-200 group relative w-full flex justify-center ${selectedToolId === null ? 'bg-[var(--accent-color)] text-black shadow-lg shadow-[var(--accent-color)]/30' : 'text-zinc-500 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white'}`}
            title={t('header_home')}
          >
            <HomeIcon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
          </button>
          
          <div className="w-16 h-px bg-gray-300 dark:bg-zinc-800 shrink-0 my-1"></div>

          {toolCards.map(tool => (
             <button
                key={tool.id}
                onClick={() => onSelectTool?.(tool.id)}
                className={`p-3 rounded-xl transition-all duration-200 group relative w-full flex justify-center ${selectedToolId === tool.id ? 'bg-[var(--accent-color)] text-black shadow-lg shadow-[var(--accent-color)]/30' : 'text-zinc-500 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white'}`}
                title={tool.title}
             >
                {getToolIcon(tool.id)}
             </button>
          ))}
      </div>

      <div className="mt-auto flex flex-col items-center gap-3 w-full pt-4 border-t border-gray-200 dark:border-zinc-800 flex-shrink-0 pb-2">
        <div ref={socialMenuRef} className="relative flex flex-col items-center">
            <button 
                onClick={() => setIsSocialMenuOpen(prev => !prev)}
                className="text-zinc-500 hover:text-black dark:hover:text-white p-2.5 rounded-full transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-zinc-800"
                aria-haspopup="true"
                aria-expanded={isSocialMenuOpen}
                aria-label={t('sidebar_share_label')}
            >
                <ShareIcon className="w-6 h-6 transition-transform duration-300 hover:scale-110" />
            </button>

            {isSocialMenuOpen && (
                <div 
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-auto bg-gray-100 dark:bg-zinc-800 rounded-lg shadow-lg p-2 flex flex-col items-center gap-3 animate-fade-in border border-gray-200 dark:border-zinc-700"
                    role="menu"
                >
                    <a href="https://www.facebook.com/ktscuongnm" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-[#1877F2] transition-colors duration-200" role="menuitem"><FacebookIcon /></a>
                    <a href="https://www.youtube.com/@ktsnguyencuong" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-[#FF0000] transition-colors duration-200" role="menuitem"><YoutubeIcon /></a>
                </div>
            )}
        </div>

        <div className="flex flex-row items-center gap-2 text-[10px] font-bold text-zinc-500">
            <button 
            onClick={() => setLanguage('vi')} 
            className={`w-8 py-1 rounded ${language === 'vi' ? 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white' : 'hover:text-black dark:hover:text-white'}`}>
            VI
            </button>
            <button 
            onClick={() => setLanguage('en')} 
            className={`w-8 py-1 rounded ${language === 'en' ? 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white' : 'hover:text-black dark:hover:text-white'}`}>
            EN
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
