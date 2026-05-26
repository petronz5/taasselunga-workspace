# Taasselunga Workspace

## Descrizione Progetto
Taasselunga è un sistema distribuito basato su architettura a microservizi per la gestione di:

- inventario di magazzino
- approvvigionamento fornitori
- richieste di rifornimento dei punti vendita
- notifiche realtime

Il progetto utilizza:

- Spring Boot
- PostgreSQL
- RabbitMQ
- Keycloak
- Docker Compose
- Socket.IO

---

# Architettura Microservizi

## Servizi Backend

| Servizio | Porta | Descrizione |
|---|---|---|
| api-gateway | 8080 | API Gateway centrale |
| inventory-service | 8081 | Gestione prodotti, stock e movimenti |
| procurement-service | 8082 | Gestione ordini fornitori |
| notification-service | 8083 | Gestione notifiche realtime |
| point-of-sale-service | 8084 | Gestione richieste di rifornimento |
| keycloak | 9090 | Autenticazione e autorizzazione |
| postgres | 5434 | Database PostgreSQL |
| rabbitmq | 5672 / 15672 | Messaging asincrono |

---

# Tecnologie Utilizzate

## Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- RabbitMQ
- REST API
- JWT Authentication

## Database

- PostgreSQL 16

## Sicurezza

- Keycloak
- OAuth2 Resource Server
- JWT Bearer Token

## DevOps

- Docker
- Docker Compose

## Messaging

- RabbitMQ Topic Exchange
- Event-driven communication

---

# Avvio del Progetto

## Avvio servizi

```powershell
docker compose up --build
```

---

# Database

## Database utilizzati

- db_inventory
- db_procurement
- db_pos

---

# Seed Database

I file SQL esportati sono presenti nella cartella:

```text
postgres/
```

## File disponibili

- seed_inventory.sql.disabled
- seed_procurement.sql
- seed_pos.sql

---

# Import Seed Database

## Inventory

```powershell
docker exec -i taasselunga-postgres psql -U root -d db_inventory < postgres/seed_inventory.sql.disabled
```

## Procurement

```powershell
docker exec -i taasselunga-postgres psql -U root -d db_procurement < postgres/seed_procurement.sql
```

## POS

```powershell
docker exec -i taasselunga-postgres psql -U root -d db_pos < postgres/seed_pos.sql
```

---

# Utenti di Test

| Username | Password | Ruolo |
|---|---|---|
| luigi | luigi | OPERATORE_PUNTO_VENDITA |
| alessia | alessia | RESPONSABILE_APPROVVIGIONAMENTO |
| antonio | antonio | OPERATORE_DI_MAGAZZINO |

---

# Sicurezza

Il progetto utilizza:

- autenticazione JWT tramite Keycloak
- autorizzazione basata su ruoli
- protezione endpoint tramite Spring Security

Esempi:

- Luigi può creare richieste di rifornimento solo per il proprio store
- Alessia può creare ordini di riapprovvigionamento
- Antonio può gestire operazioni di magazzino

---

# Comunicazione tra Microservizi

## Comunicazione REST

```text
POS → Inventory
```

Il Point Of Sale Service comunica con Inventory Service per:

- scalare stock
- recuperare prodotti e disponibilità

---

## Comunicazione Asincrona RabbitMQ

### POS → Notification

Evento:

```text
pos
```

Invio notifiche realtime relative a richieste di rifornimento.

---

### Inventory → Notification

Evento:

```text
stock.low
```

Invio notifiche realtime quando un prodotto scende sotto soglia minima.

---

### Procurement → Notification

Evento:

```text
purchase.order.created
```

Invio notifiche realtime alla creazione di nuovi ordini procurement.

---

# Notification Service

Il Notification Service:

- consuma eventi RabbitMQ
- inoltra notifiche realtime tramite Socket.IO
- permette aggiornamenti realtime del frontend React

---

# Funzionalità Implementate

## Inventory Service

- gestione prodotti
- gestione stock
- movimenti di magazzino
- soglie minime
- decremento stock
- incremento stock
- notifiche stock basso
- gestione errori business

## Procurement Service

- visualizzazione ordini procurement
- creazione ordini procurement
- eventi RabbitMQ procurement

## Point Of Sale Service

- richieste di rifornimento
- controllo autorizzazioni store
- integrazione Inventory
- eventi RabbitMQ POS

## Notification Service

- consumer RabbitMQ
- websocket realtime
- gestione eventi distribuiti

---

# Gestione Errori

Il progetto implementa:

- validazione quantità
- gestione stock insufficiente
- gestione errori REST centralizzata
- codici HTTP coerenti

Esempio:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "La quantità non può essere negativa"
}
```

---

# RabbitMQ

## Exchange

```text
taasselunga-exchange
```

## Routing Keys

```text
stock.low
pos
purchase.order.created
```

---

# Keycloak

## Realm

```text
taasselunga
```

## Client

```text
taasselunga_frontend
```

---

# Autore
Progetto sviluppato per il corso di TAASS da Luca Di Salvo e Davide Petroni.

