"use client";

import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import UserList from "../../components/UserList";
import ChatBox from "../../components/ChatBox";
import MessageInput from "../../components/MessageInput";
import Notification from "../../components/Notification";
import api from "../../services/api";
import ProtectedRoute from "../../components/ProtectedRoute";

interface User {
	_id: string;
	name: string;
	username: string;
	online: boolean;
}

interface Message {
	_id: string;
	sender: { _id: string; name: string; username: string };
	receiver: { _id: string; name: string; username: string };
	content: string;
	timestamp: string;
}

const ChatPage = () => {
	const { token, logout, user } = useContext(AuthContext);
	const { socket, isConnected } = useSocket(token);
	const [users, setUsers] = useState<User[]>([]);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [notification, setNotification] = useState<string | null>(null);

	useEffect(() => {
		if (socket) {
			socket.on("receiveMessage", (message: Message) => {
				if (
					selectedUser &&
					(message.sender._id === selectedUser._id ||
						message.receiver._id === selectedUser._id)
				) {
					setMessages((prev) => [...prev, message]);
				} else {
					setNotification(`Nova mensagem de ${message.sender.name}`);
				}
			});

			socket.on("updateUserList", () => {
				fetchUsers();
			});

			return () => {
				socket.off("receiveMessage");
				socket.off("updateUserList");
			};
		}
	}, [socket, selectedUser]);

	const fetchUsers = async () => {
		try {
			const response = await api.get("/users");
			setUsers(response.data);
		} catch (error) {
			console.error("Erro ao buscar usuários:", error);
		}
	};

	useEffect(() => {
		if (isConnected) {
			fetchUsers();
		}
	}, [isConnected]);

	const handleSelectUser = async (user: User) => {
		setSelectedUser(user);
		setNotification(null);
		try {
			const response = await api.get(`/messages/${user._id}`);
			setMessages(response.data.messages.reverse());
			if (socket && isConnected) {
				socket.emit("joinConversation", { otherUserId: user._id });
			}
		} catch (error) {
			console.error("Erro ao buscar mensagens:", error);
		}
	};

	const handleSendMessage = (content: string) => {
		if (socket && selectedUser && user) {
			socket.emit("sendMessage", {
				receiverId: selectedUser._id,
				content,
			});

			const newMessage: Message = {
				_id: Date.now().toString(),
				sender: user,
				receiver: selectedUser,
				content,
				timestamp: new Date().toISOString(),
			};
			setMessages((prev) => [...prev, newMessage]);
		}
	};

	return (
		<ProtectedRoute>
			<div className="flex h-screen">
				<UserList onSelectUser={handleSelectUser} />
				<div className="flex-1 flex flex-col">
					{selectedUser ? (
						<>
							<div className="p-4 border-b flex justify-between items-center">
								<h2 className="text-xl">
									Conversando com {selectedUser.name} (
									{selectedUser.username})
								</h2>
								<button
									onClick={logout}
									className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
								>
									Sair
								</button>
							</div>
							<ChatBox messages={messages} currentUser={user} />
							<MessageInput onSend={handleSendMessage} />
						</>
					) : (
						<div className="flex-1 flex items-center justify-center">
							<h2 className="text-2xl text-gray-500">
								Selecione um usuário para iniciar o chat
							</h2>
						</div>
					)}
				</div>
				{notification && <Notification message={notification} />}
			</div>
		</ProtectedRoute>
	);
};

export default ChatPage;
