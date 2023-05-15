/*
  Lora Send And Receive
  This sketch demonstrates how to send and receive data with the MKR WAN 1300/1310 LoRa module.
  This example code is in the public domain.
*/

#include <MKRWAN.h>

LoRaModem modem;

// Uncomment if using the Murata chip as a module
// LoRaModem modem(Serial1);

#include "arduino_secrets.h"
// Please enter your sensitive data in the Secret tab or arduino_secrets.h
String appEui = SECRET_APP_EUI;
String appKey = SECRET_APP_KEY;
int packet_counter = 1;

struct __attribute__ ((packed)) p1 {
  uint8_t protocol_version = 3; // (B), unsigned char, 1 byte
  uint16_t voltage = 500; // (H), unsigned short, 2 bytes  
  float pressure = 1000.12; // (f), float, 4 bytes   
  float temperature = 25.29903; // (f), float, 4 bytes   
};

struct __attribute__ ((packed)) p2 {
  uint8_t protocol_version = 1; // (B), unsigned char, 1 byte
  uint16_t voltage = 750; // (H), unsigned short, 2 bytes  
};

struct __attribute__ ((packed)) p3 {
  uint8_t protocol_version = 5; // (B), unsigned char, 1 byte
  uint16_t voltage = 900; // (H), unsigned short, 2 bytes  
  float pressure = 998.99; // (f), float, 4 bytes   
};

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  while (!Serial);
  // change this to your regional band (eg. US915, AS923, ...)
  if (!modem.begin(US915)) {
    Serial.println("Failed to start module");
    while (1) {}
  };
  Serial.print("Your module version is: ");
  Serial.println(modem.version());
  Serial.print("Your device EUI is: ");
  Serial.println(modem.deviceEUI());
  Serial.print("Your APP EUI is: ");
  Serial.println(appEui);
  Serial.print("Your APP Key is: ");
  Serial.println(appKey);

  int connected = modem.joinOTAA(appEui, appKey);
  if (!connected) {
    Serial.println("Something went wrong; are you indoor? Move near a window and retry");
    while (1) {}
  }

  // Set poll interval to 60 secs.
  modem.minPollInterval(60);
  // NOTE: independent of this setting, the modem will
  // not allow sending more than one message every 2 minutes,
  // this is enforced by firmware and can not be changed.
}

void loop() {

  Serial.print("Sending packet type: ");
  Serial.println(packet_counter);

  

  if (packet_counter == 1) {
    p1 payload_1;
    Serial.print("Protocol version: ");
    Serial.println(payload_1.protocol_version);
    Serial.print("Data size: ");
    Serial.println(sizeof(payload_1));
    Serial.print("Data Hex: ");

    int err;
    modem.setPort(1);
    modem.beginPacket();

    char *payload_bytes = (char *)&payload_1; 
    for (unsigned int j = 0; j < sizeof(payload_1); j++) {
      Serial.print(payload_bytes[j] >> 4, HEX);
      Serial.print(payload_bytes[j] & 0xF, HEX);
      Serial.print(" ");
      modem.print(payload_bytes[j]);
    }
    Serial.println();
    
    err = modem.endPacket(true);
    if (err > 0) {
      Serial.println("Message sent correctly!");
    } else {
      Serial.println("Error sending message :(");
      Serial.println("(you may send a limited amount of messages per minute, depending on the signal strength");
      Serial.println("it may vary from 1 message every couple of seconds to 1 message every minute)");
    } 
    packet_counter++;
    delay(120000);
    return;

  }

  if (packet_counter == 2) {
    p2 payload_2;

    Serial.print("Protocol version: ");
    Serial.println(payload_2.protocol_version);
    Serial.print("Data size: ");
    Serial.println(sizeof(payload_2));
    Serial.print("Data Hex: ");


    int err;
    modem.setPort(1);
    modem.beginPacket();

    char *payload_bytes = (char *)&payload_2; 
    for (unsigned int j = 0; j < sizeof(payload_2); j++) {
      Serial.print(payload_bytes[j] >> 4, HEX);
      Serial.print(payload_bytes[j] & 0xF, HEX);
      Serial.print(" ");
      modem.print(payload_bytes[j]);
    }
    Serial.println();

    err = modem.endPacket(true);
    if (err > 0) {
      Serial.println("Message sent correctly!");
    } else {
      Serial.println("Error sending message :(");
      Serial.println("(you may send a limited amount of messages per minute, depending on the signal strength");
      Serial.println("it may vary from 1 message every couple of seconds to 1 message every minute)");
    }  

    packet_counter++;
    delay(120000);
    return; 

  }


  if (packet_counter == 3) {
    p3 payload_3;
    Serial.print("Protocol version: ");
    Serial.println(payload_3.protocol_version);
    Serial.print("Data size: ");
    Serial.println(sizeof(payload_3));
    Serial.print("Data Hex: ");

      int err;
    modem.setPort(1);
    modem.beginPacket();

    char *payload_bytes = (char *)&payload_3; 
    for (unsigned int j = 0; j < sizeof(payload_3); j++) {
      Serial.print(payload_bytes[j] >> 4, HEX);
      Serial.print(payload_bytes[j] & 0xF, HEX);
      Serial.print(" ");
      modem.print(payload_bytes[j]);
    }
    Serial.println();

    err = modem.endPacket(true);
    if (err > 0) {
      Serial.println("Message sent correctly!");
    } else {
      Serial.println("Error sending message :(");
      Serial.println("(you may send a limited amount of messages per minute, depending on the signal strength");
      Serial.println("it may vary from 1 message every couple of seconds to 1 message every minute)");
    }  

    packet_counter=1;
    delay(120000);
    return; 

  }



}
