
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CardGrid from './components/CardGrid';
import ArchitecturalVisualizationTool from './components/ArchitecturalVisualizationTool';
import Chatbot from './components/Chatbot';
import SettingsView from './components/SettingsView';
import ThirtySixtyVirtualTourTool from './components/ThirtySixtyVirtualTourTool';
import MotionImageTool from './components/MotionImageTool';
import PhotoEditingTool from './components/PhotoEditingTool';
import TechnicalDrawingTool from './components/TechnicalDrawingTool';
import LuBanRulerTool from './components/LuBanRulerTool';
import BatTrachTool from './components/BatTrachTool';
import PlanningTool from './components/PlanningTool';
import LoginView from './components/LoginView';
import ToolManagementView from './components/ToolManagementView';
import Ctaivid from './components/Ctaivid';
import AIArchitectureTool from './components/AIArchitectureTool';
import UserManagementView from './components/UserManagementView';
import GuideView from './components/GuideView';
import { getToolCards } from './constants';
import ReferenceTool from './components/ReferenceTool';
import AIUpscaleTool from './components/AIUpscaleTool';
import SunWindAnalysisTool from './components/SunWindAnalysisTool';
import { useLocalization } from './contexts/LocalizationContext';

type View = 'home' | 'favorites' | 'history' | 'settings' | 'login' | 'toolManagement' | 'userManagement' | 'guide';

const FAVORITES_KEY = 'ctai_favorite_tools';
const ACCENT_COLOR_KEY = 'ctai_accent_color';
const BACKGROUND_KEY = 'ctai_background';
const DEFAULT_ACCENT_COLOR = '#facc15'; // Tailwind's yellow-400
const ADMIN_KEY = 'ctai_is_admin';
const LOCKED_TOOLS_KEY = 'ctai_locked_tools';

const CloseIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const hexToRgb = (hex: string): string => {
  let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '250, 204, 21';
};

const App: React.FC = () => {
  const { t } = useLocalization();
  const toolCards = getToolCards(t);

  // Simplified state - this is what's rendered.
  const [selectedToolId, setSelectedToolId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<View>('home');
  const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState(false);
  
  const [favoriteToolIds, setFavoriteToolIds] = useState<number[]>(() => {
    try {
      const storedFavorites = window.localStorage.getItem(FAVORITES_KEY);
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    } catch (error) {
      console.error("Error reading favorites from localStorage", error);
      return [];
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme === 'light') {
        return 'light';
      }
    }
    return 'dark';
  });

  const [accentColor, setAccentColor] = useState<string>(() => {
    try {
      const storedAccent = window.localStorage.getItem(ACCENT_COLOR_KEY);
      return storedAccent || DEFAULT_ACCENT_COLOR;
    } catch (error) {
      console.error("Error reading accent color from localStorage", error);
      return DEFAULT_ACCENT_COLOR;
    }
  });
  
  const [background, setBackground] = useState<string>(() => {
    try {
      return window.localStorage.getItem(BACKGROUND_KEY) || 'solid';
    } catch (error) {
      console.error("Error reading background from localStorage", error);
      return 'solid';
    }
  });

  // Admin State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(ADMIN_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [lockedToolIds, setLockedToolIds] = useState<number[]>(() => {
    try {
      const storedLockedTools = window.localStorage.getItem(LOCKED_TOOLS_KEY);
      // If there's no stored preference, the tool is unlocked by default.
      if (storedLockedTools === null) {
          return [];
      }
      return JSON.parse(storedLockedTools);
    } catch {
      // Fallback to unlocked on error.
      return [];
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement.style;
    root.setProperty('--accent-color', accentColor);
    root.setProperty('--accent-color-rgb', hexToRgb(accentColor));
    try {
      localStorage.setItem(ACCENT_COLOR_KEY, accentColor);
    } catch (error) {
      console.error("Error saving accent color to localStorage", error);
    }
  }, [accentColor]);
  
  useEffect(() => {
    try {
      localStorage.setItem(BACKGROUND_KEY, background);
    } catch (error) {
      console.error("Error saving background to localStorage", error);
    }

    document.body.classList.remove('bg-white', 'dark:bg-zinc-900');
    if (background === 'solid') {
      document.body.style.backgroundImage = '';
      document.body.classList.add('bg-white', 'dark:bg-zinc-900');
    } else {
      document.body.style.backgroundImage = background;
    }
  }, [background]);
  
  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteToolIds));
    } catch (error) {
      console.error("Error saving favorites to localStorage", error);
    }
  }, [favoriteToolIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCKED_TOOLS_KEY, JSON.stringify(lockedToolIds));
    } catch (error) {
      console.error("Error saving locked tools to localStorage", error);
    }
  }, [lockedToolIds]);
  
  const handleToggleFavorite = (id: number) => {
    setFavoriteToolIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(favId => favId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  const handleToggleLock = (id: number) => {
    if (!isAdmin) return;
    setLockedToolIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(lockId => lockId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleToggleAdmin = (enable: boolean) => {
    setIsAdmin(enable);
    try {
        if (enable) {
            window.localStorage.setItem(ADMIN_KEY, 'true');
            alert(t('admin_mode_enabled'));
        } else {
            window.localStorage.removeItem(ADMIN_KEY);
            alert(t('admin_mode_disabled'));
        }
    } catch (error) {
        console.error("Error setting admin state in localStorage", error);
    }
  };

  const handleAdminLogin = (password: string): boolean => {
    if (password === 'manhcuong') {
        handleToggleAdmin(true);
        setCurrentView('home');
        return true;
    }
    return false;
  };

  const handleLogout = () => {
      handleToggleAdmin(false);
  };

  const handleSelectTool = (id: number) => {
    if (lockedToolIds.includes(id) && !isAdmin) {
        alert(t('tool_card_locked_alert'));
        return;
    }
    if ((id >= 1 && id <= 14)) {
      setSelectedToolId(id);
    } else {
      alert(t('tool_card_develop_alert'));
    }
  };

  const handleBack = () => {
    setSelectedToolId(null);
    setCurrentView('home');
  };
  
  const handleNavigate = (view: View) => {
      setCurrentView(view);
      setSelectedToolId(null);
  }

  const renderContent = () => {
      // Render based on the current state
      switch(currentView) {
          case 'home':
              return <CardGrid 
                        onSelectTool={handleSelectTool} 
                        cardsToDisplay={toolCards}
                        favoriteToolIds={favoriteToolIds}
                        onToggleFavorite={handleToggleFavorite}
                        lockedToolIds={lockedToolIds}
                        isAdmin={isAdmin}
                        onToggleLock={handleToggleLock}
                      />;
          case 'favorites':
              const favoriteTools = toolCards.filter(card => favoriteToolIds.includes(card.id));
              return <CardGrid 
                        onSelectTool={handleSelectTool} 
                        cardsToDisplay={favoriteTools}
                        favoriteToolIds={favoriteToolIds}
                        onToggleFavorite={handleToggleFavorite}
                        lockedToolIds={lockedToolIds}
                        isAdmin={isAdmin}
                        onToggleLock={handleToggleLock}
                      />;
          case 'history':
              return <Ctaivid />;
          case 'settings':
              return <SettingsView theme={theme} setTheme={setTheme} accentColor={accentColor} setAccentColor={setAccentColor} background={background} setBackground={setBackground} />;
          case 'login':
              return <LoginView onAdminLogin={handleAdminLogin} onBack={() => setCurrentView('home')} />;
          case 'toolManagement':
                return <ToolManagementView
                          allTools={toolCards}
                          lockedToolIds={lockedToolIds}
                          onToggleLock={handleToggleLock}
                       />;
          case 'userManagement':
                return <UserManagementView />;
          case 'guide':
                return <GuideView />;
          default:
              return <CardGrid 
                        onSelectTool={handleSelectTool} 
                        cardsToDisplay={toolCards}
                        favoriteToolIds={favoriteToolIds}
                        onToggleFavorite={handleToggleFavorite}
                        lockedToolIds={lockedToolIds}
                        isAdmin={isAdmin}
                        onToggleLock={handleToggleLock}
                      />;
      }
  }

  const renderTool = () => {
    // Render based on the current state
    switch (selectedToolId) {
      case 1:
        return <ArchitecturalVisualizationTool onBack={handleBack} />;
      case 2:
        return <ThirtySixtyVirtualTourTool onBack={handleBack} />;
      case 3:
        return <MotionImageTool onBack={handleBack} />;
      case 4:
        return <PhotoEditingTool onBack={handleBack} />;
      case 5:
        return <TechnicalDrawingTool onBack={handleBack} />;
      case 6:
        return <LuBanRulerTool onBack={handleBack} />;
      case 7:
        return <BatTrachTool onBack={handleBack} />;
      case 8:
        return <PlanningTool onBack={handleBack} />;
      case 9:
        return <AIArchitectureTool onBack={handleBack} />;
      case 10:
        return <ReferenceTool onBack={handleBack} />;
      case 12:
        return <AIUpscaleTool onBack={handleBack} />;
      case 14:
        return <SunWindAnalysisTool onBack={handleBack} />;
      default:
        return null;
    }
  };
  
  return (
    <>
      <div className="flex min-h-screen font-sans text-zinc-800 dark:text-zinc-200">
        <Sidebar 
          toolCards={toolCards}
          selectedToolId={selectedToolId}
          onSelectTool={handleSelectTool}
          onGoHome={handleBack}
        />
        <div className="flex-1 flex flex-col max-h-screen bg-white/90 dark:bg-zinc-900/80 backdrop-blur-lg">
          <div className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
            {selectedToolId === null ? (
              <>
                <Header 
                  currentView={currentView} 
                  onNavigate={handleNavigate} 
                  isAdmin={isAdmin}
                  onLogout={handleLogout}
                />
                <main className="flex-1">{renderContent()}</main>
              </>
            ) : (
              renderTool()
            )}
          </div>
          <Chatbot />
          <footer className="flex-shrink-0 p-4 border-t border-gray-200/50 dark:border-zinc-800/50 text-center text-xs text-zinc-500 dark:text-zinc-400">
            <span>© 2025 CTAI STUDIO</span>
            <span className="mx-2">|</span>
            <button onClick={() => setIsCoffeeModalOpen(true)} className="font-bold text-[var(--accent-color)] animate-pulse hover:brightness-125 transition-all">
              {t('footer_coffee_button')}
            </button>
          </footer>
        </div>
      </div>

      {isCoffeeModalOpen && (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsCoffeeModalOpen(false)}
        >
            <div 
                className="relative bg-zinc-800 border border-zinc-700 rounded-xl max-w-sm w-full p-8 text-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={() => setIsCoffeeModalOpen(false)}
                    className="absolute top-3 right-3 p-2 text-zinc-400 hover:text-white transition-colors rounded-full"
                    aria-label={t('coffee_modal_close_label')}
                >
                    <CloseIcon />
                </button>
                
                <h3 className="text-2xl font-bold text-[var(--accent-color)] mb-6">{t('coffee_modal_title')}</h3>
                
                <div className="space-y-4 text-zinc-200">
                    <div>
                        <span className="font-semibold block text-zinc-400">{t('coffee_modal_zalo')}</span>
                        <span className="text-lg text-white tracking-wider">0589 33 8888</span>
                    </div>
                    <div>
                        <span className="font-semibold block text-zinc-400">{t('coffee_modal_mbbank')}</span>
                        <span className="text-lg text-white tracking-wider">0589 33 8888</span>
                    </div>
                </div>

                <p className="mt-8 text-zinc-400 text-sm">
                    {t('coffee_modal_thanks')}
                </p>
            </div>
        </div>
      )}
    </>
  );
};

export default App;
