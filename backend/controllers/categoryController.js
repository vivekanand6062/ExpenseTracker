import Category, { DEFAULT_CATEGORIES } from '../models/categoryModel.js';

// Auto-seed default categories if not in DB
export const ensureDefaultCategories = async () => {
  try {
    const count = await Category.countDocuments({ isDefault: true, userId: null });
    if (count < DEFAULT_CATEGORIES.length) {
      for (const cat of DEFAULT_CATEGORIES) {
        await Category.updateOne(
          { name: cat.name, type: cat.type, userId: null },
          { $set: cat },
          { upsert: true }
        );
      }
      console.log('Default categories initialized.');
    }
  } catch (err) {
    console.error('Error ensuring default categories:', err);
  }
};

// Get all categories available to the user (system default + user custom)
export const getCategories = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const categories = await Category.find({
      $or: [{ userId: null, isDefault: true }, { userId }],
    }).sort({ type: 1, name: 1 });

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('getCategories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

// Create a custom category
export const addCategory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, type, icon, color } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, message: 'Name and type are required' });
    }

    // Check if category already exists for user or system
    const existing = await Category.findOne({
      name: new RegExp(`^${name.trim()}$`, 'i'),
      type,
      $or: [{ userId: null }, { userId }],
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({
      name: name.trim(),
      type,
      icon: icon || 'Tag',
      color: color || '#8b5cf6',
      isDefault: false,
      userId,
    });

    res.status(201).json({
      success: true,
      category,
      message: 'Category created successfully',
    });
  } catch (error) {
    console.error('addCategory error:', error);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};

// Update custom category
export const updateCategory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { name, icon, color } = req.body;

    const category = await Category.findOne({ _id: id, userId });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or cannot be modified',
      });
    }

    if (name) category.name = name.trim();
    if (icon) category.icon = icon;
    if (color) category.color = color;

    await category.save();

    res.json({
      success: true,
      category,
      message: 'Category updated successfully',
    });
  } catch (error) {
    console.error('updateCategory error:', error);
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
};

// Delete custom category
export const deleteCategory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const category = await Category.findOne({ _id: id, userId, isDefault: false });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or default system category cannot be deleted',
      });
    }

    await Category.deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('deleteCategory error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
};
