<h1 align="center">
   <img 
   src="https://tests26bucket.s3.us-east-2.amazonaws.com/The_Studio_26_Logo.png"
   style="width: 50%; height: 50%"
   >
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
├─ .gitignore
├─ README.md
├─ .mocharc.js
├─ app
│  ├─ (AdminPages)          
│  │  ├─ Dashboard          
│  │  ├─ EmailBuilder       
│  │  ├─ ManageOrders       
│  │  ├─ ItemForms          
│  │  ├─ FinancialAnalytics 
│  │  └─ OpenLabSection     
│  ├─ (CustomerPages)       
│  │  ├─ OpenLab            
│  │  ├─ Store              
│  │  ├─ StoreSearch       
│  │  ├─ class-catalog      
│  │  └─ calendar           
│  ├─ Components            
│  ├─ api                   
│  ├─ lib                   
│  ├─ models                
│  ├─ page.tsx              
│  └─ layout.tsx            
├─ next.config.mjs          
├─ package-lock.json        
├─ package.json             
├─ postcss.config.mjs       
├─ tailwind.config.ts       
├─ tsconfig.json            
└─ utils                    

```

# Usage (run fullstack app on your machine)

## Dependencies
<!-- Two-Column Layout -->
<h2>Dependencies & DevDependencies</h2>
<table>
  <tr>
    <th colspan="4">Core Dependencies</th>
  </tr>
  <tr>
    <td>next: ^14.2.28</td>
    <td>react: ^18.3.1</td>
    <td>react-dom: ^18.3.1</td>
    <td>next-auth: ^4.24.11</td>
  </tr>
  <tr>
    <th colspan="4">Data & API</th>
  </tr>
  <tr>
    <td>axios: ^1.9.0</td>
    <td>mongodb: ^6.16.0</td>
    <td>mongoose: ^8.14.0</td>
    <td>bcrypt: ^5.1.1</td>
  </tr>
  <tr>
    <td>nodemailer: ^6.10.1</td>
    <td>stripe: ^17.7.0</td>
    <td>zod: ^3.24.3</td>
    <td>shippo: ^2.15.0</td>
  </tr>
  <tr>
    <th colspan="4">UI Components</th>
  </tr>
  <tr>
    <td>@mui/material: ^6.4.11</td>
    <td>@mui/icons-material: ^6.4.11</td>
    <td>daisyui: ^4.12.24</td>
    <td>@headlessui/react: ^2.2.2</td>
  </tr>
  <tr>
    <td>@heroicons/react: ^2.2.0</td>
    <td>lucide-react: ^0.475.0</td>
    <td>react-modal: ^3.16.3</td>
    <td>zustand: ^4.5.6</td>
  </tr>
  <tr>
    <th colspan="4">Date & Calendar</th>
  </tr>
  <tr>
    <td>date-fns: ^4.1.0</td>
    <td>moment: ^2.30.1</td>
    <td>react-big-calendar: ^1.18.0</td>
    <td>react-datepicker: ^8.3.0</td>
  </tr>
  <tr>
    <th colspan="4">File & Media</th>
  </tr>
  <tr>
    <td>@aws-sdk/client-s3: ^3.799.0</td>
    <td>file-saver: ^2.0.5</td>
    <td>jspdf: ^3.0.1</td>
    <td>react-medium-image-zoom: ^5.2.14</td>
  </tr>
  <tr>
    <th colspan="4">Charts & Visualization</th>
  </tr>
  <tr>
    <td>chart.js: ^4.4.9</td>
    <td>react-chartjs-2: ^5.3.0</td>
    <td>highlight.js: ^11.11.1</td>
    <td></td>
  </tr>
  <tr>
    <th colspan="4">DevDependencies</th>
  </tr>
  <tr>
    <td>typescript: ^5.8.3</td>
    <td>eslint: ^8.57.1</td>
    <td>tailwindcss: ^3.4.17</td>
    <td>postcss: ^8.5.3</td>
  </tr>
  <tr>
    <td>jest: ^29.7.0</td>
    <td>mocha: ^11.1.0</td>
    <td>prettier: ^3.5.3</td>
    <td>ts-node: ^10.9.2</td>
  </tr>
  <tr>
    <td>@types/react: ^18.3.20</td>
    <td>@types/node: ^20.17.32</td>
    <td>@types/mongoose: ^5.11.96</td>
    <td>selenium-webdriver: ^4.31.0</td>
  </tr>
</table>

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
NEXTAUTH_URL=http://localhost:3000
```

### Stripe API Keys:
```terminal
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### AWS S3 (Image Storage)
```terminal
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-aws-access-key-id
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
NEXT_PUBLIC_AWS_REGION=your-aws-region
NEXT_PUBLIC_S3_BUCKET_NAME=your-s3-bucket-name
S3_BUCKET_DOMAIN=your-s3-bucket-domain
```

### Email Configuration
```terminal
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
```

### Shipping Integration
```terminal
SHIPPO_TEST_KEY=your-shippo-test-key
CARRIER_Account_TEST_KEY=your-carrier-account-test-key
```

### Application Configuration
```terminal
BASE_URL=http://localhost:3000
MASTER_ADMIN_ID=your-master-admin-id
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

## Setup for Testing

1. **Install Project Dependencies**
   ```terminal
   $ npm install

2. **Ensure Environment File Is Set Up**
   - For Mac/Linux users, make sure the .env file is present in the root directory.
   - For Windows users, ensure env.local is present instead.
   - This file should contain necessary environment variables such as the MongoDB connection string.

3. **Configure MongoDB Access**
   - To use the live database, follow these steps:
     1. Go to MongoDB Atlas.
     2. Log into your MongoDB account.
     3. Navigate to the Network Access tab.
     4. Add your current IP address to the IP Whitelist.
     5. Ensure you're connected to the cluster your project is configured to use.

4. **Start the Development Server**
   - Before running the tests, the server must be running
   ```terminal
   npm run dev
   ```
   - This should start the app on http://localhost:3000. Wait for the terminal to display:
   ```terminal
   ✔ Ready in XXXXms
   ```

5. **Run Selenium WebDriver Tests (Mocha)**
   - To execute all Selenium test scripts:
   ```terminal
   $ npx mocha -r ts-node/register --project tsconfig.mocha.json tests/
   ```
   - To execute individual tests:
   ```terminal
   $ npx mocha -r ts-node/register --project tsconfig.mocha.json "tests/customer-crud-ui.spec.cts" --grep "Customer Management Form"
   ```
> **_NOTE:_** Make sure Chrome is installed and up to date, as the tests rely on the ChromeDriver.

# Building and Deployment with Vercel

1. Before deploying to Vercel, ensure the following:
   - You have a <a href="https://vercel.com/signup">Vercel Account</a>
   - The Vercel CLI is installed on your machine:
    ```terminal
    npm install -g vercel
    ```
   - Your .env file is properly configured with all the required environment variables
2. Building the Application
   To build the application locally for production:
   1. Install dependencies:
      ```terminal
      npm install
      ```
   2. Build the application
      ```terminal
      npm run build
      ```
      This will generate the production-ready files in the .next directory.
   3. Test the production build locally:
      ```terminal
      npm start
      ```
3. Deploying to Vercel
   
   To deploy your application to Vercel using the <a href="https://vercel.com/dashboard">Vercel Dashboard</a>:
   1. <b>Import the Project:</b>
      - Go to the Vercel Dashboard.
      - Click Add New Project and select your GitHub repository.
   2. <b>Configure Build Settings:</b>
      - Ensure the following build settings are configured:
        - **Framework Preset**: Next.js
        - **Build Command**: npm run build
        - **Output Directory**: .next
   3. <b>Set Environment Variables:</b>
      - In the **Environment Variables** section, add all the variables from your .env file.
   4. <b>Deploy:</b>
      - Click **Deploy** to build and deploy your application.
   5. <b>Redeploying:</b>
      
      To redeploy the application after making changes
      1. Push your changes to the production branch (e.g., main or master)
      2. Vercel will automaticall trigger a new deployment
      
      If you need to manually trigger redployment
      ```terminal
      vercel --prod
      ```

# Screenshots of this project

<!-- Two-Column Layout -->
<div style="display: flex; flex-wrap: wrap; gap: 16px;">
  <div style="flex: 1 1 50%; text-align: center;">
    <img src="https://tests26bucket.s3.us-east-2.amazonaws.com/README/home.png" alt="Home page" style="width: 50%;">
  </div>
  <div style="flex: 1 1 50%; text-align: center;">
    <img src="https://tests26bucket.s3.us-east-2.amazonaws.com/README/lab-page.png" alt="Lab Page" style="width: 50%;">
  </div>
  <div style="flex: 1 1 50%; text-align: center;">
    <img src="https://tests26bucket.s3.us-east-2.amazonaws.com/README/product-catalog.png" alt="Store Page" style="width: 50%;">
  </div>
  <div style="flex: 1 1 50%; text-align: center;">
    <img src="https://tests26bucket.s3.us-east-2.amazonaws.com/README/class-catalog.png" alt="Classes Page" style="width: 50%;">
  </div>
  <div style="flex: 1 1 50%; text-align: center;">
    <img src="https://tests26bucket.s3.us-east-2.amazonaws.com/README/calendar.png" alt="Calendar" style="width: 50%;">
  </div>
  <div style="flex: 1 1 50%; text-align: center;">
    <img src="https://tests26bucket.s3.us-east-2.amazonaws.com/README/dashboard.png" alt="Dashboard" style="width: 50%;">
  </div>
</div>
