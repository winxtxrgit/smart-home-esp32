/*
 * Smart Home (ESP32 + Firebase Realtime Database)
 * -----------------------------------------------
 * ปวช.3 final project (2566/2023) — Chitralada Vocational School
 * Embedded Systems Technology
 *
 * The board publishes DHT22 (temperature/humidity) and LDR (light) readings to
 * Firebase, and listens on board/outputs/* to drive 7 LEDs and a fan on/off.
 *
 * Secrets (Wi-Fi + Firebase credentials) live in `arduino_secrets.h`.
 * Copy `arduino_secrets.h.example` -> `arduino_secrets.h` and fill in your values.
 *
 * Libraries:
 *   - Firebase-ESP-Client (mobizt)
 *   - DHTesp
 */

#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHTesp.h>

// Provide the token generation / RTDB payload printing helpers
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// Wi-Fi + Firebase credentials (not committed to git)
#include "arduino_secrets.h"

// Define Firebase objects
FirebaseJson json;
FirebaseData stream;
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

int timestamp;

String listenerPath = "board/outputs/";
String uid;
String databasePath;
String parentPath;
String systemPath;
String systemFanPath;
String systemLightPath;

float temperature;
float humidity;
float light;

String tempPath = "/temperature";
String humPath = "/humidity";
String LDRPath = "/light";
String timePath = "/timestamp";

const int LED1 = 12;
const int LED2 = 13;
const int LED3 = 14;
const int LED4 = 15;
const int LED5 = 2;
const int LED6 = 4;
const int LED7 = 25;
const int fan = 26;

const int LDR = 34;
const int DHT_PIN = 27;
DHTesp dht;

unsigned long sendDataPrevMillis = 0;
unsigned long timerDelay = 120000;
float temp = 0;
float hum = 0;

const char* ntpServer = "pool.ntp.org";

void streamCallback(FirebaseStream data) {
  Serial.printf("stream path, %s\nevent path, %s\ndata type, %s\nevent type, %s\n\n",
                data.streamPath().c_str(),
                data.dataPath().c_str(),
                data.dataType().c_str(),
                data.eventType().c_str());
  printResult(data); //see addons/RTDBHelper.h
  Serial.println();

  // Get the path that triggered the function
  String streamPath = String(data.dataPath());

  // if the data returned is an integer, there was a change on the GPIO state on the following path /{gpio_number}
  if (data.dataTypeEnum() == fb_esp_rtdb_data_type_integer) {
    String gpio = streamPath.substring(1);
    int state = data.intData();
    Serial.print("GPIO: ");
    Serial.println(gpio);
    Serial.print("STATE: ");
    Serial.println(state);
    digitalWrite(gpio.toInt(), state);
  }

  /* When it first runs, it is triggered on the root (/) path and returns a JSON with all keys
     and values of that path. So, we can get all values from the database and updated the GPIO states*/
  if (data.dataTypeEnum() == fb_esp_rtdb_data_type_json) {
    FirebaseJson json = data.to<FirebaseJson>();

    // To iterate all values in Json object
    size_t count = json.iteratorBegin();
    Serial.println("\n---------");
    for (size_t i = 0; i < count; i++) {
      FirebaseJson::IteratorValue value = json.valueAt(i);
      int gpio = value.key.toInt();
      int state = value.value.toInt();
      Serial.print("STATE: ");
      Serial.println(state);
      Serial.print("GPIO:");
      Serial.println(gpio);
      digitalWrite(gpio, state);
      Serial.printf("Name: %s, Value: %s, Type: %s\n", value.key.c_str(), value.value.c_str(),
                    value.type == FirebaseJson::JSON_OBJECT ? "object" : "array");
    }
    Serial.println();
    json.iteratorEnd(); // required for free the used memory in iteration (node data collection)
  }

  //This is the size of stream payload received (current and max value)
  //Max payload size is the payload size under the stream path since the stream connected
  //and read once and will not update until stream reconnection takes place.
  //This max value will be zero as no payload received in case of ESP8266 which
  //BearSSL reserved Rx buffer size is less than the actual stream payload.
  Serial.printf("Received stream payload size: %d (Max. %d)\n\n", data.payloadLength(), data.maxPayloadLength());
}

void streamTimeoutCallback(bool timeout) {
  if (timeout)
    Serial.println("stream timeout, resuming...\n");
  if (!stream.httpConnected())
    Serial.printf("error code: %d, reason: %s\n\n", stream.httpCode(), stream.errorReason().c_str());
}

void firebase_con() {
  config.api_key = API_KEY;

  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  config.database_url = DATABASE_URL;

  Firebase.reconnectWiFi(true);

  config.token_status_callback = tokenStatusCallback;
  config.max_token_generation_retry = 5;

  Firebase.begin(&config, &auth);

  if (!Firebase.RTDB.beginStream(&stream, listenerPath.c_str()))
    Serial.printf("stream begin error, %s\n\n", stream.errorReason().c_str());

  Firebase.RTDB.setStreamCallback(&stream, streamCallback, streamTimeoutCallback);

  Serial.println("Getting User UID");
  while ((auth.token.uid) == "") {
    Serial.print('.');
    delay(1000);
  }

  uid = auth.token.uid.c_str();
  Serial.print("User UID: ");
  Serial.println(uid);

  databasePath = "/UsersData/" + uid + "/readings";
}

unsigned long getTime() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    //Serial.println("Failed to obtain time");
    return (0);
  }
  time(&now);
  return now;
}

void initWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi ..");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print('.');
    delay(1000);
  }
  Serial.println(WiFi.localIP());
  Serial.println();
}

void setup() {
  Serial.begin(115200);

  initWiFi();
  configTime(0, 0, ntpServer);

  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);
  pinMode(LED3, OUTPUT);
  pinMode(LED4, OUTPUT);
  pinMode(LED5, OUTPUT);
  pinMode(LED6, OUTPUT);
  pinMode(LED7, OUTPUT);
  pinMode(fan, OUTPUT);
  pinMode(LDR, INPUT);
  pinMode(DHT_PIN, INPUT);

  dht.setup(DHT_PIN, DHTesp::DHT22);

  firebase_con();

  delay(2000);
}

void loop() {
  if (Firebase.isTokenExpired()) {
    Firebase.refreshToken(&config);
    Serial.println("Refresh token");
  }
  int val = analogRead(LDR);
  if (Firebase.ready()) {
    if (millis() - sendDataPrevMillis > timerDelay || sendDataPrevMillis == 0) {
      sendDataPrevMillis = millis();

      TempAndHumidity data = dht.getTempAndHumidity();

      String temp = String(data.temperature, 1);
      String hum = String(data.humidity, 1);

      Serial.print("Temperature: ");
      Serial.println(temp);
      Serial.print("Humidity: ");
      Serial.println(hum);
      Serial.print("Light: ");
      Serial.println(val);

      timestamp = getTime();
      Serial.print("time: ");
      Serial.println(timestamp);

      parentPath = databasePath + "/" + String(timestamp);
      systemPath = "board/outputs/";
      systemFanPath = systemPath + "AutoFan";
      systemLightPath = systemPath + "AutoLight";

      json.set(tempPath.c_str(), temp);
      json.set(humPath.c_str(), hum);
      json.set(LDRPath.c_str(), val);
      json.set(timePath, String(timestamp));
      Serial.printf("Set json... %s\n", Firebase.RTDB.setJSON(&fbdo, parentPath.c_str(), &json) ? "ok" : fbdo.errorReason().c_str());
    } else {
      // NOTE (known issue): in the original project the two auto blocks below are
      // cross-wired — the "AutoFan" flag drives the light (LED7 / gpio 25) and the
      // "AutoLight" flag drives the fan (gpio 26). The behaviour is kept exactly as
      // submitted; see the "Known issues" section in README.md before changing it.
      if (Firebase.RTDB.getInt(&fbdo, systemFanPath)) {
        if (fbdo.dataType() == "int") {
          int home_system = fbdo.intData();
          if (home_system == 0) {
            if (val < 4050) {
              digitalWrite(LED7, LOW);
              Firebase.RTDB.setInt(&fbdo, listenerPath + "26/", 1);
            } else {
              digitalWrite(LED7, HIGH);
              Firebase.RTDB.setInt(&fbdo, listenerPath + "26/", 0);
            }
          }
        }
      } else {
        Serial.println(fbdo.errorReason());
      }

      if (Firebase.RTDB.getInt(&fbdo, systemLightPath)) {
        if (fbdo.dataType() == "int") {
          int home_system = fbdo.intData();
          if (home_system == 0) {
            if (temp > 30) {
              analogWrite(fan, 200);
              Firebase.RTDB.setInt(&fbdo, listenerPath + "25/", 1);
            } else {
              analogWrite(fan, 0);
              Firebase.RTDB.setInt(&fbdo, listenerPath + "25/", 0);
            }
          }
        }
      } else {
        Serial.println(fbdo.errorReason());
      }
    }
  }
}
