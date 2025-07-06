import React, { useState } from 'react';
import { XMarkIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import ToolbarPlugin from './editor/ToolbarPlugin';
import { serializeToHtml } from './editor/HtmlSerializer';
import CustomErrorBoundary from './editor/CustomErrorBoundary';
import InitialContentPlugin from './editor/InitialContentPlugin';
import { HorizontalRulePlugin } from './editor/HorizontalRulePlugin';
import './editor/editor.css';

// Font family options for the editor
const fontFamilyOptions = [
  'Arial',
  'Times New Roman',
  'Georgia',
  'Roboto',
  'Calibri',
  'Verdana',
  'Tahoma',
];

// Theme for Lexical editor
const theme = {
  paragraph: 'editor-paragraph',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
  },
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline',
    strikethrough: 'editor-text-strikethrough',
    underlineStrikethrough: 'editor-text-underlineStrikethrough',
  },
  list: {
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
    listitem: 'editor-listitem',
    nested: {
      listitem: 'editor-nested-listitem',
    },
  },
  link: 'editor-link',
  quote: 'editor-quote',
  code: 'editor-code',
  horizontalRule: 'editor-horizontalrule',
};

// Initial config for the editor
const editorConfig = {
  namespace: 'EmailTemplateEditor',
  theme,
  onError(error) {
    console.error("Lexical editor error:", error);
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
    HorizontalRuleNode,
  ],
};

function TemplateEditor({ initialTemplate, onSave, onClose }) {
  const [isSaving, setIsSaving] = useState(false);
  const [editorState, setEditorState] = useState();
  const [htmlContent, setHtmlContent] = useState(initialTemplate?.body || '<p>Start editing your template here...</p>');
  const [templateName, setTemplateName] = useState(initialTemplate?.name || 'Custom Template');
  const [editorError, setEditorError] = useState(null);

  // Handle saving the template
  const handleSave = () => {
    setIsSaving(true);

    // Convert editor state to HTML before saving
    onSave({
      name: templateName,
      body: htmlContent,
      id: initialTemplate?.id || 'custom'
    });
  };
  // Handle editor content change
  const handleEditorChange = (editorState) => {
    setEditorState(editorState);

    try {
      // Convert editor state to HTML
      const html = serializeToHtml(editorState);
      setHtmlContent(html);
    } catch (error) {
      console.error('Error serializing editor content:', error);
      // Fallback to a basic HTML structure if serialization fails
      setHtmlContent('<p>Error processing editor content</p>');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-3/4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Email Template Editor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Editor */}
        <div className="p-4 flex-grow flex flex-col overflow-hidden">
          <div className="mb-4">
            <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-1">
              Template Name
            </label>
            <input
              type="text"
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>

          <div className="flex-grow flex flex-col overflow-hidden">
            {editorError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md mb-2 text-sm">
                <strong>Error:</strong> {editorError}
              </div>
            )}

            {/* Lexical Editor */}
            <LexicalComposer initialConfig={editorConfig}>
              <div className="editor-container">
                <ToolbarPlugin />
                <div className="editor-inner">
                  <RichTextPlugin
                    contentEditable={<ContentEditable className="editor-input" />}
                    placeholder={<div className="editor-placeholder">Start editing your professional email template here...</div>}
                    ErrorBoundary={CustomErrorBoundary}
                  />
                  <OnChangePlugin onChange={handleEditorChange} />
                  <HistoryPlugin />
                  <AutoFocusPlugin />
                  <ListPlugin />
                  <LinkPlugin />
                  <HorizontalRulePlugin />
                  <MarkdownShortcutPlugin />
                  <InitialContentPlugin />
                </div>
              </div>
            </LexicalComposer>
          </div>
        </div>

        {/* Footer with save button */}
        <div className="px-4 py-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <DocumentCheckIcon className="h-4 w-4 mr-1" /> Save Template
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplateEditor;
