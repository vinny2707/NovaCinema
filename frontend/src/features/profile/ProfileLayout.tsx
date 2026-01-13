import { useState } from 'react';
import type { User } from '../../api/endpoints/auth.api';
import Sidebar from './Sidebar';
import PersonalInfoCard from './PersonalInfoCard';
import ChangePasswordCard from './ChangePasswordCard';
import BookingHistoryCard from './BookingHistoryCard';

interface Props {
  profile: User | null;
  user: User | null;
  onLogout: () => void;
}

const ProfileLayout = ({ profile, user, onLogout }: Props) => {
  const [selectedTab, setSelectedTab] = useState<'info' | 'history'>('info');

  const pageTitle = selectedTab === 'info' ? 'CUSTOMER INFORMATION' : 'BOOKING HISTORY';

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-[#0f1230] to-[#4b2f8a] py-12">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-20 gap-7 px-4">
        <div className="lg:col-span-5">
          <Sidebar
            user={user}
            onLogout={onLogout}
            selected={selectedTab}
            onTabChange={setSelectedTab}
          />
        </div>

        <main className="lg:col-span-15 flex flex-col gap-5">
          <h1 className="text-3xl md:text-4xl text-white font-extrabold uppercase mb-6">{pageTitle}</h1>

          {selectedTab === 'info' ? (
            <>
              <PersonalInfoCard profile={profile} />
              <ChangePasswordCard />
            </>
          ) : (
            <BookingHistoryCard />
          )}
        </main>
      </div>
    </div>
  );
};

export default ProfileLayout;
