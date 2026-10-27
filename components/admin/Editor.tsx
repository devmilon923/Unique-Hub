"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  EditorContent,
  EditorRoot,
  JSONContent,
  StarterKit,
  Placeholder,
  useEditor,
} from "novel";
import {
  LuBold,
  LuItalic,
  LuHeading2,
  LuHeading3,
  LuList,
  LuListOrdered,
  LuQuote,
  LuMinus,
  LuUndo,
  LuRedo,
} from "react-icons/lu";

interface AdminProductDescriptionProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  borderless?: boolean;
  className?: string;
}

/**
 * Robust initial content parser.
 * Supports stringified TipTap JSON as well as multiline plain text.
 */
function parseInitialContent(val?: string): JSONContent | undefined {
  if (!val || !val.trim()) return undefined;
  const trimmed = val.trim();

  // 1. TipTap JSON content
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && parsed.type === "doc") {
        return parsed as JSONContent;
      }
    } catch {
      // Fall through to plain text parsing
    }
  }

  // 2. Multiline plain text -> split into paragraphs
  const paragraphs = trimmed
    .split(/\r?\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return undefined;

  return {
    type: "doc",
    content: paragraphs.map((text) => ({
      type: "paragraph",
      content: [{ type: "text", text }],
    })),
  };
}

/**
 * Synchronizes external `value` changes into the editor instance
 * (e.g., when initialData loads asynchronously or form is reset),
 * while ignoring internal updates triggered by typing.
 */
function EditorSync({ value }: { value?: string }) {
  const { editor } = useEditor();
  const lastKnownValueRef = useRef(value);

  useEffect(() => {
    if (!editor) return;

    // Check if the external value actually changed from what the editor last emitted
    if (value !== lastKnownValueRef.current) {
      lastKnownValueRef.current = value;
      const currentJson = editor.getJSON();
      const currentStringified = JSON.stringify(currentJson);

      if (value !== currentStringified) {
        if (!value || !value.trim()) {
          editor.commands.clearContent();
        } else {
          const parsed = parseInitialContent(value);
          if (parsed) {
            editor.commands.setContent(parsed);
          }
        }
      }
    }
  }, [value, editor]);

  return null;
}

function EditorToolbar() {
  const { editor } = useEditor();
  const [, setTick] = useState(0);

  // Re-render toolbar when editor selection or marks change so active states remain 100% reactive
  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => setTick((t) => t + 1);

    editor.on("transaction", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);

    return () => {
      editor.off("transaction", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-neutral-100 bg-neutral-50/70 px-4 sm:px-5 py-2 text-xs select-none">
      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`size-7 inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
          editor.isActive("heading", { level: 2 })
            ? "bg-neutral-900 text-white shadow-2xs"
            : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
        }`}
        title="Heading 2 (Ctrl+Alt+2)"
      >
        <LuHeading2 className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`size-7 inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
          editor.isActive("heading", { level: 3 })
            ? "bg-neutral-900 text-white shadow-2xs"
            : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
        }`}
        title="Heading 3 (Ctrl+Alt+3)"
      >
        <LuHeading3 className="size-3.5" />
      </button>

      <div className="h-4 w-px bg-neutral-200 mx-1" />

      {/* Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`size-7 inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
          editor.isActive("bold")
            ? "bg-neutral-900 text-white shadow-2xs"
            : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
        }`}
        title="Bold (Ctrl+B)"
      >
        <LuBold className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`size-7 inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
          editor.isActive("italic")
            ? "bg-neutral-900 text-white shadow-2xs"
            : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
        }`}
        title="Italic (Ctrl+I)"
      >
        <LuItalic className="size-3.5" />
      </button>

      <div className="h-4 w-px bg-neutral-200 mx-1" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`size-7 inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
          editor.isActive("bulletList")
            ? "bg-neutral-900 text-white shadow-2xs"
            : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
        }`}
        title="Bullet List"
      >
        <LuList className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`size-7 inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
          editor.isActive("orderedList")
            ? "bg-neutral-900 text-white shadow-2xs"
            : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
        }`}
        title="Numbered List"
      >
        <LuListOrdered className="size-3.5" />
      </button>

      {/* Blockquote & Divider */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`size-7 inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
          editor.isActive("blockquote")
            ? "bg-neutral-900 text-white shadow-2xs"
            : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
        }`}
        title="Quote Block"
      >
        <LuQuote className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="size-7 inline-flex items-center justify-center rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors cursor-pointer"
        title="Horizontal Divider"
      >
        <LuMinus className="size-3.5" />
      </button>

      {/* Undo & Redo */}
      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="size-7 inline-flex items-center justify-center rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <LuUndo className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="size-7 inline-flex items-center justify-center rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Redo (Ctrl+Y)"
        >
          <LuRedo className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

const AdminProductDescription: React.FC<AdminProductDescriptionProps> = ({
  value,
  onChange,
  disabled = false,
  borderless = false,
  className = "",
  placeholder = "Write detailed product specifications, features, materials, and warranty...",
}) => {
  // Only calculate initial content once at mount; external changes are synced via EditorSync
  const initialContentRef = useRef<JSONContent | undefined>(undefined);
  if (initialContentRef.current === undefined && value) {
    initialContentRef.current = parseInitialContent(value);
  }

  const extensions = useMemo(
    () => [
      StarterKit,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    [placeholder]
  );

  const containerClasses = borderless
    ? `w-full bg-background overflow-hidden outline-none ring-0 border-0 ${className}`
    : `w-full rounded-xl border border-input bg-background shadow-xs overflow-hidden outline-none ${className}`;

  return (
    <div className={containerClasses}>
      <EditorRoot>
        <EditorContent
          initialContent={initialContentRef.current}
          extensions={extensions}
          immediatelyRender={false}
          editable={!disabled}
          slotBefore={<EditorToolbar />}
          editorProps={{
            attributes: {
              class:
                "prose-editor min-h-[220px] px-4 sm:px-5 py-4 text-xs leading-relaxed text-foreground focus:outline-none outline-none ring-0 border-0",
            },
          }}
          onUpdate={({ editor }) => {
            const plainText = editor.getText().trim();
            // Edge case: if editor only contains whitespace or empty blocks, emit empty string
            if (!plainText && editor.isEmpty) {
              onChange?.("");
            } else if (!plainText) {
              onChange?.("");
            } else {
              const json = editor.getJSON();
              onChange?.(JSON.stringify(json));
            }
          }}
        >
          <EditorSync value={value} />
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export default AdminProductDescription;

