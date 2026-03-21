'use client';

import { useWords } from '@/lib/context';

interface NavTabsProps {
  activeTab: 'add' | 'flashcard' | 'quiz';
  onTabChange: (tab: 'add' | 'flashcard' | 'quiz') => void;
}

export function NavTabs({ activeTab, onTabChange }: NavTabsProps) {
  const { words } = useWords();

  const tabs = [
    { id: 'add' as const, label: '➕ Thêm từ' },
    { id: 'flashcard' as const, label: '🃏 Thẻ nhớ' },
    { id: 'quiz' as const, label: '🧠 Kiểm tra' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: '2px',
        padding: '20px 32px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            padding: '10px 22px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === tab.id ? 'var(--accent)' : 'var(--muted)',
            fontFamily: "'Instrument Sans',sans-serif",
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '-1px',
          }}
          onMouseEnter={e => {
            if (activeTab !== tab.id) {
              (e.target as HTMLButtonElement).style.color = 'var(--text)';
            }
          }}
          onMouseLeave={e => {
            if (activeTab !== tab.id) {
              (e.target as HTMLButtonElement).style.color = 'var(--muted)';
            }
          }}
        >
          {tab.label}
          {tab.id === 'add' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '20px',
                height: '20px',
                padding: '0 6px',
                background: activeTab === 'add' ? 'rgba(110,231,183,0.15)' : 'var(--surface2)',
                color: activeTab === 'add' ? 'var(--accent)' : 'var(--muted)',
                borderRadius: '100px',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {words.length}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
