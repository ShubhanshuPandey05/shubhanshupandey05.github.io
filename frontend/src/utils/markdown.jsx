// A small markdown renderer for journal entries. It covers what the admin
// editor is used for: headings, paragraphs, lists, quotes, rules, images,
// fenced code, and inline code, bold, italic and links.

const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\((?:https?:\/\/|\/|#|mailto:)[^)\s]+\))/;

const inline = (text, keyPrefix = 'i') => {
    const parts = [];
    let rest = text;
    let key = 0;
    while (rest) {
        const match = rest.match(INLINE);
        if (!match) {
            parts.push(rest);
            break;
        }
        if (match.index > 0) parts.push(rest.slice(0, match.index));
        const token = match[0];
        const id = `${keyPrefix}-${key++}`;
        if (match[1]) parts.push(<code key={id}>{token.slice(1, -1)}</code>);
        else if (match[2]) parts.push(<strong key={id}>{inline(token.slice(2, -2), id)}</strong>);
        else if (match[3]) parts.push(<em key={id}>{inline(token.slice(1, -1), id)}</em>);
        else {
            const [, label, href] = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            const external = /^https?:\/\//.test(href);
            parts.push(
                <a key={id} href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
                    {label}
                </a>
            );
        }
        rest = rest.slice(match.index + token.length);
    }
    return parts;
};

const isBlockStart = (line) => /^(#{1,3} |> ?|[-*] |\d+\. |```|!\[)/.test(line) || /^-{3,}\s*$/.test(line);

export const renderMarkdown = (source) => {
    if (!source) return null;
    const lines = source.replace(/\r\n/g, '\n').split('\n');
    const blocks = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const key = `b-${i}`;

        if (!line.trim()) {
            i++;
        } else if (line.startsWith('```')) {
            const code = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++]);
            i++;
            blocks.push(
                <pre key={key}>
                    <code>{code.join('\n')}</code>
                </pre>
            );
        } else if (/^-{3,}\s*$/.test(line)) {
            blocks.push(<hr key={key} />);
            i++;
        } else if (/^#{1,3} /.test(line)) {
            const level = line.match(/^#+/)[0].length;
            // The page already has its h1, so entry headings start one level down.
            const Heading = `h${Math.min(level + 1, 4)}`;
            blocks.push(<Heading key={key}>{inline(line.slice(level + 1), key)}</Heading>);
            i++;
        } else if (/^> ?/.test(line)) {
            const quote = [];
            while (i < lines.length && /^> ?/.test(lines[i])) quote.push(lines[i++].replace(/^> ?/, ''));
            blocks.push(<blockquote key={key}>{inline(quote.join(' '), key)}</blockquote>);
        } else if (/^[-*] /.test(line)) {
            const items = [];
            while (i < lines.length && /^[-*] /.test(lines[i])) items.push(lines[i++].slice(2));
            blocks.push(
                <ul key={key}>
                    {items.map((item, index) => (
                        <li key={index}>{inline(item, `${key}-${index}`)}</li>
                    ))}
                </ul>
            );
        } else if (/^\d+\. /.test(line)) {
            const items = [];
            while (i < lines.length && /^\d+\. /.test(lines[i])) items.push(lines[i++].replace(/^\d+\. /, ''));
            blocks.push(
                <ol key={key}>
                    {items.map((item, index) => (
                        <li key={index}>{inline(item, `${key}-${index}`)}</li>
                    ))}
                </ol>
            );
        } else if (/^!\[[^\]]*\]\([^)\s]+\)\s*$/.test(line)) {
            const [, alt, src] = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)/);
            blocks.push(<img key={key} src={src} alt={alt} loading="lazy" />);
            i++;
        } else {
            const paragraph = [];
            while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) paragraph.push(lines[i++]);
            blocks.push(<p key={key}>{inline(paragraph.join(' '), key)}</p>);
        }
    }

    return blocks;
};
