import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';

type View = 'home' | 'favorites' | 'history' | 'settings' | 'login' | 'toolManagement' | 'userManagement' | 'guide';

interface NavLinkProps {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ onClick, children, active = false }) => (
  <li>
    <button 
      onClick={onClick}
      className={`relative text-xs font-semibold tracking-widest uppercase pb-1 flex items-center
        ${active ? 'text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}
        hover:text-black dark:hover:text-white transition-colors duration-200
        after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-black dark:after:bg-white
        after:transition-all after:duration-300 ${active ? 'after:w-full' : 'after:w-0'} hover:after:w-full`}
    >
      {children}
    </button>
  </li>
);

interface HeaderProps {
    currentView: View;
    onNavigate: (view: View) => void;
    isAdmin: boolean;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, isAdmin, onLogout }) => {
  const { t } = useLocalization();

  return (
    <header className="mb-8 md:mb-12">
      <nav className="flex justify-center md:justify-end items-center flex-wrap mb-12 md:mb-16">
        <ul className="flex items-center flex-wrap justify-center gap-x-6 gap-y-3">
          <NavLink onClick={() => onNavigate('home')} active={currentView === 'home'}>{t('header_home')}</NavLink>
          <NavLink onClick={() => onNavigate('guide')} active={currentView === 'guide'}>{t('header_guide')}</NavLink>
          {isAdmin && (
             <NavLink onClick={() => onNavigate('toolManagement')} active={currentView === 'toolManagement'}>{t('header_admin_manage')}</NavLink>
          )}
          {isAdmin && (
             <NavLink onClick={() => onNavigate('userManagement')} active={currentView === 'userManagement'}>{t('header_admin_users')}</NavLink>
          )}
          <NavLink onClick={() => onNavigate('settings')} active={currentView === 'settings'}>{t('header_settings')}</NavLink>
          {isAdmin ? (
            <NavLink onClick={onLogout}>{t('header_logout')}</NavLink>
          ) : (
            <NavLink onClick={() => onNavigate('login')} active={currentView === 'login'}>{t('header_login')}</NavLink>
          )}
        </ul>
      </nav>
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-widest text-black dark:text-white">CTAI STUDIO</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-base sm:text-lg">{t('header_subtitle')}</p>
      </div>
    </header>
  );
};

export default Header;