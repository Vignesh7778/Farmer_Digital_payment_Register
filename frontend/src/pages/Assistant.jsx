import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '../services/db';
import { formatCurrency } from '../utils/helpers';
import { faqData } from '../constants';
import {
  MessageSquareCode,
  Send,
  Sparkles,
  User,
  Bot,
  Search,
  HelpCircle,
  X,
  ChevronRight,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Assistant() {
  const { user } = useAuth();
  const isFarmer = user?.role === 'Farmer';

  if (isFarmer) {
    return <Navigate to="/" replace />;
  }

  const [queryInput, setQueryInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am your CropLedger Assistant. Click on one of the quick options below or type keyword searches to find answers about collections, payments, and member registrations.",
      timestamp: new Date()
    }
  ]);
  
  // Manage dynamic option buttons
  const [activeOptions, setActiveOptions] = useState([
    "How do I register a new farmer?",
    "How is the total collection amount calculated?",
    "How do I download an Excel or CSV report?"
  ]);

  // Autocomplete search suggestions
  const [suggestions, setSuggestions] = useState([]);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeOptions]);

  // Handle autocomplete matching when user types
  useEffect(() => {
    if (queryInput.trim().length > 1) {
      const matchText = queryInput.toLowerCase();
      const filtered = faqData.filter(q => 
        q.question.toLowerCase().includes(matchText) || 
        q.answer.toLowerCase().includes(matchText)
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [queryInput]);

  // Fetch collections database to resolve natural language answers locally
  const { data: collections = [] } = useQuery({
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

  // Helper: Pick 3 randomized follow-up questions
  const getFollowUpOptions = (excludeQuestion = "") => {
    const filtered = faqData.filter(q => q.question !== excludeQuestion);
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map(q => q.question);
  };

  // Q&A matching logic with dynamic database lookups
  const matchQuestionAndAnswer = (rawQuery) => {
    const query = rawQuery.trim().toLowerCase();
    
    // 1. Dynamic Farmer self-lookup: "Show my payment" / "Show my deliveries" / "How much did I earn"
    if (isFarmer && (query.includes('my payment') || query.includes('my deliveries') || query.includes('i earn') || query.includes('my total') || query.includes('my balance'))) {
      const myCols = collections.filter(c => c.farmer_id === user.id);
      const total = myCols.reduce((sum, c) => sum + c.amount, 0);
      const qty = myCols.reduce((sum, c) => sum + c.quantity, 0);
      const paid = myCols.reduce((sum, c) => sum + (c.amount_paid || 0), 0);
      const pending = myCols.reduce((sum, c) => sum + (c.balance_pending || 0), 0);
      return {
        answer: `Hi ${user.username}, you have registered ${myCols.length} deliveries totaling ${qty.toFixed(1)} units. Payout Ledger: Total Earned: ${formatCurrency(total)}, Settled Paid: ${formatCurrency(paid)}, Outstanding Balance: ${formatCurrency(pending)}.`,
        options: getFollowUpOptions()
      };
    }

    // 2. Dynamic Farmer name-lookup: "How much did Ramesh earn" / "payout of Kumar"
    const matchedFarmer = farmers.find(f => query.includes(f.name.toLowerCase()) || query.includes(f.name.split(' ')[0].toLowerCase()));
    if (matchedFarmer && (query.includes('earn') || query.includes('payout') || query.includes('payment') || query.includes('statement') || query.includes('total') || query.includes('balance'))) {
      // SECURITY: If user is a Farmer, block querying other farmers' data
      if (isFarmer && matchedFarmer.id !== user.id) {
        return {
          answer: "Access Denied: As a farmer member, you are only permitted to query your own delivery records and statement balances.",
          options: getFollowUpOptions()
        };
      }
      
      const cols = collections.filter(c => c.farmer_id === matchedFarmer.id);
      const total = cols.reduce((sum, c) => sum + c.amount, 0);
      const qty = cols.reduce((sum, c) => sum + c.quantity, 0);
      const paid = cols.reduce((sum, c) => sum + (c.amount_paid || 0), 0);
      const pending = cols.reduce((sum, c) => sum + (c.balance_pending || 0), 0);
      return {
        answer: `${matchedFarmer.name} has delivered ${cols.length} loads totaling ${qty.toFixed(1)} units. Statement Summary: Gross Value: ${formatCurrency(total)}, Amount Paid: ${formatCurrency(paid)}, Balance Pending: ${formatCurrency(pending)}.`,
        options: getFollowUpOptions()
      };
    }

    // 3. Dynamic Crop-wise lookup: "how much tomato was collected" / "banana collection total"
    const matchedCrop = produce.find(p => query.includes(p.name.toLowerCase()));
    if (matchedCrop && (query.includes('collected') || query.includes('collection') || query.includes('quantity') || query.includes('deliver') || query.includes('volume'))) {
      const cropCols = collections.filter(c => 
        c.produce_name.toLowerCase() === matchedCrop.name.toLowerCase() &&
        (!isFarmer || c.farmer_id === user.id)
      );
      const qty = cropCols.reduce((sum, c) => sum + c.quantity, 0);
      const amt = cropCols.reduce((sum, c) => sum + c.amount, 0);
      
      if (isFarmer) {
        return {
          answer: `You have delivered a total of ${qty.toFixed(1)} ${matchedCrop.unit} of ${matchedCrop.name}, worth ${formatCurrency(amt)}.`,
          options: getFollowUpOptions()
        };
      } else {
        return {
          answer: `Cooperative total for ${matchedCrop.name}: ${qty.toFixed(1)} ${matchedCrop.unit} collected across ${cropCols.length} batches, worth ${formatCurrency(amt)} in payouts.`,
          options: getFollowUpOptions()
        };
      }
    }

    // 4. Dynamic Today's summary lookup: "show today's collection"
    if (query.includes('today') && (query.includes('collection') || query.includes('delivery') || query.includes('deliveries') || query.includes('today\'s'))) {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayCols = collections.filter(c => 
        c.collection_date === todayStr &&
        (!isFarmer || c.farmer_id === user.id)
      );
      const amt = todayCols.reduce((sum, c) => sum + c.amount, 0);
      
      if (isFarmer) {
        return {
          answer: `You have delivered ${todayCols.length} crop batches today, worth a total of ${formatCurrency(amt)}.`,
          options: getFollowUpOptions()
        };
      } else {
        return {
          answer: `Today, CropLedger recorded ${todayCols.length} produce deliveries from members, totaling ${formatCurrency(amt)} in value.`,
          options: getFollowUpOptions()
        };
      }
    }

    // Check if query exactly matches a predefined question in faqData
    const exactMatch = faqData.find(q => q.question.toLowerCase() === query);
    if (exactMatch) {
      return {
        answer: exactMatch.answer,
        options: getFollowUpOptions(exactMatch.question)
      };
    }

    // Filter questions containing the query keywords
    const matches = faqData.filter(q => 
      q.question.toLowerCase().includes(query) || 
      q.answer.toLowerCase().includes(query)
    );

    if (matches.length === 1) {
      return {
        answer: matches[0].answer,
        options: getFollowUpOptions(matches[0].question)
      };
    } else if (matches.length > 1) {
      return {
        answer: `I found multiple topics related to "${rawQuery}". Please click one of the suggestions below to view details:`,
        options: matches.slice(0, 3).map(m => m.question)
      };
    }

    // Split words for keyword match
    const keywords = query.split(' ').filter(w => w.length > 2);
    if (keywords.length > 0) {
      const keywordMatches = faqData.filter(q => 
        keywords.some(kw => q.question.toLowerCase().includes(kw) || q.answer.toLowerCase().includes(kw))
      );
      if (keywordMatches.length > 0) {
        return {
          answer: `I couldn't find a direct match, but here are some related suggestions:`,
          options: keywordMatches.slice(0, 3).map(m => m.question)
        };
      }
    }

    // Fallback if no matching keyword
    return {
      answer: "I couldn't find a question in my register matches. Try choosing one of these general topics:",
      options: getFollowUpOptions()
    };
  };

  const handleSend = (textToSend = queryInput) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setQueryInput('');
    setSuggestions([]);

    // Simulate thinking state
    setTimeout(() => {
      const result = matchQuestionAndAnswer(textToSend);
      const aiMsg = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: result.answer,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiMsg]);
      setActiveOptions(result.options);
    }, 300);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-600 animate-pulse" />
            <span>CropLedger Interactive Assistant</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Click quick options or search keywords to access CropLedger documentation</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
          <BookOpen className="h-3.5 w-3.5" />
          <span>100 Answers Programmed</span>
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[550px] relative overflow-hidden">
        {/* Chat Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {msg.sender === 'user' ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white shadow-sm rounded-tr-none font-medium'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/50 rounded-tl-none font-medium shadow-sm'
                }`}
              >
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          
          <div ref={chatEndRef} />
        </div>

        {/* Quick Options Selection Area */}
        <div className="px-6 pb-4 pt-2 border-t border-slate-50 bg-slate-50/20">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Select a follow-up option:</p>
          <div className="flex flex-col gap-2">
            {activeOptions.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(opt)}
                className="w-full text-left px-4 py-2.5 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-xs text-slate-700 hover:text-emerald-700 rounded-xl font-bold transition flex items-center justify-between group shadow-sm"
              >
                <span className="truncate pr-4">"{opt}"</span>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 transition shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Autocomplete suggestions menu popup */}
        {suggestions.length > 0 && (
          <div className="absolute bottom-[72px] left-4 right-4 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSend(s.question)}
                className="w-full text-left px-4 py-2.5 hover:bg-emerald-50/50 text-xs text-slate-700 hover:text-emerald-800 font-semibold flex items-center justify-between group transition"
              >
                <span className="truncate pr-3">{s.question}</span>
                <span className="text-[10px] text-slate-400 bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-700 px-2 py-0.5 rounded-full font-bold transition">
                  {s.category}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Chat Text Input Bar */}
        <div className="p-4 border-t border-slate-100 flex gap-2 items-center bg-slate-50/50">
          <div className="relative flex-1">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Search by keywords (e.g., 'payout', 'banana', 'register')..."
              className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium shadow-sm"
            />
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
            {queryInput && (
              <button 
                onClick={() => setQueryInput('')} 
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => handleSend()}
            className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition shrink-0 font-bold text-sm"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </div>
      </div>
    </div>
  );
}
