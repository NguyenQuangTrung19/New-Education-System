export class CreateAssignmentDto {
  title: string;
  description?: string;
  subjectId: string;
  teacherId: string; // If admin creates, they specify teacher. If teacher creates, we can use their ID.
  classIds?: string[];
  dueDate: string | Date;
  duration?: number;
  password?: string;
  questions?: any;
}

export class UpdateAssignmentDto {
  title?: string;
  description?: string;
  dueDate?: string | Date;
  duration?: number;
  password?: string;
  questions?: any;
  status?: 'pending' | 'submitted' | 'late' | 'graded'; // Not really on assignment but on submission
}
