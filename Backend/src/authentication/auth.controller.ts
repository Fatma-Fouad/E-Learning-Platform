import { Body, Controller, HttpStatus, Post, HttpException, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from '../users/registeruser.dto';
import { LoginUserDto } from '../users/loginuser.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
  @Post('login')
  async signIn(@Body() signInDto: LoginUserDto, @Res({ passthrough: true }) res) {
    try {
      // console.log('helllo')
      const result = await this.authService.signIn(signInDto.email, signInDto.password);

      res.cookie('token', result.access_token, {
        httpOnly: true, // Prevents client-side JavaScript access
        secure: process.env.NODE_ENV === 'production' ? true : false, // Use secure cookies in production
        sameSite: 'lax',
        maxAge: 3600 * 1000, // Cookie expiration time in milliseconds
      });
      // Return success response
      return {
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        user: result.payload, 
        token: result.access_token
      };
    } catch (error) {
        console.log(error)
      // Handle specific errors
      if (error instanceof HttpException) {
        throw error; // Pass through known exceptions
      }

      // Handle other unexpected errors
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An error occurred during login',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('register')
  async signup(@Body() registerRequestDto: RegisterUserDto) {
    try {
      // Call the AuthService to handle registration
      const result = await this.authService.register(registerRequestDto);

      // Return a success response with HTTP 201 Created status
      return {
        statusCode: HttpStatus.CREATED,
        message: 'User registered successfully',
        data: result,
      };
    } catch (error) {
      // Handle specific errors, such as email already exists or validation errors
      if (error.status === 409) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: 'User already exists',
          },
          HttpStatus.CONFLICT,
        );
      }

      // Catch any other errors and throw a generic internal server error
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An error occurred during registration',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}