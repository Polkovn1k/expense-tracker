import { Module } from "@nestjs/common";
import { CategoriesRepository } from "../categories/categories.repository";
import { TransactionsController } from "./transactions.controller";
import { TransactionsRepository } from "./transactions.repository";
import { TransactionsService } from "./transactions.service";

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsRepository, CategoriesRepository],
})
export class TransactionsModule {}
