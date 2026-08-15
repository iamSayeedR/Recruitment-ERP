import React from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  variant = 'text',
  count = 1,
}) => {
  const skeletons = Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className={`${styles.skeleton} ${styles[`variant-${variant}`]}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      aria-hidden="true"
    />
  ));

  return <>{skeletons}</>;
};
