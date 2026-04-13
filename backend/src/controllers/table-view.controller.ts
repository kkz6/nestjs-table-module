import {
  Controller, Post, Get, Delete, Param, Body,
  UseGuards, Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TableViewService } from '../services/table-view.service';
import { StoreViewDto } from '../dto/view.dto';

@Controller('table/views')
@UseGuards(AuthGuard('jwt'))
export class TableViewController {
  constructor(private viewService: TableViewService) {}

  @Get(':tableClass')
  async list(
    @Param('tableClass') tableClass: string,
    @Req() req: any,
  ) {
    return this.viewService.findByUser(tableClass, req.user?.id ?? 0);
  }

  @Post(':tableClass')
  async store(
    @Param('tableClass') tableClass: string,
    @Body() body: StoreViewDto,
    @Req() req: any,
  ) {
    return this.viewService.create(tableClass, body, req.user?.id ?? 0);
  }

  @Delete(':tableClass/:id')
  async destroy(
    @Param('tableClass') tableClass: string,
    @Param('id') id: number,
    @Req() req: any,
  ) {
    return this.viewService.delete(tableClass, id, req.user?.id ?? 0);
  }
}
