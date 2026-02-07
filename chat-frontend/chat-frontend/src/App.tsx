import Chat from './components/chat/Chat';

function App() {
  return (
    <div style={{ 
      backgroundColor: '#e5e7eb', 
      minHeight: '100vh',
      width: '100vw',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '10px',
      boxSizing: 'border-box'
    }}>
      <Chat />
    </div>
  );
}

export default App;