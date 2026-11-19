import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export interface CopyButtonProps {
  text: string;
  title?: string;
  className?: string;
  iconSize?: number;
  showLabel?: boolean;
  label?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  title = 'Copy to clipboard',
  className = '',
  iconSize = 14,
  showLabel = false,
  label = 'Copy'
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`p-1 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5 ${className}`}
      title={copied ? 'Copied!' : title}
    >
      {copied ? (
        <Check size={iconSize} className="text-emerald-400" />
      ) : (
        <Copy size={iconSize} />
      )}
      {showLabel && (
        <span className={`text-xs font-medium ${copied ? 'text-emerald-400' : 'text-neutral-300'}`}>
          {copied ? 'Copied!' : label}
        </span>
      )}
    </button>
  );
};

export default CopyButton;
