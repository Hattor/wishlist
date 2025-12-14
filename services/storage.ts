import { Person, Gift, Category, GiftStatus } from '../types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- Конфигурация ---
const LOCAL_STORAGE_KEYS = {
  PEOPLE: 'wishlist_people',
  GIFTS: 'wishlist_gifts',
  CATEGORIES: 'wishlist_categories',
  INIT: 'wishlist_init_v2',
  SUPABASE_CONFIG: 'wishlist_supabase_config' // Храним настройки подключения здесь
};

// --- Начальные данные (для локального режима) ---
const INITIAL_PEOPLE: Person[] = [
  { id: 'p1', name: 'Анна', description: 'День рождения (25 Октября)', avatarUrl: 'https://picsum.photos/200/200?random=1' },
];
const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Техника', color: 'blue' },
  { id: 'c2', name: 'Дом', color: 'emerald' },
  { id: 'c3', name: 'Книги', color: 'amber' },
  { id: 'c4', name: 'Одежда', color: 'purple' },
];
const INITIAL_GIFTS: Gift[] = [
  {
    id: 'g1', personId: 'p1', categoryId: 'c1', title: 'Пример подарка (Локально)', price: 1000,
    status: GiftStatus.WANT, isPrivate: false, imageUrl: 'https://picsum.photos/400/300?random=10', createdAt: Date.now(),
    url: 'https://market.yandex.ru'
  }
];

// --- Сервис ---
let supabase: SupabaseClient | null = null;

// Попытка инициализации Supabase из сохраненных настроек
const initSupabase = () => {
  const configStr = localStorage.getItem(LOCAL_STORAGE_KEYS.SUPABASE_CONFIG);
  if (configStr) {
    try {
      const config = JSON.parse(configStr);
      if (config.url && config.key) {
        supabase = createClient(config.url, config.key);
        console.log('✅ Supabase connected');
        return true;
      }
    } catch (e) {
      console.error('Failed to init Supabase', e);
    }
  }
  return false;
};

const isCloud = () => !!supabase;

export const StorageService = {
  initialize: async () => {
    const connected = initSupabase();
    
    // Если мы локально, и нет данных - сидируем
    if (!connected && !localStorage.getItem(LOCAL_STORAGE_KEYS.INIT)) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PEOPLE, JSON.stringify(INITIAL_PEOPLE));
      localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      localStorage.setItem(LOCAL_STORAGE_KEYS.GIFTS, JSON.stringify(INITIAL_GIFTS));
      localStorage.setItem(LOCAL_STORAGE_KEYS.INIT, 'true');
    }
  },

  // Сохранение настроек облака
  saveCloudConfig: (url: string, key: string) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify({ url, key }));
    window.location.reload(); // Перезагрузка для применения
  },

  disconnectCloud: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SUPABASE_CONFIG);
    window.location.reload();
  },

  isCloudMode: () => isCloud(),

  // --- CRUD Operations ---

  getPeople: async (): Promise<Person[]> => {
    if (isCloud()) {
      const { data, error } = await supabase!.from('people').select('*');
      if (error) throw error;
      return data || [];
    }
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.PEOPLE) || '[]');
  },

  savePerson: async (person: Person): Promise<Person> => {
    if (isCloud()) {
       // Upsert works for both create and update if ID matches
      const { error } = await supabase!.from('people').upsert(person);
      if (error) throw error;
      return person;
    }
    const people = await StorageService.getPeople();
    const index = people.findIndex(p => p.id === person.id);
    if (index >= 0) people[index] = person;
    else people.push(person);
    localStorage.setItem(LOCAL_STORAGE_KEYS.PEOPLE, JSON.stringify(people));
    return person;
  },

  deletePerson: async (id: string): Promise<void> => {
    if (isCloud()) {
      await supabase!.from('people').delete().eq('id', id);
      await supabase!.from('gifts').delete().eq('personId', id); // DB should handle cascade usually, but manual here is safe
      return;
    }
    let people = await StorageService.getPeople();
    people = people.filter(p => p.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.PEOPLE, JSON.stringify(people));
    // Cascade
    let gifts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.GIFTS) || '[]');
    gifts = gifts.filter((g: Gift) => g.personId !== id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.GIFTS, JSON.stringify(gifts));
  },

  getCategories: async (): Promise<Category[]> => {
    if (isCloud()) {
       const { data } = await supabase!.from('categories').select('*');
       // If empty cloud, return hardcoded initial categories so UI works
       if (!data || data.length === 0) return INITIAL_CATEGORIES; 
       return data;
    }
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES) || '[]');
  },

  getGifts: async (): Promise<Gift[]> => {
    if (isCloud()) {
      const { data, error } = await supabase!.from('gifts').select('*');
      if (error) throw error;
      return data || [];
    }
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.GIFTS) || '[]');
  },

  saveGift: async (gift: Gift): Promise<Gift> => {
    if (isCloud()) {
      const { error } = await supabase!.from('gifts').upsert(gift);
      if (error) throw error;
      return gift;
    }
    const gifts = await StorageService.getGifts();
    const index = gifts.findIndex(g => g.id === gift.id);
    if (index >= 0) gifts[index] = gift;
    else gifts.push(gift);
    localStorage.setItem(LOCAL_STORAGE_KEYS.GIFTS, JSON.stringify(gifts));
    return gift;
  },

  deleteGift: async (id: string): Promise<void> => {
    if (isCloud()) {
      const { error } = await supabase!.from('gifts').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    let gifts = await StorageService.getGifts();
    gifts = gifts.filter(g => g.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.GIFTS, JSON.stringify(gifts));
  }
};
