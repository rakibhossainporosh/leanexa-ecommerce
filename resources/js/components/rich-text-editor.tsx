import { useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
    ClassicEditor,
    Essentials,
    Autoformat,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    BlockQuote,
    Heading,
    Link,
    List,
    Paragraph,
    Table,
    TableToolbar,
    TableProperties,
    TableCellProperties,
    Indent,
    IndentBlock,
    Alignment,
    RemoveFormat,
    SourceEditing,
    Font,
    HorizontalLine,
    PasteFromOffice,
    Image,
    ImageToolbar,
    ImageCaption,
    ImageStyle,
    ImageResize,
    ImageInsert,
    ImageUpload,
    Base64UploadAdapter,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';

/**
 * Shared rich-text editor (CKEditor 5, GPL) with a full classic toolbar.
 * Images are embedded as base64 so no upload server is required.
 */
export default function RichTextEditor({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
}) {
    // Capture the initial HTML once. Re-feeding the live `value` back into the
    // `data` prop on every keystroke fights the editor and makes toolbar edits
    // appear to do nothing; the form is kept in sync purely through onChange.
    const initialData = useRef(value || '').current;

    return (
        <CKEditor
            editor={ClassicEditor}
            data={initialData}
            config={{
                licenseKey: 'GPL',
                placeholder,
                plugins: [
                    Essentials, Autoformat, Paragraph, Heading,
                    Bold, Italic, Underline, Strikethrough, RemoveFormat,
                    Font, Alignment, Link, List, BlockQuote, HorizontalLine,
                    Indent, IndentBlock, PasteFromOffice, SourceEditing,
                    Table, TableToolbar, TableProperties, TableCellProperties,
                    Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, ImageInsert, ImageUpload, Base64UploadAdapter,
                ],
                toolbar: [
                    'undo', 'redo', '|',
                    'sourceEditing', '|',
                    'heading', '|',
                    'fontSize', 'fontColor', 'fontBackgroundColor', '|',
                    'bold', 'italic', 'underline', 'strikethrough', 'removeFormat', '|',
                    'alignment', '|',
                    'bulletedList', 'numberedList', 'outdent', 'indent', '|',
                    'link', 'blockQuote', 'insertTable', 'horizontalLine', 'insertImage',
                ],
                image: {
                    toolbar: ['imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative', '|', 'resizeImage'],
                },
                table: {
                    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties'],
                },
            }}
            onChange={(_event, editor) => onChange(editor.getData())}
        />
    );
}
