//importing kafkaClient client from client.js
const { kafkaClient } = require('./kafkaClient')


async function init(){
// Create a new admin instance
const admin = kafkaClient.admin();

// Connect to kafkaClient server
console.log('Admin connecting...');
await admin.connect();
console.log('Admin connection success');

// Create RTLS topic
console.log('creating RTLS topic');
await admin.createTopics({
    topics: [
        {
            topic: 'RTLS',
            numPartitions: 1,
        },
    ],
});
console.log('successfully created RTLS topic');

// Disconnect admin instance
console.log('Disconnecting Admin');
await admin.disconnect();
}

init()
