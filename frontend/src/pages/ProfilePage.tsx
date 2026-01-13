import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../api/endpoints/profile.api';
import type { User } from '../api/endpoints/auth.api';
import ProfileLayout from '../features/profile/ProfileLayout';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileApi.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-white text-lg">Loading profile...</div>;
  }

  return <ProfileLayout profile={profile} user={user} onLogout={logout} />;
};

export default ProfilePage;