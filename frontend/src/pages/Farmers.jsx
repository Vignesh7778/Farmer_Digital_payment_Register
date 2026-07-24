import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { db } from '../services/db';
import toast from 'react-hot-toast';
import {
  UserPlus,
  Edit2,
  Trash2,
  Search,
  MapPin,
  Phone,
  User,
  X,
  AlertCircle,
  Plus
} from 'lucide-react';

export default function Farmers() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingFarmer, setEditingFarmer] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Fetch Farmers Query
  const { data: farmers = [], isLoading, isError, error } = useQuery({
    queryKey: ['farmers'],
    queryFn: () => db.getFarmers(),
  });

  // Add Farmer Mutation
  const addMutation = useMutation({
    mutationFn: (newFarmer) => db.addFarmer(newFarmer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Farmer registered successfully!');
      reset();
      setIsAdding(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to register farmer');
    },
  });

  // Edit Farmer Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, fields }) => db.updateFarmer(id, fields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Farmer profile updated!');
      setEditingFarmer(null);
      reset();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update farmer');
    },
  });

  // Delete Farmer Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => db.deleteFarmer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Farmer deleted successfully');
      if (editingFarmer && editingFarmer.id === editingFarmer) {
        setEditingFarmer(null);
      }
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete farmer');
    },
  });

  // Filter farmers by search query
  const filteredFarmers = farmers.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.phone.includes(searchQuery) ||
    f.village.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEdit = (farmer) => {
    setIsAdding(false);
    setEditingFarmer(farmer);
    setValue('name', farmer.name);
    setValue('phone', farmer.phone);
    setValue('village', farmer.village);
  };

  const cancelAction = () => {
    setEditingFarmer(null);
    setIsAdding(false);
    reset();
  };

  const handleFormSubmit = (data) => {
    if (editingFarmer) {
      updateMutation.mutate({ id: editingFarmer.id, fields: data });
    } else {
      addMutation.mutate(data);
    }
  };

  const confirmDelete = (farmer) => {
    if (window.confirm(`Are you sure you want to delete ${farmer.name}? All their deliveries will be permanently deleted too.`)) {
      deleteMutation.mutate(farmer.id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-warm-border/50 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-green tracking-tight">🌾 Farmer Management</h1>
          <p className="text-sm text-slate-500 mt-1 font-semibold">Add, update, or remove members of the Farmer Producer Group</p>
        </div>
        {!isAdding && !editingFarmer && (
          <button
            onClick={() => {
              setIsAdding(true);
              reset();
            }}
            className="px-4 py-2.5 bg-primary-green hover:bg-leaf-green text-white rounded-xl text-sm font-bold tracking-wide shadow-md shadow-primary-green/10 transition flex items-center gap-1.5 self-start cursor-pointer"
          >
            <UserPlus className="h-4.5 w-4.5" />
            <span>Register Farmer</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Farmers List - Takes 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-warm-border/60 shadow-sm flex items-center gap-3">
            <Search className="text-slate-400 h-5 w-5 shrink-0" />
            <input
              type="text"
              placeholder="Search by farmer name, phone number, or village..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm text-slate-800 focus:outline-none placeholder-slate-400 font-semibold"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-[#f4f1ea] animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : isError ? (
            <div className="bg-rose-50 text-rose-700 border border-rose-100 rounded-xl p-4 flex gap-3 items-center">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm font-bold">{error?.message || 'Error fetching farmers data.'}</span>
            </div>
          ) : filteredFarmers.length === 0 ? (
            <div className="bg-white border border-warm-border/60 rounded-xl p-12 text-center flex flex-col items-center">
              <div className="h-12 w-12 bg-warm-cream/50 border border-warm-border/40 rounded-full flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                <User className="h-6 w-6 text-leaf-green" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm">No Farmers Found</h3>
              <p className="text-xs text-slate-400 mt-1 font-semibold">Try refining your search keyword or add a new farmer.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredFarmers.map((farmer) => (
                <div
                  key={farmer.id}
                  className={`p-5 bg-white border rounded-2xl shadow-sm hover-lift flex flex-col justify-between gap-4 ${
                    editingFarmer && editingFarmer.id === farmer.id ? 'border-leaf-green ring-2 ring-leaf-green/10' : 'border-warm-border/50'
                  }`}
                >
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-slate-800 text-base">{farmer.name}</h3>
                    <div className="space-y-1.5 text-xs text-slate-500 font-semibold">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-leaf-green" />
                        <span>{farmer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-leaf-green" />
                        <span>{farmer.village}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-warm-border/30">
                    <button
                      onClick={() => startEdit(farmer)}
                      className="p-1.5 text-slate-500 hover:text-leaf-green hover:bg-leaf-green/10 rounded-lg transition cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(farmer)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Delete Farmer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor Form Card - Takes 1 col */}
        <div className="bg-white rounded-2xl border border-warm-border/60 shadow-sm p-6 sticky top-24 space-y-6">
          {!isAdding && !editingFarmer ? (
            <div className="text-center py-10 flex flex-col items-center">
              <div className="h-12 w-12 bg-warm-cream/50 rounded-full flex items-center justify-center text-slate-400 mb-3 border border-warm-border/40 shadow-inner">
                <UserPlus className="h-6 w-6 text-leaf-green" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm">Select Profile or Action</h3>
              <p className="text-xs text-slate-450 mt-1 max-w-[200px] mx-auto font-semibold">
                Register a new farmer profile or edit an existing one from the list.
              </p>
              <button
                onClick={() => setIsAdding(true)}
                className="mt-4 inline-flex items-center gap-1 text-xs text-leaf-green hover:text-primary-green font-bold border border-leaf-green/30 hover:bg-leaf-green/5 py-2 px-3.5 rounded-xl transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Register Now</span>
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-warm-border/40 pb-3">
                <h2 className="font-extrabold text-primary-green text-base">
                  {editingFarmer ? 'Edit Farmer Profile' : 'Register New Farmer'}
                </h2>
                <button onClick={cancelAction} className="text-slate-400 hover:text-slate-650 rounded-full p-1 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-earth-brown uppercase tracking-wider mb-2">Farmer Name</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Farmer Name is required' })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent font-semibold bg-slate-50/30"
                    placeholder="E.g., Ravi Chandran"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-earth-brown uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="text"
                    {...register('phone', {
                      required: 'Phone Number is required',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Enter a valid 10-digit phone number',
                      }
                    })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent font-semibold bg-slate-50/30"
                    placeholder="10-digit number"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-earth-brown uppercase tracking-wider mb-2">Village</label>
                  <input
                    type="text"
                    {...register('village', { required: 'Village name is required' })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent font-semibold bg-slate-50/30"
                    placeholder="E.g., Melur"
                  />
                  {errors.village && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.village.message}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={cancelAction}
                    className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-primary-green hover:bg-leaf-green text-white rounded-xl text-sm font-bold shadow transition cursor-pointer"
                  >
                    {editingFarmer ? 'Save Profile' : 'Register'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
