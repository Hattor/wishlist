import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '../components/UI';
import { Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/admin');
    } else {
      setError('Неверный логин или пароль. Попробуйте: admin / admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
            <Lock size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Вход в панель</h2>
          <p className="text-slate-500 mt-2">Управление списками подарков</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Имя пользователя" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            placeholder="admin"
          />
          <Input 
            label="Пароль" 
            type="password"
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="admin"
          />
          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
          
          <Button type="submit" className="w-full" size="lg">Войти</Button>
        </form>
        <div className="mt-6 text-center">
            <button onClick={() => navigate('/')} className="text-sm text-slate-500 hover:text-indigo-600 underline">
                Вернуться к вишлисту
            </button>
        </div>
      </div>
    </div>
  );
};