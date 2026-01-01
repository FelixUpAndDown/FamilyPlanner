import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import type { Note } from '../../lib/notes';

interface NoteItemProps {
  note: Note;
  onDelete: (id: string) => void;
  onUpdate?: (updated: Note) => void;
  users?: { id: string; name: string }[];
  currentUserId?: string;
  currentProfileId?: string;
  onRefresh?: () => void;
}

/**
 * Renders a single note entry with swipe-to-delete and inline controls.
 * - Horizontal swipe left deletes
 * - Edit and delete buttons
 * - Creator info and creation timestamp
 * - Optional inline edit form
 */
export default function NoteItem({ note, onDelete, onUpdate, users = [] }: NoteItemProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (Math.abs(eventData.deltaX) > Math.abs(eventData.deltaY)) {
        setIsSwiping(true);
        setSwipeOffset(Math.min(0, Math.max(-80, eventData.deltaX)));
      }
    },
    onSwipedLeft: (eventData) => {
      if (Math.abs(eventData.deltaX) > Math.abs(eventData.deltaY)) {
        setSwipeOffset(0);
        setIsSwiping(false);
        onDelete(note.id);
      }
    },
    onSwipedRight: () => {
      setSwipeOffset(0);
      setIsSwiping(false);
    },
    preventScrollOnSwipe: false,
    trackMouse: false,
    delta: 10,
  });

  return (
    <div {...handlers} className="relative overflow-hidden rounded">
      {/* Delete background */}
      <div
        className={`absolute inset-0 bg-red-500 flex justify-end items-center p-3 transition-opacity duration-200 ${
          isSwiping ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="text-white font-bold">Löschen</span>
      </div>

      {/* Main note card */}
      <div
        className="relative border rounded p-3 flex flex-col transition-transform duration-200 ease-out bg-white"
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        {!openEdit ? (
          <>
            {/* Top-right buttons */}
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => onDelete(note.id)}
                className="p-1 rounded hover:bg-gray-100 text-red-600 font-bold"
                title="Löschen"
              >
                X
              </button>
              <button
                onClick={() => setOpenEdit(true)}
                className="p-1 rounded hover:bg-gray-100 text-blue-500 font-bold"
                title="Bearbeiten"
              >
                📝
              </button>
            </div>

            {/* Content */}
            <div className="pr-12">
              <div className="font-semibold text-lg">{note.title}</div>
              <div className="text-sm text-gray-600 mt-1">
                {note.content.length > 150 ? `${note.content.slice(0, 150)}…` : note.content}
              </div>
            </div>

            {/* Creator info */}
            <div className="text-xs text-gray-400 mt-3">
              *{' '}
              {note.creator?.name ||
                users.find((u) => u.id === note.created_by_id)?.name ||
                note.created_by_id}
              , {note.created_at ? new Date(note.created_at).toLocaleString() : '—'}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <input
              className="border rounded px-2 py-1"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Titel"
            />
            <textarea
              className="border rounded px-2 py-1 h-28"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Inhalt"
            />
            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                onClick={() => {
                  onUpdate?.({ ...note, title: editTitle, content: editContent });
                  setOpenEdit(false);
                }}
              >
                Speichern
              </button>
              <button
                className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
                onClick={() => {
                  setEditTitle(note.title);
                  setEditContent(note.content);
                  setOpenEdit(false);
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
