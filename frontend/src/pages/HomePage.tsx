// src/pages/HomePage.tsx
import { NowShowing } from '../features/movies/NowShowing';
import { ComingSoon } from '../features/movies/ComingSoon';
import { ChatbotWidget } from '../components/Chatbot/ChatbotWidget';

const HomePage = () => {
  return (
    <>
      <div className="py-16 space-y-20">
        <NowShowing />
        <ComingSoon />
      </div>
      <ChatbotWidget />
    </>
  );
};

export default HomePage;