import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AiFocusArea } from '../enums/ai-focus-area.enum';
import { AiResponseStyle } from '../enums/ai-response-style.enum';
import { AiTone } from '../enums/ai-tone.enum';

@Entity('ai_user_preferences')
export class AiUserPreference {
  @PrimaryColumn({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Column({
    name: 'response_style',
    type: 'enum',
    enum: AiResponseStyle,
    default: AiResponseStyle.Balanced,
  })
  responseStyle: AiResponseStyle;

  @Column({
    type: 'enum',
    enum: AiTone,
    default: AiTone.Professional,
  })
  tone: AiTone;

  @Column({ name: 'focus_areas', type: 'simple-json', nullable: true })
  focusAreas: AiFocusArea[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
