import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChatIcon, CloseIcon, SendIcon, PlusIcon } from './icons/ChatIcons';
import { useLocalization } from '../contexts/LocalizationContext';

interface Message {
  role: 'user' | 'model';
  content: string;
  image?: string;
}

const Chatbot: React.FC = () => {
  const { t } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'model', content: t('chatbot_welcome') }]);
    }
  }, [isOpen, messages, t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setAttachedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasContent = input.trim() || attachedImage;
    if (!hasContent || isLoading) return;

    const userMessage: Message = { 
        role: 'user', 
        content: input.trim() || (attachedImage ? t('chatbot_sent_image') : ''), 
        image: attachedImage 
    };
    setMessages(prev => [...prev, userMessage]);
    
    const inputForApi = input;
    const attachedImageForApi = attachedImage;

    setInput('');
    setAttachedImage(null);
    setIsLoading(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let responseText: string;

        if (attachedImageForApi) {
            const qualityBooster = 'Ultra realistic, hyper-detailed, 8K resolution, photorealistic masterpiece, ultra sharp focus, high dynamic range, cinematic lighting, perfect composition, volumetric light, physically accurate texture, ultra-high-definition, detailed skin pores and materials, natural shadows, true-to-life colors, incredibly detailed, depth of field, high clarity, realistic contrast, fine detail, rich tones, professional photography, award-winning photo';
            const parts: any[] = [];
            const [header, base64Data] = attachedImageForApi.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1];
            if (mimeType && base64Data) {
                parts.push({ inlineData: { mimeType, data: base64Data } });
            }
            const finalInputText = (inputForApi.trim() || "Mô tả hình ảnh này.") + `, ${qualityBooster}`;
            parts.push({ text: finalInputText });
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts },
            });
            responseText = response.text;
        } else {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: inputForApi,
            });
            responseText = response.text;
        }

        const modelMessage: Message = { role: 'model', content: responseText };
        setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Gemini API error:', error);
      const errorMessage: Message = { role: 'model', content: t('chatbot_error') };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-[var(--accent-color)] text-black w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:brightness-95 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-opacity-50 z-50"
        aria-label={isOpen ? t('chatbot_close_label') : t('chatbot_open_label')}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>
      
      {isOpen && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm md:left-auto md:translate-x-0 md:right-6 h-[60vh] bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md rounded-xl shadow-2xl flex flex-col border border-gray-200 dark:border-zinc-700 overflow-hidden z-40 animate-fade-in">
          <header className="p-4 border-b border-gray-200 dark:border-zinc-700 flex items-center">
            <h2 className="text-lg font-semibold text-black dark:text-white">{t('chatbot_title')}</h2>
          </header>

          <div className="p-2 text-center text-xs text-red-600 dark:text-red-400 font-semibold bg-red-100/50 dark:bg-red-900/30 border-b border-gray-200 dark:border-zinc-700">
            {t('chatbot_coffee_banner')}
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-bubble-in`}>
                <div
                  className={`max-w-xs lg:max-w-md rounded-2xl overflow-hidden transition-opacity duration-300 ${
                    msg.role === 'user'
                      ? `bg-[var(--accent-color)] text-black rounded-br-none ${isLoading && index === messages.length - 1 ? 'opacity-60' : ''}`
                      : 'bg-gray-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-bl-none'
                  }`}
                >
                  {msg.image && (
                      <img src={msg.image} alt="User upload" className="max-w-full block" />
                  )}
                  {msg.content.trim() && (
                    <p className="text-sm break-words px-4 py-2">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
             {isLoading && (
              <div className="flex justify-start animate-bubble-in">
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-gray-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-bl-none">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 bg-[var(--accent-color)] rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-[var(--accent-color)] rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-[var(--accent-color)] rounded-full animate-pulse"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-zinc-700">
            {attachedImage && (
              <div className="relative w-24 h-24 mb-2 p-1 border border-gray-300 dark:border-zinc-600 rounded-lg">
                  <img src={attachedImage} alt="preview" className="w-full h-full object-cover rounded" />
                  <button onClick={() => setAttachedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
              />
              <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors rounded-full border-2 border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500"
                  aria-label={t('chatbot_attach_label')}
              >
                  <PlusIcon />
              </button>
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('chatbot_placeholder')}
                  className="w-full bg-gray-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 pl-4 pr-12 py-3 rounded-full border-2 border-transparent focus:border-[var(--accent-color)] focus:ring-0 outline-none transition-colors text-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:bg-zinc-600 disabled:cursor-not-allowed transition-colors"
                  disabled={(!input.trim() && !attachedImage) || isLoading}
                  aria-label={t('chatbot_send_label')}
                >
                  <SendIcon />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
