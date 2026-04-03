export interface Appointment {
  id?: string;          // souvent généré par la base
  uuid: string;         // identifiant unique côté front
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  color: string;
  description?: string;
}
