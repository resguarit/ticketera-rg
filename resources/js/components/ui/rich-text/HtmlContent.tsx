import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';

interface HtmlContentProps {
    content: string;
    className?: string;
}

export default function HtmlContent({ content, className }: HtmlContentProps) {
    const sanitizedContent = DOMPurify.sanitize(content);

    return (
        <div
            className={cn(
                'prose prose-sm max-w-none dark:prose-invert',
                'prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5',
                className
            )}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
    );
}
