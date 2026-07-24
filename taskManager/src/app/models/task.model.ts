import { Project } from "./project.model";
import { User } from "./user.model";

export enum TaskStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE'
}

export enum TaskPriority {
  FAIBLE = 'FAIBLE',
  MOYENNE = 'MOYENNE',
  ELEVEE = 'ELEVEE'
}

export interface Task {
  id_tache?: number; // Changed from string to number to match DB
  nom: string;
  description: string;
  status: TaskStatus;
  dateCreation: string;
  dateDebut: string;
  dateFin: string;
  priorite: TaskPriority;
  location: string;
 project: Project; // Changed from string to number to match Project.id_projet
  createdBy: User; // Changed from string to number to match User.id_user
  assignedTo: User; // Changed from string to number to match User.id_user
  //subtasks?: SubTask[];
  labels?: string | string[];

}