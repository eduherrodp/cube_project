import express from 'express'
import * as mqtt from 'mqtt'

const app = express()
const { host, port, clientID, username, password } = config.connection;

const mqttClient = mqtt.connect(`ws://${host}:${port}/mqtt`)

// Connect to the MQTT broker
mqttClient.on('connect', function() {
    console.log('Connected to MQTT broker')
})

app.use(function (req, res, next) {
    // Publish messages
    req.mqttPublish = function (topic, message) {
        mqttClient.publish(topic, message)
    }

    // Suscribe to topic
    req.mqttSubscribe = function (topic, callback) {
        mqttClient.subscribe(topic)
        mqttClient.on('message', function (t, m) {
            if (t === topic) {
                callback(m.toString())
            }
        })
    }
    next()
})

app.get('/', function (req, res) {
    // Publish
    req.mqttPublish('test', 'Hello MQTT!')

    // Subscribe
    req.mqttSubscribe('test', function (message) {
        console.log('Received message: ' + message)
    })

    res.send('MQTT is working!')
})

app.listen(3000, function(){
    console.log('Server is running on port 3000')
})