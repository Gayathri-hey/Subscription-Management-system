import mongoose, { Schema, Document, Model } from 'mongoose';
import { IAuditLog } from '../types';

export interface IAuditLogDocument extends Omit<IAuditLog, '_id'>, Document {}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    actorRole: {
      type: String,
      trim: true,
      maxlength: [50, 'Actor role cannot exceed 50 characters'],
    },
    action: {
      type: String,
      required: [true, 'Audit action is required'],
      trim: true,
      index: true,
      maxlength: [100, 'Action cannot exceed 100 characters'],
    },
    entity: {
      type: String,
      required: [true, 'Audit target entity is required'],
      trim: true,
      index: true,
      maxlength: [100, 'Entity cannot exceed 100 characters'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Audit entity ID is required'],
      index: true,
    },
    previousState: {
      type: Schema.Types.Mixed,
    },
    newState: {
      type: Schema.Types.Mixed,
    },
    changes: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
      trim: true,
      maxlength: [45, 'IP address cannot exceed 45 characters'],
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: [500, 'User agent cannot exceed 500 characters'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Audit logs are immutable records
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for fast auditing and security investigations
auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog: Model<IAuditLogDocument> = mongoose.model<IAuditLogDocument>('AuditLog', auditLogSchema);
export default AuditLog;

