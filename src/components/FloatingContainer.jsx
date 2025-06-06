// src/components/FloatingContainer.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Minimize2, 
  Maximize2, 
  X, 
  Move,
  Settings,
  Info
} from 'lucide-react';

const FloatingContainer = ({ 
  children, 
  title = "MintXEN", 
  defaultPosition = { x: 50, y: 50 },
  defaultSize = { width: 800, height: 600 },
  isResizable = true,
  isDraggable = true,
  onClose = null,
  className = ""
}) => {
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Handle dragging
  const handleMouseDown = (e) => {
    if (!isDraggable || isMaximized) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging && !isMaximized) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
    
    if (isResizing) {
      const newWidth = Math.max(400, resizeStart.width + (e.clientX - resizeStart.x));
      const newHeight = Math.max(300, resizeStart.height + (e.clientY - resizeStart.y));
      
      setSize({
        width: newWidth,
        height: newHeight
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Handle resizing
  const handleResizeStart = (e) => {
    if (!isResizable || isMaximized) return;
    
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  // Window controls
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart]);

  // Prevent context menu on drag handle
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  // Container styles
  const containerStyle = {
    position: 'fixed',
    left: isMaximized ? 0 : position.x,
    top: isMaximized ? 0 : position.y,
    width: isMaximized ? '100vw' : isMinimized ? 'auto' : size.width,
    height: isMaximized ? '100vh' : isMinimized ? 'auto' : size.height,
    zIndex: 1000,
    transition: isMaximized || isMinimized ? 'all 0.3s ease-in-out' : 'none',
    userSelect: isDragging ? 'none' : 'auto',
    pointerEvents: 'auto'
  };

  return (
    <>
      {/* Backdrop blur when maximized */}
      {isMaximized && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-999" />
      )}
      
      <div style={containerStyle} className={`floating-container ${className}`}>
        <Card className={`
          bg-black/40 backdrop-blur-lg border border-white/20 shadow-2xl h-full flex flex-col
          ${isMaximized ? 'rounded-none' : 'rounded-lg'}
          ${isDragging ? 'shadow-2xl ring-2 ring-blue-500/50' : ''}
        `}>
          {/* Title Bar */}
          <div 
            className={`
              flex items-center justify-between p-3 border-b border-white/10 bg-gray-900/50 cursor-move
              ${isMaximized ? 'rounded-none' : 'rounded-t-lg'}
            `}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
          >
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-white text-sm">{title}</h3>
            </div>
            
            {/* Window Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-white/10 text-gray-400 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  // Add settings functionality here
                }}
              >
                <Settings className="w-3 h-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-white/10 text-gray-400 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMinimize();
                }}
              >
                <Minimize2 className="w-3 h-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-white/10 text-gray-400 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMaximize();
                }}
              >
                {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              </Button>
              
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Content Area */}
          {!isMinimized && (
            <CardContent className="flex-1 p-6 overflow-auto">
              {children}
            </CardContent>
          )}

          {/* Minimized State */}
          {isMinimized && (
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Info className="w-4 h-4" />
                <span>Window minimized</span>
              </div>
            </CardContent>
          )}

          {/* Resize Handle */}
          {isResizable && !isMaximized && !isMinimized && (
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize opacity-50 hover:opacity-100 transition-opacity"
              onMouseDown={handleResizeStart}
              style={{
                background: 'linear-gradient(-45deg, transparent 30%, white 30%, white 40%, transparent 40%, transparent 60%, white 60%, white 70%, transparent 70%)'
              }}
            />
          )}
        </Card>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .floating-container {
          font-family: 'Cherry Bomb One', cursive;
        }
        
        .floating-container * {
          font-family: inherit;
        }
        
        .floating-container input,
        .floating-container textarea,
        .floating-container select,
        .floating-container code,
        .floating-container pre {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
      `}</style>
    </>
  );
};

// Enhanced FloatingContainer with predefined layouts
const FloatingContainerPresets = {
  // Compact mode for mobile/small screens
  Compact: (props) => (
    <FloatingContainer
      {...props}
      defaultSize={{ width: 350, height: 500 }}
      defaultPosition={{ x: 20, y: 20 }}
      className="compact-mode"
    />
  ),

  // Standard desktop mode
  Standard: (props) => (
    <FloatingContainer
      {...props}
      defaultSize={{ width: 800, height: 600 }}
      defaultPosition={{ x: 100, y: 50 }}
      className="standard-mode"
    />
  ),

  // Large mode for detailed work
  Large: (props) => (
    <FloatingContainer
      {...props}
      defaultSize={{ width: 1200, height: 800 }}
      defaultPosition={{ x: 50, y: 30 }}
      className="large-mode"
    />
  ),

  // Sidebar mode (tall and narrow)
  Sidebar: (props) => (
    <FloatingContainer
      {...props}
      defaultSize={{ width: 400, height: '80vh' }}
      defaultPosition={{ x: 20, y: 50 }}
      className="sidebar-mode"
    />
  ),

  // Dashboard mode (wide and short)
  Dashboard: (props) => (
    <FloatingContainer
      {...props}
      defaultSize={{ width: '90vw', height: 400 }}
      defaultPosition={{ x: '5vw', y: 100 }}
      className="dashboard-mode"
    />
  )
};

// Hook for managing multiple floating containers
const useFloatingContainers = () => {
  const [containers, setContainers] = useState([]);
  const [activeContainer, setActiveContainer] = useState(null);

  const addContainer = (id, props) => {
    setContainers(prev => [...prev, { id, props, zIndex: Date.now() }]);
    setActiveContainer(id);
  };

  const removeContainer = (id) => {
    setContainers(prev => prev.filter(container => container.id !== id));
    if (activeContainer === id) {
      setActiveContainer(null);
    }
  };

  const bringToFront = (id) => {
    setContainers(prev => 
      prev.map(container => 
        container.id === id 
          ? { ...container, zIndex: Date.now() }
          : container
      )
    );
    setActiveContainer(id);
  };

  return {
    containers,
    activeContainer,
    addContainer,
    removeContainer,
    bringToFront
  };
};

export default FloatingContainer;
export { FloatingContainerPresets, useFloatingContainers };