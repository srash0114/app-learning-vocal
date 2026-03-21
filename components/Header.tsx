'use client';

import { useWords } from '@/lib/context';

export function Header() {
  const { words, score, streak } = useWords();

  return (
    <>
      <style>{`
        .header-root {
          padding: 0 20px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(10,12,18,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .header-icon {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          background: linear-gradient(135deg, #6EE7B7 0%, #818CF8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
        }
        .header-title {
          font-family: 'Syne', sans-serif;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.3px;
          line-height: 1;
          background: linear-gradient(90deg, #e8eaf2 0%, rgba(232,234,242,0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          white-space: nowrap;
        }
        .header-subtitle {
          font-size: 10px;
          color: rgba(232,234,242,0.35);
          letter-spacing: 1px;
          line-height: 1;
          margin-top: 2px;
        }
        .header-stats {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
        }
        .stat-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 7px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          cursor: default;
          user-select: none;
          white-space: nowrap;
          transition: background 0.15s;
        }
        .stat-badge .stat-label {
          font-weight: 700;
          font-size: 12px;
        }
        .stat-badge .stat-text {
          font-size: 11px;
          color: rgba(232,234,242,0.4);
        }

        @media (max-width: 550px) {
          .header-root { padding: 0 14px; height: 52px; }
          .header-subtitle { display: none; }
          .stat-badge {
            background: transparent;
            border: none;
            padding: 4px 4px;
            gap: 3px;
          }
          .stat-badge .stat-text { display: none; }
        }
      `}</style>
      <header className="header-root">
        <div className="header-logo">
          <div className="header-icon">⚡</div>
          <div>
            <div className="header-title">
              Word<span style={{ background: 'linear-gradient(90deg,#6EE7B7,#818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mind</span>
            </div>
            <div className="header-subtitle">TIẾNG ANH</div>
          </div>
        </div>

        <div className="header-stats">
          <StatBadge icon="📚" label={`${words.length}`} text="từ" title="Từ vựng" />
          <StatBadge icon="🔥" label={`${streak}`} text="streak" title="Streak" accent="#fb923c" />
          <StatBadge icon="⭐" label={`${score}`} text="điểm" title="Điểm" accent="#facc15" />
        </div>
      </header>
    </>
  );
}

function StatBadge({ icon, label, text, title, accent }: { icon: string; label: string; text: string; title: string; accent?: string }) {
  return (
    <div className="stat-badge" title={title}>
      <span style={{ fontSize: '13px', lineHeight: 1 }}>{icon}</span>
      <strong className="stat-label" style={{ color: accent ?? 'var(--text)' }}>{label}</strong>
      <span className="stat-text">{text}</span>
    </div>
  );
}
