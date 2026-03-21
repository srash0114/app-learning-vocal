'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWords } from '@/lib/context';
import { Word } from '@/lib/types';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface QuizPanelProps {
  onTabChange: (tab: 'add' | 'flashcard' | 'quiz') => void;
}

export function QuizPanel({ onTabChange }: QuizPanelProps) {
  const { words } = useWords();

  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (words.length >= 4 && !started) {
      const selected = shuffle([...words]).slice(0, Math.min(10, words.length));
      setQuizWords(selected);
      setStarted(true);
    }
  }, [words, started]);

  if (words.length < 4) {
    return (
      <div style={{ padding: '32px', maxWidth: '680px', margin: '0 auto', width: '100%', textAlign: 'center', paddingTop: '80px' }}>
        <div style={{ fontSize: '44px', marginBottom: '14px', opacity: 0.5 }}>◈</div>
        <p style={{ fontSize: '15px', color: 'rgba(232,234,242,0.45)' }}>
          Cần ít nhất 4 từ để làm bài kiểm tra!
        </p>
        <button
          onClick={() => onTabChange('add')}
          style={{
            marginTop: '20px', padding: '12px 22px', borderRadius: '11px', border: 'none',
            fontFamily: "var(--font-inter), sans-serif", fontSize: '13px', fontWeight: 700,
            cursor: 'pointer', background: 'linear-gradient(135deg, #6EE7B7, #34d399)', color: '#0a0c10',
          }}
        >
          Thêm từ ngay
        </button>
      </div>
    );
  }

  const currentQuestion = quizWords[currentIndex];
  const progress = ((currentIndex + (answered ? 1 : 0)) / quizWords.length) * 100;

  const options = useMemo(() => {
    if (!currentQuestion) return [];
    const wrongPool = words.filter(w => w.word !== currentQuestion.word);
    const wrongs = shuffle(wrongPool).slice(0, 3);
    return shuffle([currentQuestion, ...wrongs]);
  }, [currentIndex, quizWords]);

  function handleAnswer(chosenWord: string) {
    if (answered) return;

    setAnswered(true);
    setSelectedOption(chosenWord);
    if (chosenWord === currentQuestion.word) {
      setCorrect(c => c + 1);
    } else {
      setWrong(w => w + 1);
    }

    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= quizWords.length) {
        setShowModal(true);
      } else {
        setCurrentIndex(nextIndex);
        setAnswered(false);
        setSelectedOption(null);
      }
    }, 1200);
  }

  function restartQuiz() {
    const selected = shuffle([...words]).slice(0, Math.min(10, words.length));
    setQuizWords(selected);
    setCurrentIndex(0);
    setCorrect(0);
    setWrong(0);
    setAnswered(false);
    setSelectedOption(null);
    setShowModal(false);
  }

  const resultCorrect = correct;
  const resultTotal = quizWords.length;
  const percentage = resultTotal > 0 ? Math.round((resultCorrect / resultTotal) * 100) : 0;
  let grade = { label: 'Cần cố gắng hơn', color: '#f87171', icon: '💪' };
  if (percentage >= 50) grade = { label: 'Khá tốt! Tiếp tục ôn nhé', color: '#fbbf24', icon: '😊' };
  if (percentage >= 75) grade = { label: 'Giỏi lắm!', color: '#6EE7B7', icon: '🌟' };
  if (percentage >= 90) grade = { label: 'Xuất sắc!', color: '#818CF8', icon: '🏆' };

  return (
    <div style={{ position: 'relative' }}>
      {/* ── Quiz screen ── */}
      <div style={{ padding: '28px', maxWidth: '620px', margin: '0 auto', width: '100%' }}>

        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(232,234,242,0.45)' }}>
            Câu <strong style={{ color: '#e8eaf2' }}>{currentIndex + 1}</strong>
            <span style={{ margin: '0 4px', opacity: 0.4 }}>/</span>
            <strong style={{ color: '#e8eaf2' }}>{quizWords.length}</strong>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <ScorePill icon="✅" label={`${correct}`} color="rgba(110,231,183,0.1)" textColor="#6EE7B7" small />
            <ScorePill icon="❌" label={`${wrong}`} color="rgba(248,113,113,0.1)" textColor="#f87171" small />
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '100px', overflow: 'hidden', marginBottom: '22px' }}>
          <div
            style={{
              height: '100%', borderRadius: '100px',
              background: 'linear-gradient(90deg, #6EE7B7, #818CF8)',
              width: `${showModal ? 100 : progress}%`,
              transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </div>

        {/* Question card */}
        {currentQuestion && (
          <>
            <div
              style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px', padding: '36px 32px', textAlign: 'center',
                marginBottom: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(232,234,242,0.3)', marginBottom: '14px', fontWeight: 700 }}>
                Chọn nghĩa đúng của từ
              </div>
              <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 'clamp(30px,5vw,52px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#e8eaf2', lineHeight: 1 }}>
                {currentQuestion.word}
              </div>
              <div style={{ color: '#818CF8', fontStyle: 'italic', fontSize: '16px', marginTop: '10px' }}>
                {currentQuestion.phonetic}
              </div>
            </div>

            {/* Options grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {options.map((option, idx) => {
                const isSelected = selectedOption === option.word;
                const isCorrect = option.word === currentQuestion.word;

                let bg = 'rgba(255,255,255,0.03)';
                let border = 'rgba(255,255,255,0.09)';
                let color = 'rgba(232,234,242,0.8)';
                let labelBg = 'rgba(255,255,255,0.06)';
                let labelColor = 'rgba(232,234,242,0.4)';

                if (answered && isCorrect) {
                  bg = 'rgba(110,231,183,0.1)'; border = '#6EE7B7'; color = '#6EE7B7';
                  labelBg = 'rgba(110,231,183,0.2)'; labelColor = '#6EE7B7';
                } else if (answered && isSelected && !isCorrect) {
                  bg = 'rgba(248,113,113,0.1)'; border = '#f87171'; color = '#f87171';
                  labelBg = 'rgba(248,113,113,0.2)'; labelColor = '#f87171';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option.word)}
                    disabled={answered}
                    style={{
                      background: bg, border: `1.5px solid ${border}`, borderRadius: '14px',
                      padding: '16px', color, fontSize: '14px', lineHeight: 1.5,
                      cursor: answered ? 'not-allowed' : 'pointer', textAlign: 'left',
                      transition: 'all 0.18s', fontFamily: "var(--font-inter), sans-serif",
                      display: 'flex', gap: '12px', alignItems: 'flex-start',
                    }}
                    onMouseEnter={e => {
                      if (!answered) {
                        e.currentTarget.style.border = '1.5px solid rgba(129,140,248,0.5)';
                        e.currentTarget.style.background = 'rgba(129,140,248,0.07)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!answered) {
                        e.currentTarget.style.border = '1.5px solid rgba(255,255,255,0.09)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '22px', height: '22px', borderRadius: '6px',
                        background: labelBg, color: labelColor,
                        fontSize: '10px', fontWeight: 800, flexShrink: 0, marginTop: '1px',
                      }}
                    >
                      {OPTION_LABELS[idx]}
                    </span>
                    <span>{option.meaning}</span>
                  </button>
                );
              })}
            </div>
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
              🎉 Hoàn thành bài kiểm tra
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
