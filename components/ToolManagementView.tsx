
import React, { useState } from 'react';
import { ToolCardData } from '../types';

const CheckCircleIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

interface ToolManagementViewProps {
  allTools: ToolCardData[];
  lockedToolIds: number[];
  onToggleLock: (id: number) => void;
}

const ToolManagementView: React.FC<ToolManagementViewProps> = ({ allTools, lockedToolIds, onToggleLock }) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveChanges = () => {
    // Changes are saved automatically. This button provides user feedback.
    setIsSaved(true);
    setTimeout(() => {
        setIsSaved(false);
    }, 2000);
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white">Quản lý Công cụ</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Bật hoặc tắt khóa truy cập cho từng công cụ.</p>
      </div>

      <div className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700">
        <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
          {allTools.map((tool) => {
            const isLocked = lockedToolIds.includes(tool.id);
            return (
              <li key={tool.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <img src={tool.imageUrl} alt={tool.title} className="w-16 h-12 object-cover rounded-md flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">{tool.title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{tool.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <span className={`text-xs font-bold uppercase w-14 text-right ${isLocked ? 'text-red-500' : 'text-green-500'}`}>
                        {isLocked ? 'Đã khóa' : 'Mở'}
                    </span>
                    <label htmlFor={`toggle-${tool.id}`} className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id={`toggle-${tool.id}`}
                            className="sr-only peer"
                            checked={isLocked}
                            onChange={() => onToggleLock(tool.id)}
                        />
                        <div className="w-11 h-6 bg-gray-300 dark:bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-zinc-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleSaveChanges}
          disabled={isSaved}
          className={`flex items-center justify-center gap-2 font-semibold px-8 py-3 rounded-md transition-all duration-300 transform 
            ${isSaved
              ? 'bg-green-600 text-white cursor-default scale-105'
              : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105'
            }`}
        >
          {isSaved ? (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              <span>Đã lưu!</span>
            </>
          ) : (
            'Lưu lại toàn bộ thay đổi'
          )}
        </button>
      </div>
    </div>
  );
};

export default ToolManagementView;
