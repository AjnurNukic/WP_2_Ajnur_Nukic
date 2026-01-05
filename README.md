# Personal Life Dashboard

Dashboard aplikacija za praćenje svakodnevnih aktivnosti, navika i produktivnosti.

**Autor:** Ajnur Nukić  
**Datum:** 05.01.2026

## Korištene tehnologije

- Angular 21.0.4
- HTML
- TypeScript
- SCSS
- Firebase (Authentication & Firestore)
- Chart.js
- LocalStorage

## Setup projekta

### Instalacija
```bash
git clone [repository-url]
cd PersonalLifeDashboard
npm install
```

### Konfiguracija Firebase

Kreiraj `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
  }
};
```

### Pokretanje
```bash
ng serve
```

Aplikacija dostupna na `http://localhost:4200/`

## Opis funkcija

### Autentifikacija
- Registracija sa odabirom teme (zelena, plava, tamna)
- Login sistem preko Firebase Authentication
- Čuvanje korisničkih profila u Firestore
- Route zaštita pomoću AuthGuard

### Trackeri

**LocalStorage trackeri:**
- Habit Tracker 
- Sleep Tracker 
- Study Planner 
- Water Intake 
- Mood Tracker 
- Task Planner 
- Meal Planner 
- Gratitude Journal 
- Daily Reflection 

**Firestore trackeri:**
- Calendar Tracker 
- Finance Tracker 
- Fitness Tracker 

### Statistics
- Bar chart - sati spavanja
- Line chart - vrijeme učenja
- Pie chart - ukupna statistika
- AI preporuke zasnovane na pravilima (unos vode, kvalitet sna, produktivnost)

### Student Fun Zone
- Bingo, Kviz, Kanban, Vision board, Whiteboard
- Migrirano iz vanilla JS u Angular komponente

## Način korištenja

1. **Registracija** - unesi podatke i odaberi temu
2. **Login** - prijavi se sa email i password i odaberi temu
3. **Tracker Settings** - odaberi koje module želiš prikazati na dashboard-u
4. **Unos podataka** - klikni na tracker karticu i unesi podatke
5. **Statistics** - pregled grafika i AI preporuka
6. **Student Fun Zone** - koristi alate za produktivnost

## Skladištenje podataka

- **LocalStorage** - većina trackera (brzi pristup, offline rad)
- **Firestore** - Calendar, Finance, Fitness i User profili (cloud sinhronizacija)
- **Tema** - localStorage

## Struktura projekta
```
src/app/
├── core/
│   ├── guards/
│   │   └── auth.guard.ts           - zaštita ruta
│   ├── models/
│   │   └── tracker.model.ts        - TypeScript modeli za sve trackere
│   └── services/
│       ├── auth.service.ts         - autentifikacija i user management
│       ├── firestore.service.ts    - CRUD operacije za Firestore
│       └── theme.service.ts        - dinamičko učitavanje tema
└── features/
    ├── auth/
    │   ├── login/                  - login forma
    │   └── register/               - registracija forma
    └── dashboard/
        ├── statistics/             - charts i AI preporuke
        ├── student-fun-zone/       - igre i alati
        ├── tracker-settings/       - konfiguracija dashboard modula
        └── trackers/               - svi tracker moduli
            ├── habit-tracker/
            ├── sleep-tracker/
            ├── study-planner/
            ├── fitness-tracker/
            ├── water-tracker/
            ├── mood-tracker/
            ├── finance-tracker/
            ├── task-planner/
            ├── meal-planner/
            ├── calendar-tracker/
            ├── gratitude-journal/
            └── daily-reflection/
```

## Firestore struktura
```
users/
└── {userId}/                    // Firebase UID (npr. 4r1IcLEY0ZZwnN29bIDNz4BLZwi2)
    ├── profile/
    │   └── data/                // korisnički profil (email, password, tema...)
    ├── calendar/                // kalendar eventi
    ├── finance/                 // finansijske transakcije
    └── fitness/                 // fitness aktivnosti
```

## Napomene

- Internet potreban samo za autentifikaciju i Firestore trackere
- Svaki tracker je nezavisna Angular komponenta
- Firebase automatski generiše jedinstvene User ID-ove
- Korisnički profili sigurno pohranjeni u Firestore
- AuthGuard sprečava pristup dashboard-u bez autentifikacije

---

This project was generated using Angular CLI version 21.0.4.

## Development server
```bash
ng serve
```

Open `http://localhost:4200/` in browser.

## Building
```bash
ng build
```

Build artifacts stored in `dist/` directory.