const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface Meeting {
  id: string;
  meetingCode: string;
  createdById: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function createMeeting(): Promise<ApiResponse<Meeting>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/meetings/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to create meeting",
      };
    }

    return data;
  } catch (error) {
    console.error("Error creating meeting:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

export async function getMeetingByCode(
  code: string
): Promise<ApiResponse<Meeting>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/meetings/${code}`, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to fetch meeting",
      };
    }

    return data;
  } catch (error) {
    console.error("Error fetching meeting:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

export async function getUserMeetings(): Promise<ApiResponse<Meeting[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/meetings`, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to fetch meetings",
      };
    }

    return data;
  } catch (error) {
    console.error("Error fetching user meetings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

export async function deleteMeeting(meetingId: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to delete meeting",
      };
    }

    return {
      success: true,
      message: "Meeting deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting meeting:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
