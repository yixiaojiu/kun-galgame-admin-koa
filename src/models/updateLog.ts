import mongoose from '@/db/connection'
import increasingSequence from '@/middleware/increasingSequence'

import { UpdateLogAttributes } from './types/updateLog'

const UpdateLogSchema = new mongoose.Schema<UpdateLogAttributes>(
  {
    upid: { type: Number, unique: true },
    description: { type: String, required: true, default: '' },
    time: { type: Number, required: false, default: Date.now() },
    version: { type: String, required: false, default: '' },
  },
  { timestamps: { createdAt: 'created', updatedAt: 'updated' } }
)

UpdateLogSchema.pre('save', increasingSequence('upid'))

const UpdateLogModel = mongoose.model<UpdateLogAttributes>(
  'update_log',
  UpdateLogSchema
)

export default UpdateLogModel
