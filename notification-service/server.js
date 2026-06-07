const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const amqp = require("amqplib");
const {initNotificationsTable, createNotification, getNotificationsByRole, markNotificationAsRead, deleteNotificationsByRole,} = require("./db/notificationRepository");
const app = express();
const server = http.createServer(app);

app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PATCH", "DELETE"],
    },
});



const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

//Echange di progetto
const EXCHANGE_NAME = "taasselunga-exchange";

//Evento pubblicato da Inventory quando un prodotto scende sotto la soglia minima (LowStockDetected)
const STOCK_ROUTING_KEY = "stock.low";

//Evento pubblicato da POS quando Luigi crea una nuova richiesta di rifornimento verso il deposito centrale (ReplenishmentRequestCreated).
const POS_ROUTING_KEY = "pos";

//Evento pubblicato da Procurement quando viene creato un nuovo ordine di approvvigionamento verso un fornitore esterno (PurchaseOrderCreated).
const PROCUREMENT_ROUTING_KEY = "purchase.order.created";

//Evento pubblicato da Inventory quando la merce viene ricevuta e registrata nel deposito centrale, con conseguente aggiornamento delle giacenze di magazzino (StockUpdated / GoodsReceived).
const GOODS_RECEIVED_ROUTING_KEY = "procurement.notification";

//Coda di Notification che riceve e consuma tutti gli eventi ^ di dominio rilevanti per la generazione e distribuzione delle notifiche real-time WebSocket.
const NOTIFICATION_QUEUE = "notification.stock.queue";



//Creare manualmente una nuova notifica
app.post("/notifications", async (req, res) => {
    try {
        //Dati obbligatori della notifica dal body della richiesta
        const { targetRole, title, message } = req.body;

        if (!targetRole || !title || !message) {
            return res.status(400).json({
                error: "targetRole, title e message sono obbligatori",
            });
        }

        //Salva la notifica nel database (db_notifications)
        const notification = await createNotification({
            targetRole,
            title,
            message,
        });

        //Invia NOTIFICA in real-time alle dashboard tramite WebSocket
        io.emit("stock_alert", notification);

        res.status(201).json(notification);
    } catch (error) {
        console.error("Errore creazione notifica:", error);

        res.status(500).json({
            error: "Errore creazione notifica",
        });
    }
});

//Recupera notifiche di Procurement
app.get("/notifications/procurement", async (req, res) => {
    try {
        const notifications = await getNotificationsByRole("PROCUREMENT");
        res.json(notifications);
    } catch (error) {
        console.error("Errore recupero notifiche procurement:", error);
        res.status(500).json({ error: "Errore recupero notifiche procurement" });
    }
});

//Recupera notifiche di Inventory
app.get("/notifications/inventory", async (req, res) => {
    try {
        const notifications = await getNotificationsByRole("INVENTORY");
        res.json(notifications);
    } catch (error) {
        console.error("Errore recupero notifiche inventory:", error);
        res.status(500).json({ error: "Errore recupero notifiche inventory" });
    }
});

//Segna notifica come già letta
app.patch("/notifications/:id/read", async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await markNotificationAsRead(id);
        res.json(notification);
    } catch (error) {
        console.error("Errore aggiornamento notifica:", error);
        res.status(500).json({ error: "Errore aggiornamento notifica" });
    }
});

//cancella tutte le notifiche in Procurement
app.delete("/notifications/procurement", async (req, res) => {
    try {
        await deleteNotificationsByRole("PROCUREMENT");
        res.sendStatus(204);
    } catch (error) {
        console.error("Errore cancellazione notifiche procurement:", error);
        res.status(500).json({ error: "Errore cancellazione notifiche procurement" });
    }
});

//cancella tutte le notifiche in Inventory
app.delete("/notifications/inventory", async (req, res) => {
    try {
        await deleteNotificationsByRole("INVENTORY");
        res.sendStatus(204);
    } catch (error) {
        console.error("Errore cancellazione notifiche inventory:", error);
        res.status(500).json({ error: "Errore cancellazione notifiche inventory" });
    }
});

//Recupera notifiche di POS
app.get("/notifications/pos", async (req, res) => {
    try {
        const notifications = await getNotificationsByRole("POS");
        res.json(notifications);
    } catch (error) {
        console.error("Errore recupero notifiche POS:", error);
        res.status(500).json({ error: "Errore recupero notifiche POS" });
    }
});

//cancella tutte le notifiche in POS
app.delete("/notifications/pos", async (req, res) => {
    try {
        await deleteNotificationsByRole("POS");
        res.sendStatus(204);
    } catch (error) {
        console.error("Errore cancellazione notifiche POS:", error);
        res.status(500).json({ error: "Errore cancellazione notifiche POS" });
    }
});



// Funzione per trovare il destinatario corretto della notifica
// in base alla routing key di RabbitMQ
function getTargetRoleFromRoutingKey(routingKey) {
    //Gli ordini di Procurement devono essere notificati ad Inventory
    if (routingKey === PROCUREMENT_ROUTING_KEY) {
        return "INVENTORY";
    }

    //La merce ricevuta dal magazzino Inventory deve essere notificata a Procurement
    if (routingKey === GOODS_RECEIVED_ROUTING_KEY) {
        return "PROCUREMENT";
    }

    //Le richieste di rifornimento dei POS devono essere notificate ad Inventory
    if (routingKey === POS_ROUTING_KEY) {
        return "INVENTORY";
    }

    //Gli allarmi di stock basso devono essere notificati a Procurement
    if (routingKey === STOCK_ROUTING_KEY) {
        return "PROCUREMENT";
    }

    return "GENERAL";
}

//assegna titolo alla notifica
function getTitleFromRoutingKey(routingKey) {
    //Evento Creazione di un nuovo ordine verso il fornitore
    if (routingKey === PROCUREMENT_ROUTING_KEY) {
        return "Nuovo ordine in arrivo";
    }

    //Evento Ricezione e Registrazione della merce in magazzino
    if (routingKey === GOODS_RECEIVED_ROUTING_KEY) {
        return "Merce ricevuta";
    }

    //Evento Richiesta di rifornimento proveniente da un POS
    if (routingKey === POS_ROUTING_KEY) {
        return "Nuova richiesta POS";
    }

    //Evento Prodotto sceso sotto la soglia minima di stock
    if (routingKey === STOCK_ROUTING_KEY) {
        return "Stock basso";
    }

    return "Nuova notifica";
}


//Connessione a RabbitMQ e configurazione del consumer delle notifiche
async function connectRabbitMQ() {
    try {
        //Connessione a RabbitMQ e creazione del canale di comunicazione
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        //crea il topic exchange
        await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });

        //Crea la coda usata dal Notification Service
        await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });

        //coda che ascolta gli eventi di stock basso, pubblicati da Inventory
        await channel.bindQueue(NOTIFICATION_QUEUE, EXCHANGE_NAME, STOCK_ROUTING_KEY);
        //coda che ascolta gli eventi di richieste di rifornimento, pubblicate dal POS
        await channel.bindQueue(NOTIFICATION_QUEUE, EXCHANGE_NAME, POS_ROUTING_KEY);
        //coda che ascolta gli eventi di ordini creati, pubblicati da Procurement
        await channel.bindQueue(NOTIFICATION_QUEUE, EXCHANGE_NAME, PROCUREMENT_ROUTING_KEY);
        //coda ascolta gli eventi di merce ricevuta, pubblicati da Inventory
        await channel.bindQueue(NOTIFICATION_QUEUE, EXCHANGE_NAME, GOODS_RECEIVED_ROUTING_KEY);

        console.log("Notification Service in ascolto sulla coda:", NOTIFICATION_QUEUE);
        console.log("Routing keys ascoltate:", STOCK_ROUTING_KEY, POS_ROUTING_KEY, PROCUREMENT_ROUTING_KEY);

        // Consumazione dei messaggi ricevuti dalla coda RabbitMQ
        channel.consume(NOTIFICATION_QUEUE, async (msg) => {
            if (msg !== null) {
                try {
                    console.log("RAW MESSAGE:", msg.content.toString());

                    //prelevazione del contneuto e della routing key
                    const messageContent = msg.content.toString();
                    const routingKey = msg.fields.routingKey;

                    console.log("Notifica ricevuta:", messageContent);
                    console.log("Routing key ricevuta:", routingKey);

                    //Ordine creato da Procurement deve notificare sia Inventory sia Procurement
                    if (routingKey === PROCUREMENT_ROUTING_KEY) {
                        //Notifica ad Inventory (classico)
                        const inventoryNotification = await createNotification({
                            targetRole: "INVENTORY",
                            title: "Nuovo ordine in arrivo",
                            message: messageContent,
                        });
                        //Notifica a Procurement (simulazione corriere)
                        const procurementNotification = await createNotification({
                            targetRole: "PROCUREMENT",
                            title: "Ordine inviato",
                            message: messageContent,
                        });

                        //Invio in real-time di notifica tramite WebSocket
                        io.emit("stock_alert", inventoryNotification);
                        io.emit("stock_alert", procurementNotification);
                    } else {
                        // Per gli altri eventi determina automaticamente Destinatario (da routin key) e titolo
                        const targetRole = getTargetRoleFromRoutingKey(routingKey);
                        const title = getTitleFromRoutingKey(routingKey);

                        //Salva notifica nel database db_notifications
                        const notification = await createNotification({
                            targetRole,
                            title,
                            message: messageContent,
                        });
                        //Invia notifica in tempo reale alla dashboard
                        io.emit("stock_alert", notification);
                    }
                    // Conferma a RabbitMQ che il messaggio è stato elaborato grazie ad acknoledgment
                    channel.ack(msg);
                } catch (error) {
                    console.error("Errore gestione notifica:", error);
                    //Altrimenti, in caso di errore, invia un negative acknoledgment
                    //e rimetti il messaggio in coda
                    channel.nack(msg, false, true);
                }
            }
        });
    } catch (error) {
        //Metti timer perchè rabbit e notification si avviano prima di altri servizi
        console.error("Errore RabbitMQ, riprovo tra 5 secondi...", error.message);
        setTimeout(connectRabbitMQ, 5000);
    }
}

//Gestisce la connessione Websocket: utente apre dashboard, viene stabilita una connessione WebSocket
//che permette al Notification Service di inviare notifiche in tempo reale
io.on("connection", (socket) => {
    console.log("Un utente si è connesso alla Dashboard. ID:", socket.id);
});

//Avvia il Notification Service su porta 8083, inizializza il database delle notifiche
//si collega a Rabbit e ascolta gli eventi pubblicati dagli altri microservizi
server.listen(8083, async () => {
    console.log("Notification Service online sulla porta 8083");

    await initNotificationsTable();
    connectRabbitMQ();
});