import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CategoriesRepository } from "./categories.repository";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  create(userId: string, dto: CreateCategoryDto) {
    return this.categoriesRepository.create({
      name: dto.name,
      color: dto.color,
      icon: dto.icon,
      user: { connect: { id: userId } },
    });
  }

  findAll(userId: string) {
    return this.categoriesRepository.findAllByUser(userId);
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    const category = await this.getOwnedOrThrow(userId, id);
    return this.categoriesRepository.update(category.id, dto);
  }

  async remove(userId: string, id: string) {
    const category = await this.getOwnedOrThrow(userId, id);
    return this.categoriesRepository.delete(category.id);
  }

  private async getOwnedOrThrow(userId: string, id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException("Category not found");
    }
    if (category.userId !== userId) {
      throw new ForbiddenException();
    }
    return category;
  }
}
