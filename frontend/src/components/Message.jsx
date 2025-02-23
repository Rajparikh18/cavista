const Message = ({ text, isBot, isHTML }) => {
    return (
        <div className={`message ${isBot ? 'bot-message' : 'user-message'}`}>
            {isHTML ? (
                <div dangerouslySetInnerHTML={{ __html: text }} />
            ) : (
                <p>{text}</p>
            )}
        </div>
    );
};

export default Message;