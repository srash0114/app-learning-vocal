'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Word, WordContextType } from './types';

const WordContext = createContext<WordContextType | undefined>(undefined);

export function WordProvider({ children }: { children: React.ReactNode }) {
  const [words, setWords] = useState<Word[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedWords = localStorage.getItem('wm_words');
    const savedScore = localStorage.getItem('wm_score');
    const savedStreak = localStorage.getItem('wm_streak');

    if (savedWords) setWords(JSON.parse(savedWords));
    if (savedScore) setScore(parseInt(savedScore));
    if (savedStreak) setStreak(parseInt(savedStreak));
    setLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wm_words', JSON.stringify(words));
    localStorage.setItem('wm_score', score.toString());
    localStorage.setItem('wm_streak', streak.toString());
  }, [words, score, streak, loaded]);

  const addWord = (word: Word) => {
    const exists = words.some(w => w.word.toLowerCase() === word.word.toLowerCase());
    if (!exists) {
      setWords([...words, { ...word, added: Date.now() }]);
    }
  };

  const deleteWord = (index: number) => {
    setWords(words.filter((_, i) => i !== index));
  };

  const updateWordStatus = (index: number, status: Word['status']) => {
    const newWords = [...words];
    newWords[index].status = status;
    setWords(newWords);
  };

  const bulkAddWords = (newWords: Word[]) => {
    setWords(prev => {
      const existingWords = new Set(prev.map(w => w.word.toLowerCase()));
      const filtered = newWords.filter(w => !existingWords.has(w.word.toLowerCase()));
      return [...prev, ...filtered.map(w => ({ ...w, added: Date.now() }))];
    });
  };

  const saveAll = () => {
    localStorage.setItem('wm_words', JSON.stringify(words));
    localStorage.setItem('wm_score', score.toString());
    localStorage.setItem('wm_streak', streak.toString());
  };

  const value: WordContextType = {
    words,
    score,
    streak,
    addWord,
    deleteWord,
    updateWordStatus,
    saveAll,
    bulkAddWords,
  };

  return <WordContext.Provider value={value}>{children}</WordContext.Provider>;
}

export function useWords(): WordContextType {
  const context = useContext(WordContext);
  if (!context) {
    throw new Error('useWords must be used within WordProvider');
  }
  return context;
}

export function useScore() {
  const context = useContext(WordContext);
  if (!context) {
    throw new Error('useScore must be used within WordProvider');
  }
  return {
    score: context.score,
    streak: context.streak,
  };
}
