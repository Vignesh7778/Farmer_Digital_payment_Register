import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { db } from '../services/db';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
  Sprout,
  User,
  Plus,
  Scale,
  IndianRupee,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  History,
  TrendingUp,
  CreditCard,
  ChevronDown,
  X,
  Download
} from 'lucide-react';

export default function Collections() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isFarmer = user?.role === 'Farmer';

  const [searchTerm, setSearchTerm] = useState('');
  const [farmerFilter, setFarmerFilter] = useState(isFarmer ? user.id : '');
  const [produceFilter, setProduceFilter] = useState('');
  const [sortBy, setSortBy] = useState('attention'); // 'attention', 'newest', 'oldest', 'highest', 'lowest'

  // Security: Force filter to logged-in farmer account
  useEffect(() => {
    if (isFarmer && user?.id) {
      setFarmerFilter(user.id);
    }
  }, [isFarmer, user]);
  
  // Date range filters for CSV/Excel export
  const [exportStartDate, setExportStartDate] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  );
  const [exportEndDate, setExportEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const handleExportReport = () => {
    // Filter collections by date range
    const toExport = (collections || []).filter((col) => {
      const colDate = col.collection_date; // 'YYYY-MM-DD'
      return colDate >= exportStartDate && colDate <= exportEndDate;
    });

    if (toExport.length === 0) {
      toast.error('No collection records found in the selected date range.');
      return;
    }

    // Generate CSV content
    const headers = [
      'Collection ID',
      'Date',
      'Farmer Name',
      'Farmer Phone',
      'Farmer Village',
      'Produce Name',
      'Quantity',
      'Unit',
      'Rate (INR)',
      'Total Amount (INR)',
      'Payment Status',
      'Amount Paid (INR)',
      'Balance Pending (INR)',
      'Paid Date',
      'Remarks'
    ];

    const rows = toExport.map((col) => [
      col.collection_id,
      col.collection_date,
      col.farmer_name,
      col.farmer_phone,
      col.farmer_village,
      col.produce_name,
      col.quantity,
      col.produce_unit,
      col.rate,
      col.amount,
      col.payment_status,
      col.amount_paid,
      col.balance_pending,
      col.payment_paid_date ? formatDate(col.payment_paid_date) : 'N/A',
      col.payment_remarks || 'N/A'
    ]);

    // Build CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => {
        const valStr = String(val === null || val === undefined ? '' : val);
        if (valStr.includes(',') || valStr.includes('"') || valStr.includes('\n')) {
          return `"${valStr.replace(/"/g, '""')}"`;
        }
        return valStr;
      }).join(','))
    ].join('\n');

    // Trigger browser download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FPG_Produce_Report_${exportStartDate}_to_${exportEndDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Successfully exported ${toExport.length} records to CSV!`);
  };
  
  // Selected collection for payment modal
  const [updatingPayment, setUpdatingPayment] = useState(null);
  const { 
    register: payReg, 
    handleSubmit: handlePaySubmit, 
    reset: resetPay, 
    control: payControl,
    formState: { errors: payErrors } 
  } = useForm({
    defaultValues: {
      status: 'Pending',
      amount_paid: '',
      remarks: ''
    }
  });

  // Sync payment form values when selecting a collection
  useEffect(() => {
    if (updatingPayment) {
      resetPay({
        status: updatingPayment.payment_status || 'Pending',
        amount_paid: '', // Reset additional payment field on modal open
        remarks: updatingPayment.payment_remarks || ''
      });
    }
  }, [updatingPayment, resetPay]);

  // Collection form setup
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    defaultValues: {
      quantity: '',
      rate: '',
      collection_date: new Date().toISOString().split('T')[0]
    }
  });

  // Watch quantity and rate for real-time live preview calculation
  const qtyWatched = useWatch({ control, name: 'quantity' });
  const rateWatched = useWatch({ control, name: 'rate' });
  const livePreviewAmount = (Number(qtyWatched) || 0) * (Number(rateWatched) || 0);

  // Previous payment calculations
  const previousPaid = updatingPayment 
    ? (updatingPayment.payment_status === 'Partially Paid' ? Number(updatingPayment.amount_paid) : 0) 
    : 0;
  const currentBalance = updatingPayment 
    ? Number(updatingPayment.amount) - previousPaid 
    : 0;

  // Watch payment modal status and additional partial amount
  const watchedStatus = useWatch({ control: payControl, name: 'status', defaultValue: 'Pending' });
  const watchedAmountPaid = useWatch({ control: payControl, name: 'amount_paid', defaultValue: '' });
  
  // Calculate new pending balance: current balance minus what they are paying now
  const balancePending = updatingPayment 
    ? Math.max(0, currentBalance - (Number(watchedAmountPaid) || 0)) 
    : 0;

  // Queries
  const { data: farmers = [] } = useQuery({
    queryKey: ['farmers'],
    queryFn: () => db.getFarmers(),
  });

  const { data: produce = [] } = useQuery({
    queryKey: ['produce'],
    queryFn: () => db.getProduce(),
  });

  const { data: collections = [], isLoading, isError, error } = useQuery({
    queryKey: ['collections'],
    queryFn: () => db.getCollections(),
  });

  // Add Collection Mutation
  const addMutation = useMutation({
    mutationFn: (entry) => db.addCollection(entry),
    onSuccess: (savedCol) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['farmerStatements'] });
      
      // Highlight server calculation in success alert
      toast.success(
        <div>
          <span className="font-bold">Record Saved!</span>
          <br />
          Server Calculated Amount: <span className="text-emerald-400 font-bold">{formatCurrency(savedCol.amount)}</span>
        </div>,
        { duration: 5000 }
      );
      reset({
        farmer_id: '',
        produce_id: '',
        quantity: '',
        rate: '',
        collection_date: new Date().toISOString().split('T')[0]
      });
    },
    onError: (err) => {
      toast.error(err.message || 'Server calculation or validation rejected.');
    },
  });

  // Update Payment Mutation
  const updatePaymentMutation = useMutation({
    mutationFn: ({ collectionId, status, remarks, amountPaid, balancePending }) => 
      db.updatePaymentStatus(collectionId, status, remarks, amountPaid, balancePending),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['farmerStatements'] });
      toast.success('Payment status updated successfully!');
      setUpdatingPayment(null);
      resetPay();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update payment status');
    },
  });

  const onAddSubmit = (data) => {
    addMutation.mutate({
      farmer_id: data.farmer_id,
      produce_id: data.produce_id,
      quantity: data.quantity,
      rate: data.rate,
      collection_date: data.collection_date
    });
  };

  const onPaySubmit = (data) => {
    const isPartial = data.status === 'Partially Paid';
    const isPaid = data.status === 'Paid';
    
    // Additional amount paid in this installment
    const additionalPaid = isPaid 
      ? currentBalance 
      : isPartial 
      ? Number(data.amount_paid) || 0 
      : 0;
      
    // Total accumulated amount paid
    const amountPaid = previousPaid + additionalPaid;
    
    // Remaining balance pending
    const balancePending = Math.max(0, Number(updatingPayment.amount) - amountPaid);

    // If pending balance is fully paid (0), auto-promote status to 'Paid'
    const finalStatus = balancePending === 0 ? 'Paid' : data.status;

    updatePaymentMutation.mutate({
      collectionId: updatingPayment.collection_id,
      status: finalStatus,
      remarks: data.remarks,
      amountPaid,
      balancePending
    });
  };

  // Search & Filter & Sort Logic
  const filteredCollections = (collections || [])
    .filter((col) => {
      if (!col) return false;
      // Real-time Search
      const searchLower = searchTerm.toLowerCase();
      const fName = col.farmer_name || '';
      const fPhone = col.farmer_phone || '';
      const pName = col.produce_name || '';
      const fVillage = col.farmer_village || '';

      const matchesSearch = 
        fName.toLowerCase().includes(searchLower) ||
        fPhone.includes(searchLower) ||
        pName.toLowerCase().includes(searchLower) ||
        fVillage.toLowerCase().includes(searchLower);

      // Filters
      const matchesFarmer = farmerFilter ? col.farmer_id === farmerFilter : true;
      const matchesProduce = produceFilter ? col.produce_id === produceFilter : true;

      return matchesSearch && matchesFarmer && matchesProduce;
    })
    .sort((a, b) => {
      // Sorting Logic
      if (sortBy === 'attention') {
        // Pending first, then Paid
        const aVal = a.payment_status === 'Pending' ? 0 : a.payment_status === 'Partially Paid' ? 1 : 2;
        const bVal = b.payment_status === 'Pending' ? 0 : b.payment_status === 'Partially Paid' ? 1 : 2;
        if (aVal !== bVal) return aVal - bVal;
        
        const aTime = a.collection_created_at ? new Date(a.collection_created_at).getTime() : 0;
        const bTime = b.collection_created_at ? new Date(b.collection_created_at).getTime() : 0;
        return bTime - aTime;
      }
      const aTime = a.collection_created_at ? new Date(a.collection_created_at).getTime() : 0;
      const bTime = b.collection_created_at ? new Date(b.collection_created_at).getTime() : 0;
      
      if (sortBy === 'newest') {
        return bTime - aTime;
      }
      if (sortBy === 'oldest') {
        return aTime - bTime;
      }
      if (sortBy === 'highest') {
        return (b.amount || 0) - (a.amount || 0);
      }
      if (sortBy === 'lowest') {
        return (a.amount || 0) - (b.amount || 0);
      }
      return 0;
    });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Produce Collection Register</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Record fresh deliveries and trace payment histories</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm text-xs font-semibold text-slate-700">
            <span className="text-slate-400">Export:</span>
            <input
              type="date"
              value={exportStartDate}
              onChange={(e) => setExportStartDate(e.target.value)}
              className="border-none focus:outline-none text-slate-800 font-semibold bg-transparent cursor-pointer"
              title="Start Date"
            />
            <span className="text-slate-300">to</span>
            <input
              type="date"
              value={exportEndDate}
              onChange={(e) => setExportEndDate(e.target.value)}
              className="border-none focus:outline-none text-slate-800 font-semibold bg-transparent cursor-pointer"
              title="End Date"
            />
            <button
              onClick={handleExportReport}
              className="ml-2 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded font-bold transition flex items-center gap-1 cursor-pointer select-none"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Record Produce Collection Form (Takes 1 Col) - Hidden for Farmers */}
        {!isFarmer && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Sprout className="h-5 w-5 text-emerald-600" />
                <span>Record Produce Collection</span>
              </h2>
            </div>

            <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4">
              {/* Farmer Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Farmer</label>
                <select
                  {...register('farmer_id', { required: 'Farmer is required' })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium bg-white"
                >
                  <option value="">Select Farmer</option>
                  {(farmers || []).map((f) => (
                    <option key={f.id} value={f.id}>{f.name} ({f.village})</option>
                  ))}
                </select>
                {errors.farmer_id && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.farmer_id.message}</p>}
              </div>

              {/* Produce Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Produce Crop</label>
                <select
                  {...register('produce_id', { required: 'Produce crop is required' })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium bg-white"
                >
                  <option value="">Select Produce</option>
                  {(produce || []).map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                  ))}
                </select>
                {errors.produce_id && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.produce_id.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Quantity</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      {...register('quantity', { required: 'Required', min: { value: 0.01, message: '> 0' } })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.quantity && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.quantity.message}</p>}
                </div>

                {/* Rate */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('rate', { required: 'Required', min: { value: 0.01, message: '> 0' } })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                    placeholder="₹0.00"
                  />
                  {errors.rate && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.rate.message}</p>}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Collection Date</label>
                <input
                  type="date"
                  {...register('collection_date', { required: 'Date is required' })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                />
              </div>

              {/* Live Estimator Preview Card */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Live Preview Estimate</span>
                  <span className="text-xs text-emerald-600 block font-medium">Auto-derived on submit</span>
                </div>
                <span className="text-lg font-bold text-emerald-800 tracking-tight">
                  {formatCurrency(livePreviewAmount)}
                </span>
              </div>

              <button
                type="submit"
                disabled={addMutation.isPending}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold tracking-wide shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4.5 w-4.5" />
                <span>{addMutation.isPending ? 'Calculating...' : 'Record Collection'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Collection Lists + Search Filters (Takes 3 Cols if Farmer, else 2 Cols) */}
        <div className={isFarmer ? "lg:col-span-3 space-y-6" : "lg:col-span-2 space-y-6"}>
          {/* Filters Panel */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              {/* Search */}
              <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2 flex items-center gap-2 border border-slate-100">
                <Search className="text-slate-400 h-4 w-4 shrink-0" />
                <input
                  type="text"
                  placeholder="Search by farmer name, phone, crop..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs bg-transparent focus:outline-none text-slate-800 font-semibold"
                />
              </div>

              {/* Sort Select */}
              <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg text-xs text-slate-600 font-semibold">
                <Filter className="h-3.5 w-3.5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="attention">Needs Attention (Pending First)</option>
                  <option value="newest">Date: Newest First</option>
                  <option value="oldest">Date: Oldest First</option>
                  <option value="highest">Amount: High to Low</option>
                  <option value="lowest">Amount: Low to High</option>
                </select>
              </div>
            </div>

            {/* Sub-Filters */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-1 border-t border-slate-50 text-slate-500">
              {/* Farmer Sub Filter */}
              {!isFarmer && (
                <div className="flex items-center gap-1">
                  <span>Farmer:</span>
                  <select
                    value={farmerFilter}
                    onChange={(e) => setFarmerFilter(e.target.value)}
                    className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 focus:outline-none"
                  >
                    <option value="">All Farmers</option>
                    {(farmers || []).map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Produce Sub Filter */}
              <div className="flex items-center gap-1">
                <span>Crop:</span>
                <select
                  value={produceFilter}
                  onChange={(e) => setProduceFilter(e.target.value)}
                  className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 focus:outline-none"
                >
                  <option value="">All Crops</option>
                  {(produce || []).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Count Banner */}
              <div className="ml-auto text-slate-400 font-medium">
                Showing {filteredCollections.length} records
              </div>
            </div>
          </div>

          {/* Table list */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-200 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : isError ? (
            <div className="bg-rose-50 text-rose-700 border border-rose-100 rounded-xl p-4 flex gap-3 items-center">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm font-semibold">{error?.message || 'Error loading collections register.'}</span>
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-xl p-12 text-center flex flex-col items-center">
              <div className="h-12 w-12 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-3">
                <Sprout className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-slate-700 text-sm">No Records Found</h3>
              <p className="text-xs text-slate-400 mt-1">Record fresh deliveries or check search settings.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Farmer</th>
                      <th className="px-6 py-3.5">Produce</th>
                      <th className="px-6 py-3.5 text-right">Qty</th>
                      <th className="px-6 py-3.5 text-right">Rate</th>
                      <th className="px-6 py-3.5 text-right">Amount</th>
                      <th className="px-6 py-3.5 text-center">Status</th>
                      {!isFarmer && <th className="px-6 py-3.5 text-center">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {filteredCollections.map((col) => (
                      <tr key={col.collection_id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {formatDate(col.collection_date)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{col.farmer_name}</div>
                          <div className="text-slate-400 text-xs">{col.farmer_phone} ({col.farmer_village})</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded border border-slate-200">
                            {col.produce_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-800">
                          {col.quantity} <span className="text-slate-400 text-xs">{col.produce_unit}</span>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-500">
                          {formatCurrency(col.rate)}
                        </td>
                        <td className="px-6 py-4 text-right text-primary-green font-extrabold">
                          {formatCurrency(col.amount)}
                          {col.payment_status === 'Partially Paid' && (
                            <div className="text-[10px] text-clay-orange font-bold mt-0.5 leading-tight">
                              Paid: {formatCurrency(col.amount_paid)}
                              <br />
                              Bal: {formatCurrency(col.balance_pending)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              col.payment_status === 'Paid'
                                ? 'bg-[#eef8f4] text-[#2d6a4f] border-[#d7f1e6]'
                                : col.payment_status === 'Partially Paid'
                                ? 'bg-[#fdf9ee] text-[#d4a373] border-[#fbf2d5]'
                                : 'bg-[#fdf4f2] text-[#c94a29] border-[#f9dfd9]'
                            }`}
                          >
                            {col.payment_status}
                          </span>
                        </td>
                          {!isFarmer && (
                            <td className="px-6 py-4 text-center">
                              {col.payment_status !== 'Paid' ? (
                                <button
                                  onClick={() => setUpdatingPayment(col)}
                                  className="text-xs font-bold text-leaf-green hover:text-primary-green border border-warm-border hover:bg-warm-cream/50 px-2.5 py-1.5 rounded-xl transition duration-150 flex items-center gap-1 mx-auto cursor-pointer"
                                >
                                  <CreditCard className="h-3 w-3" />
                                  <span>Settle</span>
                                </button>
                              ) : (
                                <span className="text-xs text-primary-green font-extrabold flex items-center justify-center gap-1 select-none">
                                  <CheckCircle className="h-4 w-4 text-primary-green" />
                                  <span>Settled</span>
                                </span>
                              )}
                            </td>
                          )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settle Payment Modal / Panel overlay (Phase 11 Payment Module CRUD Integration) */}
      {updatingPayment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-emerald-600" />
                <span>Update Payment Status</span>
              </h3>
              <button
                onClick={() => setUpdatingPayment(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Farmer:</span>
                <span className="font-semibold text-slate-800">{updatingPayment.farmer_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Crop Quantity:</span>
                <span className="font-semibold text-slate-800">
                  {updatingPayment.quantity} {updatingPayment.produce_unit}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-2 font-medium">
                <span className="text-slate-800">Total Owed:</span>
                <span className="text-emerald-700 font-bold">{formatCurrency(updatingPayment.amount)}</span>
              </div>
              {previousPaid > 0 && (
                <>
                  <div className="flex justify-between text-xs text-slate-500 font-semibold border-t border-slate-200/40 pt-1.5">
                    <span>Previously Settled:</span>
                    <span className="text-emerald-600 font-bold">{formatCurrency(previousPaid)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-700 font-bold">
                    <span>Current Outstanding:</span>
                    <span className="text-amber-700">{formatCurrency(currentBalance)}</span>
                  </div>
                </>
              )}
            </div>

            <form onSubmit={handlePaySubmit(onPaySubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">New Payment Status</label>
                <select
                  {...payReg('status', { required: 'Status selection is required' })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              {watchedStatus === 'Partially Paid' && (
                <div className="space-y-4 border-l-2 border-amber-400 pl-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      {previousPaid > 0 ? 'Additional Installment Paid (₹)' : 'Partial Amount Paid (₹)'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...payReg('amount_paid', {
                        required: 'Paid amount is required for partial payments',
                        validate: {
                          positive: (val) => Number(val) > 0 || 'Amount must be greater than zero',
                          lessThanBalance: (val) => Number(val) <= currentBalance || `Amount must be less than or equal to outstanding balance (${formatCurrency(currentBalance)})`
                        }
                      })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-semibold bg-white"
                    />
                    {payErrors.amount_paid && (
                      <p className="text-red-500 text-xs mt-1 font-semibold">{payErrors.amount_paid.message}</p>
                    )}
                  </div>
                  
                  <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-800 font-semibold space-y-1">
                    <div className="flex justify-between">
                      <span>Outstanding Balance:</span>
                      <span>{formatCurrency(currentBalance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Additional Paid Now:</span>
                      <span>{formatCurrency(Number(watchedAmountPaid) || 0)}</span>
                    </div>
                    <div className="flex justify-between border-t border-amber-200 pt-1 font-bold">
                      <span>New Balance Pending:</span>
                      <span>{formatCurrency(balancePending)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Auditing Remarks</label>
                <textarea
                  {...payReg('remarks')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium h-24 resize-none"
                  placeholder="E.g., Cash disbursed, bank transaction ID, or member signatures recorded."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUpdatingPayment(null)}
                  className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatePaymentMutation.isPending}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow transition"
                >
                  Save Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
