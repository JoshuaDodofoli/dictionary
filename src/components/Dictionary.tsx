import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Definition, DictionaryEntry, Meaning } from '../lib/Interface';
import { Howl } from 'howler';

export default function Dictionary() {
  const [word, setWord] = useState<string>('');
  const [data, setData] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sound, setSound] = useState<Howl | null>(null);

  useEffect(() => {
    if (data?.phonetics.find(p => p.audio)?.audio) {
      const audioUrl = data.phonetics.find(p => p.audio)?.audio || '';
      const newSound = new Howl({
        src: [audioUrl],
        html5: true,
      });
      setSound(newSound);
    }
  }, [data]);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!word.trim()) return;

    setLoading(true);
    try {
      const resp = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const result = await resp.json();

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

  const handlePhonetic = () => {
    if (sound) {
      sound.play();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-28 md:my-32">
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

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m21 21-4.34-4.34"></path>
            <circle cx="11" cy="11" r="8"></circle>
          </svg>

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
                <p className="text-purple-500 text-xl mt-2">
                  {data.phonetic || data.phonetics.find(p => p.text)?.text}
                </p>
              </div>
              <button onClick={handlePhonetic} className="size-10 cursor-pointer rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-2xl hover:bg-purple-600 hover:text-white transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
                </svg>
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