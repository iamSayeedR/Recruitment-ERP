import React, { useState } from 'react';
import styles from './Avatar.module.css';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
}) => {
  const [hasError, setHasError] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const showImage = src && !hasError;

  return (
    <div className={`${styles.avatar} ${styles[`size-${size}`]}`}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className={styles.image}
          onError={() => setHasError(true)}
        />
      ) : (
        <span className={styles.initials} aria-label={name}>
          {name ? getInitials(name) : '?'}
        </span>
      )}
    </div>
  );
};
