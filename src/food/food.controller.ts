import { Body, Controller, Query, Get, Param, Patch, Post, UseGuards, NotFoundException } from '@nestjs/common';
import { FoodService } from './food.service';
// import { PrismaClientExceptionFilter } from 'src/common/filters/prisma-exception.filter';
import { UpdateFoodDto } from './dto/update_food.dto';
import { CreateFoodDto } from './dto/create_food.dto';
import { PageAccess } from 'src/auth/page_access.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PageGuard } from 'src/auth/page.guard';

@PageAccess('food_service')
@UseGuards(JwtAuthGuard, PageGuard)
@Controller('food')
export class FoodController {
  constructor(private foodService: FoodService) {}


  @Get('find')// get food by name
  async findFoodByNameLike(@Query('q') name: string) {

    return this.foodService.findFoodByNameLike(name)
  }

  @Get()// Get All Food
  async getAllFood() {
    return this.foodService.findAllFood()
  }

  @Get('/:id')// get food by id
  async getFoodById(@Param() param:{id: string}) {
    const { id } = param;
    return this.foodService.findFoodByID(id)
  }

  @Post('check-inventory/:foodID') // create food 
  async checkInventory(@Param('foodID') foodID:string, @Body('upcoming_count') upcoming_count:number) {
    return this.foodService.checkInventory(upcoming_count, foodID)
  }
  @Post('create') // create food 
  async createFood(@Body() createData:CreateFoodDto) {
    return this.foodService.createFood(createData)
  }

  @Patch('/:foodID') //update food
  async updateFood(@Param() param:{foodID: string}, @Body() updateData:UpdateFoodDto) {
    const { foodID } = param;
    return this.foodService.updateFood(foodID, updateData)
  }

  @Patch('delete/:foodID')//delete food
  async deleteFood(@Param() param:{foodID:string}) {
   const { foodID } = param;
   
   return this.foodService.deleteFood(foodID)
  }

}
