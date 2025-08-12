import React from 'react';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo website content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Surya Hospitals</h1>
          <p className="text-gray-600 mb-6">
            Welcome to our medical center. Our AI-powered chatbot is here to help you book appointments, 
            find doctors, and answer your health-related questions.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Book Appointments</h3>
              <p className="text-blue-600 text-sm">Schedule your visit with our specialists</p>
            </div>
            <div className="bg-teal-50 p-6 rounded-lg">
              <h3 className="font-semibold text-teal-800 mb-2">Find Doctors</h3>
              <p className="text-teal-600 text-sm">Locate healthcare providers in your area</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Health Checkups</h3>
              <p className="text-green-600 text-sm">Comprehensive health screening options</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">How to Embed This Chat Widget</h2>
          <p className="text-gray-600 mb-4">
            To embed this chat widget on your website, simply add this script tag before the closing &lt;/body&gt; tag:
          </p>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
            <code>{`<script src="https://your-domain.com/chat-widget.js"></script>
<script>
  window.HospitalChatWidget.init({
    apiUrl: 'wss://uatchatbotv2.altius.cc/ws/socket.io/',
    theme: 'medical', // or 'custom'
    position: 'bottom-right'
  });
</script>`}</code>
          </pre>
        </div>
      </div>
      
      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}

export default App;