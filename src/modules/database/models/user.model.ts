import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { CollectionName } from '../../../helpers/enums/collection-names.enum';
import { Roles } from '../../../helpers/enums/roles.enum';
import { genHash, genSalt } from '../../../helpers/utils/utils';
import { lcov } from 'node:test/reporters';
import { SubjectDocument } from './subject.model';

@Schema({
  collection: CollectionName.User,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class User {
  _id: Types.ObjectId;

  @ApiProperty({ type: 'string' })
  @Prop({ required: true })
  full_name: string;

  @ApiProperty({ type: 'string' })
  @Prop({ required: true })
  email: string;

  @ApiProperty({ type: 'string' })
  @Prop({ type: 'string', required: true, default: Roles.STUDENT })
  role: Roles;

  @ApiProperty({ type: 'string' })
  @Prop({ type: Types.ObjectId })
  group_id: Types.ObjectId;

  @ApiProperty({ type: 'string' })
  @Prop({ required: true })
  password: string;

  @ApiProperty({ type: 'boolean' })
  @Prop({ default: false })
  is_deleted: boolean;

  @ApiProperty()
  @Prop({ required: false })
  subject_ids: SubjectDocument[];
  
  @ApiProperty({ type: 'number' })
  @Prop({ default: 0 })
  loginTry: number;

  @ApiProperty({ type: 'date' })
  @Prop({ default: null })
  timeUntil: Date;
}

export type UserDocument = User & mongoose.Document;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function () {
  if (!this.password) return;
  const salt = await genSalt();
  this.password = await genHash(this.password, salt);
});
