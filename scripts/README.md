# Seeding Scripts

Dieses Verzeichnis enthält Scripts zum Befüllen der Datenbank mit Testdaten.

## ⚠️ Sicherheitshinweis

**NIEMALS Credentials in Git committen!** Dieses Script verwendet Umgebungsvariablen für alle sensiblen Daten.

## Setup

1. Installiere die Dependencies:

```bash
cd scripts
npm install
```

2. **Supabase Credentials finden:**

   - Gehe zu deinem Supabase Dashboard
   - **Settings** → **API**
   - Kopiere:
     - **Project URL** → VITE_SUPABASE_URL
     - **service_role key** → SUPABASE_SERVICE_KEY (⚠️ NICHT den anon key!)

3. **Setze die Umgebungsvariablen** (PowerShell):

```powershell
$env:VITE_SUPABASE_URL="https://xxx.supabase.co"
$env:SUPABASE_SERVICE_KEY="dein-service-role-key"
$env:TEST_USER_PASSWORD="DeinSicheresPasswort123!"
```

Oder erstelle eine `.env` Datei im **Root-Verzeichnis** (wird von .gitignore ignoriert):

```
VITE_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=dein-service-role-key
TEST_USER_PASSWORD=DeinSicheresPasswort123!
```

## Testdaten erstellen

```bash
npm run seed
```

Dies erstellt:

- ✅ Test-User: `maxmustermann@familyplanner.com`
- ✅ Familie "Familie Mustermann"
- ✅ 2 Familienmitglieder (Max & Anna Mustermann)
- ✅ 12 Todos
- ✅ 12 Kalender-Events
- ✅ 15 Shopping Items
- ✅ 10 Rezepte mit Zutaten
- ✅ 10 Kontakte
- ✅ 12 Notizen

## Login

Nach dem Seeding kannst du dich einloggen mit:

- **Email**: `maxmustermann@familyplanner.com`
- **Password**: Das Passwort, das du in TEST_USER_PASSWORD gesetzt hast

## 🔒 Wichtig für Production

- ⚠️ Dieses Script ist **NUR für lokale Entwicklung**
- ⚠️ Verwende NIEMALS den Service Role Key im Frontend
- ⚠️ Pushe NIEMALS Credentials zu Git
