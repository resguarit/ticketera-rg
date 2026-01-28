import { cn } from '@/lib/utils';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder,
    className,
}: RichTextEditorProps) {
    const modules = {
        toolbar: [
            [{ 'header': [2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean'],
        ],
    };

    return (
        <div className={cn("rich-text-editor", className)}>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                placeholder={placeholder}
                className="bg-white rounded-md"
            />
            <style>{`
                .rich-text-editor .ql-container.ql-snow {
                    border: 1px solid var(--color-input);
                    border-top: none;
                    border-bottom-left-radius: var(--radius-md);
                    border-bottom-right-radius: var(--radius-md);
                }
                .rich-text-editor .ql-toolbar.ql-snow {
                    border: 1px solid var(--color-input);
                    border-top-left-radius: var(--radius-md);
                    border-top-right-radius: var(--radius-md);
                    background-color: var(--color-muted);
                }
                .rich-text-editor .ql-editor {
                    min-height: 120px;
                    font-size: 0.875rem;
                    color: var(--color-foreground);
                }
                .rich-text-editor .ql-editor.ql-blank::before {
                    color: var(--color-muted-foreground);
                    font-style: normal;
                }
            `}</style>
        </div>
    );
}
