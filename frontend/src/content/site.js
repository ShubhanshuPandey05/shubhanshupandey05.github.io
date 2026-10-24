// Everything a visitor reads that does not come from the CMS lives here, so the
// Japanese stays in one place where it can be checked. Plain data only: the
// font and brush scripts in /scripts import this file from Node.

export const owner = {
    name: 'Shubhanshu Pandey',
    title: 'Backend Developer',
    subtitle: 'Building scalable & robust server-side architectures',
    initials: 'SP',
    tagline: 'thinking human',
};

// The name on the noren. Satoyama is the farmed valley between village and mountain.
export const house = { kanji: '里山', kana: 'さとやま' };

// Section ids are the anchors the site has always used.
export const rooms = {
    about: { id: 'about', label: 'About', kanji: '縁側', kana: 'えんがわ', place: 'the veranda' },
    projects: { id: 'projects', label: 'Work', kanji: '仕事', kana: 'しごと', place: 'the workroom' },
    skills: { id: 'skills', label: 'Tools', kanji: '道具', kana: 'どうぐ', place: 'the tool chest' },
    blog: { id: 'blog', label: 'Blog', kanji: '日誌', kana: 'にっし', place: 'the writing desk' },
    contact: { id: 'contact', label: 'Contact', kanji: '便り', kana: 'たより', place: 'the gate' },
};

export const idiom = {
    kanji: '縁の下の力持ち',
    kana: 'えんのしたのちからもち',
    literal: 'The strong one under the veranda',
    meaning: 'Someone whose work holds everything up and is never seen. It is also a fair description of backend engineering.',
};

// Formal numerals, the kind written on deeds and banknotes. One per lamp.
export const numerals = ['壱', '弐', '参', '肆', '伍', '陸', '漆', '捌', '玖', '拾'];

// The sign a shop hangs by its door.
export const signs = {
    open: { kanji: '営業中', label: 'Open' },
    preparing: { kanji: '準備中', label: 'Preparing' },
};

// One character per CMS category. Front and back are the classic pair 表 / 裏.
export const categoryMarks = {
    Backend: { kanji: '裏', gloss: 'back' },
    Frontend: { kanji: '表', gloss: 'front' },
    Database: { kanji: '蔵', gloss: 'storehouse' },
    DevOps: { kanji: '運', gloss: 'running' },
    Tools: { kanji: '具', gloss: 'implements' },
    Other: { kanji: '他', gloss: 'other' },
};

// The marks a Japanese report card uses. Thresholds apply to the CMS proficiency value.
export const grades = [
    { min: 85, mark: '◎', label: 'core' },
    { min: 65, mark: '○', label: 'comfortable' },
    { min: 0, mark: '△', label: 'learning' },
];

export const pages = {
    resume: { kanji: '履歴書', kana: 'りれきしょ', label: 'Resume' },
    notFound: { kanji: '留守', kana: 'るす', label: 'Nobody home' },
    admin: { kanji: '蔵', kana: 'くら', label: 'Storehouse' },
    workroom: { kanji: '仕事場', kana: 'しごとば', label: 'Workroom' },
};

export const farewell = { kanji: 'またどうぞ', label: 'Come again' };

export const post = { kanji: '郵便', mark: '〒' };

// Words that are brush-written stroke by stroke. `npm run brush` fetches the
// stroke data for exactly these characters.
export const brushWords = [
    house.kanji,
    idiom.kanji,
    ...Object.values(rooms).map((room) => room.kanji),
    pages.resume.kanji,
    pages.notFound.kanji,
    pages.admin.kanji,
    pages.workroom.kanji,
];
