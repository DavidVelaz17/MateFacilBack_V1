import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { usuario: string; password: string }) {
    return this.authService.login(loginDto);
  }

  // Ruta protegida que requiere JWT valido
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: any) {
    return req.user;
  }
}