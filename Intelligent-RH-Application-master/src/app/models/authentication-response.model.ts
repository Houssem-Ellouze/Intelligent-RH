export interface AuthenticationResponse {
  access_token?: string;
  refresh_token?: string;
  token?: string;
  role?: string;
  speciality?: string;
  user?: {
    role?: string;
    speciality?: string;
    id?: string;
    nom?: string;
    prenom?: string;
    email?: string;
  };
  message?: string;
  success?: boolean;
}
