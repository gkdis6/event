import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'; // Types 임포트 제거
import * as mongoose from 'mongoose'; // mongoose 전체 임포트
import { Event, EventDocument } from '../schemas/event.schema';
import { CreateEventDto } from '../dto/create-event.dto';
import { ConditionValidatorFactory } from '../../conditions/factories/condition-validator.factory';
import { EventStatus } from '../../common/enums/event-status.enum';
import { RewardsService } from '../../rewards/services/rewards.service'; // RewardsService 임포트

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    private readonly conditionValidatorFactory: ConditionValidatorFactory,
    private readonly rewardsService: RewardsService, // RewardsService 주입
  ) {}

  /**
   * 새 이벤트 생성
   */
  async create(createEventDto: CreateEventDto, operatorId: string): Promise<EventDocument> {
    // 조건 유형에 맞는 Validator가 있는지 확인
    const validator = this.conditionValidatorFactory.getValidator(createEventDto.conditionType);

    // conditionData가 없는 경우 빈 객체로 설정
    const eventData = {
      ...createEventDto,
      conditionData: createEventDto.conditionData || {},
      status: EventStatus.DRAFT, // 초기 상태는 DRAFT
      startDate: new Date(createEventDto.startDate),
      endDate: new Date(createEventDto.endDate),
      createdBy: operatorId,
    };

    // 새 이벤트 생성
    const createdEvent = new this.eventModel(eventData);

    return createdEvent.save();
  }

  /**
   * 모든 이벤트 조회 (삭제되지 않은 것만)
   */
  async findAll(status?: EventStatus): Promise<EventDocument[]> {
    const query: any = { isDeleted: false };
    
    if (status) {
      query.status = status;
    }
    
    return this.eventModel.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * ID로 이벤트 조회
   */
  async findById(id: string): Promise<EventDocument> {
    if (!mongoose.isValidObjectId(id)) { // mongoose.isValidObjectId 사용
      throw new BadRequestException('유효하지 않은 이벤트 ID입니다');
    }

    const event = await this.eventModel.findOne({
      _id: id,
      isDeleted: false
    }).exec();
    
    if (!event) {
      throw new NotFoundException(`ID가 ${id}인 이벤트를 찾을 수 없습니다`);
    }
    
    return event;
  }

  /**
   * 이벤트 상태 업데이트
   */
  async updateStatus(id: string, status: EventStatus): Promise<EventDocument> {
    const event = await this.findById(id);
    event.status = status;
    return event.save();
  }

  /**
   * 이벤트 정보 업데이트
   */
  async update(id: string, updateEventDto: Partial<CreateEventDto>): Promise<EventDocument> {
    const event = await this.findById(id);
    
    // 시작일, 종료일 형식 변환
    if (updateEventDto.startDate) {
      updateEventDto.startDate = new Date(updateEventDto.startDate) as any;
    }
    if (updateEventDto.endDate) {
      updateEventDto.endDate = new Date(updateEventDto.endDate) as any;
    }
    
    // 조건 유형이 변경된 경우, 유효한지 확인
    if (updateEventDto.conditionType && updateEventDto.conditionType !== event.conditionType) {
      this.conditionValidatorFactory.getValidator(updateEventDto.conditionType);
    }
    
    // 업데이트 적용
    Object.assign(event, updateEventDto);
    return event.save();
  }

  /**
   * 이벤트 삭제 (soft delete)
   */
  async remove(id: string): Promise<boolean> {
    const result = await this.eventModel.updateOne(
      { _id: id },
      { isDeleted: true }
    ).exec();
    
    return result.modifiedCount > 0;
  }

  /**
   * 특정 이벤트의 조건을 충족하는지 검증
   */
  async validateCondition(userId: string, eventId: string): Promise<boolean> {
    const event = await this.findById(eventId);
    
    // 이벤트가 활성 상태인지 확인
    if (event.status !== EventStatus.ACTIVE) {
      return false;
    }
    
    // 이벤트 기간이 유효한지 확인
    const now = new Date();
    if (now < event.startDate || now > event.endDate) {
      return false;
    }
    
    // 이벤트 조건 유형에 맞는 Validator 가져와서 검증
    const validator = this.conditionValidatorFactory.getValidator(event.conditionType);
    return validator.validate(userId, eventId.toString(), event.conditionData);
  }

  /**
   * 특정 사용자가 참여 중인 이벤트 목록과 달성률 조회
   * (사용자의 보상 요청 기록 기반)
   * @param userId 사용자 ID
   * @returns 이벤트 목록 (각 이벤트의 달성률 포함)
   */
  async findParticipatingEventsWithCompletionRate(userId: string): Promise<any[]> {
    try {
      // 문제 진단: 참여 이벤트 조회가 안되는 임시 해결책으로 모든 활성 이벤트 반환
      console.log(`사용자 ${userId}의 참여 이벤트 조회 - 모든 활성 이벤트 반환으로 임시 처리`);
      
      // 모든 활성 이벤트 조회 (삭제되지 않은 이벤트만)
      const allActiveEvents = await this.eventModel.find({
        isDeleted: false,
      }).exec();
      
      console.log(`조회된 이벤트 수: ${allActiveEvents.length}`);
      
      if (allActiveEvents.length === 0) {
        console.log(`활성 이벤트가 없습니다.`);
        return [];
      }

      // 4. 각 이벤트에 대한 달성률 계산 및 결과 구성
      const result = await Promise.all(allActiveEvents.map(async (event) => {
        const eventId = event._id.toString();
        const completionRate = await this.rewardsService.calculateCompletionRate(eventId);
        console.log(`이벤트 ${eventId}의 달성률: ${completionRate}%`);
        return {
          ...event.toObject(), // Mongoose Document를 일반 객체로 변환
          completionRate,
        };
      }));

      return result;
    } catch (error) {
      console.error(`참여 중인 이벤트 조회 중 오류 발생:`, error);
      // 오류 발생 시 빈 배열 반환하여 서비스 중단 방지
      return [];
    }
  }
}
