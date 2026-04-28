import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Definition, DictionaryEntry, Meaning } from '../lib/Interface';

export default function Dictionary() {
  const [word, setWord] = useState<string>('');
  // Set the state type to our interface or null
  const [data, setData] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!word.trim()) return;
    
    setLoading(true);
    try {
      const resp = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const result = await resp.json();
      
      // If the API returns a 404, 'result' is usually an object with a message, 
      // not an array of entries.
      if (resp.ok && Array.isArray(result)) {
        setData(result[0]);
      } else {
        setData(null);
      }
    } catch (err) {
      setData(null);
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-28 md:mt-32">
      <form onSubmit={handleSearch} className="relative w-full">
        <input
          type="text"
          placeholder="Search any word..."
          className="w-full p-4 pr-14 rounded-full border border-gray-300 focus:outline-purple-500 transition-all"
          value={word}
          onChange={(e) => setWord(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 size-10 bg-purple-100 rounded-full text-purple-600 disabled:opacity-50"
        >
          {loading ? '...' : '🔍'}
        </button>
      </form>

      <AnimatePresence mode="wait">
        {data && (
          <motion.div
            key={data.word}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mt-12 w-full"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-5xl font-bold capitalize">{data.word}</h1>
                {/* Fallback for phonetic string if it's missing */}
                <p className="text-purple-500 text-xl mt-2">
                   {data.phonetic || data.phonetics.find(p => p.text)?.text}
                </p>
              </div>
              <button className="size-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-2xl hover:bg-purple-600 hover:text-white transition-colors">
                ▶
              </button>
            </div>

            {data.meanings.map((meaning: Meaning, idx: number) => (
              <motion.div 
                key={`${data.word}-${meaning.partOfSpeech}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="mt-10"
              >
                <div className="flex items-center gap-4">
                  <span className="italic font-bold text-lg">{meaning.partOfSpeech}</span>
                  <hr className="flex-1 border-t border-gray-200" />
                </div>
                
                <div className="mt-6">
                  <h3 className="text-gray-400">Meaning</h3>
                  <ul className="list-disc ml-6 mt-4 space-y-3 marker:text-purple-500">
                    {meaning.definitions.slice(0, 3).map((def: Definition, i: number) => (
                      <li key={i} className="text-gray-700">{def.definition}</li>
                    ))}
                  </ul>
                </div>

                {meaning.synonyms && meaning.synonyms.length > 0 && (
                  <div className="mt-8 flex gap-4 items-baseline">
                    <h3 className="text-gray-400">Synonyms</h3>
                    <div className="flex flex-wrap gap-2">
                      {meaning.synonyms.slice(0, 3).map((s: string) => (
                        <span key={s} className="text-purple-600 font-bold hover:underline cursor-pointer">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}