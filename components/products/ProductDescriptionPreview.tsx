"use client";

import React from "react";
import { JSONContent } from "novel";

interface ProductDescriptionPreviewProps {
  content?: string | JSONContent | null;
  className?: string;
  fallbackText?: string;
}

/**
 * Helper to check whether a description is truly empty (either empty string, whitespace,
 * or an empty TipTap document without text).
 */
export function isDescriptionEmpty(val?: string | null): boolean {
  if (!val || !val.trim()) return true;
  const trimmed = val.trim();

  // If it's a JSON doc, check if any node actually contains text
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && parsed.type === "doc") {
        const hasText = (node: JSONContent): boolean => {
          if (typeof node.text === "string" && node.text.trim().length > 0) {
            return true;
          }
          if (Array.isArray(node.content)) {
            return node.content.some(hasText);
          }
          return false;
        };
        return !hasText(parsed);
      }
    } catch {
      return !trimmed;
    }
  }

  return !trimmed;
}

function sanitizeHref(rawHref?: string): string {
  if (!rawHref) return "#";
  const trimmed = rawHref.trim();
  // Allow only safe protocols
  if (/^(https?:\/\/|\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }
  return "#";
}

function renderContentNode(
  node: JSONContent,
  index: number
): React.ReactNode {
  if (!node) return null;

  // Render text node with formatting marks
  if (node.type === "text") {
    let textElement: React.ReactNode = node.text || "";

    if (node.marks && node.marks.length > 0) {
      for (const [mIdx, mark] of node.marks.entries()) {
        const markKey = `${index}-mark-${mIdx}`;
        if (mark.type === "bold") {
          textElement = (
            <strong key={markKey} className="font-semibold text-neutral-900">
              {textElement}
            </strong>
          );
        } else if (mark.type === "italic") {
          textElement = (
            <em key={markKey} className="italic">
              {textElement}
            </em>
          );
        } else if (mark.type === "underline") {
          textElement = (
            <u key={markKey} className="underline underline-offset-2">
              {textElement}
            </u>
          );
        } else if (mark.type === "strike") {
          textElement = (
            <s key={markKey} className="line-through text-neutral-400">
              {textElement}
            </s>
          );
        } else if (mark.type === "code") {
          textElement = (
            <code
              key={markKey}
              className="bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded text-xs font-mono"
            >
              {textElement}
            </code>
          );
        } else if (mark.type === "link") {
          const safeHref = sanitizeHref(mark.attrs?.href);
          textElement = (
            <a
              key={markKey}
              href={safeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-900 underline underline-offset-2 hover:text-neutral-600 transition-colors"
            >
              {textElement}
            </a>
          );
        }
      }
    }

    return <React.Fragment key={index}>{textElement}</React.Fragment>;
  }

  // Render child content recursively
  const children = node.content?.map((child, i) =>
    renderContentNode(child, i)
  );

  switch (node.type) {
    case "doc":
      return (
        <div key={index} className="space-y-4">
          {children}
        </div>
      );

    case "heading": {
      const level = node.attrs?.level || 2;
      const headingText = children;

      if (level === 2) {
        return (
          <h2
            key={index}
            className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 mt-6 mb-3 first:mt-0"
          >
            {headingText}
          </h2>
        );
      }
      if (level === 3) {
        return (
          <h3
            key={index}
            className="text-base font-semibold tracking-tight text-neutral-900 mt-5 mb-2 first:mt-0"
          >
            {headingText}
          </h3>
        );
      }
      return (
        <h4
          key={index}
          className="text-sm font-semibold tracking-tight text-neutral-900 mt-4 mb-2 first:mt-0"
        >
          {headingText}
        </h4>
      );
    }

    case "paragraph":
      return (
        <p
          key={index}
          className="text-sm text-neutral-600 leading-relaxed font-normal mb-3 last:mb-0"
        >
          {children && children.length > 0 ? children : <br />}
        </p>
      );

    case "bulletList":
      return (
        <ul
          key={index}
          className="list-disc pl-5 space-y-1.5 text-sm text-neutral-600 my-3"
        >
          {children}
        </ul>
      );

    case "orderedList":
      return (
        <ol
          key={index}
          className="list-decimal pl-5 space-y-1.5 text-sm text-neutral-600 my-3"
        >
          {children}
        </ol>
      );

    case "listItem":
      return (
        <li key={index} className="leading-relaxed [&>p]:m-0">
          {children}
        </li>
      );

    case "blockquote":
      return (
        <blockquote
          key={index}
          className="border-l-2 border-neutral-900 bg-neutral-50/70 rounded-r-xl p-4 my-4 text-xs sm:text-sm text-neutral-700 italic leading-relaxed"
        >
          {children}
        </blockquote>
      );

    case "horizontalRule":
      return <hr key={index} className="my-6 border-neutral-200" />;

    case "codeBlock":
      return (
        <pre
          key={index}
          className="bg-neutral-950 text-neutral-100 p-4 rounded-xl text-xs font-mono overflow-x-auto my-3"
        >
          <code>{children}</code>
        </pre>
      );

    default:
      return <div key={index}>{children}</div>;
  }
}

export function ProductDescriptionPreview({
  content,
  className = "",
  fallbackText = "No product description available.",
}: ProductDescriptionPreviewProps) {
  if (!content) {
    return (
      <div className={`text-xs text-neutral-400 italic ${className}`}>
        {fallbackText}
      </div>
    );
  }

  // Case 1: Already an object (JSONContent)
  if (typeof content === "object" && content !== null) {
    return (
      <div className={`product-description-preview ${className}`}>
        {renderContentNode(content, 0)}
      </div>
    );
  }

  // Case 2: String - check if it's stringified JSON
  const trimmed = content.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && parsed.type === "doc") {
        return (
          <div className={`product-description-preview ${className}`}>
            {renderContentNode(parsed, 0)}
          </div>
        );
      }
    } catch {
      // Fall through to plain text handling
    }
  }

  // Case 3: Check if it's HTML
  if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
    return (
      <div
        className={`product-description-preview text-sm text-neutral-600 leading-relaxed space-y-3 ${className}`}
        dangerouslySetInnerHTML={{ __html: trimmed }}
      />
    );
  }

  // Case 4: Plain text fallback (supports multiple paragraphs separated by newlines)
  const paragraphs = trimmed.split(/\n\s*\n/);

  return (
    <div
      className={`product-description-preview space-y-3 text-sm text-neutral-600 leading-relaxed font-normal ${className}`}
    >
      {paragraphs.map((para, idx) => (
        <p key={idx} className="whitespace-pre-line leading-relaxed">
          {para}
        </p>
      ))}
    </div>
  );
}

export default ProductDescriptionPreview;
