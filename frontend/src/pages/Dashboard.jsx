import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '../services/db';
import { formatCurrency, formatDate } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  Sprout,
  IndianRupee,
  CalendarDays,
  TrendingUp,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';

export default function Dashboard() {
  const { user } = useAuth();
  const isFarmer = user?.role === 'Farmer';

  const { data: stats, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboardStats', isFarmer ? user.id : 'all'],
    queryFn: () => db.getDashboardStats(isFarmer ? user.id : null),
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header skeleton */}
        <div className="h-10 bg-slate-200 rounded w-1/4"></div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl border border-slate-100"></div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-slate-200 rounded-2xl h-80 border border-slate-100"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-red-100 shadow-sm">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-slate-800">Failed to load statistics</h2>
        <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
          {error?.message || 'An unexpected error occurred while fetching metrics from the database.'}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold tracking-wide shadow transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statCards = isFarmer
    ? [
        {
          title: 'My Deliveries',
          value: stats.totalCollections,
          desc: 'Number of loads delivered',
          icon: Sprout,
          color: 'bg-[#f0f4f1] text-[#1b4332] border-[#e1ece4]',
        },
        {
          title: 'Total Weight Delivered',
          value: `${Number(stats.totalQuantity || 0).toFixed(1)} kg`,
          desc: 'Cumulative crop weight',
          icon: Scale,
          color: 'bg-[#eef8f4] text-[#2d6a4f] border-[#d7f1e6]',
        },
        {
          title: 'Total Value Earned',
          value: formatCurrency(stats.totalAmount),
          desc: 'Gross payout generated',
          icon: IndianRupee,
          color: 'bg-[#fdf9ee] text-[#d4a373] border-[#fbf2d5]',
        },
        {
          title: 'Outstanding Balance',
          value: formatCurrency(stats.balancePending),
          desc: 'Pending payment due',
          icon: CalendarDays,
          color: 'bg-[#fdf4f2] text-[#c94a29] border-[#f9dfd9]',
        },
      ]
    : [
        {
          title: 'Total Farmers',
          value: stats.totalFarmers,
          desc: 'Registered CropLedger members',
          icon: Users,
          color: 'bg-[#f0f4f1] text-[#1b4332] border-[#e1ece4]',
        },
        {
          title: 'Total Collections',
          value: stats.totalCollections,
          desc: 'All recorded deliveries',
          icon: Sprout,
          color: 'bg-[#eef8f4] text-[#2d6a4f] border-[#d7f1e6]',
        },
        {
          title: 'Total Amount',
          value: formatCurrency(stats.totalAmount),
          desc: 'Cumulative payables',
          icon: IndianRupee,
          color: 'bg-[#fdf9ee] text-[#d4a373] border-[#fbf2d5]',
        },
        {
          title: "Today's Collections",
          value: stats.todayCount,
          desc: `Total: ${formatCurrency(stats.todaySum)}`,
          icon: CalendarDays,
          color: 'bg-[#fdf4f2] text-[#c94a29] border-[#f9dfd9]',
        },
      ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-warm-border/50 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-green tracking-tight">
            {isFarmer ? `Welcome, ${user.username}` : '🌾 CropLedger Dashboard'}
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-semibold">
            {isFarmer ? 'Your digital delivery receipts and payout balance statements' : 'Collection operator console & agricultural delivery logs'}
          </p>
        </div>
        {!isFarmer && (
          <div className="flex gap-3">
            <Link
              to={ROUTES.COLLECTIONS}
              className="px-4 py-2.5 bg-primary-green hover:bg-leaf-green text-white rounded-xl text-sm font-bold tracking-wide shadow-md shadow-primary-green/10 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Record New Delivery</span>
              <TrendingUp className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="p-6 bg-white rounded-2xl border border-warm-border/50 shadow-sm hover-lift flex items-start justify-between bg-gradient-to-br from-white to-warm-cream/10"
          >
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {card.title}
              </span>
              <span className="text-2xl font-extrabold text-earth-brown tracking-tight block">
                {card.value}
              </span>
              <span className="text-xs text-slate-500 font-semibold block">
                {card.desc}
              </span>
            </div>
            <div className={`p-3.5 rounded-xl border ${card.color} shadow-inner`}>
              <card.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Deliveries Table Section */}
      <div className="bg-white rounded-2xl border border-warm-border/60 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-warm-border/40 flex items-center justify-between bg-gradient-to-r from-white to-warm-cream/5">
          <div>
            <h2 className="font-extrabold text-primary-green text-base">Recent Collections</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-semibold">
              {isFarmer ? 'Your latest crop delivery logs' : 'Latest deliveries registered by operator'}
            </p>
          </div>
          <Link
            to={ROUTES.COLLECTIONS}
            className="text-xs text-leaf-green hover:text-primary-green font-bold flex items-center gap-1 hover:underline"
          >
            <span>View All Logs</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {stats.recentCollections.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="h-12 w-12 bg-[#faf9f5] border border-warm-border/40 rounded-full flex items-center justify-center text-slate-400 mb-3 shadow-inner">
              <Sprout className="h-6 w-6 text-leaf-green" />
            </div>
            <h3 className="font-bold text-slate-700 text-sm">No Collections Registered</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm font-semibold">
              Deliveries entered today or recently will be displayed in this register stream.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#faf9f5] border-b border-warm-border/40 text-earth-brown font-bold text-xs uppercase tracking-wider">
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Farmer</th>
                  <th className="px-6 py-3.5">Village</th>
                  <th className="px-6 py-3.5">Produce</th>
                  <th className="px-6 py-3.5 text-right">Qty</th>
                  <th className="px-6 py-3.5 text-right">Rate</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border/30 text-earth-brown font-semibold">
                {stats.recentCollections.map((col) => (
                  <tr key={col.collection_id} className="hover:bg-[#faf9f5]/30 transition duration-150">
                    <td className="px-6 py-4 text-slate-400 text-xs font-bold">
                      {formatDate(col.collection_date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-slate-800">{col.farmer_name}</div>
                      <div className="text-slate-400 text-xs">{col.farmer_phone}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs font-bold">{col.farmer_village}</td>
                    <td className="px-6 py-4">
                      <span className="bg-leaf-green/10 text-leaf-green text-xs px-2.5 py-1 rounded-lg font-bold border border-leaf-green/20">
                        {col.produce_name}
                      </span>
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
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-extrabold border ${
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
