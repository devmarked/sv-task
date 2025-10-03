<script lang="ts">
	import { taskActions } from '$lib/stores/taskStore';

	let taskTitle = $state('');

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		if (taskTitle.trim()) {
			taskActions.addTask(taskTitle.trim());
			taskTitle = ''; // Clear input
		}
	};
</script>

<form onsubmit={handleSubmit} class="mb-6">
	<div class="flex gap-2">
		<input
			type="text"
			bind:value={taskTitle}
			placeholder="What needs to be done?"
			class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
		/>
		<button
			type="submit"
			class="rounded-lg bg-blue-500 px-6 py-2 text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
		>
			Add Task
		</button>
	</div>
</form>