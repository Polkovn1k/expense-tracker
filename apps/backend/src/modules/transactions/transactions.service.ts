import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { TransactionType } from "@prisma/client";
import { CategoriesRepository } from "../categories/categories.repository";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { QueryTransactionsDto } from "./dto/query-transactions.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { TransactionsRepository } from "./transactions.repository";

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  async create(userId: string, dto: CreateTransactionDto) {
    await this.getOwnedCategoryOrThrow(userId, dto.categoryId);
    return this.transactionsRepository.create({
      amount: dto.amount,
      type: dto.type,
      description: dto.description,
      date: new Date(dto.date),
      user: { connect: { id: userId } },
      category: { connect: { id: dto.categoryId } },
    });
  }

  findAll(userId: string, query: QueryTransactionsDto) {
    return this.transactionsRepository.findAllByUser(userId, query);
  }

  async findOne(userId: string, id: string) {
    return this.getOwnedOrThrow(userId, id);
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    await this.getOwnedOrThrow(userId, id);
    if (dto.categoryId) {
      await this.getOwnedCategoryOrThrow(userId, dto.categoryId);
    }
    return this.transactionsRepository.update(id, {
      amount: dto.amount,
      type: dto.type,
      description: dto.description,
      date: dto.date ? new Date(dto.date) : undefined,
      category: dto.categoryId ? { connect: { id: dto.categoryId } } : undefined,
    });
  }

  async remove(userId: string, id: string) {
    const transaction = await this.getOwnedOrThrow(userId, id);
    return this.transactionsRepository.delete(transaction.id);
  }

  async summary(userId: string, month: number, year: number) {
    const from = new Date(Date.UTC(year, month - 1, 1));
    const to = new Date(Date.UTC(year, month, 1));
    const groups = await this.transactionsRepository.aggregateByUserAndPeriod(userId, from, to);

    const income = Number(groups.find((g) => g.type === TransactionType.INCOME)?._sum.amount ?? 0);
    const expense = Number(groups.find((g) => g.type === TransactionType.EXPENSE)?._sum.amount ?? 0);

    return { income, expense, balance: income - expense };
  }

  private async getOwnedOrThrow(userId: string, id: string) {
    const transaction = await this.transactionsRepository.findById(id);
    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }
    if (transaction.userId !== userId) {
      throw new ForbiddenException();
    }
    return transaction;
  }

  private async getOwnedCategoryOrThrow(userId: string, categoryId: string) {
    const category = await this.categoriesRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException("Category not found");
    }
    if (category.userId !== userId) {
      throw new ForbiddenException();
    }
    return category;
  }
}
