import React from 'react';

interface AIScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function AIScoreBadge({ score, size = 'md', showLabel = false }: AIScoreBadgeProps) {
  const cls =
    score >= 85 ? 'ai-score-high' :
    score >= 65 ? 'ai-score-medium': 'ai-score-low';

  const label =
    score >= 85 ? 'High' :
    score >= 65 ? 'Medium': 'Low';

  const textSize =
    size === 'sm' ? 'text-xs' :
    size === 'lg'? 'text-xl font-bold tabular-nums' : 'text-sm';

  return (
    <span className={`inline-flex items-center gap-1 font-bold rounded-md px-2 py-0.5 tabular-nums ${cls} ${textSize}`}>
      {score}
      {showLabel && <span className="font-medium text-2xs opacity-70">{label}</span>}
    </span>
  );
}