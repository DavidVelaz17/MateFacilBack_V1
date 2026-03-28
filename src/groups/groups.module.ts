import { Module } from '@nestjs/common';
import { GroupService } from './groups.service';
import { GroupsController } from './groups.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grupo } from './entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Grupo])],
  controllers: [GroupsController],
  providers: [GroupService],
})
export class GroupsModule {}
