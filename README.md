# Kyocera Document Merger

Un'applicazione web moderna per unire documenti PDF, Word e immagini in un unico file PDF, sviluppata seguendo le linee guida di design Kyocera.

## Requisiti di Sistema

- Node.js (versione 14 o superiore)
- npm (Node Package Manager)
- LibreOffice (per la conversione di documenti Word)
- GT-Eesti-Pro font installato nel sistema

## Installazione

1. Clona il repository:
```bash
git clone <repository-url>
cd document-merger
```

2. Installa le dipendenze del server:
```bash
npm install
```

3. Installa le dipendenze del client:
```bash
cd client
npm install
cd ..
```

## Configurazione

1. Installa LibreOffice:
   - Scarica LibreOffice da: https://www.libreoffice.org/download/download/
   - Esegui l'installer e segui le istruzioni di installazione
   - **Importante**: Durante l'installazione, assicurati di selezionare l'opzione per aggiungere LibreOffice al PATH di sistema

2. Verifica che la porta 5001 sia disponibile:
   - Apri il Prompt dei Comandi come amministratore
   - Esegui: `netstat -ano | findstr :5001`
   - Se la porta è in uso, termina il processo o modifica la porta nel file di configurazione

3. Installa il font GT-Eesti-Pro:
   - Apri il pannello di controllo di Windows
   - Vai su "Aspetto e personalizzazione" > "Caratteri"
   - Trascina i file del font GT-Eesti-Pro nella finestra dei caratteri

## Avvio dell'Applicazione

### Modalità Sviluppo

1. Avvia il server e il client in modalità sviluppo:
```bash
npm run dev-full
```

2. L'applicazione sarà accessibile all'indirizzo: http://localhost:5001

### Modalità Produzione

1. Costruisci l'applicazione client:
```bash
npm run build
```

2. Avvia il server:
```bash
npm start
```

3. L'applicazione sarà accessibile all'indirizzo: http://localhost:5001

## Funzionalità

- Caricamento di documenti multipli (PDF, Word, immagini)
- Interfaccia drag & drop per il caricamento dei file
- Unione di documenti in un unico PDF
- Download del file PDF unito
- Design moderno e responsive seguendo le linee guida Kyocera:
  - Colori ufficiali Kyocera:
    - Blu primario (#0a9bcd): Utilizzato per pulsanti e accenti interattivi
    - Rosso brand (#e60012): Utilizzato per elementi del brand
    - Verde successo (#28a745): Utilizzato per conferme e completamenti
    - Grigio secondario (#333333): Utilizzato per testo e UI secondaria
  - Tipografia GT-Eesti-Pro:
    - Titoli (l-hero__title): 2.5rem, peso 300, colore blu
    - Sottotitoli (l-section__title): 2rem, peso 300
    - Testo corpo: 1.5rem, peso 400
    - Tutti i pulsanti: Maiuscolo, peso 400
  - Layout:
    - Spaziatura sezioni: 2rem uniforme
    - Bordi arrotondati: 4px per card e pulsanti
    - Linee di accento blu: 4px sotto i titoli
    - Logo Kyocera: 147x32 pixel
  - Elementi interattivi:
    - Pulsanti con effetti hover e ombreggiature
    - File items con animazioni di rimozione
    - Stati di caricamento con spinner animati
    - Feedback visivo per drag & drop
- Supporto per i seguenti formati:
  - PDF (.pdf)
  - Word (.doc, .docx)
  - Text (.txt, .rtf)
  - OpenDocument (.odt)
  - Immagini (.jpg, .jpeg, .png, .gif, .bmp)

## Limiti

- Dimensione massima file: 10MB per file
- Numero massimo di file: 10 per unione
- Risoluzione minima schermo consigliata: 1024x768

## Risoluzione Problemi

1. Se ricevi un errore durante la conversione dei documenti Word:
   - Verifica che LibreOffice sia installato correttamente
   - Riavvia l'applicazione dopo l'installazione di LibreOffice
   - Assicurati che LibreOffice sia nel PATH di sistema

2. Se il font non viene caricato correttamente:
   - Verifica che il font GT-Eesti-Pro sia installato a livello di sistema
   - Riavvia il browser dopo l'installazione del font

## Supporto

Per problemi tecnici o domande sull'applicazione, contattare il supporto tecnico Kyocera.