import {
  cleanTranscriptLines,
  isNoiseTranscript,
} from './transcript-noise.util';

describe('transcript-noise.util', () => {
  describe('isNoiseTranscript', () => {
    // Cac cau Whisper tu sinh khi dau vao chi la khoang lang / tieng on.
    const hallucinatedLines = [
      'Hãy đăng ký kênh để ủng hộ kênh của mình nhé!',
      'Hãy subscribe cho kênh La La School Để không bỏ lỡ những video hấp dẫn',
      'Để tìm hiểu thêm, hãy xem video này và hãy đăng ký kênh để nhận thông tin nhất.',
      'Cảm ơn các bạn đã lắng nghe',
      'Phụ đề được thực hiện bởi cộng đồng Amara.org',
      'Xin chào và hẹn gặp lại các bạn trong video tiếp theo',
      'Truy cập www.example.com để biết thêm',
      // Cac cau nguoi dung thuc te gap trong phong hop.
      'Cảm ơn tất cả mọi người đã theo dõi.',
      'Cảm ơn các bạn đã theo dõi và hẹn gặp lại.',
    ];

    it.each(hallucinatedLines)('coi la nhieu: %s', (line) => {
      expect(isNoiseTranscript(line)).toBe(true);
    });

    // Loi noi that trong cuoc hop phai duoc giu lai.
    const realSpeech = [
      'Xin chào tất cả mọi người, mình là Nguyễn Tuấn Anh.',
      'Tuần trước bọn em đã làm xong tính năng đăng ký tài khoản.',
      'Tuần này em sẽ làm thêm trang cá nhân và màn hình backlog.',
      'Hôm nay chúng ta bắt đầu cuộc họp daily scrum.',
    ];

    it.each(realSpeech)('giu lai loi noi that: %s', (line) => {
      expect(isNoiseTranscript(line)).toBe(false);
    });

    it('coi chuoi rong va dau cau la nhieu', () => {
      expect(isNoiseTranscript('')).toBe(true);
      expect(isNoiseTranscript('   ')).toBe(true);
      expect(isNoiseTranscript('...')).toBe(true);
      expect(isNoiseTranscript(null)).toBe(true);
    });

    it('coi mot tu lap lai nhieu lan la nhieu', () => {
      expect(isNoiseTranscript('hmm hmm hmm hmm')).toBe(true);
    });
  });

  describe('cleanTranscriptLines', () => {
    it('bo dong nhieu nhung giu dong that theo dung thu tu', () => {
      const lines = [
        'Nguyễn Tuấn Anh: Hãy đăng ký kênh để ủng hộ kênh của mình nhé!',
        'Nguyễn Tuấn Anh: Xin chào tất cả mọi người.',
        'Nguyễn Tuấn Anh: Hãy subscribe cho kênh La La School',
        'Trần Bình: Tuần này em làm trang cá nhân.',
      ];

      expect(cleanTranscriptLines(lines)).toEqual([
        'Nguyễn Tuấn Anh: Xin chào tất cả mọi người.',
        'Trần Bình: Tuần này em làm trang cá nhân.',
      ]);
    });

    it('bo dong lap lien tiep cua cung nguoi noi', () => {
      const lines = [
        'Nguyễn Tuấn Anh: Xin chào tất cả mọi người.',
        'Nguyễn Tuấn Anh: Xin chào tất cả mọi người.',
      ];

      expect(cleanTranscriptLines(lines)).toHaveLength(1);
    });
  });
});
