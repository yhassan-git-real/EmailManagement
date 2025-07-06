import React, { useState, useRef, useEffect } from 'react';
import './CustomEditor.css';

const CustomRichTextEditor = ({ initialValue, onChange }) => {
  const editorRef = useRef(null);
  const textColorPickerRef = useRef(null);
  const bgColorPickerRef = useRef(null);
  const [html, setHtml] = useState(initialValue || '<p>Start editing your template here...</p>');
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    orderedList: false,
    unorderedList: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false
  });
  
  // Handle clicks outside the color pickers to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close text color picker if clicked outside
      if (textColorPickerRef.current && !textColorPickerRef.current.contains(event.target) && 
          !event.target.closest('#text-color-button')) {
        const picker = document.getElementById('text-color-picker');
        if (picker && picker.classList.contains('show')) {
          picker.classList.remove('show');
        }
      }
      
      // Close bg color picker if clicked outside
      if (bgColorPickerRef.current && !bgColorPickerRef.current.contains(event.target) && 
          !event.target.closest('#bg-color-button')) {
        const picker = document.getElementById('bg-color-picker');
        if (picker && picker.classList.contains('show')) {
          picker.classList.remove('show');
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Initialize the editor with the initial value
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialValue || '<p>Start editing your template here...</p>';
      editorRef.current.focus();
      handleInput();
    }
  }, []);
  
  // Update the content when the user makes changes
  const handleInput = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    setHtml(content);
    if (onChange) {
      onChange(content);
    }
    
    // Check for active formats
    updateActiveFormats();
  };
  
  // Check active formats
  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      orderedList: document.queryCommandState('insertOrderedList'),
      unorderedList: document.queryCommandState('insertUnorderedList'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight')
    });
  };
  
  // Update content when initialValue changes (e.g., when template loads)
  useEffect(() => {
    if (initialValue && initialValue !== html && editorRef.current) {
      editorRef.current.innerHTML = initialValue;
      setHtml(initialValue);
    }
  }, [initialValue]);
  
  // Format text with basic commands
  const formatText = (command, value = null) => {
    try {
      document.execCommand(command, false, value);
      handleInput();
      editorRef.current.focus();
      updateActiveFormats();
    } catch (error) {
      console.error(`Error applying format ${command}:`, error);
    }
  };
  
  // Helper to ensure editor has focus and selection before formatting
  const ensureSelectionAndFormat = (command, value = null) => {
    editorRef.current.focus();
    
    // Make sure we have a valid selection
    const selection = window.getSelection();
    
    // If no selection or the selection is not in the editor
    if (!selection.rangeCount || !editorRef.current.contains(selection.anchorNode)) {
      // Create a new selection at the cursor position
      const range = document.createRange();
      const textNode = editorRef.current.firstChild || editorRef.current;
      range.setStart(textNode, 0);
      range.collapse(true);
      
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    formatText(command, value);
  };
  
  // Font family and size handling
  const applyFontFamily = (fontFamily) => {
    if (!fontFamily) return;
    ensureSelectionAndFormat('fontName', fontFamily);
  };
  
  const applyFontSize = (size) => {
    if (!size) return;
    // Map size values to actual HTML fontSize values (1-7)
    const sizeMap = {
      'small': '1',
      'normal': '3',
      'large': '5',
      'huge': '7'
    };
    ensureSelectionAndFormat('fontSize', sizeMap[size] || size);
  };
  
  // Text color handling
  const applyTextColor = (color) => {
    // Make sure color value is valid
    if (!color) return;
    
    // If no text is selected, select some text or insert some
    const selection = window.getSelection();
    
    // Apply color directly via execCommand
    try {
      editorRef.current.focus();
      
      if (!selection.rangeCount || selection.toString() === '') {
        // If no selection, insert some colored text
        const span = document.createElement('span');
        span.style.color = color;
        span.textContent = 'Text';
        
        // Insert at cursor position or at the end
        document.execCommand('insertHTML', false, span.outerHTML);
      } else {
        // If text is selected, apply color to selection
        document.execCommand('foreColor', false, color);
      }
      
      // Update the state
      handleInput();
    } catch (e) {
      console.error('Color application error:', e);
    }
  };
  
  // Background color handling
  const applyBackgroundColor = (color) => {
    // Make sure color value is valid
    if (!color) return;
    
    // If no text is selected, select some text or insert some
    const selection = window.getSelection();
    
    // Apply background color directly
    try {
      editorRef.current.focus();
      
      if (!selection.rangeCount || selection.toString() === '') {
        // If no selection, insert some background-colored text
        const span = document.createElement('span');
        span.style.backgroundColor = color;
        span.textContent = 'Text';
        
        // Insert at cursor position or at the end
        document.execCommand('insertHTML', false, span.outerHTML);
      } else {
        // If text is selected, try both commands for browser compatibility
        try {
          document.execCommand('hiliteColor', false, color);
        } catch (e) {
          try {
            document.execCommand('backColor', false, color);
          } catch (err) {
            // If both fail, use direct HTML replacement
            const html = `<span style="background-color: ${color}">${selection.toString()}</span>`;
            document.execCommand('insertHTML', false, html);
          }
        }
      }
      
      // Update the state
      handleInput();
    } catch (e) {
      console.error('Background color application error:', e);
    }
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('input', handleInput);
      editor.addEventListener('click', updateActiveFormats);
      editor.addEventListener('keyup', updateActiveFormats);
      
      // Initial check for active formats
      setTimeout(updateActiveFormats, 100);
      
      return () => {
        editor.removeEventListener('input', handleInput);
        editor.removeEventListener('click', updateActiveFormats);
        editor.removeEventListener('keyup', updateActiveFormats);
      };
    }
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      if (document.activeElement === editorRef.current) {
        updateActiveFormats();
      }
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  return (
    <div className="custom-rich-text-editor">
      <div className="editor-toolbar">
        {/* Undo/Redo Buttons */}
        <button onClick={() => formatText('undo')} className="toolbar-button" title="Undo">
          <span className="icon-text">↩</span>
        </button>
        <button onClick={() => formatText('redo')} className="toolbar-button" title="Redo">
          <span className="icon-text">↪</span>
        </button>
        
        {/* Font family dropdown */}
        <select 
          className="toolbar-select font-select" 
          onChange={(e) => applyFontFamily(e.target.value)}
          onClick={(e) => e.target.focus()}
        >
          <option value="">Font</option>
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
          <option value="Georgia">Georgia</option>
          <option value="Palatino">Palatino</option>
          <option value="Garamond">Garamond</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
          <option value="Trebuchet MS">Trebuchet MS</option>
        </select>

        {/* Font size dropdown */}
        <select 
          className="toolbar-select size-select" 
          onChange={(e) => applyFontSize(e.target.value)}
          onClick={(e) => e.target.focus()}
        >
          <option value="">Size</option>
          <option value="small">Small</option>
          <option value="normal">Normal</option>
          <option value="large">Large</option>
          <option value="huge">Huge</option>
        </select>

        {/* Text Formatting - Bold, Italic, Underline */}
        <button 
          onClick={() => formatText('bold')} 
          className={`toolbar-button ${activeFormats.bold ? 'active' : ''}`}
          title="Bold"
        >
          <span className="icon-text"><b>B</b></span>
        </button>
        <button 
          onClick={() => formatText('italic')} 
          className={`toolbar-button ${activeFormats.italic ? 'active' : ''}`}
          title="Italic"
        >
          <span className="icon-text"><i>I</i></span>
        </button>
        <button 
          onClick={() => formatText('underline')} 
          className={`toolbar-button ${activeFormats.underline ? 'active' : ''}`}
          title="Underline"
        >
          <span className="icon-text"><u>U</u></span>
        </button>
        
        {/* Text Color */}
        <div className="toolbar-dropdown">
          <button 
            id="text-color-button"
            className="toolbar-button color-button" 
            title="Text Color"
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent losing focus
              document.getElementById('text-color-picker').classList.toggle('show');
            }}
          >
            <span className="icon-text">A</span>
            <span className="color-indicator"></span>
          </button>
          <div id="text-color-picker" className="dropdown-content color-picker" ref={textColorPickerRef}>
            <div className="color-grid">
              {['#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
                '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
                '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc'].map(color => (
                <div 
                  key={`text-${color}`}
                  className="color-cell" 
                  style={{backgroundColor: color}}
                  onClick={() => {
                    applyTextColor(color);
                    document.getElementById('text-color-picker').classList.remove('show');
                  }}
                  onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Background Color */}
        <div className="toolbar-dropdown">
          <button 
            id="bg-color-button"
            className="toolbar-button bg-color-button" 
            title="Background Color"
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent losing focus
              document.getElementById('bg-color-picker').classList.toggle('show');
            }}
          >
            <span className="icon-text">BG</span>
            <span className="color-indicator"></span>
          </button>
          <div id="bg-color-picker" className="dropdown-content color-picker" ref={bgColorPickerRef}>
            <div className="color-grid">
              {['#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
                '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
                '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc'].map(color => (
                <div 
                  key={`bg-${color}`}
                  className="color-cell" 
                  style={{backgroundColor: color}}
                  onClick={() => {
                    applyBackgroundColor(color);
                    document.getElementById('bg-color-picker').classList.remove('show');
                  }}
                  onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Lists and Alignment */}
        <button 
          onClick={() => ensureSelectionAndFormat('insertOrderedList')} 
          className={`toolbar-button ${activeFormats.orderedList ? 'active' : ''}`}
          title="Numbered List"
        >
          <span className="icon-text">1.</span>
        </button>
        <button 
          onClick={() => ensureSelectionAndFormat('insertUnorderedList')} 
          className={`toolbar-button ${activeFormats.unorderedList ? 'active' : ''}`}
          title="Bulleted List"
        >
          <span className="icon-text">•</span>
        </button>
        <button 
          onClick={() => ensureSelectionAndFormat('justifyLeft')} 
          className={`toolbar-button ${activeFormats.justifyLeft ? 'active' : ''}`}
          title="Align Left"
        >
          <span className="icon-text left-align">≡</span>
        </button>
        <button 
          onClick={() => ensureSelectionAndFormat('justifyCenter')} 
          className={`toolbar-button ${activeFormats.justifyCenter ? 'active' : ''}`}
          title="Align Center"
        >
          <span className="icon-text center-align">≡</span>
        </button>
        <button 
          onClick={() => ensureSelectionAndFormat('justifyRight')} 
          className={`toolbar-button ${activeFormats.justifyRight ? 'active' : ''}`}
          title="Align Right"
        >
          <span className="icon-text right-align">≡</span>
        </button>
        
        {/* Quote and Formatting */}
        <button onClick={() => formatText('formatBlock', '<blockquote>')} className="toolbar-button" title="Quote">
          <span className="icon-text">"</span>
        </button>
        <button 
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) formatText('createLink', url);
          }} 
          className="toolbar-button"
          title="Insert Link"
        >
          <span className="icon-text">🔗</span>
        </button>
        <button onClick={() => formatText('removeFormat')} className="toolbar-button" title="Remove Formatting">
          <span className="icon-text">T̶</span>
        </button>
        <button onClick={() => formatText('delete')} className="toolbar-button">
          <span className="icon-text">✕</span>
        </button>
      </div>
      
      <div 
        ref={editorRef} 
        className="editor-content" 
        contentEditable="true"
        onInput={handleInput}
        onFocus={updateActiveFormats}
        onBlur={updateActiveFormats}
        onClick={updateActiveFormats}
        onKeyUp={updateActiveFormats}
        spellCheck={true}
      />
    </div>
  );
};

export default CustomRichTextEditor;
