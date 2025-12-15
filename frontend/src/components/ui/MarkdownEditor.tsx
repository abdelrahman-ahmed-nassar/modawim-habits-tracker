import React, { useState, useCallback, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  Edit3,
  HelpCircle,
  CheckSquare,
  Calendar,
  Star,
  Zap,
  FileText,
  ChevronDown,
  AlignLeft,
  AlignRight,
  Loader,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../../utils/cn";
import Button from "./Button";
import { TemplatesService } from "../../services/templates";
import { NoteTemplate } from "@shared/types/template";
import { toast } from "react-toastify";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
  disabled?: boolean;
  rtl?: boolean;
  onRtlChange?: (rtl: boolean) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing...",
  minHeight = 200,
  className,
  disabled = false,
  rtl = true,
  onRtlChange,
}) => {
  const [mode, setMode] = useState<"edit" | "preview" | "split">("edit");
  const [showHelp, setShowHelp] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<NoteTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const templatesRef = React.useRef<HTMLDivElement>(null);

  // Load templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        const fetchedTemplates = await TemplatesService.getAllTemplates();
        setTemplates(fetchedTemplates);
      } catch (error) {
        console.error("Error loading templates:", error);
        toast.error("Failed to load note templates");
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);
  // Close templates dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        templatesRef.current &&
        !templatesRef.current.contains(event.target as Node)
      ) {
        setShowTemplates(false);
      }
    };

    if (showTemplates) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showTemplates]);
  const insertText = useCallback(
    (before: string, after: string = "") => {
      if (!textareaRef.current || disabled) return;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);

      textarea.focus();

      // Determine what text to insert and cursor positioning
      let textToInsert: string;
      let newCursorStart: number;
      let newCursorEnd: number;

      if (selectedText) {
        // Wrap selected text with formatting
        textToInsert = selectedText;
        newCursorStart = newCursorEnd =
          start + before.length + selectedText.length + after.length;
      } else {
        // No selection - position cursor between markers for empty formatting
        textToInsert = "";
        newCursorStart = newCursorEnd = start + before.length;
      }

      // Select the range we want to replace
      textarea.setSelectionRange(start, end);

      // Use execCommand to maintain undo history (works in most browsers)
      const fullText = before + textToInsert + after;
      try {
        // This maintains the undo stack
        const success = document.execCommand("insertText", false, fullText);
        if (!success) {
          // Fallback if execCommand doesn't work
          const newValue =
            value.substring(0, start) + fullText + value.substring(end);
          onChange(newValue);
        }
      } catch {
        // Fallback for browsers that don't support execCommand
        const newValue =
          value.substring(0, start) + fullText + value.substring(end);
        onChange(newValue);
      }

      // Set cursor position after insertion
      setTimeout(() => {
        textarea.setSelectionRange(newCursorStart, newCursorEnd);
      }, 0);
    },
    [value, onChange, disabled]
  );
  const insertLink = useCallback(() => {
    if (!textareaRef.current || disabled) return;

    const url = prompt("Enter URL:");
    if (!url) return;

    const linkText = prompt("Enter link text:") || "link";
    insertText(`[${linkText}](${url})`);
  }, [insertText, disabled]);
  const insertTemplate = useCallback(
    (template: NoteTemplate) => {
      if (
        value.trim() &&
        !confirm("This will replace your current content. Continue?")
      ) {
        return;
      }

      // Process template content - replace variables
      let processedContent = template.template;
      const today = new Date();

      // Common template variables
      processedContent = processedContent.replace(
        /\{\{date\}\}/g,
        today.toLocaleDateString()
      );
      processedContent = processedContent.replace(
        /\{\{year\}\}/g,
        today.getFullYear().toString()
      );
      processedContent = processedContent.replace(
        /\{\{month\}\}/g,
        today.toLocaleString("default", { month: "long" })
      );

      // Weekly variables
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() + (6 - today.getDay()));

      processedContent = processedContent.replace(
        /\{\{weekStart\}\}/g,
        weekStart.toLocaleDateString()
      );
      processedContent = processedContent.replace(
        /\{\{weekEnd\}\}/g,
        weekEnd.toLocaleDateString()
      );

      onChange(processedContent);
      setShowTemplates(false);
      setTimeout(() => textareaRef.current?.focus(), 0);
    },
    [value, onChange]
  );
  const toolbarButtons = [
    {
      icon: Bold,
      title: "Bold",
      action: () => insertText("**", "**"),
    },
    {
      icon: Italic,
      title: "Italic",
      action: () => insertText("*", "*"),
    },
    {
      icon: Underline,
      title: "Strikethrough",
      action: () => insertText("~~", "~~"),
    },
    { type: "separator" },
    {
      icon: Heading1,
      title: "Heading 1",
      action: () => insertText("# "),
    },
    {
      icon: Heading2,
      title: "Heading 2",
      action: () => insertText("## "),
    },
    {
      icon: Heading3,
      title: "Heading 3",
      action: () => insertText("### "),
    },
    { type: "separator" },
    {
      icon: List,
      title: "Bullet List",
      action: () => insertText("- "),
    },
    {
      icon: ListOrdered,
      title: "Numbered List",
      action: () => insertText("1. "),
    },
    {
      icon: CheckSquare,
      title: "Task List",
      action: () => insertText("- [ ] "),
    },
    {
      icon: Quote,
      title: "Quote",
      action: () => insertText("> "),
    },
    { type: "separator" },
    {
      icon: Code,
      title: "Inline Code",
      action: () => insertText("`", "`"),
    },
    {
      icon: Link,
      title: "Link",
      action: insertLink,
    },
  ];
  const quickInsertButtons = [
    {
      icon: Calendar,
      title: "Insert Today's Date",
      action: () => {
        const today = new Date().toLocaleDateString();
        insertText(`📅 ${today}: `);
      },
    },
    {
      icon: Star,
      title: "Highlight Achievement",
      action: () => insertText("⭐ **Achievement**: "),
    },
    {
      icon: Zap,
      title: "Key Insight",
      action: () => insertText("💡 **Insight**: "),
    },
  ];
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled) return;

    // Handle Enter for list continuation
    if (e.key === "Enter") {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart } = textarea;
      const beforeCursor = value.substring(0, selectionStart);
      const lines = beforeCursor.split("\n");
      const currentLine = lines[lines.length - 1];

      // Check for bullet list pattern (- or * followed by optional space)
      const bulletMatch = currentLine.match(/^(\s*)([-*])\s*(.*)$/);
      if (bulletMatch) {
        const [, indent, bullet, content] = bulletMatch;

        // If the current line is empty (just the bullet), remove it and don't create a new one
        if (!content.trim()) {
          e.preventDefault();
          // Remove the empty bullet line
          const newValue =
            value.substring(0, selectionStart - currentLine.length) +
            indent +
            value.substring(selectionStart);
          onChange(newValue);
          setTimeout(() => {
            textarea.setSelectionRange(
              selectionStart - currentLine.length + indent.length,
              selectionStart - currentLine.length + indent.length
            );
          }, 0);
          return;
        }

        // Create new bullet point
        e.preventDefault();
        insertText(`\n${indent}${bullet} `);
        return;
      }

      // Check for numbered list pattern (number followed by . and optional space)
      const numberedMatch = currentLine.match(/^(\s*)(\d+)\.\s*(.*)$/);
      if (numberedMatch) {
        const [, indent, num, content] = numberedMatch;

        // If the current line is empty (just the number), remove it and don't create a new one
        if (!content.trim()) {
          e.preventDefault();
          // Remove the empty numbered line
          const newValue =
            value.substring(0, selectionStart - currentLine.length) +
            indent +
            value.substring(selectionStart);
          onChange(newValue);
          setTimeout(() => {
            textarea.setSelectionRange(
              selectionStart - currentLine.length + indent.length,
              selectionStart - currentLine.length + indent.length
            );
          }, 0);
          return;
        }

        // Create new numbered item (increment the number)
        e.preventDefault();
        const nextNum = parseInt(num) + 1;
        insertText(`\n${indent}${nextNum}. `);
        return;
      }

      // Check for task list pattern (- [ ] or - [x] followed by optional space)
      const taskMatch = currentLine.match(/^(\s*)([-*])\s*\[([ x])\]\s*(.*)$/);
      if (taskMatch) {
        const [, indent, bullet, , content] = taskMatch;

        // If the current line is empty (just the task checkbox), remove it and don't create a new one
        if (!content.trim()) {
          e.preventDefault();
          // Remove the empty task line
          const newValue =
            value.substring(0, selectionStart - currentLine.length) +
            indent +
            value.substring(selectionStart);
          onChange(newValue);
          setTimeout(() => {
            textarea.setSelectionRange(
              selectionStart - currentLine.length + indent.length,
              selectionStart - currentLine.length + indent.length
            );
          }, 0);
          return;
        }

        // Create new unchecked task item
        e.preventDefault();
        insertText(`\n${indent}${bullet} [ ] `);
        return;
      }
    }

    // Handle Tab for indentation
    if (e.key === "Tab") {
      e.preventDefault();
      insertText("  ");
      return;
    }

    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          insertText("**", "**");
          break;
        case "i":
          e.preventDefault();
          insertText("*", "*");
          break;
        case "k":
          e.preventDefault();
          insertLink();
          break;
        case "z":
        case "y":
          // Let the browser handle undo/redo naturally
          // Don't prevent default for these
          break;
      }
    }
  };

  return (
    <div
      className={cn(
        "border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden",
        className
      )}
    >
      {" "}
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {/* Formatting buttons */}
          {toolbarButtons.map((button, index) => {
            if (button.type === "separator") {
              return (
                <div
                  key={index}
                  className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"
                />
              );
            }

            const IconComponent = button.icon!;
            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="p-2 h-8 w-8 flex-shrink-0"
                onClick={button.action}
                disabled={disabled}
                title={button.title}
              >
                <IconComponent className="w-4 h-4" />
              </Button>
            );
          })}

          {/* Separator */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Quick insert buttons */}
          {quickInsertButtons.map((button, index) => {
            const IconComponent = button.icon;
            return (
              <Button
                key={`quick-${index}`}
                variant="ghost"
                size="sm"
                className="p-2 h-8 w-8 flex-shrink-0 text-blue-600 dark:text-blue-400"
                onClick={button.action}
                disabled={disabled}
                title={button.title}
              >
                <IconComponent className="w-4 h-4" />
              </Button>
            );
          })}
        </div>{" "}
        <div className="flex items-center space-x-1">
          {" "}
          {/* Templates Dropdown */}
          <div className="relative" ref={templatesRef}>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-8 flex items-center space-x-1"
              onClick={() => setShowTemplates(!showTemplates)}
              disabled={disabled}
              title="Insert Template"
            >
              <FileText className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </Button>{" "}
            {showTemplates && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-48">
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 px-2 py-1">
                    Note Templates
                  </div>
                  {isLoadingTemplates ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Loading...
                      </span>
                    </div>
                  ) : templates.length > 0 ? (
                    templates.map((template) => (
                      <button
                        key={template._id}
                        onClick={() => insertTemplate(template)}
                        className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        disabled={disabled}
                      >
                        {template.name}
                      </button>
                    ))
                  ) : (
                    <div className="text-sm text-gray-600 dark:text-gray-400 p-2">
                      No templates available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* View Mode Toggle */}
          <div className="flex bg-white dark:bg-gray-700 rounded-md p-1 border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setMode("edit")}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                mode === "edit"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
              )}
              disabled={disabled}
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              onClick={() => setMode("split")}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                mode === "split"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
              )}
              disabled={disabled}
            >
              ⚏
            </button>
            <button
              onClick={() => setMode("preview")}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                mode === "preview"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
              )}
              disabled={disabled}
            >
              <Eye className="w-3 h-3" />
            </button>{" "}
          </div>
          {/* RTL Toggle */}
          {onRtlChange && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "p-2 h-8 w-8",
                rtl && "bg-blue-100 dark:bg-blue-900/30"
              )}
              onClick={() => onRtlChange(!rtl)}
              disabled={disabled}
              title={
                rtl ? "Switch to Left-to-Right" : "Switch to Right-to-Left"
              }
            >
              {rtl ? (
                <AlignLeft className="w-4 h-4" />
              ) : (
                <AlignRight className="w-4 h-4" />
              )}
            </Button>
          )}
          {/* Help Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-8 w-8"
            onClick={() => setShowHelp(!showHelp)}
            title="Markdown Help"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>{" "}
      {/* Help Panel */}
      {showHelp && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-300 dark:border-gray-600 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Formatting</h4>
              <div className="space-y-1 text-xs">
                <div>
                  <code>**bold**</code> → <strong>bold</strong>
                </div>
                <div>
                  <code>*italic*</code> → <em>italic</em>
                </div>
                <div>
                  <code>~~strikethrough~~</code> → <del>strikethrough</del>
                </div>
                <div>
                  <code>`code`</code> → <code>code</code>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Structure</h4>
              <div className="space-y-1 text-xs">
                <div>
                  <code># Heading 1</code>
                </div>
                <div>
                  <code>## Heading 2</code>
                </div>
                <div>
                  <code>- List item</code>
                </div>
                <div>
                  <code>1. Numbered item</code>
                </div>
                <div>
                  <code>- [ ] Task item</code>
                </div>
                <div>
                  <code>&gt; Quote</code>
                </div>
                <div>
                  <code>[Link](url)</code>
                </div>
              </div>
            </div>{" "}
            <div>
              <h4 className="font-semibold mb-2">Quick Inserts</h4>
              <div className="space-y-1 text-xs">
                <div>📅 Today's date</div>
                <div>⭐ Achievement marker</div>
                <div>💡 Insight marker</div>
                <div>📝 Note template</div>
                <div>🔄 RTL toggle (if enabled)</div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <h5 className="font-semibold mb-1">Keyboard Shortcuts</h5>
                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                  <div>Ctrl+B → Bold text</div>
                  <div>Ctrl+I → Italic text</div>
                  <div>Ctrl+K → Insert link</div>
                  <div>Tab → Indent (in lists)</div>
                </div>
              </div>{" "}
              <div>
                <h5 className="font-semibold mb-1">Daily Note Tips</h5>
                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                  <div>Use headings to organize sections</div>
                  <div>Create task lists for tomorrow's goals</div>
                  <div>Quote inspiring thoughts</div>
                  <div>Bold key achievements</div>
                  <div>Toggle RTL for Arabic/Hebrew writing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}{" "}
      {/* Editor Content */}
      <div
        className={cn("flex", rtl && "flex-row-reverse")}
        style={{ minHeight }}
      >
        {/* Preview Mode - positioned first in RTL for proper layout */}
        {(mode === "preview" || mode === "split") && (
          <div
            className={cn(
              "flex-1 overflow-auto",
              mode === "split" &&
                !rtl &&
                "border-l border-gray-300 dark:border-gray-600",
              mode === "split" &&
                rtl &&
                "border-r border-gray-300 dark:border-gray-600"
            )}
          >
            <div
              className={cn(
                "p-4 prose prose-sm dark:prose-invert max-w-none",
                rtl && "text-right"
              )}
              dir={rtl ? "rtl" : "ltr"}
            >
              {value ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {value}
                </ReactMarkdown>
              ) : (
                <div className="text-gray-400 italic">
                  Preview will appear here...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Mode - positioned after preview in RTL for proper layout */}
        {(mode === "edit" || mode === "split") && (
          <div className={cn("flex-1")}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              dir={rtl ? "rtl" : "ltr"}
              className={cn(
                "w-full h-full p-4 resize-none border-0 focus:outline-none focus:ring-0",
                "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                disabled && "opacity-50 cursor-not-allowed",
                rtl && "text-right"
              )}
              style={{ minHeight }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
