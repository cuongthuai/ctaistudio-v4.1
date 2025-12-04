
import React, { useState } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { 
  ArchVizIcon, View360Icon, VideoIcon, EditIcon, 
  DrawingIcon, RulerIcon, CompassIcon, MapIcon, CalculatorIcon, BookIcon, MagicWandIcon, SunWindIcon
} from './icons/SidebarIcons';

const ChevronDownIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const ChevronUpIcon: React.FC<{className?: string}> = ({className}) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>);

interface GuideItem {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  stepsKey: string;
}

const GuideView: React.FC = () => {
  const { t } = useLocalization();
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const guides: GuideItem[] = [
    { id: 'arch_viz', icon: <ArchVizIcon className="w-6 h-6 text-yellow-500"/>, titleKey: 'tool_1_title', stepsKey: 'guide_arch_viz_steps' },
    { id: 'sun_wind', icon: <SunWindIcon className="w-6 h-6 text-red-500"/>, titleKey: 'tool_14_title', stepsKey: 'guide_sun_wind_steps' },
    { id: 'view_360', icon: <View360Icon className="w-6 h-6 text-blue-500"/>, titleKey: 'tool_2_title', stepsKey: 'guide_360_steps' },
    { id: 'video', icon: <VideoIcon className="w-6 h-6 text-purple-500"/>, titleKey: 'tool_3_title', stepsKey: 'guide_video_steps' },
    { id: 'edit', icon: <EditIcon className="w-6 h-6 text-green-500"/>, titleKey: 'tool_4_title', stepsKey: 'guide_edit_steps' },
    { id: 'drawing', icon: <DrawingIcon className="w-6 h-6 text-orange-500"/>, titleKey: 'tool_5_title', stepsKey: 'guide_drawing_steps' },
    { id: 'ruler', icon: <RulerIcon className="w-6 h-6 text-red-500"/>, titleKey: 'tool_6_title', stepsKey: 'guide_luban_steps' },
    { id: 'fengshui', icon: <CompassIcon className="w-6 h-6 text-indigo-500"/>, titleKey: 'tool_7_title', stepsKey: 'guide_fengshui_steps' },
    { id: 'planning', icon: <MapIcon className="w-6 h-6 text-teal-500"/>, titleKey: 'tool_8_title', stepsKey: 'guide_planning_steps' },
    { id: 'costing', icon: <CalculatorIcon className="w-6 h-6 text-pink-500"/>, titleKey: 'tool_9_title', stepsKey: 'guide_costing_steps' },
    { id: 'reference', icon: <BookIcon className="w-6 h-6 text-gray-500"/>, titleKey: 'tool_10_title', stepsKey: 'guide_reference_steps' },
    { id: 'upscale', icon: <MagicWandIcon className="w-6 h-6 text-cyan-500"/>, titleKey: 'header_upscale', stepsKey: 'guide_upscale_steps' },
  ];

  const toggleItem = (id: string) => {
    setOpenItemId(openItemId === id ? null : id);
  };

  return (
    <div className="w-full h-full flex flex-col animate-fade-in bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">{t('guide_title')}</h1>
          <p className="text-zinc-600 dark:text-zinc-400">{t('guide_intro')}</p>
        </div>

        <div className="space-y-4">
          {guides.map((guide) => (
            <div key={guide.id} className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
              <button 
                onClick={() => toggleItem(guide.id)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-700/80 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
                    {guide.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">{t(guide.titleKey)}</h3>
                </div>
                {openItemId === guide.id ? <ChevronUpIcon className="w-5 h-5 text-zinc-500"/> : <ChevronDownIcon className="w-5 h-5 text-zinc-500"/>}
              </button>
              
              {openItemId === guide.id && (
                <div className="px-6 py-6 bg-white dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700 animate-fade-in">
                  <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">Các bước thực hiện</h4>
                  <ul className="space-y-2">
                    {t(guide.stepsKey).split('\n').map((step, index) => {
                      if (step.trim().startsWith('###')) {
                        return (
                          <li key={index} className="pt-4 pb-2 first:pt-0">
                            <h5 className="text-[var(--accent-color)] font-bold text-base">{step.replace(/^###\s*/, '')}</h5>
                          </li>
                        );
                      }
                      return (
                        <li key={index} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                          <span className="flex-shrink-0 w-1.5 h-1.5 bg-zinc-400 rounded-full mt-2"></span>
                          <span>{step}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
            <p className="text-sm text-blue-800 dark:text-blue-300">
                Cần hỗ trợ thêm? Hãy sử dụng <strong>Trợ lý AI (Chatbot)</strong> ở góc dưới bên phải màn hình để đặt câu hỏi trực tiếp.
            </p>
        </div>
      </div>
    </div>
  );
};

export default GuideView;
