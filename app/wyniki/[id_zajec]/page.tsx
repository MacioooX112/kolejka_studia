'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { wynikItem, zajecia } from '@/app/types/types';

function WynikiContent() {
  const params = useParams();
  const id_zajec = params.id_zajec as string;

  const [wynikiList, setWynikiList] = useState<wynikItem[]>([]);
  const [zajecie, setZajecie] = useState<zajecia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Pobieramy szczegóły zajęć (w tym pole czy_wyniki)
        const zajeciaRes = await fetch(`/api/getClassDetails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id_zajec })
        });
        const zajeciaData = await zajeciaRes.json();
        setZajecie(zajeciaData);

        // 2. Jeśli wyniki są dostępne (czy_wyniki === true), pobieramy je z API
        if (zajeciaData && zajeciaData.czy_wyniki) {
          const wynikiRes = await fetch(`/api/getResults`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_zajec })
          });
          const wynikiData = await wynikiRes.json();
          if (Array.isArray(wynikiData)) {
            setWynikiList(wynikiData);
          }
        }
      } catch (err) {
        console.error('Błąd podczas pobierania danych:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id_zajec]);

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Ładowanie wyników...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-sm text-indigo-600 hover:underline mb-2 inline-block">
          ← Powrót do strony głównej
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Wyniki przydziału zadań</h1>

        {/* Ładne wyświetlenie informacji o zajęciach, których dotyczy tabela */}
        {zajecie && (
          <div className="mt-4 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">Przedmiot zajęć</p>
            <p className="text-xl font-bold text-gray-900">{zajecie.przedmiot}</p>
            <p className="text-sm text-gray-600 mt-0.5">
              Data: {new Date(zajecie.data).toDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Sprawdzenie flagi czy_wyniki */}
      {!zajecie || !zajecie.czy_wyniki ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl text-center shadow-sm">
          <p className="text-base font-medium">
            Wyniki kolejności zostaną ogłoszone w wieczór przed zajęciami.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                <th className="py-3 px-6">Pozycja</th>
                <th className="py-3 px-6">Imię i Nazwisko</th>
                <th className="py-3 px-6 text-center">Liczba plusów</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800 text-sm">
              {wynikiList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-gray-500 italic">
                    Brak zgłoszeń dla tych zajęć.
                  </td>
                </tr>
              ) : (
                wynikiList.map((item) => (
                  <tr key={item.pozycja} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6 font-bold text-indigo-600">#{item.pozycja + 1}</td>
                    <td className="py-4 px-6 font-medium">
                      {item.zgloszenie.imie} {item.zgloszenie.nazwisko}
                    </td>
                    <td className="py-4 px-6 text-center font-semibold">{item.zgloszenie.liczba_plusow}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function WynikiPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <Suspense fallback={<div className="p-8 text-center text-gray-600">Ładowanie...</div>}>
        <WynikiContent />
      </Suspense>
    </main>
  );
}