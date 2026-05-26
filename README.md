# Medicinski Karton – Mobilna aplikacija

Mobilna aplikacija razvijena u okviru predmeta **Razvoj mobilnih aplikacija**.
Aplikacija omogućava upravljanje medicinskim kartonima pacijenata kroz različite korisničke uloge: administrator, lekar i pacijent.

## Tehnologije

* React Native
* Expo
* JavaScript
* Firebase Authentication
* Firebase Firestore
* Redux Toolkit
* Expo Router

---

# Funkcionalnosti aplikacije

## Pacijent

* Registracija i prijava
* Pregled ličnog medicinskog kartona
* Pregled terapija i zakazanih kontrola
* Izmena profila
* Dark / Light tema

## Lekar

* Pregled svojih pacijenata
* Dodavanje pacijenata
* Kreiranje i izmena medicinskih pregleda
* Upravljanje terapijama
* Kalendar pregleda i kontrola
* Pregled istorije kartona pacijenta

## Administrator

* Upravljanje lekarima
* Dodavanje i brisanje lekara
* Pregled svih pacijenata
* Upravljanje korisnicima sistema

---

# Struktura projekta

```bash
app/
assets/
firebase/
services/
store/
utils/
```

* `app/` – ekran aplikacije i navigacija
* `firebase/` – Firebase konfiguracija
* `services/` – komunikacija sa Firestore bazom
* `store/` – Redux Toolkit state management
* `utils/` – pomoćne funkcije i teme aplikacije

---

# Redux Toolkit

U projektu je korišćen Redux Toolkit za centralizovano upravljanje stanjem aplikacije.

Implementirani su:

* `createAsyncThunk`
* globalni state
* asinhrono učitavanje podataka
* CRUD operacije nad lekarima

Primer:

* učitavanje svih lekara
* dodavanje lekara
* brisanje lekara

---

# Firebase

Potrebno je podesiti Firebase projekat i dodati konfiguraciju u:

```bash
firebase/config.js
```

Aplikacija koristi:

* Firebase Authentication
* Cloud Firestore

---

# Autori

Student: Nikola Budalić
Predmet: Razvoj mobilnih aplikacija

---

# Napomena

Aplikacija je razvijena u edukativne svrhe kao projekat za fakultetski predmet.
