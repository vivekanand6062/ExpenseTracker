import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  Key,
  LogOut,
  Edit3,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import { profileStyles } from '../assets/dummyStyles';
import ChangePasswordModal from '../components/ChangePasswordModal';
import Toast from '../components/Toast';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

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
        setToastType('success');
        setToastMessage('Profile updated successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className={profileStyles.container}>
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage('')}
      />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Header Banner */}
        <div className={profileStyles.header}>
          <div className={profileStyles.avatar}>
            <span className="text-3xl font-bold text-white">{initial}</span>
          </div>
          <h1 className={profileStyles.userName}>{user?.name || 'User Profile'}</h1>
          <p className={profileStyles.userEmail}>{user?.email || 'user@example.com'}</p>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-10 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Card: Personal Information */}
            <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200/60">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-teal-600" />
                    <h2 className="text-lg font-bold text-gray-800">
                      Personal Details
                    </h2>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={handleStartEdit}
                      className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className={profileStyles.label}>Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={profileStyles.input}
                      />
                    ) : (
                      <p className="text-gray-900 font-semibold py-2">
                        {user?.name || 'N/A'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={profileStyles.label}>Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={profileStyles.input}
                      />
                    ) : (
                      <p className="text-gray-900 font-semibold py-2">
                        {user?.email || 'N/A'}
                      </p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex items-center gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={loading}
                        className="flex-1 py-2 text-sm border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 flex items-center justify-center gap-1.5"
                      >
                        <X size={16} />
                        <span>Cancel</span>
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2 text-sm bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <Check size={16} />
                        <span>{loading ? 'Saving...' : 'Save'}</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200/50 text-xs text-gray-500 flex items-center gap-1.5">
                <Mail size={14} className="text-gray-400" />
                <span>Email is used for account authentication and alerts.</span>
              </div>
            </div>

            {/* Right Card: Security Settings */}
            <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-4 mb-4 border-b border-gray-200/60">
                  <Shield className="w-5 h-5 text-teal-600" />
                  <h2 className="text-lg font-bold text-gray-800">
                    Account Security
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200/70 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                        <Key size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800">Password</h4>
                        <p className="text-xs text-gray-500">••••••••••••</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setPasswordModalOpen(true)}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Change
                    </button>
                  </div>

                  <div className="p-4 bg-white/70 rounded-xl border border-gray-200/40 text-xs text-gray-500 leading-relaxed">
                    Make sure your password is at least 8 characters long and contains a mix of letters, numbers, and symbols.
                  </div>
                </div>
              </div>

              {/* Logout Option */}
              <div className="mt-8 pt-4 border-t border-gray-200/60">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-red-600 hover:bg-red-50 border border-red-200/60 transition-colors text-sm"
                >
                  <LogOut size={16} />
                  <span>Log Out of Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSuccess={() => {
          setToastType('success');
          setToastMessage('Password changed successfully.');
        }}
      />
    </div>
  );
};

export default Profile;
