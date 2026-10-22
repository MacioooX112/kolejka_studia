export type zajecia = {
    id: number;
    data: Date;
    przedmiot: string;
    zadania_link?: string;
    czy_wyniki: boolean;
}

export type zgloszenia = {
    id: number;
    imie: string;
    nazwisko: string;
    id_zajec: number;
    liczba_plusow: number;
}

export type wyniki = {
    id: number;
    id_zgloszenia: number;
    pozycja: number;
}

export type wynikItem = {
  zgloszenie: zgloszenia;
  pozycja: number;
}