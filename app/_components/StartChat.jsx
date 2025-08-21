function StartChat() {
    return (
      <div className="text-center flex items-center text-lg lg:text-xl flex-col justify-center text-gray-400 mt-5  h-full">
        <p className="">
          This chat is{" "}
          <span className="font-semibold text-gray-300">
            end-to-end encrypted
          </span>
          .
        </p>
        <p>Only you and your contact can read the messages.</p>
        <p className="mt-2 italic">Start the conversation securely.</p>
      </div>
    );
}

export default StartChat
