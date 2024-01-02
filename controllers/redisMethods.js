// importing redis client
const { redisClient } = require('../redis/redisClient')

/**
 * updateVehicleLocation method takes in 4 parameters ->
 * 1. pincode
 * 2. longitude
 * 3. latitude
 * 4. socket.id
 * This method needs to be used only with Vehicles
 * - Returns 1 or 0, 1 if adding data was success and 0 for error
 **/
const updateVehicleLocation = async (pincode, lon, lat, socketId) => {
  //Adding to redis using GEOADD
  const res = await redisClient.geoAdd(String(pincode), {
    longitude: lon,
    latitude: lat,
    member: socketId,
  })

  if (res == 1) {
    return `Location update at redis is OK! - ${socketId}`
  } else {
    return `Error at updating location! - ${socketId}`
  }
}

/**
 * getNearbyVehicles method takes in 3 parameters ->
 * 1. pincode
 * 2. longitude
 * 3. latitude
 * The default radius and unit for this function is 5 km
 * This method needs to be used only for ambulance
 * - returns list of socketIds or vehicleIds if query matches
 */
const getNearbyVehicles = async (pincode, lon, lat) => {
  //fetching socket ids
  // console.log('before getNearByVehicles')
  const res = await redisClient.geoSearch(
    String(pincode),
    {
      longitude: lon,
      latitude: lat,
    },
    {
      radius: 5,
      unit: 'km',
    },
  )
  
  return res
  // console.log('after nearByVehicles')
}

module.exports = { updateVehicleLocation, getNearbyVehicles }
