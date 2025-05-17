import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * 새 사용자 생성
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // 기존 사용자 확인
    const existingUser = await this.userModel.findOne({
      username: createUserDto.username,
    }).exec();
    
    if (existingUser) {
      throw new ConflictException('이미 사용 중인 사용자 이름입니다');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // 새 사용자 생성
    const rolesToSet = createUserDto.role ? [createUserDto.role as Role] : [Role.USER];
    
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      roles: rolesToSet,
      isActive: true,
    });

    return createdUser.save();
  }

  /**
   * 모든 사용자 조회
   */
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  /**
   * 사용자명으로 사용자 조회
   */
  async findOne(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  /**
   * ID로 사용자 조회
   */
  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  /**
   * 사용자 정보 업데이트
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    // 새 비밀번호가 있는 경우 해싱
    if (updateUserDto.newPassword) {
      user.password = await bcrypt.hash(updateUserDto.newPassword, 10);
      delete updateUserDto.newPassword; // 해싱 후 필드 삭제
    }

    // 다른 필드 업데이트
    Object.assign(user, updateUserDto);
    
    return user.save();
  }

  /**
   * 사용자 삭제
   */
  async remove(id: string): Promise<boolean> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  /**
   * 인증용 사용자 조회
   */
  async findOneForAuth(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  /**
   * 비밀번호 검증
   */
  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * 리프레시 토큰 저장
   */
  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { refreshToken },
    ).exec();
  }
}
