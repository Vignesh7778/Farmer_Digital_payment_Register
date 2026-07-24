import React from 'react';
import { Info, ShieldAlert, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border-b border-warm-border/50 pb-5">
        <h1 className="text-2xl font-extrabold text-primary-green tracking-tight">🌾 About CropLedger</h1>
        <p className="text-sm text-slate-500 mt-1 font-semibold">Smart delivery and digital receipt ledger for Farmer Producer Groups</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-warm-border/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-leaf-green font-bold">
            <Info className="h-5 w-5" />
            <h2>Digital Registry Goal</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed font-semibold">
            This platform resolves common disputes between smallholder farmers and CropLedger managers by converting paper slips 
            into a secure database ledger. Transactions are calculated server-side immediately upon delivery, ensuring 
            full transparency and trust.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-warm-border/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-leaf-green font-bold">
            <ShieldAlert className="h-5 w-5" />
            <h2>Server-Side Constraints</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed font-semibold">
            All bill calculations are performed inside Supabase/PostgreSQL database triggers rather than on the client interface. 
            This prevents tamper inputs and guarantees that every member and secretary sees identical financial balances.
          </p>
        </div>
      </div>

      <div className="bg-[#eef8f4] border border-[#d7f1e6] rounded-2xl p-6 flex items-start gap-4 shadow-sm">
        <div className="p-2 bg-white rounded-xl text-primary-green shadow-sm border border-warm-border/40">
          <Award className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-extrabold text-[#1b4332] text-sm">SIH 2026 Practical Assessment Project</h3>
          <p className="text-xs text-[#2d6a4f] leading-relaxed font-semibold">
            Designed for cybersecurity and software engineering assessment, demonstrating robust relational database schema configuration, 
            Row-Level Security (RLS), constraint checking, transaction history logging, and natural language AI query parsing.
          </p>
        </div>
      </div>
    </div>
  );
}
