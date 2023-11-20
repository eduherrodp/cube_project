const mqtt = require('mqtt')

const config = require("./config_private.json");
const { HOST } = config.connection.host
const { PORT } = config.connection.port
const { CLIENT_ID } = config.connection.clientID
const { USERNAME } = config.connection.username
const { PASSWORD } = config.connection.password
const connectURL = `mqtt://${HOST}:${PORT}`

const client = mqtt.connect(connectURL, {
    CLIENT_ID,
    clean: true,
    connectTimeout: 4000,
    username: USERNAME,
    password: PASSWORD,
    reconnectPeriod: 1000,
})

const topic = '/nodejs/mqtt'

client.on('connect', () => {
    console.log('Connected')

    client.subscribe([topic], () => {
        console.log(`Subscribe to topic '${topic}'`)
        client.publish(topic, 'nodejs mqtt test', { qos: 0, retain: false }, (error => {
            if (error) {
                console.error(error)
            }
        }))
    })
})

client.on('message', (topic, payload) => {
    console.log('Received Message:', topic, payload.toString())
})