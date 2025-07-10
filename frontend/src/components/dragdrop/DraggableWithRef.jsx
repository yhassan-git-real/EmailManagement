import React, { forwardRef, useRef } from 'react';
import Draggable from 'react-draggable';

// This is a wrapper around react-draggable that uses forwardRef
// to avoid the findDOMNode warning in strict mode
const DraggableWithRef = forwardRef(({ children, handle, ...props }, ref) => {
  const nodeRef = useRef(null);
  
  // Pass the handle selector string directly to Draggable
  return (
    <Draggable 
      handle={handle}
      nodeRef={nodeRef}
      bounds="body"
      defaultPosition={{x: 0, y: 0}}
      position={null}
      {...props}
    >
      <div ref={nodeRef}>
        {children}
      </div>
    </Draggable>
  );
});

DraggableWithRef.displayName = 'DraggableWithRef';

export default DraggableWithRef;
