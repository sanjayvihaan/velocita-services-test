const {Kafka } = require('kafkajs')

const kafkaClient = new Kafka({
    clientId: 'Velocita-microservices',
    brokers: ['0.0.0.0:9092']
})

module.exports = { kafkaClient }