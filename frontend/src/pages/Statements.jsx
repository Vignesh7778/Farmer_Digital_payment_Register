import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '../services/db';
import { formatCurrency, formatDate } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import {
  FileText,
  User,
  MapPin,
  Phone,
  Scale,
  IndianRupee,
  Calendar,
  AlertCircle,
  Briefcase,
  Printer,
  ChevronRight
} from 'lucide-react';

export default function Statements() {
  const { user } = useAuth();
  const isFarmer = user?.role === 'Farmer';
  const [selectedFarmerId, setSelectedFarmerId] = useState(isFarmer ? user.id : '');

  // Sync selected farmer ID for Farmer session
  useEffect(() => {
    if (isFarmer && user?.id) {
      setSelectedFarmerId(user.id);
    }
  }, [isFarmer, user]);

  // Fetch Farmers list for select dropdown
  const { data: farmers = [] } = useQuery({
    queryKey: ['farmers'],
    queryFn: () => db.getFarmers(),
  });

  // Fetch all collections detailed to construct statement logs
  const { data: collections = [], isLoading, isError, error } = useQuery({
    queryKey: ['collections'],
    queryFn: () => db.getCollections(),
  });

  // Filter collections for selected farmer
  const farmerCollections = (collections || []).filter(c => c.farmer_id === selectedFarmerId);

  // Calculate totals
  const totalDeliveries = farmerCollections.length;
  const totalQuantity = farmerCollections.reduce((sum, c) => sum + (Number(c.quantity) || 0), 0);
  const totalAmount = farmerCollections.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const totalPaid = farmerCollections.filter(c => c.payment_status === 'Paid').reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const totalPending = farmerCollections.filter(c => c.payment_status === 'Pending').reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  const selectedFarmer = (farmers || []).find(f => f.id === selectedFarmerId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-0 print:space-y-4">
      {/* Header - Hidden on Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Farmer Statement</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Verify deliveries ledger, payables balances, and audit history</p>
        </div>
        {selectedFarmerId && (
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold tracking-wide shadow transition flex items-center gap-1.5 self-start"
          >
            <Printer className="h-4.5 w-4.5" />
            <span>Print Ledger</span>
          </button>
        )}
      </div>

      {/* Select Farmer Card - Hidden on Print & Hidden for Farmers */}
      {!isFarmer && (
        <div className="bg-white p-6 rounded-2xl border border-warm-border/60 shadow-sm space-y-4 print:hidden">
          <label className="block text-xs font-bold text-earth-brown uppercase tracking-wider">Select Farmer Profile</label>
          <div className="w-full">
            <select
              value={selectedFarmerId}
              onChange={(e) => setSelectedFarmerId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent font-semibold bg-slate-50/30 cursor-pointer transition duration-150"
            >
              <option value="">Choose CropLedger Member...</option>
              {(farmers || []).map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.village})</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Statement Sheet */}
      {!selectedFarmerId ? (
        <div className="bg-white border border-slate-100 rounded-xl p-16 text-center flex flex-col items-center print:hidden">
          <div className="h-12 w-12 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-3">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-slate-700 text-sm">No Member Selected</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Please choose a farmer profile from the selector above to display their deliverable records and payables statements.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Printable Header Info */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between gap-6 print:border-none print:shadow-none print:p-0">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 font-bold border border-emerald-100 print:hidden">
                  <User className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-bold text-slate-800 text-lg">{selectedFarmer.name}</h2>
                  <p className="text-xs text-slate-400 font-semibold print:text-slate-500">CropLedger Member Profile</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-500 font-semibold">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400 print:hidden" />
                  <span>Phone: <b className="text-slate-700 font-bold">{selectedFarmer.phone}</b></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 print:hidden" />
                  <span>Village: <b className="text-slate-700 font-bold">{selectedFarmer.village}</b></span>
                </div>
              </div>
            </div>

            <div className="sm:text-right space-y-1.5 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 print:border-none print:pl-0">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Statement Ledger</span>
              <span className="text-xs text-slate-500 block font-medium">As of {new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date())}</span>
              <span className="inline-block px-2.5 py-0.5 bg-[#eef8f4] text-[#2d6a4f] border border-[#d7f1e6] text-xs font-bold rounded-full print:border-none">
                Active Member
              </span>
            </div>
          </div>

          {/* Cumulative KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 print:grid-cols-3">
            <div className="p-6 bg-white rounded-2xl border border-warm-border/60 shadow-sm space-y-2 print:border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Deliveries</span>
              <span className="text-2xl font-extrabold text-[#1b4332] block">{totalDeliveries} times</span>
              <span className="text-xs text-slate-500 block font-semibold">Recorded load batches</span>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-warm-border/60 shadow-sm space-y-2 print:border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Quantity</span>
              <span className="text-2xl font-extrabold text-[#1b4332] block">
                {totalQuantity.toFixed(2)} <span className="text-xs text-slate-400">kg</span>
              </span>
              <span className="text-xs text-slate-500 block font-semibold">Cumulative delivered produce</span>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-warm-border/60 shadow-sm space-y-2 print:border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Amount Owed</span>
              <span className="text-2xl font-extrabold text-primary-green block">{formatCurrency(totalAmount)}</span>
              <div className="text-xs text-slate-500 flex justify-between font-semibold">
                <span>Paid: <b className="text-leaf-green">{formatCurrency(totalPaid)}</b></span>
                <span>Pending: <b className="text-[#c94a29]">{formatCurrency(totalPending)}</b></span>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-2xl border border-warm-border/60 shadow-sm overflow-hidden print:border-slate-200 print:shadow-none">
            <div className="px-6 py-4 border-b border-warm-border/40 print:px-0">
              <h3 className="font-extrabold text-primary-green text-sm">Delivery Audit Logs</h3>
            </div>

            {farmerCollections.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-semibold">
                No produce deliveries registered for this farmer profile yet.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#faf9f5] border-b border-warm-border/40 text-earth-brown font-bold text-xs uppercase tracking-wider print:bg-transparent print:border-slate-200">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Produce</th>
                    <th className="px-6 py-3 text-right">Quantity</th>
                    <th className="px-6 py-3 text-right">Rate</th>
                    <th className="px-6 py-3 text-right">Total Amount</th>
                    <th className="px-6 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-border/30 text-earth-brown font-semibold print:divide-slate-200">
                  {farmerCollections.map((col) => (
                    <tr key={col.collection_id} className="hover:bg-[#faf9f5]/30 transition duration-150">
                      <td className="px-6 py-4 text-xs text-slate-400 font-bold">
                        {formatDate(col.collection_date)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-slate-800">{col.produce_name}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-800 font-bold">
                        {col.quantity} <span className="text-slate-400 text-xs">{col.produce_unit}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 font-semibold">
                        {formatCurrency(col.rate)}
                      </td>
                      <td className="px-6 py-4 text-right text-primary-green font-extrabold">
                        {formatCurrency(col.amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                          col.payment_status === 'Paid'
                            ? 'bg-[#eef8f4] text-[#2d6a4f] border-[#d7f1e6]'
                            : col.payment_status === 'Partially Paid'
                            ? 'bg-[#fdf9ee] text-[#d4a373] border-[#fbf2d5]'
                            : 'bg-[#fdf4f2] text-[#c94a29] border-[#f9dfd9]'
                        }`}>
                          {col.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
