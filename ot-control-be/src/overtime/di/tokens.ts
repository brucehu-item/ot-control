import { Token } from 'typedi';
import { OvertimeRequestRepository } from '../domain/repositories/overtime-request.repository';
import { OvertimeRequestService } from '../domain/services/overtime-request.service';

export const OVERTIME_TOKENS = {
  OvertimeRequestService: new Token<OvertimeRequestService>('overtime.request.service'),
  OvertimeRequestRepository: new Token<OvertimeRequestRepository>('overtime.request.repository')
}; 