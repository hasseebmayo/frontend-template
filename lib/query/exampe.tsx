"use client";

import { useTypedFetch } from "@/lib/query";

export function QueryExample() {
	// This will have proper type inference
	const { data, isLoading, error } = useTypedFetch("first", {
		params: { string: "example" },
		searchParams: { searchParams: "test" },
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}
	if (error) {
		return (
			<div>
				Error:
				{error.message}
			</div>
		);
	}

	return (
		<div>
			<h1>Query Example</h1>
			{data && (
				<ul>
					{data.map((item, index) => (
						// eslint-disable-next-line react/no-array-index-key
						<li key={index}>{item.haseeb}</li>
					))}
				</ul>
			)}
		</div>
	);
}
