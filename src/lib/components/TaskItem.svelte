<script lang="ts">
	import type { Task } from '$lib/stores/taskStore';
	import { taskActions } from '$lib/stores/taskStore';

	let { task }: { task: Task } = $props();
</script>

<div
	class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
>
	<input
		type="checkbox"
		checked={task.completed}
		onchange={() => taskActions.toggleTask(task.id)}
		class="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-200"
	/>
	
	<span class="flex-1 {task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}">
		{task.title}
	</span>

	<button
		onclick={() => taskActions.deleteTask(task.id)}
		class="text-red-500 transition hover:text-red-700 focus:outline-none"
		aria-label="Delete task"
	>
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
		</svg>
	</button>
</div>
