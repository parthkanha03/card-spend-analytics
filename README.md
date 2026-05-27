<p align="center">
  <img src="https://img.shields.io/badge/Visa-Powered-1A1F71?style=for-the-badge&logo=visa&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" />
</p>

<h1 align="center">💳 Card Spend Analytics</h1>

<p align="center">
  <strong>A full-stack credit card spend analytics dashboard</strong><br/>
  <em>Enroll cards • Make payments • Visualize spending patterns</em>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-project-structure">Project Structure</a>
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🪪 **Card Enrollment** | Securely enroll credit cards with hashed storage (SHA-256) — full card numbers are **never persisted** |
| 💸 **Payment Processing** | Simulate payments with merchant, category, and amount — with real-time balance updates |
| 📊 **Spend Analytics** | Interactive dashboard with pie charts, utilization rings, and category breakdowns |
| 🔒 **Card Masking** | Only last 4 digits stored & displayed — bank-level data protection |
| 📋 **Transaction History** | Full chronological history with merchant, category badges, and timestamps |
| 🎨 **Modern Dark UI** | Sleek glassmorphism design with smooth animations and responsive layout |

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Java 17** | Core language |
| **Spring Boot 3.2** | REST API framework |
| **Spring Data JPA** | ORM & data access |
| **H2 Database** | In-memory database (dev) |
| **Hibernate Validator** | Request validation |
| **Lombok** | Boilerplate reduction |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI library |
| **Vite 5** | Build tool & dev server |
| **Pure CSS** | Custom glassmorphism design |
| **Canvas API** | Pie chart visualization |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                     │
│                                                                  │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐  ┌───────────┐ │
│  │ EnrollCard│  │ MakePayment  │  │ Dashboard │  │  PieChart │  │
│  └─────┬────┘  └──────┬───────┘  └─────┬─────┘  └───────────┘ │
│        │               │                │                        │
│        └───────────────┼────────────────┘                        │
│                        │  /api/*                                  │
└────────────────────────┼─────────────────────────────────────────┘
                         │ Vite Proxy (dev)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SERVER (Spring Boot 3.2)                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    CardController                         │   │
│  │  POST /api/cards  │ GET /api/cards │ POST /api/cards/:id/pay │
│  │  GET /api/dashboard/:cardId                              │   │
│  └───────────────────────────┬──────────────────────────────┘   │
│                              │                                    │
│  ┌───────────────────────────▼──────────────────────────────┐   │
│  │                      CardService                          │   │
│  │  enrollCard() │ listCards() │ makePayment() │ getDashboard()│ │
│  └───────────────────────────┬──────────────────────────────┘   │
│                              │                                    │
│  ┌───────────────────────────▼──────────────────────────────┐   │
│  │              JPA Repositories + H2 Database               │   │
│  │         CardRepository  │  TransactionRepository          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Java 17+** (JDK)
- **Maven 3.8+**
- **Node.js 18+** & **npm**

### 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
cd card-spend-analytics
```

### 2️⃣ Start the Backend

```bash
cd backend
mvn spring-boot:run
```

> The API server starts at **http://localhost:8080**  
> H2 Console available at **http://localhost:8080/h2-console**  
> (JDBC URL: `jdbc:h2:mem:spenddb`, Username: `sa`, No password)

### 3️⃣ Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

> The React app starts at **http://localhost:5173**  
> API calls are automatically proxied to the backend via Vite

### 4️⃣ Open the App

Navigate to **http://localhost:5173** in your browser and start exploring! 🎉

---

## 📡 API Reference

### Cards

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/api/cards` | Enroll a new card | `{ name, cardNumber, creditLimit }` |
| `GET` | `/api/cards` | List all enrolled cards | — |

### Payments

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/api/cards/{id}/pay` | Make a payment | `{ merchant, amount, category }` |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard/{cardId}` | Get spend analytics for a card |

### Spend Categories

```
🛒 GROCERIES   🍽️ DINING   ✈️ TRAVEL   🛍️ SHOPPING   💡 UTILITIES
```

### Example Requests

<details>
<summary><strong>Enroll a Card</strong></summary>

```bash
curl -X POST http://localhost:8080/api/cards \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Visa Platinum",
    "cardNumber": "4111111111111111",
    "creditLimit": 5000.00
  }'
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "My Visa Platinum",
  "maskedCardNumber": "**** **** **** 1111",
  "creditLimit": 5000.00,
  "availableBalance": 5000.00,
  "enrolledAt": "2026-05-27T18:30:00"
}
```
</details>

<details>
<summary><strong>Make a Payment</strong></summary>

```bash
curl -X POST http://localhost:8080/api/cards/1/pay \
  -H "Content-Type: application/json" \
  -d '{
    "merchant": "Whole Foods",
    "amount": 85.50,
    "category": "GROCERIES"
  }'
```

**Response (201 Created):**
```json
{
  "id": 1,
  "merchant": "Whole Foods",
  "amount": 85.50,
  "category": "GROCERIES",
  "createdAt": "2026-05-27T18:35:00"
}
```
</details>

<details>
<summary><strong>Get Dashboard</strong></summary>

```bash
curl http://localhost:8080/api/dashboard/1
```

**Response (200 OK):**
```json
{
  "cardId": 1,
  "creditLimit": 5000.00,
  "availableBalance": 4914.50,
  "totalSpent": 85.50,
  "spendByCategory": {
    "GROCERIES": 85.50,
    "DINING": 0,
    "TRAVEL": 0,
    "SHOPPING": 0,
    "UTILITIES": 0
  },
  "recentTransactions": [...]
}
```
</details>

---

## 📂 Project Structure

```
card-spend-analytics/
├── 📁 backend/                          # Spring Boot API
│   ├── pom.xml                          # Maven dependencies
│   └── src/main/java/com/visa/spendanalytics/
│       ├── SpendAnalyticsApplication.java    # Main class
│       ├── config/
│       │   └── CorsConfig.java               # CORS configuration
│       ├── controller/
│       │   └── CardController.java           # REST endpoints
│       ├── dto/
│       │   ├── CardEnrollRequest.java        # Enrollment payload
│       │   ├── CardResponse.java             # Card API response
│       │   ├── DashboardResponse.java        # Analytics response
│       │   ├── PaymentRequest.java           # Payment payload
│       │   └── TransactionResponse.java      # Transaction response
│       ├── exception/
│       │   ├── CardNotFoundException.java
│       │   ├── DuplicateCardException.java
│       │   ├── InsufficientBalanceException.java
│       │   └── GlobalExceptionHandler.java   # Centralized error handling
│       ├── model/
│       │   ├── Card.java                     # Card entity
│       │   ├── Category.java                 # Spend categories enum
│       │   └── Transaction.java              # Transaction entity
│       ├── repository/
│       │   ├── CardRepository.java
│       │   └── TransactionRepository.java
│       ├── service/
│       │   └── CardService.java              # Business logic
│       └── util/
│           └── CardMaskingUtil.java          # Card number security
│
├── 📁 frontend/                         # React + Vite App
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js                   # Vite config with API proxy
│   └── src/
│       ├── App.jsx                      # Main app with tab navigation
│       ├── App.css                      # Global styles (glassmorphism)
│       ├── main.jsx                     # React entry point
│       ├── components/
│       │   ├── Dashboard.jsx            # Analytics dashboard
│       │   ├── EnrollCard.jsx           # Card enrollment form
│       │   ├── MakePayment.jsx          # Payment form
│       │   ├── PieChart.jsx             # Canvas pie chart
│       │   └── VisaCard.jsx             # Card visual component
│       └── services/
│           └── api.js                   # API client
│
└── README.md
```

---

## 🔐 Security Highlights

- **No full card numbers stored** — Only SHA-256 hash (for duplicate detection) and last 4 digits are persisted
- **Input validation** — All API requests validated with Jakarta Bean Validation
- **Centralized error handling** — Custom exceptions with proper HTTP status codes
- **Duplicate card detection** — Hash-based comparison prevents re-enrollment

---

## 🎨 UI Highlights

- **Glassmorphism Design** — Frosted glass panels with subtle backdrop blur
- **Interactive Pie Charts** — Canvas-rendered with hover tooltips
- **Utilization Ring Meter** — SVG-based circular progress with color coding
- **Card Carousel** — Visual Visa card representations with masked numbers
- **Responsive Layout** — Adapts beautifully to all screen sizes
- **Dark Theme** — Easy on the eyes, professional look

---

## 🧪 Testing

```bash
cd backend
mvn test
```

---

## 📝 License

This project is for educational and demonstration purposes.

---

<p align="center">
  <strong>Built with ❤️ using Spring Boot + React</strong><br/>
  <em>Powered by Visa</em>
</p>
