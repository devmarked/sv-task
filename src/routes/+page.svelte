<script lang="ts">
	import TaskInput from '$lib/components/TaskInput.svelte';
	import TaskItem from '$lib/components/TaskItem.svelte';
	import { tasks, taskActions } from '$lib/stores/taskStore';

	// Reactive derived values
	const activeTasks = $derived($tasks.filter((task) => !task.completed));
	const completedTasks = $derived($tasks.filter((task) => task.completed));
</script>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="mx-auto max-w-2xl px-4">
		<header class="mb-8 text-center">
			<h1 class="text-4xl font-bold text-gray-800">Task Manager</h1>
			<p class="mt-2 text-gray-600">Stay organized, get things done</p>
		</header>

		<TaskInput />

		<!-- Stats -->
		<div class="mb-6 flex gap-4 text-sm text-gray-600">
			<span>{activeTasks.length} active</span>
			<span>{completedTasks.length} completed</span>
			{#if completedTasks.length > 0}
				<button
					onclick={taskActions.clearCompleted}
					class="ml-auto text-red-500 hover:text-red-700"
				>
					Clear completed
				</button>
			{/if}
		</div>

		<!-- Task List -->
		<div class="space-y-3">
			{#each $tasks as task (task.id)}
				<TaskItem {task} />
			{:else}
				<p class="py-12 text-center text-gray-400">No tasks yet. Add one above! 🎯</p>
			{/each}
		</div>
	</div>
</div>
