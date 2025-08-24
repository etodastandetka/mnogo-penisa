const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Bank', 'QR', 'Cash'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  receiptFile: {
    type: String, // URL к файлу чека
    required: false
  },
  note: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Receipt', receiptSchema);
