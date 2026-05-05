const mongoose = require('mongoose');

const foodLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    calories: { type: Number, required: true, min: 1 },
    mealType: {
      type: String,
      required: true,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FoodLog', foodLogSchema);
