import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { GiftStatus } from '../types';
import { StatusBadge, EmptyState } from '../components/UI';
import { Search, ShoppingBag, ExternalLink, Gift as GiftIcon, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PublicView: React.FC = () => {
  const { people, gifts, categories } = useData();
  const [selectedPersonId, setSelectedPersonId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Filter logic: Only show public gifts
  const displayGifts = gifts.filter(g => {
    if (g.isPrivate) return false;
    const matchesPerson = selectedPersonId === 'all' || g.personId === selectedPersonId;
    const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPerson && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <GiftIcon className="text-white h-5 w-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">Вишлист</span>
            </div>
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/login')}
                className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Shield size={16} />
                Вход
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section / Filter */}
      <div className="bg-white border-b border-slate-200 py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                {selectedPersonId === 'all' ? 'Все желания' : people.find(p => p.id === selectedPersonId)?.name}
              </h1>
              <p className="mt-2 text-lg text-slate-500">
                {selectedPersonId === 'all' 
                  ? 'Список подарков для друзей и близких.' 
                  : people.find(p => p.id === selectedPersonId)?.description}
              </p>
            </div>
            
            {/* Filters */}
            <div className="flex gap-3 w-full md:w-auto">
               <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Найти подарок..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={selectedPersonId}
                onChange={(e) => setSelectedPersonId(e.target.value)}
              >
                <option value="all">Все списки</option>
                {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {displayGifts.length === 0 ? (
           <EmptyState title="Список пуст" description="Здесь пока ничего нет или ничего не найдено." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {displayGifts.map(gift => {
              const person = people.find(p => p.id === gift.personId);
              const category = categories.find(c => c.id === gift.categoryId);

              return (
                <div key={gift.id} className="group bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                  {/* Image */}
                  <div className="aspect-[4/3] overflow-hidden relative bg-slate-100">
                    <img 
                      src={gift.imageUrl} 
                      alt={gift.title} 
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${gift.status === GiftStatus.BOUGHT ? 'opacity-50 grayscale' : ''}`}
                    />
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={gift.status} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
                          {category?.name}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                            {person?.name}
                        </span>
                    </div>
                    
                    <h3 className={`text-lg font-bold text-slate-900 mb-1 ${gift.status === GiftStatus.BOUGHT ? 'line-through text-slate-400' : ''}`}>
                        {gift.title}
                    </h3>
                    
                    <p className="text-slate-500 font-medium mb-4">
                        {gift.price && gift.price > 0 ? `${gift.price} ₽` : 'Цена не указана'}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                         {gift.status !== GiftStatus.BOUGHT ? (
                            <a 
                                href={gift.url || '#'} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`inline-flex items-center text-sm font-medium px-4 py-2 rounded-lg transition-colors w-full justify-center ${
                                    gift.url 
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                                onClick={(e) => !gift.url && e.preventDefault()}
                            >
                                <ShoppingBag size={16} className="mr-2" />
                                {gift.url ? 'В магазин' : 'Нет ссылки'}
                            </a>
                         ) : (
                            <div className="w-full text-center text-sm text-slate-400 italic py-2">
                                Уже куплено
                            </div>
                         )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};