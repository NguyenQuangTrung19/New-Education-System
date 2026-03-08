import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception.code === 'P2002') {
      const target = exception.meta?.target;
      let field = 'Dữ liệu';
      if (Array.isArray(target) && target.length > 0) {
        field = target.join(', ');
      } else if (typeof target === 'string') {
        field = target;
      }

      // Format user-friendly field names
      const fieldMap: Record<string, string> = {
        'code': 'Mã',
        'name': 'Tên',
        'email': 'Email',
        'username': 'Tên đăng nhập',
        'userId': 'Tài khoản',
        'citizenId': 'CCCD/CMND',
      };

      const translatedFields = field.split(',').map(f => {
         const cleanField = f.trim();
         // Deal with something like Subject_code_key
         const parts = cleanField.split('_');
         for (const p of parts) {
            if (fieldMap[p]) return fieldMap[p];
         }
         return fieldMap[cleanField] || cleanField;
      }).join(', ');

      const status = HttpStatus.CONFLICT;
      response.status(status).json({
        statusCode: status,
        message: `${translatedFields} đã tồn tại trong hệ thống. Vui lòng kiểm tra lại!`,
        error: 'Conflict'
      });
      return;
    }

    super.catch(exception, host);
  }
}
