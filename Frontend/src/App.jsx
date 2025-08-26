import './App.css';
import SideBar from './Sidebar.jsx';
import ChatWindow from './ChatWindow.jsx';
import {MyContext} from "./MyContext.jsx"
import { useState } from 'react';
import {v1 as uuidv1} from "uuid";
import ErrorBoundary from "./ErrorBoundary.jsx";


function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]); //stores all chats of curr threads
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [modelAPI , setModelAPI] = useState("assistant");
  const providersValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    allThreads, setAllThreads,
    modelAPI,  setModelAPI
  };
  return (
    <div className='main'>
      <ErrorBoundary>
      <MyContext.Provider value={providersValues}>
        <SideBar></SideBar>
        <ChatWindow></ChatWindow>
      </MyContext.Provider>
      </ErrorBoundary>
    </div>
  )
}

export default App


