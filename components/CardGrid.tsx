import React from 'react';
import ToolCard from './ToolCard';
import { ToolCardData } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';

interface CardGridProps {
  onSelectTool: (id: number) => void;
  favoriteToolIds: number[];
  onToggleFavorite: (id: number) => void;
  cardsToDisplay: ToolCardData[];
  lockedToolIds: number[];
  isAdmin: boolean;
  onToggleLock: (id: number) => void;
}

const CardGrid: React.FC<CardGridProps> = ({ 
    onSelectTool, 
    favoriteToolIds, 
    onToggleFavorite, 
    cardsToDisplay,
    lockedToolIds,
    isAdmin,
    onToggleLock
}) => {
  const { t } = useLocalization();
  const toolCards = cardsToDisplay;

  if (cardsToDisplay && cardsToDisplay.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h3 className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">{t('favorites_empty_title')}</h3>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t('favorites_empty_desc')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      {toolCards.map((card: ToolCardData) => (
        <ToolCard
          key={card.id}
          card={card}
          onSelectTool={onSelectTool}
          isFavorite={favoriteToolIds.includes(card.id)}
          onToggleFavorite={onToggleFavorite}
          isLocked={lockedToolIds.includes(card.id)}
          isAdmin={isAdmin}
          onToggleLock={onToggleLock}
        />
      ))}
    </div>
  );
};

export default CardGrid;
