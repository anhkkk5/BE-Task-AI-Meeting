import { ForbiddenException, Injectable } from '@nestjs/common';
import { ProjectStatus } from '../../../common/enums/project-status.enum';
import { SprintStatus } from '../../../common/enums/sprint-status.enum';
import { ProjectsRepository } from '../../projects/repositories/projects.repository';
import { SprintsRepository } from '../../sprints/repositories/sprints.repository';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { AskAgileFlowAssistantDto } from '../dto/ask-agileflow-assistant.dto';
import { AiProjectAssistantService } from './ai-project-assistant.service';
import {
  AiProviderService,
  ProjectAssistantOutput,
} from './ai-provider.service';

type ContextState =
  'GLOBAL' | 'NEED_WORKSPACE' | 'NEED_PROJECT' | 'NEED_SPRINT' | 'READY';
type ContextChoice = { id: string; label: string; description?: string };

const PRODUCT_KNOWLEDGE = `
AgileFlow là hệ thống quản lý dự án Agile gồm: Workspace và phân quyền OWNER/ADMIN/MEMBER;
Project; Backlog; Sprint; bảng công việc; Task và phụ thuộc; cập nhật hằng ngày; cuộc họp,
biên bản và tóm tắt AI; bàn giao ca; báo cáo AI; thống kê tiến độ; thông báo và hồ sơ cá nhân.
Backlog là danh sách công việc của dự án chưa được đưa vào Sprint. Người dùng có thể tạo Sprint,
kéo hoặc gán Task từ Backlog vào Sprint, theo dõi trạng thái và hoàn thành Sprint.
Chỉ hướng dẫn những tính năng có trong danh sách trên. Không bịa nút, quyền hoặc dữ liệu.
`;

@Injectable()
export class AiAgileFlowAssistantService {
  constructor(
    private readonly workspaceMembersRepository: WorkspaceMembersRepository,
    private readonly projectsRepository: ProjectsRepository,
    private readonly sprintsRepository: SprintsRepository,
    private readonly projectAssistantService: AiProjectAssistantService,
    private readonly aiProviderService: AiProviderService,
  ) {}

  async ask(userId: string, dto: AskAgileFlowAssistantDto) {
    if (this.isOutOfScopeQuestion(dto.question))
      return this.answerOutOfScopeQuestion();

    if (this.isFeatureQuestion(dto.question))
      return this.answerFeatureQuestion(dto.question);

    if (!dto.workspaceId) {
      const memberships =
        await this.workspaceMembersRepository.findActiveByUser(
          userId,
          'ACTIVE',
        );
      return this.choiceResponse(
        'NEED_WORKSPACE',
        'Bạn muốn tra cứu dữ liệu trong Workspace nào?',
        memberships.map(({ workspace }) => ({
          id: workspace.id,
          label: workspace.name,
          description: workspace.description ?? undefined,
        })),
      );
    }

    await this.assertWorkspaceMembership(userId, dto.workspaceId);
    if (!dto.projectId) {
      const projects = await this.projectsRepository.findByWorkspace(
        dto.workspaceId,
        {
          status: ProjectStatus.Active,
          page: 1,
          limit: 100,
        },
      );
      return this.choiceResponse(
        'NEED_PROJECT',
        'Bạn muốn tra cứu trong dự án nào?',
        projects.items.map((project) => ({
          id: project.id,
          label: project.name,
          description: project.keyCode,
        })),
      );
    }

    const project = await this.projectsRepository.findByIdAndWorkspace(
      dto.projectId,
      dto.workspaceId,
    );
    if (!project)
      throw new ForbiddenException('Dự án không thuộc Workspace đã chọn');

    if (this.needsSprint(dto.question) && !dto.sprintId) {
      const sprints = await this.sprintsRepository.findByProject(
        dto.projectId,
        { page: 1, limit: 100 },
      );
      const visible = sprints.items.filter((sprint) =>
        [
          SprintStatus.Active,
          SprintStatus.Planned,
          SprintStatus.Completed,
        ].includes(sprint.status),
      );
      return this.choiceResponse(
        'NEED_SPRINT',
        'Bạn muốn xem Sprint nào?',
        visible.map((sprint) => ({
          id: sprint.id,
          label: sprint.name,
          description: this.sprintStatusLabel(sprint.status),
        })),
      );
    }

    const result = await this.projectAssistantService.ask(
      userId,
      dto.workspaceId,
      dto.projectId,
      {
        question: dto.question,
        ...(dto.sprintId ? { sprintId: dto.sprintId } : {}),
      },
    );
    return {
      ...result,
      data: {
        ...result.data,
        state: 'READY' as ContextState,
        choices: [] as ContextChoice[],
      },
    };
  }

  private async answerFeatureQuestion(question: string) {
    const fallback: ProjectAssistantOutput = {
      answer:
        'Tôi có thể hướng dẫn bạn sử dụng Workspace, Project, Backlog, Sprint, Task, cuộc họp, bàn giao và báo cáo AI trong AgileFlow.',
      suggestedQuestions: [
        'Backlog là gì?',
        'Cách tạo Sprint?',
        'Cách mời thành viên vào Workspace?',
      ],
    };
    const prompt = `${PRODUCT_KNOWLEDGE}\nCâu hỏi: ${question}\nHãy trả lời ngắn gọn bằng tiếng Việt và nêu các bước thao tác nếu phù hợp.`;
    let output = fallback;
    try {
      output = (
        await this.aiProviderService.generateProjectAssistantAnswer(
          prompt,
          fallback,
        )
      ).output;
    } catch {
      // Dùng câu trả lời an toàn khi provider tạm thời không khả dụng.
    }
    return {
      success: true,
      message: 'Hỏi trợ lý AgileFlow thành công',
      data: {
        answer: output.answer,
        suggestedQuestions: output.suggestedQuestions,
        sources: [],
        state: 'GLOBAL' as ContextState,
        choices: [] as ContextChoice[],
        scope: { workspaceId: null, projectId: null, sprintId: null },
      },
    };
  }

  private answerOutOfScopeQuestion() {
    return {
      success: true,
      message: 'Câu hỏi nằm ngoài phạm vi trợ lý AgileFlow',
      data: {
        answer: [
          'Mình hiểu bạn đang cần hỗ trợ về một nội dung khác.',
          'Hiện tại mình là trợ lý quản lý dự án AgileFlow nên chưa thể viết code, giải thuật toán hoặc tư vấn chủ đề không liên quan đến dự án trong cửa sổ này.',
          'Mình có thể hỗ trợ bạn ngay với:',
          '• Phân tích tiến độ và rủi ro Sprint.',
          '• Tìm task quá hạn, blocker và người đang cần hỗ trợ.',
          '• Đề xuất thứ tự ưu tiên và hướng giải quyết dựa trên dữ liệu thật.',
          '• Tóm tắt cuộc họp, quyết định và việc cần làm tiếp theo.',
          'Bạn có thể thử hỏi: “Sprint hiện tại có rủi ro nào và nên xử lý ra sao?”',
        ].join('\n'),
        suggestedQuestions: [
          'Sprint hiện tại có rủi ro nào và nên xử lý ra sao?',
          'Công việc nào đang quá hạn và cần ưu tiên?',
          'Ai đang gặp trở ngại và cần hỗ trợ?',
        ],
        sources: [],
        state: 'GLOBAL' as ContextState,
        choices: [] as ContextChoice[],
        scope: { workspaceId: null, projectId: null, sprintId: null },
      },
    };
  }

  private choiceResponse(
    state: ContextState,
    answer: string,
    choices: ContextChoice[],
  ) {
    return {
      success: true,
      message: 'Cần bổ sung phạm vi tra cứu',
      data: {
        answer: choices.length
          ? answer
          : 'Không có dữ liệu phù hợp mà tài khoản của bạn được phép truy cập.',
        suggestedQuestions: [],
        sources: [],
        state,
        choices,
        scope: {},
      },
    };
  }

  private isFeatureQuestion(question: string) {
    const normalized = this.normalize(question);
    return [
      'la gi',
      'cach ',
      'lam sao',
      'huong dan',
      'tinh nang',
      'quyen gi',
      'co tac dung gi',
    ].some((term) => normalized.includes(term));
  }

  private isOutOfScopeQuestion(question: string) {
    const normalized = this.normalize(question).trim();
    const asksForUnrelatedBuild =
      /(?:code|viet|lap trinh|tao|xay).*(?:thuat (?:toan|ton)|ma nguon|website|web|app|ung dung|game|bot)|(?:thuat (?:toan|ton)|ma nguon|website|web|app|ung dung|game|bot).*(?:code|viet|lap trinh|tao|xay)/u.test(
        normalized,
      );
    const unrelatedTopic =
      /(?:nau an|thoi tiet|giai tri|tinh yeu|xem boi|dich thuat|giai bai|lam bai tap)/u.test(
        normalized,
      );

    return asksForUnrelatedBuild || unrelatedTopic;
  }

  private needsSprint(question: string) {
    const normalized = this.normalize(question);
    // Chỉ yêu cầu chọn Sprint khi người dùng nhắc trực tiếp đến Sprint.
    // Các câu hỏi về task, quá hạn hoặc tiến độ vẫn trả lời được bằng phạm vi
    // mặc định của dự án, tránh chuỗi câu hỏi làm gián đoạn hội thoại.
    return normalized.includes('sprint');
  }

  private normalize(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private async assertWorkspaceMembership(userId: string, workspaceId: string) {
    const membership =
      await this.workspaceMembersRepository.findActiveByWorkspaceAndUser(
        workspaceId,
        userId,
      );
    if (!membership)
      throw new ForbiddenException('Bạn không có quyền truy cập Workspace này');
  }

  private sprintStatusLabel(status: SprintStatus) {
    if (status === SprintStatus.Active) return 'Đang chạy';
    if (status === SprintStatus.Completed) return 'Đã hoàn thành';
    return 'Đã lên kế hoạch';
  }
}
