'use client';

import { useState, useEffect } from 'react';
import { useWords } from '@/lib/context';
import { useToast } from '@/lib/toast-context';
import { Word } from '@/lib/types';
import { speakWord } from '@/lib/speak';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

type FilterOption = 'all' | 'learning' | 'mastered';

function filterWords(words: Word[], filter: FilterOption): Word[] {
  if (filter === 'mastered') return words.filter(w => w.status === 'mastered');
  if (filter === 'learning') return words.filter(w => w.status === 'new' || w.status === 'learning');
  return words;
}

const FILTER_OPTIONS: { id: FilterOption; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'learning', label: 'Chưa thuộc' },
  { id: 'mastered', label: 'Đã thuộc' },
];

export function FlashcardPanel() {
  const { words, updateWordStatus, saveAll } = useWords();
  const { show: showToast } = useToast();

  const [filter, setFilter] = useState<FilterOption>('all');
  const [deck, setDeck] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Rebuild deck when filter changes or word count changes
  useEffect(() => {
    const filtered = filterWords(words, filter);
    setDeck(shuffle([...filtered]));
    setIndex(0);
    setIsFlipped(false);
  }, [words.length, filter]);

  if (!words.length) {
    return (
      <EmptyState
        icon="▣"
        text="Chưa có từ nào. Hãy thêm từ trước!"
        buttonText="Thêm từ ngay"
      />
    );
  }

  const currentCard = deck[index];
  const progress = deck.length > 0 ? ((index + 1) / deck.length) * 100 : 0;

  function handleFlip() {
    setIsFlipped(!isFlipped);
  }

  function handleRate(isEasy: boolean) {
    if (!isFlipped) {
      handleFlip();
      return;
    }

    const wordIndex = words.findIndex(w => w.word === currentCard.word);

    if (isEasy) {
      if (wordIndex >= 0) updateWordStatus(wordIndex, 'mastered');
      showToast('✨ Tuyệt! Đã thuộc từ này');
    } else {
      if (wordIndex >= 0) updateWordStatus(wordIndex, 'learning');
      showToast('💪 Tiếp tục cố lên!');
    }

    saveAll();
    setIndex((index + 1) % deck.length);
    setIsFlipped(false);
  }

  return (
    <div style={{ padding: '28px', maxWidth: '720px', margin: '0 auto', width: '100%' }}>

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: '15px', fontWeight: 700, color: '#e8eaf2' }}>
          Thẻ nhớ
        </div>
        {deck.length > 0 && (
          <div style={{ fontSize: '12px', color: 'rgba(232,234,242,0.4)' }}>
            <strong style={{ color: '#e8eaf2' }}>{index + 1}</strong>
            <span style={{ margin: '0 4px' }}>/</span>
            <strong style={{ color: '#e8eaf2' }}>{deck.length}</strong>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '16px', height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '100px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            borderRadius: '100px',
            background: 'linear-gradient(90deg, #6EE7B7, #818CF8)',
            width: deck.length > 0 ? `${progress}%` : '0%',
            transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {FILTER_OPTIONS.map(opt => {
          const isActive = filter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              style={{
                padding: '5px 14px',
                borderRadius: '100px',
                border: isActive ? '1px solid rgba(110,231,183,0.3)' : '1px solid rgba(255,255,255,0.08)',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(110,231,183,0.18), rgba(129,140,248,0.18))'
                  : 'transparent',
                color: isActive ? '#e8eaf2' : 'rgba(232,234,242,0.4)',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                fontFamily: "var(--font-inter), sans-serif",
                transition: 'all 0.15s',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* No match message */}
      {deck.length === 0 && (
        <div style={{ textAlign: 'center', paddingTop: '40px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.4 }}>▣</div>
          <p style={{ fontSize: '14px', color: 'rgba(232,234,242,0.45)' }}>
            Không có từ nào phù hợp với bộ lọc này.
          </p>
        </div>
      )}

      {/* Flip card */}
      {currentCard && (
        <>
          <div style={{ perspective: '1400px', marginBottom: '20px', cursor: 'pointer' }}>
            <div
              onClick={handleFlip}
              style={{
                display: 'grid',
                width: '100%',
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {/* Front face */}
              <div
                style={{
                  gridArea: '1/1',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  padding: '36px 24px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 'clamp(26px,6vw,56px)',
                    fontWeight: 800,
                    letterSpacing: '-1px',
                    color: '#e8eaf2',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    wordBreak: 'break-word',
                  }}
                >
                  {currentCard.word}
                </div>
                <div style={{ fontSize: '16px', color: '#818CF8', fontStyle: 'italic', marginTop: '10px', textAlign: 'center' }}>
                  {currentCard.phonetic}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); speakWord(currentCard.word); }}
                  title="Nghe phát âm"
                  style={{
                    marginTop: '14px',
                    background: 'rgba(110,231,183,0.08)',
                    border: '1px solid rgba(110,231,183,0.2)',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    color: '#6EE7B7',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(110,231,183,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(110,231,183,0.08)'; }}
                >
                  🔊
                </button>
                <div
                  style={{
                    marginTop: '14px',
                    padding: '4px 12px',
                    background: 'rgba(251,191,36,0.1)',
                    color: '#fbbf24',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
                >
                  {currentCard.type}
                </div>
                <div style={{ marginTop: '18px', fontSize: '11px', color: 'rgba(232,234,242,0.2)' }}>
                  Nhấn để xem nghĩa ↩
                </div>
              </div>

              {/* Back face */}
              <div
                style={{
                  gridArea: '1/1',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  padding: '36px 24px',
                  background: 'linear-gradient(135deg, rgba(110,231,183,0.08), rgba(129,140,248,0.1))',
                  border: '1px solid rgba(129,140,248,0.25)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(129,140,248,0.1)',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 'clamp(18px,3.5vw,30px)',
                    fontWeight: 700,
                    textAlign: 'center',
                    color: '#e8eaf2',
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                  }}
                >
                  {currentCard.meaning}
                </div>
                {currentCard.example && (
                  <div style={{ marginTop: '16px', textAlign: 'center', maxWidth: '480px' }}>
                    <div style={{ fontSize: '13px', color: 'rgba(232,234,242,0.5)', fontStyle: 'italic', lineHeight: 1.7 }}>
                      "{currentCard.example}"
                    </div>
                    {currentCard.example_vi && (
                      <div style={{ fontSize: '12px', color: 'rgba(232,234,242,0.3)', marginTop: '6px', lineHeight: 1.6 }}>
                        {currentCard.example_vi}
                      </div>
                    )}
                  </div>
                )}
                <div style={{ marginTop: '18px', fontSize: '11px', color: 'rgba(232,234,242,0.2)' }}>
                  Nhấn để lật lại ↩
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '10px' }}>
            {/* Hard */}
            <RateButton
              color="#f87171"
              bgColor="rgba(248,113,113,0.08)"
              borderColor="rgba(248,113,113,0.25)"
              onClick={() => handleRate(false)}
            >
              😓 Còn khó
            </RateButton>

            {/* Flip */}
            <button
              onClick={handleFlip}
              style={{
                padding: '13px 22px',
                borderRadius: '11px',
                border: '1px solid rgba(255,255,255,0.1)',
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(232,234,242,0.7)',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
                e.currentTarget.style.color = '#e8eaf2';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'rgba(232,234,242,0.7)';
              }}
            >
              ↩ Lật thẻ
            </button>

            {/* Easy */}
            <RateButton
              color="#6EE7B7"
              bgColor="rgba(110,231,183,0.08)"
              borderColor="rgba(110,231,183,0.25)"
              onClick={() => handleRate(true)}
            >
              ✓ Thuộc rồi
            </RateButton>
          </div>
        </>
      )}
    </div>
  );
}

function RateButton({
  color, bgColor, borderColor, onClick, children,
}: {
  color: string; bgColor: string; borderColor: string; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '13px 20px',
        borderRadius: '11px',
        border: `1px solid ${borderColor}`,
        fontFamily: "var(--font-inter), sans-serif",
        fontSize: '13px',
        fontWeight: 700,
        cursor: 'pointer',
        background: bgColor,
        color,
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        justifyContent: 'center',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${bgColor}`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {children}
    </button>
  );
}

function EmptyState({ icon, text, buttonText }: { icon: string; text: string; buttonText?: string }) {
  return (
    <div style={{ padding: '32px', maxWidth: '680px', margin: '0 auto', width: '100%', textAlign: 'center', paddingTop: '80px' }}>
      <div style={{ fontSize: '44px', marginBottom: '14px', opacity: 0.5 }}>{icon}</div>
      <p style={{ fontSize: '15px', color: 'rgba(232,234,242,0.45)' }}>{text}</p>
      {buttonText && (
        <button
          onClick={() => window.location.hash = '#add'}
          style={{
            marginTop: '20px',
            padding: '12px 22px',
            borderRadius: '11px',
            border: 'none',
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #6EE7B7, #34d399)',
            color: '#0a0c10',
          }}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
