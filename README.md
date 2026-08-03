
# 📝 To-Do List Application

A clean, full-stack Task Management application built with **Java 21**, **Spring Boot 4**, **Spring Data JPA**, and **Tailwind CSS**. Features real-time task creation, completion toggling, inline editing, and deletion synced with an in-memory H2 database.

---

## 📸 Screenshots

> *Add your application screenshots below:*

| Dashboard Overview | Task Management & Filters |
| :---: | :---: |
| ![Dashboard Screenshot]<img width="1919" height="930" alt="image" src="https://github.com/user-attachments/assets/c006fa0d-b355-487e-9943-8ee138713adc" /> | ![Filters Screenshot](./docs/screenshots/filters.png) |

---

## ✨ Features

- ⚡ **Full CRUD Operations**: Create, read, update, and delete tasks in real time.
- 🎨 **Modern Tailwind CSS UI**: Dark mode interface with dynamic progress metrics and toast notifications.
- ⚡ **In-Memory H2 Database**: Pre-configured database requiring zero setup.
- 📐 **Clean Architecture**: Organized into layered Java components (Controller &rarr; Service &rarr; Repository &rarr; Entity).

---

## 🛠️ Tech Stack

- **Backend**: Java 21, Spring Boot, Spring Data JPA, Hibernate
- **Database**: H2 In-Memory Database (with web console)
- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript (Fetch API)
- **Build Tool**: Maven

---

## 📂 Project Structure

```
demo/
├── src/
│   ├── main/
│   │   ├── java/com/example/todolist/
│   │   │   ├── controller/     # TaskController (REST API Endpoints)
│   │   │   ├── service/        # TaskService (Business Logic)
│   │   │   ├── repository/     # TaskRepository (Spring Data JPA)
│   │   │   ├── model/          # Task Entity (Database Table Schema)
│   │   │   └── TodoListApplication.java # Spring Boot Entry Point
│   │   └── resources/
│   │       ├── static/         # Frontend Web Files (index.html, app.js)
│   │       └── application.properties # H2 & JPA Configuration
│   └── test/                   # Spring Boot Integration Tests
└── pom.xml                     # Maven Dependencies
```

---

## 🚀 How to Run the Project

### Prerequisites
- **JDK 21** installed
- **Maven** (or use the included Maven wrapper `mvnw`)

### Running Locally

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd demo
   ```

2. **Run the Spring Boot App**:
   - On Windows (PowerShell / Command Prompt):
     ```cmd
     .\mvnw.cmd clean spring-boot:run
     ```
   - On macOS / Linux:
     ```bash
     ./mvnw clean spring-boot:run
     ```

3. **Open in Browser**:
   - Web App UI: [http://localhost:8080](http://localhost:8080)
   - H2 Console: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)  
     *(JDBC URL: `jdbc:h2:mem:tododb`, Username: `sa`, Password: leave blank)*

---

## 📡 REST API Endpoints

| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tasks` | Fetch all tasks |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/{id}` | Update task title or completed status |
| `DELETE` | `/api/tasks/{id}` | Delete task by ID |

---

## 👤 Author
- **Developer**: Your Name
- **GitHub**: [@yourusername](https://github.com/yourusername)
