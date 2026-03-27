const Item = require('../models/Item');
const { AppError } = require('../middleware/errorHandler');

// ── GET /api/data ───────────────────────────────────────────────────────────
const getAllItems = async (req, res, next) => {
  try {
    const { category, status, priority, page = 1, limit = 20 } = req.query;

    const filter = { owner: req.user._id };
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Item.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Item.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/data ──────────────────────────────────────────────────────────
const createItem = async (req, res, next) => {
  try {
    const { title, description, category, status, priority } = req.body;

    if (!title || !title.trim()) {
      throw new AppError('Title is required.', 400);
    }
    if (!category || !['task', 'lead', 'user'].includes(category)) {
      throw new AppError('Category must be one of: task, lead, user.', 400);
    }

    const newItem = await Item.create({
      title: title.trim(),
      description: description?.trim() || '',
      category,
      status: status || 'active',
      priority: priority || 'medium',
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Item created successfully.',
      data: newItem,
    });
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/data/:id ───────────────────────────────────────────────────────
const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority } = req.body;

    const item = await Item.findOne({ _id: id, owner: req.user._id });
    if (!item) {
      throw new AppError('Item not found or you do not have permission to edit it.', 404);
    }

    // Apply updates
    if (title !== undefined) item.title = title.trim();
    if (description !== undefined) item.description = description.trim();
    if (status !== undefined) item.status = status;
    if (priority !== undefined) item.priority = priority;

    await item.save();

    res.json({
      success: true,
      message: 'Item updated successfully.',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/data/:id ────────────────────────────────────────────────────
const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await Item.findOneAndDelete({ _id: id, owner: req.user._id });
    if (!item) {
      throw new AppError('Item not found or you do not have permission to delete it.', 404);
    }

    res.json({
      success: true,
      message: 'Item deleted successfully.',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllItems, createItem, updateItem, deleteItem };
