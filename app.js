const PORT = process.env.PORT || 8081

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const {
  updateVehicleLocation,
  getNearbyVehicles,
} = require('./controllers/redisMethods')

const { handleGetListOfCoords } = require('./controllers/externalApi')
const { realTimeLocationSystem } = require('./controllers/rtls')

// Initialize Redis client
// const redisClient = redis.createClient();

// // Handle connection errors
// redisClient.on('error', (err) => {
//   console.error(`Redis client error: ${err}`);
// });

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*' },
})

app.get('/home', (req, res) => {
  res.json({
    msg: 'This is the home page response',
  })
})

io.on('connection', (socket) => {
  console.log(socket.id)

  // Vehicle updating location
  socket.on('loc-upd', async function ({ coordinates }) {
    console.log(`{
      type: "vehicle",
      lat: ${coordinates.lat},
      long: ${coordinates.lon},
      pincode: ${coordinates.pin},
      id: ${socket.id}
    }`)

    // Store data in redis
    const res = await updateVehicleLocation(
      coordinates.pin,
      coordinates.lon,
      coordinates.lat,
      socket.id,
    )
    io.to(socket.id).emit('event-status', {
      msg: 'successfully created event',
      response: res,
    })
    console.log(res)
  })

  // Ambulance creating alert
  // socket.on('create-alert', async function ({ coordinates }) {
  //   console.log(`{
  //     type: "ambulance",
  //     lat: ${coordinates.lat},
  //     lon: ${coordinates.lon},
  //     pincode: ${coordinates.pin},
  //     id: ${socket.id}
  //   }`);

  //   // Fetch vehicleIds from redis
  //   const res = await getNearbyVehicles(coordinates.pin, coordinates.lon, coordinates.lat);

  //   // Emit alert to vehicles
  //   res.map((vehId) => {
  //     // Emit to each vehicle the alert
  //     io.to(vehId).emit('amb-alert', 'An ambulance is on the way');
  //     io.to(socket.id).emit('event-status', 'successfully created event');
  //     console.log(vehId)
  //   });
  // });

  socket.on('create-alert', async function ({ coordinates }) {
    //origin latitude and longitude
    const originLat = coordinates.origin.lat
    const originLon = coordinates.origin.lon

    //destination Latitude and Longitude
    const destLat = coordinates.destination.lat
    const destLon = coordinates.destination.lon

    // fetching the coordinates between origin and destination
    const resCoordinates = await handleGetListOfCoords(
      originLat,
      originLon,
      destLat,
      destLon,
      560087
    )
    
    

    if (resCoordinates.length === 0) {
      console.log('error')
    } else {
      // Process the coordinates array
      resCoordinates.forEach((coord) => {
        const latitude = coord.latitude
        const longitude = coord.longitude

        // Do something with latitude and longitude
        console.log(`Lat: ${latitude}, Long: ${longitude}`)

        // calling redis getNearByVehicles to all the resCoordinates and sending alerts
        const res = getNearbyVehicles(coordinates.pin, coordinates.lon, coordinates.lat)
        console.log(res)
        
        

      })
    }
  })

  // Function to get nearby ambulances using GEOSEARCH
const getNearbyAmbulances = async (pincode, longitude, latitude, radius) => {
  try {
    // Use GEOSEARCH to get all nearby ambulances within the specified radius
    const nearbyAmbulances = await redisClient.geosearch(
      pincode,
      longitude,
      latitude,
      'BYRADIUS',
      radius,
      'm'
    );

    // Return the list of nearby ambulance IDs
    return nearbyAmbulances;
  } catch (error) {
    console.error('Error fetching nearby ambulances:', error);
    return [];
  }
};

socket.on('get-all-nearby-ambulances', async function ({ coordinates }) {
  // Fetch all nearby ambulance IDs
  const allNearbyAmbulances = await getNearbyAmbulances(
    coordinates.pin,
    coordinates.lon,
    coordinates.lat,
    5000 // Adjust the radius as needed
  );

  // Emit the list of nearby ambulances to the requesting client
  io.to(socket.id).emit('all-nearby-ambulances', allNearbyAmbulances);
  console.log("all ambulance", allNearbyAmbulances);
});



  
})

server.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`)
})
