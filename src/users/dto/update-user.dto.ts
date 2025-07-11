import { UserRole } from "generated/prisma";

export class CreateUserDto {
    email?: string;
    password?: string;
    name?: string;
    role?: UserRole;
}