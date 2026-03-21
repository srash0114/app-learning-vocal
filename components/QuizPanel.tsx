'use client';

import { useState, useEffect } from 'react';
import { useWords } from '@/lib/context';
import { useToast } from '@/lib/toast-context';
import { Word } from '@/lib/types';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function QuizPanel() {
  const { words, saveAll } = useWords();
  const { show: showToast } = useToast();

  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (words.length >= 4 && !started) {
      const selected = shuffle([...words]).slice(0, Math.min(10, words.length));
      setQuizWords(selected);
      setStarted(true);
    }
  }, [words, started]);

  if (words.length < 4) {
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
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
        <p style={{ fontSize: '16px', color: 'var(--muted)' }}>
          Bạn cần ít nhất 4 từ để làm bài kiểm tra!
        </p>
        <button
          onClick={() => window.location.hash = '#add'}
          style={{
            marginTop: '20px',
            padding: '14px 22px',
            borderRadius: '12px',
            border: 'none',
            fontFamily: "'Syne',sans-serif",
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

  const currentQuestion = quizWords[currentIndex];
  const isQuizComplete = currentIndex >= quizWords.length;
  const progress = ((currentIndex) / quizWords.length) * 100;

  function generateOptions() {
    if (!currentQuestion) return [];

    const wrongPool = words.filter(w => w.word !== currentQuestion.word);
    const wrongs = shuffle(wrongPool).slice(0, 3);
    const options = shuffle([currentQuestion, ...wrongs]);
    return options;
  }

  function handleAnswer(chosenWord: string) {
    if (answered) return;

    setAnswered(true);
    setSelectedOption(chosenWord);

    if (chosenWord === currentQuestion.word) {
      setCorrect(c => c + 1);
      showToast('✅ Đúng rồi!');
    } else {
      setWrong(w => w + 1);
      showToast('❌ Sai! Đáp án đúng đã được tô xanh');
    }

    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < quizWords.length) {
        setCurrentIndex(nextIndex);
        setAnswered(false);
        setSelectedOption(null);
      }
    }, 1400);
  }

  function restartQuiz() {
    const selected = shuffle([...words]).slice(0, Math.min(10, words.length));
    setQuizWords(selected);
    setCurrentIndex(0);
    setCorrect(0);
    setWrong(0);
    setAnswered(false);
    setSelectedOption(null);
  }

  if (isQuizComplete) {
    const score = correct + wrong;
    const percentage = score > 0 ? Math.round((correct / score) * 100) : 0;
    let message = 'Cần cố gắng hơn! 💪';
    if (percentage >= 50) message = 'Khá tốt! Tiếp tục ôn nhé 😊';
    if (percentage >= 75) message = 'Giỏi lắm! 🌟';
    if (percentage >= 90) message = 'Xuất sắc! 🏆';

    return (
      <div
        style={{
          padding: '32px',
          maxWidth: '680px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '50px 20px',
            background: 'var(--surface)',
            borderRadius: '22px',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: '64px',
              fontWeight: 800,
              background: 'linear-gradient(135deg,var(--accent),var(--accent2))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {correct}/{quizWords.length}
          </div>
          <p style={{ color: 'var(--muted)', marginTop: '8px', fontSize: '16px' }}>
            {message}
          </p>
          <button
            onClick={restartQuiz}
            style={{
              margin: '20px auto 0',
              padding: '14px 22px',
              borderRadius: '12px',
              border: 'none',
              fontFamily: "'Syne',sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              background: 'var(--accent)',
              color: '#0d0f14',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            🔄 Làm lại
          </button>
        </div>
      </div>
    );
  }

  const options = generateOptions();

  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '680px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          color: 'var(--muted)',
          marginBottom: '24px',
        }}
      >
        <span>
          Câu <strong style={{ color: 'var(--text)' }}>{currentIndex + 1}</strong> /{' '}
          <strong style={{ color: 'var(--text)' }}>{quizWords.length}</strong>
        </span>
        <span>
          ✅ Đúng: <strong style={{ color: 'var(--text)' }}>{correct}</strong> &nbsp;|&nbsp;
          ❌ Sai: <strong style={{ color: 'var(--text)' }}>{wrong}</strong>
        </span>
      </div>

      <div style={{ marginBottom: '20px' }}>
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

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '22px',
          padding: '40px',
          textAlign: 'center',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: '12px',
          }}
        >
          Chọn nghĩa đúng của từ
        </div>
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 'clamp(32px,5vw,56px)',
            fontWeight: 800,
            letterSpacing: '-1.5px',
            color: 'var(--text)',
          }}
        >
          {currentQuestion.word}
        </div>
        <div
          style={{
            color: 'var(--accent2)',
            fontStyle: 'italic',
            fontSize: '17px',
            marginTop: '8px',
          }}
        >
          {currentQuestion.phonetic}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {options.map((option, idx) => {
          const isSelected = selectedOption === option.word;
          const isCorrect = option.word === currentQuestion.word;
          let bgColor = 'var(--surface)';
          let borderColor = 'var(--border)';
          let textColor = 'var(--text)';

          if (answered && isCorrect) {
            bgColor = 'rgba(110,231,183,0.1)';
            borderColor = 'var(--accent)';
            textColor = 'var(--accent)';
          } else if (answered && isSelected && !isCorrect) {
            bgColor = 'rgba(248,113,113,0.1)';
            borderColor = 'var(--danger)';
            textColor = 'var(--danger)';
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(option.word)}
              disabled={answered}
              style={{
                background: bgColor,
                border: `1.5px solid ${borderColor}`,
                borderRadius: '14px',
                padding: '18px 20px',
                color: textColor,
                fontSize: '15px',
                cursor: answered ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                fontFamily: "'Instrument Sans',sans-serif",
                transform: !answered ? 'translateY(0)' : undefined,
              }}
              onMouseEnter={e => {
                if (!answered) {
                  (e.target as HTMLButtonElement).style.borderColor = 'var(--accent2)';
                  (e.target as HTMLButtonElement).style.background = 'var(--surface2)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={e => {
                if (!answered) {
                  (e.target as HTMLButtonElement).style.borderColor = 'var(--border)';
                  (e.target as HTMLButtonElement).style.background = 'var(--surface)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                }
              }}
            >
              {option.meaning}
            </button>
          );
        })}
      </div>
    </div>
  );
}
