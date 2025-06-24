
import React from 'react';

interface UserInitialsAvatarProps {
  firstName: string;
  lastName: string;
  textClassName?: string; 
}

const UserInitialsAvatar: React.FC<UserInitialsAvatarProps> = ({
  firstName,
  lastName,
  textClassName = "text-sm font-semibold text-white", 
}) => {
  const firstInitial = firstName?.charAt(0).toUpperCase() || '';
  const lastInitial = lastName?.charAt(0).toUpperCase() || '';
  const initials = `${firstInitial}${lastInitial}`;

  return (
    <span className={textClassName}>
      {initials}
    </span>
  );
};

export default UserInitialsAvatar;