import React from 'react';
import { useParams } from 'react-router-dom';
import Profile from '../components/Profile';

const ProfilePage = () => {
  const { userId } = useParams();
  return <Profile userId={userId} />;
};

export default ProfilePage;
