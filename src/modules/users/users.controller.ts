import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Get,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTeacherDto, UpdateUserDto } from './dto';
import { ObjectId } from '../../helpers/types/objectid.type';
import { UserDocument } from '../database/models/user.model';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../helpers/guards/roles.guard';
import { Role } from '../../helpers/decorators/role.decorator';
import { Roles } from '../../helpers/enums/roles.enum';
import { IdValidationPipe } from '../../helpers/pipes/id-validation.pipe';

// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Изменить данные пользователя по id' })
  @Put(':id')
  @ApiParam({ name: 'id', type: 'string', required: true })
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Param() userId: ObjectId,
  ) {
    return await this.usersService.updateUserById(updateUserDto, userId);
  }

  @ApiOperation({ summary: 'Удалить пользователя по id' })
  @Delete(':id')
  @ApiParam({ name: 'id', type: 'string', required: true })
  async deleteUserById(@Param() userId: ObjectId) {
    return await this.usersService.deleteUserById(userId);
  }

  @ApiOperation({ summary: 'Получить одного пользователя по айди' })
  @Get(':id')
  @ApiParam({ name: 'id', type: 'string', required: true })
  async getUserById(@Param() userId): Promise<UserDocument> {
    return await this.usersService.findUserById(userId.id);
  }

  @ApiOperation({ summary: 'Получить всех студентов' })
  @Get('all')
  async getAllUsers() {
    return await this.usersService.findAllActiveUsers();
  }

  @ApiOperation({ summary: 'Добавить учителя' })
  // @UseGuards(RolesGuard)
  // @Role(Roles.ADMIN)
  @Post('teacher')
  async registerTeacher(@Body() createTeacherDto: CreateTeacherDto) {
    return await this.usersService.createTeacher(createTeacherDto);
  }

  @ApiOperation({ summary: 'Добавить предмет учителю' })
  @Put(':teacherId/:subjectId')
  @ApiParam({ name: 'teacherId', type: 'string', required: true })
  @ApiParam({ name: 'subjectId', type: 'string', required: true })
  async addSubjectToTeacher(
    @Param('teacherId', IdValidationPipe) teacherId: ObjectId,
    @Param('subjectId', IdValidationPipe) subjectId: ObjectId,
  ) {
    return await this.usersService.assingTeacher(teacherId, subjectId);
  }
}
