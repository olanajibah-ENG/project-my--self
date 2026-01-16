import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownReaderProps {
  content: string
}

export default function MarkdownReader({ content }: MarkdownReaderProps) {
  // Clean up content: normalize newlines and remove trailing whitespace
  const cleanedContent = content
    ? content
        .replace(/\r\n/g, '\n') // Normalize Windows line endings
        .replace(/\r/g, '\n') // Normalize old Mac line endings
        .trim()
    : ''

  if (!cleanedContent) {
    return null
  }

  return (
    <div className="prose prose-slate max-w-none
      prose-headings:font-bold prose-headings:text-gray-900
      prose-h1:text-3xl prose-h1:mb-4
      prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3
      prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2
      prose-p:text-gray-700 prose-p:leading-7 prose-p:mb-4
      prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline hover:prose-a:text-brand-700
      prose-strong:text-gray-900 prose-strong:font-semibold
      prose-code:text-brand-700 prose-code:bg-brand-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm
      prose-code:before:content-[''] prose-code:after:content-['']
      prose-pre:bg-gray-900 prose-pre:rounded-lg prose-pre:shadow-lg
      prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
      prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
      prose-li:text-gray-700 prose-li:my-2
      prose-blockquote:border-l-4 prose-blockquote:border-brand-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
      prose-img:rounded-lg prose-img:shadow-md
      prose-hr:border-gray-200 prose-hr:my-8
      prose-table:border-collapse prose-table:w-full
      prose-th:bg-gray-50 prose-th:p-3 prose-th:text-left prose-th:font-semibold
      prose-td:border prose-td:border-gray-200 prose-td:p-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          code(props) {
            const { children, className } = props
            const match = /language-(\w+)/.exec(className || '')
            return match ? (
              <SyntaxHighlighter
                PreTag="div"
                language={match[1]}
                style={vscDarkPlus}
                customStyle={{
                  margin: '1.5rem 0',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  lineHeight: '1.7',
                }}
                codeTagProps={{
                  style: {
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  }
                }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className}>
                {children}
              </code>
            )
          }
        }}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  )
}
