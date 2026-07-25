# Farmer Producer Group Produce Collection & Payment Register

A Complete Digital ledger application for recording farmer produce deliveries, automatically calculating billing amounts on the server via PostgreSQL triggers, and checking payments change histories. Built with React 19, Vite, Tailwind CSS v4, and Supabase (PostgreSQL).

## Project Problem Description
Currently, agricultural collection centers write produce slips on paper. Slips get lost, wrong quantity readings trigger disputes, payments are calculated manually, and members lack clear records of deliveries and money owed. This application digitizes the process end-to-end to restore operational transparency and trust.

---

## Features
1. **Operator Session Desk:** Simulated login roles for collection center operators.
2. **Interactive Stats Dashboard:** Displays key figures (Total Farmers, Total Collections, Total Amount, Today's Collections) and live delivery logs.
3. **Farmer Profile Directory:** Full CRUD operations with village, name, and phone indexes.
4. **Produce Catalog Registry:** Add produce types and units (kg, liter, bunch) with delete block rules if crops have active receipts.
5. **Collection Slip Register:** Real-time collection log entries showing live quantity rate calculations. Saves without submitting client-side totals, computing the exact derived amount on the server.
6. **Search, Filter, and Sort Engine:** Instantly search by name, filter by crop type or dates, and sort by needs-attention (unpaid collections first) or dates.
7. **Auditable Payment History Ledger:** Logs status updates (Pending, Paid) to a separate change ledger instead of overwriting table rows directly.
8. **Farmer Statements Ledger:** Printable summary statements showing total deliveries, quantities, and balances.
9. **Natural Language AI Assistant:** Intent-matching search parser normalizing queries (trimming, lowercase, stripping punctuation) to fetch data metrics.
10. **QA Testing Center:** Interactive test harness checking check constraint limits (negative rate/qty), foreign key violations, and client math comparisons.

---

## Tech Stack
* **Frontend:** React 19, Vite, Tailwind CSS v4, React Router DOM, TanStack Query, React Hook Form, React Hot Toast, Lucide Icons
* **Backend:** Supabase Cloud, PostgreSQL Database, SQL Views, Triggers, RLS Policies
* **Deployment:** Vercel (Frontend), Supabase Cloud Database (Backend)

---

## Folder Structure

```text
Farmer_Digital_payment_Register/
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbar, Sidebar, layout controls
│   │   ├── layouts/     # Page layout wrappers
│   │   ├── pages/       # Login, Dashboard, CRUD modules, AI, Testing
│   │   ├── hooks/       # Custom React Query custom hooks
│   │   ├── services/    # Supabase Client and Database Layer (db.js)
│   │   ├── contexts/    # Simulated Authentication Context
│   │   ├── routes/      # Application route definitions
│   │   ├── utils/       # Date and Currency formatters
│   │   ├── constants/   # Crop units and routing variables
│   │   ├── styles/      # Custom CSS
│   │   ├── App.jsx      # Global React providers bootstrap
│   │   └── main.jsx     # Vite render entrypoint
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── vite.config.js
├── backend/
│   └── database/
│       ├── schema.sql    # Table structures
│       ├── functions.sql # Trigger calculations and check rules
│       ├── views.sql     # Detailed views for statistics and statements
│       ├── policies.sql  # Row-level security settings
│       ├── seed.sql      # Seed dataset for testing
│       └── ER_DIAGRAM.md # Database diagram and relationships justification
├── .gitignore            # Root ignore rules
└── README.md
```

---

## Database Architecture
The application runs on a fully normalized relational schema detailed in [ER_DIAGRAM.md](file:///c:/Users/vigne/Desktop/Projects/Farmer_Digital_payment_Register/backend/database/ER_DIAGRAM.md).
* **Server-Side Validation:** Triggers validate inputs before database inserts. If `quantity` or `rate` are $\le 0$, it raises constraint violations.
* **Server-Side Calculations:** The `amount` column in collections is calculated BEFORE INSERT via database trigger: `NEW.amount := NEW.quantity * NEW.rate`.
* **Change Auditing Trail:** Updating collection payment status writes a new record to `payment_history`, maintaining a log of settlements.

---

## Installation & Local Execution

### Prerequisites
* Node.js v22+ and npm v11+ installed.

### Root-Level Execution (Recommended)
You can run and manage the applications directly from the root workspace directory without navigating inside the folders:

* **Run both frontend and backend concurrently:**
  ```bash
  npm run dev
  ```
* **Run backend only:**
  ```bash
  npm run dev:backend
  ```
* **Run frontend only:**
  ```bash
  npm run dev:frontend
  ```
* **Build frontend:**
  ```bash
  npm run build:frontend
  ```

### Manual Individual Setup

#### 1. Backend Setup
1. Navigate to the `backend` directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Start the Express server:
   ```bash
   npm run dev
   ```

#### 2. Frontend Setup
1. Navigate to the `frontend` directory and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Initialize the environment configuration:
   * Rename `.env.example` to `.env`
   * To test local mockup storage fallback immediately, keep the default environment placeholders intact.
   * To connect to your live Supabase project, replace the credentials:
     ```env
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```
3. Start the Vite local server:
   ```bash
   npm run dev
   ```
4. Log in with the operator credentials:
   * **Username:** `operator`
   * **Password:** `admin123`

### 2. Live Supabase Database Setup
To deploy to a live Supabase project, execute the following SQL scripts in the Supabase **SQL Editor** in order:
1. Run `backend/database/schema.sql` (Creates tables and indexes)
2. Run `backend/database/functions.sql` (Deploys calculation triggers and constraints)
3. Run `backend/database/views.sql` (Creates detailed query views)
4. Run `backend/database/policies.sql` (Enables Row-Level Security)
5. Run `backend/database/seed.sql` (Populates initial test farmers and crops)

---

## QA Verification and Testing
Visit the **Testing Center** directly via the `/testing` route URL in the application to execute verification scenarios (hidden from the production sidebar navigation):
* **Valid Insert Test:** Confirms normal collection entries save and trigger server-side totals calculations.
* **Invalid Input Constraint Tests:** Confirms database rejects negative quantities, negative rates, or nonexistent farmers, returning the exact error code (e.g. `23514` for check constraint violation).
* **AI NLP normalization Test:** Normalizes inputs to match assistant intents.
* **Math audit check:** Matches manual client calculations ($Qty \times Rate$) against server values to check float precision.

---

## License
MIT License. Created for the SIH 2026 Practical Assessment.
