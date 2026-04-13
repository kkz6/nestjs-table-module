import {
  Controller, Post, Param, Body, UseGuards,
  HttpCode, HttpStatus, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TableRegistry } from '../table-registry';
import { ActionRequestDto } from '../dto/action-request.dto';

@Controller('table')
@UseGuards(AuthGuard('jwt'))
export class TableActionController {
  constructor(private registry: TableRegistry) {}

  @Post('action/:tableClass/:actionName')
  @HttpCode(HttpStatus.OK)
  async execute(
    @Param('tableClass') tableClass: string,
    @Param('actionName') actionName: string,
    @Body() body: ActionRequestDto,
  ) {
    const table = this.registry.get(tableClass);
    if (!table) throw new NotFoundException(`Table ${tableClass} not found`);

    const allActions = [...table.getRowActions(), ...table.getBulkActions()];
    const action = allActions.find(a => a.getName() === actionName);
    if (!action) throw new NotFoundException(`Action ${actionName} not found`);

    const result = await action.execute(body.id ?? body.ids, undefined);
    return result ?? { success: true };
  }
}
