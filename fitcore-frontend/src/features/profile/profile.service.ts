import { api } from "../../services/api"

export type ProfilePhotoResponse = {
  userId: number
  fullName: string
  email: string
  profilePhotoUrl: string | null
}

export async function uploadProfilePhotoRequest(photo: File) {
  const formData = new FormData()
  formData.append("photo", photo)

  const response = await api.post<ProfilePhotoResponse>(
    "/profile/photo",
    formData,
  )

  return response.data
}

export async function removeProfilePhotoRequest() {
  const response = await api.delete<ProfilePhotoResponse>("/profile/photo")
  return response.data
}
