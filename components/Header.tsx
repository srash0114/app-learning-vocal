'use client';

import { useWords } from '@/lib/context';

export function Header() {
  const { words, score, streak } = useWords();

  return (
    <header
      style={{
        padding: '0 28px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(10,12,18,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6EE7B7 0%, #818CF8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            flexShrink: 0,
          }}
        >
          ⚡
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '17px',
              fontWeight: 800,
              letterSpacing: '-0.3px',
              lineHeight: 1,
              background: 'linear-gradient(90deg, #e8eaf2 0%, rgba(232,234,242,0.7) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Word<span style={{ background: 'linear-gradient(90deg,#6EE7B7,#818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mind</span>
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(232,234,242,0.35)', letterSpacing: '1px', lineHeight: 1, marginTop: '2px' }}>
            TIẾNG ANH
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <StatBadge icon="📚" label={`${words.length}`} title="Từ vựng" />
        <StatBadge icon="🔥" label={`${streak}`} title="Streak" accent="#fb923c" />
        <StatBadge icon="⭐" label={`${score}`} title="Điểm" accent="#facc15" />
      </div>
    </header>
  );
}

function StatBadge({ icon, label, title, accent }: { icon: string; label: string; title: string; accent?: string }) {
  return (
    <div
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '5px 10px',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        fontSize: '13px',
        color: accent ?? 'var(--muted)',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      <span style={{ fontSize: '14px', lineHeight: 1 }}>{icon}</span>
      <strong style={{ color: accent ?? 'var(--text)', fontWeight: 700, fontSize: '13px' }}>{label}</strong>
    </div>
  );
}
