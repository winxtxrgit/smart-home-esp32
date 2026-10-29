# 🏠 Smart Home (ESP32 + Firebase)

> บ้านอัจฉริยะ — ควบคุมไฟและพัดลมภายในบ้านจำลองผ่านเว็บไซต์แบบเรียลไทม์ พร้อมอ่านค่าอุณหภูมิ ความชื้น และแสง ด้วยบอร์ด ESP32 และ Firebase Realtime Database
>
> A model smart home that controls lights & a fan in real time from a web dashboard, and logs temperature / humidity / light readings, using an ESP32 board and Firebase Realtime Database.

<p align="center">
  <img src="https://img.shields.io/badge/platform-ESP32-blue" alt="ESP32">
  <img src="https://img.shields.io/badge/database-Firebase%20RTDB-orange" alt="Firebase">
  <img src="https://img.shields.io/badge/web-HTML%20%7C%20CSS%20%7C%20JS-yellow" alt="Web">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT">
</p>

---

## 📌 เกี่ยวกับโปรเจกต์ / About

โปรเจกต์นี้เป็น **โครงงานจบการศึกษาระดับ ปวช. (ปวช.3)** สาขาเทคโนโลยีระบบสมองกลฝังตัว
**โรงเรียนจิตรลดาวิชาชีพ สถาบันเทคโนโลยีจิตรลดา** ปีการศึกษา 2566 (จบ ปวช. ปี 2024)

This is a **vocational certificate (ปวช.3) final-year graduation project** in Embedded Systems Technology at
**Chitralada Vocational School, CDTI**, academic year 2023–2024.

แนวคิดคือ นำระบบ **IoT** มาจำลองการควบคุมอุปกรณ์ไฟฟ้าภายในบ้าน เพื่อเพิ่มความสะดวกและความปลอดภัย
(เช่น กันลืมปิดไฟ) โดยสั่งงานได้จากทุกอุปกรณ์ที่เปิดเว็บไซต์ได้ ไม่ว่าจะเป็นมือถือหรือคอมพิวเตอร์

> ℹ️ โค้ดทั้งหมดในรีโปนี้ **ถอดมาจากเอกสารรายงานโครงงาน (ไฟล์ Word)** ซึ่งเก็บโค้ดไว้เป็นภาพสกรีนช็อต
> จึงนำมาจัดเรียงเป็นไฟล์จริง จัดโครงสร้างโปรเจกต์ใหม่ และปรับปรุงให้ปลอดภัย/อ่านง่ายขึ้นก่อนเผยแพร่

---

## ✨ คุณสมบัติ / Features

- 🔐 **ระบบล็อกอิน** ด้วย Firebase Authentication (อีเมล/รหัสผ่าน) ใช้ได้หลายอุปกรณ์พร้อมกัน
- 💡 **ควบคุมไฟ 7 จุด** (ห้องน้ำ, ห้องนอน 1–2, โถง 1–3, ไฟรั้ว) เปิด/ปิดผ่านสวิตช์บนเว็บ
- 🌀 **ควบคุมพัดลม** ภายในบ้าน
- 🤖 **โหมด Auto** — ไฟรั้วติดเองเมื่อแสงน้อย และพัดลมทำงานเองเมื่ออุณหภูมิสูง
- 🌡️ **อ่านค่าเซนเซอร์** อุณหภูมิ/ความชื้น (DHT22) และความสว่าง (LDR) แสดงเป็นตัวเลขและเกจวัด
- 📈 **บันทึกข้อมูลตามเวลา** ดูย้อนหลังเป็นตาราง และลบข้อมูลได้
- ⚡ อัปเดตแบบเรียลไทม์ผ่าน Firebase Realtime Database

---

## 🧱 สถาปัตยกรรมระบบ / Architecture

```
┌──────────────┐   Wi-Fi    ┌──────────────────────┐   WebSocket   ┌────────────────┐
│   ESP32      │ ─────────► │  Firebase Realtime    │ ◄───────────► │  Web Dashboard │
│  + DHT22     │  อ่าน/เขียน │  Database             │   realtime    │ (HTML/CSS/JS)  │
│  + LDR       │ ◄───────── │  board/outputs/*      │               │  + Firebase    │
│  + 7x LED    │            │  UsersData/<uid>/...  │               │    Auth        │
│  + Fan       │            └──────────────────────┘               └────────────────┘
└──────────────┘
```

- บอร์ด ESP32 **อ่านค่า** เซนเซอร์แล้วส่งขึ้น `UsersData/<uid>/readings/<timestamp>`
- บอร์ด **ฟังการเปลี่ยนแปลง** ของ `board/outputs/*` เพื่อสั่งเปิด/ปิด LED และพัดลม
- หน้าเว็บ **อ่านค่าเซนเซอร์** มาแสดง และ **เขียนคำสั่ง** กลับไปที่ `board/outputs/*`

---

## 🔌 ฮาร์ดแวร์ และการต่อขา / Hardware & Pinout

| อุปกรณ์ | ขา ESP32 (GPIO) | หน้าที่ |
|---------|-----------------|---------|
| LED1 | 12 | ไฟห้องน้ำ (Bathroom) |
| LED2 | 13 | ไฟห้องนอน 1 (Bedroom 1) |
| LED3 | 14 | ไฟห้องนอน 2 (Bedroom 2) |
| LED4 | 15 | ไฟโถง 1 (Hall 1) |
| LED5 | 2  | ไฟโถง 2 (Hall 2) |
| LED6 | 4  | ไฟโถง 3 (Hall 3) |
| LED7 | 25 | ไฟรั้ว (Lightout) |
| Fan  | 26 | พัดลม (Fan module L9110) |
| LDR  | 34 | เซนเซอร์วัดแสง (analog) |
| DHT22 | 27 | เซนเซอร์อุณหภูมิ/ความชื้น |

**อุปกรณ์อื่น ๆ:** ไม้บัลซ่า + ไม้กระดาน (ทำโมเดลบ้าน), สายไฟจัมเปอร์, แหล่งจ่ายไฟ, เฟอร์นิเจอร์พิมพ์ 3D

> ⚠️ ESP32 เชื่อมต่อ Wi-Fi ได้เฉพาะคลื่น **2.4 GHz** เท่านั้น (ไม่รองรับ 5 GHz)

---

## 📁 โครงสร้างโปรเจกต์ / Project structure

```
smart-home-esp32/
├── firmware/
│   └── smart_home/
│       ├── smart_home.ino            # โค้ด ESP32 (Arduino)
│       └── arduino_secrets.h.example # เทมเพลตใส่ Wi-Fi/Firebase credential
├── web/
│   ├── firebase.json                 # ตั้งค่า Firebase Hosting + Database rules
│   ├── database.rules.json           # กฎความปลอดภัยของ Realtime Database
│   └── public/
│       ├── index.html                # หน้าเว็บหลัก (ฟอร์มล็อกอิน + แดชบอร์ด)
│       ├── 404.html
│       ├── style.css
│       └── scripts/
│           ├── firebase-config.js    # ค่า config + init Firebase (แก้ค่าที่นี่)
│           ├── auth.js               # ล็อกอิน/ล็อกเอาท์
│           ├── gauges-definition.js  # นิยามเกจอุณหภูมิ/ความชื้น
│           └── index.js              # ตรรกะแดชบอร์ดหลัก
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 วิธีติดตั้งและใช้งาน / Getting started

### 1) ตั้งค่า Firebase

1. สร้างโปรเจกต์ใหม่ที่ [Firebase Console](https://console.firebase.google.com/)
2. เปิดใช้ **Authentication → Sign-in method → Email/Password** แล้วเพิ่มผู้ใช้ 1 บัญชี
3. เปิดใช้ **Realtime Database** และตั้ง Security Rules ให้เหมาะสม
4. คัดลอกค่า config (apiKey, databaseURL ฯลฯ) ไว้ใช้ขั้นต่อไป

### 2) เว็บไซต์ (Web dashboard)

เปิดไฟล์ `web/public/scripts/firebase-config.js` แล้วแทนที่ค่า placeholder ด้วยค่าโปรเจกต์ของคุณ:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.REGION.firebasedatabase.app",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

รันในเครื่อง (เลือกวิธีใดก็ได้):

```bash
# วิธีที่ 1: เปิดด้วย Live Server ของ VS Code
# วิธีที่ 2: เสิร์ฟด้วย Python
cd web/public && python -m http.server 8000   # เปิด http://localhost:8000

# วิธีที่ 3: deploy ขึ้น Firebase Hosting
cd web && firebase deploy
```

### 3) เฟิร์มแวร์ (ESP32)

1. ติดตั้ง **Arduino IDE** + บอร์ด ESP32 และไลบรารี:
   - `Firebase Arduino Client Library for ESP8266 and ESP32` (mobizt)
   - `DHT sensor library for ESPx` (DHTesp)
2. คัดลอก `arduino_secrets.h.example` → `arduino_secrets.h` แล้วกรอกค่าจริง:

   ```cpp
   #define WIFI_SSID     "ชื่อ Wi-Fi 2.4GHz"
   #define WIFI_PASSWORD "รหัส Wi-Fi"
   #define API_KEY       "Firebase Web API Key"
   #define USER_EMAIL    "อีเมลที่สร้างไว้ใน Authentication"
   #define USER_PASSWORD "รหัสผ่านของบัญชีนั้น"
   #define DATABASE_URL  "https://YOUR_PROJECT-default-rtdb.REGION.firebasedatabase.app/"
   ```

3. เลือกบอร์ด `ESP32 Dev Module` → อัปโหลด → เปิด Serial Monitor ที่ `115200` baud

---

## 🔒 หมายเหตุด้านความปลอดภัย / Security note

ในเอกสารต้นฉบับมีการ **ฝังรหัสผ่านและคีย์จริงลงในโค้ดโดยตรง** (Wi-Fi, อีเมล/รหัสผ่านผู้ใช้, API key, database URL)
รีโปนี้ได้ **แทนที่ค่าทั้งหมดด้วย placeholder** และย้าย credential ของ ESP32 ไปไว้ในไฟล์ `arduino_secrets.h`
ซึ่งถูก `.gitignore` ไว้แล้ว เพื่อไม่ให้ความลับหลุดขึ้น GitHub

> 👉 หากคุณเคยใช้คีย์/รหัสผ่านชุดเดิมจริง ควร **เพิกถอน (revoke) และเปลี่ยนรหัสใหม่** ใน Firebase Console

---

## 🐞 ปัญหาที่ทราบ / Known issues

### ✅ แก้ไขแล้วในรีโปนี้ / Fixed in this repo

- **เฟิร์มแวร์ — ตรรกะ Auto สลับกัน:** เดิมธง `AutoFan` ไปคุมไฟรั้ว และ `AutoLight` ไปคุมพัดลม
  ตอนนี้แก้ให้ `AutoLight` คุมไฟรั้ว (LED7 / GPIO25) และ `AutoFan` คุมพัดลม (GPIO26) ตรงตามชื่อ
  และเขียนค่าสถานะกลับ Firebase ให้ตรงกับสถานะจริงของขา
- **เฟิร์มแวร์ — ตัวแปร `temp` (global) ไม่เคยถูกอัปเดต:** เดิมถูกบังด้วย `String temp` ในบล็อก
  ทำให้เงื่อนไข `temp > 30` ของ Auto Fan ไม่ทำงาน ตอนนี้อัปเดต global `temp` / `hum` ทุกครั้งที่อ่านเซนเซอร์
  (พร้อมกรองค่า NaN)

- **เว็บ — สวิตช์พัดลม (`fan.onclick`) ตรรกะกลับด้าน:** แก้ให้ติ๊ก = เปิด (`set(1)`)
  และการแสดงสถานะ (`state8`) ตรงกับสวิตช์อื่นแล้ว
- **เว็บ — ตาราง `appendToTable()` ขาดคอลัมน์ Light:** เพิ่มคอลัมน์ Light ให้ครบ 4 คอลัมน์ตรงกับหัวตาราง
- **เว็บ — ย้าย `firebaseConfig` ออกเป็นไฟล์แยก + เพิ่ม Security Rules:** ย้าย config ไป
  `web/public/scripts/firebase-config.js` และเพิ่มกฎความปลอดภัยที่ `web/database.rules.json`
  (อนุญาตเฉพาะผู้ล็อกอิน และข้อมูล `readings` เข้าถึงได้เฉพาะเจ้าของ uid)

### 📝 หมายเหตุ (ขึ้นกับฮาร์ดแวร์) / Note (hardware-dependent)

- เกณฑ์แสงของ Auto Light (`val < 4050`) ขึ้นกับวิธีต่อวงจร LDR ของคุณ หากไฟติด/ดับสลับกับที่คาด
  ให้สลับ `LOW`/`HIGH` ในบล็อก Auto Light ของเฟิร์มแวร์

---

## 👥 ผู้จัดทำ / Team

| สมาชิก | บทบาท |
|--------|-------|
| **ธนัท จงธีรธนโชติ** ([@winxtxrgit](https://github.com/winxtxrgit)) | Website Designer (หลัก) / Programmer (รอง) — เขียนโปรแกรมควบคุมและปรับปรุงระบบ |
| สมาชิกทีม (ฮาร์ดแวร์) | Hardware Designer (หลัก) / Hardware Engineer (รอง) — ออกแบบ 3D model และประกอบโมเดลบ้าน |
| สมาชิกทีม (ฮาร์ดแวร์) | Hardware Engineer (หลัก) / Software Tester (รอง) — ประกอบอุปกรณ์และช่วยเขียนโปรแกรม |

> หมายเหตุ: แสดงเฉพาะชื่อเจ้าของรีโป ส่วนสมาชิกท่านอื่นและอาจารย์ที่ปรึกษาขอสงวนชื่อไว้เพื่อความเป็นส่วนตัว

---

## 🛠️ เทคโนโลยีที่ใช้ / Tech stack

`ESP32` · `Arduino (C/C++)` · `Firebase Realtime Database` · `Firebase Authentication` ·
`HTML` · `CSS` · `JavaScript` · `jQuery` · `canvas-gauges` · `DesignSpark Mechanical (3D)`

## 📄 License

เผยแพร่ภายใต้สัญญาอนุญาต [MIT](LICENSE)
