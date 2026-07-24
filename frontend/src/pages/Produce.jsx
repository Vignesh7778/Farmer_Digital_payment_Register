import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { db } from '../services/db';
import { PRODUCE_UNITS } from '../constants';
import toast from 'react-hot-toast';
import {
  Sprout,
  Plus,
  Trash2,
  AlertCircle,
  Tag,
  Scale
} from 'lucide-react';

export default function Produce() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch Crops
  const { data: produce = [], isLoading, isError, error } = useQuery({
    queryKey: ['produce'],
    queryFn: () => db.getProduce(),
  });

  // Add Crop Mutation
  const addMutation = useMutation({
    mutationFn: (item) => db.addProduce(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produce'] });
      toast.success('Crop type added to registry!');
      reset();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to add produce type');
    },
  });

  // Delete Crop Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => db.deleteProduce(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produce'] });
      toast.success('Crop deleted successfully');
    },
    onError: (err) => {
      // Handles Task 5 database errors demonstration:
      toast.error(err.message || 'Foreign key violation: Crop in use.');
    },
  });

  const onSubmit = (data) => {
    addMutation.mutate(data);
  };

  const confirmDelete = (item) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}? This will fail if there are deliveries recorded under this crop.`)) {
      deleteMutation.mutate(item.id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-warm-border/50 pb-5">
        <h1 className="text-2xl font-extrabold text-primary-green tracking-tight">🌾 Produce Crop Registry</h1>
        <p className="text-sm text-slate-500 mt-1 font-semibold">Configure types of crops collected at the center and billing units</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Produce list (Left, takes 2 cols) */}
        <div className="md:col-span-2 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-[#f4f1ea] animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : isError ? (
            <div className="bg-rose-50 text-rose-700 border border-rose-100 rounded-xl p-4 flex gap-3 items-center">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm font-bold">{error?.message || 'Error fetching produce types.'}</span>
            </div>
          ) : produce.length === 0 ? (
            <div className="bg-white border border-warm-border/60 rounded-xl p-12 text-center flex flex-col items-center">
              <div className="h-12 w-12 bg-warm-cream/50 border border-warm-border/40 rounded-full flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                <Sprout className="h-6 w-6 text-leaf-green" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm">No Crops Registered</h3>
              <p className="text-xs text-slate-400 mt-1 font-semibold">Configure your FPG catalog by adding a crop on the right panel.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-warm-border/60 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#faf9f5] border-b border-warm-border/40 text-earth-brown font-bold text-xs uppercase tracking-wider">
                    <th className="px-6 py-4">Crop Name</th>
                    <th className="px-6 py-4">Standard Billing Unit</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-border/30 text-earth-brown font-semibold">
                  {produce.map((item) => (
                    <tr key={item.id} className="hover:bg-[#faf9f5]/30 transition duration-150">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="h-8 w-8 bg-leaf-green/10 rounded-lg flex items-center justify-center text-leaf-green border border-leaf-green/20 shadow-sm">
                          <Tag className="h-4 w-4" />
                        </div>
                        <span className="font-extrabold text-slate-800">{item.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-leaf-green/5 text-leaf-green text-xs px-2.5 py-1 rounded-lg font-bold border border-leaf-green/20 inline-flex items-center gap-1.5">
                          <Scale className="h-3 w-3" />
                          <span>{item.unit}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => confirmDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete Crop"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Produce Form (Right, 1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-warm-border/60 shadow-sm space-y-6">
          <div className="border-b border-warm-border/40 pb-3">
            <h2 className="font-extrabold text-primary-green text-base flex items-center gap-2">
              <Sprout className="h-5 w-5 text-leaf-green" />
              <span>Add Crop Type</span>
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-earth-brown uppercase tracking-wider mb-2">Crop/Produce Name</label>
              <input
                type="text"
                {...register('name', { required: 'Crop name is required' })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent font-semibold bg-slate-50/30"
                placeholder="E.g., Tomato, Banana"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-earth-brown uppercase tracking-wider mb-2">Billing Unit</label>
              <select
                {...register('unit', { required: 'Unit selection is required' })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent font-semibold bg-slate-50/30 cursor-pointer"
              >
                <option value="">Select unit</option>
                {PRODUCE_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
              {errors.unit && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.unit.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary-green hover:bg-leaf-green text-white rounded-xl text-sm font-bold tracking-wide shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Add Crop</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
