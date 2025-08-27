import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import {PacmanLoader} from "react-spinners";
import ErrorBoundary from "./ErrorBoundary.jsx";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setPrevChats,
    setNewChat,
    modelAPI,
    setModelAPI
  } = useContext(MyContext);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const getReply = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setNewChat(false);

    

    console.log("message ", prompt, " threadId ", currThreadId);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: prompt,
        threadId: currThreadId,
        models: modelAPI
      }),
    };

    try {
      const response = await fetch("https://novachat-78y8.onrender.com/api/chat", options);
      const res = await response.json();
      console.log(res);  

      //changes from here
      setPrevChats((prevChats)=>[
        ...prevChats,
        {
          role:"user",
          content: prompt,
        },      
        {
          role:"assistant-openai",
          content: res.replies.openai,
        },
        {
          role:"assistant-gemini",
          content: res.replies.gemini,
        },
        {
          role:"assistant-perplexity",
          content: res.replies.perplexity,
        }
      ]);
      // setReply(res.reply);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
    setPrompt("");
  };

//   Append new chat to prevChats 
useEffect(() => {
    if (prompt && reply) {
      setPrevChats((prevChats) => [
        ...prevChats,
        {
          role: "user",
          content: prompt,
        },
        {
          role: "assistant-openai",
          content: reply,
        },
        {
          role: "assistant-perplexity",
          content: reply,
        },
        {
          role: "assistant-gemini",
          content: reply,
        },
      ]);
    }

    setPrompt("");
  }, [reply]);

  const handleProfileClick = () => {
    setIsOpen(!isOpen);
  };  

  return (
    <div className="chatWindow">
      <div className="navbar">
        <div className="secondDropDown">
          <label htmlFor="options"><b style={{fontSize:"larger", marginLeft:"80px"}}>Model : </b></label>
          <select
        id="options"
        value={modelAPI}
        onChange={(e) => {
    const value = e.target.value;
    setModelAPI(value);

    if (value === "assistant-openai") {
      setModelAPI("assistant-openai");
    } else if (value === "assistant-perplexity") {
      setModelAPI("assistant-perplexity");
      // perplexityModelSelect();
    } else if (value === "assistant-gemini") {
      setModelAPI("assistant-gemini"); // or your Gemini handler
    } else if (value === "assistant") {
      setModelAPI("assistant"); // NovaChat
    }
  }}
      >
        <option value="assistant">Custom</option>
        <option value="assistant-openai">OpenAI</option>
        <option value="assistant-perplexity">Perplexity</option>
        <option value="assistant-gemini">Gemini</option>
      </select>

        </div>
        <div className="userIconDiv" onClick={handleProfileClick}>
          <span className="userIcon">
            <i className="fa-solid fa-user"></i>
          </span>
        </div>
      </div>
      {isOpen && (
        <div className="dropDown">
          <div className="dropDownItem">
            <i className="fa-solid fa-gear"></i> Settings
          </div>
          <div className="dropDownItem">
            <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan
          </div>
          <div className="dropDownItem">
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
          </div>
        </div>
      )}
     
      <ErrorBoundary>
            <Chat></Chat>
      </ErrorBoundary>

      <PacmanLoader color="#fff" loading={loading}>
            </PacmanLoader>

      <div className="chatInput">
        <div className="inputBox">
          <input
            placeholder="Ask anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? getReply() : "")}
          ></input>
          <div id="submit" onClick={getReply}>
            <i className="fa-solid fa-paper-plane"></i>
          </div>
        </div>
        <p className="info">
          NovaChat can make mistakes. Check important info. See Cookie
          Preferences. Developed by <a href="https://www.linkedin.com/in/aryan-shokeen-529316265/">shokeen</a>
        </p>
      </div>
    </div>
  );
}

export default ChatWindow;
