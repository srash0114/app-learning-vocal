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
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(110,231,183,0.06) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(129,140,248,0.05) 0%, transparent 70%)',
      }}
    >
      <Header />
      <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <main style={{ flex: 1 }}>
        {activeTab === 'add' && <AddWordsPanel />}
        {activeTab === 'flashcard' && <FlashcardPanel />}
        {activeTab === 'quiz' && <QuizPanel onTabChange={setActiveTab} />}
      </main>
    </div>
  );
}
