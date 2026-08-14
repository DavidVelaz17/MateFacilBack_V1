import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TeachersService } from '../teachers/teachers.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

export interface ValidatedUser {
  id_docente: number;
  Usuario: string;
  Nombre_Docente: string;
  Apellido_Paterno_Docente: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly teachersService: TeachersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(usuario: string, pass: string): Promise<ValidatedUser | null> {
    // Sin fallback: si ADMIN_USERNAME/ADMIN_PASSWORD no estan definidos en
    // el entorno, este acceso no puede matchear (no hay password por defecto).
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (adminUser && adminPass && usuario === adminUser && pass === adminPass) {
      return {
        id_docente: 10000,
        Usuario: 'admin',
        Nombre_Docente: 'Super',
        Apellido_Paterno_Docente: 'Administrador',
        role: 'admin',
      };
    }

    const docente = await this.teachersService.findByUsuario(usuario);

    if (docente && (await bcrypt.compare(pass, docente.Password))) {
      return {
        id_docente: docente.id_docente,
        Usuario: docente.Usuario,
        Nombre_Docente: docente.Nombre_Docente,
        Apellido_Paterno_Docente: docente.Apellido_Paterno_Docente,
        role: 'docente',
      };
    }

    return null;
  }

  async login(loginDto: LoginDto) {
    const validUser = await this.validateUser(
      loginDto.usuario,
      loginDto.password,
    );

    if (!validUser) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const payload = {
      sub: validUser.id_docente,
      username: validUser.Usuario,
      name: `${validUser.Nombre_Docente} ${validUser.Apellido_Paterno_Docente}`,
      role: validUser.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}