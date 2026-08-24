import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProjectAssistantMessageDocument =
  HydratedDocument<ProjectAssistantMessage>;

@Schema({ timestamps: true, collection: 'project_assistant_messages' })
export class ProjectAssistantMessage {
  @Prop({ required: true }) workspaceId: string;
  @Prop({ required: true, index: true }) projectId: string;
  @Prop({ required: true, index: true }) userId: string;
  @Prop({ type: String }) sprintId?: string | null;
  @Prop({ required: true, enum: ['USER', 'ASSISTANT'] }) role:
    'USER' | 'ASSISTANT';
  @Prop({ required: true }) content: string;
  @Prop({ type: [Object], default: [] }) sources: Record<string, unknown>[];
  @Prop({ type: Object, default: null }) actionDraft?: Record<
    string,
    unknown
  > | null;
}

export const ProjectAssistantMessageSchema = SchemaFactory.createForClass(
  ProjectAssistantMessage,
);
ProjectAssistantMessageSchema.index({ projectId: 1, userId: 1, createdAt: -1 });
