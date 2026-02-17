interface JwtPayload {
  sub: number;
  roleId: number;
  exp: number;
  iat: number;
}

export function jwtDecode(token: string): JwtPayload {
  const base64 = token.split(".")[1];
  const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(json);
}
