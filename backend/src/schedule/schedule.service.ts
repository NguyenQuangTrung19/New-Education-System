import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  create(createScheduleDto: CreateScheduleDto) {
    return this.prisma.scheduleItem.create({
      data: createScheduleDto,
    });
  }

  /**
   * Fetch schedule for a specific week using merge logic:
   * 1. Get all week-specific overrides (weekStartDate = target week)
   * 2. Get all base template items (weekStartDate = null)
   * 3. Merge: week-specific items take priority, base items fill gaps
   * 
   * Returns merged items with `isBase` flag so frontend knows which are overrides.
   */
  async findByWeek(weekStartDate: string, query: any = {}) {
    const weekDate = new Date(weekStartDate);
    // Normalize to midnight UTC to avoid timezone issues
    weekDate.setUTCHours(0, 0, 0, 0);

    const where: any = {};
    if (query.classId) where.classId = query.classId;
    if (query.teacherId) where.teacherId = query.teacherId;

    const includeRelations = {
      subject: true,
      class: true,
      teacher: { include: { user: true } },
    };

    // Fetch both week-specific and base items in parallel
    const [weekItems, baseItems] = await Promise.all([
      this.prisma.scheduleItem.findMany({
        where: { ...where, weekStartDate: weekDate },
        include: includeRelations,
        orderBy: { period: 'asc' },
      }),
      this.prisma.scheduleItem.findMany({
        where: { ...where, weekStartDate: null },
        include: includeRelations,
        orderBy: { period: 'asc' },
      }),
    ]);

    // Build a key-based map for merging: "day|period|session|classId" 
    const weekItemKeys = new Set(
      weekItems.map(item => `${item.day}|${item.period}|${item.session}|${item.classId}`)
    );

    // Merge: week items + base items that don't have a week override
    const mergedItems = [
      ...weekItems.map(item => ({ ...item, isBase: false })),
      ...baseItems
        .filter(item => !weekItemKeys.has(`${item.day}|${item.period}|${item.session}|${item.classId}`))
        .map(item => ({ ...item, isBase: true })),
    ];

    return mergedItems;
  }

  /**
   * Original findAll - returns base items only (backward compatible)
   */
  findAll(query: any = {}) {
    const where: any = {};
    if (query.classId) where.classId = query.classId;
    if (query.teacherId) where.teacherId = query.teacherId;

    // Default: return base items only for backward compatibility
    if (!query.weekStartDate) {
      where.weekStartDate = null;
    }

    return this.prisma.scheduleItem.findMany({
      where,
      include: {
        subject: true,
        class: true,
        teacher: { include: { user: true } },
      },
      orderBy: { period: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.scheduleItem.findUnique({
      where: { id },
      include: {
        subject: true,
        class: true,
        teacher: { include: { user: true } },
      },
    });
  }

  /**
   * Update a schedule item with copy-on-write logic:
   * - If the item being updated is a base item (weekStartDate = null)
   *   AND the request includes a target weekStartDate,
   *   create a NEW week-specific override instead of modifying the base.
   * - If the item is already a week-specific override, update it directly.
   */
  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    // Check if this is a copy-on-write scenario
    const existingItem = await this.prisma.scheduleItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      throw new Error('Schedule item not found');
    }

    // Copy-on-write: base item being edited for a specific week
    if (existingItem.weekStartDate === null && updateScheduleDto.weekStartDate) {
      const targetWeekDate = new Date(updateScheduleDto.weekStartDate);
      targetWeekDate.setUTCHours(0, 0, 0, 0);

      // Create a new week-specific override based on the base item
      const newItem = await this.prisma.scheduleItem.create({
        data: {
          day: updateScheduleDto.day ?? existingItem.day,
          period: updateScheduleDto.period ?? existingItem.period,
          session: updateScheduleDto.session ?? existingItem.session,
          room: updateScheduleDto.room ?? existingItem.room,
          subjectId: updateScheduleDto.subjectId ?? existingItem.subjectId,
          classId: updateScheduleDto.classId ?? existingItem.classId,
          teacherId: updateScheduleDto.teacherId ?? existingItem.teacherId,
          weekStartDate: targetWeekDate,
        },
        include: {
          subject: true,
          class: true,
          teacher: { include: { user: true } },
        },
      });

      return { ...newItem, isBase: false, _copyOnWrite: true };
    }

    // Normal update (either a week-specific item or base item without week context)
    const { weekStartDate, ...updateData } = updateScheduleDto;
    return this.prisma.scheduleItem.update({
      where: { id },
      data: updateData,
      include: {
        subject: true,
        class: true,
        teacher: { include: { user: true } },
      },
    });
  }

  remove(id: string) {
    return this.prisma.scheduleItem.delete({
      where: { id },
    });
  }
}
