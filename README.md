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

## Setup Instructions

1. Import the `ecotech_supplies.sql` file into your MySQL database.
2. Configure database connection details in `server/config.php`.
3. Host the `server/` directory on a PHP-enabled web server (e.g., Apache).
4. Open `webclient/index.html` in your browser for the web client.
5. For mobile, package the Cordova client (not included in this repo) and test on an emulator or device.

## User Accounts for Testing

Create the following accounts in your database for testing (as per assignment requirements):

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
