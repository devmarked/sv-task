import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Task {
	id: string;
	title: string;
	completed: boolean;
	createdAt: number;
}

// Load tasks from localStorage (only in browser)
const loadTasks = (): Task[] => {
	if (browser) {
		const stored = localStorage.getItem('tasks');
		return stored ? JSON.parse(stored) : [];
	}
	return [];
};

// Create the writable store
export const tasks = writable<Task[]>(loadTasks());

// Subscribe to store changes and save to localStorage
if (browser) {
	tasks.subscribe((value) => {
		localStorage.setItem('tasks', JSON.stringify(value));
	});
}

// Helper functions to manage tasks
export const taskActions = {
	addTask: (title: string) => {
		const newTask: Task = {
			id: crypto.randomUUID(),
			title,
			completed: false,
			createdAt: Date.now()
		};
		tasks.update((currentTasks) => [newTask, ...currentTasks]);
	},

	toggleTask: (id: string) => {
		tasks.update((currentTasks) =>
			currentTasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
		);
	},

	deleteTask: (id: string) => {
		tasks.update((currentTasks) => currentTasks.filter((task) => task.id !== id));
	},

	clearCompleted: () => {
		tasks.update((currentTasks) => currentTasks.filter((task) => !task.completed));
	}
};
