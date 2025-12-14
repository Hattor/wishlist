import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Gift, GiftStatus, Person } from '../types';
import { StorageService } from '../services/storage';
import { Button, Input, Modal, StatusBadge, EmptyState } from '../components/UI';
import { 
  LogOut, Plus, Trash2, Edit2, Search, ExternalLink, 
  Gift as GiftIcon, Users, Eye, EyeOff, Database, Cloud, WifiOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { people, gifts, categories, addOrUpdateGift, removeGift, addOrUpdatePerson, removePerson } = useData();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'gifts' | 'people'>('gifts');
  const [selectedPersonFilter, setSelectedPersonFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const isCloud = StorageService.isCloudMode();
  
  // Modal States
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  // Form States
  const [giftForm, setGiftForm] = useState<Partial<Gift>>({});
  const [personForm, setPersonForm] = useState<Partial<Person>>({});
  
  // DB Config State
  const [dbConfig, setDbConfig] = useState({ url: '', key: '' });

  const filteredGifts = useMemo(() => {
    return gifts.filter(g => {
      const matchesPerson = selectedPersonFilter === 'all' || g.personId === selectedPersonFilter;
      const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesPerson && matchesSearch;
    });
  }, [gifts, selectedPersonFilter, searchTerm]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveDbConfig = () => {
    if(dbConfig.url && dbConfig.key) {
      StorageService.saveCloudConfig(dbConfig.url, dbConfig.key);
    }
  };

  const handleDisconnectDb = () => {
    if(confirm('Вы уверены? Приложение переключится на локальные данные.')) {
      StorageService.disconnectCloud();
    }
  };

  const handleSaveGift = async () => {
    if (!giftForm.title || !giftForm.personId || !giftForm.categoryId) return;
    
    const newGift: Gift = {
      id: editingGift ? editingGift.id : crypto.randomUUID(),
      title: giftForm.title,
      personId: giftForm.personId,
      categoryId: giftForm.categoryId,
      price: giftForm.price || 0,
      url: giftForm.url || '',
      imageUrl: giftForm.imageUrl || `https://picsum.photos/400/300?random=${Math.floor(Math.random()*100)}`,
      status: giftForm.status || GiftStatus.WANT,
      isPrivate: giftForm.isPrivate || false,
      notes: giftForm.notes || '',
      createdAt: editingGift ? editingGift.createdAt : Date.now(),
    };

    await addOrUpdateGift(newGift);
    setIsGiftModalOpen(false);
    setEditingGift(null);
    setGiftForm({});
  };

  const handleSavePerson = async () => {
    if (!personForm.name) return;
    
    const newPerson: Person = {
      id: editingPerson ? editingPerson.id : crypto.randomUUID(),
      name: personForm.name,
      description: personForm.description || '',
      avatarUrl: personForm.avatarUrl || `https://picsum.photos/200/200?random=${Math.floor(Math.random()*100)}`,
    };

    await addOrUpdatePerson(newPerson);
    setIsPersonModalOpen(false);
    setEditingPerson(null);
    setPersonForm({});
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col h-screen sticky top-0">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight text-indigo-400">Панель управления</h1>
          <div className={`mt-2 flex items-center text-xs ${isCloud ? 'text-emerald-400' : 'text-orange-400'}`}>
             {isCloud ? <Cloud size={14} className="mr-1"/> : <WifiOff size={14} className="mr-1"/>}
             {isCloud ? 'Облако активно' : 'Локальный режим'}
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('gifts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'gifts' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <GiftIcon size={20} />
            <span>Подарки</span>
          </button>
          <button 
            onClick={() => setActiveTab('people')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'people' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Users size={20} />
            <span>Люди / Списки</span>
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Button variant="secondary" className="w-full justify-start bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white" onClick={() => setIsDbModalOpen(true)}>
            <Database size={18} className="mr-2" />
            База Данных
          </Button>
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-slate-800" onClick={handleLogout}>
            <LogOut size={18} className="mr-2" />
            Выйти
          </Button>
          <Button variant="ghost" className="w-full mt-2 justify-start text-indigo-400 hover:text-indigo-300 hover:bg-slate-800" onClick={() => navigate('/')}>
            <ExternalLink size={18} className="mr-2" />
            К вишлисту
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 capitalize">
              {activeTab === 'gifts' ? 'Управление подарками' : 'Управление людьми'}
            </h2>
            <p className="text-slate-500">Добавляйте ссылки и меняйте статусы</p>
            {!isCloud && (
              <p className="text-orange-600 text-sm mt-1 bg-orange-50 inline-block px-2 py-1 rounded border border-orange-200">
                ⚠ Вы в локальном режиме. Данные видите только вы.
              </p>
            )}
          </div>
          <Button onClick={() => activeTab === 'gifts' ? setIsGiftModalOpen(true) : setIsPersonModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            Добавить
          </Button>
        </header>

        {activeTab === 'gifts' && (
          <div className="space-y-6">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Поиск подарков..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white"
                value={selectedPersonFilter}
                onChange={(e) => setSelectedPersonFilter(e.target.value)}
              >
                <option value="all">Все списки</option>
                {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {filteredGifts.length === 0 ? (
                <EmptyState title="Подарки не найдены" description="Добавьте первый подарок в список." />
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Название</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Кому</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Категория</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Статус</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Вид</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Действия</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                    {filteredGifts.map(gift => (
                        <tr key={gift.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                            <img className="h-10 w-10 rounded object-cover mr-3" src={gift.imageUrl} alt="" />
                            <div>
                                <div className="text-sm font-medium text-slate-900">{gift.title}</div>
                                <div className="text-sm text-slate-500">{gift.price} ₽</div>
                            </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {people.find(p => p.id === gift.personId)?.name || 'Неизвестно'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${categories.find(c => c.id === gift.categoryId)?.color}-100 text-slate-800`}>
                            {categories.find(c => c.id === gift.categoryId)?.name || 'Общее'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={gift.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {gift.isPrivate ? <EyeOff size={16} className="text-slate-400" /> : <Eye size={16} className="text-emerald-500" />}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-4" onClick={() => {
                                setEditingGift(gift);
                                setGiftForm(gift);
                                setIsGiftModalOpen(true);
                            }}>
                                <Edit2 size={18} />
                            </button>
                            <button className="text-red-600 hover:text-red-900" onClick={() => removeGift(gift.id)}>
                                <Trash2 size={18} />
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}
          </div>
        )}

        {activeTab === 'people' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {people.map(person => (
                    <div key={person.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center space-x-4">
                        <img src={person.avatarUrl} alt={person.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-offset-2 ring-indigo-100" />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-slate-900 truncate">{person.name}</h3>
                            <p className="text-sm text-slate-500 truncate">{person.description}</p>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50" onClick={() => {
                                setEditingPerson(person);
                                setPersonForm(person);
                                setIsPersonModalOpen(true);
                            }}>
                                <Edit2 size={18} />
                            </button>
                             <button className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50" onClick={() => removePerson(person.id)}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
             </div>
        )}
      </main>

      {/* --- MODALS --- */}
      
      {/* Database Setup Modal */}
      <Modal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        title="Настройка базы данных (Supabase)"
      >
        <div className="space-y-4">
            <p className="text-sm text-slate-600">
                Чтобы ваши списки были доступны всем в интернете, создайте бесплатный проект на <a href="https://supabase.com" target="_blank" className="text-indigo-600 underline">supabase.com</a> и введите данные ниже.
            </p>
            <div className="bg-slate-100 p-3 rounded text-xs text-slate-700 font-mono">
                Требуется выполнить SQL Query в Supabase:<br/>
                create table people (id text primary key, name text, description text, "avatarUrl" text);<br/>
                create table categories (id text primary key, name text, color text);<br/>
                create table gifts (id text primary key, "personId" text, "categoryId" text, title text, price numeric, url text, "imageUrl" text, status text, "isPrivate" boolean, notes text, "createdAt" numeric);
            </div>
            <Input 
                label="Project URL" 
                placeholder="https://xyz.supabase.co"
                value={dbConfig.url}
                onChange={e => setDbConfig({...dbConfig, url: e.target.value})}
            />
             <Input 
                label="API Key (anon / public)" 
                placeholder="eyJhb..."
                value={dbConfig.key}
                onChange={e => setDbConfig({...dbConfig, key: e.target.value})}
            />
            <div className="flex justify-between gap-3 mt-6">
                {isCloud ? (
                    <Button variant="danger" onClick={handleDisconnectDb}>Отключить облако</Button>
                ) : (
                    <div></div>
                )}
                <div className="flex gap-2">
                     <Button variant="secondary" onClick={() => setIsDbModalOpen(false)}>Закрыть</Button>
                     <Button onClick={handleSaveDbConfig}>Сохранить и подключить</Button>
                </div>
            </div>
        </div>
      </Modal>
      
      {/* Gift Modal */}
      <Modal 
        isOpen={isGiftModalOpen} 
        onClose={() => { setIsGiftModalOpen(false); setEditingGift(null); setGiftForm({}); }} 
        title={editingGift ? 'Редактировать подарок' : 'Новый подарок'}
      >
        <div className="space-y-4">
          <Input 
            label="Название" 
            value={giftForm.title || ''} 
            onChange={e => setGiftForm({...giftForm, title: e.target.value})} 
            placeholder="Например: Фотоаппарат"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Для кого</label>
              <select 
                className="w-full rounded-lg border-slate-300 shadow-sm border p-2"
                value={giftForm.personId || ''}
                onChange={e => setGiftForm({...giftForm, personId: e.target.value})}
              >
                <option value="">Выберите...</option>
                {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Категория</label>
              <select 
                className="w-full rounded-lg border-slate-300 shadow-sm border p-2"
                value={giftForm.categoryId || ''}
                onChange={e => setGiftForm({...giftForm, categoryId: e.target.value})}
              >
                <option value="">Выберите...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
                label="Цена (₽)" 
                type="number" 
                value={giftForm.price || ''} 
                onChange={e => setGiftForm({...giftForm, price: Number(e.target.value)})} 
            />
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Статус</label>
                <select 
                    className="w-full rounded-lg border-slate-300 shadow-sm border p-2"
                    value={giftForm.status || GiftStatus.WANT}
                    onChange={e => setGiftForm({...giftForm, status: e.target.value as GiftStatus})}
                >
                    <option value={GiftStatus.WANT}>Хочу</option>
                    <option value={GiftStatus.RESERVED}>В планах (бронь)</option>
                    <option value={GiftStatus.BOUGHT}>Куплено</option>
                </select>
            </div>
          </div>
          <Input 
            label="Ссылка на магазин (URL)" 
            value={giftForm.url || ''} 
            onChange={e => setGiftForm({...giftForm, url: e.target.value})} 
            placeholder="https://ozon.ru/..."
          />
          <div className="flex items-center gap-2">
            <input 
                type="checkbox" 
                id="isPrivate" 
                checked={giftForm.isPrivate || false}
                onChange={e => setGiftForm({...giftForm, isPrivate: e.target.checked})}
                className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isPrivate" className="text-sm text-slate-700">Скрыть из публичного доступа (черновик)</label>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsGiftModalOpen(false)}>Отмена</Button>
            <Button onClick={handleSaveGift}>Сохранить</Button>
          </div>
        </div>
      </Modal>

      {/* Person Modal */}
      <Modal 
        isOpen={isPersonModalOpen} 
        onClose={() => { setIsPersonModalOpen(false); setEditingPerson(null); setPersonForm({}); }} 
        title={editingPerson ? 'Редактировать список' : 'Новый список'}
      >
        <div className="space-y-4">
          <Input 
            label="Имя / Название списка" 
            value={personForm.name || ''} 
            onChange={e => setPersonForm({...personForm, name: e.target.value})} 
            placeholder="Анна"
          />
          <Input 
            label="Описание (событие)" 
            value={personForm.description || ''} 
            onChange={e => setPersonForm({...personForm, description: e.target.value})} 
            placeholder="День рождения"
          />
           <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsPersonModalOpen(false)}>Отмена</Button>
            <Button onClick={handleSavePerson}>Сохранить</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};