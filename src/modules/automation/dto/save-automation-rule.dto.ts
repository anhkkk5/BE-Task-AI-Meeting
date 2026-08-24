import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
export class SaveAutomationRuleDto {
  @IsString() @MinLength(2) @MaxLength(160) name: string;
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsObject() trigger: { type: 'DUE_DATE'; daysBefore?: number };
  @IsArray() conditions: Array<{
    field: string;
    operator: string;
    value?: unknown;
  }>;
  @IsArray() actions: Array<{
    type: 'NOTIFY_ASSIGNEE' | 'CHANGE_STATUS' | 'ASSIGN_USER';
    value?: string;
    message?: string;
  }>;
}
