import { useAuthContext } from './hooks/useAuthContext';
import { Spin } from 'antd';
import Home from './pages/home';
import ChatbotWidget from './pages/components/ChatbotWidget';
const App = () => {
 const { user, isLoading } = useAuthContext();

 if (!isLoading) {
  return (
   <>
    <Home />
    <ChatbotWidget />
   </>
  );
 } else {
  return (
   <div className="loading">
    <Spin size="large" />
   </div>
  );
 }
};

export default App;
