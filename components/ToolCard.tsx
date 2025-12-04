import React from 'react';
import { ToolCardData } from '../types';
import { StarIcon } from './icons/FavoriteIcons';
import { LockIcon } from './icons/AdminIcons';
import { useLocalization } from '../contexts/LocalizationContext';

interface ToolCardProps {
  card: ToolCardData;
  onSelectTool: (id: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  isLocked: boolean;
  isAdmin: boolean;
  onToggleLock: (id: number) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ card, onSelectTool, isFavorite, onToggleFavorite, isLocked, isAdmin, onToggleLock }) => {
  const { t } = useLocalization();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onToggleFavorite(card.id);
  };
  
  const handleLockClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onToggleLock(card.id);
  };

  const isDisabled = isLocked && !isAdmin;

  const handleCardClick = () => {
    if (isDisabled) {
        alert(t('tool_card_locked_alert'));
        return;
    }
    onSelectTool(card.id);
  }

  return (
    <div 
      className={`group relative block aspect-[3/2] w-full overflow-hidden rounded-xl bg-gray-200 dark:bg-zinc-800 shadow-lg transition-all duration-300 
                 ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:shadow-xl hover:shadow-[var(--accent-color)]/25 hover:!scale-105 hover:-translate-y-2'}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-label={t('tool_card_open_label').replace('{title}', card.title)}
      aria-disabled={isDisabled}
    >
      <img
        src={card.imageUrl}
        alt={card.title}
        className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-in-out ${isDisabled ? 'grayscale' : 'group-hover:scale-110 grayscale group-hover:grayscale-0'} ${card.imageClass || 'object-center'}`}
      />
      
      {card.badge && (
        <div className="absolute top-2.5 right-2.5 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg uppercase">
          {card.badge}
        </div>
      )}

      {isDisabled && (
         <div className="absolute top-2.5 left-2.5 z-10 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg uppercase flex items-center gap-1">
          <LockIcon isLocked={true} className="w-3 h-3"/>
          <span>{t('tool_card_locked_badge')}</span>
        </div>
      )}

      <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
        {isAdmin && (
           <button
            onClick={handleLockClick}
            className={`p-1.5 rounded-full transition-all duration-200 
                      ${isLocked ? 'bg-red-600 text-white' : 'bg-black/40 text-white/70 opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:text-white'}`}
            aria-label={isLocked ? t('tool_card_unlock_label') : t('tool_card_lock_label')}
          >
            <LockIcon isLocked={isLocked} className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={handleFavoriteClick}
          className={`p-1.5 rounded-full transition-all duration-200 
                    ${isFavorite ? 'bg-[rgba(var(--accent-color-rgb),0.8)] text-white' : 'bg-black/40 text-white/70 opacity-0 group-hover:opacity-100 hover:bg-[rgba(var(--accent-color-rgb),0.8)] hover:text-white'} `}
          aria-label={isFavorite ? t('tool_card_remove_fav_label') : t('tool_card_add_fav_label')}
        >
          <StarIcon isFilled={isFavorite} className="w-5 h-5" />
        </button>
      </div>


      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-all duration-500 group-hover:from-black/70 group-hover:via-black/30"></div>
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white transition-transform duration-300 ease-in-out group-hover:-translate-y-2">
        <span className="block bg-[rgba(var(--accent-color-rgb),0.8)] backdrop-blur-sm text-black text-xs font-bold px-2 py-1 rounded-md">
          {card.tag}
        </span>
        <h3 className="mt-2 text-lg font-semibold text-shadow">{card.title}</h3>
        <p className="mt-1 text-sm text-zinc-300 text-shadow-sm">{card.description}</p>
      </div>
    </div>
  );
};

export default ToolCard;
