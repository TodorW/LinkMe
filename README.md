# LinkMe

**Poveži se. Pomogni. Ojačaj zajednicu.**

LinkMe je mobilna aplikacija za mikro-solidarnost koja povezuje komšije kojima je potrebna pomoć sa volonterima spremnim da učine dobro djelo u svojoj zajednici.

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

## 🎯 O aplikaciji

LinkMe prevazilazi tehnologiju - to je platforma za ljudsku povezanost. Aplikacija olakšava međusobnu pomoć na lokalnom nivou, podstičući solidarnost i podršku među komšijama. Bez komplikacija, bez naknada, samo ljudi koji pomažu drugim ljudima.

### 🌟 Ključne prednosti
- **Brz odgovor** - Pomoć u par klikova
- **Sigurno i verifikovano** - Hashovani JMBG za zaštitu privatnosti
- **Intuitivan dizajn** - Prijateljski interfejs za sve generacije
- **Lokalna fokusiranost** - Povezivanje unutar vašeg naselja

---

## 📱 Funkcionalnosti

### 👤 Za korisnike kojima je potrebna pomoć
| Funkcija | Opis |
|----------|------|
| **📝 Brzo objavljivanje** | Kategorije, opis, hitnost - sve u 3 koraka |
| **📍 Lokalni volonteri** | Pronađite pomoć u svojoj neposrednoj blizini |
| **🔍 Praćenje u realnom vremenu** | Vidite status vašeg zahtjeva u svakom trenutku |
| **💬 Siguran čet** | Komunicirajte sa volonterima unutar aplikacije |
| **⭐ Ocjenjivanje** | Ocijenite iskustvo i pomozite drugima da odaberu |

### 🤝 Za volontere
| Funkcija | Opis |
|----------|------|
| **🎯 Pametno podudaranje** | AI preporučuje zahtjeve koji odgovaraju vašim vještinama |
| **🗺️ Interaktivna mapa** | Vizuelni pregled zahtjeva u vašoj okolini |
| **🔔 Notifikacije** | Budite prvi koji će odgovoriti na važne zahtjeve |
| **📊 Izgradnja reputacije** | Profil koji raste sa svakom pruženom pomoći |
| **🎖️ Volonterski put** | Pratite svoj doprinos zajednici |

---

## 🏗️ Tehnologije

### Frontend
<div align="center">
  
| Tehnologija | Namjena | Verzija |
|-------------|---------|---------|
| React Native | Cross-platform mobilni razvoj | SDK 54 |
| TypeScript | Tipizirani JavaScript | 5.x |
| React Navigation | Navigacija između ekrana | v7 |
| React Query | Upravljanje server stanjem | v5 |
| React Native Maps | Integracija mape | 1.14 |

</div>

### Backend
<div align="center">

| Tehnologija | Namjena | Verzija |
|-------------|---------|---------|
| Node.js | Runtime okruženje | 18+ |
| Express.js | REST API framework | v5 |
| PostgreSQL | Relaciona baza | 15+ |
| Drizzle ORM | Upravljanje bazom | 0.30 |
| Zod | Validacija podataka | 3.22 |

</div>

### Dizajn sistema
```css
Primarne boje:
- #FF6B35 (narandžasta) - toplina i pristupačnost
- #4ECDC4 (tirkizna) - povjerenje i pouzdanost

Tipografija:
- Nunito - moderan, čitljiv, prijateljski

Dizajn principi:
- Minimalizam
- Intuitivna navigacija
- Pristupačnost za sve uzraste
```

---

## 🗄️ Šema baze podataka

```sql
-- Osnovne tabele sistema
users (id, email, role, skills, rating, location)
help_requests (id, user_id, category, status, location, urgency)
conversations (id, request_id, participant1, participant2)
messages (id, conversation_id, sender_id, content, timestamp)
ratings (id, request_id, rating, review)
```

---

## 🚀 Pokretanje projekta

### Preduslovi
```bash
Node.js 18+ 
PostgreSQL 15+
Expo CLI (za mobilni razvoj)
Git
```

### Koraci za instalaciju

1. **Kloniranje repozitorijuma**
```bash
git clone https://github.com/yourusername/linkme.git
cd linkme
```

2. **Instalacija zavisnosti**
```bash
npm install
```

3. **Konfiguracija okruženja**
```bash
cp .env.example .env
# Uredite .env fajl sa svojim podacima
```

4. **Postavljanje baze podataka**
```bash
npm run db:setup
npm run db:push
```

5. **Pokretanje aplikacije**
```bash
# Pokrenite backend server
npm run server:dev

# U drugom terminalu pokrenite mobilnu aplikaciju
npm run expo:dev
```

6. **Testiranje na telefonu**
```bash
# Instalirajte Expo Go na telefon
# Skenirajte QR kod iz terminala
```

---

## 📋 Kategorije pomoći

<div align="center">

| Kategorija | Ikonica | Tipični primjeri |
|------------|---------|------------------|
| 🛒 Trgovina | shopping-cart | Namirnice, lijekovi, hitne potrepštine |
| 🏠 Čišćenje | home | Kućno čišćenje, organizacija prostora |
| 🔧 Popravke | tool | Popravka tehnike, male građevinske intervencije |
| 🚗 Prevoz | car | Vožnja do doktora, pomoć pri selidbi |
| 💻 IT pomoć | smartphone | Podešavanje telefona, instalacija softvera |
| 👥 Druženje | users | Posjete, razgovor, društvena podrška |
| 🌱 Bašta | sun | Baštovanstvo, uređenje zelenila |
| 🐾 Ljubimci | heart | Čuvanje kućnih ljubimaca, šetanje pasa |
| 📑 Administracija | file-text | Pomoć sa papirologijom, online formularima |
| ❓ Ostalo | more-horizontal | Sve ostalo što može biti potrebno |

</div>

---

## 🔒 Sigurnost i privatnost

✅ **Hashovanje JMBG-a** - Vaš jedinstveni broj je sigurno šifrovan  
✅ **End-to-end komunikacija** - Poruke su zaštićene  
✅ **Minimalni podaci** - Prikupljamo samo neophodno  
✅ **Lokalna fokusiranost** - Povezujemo samo komšije u blizini  
✅ **Kontrola profila** - Vi upravljate svojim vidljivim informacijama  

---


## 📄 Licenca

Distribuirano pod MIT licencom. Pogledajte [LICENSE](LICENSE) fajl za detalje.

```
Copyright 2026 LinkMe Tim

Dozvoljeno je besplatno korištenje, kopiranje, modifikovanje, spajanje, objavljivanje,
distribuiranje, podlicenciranje i/ili prodaja kopija Softvera, pod uslovom da se
gornja obavijest o autorskim pravima i ovaj dozvolni uslov uključe u sve kopije.
```

---

## 🙏 Zahvalnost

Hvala svim volonterima i korisnicima koji čine ovu platformu živom.  
Vaša dobra djela grade bolju zajednicu za sve nas.

**Zajedno smo jači.**  
**Zajedno smo LinkMe.**

---

<div align="center">

**"Najveće dobro koje možete učiniti za drugoga nije samo da podelite svoje bogatstvo, već da mu otkrijete njegovo vlastito."**  
*– Benjamin Disraeli*

</div>

---

⭐ **Ako vam se dopada ovaj projekt, dajte mu zvjezdu na GitHubu!** ⭐
