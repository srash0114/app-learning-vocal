'use client';

import { useState } from 'react';
import { Header } from './Header';
import { NavTabs } from './NavTabs';
import { AddWordsPanel } from './AddWordsPanel';
import { FlashcardPanel } from './FlashcardPanel';
import { QuizPanel } from './QuizPanel';

export function App() {
  const [activeTab, setActiveTab] = useState<'add' | 'flashcard' | 'quiz'>('add');

  return (
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <main style={{ flex: 1 }}>
        {activeTab === 'add' && <AddWordsPanel />}
        {activeTab === 'flashcard' && <FlashcardPanel />}
        {activeTab === 'quiz' && <QuizPanel />}
      </main>
    </div>
  );
}
