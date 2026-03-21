'use client';

import { useState, useEffect } from 'react';
import { useWords } from '@/lib/context';
import { useToast } from '@/lib/toast-context';
import { Word } from '@/lib/types';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function FlashcardPanel() {
  const { words, updateWordStatus, deleteWord, saveAll } = useWords();
  const { show: showToast } = useToast();

  const [deck, setDeck] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [deckSize, setDeckSize] = useState(0);

  // Initialize deck only when word count changes (add/remove), not on status updates
  useEffect(() => {
    if (words.length !== deckSize) {
      setDeck(shuffle([...words]));
      setIndex(0);
      setIsFlipped(false);
      setDeckSize(words.length);
    }
  }, [words.length]);

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

  if (!currentCard) {
    return (
      <EmptyState icon="⏳" text="Đang tải thẻ…" />
    );
  }

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
      if (wordIndex >= 0) deleteWord(wordIndex);
      showToast('✨ Đã xóa từ này!');
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
        <div style={{ fontSize: '12px', color: 'rgba(232,234,242,0.4)' }}>
          <strong style={{ color: '#e8eaf2' }}>{index + 1}</strong>
          <span style={{ margin: '0 4px' }}>/</span>
          <strong style={{ color: '#e8eaf2' }}>{deck.length}</strong>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '24px', height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '100px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            borderRadius: '100px',
            background: 'linear-gradient(90deg, #6EE7B7, #818CF8)',
            width: `${progress}%`,
            transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>

      {/* Flip card */}
      <div style={{ perspective: '1400px', marginBottom: '20px', cursor: 'pointer' }}>
        <div
          onClick={handleFlip}
          style={{
            width: '100%',
            aspectRatio: '16/8',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* Front face */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              padding: '36px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 'clamp(36px,6vw,60px)',
                fontWeight: 800,
                letterSpacing: '-1.5px',
                color: '#e8eaf2',
                textAlign: 'center',
                lineHeight: 1,
              }}
            >
              {currentCard.word}
            </div>
            <div style={{ fontSize: '17px', color: '#818CF8', fontStyle: 'italic', marginTop: '12px' }}>
              {currentCard.phonetic}
            </div>
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
            <div style={{ position: 'absolute', bottom: '16px', right: '18px', fontSize: '11px', color: 'rgba(232,234,242,0.25)' }}>
              Nhấn để xem nghĩa ↩
            </div>
          </div>

          {/* Back face */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              padding: '36px',
              background: 'linear-gradient(135deg, rgba(110,231,183,0.08), rgba(129,140,248,0.1))',
              border: '1px solid rgba(129,140,248,0.25)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(129,140,248,0.1)',
            }}
          >
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 'clamp(20px,3.5vw,32px)',
                fontWeight: 700,
                textAlign: 'center',
                color: '#e8eaf2',
                lineHeight: 1.35,
              }}
            >
              {currentCard.meaning}
            </div>
            {currentCard.example && (
              <div
                style={{
                  fontSize: '13px',
                  color: 'rgba(232,234,242,0.45)',
                  textAlign: 'center',
                  fontStyle: 'italic',
                  marginTop: '14px',
                  lineHeight: 1.7,
                  maxWidth: '460px',
                }}
              >
                "{currentCard.example}"
              </div>
            )}
            <div style={{ position: 'absolute', bottom: '16px', right: '18px', fontSize: '11px', color: 'rgba(232,234,242,0.25)' }}>
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
