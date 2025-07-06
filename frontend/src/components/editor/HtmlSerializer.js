import {
    $isElementNode,
    $isTextNode,
    $isLineBreakNode,
    $isParagraphNode,
    $isRootNode,
    $getRoot
} from 'lexical';
import { $isHeadingNode } from '@lexical/rich-text';
import { $isListNode, $isListItemNode } from '@lexical/list';
import { $isLinkNode } from '@lexical/link';

/**
 * Serializes Lexical editor state to HTML
 * @param {EditorState} editorState - The Lexical editor state
 * @returns {string} - HTML string
 */
export function serializeToHtml(editorState) {
    let html = '';

    editorState.read(() => {
        const root = $getRoot();
        html = serializeNode(root);
    });

    return html;
}

/**
 * Recursively serializes a node to HTML
 * @param {LexicalNode} node - The node to serialize
 * @returns {string} - HTML string
 */
function serializeNode(node) {
    if ($isRootNode(node)) {
        const children = node.getChildren();
        let html = '';
        for (const child of children) {
            html += serializeNode(child);
        }
        return html;
    }

    if ($isElementNode(node)) {
        let html = '';
        const children = node.getChildren();

        // Process paragraph node
        if ($isParagraphNode(node)) {
            const style = node.getStyle() || '';
            const styleAttr = style ? ` style="${style}"` : '';
            html += `<p${styleAttr}>`;
            for (const child of children) {
                html += serializeNode(child);
            }
            html += '</p>';
            return html;
        }

        // Process heading node
        if ($isHeadingNode(node)) {
            const tag = node.getTag(); // h1, h2, etc.
            const style = node.getStyle() || '';
            const styleAttr = style ? ` style="${style}"` : '';
            html += `<${tag}${styleAttr}>`;
            for (const child of children) {
                html += serializeNode(child);
            }
            html += `</${tag}>`;
            return html;
        }

        // Process list node with improved handling
        if ($isListNode(node)) {
            const listType = node.getListType();
            const tag = listType === 'bullet' ? 'ul' : 'ol';
            const style = node.getStyle() || '';
            const styleAttr = style ? ` style="${style}"` : '';
            html += `<${tag}${styleAttr}>`;
            for (const child of children) {
                html += serializeNode(child);
            }
            html += `</${tag}>`;
            return html;
        }

        // Process list item node with improved handling for nested lists
        if ($isListItemNode(node)) {
            const style = node.getStyle() || '';
            const styleAttr = style ? ` style="${style}"` : '';
            html += `<li${styleAttr}>`;

            let textContent = '';
            let nestedContent = '';

            // Process children separately to handle text and nested lists correctly
            for (const child of children) {
                if ($isListNode(child)) {
                    // This is a nested list
                    nestedContent += serializeNode(child);
                } else {
                    // This is text content or other elements
                    textContent += serializeNode(child);
                }
            }

            html += textContent + nestedContent;
            html += '</li>';
            return html;
        }

        // For any other element nodes, process their children
        for (const child of children) {
            html += serializeNode(child);
        }
        return html;
    }

    // Process text node
    if ($isTextNode(node)) {
        let text = node.getTextContent();

        // Replace spaces with &nbsp; to preserve multiple spaces
        if (text.trim() === '' && text.length > 0) {
            return '&nbsp;';
        }

        // Escape HTML special characters
        text = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        // Apply text formatting
        const format = node.getFormat();
        const style = node.getStyle() || '';
        let formattedText = text;

        if (format & 1) { // Bold
            formattedText = `<strong>${formattedText}</strong>`;
        }
        if (format & 2) { // Italic
            formattedText = `<em>${formattedText}</em>`;
        }
        if (format & 4) { // Underline
            formattedText = `<u>${formattedText}</u>`;
        }
        if (format & 8) { // Strikethrough
            formattedText = `<s>${formattedText}</s>`;
        }
        if (format & 16) { // Code
            formattedText = `<code>${formattedText}</code>`;
        }

        if (style) {
            formattedText = `<span style="${style}">${formattedText}</span>`;
        }

        return formattedText;
    }

    // Process link node
    if ($isLinkNode(node)) {
        const url = node.getURL();
        const style = node.getStyle() || '';
        const styleAttr = style ? ` style="${style}"` : '';
        const target = "_blank"; // Open links in new tab
        const rel = "noopener noreferrer"; // Security best practice for _blank links

        let html = `<a href="${url}" target="${target}" rel="${rel}"${styleAttr}>`;
        const children = node.getChildren();
        for (const child of children) {
            html += serializeNode(child);
        }
        html += '</a>';
        return html;
    }

    // Process line break node
    if ($isLineBreakNode(node)) {
        return '<br>';
    }

    return '';
}
