import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import type { Todo } from '../../lib/types';

// Props for the TodoItem component:
// - todo: the todo item to render
// - onToggle: toggles the todo's completion state
// - onDelete: deletes the todo by id
interface TodoItemProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

// Renders a single todo entry with swipe-to-delete and inline controls.
// Features:
// - horizontal swipe to reveal a red delete background and trigger delete on full swipe left
// - checkbox to toggle completion
// - shows assignee, due date (colored when overdue), comment, creator and done metadata
export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  // Horizontal translation applied while swiping (in pixels)
  const [swipeOffset, setSwipeOffset] = useState(0);
  // Whether a swipe is currently in progress (used to show/hide the delete background)
  const [isSwiping, setIsSwiping] = useState(false);

  // Handlers provided by react-swipeable to manage swipe interactions.
  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      // Only consider mostly-horizontal gestures to avoid interfering with vertical scroll
      if (Math.abs(eventData.deltaX) > Math.abs(eventData.deltaY)) {
        setIsSwiping(true);
        // Limit swipe offset to the range [-80, 0] so it doesn't slide too far
        setSwipeOffset(Math.min(0, Math.max(-80, eventData.deltaX)));
      }
    },
    onSwipedLeft: (eventData) => {
      // If a left swipe is confirmed, reset visuals and perform delete
      if (Math.abs(eventData.deltaX) > Math.abs(eventData.deltaY)) {
        setSwipeOffset(0);
        setIsSwiping(false);
        onDelete(todo.id);
      }
    },
    onSwipedRight: () => {
      // Cancel swipe: reset visual state
      setSwipeOffset(0);
      setIsSwiping(false);
    },
    preventScrollOnSwipe: false,
    trackMouse: false,
    delta: 10,
  });

  return (
    <div {...handlers} className="relative overflow-hidden rounded">
      {/* Red delete background revealed while swiping left */}
      <div
        className={`absolute inset-0 bg-red-500 flex justify-end items-center p-3 transition-opacity duration-200 ${
          isSwiping ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="text-white font-bold">Löschen</span>
      </div>

      {/* Main todo card: slides left/right based on swipeOffset */}
      <div
        className="relative border rounded p-3 flex justify-between items-start bg-white transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        <div className="flex flex-col flex-1 gap-1">
          {/* Assignee name (if any) */}
          <div className="font-bold text-lg">{todo.assigned?.name || ''}</div>

          {/* Due date: colored red when past, blue otherwise */}
          {todo.due_at && (
            <p
              className={`text-sm font-semibold mt-1 ${
                new Date(todo.due_at) < new Date() ? 'text-red-600' : 'text-blue-600'
              }`}
            >
              📅 Fällig am: {new Date(todo.due_at).toLocaleDateString()}
            </p>
          )}

          {/* Checkbox toggles completion; task title is struck through when done */}
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={todo.isDone} onChange={() => onToggle(todo)} />
            <span className={todo.isDone ? 'line-through' : ''}>{todo.task}</span>
          </div>

          {/* Optional comment */}
          {todo.comment && <p className="text-gray-500 text-sm">{todo.comment}</p>}

          {/* Creator and creation timestamp */}
          {todo.created_at && (
            <div className="text-xs text-gray-400 mt-1">
              * {todo.creator?.name || todo.created_by_id},{' '}
              {new Date(todo.created_at).toLocaleString()}
            </div>
          )}

          {/* If completed, show who marked it done and when */}
          {todo.isDone && todo.done_by && todo.done_at && (
            <div className="text-xs text-green-600 mt-1">
              ✓ {todo.done_by.name}, {new Date(todo.done_at).toLocaleString()}
            </div>
          )}
        </div>

        {/* Explicit delete button: alternative to swipe-to-delete */}
        <button onClick={() => onDelete(todo.id)} className="text-red-500 font-bold ml-3">
          X
        </button>
      </div>
    </div>
  );
}
