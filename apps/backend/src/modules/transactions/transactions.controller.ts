import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SafeUser } from "../users/users.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { QueryTransactionsDto } from "./dto/query-transactions.dto";
import { TransactionsSummaryQueryDto } from "./dto/transactions-summary-query.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { TransactionsService } from "./transactions.service";

@Controller("transactions")
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@CurrentUser() user: SafeUser, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: SafeUser, @Query() query: QueryTransactionsDto) {
    return this.transactionsService.findAll(user.id, query);
  }

  @Get("summary")
  summary(@CurrentUser() user: SafeUser, @Query() query: TransactionsSummaryQueryDto) {
    return this.transactionsService.summary(user.id, query.month, query.year);
  }

  @Get(":id")
  findOne(@CurrentUser() user: SafeUser, @Param("id") id: string) {
    return this.transactionsService.findOne(user.id, id);
  }

  @Patch(":id")
  update(@CurrentUser() user: SafeUser, @Param("id") id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionsService.update(user.id, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: SafeUser, @Param("id") id: string) {
    return this.transactionsService.remove(user.id, id);
  }
}
