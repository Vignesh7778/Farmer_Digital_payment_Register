import { supabase } from './supabase';

// Check if valid Supabase URL is provided
const isRealSupabase = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && !url.includes('placeholder') && !url.includes('your-project-id');
};

// Initial Seed Data for Local Storage Mock Fallback
const DEFAULT_FARMERS = [
  { id: 'f1111111-1111-1111-1111-111111111111', name: 'Ravi Chandran', phone: '9876543210', village: 'Melur', created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'f2222222-2222-2222-2222-222222222222', name: 'Kumar Swamy', phone: '8765432109', village: 'Alanganallur', created_at: new Date(Date.now() - 9 * 86400000).toISOString() },
  { id: 'f3333333-3333-3333-3333-333333333333', name: 'Selvam Muthu', phone: '7654321098', village: 'Sholavandan', created_at: new Date(Date.now() - 8 * 86400000).toISOString() },
  { id: 'f4444444-4444-4444-4444-444444444444', name: 'Rajesh K', phone: '6543210987', village: 'Othakadai', created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
];

const DEFAULT_PRODUCE = [
  { id: 'a1111111-1111-1111-1111-111111111111', name: 'Tomato', unit: 'kg', created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'a2222222-2222-2222-2222-222222222222', name: 'Banana', unit: 'bunch', created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'a3333333-3333-3333-3333-333333333333', name: 'Milk', unit: 'liter', created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'a4444444-4444-4444-4444-444444444444', name: 'Mango', unit: 'kg', created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'a5555555-5555-5555-5555-555555555555', name: 'Coconut', unit: 'piece', created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
];

const DEFAULT_COLLECTIONS = [
  { id: 'c1111111-1111-1111-1111-111111111111', farmer_id: 'f1111111-1111-1111-1111-111111111111', produce_id: 'a1111111-1111-1111-1111-111111111111', quantity: 120.00, rate: 20.00, amount: 2400.00, collection_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'c2222222-2222-2222-2222-222222222222', farmer_id: 'f1111111-1111-1111-1111-111111111111', produce_id: 'a2222222-2222-2222-2222-222222222222', quantity: 45.00, rate: 8.00, amount: 360.00, collection_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'c3333333-3333-3333-3333-333333333333', farmer_id: 'f2222222-2222-2222-2222-222222222222', produce_id: 'a3333333-3333-3333-3333-333333333333', quantity: 80.00, rate: 35.00, amount: 2800.00, collection_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'c4444444-4444-4444-4444-444444444444', farmer_id: 'f3333333-3333-3333-3333-333333333333', produce_id: 'a1111111-1111-1111-1111-111111111111', quantity: 200.00, rate: 18.50, amount: 3700.00, collection_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 'c5555555-5555-5555-5555-555555555555', farmer_id: 'f2222222-2222-2222-2222-222222222222', produce_id: 'a2222222-2222-2222-2222-222222222222', quantity: 15.00, rate: 10.00, amount: 150.00, collection_date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString() },
  { id: 'c6666666-6666-6666-6666-666666666666', farmer_id: 'f4444444-4444-4444-4444-444444444444', produce_id: 'a4444444-4444-4444-4444-444444444444', quantity: 350.00, rate: 50.00, amount: 17500.00, collection_date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString() },
];

const DEFAULT_PAYMENTS = [
  { id: 'h1', collection_id: 'c1111111-1111-1111-1111-111111111111', status: 'Paid', paid_date: new Date(Date.now() - 1 * 86400000).toISOString(), remarks: 'Receipt verified, cash handed over to farmer.', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'h2', collection_id: 'c2222222-2222-2222-2222-222222222222', status: 'Pending', paid_date: null, remarks: 'Initial system collection invoice logged.', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'h3', collection_id: 'c3333333-3333-3333-3333-333333333333', status: 'Paid', paid_date: new Date(Date.now() - 1 * 86400000).toISOString(), remarks: 'Receipt verified, cash handed over to farmer.', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'h4', collection_id: 'c4444444-4444-4444-4444-444444444444', status: 'Pending', paid_date: null, remarks: 'Initial system collection invoice logged.', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 'h5', collection_id: 'c5555555-5555-5555-5555-555555555555', status: 'Pending', paid_date: null, remarks: 'Initial system collection invoice logged.', created_at: new Date().toISOString() },
  { id: 'h6', collection_id: 'c6666666-6666-6666-6666-666666666666', status: 'Pending', paid_date: null, remarks: 'Initial system collection invoice logged.', created_at: new Date().toISOString() },
];

// Helper to initialize local storage
const initLocalStorage = () => {
  if (!localStorage.getItem('fpg_farmers')) {
    localStorage.setItem('fpg_farmers', JSON.stringify(DEFAULT_FARMERS));
  }
  if (!localStorage.getItem('fpg_produce')) {
    localStorage.setItem('fpg_produce', JSON.stringify(DEFAULT_PRODUCE));
  }
  if (!localStorage.getItem('fpg_collections')) {
    localStorage.setItem('fpg_collections', JSON.stringify(DEFAULT_COLLECTIONS));
  }
  if (!localStorage.getItem('fpg_payment_history')) {
    localStorage.setItem('fpg_payment_history', JSON.stringify(DEFAULT_PAYMENTS));
  }
};

initLocalStorage();

// Local Storage CRUD helpers simulating Supabase Database Constraints and Server Calculations
const getLocalData = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setLocalData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export const db = {
  // --- Farmers ---
  async getFarmers() {
    if (isRealSupabase()) {
      const { data, error } = await supabase.from('farmers').select('*').order('name');
      if (error) throw error;
      return data;
    }
    return getLocalData('fpg_farmers').sort((a, b) => a.name.localeCompare(b.name));
  },

  async addFarmer(farmer) {
    if (!farmer.name || !farmer.phone || !farmer.village) {
      throw { message: 'All fields are required.', code: '23502' };
    }

    if (isRealSupabase()) {
      const { data, error } = await supabase.from('farmers').insert([farmer]).select();
      if (error) throw error;
      return data[0];
    }

    const farmers = getLocalData('fpg_farmers');
    if (farmers.some(f => f.phone === farmer.phone)) {
      throw { message: `Key (phone)=(${farmer.phone}) already exists.`, code: '23505' }; // Unique violation
    }

    const newFarmer = {
      id: crypto.randomUUID(),
      ...farmer,
      created_at: new Date().toISOString(),
    };
    farmers.push(newFarmer);
    setLocalData('fpg_farmers', farmers);
    return newFarmer;
  },

  async updateFarmer(id, updatedFields) {
    if (isRealSupabase()) {
      const { data, error } = await supabase.from('farmers').update(updatedFields).eq('id', id).select();
      if (error) throw error;
      return data[0];
    }

    const farmers = getLocalData('fpg_farmers');
    const index = farmers.findIndex(f => f.id === id);
    if (index === -1) throw { message: 'Farmer not found' };

    // Check unique phone rule
    if (updatedFields.phone && farmers.some(f => f.phone === updatedFields.phone && f.id !== id)) {
      throw { message: `Key (phone)=(${updatedFields.phone}) already exists.`, code: '23505' };
    }

    farmers[index] = { ...farmers[index], ...updatedFields };
    setLocalData('fpg_farmers', farmers);
    return farmers[index];
  },

  async deleteFarmer(id) {
    if (isRealSupabase()) {
      const { error } = await supabase.from('farmers').delete().eq('id', id);
      if (error) throw error;
      return true;
    }

    const farmers = getLocalData('fpg_farmers');
    const filtered = farmers.filter(f => f.id !== id);
    setLocalData('fpg_farmers', filtered);

    // Cascade delete collections
    const collections = getLocalData('fpg_collections');
    const remainCols = collections.filter(c => c.farmer_id !== id);
    setLocalData('fpg_collections', remainCols);
    return true;
  },

  // --- Produce ---
  async getProduce() {
    if (isRealSupabase()) {
      const { data, error } = await supabase.from('produce').select('*').order('name');
      if (error) throw error;
      return data;
    }
    return getLocalData('fpg_produce').sort((a, b) => a.name.localeCompare(b.name));
  },

  async addProduce(item) {
    if (!item.name || !item.unit) {
      throw { message: 'Crop Name and Unit are required.', code: '23502' };
    }

    if (isRealSupabase()) {
      const { data, error } = await supabase.from('produce').insert([item]).select();
      if (error) throw error;
      return data[0];
    }

    const list = getLocalData('fpg_produce');
    if (list.some(p => p.name.toLowerCase() === item.name.toLowerCase())) {
      throw { message: `Crop (${item.name}) already exists.`, code: '23505' };
    }

    const newItem = {
      id: crypto.randomUUID(),
      ...item,
      created_at: new Date().toISOString(),
    };
    list.push(newItem);
    setLocalData('fpg_produce', list);
    return newItem;
  },

  async deleteProduce(id) {
    if (isRealSupabase()) {
      const { error } = await supabase.from('produce').delete().eq('id', id);
      if (error) throw error;
      return true;
    }

    // Check if produce is used in collections
    const collections = getLocalData('fpg_collections');
    if (collections.some(c => c.produce_id === id)) {
      throw { message: 'Foreign key violation: Crop is in use in collection logs.', code: '23503' };
    }

    const list = getLocalData('fpg_produce');
    setLocalData('fpg_produce', list.filter(p => p.id !== id));
    return true;
  },

  // --- Collections & Details ---
  async getCollections() {
    if (isRealSupabase()) {
      const { data, error } = await supabase.from('collections_detailed').select('*').order('collection_created_at', { ascending: false });
      if (error) throw error;
      return data.map(col => {
        const balance = Number(col.balance_pending || 0);
        const status = col.payment_status === 'Partially Paid' && balance <= 0 ? 'Paid' : col.payment_status;
        return {
          ...col,
          quantity: Number(col.quantity),
          rate: Number(col.rate),
          amount: Number(col.amount),
          amount_paid: Number(col.amount_paid || 0),
          balance_pending: balance,
          payment_status: status
        };
      });
    }

    // Join local storage tables to mock the 'collections_detailed' view
    const collections = getLocalData('fpg_collections');
    const farmers = getLocalData('fpg_farmers');
    const produce = getLocalData('fpg_produce');
    const history = getLocalData('fpg_payment_history');

    return collections.map(c => {
      const farmer = farmers.find(f => f.id === c.farmer_id) || {};
      const crop = produce.find(p => p.id === c.produce_id) || {};
      
      // Get latest payment status
      const phList = history
        .filter(h => h.collection_id === c.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const latestPayment = phList[0] || { status: 'Pending', paid_date: null, remarks: 'Initial status', amount_paid: 0.00, balance_pending: Number(c.amount) };

      const balance = Number(latestPayment.balance_pending !== undefined ? latestPayment.balance_pending : c.amount);
      const status = latestPayment.status === 'Partially Paid' && balance <= 0 ? 'Paid' : latestPayment.status;

      return {
        collection_id: c.id,
        farmer_id: c.farmer_id,
        farmer_name: farmer.name || 'Unknown Farmer',
        farmer_phone: farmer.phone || '',
        farmer_village: farmer.village || '',
        produce_id: c.produce_id,
        produce_name: crop.name || 'Unknown Crop',
        produce_unit: crop.unit || 'units',
        quantity: Number(c.quantity),
        rate: Number(c.rate),
        amount: Number(c.amount),
        collection_date: c.collection_date,
        collection_created_at: c.created_at,
        payment_status: status,
        payment_paid_date: latestPayment.paid_date,
        payment_remarks: latestPayment.remarks,
        payment_history_id: latestPayment.id,
        amount_paid: Number(latestPayment.amount_paid || 0),
        balance_pending: balance
      };
    }).sort((a, b) => new Date(b.collection_created_at) - new Date(a.collection_created_at));
  },

  async addCollection(entry) {
    const qty = Number(entry.quantity);
    const rate = Number(entry.rate);

    // SERVER-SIDE VALIDATION triggers check simulation
    if (qty <= 0) {
      throw { message: 'Quantity must be a positive number greater than zero.', code: '23514' };
    }
    if (rate <= 0) {
      throw { message: 'Rate must be a positive number greater than zero.', code: '23514' };
    }
    if (!entry.farmer_id) {
      throw { message: 'Farmer reference is required.', code: '23502' };
    }
    if (!entry.produce_id) {
      throw { message: 'Produce reference is required.', code: '23502' };
    }

    if (isRealSupabase()) {
      // Trigger calculates amount automatically
      const { data, error } = await supabase.from('collections').insert([{
        farmer_id: entry.farmer_id,
        produce_id: entry.produce_id,
        quantity: qty,
        rate: rate,
        collection_date: entry.collection_date || new Date().toISOString().split('T')[0],
      }]).select();
      if (error) throw error;
      return data[0];
    }

    // Verify foreign key integrity local mock
    const farmers = getLocalData('fpg_farmers');
    const produce = getLocalData('fpg_produce');
    if (!farmers.some(f => f.id === entry.farmer_id)) {
      throw { message: 'Foreign key violation: Referencing farmer does not exist.', code: '23503' };
    }
    if (!produce.some(p => p.id === entry.produce_id)) {
      throw { message: 'Foreign key violation: Referencing produce crop does not exist.', code: '23503' };
    }

    const collections = getLocalData('fpg_collections');
    const newCol = {
      id: crypto.randomUUID(),
      farmer_id: entry.farmer_id,
      produce_id: entry.produce_id,
      quantity: qty,
      rate: rate,
      amount: qty * rate, // TRIGGER CALCULATION
      collection_date: entry.collection_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    collections.push(newCol);
    setLocalData('fpg_collections', collections);

    // Trigger after insertion payment history auto-log
    const history = getLocalData('fpg_payment_history');
    history.push({
      id: crypto.randomUUID(),
      collection_id: newCol.id,
      status: 'Pending',
      paid_date: null,
      remarks: 'Initial system collection invoice logged.',
      created_at: new Date().toISOString(),
    });
    setLocalData('fpg_payment_history', history);

    return newCol;
  },

  async deleteCollection(id) {
    if (isRealSupabase()) {
      const { error } = await supabase.from('collections').delete().eq('id', id);
      if (error) throw error;
      return true;
    }

    const collections = getLocalData('fpg_collections');
    setLocalData('fpg_collections', collections.filter(c => c.id !== id));

    const history = getLocalData('fpg_payment_history');
    setLocalData('fpg_payment_history', history.filter(h => h.collection_id !== id));
    return true;
  },

  // --- Payment History ---
  async updatePaymentStatus(collectionId, status, remarks, amountPaid = 0, balancePending = 0) {
    if (!['Pending', 'Paid', 'Partially Paid'].includes(status)) {
      throw { message: 'Invalid payment status value.', code: '22018' };
    }

    if (isRealSupabase()) {
      const { data, error } = await supabase.from('payment_history').insert([{
        collection_id: collectionId,
        status: status,
        amount_paid: Number(amountPaid),
        balance_pending: Number(balancePending),
        paid_date: (status === 'Paid' || status === 'Partially Paid') ? new Date().toISOString() : null,
        remarks: remarks || 'Payment state manual audit update.',
      }]).select();
      if (error) throw error;
      return data[0];
    }

    const history = getLocalData('fpg_payment_history');
    const newStub = {
      id: crypto.randomUUID(),
      collection_id: collectionId,
      status: status,
      amount_paid: Number(amountPaid),
      balance_pending: Number(balancePending),
      paid_date: (status === 'Paid' || status === 'Partially Paid') ? new Date().toISOString() : null,
      remarks: remarks || 'Payment state manual audit update.',
      created_at: new Date().toISOString(),
    };

    history.push(newStub);
    setLocalData('fpg_payment_history', history);
    return newStub;
  },

  // --- Dashboard Stats ---
  async getDashboardStats(farmerId = null) {
    try {
      const farmers = await this.getFarmers();
      let collections = await this.getCollections();

      if (farmerId) {
        collections = collections.filter(item => item.farmer_id === farmerId);
      }

      const totalFarmers = farmerId ? 1 : farmers.length;
      const totalCollections = collections.length;
      
      const totalAmount = collections.reduce((sum, item) => sum + Number(item.amount), 0);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayCollections = collections.filter(item => item.collection_date === todayStr);
      const todayCount = todayCollections.length;
      const todaySum = todayCollections.reduce((sum, item) => sum + Number(item.amount), 0);

      const totalPaid = collections.reduce((sum, item) => sum + Number(item.amount_paid || 0), 0);
      const balancePending = collections.reduce((sum, item) => sum + Number(item.balance_pending || 0), 0);
      const totalQuantity = collections.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

      return {
        totalFarmers,
        totalCollections,
        totalAmount,
        todayCount,
        todaySum,
        totalPaid,
        balancePending,
        totalQuantity,
        recentCollections: collections.slice(0, 5),
      };
    } catch (err) {
      console.error('Error computing dashboard statistics', err);
      return {
        totalFarmers: 0,
        totalCollections: 0,
        totalAmount: 0,
        todayCount: 0,
        todaySum: 0,
        totalPaid: 0,
        balancePending: 0,
        totalQuantity: 0,
        recentCollections: [],
      };
    }
  },

  // --- Farmer Statements Summary ---
  async getFarmerStatements() {
    if (isRealSupabase()) {
      const { data, error } = await supabase.from('farmer_statements_summary').select('*');
      if (error) throw error;
      return data.map(fs => ({
        ...fs,
        total_deliveries: Number(fs.total_deliveries),
        total_quantity: Number(fs.total_quantity),
        total_amount: Number(fs.total_amount),
        total_paid: Number(fs.total_paid),
        total_pending: Number(fs.total_pending)
      }));
    }

    const farmers = await this.getFarmers();
    const collections = await this.getCollections();

    return farmers.map(f => {
      const fCols = collections.filter(c => c.farmer_id === f.id);
      const totalQuantity = fCols.reduce((sum, c) => sum + c.quantity, 0);
      const totalAmount = fCols.reduce((sum, c) => sum + c.amount, 0);
      const totalPaid = fCols.filter(c => c.payment_status === 'Paid').reduce((sum, c) => sum + c.amount, 0);
      const totalPending = fCols.filter(c => c.payment_status === 'Pending').reduce((sum, c) => sum + c.amount, 0);

      return {
        farmer_id: f.id,
        farmer_name: f.name,
        farmer_phone: f.phone,
        farmer_village: f.village,
        total_deliveries: fCols.length,
        total_quantity,
        total_amount,
        total_paid,
        total_pending,
      };
    });
  }
};
