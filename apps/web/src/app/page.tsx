"use client";

export default function Home() {
	let title = '';
	if (typeof window != 'undefined') {
		const url = window.location.hostname;
		title = url

	}
	
	console.log(typeof title, title)
	if (title === 'localhost') {
		title = 'zeroSquadron'
	}
	return (
		<div className="container mx-auto max-w-3xl px-4 py-2">
			<pre className="overflow-x-auto text-xl capitalize">{title}</pre>
			<div className="grid gap-6">
				<section className="rounded-lg border p-4">
					<h2 className="mb-2 font-medium">API Status</h2>
				</section>
			</div>
		</div>
	);
}
