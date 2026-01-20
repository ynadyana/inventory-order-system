# 🛡️ TechVault | Enterprise Inventory & E-Commerce Ecosystem

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> **A robust full-stack solution bridging the gap between complex backend inventory management and a modern, responsive customer e-commerce storefront.**

---

## 📖 Executive Summary

**TechVault** is not just a web store; it is a complete retail ecosystem simulation. It solves two distinct business problems: **Granular Inventory Control** for administrators and **Seamless UX** for customers.

Built with a **Spring Boot** backend and **React** frontend, this project demonstrates advanced proficiency in handling complex data relationships (specifically multi-dimensional product variants), secure stateless authentication, and real-time stock management.

---

## 🚀 Technical Highlights (Why this project matters)

### 🔐 1. Advanced Security & RBAC
* **JWT Implementation:** Custom security filter chain implementing stateless authentication using JSON Web Tokens.
* **Role-Based Access Control (RBAC):** Distinct interface rendering and API endpoint protection for `ADMIN` vs `CUSTOMER`.
* **Protected Routes:** React Higher-Order Components (HOC) prevent unauthorized access to dashboard views.

### 📦 2. Complex Data Modeling (Dynamic Variants)
* **The Challenge:** Handling products like the "MacBook Air" which have multiple dimensions (Color + Storage) where each combination has a unique stock level and price.
* **The Solution:** Implemented a relational database schema mapping `Products` to `ProductVariants`.
* **Logic:** The checkout engine intelligently parses composite variant strings (e.g., "Midnight - 512GB") to deduct stock from the specific SKU, preventing overselling of specific configurations.

### 💳 3. End-to-End Order Processing
* **Transaction Management:** Atomic transactions ensure inventory integrity during checkout.
* **Invoice Generation:** System auto-generates a detailed, printable digital receipt upon successful payment simulation.
* **Lifecycle Tracking:** Admin capability to track orders from `PENDING` → `SHIPPED` → `COMPLETED`.

---

## 📸 System Visuals

### 🛍️ Customer Experience
*A clean, responsive UI focused on conversion and ease of use.*

<table width="100%">
  <tr>
    <th width="50%">Modern Authentication</th>
    <th width="50%">Storefront & Filtering</th>
  </tr>
  <tr>
    <td><img src="assets/screenshots/image_5a0bb4.jpg" width="100%" alt="Login Page"></td>
    <td><img src="assets/screenshots/image_5a83d2.png" width="100%" alt="Product Catalog"></td>
  </tr>
  <tr>
    <th colspan="2">Complex Variant Selection (Color + Storage Logic)</th>
  </tr>
  <tr>
    <td colspan="2" align="center"><img src="assets/screenshots/image_5afbee.jpg" width="80%" alt="Quick View Modal"></td>
  </tr>
</table>

### 🧾 The Checkout Flow
*Secure form handling and dynamic invoice generation.*

<table width="100%">
  <tr>
    <th width="50%">Order Summary & Validation</th>
    <th width="50%">Digital Invoice Generation</th>
  </tr>
  <tr>
    <td><img src="assets/screenshots/image_5a2237.jpg" width="100%" alt="Register/Checkout"></td>
    <td><img src="assets/screenshots/image_4f9b63.png" width="100%" alt="Invoice Receipt"></td>
  </tr>
</table>

### ⚙️ Admin Workspace
*Powerful tools for granular stock management.*

<table width="100%">
  <tr>
    <th width="50%">Product & Variant Management</th>
    <th width="50%">Order Status Control</th>
  </tr>
  <tr>
    <td><img src="assets/screenshots/image_4f9b68.png" width="100%" alt="Product Management"></td>
    <td><img src="assets/screenshots/image_4eba81.png" width="100%" alt="Order Management"></td>
  </tr>
</table>

---

## 🛠️ Technology Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Backend** | Java 17, Spring Boot 3, Spring Security 6, Hibernate/JPA |
| **Frontend** | React.js (Vite), Tailwind CSS, Lucide React (Icons), Axios |
| **Database** | PostgreSQL (Relational Data Integrity) |
| **State** | React Context API (Cart & Auth Management) |
| **Tools** | Git, Maven, Postman |

---

## 📬 Author

**[Your Name]** *Full Stack Developer | Java & React Enthusiast* Currently seeking opportunities to leverage these skills in a professional environment.

[LinkedIn](#) | [Email](mailto:your.email@example.com)
