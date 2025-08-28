// Simple Markdown Renderer for Cat Terminal
// Lightweight markdown rendering for AI responses

class MarkdownRenderer {
  constructor() {
    this.enabled = true;
  }
  
  /**
   * Set whether markdown rendering is enabled
   * @param {boolean} enabled 
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  
  /**
   * Render markdown text to HTML
   * @param {string} text - Raw markdown text
   * @returns {string} - HTML output
   */
  render(text) {
    if (!this.enabled) {
      return this.escapeHtml(text);
    }
    
    // Process the text line by line for better control
    const lines = text.split('\n');
    let html = '';
    let inCodeBlock = false;
    let codeBlockLanguage = '';
    let inList = false;
    let listType = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          html += `</code></pre>`;
          inCodeBlock = false;
          codeBlockLanguage = '';
        } else {
          codeBlockLanguage = line.slice(3).trim();
          html += `<pre class="markdown-code-block"><code class="language-${codeBlockLanguage}">`;
          inCodeBlock = true;
        }
        continue;
      }
      
      if (inCodeBlock) {
        html += this.escapeHtml(line) + '\n';
        continue;
      }
      
      // Handle headings
      if (line.startsWith('#')) {
        const level = line.match(/^#+/)[0].length;
        const text = line.replace(/^#+\s*/, '');
        html += `<h${level} class="markdown-heading">${this.renderInline(text)}</h${level}>`;
        continue;
      }
      
      // Handle horizontal rules
      if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
        html += `<hr class="markdown-hr">`;
        continue;
      }
      
      // Handle blockquotes
      if (line.startsWith('>')) {
        const text = line.replace(/^>\s*/, '');
        html += `<blockquote class="markdown-blockquote">${this.renderInline(text)}</blockquote>`;
        continue;
      }
      
      // Handle lists
      const unorderedMatch = line.match(/^(\s*)[*+-]\s+(.+)$/);
      const orderedMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
      
      if (unorderedMatch || orderedMatch) {
        const isOrdered = !!orderedMatch;
        const indent = (unorderedMatch || orderedMatch)[1].length;
        const text = (unorderedMatch || orderedMatch)[2];
        
        if (!inList) {
          html += isOrdered ? '<ol class="markdown-list">' : '<ul class="markdown-list">';
          inList = true;
          listType = isOrdered ? 'ol' : 'ul';
        } else if ((isOrdered && listType === 'ul') || (!isOrdered && listType === 'ol')) {
          html += `</${listType}>${isOrdered ? '<ol class="markdown-list">' : '<ul class="markdown-list">'}`;
          listType = isOrdered ? 'ol' : 'ul';
        }
        
        html += `<li class="markdown-list-item">${this.renderInline(text)}</li>`;
        continue;
      } else if (inList) {
        html += `</${listType}>`;
        inList = false;
        listType = '';
      }
      
      // Handle empty lines
      if (line.trim() === '') {
        if (html && !html.endsWith('>')) {
          html += '<br>';
        }
        continue;
      }
      
      // Regular paragraph
      html += `<p class="markdown-paragraph">${this.renderInline(line)}</p>`;
    }
    
    // Close any open lists
    if (inList) {
      html += `</${listType}>`;
    }
    
    // Close any open code blocks
    if (inCodeBlock) {
      html += `</code></pre>`;
    }
    
    return html;
  }
  
  /**
   * Render inline markdown elements (bold, italic, code, links)
   * @param {string} text 
   * @returns {string}
   */
  renderInline(text) {
    if (!this.enabled) {
      return this.escapeHtml(text);
    }
    
    // Escape HTML first
    text = this.escapeHtml(text);
    
    // Inline code (must come before other formatting)
    text = text.replace(/`([^`]+)`/g, '<code class="markdown-inline-code">$1</code>');
    
    // Bold (strong)
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="markdown-bold">$1</strong>');
    
    // Italic (em)
    text = text.replace(/\*([^*]+)\*/g, '<em class="markdown-italic">$1</em>');
    
    // Strikethrough
    text = text.replace(/~~([^~]+)~~/g, '<del class="markdown-strikethrough">$1</del>');
    
    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="markdown-link" target="_blank">$1</a>');
    
    return text;
  }
  
  /**
   * Escape HTML characters
   * @param {string} text 
   * @returns {string}
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  /**
   * Get CSS styles for markdown rendering
   * @returns {string}
   */
  getCSS() {
    return `
      .markdown-rendered {
        font-family: inherit;
        line-height: 1.5;
        color: inherit;
      }
      
      .markdown-heading {
        font-weight: bold;
        margin: 0.5em 0;
        color: #4fc3f7;
      }
      
      .markdown-paragraph {
        margin: 0.5em 0;
      }
      
      .markdown-code-block {
        background: rgba(40, 40, 40, 0.8);
        border: 1px solid #555;
        border-radius: 4px;
        padding: 8px 12px;
        margin: 8px 0;
        overflow-x: auto;
        font-family: 'Cascadia Code', 'Consolas', monospace;
        font-size: 0.9em;
      }
      
      .markdown-code-block code {
        background: none;
        padding: 0;
        border: none;
        border-radius: 0;
      }
      
      .markdown-inline-code {
        background: rgba(40, 40, 40, 0.6);
        padding: 2px 4px;
        border-radius: 3px;
        font-family: 'Cascadia Code', 'Consolas', monospace;
        font-size: 0.9em;
        border: 1px solid #444;
      }
      
      .markdown-bold {
        font-weight: bold;
        color: #fff;
      }
      
      .markdown-italic {
        font-style: italic;
        color: #ddd;
      }
      
      .markdown-strikethrough {
        text-decoration: line-through;
        color: #888;
      }
      
      .markdown-link {
        color: #4fc3f7;
        text-decoration: underline;
      }
      
      .markdown-link:hover {
        color: #81d4fa;
      }
      
      .markdown-list {
        margin: 0.5em 0;
        padding-left: 2em;
      }
      
      .markdown-list-item {
        margin: 0.25em 0;
      }
      
      .markdown-blockquote {
        border-left: 3px solid #4fc3f7;
        padding-left: 12px;
        margin: 8px 0;
        font-style: italic;
        color: #ccc;
      }
      
      .markdown-hr {
        border: none;
        border-top: 1px solid #555;
        margin: 1em 0;
      }
    `;
  }
}

// Add CSS styles to the document
if (typeof document !== 'undefined') {
  const renderer = new MarkdownRenderer();
  const style = document.createElement('style');
  style.textContent = renderer.getCSS();
  document.head.appendChild(style);
}

// Make available globally
if (typeof window !== 'undefined') {
  window.MarkdownRenderer = MarkdownRenderer;
}