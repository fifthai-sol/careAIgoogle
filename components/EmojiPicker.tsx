
import React from 'react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳',
  '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖',
  '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯',
  '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔',
  '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦',
  '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴',
  '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿',
  '👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙',
  '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋',
  '🖖', 'Waving Hand', '🙏', 'Clapping Hands', '🙌', 'Open Hands', '🤝', // Corrected emoji names
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-2 max-w-xs w-72 h-48 overflow-y-auto grid grid-cols-8 gap-1">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onEmojiSelect(emoji)}
          className="text-xl hover:bg-gray-200 rounded-md p-1 focus:outline-none focus:bg-gray-300"
          aria-label={`Insert emoji ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiPicker;