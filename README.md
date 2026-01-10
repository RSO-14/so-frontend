# Uporabniški vmesnik sistema za obveščanje

Ta projekt predstavlja uporabniški vmesnik sistema za obveščanje, zasnovan v ogrodju Next.js z uporabo TypeScripta in Reacta (App Router).

## Lokalno razvojno okolje
### 1. Zahteve
- Node.js (različica 18 ali novejša)
- npm (ali yarn, pnpm)

### 2. Kloniranje repozitorija
```bash
git clone https://github.com/RSO-14/so-frontend.git
cd so-frontend
```

### 3. Zagon razvojnega strežnika
```bash
npm run dev
```
Aplikacija je nato dostopna na: [http://localhost:3000](http://localhost:3000)

### 4. Urejanje strani
Privzeta začetna datoteka aplikacije se nahaja v:

```
app/page.tsx
```

Aplikacija podpira samodejno osveževanje pri spremembah (Hot Reload).

## Struktura aplikacije

Frontend deluje kot odjemalec za mikrostoritve zalednega sistema (`users`, `companies-filter`, `companies-sync`) ter vključuje povezavo na GraphQL, REST in SSE vmesnike.
Frontend aplikacija je sestavljena iz naslednjih strani, ki pokrivajo osnovne funkcionalnosti sistema:

- `/login` – Prijava uporabnika (GraphQL `login`).
- `/register` – Registracija novega uporabnika (GraphQL `register`).
- `/events` – Prikaz opozoril (GET iz `companies-filter`).
- `/events/create` – Oddaja dogodkov za organizacije (POST v `companies-sync`).
- `/profile` – Podatki o uporabniku.

Strani uporabljajo JWT žeton, ki se shrani v `localStorage` in se pošilja v `Authorization` glavi.