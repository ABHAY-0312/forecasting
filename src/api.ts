import { StartupIdea } from "./types";

/**
 * Centered API client for the Startup Validator Platform
 */
export async function fetchAllIdeas(): Promise<StartupIdea[]> {
  const response = await fetch("/api/ideas");
  if (!response.ok) {
    throw new Error("Failed to load startup ideas list");
  }
  return response.json();
}

export async function fetchIdeaDetails(id: string): Promise<StartupIdea> {
  const response = await fetch(`/api/ideas/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch startup validation details");
  }
  return response.json();
}

export async function submitIdea(payload: {
  title: string;
  description: string;
  targetMarket: string;
  extraContext?: string;
}): Promise<StartupIdea> {
  const response = await fetch("/api/ideas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to submit startup idea for validation.");
  }
  
  return response.json();
}

export async function deleteIdea(id: string): Promise<void> {
  const response = await fetch(`/api/ideas/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete startup idea");
  }
}
