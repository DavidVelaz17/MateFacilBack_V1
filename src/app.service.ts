import { Injectable } from '@nestjs/common';

export interface Student {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

@Injectable()
export class StudentsService {
  private students: Student[] = [
    { id: 1, nombres: 'Juan', apellidoPaterno: 'Pérez', apellidoMaterno: 'López' },
    { id: 2, nombres: 'Ana', apellidoPaterno: 'García', apellidoMaterno: 'Méndez' },
  ];

  findAll() {
    return this.students;
  }

  create(student: Omit<Student, 'id'>) {
    const newStudent = { id: Date.now(), ...student };
    this.students.push(newStudent);
    return newStudent;
  }

  // Agrega métodos update/remove si deseas funcionalidad real en el prototipo
}