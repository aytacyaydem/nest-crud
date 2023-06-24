import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, AuthorizedJwtPayload } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: AuthDto): Promise<AuthorizedJwtPayload> {
    return await this.authService.signup(dto);
  }
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(@Body() dto: AuthDto): Promise<AuthorizedJwtPayload> {
    return await this.authService.signin(dto);
  }
}
