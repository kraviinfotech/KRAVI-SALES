import { useCallback, useEffect, useRef, useState } from 'react';

const EDGE_PADDING = 12;
const OPEN_WIDGET_WIDTH = 360;
const OPEN_WIDGET_HEIGHT = 596;
const CLOSED_BUTTON_SIZE = 64;
const DRAG_THRESHOLD_PX = 6;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function useDraggableWidget(isOpen) {
  const [position, setPosition] = useState(() => ({
    x: typeof window !== 'undefined' ? Math.max(EDGE_PADDING, window.innerWidth - CLOSED_BUTTON_SIZE - EDGE_PADDING) : EDGE_PADDING,
    y: typeof window !== 'undefined' ? Math.max(EDGE_PADDING, window.innerHeight - CLOSED_BUTTON_SIZE - EDGE_PADDING) : EDGE_PADDING,
  }));
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);
  
  const dragOffset = useRef({ x: 0, y: 0 });
  const pointerIdRef = useRef(null);
  const pointerDownPosRef = useRef(null);
  const dragStartedRef = useRef(false);
  const suppressToggleClickRef = useRef(false);
  const suppressClickAfterDragRef = useRef(false);
  const activeDragHandleRef = useRef(null);

  const getDragBounds = useCallback(() => {
    if (typeof window === 'undefined') {
      return { maxX: EDGE_PADDING, maxY: EDGE_PADDING };
    }
    const rect = containerRef.current?.getBoundingClientRect();
    const width = rect?.width || OPEN_WIDGET_WIDTH;
    const height = rect?.height || OPEN_WIDGET_HEIGHT;
    return {
      maxX: Math.max(EDGE_PADDING, window.innerWidth - width - EDGE_PADDING),
      maxY: Math.max(EDGE_PADDING, window.innerHeight - height - EDGE_PADDING),
    };
  }, []);

  const clampPositionToViewport = useCallback((nextPosition) => {
    const { maxX, maxY } = getDragBounds();
    return {
      x: clamp(nextPosition.x, EDGE_PADDING, maxX),
      y: clamp(nextPosition.y, EDGE_PADDING, maxY),
    };
  }, [getDragBounds]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const keepWidgetInView = () => {
      setPosition((currentPosition) => {
        const nextPosition = clampPositionToViewport(currentPosition);
        if (nextPosition.x === currentPosition.x && nextPosition.y === currentPosition.y) return currentPosition;
        return nextPosition;
      });
    };
    keepWidgetInView();
    window.addEventListener('resize', keepWidgetInView);
    return () => window.removeEventListener('resize', keepWidgetInView);
  }, [clampPositionToViewport, isOpen]);

  const handleDragPointerDown = (event, { suppressClickAfterDrag = false } = {}) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    pointerDownPosRef.current = { x: event.clientX, y: event.clientY };
    dragStartedRef.current = false;
    suppressClickAfterDragRef.current = suppressClickAfterDrag;
    activeDragHandleRef.current = event.currentTarget;
    pointerIdRef.current = event.pointerId;

    dragOffset.current = { x: event.clientX - position.x, y: event.clientY - position.y };

    try {
      if (event.currentTarget?.setPointerCapture) event.currentTarget.setPointerCapture(event.pointerId);
    } catch (err) {}

    const handlePointerMove = (moveEvent) => {
      if (pointerIdRef.current != null && moveEvent.pointerId !== pointerIdRef.current) return;
      if (!pointerDownPosRef.current) return;
      const dx = moveEvent.clientX - pointerDownPosRef.current.x;
      const dy = moveEvent.clientY - pointerDownPosRef.current.y;
      const dist = Math.hypot(dx, dy);

      if (!dragStartedRef.current && dist < DRAG_THRESHOLD_PX) return;
      if (!dragStartedRef.current) {
        dragStartedRef.current = true;
        setDragging(true);
      }
      moveEvent.preventDefault();
      setPosition(clampPositionToViewport({
        x: moveEvent.clientX - dragOffset.current.x,
        y: moveEvent.clientY - dragOffset.current.y,
      }));
    };

    const finishDrag = (upEvent) => {
      if (pointerIdRef.current != null && upEvent.pointerId !== pointerIdRef.current) return;
      try {
        if (activeDragHandleRef.current?.releasePointerCapture && pointerIdRef.current != null) {
          activeDragHandleRef.current.releasePointerCapture(pointerIdRef.current);
        }
      } catch (err) {}

      if (dragStartedRef.current && suppressClickAfterDragRef.current) {
        suppressToggleClickRef.current = true;
      }
      pointerDownPosRef.current = null;
      pointerIdRef.current = null;
      activeDragHandleRef.current = null;
      dragStartedRef.current = false;
      suppressClickAfterDragRef.current = false;
      setDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', finishDrag);
      window.removeEventListener('pointercancel', finishDrag);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);
  };

  const popSuppressClick = () => {
    if (suppressToggleClickRef.current) {
      suppressToggleClickRef.current = false;
      return true;
    }
    return false;
  };

  return { containerRef, position, dragging, handleDragPointerDown, popSuppressClick };
}
