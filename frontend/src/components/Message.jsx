const Message = ({ text, isBot }) => {
    return (
        <div className={`message ${isBot ? 'bot-message' : 'user-message'}`}
             dangerouslySetInnerHTML={{ __html: text }}>
        </div>
    );
};

export default Message;
