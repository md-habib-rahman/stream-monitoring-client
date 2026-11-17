export function saveAuth(data) {
//   console.log("Saving auth:", data);

  localStorage.setItem("token", data.token);

  localStorage.setItem("user", JSON.stringify(data.user));
}
export function logout() {
  localStorage.removeItem("token");

  localStorage.removeItem("user");
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

export function getUserRole() {
  return getUser()?.role || "USER";
}

export function canManageFeatures() {
  return ["ADMIN", "SUPER_ADMIN"].includes(getUserRole());
}
