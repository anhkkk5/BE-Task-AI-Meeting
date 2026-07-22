import { Repository } from 'typeorm';
import { AiFocusArea } from '../enums/ai-focus-area.enum';
import { AiResponseStyle } from '../enums/ai-response-style.enum';
import { AiTone } from '../enums/ai-tone.enum';
import { AiUserPreference } from '../entities/ai-user-preference.entity';
import { AiUserPreferencesService } from './ai-user-preferences.service';

describe('AiUserPreferencesService', () => {
  let repository: jest.Mocked<
    Pick<Repository<AiUserPreference>, 'create' | 'delete' | 'findOne' | 'save'>
  >;
  let service: AiUserPreferencesService;

  beforeEach(() => {
    repository = {
      create: jest.fn((value) => value as AiUserPreference),
      delete: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn((value) => Promise.resolve(value as AiUserPreference)),
    } as never;
    service = new AiUserPreferencesService(
      repository as unknown as Repository<AiUserPreference>,
    );
  });

  it('returns defaults when the user has no saved preferences', async () => {
    repository.findOne.mockResolvedValue(null);

    const response = await service.getPreferences('user-id');

    expect(response.data).toEqual({
      responseStyle: AiResponseStyle.Balanced,
      tone: AiTone.Professional,
      focusAreas: [
        AiFocusArea.Progress,
        AiFocusArea.Blockers,
        AiFocusArea.Decisions,
        AiFocusArea.ActionItems,
      ],
    });
  });

  it('merges and saves the fields selected by the user', async () => {
    repository.findOne.mockResolvedValue(null);

    const response = await service.updatePreferences('user-id', {
      responseStyle: AiResponseStyle.Concise,
      tone: AiTone.Direct,
      focusAreas: [AiFocusArea.Deadlines, AiFocusArea.ActionItems],
    });

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-id',
        responseStyle: AiResponseStyle.Concise,
        tone: AiTone.Direct,
        focusAreas: [AiFocusArea.Deadlines, AiFocusArea.ActionItems],
      }),
    );
    expect(response.data.responseStyle).toBe(AiResponseStyle.Concise);
  });

  it('deletes saved preferences and returns defaults on reset', async () => {
    const response = await service.resetPreferences('user-id');

    expect(repository.delete).toHaveBeenCalledWith({ userId: 'user-id' });
    expect(response.data.tone).toBe(AiTone.Professional);
  });
});
