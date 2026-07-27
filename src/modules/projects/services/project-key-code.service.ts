import { Injectable } from '@nestjs/common';
import { ProjectsRepository } from '../repositories/projects.repository';

const keyCodeMaxLength = 20;
const fallbackKeyCode = 'PRJ';

/**
 * Sinh key code cho project tu ten project.
 *
 * Key code khong phai thu nguoi dung can quan tam, nhung no la tien to cua ma
 * task (`ABCD-1`) nen van phai ton tai va unique trong workspace.
 */
@Injectable()
export class ProjectKeyCodeService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  /**
   * Bo dau tieng Viet va cac ky tu khong hop le.
   *
   * normalize('NFD') tach nguyen am va dau thanh 2 code point roi regex xoa
   * phan dau. Rieng chu d/D co gach ngang khong tach duoc nen phai thay tay.
   */
  private removeDiacritics(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\u0111/g, 'd')
      .replace(/\u0110/g, 'D');
  }

  /**
   * Ten nhieu tu thi lay chu cai dau moi tu, ten mot tu thi lay toi da 4 ky tu.
   *
   * "Task AI Meeting" -> TAM, "Nexus" -> NEXU.
   */
  buildBaseKeyCode(name: string) {
    const words = this.removeDiacritics(name)
      .toUpperCase()
      .replace(/[^A-Z0-9\s_]/g, ' ')
      .split(/[\s_]+/)
      .filter((word) => word.length > 0);

    if (words.length === 0) {
      return fallbackKeyCode;
    }

    const base =
      words.length > 1
        ? words.map((word) => word[0]).join('')
        : words[0].slice(0, 4);

    // Ten kieu "123" cho ra base toan so. Them tien to chu de key code luon bat
    // dau bang chu cai cho de doc.
    const normalized = /^[0-9]/.test(base) ? `${fallbackKeyCode}${base}` : base;

    return normalized.slice(0, keyCodeMaxLength) || fallbackKeyCode;
  }

  /**
   * Tra ve key code chua bi dung trong workspace.
   *
   * Neu base da ton tai thi them so dem phia sau (TAM, TAM2, TAM3...). Phan cat
   * chuoi dam bao tong do dai khong vuot qua gioi han cot.
   */
  async generateUniqueKeyCode(workspaceId: string, name: string) {
    const base = this.buildBaseKeyCode(name);
    const existing = await this.projectsRepository.findKeyCodesByPrefix(
      workspaceId,
      base,
    );
    const taken = new Set(existing.map((keyCode) => keyCode.toUpperCase()));

    if (!taken.has(base)) {
      return base;
    }

    for (let suffix = 2; ; suffix += 1) {
      const suffixText = String(suffix);
      const trimmedBase = base.slice(0, keyCodeMaxLength - suffixText.length);
      const candidate = `${trimmedBase}${suffixText}`;

      if (!taken.has(candidate)) {
        return candidate;
      }
    }
  }
}
