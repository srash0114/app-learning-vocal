'use client';

import { useWords } from '@/lib/context';

export function Header() {
  const { words, score, streak } = useWords();

  return (
    <header
      style={{
        padding: '18px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(13,15,20,0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        className="logo"
        style={{
          fontFamily: "'Syne',sans-serif",
          fontSize: '22px',
          fontWeight: 800,
          letterSpacing: '-0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        Word<span style={{ color: 'var(--accent)' }}>Mind</span>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 400,
            color: 'var(--muted)',
            fontFamily: "'Instrument Sans'",
          }}
        >
          / Tiếng Anh
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--muted)' }}>
          <span style={{ fontSize: '16px' }}>📚</span>
          Từ vựng: <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{words.length}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--muted)' }}>
          <span style={{ fontSize: '16px' }}>🔥</span>
          Streak: <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{streak}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--muted)' }}>
          <span style={{ fontSize: '16px' }}>⭐</span>
          Điểm: <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{score}</strong>
        </div>
      </div>
    </header>
  );
}
