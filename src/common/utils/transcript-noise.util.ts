/**
 * Whisper thuong "hallucinate" cac cau quang cao YouTube khi dau vao la
 * khoang lang hoac tieng on. Cac cau nay khong ai noi trong cuoc hop nen
 * phai bi loai truoc khi luu vao transcript.
 */
const NOISE_PATTERNS: RegExp[] = [
  /dang ky kenh/,
  /dang ki kenh/,
  /subscribe/,
  /like va dang ky/,
  /bam chuong/,
  /an chuong thong bao/,
  /ung ho kenh/,
  /kenh cua minh/,
  /kenh cua chung toi/,
  /video hap dan/,
  /video moi nhat/,
  /video tiep theo/,
  /la la school/,
  /ghien mi go/,
  /phu de tieng viet/,
  /vietsub/,
  /biet dich vien/,
  /nguoi dich/,
  // Tong quat hoa: Whisper sinh ra rat nhieu bien the cua cung mot cau
  // ("cam on cac ban da theo doi", "cam on tat ca moi nguoi da theo doi"...)
  // nen bat theo cap dong tu thay vi liet ke tung cau.
  /cam on .{0,30}da (theo doi|xem|lang nghe|dong hanh)/,
  /cam on .{0,30}da danh thoi gian/,
  /hen gap lai/,
  /chuc cac ban xem (video|phim) vui ve/,
  /hay theo doi kenh/,
  /de khong bo lo/,
  /thong tin moi nhat/,
  /de nhan thong tin/,
  /cam on cac ban da lang nghe/,
  /cam on ban da lang nghe/,
  /chuc cac ban mot ngay tot lanh/,
  /phu de duoc thuc hien boi/,
  /phu de thuc hien boi/,
  /transcript by/,
  /hen gap lai cac ban/,
  /xin chao va hen gap lai/,
  /nho like va share/,
  /nhan nut dang ky/,
];

/**
 * Cac mau chua dau cham / gach cheo phai so khop tren van ban GOC, vi
 * normalizeTranscriptText() da xoa het ky tu dac biet.
 */
const URL_PATTERNS: RegExp[] = [
  /https?:\/\//i,
  /www\./i,
  /\.(com|org|net|vn)\b/i,
];

export function stripDiacritics(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function normalizeTranscriptText(value: string) {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tra ve true khi doan text khong phai loi noi thuc trong cuoc hop.
 */
export function isNoiseTranscript(text?: string | null) {
  const rawText = text?.trim();

  if (!rawText) return true;

  const normalized = normalizeTranscriptText(rawText);

  if (normalized.length < 2) return true;

  // Chi gom dau cau hoac ky tu lap lai kieu "...", "hmm hmm hmm".
  if (!/[a-z]/.test(normalized)) return true;

  if (URL_PATTERNS.some((pattern) => pattern.test(rawText))) return true;

  if (NOISE_PATTERNS.some((pattern) => pattern.test(normalized))) return true;

  const words = normalized.split(' ');

  // Whisper hay lap 1 tu duy nhat rat nhieu lan khi gap tieng on.
  if (words.length >= 4 && new Set(words).size === 1) return true;

  return false;
}

/**
 * Loai bo cac dong nhieu va cac dong lap lien tiep trong bien ban da luu.
 */
export function cleanTranscriptLines(lines: string[]) {
  const cleaned: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) continue;

    const [maybeSpeaker, ...rest] = trimmedLine.split(':');
    const spokenText = rest.length ? rest.join(':').trim() : trimmedLine;
    const speaker = rest.length ? maybeSpeaker.trim() : '';

    if (isNoiseTranscript(spokenText)) continue;

    const previousLine = cleaned[cleaned.length - 1];
    const currentKey = `${speaker}|${normalizeTranscriptText(spokenText)}`;

    if (previousLine) {
      const [prevSpeaker, ...prevRest] = previousLine.split(':');
      const prevText = prevRest.length
        ? prevRest.join(':').trim()
        : previousLine;
      const previousKey = `${prevRest.length ? prevSpeaker.trim() : ''}|${normalizeTranscriptText(prevText)}`;

      if (previousKey === currentKey) continue;
    }

    cleaned.push(trimmedLine);
  }

  return cleaned;
}
