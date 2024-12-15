"use client";

import React from "react";

interface MessageProps {
	message: any;
	currentUser: any;
}

export const Message: React.FC<MessageProps> = ({ message, currentUser }) => {
	const isOwnMessage = message.sender._id === currentUser?._id;

	return (
		<div
			className={`mb-2 flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
		>
			<div
				className={`p-2 rounded ${
					isOwnMessage
						? "bg-blue-500 text-white"
						: "bg-gray-300 text-black"
				} max-w-xs`}
			>
				<p>{message.content}</p>
				<span className="text-xs">
					{new Date(message.timestamp).toLocaleTimeString()}
				</span>
			</div>
		</div>
	);
};
