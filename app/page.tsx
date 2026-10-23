'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { zajecia } from './types/types';


export default function LandingPage() {
  const [classes, setClasses] = useState<zajecia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/getClassesForLanding')
      .then((res) => res.json())
      .then((data) => {
        setClasses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Błąd pobierania zajęć:', err);
        setLoading(false);
      });

  }, []);

  // Grupowanie zajęć według przedmiotu (kolumny)
  const groupedClasses = classes.reduce((acc, item) => {
    if (!acc[item.przedmiot]) {
      acc[item.przedmiot] = [];
    }
    acc[item.przedmiot].push(item);
    return acc;
  }, {} as Record<string, zajecia[]>);

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Ładowanie zajęć...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Rozdzielanie zadań na zajęciach
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {Object.entries(groupedClasses).map(([przedmiot, zajeciaList]) => {
          // Najbliższe zajęcia to pierwszy element w posortowanej liście dla danego przedmiotu
          const upcomingClass = zajeciaList[0];

          return (
            <div
              key={przedmiot}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between border border-gray-100"
            >
              <div>
                <h2 className="text-xl font-semibold text-indigo-600 mb-4 pb-2 border-b border-gray-100">
                  {przedmiot}
                </h2>

                {upcomingClass ? (
                  <div className="bg-indigo-50/50 rounded-lg p-4 mb-6 border border-indigo-100">
                    <p className="text-xs uppercase tracking-wider font-semibold text-indigo-500 mb-1">
                      Najbliższe zajęcia
                    </p>
                    <p className="text-lg font-bold text-gray-800 mb-3">
                      {new Date(upcomingClass.data).toDateString()}
                    </p>

                    {upcomingClass.zadania_link ? (
                      <a
                        href={upcomingClass.zadania_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        🔗 Link do zadań
                      </a>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Brak linku do zadań</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic mb-6">Brak nadchodzących zajęć w tej kategorii.</p>
                )}
              </div>

              {upcomingClass && (
                <div className="space-y-2">
                  <Link
                    href={`/zapisy/${upcomingClass.id}`}
                    className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition shadow-sm"
                  >
                    Zapisz się na zajęcia
                  </Link>
                  {upcomingClass.czy_wyniki && <Link
                    href={`/wyniki/${upcomingClass.id}`}
                    className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition"
                  >
                    Wyświetl wyniki
                  </Link>}
                  
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}