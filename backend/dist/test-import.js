"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const imports_service_1 = require("./src/imports/imports.service");
const prisma_service_1 = require("./src/prisma/prisma.service");
const id_generator_service_1 = require("./src/common/id-generator.service");
const password_service_1 = require("./src/common/password.service");
const XLSX = __importStar(require("xlsx"));
async function bootstrap() {
    const moduleFixture = await testing_1.Test.createTestingModule({
        providers: [imports_service_1.ImportsService, prisma_service_1.PrismaService, id_generator_service_1.IdGeneratorService, password_service_1.PasswordService],
    }).compile();
    const service = moduleFixture.get(imports_service_1.ImportsService);
    const headers = [
        'full_name',
        'username',
        'start_year',
        'dob',
        'gender',
        'citizen_id',
        'email',
        'phone',
        'address',
        'subjects',
    ];
    const example = [
        'Tran Thi C',
        'tranthictest1',
        '2020',
        '1990-05-05',
        'Female',
        '009876543210',
        'ctest1@school.edu',
        '0987654321',
        'Hanoi',
        'Toán',
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const file = {
        buffer,
        originalname: 'test.xlsx',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    try {
        const res = await service.importData(file, 'teachers');
        console.log("Success:", res);
    }
    catch (error) {
        console.error("Import Failed:");
        console.dir(error, { depth: null });
    }
    process.exit(0);
}
bootstrap();
//# sourceMappingURL=test-import.js.map