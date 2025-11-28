# 🐳 Ramingo CMS - Docker Setup

Guida completa per eseguire Ramingo CMS con Docker Desktop.

## 📋 Prerequisiti

- **Docker Desktop** installato e avviato
  - [Download Docker Desktop per Windows](https://docs.docker.com/desktop/install/windows-install/)
  - [Download Docker Desktop per Mac](https://docs.docker.com/desktop/install/mac-install/)
  - [Download Docker Desktop per Linux](https://docs.docker.com/desktop/install/linux-install/)
- **Git** (opzionale, per clonare il repository)

## 🚀 Avvio Rapido

### 1. Clona il repository (se necessario)

```bash
git clone https://github.com/yayoboy/Ramingo.git
cd Ramingo
```

### 2. Avvia i container

```bash
docker-compose up -d
```

Questo comando:
- 📦 Costruisce l'immagine Docker
- 🚀 Avvia i servizi (app + admin panel)
- 🔄 Esegue in background (modalità detached)

### 3. Verifica che i servizi siano attivi

```bash
docker-compose ps
```

Dovresti vedere:
```
NAME               STATUS         PORTS
ramingo-app        Up             0.0.0.0:8080->80/tcp
ramingo-admin      Up             0.0.0.0:3000->3000/tcp
```

### 4. Accedi all'applicazione

- **Frontend CMS**: http://localhost:8080
- **API Health Check**: http://localhost:8080/api/health
- **Admin Panel**: http://localhost:3000/admin
- **Admin Login**: http://localhost:3000/admin/login

## 🔐 Credenziali Default

Al primo avvio, viene creato automaticamente un utente amministratore:

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **IMPORTANTE**: Cambia la password dopo il primo accesso!

## 📂 Struttura Docker

```
Ramingo/
├── Dockerfile                    # Immagine principale PHP + Nginx
├── docker-compose.yml            # Orchestrazione servizi
├── .dockerignore                 # File esclusi dal build
├── docker/
│   ├── nginx/
│   │   ├── nginx.conf           # Configurazione Nginx
│   │   └── default.conf         # Virtual host default
│   ├── php/
│   │   ├── www.conf             # PHP-FPM pool
│   │   └── php.ini              # Configurazione PHP
│   ├── supervisor/
│   │   └── supervisord.conf     # Supervisore processi
│   └── entrypoint.sh            # Script di inizializzazione
```

## 🛠️ Comandi Utili

### Visualizza i log

```bash
# Tutti i servizi
docker-compose logs -f

# Solo l'applicazione
docker-compose logs -f app

# Solo l'admin panel
docker-compose logs -f admin
```

### Ferma i container

```bash
docker-compose stop
```

### Riavvia i container

```bash
docker-compose restart
```

### Ferma e rimuovi i container

```bash
docker-compose down
```

### Ricostruisci le immagini

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Accedi al container

```bash
# Shell nell'applicazione
docker exec -it ramingo-app sh

# Shell nell'admin panel
docker exec -it ramingo-admin sh
```

### Pulisci tutto (container, volumi, immagini)

```bash
docker-compose down -v
docker system prune -a
```

## 📊 Servizi Inclusi

### 1. **Ramingo App** (`ramingo-app`)

- **Porta**: 8080
- **Tecnologie**:
  - PHP 8.2 + FPM
  - Nginx
  - Alpine Linux
- **Servizi gestiti**:
  - PHP-FPM (porta 9000)
  - Nginx (porta 80)
  - Supervisord (process manager)

### 2. **Admin Panel** (`ramingo-admin`)

- **Porta**: 3000
- **Tecnologie**:
  - Node.js 18
  - React + Vite
  - TypeScript
- **Hot Reload**: Attivo in modalità sviluppo

## 💾 Volumi Persistenti

I dati persistono tra i riavvi grazie ai volumi Docker:

```yaml
volumes:
  - ./storage:/var/www/html/storage       # File CMS
  - ./data:/var/www/html/data             # Database JSON
  - ./public/uploads:/var/www/html/public/uploads  # Media uploads
```

## 🔧 Configurazione Avanzata

### Variabili d'Ambiente

Modifica `docker-compose.yml` per personalizzare:

```yaml
environment:
  - APP_ENV=production          # development | production
  - APP_DEBUG=false             # true | false
  - APP_URL=http://localhost:8080
```

### Porte Personalizzate

Per cambiare le porte, modifica `docker-compose.yml`:

```yaml
ports:
  - "8888:80"   # Invece di 8080:80
```

Poi riavvia:

```bash
docker-compose up -d
```

### PHP Configuration

Modifica `docker/php/php.ini` per cambiare:

```ini
memory_limit = 256M
upload_max_filesize = 100M
post_max_size = 100M
max_execution_time = 300
```

Ricostruisci l'immagine:

```bash
docker-compose build app
docker-compose up -d
```

### Nginx Configuration

Modifica `docker/nginx/default.conf` per personalizzare nginx.

## 🐛 Troubleshooting

### Porta già in uso

**Errore**: `Bind for 0.0.0.0:8080 failed: port is already allocated`

**Soluzione**:
```bash
# Verifica quale processo usa la porta
sudo lsof -i :8080  # Linux/Mac
netstat -ano | findstr :8080  # Windows

# Cambia porta in docker-compose.yml
ports:
  - "8888:80"  # Usa porta diversa
```

### Container non si avvia

**Soluzione**:
```bash
# Controlla i log
docker-compose logs app

# Ricostruisci l'immagine
docker-compose build --no-cache
docker-compose up -d
```

### Permission denied su storage/data

**Soluzione**:
```bash
# Imposta permessi corretti
chmod -R 775 storage data public/uploads
```

### Admin panel non si connette all'API

**Soluzione**:
```bash
# Verifica che l'app sia raggiungibile
curl http://localhost:8080/api/health

# Controlla le variabili d'ambiente admin
docker-compose logs admin
```

## 🔄 Aggiornamenti

### Aggiorna il codice

```bash
git pull origin main
docker-compose build
docker-compose up -d
```

### Aggiorna le dipendenze

```bash
# PHP
docker exec ramingo-app composer update

# Node.js
docker exec ramingo-admin npm update
```

## 📈 Performance

### Health Check

Il container ha un health check automatico:

```bash
docker inspect ramingo-app | grep -A 5 "Health"
```

### Monitoring

```bash
# Statistiche container
docker stats

# Risorse utilizzate
docker system df
```

## 🚀 Produzione

Per deployare in produzione:

1. **Modifica `docker-compose.yml`**:
   ```yaml
   environment:
     - APP_ENV=production
     - APP_DEBUG=false
   ```

2. **Rimuovi volumi di sviluppo**:
   Commenta i volumi source code:
   ```yaml
   # - ./public:/var/www/html/public
   # - ./src:/var/www/html/src
   ```

3. **Build ottimizzato**:
   ```bash
   docker-compose build --no-cache
   ```

4. **Usa reverse proxy** (Nginx, Traefik, Caddy)

5. **Abilita HTTPS** con Let's Encrypt

## 📝 Note Importanti

- ⚡ Il primo build può richiedere qualche minuto
- 🔄 Le modifiche al codice PHP richiedono rebuild
- 🎨 Le modifiche React hanno hot-reload automatico
- 💾 I dati in `storage/` e `data/` persistono tra riavvi
- 🔐 Cambia sempre le credenziali default in produzione

## 🆘 Supporto

- 📚 [Documentazione completa](README.md)
- 🐛 [Issue Tracker](https://github.com/yayoboy/Ramingo/issues)
- 💬 [Discussions](https://github.com/yayoboy/Ramingo/discussions)

## 📄 Licenza

Vedi [LICENSE](LICENSE) per dettagli.

---

**Fatto! Ora Ramingo CMS gira in Docker** 🎉

Accedi a:
- Frontend: http://localhost:8080
- Admin: http://localhost:3000/admin
