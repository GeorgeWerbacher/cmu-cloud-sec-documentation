import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { useState } from 'react';
import styles from '../styles/AuthNav.module.css';

export function AuthNav() {
  const { user, error, isLoading } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className={styles.authNav}>
      {user ? (
        <div className={styles.userInfoContainer}>
          <div 
            className={styles.avatarContainer} 
            onClick={toggleDropdown}
            onKeyDown={(e) => e.key === 'Enter' && toggleDropdown()}
            tabIndex={0}
            role="button"
            aria-haspopup="true"
            aria-expanded={showDropdown}
          >
            <img src={user.picture || ''} alt={user.name || 'User'} className={styles.avatar} />
          </div>
          
          {showDropdown && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownUserInfo}>
                <span className={styles.userName}>{user.name}</span>
              </div>
              <Link href="/api/auth/logout" className={styles.dropdownItem}>
                Logout
              </Link>
            </div>
          )}
        </div>
      ) : (
        <Link href="/api/auth/login" className={styles.authButton}>
          Login
        </Link>
      )}
    </div>
  );
} 