// src/services/meeting.service.ts
// This service previously referenced a Prisma model `Meeting` that does not exist in the current schema.
// To keep the project compiling, we provide a minimal stub that avoids importing non-existent Prisma types.

export type MeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type ParticipantRole = 'ORGANIZER' | 'PARTICIPANT'

export interface CreateMeetingData {
  title: string
  description?: string
  startTime: Date
  endTime?: Date
  location?: string
  tenantId: string
  createdById: string
  participantIds?: string[]
}

export interface UpdateMeetingData {
  title?: string
  description?: string
  startTime?: Date
  endTime?: Date
  location?: string
  status?: MeetingStatus
}

export interface MeetingFilters {
  tenantId: string
  status?: MeetingStatus
  createdById?: string
  participantId?: string
  startDate?: Date
  endDate?: Date
  search?: string
}

export interface CreateMeetingMinuteData {
  meetingId: string
  content: string
  summary?: string
  actionItems?: any
}

export class MeetingService {
  static async create(_data: CreateMeetingData) {
    throw new Error('Meeting model is not available in the current Prisma schema. Use meetingMinuteService for minutes management.')
  }

  static async findById(_id: string, _tenantId: string) {
    throw new Error('Meeting model is not available in the current Prisma schema.')
  }

  static async findMany(_filters: MeetingFilters, _page: number = 1, _limit: number = 20) {
    throw new Error('Meeting model is not available in the current Prisma schema.')
  }

  static async update(_id: string, _tenantId: string, _data: UpdateMeetingData) {
    throw new Error('Meeting model is not available in the current Prisma schema.')
  }

  static async addParticipant(_meetingId: string, _tenantId: string, _userId: string, _role: ParticipantRole = 'PARTICIPANT') {
    throw new Error('Meeting model is not available in the current Prisma schema.')
  }

  static async removeParticipant(_meetingId: string, _tenantId: string, _userId: string) {
    throw new Error('Meeting model is not available in the current Prisma schema.')
  }

  static async start(_id: string, _tenantId: string) {
    throw new Error('Meeting model is not available in the current Prisma schema.')
  }

  static async finish(_id: string, _tenantId: string) {
    throw new Error('Meeting model is not available in the current Prisma schema.')
  }

  static async cancel(_id: string, _tenantId: string) {
    throw new Error('Meeting model is not available in the current Prisma schema.')
  }

  static async delete(_id: string, _tenantId: string) {
    throw new Error('Meeting model is not available in the current Prisma schema.')
  }

  static async createMinute(_data: CreateMeetingMinuteData) {
    throw new Error('Meeting model is not available in the current Prisma schema. Use meetingMinuteService.create for minutes.')
  }

  static async updateMinute(_meetingId: string, _data: { content?: string; summary?: string; actionItems?: any }) {
    throw new Error('Meeting model is not available in the current Prisma schema. Use meetingMinuteService.update for minutes.')
  }

  static async findToday(_tenantId: string) {
    throw new Error('Meeting model is not available in the current Prisma schema.')
  }

  static async findUpcoming(_tenantId: string, _days: number = 7) {
    throw new Error('Meeting model is not available in the current Prisma schema.')
  }

  static async getStats(_tenantId: string) {
    throw new Error('Meeting model is not available in the current Prisma schema.')
  }
}