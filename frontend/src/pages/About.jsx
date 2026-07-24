import React from 'react';
import { Info, ShieldAlert, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">About FPG Produce Register</h1>
        <p className="text-sm text-slate-500 mt-1">Smart delivery and digital receipt ledger for Farmer Producer Groups</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-700 font-semibold">
            <Info className="h-5 w-5" />
            <h2>Digital Registry Goal</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            This platform resolves common disputes between smallholder farmers and FPG managers by converting paper slips 
            into a secure database ledger. Transactions are calculated server-side immediately upon delivery, ensuring 
            full transparency and trust.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-700 font-semibold">
            <ShieldAlert className="h-5 w-5" />
            <h2>Server-Side Constraints</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            All bill calculations are performed inside Supabase/PostgreSQL database triggers rather than on the client interface. 
            This prevents tamper inputs and guarantees that every member and secretary sees identical financial balances.
          </p>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 flex items-start gap-4">
        <div className="p-2 bg-white rounded-lg text-emerald-700 shadow-sm">
          <Award className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-emerald-800 text-sm">SIH 2026 Practical Assessment Project</h3>
          <p className="text-xs text-emerald-700 leading-relaxed">
            Designed for cybersecurity and software engineering assessment, demonstrating robust relational database schema configuration, 
            Row-Level Security (RLS), constraint checking, transaction history logging, and natural language AI query parsing.
          </p>
        </div>
      </div>
    </div>
  );
}
