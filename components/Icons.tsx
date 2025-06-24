
import React from 'react';

interface IconProps {
  className?: string;
  onClick?: () => void; 
  fill?: string; 
}

export const UserIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
  </svg>
);

// SparklesIcon is no longer primary but kept in case of any missed references or future use.
export const SparklesIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" clipRule="evenodd" />
    <path d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .897 1.203 5.243 5.243 0 0 0 2.05-5.022Z" />
  </svg>
);

export const ModernAiIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    {/* Simple abstract AI representation: Outer circle, inner smaller circles/nodes */}
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    {/* Inner 'brain' or 'network' representation */}
    <circle cx="12" cy="10" r="1.5"/>
    <circle cx="9.5" cy="13.5" r="1.5"/>
    <circle cx="14.5" cy="13.5" r="1.5"/>
    {/* Could add lines connecting them if desired, but keeping it simple */}
    {/* <path d="M12 10.5v2.5m-2.5 1h5"/> Example lines, currently commented out */}
  </svg>
);

export const SendIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const MessageIcon: React.FC<IconProps> = ({ className }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-2.184-2.183a15.003 15.003 0 0 0-4.433-1.028H6.75c-1.105 0-2-.895-2-2V10.608c0-.97.616-1.813 1.5-2.097m14.25-1.121a25.083 25.083 0 0 1-6.195-.618M9.75 9.75h.008v.008H9.75V9.75Zm4.5 0h.008v.008H14.25V9.75Zm4.5 0h.008v.008H18.75V9.75Z" />
  </svg>
);

export const MinimizeIcon: React.FC<IconProps> = ({ className }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

export const ChevronUpIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
  </svg>
);

export const AttachmentIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.687 7.687a1.5 1.5 0 0 1-2.121-2.121l6.758-6.758a3 3 0 0 1 4.242 0 3 3 0 0 1 0 4.242L9.27 18.631a1.5 1.5 0 0 1-2.121-2.121L13.275 10.5" />
  </svg>
);

export const EmojiIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9 9.75h.008v.008H9V9.75Zm.008 0-.008-.007.008.007Zm4.492 0h.008v.008h-.008V9.75Zm.008 0-.008-.007.008.007Zm3.742 0h.008v.008h-.008V9.75Zm.008 0-.008-.007.008.007Z" />
  </svg>
);

export const MicrophoneIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
  </svg>
);

export const RecordingIcon: React.FC<IconProps> = ({ className }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <rect x="7" y="7" width="10" height="10" rx="1" ry="1" fill="currentColor" stroke="none" />
  </svg>
);

export const PhoneIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
  </svg>
);

export const HeartPulseIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.909 14.361c.105.08.21.158.315.233A8.787 8.787 0 0 0 18 15.75c.894.09 1.756.379 2.51.813M5.166 17.22c.718-.525 1.548-.87 2.434-1.002a9.021 9.021 0 0 1 2.266-.134M12 12.256V15.75m0 0H8.25m3.75 0H15.75" />
    </svg>
);

export const ThumbsUpIcon: React.FC<IconProps> = ({ className, onClick }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} onClick={onClick}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H5.904c-.659 0-1.207.536-1.207 1.207v4.088c0 .671.548 1.207 1.207 1.207h.008C7.734 12 8.488 10.886 9.75 10.886c1.263 0 2.017 1.114 2.175 1.114a.75.75 0 0 1-.25 1.465c-.313.087-.655.168-.998.234a8.968 8.968 0 0 0-1.943.23H6.633Z" />
  </svg>
);

export const ThumbsDownIcon: React.FC<IconProps> = ({ className, onClick }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} onClick={onClick}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282H17.25a2.25 2.25 0 0 1 2.25 2.25c0 .431-.109.836-.309 1.193a11.824 11.824 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904C5.245 21.75 4.698 21.214 4.698 20.543V16.455c0-.671.548 1.207 1.207 1.207h.008a8.968 8.968 0 0 0 1.943-.23c.343-.066.685-.147.998-.234a.75.75 0 0 1 .25-1.465c.158 0 .912-1.114 2.175-1.114 1.263 0 2.017 1.114 2.017 1.114V12h-3.126c-.659 0-1.207-.536-1.207-1.207V6.707c0-.986-.987-1.207-1.207-1.207H6.633Z" />
  </svg>
);

export const PowerIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({ className, fill = "none", onClick }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} fill={fill} onClick={onClick}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.321h5.387a.563.563 0 0 1 .327.984l-4.371 3.184a.563.563 0 0 0-.182.633l1.634 4.893a.563.563 0 0 1-.832.644l-4.371-3.184a.563.563 0 0 0-.658 0l-4.371 3.184a.563.563 0 0 1-.832-.644l1.634-4.893a.563.563 0 0 0-.182-.633L2.053 9.915a.563.563 0 0 1 .327-.984h5.387a.563.563 0 0 0 .475-.32L11.48 3.5Z" />
  </svg>
);

export const UserGroupIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-3.741-5.013M12 12.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-4.243.346A3 3 0 1 0 3.757 18a9.094 9.094 0 0 0 3.742-.479m0 0A3 3 0 0 1 3.757 12c0-1.06.398-2.034 1.065-2.796M15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0Zm6 0a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" />
  </svg>
);

export const ChatBubbleLeftRightIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-2.184-2.183a15.003 15.003 0 0 0-4.433-1.028H6.75c-1.105 0-2-.895-2-2V10.608c0-.97.616-1.813 1.5-2.097m0 0A22.5 22.5 0 0 0 5.625 5.39m14.625 3.121a22.5 22.5 0 0 1-8.218-5.39M6.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
  </svg>
);