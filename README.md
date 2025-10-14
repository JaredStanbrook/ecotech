# EcoTech Supplies Online Trading Platform

## Overview

This repository contains the source code and documentation for the EcoTech Supplies online trading platform, developed as part of the requirements for **Unit ICT286 Web and Mobile Computing (S2, 2025)** at Murdoch University.

EcoTech Supplies is a fictitious company specializing in eco-friendly and sustainable technology products. The application enables users to browse, search, and purchase products, with distinct roles for visitors, registered customers, and company staff. The project was completed collaboratively by two students as a duo.

## Contributors

- **Jared Stanbrook**  
  Student ID: 34113043  
  Email: 34113043@student.murdoch.edu.au
- **Daniel Stacy**  
  Student ID: 33531109  
  Email: 33531109@student.murdoch.edu.au

## Technologies Used

- HTML5
- CSS
- JavaScript
- jQuery
- PHP
- Ajax
- MySQL
- Apache Cordova

## Features

- Dynamic product catalog with search and category browsing
- User registration, authentication, and account management
- Shopping cart functionality for all users
- Role-based access for visitors, customers, and staff
- Administrative features for staff (add, update, delete products)
- Responsive web client and Cordova mobile client
- All product and user data stored in MySQL database (never hard-coded)
- Client-server communication via Ajax

## Directory Structure

- `server/` — PHP backend API endpoints and configuration
- `webclient/` — Web front-end (HTML, CSS, JS)
- `ecotech_supplies.sql` — Database schema and sample data
- `assignment2plan.md` — Project plan and company details
- `assignmentGuide.md` — Assignment requirements and guidelines

## Getting Started

### 1. Prerequisites
Make sure you have the following installed:
- [PHP 8+](https://www.php.net/downloads)
- [MySQL 8+](https://dev.mysql.com/downloads/mysql/)
- [Apache](https://httpd.apache.org/) or a local server stack like [XAMPP](https://www.apachefriends.org/), [Laragon](https://laragon.org/), or [MAMP](https://www.mamp.info/en/).

---

### 2. Setup Instructions

#### Step 1. Clone the Repository
```bash
git clone https://github.com/JaredStanbrook/ecotech-supplies.git
cd ecotech-supplies
```

#### Step 2. Import the Database
1. Open **MySQL CLI**.
2. Create a new database:
   ```sql
   CREATE DATABASE ecotech_supplies;
   ```
3. Import the SQL file:
   ```bash
   mysql -u root -p ecotech_supplies < ecotech_supplies.sql
   CREATE USER 'ecotech'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON ecotech_supplies.* TO 'ecotech'@'localhost';
   FLUSH PRIVILEGES;
   ```

#### Step 3. Configure Server
- Update database credentials in your main config file (if applicable, e.g. `/server/config.php`):
  ```php
  <?php
  define('DB_HOST', 'localhost');
  define('DB_NAME', 'ecotech_supplies');
  define('DB_USER', 'ecotech');  // Change this for production
  define('DB_PASS', 'password'); 
  ?>
  ```

#### 4. Run the PHP Built-in Server
From the project root (where your `/server` and `/webclient` folders are):
```bash
php -S localhost:8000 -t .
```

You’ll see:
```
PHP 8.2.0 Development Server (http://localhost:8000) started
```

#### 5. Access the App
- Frontend: [http://localhost:8000/webclient/index.html](http://localhost:8000/webclient/index.html)  
- Backend API: [http://localhost:8000/server/](http://localhost:8000/server/)


## User Accounts for Testing

The following accounts exiest in database for testing (as per assignment requirements):

- Customers: `user1`, `user2`, `user3` (passwords same as usernames)
- Staff: `staff1`, `staff2`, `staff3` (passwords same as usernames)

## Assignment Compliance

This project strictly follows the requirements outlined in `assignmentGuide.md`, including:

- Use of specified technologies only
- Dynamic data management via MySQL and PHP
- Separation of client and server code
- No use of third-party frameworks or CMS
- Single Page Application design for both web and mobile clients

## License

This repository is for educational purposes only and is not intended for commercial use.

---

For more details, see `assignment2plan.md` and `assignmentGuide.md` in this repository.
