import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

export function renderMarkdownContentAsHtml(content: string) {
  if (!content || content.trim() === '') return null;

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // Apply standard paragraph style
          p: ({ children }) => <p className="paragraph">{children}</p>,

          // Apply list container style
          ul: ({ children }) => <ul className="list-container">{children}</ul>,
          ol: ({ children }) => <ol className="list-container">{children}</ol>,

          // Apply list item style
          li: ({ children }) => <li className="list-item">{children}</li>,

          // Apply style for general bold text
          strong: ({ children }) => <strong className="bold-text">{children}</strong>,
          
          // Apply style for italic text - now properly supported with embedded font
          em: ({ children }) => <em>{children}</em>,

          // Apply style for links
          a: ({ href, children }) => <a href={href} className="link">{children}</a>,

          // Handle headings
          h1: ({ children }) => <h1 className="heading-1">{children}</h1>,
          h2: ({ children }) => <h2 className="heading-2">{children}</h2>,
          h3: ({ children }) => <h3 className="heading-3">{children}</h3>,
          h4: ({ children }) => <h4 className="heading-4">{children}</h4>,
          h5: ({ children }) => <h5 className="heading-5">{children}</h5>,
          h6: ({ children }) => <h6 className="heading-6">{children}</h6>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 