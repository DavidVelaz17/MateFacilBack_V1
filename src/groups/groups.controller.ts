import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { GroupService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AuthGuard } from '@nestjs/passport';
import { Grupo } from './entities/group.entity';
import { ReportQueryDto } from '../students/dto/report-query.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupService) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.groupsService.findAllByTeacher(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(+id);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string, @Query('tzOffset') tzOffset?: string) {
    return this.groupsService.getGroupStats(+id, Number(tzOffset) || 0);
  }

  // El frontend manda instantes ISO precisos (hora local ya resuelta), no
  // fechas sueltas (ver ReportQueryDto).
  @Get(':id/report')
  getReport(@Param('id') id: string, @Query() query: ReportQueryDto) {
    const desde = new Date(query.desde);
    const hasta = new Date(query.hasta);
    return this.groupsService.getGroupReport(
      +id,
      desde,
      hasta,
      query.tzOffset ?? 0,
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(+id, updateGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(+id);
  }
}
