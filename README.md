# Secret Santa

Tamna, mobilno prilagođena Next.js aplikacija (JavaScript) za organizaciju Secret Santa grupa.

## Pokretanje

1. Kopiraj `.env.example` u `.env.local` i postavi `MONGODB_URI`.
2. `npm install`
3. `npm run dev` → [http://localhost:3000](http://localhost:3000)

## MongoDB

Aplikacija koristi jednu kolekciju `rooms` u bazi `secret_santa` (ime možeš promijeniti preko `MONGODB_DB`). Shema se kreira automatski pri prvom spremanju grupe — ne moraš ručno definirati polja u Atlasu.

Preporučeni indeks (opcionalno, u MongoDB Shell ili Atlas → Indexes):

```js
db.rooms.createIndex({ roomId: 1 }, { unique: true })
```