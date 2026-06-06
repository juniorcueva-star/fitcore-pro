import { api } from "../../services/api"
import type { LoginFormData, LoginResponse, UserProfileResponse } from "./auth.types"

export async function loginRequest(data: LoginFormData) {
  const response = await api.post<LoginResponse>("/auth/login", data)
  return response.data
}

export async function getMyProfileRequest() {
  const response = await api.get<UserProfileResponse>("/users/me")
  return response.data
}
