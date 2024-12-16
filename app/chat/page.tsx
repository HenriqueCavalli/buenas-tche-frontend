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
			Swal.fire({
				icon: "error",
				title: "Erro",
				text: "Não foi possível buscar a lista de usuários.",
				toast: true,
				position: "top-end",
				showConfirmButton: false,
				timer: 3000,
			});
		}
	};

	useEffect(() => {
		if (isConnected) {
			fetchUsers();
		}
	}, [isConnected]);

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
			<div className="flex h-screen">
				<div className="flex flex-col p-4 border-r h-full w-1/4">
					<UserList onSelectUser={handleSelectUser} />
					<button
						onClick={logout}
						className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-300"
					>
						Sair
					</button>
				</div>
				<div className="flex-1 flex flex-col">
					{selectedUser ? (
						<>
							<div className="p-4 border-b flex justify-between items-center">
								<h2 className="text-xl">
									Conversando com {selectedUser.name} (
									{selectedUser.username})
								</h2>
								<button
									onClick={handleLeaveChat}
									className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors duration-300"
								>
									Sair da conversa
								</button>
							</div>
							<ChatBox messages={messages} currentUser={user} />
							<MessageInput onSend={handleSendMessage} />
						</>
					) : (
						<div className="flex-1 flex items-center justify-center">
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
