"use client";

import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import UserList from "../../components/UserList";
import ChatBox from "../../components/ChatBox";
import MessageInput from "../../components/MessageInput";
import api from "../../services/api";
import ProtectedRoute from "../../components/ProtectedRoute";
import Swal from "sweetalert2";

interface User {
	_id: string;
	name: string;
	username: string;
	online: boolean;
	unreadCount: number;
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
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);

	useEffect(() => {
		if (socket) {
			socket.on("receiveMessage", (message: Message) => {
				if (selectedUser && message.sender._id === selectedUser._id) {
					setMessages((prev) => [...prev, message]);
				} else {
					Swal.fire({
						toast: true,
						position: "top-end",
						icon: "info",
						title: `Nova mensagem de ${message.sender.name}`,
						showConfirmButton: false,
						timer: 3000,
					});
				}
			});

			return () => {
				socket.off("receiveMessage");
			};
		}
	}, [socket, selectedUser]);

	const handleSelectUser = async (user: User) => {
		setSelectedUser(user);
		try {
			const response = await api.get(`/messages/${user._id}`);
			setMessages(response.data.messages.reverse());
			if (socket && isConnected) {
				socket.emit("joinConversation", { otherUserId: user._id });
			}
		} catch (error) {
			console.error("Erro ao buscar mensagens:", error);
			Swal.fire({
				icon: "error",
				title: "Erro",
				text: "Não foi possível buscar as mensagens.",
				toast: true,
				position: "top-end",
				showConfirmButton: false,
				timer: 3000,
			});
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

	const handleLeaveChat = () => {
		setSelectedUser(null);
		setMessages([]);
	};

	return (
		<ProtectedRoute>
			<div className="flex h-screen bg-gray-100">
				<div className="flex flex-col bg-white shadow-md w-full md:w-1/4 lg:w-1/5">
					<div className="flex-1 overflow-y-auto">
						<UserList onSelectUser={handleSelectUser} />
					</div>
					<div className="p-4 ">
						<button
							onClick={logout}
							className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-300"
						>
							Sair
						</button>
					</div>
				</div>

				<div className="flex-1 flex flex-col">
					{selectedUser ? (
						<>
							<div className="p-4 bg-white shadow-md flex justify-between items-center border-b">
								<div>
									<h2 className="text-xl font-semibold text-gray-800">
										Conversando com {selectedUser.name} (@
										{selectedUser.username})
									</h2>
									<span
										className={`text-sm ${
											selectedUser.online
												? "text-green-500"
												: "text-gray-500"
										}`}
									>
										{selectedUser.online
											? "Online"
											: "Offline"}
									</span>
								</div>
								<button
									onClick={handleLeaveChat}
									className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors duration-300"
								>
									Sair da conversa
								</button>
							</div>

							<div className="flex-1 p-4 overflow-y-auto bg-gray-50">
								<ChatBox
									messages={messages}
									currentUser={user}
								/>
							</div>

							<div className="p-4 bg-white">
								<MessageInput onSend={handleSendMessage} />
							</div>
						</>
					) : (
						<div className="flex-1 flex items-center justify-center bg-gray-100">
							<h2 className="text-2xl text-gray-500">
								Selecione um usuário para iniciar a conversa
							</h2>
						</div>
					)}
				</div>
			</div>
		</ProtectedRoute>
	);
};

export default ChatPage;
