import Message from "./Message"

const ChatBox = () => {
  return (
    <>
      <div className="h-full overflow-auto">
        <Message user="User 1" message="hello user 1"/>


      </div>
    </>
  )
}

export default ChatBox
