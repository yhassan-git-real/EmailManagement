import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $createHorizontalRuleNode, HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';

/**
 * A plugin to support horizontal rule in the editor
 * This will ensure horizontal rule node is properly registered and transformers can use it
 */
export function HorizontalRulePlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([HorizontalRuleNode])) {
            throw new Error('HorizontalRulePlugin: HorizontalRuleNode not registered on editor');
        }

        return editor.registerCommand(
            'INSERT_HORIZONTAL_RULE',
            () => {
                editor.update(() => {
                    const horizontalRule = $createHorizontalRuleNode();
                    // Your implementation for inserting horizontal rule can go here
                });
                return true;
            },
            0
        );
    }, [editor]);

    return null;
}
