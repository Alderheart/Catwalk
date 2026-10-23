// The allowed values for patrol fields. Stored as plain strings in the
// database, so these lists are the source of truth for validation.

// Only hunting for now. Add a type here together with its outcome roller
export const PATROL_TYPES = ['hunting'] as const
export type PatrolType = (typeof PATROL_TYPES)[number]

// active: out of camp. completed: rewards collected
export const PATROL_STATUSES = ['active', 'completed'] as const
export type PatrolStatus = (typeof PATROL_STATUSES)[number]

export const PATROL_ROLES = ['leader', 'member'] as const
export type PatrolRole = (typeof PATROL_ROLES)[number]

// One leader plus up to this many members
export const MAX_PATROL_MEMBERS = 3
