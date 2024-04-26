import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from '../database/repositories/user.repository';
import { UserDocument } from '../database/models/user.model';
import { CrudService } from '../../helpers/crud.service';
import { UpdateUserDto } from './dto';
import { ObjectId } from '../../helpers/types/objectid.type';
import { Roles } from '../../helpers/enums/roles.enum';
import { SubjectRepository } from '../database/repositories/subject.repository';
import { encodePassword, } from 'src/helpers/utils/utils';
import { CreateUserDto } from '../auth/dto';

@Injectable()
export class UsersService extends CrudService<UserDocument> {
  constructor(
    readonly userRepository: UserRepository,
    readonly subjectRepository: SubjectRepository,
  ) {
    super(userRepository);
  }
  async createUser(createUserDto): Promise<UserDocument> {
    try {
      const password = encodePassword(createUserDto.password);
      return await this.userRepository.create({ ...createUserDto, password});
    } catch (error) {
      return error.message;
    }
  }

  async createTeacher(createUserDto): Promise<UserDocument> {
    try {
      return await this.userRepository.create({
        ...createUserDto,
        role: Roles.TEACHER,
        subject_ids: [],
      });
    } catch (error) {
      return error.message;
    }
  }

  async findUserById(id: ObjectId): Promise<UserDocument> {
    try {
      return await this.userRepository.findById(id);
    } catch (error) {
      return error.message;
    }
  }

  async updateUserById(
    userDto: UpdateUserDto,
    userId: ObjectId,
  ): Promise<UserDocument> {
    try {
      return await this.userRepository.updateOne({ _id: userId.id }, userDto);
    } catch (error) {
      return error.message;
    }
  }

  async deleteUserById(userId: ObjectId): Promise<UserDocument> {
    try {
      return await this.userRepository.deleteOne({ _id: userId.id });
    } catch (error) {
      return error.message;
    }
  }

  async findAllActiveUsers(): Promise<UserDocument[]> {
    try {
      // const query = {
      //   is_deleted: false,
      //   role: Roles.STUDENT,
      // };

      return await this.userRepository.find({});
    } catch (error) {
      return error.message;
    }
  }

  async assingTeacher(teacherId, subjectId): Promise<UserDocument> {
    try {
      const teacher = await this.userRepository.findById(teacherId);
      const subject = await this.subjectRepository.findById(subjectId);
      if (!teacher && !subject) {
        throw new BadRequestException('Неверные данные');
      }
      teacher.subject_ids.push(subject);
      await teacher.save();
      return teacher;
    } catch (error) {
      return error.message;
    }
  }
}
