const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    category: {
      type: String,
      enum: ['task', 'lead', 'user'],
      required: [true, 'Category is required'],
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'completed', 'inactive'],
      default: 'active',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── Index for faster queries ────────────────────────────────────────────────
itemSchema.index({ owner: 1, category: 1 });

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
