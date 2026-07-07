'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type TabBarContextType = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const TabBarContext = createContext<TabBarContextType | null>(null);

export function TabBarProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState('/');

  return (
    <TabBarContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabBarContext.Provider>
  );
}

export function useTabBar() {
  const context = useContext(TabBarContext);
  if (!context) {
    throw new Error('useTabBar must be used within TabBarProvider');
  }
  return context;
}
