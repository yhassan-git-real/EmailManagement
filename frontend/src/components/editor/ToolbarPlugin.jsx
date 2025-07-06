import React, { useState, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    FORMAT_ELEMENT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
} from 'lexical';
import {
    $createParagraphNode,
    $createTextNode,
    $getRoot,
    $setSelection,
    $isElementNode,
} from 'lexical';
import { $wrapNodes } from '@lexical/selection';
import {
    $createHeadingNode,
    $isHeadingNode,
    $createQuoteNode,
} from '@lexical/rich-text';
import {
    $isLinkNode,
    TOGGLE_LINK_COMMAND,
    $createLinkNode,
} from '@lexical/link';
import {
    $isListNode,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    ListNode,
} from '@lexical/list';
import { $createHorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { INSERT_TABLE_COMMAND } from '@lexical/table';

// Gmail-style SVG icons
const Icons = {
    undo: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 14 4 9l5-5" />
            <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
        </svg>
    ),
    redo: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 14 5-5-5-5" />
            <path d="M4 9h10.5A5.5 5.5 0 0 1 20 14.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
        </svg>
    ),
    bold: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        </svg>
    ),
    italic: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="4" x2="10" y2="4" />
            <line x1="14" y1="20" x2="5" y2="20" />
            <line x1="15" y1="4" x2="9" y2="20" />
        </svg>
    ),
    underline: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
            <line x1="4" y1="21" x2="20" y2="21" />
        </svg>
    ),
    strikethrough: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4H9a3 3 0 0 0-2.83 4" />
            <path d="M14 12a4 4 0 0 1 0 8H6" />
            <line x1="4" y1="12" x2="20" y2="12" />
        </svg>
    ),
    alignLeft: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="15" y2="12" />
            <line x1="3" y1="18" x2="18" y2="18" />
        </svg>
    ),
    alignCenter: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="6" y1="12" x2="18" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
    ),
    alignRight: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="9" y1="12" x2="21" y2="12" />
            <line x1="6" y1="18" x2="21" y2="18" />
        </svg>
    ),
    bulletList: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <rect x="3" y="5" width="3" height="3" rx="1.5" />
            <rect x="3" y="11" width="3" height="3" rx="1.5" />
            <rect x="3" y="17" width="3" height="3" rx="1.5" />
            <line x1="9" y1="6.5" x2="20" y2="6.5" stroke="currentColor" strokeWidth="1.5" />
            <line x1="9" y1="12.5" x2="20" y2="12.5" stroke="currentColor" strokeWidth="1.5" />
            <line x1="9" y1="18.5" x2="20" y2="18.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    numberedList: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <text x="3.5" y="7" fontSize="8" fontWeight="bold" fill="currentColor">1</text>
            <text x="3.5" y="13" fontSize="8" fontWeight="bold" fill="currentColor">2</text>
            <text x="3.5" y="19" fontSize="8" fontWeight="bold" fill="currentColor">3</text>
            <line x1="9" y1="6.5" x2="20" y2="6.5" stroke="currentColor" strokeWidth="1.5" />
            <line x1="9" y1="12.5" x2="20" y2="12.5" stroke="currentColor" strokeWidth="1.5" />
            <line x1="9" y1="18.5" x2="20" y2="18.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    link: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
    ),
    horizontalRule: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
        </svg>
    ),
    quote: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </svg>
    ),
    clearFormatting: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8" />
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="m16 16-3.37-3.37" />
            <path d="m8 8 3.37 3.37" />
        </svg>
    ),
};

// Gmail-style text format icon
const TextFormatIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7V4h16v3" />
        <path d="M9 20h6" />
        <path d="M12 4v16" />
    </svg>
);

// Font family options for the toolbar
const FONT_FAMILY_OPTIONS = [
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Roboto", value: "'Roboto', sans-serif" },
    { label: "Calibri", value: "'Calibri', sans-serif" },
    { label: "Verdana", value: "Verdana, sans-serif" },
    { label: "Tahoma", value: "Tahoma, sans-serif" },
];

// Font size options for the toolbar
const FONT_SIZE_OPTIONS = [
    { label: "10px", value: "10px" },
    { label: "12px", value: "12px" },
    { label: "14px", value: "14px" },
    { label: "16px", value: "16px" },
    { label: "18px", value: "18px" },
    { label: "20px", value: "20px" },
    { label: "24px", value: "24px" },
];

// Gmail-style color palette - both for text and background
const COLOR_PALETTE = [
    // Row 1 - Black, grays, white
    ['#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff'],
    // Row 2 - Reds, oranges, yellows, greens, blues, purples, pinks
    ['#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff'],
    // Row 3 - Lighter shades
    ['#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc'],
    // Row 4 - Light shades
    ['#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd'],
    // Row 5 - Mid shades
    ['#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0'],
    // Row 6 - Dark shades
    ['#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79']
];

export default function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isSubscript, setIsSubscript] = useState(false);
    const [isSuperscript, setIsSuperscript] = useState(false);
    const [isCode, setIsCode] = useState(false);
    const [fontFamily, setFontFamily] = useState("Arial, sans-serif");
    const [fontSize, setFontSize] = useState("14px");
    const [textColor, setTextColor] = useState("#000000");
    const [backgroundColor, setBackgroundColor] = useState("transparent");
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [alignment, setAlignment] = useState("left");
    const [showTextColorPicker, setShowTextColorPicker] = useState(false);
    const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
    const [isListActive, setIsListActive] = useState(false);
    const [listType, setListType] = useState(null); // 'bullet' or 'number'
    const [activeHeadingTag, setActiveHeadingTag] = useState("normal"); // 'normal', '1', '2', '3'

    // Update format states based on selection
    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    setIsBold(selection.hasFormat('bold'));
                    setIsItalic(selection.hasFormat('italic'));
                    setIsUnderline(selection.hasFormat('underline'));
                    setIsStrikethrough(selection.hasFormat('strikethrough'));
                    setIsSubscript(selection.hasFormat('subscript'));
                    setIsSuperscript(selection.hasFormat('superscript'));
                    setIsCode(selection.hasFormat('code'));

                    // Check for list state
                    const anchorNode = selection.anchor.getNode();
                    const focusNode = selection.focus.getNode();
                    let listNode = null;

                    // Check if we're in a list item by traversing up the tree
                    let currentNode = anchorNode;
                    while (currentNode !== null) {
                        const parent = currentNode.getParent();
                        if (parent !== null && $isListNode(parent)) {
                            listNode = parent;
                            break;
                        }
                        currentNode = parent;
                    }

                    if (listNode !== null) {
                        setIsListActive(true);
                        setListType(listNode.getListType() === 'bullet' ? 'bullet' : 'number');
                    } else {
                        setIsListActive(false);
                        setListType(null);
                    }

                    // Check for heading tags
                    let headingTag = "normal";
                    if (anchorNode) {
                        // Traverse up from selection to find heading
                        let headingNode = anchorNode;
                        while (headingNode !== null) {
                            if ($isHeadingNode(headingNode)) {
                                // Extract the number from the heading tag (h1, h2, h3)
                                const tag = headingNode.getTag();
                                headingTag = tag.substring(1); // Remove 'h' from 'h1', 'h2', etc.
                                break;
                            }
                            headingNode = headingNode.getParent();
                            if (headingNode === null || $isRootNode(headingNode)) {
                                break;
                            }
                        }
                    }
                    setActiveHeadingTag(headingTag);

                    // Get styles from the first node in the selection
                    const node = selection.getNodes()[0];
                    if (node) {
                        const style = node.getStyle();
                        if (style) {
                            // Extract text color if present
                            const colorMatch = style.match(/color:\s*([^;]+)/);
                            if (colorMatch && colorMatch[1]) {
                                setTextColor(colorMatch[1]);
                            }

                            // Extract background color if present
                            const bgMatch = style.match(/background-color:\s*([^;]+)/);
                            if (bgMatch && bgMatch[1]) {
                                setBackgroundColor(bgMatch[1]);
                            }

                            // Extract text alignment if present
                            if (style.includes('text-align: center')) {
                                setAlignment('center');
                            } else if (style.includes('text-align: right')) {
                                setAlignment('right');
                            } else if (style.includes('text-align: justify')) {
                                setAlignment('justify');
                            } else {
                                setAlignment('left');
                            }
                        }
                    }
                }
            });
        });
    }, [editor]);

    // Bold button click handler
    const handleBoldClick = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
    };

    // Italic button click handler
    const handleItalicClick = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
    };

    // Underline button click handler
    const handleUnderlineClick = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
    };

    // Heading button click handler
    const handleHeadingClick = (headingSize) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $wrapNodes(selection, () => $createHeadingNode(`h${headingSize}`));
            }
        });
    };

    // Ordered list button click handler
    const handleOrderedListClick = () => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    };

    // Unordered list button click handler
    const handleUnorderedListClick = () => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    };

    // Horizontal rule handler
    const handleHorizontalRuleClick = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const horizontalRuleNode = $createHorizontalRuleNode();
                selection.insertNodes([horizontalRuleNode]);
            }
        });
    };

    // Strikethrough handler
    const handleStrikethroughClick = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
    };

    // Subscript handler
    const handleSubscriptClick = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
    };

    // Superscript handler
    const handleSuperscriptClick = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
    };

    // Code handler
    const handleCodeClick = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
    };

    // Quote handler
    const handleQuoteClick = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $wrapNodes(selection, () => $createQuoteNode());
            }
        });
    };

    // Text alignment handlers
    const handleAlignLeft = () => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
        setAlignment('left');
    };

    const handleAlignCenter = () => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
        setAlignment('center');
    };

    const handleAlignRight = () => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
        setAlignment('right');
    };

    const handleAlignJustify = () => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
        setAlignment('justify');
    };

    // Insert table handler
    const handleInsertTable = () => {
        editor.dispatchCommand(INSERT_TABLE_COMMAND, {
            rows: 3,
            columns: 3,
        });
    };

    // Link handlers
    const handleLinkClick = () => {
        // If selection has a link, get its URL
        editor.getEditorState().read(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const nodes = selection.getNodes();
                const linkNode = nodes.find(node => $isLinkNode(node));
                if (linkNode) {
                    setLinkUrl(linkNode.getURL());
                } else {
                    setLinkUrl('');
                }
            }
        });
        setIsLinkModalOpen(true);
    };

    const handleLinkSubmit = () => {
        if (linkUrl) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
        }
        setIsLinkModalOpen(false);
    };

    // Text color handler
    const handleTextColorChange = (e) => {
        const value = e.target.value;
        setTextColor(value);
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                selection.getNodes().forEach(node => {
                    if (node.getType() === 'text') {
                        let style = node.getStyle() || '';
                        // Remove existing color style
                        style = style.replace(/color:\s*[^;]+;?/g, '');
                        // Add new color style
                        style = `${style}; color: ${value};`.replace(/^;\s*/, '');
                        node.setStyle(style);
                    }
                });
            }
        });
    };

    // Background color handler
    const handleBackgroundColorChange = (e) => {
        const value = e.target.value;
        setBackgroundColor(value);
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                selection.getNodes().forEach(node => {
                    if (node.getType() === 'text') {
                        let style = node.getStyle() || '';
                        // Remove existing background-color style
                        style = style.replace(/background-color:\s*[^;]+;?/g, '');
                        // Add new background-color style if not "transparent"
                        if (value !== 'transparent') {
                            style = `${style}; background-color: ${value};`.replace(/^;\s*/, '');
                        }
                        node.setStyle(style);
                    }
                });
            }
        });
    };

    // Handle transparent background
    const handleTransparentBackground = () => {
        setBackgroundColor('transparent');
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                selection.getNodes().forEach(node => {
                    if (node.getType() === 'text') {
                        let style = node.getStyle() || '';
                        // Remove existing background-color style
                        style = style.replace(/background-color:\s*[^;]+;?/g, '');
                        node.setStyle(style);
                    }
                });
            }
        });
        setShowBackgroundColorPicker(false);
    };

    // Toggle text color picker
    const toggleTextColorPicker = () => {
        setShowTextColorPicker(!showTextColorPicker);
        setShowBackgroundColorPicker(false);
    };

    // Toggle background color picker
    const toggleBackgroundColorPicker = () => {
        setShowBackgroundColorPicker(!showBackgroundColorPicker);
        setShowTextColorPicker(false);
    };

    // Handle text color selection from palette
    const handleTextColorSelect = (color) => {
        setTextColor(color);
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                selection.getNodes().forEach(node => {
                    if (node.getType() === 'text') {
                        let style = node.getStyle() || '';
                        // Remove existing color style
                        style = style.replace(/color:\s*[^;]+;?/g, '');
                        // Add new color style
                        style = `${style}; color: ${color};`.replace(/^;\s*/, '');
                        node.setStyle(style);
                    }
                });
            }
        });
        setShowTextColorPicker(false);
    };

    // Handle background color selection from palette
    const handleBackgroundColorSelect = (color) => {
        setBackgroundColor(color);
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                selection.getNodes().forEach(node => {
                    if (node.getType() === 'text') {
                        let style = node.getStyle() || '';
                        // Remove existing background-color style
                        style = style.replace(/background-color:\s*[^;]+;?/g, '');
                        // Add new background-color style
                        style = `${style}; background-color: ${color};`.replace(/^;\s*/, '');
                        node.setStyle(style);
                    }
                });
            }
        });
        setShowBackgroundColorPicker(false);
    };

    // Clear formatting handler
    const handleClearFormatting = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                selection.getNodes().forEach(node => {
                    if (node.getType() === 'text') {
                        node.setStyle('');
                        node.setFormat(0); // Clear all formatting (bold, italic, etc.)
                    }
                });
            }
        });
    };

    // Font family change handler
    const handleFontFamilyChange = (e) => {
        const value = e.target.value;
        setFontFamily(value);
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                selection.getNodes().forEach(node => {
                    if (node.getType() === 'text') {
                        let style = node.getStyle() || '';
                        // Remove existing font-family style
                        style = style.replace(/font-family:\s*[^;]+;?/g, '');
                        // Add new font-family style
                        style = `${style}; font-family: ${value};`.replace(/^;\s*/, '');
                        node.setStyle(style);
                    }
                });
            }
        });
    };

    // Font size change handler
    const handleFontSizeChange = (e) => {
        const value = e.target.value;
        setFontSize(value);
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                selection.getNodes().forEach(node => {
                    if (node.getType() === 'text') {
                        let style = node.getStyle() || '';
                        // Remove existing font-size style
                        style = style.replace(/font-size:\s*[^;]+;?/g, '');
                        // Add new font-size style
                        style = `${style}; font-size: ${value};`.replace(/^;\s*/, '');
                        node.setStyle(style);
                    }
                });
            }
        });
    };

    // Undo/Redo handlers
    const handleUndo = () => {
        editor.dispatchCommand(UNDO_COMMAND, undefined);
    };

    const handleRedo = () => {
        editor.dispatchCommand(REDO_COMMAND, undefined);
    };

    // Effect for closing color pickers when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click was outside color picker containers
            if (showTextColorPicker || showBackgroundColorPicker) {
                const colorPickerElements = document.querySelectorAll('.color-picker-container');
                let clickedInside = false;

                colorPickerElements.forEach(element => {
                    if (element.contains(event.target)) {
                        clickedInside = true;
                    }
                });

                if (!clickedInside) {
                    setShowTextColorPicker(false);
                    setShowBackgroundColorPicker(false);
                }
            }
        };

        // Add event listener
        document.addEventListener('mousedown', handleClickOutside);

        // Clean up
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showTextColorPicker, showBackgroundColorPicker]);

    // Paragraph button click handler (normal text)
    const handleParagraphClick = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $wrapNodes(selection, () => $createParagraphNode());
            }
        });
    };

    return (
        <>
            <div className="toolbar">
                <div className="toolbar-row">
                    {/* History buttons */}
                    <button onClick={handleUndo} title="Undo">
                        <span className="format-icons">{Icons.undo}</span>
                    </button>
                    <button onClick={handleRedo} title="Redo">
                        <span className="format-icons">{Icons.redo}</span>
                    </button>

                    <div className="divider"></div>

                    {/* Font Family Selector */}
                    <select className="font-family-selector" value={fontFamily} onChange={handleFontFamilyChange}>
                        {FONT_FAMILY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>

                    <div className="divider"></div>

                    {/* Font Size Selector */}
                    <select className="font-size-selector" value={fontSize} onChange={handleFontSizeChange}>
                        {FONT_SIZE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>

                    <div className="divider"></div>

                    {/* Basic formatting */}
                    <button
                        onClick={handleBoldClick}
                        className={isBold ? "active" : ""}
                        title="Bold">
                        <span className="format-icons">{Icons.bold}</span>
                    </button>
                    <button
                        onClick={handleItalicClick}
                        className={isItalic ? "active" : ""}
                        title="Italic">
                        <span className="format-icons">{Icons.italic}</span>
                    </button>
                    <button
                        onClick={handleUnderlineClick}
                        className={isUnderline ? "active" : ""}
                        title="Underline">
                        <span className="format-icons">{Icons.underline}</span>
                    </button>
                    <button
                        onClick={handleStrikethroughClick}
                        className={isStrikethrough ? "active" : ""}
                        title="Strikethrough">
                        <span className="format-icons">{Icons.strikethrough}</span>
                    </button>

                    <div className="divider"></div>

                    {/* Text Color Selector */}
                    <div className="color-picker-container">
                        <button
                            onClick={toggleTextColorPicker}
                            className="color-button"
                            title="Text color">
                            <div className="color-button-inner" style={{
                                backgroundColor: textColor,
                                color: textColor === '#ffffff' ? '#000000' : '#ffffff'
                            }}>
                                A
                            </div>
                        </button>
                        {showTextColorPicker && (
                            <div className="color-grid-dropdown">
                                <div className="color-grid-header">Text color</div>
                                <div className="color-grid">
                                    {COLOR_PALETTE.map((row, rowIndex) => (
                                        <div key={`text-row-${rowIndex}`} className="color-grid-row">
                                            {row.map((color, colIndex) => (
                                                <button
                                                    key={`text-${rowIndex}-${colIndex}`}
                                                    className="color-grid-cell"
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => handleTextColorSelect(color)}
                                                    title={color}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Background Color Selector */}
                    <div className="color-picker-container">
                        <button
                            onClick={toggleBackgroundColorPicker}
                            className="color-button"
                            title="Background color">
                            <div className="color-button-inner" style={{
                                backgroundColor: backgroundColor === 'transparent' ? '#FFFFFF' : backgroundColor,
                                backgroundImage: backgroundColor === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' : 'none',
                                backgroundSize: '6px 6px',
                                backgroundPosition: '0 0, 3px 3px'
                            }}>
                                <span style={{ visibility: 'hidden' }}>A</span>
                            </div>
                        </button>
                        {showBackgroundColorPicker && (
                            <div className="color-grid-dropdown">
                                <div className="color-grid-header">Background color</div>
                                <div className="color-grid">
                                    <button
                                        className="color-grid-cell transparent-cell"
                                        onClick={handleTransparentBackground}
                                        title="Transparent"
                                    >
                                        <div className="transparent-indicator">⦸</div>
                                    </button>
                                    {COLOR_PALETTE.map((row, rowIndex) => (
                                        <div key={`bg-row-${rowIndex}`} className="color-grid-row">
                                            {row.map((color, colIndex) => (
                                                <button
                                                    key={`bg-${rowIndex}-${colIndex}`}
                                                    className="color-grid-cell"
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => handleBackgroundColorSelect(color)}
                                                    title={color}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="divider"></div>

                    {/* Alignment */}
                    <button
                        onClick={handleAlignLeft}
                        className={alignment === 'left' ? "active" : ""}
                        title="Align Left">
                        <span className="format-icons">{Icons.alignLeft}</span>
                    </button>
                    <button
                        onClick={handleAlignCenter}
                        className={alignment === 'center' ? "active" : ""}
                        title="Align Center">
                        <span className="format-icons">{Icons.alignCenter}</span>
                    </button>
                    <button
                        onClick={handleAlignRight}
                        className={alignment === 'right' ? "active" : ""}
                        title="Align Right">
                        <span className="format-icons">{Icons.alignRight}</span>
                    </button>

                    <div className="divider"></div>

                    {/* Lists */}
                    <button
                        onClick={handleOrderedListClick}
                        title="Numbered List"
                        className={isListActive && listType === 'number' ? 'active' : ''}
                        data-active={isListActive && listType === 'number'}
                    >
                        <span className="format-icons">{Icons.numberedList}</span>
                    </button>
                    <button
                        onClick={handleUnorderedListClick}
                        title="Bullet List"
                        className={isListActive && listType === 'bullet' ? 'active' : ''}
                        data-active={isListActive && listType === 'bullet'}
                    >
                        <span className="format-icons">{Icons.bulletList}</span>
                    </button>

                    <div className="divider"></div>

                    {/* Heading Dropdown with Gmail-style wrapper */}
                    <div className="dropdown-container text-style-dropdown">
                        <div className="select-wrapper">
                            <span className="dropdown-icon">{TextFormatIcon}</span>
                            <select
                                className="heading-selector"
                                onChange={(e) => {
                                    if (e.target.value === "normal") {
                                        handleParagraphClick();
                                    } else {
                                        handleHeadingClick(parseInt(e.target.value));
                                    }
                                }}
                                value={activeHeadingTag}
                                title="Text Style"
                            >
                                <option value="normal">Normal text</option>
                                <option value="1">Heading 1</option>
                                <option value="2">Heading 2</option>
                                <option value="3">Heading 3</option>
                            </select>
                        </div>

                        <div className="divider"></div>

                        {/* Special elements */}
                        <button onClick={handleLinkClick} title="Insert Link">
                            <span className="format-icons">{Icons.link}</span>
                        </button>
                        <button onClick={handleHorizontalRuleClick} title="Insert Horizontal Line">
                            <span className="format-icons">{Icons.horizontalRule}</span>
                        </button>
                        <button onClick={handleQuoteClick} title="Quote Block">
                            <span className="format-icons">{Icons.quote}</span>
                        </button>
                        <button onClick={handleClearFormatting} title="Clear Formatting">
                            <span className="format-icons">{Icons.clearFormatting}</span>
                        </button>
                    </div>
                </div>

                {/* Link Modal */}
                {isLinkModalOpen && (
                    <div className="link-modal">
                        <div className="link-modal-content">
                            <h4>Add link</h4>
                            <input
                                type="text"
                                placeholder="https://example.com"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                autoFocus
                            />
                            <div className="link-modal-buttons">
                                <button onClick={() => setIsLinkModalOpen(false)}>Cancel</button>
                                <button onClick={handleLinkSubmit}>Save</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
