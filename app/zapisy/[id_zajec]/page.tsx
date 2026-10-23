'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { zajecia } from '@/app/types/types';

function ZapisyForm() {
  const params = useParams();
  const id_zajec = params.id_zajec as string;

  const [imie, setImie] = useState<string>('');
  const [nazwisko, setNazwisko] = useState<string>('');
  const [liczba_plusow, setLiczba_plusow] = useState<number>(0);

  const [zajecie, setZajecie] = useState<zajecia | null>(null);
  const [loadingZajecie, setLoadingZajecie] = useState<boolean>(true);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [status, setStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/getClassDetails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id_zajec })
    })
      .then((res) => res.json())
      .then((data) => {
        setZajecie(data);
        setLoadingZajecie(false);
      })
      .catch((err) => {
        console.error('Błąd pobierania danych zajęć:', err);
        setLoadingZajecie(false);
      });
  }, [id_zajec]);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Walidacja pól formularza
    if (!imie.trim() || !nazwisko.trim()) {
      setValidationError('Wszystkie pola tekstowe muszą zostać wypełnione.');
      return;
    }

    if (liczba_plusow < 0) {
      setValidationError('Liczba plusów nie może być ujemna.');
      return;
    }

    // Otwarcie popupu podsumowującego
    setShowModal(true);
  };

  const handleFinalConfirm = async () => {
    setShowModal(false);
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch('/api/addRegistration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imie: imie,
          nazwisko: nazwisko,
          id_zajec: id_zajec,
          liczba_plusow: liczba_plusow,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ success: true, message: 'Zgłoszenie zostało przyjęte pomyślnie!' });
        setImie('');
        setNazwisko('');
        setLiczba_plusow(0);
      } else {
        setStatus({ success: false, message: data.error || 'Wystąpił błąd podczas zapisu.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ success: false, message: 'Błąd połączenia z serwerem.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full border border-gray-100 relative">
      <div className="mb-6">
        <Link href="/" className="text-sm text-indigo-600 hover:underline mb-2 inline-block">
          ← Powrót do strony głównej
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Zapisz się na zajęcia</h1>
        <p className="text-xs text-gray-400 mt-1">ID zajęć: {id_zajec}</p>
      </div>

      {/* Wyświetlanie danych zajęć pobranych z API */}
      {loadingZajecie ? (
        <p className="text-xs text-gray-500 mb-6 animate-pulse">Ładowanie informacji o zajęciach...</p>
      ) : zajecie ? (
        <div className="bg-indigo-50/50 rounded-lg p-4 mb-6 border border-indigo-100">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">Wybrane zajęcia</p>
          <p className="text-base font-bold text-gray-900">{zajecie.przedmiot}</p>
          <p className="text-sm text-gray-600">
            {new Date(zajecie.data).toDateString()}
          </p>
        </div>
      ) : (
        <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-6">Nie udało się pobrać szczegółów zajęć.</div>
      )}

      {status && (
        <div
          className={`p-4 mb-6 rounded-lg text-sm ${
            status.success
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {status.message}
        </div>
      )}

      {validationError && (
        <div className="p-3 mb-4 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          {validationError}
        </div>
      )}

      <form onSubmit={handleInitialSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imię</label>
          <input
            type="text"
            required
            value={imie}
            onChange={(e) => setImie(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-gray-400"
            placeholder="Wpisz swoje imię"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko</label>
          <input
            type="text"
            required
            value={nazwisko}
            onChange={(e) => setNazwisko(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-gray-400"
            placeholder="Wpisz swoje nazwisko"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Liczba dotychczas zgromadzonych przez ciebie plusów
          </label>
          <input
            type="number"
            required
            min={0}
            value={liczba_plusow}
            onChange={(e) => setLiczba_plusow(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 shadow-sm"
        >
          {submitting ? 'Wysyłanie...' : 'Przejdź do podsumowania'}
        </button>
      </form>

      {/* POPUP (MODAL) Z PODSUMOWANIEM */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full border border-gray-100 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Podsumowanie zgłoszenia</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-700">
              <p><strong className="text-gray-900">Przedmiot:</strong> {zajecie?.przedmiot}</p>
              <p><strong className="text-gray-900">Data zajęć:</strong> {zajecie?.data ? new Date(zajecie.data).toLocaleString('pl-PL') : '-'}</p>
              <hr className="border-gray-200 my-2" />
              <p><strong className="text-gray-900">Imię i nazwisko:</strong> {imie} {nazwisko}</p>
              <p><strong className="text-gray-900">Liczba plusów:</strong> {liczba_plusow}</p>
            </div>

            <div className="text-xs text-gray-500 leading-relaxed bg-indigo-50/40 p-3 rounded-lg border border-indigo-100">
              Klikając "Potwierdź" przysięgasz na mamę, że podana liczba plusów jest zgodna z prawdą
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition"
              >
                Wróć i edytuj
              </button>
              <button
                type="button"
                onClick={handleFinalConfirm}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition shadow-sm"
              >
                Potwierdź
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ZapisyPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-gray-500">Ładowanie formularza...</div>}>
        <ZapisyForm />
      </Suspense>
    </main>
  );
}