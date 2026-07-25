import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '../services/db';
import { formatCurrency } from '../utils/helpers';
import { faqData, faqDataTa } from '../constants';
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

  const [lang, setLang] = useState(null);
  const [queryInput, setQueryInput] = useState('');
  
  const WELCOME_MESSAGES = {
    en: "Hello! I am your CropLedger Assistant. Click on one of the quick options below or type keyword searches to find answers about collections, payments, and member registrations.",
    ta: "வணக்கம்! நான் உங்களின் CropLedger உதவி உதவியாளர். சேகரிப்புகள், கொடுப்பனவுகள் மற்றும் உறுப்பினர் பதிவுகள் பற்றிய பதில்களைக் கண்டறிய கீழே உள்ள விரைவான விருப்பங்களில் ஒன்றைக் கிளிக் செய்யவும் அல்லது தேடவும்."
  };

  const DEFAULT_OPTIONS = {
    en: [
      "How do I register a new farmer?",
      "How is the total collection amount calculated?",
      "How do I download an Excel or CSV report?"
    ],
    ta: [
      "புதிய விவசாயியை எவ்வாறு பதிவு செய்வது?",
      "விவசாயியின் நிலுவைத்தொகை எவ்வாறு கணக்கிடப்படுகிறது?",
      "எக்செல்/சிஎஸ்வி அறிக்கையை எவ்வாறு பதிவிறக்குவது?"
    ]
  };

  const [messages, setMessages] = useState([
    {
      id: 'welcome-lang',
      sender: 'assistant',
      text: "Welcome to CropLedger! Please select your preferred language to proceed.\n\nCropLedger-க்கு உங்களை வரவேற்கிறோம்! தொடர உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்.",
      timestamp: new Date()
    }
  ]);
  
  // Manage dynamic option buttons
  const [activeOptions, setActiveOptions] = useState(["English", "Tamil"]);

  // Autocomplete search suggestions
  const [suggestions, setSuggestions] = useState([]);
  const chatEndRef = useRef(null);

  // Sync language selection resets
  useEffect(() => {
    if (!lang) {
      setMessages([
        {
          id: 'welcome-lang',
          sender: 'assistant',
          text: "Welcome to CropLedger! Please select your preferred language to proceed.\n\nCropLedger-க்கு உங்களை வரவேற்கிறோம்! தொடர உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்.",
          timestamp: new Date()
        }
      ]);
      setActiveOptions(["English", "Tamil"]);
    }
    setQueryInput('');
    setSuggestions([]);
  }, [lang]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeOptions]);

  // Handle autocomplete matching when user types
  useEffect(() => {
    const activeFaq = lang === 'ta' ? faqDataTa : faqData;
    if (queryInput.trim().length > 1) {
      const matchText = queryInput.toLowerCase();
      const filtered = activeFaq.filter(q => 
        q.question.toLowerCase().includes(matchText) || 
        q.answer.toLowerCase().includes(matchText)
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [queryInput, lang]);

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
    const activeFaq = lang === 'ta' ? faqDataTa : faqData;
    const filtered = activeFaq.filter(q => q.question !== excludeQuestion);
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map(q => q.question);
  };

  // Q&A matching logic with dynamic database lookups
  const matchQuestionAndAnswer = (rawQuery) => {
    const query = rawQuery.trim().toLowerCase();
    
    // 1. Dynamic Farmer self-lookup: "Show my payment" / "Show my deliveries" / "How much did I earn"
    const isSelfQuery = (isFarmer && (
      query.includes('my payment') || query.includes('my deliveries') || query.includes('i earn') || query.includes('my total') || query.includes('my balance') ||
      query.includes('என் விநியோகம்') || query.includes('என் பணம்') || query.includes('என் வருமானம்') || query.includes('என் நிலுவை') || query.includes('எனது கணக்கு')
    ));
    if (isSelfQuery) {
      const myCols = collections.filter(c => c.farmer_id === user.id);
      const total = myCols.reduce((sum, c) => sum + c.amount, 0);
      const qty = myCols.reduce((sum, c) => sum + c.quantity, 0);
      const paid = myCols.reduce((sum, c) => sum + (c.amount_paid || 0), 0);
      const pending = myCols.reduce((sum, c) => sum + (c.balance_pending || 0), 0);
      
      if (lang === 'ta') {
        return {
          answer: `வணக்கம் ${user.username}, நீங்கள் மொத்தம் ${myCols.length} விநியோகங்களை (${qty.toFixed(1)} அலகுகள்) செய்துள்ளீர்கள். கணக்கு விவரம்: மொத்த வருவாய்: ${formatCurrency(total)}, செலுத்திய தொகை: ${formatCurrency(paid)}, நிலுவைத் தொகை: ${formatCurrency(pending)}.`,
          options: getFollowUpOptions()
        };
      } else {
        return {
          answer: `Hi ${user.username}, you have registered ${myCols.length} deliveries totaling ${qty.toFixed(1)} units. Payout Ledger: Total Earned: ${formatCurrency(total)}, Settled Paid: ${formatCurrency(paid)}, Outstanding Balance: ${formatCurrency(pending)}.`,
          options: getFollowUpOptions()
        };
      }
    }

    // 2. Dynamic Farmer name-lookup: "How much did Ramesh earn" / "payout of Kumar"
    const matchedFarmer = farmers.find(f => query.includes(f.name.toLowerCase()) || query.includes(f.name.split(' ')[0].toLowerCase()));
    const isEarningsQuery = (query.includes('earn') || query.includes('payout') || query.includes('payment') || query.includes('statement') || query.includes('total') || query.includes('balance') ||
                             query.includes('வருமானம்') || query.includes('பட்டுவாடா') || query.includes('பணம்') || query.includes('அறிக்கை') || query.includes('மொத்தம்') || query.includes('நிலுவை'));
    if (matchedFarmer && isEarningsQuery) {
      // SECURITY: If user is a Farmer, block querying other farmers' data
      if (isFarmer && matchedFarmer.id !== user.id) {
        if (lang === 'ta') {
          return {
            answer: "அனுமதி மறுக்கப்பட்டது: ஒரு விவசாயியாக, உங்கள் சொந்த விநியோக பதிவுகள் மற்றும் கணக்கு நிலுவைகளை மட்டுமே நீங்கள் விசாரிக்க முடியும்.",
            options: getFollowUpOptions()
          };
        } else {
          return {
            answer: "Access Denied: As a farmer member, you are only permitted to query your own delivery records and statement balances.",
            options: getFollowUpOptions()
          };
        }
      }
      
      const cols = collections.filter(c => c.farmer_id === matchedFarmer.id);
      const total = cols.reduce((sum, c) => sum + c.amount, 0);
      const qty = cols.reduce((sum, c) => sum + c.quantity, 0);
      const paid = cols.reduce((sum, c) => sum + (cols.amount_paid || 0), 0); // fallback check
      const pending = cols.reduce((sum, c) => sum + (cols.balance_pending || 0), 0);
      
      if (lang === 'ta') {
        return {
          answer: `${matchedFarmer.name} மொத்தம் ${cols.length} விநியோகங்களை (${qty.toFixed(1)} அலகுகள்) செய்துள்ளார். கணக்கு விவரம்: மொத்த மதிப்பு: ${formatCurrency(total)}, செலுத்திய தொகை: ${formatCurrency(paid)}, நிலுவைத் தொகை: ${formatCurrency(pending)}.`,
          options: getFollowUpOptions()
        };
      } else {
        return {
          answer: `${matchedFarmer.name} has delivered ${cols.length} loads totaling ${qty.toFixed(1)} units. Statement Summary: Gross Value: ${formatCurrency(total)}, Amount Paid: ${formatCurrency(paid)}, Balance Pending: ${formatCurrency(pending)}.`,
          options: getFollowUpOptions()
        };
      }
    }

    // 3. Dynamic Crop-wise lookup: "how much tomato was collected" / "banana collection total"
    const tamilCropMap = {
      'தக்காளி': 'tomato',
      'வெங்காயம்': 'onion',
      'முருங்கை': 'drumstick',
      'வாழை': 'banana',
      'நெல்': 'paddy',
      'பால்': 'milk'
    };
    
    let matchedCrop = produce.find(p => query.includes(p.name.toLowerCase()));
    if (!matchedCrop) {
      const matchedKey = Object.keys(tamilCropMap).find(key => query.includes(key));
      if (matchedKey) {
        matchedCrop = produce.find(p => p.name.toLowerCase() === tamilCropMap[matchedKey]);
      }
    }

    const isCropQuery = (query.includes('collected') || query.includes('collection') || query.includes('quantity') || query.includes('deliver') || query.includes('volume') ||
                         query.includes('சேகரிப்பு') || query.includes('அளவு') || query.includes('விநியோகம்') || query.includes('மொத்தம்'));
    if (matchedCrop && isCropQuery) {
      const cropCols = collections.filter(c => 
        c.produce_name.toLowerCase() === matchedCrop.name.toLowerCase() &&
        (!isFarmer || c.farmer_id === user.id)
      );
      const qty = cropCols.reduce((sum, c) => sum + c.quantity, 0);
      const amt = cropCols.reduce((sum, c) => sum + c.amount, 0);
      
      if (isFarmer) {
        if (lang === 'ta') {
          return {
            answer: `நீங்கள் மொத்தம் ${qty.toFixed(1)} ${matchedCrop.unit} ${matchedCrop.name} விநியோகம் செய்துள்ளீர்கள், இதன் மதிப்பு ${formatCurrency(amt)} ஆகும்.`,
            options: getFollowUpOptions()
          };
        } else {
          return {
            answer: `You have delivered a total of ${qty.toFixed(1)} ${matchedCrop.unit} of ${matchedCrop.name}, worth ${formatCurrency(amt)}.`,
            options: getFollowUpOptions()
          };
        }
      } else {
        if (lang === 'ta') {
          return {
            answer: `கூட்டுறவு சங்கத்தில் மொத்தம் ${qty.toFixed(1)} ${matchedCrop.unit} ${matchedCrop.name} சேகரிக்கப்பட்டுள்ளது (${cropCols.length} விநியோகங்கள்), இதன் மொத்த மதிப்பு ${formatCurrency(amt)} ஆகும்.`,
            options: getFollowUpOptions()
          };
        } else {
          return {
            answer: `Cooperative total for ${matchedCrop.name}: ${qty.toFixed(1)} ${matchedCrop.unit} collected across ${cropCols.length} batches, worth ${formatCurrency(amt)} in payouts.`,
            options: getFollowUpOptions()
          };
        }
      }
    }

    // 4. Dynamic Today's summary lookup: "show today's collection"
    const isTodayQuery = (query.includes('today') && (query.includes('collection') || query.includes('delivery') || query.includes('deliveries') || query.includes('today\'s'))) ||
                         (query.includes('இன்று') || query.includes('இன்றைய'));
    if (isTodayQuery) {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayCols = collections.filter(c => 
        c.collection_date === todayStr &&
        (!isFarmer || c.farmer_id === user.id)
      );
      const amt = todayCols.reduce((sum, c) => sum + c.amount, 0);
      
      if (isFarmer) {
        if (lang === 'ta') {
          return {
            answer: `நீங்கள் இன்று ${todayCols.length} பயிர் விநியோகங்களைச் செய்துள்ளீர்கள், இதன் மொத்த மதிப்பு ${formatCurrency(amt)}.`,
            options: getFollowUpOptions()
          };
        } else {
          return {
            answer: `You have delivered ${todayCols.length} crop batches today, worth a total of ${formatCurrency(amt)}.`,
            options: getFollowUpOptions()
          };
        }
      } else {
        if (lang === 'ta') {
          return {
            answer: `இன்று, CropLedger விவசாயிகளிடமிருந்து ${todayCols.length} பயிர் விநியோகங்களைப் பதிவு செய்துள்ளது, இதன் மொத்த மதிப்பு ${formatCurrency(amt)} ஆகும்.`,
            options: getFollowUpOptions()
          };
        } else {
          return {
            answer: `Today, CropLedger recorded ${todayCols.length} produce deliveries from members, totaling ${formatCurrency(amt)} in value.`,
            options: getFollowUpOptions()
          };
        }
      }
    }

    // Check if query exactly matches a predefined question in activeFaq
    const activeFaq = lang === 'ta' ? faqDataTa : faqData;
    const exactMatch = activeFaq.find(q => q.question.toLowerCase() === query);
    if (exactMatch) {
      return {
        answer: exactMatch.answer,
        options: getFollowUpOptions(exactMatch.question)
      };
    }

    // Filter questions containing the query keywords
    const matches = activeFaq.filter(q => 
      q.question.toLowerCase().includes(query) || 
      q.answer.toLowerCase().includes(query)
    );

    if (matches.length === 1) {
      return {
        answer: matches[0].answer,
        options: getFollowUpOptions(matches[0].question)
      };
    } else if (matches.length > 1) {
      if (lang === 'ta') {
        return {
          answer: `"${rawQuery}" தொடர்பான பல தலைப்புகளை நான் கண்டறிந்துள்ளேன். விவரங்களைப் பார்க்க கீழே உள்ள பரிந்துரைகளில் ஒன்றை அழுத்தவும்:`,
          options: matches.slice(0, 3).map(m => m.question)
        };
      } else {
        return {
          answer: `I found multiple topics related to "${rawQuery}". Please click one of the suggestions below to view details:`,
          options: matches.slice(0, 3).map(m => m.question)
        };
      }
    }

    // Split words for keyword match
    const keywords = query.split(' ').filter(w => w.length > 2);
    if (keywords.length > 0) {
      const keywordMatches = activeFaq.filter(q => 
        keywords.some(kw => q.question.toLowerCase().includes(kw) || q.answer.toLowerCase().includes(kw))
      );
      if (keywordMatches.length > 0) {
        if (lang === 'ta') {
          return {
            answer: `என்னால் நேரடி பதிலைக் கண்டறிய முடியவில்லை, ஆனால் சில பரிந்துரைகள் இதோ:`,
            options: keywordMatches.slice(0, 3).map(m => m.question)
          };
        } else {
          return {
            answer: `I couldn't find a direct match, but here are some related suggestions:`,
            options: keywordMatches.slice(0, 3).map(m => m.question)
          };
        }
      }
    }

    // Fallback if no matching keyword
    if (lang === 'ta') {
      return {
        answer: `எனது பதிவேட்டில் இதற்கான கேள்வியை என்னால் கண்டுபிடிக்க முடியவில்லை. இந்த பொதுவான தலைப்புகளில் ஒன்றைத் தேர்ந்தெடுக்கவும்:`,
        options: getFollowUpOptions()
      };
    } else {
      return {
        answer: "I couldn't find a question in my register matches. Try choosing one of these general topics:",
        options: getFollowUpOptions()
      };
    }
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

    // If language is not selected yet
    if (!lang) {
      const selected = textToSend.trim().toLowerCase();
      setTimeout(() => {
        if (selected === 'english') {
          setLang('en');
          const aiMsg = {
            id: crypto.randomUUID(),
            sender: 'assistant',
            text: WELCOME_MESSAGES['en'],
            timestamp: new Date()
          };
          setMessages((prev) => [...prev, aiMsg]);
          setActiveOptions(DEFAULT_OPTIONS['en']);
        } else if (selected === 'tamil' || selected === 'தமிழ்') {
          setLang('ta');
          const aiMsg = {
            id: crypto.randomUUID(),
            sender: 'assistant',
            text: WELCOME_MESSAGES['ta'],
            timestamp: new Date()
          };
          setMessages((prev) => [...prev, aiMsg]);
          setActiveOptions(DEFAULT_OPTIONS['ta']);
        } else {
          const aiMsg = {
            id: crypto.randomUUID(),
            sender: 'assistant',
            text: "Please select one of the language options: 'English' or 'Tamil'. / தயவுசெய்து 'English' அல்லது 'Tamil' ஆகியவற்றில் ஒன்றைத் தேர்ந்தெடுக்கவும்.",
            timestamp: new Date()
          };
          setMessages((prev) => [...prev, aiMsg]);
          setActiveOptions(["English", "Tamil"]);
        }
      }, 300);
      return;
    }

    // Reset language command
    if (textToSend.trim().toLowerCase() === 'change language' || textToSend.trim().toLowerCase() === 'மொழியை மாற்று' || textToSend.trim().toLowerCase() === 'reset language') {
      setTimeout(() => {
        setLang(null);
      }, 300);
      return;
    }

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
      <div className="border-b border-warm-border/50 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-green tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-leaf-green animate-pulse" />
            <span>
              {!lang 
                ? 'CropLedger Assistant / உதவியாளர்' 
                : lang === 'ta' 
                ? 'CropLedger ஊடாடும் உதவியாளர்' 
                : 'CropLedger Interactive Assistant'}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-semibold">
            {!lang
              ? 'Please select your language inside the chat to start / தொடங்குவதற்கு மொழியைத் தேர்ந்தெடுக்கவும்'
              : lang === 'ta'
              ? 'உதவிக்குறிப்புகள் அல்லது தேடல் வார்த்தைகளைக் கிளிக் செய்து பதில்களைப் பெறலாம்'
              : 'Click quick options or search keywords to access CropLedger documentation'}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#eef8f4] text-[#2d6a4f] text-xs font-extrabold rounded-full border border-[#d7f1e6]">
          <BookOpen className="h-3.5 w-3.5" />
          <span>{lang === 'ta' ? '100 கேள்விகள்' : '100 Programmed'}</span>
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="bg-white rounded-2xl border border-warm-border/60 shadow-sm flex flex-col h-[550px] relative overflow-hidden">
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
                    ? 'bg-primary-green text-white border-primary-green'
                    : 'bg-[#faf9f5] text-slate-600 border-warm-border/50'
                }`}
              >
                {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-leaf-green" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-primary-green text-white shadow-sm rounded-tr-none font-semibold'
                    : 'bg-warm-cream/20 text-[#3d3a35] border border-warm-border/30 rounded-tl-none font-semibold shadow-sm'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          ))}
          
          <div ref={chatEndRef} />
        </div>

        {/* Quick Options Selection Area */}
        <div className="px-6 pb-4 pt-2 border-t border-warm-border/30 bg-[#faf9f5]/30">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {!lang
              ? 'Please select your preferred language / ஒரு மொழியைத் தேர்ந்தெடுக்கவும்:'
              : lang === 'ta'
              ? 'தொடர்புடைய கேள்வி ஒன்றைத் தேர்ந்தெடுக்கவும்:'
              : 'Select a follow-up option:'}
          </p>
          <div className="flex flex-col gap-2">
            {activeOptions.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(opt)}
                className="w-full text-left px-4 py-2.5 bg-white border border-warm-border/40 hover:border-leaf-green hover:bg-leaf-green/5 text-xs text-[#3d3a35] hover:text-primary-green rounded-xl font-bold transition flex items-center justify-between group shadow-sm cursor-pointer"
              >
                <span className="truncate pr-4">"{opt}"</span>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-leaf-green transition shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Autocomplete suggestions menu popup */}
        {suggestions.length > 0 && (
          <div className="absolute bottom-[72px] left-4 right-4 bg-white border border-warm-border/50 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto divide-y divide-warm-border/30 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSend(s.question)}
                className="w-full text-left px-4 py-2.5 hover:bg-[#faf9f5] text-xs text-[#3d3a35] hover:text-primary-green font-bold flex items-center justify-between group transition cursor-pointer"
              >
                <span className="truncate pr-3">{s.question}</span>
                <span className="text-[10px] text-slate-400 bg-slate-100 group-hover:bg-leaf-green/10 group-hover:text-leaf-green px-2 py-0.5 rounded-full font-bold transition">
                  {s.category}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Chat Text Input Bar */}
        <div className="p-4 border-t border-warm-border/40 flex gap-2 items-center bg-[#faf9f5]/50">
          <div className="relative flex-1">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={
                !lang
                  ? "Choose language from the buttons below / மொழியைத் தேர்ந்தெடுக்கவும்..."
                  : lang === 'ta'
                  ? "முக்கிய வார்த்தைகளைத் தேடுக (எ.கா. 'பணம்', 'தக்காளி', 'விவசாயி')..."
                  : "Search by keywords (e.g., 'payout', 'banana', 'register')..."
              }
              className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent font-semibold shadow-sm"
              disabled={!lang}
            />
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
            {queryInput && (
              <button 
                onClick={() => setQueryInput('')} 
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => handleSend()}
            className="h-10 px-4 bg-primary-green hover:bg-leaf-green text-white rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary-green/10 hover:shadow-lg transition shrink-0 font-bold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!lang}
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">
              {lang === 'ta' ? 'கேள்' : 'Ask'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
