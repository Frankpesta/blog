"use client";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Minus,
  Undo,
  Redo,
  Eye,
  EyeOff,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import YoutubeExtension from "@tiptap/extension-youtube";
import { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function ToolbarBtn({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      title={title}
      disabled={disabled}
      className={cn(
        "size-9 shrink-0 p-0 text-zinc-400 hover:bg-white/10 hover:text-[#F5A623]",
        active && "bg-[#F5A623]/15 text-[#F5A623]",
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

type PostEditorProps = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  onImageUpload: (file: File) => Promise<string | null>;
};

export function PostEditor({
  content,
  onChange,
  placeholder = "Start writing your article…",
  readOnly = false,
  onImageUpload,
}: PostEditorProps) {
  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: true,
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
        }),
        ImageExtension.configure({
          allowBase64: false,
        }),
        Placeholder.configure({ placeholder }),
        YoutubeExtension.configure({
          width: 640,
          height: 360,
          HTMLAttributes: { class: "my-4 aspect-video w-full max-w-2xl rounded-lg" },
        }),
      ],
      content,
      editable: !readOnly,
      onUpdate: ({ editor: e }) => {
        onChange(e.getHTML());
      },
    },
    [readOnly, placeholder],
  );

  useEffect(() => {
    if (!editor) {
      return;
    }
    if (readOnly) {
      editor.setEditable(false);
    } else {
      editor.setEditable(true);
    }
  }, [editor, readOnly]);

  useEffect(() => {
    if (!editor || content === editor.getHTML()) {
      return;
    }
    editor.commands.setContent(content);
  }, [editor, content]);

  const addLink = useCallback(() => {
    if (!editor) {
      return;
    }
    const prev = prompt("Paste URL:");
    if (prev?.trim()) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: prev.trim() }).run();
    }
  }, [editor]);

  const addYoutube = useCallback(() => {
    if (!editor) {
      return;
    }
    const url = prompt("Paste YouTube URL:");
    if (url?.trim()) {
      editor.commands.setYoutubeVideo({ src: url.trim() });
    }
  }, [editor]);

  const addImage = useCallback(async () => {
    if (!editor) {
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/gif";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }
      const url = await onImageUpload(file);
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    };
    input.click();
  }, [editor, onImageUpload]);

  if (!editor) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-zinc-700 bg-[#0A0F1E] text-zinc-500">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-700 bg-[#0A0F1E]">
      {!readOnly ? (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-700 bg-[#111827] px-2 py-2">
          <ToolbarBtn
            title="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Strike"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="size-4" />
          </ToolbarBtn>
          <span className="mx-1 h-6 w-px bg-zinc-600" />
          <ToolbarBtn
            title="Heading 2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Heading 3"
            active={editor.isActive("heading", { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 className="size-4" />
          </ToolbarBtn>
          <span className="mx-1 h-6 w-px bg-zinc-600" />
          <ToolbarBtn
            title="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Numbered list"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Quote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Code block"
            active={editor.isActive("codeBlock")}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Horizontal rule"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus className="size-4" />
          </ToolbarBtn>
          <span className="mx-1 h-6 w-px bg-zinc-600" />
          <ToolbarBtn title="Link" onClick={addLink}>
            <LinkIcon className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn title="Insert image" onClick={() => void addImage()}>
            <ImageIcon className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn title="YouTube embed" onClick={addYoutube}>
            <Video className="size-4" />
          </ToolbarBtn>
          <span className="mx-1 h-6 w-px bg-zinc-600" />
          <ToolbarBtn
            title="Undo"
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Redo"
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo className="size-4" />
          </ToolbarBtn>
        </div>
      ) : null}
      <EditorContent
        editor={editor}
        className={cn(
          "prose prose-invert max-w-none px-4 py-4 md:px-6",
          "min-h-[420px] [&_.ProseMirror]:min-h-[380px] [&_.ProseMirror]:outline-none",
          "[&_.ProseMirror]:text-zinc-100 [&_.ProseMirror]:leading-relaxed",
          "[&_.ProseMirror_h2]:font-heading [&_.ProseMirror_h3]:font-heading",
          "[&_.ProseMirror_a]:text-[#F5A623]",
          "[&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:border [&_.ProseMirror_img]:border-white/10",
          "[&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:border [&_.ProseMirror_pre]:border-white/10 [&_.ProseMirror_pre]:bg-black/40",
        )}
      />
    </div>
  );
}

export function PostPreviewHtml({ html }: { html: string }) {
  return (
    <article
      className="prose prose-invert max-w-none min-h-[420px] px-4 py-4 [&_a]:text-[#F5A623]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
