'use client';

import { useWords } from '@/lib/context';

interface NavTabsProps {
  activeTab: 'add' | 'flashcard' | 'quiz' | 'fill';
  onTabChange: (tab: 'add' | 'flashcard' | 'quiz' | 'fill') => void;
}

const tabs = [
  { id: 'add' as const, icon: '✦', label: 'Thêm từ' },
  { id: 'flashcard' as const, icon: '▣', label: 'Thẻ nhớ' },
  { id: 'quiz' as const, icon: '◈', label: 'Kiểm tra' },
  { id: 'fill' as const, icon: '✏', label: 'Điền từ' },
];

export function NavTabs({ activeTab, onTabChange }: NavTabsProps) {
  const { words } = useWords();

  return (
    <>
      <style>{`
        .navtabs-outer {
          padding: 10px 28px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(10,12,18,0.6);
          backdrop-filter: blur(12px);
        }
        .navtabs-scroll {
          display: flex;
          align-items: center;
        }
        .navtabs-track {
          display: flex;
          gap: 2px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 3px;
        }
        .navtabs-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 16px;
          border-radius: 9px;
          border: none;
          font-family: var(--font-inter), sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.18s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }

        @media (max-width: 500px) {
          .navtabs-outer { padding: 10px 24px; }
          .navtabs-scroll {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .navtabs-scroll::-webkit-scrollbar { display: none; }
          .navtabs-track { width: 100%; overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none; }
          .navtabs-btn {
            flex: 1;
            min-width: fit-content;
            justify-content: center;
            padding: 8px 6px;
            font-size: 12px;
          }
        }
      `}</style>
      <div className="navtabs-outer">
        <div className="navtabs-scroll">
          <div className="navtabs-track">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  className="navtabs-btn"
                  onClick={() => onTabChange(tab.id)}
                  style={{
                    fontWeight: isActive ? 600 : 500,
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(110,231,183,0.18), rgba(129,140,248,0.18))'
                      : 'transparent',
                    color: isActive ? '#e8eaf2' : 'rgba(232,234,242,0.45)',
                    boxShadow: isActive ? 'inset 0 0 0 1px rgba(110,231,183,0.25)' : 'none',
                  }}
                >
                  <span style={{ fontSize: '11px', color: isActive ? '#6EE7B7' : 'rgba(232,234,242,0.35)', transition: 'color 0.18s' }}>
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
      </div>
    </>
  );
}
