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
      // New words added or removed, reshuffle
      setDeck(shuffle([...words]));
      setIndex(0);
      setIsFlipped(false);
      setDeckSize(words.length);
    }
  }, [words.length]);

  if (!words.length) {
    return (
      <div
        style={{
          padding: '32px',
          maxWidth: '860px',
          margin: '0 auto',
          width: '100%',
          textAlign: 'center',
          paddingTop: '80px',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🃏</div>
        <p style={{ fontSize: '16px', color: 'var(--muted)' }}>
          Bạn chưa có từ nào. Hãy thêm từ trước!
        </p>
        <button
          onClick={() => window.location.hash = '#add'}
          style={{
            marginTop: '20px',
            padding: '14px 22px',
            borderRadius: '12px',
            border: 'none',
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            background: 'var(--accent)',
            color: '#0d0f14',
          }}
        >
          Thêm từ ngay
        </button>
      </div>
    );
  }

  const currentCard = deck[index];
  const progress = deck.length > 0 ? ((index + 1) / deck.length) * 100 : 0;

  if (!currentCard) {
    return (
      <div
        style={{
          padding: '32px',
          maxWidth: '860px',
          margin: '0 auto',
          width: '100%',
          textAlign: 'center',
          paddingTop: '80px',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ fontSize: '16px', color: 'var(--muted)' }}>
          Đang tải thẻ...
        </p>
      </div>
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
      if (wordIndex >= 0) {
        deleteWord(wordIndex);
      }
      showToast('✨ Đã xóa từ này!');
    } else {
      if (wordIndex >= 0) {
        updateWordStatus(wordIndex, 'learning');
      }
      showToast('💪 Tiếp tục cố lên!');
    }

    saveAll();
    setIndex((index + 1) % deck.length);
    setIsFlipped(false);
  }

  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '860px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: '18px',
            fontWeight: 700,
          }}
        >
          Thẻ nhớ
        </div>
        <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
          Thẻ <strong style={{ color: 'var(--text)' }}>{index + 1}</strong> /{' '}
          <strong style={{ color: 'var(--text)' }}>{deck.length}</strong>
        </div>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            height: '4px',
            background: 'var(--surface2)',
            borderRadius: '100px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: '100px',
              background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
              width: `${progress}%`,
              transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
            }}
          ></div>
        </div>
      </div>

      {/* Card */}
      <div
        style={{
          perspective: '1400px',
          marginBottom: '28px',
          cursor: 'pointer',
        }}
      >
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
          {/* Front */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '22px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backfaceVisibility: 'hidden',
              padding: '40px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              boxShadow: '0 0 0 1px rgba(110,231,183,0.1), 0 24px 60px rgba(0,0,0,0.4)',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 'clamp(36px,6vw,64px)',
                fontWeight: 800,
                letterSpacing: '-1.5px',
                color: 'var(--text)',
                textAlign: 'center',
              }}
            >
              {currentCard.word}
            </div>
            <div
              style={{
                fontSize: '18px',
                color: 'var(--accent)',
                fontStyle: 'italic',
                marginTop: '10px',
              }}
            >
              {currentCard.phonetic}
            </div>
            <div
              style={{
                marginTop: '14px',
                padding: '4px 14px',
                background: 'rgba(110,231,183,0.1)',
                color: 'var(--accent)',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              {currentCard.type}
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '18px',
                right: '22px',
                fontSize: '12px',
                color: 'var(--muted)',
              }}
            >
              Nhấn để xem nghĩa ↩
            </div>
          </div>

          {/* Back */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '22px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              padding: '40px',
              border: '1px solid rgba(129,140,248,0.2)',
              background: 'linear-gradient(135deg, #1a2535, #1e1a35)',
              boxShadow: '0 0 0 1px rgba(129,140,248,0.2), 0 24px 60px rgba(0,0,0,0.4)',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 'clamp(20px,3.5vw,34px)',
                fontWeight: 700,
                textAlign: 'center',
                color: 'var(--text)',
                lineHeight: 1.3,
              }}
            >
              {currentCard.meaning}
            </div>
            {currentCard.example && (
              <div
                style={{
                  fontSize: '14px',
                  color: 'rgba(232,234,242,0.5)',
                  textAlign: 'center',
                  fontStyle: 'italic',
                  marginTop: '14px',
                  lineHeight: 1.6,
                  maxWidth: '480px',
                }}
              >
                "{currentCard.example}"
              </div>
            )}
            <div
              style={{
                position: 'absolute',
                bottom: '18px',
                right: '22px',
                fontSize: '12px',
                color: 'var(--muted)',
              }}
            >
              Nhấn để lật lại ↩
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '12px',
        }}
      >
        <button
          onClick={() => handleRate(false)}
          style={{
            padding: '14px 22px',
            borderRadius: '12px',
            border: '1px solid rgba(248,113,113,0.3)',
            fontFamily: "'Syne',sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            background: 'rgba(248,113,113,0.1)',
            color: 'var(--danger)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
          }}
          onMouseEnter={e => {
            (e.target as HTMLButtonElement).style.background = 'rgba(248,113,113,0.2)';
            (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            (e.target as HTMLButtonElement).style.background = 'rgba(248,113,113,0.1)';
            (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
          }}
        >
          😓 Còn khó
        </button>
        <button
          onClick={handleFlip}
          style={{
            padding: '14px 28px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            fontFamily: "'Syne',sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            background: 'var(--surface2)',
            color: 'var(--text)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.target as HTMLButtonElement).style.background = 'var(--border)';
            (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            (e.target as HTMLButtonElement).style.background = 'var(--surface2)';
            (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
          }}
        >
          ↩ Lật thẻ
        </button>
        <button
          onClick={() => handleRate(true)}
          style={{
            padding: '14px 22px',
            borderRadius: '12px',
            border: '1px solid rgba(110,231,183,0.3)',
            fontFamily: "'Syne',sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            background: 'rgba(110,231,183,0.1)',
            color: 'var(--accent)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
          }}
          onMouseEnter={e => {
            (e.target as HTMLButtonElement).style.background = 'rgba(110,231,183,0.2)';
            (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            (e.target as HTMLButtonElement).style.background = 'rgba(110,231,183,0.1)';
            (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
          }}
        >
          ✅ Thuộc rồi
        </button>
      </div>
    </div>
  );
}
