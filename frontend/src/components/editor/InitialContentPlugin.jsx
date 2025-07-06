import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';

export default function InitialContentPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        // This runs once on component mount
        editor.update(() => {
            const root = $getRoot();
            if (root.getChildrenSize() === 0) {
                const paragraph = $createParagraphNode();
                // Ensure consistency with the placeholder prop text
                paragraph.append($createTextNode('Start editing your professional email template here...'));
                root.append(paragraph);
            }
        });
    }, [editor]);

    return null;
}
