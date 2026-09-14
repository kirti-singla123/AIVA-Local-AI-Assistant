import ChatPanel from "./components/ChatPanel";
import "./App.css";

function App() {
  return (
    <div className="app">
      <div className="aiva-header">AIVA</div>
      <div className="main-layout">
        <ChatPanel />
      </div>
    </div>
  );
}

export default App;