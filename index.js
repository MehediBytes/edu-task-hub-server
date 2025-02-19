require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

const corsOption = {
    origin: ['http://localhost:5173'],
    credentials: true,
    optionalSuccessStatus: 200,
}

// middleware
app.use(cors(corsOption));
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Edu-task-hub is running")
})

app.listen(port, () => {
    console.log(`Edu-task-hub is running ${port}`);
})