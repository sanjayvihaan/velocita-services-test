const PORT = process.env.PORT || 8081;

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const { updateVehicleLocation, getNearbyVehicles } = require('./controllers/redisMethods');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  console.log(socket.id);

  // Vehicle updating location
  socket.on('loc-upd', async function ({ coordinates }) {
    console.log(`{
      type: "vehicle",
      lat: ${coordinates.lat},
      long: ${coordinates.lon},
      pincode: ${coordinates.pin},
      id: ${socket.id}
    }`);

    // Store data in redis
    const res = await updateVehicleLocation(coordinates.pin, coordinates.lon, coordinates.lat, socket.id);
    io.to(socket.id).emit('event-status', {
      msg: 'successfully created event',
      response: res,
    });
    console.log(res);
  });

  // Ambulance creating alert
  socket.on('create-alert', async function ({ coordinates }) {
    console.log(`{
      type: "ambulance",
      lat: ${coordinates.lat},
      lon: ${coordinates.lon},
      pincode: ${coordinates.pin},
      id: ${socket.id}
    }`);

    // Fetch vehicleIds from redis
    const res = await getNearbyVehicles(coordinates.pin, coordinates.lon, coordinates.lat);

    // Emit alert to vehicles
    res.map((vehId) => {
      // Emit to each vehicle the alert
      io.to(vehId).emit('amb-alert', 'An ambulance is on the way');
      io.to(socket.id).emit('event-status', 'successfully created event');
      console.log(vehId)
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
});
