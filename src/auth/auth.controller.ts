import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { username, email, password } = registerDto;
    try {
      const user = await this.authService.register(username, email, password);
      return {
        message: 'User registered successfully, check your email to validate',
        userId: user.id,
      };
    } catch (error) {
      // Si email déjà utilisé ou autre erreur
      throw new BadRequestException(error.message);
    }
  }

  @Get('validate')
  async validate(@Query('token') token: string) {
    const result = await this.authService.validateUser(token);

    if (!result.user) {
      if (result.error === 'no_user') {
        return { message: 'No user found with this token' };
      }
      if (result.error === 'already_validated') {
        return { message: 'User already validated' };
      }
      return { message: 'Invalid or expired token' };
    }

    return { message: 'Email validated successfully' };
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(@Body() body: LoginDto) {
    const result = await this.authService.login(body.email, body.password);
    if (!result) {
      throw new BadRequestException(
        'Invalid credentials or user not validated',
      );
    }
    return result;
  }
}
