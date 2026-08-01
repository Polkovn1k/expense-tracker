import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SafeUser } from "../users/users.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { QueryTransactionsDto } from "./dto/query-transactions.dto";
import { TransactionsSummaryQueryDto } from "./dto/transactions-summary-query.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { TransactionsService } from "./transactions.service";

@ApiTags("transactions")
@ApiBearerAuth()
@Controller("transactions")
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({ summary: "Create a transaction" })
  @ApiResponse({ status: 201, description: "Transaction created" })
  @ApiResponse({ status: 404, description: "Category not found" })
  @Post()
  create(@CurrentUser() user: SafeUser, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(user.id, dto);
  }

  @ApiOperation({ summary: "List transactions for the current user, with optional filters" })
  @ApiResponse({ status: 200, description: "List of transactions" })
  @Get()
  findAll(@CurrentUser() user: SafeUser, @Query() query: QueryTransactionsDto) {
    return this.transactionsService.findAll(user.id, query);
  }

  @ApiOperation({ summary: "Get income/expense/balance summary for a given month and year" })
  @ApiResponse({ status: 200, description: "Summary totals" })
  @Get("summary")
  summary(@CurrentUser() user: SafeUser, @Query() query: TransactionsSummaryQueryDto) {
    return this.transactionsService.summary(user.id, query.month, query.year);
  }

  @ApiOperation({ summary: "Get a single transaction by id" })
  @ApiParam({ name: "id", description: "Transaction id" })
  @ApiResponse({ status: 200, description: "The transaction" })
  @ApiResponse({ status: 403, description: "Transaction belongs to another user" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  @Get(":id")
  findOne(@CurrentUser() user: SafeUser, @Param("id") id: string) {
    return this.transactionsService.findOne(user.id, id);
  }

  @ApiOperation({ summary: "Update a transaction" })
  @ApiParam({ name: "id", description: "Transaction id" })
  @ApiResponse({ status: 200, description: "Transaction updated" })
  @ApiResponse({ status: 403, description: "Transaction belongs to another user" })
  @ApiResponse({ status: 404, description: "Transaction or category not found" })
  @Patch(":id")
  update(@CurrentUser() user: SafeUser, @Param("id") id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionsService.update(user.id, id, dto);
  }

  @ApiOperation({ summary: "Delete a transaction" })
  @ApiParam({ name: "id", description: "Transaction id" })
  @ApiResponse({ status: 200, description: "Transaction deleted" })
  @ApiResponse({ status: 403, description: "Transaction belongs to another user" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  @Delete(":id")
  remove(@CurrentUser() user: SafeUser, @Param("id") id: string) {
    return this.transactionsService.remove(user.id, id);
  }
}
