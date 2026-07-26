"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripDiacritics = stripDiacritics;
exports.normalizeTranscriptText = normalizeTranscriptText;
exports.isNoiseTranscript = isNoiseTranscript;
exports.cleanTranscriptLines = cleanTranscriptLines;
const NOISE_PATTERNS = [
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
const URL_PATTERNS = [/https?:\/\//i, /www\./i, /\.(com|org|net|vn)\b/i];
function stripDiacritics(value) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
}
function normalizeTranscriptText(value) {
    return stripDiacritics(value)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
function isNoiseTranscript(text) {
    const rawText = text?.trim();
    if (!rawText)
        return true;
    const normalized = normalizeTranscriptText(rawText);
    if (normalized.length < 2)
        return true;
    if (!/[a-z]/.test(normalized))
        return true;
    if (URL_PATTERNS.some((pattern) => pattern.test(rawText)))
        return true;
    if (NOISE_PATTERNS.some((pattern) => pattern.test(normalized)))
        return true;
    const words = normalized.split(' ');
    if (words.length >= 4 && new Set(words).size === 1)
        return true;
    return false;
}
function cleanTranscriptLines(lines) {
    const cleaned = [];
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine)
            continue;
        const [maybeSpeaker, ...rest] = trimmedLine.split(':');
        const spokenText = rest.length ? rest.join(':').trim() : trimmedLine;
        const speaker = rest.length ? maybeSpeaker.trim() : '';
        if (isNoiseTranscript(spokenText))
            continue;
        const previousLine = cleaned[cleaned.length - 1];
        const currentKey = `${speaker}|${normalizeTranscriptText(spokenText)}`;
        if (previousLine) {
            const [prevSpeaker, ...prevRest] = previousLine.split(':');
            const prevText = prevRest.length
                ? prevRest.join(':').trim()
                : previousLine;
            const previousKey = `${prevRest.length ? prevSpeaker.trim() : ''}|${normalizeTranscriptText(prevText)}`;
            if (previousKey === currentKey)
                continue;
        }
        cleaned.push(trimmedLine);
    }
    return cleaned;
}
//# sourceMappingURL=transcript-noise.util.js.map