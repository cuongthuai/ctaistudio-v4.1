import React, { useState } from 'react';

interface LoginViewProps {
  onAdminLogin: (password: string) => boolean;
  onBack: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onAdminLogin, onBack }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = onAdminLogin(password);
    if (!success) {
      setError('Mật khẩu không chính xác. Vui lòng thử lại.');
      setPassword('');
    }
  };

  return (
    <div className="animate-fade-in max-w-md mx-auto mt-10">
      <div className="bg-gray-100/50 dark:bg-zinc-800/50 p-8 rounded-xl border border-gray-300 dark:border-zinc-700 text-center shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-wider text-black dark:text-white mb-6">Đăng nhập Quản trị</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password-input" className="sr-only">Mật khẩu</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu của bạn"
              className="w-full px-4 py-3 bg-white/80 dark:bg-zinc-800/80 border-2 border-gray-200 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] outline-none transition-colors text-center"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-md transition-all duration-300 transform hover:scale-105 disabled:bg-zinc-500 disabled:scale-100"
            disabled={!password}
          >
            Đăng nhập
          </button>
        </form>
         <button onClick={onBack} className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 hover:underline">
          Quay lại Trang chủ
        </button>
      </div>
    </div>
  );
};

export default LoginView;
