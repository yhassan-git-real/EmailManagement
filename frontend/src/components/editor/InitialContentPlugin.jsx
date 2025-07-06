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
                paragraph.append($createTextNode('Start editing your template here...'));
                root.append(paragraph);
            }
        });
    }, [editor]);

    return null;
}
