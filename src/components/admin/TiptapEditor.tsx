import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  editable?: boolean;
  minHeight?: number;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  value,
  onChange,
  editable = true,
  minHeight = 180,
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "<p></p>");
    }
    // eslint-disable-next-line
  }, [value]);

  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 4, minHeight, padding: 8, background: "#fff" }}>
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor; 