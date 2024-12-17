"use client";

import React, { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";

interface User {
	_id: string;
	name: string;
	username: string;
	online: boolean;
	unreadCount: number;
}

interface UserListProps {
	onSelectUser: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ onSelectUser }) => {
	const [users, setUsers] = useState<User[]>([]);
	const { user: currentUser, token } = useContext(AuthContext);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const { socket } = useSocket(token);

	const fetchUsers = async () => {
		try {
			const response = await api.get("/users");
			setUsers(response.data);
		} catch (error) {
			console.error("Erro ao buscar usuários:", error);
		}
	};

	useEffect(() => {
		if (socket) {
			socket.on("updateUserList", () => {
				fetchUsers();
			});

			return () => {
				socket.off("updateUserList");
			};
		}
	}, [socket]);

	const handleSelectUser = (user: User) => {
		setSelectedUserId(user._id);
		onSelectUser(user);
	};

	return (
		<div className="flex flex-col h-full bg-white shadow-lg overflow-hidden">
			<div className="p-4 bg-blue-600">
				<h3 className="text-white text-xl font-semibold">Usuários</h3>
			</div>
			<div className="flex-1 overflow-y-auto">
				<ul className="divide-y divide-gray-200">
					{users.map((user) => {
						const isCurrentUser = user._id === currentUser?._id;
						const isSelected = user._id === selectedUserId;

						return (
							<li
								key={user._id}
								className={`flex items-center justify-between p-4 cursor-pointer transition-colors duration-200
									${isSelected ? "bg-blue-100" : "hover:bg-gray-50"}`}
								onClick={() => handleSelectUser(user)}
							>
								<div className="flex items-center">
									<img
										src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
											user.name,
										)}&background=random&size=48`}
										alt={user.name}
										className="h-12 w-12 rounded-full mr-4 border-2 border-blue-500"
									/>
									<div>
										<span className="block text-lg font-medium text-gray-800">
											{user.name}
										</span>
										<span className="block text-sm text-gray-500">
											@{user.username}
										</span>
									</div>
								</div>

								<div className="flex items-center space-x-3">
									{isCurrentUser && (
										<span className="text-sm text-blue-500 font-medium">
											(Você)
										</span>
									)}
									<span
										className={`h-3 w-3 rounded-full
											${user.online ? "bg-green-400" : "bg-gray-400"}`}
									></span>
									{user.unreadCount > 0 && !isSelected && (
										<span className="ml-2 bg-red-500 text-white text-xs font-semibold rounded-full h-6 w-6 flex items-center justify-center">
											{user.unreadCount}
										</span>
									)}
								</div>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
};

export default UserList;
