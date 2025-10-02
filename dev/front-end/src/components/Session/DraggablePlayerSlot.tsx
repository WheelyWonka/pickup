import React, { useState, useRef } from 'react';
import type { TeamSlot } from '../../types/models';

interface DraggablePlayerSlotProps {
  slot: TeamSlot;
  playerName: string;
  gameId: string;
  teamType: 'teamA' | 'teamB';
  slotIndex: number;
  isBeingDragged?: boolean;
  onDragStart: (e: React.DragEvent, data: DragData) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onTouchStart?: (e: React.TouchEvent, data: DragData) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  onTouchHoldStart?: () => void;
  onTouchHoldEnd?: () => void;
}

export interface DragData {
  gameId: string;
  teamType: 'teamA' | 'teamB';
  slotIndex: number;
  playerId: string;
  slotType: 'reserved' | 'bonus';
}

const DraggablePlayerSlot: React.FC<DraggablePlayerSlotProps> = ({
  slot,
  playerName,
  gameId,
  teamType,
  slotIndex,
  isBeingDragged = false,
  onDragStart,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchHoldStart,
  onTouchHoldEnd,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const dragThreshold = 5; // Minimum distance to start drag (reduced for more responsiveness)
  const touchStartTime = useRef<number | null>(null);
  const dragDelay = 200; // Minimum time (ms) to hold before drag can start (reduced)

  const dragData: DragData = {
    gameId,
    teamType,
    slotIndex,
    playerId: slot.playerId,
    slotType: slot.slotType,
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    touchStartTime.current = Date.now();
    setIsDragging(false);
    setIsHolding(true); // Immediately show holding feedback
    
    // Notify parent that we're holding the drag handle
    if (onTouchHoldStart) {
      onTouchHoldStart();
    }
    
    // Don't call onTouchStart immediately - wait for delay
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current || !touchStartTime.current) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);
    const timeSinceStart = Date.now() - touchStartTime.current;
    
    // If we're holding the drag handle, always prevent scrolling
    if (isHolding) {
      e.preventDefault();
    }
    
    // Start dragging if we've moved enough and waited long enough
    if ((deltaX > dragThreshold || deltaY > dragThreshold) && 
        timeSinceStart >= dragDelay && 
        !isDragging) {
      setIsDragging(true);
      
      if (onTouchStart) {
        onTouchStart(e, dragData);
      }
    }
    
    // Handle drag movement
    if (isDragging && onTouchMove) {
      onTouchMove(e);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchStartPos.current = null;
    touchStartTime.current = null;
    setIsDragging(false);
    setIsHolding(false); // Clear holding state
    
    // Notify parent that we're no longer holding the drag handle
    if (onTouchHoldEnd) {
      onTouchHoldEnd();
    }
    
    if (onTouchEnd) {
      onTouchEnd(e);
    }
  };

  return (
    <div
      className={`flex items-center justify-between bg-white/80 backdrop-blur-sm border border-orange-200/30 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-all duration-200 select-none ${
        isBeingDragged ? 'opacity-20' : isDragging ? 'opacity-75 scale-105' : isHolding ? 'opacity-90 scale-102 shadow-lg border-orange-300/50' : ''
      }`}
    >
      <div className="font-semibold text-gray-800 truncate flex-1 min-w-0">{playerName}</div>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-bold shadow-sm ${
          slot.slotType === 'reserved' 
            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200/50' 
            : 'bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 border border-orange-200/50'
        }`}>
          {slot.slotType}
        </span>
        {/* Drag Handle - only this element can initiate drag */}
        <div 
          draggable
          onDragStart={(e) => onDragStart(e, dragData)}
          onDragEnd={onDragEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`flex flex-col gap-0.5 transition-colors duration-200 flex-shrink-0 cursor-move p-1 -m-1 ${
            isHolding ? 'text-orange-500 scale-110' : 'text-gray-300 hover:text-gray-500'
          }`}
          style={{ touchAction: 'none' }} // Prevent default touch behaviors
          title="Drag to move player"
        >
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default DraggablePlayerSlot;
