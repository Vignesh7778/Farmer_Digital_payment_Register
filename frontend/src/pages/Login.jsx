import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants';
import toast from 'react-hot-toast';
import { LogIn, Key, User } from 'lucide-react';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  if (user) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const onSubmit = async (data) => {
    const res = await login(data.login_uid, data.secret_key);
    if (res.success) {
      toast.success('Successfully logged in!');
      navigate(ROUTES.DASHBOARD);
    } else {
      toast.error(res.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-warm-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-warm-border/50 max-w-md w-full p-8 transition duration-300 hover:shadow-2xl">
        <div className="text-center mb-8">
          <div className="h-14 w-14 bg-leaf-green/10 text-primary-green rounded-2xl flex items-center justify-center mx-auto mb-4 border border-leaf-green/20 shadow-inner">
            <LogIn className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-primary-green tracking-tight">🌾 CropLedger Desk</h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">Smart produce register & payment settlement</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-earth-brown uppercase tracking-wider mb-2">Username / Phone</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <User className="h-4 w-4 text-leaf-green" />
              </span>
              <input
                type="text"
                {...register('login_uid', { required: 'Username or phone number is required' })}
                autoComplete="username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent text-sm text-slate-850 font-semibold bg-slate-50/50"
                placeholder="operator or farmer phone"
              />
            </div>
            {errors.login_uid && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.login_uid.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-earth-brown uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Key className="h-4 w-4 text-leaf-green" />
              </span>
              <input
                type="password"
                {...register('secret_key', { required: 'Password is required' })}
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent text-sm text-slate-850 font-semibold bg-slate-50/50"
                placeholder="Enter account password"
              />
            </div>
            {errors.secret_key && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.secret_key.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary-green hover:bg-leaf-green text-white rounded-xl text-sm font-bold tracking-wide shadow-md shadow-primary-green/10 transition flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <span>Login to Portal</span>
          </button>
        </form>
      </div>
    </div>
  );
}
