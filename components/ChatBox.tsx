"use client";

import React, { useEffect, useRef } from "react";
import { Message } from "./Message";

interface ChatBoxProps {
	messages: any[];
	currentUser: any;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, currentUser }) => {
	const endOfMessagesRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div className="flex-1 p-4 overflow-y-auto">
			{messages.map((msg) => (
				<Message
					key={msg._id}
					message={msg}
					currentUser={currentUser}
				/>
			))}
			<div ref={endOfMessagesRef} />
		</div>
	);
};

export default ChatBox;
