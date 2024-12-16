"use client";

import React, { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

interface User {
	_id: string;
	name: string;
	username: string;
	online: boolean;
}

interface UserListProps {
	onSelectUser: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ onSelectUser }) => {
	const [users, setUsers] = useState<User[]>([]);
	const { user: currentUser } = useContext(AuthContext);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

	const fetchUsers = async () => {
		try {
			const response = await api.get("/users");
			setUsers(response.data);
		} catch (error) {
			console.error("Erro ao buscar usuários:", error);
		}
	};

	useEffect(() => {
		fetchUsers();

		const interval = setInterval(fetchUsers, 4000);

		return () => clearInterval(interval);
	}, []);

	const handleSelectUser = (user: User) => {
		setSelectedUserId(user._id); 
		onSelectUser(user); 
	};

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1">
				<h3 className="text-xl mb-4">Usuários</h3>
				<ul>
					{users.map((user) => {
						const isCurrentUser = user._id === currentUser?._id;
						const isSelected = user._id === selectedUserId;

						return (
							<li
								key={user._id}
								className={`flex items-center justify-between mb-2 cursor-pointer p-2 rounded 
                                    ${isSelected ? "bg-blue-200" : "hover:bg-gray-100"}`} 
								onClick={() => handleSelectUser(user)}
							>
								<div className="flex items-center">
									<img
										src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
											user.name,
										)}&background=random&size=32`}
										alt={user.name}
										className="h-8 w-8 rounded-full mr-4"
									/>
									<div>
										<span className="font-semibold">
											{user.name}
										</span>
									</div>
								</div>

								<div className="flex items-center ml-3 mr-3">
									{isCurrentUser ? (
										<span className="text-sm text-gray-500 mr-3">
											(você)
										</span>
									) : null}
									<span
										className={`h-2 w-2 rounded-full mr-2 ${
											user.online
												? "bg-green-500"
												: "bg-gray-400"
										}`}
									></span>
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
