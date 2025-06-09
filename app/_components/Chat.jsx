import ChatContainer from "./ChatContainer"
import ChatController from "./ChatController"
import ChatProfile from "./ChatProfile"

function Chat({messages}) {
    return (
        <div className="w-full h-full flex flex-col">
            <ChatProfile />
            <ChatContainer />
            <ChatController />
        </div>
    )
}

export default Chat
