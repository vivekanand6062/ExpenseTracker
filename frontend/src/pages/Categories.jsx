import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
  X,
  Briefcase,
  Laptop,
  TrendingUp,
  Building,
  Home,
  Utensils,
  ShoppingCart,
  Zap,
  Car,
  HeartPulse,
  Film,
  ShoppingBag,
  GraduationCap,
  Smile,
  Plane,
  CreditCard,
  HelpCircle,
  Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Spinner from '../components/Spinner';

// Icon mapper
const ICON_MAP = {
  Briefcase,
  Laptop,
  TrendingUp,
  Building,
  Home,
  Utensils,
  ShoppingCart,
  Zap,
  Car,
  HeartPulse,
  Film,
  ShoppingBag,
  GraduationCap,
  Smile,
  Plane,
  CreditCard,
  HelpCircle,
  Tag,
};

const COLOR_OPTIONS = [
  '#0d9488',
  '#0f766e',
  '#0284c7',
  '#10b981',
  '#d97706',
  '#ef4444',
  '#ec4899',
  '#6366f1',
  '#14b8a6',
  '#f97316',
  '#475569',
];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    color: '#0d9488',
    icon: 'Tag',
  });
  const [modalLoading, setModalLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      if (res.data?.success) {
        setCategories(res.data.categories || []);
      }
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setModalLoading(true);
    try {
      if (editingCat) {
        await api.put(`/categories/update/${editingCat._id}`, formData);
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories/add', formData);
        toast.success('Custom category created');
      }
      setModalOpen(false);
      setEditingCat(null);
      setFormData({ name: '', type: 'expense', color: '#0d9488', icon: 'Tag' });
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this custom category?')) return;
    try {
      await api.delete(`/categories/delete/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const openEdit = (cat) => {
    setEditingCat(cat);
    setFormData({
      name: cat.name,
      type: cat.type,
      color: cat.color || '#0d9488',
      icon: cat.icon || 'Tag',
    });
    setModalOpen(true);
  };

  const filteredCategories = categories.filter((c) => {
    if (filterType === 'all') return true;
    return c.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Category Manager
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Organize transactions with 17 default system categories or create customized tags.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCat(null);
            setFormData({ name: '', type: 'expense', color: '#0d9488', icon: 'Tag' });
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-teal-700/20 transition cursor-pointer shrink-0"
        >
          <Plus size={15} />
          <span>New Category</span>
        </button>
      </div>

      {/* Filter Tabs & Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60">
          {['all', 'expense', 'income'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
                filterType === t
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-semibold">
          {filteredCategories.length} Categories
        </span>
      </div>

      {/* Grid of Categories */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="md" className="text-teal-600" />
          <span className="text-xs font-semibold text-slate-400">Loading categories...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Tag;
            const isDefault = cat.isDefault;

            return (
              <motion.div
                key={cat._id}
                whileHover={{ y: -2 }}
                className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    <IconComponent size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{cat.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-medium">
                        {cat.type}
                      </span>
                      {isDefault && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded-md font-semibold">
                          <ShieldCheck size={10} className="text-emerald-500" />
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!isDefault && (
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {editingCat ? 'Edit Custom Category' : 'Create Custom Category'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Category Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Pet Care, Photography"
                    className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border-2 border-transparent focus:border-teal-600 rounded-2xl px-4 py-3 text-slate-900 text-sm focus:outline-none transition shadow-2xs"
                  />
                </div>

                {!editingCat && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Category Type</label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'expense' })}
                        className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          formData.type === 'expense'
                            ? 'bg-white text-rose-600 shadow-xs'
                            : 'text-slate-500'
                        }`}
                      >
                        Expense
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'income' })}
                        className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          formData.type === 'income'
                            ? 'bg-white text-emerald-600 shadow-xs'
                            : 'text-slate-500'
                        }`}
                      >
                        Income
                      </button>
                    </div>
                  </div>
                )}

                {/* Color Palette */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Accent Color</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: c })}
                        className={`h-7 w-7 rounded-xl transition cursor-pointer border-2 ${
                          formData.color === c ? 'border-slate-800 scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-3 rounded-2xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-teal-700/20 transition cursor-pointer disabled:opacity-60"
                  >
                    {modalLoading ? 'Saving...' : 'Save Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Categories;
