import { Injectable } from "@nestjs/common";
import { Prisma, Transaction, TransactionType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  type?: TransactionType;
  categoryId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.TransactionCreateInput): Promise<Transaction> {
    return this.prisma.transaction.create({ data });
  }

  findAllByUser(userId: string, filters: TransactionFilters): Promise<Transaction[]> {
    const { page = 1, limit = 10 } = filters;
    return this.prisma.transaction.findMany({
      where: this.buildWhere(userId, filters),
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  countByUser(userId: string, filters: TransactionFilters): Promise<number> {
    return this.prisma.transaction.count({ where: this.buildWhere(userId, filters) });
  }

  private buildWhere(userId: string, filters: TransactionFilters): Prisma.TransactionWhereInput {
    const { dateFrom, dateTo, type, categoryId } = filters;
    return {
      userId,
      type,
      categoryId,
      date: {
        gte: dateFrom ? new Date(dateFrom) : undefined,
        lte: dateTo ? new Date(dateTo) : undefined,
      },
    };
  }

  findById(id: string): Promise<Transaction | null> {
    return this.prisma.transaction.findUnique({ where: { id } });
  }

  update(id: string, data: Prisma.TransactionUpdateInput): Promise<Transaction> {
    return this.prisma.transaction.update({ where: { id }, data });
  }

  delete(id: string): Promise<Transaction> {
    return this.prisma.transaction.delete({ where: { id } });
  }

  aggregateByUserAndPeriod(userId: string, from: Date, to: Date) {
    return this.prisma.transaction.groupBy({
      by: ["type"],
      where: { userId, date: { gte: from, lt: to } },
      _sum: { amount: true },
    });
  }
}
