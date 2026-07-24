import { ProjectUserRole } from "./project-user-role.enum";
import { ProjectUser } from "./project-user.model";
import { Task } from "./task.model";

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  // Add other statuses as needed
}

export interface Project {
  id_projet: number;
  nomClient: string;
  nom: string;
  description: string;
  dateDebut: string; // ISO 8601 format string
  dateFin: string;
  dateCreation: string;
  status: ProjectStatus;
  abreviation: string;
  managerId?: string;
  manager?: {

    firstname: string;
    lastname: string;
    email: string;
  };
  tasks?: Task[]; // Replace with Task[] when available
 projectUsers: ProjectUser[]; // Replace with ProjectUser[] when available
}

export interface CreateProject {
  nomClient: string;
  nom: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  dateCreation: string;
  status: ProjectStatus;
  abreviation: string;
  managerId: string;
  projectUsers?: { userId: number; roleProjet: ProjectUserRole }[];
}


// Optional: Add an update interface for partial updates
export interface UpdateProject {
  nomClient?: string;
  nom?: string;
  description?: string;
  dateDebut?: string;
  dateFin?: string;
  dateCreation?: string;
  status?: ProjectStatus;
  abreviation?: string;
  managerId?: string;
  projectUsers?: { userId: number; roleProjet: ProjectUserRole }[];
}