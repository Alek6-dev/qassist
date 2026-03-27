This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# MyQAssist

MyQAssist est un SaaS en cours de développement destiné aux professionnels QA.
Objectif : transformer des spécifications fonctionnelles en exigences structurées et cas de test exploitables.

---

## 🚀 État actuel — Jalon 1 validé

Le produit existe techniquement.

### ✔ Stack

- Next.js (App Router)
- Supabase
- Auth SSR via @supabase/ssr
- PostgreSQL
- Row Level Security (RLS)

---

## 🔐 Authentification

- Auth Supabase
- Gestion via cookies (SSR compatible)
- Middleware Next.js protégeant `/dashboard`
- Redirection automatique si non authentifié

---

## 🗄 Base de données

### Table `projects`

| Champ       | Type        | Description              |
| ----------- | ----------- | ------------------------ |
| id          | uuid        | Primary key              |
| owner_id    | uuid        | Référence auth.users(id) |
| name        | text        | Nom du projet            |
| description | text        | Optionnel                |
| created_at  | timestamptz | Date de création         |

### Sécurité

- RLS activée
- Policies :
  - SELECT own projects
  - INSERT own projects
  - UPDATE own projects
  - DELETE own projects
- Isolation complète multi-utilisateur

---

## 📦 Fonctionnalités actuelles

- Sign up / Sign in
- Dashboard protégé
- Création de projet
- Liste des projets de l’utilisateur
- Logout

---

## 🛠 Lancer en local

```bash
npm install
npm run dev
```
