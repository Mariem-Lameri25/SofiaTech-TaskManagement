import { Controller, Get, Post, Body, Param, Put, Delete, Patch, UseGuards, ParseIntPipe, UploadedFile, UseInterceptors, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UpdateUserRoleDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserRole } from './user-role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { GetUsersDto } from './dto/get-user.dto';
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
@Roles(UserRole.ADMIN)
  create(@Body() userData: Partial<User>): Promise<User> {
    return this.usersService.create(userData);
  }

  @Patch(':id/role')
@Roles(UserRole.ADMIN)
updateUserRole(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateRoleDto: UpdateUserRoleDto,
): Promise<User> {
  return this.usersService.updateRole(id, updateRoleDto.role);
}
  /**
   * Get paginated and sorted users. Allowed sort fields: firstname, lastname, email, role.
   */
  @Get()
  // @Roles(UserRole.ADMIN)
  async getUsers(@Query() query: GetUsersDto) {
    return this.usersService.findAllPaginated(query);
  }


  @Get(':id')
  @Roles(UserRole.ADMIN,UserRole.USER,UserRole.MANAGER)
  findOne(@Param('id') id: number): Promise<User> {
    return this.usersService.findOne(+id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: number, @Body() updateData: Partial<User>): Promise<User> {
    return this.usersService.update(+id, updateData);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: number): Promise<void> {
    return this.usersService.remove(+id);
  }

 @Patch(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async updateAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatarUrl = `http://localhost:3000/uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatar(id, avatarUrl);
  }
}
