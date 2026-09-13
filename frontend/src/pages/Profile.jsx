import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Key,
  LogOut,
  Edit3,
  X,
  Check,
  Shield,
  Mail,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import ChangePasswordModal from '../components/ChangePasswordModal';
import Spinner from '../components/Spinner';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const handleStartEdit = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setName(user?.name || '');
    setEmail(user?.email || '');
    setError('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Both name and email are required.');
      toast.error('Both name and email are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.put('/user/profile', {
        name: name.trim(),
        email: email.trim(),
      });

      if (res.data?.success && res.data?.user) {
        updateUser(res.data.user);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          Manage your personal details, credentials, session security, and preferences on ArthSetu AI.
        </p>
      </div>

      {/* Profile Header Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-teal-600 to-teal-800 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-teal-700/20 shrink-0">
          {userInitial}
        </div>
        <div className="text-center sm:text-left space-y-1.5">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {user?.name || 'ArthSetu Member'}
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
              <Sparkles size={11} className="text-teal-600" />
              Active Member
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1.5">
            <Mail size={13} className="text-slate-400" />
            <span>{user?.email || 'user@arthsetu.ai'}</span>
          </p>
        </div>
      </div>

      {/* Error Alert Box */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2.5 font-medium"
        >
          <AlertCircle size={17} className="shrink-0 text-rose-500" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Personal Information Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Personal Details
                  </h3>
                  <p className="text-[11px] text-slate-400">Public profile identity</p>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={handleStartEdit}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border-2 border-transparent focus:border-teal-600 rounded-2xl px-4 py-2.5 text-slate-900 text-xs focus:outline-none transition shadow-2xs"
                  />
                ) : (
                  <p className="text-xs sm:text-sm font-bold text-slate-800 py-1.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
                    {user?.name || 'N/A'}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border-2 border-transparent focus:border-teal-600 rounded-2xl px-4 py-2.5 text-slate-900 text-xs focus:outline-none transition shadow-2xs"
                  />
                ) : (
                  <p className="text-xs sm:text-sm font-bold text-slate-800 py-1.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
                    {user?.email || 'N/A'}
                  </p>
                )}
              </div>

              {/* Editing Action Buttons */}
              {isEditing && (
                <div className="flex items-center gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="flex-1 py-2.5 text-xs border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <X size={14} />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 text-xs bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 text-white rounded-xl font-bold shadow-md shadow-teal-700/20 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {loading ? <Spinner size="sm" /> : <Check size={14} />}
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Mail size={13} className="text-slate-400 shrink-0" />
            <span>Email is used for ArthSetu AI authentication, reports, and security alerts.</span>
          </div>
        </div>

        {/* Right Column: Account Security & Credentials */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                <Shield size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Account Security
                </h3>
                <p className="text-[11px] text-slate-400">Password & session control</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Password Status Card */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white text-teal-700 rounded-xl shadow-2xs border border-slate-100">
                    <Key size={17} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Password Protection</h4>
                    <p className="text-[11px] text-slate-400 tracking-widest font-mono">••••••••••••</p>
                  </div>
                </div>

                <button
                  onClick={() => setPasswordModalOpen(true)}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/80 border border-teal-200/60 px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Advisory note */}
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                Make sure your password is at least 8 characters long and contains a mix of letters, numbers, and symbols to ensure maximum security for your financial vault.
              </div>
            </div>
          </div>

          {/* Session Logout Action */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-rose-600 bg-rose-50/80 hover:bg-rose-100 border border-rose-200/60 transition cursor-pointer text-xs"
            >
              <LogOut size={15} />
              <span>Sign Out of ArthSetu AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </motion.div>
  );
};

export default Profile;
