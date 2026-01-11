const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    image?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export async function updateProfile(data: {
    name: string;
    image?: string;
}): Promise<ApiResponse<UserProfile>> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            credentials: "include",
        });

        const responseData = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: responseData.error || "Failed to update profile",
            };
        }

        return responseData;
    } catch (error) {
        console.error("Error updating profile:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Network error",
        };
    }
}
