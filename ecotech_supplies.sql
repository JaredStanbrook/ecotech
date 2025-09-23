-- EcoTech Supplies Database Schema
-- Drop existing database if exists
DROP DATABASE IF EXISTS ecotech_supplies;
CREATE DATABASE ecotech_supplies;
USE ecotech_supplies;

-- Users table (for both customers and staff)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    user_type ENUM('customer', 'staff') NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(50),
    state VARCHAR(50),
    postcode VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Product categories table
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Products table
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    category_id INT,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    image_url VARCHAR(255),
    specifications TEXT,
    eco_rating INT CHECK (eco_rating >= 1 AND eco_rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- Orders table
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2),
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address VARCHAR(255),
    shipping_city VARCHAR(50),
    shipping_state VARCHAR(50),
    shipping_postcode VARCHAR(10),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Order items table
CREATE TABLE order_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Shopping cart table (for persistent cart)
CREATE TABLE cart_items (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    session_id VARCHAR(100),
    product_id INT,
    quantity INT DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Insert default users (as required by assignment)
INSERT INTO users (username, password, email, user_type, first_name, last_name) VALUES
('user1', SHA2('user1', 256), 'user1@ecotech.com.au', 'customer', 'John', 'Smith'),
('user2', SHA2('user2', 256), 'user2@ecotech.com.au', 'customer', 'Jane', 'Doe'),
('user3', SHA2('user3', 256), 'user3@ecotech.com.au', 'customer', 'Bob', 'Johnson'),
('staff1', SHA2('staff1', 256), 'staff1@ecotech.com.au', 'staff', 'Sarah', 'Langford'),
('staff2', SHA2('staff2', 256), 'staff2@ecotech.com.au', 'staff', 'James', 'Nguyen'),
('staff3', SHA2('staff3', 256), 'staff3@ecotech.com.au', 'staff', 'Emily', 'Turner');

-- Insert categories
INSERT INTO categories (category_name, description) VALUES
('Solar Chargers', 'Portable solar charging solutions for devices'),
('Smart Home', 'Energy-efficient home automation devices'),
('Eco Accessories', 'Sustainable tech accessories'),
('Recycled Electronics', 'Certified refurbished and recycled electronics'),
('Green Office', 'Eco-friendly office supplies and furniture'),
('Energy Savers', 'Energy-efficient appliances and devices');

-- Insert 30 products
INSERT INTO products (product_name, category_id, description, price, stock_quantity, eco_rating) VALUES
('Solar Phone Charger 10W', 1, 'Portable solar charger with 10W output for smartphones', 49.99, 50, 5),
('Solar Backpack with USB Charging', 1, 'Waterproof backpack with integrated solar panel and USB ports', 129.99, 30, 5),
('Bamboo Wireless Keyboard', 3, 'Bluetooth keyboard made from sustainable bamboo', 79.99, 40, 4),
('Biodegradable Phone Case (iPhone)', 3, 'Compostable phone case for iPhone models', 29.99, 100, 5),
('Biodegradable Phone Case (Samsung)', 3, 'Compostable phone case for Samsung Galaxy models', 29.99, 100, 5),
('Recycled Paper Printer Cartridges', 5, 'Eco-friendly printer cartridges made from recycled materials', 39.99, 75, 4),
('Energy-Efficient LED Smart Bulb', 2, 'WiFi-enabled LED bulb with app control', 24.99, 150, 4),
('Smart Power Strip (Energy Saver)', 6, 'Intelligent power strip that reduces phantom power draw', 59.99, 60, 5),
('Solar-Powered Desk Lamp', 5, 'LED desk lamp with solar charging capability', 69.99, 45, 4),
('Portable Solar Generator 500W', 1, 'Compact solar generator for camping and emergencies', 599.99, 20, 5),
('Smart Thermostat (EcoTech Edition)', 2, 'Learning thermostat that reduces energy consumption', 249.99, 35, 5),
('Solar Outdoor Security Camera', 2, 'Wireless security camera powered by solar energy', 189.99, 40, 5),
('Wind-Up Emergency Radio', 6, 'Hand-crank radio with LED flashlight and USB charging', 49.99, 55, 4),
('Compostable Laptop Sleeve', 3, 'Protective laptop sleeve made from compostable materials', 44.99, 70, 5),
('Recycled Plastic Office Chair', 5, 'Ergonomic office chair made from 100% recycled plastics', 299.99, 25, 4),
('Solar-Powered Bluetooth Speaker', 3, 'Waterproof speaker with solar charging panel', 89.99, 50, 4),
('Eco-Friendly Computer Mouse', 3, 'Wireless mouse made from recycled materials', 34.99, 80, 3),
('Smart Plug with Energy Monitoring', 2, 'WiFi plug that tracks and reports energy usage', 29.99, 120, 4),
('Solar Camping Lantern', 1, 'Collapsible LED lantern with solar charging', 39.99, 65, 5),
('Energy-Efficient Mini Fridge', 6, 'Compact refrigerator with A+++ energy rating', 399.99, 15, 5),
('Bamboo Standing Desk Converter', 5, 'Adjustable desk converter made from sustainable bamboo', 249.99, 30, 4),
('Refurbished Laptop (EcoTech Certified)', 4, 'Professionally refurbished laptop with warranty', 499.99, 25, 5),
('Eco-Friendly Smartphone Case (Pixel)', 3, 'Biodegradable case for Google Pixel phones', 29.99, 90, 5),
('Solar Power Bank 20,000mAh', 1, 'High-capacity power bank with solar charging', 79.99, 70, 4),
('Biodegradable Earphones', 3, 'Quality earphones made from biodegradable materials', 49.99, 85, 4),
('Smart Recycled Paper Notebook', 5, 'Reusable notebook with digital sync capability', 39.99, 95, 3),
('Solar Motion Sensor Garden Lights', 1, 'Set of 4 solar-powered garden lights with motion detection', 69.99, 55, 5),
('Recycled Plastic Monitor Stand', 5, 'Adjustable monitor stand made from recycled materials', 54.99, 60, 4),
('Eco-Friendly Wireless Charger Pad', 3, 'Qi wireless charger made from sustainable materials', 44.99, 75, 4),
('Energy-Efficient Washing Machine', 6, 'Front-loading washer with A+++ energy rating', 899.99, 10, 5);

-- Create indexes for better performance
CREATE INDEX idx_product_category ON products(category_id);
CREATE INDEX idx_product_name ON products(product_name);
CREATE INDEX idx_user_type ON users(user_type);
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_cart_session ON cart_items(session_id);
