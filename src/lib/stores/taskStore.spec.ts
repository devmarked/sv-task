import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { get } from 'svelte/store';

// Mock crypto.randomUUID before importing the store
const mockUUID = vi.fn(() => 'test-uuid-' + Math.random());
vi.stubGlobal('crypto', { randomUUID: mockUUID });

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		clear: () => {
			store = {};
		},
		removeItem: (key: string) => {
			delete store[key];
		}
	};
})();

vi.stubGlobal('localStorage', localStorageMock);

// Import after mocking globals
import { tasks, taskActions, type Task } from './taskStore';

describe('Task Store', () => {
	beforeEach(() => {
		// Clear localStorage before each test
		localStorage.clear();
		// Reset the store to empty
		tasks.set([]);
		// Reset mock
		mockUUID.mockClear();
		// Reset the mock implementation
		mockUUID.mockImplementation(() => 'test-uuid-' + Math.random());
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('taskActions.addTask', () => {
		it('should add a new task to the store', () => {
			const taskTitle = 'Buy groceries';
			taskActions.addTask(taskTitle);

			const currentTasks = get(tasks);
			expect(currentTasks).toHaveLength(1);
			expect(currentTasks[0].title).toBe(taskTitle);
			expect(currentTasks[0].completed).toBe(false);
		});

		it('should add task with unique id and timestamp', () => {
			mockUUID.mockReturnValueOnce('uuid-1').mockReturnValueOnce('uuid-2');

			taskActions.addTask('Task 1');
			taskActions.addTask('Task 2');

			const currentTasks = get(tasks);
			expect(currentTasks).toHaveLength(2);
			expect(currentTasks[0].id).toBe('uuid-2'); // Newest first
			expect(currentTasks[1].id).toBe('uuid-1');
			expect(currentTasks[0].createdAt).toBeDefined();
			expect(currentTasks[1].createdAt).toBeDefined();
		});

		it('should add new tasks to the beginning of the list', () => {
			taskActions.addTask('First task');
			taskActions.addTask('Second task');

			const currentTasks = get(tasks);
			expect(currentTasks[0].title).toBe('Second task');
			expect(currentTasks[1].title).toBe('First task');
		});
	});

	describe('taskActions.toggleTask', () => {
		it('should toggle task completion status', () => {
			mockUUID.mockReturnValueOnce('task-1');
			taskActions.addTask('Test task');

			// Toggle to completed
			taskActions.toggleTask('task-1');
			let currentTasks = get(tasks);
			expect(currentTasks[0].completed).toBe(true);

			// Toggle back to incomplete
			taskActions.toggleTask('task-1');
			currentTasks = get(tasks);
			expect(currentTasks[0].completed).toBe(false);
		});

		it('should only toggle the specified task', () => {
			mockUUID.mockReturnValueOnce('task-1').mockReturnValueOnce('task-2');

			taskActions.addTask('Task 1');
			taskActions.addTask('Task 2');

			taskActions.toggleTask('task-1');

			const currentTasks = get(tasks);
			expect(currentTasks[1].completed).toBe(true); // task-1 is at index 1
			expect(currentTasks[0].completed).toBe(false); // task-2 is at index 0
		});

		it('should handle non-existent task id gracefully', () => {
			taskActions.addTask('Test task');
			const beforeTasks = get(tasks);

			taskActions.toggleTask('non-existent-id');

			const afterTasks = get(tasks);
			expect(afterTasks).toEqual(beforeTasks);
		});
	});

	describe('taskActions.deleteTask', () => {
		it('should remove task from the store', () => {
			mockUUID.mockReturnValueOnce('task-to-delete');
			taskActions.addTask('Task to delete');

			taskActions.deleteTask('task-to-delete');

			const currentTasks = get(tasks);
			expect(currentTasks).toHaveLength(0);
		});

		it('should only delete the specified task', () => {
			mockUUID
				.mockReturnValueOnce('task-1')
				.mockReturnValueOnce('task-2')
				.mockReturnValueOnce('task-3');

			taskActions.addTask('Task 1');
			taskActions.addTask('Task 2');
			taskActions.addTask('Task 3');

			taskActions.deleteTask('task-2');

			const currentTasks = get(tasks);
			expect(currentTasks).toHaveLength(2);
			expect(currentTasks.find((t) => t.id === 'task-2')).toBeUndefined();
			expect(currentTasks.find((t) => t.id === 'task-1')).toBeDefined();
			expect(currentTasks.find((t) => t.id === 'task-3')).toBeDefined();
		});

		it('should handle non-existent task id gracefully', () => {
			taskActions.addTask('Test task');
			const beforeTasks = get(tasks);

			taskActions.deleteTask('non-existent-id');

			const afterTasks = get(tasks);
			expect(afterTasks).toHaveLength(beforeTasks.length);
		});
	});

	describe('taskActions.clearCompleted', () => {
		it('should remove all completed tasks', () => {
			mockUUID
				.mockReturnValueOnce('task-1')
				.mockReturnValueOnce('task-2')
				.mockReturnValueOnce('task-3');

			taskActions.addTask('Task 1');
			taskActions.addTask('Task 2');
			taskActions.addTask('Task 3');

			// Mark task-1 and task-3 as completed
			taskActions.toggleTask('task-1');
			taskActions.toggleTask('task-3');

			taskActions.clearCompleted();

			const currentTasks = get(tasks);
			expect(currentTasks).toHaveLength(1);
			expect(currentTasks[0].id).toBe('task-2');
			expect(currentTasks[0].completed).toBe(false);
		});

		it('should do nothing if no tasks are completed', () => {
			taskActions.addTask('Task 1');
			taskActions.addTask('Task 2');

			taskActions.clearCompleted();

			const currentTasks = get(tasks);
			expect(currentTasks).toHaveLength(2);
		});

		it('should clear all tasks if all are completed', () => {
			mockUUID.mockReturnValueOnce('task-1').mockReturnValueOnce('task-2');

			taskActions.addTask('Task 1');
			taskActions.addTask('Task 2');

			taskActions.toggleTask('task-1');
			taskActions.toggleTask('task-2');

			taskActions.clearCompleted();

			const currentTasks = get(tasks);
			expect(currentTasks).toHaveLength(0);
		});
	});

	describe('Store integration', () => {
		it('should maintain task structure correctly', () => {
			mockUUID.mockReturnValueOnce('test-id');
			const beforeTime = Date.now();

			taskActions.addTask('Complete task');

			const currentTasks = get(tasks);
			const task = currentTasks[0];

			expect(task).toHaveProperty('id');
			expect(task).toHaveProperty('title');
			expect(task).toHaveProperty('completed');
			expect(task).toHaveProperty('createdAt');
			expect(task.createdAt).toBeGreaterThanOrEqual(beforeTime);
		});

		it('should handle multiple operations in sequence', () => {
			mockUUID
				.mockReturnValueOnce('task-1')
				.mockReturnValueOnce('task-2')
				.mockReturnValueOnce('task-3');

			// Add tasks
			taskActions.addTask('Task 1');
			taskActions.addTask('Task 2');
			taskActions.addTask('Task 3');

			// Toggle some
			taskActions.toggleTask('task-1');
			taskActions.toggleTask('task-2');

			// Delete one
			taskActions.deleteTask('task-2');

			// Clear completed
			taskActions.clearCompleted();

			const currentTasks = get(tasks);
			expect(currentTasks).toHaveLength(1);
			expect(currentTasks[0].id).toBe('task-3');
			expect(currentTasks[0].completed).toBe(false);
		});
	});
});
