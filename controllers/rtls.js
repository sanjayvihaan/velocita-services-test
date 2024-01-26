const { kafkaClient } = require('../kafka-config/kafkaClient')

const realTimeLocationSystem = async (ambId, coordinates) => {
  try {
    async function init() {
      const producer = kafkaClient.producer()
      await producer.connect()
      console.log(`Producer connected`)

      await producer.send({
        topic: 'RTLS',
        messages: [
          {
            key: ambId,
            value: JSON.stringify({
              coordinates: coordinates,
              id: ambId
            }),
          },
        ],
      })
      console.log('Producer - location created')
      producer.disconnect()
      console.log(`Producer disconnected`)
    }
    await init()
    return 'success'
  } catch (error) {
    console.log(error)
    return 'error'
  }
}

module.exports = { realTimeLocationSystem }
