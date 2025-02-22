require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


const corsOption = {
    origin: ['http://localhost:5173', 'https://edu-task-hub.web.app', '*'],
    credentials: true,
    optionalSuccessStatus: 200,
}

// middleware
app.use(cors(corsOption));
app.use(express.json());


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
        // await client.connect();

        const userCollection = client.db("eduTaskHubDB").collection("users");
        const tasksCollection = client.db("eduTaskHubDB").collection("tasks");
        const logsCollection = client.db("eduTaskHubDB").collection("logs");

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
            const tasks = await tasksCollection.find().sort({ orderIndex: 1 }).toArray();
            res.send(tasks);
        });
        app.post("/tasks", async (req, res) => {
            const { title, description, category, dueDate } = req.body;
            const newTask = { title, description, category, dueDate: new Date(dueDate), orderIndex: 0, timestamp: new Date() };
            const result = await tasksCollection.insertOne(newTask);
            res.send({ _id: result.insertedId, ...newTask })
        })

        app.delete("/tasks/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await tasksCollection.deleteOne(query);
            res.send(result);
        })

        app.put("/tasks/:id", async (req, res) => {
            const id = req.params.id;
            const { title, description, category, dueDate, orderIndex } = req.body;
            const categoryTasksCount = await tasksCollection.countDocuments({ category });

            const updatedTask = {
                title, description, category, dueDate, orderIndex: categoryTasksCount
            };
            const result = await tasksCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedTask }
            );
            res.send(result)
        })
        // Fetch Activity Logs
        app.get("/logs", async (req, res) => {
            const logs = await logsCollection.find().sort({ timestamp: -1 }).toArray();
            res.send(logs);
        });

        // Add Log Entry
        app.post("/logs", async (req, res) => {
            const { message } = req.body;
            const logEntry = { message, timestamp: new Date() };
            const result = await logsCollection.insertOne(logEntry);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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