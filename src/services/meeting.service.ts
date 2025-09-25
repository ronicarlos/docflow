import { prisma } from '@/lib/prisma'
import { Meeting, MeetingStatus, ParticipantRole, Prisma } from '@prisma/client'

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
  // Criar reunião
  static async create(data: CreateMeetingData): Promise<Meeting> {
    const { participantIds, ...meetingData } = data

    return prisma.$transaction(async (tx) => {
      // Criar a reunião
      const meeting = await tx.meeting.create({
        data: meetingData,
        include: {
          createdBy: true,
          participants: {
            include: {
              user: true
            }
          }
        }
      })

      // Adicionar participantes se fornecidos
      if (participantIds && participantIds.length > 0) {
        await tx.meetingParticipant.createMany({
          data: participantIds.map(userId => ({
            meetingId: meeting.id,
            userId,
            role: userId === data.createdById ? ParticipantRole.ORGANIZER : ParticipantRole.PARTICIPANT
          }))
        })
      }

      // Retornar reunião com participantes
      return tx.meeting.findUniqueOrThrow({
        where: { id: meeting.id },
        include: {
          createdBy: true,
          participants: {
            include: {
              user: true
            }
          }
        }
      })
    })
  }

  // Buscar reunião por ID
  static async findById(id: string, tenantId: string): Promise<Meeting | null> {
    return prisma.meeting.findFirst({
      where: { 
        id, 
        tenantId 
      },
      include: {
        createdBy: true,
        participants: {
          include: {
            user: true
          }
        },
        minutes: true
      }
    })
  }

  // Listar reuniões com filtros
  static async findMany(
    filters: MeetingFilters,
    page: number = 1,
    limit: number = 20
  ) {
    const where: Prisma.MeetingWhereInput = {
      tenantId: filters.tenantId
    }

    // Aplicar filtros
    if (filters.status) where.status = filters.status
    if (filters.createdById) where.createdById = filters.createdById
    
    // Filtro por participante
    if (filters.participantId) {
      where.participants = {
        some: {
          userId: filters.participantId
        }
      }
    }

    // Filtro por data
    if (filters.startDate || filters.endDate) {
      where.startTime = {}
      if (filters.startDate) where.startTime.gte = filters.startDate
      if (filters.endDate) where.startTime.lte = filters.endDate
    }

    // Busca textual
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    const [meetings, total] = await Promise.all([
      prisma.meeting.findMany({
        where,
        include: {
          createdBy: true,
          participants: {
            include: {
              user: true
            }
          },
          minutes: {
            select: {
              id: true,
              summary: true
            }
          }
        },
        orderBy: { startTime: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.meeting.count({ where })
    ])

    return {
      meetings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  // Atualizar reunião
  static async update(
    id: string, 
    tenantId: string, 
    data: UpdateMeetingData
  ): Promise<Meeting> {
    return prisma.meeting.update({
      where: { 
        id,
        tenantId 
      },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        createdBy: true,
        participants: {
          include: {
            user: true
          }
        }
      }
    })
  }

  // Adicionar participante à reunião
  static async addParticipant(
    meetingId: string,
    tenantId: string,
    userId: string,
    role: ParticipantRole = ParticipantRole.PARTICIPANT
  ) {
    // Verificar se a reunião pertence ao tenant
    const meeting = await prisma.meeting.findFirst({
      where: { id: meetingId, tenantId }
    })

    if (!meeting) {
      throw new Error('Reunião não encontrada')
    }

    return prisma.meetingParticipant.create({
      data: {
        meetingId,
        userId,
        role
      },
      include: {
        user: true
      }
    })
  }

  // Remover participante da reunião
  static async removeParticipant(
    meetingId: string,
    tenantId: string,
    userId: string
  ) {
    // Verificar se a reunião pertence ao tenant
    const meeting = await prisma.meeting.findFirst({
      where: { id: meetingId, tenantId }
    })

    if (!meeting) {
      throw new Error('Reunião não encontrada')
    }

    return prisma.meetingParticipant.delete({
      where: {
        meetingId_userId: {
          meetingId,
          userId
        }
      }
    })
  }

  // Iniciar reunião
  static async start(id: string, tenantId: string): Promise<Meeting> {
    return prisma.meeting.update({
      where: { 
        id,
        tenantId 
      },
      data: {
        status: MeetingStatus.IN_PROGRESS,
        updatedAt: new Date()
      }
    })
  }

  // Finalizar reunião
  static async finish(id: string, tenantId: string): Promise<Meeting> {
    return prisma.meeting.update({
      where: { 
        id,
        tenantId 
      },
      data: {
        status: MeetingStatus.COMPLETED,
        endTime: new Date(),
        updatedAt: new Date()
      }
    })
  }

  // Cancelar reunião
  static async cancel(id: string, tenantId: string): Promise<Meeting> {
    return prisma.meeting.update({
      where: { 
        id,
        tenantId 
      },
      data: {
        status: MeetingStatus.CANCELLED,
        updatedAt: new Date()
      }
    })
  }

  // Deletar reunião
  static async delete(id: string, tenantId: string): Promise<void> {
    await prisma.meeting.delete({
      where: { 
        id,
        tenantId 
      }
    })
  }

  // Criar ata da reunião
  static async createMinute(data: CreateMeetingMinuteData) {
    return prisma.meetingMinute.create({
      data,
      include: {
        meeting: {
          include: {
            createdBy: true,
            participants: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })
  }

  // Atualizar ata da reunião
  static async updateMinute(
    meetingId: string,
    data: {
      content?: string
      summary?: string
      actionItems?: any
    }
  ) {
    return prisma.meetingMinute.update({
      where: { meetingId },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
  }

  // Buscar reuniões do dia
  static async findToday(tenantId: string) {
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    return prisma.meeting.findMany({
      where: {
        tenantId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        createdBy: true,
        participants: {
          include: {
            user: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    })
  }

  // Buscar próximas reuniões
  static async findUpcoming(tenantId: string, days: number = 7) {
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    return prisma.meeting.findMany({
      where: {
        tenantId,
        startTime: {
          gte: now,
          lte: futureDate
        },
        status: {
          in: [MeetingStatus.SCHEDULED, MeetingStatus.IN_PROGRESS]
        }
      },
      include: {
        createdBy: true,
        participants: {
          include: {
            user: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    })
  }

  // Estatísticas de reuniões
  static async getStats(tenantId: string) {
    const [
      total,
      thisMonth,
      byStatus,
      avgDuration
    ] = await Promise.all([
      prisma.meeting.count({
        where: { tenantId }
      }),
      prisma.meeting.count({
        where: {
          tenantId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.meeting.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true
      }),
      prisma.meeting.aggregate({
        where: {
          tenantId,
          status: MeetingStatus.COMPLETED,
          endTime: { not: null }
        },
        _avg: {
          // Calcular duração média seria mais complexo, precisaria de uma função SQL
        }
      })
    ])

    return {
      total,
      thisMonth,
      byStatus,
      avgDuration
    }
  }
}