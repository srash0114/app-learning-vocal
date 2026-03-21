'use client';

import { useState } from 'react';
import { useWords } from '@/lib/context';
import { useToast } from '@/lib/toast-context';
import { AILookupResponse, Word } from '@/lib/types';
import { speakWord } from '@/lib/speak';

const wordListStyles = `
  .word-row {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 12px 14px;
    transition: background 0.15s, border-color 0.15s;
  }
  .word-row:hover {
    background: rgba(110,231,183,0.05);
    border-color: rgba(110,231,183,0.2);
  }
  .word-info {
    flex: 1;
    min-width: 0;
    border-left: 2px solid #6EE7B7;
    padding-left: 12px;
  }
  .word-name { font-family: var(--font-inter),sans-serif; font-size: 15px; font-weight: 700; color: #e8eaf2; word-break: break-word; }
  .word-phonetic { font-size: 12px; color: #818CF8; font-style: italic; margin-top: 2px; }
  .word-meaning-mobile { font-size: 12px; color: rgba(232,234,242,0.5); margin-top: 4px; line-height: 1.45; word-break: break-word; }
  .word-side {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 5px;
    flex-shrink: 0;
    width: 90px;
  }
  .word-type { font-size: 10px; padding: 4px 8px; border-radius: 7px; background: rgba(129,140,248,0.1); color: #818CF8; font-weight: 600; text-align: center; width: 100%; word-break: break-word; line-height: 1.4; }
  .word-actions { display: flex; align-items: center; gap: 5px; }
`;


export function AddWordsPanel() {
  const { words, addWord, deleteWord, bulkAddWords } = useWords();
  const { show: showToast } = useToast();

  const [wordInput, setWordInput] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingWord, setPendingWord] = useState<AILookupResponse | null>(null);
  const [showAiBox, setShowAiBox] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');

  async function lookupWord() {
    const word = wordInput.trim();
    if (!word) return;

    setLoading(true);
    setShowAiBox(true);

    try {
      const response = await fetch('/api/words/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      });

      const data = await response.json() as AILookupResponse & { error?: string };

      if (data.error) {
        setPendingWord(null);
        return;
      }

      setPendingWord(data);
    } catch (error) {
      console.error('Error:', error);
      setPendingWord(null);
    } finally {
      setLoading(false);
    }
  }

  function confirmAddWord() {
    if (!pendingWord) return;

    if (words.some(w => w.word.toLowerCase() === pendingWord.word.toLowerCase())) {
      showToast('⚠️ Từ này đã có trong danh sách!');
      return;
    }

    const newWord: Word = {
      ...pendingWord,
      status: 'new',
      added: Date.now(),
    };

    addWord(newWord);
    showToast('✅ Đã thêm "' + pendingWord.word + '"');
    resetAiBox();
    setWordInput('');
  }

  function resetAiBox() {
    setShowAiBox(false);
    setPendingWord(null);
  }

  async function bulkImport() {
    const lines = bulkInput
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (!lines.length) return;

    setBulkLoading(true);
    let added = 0;

    for (let i = 0; i < lines.length; i++) {
      const word = lines[i];
      setBulkStatus(`Đang tra (${i + 1}/${lines.length}): ${word}...`);

      if (words.some(w => w.word.toLowerCase() === word.toLowerCase())) {
        continue;
      }

      try {
        const response = await fetch('/api/words/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word }),
        });

        const data = await response.json() as AILookupResponse & { error?: string };

        if (data.error) continue;

        const newWord: Word = {
          ...data,
          status: 'new',
          added: Date.now(),
        };

        addWord(newWord);
        added++;
      } catch (error) {
        console.error(`Error looking up "${word}":`, error);
      }
    }

    setBulkLoading(false);
    setBulkStatus(`✅ Đã thêm ${added} từ!`);
    setBulkInput('');
    showToast(`✅ Nhập xong ${added}/${lines.length} từ`);

    setTimeout(() => setBulkStatus(''), 3000);
  }

  return (
    <div style={{ padding: '28px 28px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <style>{wordListStyles}</style>

      {/* ── Single word lookup ── */}
      <Section label="Tra từ bằng AI">
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={wordInput}
            onChange={e => setWordInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && lookupWord()}
            placeholder="Nhập từ tiếng Anh… (vd: resilient)"
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '13px 16px',
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: '15px',
              color: 'var(--text)',
              outline: 'none',
              transition: 'border-color 0.18s, box-shadow 0.18s',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'rgba(110,231,183,0.5)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(110,231,183,0.08)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <PrimaryButton onClick={lookupWord} disabled={loading}>
            {loading ? '⏳ Đang tra…' : '✦ Tra từ'}
          </PrimaryButton>
        </div>

        {/* AI result box */}
        {showAiBox && (
          <div
            style={{
              marginTop: '14px',
              borderRadius: '16px',
              border: '1px solid rgba(110,231,183,0.2)',
              background: 'linear-gradient(135deg, rgba(110,231,183,0.04), rgba(129,140,248,0.04))',
              overflow: 'hidden',
              animation: 'fadeUp 0.25s ease',
            }}
          >
            {/* Header bar */}
            <div
              style={{
                padding: '10px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: '#6EE7B7',
              }}
            >
              <span style={{ fontSize: '14px' }}>⚡</span> Kết quả AI
            </div>

            <div style={{ padding: '18px' }}>
              {!pendingWord ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--muted)', fontSize: '14px', padding: '8px 0' }}>
                  <div className="spinner" />
                  {loading ? 'Đang tra nghĩa…' : 'Tra từ không thành công'}
                </div>
              ) : (
                <>
                  {/* Word + phonetic */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: '28px', fontWeight: 800, color: '#e8eaf2', letterSpacing: '-0.5px' }}>
                      {pendingWord.word}
                    </div>
                    <SpeakButton word={pendingWord.word} />
                    <div style={{ fontSize: '14px', color: '#818CF8', fontStyle: 'italic' }}>
                      {pendingWord.phonetic}
                    </div>
                    <div style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: '6px', background: 'rgba(251,191,36,0.12)', color: '#fbbf24', fontSize: '11px', fontWeight: 600 }}>
                      {pendingWord.type}
                    </div>
                  </div>

                  {/* Meaning */}
                  <div style={{ marginBottom: '12px' }}>
                    <FieldLabel>Nghĩa tiếng Việt</FieldLabel>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#e8eaf2' }}>{pendingWord.meaning}</div>
                  </div>

                  {/* Example */}
                  <div style={{ marginBottom: '14px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <FieldLabel>Ví dụ</FieldLabel>
                    <div style={{ fontSize: '14px', color: 'rgba(232,234,242,0.65)', fontStyle: 'italic', lineHeight: 1.6 }}>{pendingWord.example}</div>
                    {pendingWord.example_vi && (
                      <div style={{ fontSize: '12px', color: 'rgba(232,234,242,0.35)', marginTop: '4px' }}>{pendingWord.example_vi}</div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <PrimaryButton onClick={confirmAddWord}>✦ Thêm vào danh sách</PrimaryButton>
                    <GhostButton onClick={resetAiBox}>Hủy</GhostButton>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* ── Bulk import ── */}
      <Section label="Nhập hàng loạt">
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1.5px dashed rgba(255,255,255,0.1)',
            borderRadius: '14px',
            padding: '16px',
            transition: 'border-color 0.2s',
          }}
        >
          <textarea
            value={bulkInput}
            onChange={e => setBulkInput(e.target.value)}
            placeholder={'Nhập mỗi từ một dòng:\napple\nbanana\ninnovation\n…'}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text)',
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: '14px',
              lineHeight: '1.8',
              resize: 'vertical',
              minHeight: '110px',
            }}
          />
          <div style={{ fontSize: '11px', color: 'rgba(232,234,242,0.3)', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '6px', letterSpacing: '0.3px' }}>
            Mỗi từ một dòng · AI sẽ tự động tra nghĩa
          </div>
        </div>
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <PrimaryButton onClick={bulkImport} disabled={bulkLoading}>
            {bulkLoading ? '⏳ Đang nhập…' : '▣ Nhập hàng loạt'}
          </PrimaryButton>
          {bulkStatus && (
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{bulkStatus}</span>
          )}
        </div>
      </Section>

      {/* ── Word list ── */}
      <Section label={`Danh sách từ · ${words.length} từ`}>
        {words.length === 0 ? (
          <EmptyState icon="📖" text="Chưa có từ nào. Hãy thêm từ đầu tiên!" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[...words].reverse().map((w, ri) => {
              const i = words.length - 1 - ri;
              return (
                <div key={i} className="word-row">
                  {/* Cột trái */}
                  <div className="word-info">
                    <div className="word-name">{w.word}</div>
                    <div className="word-phonetic">{w.phonetic}</div>
                    <div className="word-meaning-mobile">{w.meaning}</div>
                  </div>

                  {/* Cột phải */}
                  <div className="word-side">
                    <div className="word-type">{w.type}</div>
                    <div className="word-actions">
                      <SpeakButton word={w.word} />
                      <button
                        onClick={e => { e.stopPropagation(); deleteWord(i); showToast('🗑 Đã xóa "' + w.word + '"'); }}
                        style={{
                          background: 'transparent', color: 'rgba(248,113,113,0.6)',
                          border: '1px solid rgba(248,113,113,0.2)', height: '30px', padding: '0 10px',
                          fontSize: '11px', borderRadius: '7px', cursor: 'pointer', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.5)'; e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(248,113,113,0.6)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.2)'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ── Shared helpers ── */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          color: 'rgba(232,234,242,0.3)',
          marginBottom: '12px',
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(232,234,242,0.3)', marginBottom: '4px' }}>
      {children}
    </div>
  );
}

function PrimaryButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '12px 20px',
        borderRadius: '10px',
        border: 'none',
        fontFamily: "var(--font-inter), sans-serif",
        fontSize: '13px',
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: 'linear-gradient(135deg, #6EE7B7, #34d399)',
        color: '#0a0c10',
        transition: 'opacity 0.15s, transform 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        whiteSpace: 'nowrap',
        opacity: disabled ? 0.45 : 1,
        flexShrink: 0,
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget).style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { (e.currentTarget).style.transform = 'translateY(0)'; }}
    >
      {children}
    </button>
  );
}

function GhostButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 18px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.1)',
        fontFamily: "var(--font-inter), sans-serif",
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        background: 'rgba(255,255,255,0.04)',
        color: 'rgba(232,234,242,0.6)',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        flexShrink: 0,
      }}
      onMouseEnter={e => { (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget).style.color = '#e8eaf2'; }}
      onMouseLeave={e => { (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget).style.color = 'rgba(232,234,242,0.6)'; }}
    >
      {children}
    </button>
  );
}

function SpeakButton({ word }: { word: string }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); speakWord(word); }}
      title="Nghe phát âm"
      style={{
        background: 'rgba(110,231,183,0.08)',
        border: '1px solid rgba(110,231,183,0.2)',
        borderRadius: '7px',
        height: '30px',
        minWidth: '40px',
        padding: '0 10px',
        cursor: 'pointer',
        fontSize: '13px',
        lineHeight: 1,
        flexShrink: 0,
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(110,231,183,0.18)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(110,231,183,0.08)'; }}
    >
      🔊
    </button>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px', color: 'rgba(232,234,242,0.35)' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.6 }}>{icon}</div>
      <p style={{ fontSize: '14px' }}>{text}</p>
    </div>
  );
}
