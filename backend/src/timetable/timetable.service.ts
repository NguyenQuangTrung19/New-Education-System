import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class TimetableService {
  private readonly logger = new Logger(TimetableService.name);

  constructor(private prisma: PrismaService) {}

  async generateSchedule() {
    this.logger.log('Gathering data for timetable generation...');

    // 1. Gather all classes and teachers from DB
    const classes = await this.prisma.classGroup.findMany({
      select: { id: true },
    });

    const teachers = await this.prisma.teacher.findMany({
      include: {
        teachingAssignments: true,
      },
    });

    // 2. Format input payload for the Python script
    const formattedTeachers = teachers.map((t) => ({
      id: t.id,
      subjects: t.subjects,
      assignments: t.teachingAssignments.map((ta) => ({
        classId: ta.classId,
        subjectId: ta.subjectId,
        periods: ta.sessionsPerWeek,
      })),
      timeOff: [], // Can be extended to read from a new `timeOffs` table
    }));

    const inputPayload = {
      weeklyStructure: {
        days: 5, // Monday - Friday
        periodsPerDay: 8, // 4 morning, 4 afternoon
      },
      classes: classes.map((c) => ({ id: c.id })),
      teachers: formattedTeachers,
    };

    try {
      // 3. Execute Python CP-SAT script
      this.logger.log(
        'Executing OR-Tools CP-SAT model in Python child process...',
      );
      const result = await this.runPythonScheduler(inputPayload);

      // 4. Save to Database
      if (
        (result && result.status === 'OPTIMAL') ||
        result.status === 'FEASIBLE'
      ) {
        await this.saveScheduleToDatabase(result.schedule);
      }

      return result;
    } catch (err) {
      this.logger.error('Failed to generate timetable', err);
      throw err;
    }
  }

  private runPythonScheduler(inputData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // Path to the python script
      const scriptPath = path.join(
        __dirname,
        '..',
        'common',
        'scheduler_core.py',
      );

      const pythonProcess = spawn('python', [scriptPath], { shell: true });

      let outputData = '';
      let errorData = '';

      // Send JSON to stdin
      pythonProcess.stdin.write(JSON.stringify(inputData));
      pythonProcess.stdin.end();

      // Read stdout
      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      // Read stderr
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      pythonProcess.on('close', (code) => {
        const logContent = `STDOUT:\n${outputData}\n\nSTDERR:\n${errorData}\n\nCODE: ${code}`;
        fs.writeFileSync(path.join(process.cwd(), 'scheduler_debug.log'), logContent);

        this.logger.debug(`Python script stdout: ${outputData}`);
        if (errorData) {
            this.logger.debug(`Python script stderr: ${errorData}`);
        }
        
        if (code !== 0) {
          this.logger.error(`Python script exited with code ${code}`);
          this.logger.error(`Error details: ${errorData}`);
          reject(new Error(`Scheduler failed: ${errorData}`));
        } else {
          try {
            // Trim any leading/trailing whitespace or newlines from Python print
            const cleanOutput = outputData.trim();
            this.logger.debug(`Final Cleaned Output Length: ${cleanOutput.length}`);
            
            if (!cleanOutput) {
                return reject(new Error('Python script returned empty output'));
            }
            
            const result = JSON.parse(cleanOutput);
            resolve(result);
          } catch (e) {
            this.logger.error(`Parse failed on string: ${outputData.substring(0, 100)}...`);
            reject(new Error(`Failed to parse Python script output: ${e.message}`));
          }
        }
      });
    });
  }

  private async saveScheduleToDatabase(scheduleData: any[]) {
    this.logger.log('Saving generated schedule to database...');

    return this.prisma.$transaction(async (prisma) => {
      // 1. Clear existing schedule slots to replace them
      await prisma.scheduleItem.deleteMany({});

      // 2. Map day indexes to actual strings for simplicity
      const daysOfWeek = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
      ];

      const scheduleItemsToCreate = scheduleData.map((slot) => {
        // Derive Session and Period from 0-7 index (0-3 = Morning 1-4, 4-7 = Afternoon 1-4)
        const periodNumber = (slot.period % 4) + 1;
        const session = slot.period < 4 ? 'Morning' : 'Afternoon';

        return {
          day: daysOfWeek[slot.day],
          period: periodNumber,
          session: session,
          classId: slot.classId,
          subjectId: slot.subjectId,
          teacherId: slot.teacherId,
        };
      });

      // 3. Insert new items
      await prisma.scheduleItem.createMany({
        data: scheduleItemsToCreate,
      });

      this.logger.log(
        `Successfully saved ${scheduleItemsToCreate.length} schedule items.`,
      );
    });
  }
}
