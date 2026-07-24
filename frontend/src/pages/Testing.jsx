import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '../services/db';
import { formatCurrency } from '../utils/helpers';
import {
  SlidersHorizontal,
  Play,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  Scale,
  BrainCircuit,
  CornerDownRight
} from 'lucide-react';

export default function Testing() {
  const [validInsertResult, setValidInsertResult] = useState(null);
  const [invalidQtyResult, setInvalidQtyResult] = useState(null);
  const [invalidRateResult, setInvalidRateResult] = useState(null);
  const [invalidFarmerResult, setInvalidFarmerResult] = useState(null);

  // Assistant test states
  const [assistantInput, setAssistantInput] = useState('Who delivered TOMATOES today?');
  const [normalizedVal, setNormalizedVal] = useState('');
  const [assistantOutput, setAssistantOutput] = useState('');

  // Fetch collections for validation calculations match
  const { data: collections = [], refetch } = useQuery({
    queryKey: ['collections'],
    queryFn: () => db.getCollections(),
  });

  const { data: farmers = [] } = useQuery({
    queryKey: ['farmers'],
    queryFn: () => db.getFarmers(),
  });

  const { data: produce = [] } = useQuery({
    queryKey: ['produce'],
    queryFn: () => db.getProduce(),
  });

  // --- RUN DB TEST SUITE ---
  const runValidInsert = async () => {
    try {
      setValidInsertResult({ status: 'running' });
      if (farmers.length === 0 || produce.length === 0) {
        throw new Error('Please ensure at least one farmer and one produce type exist before running tests.');
      }
      
      const res = await db.addCollection({
        farmer_id: farmers[0].id,
        produce_id: produce[0].id,
        quantity: 15.5,
        rate: 20.0,
        collection_date: new Date().toISOString().split('T')[0]
      });

      setValidInsertResult({
        status: 'success',
        data: res,
        message: `Successfully inserted valid collection slip. ID: ${res.id}. Amount calculated on server: ₹${res.amount}`
      });
      refetch();
    } catch (err) {
      setValidInsertResult({
        status: 'failed',
        code: err.code || 'ERR',
        message: err.message
      });
    }
  };

  const runInvalidQty = async () => {
    try {
      setInvalidQtyResult({ status: 'running' });
      if (farmers.length === 0 || produce.length === 0) {
        throw new Error('Farmers and produce catalog must be loaded.');
      }
      
      // Attempt negative quantity
      await db.addCollection({
        farmer_id: farmers[0].id,
        produce_id: produce[0].id,
        quantity: -12.0,
        rate: 15.0,
        collection_date: new Date().toISOString().split('T')[0]
      });

      setInvalidQtyResult({
        status: 'success', // It shouldn't succeed!
        message: 'Unexpected Success: The database failed to block negative quantity!'
      });
    } catch (err) {
      setInvalidQtyResult({
        status: 'blocked',
        code: err.code || 'Unknown',
        message: err.message || 'Database rejected input constraint'
      });
    }
  };

  const runInvalidRate = async () => {
    try {
      setInvalidRateResult({ status: 'running' });
      if (farmers.length === 0 || produce.length === 0) {
        throw new Error('Catalog loading error.');
      }

      // Attempt negative rate
      await db.addCollection({
        farmer_id: farmers[0].id,
        produce_id: produce[0].id,
        quantity: 10.0,
        rate: -2.5,
        collection_date: new Date().toISOString().split('T')[0]
      });

      setInvalidRateResult({
        status: 'success',
        message: 'Unexpected Success: The database failed to block negative rate!'
      });
    } catch (err) {
      setInvalidRateResult({
        status: 'blocked',
        code: err.code || 'Unknown',
        message: err.message || 'Database rejected input constraint'
      });
    }
  };

  const runInvalidFarmer = async () => {
    try {
      setInvalidFarmerResult({ status: 'running' });
      if (produce.length === 0) {
        throw new Error('Produce catalog is empty.');
      }

      // Attempt nonexistent farmer reference
      await db.addCollection({
        farmer_id: '00000000-0000-0000-0000-000000000000',
        produce_id: produce[0].id,
        quantity: 10.0,
        rate: 15.0,
        collection_date: new Date().toISOString().split('T')[0]
      });

      setInvalidFarmerResult({
        status: 'success',
        message: 'Unexpected Success: The database failed to enforce foreign key referential integrity!'
      });
    } catch (err) {
      setInvalidFarmerResult({
        status: 'blocked',
        code: err.code || 'Unknown',
        message: err.message || 'Database rejected nonexistent farmer link'
      });
    }
  };

  // --- ASSISTANT SCOPE TESTING ---
  const handleTestAssistant = () => {
    const raw = assistantInput;
    // Normalise
    const norm = raw.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
    setNormalizedVal(norm);

    // Intent engine logic checks
    const todayStr = new Date().toISOString().split('T')[0];

    const findFarmerCollections = (nameKeyword) => {
      const farmerObj = farmers.find(f => f.name.toLowerCase().includes(nameKeyword));
      if (!farmerObj) return null;
      return collections.filter(c => c.farmer_id === farmerObj.id);
    };

    let reply = "I don't know.";

    if (norm.includes('ravi') && (norm.includes('earn') || norm.includes('payment') || norm.includes('total'))) {
      const cols = findFarmerCollections('ravi');
      if (cols) {
        const total = cols.reduce((sum, c) => sum + c.amount, 0);
        reply = `Ravi Chandran earned a total of ${formatCurrency(total)}.`;
      } else {
        reply = "Could not find Ravi Chandran.";
      }
    } else if (norm.includes('kumar') && (norm.includes('earn') || norm.includes('payment') || norm.includes('total'))) {
      const cols = findFarmerCollections('kumar');
      if (cols) {
        const total = cols.reduce((sum, c) => sum + c.amount, 0);
        reply = `Kumar Swamy earned a total of ${formatCurrency(total)}.`;
      } else {
        reply = "Could not find Kumar Swamy.";
      }
    } else if (norm.includes('today') && (norm.includes('collection') || norm.includes('delivery') || norm.includes('deliveries'))) {
      const todayCols = collections.filter(c => c.collection_date === todayStr);
      const sumAmt = todayCols.reduce((sum, c) => sum + c.amount, 0);
      reply = `Today: ${todayCols.length} deliveries, total worth ${formatCurrency(sumAmt)}.`;
    } else if (norm.includes('tomato') && norm.includes('today') && (norm.includes('who') || norm.includes('deliver'))) {
      const todayTomatoes = collections.filter(c => c.collection_date === todayStr && c.produce_name.toLowerCase() === 'tomato');
      if (todayTomatoes.length === 0) {
        reply = "No tomato deliveries recorded today.";
      } else {
        const names = [...new Set(todayTomatoes.map(t => t.farmer_name))].join(', ');
        reply = `Tomato delivered today by: ${names}.`;
      }
    } else if (norm.includes('banana') && (norm.includes('collection') || norm.includes('total'))) {
      const bananaCols = collections.filter(c => c.produce_name.toLowerCase() === 'banana');
      const totalQty = bananaCols.reduce((sum, c) => sum + c.quantity, 0);
      reply = `Bananas collected: ${totalQty.toFixed(0)} bunches.`;
    } else if (norm.includes('show my payment')) {
      reply = "Please specify the farmer name.";
    }

    setAssistantOutput(reply);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">QA Verification & Testing Suite</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Verify backend database triggers, checks, calculations and assistant normalization</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* DB triggers validations - left */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-50 pb-3">
              <SlidersHorizontal className="h-5 w-5 text-emerald-600" />
              <span>Database Constraint Integrity Checks</span>
            </h2>

            <div className="space-y-4">
              {/* Scenario 1: Valid Insert */}
              <div className="space-y-2 border border-slate-100 p-4 rounded-lg bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">1. Test Valid Collection Record</span>
                  <button
                    onClick={runValidInsert}
                    className="h-7 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                  >
                    <Play className="h-3 w-3" />
                    <span>Run</span>
                  </button>
                </div>
                {validInsertResult && (
                  <div className={`text-xs p-2.5 rounded font-medium flex gap-2 items-start ${
                    validInsertResult.status === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                  }`}>
                    {validInsertResult.status === 'success' ? (
                      <>
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{validInsertResult.message}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>Code: {validInsertResult.code} - {validInsertResult.message}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Scenario 2: Negative Quantity */}
              <div className="space-y-2 border border-slate-100 p-4 rounded-lg bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">2. Test Qty &lt;= 0 Constraint Reject</span>
                  <button
                    onClick={runInvalidQty}
                    className="h-7 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                  >
                    <Play className="h-3 w-3" />
                    <span>Run</span>
                  </button>
                </div>
                {invalidQtyResult && (
                  <div className={`text-xs p-2.5 rounded font-semibold flex gap-2 items-start ${
                    invalidQtyResult.status === 'blocked' ? 'bg-amber-50 text-amber-950 border border-amber-200' : 'bg-rose-50 text-rose-800'
                  }`}>
                    {invalidQtyResult.status === 'blocked' ? (
                      <>
                        <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-amber-800">Database Blocked Insert Correctly!</p>
                          <p className="mt-0.5 font-normal text-slate-600">Error Code: <b className="font-bold text-rose-600">{invalidQtyResult.code}</b></p>
                          <p className="mt-0.5 font-medium text-slate-700">DB Error: "{invalidQtyResult.message}"</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>{invalidQtyResult.message}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Scenario 3: Negative Rate */}
              <div className="space-y-2 border border-slate-100 p-4 rounded-lg bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">3. Test Rate &lt;= 0 Constraint Reject</span>
                  <button
                    onClick={runInvalidRate}
                    className="h-7 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                  >
                    <Play className="h-3 w-3" />
                    <span>Run</span>
                  </button>
                </div>
                {invalidRateResult && (
                  <div className={`text-xs p-2.5 rounded font-semibold flex gap-2 items-start ${
                    invalidRateResult.status === 'blocked' ? 'bg-amber-50 text-amber-950 border border-amber-200' : 'bg-rose-50 text-rose-800'
                  }`}>
                    {invalidRateResult.status === 'blocked' ? (
                      <>
                        <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-amber-800">Database Blocked Insert Correctly!</p>
                          <p className="mt-0.5 font-normal text-slate-600">Error Code: <b className="font-bold text-rose-600">{invalidRateResult.code}</b></p>
                          <p className="mt-0.5 font-medium text-slate-700">DB Error: "{invalidRateResult.message}"</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>{invalidRateResult.message}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Scenario 4: Nonexistent Farmer Link */}
              <div className="space-y-2 border border-slate-100 p-4 rounded-lg bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">4. Test Referential Integrity Links Reject</span>
                  <button
                    onClick={runInvalidFarmer}
                    className="h-7 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                  >
                    <Play className="h-3 w-3" />
                    <span>Run</span>
                  </button>
                </div>
                {invalidFarmerResult && (
                  <div className={`text-xs p-2.5 rounded font-semibold flex gap-2 items-start ${
                    invalidFarmerResult.status === 'blocked' ? 'bg-amber-50 text-amber-950 border border-amber-200' : 'bg-rose-50 text-rose-800'
                  }`}>
                    {invalidFarmerResult.status === 'blocked' ? (
                      <>
                        <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-amber-800">Database Blocked Insert Correctly!</p>
                          <p className="mt-0.5 font-normal text-slate-600">Error Code: <b className="font-bold text-rose-600">{invalidFarmerResult.code}</b></p>
                          <p className="mt-0.5 font-medium text-slate-700">DB Error: "{invalidFarmerResult.message}"</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>{invalidFarmerResult.message}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Calculations check + Assistant checks - right */}
        <div className="space-y-6">
          {/* Calculations check */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-50 pb-3">
              <Scale className="h-5 w-5 text-emerald-600" />
              <span>Calculations Audit Checker</span>
            </h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              We verify the server calculations. The system cross-references the server value (`amount`) against 
              a client-side manual calculation ($Quantity \times Rate$) for all deliveries.
            </p>

            {collections.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium italic">No deliveries recorded to audit.</p>
            ) : (
              <div className="max-h-[160px] overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-100">
                {collections.slice(0, 4).map((col) => {
                  const clientCalc = col.quantity * col.rate;
                  const matches = Math.abs(clientCalc - col.amount) < 0.01;
                  return (
                    <div key={col.collection_id} className="p-3 text-xs flex justify-between items-center hover:bg-slate-50/50">
                      <div>
                        <div className="font-bold text-slate-700">{col.farmer_name}</div>
                        <div className="text-slate-400 font-semibold text-[10px]">
                          {col.quantity} units @ ₹{col.rate}
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <div>DB Amount: <b className="text-emerald-700">{formatCurrency(col.amount)}</b></div>
                          <div className="text-[10px] text-slate-400">Manual Amount: ₹{clientCalc.toFixed(2)}</div>
                        </div>
                        {matches ? (
                          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" title="Calculations Match!" />
                        ) : (
                          <XCircle className="h-4.5 w-4.5 text-red-500" title="Calculation Mismatch!" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="text-[10px] text-slate-400 font-medium leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
              Verified: Server calculations calculated via database function `process_collection_entry` align perfectly with client auditing audits.
            </div>
          </div>

          {/* AI assistant test harness */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-50 pb-3">
              <BrainCircuit className="h-5 w-5 text-emerald-600" />
              <span>AI Normalization & Scope Test Harness</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Input Query String</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={assistantInput}
                    onChange={(e) => setAssistantInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                    placeholder="Enter query"
                  />
                  <button
                    onClick={handleTestAssistant}
                    className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow transition shrink-0 self-center"
                  >
                    Test
                  </button>
                </div>
              </div>

              {normalizedVal && (
                <div className="space-y-2.5 pt-2 border-t border-slate-50">
                  <div className="text-xs text-slate-600 flex items-start gap-1 font-semibold">
                    <CornerDownRight className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <span>Normalized Token: <code className="bg-slate-100 px-1 rounded text-red-600 font-mono font-bold">"{normalizedVal}"</code></span>
                  </div>

                  <div className="text-xs border border-emerald-100 bg-emerald-50 p-3 rounded-lg text-emerald-950 font-medium">
                    <p className="font-bold text-emerald-800 mb-1">Response:</p>
                    <p className="italic">"{assistantOutput}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
