import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SafeUser } from "../users/users.service";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@ApiTags("categories")
@ApiBearerAuth()
@Controller("categories")
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: "Create a category" })
  @ApiResponse({ status: 201, description: "Category created" })
  @Post()
  create(@CurrentUser() user: SafeUser, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(user.id, dto);
  }

  @ApiOperation({ summary: "List all categories for the current user" })
  @ApiResponse({ status: 200, description: "List of categories" })
  @Get()
  findAll(@CurrentUser() user: SafeUser) {
    return this.categoriesService.findAll(user.id);
  }

  @ApiOperation({ summary: "Update a category" })
  @ApiParam({ name: "id", description: "Category id" })
  @ApiResponse({ status: 200, description: "Category updated" })
  @ApiResponse({ status: 403, description: "Category belongs to another user" })
  @ApiResponse({ status: 404, description: "Category not found" })
  @Patch(":id")
  update(@CurrentUser() user: SafeUser, @Param("id") id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(user.id, id, dto);
  }

  @ApiOperation({ summary: "Delete a category" })
  @ApiParam({ name: "id", description: "Category id" })
  @ApiResponse({ status: 200, description: "Category deleted" })
  @ApiResponse({ status: 403, description: "Category belongs to another user" })
  @ApiResponse({ status: 404, description: "Category not found" })
  @Delete(":id")
  remove(@CurrentUser() user: SafeUser, @Param("id") id: string) {
    return this.categoriesService.remove(user.id, id);
  }
}
