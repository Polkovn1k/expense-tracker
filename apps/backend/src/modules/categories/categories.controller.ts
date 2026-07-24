import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SafeUser } from "../users/users.service";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Controller("categories")
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@CurrentUser() user: SafeUser, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: SafeUser) {
    return this.categoriesService.findAll(user.id);
  }

  @Patch(":id")
  update(@CurrentUser() user: SafeUser, @Param("id") id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(user.id, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: SafeUser, @Param("id") id: string) {
    return this.categoriesService.remove(user.id, id);
  }
}
