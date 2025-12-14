import React, { createContext, useContext, useEffect, useState } from 'react';
import { Person, Gift, Category } from '../types';
import { StorageService } from '../services/storage';

interface DataContextType {
  people: Person[];
  gifts: Gift[];
  categories: Category[];
  loading: boolean;
  refreshData: () => Promise<void>;
  addOrUpdatePerson: (person: Person) => Promise<void>;
  removePerson: (id: string) => Promise<void>;
  addOrUpdateGift: (gift: Gift) => Promise<void>;
  removeGift: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [p, g, c] = await Promise.all([
        StorageService.getPeople(),
        StorageService.getGifts(),
        StorageService.getCategories(),
      ]);
      setPeople(p);
      setGifts(g);
      setCategories(c);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    StorageService.initialize();
    refreshData();
  }, []);

  const addOrUpdatePerson = async (person: Person) => {
    await StorageService.savePerson(person);
    await refreshData();
  };

  const removePerson = async (id: string) => {
    await StorageService.deletePerson(id);
    await refreshData();
  };

  const addOrUpdateGift = async (gift: Gift) => {
    await StorageService.saveGift(gift);
    await refreshData();
  };

  const removeGift = async (id: string) => {
    await StorageService.deleteGift(id);
    await refreshData();
  };

  return (
    <DataContext.Provider value={{
      people, gifts, categories, loading, refreshData,
      addOrUpdatePerson, removePerson, addOrUpdateGift, removeGift
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
