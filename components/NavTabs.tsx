'use client';

import { useWords } from '@/lib/context';

interface NavTabsProps {
  activeTab: 'add' | 'flashcard' | 'quiz';
  onTabChange: (tab: 'add' | 'flashcard' | 'quiz') => void;
}

const tabs = [
  { id: 'add' as const, icon: '✦', label: 'Thêm từ' },
  { id: 'flashcard' as const, icon: '▣', label: 'Thẻ nhớ' },
  { id: 'quiz' as const, icon: '◈', label: 'Kiểm tra' },
];

export function NavTabs({ activeTab, onTabChange }: NavTabsProps) {
  const { words } = useWords();

  return (
    <div
      style={{
        padding: '12px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(10,12,18,0.6)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '2px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px',
          padding: '3px',
        }}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 16px',
                borderRadius: '9px',
                border: 'none',
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(110,231,183,0.18), rgba(129,140,248,0.18))'
                  : 'transparent',
                color: isActive ? '#e8eaf2' : 'rgba(232,234,242,0.45)',
                boxShadow: isActive ? 'inset 0 0 0 1px rgba(110,231,183,0.25)' : 'none',
                position: 'relative',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  color: isActive ? '#6EE7B7' : 'rgba(232,234,242,0.35)',
                  transition: 'color 0.18s',
                }}
              >
                {tab.icon}
              </span>
              {tab.label}
              {tab.id === 'add' && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 5px',
                    background: isActive ? 'rgba(110,231,183,0.2)' : 'rgba(255,255,255,0.06)',
                    color: isActive ? '#6EE7B7' : 'rgba(232,234,242,0.4)',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0',
                  }}
                >
                  {words.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
