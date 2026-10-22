'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Sprawdzamy stan zalogowania na podstawie ciasteczka przy załadowaniu strony
  useEffect(() => {
    fetch("/api/admin/isLogged")
      .then(async (res) => {
        const { isLogged }: { isLogged: boolean} = await res.json()
        setIsAuthenticated(isLogged);
      })
      .catch((err) => {
        console.log("Błąd: ", err)
      })
  }, []);

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        const data = await res.json();
        setLoginError(data.error || 'Błędne hasło');
      }
    } catch (err) {
      setLoginError('Błąd połączenia z serwerem');
    }
  };

  const handleGenerateResults = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/generateResults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_zajec: 1, // Przykładowe ID zajęć
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ success: true, message: data.message || 'Wyniki zostały pomyślnie wygenerowane!' });
      } else {
        setStatus({ success: false, message: data.error || 'Wystąpił błąd podczas generowania wyników.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ success: false, message: 'Błąd połączenia z serwerem.' });
    } finally {
      setLoading(false);
    }
  };

  // Jeśli użytkownik nie jest zalogowany, pokazujemy formularz hasła
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full border border-gray-100 space-y-6">
          <div>
            <Link href="/" className="text-sm text-indigo-600 hover:underline mb-2 inline-block">
              ← Powrót do strony głównej
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Panel Administratora</h1>
            <p className="text-xs text-gray-500 mt-1">Wprowadź hasło, aby uzyskać dostęp</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasło</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Wpisz hasło administratora"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition shadow-sm"
            >
              Zaloguj się
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Panel główny po poprawnym zalogowaniu
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full border border-gray-100 space-y-6">
        <div>
          <Link href="/" className="text-sm text-indigo-600 hover:underline mb-2 inline-block">
            ← Powrót do strony głównej
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Panel Administratora</h1>
          <p className="text-xs text-green-600 font-medium mt-1">● Zalogowano pomyślnie</p>
        </div>

        {status && (
          <div
            className={`p-4 rounded-lg text-sm ${
              status.success
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {status.message}
          </div>
        )}

        <div>
          <button
            onClick={handleGenerateResults}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Generowanie...' : 'Wygeneruj wyniki dla zajęć (ID: 1)'}
          </button>
        </div>
      </div>
    </main>
  );
}