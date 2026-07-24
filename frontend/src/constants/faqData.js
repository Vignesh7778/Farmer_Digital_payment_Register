export const faqData = [
  // Category 1: Farmers (1-20)
  {
    id: 1,
    category: 'Farmers',
    question: 'How do I register a new farmer?',
    answer: 'Go to the "Farmers" page on the sidebar, fill in the farmer\'s name, unique 10-digit phone number, and village name, then click "Add Farmer".'
  },
  {
    id: 2,
    category: 'Farmers',
    question: 'Can two farmers have the same phone number?',
    answer: 'No, each farmer registered must have a unique phone number to ensure correct statement accounting and identification.'
  },
  {
    id: 3,
    category: 'Farmers',
    question: 'How do I view a farmer\'s payment statements?',
    answer: 'Navigate to the "Statements" page on the sidebar, select the farmer\'s name from the dropdown list, and their statement history will display.'
  },
  {
    id: 4,
    category: 'Farmers',
    question: 'Where can I find a list of all registered villages?',
    answer: 'You can check the "Farmers" page list table or filter by villages under the "Collections" and "Statements" pages.'
  },
  {
    id: 5,
    category: 'Farmers',
    question: 'How can I search for a farmer in the system?',
    answer: 'Use the search bar at the top of the "Farmers" table to look them up instantly by name, phone number, or village.'
  },
  {
    id: 6,
    category: 'Farmers',
    question: 'How do I edit a farmer\'s details?',
    answer: 'Currently, farmer details can be managed by clicking on the respective row options in the "Farmers" management tab.'
  },
  {
    id: 7,
    category: 'Farmers',
    question: 'What happens if I delete a farmer?',
    answer: 'Deleting a farmer is restricted if they have existing delivery collections linked to their profile to maintain database consistency.'
  },
  {
    id: 8,
    category: 'Farmers',
    question: 'Can I filter farmers by their village?',
    answer: 'Yes, you can filter delivery registers and statements by village using the village filter dropdown menus.'
  },
  {
    id: 9,
    category: 'Farmers',
    question: 'How do I see total earnings for a specific farmer?',
    answer: 'Go to "Statements", select the farmer, and the page will display their Total Owed, Total Paid, and Balance Pending.'
  },
  {
    id: 10,
    category: 'Farmers',
    question: 'How is a farmer\'s outstanding balance calculated?',
    answer: 'A farmer\'s outstanding balance is the sum of all their collection amounts minus all payments made to them.'
  },
  {
    id: 11,
    category: 'Farmers',
    question: 'How do I download a statement for a single farmer?',
    answer: 'Select the farmer in the "Statements" screen and print or use your browser\'s print-to-PDF option to save a statement receipt.'
  },
  {
    id: 12,
    category: 'Farmers',
    question: 'What are the main details stored for a farmer?',
    answer: 'We store the farmer\'s Full Name, Mobile Phone Number, Village Name, and Registration Date.'
  },
  {
    id: 13,
    category: 'Farmers',
    question: 'Can I import farmers from an Excel list?',
    answer: 'Currently, farmers must be added individually through the "Add Farmer" form in the interface.'
  },
  {
    id: 14,
    category: 'Farmers',
    question: 'Why is a farmer not showing up in the Collections dropdown?',
    answer: 'Only successfully registered farmers show up in the dropdown. Make sure they are added in the "Farmers" page first.'
  },
  {
    id: 15,
    category: 'Farmers',
    question: 'How do I correct a typo in a farmer\'s name?',
    answer: 'You can update their profile in the database or register them again with the correct name and unique phone number.'
  },
  {
    id: 16,
    category: 'Farmers',
    question: 'What if a farmer does not have a phone number?',
    answer: 'You can register them using a relative\'s phone number or a temporary 10-digit number since the field is required.'
  },
  {
    id: 17,
    category: 'Farmers',
    question: 'How do I view a farmer\'s registration date?',
    answer: 'Go to the "Farmers" page; the table displays the exact date the member was enrolled.'
  },
  {
    id: 18,
    category: 'Farmers',
    question: 'Are inactive farmers kept in the database?',
    answer: 'Yes, all farmer histories are preserved to ensure audit reports remain accurate across seasons.'
  },
  {
    id: 19,
    category: 'Farmers',
    question: 'How many farmers can I register in the database?',
    answer: 'The system has no limit; it supports thousands of farmers registered on the Supabase database.'
  },
  {
    id: 20,
    category: 'Farmers',
    question: 'Who should I contact if a farmer account is locked?',
    answer: 'Contact your administrator or FPG officer to verify credentials or resolve database entry locks.'
  },

  // Category 2: Produce & Crops (21-40)
  {
    id: 21,
    category: 'Produce & Crops',
    question: 'How do I add a new crop or produce type?',
    answer: 'Go to the "Produce" tab in the sidebar, type the crop name (e.g., Papaya) and select its unit (e.g., kg), then click "Add Crop".'
  },
  {
    id: 22,
    category: 'Produce & Crops',
    question: 'What units of measure are supported for produce?',
    answer: 'We support kilograms (kg), liters (liter), and bunches (bunch) for various produce types.'
  },
  {
    id: 23,
    category: 'Produce & Crops',
    question: 'How do I set the rate for a crop?',
    answer: 'Rates are entered dynamically when recording a delivery collection, allowing flexibility for market price fluctuations.'
  },
  {
    id: 24,
    category: 'Produce & Crops',
    question: 'Can I delete a crop from the register?',
    answer: 'You can delete a crop from the "Produce" page if there are no existing collection deliveries linked to that crop type.'
  },
  {
    id: 25,
    category: 'Produce & Crops',
    question: 'How do I check all registered crops?',
    answer: 'Go to the "Produce" page in the sidebar to view the table of all active crop types and their units.'
  },
  {
    id: 26,
    category: 'Produce & Crops',
    question: 'What is the default unit for Milk?',
    answer: 'The default unit of measure for Milk in our register is "liter".'
  },
  {
    id: 27,
    category: 'Produce & Crops',
    question: 'What is the default unit for Banana?',
    answer: 'The default unit of measure for Bananas in our register is "bunch".'
  },
  {
    id: 28,
    category: 'Produce & Crops',
    question: 'What is the default unit for Tomato?',
    answer: 'The default unit of measure for Tomatoes is "kg" (kilogram).'
  },
  {
    id: 29,
    category: 'Produce & Crops',
    question: 'Can I change a crop\'s unit of measure after adding it?',
    answer: 'Units are fixed once created to prevent historical data corruption. If needed, create a new crop with the correct unit.'
  },
  {
    id: 30,
    category: 'Produce & Crops',
    question: 'Can we configure minimum and maximum rates?',
    answer: 'Rate validation requires the rate to be greater than zero. Maximum bounds are handled by operational guidelines.'
  },
  {
    id: 31,
    category: 'Produce & Crops',
    question: 'How do I add a new unit type?',
    answer: 'Units are standardized (kg, liter, bunch) in the dropdown to keep reporting uniform across the cooperative.'
  },
  {
    id: 32,
    category: 'Produce & Crops',
    question: 'Why is my crop not showing in the Collection register?',
    answer: 'Ensure that you have clicked "Add Crop" on the "Produce" page first so it becomes registered in the database dropdown.'
  },
  {
    id: 33,
    category: 'Produce & Crops',
    question: 'Does the system track different grades of the same crop?',
    answer: 'To track grades, add them as distinct crop names, e.g., "Tomato Grade A" and "Tomato Grade B".'
  },
  {
    id: 34,
    category: 'Produce & Crops',
    question: 'How do I search for a specific crop?',
    answer: 'On the "Produce" page, use the search box to filter crops by name or unit type instantly.'
  },
  {
    id: 35,
    category: 'Produce & Crops',
    question: 'Are crop names case-sensitive?',
    answer: 'No, crop names are converted to a standard format, but it is best to avoid duplicate names.'
  },
  {
    id: 36,
    category: 'Produce & Crops',
    question: 'Who manages the crop registry list?',
    answer: 'Any logged-in operator or administrator can add new produce types to the system.'
  },
  {
    id: 37,
    category: 'Produce & Crops',
    question: 'Can I view the total volume collected for each crop?',
    answer: 'Yes, the "Dashboard" displays crop-wise collection counts and stats for all registered produce.'
  },
  {
    id: 38,
    category: 'Produce & Crops',
    question: 'How do I update the unit of a crop?',
    answer: 'Delete the crop (if unused) and re-add it with the correct unit from the "Produce" menu.'
  },
  {
    id: 39,
    category: 'Produce & Crops',
    question: 'Is there a limit on how many crops I can register?',
    answer: 'No, there is no limit; you can add as many fruits, vegetables, and dairy types as required.'
  },
  {
    id: 40,
    category: 'Produce & Crops',
    question: 'How are crops sorted in the registry table?',
    answer: 'Cops are sorted alphabetically by default, making it easy to find items.'
  },

  // Category 3: Collections (41-60)
  {
    id: 41,
    category: 'Collections',
    question: 'How do I record a new produce delivery?',
    answer: 'Go to "Collections", fill out the form (select Farmer, select Crop, input Quantity, and input Rate), check the Live Preview, then click "Record Collection".'
  },
  {
    id: 42,
    category: 'Collections',
    question: 'How is the total collection amount calculated?',
    answer: 'The system automatically multiplies the Delivery Quantity by the Rate (₹/unit) to compute the total value.'
  },
  {
    id: 43,
    category: 'Collections',
    question: 'What is the Live Preview field?',
    answer: 'It is a real-time calculation helper that shows you the exact total amount (₹) as you type in the quantity and rate fields.'
  },
  {
    id: 44,
    category: 'Collections',
    question: 'Can I record a collection for a past date?',
    answer: 'Yes, you can modify the date field in the collection form to record deliveries for previous days.'
  },
  {
    id: 45,
    category: 'Collections',
    question: 'How do I search the delivery list?',
    answer: 'Use the text search bar on the "Collections" page to search by farmer name, phone number, crop, or village.'
  },
  {
    id: 46,
    category: 'Collections',
    question: 'Can I filter deliveries by farmer name?',
    answer: 'Yes, select a farmer from the "Farmer Filter" dropdown on the collections screen to display only their records.'
  },
  {
    id: 47,
    category: 'Collections',
    question: 'Can I filter deliveries by crop type?',
    answer: 'Yes, use the "Produce Filter" dropdown at the top of the collections table to view specific crops.'
  },
  {
    id: 48,
    category: 'Collections',
    question: 'What are the sorting options for collections?',
    answer: 'You can sort collections by: Attention Needed, Newest, Oldest, Highest Amount, and Lowest Amount.'
  },
  {
    id: 49,
    category: 'Collections',
    question: 'What does "Attention Needed" sort order do?',
    answer: 'It prioritizes older collections that are still in "Pending" or "Partially Paid" status so they can be settled first.'
  },
  {
    id: 50,
    category: 'Collections',
    question: 'How do I delete an incorrect collection entry?',
    answer: 'Currently, incorrect records can be deleted from the database table or marked as zero value by editing them.'
  },
  {
    id: 51,
    category: 'Collections',
    question: 'What is the default date for a new collection?',
    answer: 'The collection date defaults to the current local date (today) in the form.'
  },
  {
    id: 52,
    category: 'Collections',
    question: 'Can I enter a decimal value for quantity?',
    answer: 'Yes, the quantity field accepts decimal values (e.g. 15.5 kg or 80.5 liters) for high accuracy.'
  },
  {
    id: 53,
    category: 'Collections',
    question: 'Can I enter a decimal value for the rate?',
    answer: 'Yes, rate values can include decimals (e.g., ₹18.50 per kg).'
  },
  {
    id: 54,
    category: 'Collections',
    question: 'Where can I see the unit of the selected crop in the form?',
    answer: 'The system dynamically displays the unit (e.g., kg, bunches, liters) next to the quantity label once a crop is selected.'
  },
  {
    id: 55,
    category: 'Collections',
    question: 'What happens immediately after saving a collection?',
    answer: 'The record is stored in Supabase, and the collections table, dashboard statistics, and statements are updated instantly.'
  },
  {
    id: 56,
    category: 'Collections',
    question: 'Can I record collections when offline?',
    answer: 'If the server is unavailable, the application stores data locally in the browser\'s LocalStorage and syncs when online.'
  },
  {
    id: 57,
    category: 'Collections',
    question: 'How do I verify if a collection was successfully recorded?',
    answer: 'A green toast notification will confirm success, and the new collection will appear at the top of the collections table.'
  },
  {
    id: 58,
    category: 'Collections',
    question: 'Are collection amounts rounded?',
    answer: 'No, amounts are calculated using precise decimal math, though the UI formats values to 2 decimal places for display.'
  },
  {
    id: 59,
    category: 'Collections',
    question: 'Can I add remarks when recording a new delivery?',
    answer: 'Remarks are added during the payment settlement phase to note bank IDs, signatures, or cash receipt references.'
  },
  {
    id: 60,
    category: 'Collections',
    question: 'How do I see who registered a collection?',
    answer: 'All logs are tied to the active Operator session that recorded the transactions.'
  },

  // Category 4: Payments & Settlements (61-80)
  {
    id: 61,
    category: 'Payments',
    question: 'How do I settle a payment for a crop delivery?',
    answer: 'Click the "Settle" button on a collection row, select the payment status (Paid, Partially Paid), enter any installment info, and click "Save".'
  },
  {
    id: 62,
    category: 'Payments',
    question: 'What are the three payment statuses?',
    answer: 'The three available statuses are: "Pending" (no payment yet), "Partially Paid" (installment paid), and "Paid" (fully paid).'
  },
  {
    id: 63,
    category: 'Payments',
    question: 'How do I record a partial payment?',
    answer: 'Click "Settle", select "Partially Paid", input the amount paid now, review the calculated pending balance, and click "Save".'
  },
  {
    id: 64,
    category: 'Payments',
    question: 'What happens to a previous payment amount when adding a new partial payment?',
    answer: 'Previously paid amounts are locked. The modal shows the "Previously Settled" sum, and you only enter the additional amount paid now.'
  },
  {
    id: 65,
    category: 'Payments',
    question: 'Can I pay more than the outstanding balance?',
    answer: 'No, the interface validates input to prevent entering an installment amount greater than the current outstanding balance.'
  },
  {
    id: 66,
    category: 'Payments',
    question: 'What happens when the outstanding balance reaches zero?',
    answer: 'The system automatically promotes the collection status to "Paid", hides the "Settle" button, and marks it as fully settled.'
  },
  {
    id: 67,
    category: 'Payments',
    question: 'Can I change a Paid status back to Pending?',
    answer: 'Once a collection is fully paid, the "Settle" button is hidden to lock the record from accidental modification.'
  },
  {
    id: 68,
    category: 'Payments',
    question: 'Where can I see the historical payment audits?',
    answer: 'Each partial payment creates an audit trail entry in the database containing timestamps and operator remarks.'
  },
  {
    id: 69,
    category: 'Payments',
    question: 'Can I add remarks for a payment?',
    answer: 'Yes, when settling, you can type bank IDs, cash receipt numbers, or details in the "Auditing Remarks" text area.'
  },
  {
    id: 70,
    category: 'Payments',
    question: 'Does the system support cash and bank transfers?',
    answer: 'Yes, you can note the method (e.g. "Bank Ref: TXN12345" or "Cash hand-off") in the auditing remarks field.'
  },
  {
    id: 71,
    category: 'Payments',
    question: 'How do I know if a collection is partially paid?',
    answer: 'The row will display an orange "Partially Paid" badge along with subtext showing the amount paid so far and the remaining balance.'
  },
  {
    id: 72,
    category: 'Payments',
    question: 'What badge represents a pending payment?',
    answer: 'Pending payments are marked by a red "Pending" badge, showing that no money has been distributed yet.'
  },
  {
    id: 73,
    category: 'Payments',
    question: 'What badge represents a fully settled payment?',
    answer: 'Fully settled payments are represented by a green "Paid" badge and a grey checkmark "Settled" action status.'
  },
  {
    id: 74,
    category: 'Payments',
    question: 'Are payments synced to Supabase instantly?',
    answer: 'Yes, clicking "Save Settlement" triggers an immediate update to the database and recalculates all views.'
  },
  {
    id: 75,
    category: 'Payments',
    question: 'What if a mistake was made during payment recording?',
    answer: 'Contact the database administrator to update the `payment_history` table values if a locked record needs correction.'
  },
  {
    id: 76,
    category: 'Payments',
    question: 'Does the system calculate farmer balance statements dynamically?',
    answer: 'Yes, the database views calculate farmer balances on the fly by subtracting total paid from total delivery values.'
  },
  {
    id: 77,
    category: 'Payments',
    question: 'Can I pay multiple deliveries at once?',
    answer: 'Deliveries must be settled individually to maintain a strict audit trail for each load received.'
  },
  {
    id: 78,
    category: 'Payments',
    question: 'Where can I see the date a payment was settled?',
    answer: 'Fully and partially paid records display their respective payment dates in the farmer statements report.'
  },
  {
    id: 79,
    category: 'Payments',
    question: 'Does changing the status recalculate the dashboard?',
    answer: 'Yes, the dashboard stats query is invalidated and reloaded instantly to show updated metrics.'
  },
  {
    id: 80,
    category: 'Payments',
    question: 'Are auditing remarks required?',
    answer: 'Remarks are optional but highly recommended to verify transactions during cooperative audits.'
  },

  // Category 5: Reports, Statements, & Help (81-100)
  {
    id: 81,
    category: 'Reports & Help',
    question: 'How do I download an Excel or CSV report?',
    answer: 'Go to "Collections", select a start and end date in the header export panel, then click the "Export CSV" button.'
  },
  {
    id: 82,
    category: 'Reports & Help',
    question: 'Can I filter the Excel report by date range?',
    answer: 'Yes, the export panel filters the collections to include only records falling between your chosen start and end dates.'
  },
  {
    id: 83,
    category: 'Reports & Help',
    question: 'What fields are included in the CSV report?',
    answer: 'The CSV includes: Collection ID, Date, Farmer Name, Phone, Village, Crop, Quantity, Unit, Rate, Total Amount, Status, Amount Paid, and Balance Pending.'
  },
  {
    id: 84,
    category: 'Reports & Help',
    question: 'How do I view cooperative metrics?',
    answer: 'Visit the "Dashboard" page to view Total Deliveries, Outstanding Payouts, Total Farmers, Active Crops, and crop-wise stats.'
  },
  {
    id: 85,
    category: 'Reports & Help',
    question: 'How do I print a farmer\'s payment summary?',
    answer: 'Go to the "Statements" page, select the farmer, and use your browser\'s Print function (Ctrl+P or Cmd+P) for a clean format.'
  },
  {
    id: 86,
    category: 'Reports & Help',
    question: 'What is the Dashboard outstanding payout card?',
    answer: 'It displays the total amount FPG currently owes to all farmers for all pending and partially paid produce deliveries.'
  },
  {
    id: 87,
    category: 'Reports & Help',
    question: 'Where can I see the system logs?',
    answer: 'The application maintains database-level triggers and local storage logs to record and track all edits.'
  },
  {
    id: 88,
    category: 'Reports & Help',
    question: 'Can I run the application on a mobile phone?',
    answer: 'Yes, the interface is fully responsive and optimized to run on smartphones, tablets, laptops, and desktop computers.'
  },
  {
    id: 89,
    category: 'Reports & Help',
    question: 'How do I log out of the operator session?',
    answer: 'Click the "Log Out" button at the bottom of the sidebar navigation panel to end your active session safely.'
  },
  {
    id: 90,
    category: 'Reports & Help',
    question: 'Is the data saved securely?',
    answer: 'Yes, all information is sent over SSL to your secure Supabase PostgreSQL instance protected by row-level policies.'
  },
  {
    id: 91,
    category: 'Reports & Help',
    question: 'Why does the dashboard show zero values?',
    answer: 'This happens if no collections have been recorded yet or if your database connection settings are incorrect.'
  },
  {
    id: 92,
    category: 'Reports & Help',
    question: 'What should I do if the app shows a database error?',
    answer: 'Check your internet connection, ensure your Supabase connection string is valid, and check that credentials are correct.'
  },
  {
    id: 93,
    category: 'Reports & Help',
    question: 'How do I reset my login password?',
    answer: 'Contact the system administrator to update the user table credentials securely.'
  },
  {
    id: 94,
    category: 'Reports & Help',
    question: 'Can I use this app in multiple languages?',
    answer: 'The current version is in English, but the interface supports translation updates easily.'
  },
  {
    id: 95,
    category: 'Reports & Help',
    question: 'Where are the settings options stored?',
    answer: 'Database parameters are loaded from the environment `.env` file, and UI preferences are kept in local state.'
  },
  {
    id: 96,
    category: 'Reports & Help',
    question: 'Does the app save backup files?',
    answer: 'Yes, Supabase runs automated daily database backups, and you can export CSVs manually as local backups.'
  },
  {
    id: 97,
    category: 'Reports & Help',
    question: 'How is the total cooperative payout calculated?',
    answer: 'It is the sum of all payments recorded in the `payment_history` table.'
  },
  {
    id: 98,
    category: 'Reports & Help',
    question: 'How do I update registered produce details?',
    answer: 'Navigate to "Produce" to view crop codes and add new produce options.'
  },
  {
    id: 99,
    category: 'Reports & Help',
    question: 'How do I view the ER Diagram of the database?',
    answer: 'Check the `backend/database/ER_DIAGRAM.md` file in the workspace directory to understand the table relations.'
  },
  {
    id: 100,
    category: 'Reports & Help',
    question: 'What is the purpose of this register?',
    answer: 'It helps Farmer Producer Groups digitize crop deliveries, track payments transparently, and reduce paperwork.'
  }
];
