'use client';

import { useState } from 'react';
import { useWords } from '@/lib/context';
import { useToast } from '@/lib/toast-context';
import { AILookupResponse, Word } from '@/lib/types';

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
    <div style={{ padding: '32px', maxWidth: '860px', margin: '0 auto', width: '100%' }}>
      {/* Single word lookup */}
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: '14px',
          }}
        >
          Nhập từng từ + AI giải nghĩa
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <input
            type="text"
            value={wordInput}
            onChange={e => setWordInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && lookupWord()}
            placeholder="Nhập từ tiếng Anh... (vd: resilient)"
            style={{
              flex: 1,
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: '12px',
              padding: '14px 18px',
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: '16px',
              color: 'var(--text)',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(110,231,183,0.1)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button
            onClick={lookupWord}
            disabled={loading}
            style={{
              padding: '14px 22px',
              borderRadius: '12px',
              border: 'none',
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              background: 'var(--accent)',
              color: '#0d0f14',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? '⏳ Đang tra...' : '✨ AI Tra từ'}
          </button>
        </div>

        {/* AI Box */}
        {showAiBox && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(110,231,183,0.05), rgba(129,140,248,0.05))',
              border: '1px solid rgba(110,231,183,0.2)',
              borderRadius: '16px',
              padding: '20px',
              marginTop: '16px',
              animation: 'fadeUp 0.3s ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                marginBottom: '14px',
              }}
            >
              ⚡ AI giải nghĩa
            </div>

            {!pendingWord ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--muted)', fontSize: '14px' }}>
                <div className="spinner"></div>
                {loading ? 'Đang tra nghĩa...' : 'Tra từ không thành công'}
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Từ</div>
                  <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: '24px', fontWeight: 700, color: 'var(--accent)' }}>
                    {pendingWord.word}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Phiên âm</div>
                    <div style={{ fontSize: '15px', color: 'var(--accent2)', fontStyle: 'italic' }}>
                      {pendingWord.phonetic}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Loại từ</div>
                    <div style={{ fontSize: '15px', color: 'var(--warn)' }}>
                      {pendingWord.type}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Nghĩa tiếng Việt</div>
                  <div style={{ fontSize: '17px', fontWeight: 500, color: 'var(--text)' }}>
                    {pendingWord.meaning}
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Ví dụ</div>
                  <div style={{ fontSize: '15px', color: 'var(--muted)', fontStyle: 'italic' }}>
                    {pendingWord.example}
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Dịch</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    {pendingWord.example_vi}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                  <button
                    onClick={confirmAddWord}
                    style={{
                      padding: '14px 22px',
                      borderRadius: '12px',
                      border: 'none',
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: 'var(--accent)',
                      color: '#0d0f14',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    ✅ Thêm vào danh sách
                  </button>
                  <button
                    onClick={resetAiBox}
                    style={{
                      padding: '14px 22px',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: 'var(--surface2)',
                      color: 'var(--text)',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    ✕ Hủy
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bulk import */}
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: '14px',
          }}
        >
          Nhập danh sách hàng loạt
        </div>

        <div
          style={{
            background: 'var(--surface)',
            border: '1.5px dashed var(--border)',
            borderRadius: '14px',
            padding: '20px',
            transition: 'border-color 0.2s',
          }}
        >
          <textarea
            value={bulkInput}
            onChange={e => setBulkInput(e.target.value)}
            placeholder={'Nhập mỗi từ một dòng:\napple\nbanana\ninnovation\n...'}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text)',
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: '14px',
              lineHeight: '1.7',
              resize: 'vertical',
              minHeight: '120px',
            }}
          />
          <div
            style={{
              fontSize: '12px',
              color: 'var(--muted)',
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border)',
            }}
          >
            Mỗi từ một dòng · AI sẽ tự động tra nghĩa từng từ
          </div>
        </div>

        <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
          <button
            onClick={bulkImport}
            disabled={bulkLoading}
            style={{
              padding: '14px 22px',
              borderRadius: '12px',
              border: 'none',
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              cursor: bulkLoading ? 'not-allowed' : 'pointer',
              background: 'var(--accent)',
              color: '#0d0f14',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: bulkLoading ? 0.5 : 1,
            }}
          >
            📋 Nhập hàng loạt
          </button>
          {bulkStatus && (
            <div
              style={{
                fontSize: '13px',
                color: 'var(--muted)',
                alignSelf: 'center',
              }}
            >
              {bulkStatus}
            </div>
          )}
        </div>
      </div>

      {/* Word list */}
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: '14px',
          }}
        >
          Danh sách từ của bạn ({words.length} từ)
        </div>

        {words.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
            <p style={{ fontSize: '15px' }}>Chưa có từ nào. Hãy thêm từ đầu tiên!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[...words].reverse().map((w, ri) => {
              const i = words.length - 1 - ri;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = 'rgba(110,231,183,0.3)';
                    el.style.background = 'var(--surface2)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = 'var(--border)';
                    el.style.background = 'var(--surface)';
                  }}
                >
                  <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '10px' }}>
                    <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: '18px', fontWeight: 700 }}>
                      {w.word}
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: 'var(--accent2)',
                        fontStyle: 'italic',
                        marginTop: '2px',
                      }}
                    >
                      {w.phonetic}
                    </div>
                  </div>

                  <div style={{ flex: 1, fontSize: '14px', color: 'var(--muted)' }}>
                    {w.meaning}
                  </div>

                  <div
                    style={{
                      fontSize: '11px',
                      padding: '3px 10px',
                      borderRadius: '100px',
                      background: 'rgba(129,140,248,0.1)',
                      color: 'var(--accent2)',
                      fontWeight: 500,
                    }}
                  >
                    {w.type}
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      deleteWord(i);
                      showToast('🗑 Đã xóa "' + w.word + '"');
                    }}
                    style={{
                      background: 'transparent',
                      color: 'var(--danger)',
                      border: '1px solid rgba(248,113,113,0.3)',
                      padding: '6px 12px',
                      fontSize: '12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    🗑 Xóa
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
