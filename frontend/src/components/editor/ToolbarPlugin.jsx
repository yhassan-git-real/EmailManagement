import React, { useState, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    FORMAT_ELEMENT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    INDENT_CONTENT_COMMAND,
    OUTDENT_CONTENT_COMMAND,
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

// Gmail-style SVG icons - All icons aim for viewBox="0 0 24 24" for consistency
// Stroke width typically 1.8 or 2. Fill set to 'none' for outline icons.
const Icons = {
    undo: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 7H12.5C17.1944 7 21 10.8056 21 15.5C21 20.1944 17.1944 24 12.5 24H11" transform="translate(0 -3.5)" />
            <path d="M7 11.5L2.5 7L7 2.5" transform="translate(0 -3.5)" />
        </svg>
    ),
    redo: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 7H11.5C6.80558 7 3 10.8056 3 15.5C3 20.1944 6.80558 24 11.5 24H13" transform="translate(0 -3.5)" />
            <path d="M17 11.5L21.5 7L17 2.5" transform="translate(0 -3.5)" />
        </svg>
    ),
    bold: (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M17.25 9.99999C17.25 11.2153 16.7754 12.3367 15.9789 13.1356C15.1824 13.9344 14.0642 14.4167 12.85 14.4167H8.33333V18.25H7V5.74999H12.85C14.0642 5.74999 15.1824 6.23228 15.9789 7.03117C16.7754 7.83005 17.25 8.95146 17.25 9.99999ZM10.0833 12.6667H12.85C13.5588 12.6667 14.1721 12.3226 14.6108 11.8826C15.0496 11.4426 15.4167 10.8279 15.4167 10C15.4167 9.1721 15.0496 8.55737 14.6108 8.11737C14.1721 7.67737 13.5588 7.5 12.85 7.5H10.0833V12.6667Z" />
        </svg>
    ),
    italic: (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M14.25 5.75L10.0833 5.75L10.0833 7.5L11.9021 7.5L9.20417 16.5L7.83333 16.5L7.83333 18.25L13.75 18.25L13.75 16.5L11.9292 16.5L14.6271 7.5L16 7.5L16 5.75L14.25 5.75Z" />
        </svg>
    ),
    underline: (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M12 16.5C14.6019 16.5 16.5833 14.5159 16.5833 11.9062V5.75H14.8333V11.9062C14.8333 13.5771 13.5729 14.75 12 14.75C10.4271 14.75 9.16667 13.5771 9.16667 11.9062V5.75H7.41667V11.9062C7.41667 14.5159 9.39812 16.5 12 16.5ZM7 18.25H17V20H7V18.25Z" />
        </svg>
    ),
    strikethrough: (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M12.6641 13.5938C13.4271 13.349 13.9688 12.8333 14.2865 12.0469C14.6042 11.2604 14.7604 10.3802 14.75 9.40625C14.75 8.01042 14.3177 6.90625 13.4531 6.09375C12.5885 5.28125 11.4427 4.875 10.0156 4.875C8.93229 4.875 8.00521 5.08854 7.23438 5.51562C6.46354 5.94271 5.92708 6.55208 5.625 7.34375L7.20312 7.96875C7.39062 7.50521 7.70833 7.16146 8.15625 6.9375C8.60417 6.71354 9.21354 6.60417 9.98438 6.60417C10.8021 6.60417 11.4323 6.83333 11.875 7.29167C12.3177 7.75 12.5417 8.40625 12.5625 9.26042C12.5625 9.82292 12.4323 10.2917 12.1719 10.6667C11.9115 11.0417 11.5365 11.375 11.0469 11.6667L5.5 13.875V15.125H18.5V13.5938H12.6641Z M5.5 11.1875L9.3125 9.75C9.0026 9.0599 8.8474 8.34479 8.84375 7.60417C8.84375 7.27083 8.88021 6.97396 8.95312 6.71354L5.5 7.90625V11.1875Z" transform="translate(-0.5 0)" />
             <path d="M4 12.5H20V11H4V12.5Z" />
        </svg>
    ),
    alignLeft: (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M3 6H21V7.5H3V6ZM3 11.25H15V12.75H3V11.25ZM3 16.5H21V18H3V16.5Z" />
        </svg>
    ),
    alignCenter: (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M3 6H21V7.5H3V6ZM5 11.25H19V12.75H5V11.25ZM3 16.5H21V18H3V16.5Z" />
        </svg>
    ),
    alignRight: (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M3 6H21V7.5H3V6ZM9 11.25H21V12.75H9V11.25ZM3 16.5H21V18H3V16.5Z" />
        </svg>
    ),
     alignJustify: (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M3 6H21V7.5H3V6ZM3 11.25H21V12.75H3V11.25ZM3 16.5H21V18H3V16.5Z" />
        </svg>
    ),
    bulletList: (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M7.83333 6H20V7.5H7.83333V6ZM7.83333 11.25H20V12.75H7.83333V11.25ZM7.83333 16.5H20V18H7.83333V16.5ZM4 6.75C4 7.30228 4.44772 7.75 5 7.75C5.55228 7.75 6 7.30228 6 6.75C6 6.19772 5.55228 5.75 5 5.75C4.44772 5.75 4 6.19772 4 6.75ZM4 12C4 12.5523 4.44772 13 5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12ZM4 17.25C4 17.8023 4.44772 18.25 5 18.25C5.55228 18.25 6 17.8023 6 17.25C6 16.6977 5.55228 16.25 5 16.25C4.44772 16.25 4 16.6977 4 17.25Z" />
        </svg>
    ),
    numberedList: (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M7.83333 6H20V7.5H7.83333V6ZM7.83333 11.25H20V12.75H7.83333V11.25ZM7.83333 16.5H20V18H7.83333V16.5ZM5.58333 5.75L4 5.75L4 10.0833L5.58333 10.0833V9L4.91667 9V8.08333L5.58333 8.08333V7.16667L4.91667 7.16667V6.66667L5.58333 6.66667V5.75ZM4.17391 11.1667L5.58333 12.5417L5.58333 13.8333L4.08333 13.8333L4.08333 13.125L3.125 13.125L3.125 12.125L4.08333 11.1667H4.17391ZM4.08333 12.2083L3.58333 12.625L3.58333 12.6667L4.08333 12.6667V12.2083ZM5.58333 15.5833C5.58333 16.1311 5.4251 16.5833 5.1087 16.9403C4.79229 17.2972 4.36389 17.5 3.82396 17.5C3.28403 17.5 2.84028 17.3125 2.5 16.9375C2.15972 16.5625 2.04167 16.0469 2.16667 15.3906L2.625 15.5833C2.5625 15.9583 2.66667 16.2708 2.9375 16.5226C3.20833 16.7743 3.5625 16.875 4 16.8333C4.27083 16.8333 4.49306 16.7396 4.66667 16.5521C4.84028 16.3646 4.91667 16.1042 4.89583 15.7604C4.89583 15.4583 4.79167 15.2083 4.58333 15.0104C4.375 14.8125 4.08333 14.6667 3.70833 14.5833L3.20833 14.4583L3.20833 14.9583L3.5 15.0417C3.79167 15.125 4 15.25 4.125 15.4167C4.25 15.5833 4.29167 15.75 4.25 15.9167H5.08333L5.08333 15.0833L5.58333 15.0833V15.5833Z" />
        </svg>
    ),
    link: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
    ),
    horizontalRule: ( // This icon isn't standard in Gmail's formatting bar, but useful. Simple line.
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="12" x2="20" y2="12" />
        </svg>
    ),
    quote: (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M8.41667 15.3333C9.52778 15.3333 10.4444 15.0139 11.1667 14.375C11.8889 13.7361 12.25 12.8889 12.25 11.8333V8.08333H10.0833L8.58333 11.1667H10.0833V11.8333C10.0833 12.4306 9.91088 12.8935 9.56616 13.2222C9.22143 13.5509 8.78333 13.7167 8.25183 13.7167C8.06806 13.7167 7.89097 13.6898 7.72083 13.6361L7.20833 15.0556C7.55556 15.2083 7.95139 15.3056 8.39583 15.3333H8.41667ZM15.0833 15.3333C16.1944 15.3333 17.1111 15.0139 17.8333 14.375C18.5556 13.7361 18.9167 12.8889 18.9167 11.8333V8.08333H16.75L15.25 11.1667H16.75V11.8333C16.75 12.4306 16.5776 12.8935 16.2329 13.2222C15.8881 13.5509 15.45 13.7167 14.9185 13.7167C14.7347 13.7167 14.5576 13.6898 14.3875 13.6361L13.875 15.0556C14.2222 15.2083 14.6181 15.3056 15.0625 15.3333H15.0833Z" />
        </svg>
    ),
    clearFormatting: ( // Icon for "Remove formatting" (Tx)
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M11.2778 15.3333L7.91667 6.75H9.63889L11.9028 12.4583L14.1667 6.75H15.8889L12.5278 15.3333H11.2778ZM15.3056 18.25L12.8056 12.9444L14.125 12.2917L17.1389 18.25H15.3056Z" />
             <path d="M15.5 13.5 L18.5 16.5 M18.5 13.5 L15.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    ),
    indentLess: (
      <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M3 6H21V7.5H3V6ZM3 11.25H21V12.75H3V11.25ZM3 16.5H21V18H3V16.5ZM9.5 9L6.5 12L9.5 15V9Z" />
      </svg>
    ),
    indentMore: (
      <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M3 6H21V7.5H3V6ZM3 11.25H21V12.75H3V11.25ZM3 16.5H21V18H3V16.5ZM6.5 9L9.5 12L6.5 15V9Z" />
      </svg>
    )
};

// Gmail-style text format icon (used for style/heading dropdown trigger)
const TextFormatIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" >
        <path d="M9.41667 18.25L9.41667 7.58333L5.66667 7.58333L5.66667 5.75L18.1667 5.75L18.1667 7.58333L14.4167 7.58333L14.4167 18.25L12.5833 18.25L12.5833 12.5833L11.25 12.5833L11.25 18.25L9.41667 18.25Z"/>
    </svg>
);

// Font family options for the toolbar - these are fine
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


    // INDENT HANDLERS
    const handleIndent = () => {
        editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
    };

    const handleOutdent = () => {
        editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
    };


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
                     <button
                        onClick={handleAlignJustify}
                        className={alignment === 'justify' ? "active" : ""}
                        title="Align Justify">
                        <span className="format-icons">{Icons.alignJustify}</span>
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

                    {/* Indent buttons */}
                    <button onClick={handleOutdent} title="Indent Less">
                        <span className="format-icons">{Icons.indentLess}</span>
                    </button>
                    <button onClick={handleIndent} title="Indent More">
                        <span className="format-icons">{Icons.indentMore}</span>
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
