import { ValidatorInput } from '@/core/helpers/class-validator.helper';
import { ResponseHandler } from '@/core/helpers/response-handler.helper';
import type { IResponseServer } from '@/core/interfaces/common.interface';
import { SchoolModel, type ISchoolEntity } from '@/database/entities/school.entity';
import { SchoolRepository } from '@/repositories/school.repository';
import moment from 'moment-timezone';
import { v4 as uuidV4 } from 'uuid';

export class SchoolService {
    private schoolRepository = new SchoolRepository();
    private validateInputService = new ValidatorInput();
    constructor() {}

    public async getList(): Promise<IResponseServer> {
        try {
            const schoolRecords = await this.schoolRepository.getList();
            return new ResponseHandler(200, true, 'Get List school successfully', schoolRecords);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async getById(id: string): Promise<IResponseServer> {
        try {
            const schoolRecords = await this.schoolRepository.getById(id);
            if (!schoolRecords) return new ResponseHandler(404, false, 'School not found', null);
            return new ResponseHandler(200, true, 'Get school successfully', schoolRecords);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }
    public async create(payload: Omit<ISchoolEntity, 'createdAt' | 'updatedAt'>): Promise<IResponseServer> {
        try {
            const schoolRecord = await this.schoolRepository.getByCode(payload.code);
            if (schoolRecord) {
                return new ResponseHandler(200, true, 'School is exits', schoolRecord);
            }
            const id = uuidV4();
            const newSchool = new SchoolModel({
                id,
                title: payload.title.trim(),
                description: payload.description?.trim(),
                phone: payload.phone.trim(),
                email: payload.email.trim(),
                address: payload.address.trim(),
                code: payload.code.trim(),
                logoUrl: payload.logoUrl?.trim(),
            });
            const validation = await this.validateInputService.validate(newSchool);
            if (validation) return validation;
            const newSchoolRecord = await this.schoolRepository.create(newSchool);
            if (!newSchoolRecord) return new ResponseHandler(500, false, 'Can not create new school', null);
            return new ResponseHandler(201, true, 'Create new school successfully', newSchoolRecord);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }

    public async update(payload: Omit<ISchoolEntity, 'createdAt' | 'updatedAt'>): Promise<IResponseServer> {
        try {
            const schoolRecord = await this.schoolRepository.getByCode(payload.code);
            if (!schoolRecord) {
                return new ResponseHandler(200, true, 'School not is exits', schoolRecord);
            }
            const newSchool = new SchoolModel({
                id: payload.id,
                title: payload.title.trim(),
                description: payload.description?.trim(),
                phone: payload.phone.trim(),
                email: payload.email.trim(),
                address: payload.address.trim(),
                code: payload.code.trim(),
                logoUrl: payload.logoUrl?.trim(),
            });
            const validation = await this.validateInputService.validate(newSchool);
            if (validation) return validation;
            const newSchoolRecord = await this.schoolRepository.updateRecord({
                updateCondition: { id: newSchool.id },
                updateQuery: {
                    title: newSchool.title,
                    description: newSchool.description,
                    phone: newSchool.phone,
                    email: newSchool.email,
                    address: newSchool.address,
                    code: newSchool.code,
                    logoUrl: newSchool.logoUrl,
                    updatedAt: moment().format(),
                },
            });
            if (!newSchoolRecord) return new ResponseHandler(500, false, 'Can not update school', null);
            return new ResponseHandler(201, true, 'Update school successfully', newSchoolRecord);
        } catch (error) {
            console.log('error', error);
            return ResponseHandler.InternalServer();
        }
    }
}
