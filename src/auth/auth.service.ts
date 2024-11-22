import { User } from '@prisma/client';
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Permission } from 'src/privilege/privilege.interface.ts/permission_list.interface';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private userService:UsersService,
    private jwtService:JwtService,
    private prisma:PrismaService,
  ) {}
  
  private readonly saltRounds = 10; 

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePasswords(password: string, storedHash: string): Promise<boolean> {
    return bcrypt.compare(password, storedHash);
  }

  async validateUser(username:string, password:string):Promise<any> {
    try {
      // check exist user
      const user:User = await this.userService.findByUsername(username);

      if(!user) throw new UnauthorizedException('No username found');
      // check password
      const checkPassword = await this.comparePasswords(password, user.password)

      if(user && checkPassword) {
        const { password, ...result } = user;
        
        console.log()
        return result
      }

      return null;
    } catch (error) {
      console.log(error);
      throw error
    }
  
  }

  async login(user:Omit<User, 'password'>, permissionList:Permission[], role:{name:string, id:string}) {
    const payload = { username: user.username, sub: user.id, permissionList, role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(dataRegister:RegisterDto) {
    try {
      const { username, password, display_name } = dataRegister;
      // check exist username
      const checkUsername = await this.userService.findByUsername(username);
      if(checkUsername) throw new ConflictException('username already exists');

      // hash the password using bcrypt
      const hashedPassword = await this.hashPassword(password);

      // create new user
      const createData = {
        username,
        password: hashedPassword,
        display_name,
      }
      const newUser = this.userService.createUser(createData);

      return newUser
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async changePassword(username:string, password:string, oldPassword:string) {
    try {

      // find username
      const user = await this.userService.findByUsername(username);
      if(!user) throw new NotFoundException('Username not found')

      // compare password
      const compareBool = await this.comparePasswords(oldPassword, user.password);
      if(!compareBool) throw new UnauthorizedException('Invalid credential');

      // hash the password using bcrypt
      const hashedPassword = await this.hashPassword(password);

      // update passwrod
      const newUser = this.prisma.user.update({
        where: { username },
        data: { password: hashedPassword }
      });

      return newUser
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async changePasswordByAdmin(username:string, password:string) {
    try {

      // find username
      const user = await this.userService.findByUsername(username);
      if(!user) throw new NotFoundException('Username not found')

      // hash the password using bcrypt
      const hashedPassword = await this.hashPassword(password);

      // update passwrod
      const newUser = this.prisma.user.update({
        where: { username },
        data: { password: hashedPassword }
      });

      return newUser
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
