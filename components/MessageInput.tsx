"use client";

import React, { useState } from "react";

interface MessageInputProps {
	onSend: (content: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend }) => {
	const [message, setMessage] = useState("");

	const handleSend = () => {
		if (message.trim()) {
			onSend(message.trim());
			setMessage("");
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleSend();
		}
	};

	return (
		<div className="p-4 border-t flex">
			<input
				type="text"
				className="flex-1 border px-3 py-2 rounded mr-2"
				placeholder="Digite sua mensagem..."
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				onKeyPress={handleKeyPress}
			/>
			<button
				onClick={handleSend}
				className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
			>
				Enviar
			</button>
		</div>
	);
};

export default MessageInput;
