'use client';

import { useState, useEffect, useRef } from 'react';
import { useWords } from '@/lib/context';
import { Word } from '@/lib/types';

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

function blankOutWord(sentence: string, word: string): string {
  // Replace all case-insensitive occurrences of the word with underscores
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return sentence.replace(new RegExp(escaped, 'gi'), '_____');
}

interface FillQuizPanelProps {
  onTabChange: (tab: 'add' | 'flashcard' | 'quiz' | 'fill') => void;
}

type AnswerState = 'idle' | 'correct' | 'wrong';

export function FillQuizPanel({ onTabChange }: FillQuizPanelProps) {
  const { words } = useWords();

  const [filter, setFilter] = useState<FilterOption>('all');
  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [showModal, setShowModal] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build quiz words when filter or word list changes
  useEffect(() => {
    const filtered = filterWords(words, filter);
    if (filtered.length > 0) {
      const selected = shuffle([...filtered]).slice(0, 10);
      setQuizWords(selected);
      setCurrentIndex(0);
      setCorrect(0);
      setWrong(0);
      setInputValue('');
      setAnswerState('idle');
      setShowModal(false);
    } else {
      setQuizWords([]);
    }
  }, [words.length, filter]);

  // Focus input when question changes
  useEffect(() => {
    if (answerState === 'idle' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, answerState]);

  const currentWord = quizWords[currentIndex];
  const progress = quizWords.length > 0 ? ((currentIndex + (answerState !== 'idle' ? 1 : 0)) / quizWords.length) * 100 : 0;

  function handleSubmit() {
    if (answerState !== 'idle' || !currentWord) return;
    const trimmed = inputValue.trim().toLowerCase();
    const expected = currentWord.word.toLowerCase();
    if (trimmed === expected) {
      setAnswerState('correct');
      setCorrect(c => c + 1);
      setTimeout(advance, 1200);
    } else {
      setAnswerState('wrong');
      setWrong(w => w + 1);
      setTimeout(advance, 1800);
    }
  }

  function advance() {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= quizWords.length) {
      setShowModal(true);
    } else {
      setCurrentIndex(nextIndex);
      setInputValue('');
      setAnswerState('idle');
      setHintCount(0);
    }
  }

  function handleHint() {
    if (!currentWord || answerState !== 'idle') return;
    const next = hintCount + 1;
    if (next > currentWord.word.length) return;
    setHintCount(next);
    setInputValue(currentWord.word.slice(0, next));
    inputRef.current?.focus();
  }

  function restartQuiz() {
    const filtered = filterWords(words, filter);
    const selected = shuffle([...filtered]).slice(0, 10);
    setQuizWords(selected);
    setCurrentIndex(0);
    setCorrect(0);
    setWrong(0);
    setInputValue('');
    setAnswerState('idle');
    setShowModal(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (answerState === 'idle') {
        handleSubmit();
      }
    }
  }

  const resultCorrect = correct;
  const resultTotal = quizWords.length;
  const percentage = resultTotal > 0 ? Math.round((resultCorrect / resultTotal) * 100) : 0;
  let grade = { label: 'Cần cố gắng hơn', color: '#f87171', icon: '💪' };
  if (percentage >= 50) grade = { label: 'Khá tốt! Tiếp tục ôn nhé', color: '#fbbf24', icon: '😊' };
  if (percentage >= 75) grade = { label: 'Giỏi lắm!', color: '#6EE7B7', icon: '🌟' };
  if (percentage >= 90) grade = { label: 'Xuất sắc!', color: '#818CF8', icon: '🏆' };

  // Input border/bg based on answer state
  let inputBorder = 'rgba(255,255,255,0.15)';
  let inputBg = 'rgba(255,255,255,0.05)';
  let inputColor = '#e8eaf2';
  if (answerState === 'correct') {
    inputBorder = '#6EE7B7';
    inputBg = 'rgba(110,231,183,0.1)';
    inputColor = '#6EE7B7';
  } else if (answerState === 'wrong') {
    inputBorder = '#f87171';
    inputBg = 'rgba(248,113,113,0.1)';
    inputColor = '#f87171';
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ padding: '28px', maxWidth: '620px', margin: '0 auto', width: '100%' }}>

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: '15px', fontWeight: 700, color: '#e8eaf2' }}>
            Điền từ
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <ScorePill icon="✅" label={`${correct}`} color="rgba(110,231,183,0.1)" textColor="#6EE7B7" small />
            <ScorePill icon="❌" label={`${wrong}`} color="rgba(248,113,113,0.1)" textColor="#f87171" small />
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '100px', overflow: 'hidden', marginBottom: '16px' }}>
          <div
            style={{
              height: '100%', borderRadius: '100px',
              background: 'linear-gradient(90deg, #6EE7B7, #818CF8)',
              width: `${showModal ? 100 : progress}%`,
              transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '22px' }}>
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
        {quizWords.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: '40px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.4 }}>✏</div>
            <p style={{ fontSize: '14px', color: 'rgba(232,234,242,0.45)' }}>
              Không có từ nào phù hợp với bộ lọc này.
            </p>
          </div>
        )}

        {/* Question */}
        {currentWord && !showModal && (
          <>
            {/* Question counter */}
            <div style={{ fontSize: '12px', color: 'rgba(232,234,242,0.4)', marginBottom: '16px' }}>
              Câu <strong style={{ color: '#e8eaf2' }}>{currentIndex + 1}</strong>
              <span style={{ margin: '0 4px', opacity: 0.4 }}>/</span>
              <strong style={{ color: '#e8eaf2' }}>{quizWords.length}</strong>
            </div>

            {/* Question card */}
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '32px',
                marginBottom: '16px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
              }}
            >
              {/* Label */}
              {(() => {
                const blanked = currentWord.example
                  ? blankOutWord(currentWord.example, currentWord.word)
                  : null;
                const hasBlank = blanked !== null && blanked !== currentWord.example;
                return (
                  <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(232,234,242,0.3)', marginBottom: '16px', fontWeight: 700 }}>
                    {hasBlank ? 'Điền từ còn thiếu' : `Xác định đúng từ tiếng Anh (${currentWord.type})`}
                  </div>
                );
              })()}

              {/* Meaning as question */}
              <div
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 'clamp(16px,3vw,22px)',
                  fontWeight: 700,
                  color: '#e8eaf2',
                  lineHeight: 1.5,
                  marginBottom: '20px',
                  textAlign: 'center',
                }}
              >
                {currentWord.meaning}
              </div>

              {/* Example sentence with blank */}
              {currentWord.example && (
                <div
                  style={{
                    fontSize: '14px',
                    color: 'rgba(232,234,242,0.5)',
                    fontStyle: 'italic',
                    lineHeight: 1.7,
                    textAlign: 'center',
                    marginBottom: '8px',
                    padding: '0 8px',
                  }}
                >
                  "{blankOutWord(currentWord.example, currentWord.word)}"
                </div>
              )}
              {currentWord.example_vi && (
                <div
                  style={{
                    fontSize: '12px',
                    color: 'rgba(232,234,242,0.3)',
                    textAlign: 'center',
                    lineHeight: 1.6,
                    marginBottom: '4px',
                  }}
                >
                  {currentWord.example_vi}
                </div>
              )}
            </div>

            {/* Input area */}
            <div style={{ marginBottom: '12px' }}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => answerState === 'idle' && setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập từ tiếng Anh..."
                readOnly={answerState !== 'idle'}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: `1.5px solid ${inputBorder}`,
                  background: inputBg,
                  color: inputColor,
                  fontSize: '16px',
                  fontFamily: "var(--font-inter), sans-serif",
                  fontWeight: 600,
                  outline: 'none',
                  transition: 'border-color 0.2s, background 0.2s',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Feedback message */}
            {answerState === 'correct' && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px', borderRadius: '10px',
                  background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.25)',
                  color: '#6EE7B7', fontSize: '14px', fontWeight: 600,
                  marginBottom: '12px',
                }}
              >
                <span style={{ fontSize: '16px' }}>✓</span> Đúng!
              </div>
            )}
            {answerState === 'wrong' && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px', borderRadius: '10px',
                  background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
                  color: '#f87171', fontSize: '14px', fontWeight: 600,
                  marginBottom: '12px',
                }}
              >
                <span style={{ fontSize: '16px' }}>✗</span>
                <span>Sai! Đáp án đúng: <strong style={{ color: '#e8eaf2' }}>{currentWord.word}</strong></span>
              </div>
            )}

            {/* Submit + Hint buttons */}
            {answerState === 'idle' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleHint}
                  disabled={currentWord ? hintCount >= currentWord.word.length : true}
                  title="Gợi ý thêm 1 chữ"
                  style={{
                    padding: '13px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(251,191,36,0.25)',
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: 'rgba(251,191,36,0.08)',
                    color: '#fbbf24',
                    transition: 'all 0.15s',
                    flexShrink: 0,
                    opacity: currentWord && hintCount >= currentWord.word.length ? 0.4 : 1,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,191,36,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(251,191,36,0.08)'; }}
                >
                  💡 {hintCount > 0 ? `${hintCount}/${currentWord?.word.length}` : 'Gợi ý'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={inputValue.trim() === ''}
                  style={{
                    flex: 1,
                    padding: '13px',
                    borderRadius: '12px',
                    border: 'none',
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: inputValue.trim() === '' ? 'not-allowed' : 'pointer',
                    background: inputValue.trim() === ''
                      ? 'rgba(255,255,255,0.06)'
                      : 'linear-gradient(135deg, #6EE7B7, #34d399)',
                    color: inputValue.trim() === '' ? 'rgba(232,234,242,0.3)' : '#0a0c10',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (inputValue.trim() !== '') e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Kiểm tra
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Result modal overlay ── */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.2s ease',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(145deg, #13161f, #0f1219)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              padding: '40px 36px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
              textAlign: 'center',
              animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {/* Top badge */}
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 14px', borderRadius: '100px',
                background: 'rgba(110,231,183,0.12)', border: '1px solid rgba(110,231,183,0.3)',
                fontSize: '11px', fontWeight: 700, color: '#6EE7B7',
                letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px',
              }}
            >
              🎉 Hoàn thành điền từ
            </div>

            {/* Score */}
            <div style={{ fontSize: '44px', marginBottom: '12px' }}>{grade.icon}</div>
            <div
              style={{
                fontFamily: "var(--font-inter), sans-serif", fontSize: '68px', fontWeight: 900,
                lineHeight: 1, marginBottom: '6px',
                background: `linear-gradient(135deg, ${grade.color}, #818CF8)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}
            >
              {resultCorrect}/{resultTotal}
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(232,234,242,0.4)', marginBottom: '4px' }}>
              {percentage}% chính xác
            </div>
            <p style={{ color: 'rgba(232,234,242,0.65)', fontSize: '15px', marginBottom: '24px' }}>
              {grade.label}
            </p>

            {/* Breakdown */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '28px' }}>
              <ScorePill icon="✅" label={`${resultCorrect} đúng`} color="rgba(110,231,183,0.12)" textColor="#6EE7B7" />
              <ScorePill icon="❌" label={`${wrong} sai`} color="rgba(248,113,113,0.1)" textColor="#f87171" />
            </div>

            {/* Progress bar 100% */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', borderRadius: '100px', background: 'linear-gradient(90deg, #6EE7B7, #818CF8)' }} />
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(232,234,242,0.3)', marginTop: '5px', textAlign: 'right', fontWeight: 700 }}>100%</div>
            </div>

            {/* Buttons */}
            <button
              onClick={restartQuiz}
              style={{
                width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
                fontFamily: "var(--font-inter), sans-serif", fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', background: 'linear-gradient(135deg, #6EE7B7, #34d399)',
                color: '#0a0c10', marginBottom: '8px', transition: 'transform 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              🔄 Làm lại
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onTabChange('flashcard')}
                style={{
                  flex: 1, padding: '11px', borderRadius: '11px',
                  border: '1px solid rgba(129,140,248,0.3)',
                  fontFamily: "var(--font-inter), sans-serif", fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', background: 'rgba(129,140,248,0.08)', color: '#818CF8',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.16)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                ▣ Ôn tập
              </button>
              <button
                onClick={() => onTabChange('add')}
                style={{
                  flex: 1, padding: '11px', borderRadius: '11px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontFamily: "var(--font-inter), sans-serif", fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', background: 'rgba(255,255,255,0.04)', color: 'rgba(232,234,242,0.6)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#e8eaf2'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(232,234,242,0.6)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                ✦ Thêm từ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScorePill({ icon, label, color, textColor, small }: { icon: string; label: string; color: string; textColor: string; small?: boolean }) {
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: small ? '4px 9px' : '6px 14px', borderRadius: '8px',
        background: color, fontSize: small ? '12px' : '13px',
        color: textColor, fontWeight: 700,
      }}
    >
      <span>{icon}</span> {label}
    </div>
  );
}
