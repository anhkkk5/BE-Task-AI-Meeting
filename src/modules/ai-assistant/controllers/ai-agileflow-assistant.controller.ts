import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { AskAgileFlowAssistantDto } from '../dto/ask-agileflow-assistant.dto';
import { AiAgileFlowAssistantService } from '../services/ai-agileflow-assistant.service';

@Controller('ai/assistant')
@ApiTags('AI AgileFlow Assistant')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class AiAgileFlowAssistantController {
  constructor(private readonly service: AiAgileFlowAssistantService) {}

  @Post('ask')
  @ApiOperation({ summary: 'Hỏi trợ lý toàn hệ thống AgileFlow' })
  ask(@CurrentUser() user: AuthUser, @Body() dto: AskAgileFlowAssistantDto) {
    return this.service.ask(user.id, dto);
  }
}
