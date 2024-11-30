<h1 align="center">
   <img src="https://tests26bucket.s3.us-east-2.amazonaws.com/Studio26LLC.png">
</h1>
<p align="center">
MongoDB, React, Nextjs, Nodejs
</p>

## Authors
<p align="center">
  <a href="https://github.com/notchrubble">Zach Attiya</a> |
  <a href="https://github.com/alexander-bass">Alexander Bass</a> |
  <a href="https://github.com/OmarBetancourtCSUS">Omar Betancourt</a> |
  <a href="https://github.com/PleaseDontAskMeAnything">Priyatham Dasigandla</a> |
  <a href="https://github.com/HKtrill">Phillip Harris</a> |
  <a href="https://github.com/RayLaciste">Ray Laciste</a> |
  <a href="https://github.com/alexmendoza99">Alexandrea Mendoza</a> |
  <a href="https://github.com/NeirelZapatos">Neiral Zapatos</a>
</p>

# Synopsis
This project is a comprehensive web-based solution designed to streamline class scheduling, product management, and financial tracking for small businesses. Built with a robust tech stack, including MongoDB, Next.js, Node.js, React, Stripe, and ShipStation, the application replaces manual processes with a centralized, intuitive dashboard. This system empowers business owners to enhance operational efficiency, improve customer engagement, and make data-driven decisions.

## clone or download
```terminal
$ git clone https://github.com/NeirelZapatos/TheStudio26Website.git
$ yarn # or npm i
```

## project structure
```
TheStudio26Website
├─ .README.md
├─ .gitignore
├─ README.md
├─ app
│  ├─ (AdminPages)
│  ├─ (CustomerPages)
│  ├─ Calender
│  ├─ Components
│  ├─ api
│  ├─ lib
│  ├─ models
│  ├─ page.tsx
│  └─ shipstation-test
├─ next.config.mjs
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ tailwind.config.ts
└─ tsconfig.json

```

# Usage (run fullstack app on your machine)

## Dependencies (Tech Stacks)
| **Category**      | **Client-side**                | **Server-side**              |
|-------------------|--------------------------------|------------------------------|
| Dependencies      | axios: ^1.7.7                 | bcrypt: ^5.1.1              |
|                   | daisyui: ^4.12.12             | dotenv: ^16.4.5             |
|                   | react: ^18                    | mongodb: ^6.9.0             |
|                   | react-dom: ^18                | mongoose: ^8.7.2            |
|                   | react-big-calendar: ^1.15.0   | nodemailer: ^6.9.16         |
|                   | moment: ^2.30.1               | next-auth: ^4.24.10         |
|                   | next: 14.2.14                 | stripe: ^17.3.1             |
|                   | zod: ^3.23.8                  |                              |
| DevDependencies   | @types/bcrypt: ^5.0.2         |                              |
|                   | @types/mongoose: ^5.11.96     |                              |
|                   | @types/node: ^20              |                              |
|                   | @types/react: ^18             |                              |
|                   | @types/react-big-calendar: ^1.15.0 |                           |
|                   | @types/react-dom: ^18         |                              |
|                   | eslint: ^8                    |                              |
|                   | eslint-config-next: 14.2.14   |                              |
|                   | postcss: ^8                   |                              |
|                   | tailwindcss: ^3.4.1           |                              |
|                   | typescript: ^5                |                              |

</br>

# ⚠️ Important Notice
<b>
   The .env file is not included in this repository for security reasons. This file contains sensitive environment variables, such as API keys and database connection strings, that are required to run the project.
</b>

## Required Environment Variables:
You need to create a .env file in the root directory of the project and add the following keys:

### MongoDB Connection String:
```terminal
MONGO_URI=your-mongodb-connection-string
```

### NextAuth Secret:
```terminal
NEXTAUTH_SECRET=your-next-auth-secret
```

### Stripe API Keys:
```terminal
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

Without the .env file properly configured, the project will not function correctly. Ensure you have valid API keys and credentials for all required services.

## Prerequisites
[comment]: <> (ADJUST THIS)
- [MongoDB](https://gist.github.com/nrollr/9f523ae17ecdbb50311980503409aeb3)
- [Node](https://nodejs.org/en/download/)
- [npm](https://nodejs.org/en/download/package-manager/)

## Start
```terminal
$ npm i       // npm install packages
$ npm run dev // run it locally
```

# Testing
PLACEHOLDER

# Deployment
PLACEHOLDER

# Developer Instructions
PLACEHOLDER

# Screenshots of this project

<!-- Two-Column Layout -->
<div style="display: flex; flex-wrap: wrap; gap: 16px;">
  <div style="flex: 1 1 50%; text-align: center;">
    <img src="https://tests26bucket.s3.us-east-2.amazonaws.com/README/ERD-Studio26LLC.png" alt="ERD" style="width: 50%;">
  </div>
  <div style="flex: 1 1 50%; text-align: center;">
    <img src="https://tests26bucket.s3.us-east-2.amazonaws.com/README/HomePage-Studio26LLC.png" alt="Home page" style="width: 50%;">
  </div>
  <div style="flex: 1 1 50%; text-align: center;">
    <img src="https://tests26bucket.s3.us-east-2.amazonaws.com/README/LabSessions-Studio26LLC.png" alt="Lab Page" style="width: 50%;">
  </div>
  <div style="flex: 1 1 50%; text-align: center;">
    <img src="https://tests26bucket.s3.us-east-2.amazonaws.com/README/StorePage-Studio26LLC.png" alt="Store Page" style="width: 50%;">
  </div>
  <div style="flex: 1 1 50%; text-align: center;">
    <img src="https://tests26bucket.s3.us-east-2.amazonaws.com/README/Calendar-Studio26LLC.png" alt="Calendar" style="width: 50%;">
  </div>
  <div style="flex: 1 1 50%; text-align: center;">
    <img src="https://tests26bucket.s3.us-east-2.amazonaws.com/README/Checkout-Studio26LLC.png" alt="Checkout" style="width: 50%;">
  </div>
</div>
