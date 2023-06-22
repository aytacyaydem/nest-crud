import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, CreatedUser } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: AuthDto): Promise<CreatedUser> {
    return await this.authService.signup(dto);
  }
  @Post('signin')
  signin(): string {
    return 'I am signed in';
  }
}
