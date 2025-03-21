# Creazione della struttura del progetto
mkdir document-merger
cd document-merger

# Inizializzazione del progetto Node.js
npm init -y

# Installazione delle dipendenze backend
npm install express cors multer pdf-lib pdf2pic libreoffice-convert

# Installazione delle dipendenze di sviluppo
npm install --save-dev nodemon concurrently

# Creazione delle cartelle necessarie
mkdir uploads merged client

# Inizializzazione del progetto React
npx create-react-app client

# Installazione delle dipendenze frontend
cd client
npm install axios
cd ..

# Copia dei file del progetto
# (copia manualmente i file forniti nei rispettivi percorsi)

# Per avviare l'applicazione
npm run dev-full
