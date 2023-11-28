#include <Arduino.h>
#include <PubSubClient.h>
#include <WiFi.h>

// Constants
#define CUBESIZE 4
#define PLANESIZE CUBESIZE * CUBESIZE
#define PLANETIME 3333
#define TIMECONST 103
#define DEFAULT_DISPLAY_TIME 100

// Function prototypes
void handleLEDCube();
void handleMQTT();
void updatePatternTable(byte *payload, unsigned int length);
void reconnect();
void callback(char *topic, byte *payload, unsigned int length);

const unsigned char PROGMEM DefaultPatternTable[] = {
    // Default pattern data
    B1111,B1111,B1111,B1111, B1111, B1111, B1111, B1111, B1111, B1111, B1111, B1111, B1111, B1111, B1111, B1111, DEFAULT_DISPLAY_TIME,
};

unsigned char PatternTable[PLANESIZE];
int LEDPin[] = {16, 15, 2, 4, 17, 3, 5, 18, 19, 21, 22, 23, 13, 12, 14, 27};
// int LEDPin[] = {35, 15, 2, 4, 34, 26, 5, 18, 19, 21, 22, 23, 13, 12, 14, 27};
int PlanePin[] = {26, 25, 33, 32}; // You may need to adjust these pin numbers

// MQTT Configuration
const char *ssid = "Totalplay-E0AA";
const char *password = "E0AA8EFAPEtfV2S7";
const char *mqttServer = "mqtt.smarttransit.online";
const int mqttPort = 1883;
const char *mqttUsername = "ESP32Client";
const char *mqttPassword = "";

WiFiClient espClient;
PubSubClient client(espClient);

void setup()
{
    Serial.begin(115200);

    // WiFi setup
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(1000);
        Serial.println("Conectando a la red Wi-Fi...");
    }
    Serial.println("Conexión Wi-Fi establecida");
    Serial.print("Dirección IP asignada: ");
    Serial.println(WiFi.localIP());

    // Initialize PatternTable with default values
    memcpy_P(PatternTable, DefaultPatternTable, sizeof(DefaultPatternTable));

    // LED Cube setup
    int pin;
    for (pin = 0; pin < PLANESIZE; pin++)
    {
      Serial.print("Configuring LEDPin ");
      Serial.println(LEDPin[pin]);
      pinMode(LEDPin[pin], OUTPUT);
    }
    for (pin = 0; pin < CUBESIZE; pin++)
    {
      Serial.print("Configuring PlanePin ");
      Serial.println(PlanePin[pin]);
       pinMode(PlanePin[pin], OUTPUT);
    }
  delay(10000);
    // MQTT setup
    client.setServer(mqttServer, mqttPort);
    client.setCallback(callback);

    while (!client.connected())
    {
        Serial.println("Conectando al servidor MQTT...");
        if (client.connect("ESP32Client", mqttUsername, mqttPassword))
        {
            Serial.println("Conexión MQTT establecida");
            client.subscribe("/test/topic");
        }
        else
        {
            Serial.print("Error al conectar al servidor MQTT. Código de error: ");
            Serial.println(client.state());
            delay(2000);
        }
    }
}

void loop()
{
    handleLEDCube();
    handleMQTT();
}

void handleLEDCube()
{
    byte PatternBuf[PLANESIZE];
    int PatternIdx;
    byte DisplayTime;
    unsigned long EndTime;
    int plane;
    int patbufidx;
    int ledrow;
    int ledcol;
    int ledpin;

    PatternIdx = 0;
    do
    {
        memcpy_P(PatternBuf, PatternTable + PatternIdx, PLANESIZE);
        PatternIdx += PLANESIZE;
        DisplayTime = pgm_read_byte_near(PatternTable + PatternIdx++);
        EndTime = millis() + ((unsigned long)DisplayTime) * TIMECONST;

        while (millis() < EndTime)
        {
            patbufidx = 0;
            for (plane = 0; plane < CUBESIZE; plane++)
            {
                Serial.print("Setting PlanePin ");
                Serial.println(PlanePin[plane]);
                if (plane == 0)
                {
                    digitalWrite(PlanePin[CUBESIZE - 1], HIGH);
                }
                else
                {
                    digitalWrite(PlanePin[plane - 1], HIGH);
                }

                ledpin = 0;
                for (ledrow = 0; ledrow < CUBESIZE; ledrow++)
                {
                    for (ledcol = 0; ledcol < CUBESIZE; ledcol++)
                    {
                        digitalWrite(LEDPin[ledpin++], PatternBuf[patbufidx] & (1 << ledcol));
                    }
                    patbufidx++;
                }

                digitalWrite(PlanePin[plane], LOW);
                delayMicroseconds(PLANETIME);
            }
        }
    } while (DisplayTime > 0);
}

void handleMQTT()
{
    if (!client.connected())
    {
        reconnect();
    }
    client.loop();
}

void updatePatternTable(byte *payload, unsigned int length)
{
    // Update PatternTable with the received payload
    for (int i = 0; i < length; i++)
    {
        if (payload[i] == ',')
        {
            break; // Stop processing payload when a comma is encountered
        }
        else if (payload[i] == 'B' || payload[i] == '0' || payload[i] == '1')
        {
            // Only consider 'B', '0', and '1', ignore other characters
            PatternTable[i] = payload[i];
        }
    }

    // Print the updated PatternTable
    Serial.print("PatternTable updated: ");
    for (int i = 0; i < sizeof(PatternTable); i++)
    {
        Serial.print(PatternTable[i]);
    }
    Serial.println();

    Serial.println();
}

void callback(char *topic, byte *payload, unsigned int length)
{
    Serial.print("Mensaje recibido en el tema: ");
    Serial.println(topic);
    Serial.print("Contenido del mensaje: ");
    
    // Call the updatePatternTable function
    updatePatternTable(payload, length);
}
void reconnect()
{
    while (!client.connected())
    {
        Serial.println("Reconectando al servidor MQTT...");
        if (client.connect("ESP32Client", mqttUsername, mqttPassword))
        {
            Serial.println("Conexión MQTT establecida");
            client.subscribe("/test/topic");
        }
        else
        {
            Serial.print("Error al conectar al servidor MQTT. Código de error: ");
            Serial.println(client.state());
            delay(2000);
        }
    }
}