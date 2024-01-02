const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createClient } = require('redis');

const PORT = process.env.PORT || 8081;

const app = express();

// Use CORS middleware
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

// Create a Redis client
const redisClient = createClient();

// Handle errors from the Redis client
redisClient.on('error', (error) => {
    console.error('Redis error:', error);
});

// Connect to the Redis server
redisClient.connect();
console.log('connected to redis')

io.on('connection', async (socket) => {
    console.log(`New client connected: ${socket.id}`);
    socket.emit('hello', 'world');

    // Define an async function to handle loc-update
    const handleLocationUpdate = async (coordinates) => {
        console.log(`Received location update from ${socket.id}: ${JSON.stringify(coordinates)}`);

        try {
            const reply = await redisClient.geoAdd('location', {
                longitude: coordinates.lon,
                latitude: coordinates.lat,
                member: socket.id
            })
            console.log(reply)
        } catch (error) {
            console.error('An error occured: ', error)
        }
    };

    // Attach the async handler to the socket event
    socket.on('loc-update', handleLocationUpdate);
});

// ... (rest of your server code)

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
