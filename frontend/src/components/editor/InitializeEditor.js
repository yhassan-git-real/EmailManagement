import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';

/**
 * Helper function to initialize the Lexical editor with content
 * Can be used to parse HTML content into Lexical nodes
 * 
 * @param {string} htmlContent - HTML content to parse
 * @returns {(editorState) => void} - Function to initialize editor state
 */
export function initializeEditor(htmlContent) {
    return (editor) => {
        editor.update(() => {
            // Clear the editor
            const root = $getRoot();
            root.clear();

            // For now, we'll just create a simple paragraph
            // In a real implementation, you'd parse the HTML and create appropriate nodes
            const paragraph = $createParagraphNode();
            paragraph.append($createTextNode('Start editing your template here...'));
            root.append(paragraph);
        });
    };
}
