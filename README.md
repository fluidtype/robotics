🤖 Robotics Intelligence Hub

Un centro di controllo intelligente per il mondo della robotica.

Il Robotics Intelligence Hub è una dashboard web all'avanguardia progettata per aggregare, arricchire e analizzare in tempo reale le informazioni chiave del settore robotico. Funziona come un agente AI specializzato, fornendo agli utenti (investitori, analisti, professionisti) una visione completa che unisce le ultime notizie, il panorama aziendale e l'andamento del mercato crypto correlato.




🚀 User Flow: Cosa può fare l'utente

La dashboard è stata pensata per offrire un'esperienza utente chiara e professionale, organizzata in sezioni tematiche.

🏠 Homepage (/) – Today in Robotics

La pagina principale è il punto di ingresso dinamico e riassuntivo del giorno:

•
Hero con Insight AI: Un breve testo generato dall'AI che riassume il focus della giornata nel settore ("Oggi il focus è su X...").

•
Top Robotics News: Una selezione curata di 3-5 notizie principali, arricchite con un riassunto generato dall'AI, per cogliere immediatamente gli sviluppi più importanti.

•
Robotics Crypto Market: Una sezione dedicata che mostra i principali token della categoria "Robotics" presi da CoinGecko, con prezzo, variazione nelle ultime 24 ore e market cap.

•
Feed News Recenti: Una lista cronologica delle ultime notizie, con filtri rapidi per categoria, tag robotico e fonte.

📰 Pagina News (/news) – Tutte le News

Questa sezione offre una visione granulare e completa di tutti gli articoli raccolti:

•
Lista Completa: Tutte le notizie sono presentate in un formato leggibile.

•
Filtri Avanzati: L'utente può affinare la ricerca utilizzando filtri per:

•
Keyword di testo.

•
Categoria (es. product, funding, partnership, policy).

•
Tag robotici (es. humanoid, industrial, AI).

•
Intervallo temporale.

•
Fonte di provenienza.



•
Dettaglio Articolo: Ogni elemento mostra titolo, fonte, data, categoria, tag e un summary AI che ne facilita la comprensione immediata.

🏢 Pagina Aziende (/companies) – Vista Aziende

Una panoramica delle aziende menzionate nelle notizie, utile per l'analisi del panorama competitivo:

•
Lista e Ricerca: Elenco delle aziende con possibilità di ricerca per nome e filtro per categorie.

•
Card Azienda: Ogni card riassuntiva mostra:

•
Nome, Paese e Categorie di attività (es. humanoid / logistics).

•
Una breve descrizione generata dall'AI (summary AI).

•
Il numero di news recenti collegate, indicando l'attività mediatica.



👤 Scheda Azienda (/companies/[id]) – Dettaglio

La pagina di dettaglio fornisce un'analisi approfondita di una singola entità:

•
Dati Fondamentali: Nome, sito web, paese e categorie.

•
Summary AI: Un riassunto conciso e mirato che spiega il core business e la focalizzazione dell'azienda nel panorama robotico.

•
News Correlate: Una lista delle ultime notizie che hanno menzionato l'azienda, permettendo di tracciare la sua evoluzione e le sue attività.

🧠 Pagina Agente (/agent) – Ask the Agent

Il cuore dell'intelligenza artificiale del progetto:

•
Interfaccia di Query: Una casella di testo permette all'utente di porre domande specifiche (es. "Cosa è successo sui robot umanoidi negli ultimi 30 giorni?").

•
Risposta Basata sui Dati: L'agente AI (Grok) non cerca informazioni sul web, ma lavora esclusivamente sui dati raccolti nel database. Recupera le news pertinenti, le riassume e fornisce una risposta strutturata e verificabile, garantendo l'affidabilità delle informazioni.




⚙️ Architettura Backend: Come funziona sotto il cofano

Il progetto è costruito su uno stack moderno e scalabile, ottimizzato per il deploy su Vercel (piano free).

Stack Tecnico

Componente
Tecnologia
Ruolo
Frontend
Next.js 14 (App Router) + Tailwind CSS
Interfaccia utente reattiva e professionale (dark theme).
Backend
Next.js Route Handlers (/api)
Gestione delle API interne e della logica di business.
Database
Prisma + PostgreSQL
Fonte unica di verità per tutti i dati (news, aziende, crypto).
Intelligenza Artificiale
Grok API (LLM)
Arricchimento automatico dei dati e motore di risposta per l'agente.
Deploy
Vercel (Piano Free)
Hosting e gestione del cron job giornaliero.


Database (Prisma + Postgres)

Il database è il fulcro del sistema. I dati sono modellati per supportare l'arricchimento AI e le query complesse:

•
Source: Mappa le fonti di notizie (RSS, API).

•
RawNews: Contiene gli articoli grezzi appena acquisiti dagli RSS, in attesa di elaborazione.

•
Article: Contiene gli articoli puliti e arricchiti dall'AI (summary, categoria, tag, punteggio di importanza).

•
Company: Anagrafica delle aziende robotiche estratte e riassunte dall'AI.

•
RoboticsTokenSnapshot: Snapshot giornalieri dei dati crypto da CoinGecko.


Il senso del flusso dati: Le news passano da RawNews (grezze) a Article (arricchite). Le aziende vivono in Company, e il mercato crypto è storicizzato in RoboticsTokenSnapshot.

Pipeline ETL: Cron Job Giornaliero

Tutta la logica di acquisizione ed elaborazione dei dati è centralizzata in un unico cron job giornaliero (/api/cron/daily-batch), ottimizzato per il piano free di Vercel.

Il flusso di lavoro è sequenziale:

1.
Ingestione News Robotica (RSS)

•
Il job chiama le fonti RSS verticali sulla robotica.

•
Gli articoli vengono salvati nella tabella RawNews, con un controllo anti-duplicazione basato sull'URL.



2.
Arricchimento Dati con Grok (AI)

•
Per ogni record in RawNews non ancora processato, il job invia titolo e contenuto a Grok.

•
Grok restituisce: un summary AI, la categoria della notizia, i tag robotici pertinenti, un punteggio di importanza (0-100) e l'eventuale azienda principale menzionata.

•
Il risultato viene salvato nella tabella Article. Se viene identificata una nuova azienda, questa viene creata o aggiornata nella tabella Company.

•
Il record in RawNews viene marcato come processato.



3.
Snapshot Mercato Crypto (CoinGecko)

•
Il job interroga l'API gratuita di CoinGecko per la categoria "Robotics".

•
I dati dei top token (prezzo, market cap, variazioni) vengono salvati in un batch nella tabella RoboticsTokenSnapshot, creando uno storico giornaliero.




Nota sul Deploy: L'uso di un singolo cron job giornaliero è una scelta architetturale per rispettare i limiti del piano free di Vercel.

API Pubbliche per il Frontend

Il frontend interagisce con il backend tramite un set di API RESTful, ottimizzate per la lettura e il caching:

Endpoint
Metodo
Scopo
Parametri Supportati
/api/news
GET
Ritorna la lista di articoli (Article).
Ricerca testo, categoria, tag, range temporale, azienda, paginazione.
/api/companies
GET
Ritorna la lista delle aziende (Company).
Ricerca per nome, filtro per categorie.
/api/companies/[id]
GET
Ritorna i dettagli di una singola azienda.
ID dell'azienda. Include le news correlate.
/api/crypto/robotics
GET
Ritorna l'ultimo snapshot giornaliero dei token crypto robotici.
Nessuno (ritorna l'ultimo snapshot).
/api/agent/query
POST
Genera una risposta AI alla domanda dell'utente.
Domanda utente, range temporale opzionale.


Integrazione con Grok

L'Intelligenza Artificiale (Grok) ha due ruoli fondamentali:

1.
Arricchimento Dati (ETL): Nel cron job, Grok trasforma i dati grezzi in informazioni strutturate e analizzabili.

2.
Agente di Risposta (RAG): Nella pagina /agent, Grok risponde alle domande dell'utente. È cruciale notare che l'AI opera in modalità anti-hallucination, basando le sue risposte esclusivamente sul contesto fornito dalle news presenti nel database.




🛠️ Setup & Deploy

Prerequisiti

Per avviare il progetto in locale o effettuare il deploy sono necessari:

•
Node.js (versione recente)

•
Un gestore di pacchetti (pnpm/npm/yarn)

•
Un'istanza di database PostgreSQL (es. Vercel Postgres, Neon, o locale)

•
Account Vercel per il deploy e la configurazione dello Scheduler.

Variabili d'Ambiente

Queste variabili devono essere configurate nel file .env.local e nell'ambiente di deploy Vercel:

Variabile
Descrizione
DATABASE_URL
Stringa di connessione al database PostgreSQL.
XAI_API_KEY
Chiave API per l'accesso al modello Grok su xAI.
COINGECKO_API_KEY
Chiave API per l'accesso ai dati CoinGecko.
CRON_SECRET
Chiave segreta per proteggere l'endpoint del cron job.


Note sul Deploy Vercel

•
Scheduler: Il cron job (/api/cron/daily-batch) deve essere configurato tramite Vercel Scheduler per essere eseguito una volta al giorno.

•
Runtime: Gli endpoint API che interagiscono con Prisma devono forzare il runtime = "nodejs" per garantire la compatibilità con il client Prisma.



🗺️ Roadmap: Evoluzioni Future

Il progetto è pensato per evolvere. Le prossime possibili integrazioni includono:

1.
Analisi Storica Crypto: Implementazione di grafici interattivi per visualizzare l'andamento storico dei token robotici.

2.
Filtri Settoriali Avanzati: Aggiunta di filtri per settori specifici (es. warehouse automation, healthcare robotics).

3.
Alert e Notifiche: Sistema di notifica per avvisare gli utenti quando vengono pubblicate nuove notizie su aziende di loro interesse.

4.
Autenticazione e Workspace: Introduzione di un sistema di autenticazione per permettere agli utenti di salvare filtri, preferiti e creare workspace personali.

5.
Integrazione Dati Finanziari: Aggiunta di dati finanziari base (es. stock price) per le aziende quotate.
