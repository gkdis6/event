import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RewardRequest, RewardRequestDocument } from '../schemas/reward-request.schema';
import { Reward, RewardDocument } from '../schemas/reward.schema'; // Reward 스키마 임포트
import { RewardProcessorFactory } from '../factories/reward-processor.factory';
import { RequestRewardDto } from '../dto/request-reward.dto'; // DTO 임포트 필요
import { RequestStatus } from '../../common/enums/request-status.enum'; // RequestStatus 임포트
import { Event, EventDocument } from '../../events/schemas/event.schema'; // Event 스키마 임포트
import { EventStatus } from '../../common/enums/event-status.enum'; // EventStatus 임포트

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(RewardRequest.name) private rewardRequestModel: Model<RewardRequestDocument>,
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>, // Reward 모델 주입
    @InjectModel(Event.name) private eventModel: Model<EventDocument>, // Event 모델 주입
    private readonly rewardProcessorFactory: RewardProcessorFactory,
  ) {}

  async createRewardRequest(requestRewardDto: RequestRewardDto, userId: string): Promise<RewardRequestDocument> {
    // 1. 이벤트 상태 검증 - ACTIVE 상태만 보상 요청 가능
    const event = await this.eventModel.findById(requestRewardDto.eventId).exec();
    if (!event) {
      throw new NotFoundException(`이벤트를 찾을 수 없습니다: ${requestRewardDto.eventId}`);
    }
    
    // ACTIVE 상태가 아닌 경우 오류 발생
    if (event.status !== EventStatus.ACTIVE) {
      throw new BadRequestException(`이벤트가 활성 상태(ACTIVE)가 아닙니다. 현재 상태: ${event.status}`);
    }

    // 2. 중복 요청 확인 - 같은 사용자가 같은 이벤트, 같은 보상에 대해 이미 요청했는지 확인
    const existingRequest = await this.rewardRequestModel.findOne({
      userId,
      eventId: requestRewardDto.eventId,
      rewardId: requestRewardDto.rewardId
    }).exec();

    // 이미 요청이 존재하는 경우
    if (existingRequest) {
      // 완료된 요청인 경우 오류 발생
      if (existingRequest.status === RequestStatus.COMPLETED) {
        throw new Error('이미 완료된 보상 요청입니다. 중복 요청은 허용되지 않습니다.');
      }
      
      // 대기 중이거나 처리 중인 요청인 경우 기존 요청 반환
      if (existingRequest.status === RequestStatus.PENDING || 
          existingRequest.status === RequestStatus.PROCESSING) {
        throw new Error('이미 처리 중인 보상 요청이 있습니다. 처리가 완료될 때까지 기다려주세요.');
      }
      
      // 거절된 요청인 경우 재시도 가능
      if (existingRequest.status === RequestStatus.REJECTED) {
        existingRequest.status = RequestStatus.PENDING;
        existingRequest.rejectionReason = null;
        existingRequest.processedAt = null;
        existingRequest.processedBy = null;
        return existingRequest.save();
      }
    }

    // 새 요청 생성
    const createdRequest = new this.rewardRequestModel({
      ...requestRewardDto,
      userId,
      status: RequestStatus.PENDING, // 초기 상태 설정 (Enum 사용)
      requestedAt: new Date(),
    });
    
    try {
      return await createdRequest.save();
    } catch (error) {
      // 중복 키 오류 처리 (동시에 여러 요청이 들어왔을 경우)
      if (error.code === 11000) { // MongoDB 중복 키 오류 코드
        throw new Error('동일한 보상에 대한 요청이 이미 처리 중입니다. 잠시 후에 다시 시도해주세요.');
      }
      throw error;
    }
  }

  async processRewardRequest(rewardRequest: RewardRequestDocument): Promise<RewardRequestDocument> {
    // 보상 처리 로직
    // rewardId를 사용하여 Reward 문서 조회
    const reward = await this.rewardModel.findById(rewardRequest.rewardId);
    if (!reward) {
      throw new Error(`Reward not found for id: ${rewardRequest.rewardId}`);
    }

    const processor = this.rewardProcessorFactory.getProcessor(reward.type); // Reward 문서에서 type 사용
    if (!processor) {
      throw new Error(`Reward processor not found for type: ${reward.type}`); // Reward 문서에서 type 사용
    }

    const success = await processor.process(rewardRequest.userId, reward.rewardData); // Reward 문서에서 rewardData 사용

    rewardRequest.status = success ? RequestStatus.COMPLETED : RequestStatus.REJECTED; // 처리 결과에 따라 상태 업데이트 (Enum 사용)
    rewardRequest.processedAt = new Date();

    return rewardRequest.save();
  }

  /**
   * 특정 사용자의 보상 요청 조회
   * @param userId 사용자 ID
   * @param status 보상 요청 상태 (선택 사항)
   */
  async findRewardRequestsByUserId(userId: string, status?: RequestStatus): Promise<RewardRequestDocument[]> {
    const query: any = { userId };
    if (status) {
      query.status = status;
    }
    return this.rewardRequestModel.find(query).sort({ requestedAt: -1 }).exec();
  }

  /**
   * 특정 상태의 모든 보상 요청 조회 (관리자/감사자용)
   * @param status 보상 요청 상태
   */
  async findRewardRequestsByStatus(status: RequestStatus): Promise<RewardRequestDocument[]> {
    return this.rewardRequestModel.find({ status }).sort({ requestedAt: -1 }).exec();
  }

  /**
   * 모든 보상 요청 조회 (관리자/감사자용)
   */
  async findAllRewardRequests(): Promise<RewardRequestDocument[]> {
    return this.rewardRequestModel.find().sort({ requestedAt: -1 }).exec();
  }

  /**
   * 보상 요청 상태 업데이트 (관리자용)
   * @param id 보상 요청 ID
   * @param status 업데이트할 상태
   * @param processedBy 처리한 관리자 ID (선택 사항)
   */
  async updateRewardRequestStatus(id: string, status: RequestStatus, processedBy?: string): Promise<RewardRequestDocument> {
    const rewardRequest = await this.rewardRequestModel.findById(id).exec();
    if (!rewardRequest) {
      throw new Error(`ID가 ${id}인 보상 요청을 찾을 수 없습니다.`);
    }

    rewardRequest.status = status;
    if (processedBy) {
      rewardRequest.processedBy = processedBy;
    }
    rewardRequest.processedAt = new Date(); // 상태 변경 시 처리 시간 업데이트

    return rewardRequest.save();
  }

  /**
   * 특정 이벤트의 보상 요청 달성률 계산
   * (이벤트에 대한 총 보상 요청 수 대비 완료된 보상 요청 수)
   * @param eventId 이벤트 ID
   * @returns 달성률 (0-100)
   */
  async calculateCompletionRate(eventId: string): Promise<number> {
    const totalRequests = await this.rewardRequestModel.countDocuments({ eventId }).exec();
    const completedRequests = await this.rewardRequestModel.countDocuments({
      eventId,
      status: RequestStatus.COMPLETED,
    }).exec();

    if (totalRequests === 0) {
      return 0; // 요청이 없으면 달성률 0
    }

    return (completedRequests / totalRequests) * 100;
  }
}
