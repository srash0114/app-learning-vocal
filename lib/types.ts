export interface Word {
  word: string;
  phonetic: string;
  type: string;
  meaning: string;
  example: string;
  example_vi: string;
  status: 'new' | 'learning' | 'mastered';
  added: number;
}

export interface WordContextType {
  words: Word[];
  score: number;
  streak: number;
  addWord: (word: Word) => void;
  deleteWord: (index: number) => void;
  updateWordStatus: (index: number, status: Word['status']) => void;
  saveAll: () => void;
  bulkAddWords: (words: Word[]) => void;
}

export interface AILookupResponse {
  word: string;
  phonetic: string;
  type: string;
  meaning: string;
  example: string;
  example_vi: string;
}
