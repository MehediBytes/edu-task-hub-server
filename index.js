require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { Server } = require('socket.io');
const http = require('http');
const port = process.env.PORT || 5000;

const server = http.createServer(app);

const corsOption = {
    origin: ['http://localhost:5173'],
    credentials: true,
    optionalSuccessStatus: 200,
}

// middleware
app.use(cors(corsOption));
app.use(express.json());

const io = new Server(server, {
    cors: corsOption
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lzi65.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const userCollection = client.db("eduTaskHubDB").collection("users");
        const tasksCollection = client.db("eduTaskHubDB").collection("tasks");

        // WebSocket for Real-time Updates
        io.on("connection", (socket) => {
            console.log("User connected:", socket.id);

            socket.on("disconnect", () => {
                console.log("User disconnected:", socket.id);
            });
        });

        // users related Api
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        // Tasks related api's
        app.get("/tasks", async (req, res) => {
            const tasks = await tasksCollection.find().toArray();
            res.send(tasks);
        })
        app.post("/tasks", async (req, res) => {
            const newTask = { ...req.body, timestamp: new Date() };
            const result = await tasksCollection.insertOne(newTask);
            io.emit("taskUpdated");
            res.send({ _id: result.insertedId, ...newTask })
        })

        app.delete("/tasks/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await tasksCollection.deleteOne(query);
            io.emit("taskUpdated");
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Edu-task-hub is running")
})

server.listen(port, () => {
    console.log(`Edu-task-hub WebSocket server running on port ${port}`);
});